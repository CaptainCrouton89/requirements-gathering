import * as path from "path";

export const DATA_DIR = process.env.DATA_DIR || "/Users/silasrhyneer/AI/db";
export const DB_PATH = path.join(DATA_DIR, "db", "requirements.db");

export default {
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
};
