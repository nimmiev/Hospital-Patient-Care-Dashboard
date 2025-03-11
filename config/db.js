import mongoose from "mongoose"

export const connectDB = async() => {
    try {

        const response = await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

    }catch (error) {
        console.log(error);  
    }
}