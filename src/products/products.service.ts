import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly ProductModel: Model<Product>,
  ) {}

  async insertProduct(product: {
    title: string;
    description: string;
    price: number;
  }): Promise<string> {
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

  async findProduct(id): Promise<Product> {
    const product = await this.ProductModel.findById(id);
    if (!product) {
      throw new NotFoundException('Can not find product with id ' + id);
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

  async updateProduct(
    id: string,
    requestProduct: { title: string; description: string; price: number },
  ): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    const product = await this.findProduct(id);
    if (requestProduct.title) product.title = requestProduct.title;
    if (requestProduct.price) product.price = requestProduct.price;
    if (requestProduct.description)
      product.description = requestProduct.description;
    await product.save();
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async removeProductById(id: string): Promise<{ id: string }> {
    await this.getProductById(id);
    await this.ProductModel.findByIdAndDelete(id);
    return { id };
  }
}
