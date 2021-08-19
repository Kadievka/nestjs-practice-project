import * as mongoose from 'mongoose';

export const ImageSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: Number,
  path: String,
  module: String,
});

export interface Image extends mongoose.Document {
  name: string;
  type: string;
  size: number;
  file?: string;
  path?: string;
  module?: string;
}
