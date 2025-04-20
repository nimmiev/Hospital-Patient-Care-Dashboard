import { User } from "../models/userModel.js";
import { Doctor } from "../models/DoctorModel.js";
import { Appoinment } from "../models/AppoinmentModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { Patient } from "../models/PatientModel.js";
import mongoose from "mongoose";
import { streamUpload } from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

export const doctorSignup = async (req, res, next) => {
    try {
        // console.log("signup hitted");

        //collect doctor data
        const { name, email, password, confirmPassword, phone, profilepic, medicalLicense, qualification, experience, department } = req.body;

        //data vaildation
        if (!name || !email || !password || !confirmPassword || !phone || !medicalLicense || !qualification || !experience || !department) {
            return res.status(400).json({ message: "All fields required" })
        }
        // console.log(name,email,password,phone,role);

        //check doctor already exist
        const doctorExist = await User.findOne({ email: email })

        if (doctorExist) {
            return res.status(400).json({ message: "Doctor Already Exist" })
        }

        //compare with confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" })
        }

        //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);

        //save data to User modal in DB
        const newDoctor = new User({ name, email, password: hashPassword, phone, role: "Doctor", profilepic })
        await newDoctor.save()

        // Save doctor-specific data to Doctor model in DB
        const newDoctor1 = new Doctor({ userId: newDoctor._id, medicalLicense, qualification, experience, department, schedule: false });
        await newDoctor1.save();

        //generate token using Id and Role
        const token = generateToken(newDoctor._id, "Doctor");
        res.cookie('token', token);

        // remove hash password to frontend
        const dataDoctor = {
            name: newDoctor.name,
            email: newDoctor.email,
            phone: newDoctor.phone,
            role: newDoctor.role,
            profilepic: newDoctor.profilepic,
            medicalLicense: newDoctor1.medicalLicense,
            qualification: newDoctor1.qualification,
            experience: newDoctor1.experience,
            department: newDoctor1.department,
            schedule: newDoctor1.schedule,
        };

        res.json({ data: dataDoctor, message: "Doctor signup success" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
};

export const doctorLogin = async (req, res, next) => {
    try {
        // console.log("Login hitted");

        //collect doctor data
        const { email, password } = req.body;

        //data vaildation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" })
        }
        // console.log(name,email,password,phone,role);

        //check doctor already exist
        const doctorExist = await User.findOne({ email })

        if (!doctorExist) {
            return res.status(404).json({ message: "Doctor not found" })
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, doctorExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        if (!doctorExist.isActive) {
            return res.status(401).json({ message: "Doctor account is not active" })
        }

        //fetch doctor using id and check approved
        const doctorApprove = await Doctor.findOne({ userId: doctorExist._id })

        // console.log(doctorApprove)

        if (!doctorApprove || !doctorApprove.approved) {
            return res.status(403).json({ message: "Account is pending admin approval." });
        }


        const doctorData = doctorExist.toObject(); // Convert Mongoose document to plain object
        delete doctorData.password; // Remove password field

        //generate token
        const token = generateToken(doctorData._id, "Doctor");
        res.cookie('token', token);
        res.json({ data: { ...doctorData, token }, message: "Doctor Login success" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
};

export const doctorProfile = async (req, res, next) => {
    try {
        //doctorId
        const doctorId = req.doctor.id;
        // console.log(doctorId);

        const doctorsData = await User.findById(doctorId)
        const doctorsData1 = await Doctor.findOne({ userId: doctorId })
        // console.log(doctorsData1)

        const doctorData = {
            name: doctorsData.name,
            email: doctorsData.email,
            phone: doctorsData.phone,
            role: doctorsData.role,
            profilepic: doctorsData.profilepic,
            medicalLicense: doctorsData1.medicalLicense,
            qualification: doctorsData1.qualification,
            experience: doctorsData1.experience,
            department: doctorsData1.department,
            schedule: doctorsData1.schedule
        }

        res.json({ data: doctorData, message: "Doctor profile fetched" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

// export const doctorProfileUpdate = async(req, res, next) => {
//     try {

//         //fetch exist profile data
//         const {name, email, password, phone, role, profilepic, medicalLicense, qualification, experience, department} = req.body;

//         //userId
//         const doctorId =  req.doctor.id;
//         // console.log(doctorId)
//         const doctorsData = await User.findByIdAndUpdate(doctorId, { name: name, email: email, password: password, phone: phone, role: role, profilepic: profilepic }, { new: true })

//         // console.log(doctorsData);

//         const doctorsData1 = await Doctor.findOneAndUpdate({ userId:doctorId }, { medicalLicense: medicalLicense, qualification: qualification, experience: experience, department: department }, { new: true })

//         const doctorData = {
//             name: doctorsData.name,
//             email: doctorsData.email,
//             phone: doctorsData.phone,
//             role: doctorsData.role,
//             profilepic: doctorsData.profilepic,
//             medicalLicense: doctorsData1.medicalLicense,
//             qualification: doctorsData1.qualification,
//             experience: doctorsData1.experience,
//             department: doctorsData1.department,
//             schedule: doctorsData1.schedule
//         }

//         res.json({data:doctorData, message:"Doctor profile Updated"})

//     } catch (error) {
//         res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
//         console.log(error);
//     }
// }
export const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        const {
            name,
            email,
            phone,
            medicalLicense,
            qualification,
            experience,
            department
        } = req.body;

        const image = req.file ? req.file.path : undefined;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        let profilepicUrl = null;

        // Upload new profile picture if provided
        if (req.file) {
            const result = await streamUpload(req.file.buffer);
            profilepicUrl = result.secure_url;
        }

        // Find the user and update the fields
        const userUpdate = await User.findById(doctorId);
        if (!userUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        userUpdate.name = name;
        userUpdate.email = email;
        userUpdate.phone = phone;
        if (profilepicUrl) userUpdate.profilepic = profilepicUrl;

        await userUpdate.save();

        // Update Doctor-specific fields
        const doctorUpdate = await Doctor.findOneAndUpdate(
            { userId: doctorId },
            { medicalLicense, qualification, experience, department },
            { new: true }
        );

        res.json({
            message: "Doctor profile updated successfully",
            data: {
                ...userUpdate.toObject(),
                ...doctorUpdate.toObject(),
            },
        });

    } catch (error) {
        console.error("Doctor profile update error:", error);
        res.status(500).json({ message: "Failed to update doctor profile" });
    }
};

export const updateDoctorPassword = async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { password, confirmPassword } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(doctorId, { password: hashedPassword });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const doctorprofileDeactivate = async (req, res, next) => {
    try {
        //userId
        const doctorId = req.doctor.id;
        const usersData = await User.findByIdAndUpdate(doctorId, { isActive: false }, { new: true })

        const userData = usersData.toObject();
        delete userData.password;

        res.json({ data: userData, message: "User Deactivated" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error)
    }
}

export const doctorLogout = async (req, res, next) => {
    try {

        res.clearCookie("token");
        res.clearCookie("role");
        res.clearCookie("theme");
        res.json({ message: "Doctor Logout success" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}


export const countAppoinment = async (req, res, next) => {
    try {
        //doctorId
        const doctorId = req.doctor.id;

        const appoinmentCount = await Appoinment.countDocuments({ doctorId: doctorId })

        res.status(200).json({ count: appoinmentCount, message: "Appoinment count" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

// export const getPatient = async (req, res, next) => {
//     try {
//         //doctorId
//         const doctorId = req.doctor.id

//         if (!doctorId) {
//             return res.status(403).json({ error: "Access Denied" });
//         }
//         //fetch doctor appoinments
//         const appointments = await Appoinment.find({ doctorId })
//         // console.log(appointments);
//         if (!appointments.length) {
//             return res.status(404).json({ message: "No patients found for this doctor" })
//         }

//         // Extract patientId
//         const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))]

//         const patients = await User.find({ _id: { $in: patientIds } }, "name email profilepic")

//         res.json({ data: patients, message: "Patients List" })

//     } catch (error) {
//         res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
//         console.log(error);
//     }
// }

export const getPatient = async (req, res, next) => {
    try {
        const doctorId = req.doctor.id;

        if (!doctorId) {
            return res.status(403).json({ error: "Access Denied" });
        }

        // Fetch appointments
        const appointments = await Appoinment.find({ doctorId });

        if (!appointments.length) {
            return res.status(404).json({ message: "No patients found for this doctor" });
        }

        // Unique patient user IDs
        const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))];

        // Fetch users
        const users = await User.find({ _id: { $in: patientIds } }, "name email profilepic");

        // Fetch publicIds from Patient model
        const patientsData = await Patient.find({ userId: { $in: patientIds } }, "userId publicId");

        // Merge publicId into user data
        const mergedPatients = users.map(user => {
            const patient = patientsData.find(p => p.userId.toString() === user._id.toString());
            return {
                ...user.toObject(),
                publicId: patient?.publicId || null
            };
        });

        res.json({ data: mergedPatients, message: "Patients List" });

    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};

// export const getPatientDetails = async (req, res, next) => {
//     try {
//         const { publicId  } = req.params;
//         const doctorId = req.doctor.id;

//         if (!publicId ) {
//             return res.status(400).json({ message: "Patient ID is required" });
//         }

//         // Check if patient is associated with doctor
//         const appointmentExists = await Appoinment.findOne({ doctorId, publicId  });
//         if (!appointmentExists) {
//             return res.status(403).json({ message: "Unauthorized: This patient is not associated with this doctor" });
//         }

//         // Fetch user details (basic info) excluding password
//         const user = await User.findById(publicId ).select("-password");
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Fetch additional patient details
//         const patientInfo = await Patient.findOne({ userId: patientId });
//         if (!patientInfo) {
//             return res.status(404).json({ message: "Patient details not found" });
//         }

//         // Merge user and patient info
//         const patientData = {
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             role: user.role,
//             profilepic: user.profilepic,
//             ...patientInfo._doc,
//         };

//         return res.status(200).json({ data: patientData, message: "Patient details fetched" });

//     } catch (error) {
//         console.error(error);
//         return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
//     }
// };

export const getPatientDetails = async (req, res, next) => {
    try {
        const { publicId } = req.params;
        const doctorId = req.doctor.id;

        if (!publicId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        // Find the patient by publicId to get userId
        const patientInfo = await Patient.findOne({ publicId });
        if (!patientInfo) {
            return res.status(404).json({ message: "Patient details not found" });
        }

        const userId = patientInfo.userId;

        // Check if this patient is associated with the doctor
        const appointmentExists = await Appoinment.findOne({ doctorId, patientId: userId });
        if (!appointmentExists) {
            return res.status(403).json({ message: "Unauthorized: This patient is not associated with this doctor" });
        }

        // Fetch user details
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Merge user and patient info
        const patientData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilepic: user.profilepic,
            ...patientInfo._doc,
        };

        return res.status(200).json({ data: patientData, message: "Patient details fetched" });

    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};

export const appoinmentList = async (req, res, next) => {
    try {

        //doctorId
        const doctorId = req.doctor.id;

        const appoinment = await Appoinment.find({ doctorId: doctorId })
            .populate({
                path: "patientId",
                select: "name", // Only get the patient name
                model: "User"
            })
            .sort({ appointmentDate: -1 })

        res.status(200).json({ data: appoinment, message: "Appointment List" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const appointmentListForToday = async (req, res, next) => {
    try {
        const doctorId = req.doctor.id;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Find appointments for today
        const appointments = await Appoinment.find({
            doctorId: doctorId,
            appointmentDate: today
        }).populate({
            path: "patientId",
            select: "name -_id", // Only get the patient name and exclude _id
            model: "User"
        })

        if (appointments.length === 0) {
            return res.status(200).json({ message: "No appointment for today", data: [] });
        }

        res.status(200).json({
            data: appointments,
            message: "Today's Appointments"
        });

    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const addNotes = async (req, res, next) => {
    try {
        // console.log("test add note")
        //fetch appoinmentId
        const { appoinmentId } = req.params;
        const { consultationNotes } = req.body;

        //add notes and status change
        const doctorsData = await Appoinment.findByIdAndUpdate(appoinmentId, { status: 'Completed', consultationNotes: consultationNotes }, { new: true })

        res.json({ data: doctorsData, message: 'Notes added' })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const cancelAppoinment = async (req, res, next) => {
    try {
        //fetch appoinmentId
        const { appoinmentId } = req.params;
        // console.log(appoinmentId)
        //validate appoinmentId
        if (!appoinmentId) {
            return res.status(400).json({ message: "Appoinment id required" })
        }

        //cancell data
        const AppoinmentData = await Appoinment.findByIdAndUpdate(appoinmentId, { status: 'Cancelled' }, { new: true })

        if (AppoinmentData) {
            res.json({ message: "Appoinment Cancelled" })
        }

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const searchAppoinment = async (req, res) => {
    try {
        const { name } = req.query;

        // 1. Find matching users by name (doctor or patient)
        const users = await User.find({
            name: { $regex: new RegExp(name, "i") }
        }).select("_id");

        const userIds = users.map(user => user._id);

        // 2. Search appointments where either doctorId or patientId matches
        const matchedAppointments = await Appoinment.find({
            $or: [
                { patientId: { $in: userIds } }
            ]
        })
            .populate("doctorId", "name")   // Populate only the name field
            .populate("patientId", "name"); // Populate only the name field

        // 3. Format and send the result
        const results = matchedAppointments.map(app => ({
            _id: app._id,
            appointmentDate: app.appointmentDate,
            appointmentTime: app.appointmentTime,
            status: app.status,
            consultationNotes: app.consultationNotes,
            patientName: app.patientId?.name || "N/A"
        }));

        res.status(200).json({ data: results });

    } catch (error) {
        console.error("Error searching appointment:", error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
}

export const searchDoctor = async (req, res) => {
    try {
        const { name } = req.query;
        const results = await User.find({
            name: { $regex: new RegExp(name, "i") }, // case-insensitive
        });

        res.status(200).json({ data: results });
    } catch (error) {
        res.status(500).json({ message: "Search error", error: error.message });
    }
}

export const searchPatient = async (req, res) => {
    try {
        const { name } = req.query;

        // Step 1: Find matching users
        const users = await User.find({
            role: "Patient",
            name: { $regex: new RegExp(name, "i") }
        });

        res.status(200).json({ data: users });

    } catch (error) {
        console.error("Error in search Patient:", error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
}

export const secureData = async (req, res, next) => {
    try {
        // console.log(res)
        const user = await User.findById(req.doctor.id).select("-password");
        res.json({ data: user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const addUUIDsToPatients = async (req, res) => {
    try {
      const patients = await Patient.find({ publicId: { $exists: false } });
  
      for (const patient of patients) {
        patient.publicId = uuidv4();
        await patient.save();
        // console.log(`Updated: ${patient.name} - ${patient.publicId}`);
      }
  
      return res.status(200).json({
        message: 'All patients updated with UUIDs!',
        updatedCount: patients.length,
      });
    } catch (err) {
      console.error('Error updating patients:', err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };