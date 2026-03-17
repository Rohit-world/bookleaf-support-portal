import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAuthor extends Document {
  userId: Types.ObjectId;
  authorId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    authorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    joinedDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Author = mongoose.model<IAuthor>("Author", authorSchema);

export default Author;
