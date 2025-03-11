import jwt from "jsonwebtoken"
export const authUser = async(req, res, next) => {
    try {
        //collect token from cookies
        const {token} = req.cookies

        if(!token) {
            return res.status(401).json({message:"User not authorized"})
        }

        //decode token
        var decodedToken = jwt.verify({token}, process.env.JWT_SECRET_KEY)

        if(!decodedToken) {
            return res.status(401).json({message:"User not authorized"})
        }

        //check role
        next()

    } catch (error) {
        res.status( error.statusCode || 500 ).json({message: error.message || "Internal Server Error"})
        console.log(error);
    }
}