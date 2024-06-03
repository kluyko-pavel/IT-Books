import BooksCategory from "./Book.js";

class BookService {
	async create(booksCategory) {
		const createdBooksCategory = await BooksCategory.create(booksCategory);
		return createdBooksCategory;
	}

	async getAll() {
		const booksCategories = await BooksCategory.find();
		return booksCategories;
	}
	async getOne(id) {
		if (!id) {
			throw new Error("не указан ID");
		}
		const booksCategory = await BooksCategory.findById(id);
		return booksCategory;
	}

	async update(booksCategory) {
		if (!booksCategory._id) {
			throw new Error("не указан ID");
		}
		const updatedBooksCategory = await BooksCategory.findByIdAndUpdate(
			booksCategory._id,
			booksCategory,
			{
				new: true,
			}
		);
		return updatedBooksCategory;
	}

	async delete(id) {
		if (!id) {
			throw new Error("не указан ID");
		}
		const booksCategory = await BooksCategory.findByIdAndDelete(id);
		return booksCategory;
	}
}

export default new BookService();
