import Order from "./Order.js";

class OrderService {
	async create(order) {
		const createdOrder = await Order.create(order);
		return createdOrder;
	}

	async getAll() {
		const orders = await Order.find();
		return orders;
	}
	async update(order) {
		if (!order._id) {
			throw new Error("не указан ID");
		}
		const updatedOrder = await Order.findByIdAndUpdate(order._id, order, {
			new: true,
		});
		return updatedOrder;
	}
}

export default new OrderService();
