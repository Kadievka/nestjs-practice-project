import * as Joi from '@hapi/joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
});

export { registerSchema };
