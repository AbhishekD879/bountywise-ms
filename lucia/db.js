import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";


export const pool = new pg.Pool({
    connectionString:"postgresql://postgres:1xmKjd0lXRm5UjbE@jovially-preferable-darter.data-1.use1.tembo.io:5432/bountywise"
});

const db = drizzle(pool, { schema: schema });
export default db;
