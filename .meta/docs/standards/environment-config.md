# Environment Configuration Standards

## Rules

1. **Never** use `process.env` directly in services or controllers.
2. Always inject `ConfigService` and use `get<T>('KEY')`.
3. Required variables fail startup with a clear error message.
4. Optional variables have documented defaults.

---

## Setup

Use NestJS `ConfigModule` globally:

```typescript
// src/config/env.validation.ts
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
```

```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true, allowUnknown: true },
    }),
  ],
})
export class AppModule {}
```

---

## Access Pattern

```typescript
@Injectable()
export class NineRouterService {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('NINE_ROUTER_URL');
  }
}
```

---

## Config Groups

| Domain | Variables |
|--------|-----------|
| server | `PORT`, `NODE_ENV` |
| database | `DATABASE_URL` |
| redis | `REDIS_HOST`, `REDIS_PORT` |
| auth | `AUTH_TOKEN` |
| telegram | `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ALLOWED_USER_IDS` |
| nineRouter | `NINE_ROUTER_URL`, `NINE_ROUTER_API_KEY` |
| hermes | `HERMES_URL` |
| github | `GITHUB_TOKEN`, `GITHUB_REPO` |
| timezone | `TZ` |

---

## Defaults

| Variable | Default | Required |
|----------|---------|----------|
| `PORT` | `3000` | No |
| `NODE_ENV` | `development` | No |
| `DATABASE_URL` | — | Yes |
| `REDIS_HOST` | `localhost` | No |
| `REDIS_PORT` | `6379` | No |
| `AUTH_TOKEN` | — | Yes |
| `TELEGRAM_TOKEN` | — | Yes |
| `TELEGRAM_CHAT_ID` | — | Yes |
| `TELEGRAM_ALLOWED_USER_IDS` | — | Yes |
| `NINE_ROUTER_URL` | — | Yes |
| `NINE_ROUTER_API_KEY` | — | Yes |
| `HERMES_URL` | `http://localhost:8080` | No |
| `GITHUB_TOKEN` | — | Yes |
| `GITHUB_REPO` | — | Yes |
| `TZ` | `Asia/Jakarta` | No |

---

## Startup Behavior

If a required variable is missing:

```text
Error: Config validation error: "DATABASE_URL" is required
```

Application exits immediately. No silent misconfiguration.
