import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/productModel.js";
import { Request, Response, NextFunction } from "express";
import { rm } from "fs";
import { ProductBaseQuery, SearchRequestQuery } from "../types/types.js";
import { faker } from "@faker-js/faker";
import { myCache } from "../app.js";
import { invalidatesCache } from "../utils/features.js";

//no need of defining types for req,res,next here as we already defined a type for the kind of
//functions tryCatch takes in as a parameter
export const createNewProduct = TryCatch(
	//wrapper function
	async (req, res, next) => {
		let {
			name,
			usual_price,
			early_bird_price,
			stock,
			artists,
			date,
			genre,
			happened,
			venue,
		} = req.body;

		const photo = req.file;

		// const product = await Product.find({ name: name });

		// if (product) {
		// 	console.log("product : ", product);
		// 	next(new ErrorHandler("Product already exists", 400));
		// }
		if (!photo) {
			return next(new ErrorHandler("please provide a photo", 400));
		}
		if (
			!usual_price ||
			!stock ||
			!name ||
			!artists ||
			!date ||
			!genre ||
			!venue
		) {
			//deleting the photo as multer would already have uploaded
			rm(photo.path, () => {
				console.log("deleted");
			});
			return next(new ErrorHandler("please enter all fields", 400));
		}
		if (!early_bird_price) {
			early_bird_price = usual_price * 0.8;
		}

		const newProduct = await Product.create({
			name,
			photo: photo.path,
			usualPrice: usual_price,
			earlyBirdPrice: early_bird_price,
			stock,
			artists,
			date,
			genre,
			happened: happened ? happened : false,
			venue,
		});

		await invalidatesCache({ product: true });

		return res.status(201).json({
			success: true,
			message: "Product created",
			Product: newProduct,
		});
	}
);

export const updateProduct = TryCatch(
	//wrapper function
	async (req, res, next) => {
		const { id } = req.params;
		const {
			name,
			artists,
			early_bird_price,
			usual_price,
			stock,
			date,
			genre,
			venue,
		} = req.body;
		const photo = req.file;
		const product = await Product.findById(id);

		if (!product) {
			return next(new ErrorHandler("product doesn't exist", 400));
		}
		if (photo) {
			rm(product.photo, () => {
				console.log("old photo deleted");
			});
			product.photo = photo.path;
		}
		if (name) {
			product.name = name;
		}
		if (early_bird_price) {
			product.earlyBirdPrice = early_bird_price;
		}
		if (usual_price) {
			product.usualPrice = usual_price;
		}
		if (stock) {
			product.stock = stock;
		}
		if (date) {
			product.date = date;
		}
		if (genre) {
			product.genre = genre;
		}
		if (venue) {
			product.venue = venue;
		}
		if (artists) {
			product.artists = artists;
		}
		await product.save();

		return res.status(201).json({
			success: true,
			message: "Product updated",
			Product: product,
		});
	}
);

//TODO: Revalidate on New, Update, Delete Product
export const getAllProducts = TryCatch(async (req, res, next) => {
	let products;

	if (myCache.has("all-products"))
		//don't fetch again if you already have it
		products = JSON.parse(myCache.get("all-products") as string);
	else {
		const products = await Product.find({});
		myCache.set("all-products", JSON.stringify(products));
		//setting cache for fetched functions
	}

	res.status(200).json({
		success: true,
		result: products.length,
		Products: products,
	});
});

export const getProduct = TryCatch(async (req, res, next) => {
	const _id = req.params.id;
	const product = await Product.findById(_id);

	if (!product) {
		return next(new ErrorHandler("invalid Id", 400));
	}

	res.status(200).json({
		success: true,
		Product: product,
	});
});

export const deleteProduct = TryCatch(async (req, res, next) => {
	const _id = req.params.id;
	const product = await Product.findById(_id);

	if (!product) {
		return next(new ErrorHandler("invalid Id", 400));
	}

	await product.deleteOne();

	return res.status(200).json({
		success: true,
		message: "Product deleted successfully",
		Product: product,
	});
});

export const getLatestProducts = TryCatch(async (req, res, next) => {
	let latestProducts;
	if (myCache.has("latest-products"))
		//don't fetch again if you already have it
		latestProducts = JSON.parse(myCache.get("latest-products") as string);
	else {
		const latestProdcusts = await Product.find({}).sort({ createdAt: -1 });
		myCache.set("latest-products", JSON.stringify(latestProdcusts));
		//setting cache for fetched functions
	}

	res.status(200).json({
		success: true,
		products: latestProducts,
	});
});

export const getAllGenres = TryCatch(async (req, res, next) => {
	let genres;

	if (myCache.has("genres"))
		//don't fetch again if you already have it
		genres = JSON.parse(myCache.get("genres") as string);
	else {
		const genres = await Product.distinct("genre");
		myCache.set("genres", JSON.stringify(genres));
		//setting cache for fetched functions
	}

	res.status(200).json({
		success: true,
		genre: genres,
	});
});

export const purchaseProduct = TryCatch(async (req, res, next) => {
	const { product_id } = req.query;
});

export const filterProducts = TryCatch(
	async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
		const { search, sort, genre, price } = req.query;
		const page = Number(req.query.page) || 1;

		const limit: number = Number(process.env.PRODUCT_PER_PAGE) || 8;
		const skip: number = limit * (page - 1);
		const baseQuery: ProductBaseQuery = {};

		if (search) {
			baseQuery.name = {
				$regex: search, //matches even if it partially exists
				$options: "i", //case insensitive matching
			};
		}
		if (genre) {
			baseQuery.genre = genre;
		}
		if (price) {
			baseQuery.usualPrice = {
				$lte: Number(price),
			};
		}

		const productsPromise = Product.find(baseQuery)
			.sort(sort ? { usualPrice: sort === "asc" ? 1 : -1 } : { date: 1 })
			.limit(limit)
			.skip(skip ? skip : 0);

		const allFilteredProductsPromise = Product.find(baseQuery);

		const [products, allFilteredProducts] = await Promise.all([
			productsPromise,
			allFilteredProductsPromise,
		]);

		const totalPages = Math.ceil(allFilteredProducts.length / limit);
		const totalProducts = allFilteredProducts.length;
		const currentPage = skip ? Math.floor(skip / limit) : 0;
		res.status(200).json({
			success: true,
			result: products.length,
			results: totalProducts,
			pages: totalPages,
			currentPage,
			Products: products,
		});
	}
);

const generateRandomProducts = async (count: number = 10) => {
	const products = [];

	for (let i = 0; i < count; i++) {
		const product = {
			name: faker.music.songName(),
			photo: "uploads/0dde7333-1646-41a0-98d7-586c46448d23.png",
			usualPrice: faker.commerce.price({ min: 500, max: 2000, dec: 0 }),
			earlyBirdPrice: faker.commerce.price({ min: 300, max: 1000, dec: 0 }),
			artists: faker.person.fullName(),
			stock: faker.commerce.price({ min: 20, max: 100, dec: 0 }),
			genre: faker.music.genre(),
			date: new Date(faker.date.future()),
			venue: faker.location.city(),
		};
		products.push(product);
	}
	await Product.create(products);
	console.log("random products generated");
};

const deleteAllProducts = async () => {
	await Product.deleteMany({});
	console.log("all products deleted");
};
