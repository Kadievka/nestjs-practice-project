import * as Joi from '@hapi/joi';

const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
});

export default productSchema;
