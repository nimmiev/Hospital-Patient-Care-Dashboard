import { User } from "../models/userModel.js";
import { Doctor } from "../models/DoctorModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const doctorSignup = async(req, res, next) => {
    try{
        // console.log("signup hitted");

        //collect doctor data
        const {name, email, password, confirmPassword, phone, profilepic, medicalLicense, qualification, experience, department} = req.body;

        //data vaildation
        if(!name || !email || !password || !confirmPassword || !phone || !medicalLicense || !qualification || !experience || !department) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check doctor already exist
        const doctorExist = await User.findOne({email:email})

        if(doctorExist) {
            return res.status(400).json({message:"Doctor Already Exist"})
        }
        
        //compare with confirm password
        if(password !== confirmPassword) {
            return res.status(400).json({message: "Password do not match"})
        }

        //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);

        //save data to User modal in DB
        const newDoctor = new User({ name, email, password: hashPassword, phone, role: "Doctor", profilepic})
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
        
        res.json({data: dataDoctor, message:"Doctor signup success"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const doctorLogin = async(req, res, next) => {
    try{
        // console.log("Login hitted");

        //collect doctor data
        const {email,password} = req.body;

        //data vaildation
        if(!email || !password) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check doctor already exist
        const doctorExist = await User.findOne({email})

        if(!doctorExist) {
            return res.status(404).json({message:"Doctor not found"})
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, doctorExist.password);

        if(!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        if(!doctorExist.isActive) {
            return res.status(401).json({message: "Doctor account is not active"})
        }

        
        const doctorData = doctorExist.toObject(); // Convert Mongoose document to plain object
        delete doctorData.password; // Remove password field

        //generate token
        const token = generateToken(doctorData._id, "Doctor");
        res.cookie('token', token);

        res.json({data: doctorData, message:"Login success"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const doctorProfile = async(req, res, next) => {
    try {
        //doctorId
        const doctorId =  req.doctor.id;
        console.log(doctorId);
        
        const doctorsData = await User.findById(doctorId)
        const doctorsData1 = await Doctor.findOne({ userId:doctorId })
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

        res.json({data:doctorData, message:"Doctor profile fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const doctorProfileUpdate = async(req, res, next) => {
    try {

        //fetch exist profile data
        const {name, email, password, phone, role, profilepic, medicalLicense, qualification, experience, department} = req.body;

        //userId
        const doctorId =  req.doctor.id;
        // console.log(doctorId)
        const doctorsData = await User.findByIdAndUpdate(doctorId, { name: name, email: email, password: password, phone: phone, role: role, profilepic: profilepic }, { new: true })

        // console.log(doctorsData);
        
        const doctorsData1 = await Doctor.findOneAndUpdate({ userId:doctorId }, { medicalLicense: medicalLicense, qualification: qualification, experience: experience, department: department }, { new: true })
        
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

        res.json({data:doctorData, message:"Doctor profile Updated"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

export const doctorprofileDeactivate = async (req, res, next) => {
    try {
        //userId
        const doctorId = req.doctor.id;
        const usersData = await User.findByIdAndUpdate(doctorId, { isActive: false }, {new: true})

        const userData = usersData.toObject();
        delete userData.password;

        res.json({data:userData, message:"User Deactivated"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }
}

export const doctorLogout = async(req, res, next) => {
    try {

        res.clearCookie("token");

        res.json({message:"Doctor Logout success"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}