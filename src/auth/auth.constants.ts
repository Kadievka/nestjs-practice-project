// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const authConstants = {
  secret: process.env.JWT_SECRET,
};
