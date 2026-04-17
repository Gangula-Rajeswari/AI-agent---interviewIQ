
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};