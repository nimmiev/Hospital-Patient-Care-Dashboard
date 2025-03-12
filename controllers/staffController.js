import { User } from "../models/userModel.js";
import { Staff } from "../models/staffModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

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
        const newStaff1 = new Staff({ userId: newStaff._id, roleDescription, assignedTask, taskCount });
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

        if(!staffExist) {
            return res.status(404).json({message:"Staff not found"})
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, staffExist.password);

        if(!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        if(!staffExist.isActive) {
            return res.status(401).json({message: "Staff account is not active"})
        }

        
        const staffData = staffExist.toObject(); // Convert Mongoose document to plain object
        delete staffData.password; // Remove password field

        //generate token
        const token = generateToken(staffData._id, "Staff");
        res.cookie('token', token);

        res.json({data: staffData, message:"Login success"})
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
            taskCount: staffsData1.taskCount
        }

        res.json({data:staffData, message:"Staff profile fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const staffProfileUpdate = async(req, res, next) => {
    try {

        //fetch exist profile data
        const {name, email, password, phone, role, profilepic, roleDescription, assignedTask, taskCount } = req.body;

        //userId
        const staffId =  req.staff.id;
        // console.log(staffId)
        const staffsData = await User.findByIdAndUpdate(staffId, { name: name, email: email, password: password, phone: phone, role: role, profilepic: profilepic }, { new: true })

        // console.log(staffsData);
        
        const staffsData1 = await Staff.findOneAndUpdate({ userId:staffId }, { roleDescription:roleDescription, assignedTask:assignedTask, taskCount:taskCount }, { new: true })
        
        const staffData = {
            name: staffsData.name,
            email: staffsData.email,
            phone: staffsData.phone,
            role: staffsData.role,
            profilepic: staffsData.profilepic,
            roleDescription: staffsData1.roleDescription,
            assignedTask: staffsData1.assignedTask,
            taskCount: staffsData1.taskCount
        }

        res.json({data:staffData, message:"Staff profile Updated"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
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

        res.json({message:"Staff Logout success"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}