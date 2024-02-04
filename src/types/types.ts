import { Request, Response, NextFunction } from "express";

export interface NewUserRequestBody {
	_id: string;
	name: string;
	email: string;
	photo: string;
}

//TODO:
export interface Artist {
	_id: string;
	photos: {
		type: Array<String>;
	};
}

// export interface UserType {
// 	_id: string;
// 	name: string;
// 	email: string;
// 	photo: string;
// 	role: "user" | "admin";
// 	createdAt: Date;
// 	updatedAt: Date;
// 	__v: number;
// }

export type ControllerType = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
	search?: string;
	price?: string;
	genre?: string;
	sort?: string;
	page?: string;
};

export interface ProductBaseQuery {
	name?: {
		$regex: string; //will match even if the name partially contains the search parameter
		$options: string; //case insensitive
	};
	usualPrice?: {
		$lte: number;
	};
	earlyBirdPrice?: {
		$lte: number;
	};
	genre?: string;
}

export type InvalidateCacheProps = {
	product?: boolean;
	order?: boolean;
	admin?: boolean;
	productId?: string | string[];
	userId?: string;
	orderId?: string | string[];
};

export type OrderItemType = {
	name: string;
	photo: string;
	price: number;
	quantity: number;
	productId: string;
};

export interface newOrderRequestBody {
	user: string;
	tax: number;
	discount: number;
	quantity: number;
	subtotal: number;
	total: number;
	orderItems: OrderItemType[];
}
