-- Enable UUID generation if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text,
  fullname text,
  google_id text,
  created_at timestamptz DEFAULT now()
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fullname text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES folders(id),
  created_at timestamptz DEFAULT now()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id),
  size bigint,
  mime_type text,
  storage_path text,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Shares table
CREATE TABLE IF NOT EXISTS shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  role text NOT NULL, -- viewer / editor
  expires_at timestamptz
);
