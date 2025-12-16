import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const EnvSchema = Type.Object({
  DB_HOST: Type.String(),
  DB_PORT: Type.String(),
  DB_USER: Type.String(),
  DB_PASSWORD: Type.String(),
  DB_NAME: Type.String(),
  DATABASE_URL: Type.String(),
  GOOGLE_CLIENT_ID: Type.Optional(Type.String()),
  GOOGLE_CLIENT_SECRET: Type.Optional(Type.String()),
  GITHUB_CLIENT_ID: Type.Optional(Type.String()),
  GITHUB_CLIENT_SECRET: Type.Optional(Type.String()),
  JWT_SECRET: Type.String(),
  MINIO_ENDPOINT: Type.String(),
  MINIO_ROOT_USER: Type.String(),
  MINIO_ROOT_PASSWORD: Type.String(),
  MINIO_BUCKET: Type.String(),
  API_URL: Type.String(),
  FRONTEND_URL: Type.String(),
  MINIO_PUBLIC_URL: Type.String(),
});

const env = process.env;

if (!Value.Check(EnvSchema, env)) {
  const errors = [...Value.Errors(EnvSchema, env)];
  console.error("Invalid environment variables:", errors);
  throw new Error("Invalid environment variables");
}

export const config = env as unknown as typeof EnvSchema.static;
