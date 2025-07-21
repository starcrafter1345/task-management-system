import "dotenv/config.js";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export default {
	port: parseInt(process.env.PORT ?? "3000"),
  privateKey: requireEnv("PRIVATE_KEY")
};

console.log("env loaded");