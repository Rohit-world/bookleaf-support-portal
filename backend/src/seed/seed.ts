import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User.model";
import Author from "../models/Author.model";
import Admin from "../models/Admin.model";
import Book from "../models/Book.model";
import { hashPassword } from "../utils/hashPassword";

interface SampleBook {
  book_id: string;
  title: string;
  isbn: string | null;
  genre: string | null;
  publication_date: string | null;
  status: string;
  mrp: number | null;
  author_royalty_per_copy: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date: string | null;
  print_partner: string | null;
  available_on: string[];
}

interface SampleAuthor {
  author_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joined_date: string;
  books: SampleBook[];
}

interface SampleData {
  authors: SampleAuthor[];
}

async function seed() {
  try {
    await connectDB();

    const seedPath = path.join(__dirname, "bookleaf_sample_data.json");
    const raw = fs.readFileSync(seedPath, "utf-8");
    const data: SampleData = JSON.parse(raw);

    console.log("Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Author.deleteMany({}),
      Admin.deleteMany({}),
      Book.deleteMany({}),
    ]);

    console.log("Creating admin users...");
    const adminPassword = await hashPassword("Admin@123");

    const adminUser1 = await User.create({
      name: "BookLeaf Admin",
      email: "admin@bookleaf.com",
      password: adminPassword,
      role: "admin",
    });

    const adminUser2 = await User.create({
      name: "Ops Manager",
      email: "ops@bookleaf.com",
      password: adminPassword,
      role: "admin",
    });

    await Admin.create({
      userId: adminUser1._id,
      name: "BookLeaf Admin",
      email: "admin@bookleaf.com",
    });

    await Admin.create({
      userId: adminUser2._id,
      name: "Ops Manager",
      email: "ops@bookleaf.com",
    });

    console.log("Creating authors and books...");

    for (const author of data.authors) {
      const authorPassword = await hashPassword("Author@123");

      const user = await User.create({
        name: author.name,
        email: author.email,
        password: authorPassword,
        role: "author",
      });

      const createdAuthor = await Author.create({
        userId: user._id,
        authorId: author.author_id,
        name: author.name,
        email: author.email,
        phone: author.phone,
        city: author.city,
        joinedDate: new Date(author.joined_date),
      });

      for (const book of author.books) {
        await Book.create({
          authorMongoId: createdAuthor._id,
          bookId: book.book_id,
          title: book.title,
          isbn: book.isbn,
          genre: book.genre,
          publicationDate: book.publication_date
            ? new Date(book.publication_date)
            : null,
          status: book.status,
          mrp: book.mrp,
          authorRoyaltyPerCopy: book.author_royalty_per_copy,
          totalCopiesSold: book.total_copies_sold,
          totalRoyaltyEarned: book.total_royalty_earned,
          royaltyPaid: book.royalty_paid,
          royaltyPending: book.royalty_pending,
          lastRoyaltyPayoutDate: book.last_royalty_payout_date
            ? new Date(book.last_royalty_payout_date)
            : null,
          printPartner: book.print_partner,
          availableOn: book.available_on || [],
        });
      }
    }

    console.log("Seed completed successfully");
    console.log("Admin login:");
    console.log("admin@bookleaf.com / Admin@123");
    console.log("ops@bookleaf.com / Admin@123");
    console.log("Author login example:");
    console.log("priya.sharma@email.com / Author@123");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
