import { plainToInstance } from 'class-transformer';
import { IsEnum, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  /**
   * Fastify config
   */
  @IsString()
  PORT: string;

  /**
   * Postgres
   */
  @IsString()
  PG_DATABASE_URL: string;

  /**
   * Redis
   */
  @IsString()
  REDIS_DATABASE_URL: string;

  /**
   * Sentry
   */
  @IsString()
  SENTRY_DSN: string;

  /**
   * User authentication
   */
  @IsString()
  NEXTAUTH_URL: string;

  @IsString()
  NEXTAUTH_SECRET: string;

  /**
   * Transactional email
   */
  @IsString()
  @IsOptional()
  EMAIL_SERVER_USER: string;

  @IsString()
  @IsOptional()
  EMAIL_SERVER_PASSWORD: string;

  @IsString()
  @IsOptional()
  EMAIL_SERVER_HOST: string;

  @IsString()
  @IsOptional()
  EMAIL_SERVER_PORT: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM: string;

  /**
   * App config variables
   */
  @IsString()
  APP_URL: string;

  /**
   * Plausible
   */
  @IsString()
  PLAUSIBLE_API_TOKEN: string;

  @IsString()
  PLAUSIBLE_SITE_ID: string;

  /**
   * PostHog
   */
  @IsString()
  @IsOptional()
  POSTHOG_API_KEY: string;

  /**
   * Vercel
   */
  @IsString()
  @IsOptional()
  VERCEL_TEAM_ID: string;

  @IsString()
  @IsOptional()
  VERCEL_PROJECT_ID: string;

  @IsString()
  @IsOptional()
  VERCEL_BEARER_TOKEN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
