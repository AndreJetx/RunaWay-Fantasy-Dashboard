import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
}

const client = postgres(connectionString);

async function main() {
    try {
        console.log('Reading migration file...');
        const migrationPath = path.join(process.cwd(), 'migrations', '0000_create_homebrew_content.sql');

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at: ${migrationPath}`);
        }

        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await client.unsafe(migrationSql);

        console.log('Migration executed successfully!');
    } catch (error) {
        console.error('Error executing migration:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
