# Prompt Manager

The Prompt Manager is a powerful feature that allows users to create, organize, and reuse AI prompts. It helps streamline interactions with AI models by providing a library of pre-defined prompts that can be quickly accessed and modified as needed.

## Features

- **Create and Edit Prompts**: Create new prompts or edit existing ones with a user-friendly interface
- **Organize with Tags**: Add tags to prompts for easy categorization and filtering
- **Favorite Prompts**: Mark frequently used prompts as favorites for quick access
- **Search Functionality**: Find prompts quickly using the search feature
- **Clipboard Integration**: Copy prompt content to clipboard with one click
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

The Prompt Manager uses a dedicated `prompts` table in Supabase with the following structure:

```sql
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup

To set up the Prompt Manager feature:

1. Run the setup script to create the necessary database tables and security policies:

```bash
node src/scripts/setup-prompt-manager.js
```

2. To add sample prompts for a specific user, provide their user ID as an argument:

```bash
node src/scripts/setup-prompt-manager.js <user_id>
```

## Integration with GenieAgent

The Prompt Manager integrates with the existing GenieAgent application:

- Added as a premium feature with subscription control
- Accessible via the main navigation
- Prompts can be used directly in chat conversations
- Stored prompts are automatically synced across devices for the same user

## Usage in Code

### Accessing the Prompt Store

```typescript
import { usePromptStore } from '../stores/prompt/promptStore';

function MyComponent() {
  const { prompts, addPrompt, updatePrompt } = usePromptStore();
  
  // Use prompts in your component
}
```

### Using the PromptManager Component

```tsx
import PromptManager from '../components/prompt/PromptManager';

function PromptsPage() {
  return (
    <div>
      <h1>Manage Your Prompts</h1>
      <PromptManager />
    </div>
  );
}
```

## Security

The Prompt Manager implements Row Level Security (RLS) policies in Supabase to ensure that:

- Users can only view their own prompts
- Users can only modify their own prompts
- Proper authentication is required for all operations

## Future Enhancements

- Prompt sharing between users
- Prompt categories and collections
- Version history for prompts
- AI-suggested prompt improvements
- Import/export functionality

## Support

For issues or feature requests related to the Prompt Manager, please submit a ticket through the support portal or contact the development team directly. 