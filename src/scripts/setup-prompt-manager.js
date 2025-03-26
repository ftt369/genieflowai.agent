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
const schemaPath = path.join(__dirname, '..', 'db', 'prompt-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function setupPromptManager() {
  console.log('\x1b[36m%s\x1b[0m', 'Setting up prompt manager schema...');
  
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
      console.log(`\x1b[33mPrompt manager schema setup completed with ${errorCount} errors.\x1b[0m`);
      console.log(`\x1b[32m${successCount} statements executed successfully.\x1b[0m`);
    } else {
      console.log('\x1b[32mPrompt manager schema setup completed successfully.\x1b[0m');
    }
    
    // Seed sample prompts if needed
    await seedSamplePrompts();
    
  } catch (error) {
    console.error('\x1b[31mError setting up prompt manager schema:\x1b[0m', error);
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

// Sample prompts for demonstration
const samplePrompts = [
  {
    title: "Legal Brief Analysis",
    content: "Analyze this legal brief and identify the main arguments, supporting evidence, and any potential weaknesses or contradictions.",
    tags: ["legal", "analysis", "professional"],
    is_favorite: true
  },
  {
    title: "Case Summary",
    content: "Summarize the key facts, legal issues, holding, and reasoning of this case in a structured format suitable for case briefing.",
    tags: ["legal", "summary", "case-law"],
    is_favorite: false
  },
  {
    title: "Evidence Evaluation",
    content: "Evaluate the admissibility of this evidence under the Federal Rules of Evidence, focusing on relevance, prejudice, hearsay exceptions, and authentication.",
    tags: ["legal", "evidence", "professional"],
    is_favorite: true
  },
  {
    title: "Document Draft Review",
    content: "Review this legal document draft for clarity, accuracy, consistency with legal standards, and potential improvements in structure and language.",
    tags: ["document", "review", "professional"],
    is_favorite: false
  },
  {
    title: "Client Communication",
    content: "Draft a clear, concise email to a client explaining the following legal concept in plain language without technical jargon.",
    tags: ["client", "communication", "professional"],
    is_favorite: false
  }
];

// Seed sample prompts
async function seedSamplePrompts() {
  console.log('\x1b[36m%s\x1b[0m', 'Checking if sample prompts should be added...');
  
  try {
    // Check if we already have prompts in the database
    const { data, error } = await supabase
      .from('prompts')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('\x1b[31mError checking existing prompts:\x1b[0m', error);
      return;
    }
    
    // If we already have prompts, don't seed
    if (data && data.length > 0 && data[0].count > 0) {
      console.log('\x1b[33mPrompts already exist in the database. Skipping sample prompt seeding.\x1b[0m');
      return;
    }
    
    console.log('\x1b[36m%s\x1b[0m', 'No existing prompts found. Adding sample prompts...');
    
    // Get admin user for seeding (first user in the system, or create one)
    let adminUserId = null;
    
    // Try to get the first user
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
      
    if (userError) {
      console.error('\x1b[31mError fetching users:\x1b[0m', userError);
      console.log('\x1b[33mSkipping sample prompt seeding as no user was found.\x1b[0m');
      return;
    }
    
    if (users && users.length > 0) {
      adminUserId = users[0].id;
    } else {
      console.log('\x1b[33mNo users found in the database. Skipping sample prompt seeding.\x1b[0m');
      return;
    }
    
    // Insert sample prompts
    for (const prompt of samplePrompts) {
      const { error: insertError } = await supabase
        .from('prompts')
        .insert({
          user_id: adminUserId,
          title: prompt.title,
          content: prompt.content,
          tags: prompt.tags,
          is_favorite: prompt.is_favorite
        });
        
      if (insertError) {
        console.error(`\x1b[31mError inserting sample prompt "${prompt.title}":\x1b[0m`, insertError);
      } else {
        console.log(`\x1b[32mAdded sample prompt: ${prompt.title}\x1b[0m`);
      }
    }
    
    console.log('\x1b[32mSample prompts added successfully!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError seeding sample prompts:\x1b[0m', error);
  }
}

// Main function
async function main() {
  try {
    console.log('\x1b[35m%s\x1b[0m', '=== GenieAgent Prompt Manager Setup ===');
    
    // Create the exec_sql function first
    await createExecSqlFunction();
    
    // Then set up the prompt manager schema
    await setupPromptManager();
    
    console.log('\x1b[32m%s\x1b[0m', '✓ Prompt manager setup completed successfully!');
    console.log('\x1b[36m%s\x1b[0m', 'You can now use the Prompt Manager in your application.');
  } catch (error) {
    console.error('\x1b[31mError during prompt manager setup:\x1b[0m', error);
    process.exit(1);
  }
}

// Run the main function
main(); 