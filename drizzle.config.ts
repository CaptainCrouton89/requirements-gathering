import * as path from "path";

const DATA_DIR = process.env.DATA_DIR || "/Users/silasrhyneer/AI/requirements";
const DB_PATH = path.join(DATA_DIR, "requirements.db");

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
};
