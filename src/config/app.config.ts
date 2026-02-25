import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT:                  Joi.number().default(3000),
  API_KEY:               Joi.string().required(),       
  SHARE_DECIMAL_PLACES:  Joi.number().integer().min(0).max(10).default(3),
  NODE_ENV:              Joi.string().valid('development','production','test').default('development'),
});

export const AppConfig = () => ({
  port:               parseInt(process.env.PORT ?? '3000', 10),
  apiKey:             process.env.API_KEY,
  shareDecimalPlaces: parseInt(process.env.SHARE_DECIMAL_PLACES ?? '3', 10),
  fixedStockPrice:    100,
  nodeEnv:            process.env.NODE_ENV ?? 'development',
});
