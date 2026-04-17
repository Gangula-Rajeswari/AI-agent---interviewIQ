import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "No token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("DECODED TOKEN:", decoded);

        if (!decoded?.userId) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        req.userId = decoded.userId;

        next();

    } catch (error) {
        console.log("JWT ERROR:", error.message);

        return res.status(401).json({
            message: "Token verification failed"
        });
    }
};

export default isAuth;