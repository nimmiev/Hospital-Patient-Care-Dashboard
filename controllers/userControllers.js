import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const userSignup = async(req, res, next) => {
    try{
        // console.log("signup hitted");

        //collect user data
        const {name,email,password,confirmPassword,phone,role,profilepic} = req.body;

        //data vaildation
        if(!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone);

        //check user already exist
        const userExist = await User.findOne({email:email})

        if(userExist) {
            return res.status(400).json({message:"User Already Exist"})
        }
        
        //compare with confirm password
        if(password !== confirmPassword) {
            return res.status(400).json({message: "Password do not match"})
        }

        //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);

        //save to db table
        const newUser = new User({ name, email, password: hashPassword, phone, role, profilepic})
        await newUser.save()

        //generate token using Id and Role
        const token = generateToken(newUser._id, "Admin");
        res.cookie('token', token);

        // remove hash password to frontend
        const dataUser = new User({ name, email, phone, role, profilepic})
        
        res.json({data: dataUser, message:"signup success"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const userLogin = async(req, res, next) => {
    try{
        // console.log("Login hitted");

        //collect user data
        const {email,password,role} = req.body;

        //data vaildation
        if(!email || !password) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check user already exist
        const userExist = await User.findOne({email})

        if(!userExist) {
            return res.status(404).json({message:"User not found"})
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, userExist.password);

        if(!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        if(!userExist.isActive) {
            return res.status(401).json({message: "User account is not active"})
        }

        
        const userData = userExist.toObject(); // Convert Mongoose document to plain object
        delete userData.password; // Remove password field

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
        //userId
        const userId =  'gbvujfv';
        const userData = await User.findById(userId)

        res.json({data:userData, message:"User profile fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}

// export const profile = async(req, res, next) => {
//     try {
        
//     } catch (error) {
//         res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
//         console.log(error);
//     }
// }