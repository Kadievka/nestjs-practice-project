import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';
import productErrors from './product.errors';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly ProductModel: Model<Product>,
  ) {}

  async insertProduct(
    product: {
      title: string;
      description: string;
      price: number;
      userId: string;
    },
    userId: string,
  ): Promise<string> {
    product.userId = userId;
    const newProduct = await this.ProductModel.create(product);
    return newProduct.id;
  }

  async getProducts(): Promise<
    {
      id: string;
      title: string;
      description: string;
      price: number;
    }[]
  > {
    const products = await this.ProductModel.find();
    return products.map((product) => ({
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    }));
  }

  async findProduct(id: string): Promise<Product> {
    const product = await this.ProductModel.findById(id);
    if (!product) {
      throw new NotFoundException(
        `${productErrors.CAN_NOT_FIND_PRODUCT_ID} ${id}`,
      );
    }
    return product;
  }

  async getProductById(id: string): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    const product = await this.findProduct(id);
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async findProductByIdAndUserId(id: string, userId: string): Promise<Product> {
    const product = await this.findProduct(id);
    if (product.userId != userId) {
      throw new ForbiddenException(productErrors.PRODUCT_DOES_NOT_BELONG_USER);
    }
    return product;
  }

  async updateProduct(
    id: string,
    requestProduct: { title: string; description: string; price: number },
    userId: string,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    const product = await this.findProductByIdAndUserId(id, userId);
    Object.assign(product, requestProduct);
    await product.save();
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async removeProductById(id: string, userId: string): Promise<{ id: string }> {
    await this.findProductByIdAndUserId(id, userId);
    await this.ProductModel.findByIdAndDelete(id);
    return { id };
  }
}
