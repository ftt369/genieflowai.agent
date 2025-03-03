# GenieAgent Database Schema

## Core Tables

### users

```sql
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_login timestamp with time zone,
  status text check (status in ('active', 'inactive', 'suspended')) default 'active',
  role text check (role in ('user', 'admin', 'moderator')) default 'user'
);

create index users_email_idx on users(email);
```

### profiles

```sql
create table profiles (
  id uuid references users(id) primary key,
  bio text,
  expertise text[],
  location text,
  timezone text,
  website text,
  social_links jsonb,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### subscriptions

```sql
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  plan_id text not null,
  status text check (status in ('active', 'trialing', 'past_due', 'canceled')) not null,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index subscriptions_user_id_idx on subscriptions(user_id);
```

## Agent System

### agents

```sql
create table agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references users(id) not null,
  type text check (type in ('research', 'writing', 'analysis', 'custom')) not null,
  capabilities text[],
  config jsonb default '{}'::jsonb,
  is_public boolean default false,
  version text default '1.0',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index agents_created_by_idx on agents(created_by);
create index agents_type_idx on agents(type);
```

### agent_templates

```sql
create table agent_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null,
  agent_id uuid references agents(id) not null,
  config jsonb not null,
  is_featured boolean default false,
  usage_count integer default 0,
  rating numeric(3,2) check (rating >= 0 and rating <= 5),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index agent_templates_category_idx on agent_templates(category);
```

## Workflow System

### workflows

```sql
create table workflows (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references users(id) not null,
  category text not null,
  is_template boolean default false,
  is_public boolean default false,
  version text default '1.0',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index workflows_created_by_idx on workflows(created_by);
create index workflows_category_idx on workflows(category);
```

### workflow_steps

```sql
create table workflow_steps (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid references workflows(id) not null,
  name text not null,
  description text,
  type text check (type in ('document_input', 'summarize', 'research', 'analyze', 'write', 'verify', 'proofread', 'export', 'custom')) not null,
  order_index integer not null,
  config jsonb default '{}'::jsonb,
  required_inputs text[],
  expected_outputs text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index workflow_steps_workflow_id_idx on workflow_steps(workflow_id);
```

### workflow_executions

```sql
create table workflow_executions (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid references workflows(id) not null,
  user_id uuid references users(id) not null,
  status text check (status in ('pending', 'running', 'completed', 'failed', 'canceled')) not null,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  results jsonb default '{}'::jsonb,
  error text,
  metrics jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index workflow_executions_workflow_id_idx on workflow_executions(workflow_id);
create index workflow_executions_user_id_idx on workflow_executions(user_id);
```

## Knowledge Management

### knowledge_bases

```sql
create table knowledge_bases (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references users(id) not null,
  category text not null,
  is_public boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index knowledge_bases_created_by_idx on knowledge_bases(created_by);
create index knowledge_bases_category_idx on knowledge_bases(category);
```

### documents

```sql
create table documents (
  id uuid primary key default uuid_generate_v4(),
  knowledge_base_id uuid references knowledge_bases(id) not null,
  name text not null,
  content text not null,
  type text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  created_by uuid references users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index documents_knowledge_base_id_idx on documents(knowledge_base_id);
create index documents_created_by_idx on documents(created_by);
create index documents_embedding_idx on documents using ivfflat (embedding vector_cosine_ops);
```

## Collaboration & Social

### teams

```sql
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references users(id) not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### team_members

```sql
create table team_members (
  team_id uuid references teams(id) not null,
  user_id uuid references users(id) not null,
  role text check (role in ('owner', 'admin', 'member')) not null,
  joined_at timestamp with time zone default now(),
  primary key (team_id, user_id)
);
```

### comments

```sql
create table comments (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  user_id uuid references users(id) not null,
  parent_id uuid references comments(id),
  resource_type text not null,
  resource_id uuid not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index comments_resource_idx on comments(resource_type, resource_id);
```

### tags

```sql
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  category text,
  created_at timestamp with time zone default now()
);

create table resource_tags (
  tag_id uuid references tags(id) not null,
  resource_type text not null,
  resource_id uuid not null,
  created_at timestamp with time zone default now(),
  primary key (tag_id, resource_type, resource_id)
);
```

## Analytics & Metrics

### usage_metrics

```sql
create table usage_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  resource_type text not null,
  resource_id uuid not null,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index usage_metrics_user_id_idx on usage_metrics(user_id);
create index usage_metrics_resource_idx on usage_metrics(resource_type, resource_id);
```

### performance_metrics

```sql
create table performance_metrics (
  id uuid primary key default uuid_generate_v4(),
  resource_type text not null,
  resource_id uuid not null,
  metric_type text not null,
  value numeric not null,
  metadata jsonb default '{}'::jsonb,
  measured_at timestamp with time zone default now()
);

create index performance_metrics_resource_idx on performance_metrics(resource_type, resource_id);
```

## SEO Optimization

### seo_metadata

```sql
create table seo_metadata (
  id uuid primary key default uuid_generate_v4(),
  resource_type text not null,
  resource_id uuid not null,
  title text,
  description text,
  keywords text[],
  og_image_url text,
  canonical_url text,
  structured_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(resource_type, resource_id)
);

create index seo_metadata_resource_idx on seo_metadata(resource_type, resource_id);
```

## Row Level Security Policies

```sql
-- Example RLS policies
alter table users enable row level security;
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);

alter table profiles enable row level security;
create policy "Profiles are viewable by owner"
  on profiles for select
  using (auth.uid() = id);

-- Add similar policies for other tables
```

## Indexes and Performance Optimizations

```sql
-- Full-text search indexes
create index documents_content_idx on documents using gin(to_tsvector('english', content));
create index knowledge_bases_name_description_idx on knowledge_bases using gin(to_tsvector('english', name || ' ' || description));

-- Composite indexes for common queries
create index workflows_category_created_at_idx on workflows(category, created_at desc);
create index agents_type_rating_idx on agents(type, (metadata->>'rating') desc);
```
