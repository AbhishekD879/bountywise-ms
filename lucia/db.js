import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, { schema: schema });
export default db;
