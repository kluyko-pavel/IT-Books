import mongoose from "mongoose";

const Order = new mongoose.Schema({
	client: { type: String, required: true },
	isbn13: { type: String, required: true },
	price: { type: Number, required: true },
	date: { type: String, required: true },
	status: { type: String, required: true },
});

export default mongoose.model("Order", Order);
