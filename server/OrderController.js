import OrderService from "./OrderService.js";

class OrderController {
	async create(req, res) {
		try {
			const order = await OrderService.create(req.body);
			res.json(order);
		} catch (e) {
			res.status(500).json(e);
		}
	}
	async update(req, res) {
		try {
			const updatedOrder = await OrderService.update(req.body);
			return res.json(updatedOrder);
		} catch (e) {
			res.status(500).json(e.message);
		}
	}
	async getAll(req, res) {
		try {
			const orders = await OrderService.getAll();
			return res.json(orders);
		} catch (e) {
			res.status(500).json(e);
		}
	}
}

export default new OrderController();
