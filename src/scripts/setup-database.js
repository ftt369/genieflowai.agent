// ES module version of the database setup script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL and service role key are required. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the schema.sql file
const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function setupDatabase() {
  console.log('Setting up database schema...');
  
  try {
    // Split the schema into separate statements
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim() !== '')
      .map(stmt => stmt.trim() + ';');
    
    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`Error executing SQL statement: ${error.message}`);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Database schema setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database schema:', error);
    process.exit(1);
  }
}

// Create RPC function to execute SQL if it doesn't exist
async function createExecSqlFunction() {
  console.log('Creating exec_sql function...');
  
  const functionDefinition = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  const { error } = await supabase.rpc('exec_sql', { 
    sql: functionDefinition 
  }).catch(() => {
    // If the function doesn't exist yet, create it directly
    return supabase.from('_rpc').select().rpc('exec_sql', { 
      sql: functionDefinition 
    });
  });
  
  if (error) {
    console.error('Error creating exec_sql function:', error);
    process.exit(1);
  }
  
  console.log('exec_sql function created successfully.');
}

// Main function
async function main() {
  try {
    // Create the exec_sql function first
    await createExecSqlFunction();
    
    // Then set up the database schema
    await setupDatabase();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 