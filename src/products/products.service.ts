import { Injectable, NotFoundException } from '@nestjs/common';

import { Product } from './product.model';

@Injectable()
export class ProductsService {
  products: Product[] = [];

  insertProduct(title: string, description: string, price: number): string {
    const prodId = Math.random().toString();
    const newProduct = new Product(prodId, title, description, price);
    this.products.push(newProduct);
    return prodId;
  }

  getProducts() {
    return [...this.products];
  }

  private findProduct(id: string): [Product, number] {
    const productIndex = this.products.findIndex((p) => p.id === id);
    const product = this.products[productIndex];
    if (!product) {
      throw new NotFoundException('Could not find product with id ' + id);
    }
    return [product, productIndex];
  }

  getProductById(id: string): Product {
    const product = this.findProduct(id)[0];
    return { ...product };
  }

  updateProduct(
    id: string,
    title: string,
    description: string,
    price: number,
  ): Product {
    const [product, index] = this.findProduct(id);
    product.title = title ? title : product.title;
    product.description = description ? description : product.description;
    product.price = price ? price : product.price;
    this.products[index] = product;
    return { ...product };
  }

  removeProductById(id: string): string {
    const [product, index] = this.findProduct(id);
    this.products.splice(index, 1);
    return `Removed product: ${product.id}`;
  }
}
