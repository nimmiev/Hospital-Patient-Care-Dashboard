import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  try {
    // 1. Get token from header or cookie
    let token = req.cookies.token;

    // If token not in cookie, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // 2. Decode token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("Decoded Token:", decodedToken);

    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // 3. Attach user to request
    req.user = decodedToken;

    // 4. Check role
    if (req.user.role !== "Admin") {
      return res.status(401).json({ message: "Access denied. Insufficient permissions." });
    }

    // Optional: reset the cookie again
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Use true in production with HTTPS
      sameSite: "Lax",
    });

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};
