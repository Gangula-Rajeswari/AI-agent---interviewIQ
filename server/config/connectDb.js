
import mongoose from "mongoose";

const connectDb = async () => {
    try {
        console.log("Mongo URL:", process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected");
    } catch (error) {
        console.log("DB Error:", error.message);
        process.exit(1);
    }
};

export default connectDb;

