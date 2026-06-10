CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS literature_reviews (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  citations TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  result_data TEXT,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_papers (
  content_hash VARCHAR(10) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  title VARCHAR(500) NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  pdf_data BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_analyses (
  cache_key VARCHAR(255) PRIMARY KEY,
  analysis JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_reviews_user_id ON literature_reviews(user_id);
CREATE INDEX IF NOT EXISTS ix_tasks_user_id ON tasks(user_id);
