import { User } from "../models/userModel.js";
import { Doctor } from "../models/DoctorModel.js";
import { Appoinment } from "../models/AppoinmentModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { Patient } from "../models/PatientModel.js";
import mongoose from "mongoose";
import { streamUpload } from "../config/cloudinary.js";

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

export const getPatient = async (req, res, next) => {
    try {
        //doctorId
        const doctorId = req.doctor.id
        //fetch doctor appoinments
        const appointments = await Appoinment.find({ doctorId })
        // console.log(appointments);
        if (!appointments.length) {
            return res.status(404).json({ message: "No patients found for this doctor" })
        }

        // Extract patientId
        const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))]

        const patients = await User.find({ _id: { $in: patientIds } }, "name email phone role profilepic")

        res.json({ data: patients, message: "Patients List" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const getPatientDetails = async (req, res, next) => {
    try {
        //fetch patientId and doctorId
        const { patientId } = req.params
        const doctorId = req.doctor.id

        //validate patientId
        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" })
        }

        //check patient exist or not
        const appointmentExists = await Appoinment.findOne({ doctorId, patientId })

        if (!appointmentExists) {
            return res.status(403).json({ message: "Unauthorized: This patient is not associated with this doctor" })
        }

        // console.log(appointmentExists)
        //fetch corresponding patient details
        const patientDetails = await Patient.findOne({ userId: patientId });
        console.log(patientDetails)
        if (!patientDetails) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json({ data: patientDetails, message: "Patient details fetched" });

        // const patientData = {
        //     name: patientsData.name,
        //     email: patientsData.email,
        //     phone: patientsData.phone,
        //     role: patientsData.role,
        //     profilepic: patientsData.profilepic,
        //     dateOfBirth: patientsData1.dateOfBirth,
        //     gender: patientsData1.gender,
        //     address: patientsData1.address,
        //     emergencyContact: patientsData1.emergencyContact,
        //     preExistingConditions: patientsData1.preExistingConditions,
        //     allergies: patientsData1.allergies,
        //     pastSurgeries: patientsData1.pastSurgeries,
        //     medications: patientsData1.medications,
        //     chronicDiseases: patientsData1.chronicDiseases,
        //     bloodType: patientsData1.bloodType,
        //     height: patientsData1.height,
        //     weight: patientsData1.weight,
        //     smoking: patientsData1.smoking,
        //     alcoholConsumption: patientsData1.alcoholConsumption,
        //     insurance: patientsData1.insurance,
        //     familyHistory: patientsData1.familyHistory,
        //     dietPreference: patientsData1.dietPreference,
        //     physicalActivityLevel: patientsData1.physicalActivityLevel,
        //     sleepPatterns: patientsData1.sleepPatterns,
        //     emergencyPreferences: patientsData1.emergencyPreferences
        // }

        // res.json({data:patientData, message:"Patient details fetched"})
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

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

        res.status(200).json({ data: appoinment, message: "Appointment List" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const addNotes = async (req, res, next) => {
    try {
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