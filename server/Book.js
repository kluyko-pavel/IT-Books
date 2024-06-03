import mongoose from "mongoose";

const Sale = new mongoose.Schema({
	month: { type: String, required: false },
	count: { type: Number, required: false },
});

const Book = new mongoose.Schema({
	title: { type: String, required: true },
	subtitle: { type: String, required: true },
	authors: { type: String, required: true },
	publisher: { type: String, required: true },
	isbn13: { type: String, required: true },
	pages: { type: Number, required: true },
	year: { type: String, required: false },
	rating: { type: Number, required: false },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	image: { type: String, required: false },
	status: { type: String, required: true },
	sales: [Sale],
});

const BooksCategory = new mongoose.Schema({
	title: { type: String, required: true },
	subtitle: { type: String, required: true },
	image: { type: String, required: false },
	description: { type: String, required: true },
	createdDate: { type: String, required: false },
	books: [Book],
	sales: [Sale],
});

export default mongoose.model("BooksCategory", BooksCategory);
