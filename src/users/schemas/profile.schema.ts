import * as Joi from '@hapi/joi';

const profileSchema = Joi.object({
  nickname: Joi.string().optional().allow(''),
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
  cellphone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
});

export { profileSchema };
