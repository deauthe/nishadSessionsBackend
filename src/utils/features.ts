import { error, log } from "console";
import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";
export const connectDB = (uri: string) => {
	mongoose
		.connect(uri, {
			dbName: "nishad_sessions_test",
		})
		.then((c) => {
			console.log("db connected to ", c.connection.host);
		})
		.catch((error) => console.log(error));
};

export const invalidatesCache = async ({
	product = false,
	order = false,
	admin = false,
	userId,
	orderId,
	productId,
}: InvalidateCacheProps) => {
	if (product) {
		const productKeys: string[] = ["all-products", "genres", "latest-products"];

		if (typeof productId === "string") productKeys.push(`product-${productId}`);

		if (typeof productId === "object")
			//arrays are objects in js
			productId.forEach((i) => productKeys.push(`product-${i}`));

		myCache.del(productKeys);
	}
	if (order) {
		const ordersKeys: string[] = [
			"all-orders",
			`my-orders-${userId}`,
			`order-${orderId}`,
		];

		myCache.del(ordersKeys);
	}
	if (admin) {
		myCache.del([
			"admin-stats",
			"admin-pie-charts",
			"admin-bar-charts",
			"admin-line-charts",
		]);
	}
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
	for (let i = 0; i < orderItems.length; i++) {
		const order = orderItems[i];
		const product = await Product.findById(order.productId);
		if (!product) throw new Error("product not found");
		product.stock -= order.quantity;
		await product.save();
	}
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
	if (lastMonth === 0) return thisMonth * 100;

	const percentage = ((thisMonth - lastMonth) / lastMonth) * 100;

	return percentage.toFixed(0);
};

export const getGenres = async ({
	genres,
	productsCount,
}: {
	genres: string[];
	productsCount: number;
}) => {
	const categoriesCountPromise = genres.map((genre) =>
		Product.countDocuments({ genre })
	);

	const categoriesCount = await Promise.all(categoriesCountPromise);

	const categoryCount: Record<string, number>[] = [];

	genres.forEach((genre, i) => {
		categoryCount.push({
			[genre]: Math.round((categoriesCount[i] / productsCount) * 100),
		});
	});

	return categoryCount;
};
interface MyDocument extends Document {
	createdAt: Date;
	discount?: number;
	total?: number;
}
type FuncProps = {
	length: number;
	docArr: MyDocument[];
	today: Date;
	property?: "discount" | "total";
};

export const getChartData = ({
	length,
	docArr,
	today,
	property,
}: FuncProps) => {
	const data: number[] = new Array(length).fill(0);

	docArr.forEach((i) => {
		const creationDate = i.createdAt;
		const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

		if (monthDiff < length) {
			if (property) {
				data[length - monthDiff - 1] += i[property]!;
			} else {
				data[length - monthDiff - 1] += 1;
			}
		}
	});

	return data;
};
