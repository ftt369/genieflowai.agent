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
  console.error('\x1b[31mError: Supabase URL and service role key are required.\x1b[0m');
  console.error('Please ensure your .env.local file contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', 'Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the schema.sql file
const schemaPath = path.join(__dirname, '..', 'db', 'complete-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function setupDatabase() {
  console.log('\x1b[36m%s\x1b[0m', 'Setting up database schema...');
  
  try {
    // Split the schema into separate statements
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim() !== '')
      .map(stmt => stmt.trim() + ';');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`\x1b[31mError executing SQL statement ${i + 1}/${statements.length}: ${error.message}\x1b[0m`);
          console.error('Statement:', statement);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write(`\rProgress: ${successCount}/${statements.length} statements executed successfully`);
        }
      } catch (error) {
        console.error(`\x1b[31mError executing SQL statement ${i + 1}/${statements.length}: ${error.message}\x1b[0m`);
        errorCount++;
      }
    }
    
    console.log('\n');
    if (errorCount > 0) {
      console.log(`\x1b[33mDatabase schema setup completed with ${errorCount} errors.\x1b[0m`);
      console.log(`\x1b[32m${successCount} statements executed successfully.\x1b[0m`);
    } else {
      console.log('\x1b[32mDatabase schema setup completed successfully.\x1b[0m');
    }
  } catch (error) {
    console.error('\x1b[31mError setting up database schema:\x1b[0m', error);
    process.exit(1);
  }
}

// Create RPC function to execute SQL if it doesn't exist
async function createExecSqlFunction() {
  console.log('\x1b[36m%s\x1b[0m', 'Creating exec_sql function...');
  
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
  
  try {
    const { error } = await supabase.rpc('exec_sql', { 
      sql: functionDefinition 
    }).catch(() => {
      // If the function doesn't exist yet, create it directly
      return supabase.from('_rpc').select().rpc('exec_sql', { 
        sql: functionDefinition 
      });
    });
    
    if (error) {
      console.error('\x1b[31mError creating exec_sql function:\x1b[0m', error);
      
      // Try to create the function with a direct query
      try {
        console.log('\x1b[36m%s\x1b[0m', 'Attempting alternative approach to create exec_sql function...');
        const { error } = await supabase.from('_rpc').select().rpc('exec_sql', { 
          sql: functionDefinition 
        });
        
        if (error) {
          throw error;
        }
        
        console.log('\x1b[32mexec_sql function created successfully with alternative approach.\x1b[0m');
        return;
      } catch (error) {
        console.error('\x1b[31mAlternative approach failed.\x1b[0m');
        console.error('\x1b[33mYou may need to create the exec_sql function manually in the Supabase SQL editor:\x1b[0m');
        console.log(functionDefinition);
        process.exit(1);
      }
    }
    
    console.log('\x1b[32mexec_sql function created successfully.\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError creating exec_sql function:\x1b[0m', error);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    console.log('\x1b[35m%s\x1b[0m', '=== GenieAgent Complete Database Setup ===');
    
    // Create the exec_sql function first
    await createExecSqlFunction();
    
    // Then set up the database schema
    await setupDatabase();
    
    console.log('\x1b[32m%s\x1b[0m', '✓ Database setup completed successfully!');
    console.log('\x1b[36m%s\x1b[0m', 'You can now use the GenieAgent application with Supabase.');
  } catch (error) {
    console.error('\x1b[31mError during database setup:\x1b[0m', error);
    process.exit(1);
  }
}

// Run the main function
main(); 