import { User } from "../models/userModel.js";
import { Staff } from "../models/staffModel.js";
import { Bloodbank } from "../models/BloodbankModel.js";
import { Task } from "../models/TaskModel.js";
import { Patient } from "../models/PatientModel.js";
import { Appoinment } from "../models/AppoinmentModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import mongoose from "mongoose";
import { streamUpload } from "../config/cloudinary.js";
import dayjs from "dayjs";

export const staffSignup = async(req, res, next) => {
    try{
        // console.log("signup hitted");

        //collect staff data
        const {name, email, password, confirmPassword, phone, profilepic, roleDescription, assignedTask, taskCount } = req.body;

        //data vaildation
        if(!name || !email || !password || !confirmPassword || !phone || !roleDescription ) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check staff already exist
        const staffExist = await User.findOne({email:email})

        if(staffExist) {
            return res.status(400).json({message:"Staff Already Exist"})
        }
        
        //compare with confirm password
        if(password !== confirmPassword) {
            return res.status(400).json({message: "Password do not match"})
        }

        //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);

        //save data to User modal in DB
        const newStaff = new User({ name, email, password: hashPassword, phone, role: "Staff", profilepic})
        await newStaff.save()

        // Save staff-specific data to Staff model in DB
        const newStaff1 = new Staff({ userId: newStaff._id, roleDescription, assignedTask, taskCount});
        await newStaff1.save();

        //generate token using Id and Role
        const token = generateToken(newStaff._id, "Staff");
        res.cookie('token', token);

        // remove hash password to frontend
        const dataStaff = {
            name: newStaff.name,
            email: newStaff.email,
            phone: newStaff.phone,
            role: newStaff.role,
            profilepic: newStaff.profilepic,
            roleDescription: newStaff1.roleDescription,
            assignedTask: newStaff1.assignedTask,
            taskCount: newStaff1.taskCount
        };
        
        res.json({data: dataStaff, message:"Staff signup success"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const staffLogin = async(req, res, next) => {
    try{
        // console.log("Login hitted");

        //collect staff data
        const {email,password} = req.body;

        //data vaildation
        if(!email || !password) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check staff already exist
        const staffExist = await User.findOne({email})
// console.log(staffExist)
        if(!staffExist) {
            return res.status(404).json({message:"Staff not found"})
        }
        
        if (staffExist.role !== "Staff") {
            return res.status(403).json({ message: "Access denied: Not a staff." });
        }
        
        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, staffExist.password);

        if(!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }
        
        if(!staffExist.isActive) {
            return res.status(401).json({message: "Staff account is not active"})
        }
        
        //fetch staff using id and check approved
        const staffApprove = await Staff.findOne({userId: staffExist._id})
        // console.log(staffApprove)
        
        if (!staffApprove || !staffApprove.approved) {
            return res.status(403).json({ message: "Account is pending admin approval." });
        }

        const staffData = staffExist.toObject(); // Convert Mongoose document to plain object
        delete staffData.password; // Remove password field
        
        //generate token
        const token = generateToken(staffData._id, "Staff");
        res.cookie('token', token);
        // res.json({ data: { ...staffData, token }, message: "Staff Login success" });
        res.json({ data: { ...staffData, token, role: "Staff" }, message: "Staff Login success" });

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const staffProfile = async(req, res, next) => {
    try {
        //staffId
        const staffId =  req.staff.id;
        // console.log(staffId);
        
        const staffsData = await User.findById(staffId)
        const staffsData1 = await Staff.findOne({ userId:staffId })
        // console.log(staffsData1)

        const staffData = {
            name: staffsData.name,
            email: staffsData.email,
            phone: staffsData.phone,
            role: staffsData.role,
            profilepic: staffsData.profilepic,
            roleDescription: staffsData1.roleDescription,
            assignedTask: staffsData1.assignedTask,
            taskCount: staffsData1.taskCount,
            status: staffsData1.approved
        }

        res.json({data:staffData, message:"Staff profile fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

// export const staffProfileUpdate = async(req, res, next) => {
//     try {

//         //fetch exist profile data
//         const {name, email, password, phone, role, profilepic, roleDescription, assignedTask, taskCount } = req.body;

//         //userId
//         const staffId =  req.staff.id;
//         // console.log(staffId)
//         const staffsData = await User.findByIdAndUpdate(staffId, { name: name, email: email, password: password, phone: phone, role: role, profilepic: profilepic }, { new: true })

//         // console.log(staffsData);
        
//         const staffsData1 = await Staff.findOneAndUpdate({ userId:staffId }, { roleDescription:roleDescription, assignedTask:assignedTask, taskCount:taskCount }, { new: true })
        
//         const staffData = {
//             name: staffsData.name,
//             email: staffsData.email,
//             phone: staffsData.phone,
//             role: staffsData.role,
//             profilepic: staffsData.profilepic,
//             roleDescription: staffsData1.roleDescription,
//             assignedTask: staffsData1.assignedTask,
//             taskCount: staffsData1.taskCount
//         }

//         res.json({data:staffData, message:"Staff profile Updated"})
        
//     } catch (error) {
//         res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
//         console.log(error);
//     }
// }
export const updateStaffProfile = async (req, res) => {
    try {
        const staffId = req.staff.id;

        const { name, email, phone, roleDescription } = req.body;
        const image = req.file ? req.file.path : undefined;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        let profilepicUrl = null;

        if (req.file) {
            const result = await streamUpload(req.file.buffer);
            profilepicUrl = result.secure_url;
        }

        // Update User model
        await User.findByIdAndUpdate(staffId, {
            name,
            email,
            phone,
            ...(profilepicUrl && { profilepic: profilepicUrl }),
        });

        // Update Staff model
        await Staff.findOneAndUpdate({ userId: staffId }, {
            roleDescription
        });

        res.status(200).json({ message: "Profile updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

export const updateStaffPassword = async (req, res) => {
    try {
        const staffId = req.staff.id;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(staffId, {
            password: hashedPassword,
        });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to update password" });
    }
}

export const staffProfiledeactivate = async (req, res, next) => {
    try {
        //userId
        const staffId = req.staff.id;
        const usersData = await User.findByIdAndUpdate(staffId, { isActive: false }, {new: true})

        const userData = usersData.toObject();
        delete userData.password;

        res.json({data:userData, message:"Staff Deactivated"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }
}

export const staffLogout = async(req, res, next) => {
    try {

        res.clearCookie("token");
        res.clearCookie("role");
        res.clearCookie("theme");
        res.json({ message: "Staff Logout success" });
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const getTask = async(req, res, next) => {
    try {
        //staffId
        const staffId = req.staff.id;

        //staff details displayed
        const tasks = await Task.find({staffId: staffId});
        //fetch staff name and email
        const updatedTasks = await Promise.all(
            tasks.map(async (task) => {
                const user = await User.findById(staffId, "name email"); // Get name and email
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

export const taskForToday = async (req, res, next) => {
    try {

        //staffId
        const staffId = req.staff.id;

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Find tasks where createdAt is between start and end of today
        const tasks = await Task.find({
            staffId: staffId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate({
            path: "staffId",
            select: "name -_id",
            model: "User"
        })

        if (tasks.length === 0) {
            return res.status(200).json({ message: "No task for today", data: [] });
        }

        res.status(200).json({
            data: tasks,
            message: "Today's tasks"
        });

    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const completedTask = async(req, res, next) => {
    try {
        //staffId
        const staffId =  req.staff.id;

        const appoinmentCount = await Task.countDocuments({ staffId: staffId, status: "Completed"})

        res.status(200).json({count: appoinmentCount, message: "Completed Task count"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const updateTask = async(req, res, next) => {
    try {
        // taskId
        const { taskId } = req.params;
        const { status } = req.body;
        
        //validate taskId
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid Task ID format" });
        }

        // Update task details
        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true })
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }
        
        res.status(200).json({ message: "Task updated", task })
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

export const searchBloodbank = async (req, res, next) => {
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
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const getPatient = async (req, res, next) => {
    try {
        // Fetch patients
        const patients = await User.find({ role: "Patient", isActive: true })
        .select("name email phone -_id")
        .sort({ createdAt: -1 });
    
        // Extract required fields
        // const patientData = patients.map((patient) => ({
        //     name: patient.name,
        //     email: patient.email,
        //     phone: patient.phone,
        // }));

        res.json({ data: patients, message: "Patients List" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
        console.log(error);
    }
};

export const getAppoinment = async(req, res, next) => {
    try {
        //fetch appoinments
        const appoinment = await Appoinment.find()
        .populate({
            path: "patientId",
            select: "name -_id",
            model: "User"
        })
        .populate({
            path: "doctorId",
            select: "name -_id",
            model: "User"
        });
        // console.log(appoinment)

        res.json({data:appoinment, message:"All Appoinment List"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

// export const appointmentListForToday = async (req, res, next) => {
//     try {
//         // Get today's date in YYYY-MM-DD format
//         const today = new Date().toISOString().split('T')[0];

//         // Find appointments for today
//         const appointments = await Appoinment.find({
//             appointmentDate: today
//         }).populate({
//             path: "patientId",
//             select: "name -_id", // Only get the patient name and exclude _id
//             model: "User"
//         }).populate({
//             path: "doctorId",
//             select: "name -_id", // Only get the doctor name and exclude _id
//             model: "User"
//         })

//         if (appointments.length === 0) {
//             return res.status(200).json({ message: "No appointment for today", data: [] });
//         }

//         res.status(200).json({
//             data: appointments,
//             message: "Today's Appointments"
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(error.statusCode || 500).json({
//             message: error.message || "Internal Server Error"
//         });
//     }
// }
export const appointmentListForToday = async (req, res, next) => {
    try {
        const today = dayjs().format('YYYY-MM-DD');

        const appointments = await Appoinment.find({
            appointmentDate: today
        })
        .populate({
            path: "patientId",
            select: "name -_id",
            model: "User"
        })
        .populate({
            path: "doctorId",
            select: "name -_id",
            model: "User"
        })
        .sort({ appointmentTime: 1 });

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
}

export const searchAppoinment = async (req, res) => {
    try {
        const searchQuery = (req.query.search || '').toLowerCase();

        // Fetch appointments with doctor and patient populated
        const appointments = await Appointment.find()
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', model: 'User' }
            })
            .populate({
                path: 'patientId',
                populate: { path: 'userId', model: 'User' }
            });

        // Filter on the server
        const filtered = appointments.filter(appt => {
            const doctorName = appt.doctorId?.userId?.name?.toLowerCase() || '';
            const patientName = appt.patientId?.userId?.name?.toLowerCase() || '';
            const appointmentDate = appt.appointmentDate.toLowerCase();
            const status = appt.status.toLowerCase();

            return (
                doctorName.includes(searchQuery) ||
                patientName.includes(searchQuery) ||
                appointmentDate.includes(searchQuery) ||
                status.includes(searchQuery)
            );
        });

        // Send transformed response
        const result = filtered.map(appt => ({
            _id: appt._id,
            appointmentDate: appt.appointmentDate,
            appointmentTime: appt.appointmentTime,
            status: appt.status,
            doctorId: {
                _id: appt.doctorId._id,
                name: appt.doctorId.userId?.name || 'Unknown'
            },
            patientId: {
                _id: appt.patientId._id,
                name: appt.patientId.userId?.name || 'Unknown'
            }
        }));

        res.json({ success: true, data: result });

    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

export const secureData = async (req, res, next) => {
    try{
        // console.log(res)
        const user = await User.findById(req.staff.id).select("-password");
        res.json({ data: user });
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}