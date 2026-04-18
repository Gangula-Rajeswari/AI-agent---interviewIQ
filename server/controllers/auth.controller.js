import User from "../models/user.model.js";
import genToken from "../config/token.js";

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        let user = await User.findOne({ email });


        if (!user) {
            user = await User.create({
                name,
                email,
                credits: 100
            });
        } else {
            // FIX OLD USERS
            if (user.credits === 0 || user.credits == null) {
                user.credits = 100;
                await user.save();
            }
        }

        const token = await genToken(user._id); 
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits
            }
        });

    } catch (err) {
        console.error("Google Auth Error:", err);
        return res.status(500).json({
            message: err.message
        });
    }
};

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
