import * as mongoose from 'mongoose';
import * as mongooseBcrypt from 'mongoose-bcrypt';

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  firstName: String,
  lastName: String,
  cellphone: String,
  address: String,
});

UserSchema.plugin(mongooseBcrypt);

export interface User extends mongoose.Document {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cellphone: string;
  address: string;
  verifyPassword;
}
