import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT_CORE: Joi.number().default(3001),
  PORT_CONSOLE: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  AUTH_TOKEN: Joi.string().required(),
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_ALLOWED_USER_IDS: Joi.string().required(),
  NINE_ROUTER_URL: Joi.string().uri().required(),
  NINE_ROUTER_API_KEY: Joi.string().required(),
  GITHUB_REPO: Joi.string().default('Schitzos/SchitzoNeuralOS'),
  TZ: Joi.string().default('Asia/Jakarta'),
});