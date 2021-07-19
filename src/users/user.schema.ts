import * as Joi from '@hapi/joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().min(8).required().valid(Joi.ref('password')),
});

export default userSchema;
