import * as Joi from '@hapi/joi';

const profilePhotoSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  size: Joi.number().required(),
  file: Joi.string().required(),
});

export { profilePhotoSchema };
