import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBook extends Document {
  authorMongoId: Types.ObjectId;
  bookId: string;
  title: string;
  isbn?: string | null;
  genre?: string | null;
  publicationDate?: Date | null;
  status: string;
  mrp?: number | null;
  authorRoyaltyPerCopy?: number | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  lastRoyaltyPayoutDate?: Date | null;
  printPartner?: string | null;
  availableOn: string[];
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    authorMongoId: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
      index: true,
    },
    bookId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      default: null,
      trim: true,
    },
    genre: {
      type: String,
      default: null,
      trim: true,
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mrp: {
      type: Number,
      default: null,
    },
    authorRoyaltyPerCopy: {
      type: Number,
      default: null,
    },
    totalCopiesSold: {
      type: Number,
      default: 0,
    },
    totalRoyaltyEarned: {
      type: Number,
      default: 0,
    },
    royaltyPaid: {
      type: Number,
      default: 0,
    },
    royaltyPending: {
      type: Number,
      default: 0,
    },
    lastRoyaltyPayoutDate: {
      type: Date,
      default: null,
    },
    printPartner: {
      type: String,
      default: null,
      trim: true,
    },
    availableOn: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;
