import jwt from "jsonwebtoken"

export const authDoctor = async(req, res, next) => {
    try {
        //collect token from cookies
        const {token} = req.cookies

        if(!token) {
            return res.status(401).json({message:"Access denied. No token provided."})
        }

        //decode token
        var decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        // console.log(decodedToken);

        if(!decodedToken) {
            return res.status(401).json({message:"Access denied. No token provided."})
        }

        req.doctor = decodedToken;

        //check role
        if(req.doctor.role != 'Doctor'){
            return res.status(401).json({message:"Access denied. Insufficient permissions."})
        }

        next()

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}