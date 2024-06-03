import BookService from "./BookService.js";

class BookController {
	async create(req, res) {
		try {
			const booksCategory = await BookService.create(req.body);
			res.json(booksCategory);
		} catch (e) {
			res.status(500).json(e);
		}
	}

	async getAll(req, res) {
		try {
			const booksCategories = await BookService.getAll();
			return res.json(booksCategories);
		} catch (e) {
			res.status(500).json(e);
		}
	}
	async getOne(req, res) {
		try {
			const booksCategory = await BookService.getOne(req.params.id);
			return res.json(booksCategory);
		} catch (e) {
			res.status(500).json(e);
		}
	}
	async update(req, res) {
		try {
			const updatedBooksCategory = await BookService.update(req.body);
			return res.json(updatedBooksCategory);
		} catch (e) {
			res.status(500).json(e.message);
		}
	}
	async delete(req, res) {
		try {
			const booksCategory = await BookService.delete(req.params.id);
			return res.json(booksCategory);
		} catch (e) {
			res.status(500).json(e);
		}
	}
}

export default new BookController();
