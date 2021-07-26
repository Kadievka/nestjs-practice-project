import * as mongoose from 'mongoose';
import * as mongooseBcrypt from 'mongoose-bcrypt';
import * as mongoosePaginate from 'mongoose-paginate';

export const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    firstName: String,
    lastName: String,
    cellphone: String,
    address: String,
  },
  {
    timestamps: true,
  },
);

UserSchema.plugin(mongooseBcrypt);
UserSchema.plugin(mongoosePaginate);
export interface User extends mongoose.Document {
  id: string;
  email: string;
  password: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  cellphone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  verifyPassword;
}
