import * as Joi from '@hapi/joi';

const profileSchema = Joi.object({
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
  cellphone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
});

export default profileSchema;
