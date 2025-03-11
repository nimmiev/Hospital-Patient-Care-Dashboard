import { User } from "../models/userModel.js";
import { Patient } from "../models/PatientModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const patientSignup = async(req, res, next) => {
    try{
        // console.log("signup hitted");

        //collect patient data
        const {name, email, password, confirmPassword, phone, profilepic, dateOfBirth, gender, address,
            emergencyContact, preExistingConditions, allergies, pastSurgeries, medications, chronicDiseases,
            bloodType, height, weight, smoking, alcoholConsumption, insurance, familyHistory, dietPreference,
            physicalActivityLevel, sleepPatterns, emergencyPreferences } = req.body;

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
        const newPatient = new User({ name, email, password: hashPassword, phone, role: "Patient", profilepic})
        await newPatient.save()

        // Save patient-specific data to Patient model in DB
        const newPatient1 = new Patient({ userId: newPatient._id, dateOfBirth, gender, address, emergencyContact,
            preExistingConditions, allergies, pastSurgeries, medications, chronicDiseases, bloodType, height,
            weight, smoking, alcoholConsumption, insurance, familyHistory, dietPreference, physicalActivityLevel,
            sleepPatterns, emergencyPreferences });
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
            profilepic: newPatient.profilepic,
            dateOfBirth: newPatient1.dateOfBirth,
            gender: newPatient1.gender,
            address: newPatient1.address,
            emergencyContact: newPatient1.emergencyContact,
            preExistingConditions: newPatient1.preExistingConditions,
            allergies: newPatient1.allergies,
            pastSurgeries: newPatient1.pastSurgeries,
            medications: newPatient1.medications,
            chronicDiseases: newPatient1.chronicDiseases,
            bloodType: newPatient1.bloodType,
            height: newPatient1.height,
            weight: newPatient1.weight,
            smoking: newPatient1.smoking,
            alcoholConsumption: newPatient1.alcoholConsumption,
            insurance: newPatient1.insurance,
            familyHistory: newPatient1.familyHistory,
            dietPreference: newPatient1.dietPreference,
            physicalActivityLevel: newPatient1.physicalActivityLevel,
            sleepPatterns: newPatient1.sleepPatterns,
            emergencyPreferences: newPatient1.emergencyPreferences
        };
        
        res.json({data: dataPatient, message:"Patient signup success"})
        
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const patientLogin = async(req, res, next) => {
    try{
        // console.log("Login hitted");

        //collect patient data
        const {email,password} = req.body;

        //data vaildation
        if(!email || !password || !role) {
            return res.status(400).json({message:"All fields required"})
        }
        // console.log(name,email,password,phone,role);

        //check patient already exist
        const patientExist = await User.findOne({email})

        if(!patientExist) {
            return res.status(404).json({message:"Patient not found"})
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, patientExist.password);

        if(!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        if(!patientExist.isActive) {
            return res.status(401).json({message: "Patient account is not active"})
        }

        
        const patientData = patientExist.toObject(); // Convert Mongoose document to plain object
        delete patientData.password; // Remove password field

        //generate token
        const token = generateToken(patientData._id, "Patient");
        res.cookie('token', token);

        res.json({data: patientData, message:"Login success"})
    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error); 
    }
};

export const patientProfile = async(req, res, next) => {
    try {
        //patientId
        const patientId =  'gbvujfv';
        const patientData = await User.findById(patientId)

        res.json({data:patientData, message:"Patient profile fetched"})

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}