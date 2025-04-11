import { User } from "../models/userModel.js";
import { Patient } from "../models/PatientModel.js";
import { Appoinment } from "../models/AppoinmentModel.js";
import { Bloodbank } from "../models/BloodbankModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { streamUpload } from "../config/cloudinary.js";

export const patientSignup = async (req, res, next) => {
    try {
        // console.log("signup hitted");

        //collect patient data
        const { name, email, password, confirmPassword, phone, profilepic, dateOfBirth, gender, address,
            emergencyContact, preExistingConditions, allergies, pastSurgeries, medications, chronicDiseases,
            bloodType, height, weight, smoking, alcoholConsumption, insurance, familyHistory, dietPreference,
            physicalActivityLevel, sleepPatterns, emergencyPreferences } = req.body;

        //data vaildation
        if (!name || !email || !password || !confirmPassword || !phone || !dateOfBirth || !gender || !address || !emergencyContact) {
            return res.status(400).json({ message: "All fields required" })
        }
        // console.log(name,email,password,phone,role);

        //check patient already exist
        const patientExist = await User.findOne({ email: email })

        if (patientExist) {
            return res.status(400).json({ message: "Patient Already Exist" })
        }

        //compare with confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" })
        }

        //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);

        //save data to User modal in DB
        const newPatient = new User({ name, email, password: hashPassword, phone, role: "Patient", profilepic })
        await newPatient.save()

        // Save patient-specific data to Patient model in DB
        const newPatient1 = new Patient({
            userId: newPatient._id, dateOfBirth, gender, address, emergencyContact,
            preExistingConditions, allergies, pastSurgeries, medications, chronicDiseases, bloodType, height,
            weight, smoking, alcoholConsumption, insurance, familyHistory, dietPreference, physicalActivityLevel,
            sleepPatterns, emergencyPreferences
        });
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

        res.json({ data: dataPatient, message: "Patient signup success" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
};

export const patientLogin = async (req, res, next) => {
    try {
        // console.log("Login hitted");

        //collect patient data
        const { email, password } = req.body;

        //data vaildation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" })
        }
        // console.log(name,email,password,phone,role);

        //check patient already exist
        const patientExist = await User.findOne({ email })

        if (!patientExist) {
            return res.status(404).json({ message: "Patient not found" })
        }

        //check match password with db
        const passwordMatch = bcrypt.compareSync(password, patientExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        if (!patientExist.isActive) {
            return res.status(401).json({ message: "Patient account is not active" })
        }


        const patientData = patientExist.toObject(); // Convert Mongoose document to plain object
        delete patientData.password; // Remove password field

        //generate token
        const token = generateToken(patientData._id, "Patient")
        // console.log(token)
        res.cookie('token', token);
        res.json({ data: { ...patientData, token }, message: "Patient Login success" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
};

export const patientProfile = async (req, res, next) => {
    try {
        //patientId
        const patientId = req.patient.id;
        // console.log(patientId);

        const patientsData = await User.findById(patientId)
        const patientsData1 = await Patient.findOne({ userId: patientId })
        // console.log(PatientsData1)

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

        res.json({ data: patientData, message: "Patient profile fetched" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.patient.id;

    // Extract form data
    const {
      name, email, phone, role,
      dateOfBirth, gender, address, emergencyContact,
      preExistingConditions, allergies, pastSurgeries, medications,
      chronicDiseases, bloodType, height, weight, smoking,
      alcoholConsumption, insurance, familyHistory, dietPreference,
      physicalActivityLevel, sleepPatterns, emergencyPreferences,
    } = req.body;

    let profilepicUrl = null;

    // Upload new profile picture if provided
    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      profilepicUrl = result.secure_url;
    }

    console.log("Profile pic URL:", profilepicUrl);

    // Update User
    const userUpdate = await User.findById(patientId);
    userUpdate.name = name;
    userUpdate.email = email;
    userUpdate.phone = phone;
    userUpdate.role = role;
    if (profilepicUrl) userUpdate.profilepic = profilepicUrl;
    await userUpdate.save();

    // Update Patient
    const patientUpdate = await Patient.findOneAndUpdate(
      { userId: patientId },
      {
        dateOfBirth,
        gender,
        address,
        emergencyContact: JSON.parse(emergencyContact),
        preExistingConditions: JSON.parse(preExistingConditions),
        allergies: JSON.parse(allergies),
        pastSurgeries: JSON.parse(pastSurgeries),
        medications: JSON.parse(medications),
        chronicDiseases: JSON.parse(chronicDiseases),
        bloodType,
        height,
        weight,
        smoking: JSON.parse(smoking),
        alcoholConsumption: JSON.parse(alcoholConsumption),
        insurance: JSON.parse(insurance),
        familyHistory: JSON.parse(familyHistory),
        dietPreference,
        physicalActivityLevel,
        sleepPatterns,
        emergencyPreferences: JSON.parse(emergencyPreferences),
      },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      data: {
        ...userUpdate.toObject(),
        ...patientUpdate.toObject(),
      },
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const updatePatientPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const patientId = req.patient.id;

        await User.findByIdAndUpdate(patientId, { password: hashedPassword });

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update password" });
    }
};

export const patientProfileDeactivate = async (req, res, next) => {
    try {
        //userId
        const patientId = req.patient.id;
        const patientsData = await User.findByIdAndUpdate(patientId, { isActive: false }, { new: true })

        const patientData = patientsData.toObject();
        delete patientData.password;

        res.json({ data: patientData, message: "Patient Deactivated" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error)
    }
}

export const patientLogout = async (req, res, next) => {
    try {

        res.clearCookie("token");
        res.clearCookie("role");
        res.clearCookie("theme");
        res.json({ message: "Patient Logout success" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const countAppoinment = async (req, res, next) => {
    try {
        //patientId
        const patientId = req.patient.id;

        const appoinmentCount = await Appoinment.countDocuments({ patientId: patientId })

        res.status(200).json({ count: appoinmentCount, message: "Appoinment count" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const appoinmentList = async (req, res, next) => {
    try {

        //patientId
        const patientId = req.patient.id;

        const appoinment = await Appoinment.find({ patientId: patientId })
        const patient = await Patient.findOne({ userId: patientId });
        const scheduled = patient.scheduled;

        res.status(200).json({ data: appoinment, scheduled, message: "Appointment List" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const requestAppoinment = async (req, res, next) => {
    try {
        //patientId
        const patientId = req.patient.id;
        // console.log(patientId);

        //update schedule field value
        const patientsData = await Patient.findOneAndUpdate({ userId: patientId }, { scheduled: true }, { new: true })
        // console.log(patientsData);

        res.json({ data: patientsData, message: "Appoinment requested" })

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

export const countBloodbank = async (req, res, next) => {
    try {
        const bloodbankCount = await Bloodbank.countDocuments({ available: true })

        res.status(200).json({ count: bloodbankCount, message: "Bloodbank count" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}

export const getBloodbank = async (req, res, next) => {
    try {
        //fetch bloodbank
        const bloodbank = await Bloodbank.find()
        // console.log(bloodbank)

        res.json({ data: bloodbank, message: "All Bloodbanks List" })
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
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

export const secureData = async (req, res, next) => {
    try {
        // console.log(res)
        const user = await User.findById(req.patient.id).select("-password");
        res.json({ data: user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" })
        console.log(error);
    }
}




