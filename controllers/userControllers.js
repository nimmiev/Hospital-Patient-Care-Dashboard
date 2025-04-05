import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { Doctor } from "../models/DoctorModel.js";
import { Patient } from "../models/PatientModel.js";
import { Appoinment } from '../models/AppoinmentModel.js';
import { Bloodbank } from '../models/BloodbankModel.js';
import { Staff } from "../models/staffModel.js";
import { Task } from "../models/TaskModel.js";
import { cloudinaryInstance } from "../config/cloudinary.js";
import mongoose from "mongoose";

// export const userSignup = async(req, res, next) => {
//     try{
//         // console.log("signup hitted");

//         //collect user data
//         const {name,email,password,confirmPassword,phone,role} = req.body;

//         // console.log(req.file)
//         const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path)
//         // console.log(cloudinaryRes);
        

//         //data vaildation
//         if(!name || !email || !password || !confirmPassword || !phone) {
//             return res.status(400).json({message:"All fields required"})
//         }
//         // console.log(name,email,password,phone);

//         //check user already exist
//         const userExist = await User.findOne({email:email})

//         if(userExist) {
//             return res.status(400).json({message:"User Already Exist"})
//         }
        
//         //compare with confirm password
//         if(password !== confirmPassword) {
//             return res.status(400).json({message: "Password do not same"})
//         }

//         //password hashing
//         const hashPassword = bcrypt.hashSync(password, 10);

//         //save to db table
//         const newUser = new User({ name, email, password: hashPassword, phone, role, profilepic: cloudinaryRes.url })
//         await newUser.save()

//         //generate token using Id and Role
//         const token = generateToken(newUser._id, "Admin");
//         res.cookie('token', token);

//         // remove hash password to frontend
//         const dataUser = new User({ name, email, phone, role, profilepic: cloudinaryRes.url })
        
//         res.json({data: dataUser, message:"signup success"})

//     } catch (error) {
//         res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
//         console.log(error); 
//     }
// };
export const userSignup = async (req, res, next) => {
    try {
        // Collect user data
        const { name, email, password, confirmPassword, phone, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Compare passwords
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Password hashing
        const hashPassword = bcrypt.hashSync(password, 10);

        // Handle file upload
        let profilepic = null;
        if (req.file) {
            const cloudinaryRes = await new Promise((resolve, reject) => {
                const uploadStream = cloudinaryInstance.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            profilepic = cloudinaryRes.url;
        }

        // Save user to DB
        const newUser = new User({ name, email, password: hashPassword, phone, role, profilepic });
        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id, "Admin");
        res.cookie("token", token);

        // Remove password before sending response
        const { password: _, ...dataUser } = newUser.toObject();
        
        res.json({ data: dataUser, message: "Signup success" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
        console.log(error);
    }
};

export const userLogin = async(req, res, next) => {
    try{
        // console.log("Login hitted");

        //collect user data
        const {email,password} = req.body;

        //data vaildation
        if(!email || !password) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check user already exist
        const userExist = await User.findOne({email})

        if(!userExist) {
            return res.status(404).json({message:"User not found"})
        }else{
            if(userExist.role == 'Doctor' || userExist.role == 'Patient' || userExist.role == 'Staff'){
                return res.status(404).json({message:"Invalid Account Details"})
            }
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, userExist.password);

        if(!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        if(!userExist.isActive) {
            return res.status(401).json({message: "User account is not active"})
        }

        const userData = userExist.toObject();
        delete userData.password;

        //generate token
        const token = generateToken(userExist._id, "Admin");
        res.cookie('token', token);

        res.json({data: userData, message:"Login success"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const userProfile = async(req, res, next) => {
    try {
        // console.log("profile hitted");
        
        //userId
        const userId =  req.user.id;
        const usersData = await User.findById(userId)

        const userData = usersData.toObject(); // Convert Mongoose document to plain object
        delete userData.password; // Remove password field

        res.json({data:userData, message:"User profile fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

// export const userProfileUpdate = async(req, res, next) => {
//     try {

//         //fetch exist profile data
//         const {name,email,password,phone} = req.body;

//         const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path)
        
//         //userId
//         const userId =  req.user.id;
//         const usersData = await User.findByIdAndUpdate(userId, { name: name, email: email, password: password, phone: phone, profilepic: cloudinaryRes })

//         const userData = usersData.toObject();
//         delete userData.password;

//         res.json({data:userData, message:"User profile Updated"})
        
//     } catch (error) {
//         res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
//         console.log(error);
//     }
// }

export const userProfileUpdate = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const userId = req.user.id;

        let profilepic = null;
        
        if (req.file) { 
            const cloudinaryRes = await cloudinaryInstance.uploader.upload_stream(
                { resource_type: "auto" },
                async (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return res.status(500).json({ message: "Image upload failed" });
                    }
                    profilepic = result.secure_url;

                    //password hashing
                    const password = bcrypt.hashSync(password, 10);

                    // Update user profile in database
                    const updatedUser = await User.findByIdAndUpdate(
                        userId, 
                        { name, email, password, phone, profilepic }, 
                        { new: true }
                    );

                    if (!updatedUser) {
                        return res.status(404).json({ message: "User not found" });
                    }

                    const userData = updatedUser.toObject();
                    delete userData.password; 

                    res.json({ data: userData, message: "User profile updated successfully" });
                }
            );

            cloudinaryRes.end(req.file.buffer);
        } else {

            //password hashing
            const password = bcrypt.hashSync(password, 10);

            // Update user profile without image
            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                { name, email, password, phone }, 
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            const userData = updatedUser.toObject();
            delete userData.password;

            res.json({ data: userData, message: "User profile updated successfully" });
        }

    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};

export const profileDeactivate = async (req, res, next) => {
    try {
        //userId
        const userId = req.user.id;
        const usersData = await User.findByIdAndUpdate(userId, { isActive: false })

        const userData = usersData.toObject();
        delete userData.password;

        res.json({data:userData, message:"User Deactivated"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }
}

export const userLogout = async(req, res, next) => {
    try {

        res.clearCookie("token");

        res.json({message:"User Logout success"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const countDoctor = async(req, res, next) => {
    try {

        const doctorCount = await User.countDocuments({role: "Doctor", isActive: true})

        res.status(200).json({count: doctorCount, message: "Doctor count"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getDoctor = async(req, res, next) => {
    try {
        //fetch doctors
        const doctor = await User.find({role: "Doctor", isActive: true})
        // console.log(doctor)

        res.json({data:doctor, message:"Doctors List"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getDoctorDetails = async(req, res, next) => {
    try {
        //fetch doctorId
        const { doctorId } = req.params

        //validate doctorId
        if(!doctorId) {
            return res.status(200).json({message: "Doctor id required"})
        }

        //fetch corresponding doctor details
        const doctorsData = await User.findById(doctorId)
        const doctorsData1 = await Doctor.findOne({ userId:doctorId })
        // console.log(doctorsData1)

        if(!doctorsData || !doctorsData1) {
            return res.status(404).json({message: "Doctor not found"})
        }

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

        res.json({data:doctorData, message:"Doctor details fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const deleteDoctor = async(req, res, next) => {
    try {
        //fetch doctorId
        const { doctorId } = req.params

        //validate doctorId
        if(!doctorId) {
            return res.status(200).json({message: "Doctor id required"})
        }

        //delete data
        const doctor = await User.deleteOne({ _id: new mongoose.Types.ObjectId(doctorId) })

        const doctors = await Doctor.deleteOne({userId: new mongoose.Types.ObjectId(doctorId) })

        res.status(200).json({message: "Doctor id deleted"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const doctorApproval = async(req, res, next) => {
    try {
        // console.log("approve hitted");
        
        //doctor id
        const { doctorId } = req.params
       
        const doctorData = await Doctor.findOneAndUpdate({ userId: doctorId }, { approved: true }, { new: true})
        
        if(doctorData){
            res.json({message:"Doctor is Activated"})
        }
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const countPatient = async(req, res, next) => {
    try {

        const patientCount = await User.countDocuments({role: "Patient", isActive: true})

        res.status(200).json({count: patientCount, message: "Patient count"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getPatient = async(req, res, next) => {
    try {
        // console.log("list get")
        //fetch patients
        const patient = await User.find({role: "Patient", isActive: true})
        // console.log(patient)

        res.json({data:patient, message:"Patients List"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getPatientDetails = async(req, res, next) => {
    try {
        //fetch patientId
        const { patientId } = req.params

        //validate patientId
        if(!patientId) {
            return res.status(200).json({message: "Patient id required"})
        }

        //fetch corresponding patient details
        const patientsData = await User.findById(patientId)
        const patientsData1 = await Patient.findOne({ userId:patientId })
        // console.log("user data:", patientsData)
        // console.log("patient data:", patientsData1)

        if(!patientsData || !patientsData1) {
            return res.status(404).json({message: "Patient not found"})
        }

        const patientData = {
            name: patientsData.name,
            email: patientsData.email,
            phone: patientsData.phone,
            role: patientsData.role,
            profilepic: patientsData.profilepic,
            dateOfBirth: patientsData1.dateOfBirth,
            gender: patientsData1.gender,
            address: patientsData1.address,
            emergencyContact: patientsData1.emergencyContact,
            preExistingConditions: patientsData1.preExistingConditions,
            allergies: patientsData1.allergies,
            pastSurgeries: patientsData1.pastSurgeries,
            medications: patientsData1.medications,
            chronicDiseases: patientsData1.chronicDiseases,
            bloodType: patientsData1.bloodType,
            height: patientsData1.height,
            weight: patientsData1.weight,
            smoking: patientsData1.smoking,
            alcoholConsumption: patientsData1.alcoholConsumption,
            insurance: patientsData1.insurance,
            familyHistory: patientsData1.familyHistory,
            dietPreference: patientsData1.dietPreference,
            physicalActivityLevel: patientsData1.physicalActivityLevel,
            sleepPatterns: patientsData1.sleepPatterns,
            emergencyPreferences: patientsData1.emergencyPreferences
        }

        res.json({data:patientData, message:"Patient details fetched"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const deletePatient = async(req, res, next) => {
    try {
        //fetch patientId
        const { patientId } = req.params

        //validate patientId
        if(!patientId) {
            return res.status(200).json({message: "Patient id required"})
        }

        //delete data
        const patient = await User.deleteOne({ _id: new mongoose.Types.ObjectId(patientId) })

        const patients = await Patient.deleteOne({userId: new mongoose.Types.ObjectId(patientId) })

        res.status(200).json({message: "Patient id deleted"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const addPatient = async(req, res, next) => {
    try {
        // console.log("signup hitted");
        
            //collect patient data
            const {name, email, password, confirmPassword, phone, dateOfBirth, gender, address,
                emergencyContact, bloodType, height, weight, emergencyPreferences } = req.body;
    
            //data vaildation
            if(!name || !email || !password || !confirmPassword || !phone || !dateOfBirth || !gender || !address || !emergencyContact ) {
                return res.status(400).json({message:"All fields required"})
            }
            // console.log(name,email,password,phone,role);
    
            //check patient already exist
            const patientExist = await User.findOne({email:email})
    
            if(patientExist) {
                return res.status(400).json({message:"Patient Already Exist"})
            }
            
            //compare with confirm password
            if(password !== confirmPassword) {
                return res.status(400).json({message: "Password do not match"})
            }
    
            //password hashing
            const hashPassword = bcrypt.hashSync(password, 10);
    
            //save data to User modal in DB
            const newPatient = new User({ name, email, password: hashPassword, phone, role: "Patient"})
            await newPatient.save()
    
            // Save patient-specific data to Patient model in DB
            const newPatient1 = new Patient({ userId: newPatient._id, dateOfBirth, gender, address, emergencyContact,
                bloodType, height, weight });
            await newPatient1.save();
    
            //generate token using Id and Role
            const token = generateToken(newPatient._id, "Patient");
            res.cookie('token', token);
    
            // remove hash password to frontend
            const dataPatient = {
                name: newPatient.name,
                email: newPatient.email,
                phone: newPatient.phone,
                role: newPatient.role,
                dateOfBirth: newPatient1.dateOfBirth,
                gender: newPatient1.gender,
                address: newPatient1.address,
                emergencyContact: newPatient1.emergencyContact,
                bloodType: newPatient1.bloodType,
                height: newPatient1.height,
                weight: newPatient1.weight
            };
            
            res.json({data: dataPatient, message:"Patient signup success"})
            
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const countStaff = async(req, res, next) => {
    try {

        const staffCount = await User.countDocuments({role: "Staff", isActive: true})

        res.status(200).json({count: staffCount, message: "Staff count"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getStaff = async(req, res, next) => {
    try {
        //fetch staffs
        const staff = await User.find({role: "Staff", isActive: true})
        // console.log(staff)

        res.json({data:staff, message:"Staffs List"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getStaffDetails = async(req, res, next) => {
    try {
       //fetch staffId
       const { staffId } = req.params

       //validate staffId
       if(!staffId) {
           return res.status(200).json({message: "Staff id required"})
       }

       //fetch corresponding staff details
       const staffsData = await User.findById(staffId)
       const staffsData1 = await Staff.findOne({ userId:staffId })
       // console.log(staffsData1)

       if(!staffsData || !staffsData1) {
           return res.status(404).json({message: "Staff not found"})
       }

        const patientData = {
            name: staffsData.name,
            email: staffsData.email,
            phone: staffsData.phone,
            role: staffsData.role,
            profilepic: staffsData.profilepic,
            roleDescription: staffsData1.roleDescription,
            assignedTask: staffsData1.assignedTask,
            taskCount: staffsData1.taskCount
        }

       res.json({data:patientData, message:"Staff details fetched"}) 
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const deleteStaff = async(req, res, next) => {
    try {
        //fetch staffId
        const { staffId } = req.params

        //validate staffId
        if(!staffId) {
            return res.status(200).json({message: "Staff id required"})
        }

        //delete data
        const staff = await User.deleteOne({ _id: new mongoose.Types.ObjectId(staffId) })

        const staffs = await Staff.deleteOne({userId: new mongoose.Types.ObjectId(staffId) })

        res.status(200).json({message: "Staff id deleted"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const staffApproval = async(req, res, next) => {
    try {
        //staffid
        const { staffId } = req.params
       
        const staffData = await Staff.findOneAndUpdate({ userId: staffId }, { approved: true }, { new: true})
        
        if(staffData){
            res.json({message:"Staff is Activated"})
        }
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const countAppoinment = async(req, res, next) => {
    try {
        const appoinmentCount = await Appoinment.countDocuments()

        res.status(200).json({count: appoinmentCount, message: "Appoinment count"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getAppoinment = async(req, res, next) => {
    try {
        //fetch appoinments
        const appoinment = await Appoinment.find()
        // console.log(appoinment)

        res.json({data:appoinment, message:"All Appoinment List"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const addAppoinment = async(req, res, next) => {
    try {
        //collect data
        const { patientId, doctorId, appointmentDate, appointmentTime } = req.body;

        //data vaildation
        if(!patientId || !doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({message:"All fields required"})
        }

        // Check if an appointment already exists for the same patient on the given date
        const existingAppointment = await Appoinment.findOne({ 
            patientId, 
            appointmentDate, 
            status: { $in: ["Scheduled", "Rescheduled"] } // Only check active appointments
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "An appointment is already scheduled for this date" });
        }

        //save to db table
        const newAppoinment = new Appoinment({ patientId, doctorId, appointmentDate, appointmentTime})
        await newAppoinment.save()

        res.json({message:"Appoinment scheduled"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const updateAppoinment = async(req, res, next) => {
    try {
        //appoinmentId
        const { appoinmentId } = req.params;
        const { doctorId, appointmentDate, appointmentTime } = req.body;

        // Validate data
        if (!doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the existing appointment
        const existingAppointment = await Appoinment.findByIdAndUpdate( appoinmentId, { status: "Cancelled" });

        if (!existingAppointment) {
            return res.status(404).json({ message: "No Cancelled appointment found to reschedule" });
        }
       
        // Update appointment details
        existingAppointment.appointmentDate = appointmentDate;
        existingAppointment.appointmentTime = appointmentTime;
        existingAppointment.status = "Rescheduled";

        await existingAppointment.save();

        res.status(200).json({ message: "Appointment rescheduled", appointment: existingAppointment });

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const cancelAppoinment = async(req, res, next) => {
    try {
        //fetch appoinmentId
        const { appoinmentId } = req.params;
        console.log(appoinmentId)
        //validate appoinmentId
        if(!appoinmentId) {
            return res.status(400).json({message: "Appoinment id required"})
        }

        //cancell data
        const AppoinmentData = await Appoinment.findByIdAndUpdate( appoinmentId, { status: 'Cancelled' }, { new: true})
        
        if(AppoinmentData){
            res.json({message:"Appoinment Cancelled"})
        }

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getBloodbank = async(req, res, next) => {
    try {
         //fetch bloodbank
         const bloodbank = await Bloodbank.find()
         // console.log(bloodbank)
 
         res.json({data:bloodbank, message:"All Bloodbanks List"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const addBloodbank = async(req, res, next) => {
    try {

        //fetch bloodbank data
        const { bloodGroup, quantity, hospitalName, location, contactNumber } = req.body;

        //validate the data
        if (!bloodGroup || !quantity || !hospitalName || !location || !contactNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //check bloodbank exist
        const existingBloodbank = await Bloodbank.findOne({ bloodGroup, hospitalName });

        if (existingBloodbank) {
            return res.status(400).json({ message: "Blood bank entry already exists for this hospital" });
        }

        //add to model
        const newBloodbank = new Bloodbank({ bloodGroup, quantity, hospitalName, location, contactNumber, available: true });
        await newBloodbank.save();

        res.status(200).json({ message: "Blood bank added", data: newBloodbank });
                
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const updateBloodbank = async(req, res, next) => {
    try {
        const { bloodbankId } = req.params;
        const updateData = req.body;

        // Validate ID
        if (!bloodbankId) {
            return res.status(400).json({ message: "Bloodbank ID is required" });
        }

        // Find and update the blood bank entry
        const updatedBloodbank = await Bloodbank.findByIdAndUpdate(bloodbankId, updateData, { new: true });

        if (!updatedBloodbank) {
            return res.status(404).json({ message: "Blood bank not found" });
        }

        res.status(200).json({ message: "Blood bank updated", data: updatedBloodbank });

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const deleteBloodbank = async(req, res, next) => {
    try {
        const { bloodbankId } = req.params;

        // Validate bloodbankId
        if (!bloodbankId) {
            return res.status(400).json({ message: "Bloodbank ID is required" })
        }

        // Find and delete the blood bank entry
        const deletedBloodbank = await Bloodbank.findByIdAndDelete(bloodbankId)

        if (!deletedBloodbank) {
            return res.status(404).json({ message: "Blood bank not found" })
        }

        res.status(200).json({ message: "Blood bank deleted" })

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const countBloodbank = async(req, res, next) => {
    try {
        const bloodbankCount = await Bloodbank.countDocuments({ available: true})

        res.status(200).json({count: bloodbankCount, message: "Bloodbank count"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const searchBloodbank = async(req, res, next) => {
    try {
        // bloodgroup
        let bloodgroup = req.query.bloodgroup;

        // check bloodgroup exists
        if (bloodgroup) {
            bloodgroup = bloodgroup.replace(/ /g, "+"); // Convert space to +
            // bloodgroup = decodeURIComponent(bloodgroup);   // Decode URI
        }

        //create filter
        let filter = bloodgroup ? { bloodGroup: bloodgroup } : {};
       
        // fetch bloodbanks
        const bloodbanks = await Bloodbank.find(filter);

        res.json({ data: bloodbanks, message: "Bloodbanks List" });
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getTask = async(req, res, next) => {
    try {
        //staff details displayed
        const tasks = await Task.find();

        //fetch staff name and email
        const updatedTasks = await Promise.all(
            tasks.map(async (task) => {
                const user = await User.findById(task.staffId, "name email"); // Get name and email
                return {
                    _id: task._id,
                    taskDescription: task.taskDescription,
                    status: task.status,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                    staffDetails: user ? { name: user.name, email: user.email } : null, // Attach user details
                };
            })
        );

        res.status(200).json({ data: updatedTasks });        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const addTask = async(req, res, next) => {
    try {
        // fetch data
        const { staffId, taskDescription } = req.body

        // check staff exist
        const staff = await Staff.findOne({userId: staffId});
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // create new task
        const task = new Task({ staffId, taskDescription });
        await task.save();

        // update assigned task and count
        staff.assignedTask = true;
        staff.taskCount += 1;
        await staff.save();

        res.status(201).json({ message: "Task added", data: task });
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const deleteTask = async(req, res, next) => {
    try {
        // fetch taskId
        const { taskId } = req.params;
        
        //delete task
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Update staff assignedTask and taskCount
        const staff = await Staff.findById(task.staffId);
        if (staff) {
            staff.taskCount -= 1;
            if (staff.taskCount === 0) {
                staff.assignedTask = false;
            }
            await staff.save()
        }
        
        res.status(200).json({ message: "Task deleted" })

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const editTask = async(req, res, next) => {
    try {
        // fetch taskId
        const { taskId } = req.params;
        const { taskDescription, status } = req.body;
        
        // Update task details
        const task = await Task.findByIdAndUpdate(taskId, { taskDescription, status }, { new: true })
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }
        
        res.status(200).json({ message: "Task updated", task })
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const editInstruction = async(req, res, next) => {
    try {
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}