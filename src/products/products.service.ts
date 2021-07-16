import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(
    title: string,
    description: string,
    price: number,
  ): Promise<string> {
    const newProduct = new this.productModel({ title, description, price });
    const result = await newProduct.save();
    return result.id;
  }

  async getProducts() {
    const products = await this.productModel.find();
    return products.map((product) => ({
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    }));
  }

  async getProductById(id: string) {
    const product = await this.productModel.findById(id);
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    id: string,
    title: string,
    description: string,
    price: number,
  ) {
    const product = await this.productModel.findById(id);
    product.title = title ? title : product.title;
    product.description = description ? description : product.description;
    product.price = price ? price : product.price;
    await product.save();
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async removeProductById(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    return { removedProductId: product._id };
  }
}
