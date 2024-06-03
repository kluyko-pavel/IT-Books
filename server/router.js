import Router from "express";
import BookController from "./BookController.js";
import OrderController from "./OrderController.js";
const router = new Router();

router.post("/booksCategories", BookController.create);
router.get("/booksCategories", BookController.getAll);
router.get("/booksCategories/:id", BookController.getOne);
router.put("/booksCategories", BookController.update);
router.delete("/booksCategories/:id", BookController.delete);

router.post("/orders", OrderController.create);
router.get("/orders", OrderController.getAll);
router.put("/orders", OrderController.update);

export default router;
