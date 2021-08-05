import * as Joi from '@hapi/joi';

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().min(8).required().valid(Joi.ref('password')),
});

export default resetPasswordSchema;
