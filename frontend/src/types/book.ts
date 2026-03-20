export interface Book {
  _id: string;
  title: string;
  bookId?: string;
  isbn?: string;
  genre?: string;
  status?: string;
  mrp?: number;
  language?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BooksResponse {
  success: boolean;
  message: string;
  data: Book[];
}
