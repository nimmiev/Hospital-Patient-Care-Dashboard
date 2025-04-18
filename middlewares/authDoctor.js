import jwt from "jsonwebtoken"

export const authDoctor = async(req, res, next) => {
    try {
        //collect token from cookies
        let token = req.cookies.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        
        if(!token) {
            return res.status(401).json({message:"Access denied. No token provided."})
        }

        //decode token
        var decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        // console.log(decodedToken);

        if(!decodedToken) {
            return res.status(401).json({message:"Access denied. No token provided."})
        }
        
        //check role
        if(decodedToken.role != 'Doctor'){
            return res.status(401).json({message:"Access denied. Insufficient permissions."})
        }

        req.doctor = decodedToken;

        next()

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}