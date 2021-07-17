import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';
import { threadId } from 'worker_threads';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(product: {
    title: string;
    description: string;
    price: number;
  }): Promise<string> {
    const newProduct = await this.productModel.create(product);
    return newProduct.id;
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

  async getProductById(id: string): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Can not find product with id ' + id);
    }
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
  ) {
    const product = await this.getProductById(id);
    console.log(product);
    if (requestProduct.title) product.title = requestProduct.title;
    if (requestProduct.price) product.price = requestProduct.price;
    if (requestProduct.description) product.description = requestProduct.description;
    console.log(product);
    await this.productModel.findByIdAndUpdate(id, product);
    return product;
  }

  async removeProductById(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    return { removedProductId: product._id };
  }
}
