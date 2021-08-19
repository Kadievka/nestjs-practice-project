import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Image } from './image.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel('Image') private readonly ImageModel: Model<Image>,
  ) {}
  randomstring = require('randomstring');

  FILE_DIRECTORY = process.env.FILE_DIRECTORY;

  absolutePath = `${__dirname}/../..`;

  getFilePath(module: string): string {
    return `${this.FILE_DIRECTORY}/${module}`;
  }

  getType(type: string): string {
    return type.split('/')[1];
  }

  async saveImageProcess(image: Image, module: string): Promise<Image> {
    const filePath = this.getFilePath(module);
    //Example: public/uploads/USERS

    const type = this.getType(image.type);
    //Example: jpeg

    const fileName = await this.getUniqueName(filePath, type);
    //Example: 13GF64VLEu7SYNv

    const path = await this.getPath(filePath, fileName, type);
    //Example: <dirname>/../../public/uploads/USERS/13GF64VLEu7SYNv.jpeg

    const fileBase64 = image.file.slice(image.file.indexOf(',') + 1);
    const buffer = Buffer.from(fileBase64, 'base64');
    //Example: <Buffer ff d8 ... 241952 more bytes>

    await this.saveFile(path, buffer);

    image.path = `${process.env.UPLOADS_DIRECTORY}/${module}/${fileName}.${type}`;
    return this.saveImage(image);
  }

  saveImage(image: Image) {
    return this.ImageModel.create(image);
  }

  async saveFile(path: string, buffer: Buffer): Promise<void> {
    await fs.promises.appendFile(path, buffer);
  }

  async getUniqueName(filePath: string, type: string) {
    let fileName = this.randomstring.generate({ length: 15 });
    const path = this.getPath(filePath, fileName, type);
    if (await this.checkFileExists(path)) {
      fileName = await this.getUniqueName(filePath, type);
    }
    return fileName;
  }

  getPath(filePath: string, fileName: string, type: string): string {
    return `${this.absolutePath}/${filePath}/${fileName}.${type}`;
  }

  async checkFileExists(path: string) {
    try {
      await fs.promises.access(path, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
}
