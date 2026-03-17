import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
    console.log("Database name:", conn.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
