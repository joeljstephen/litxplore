# LitXplore - Database Architecture

**Version:** 1.0  
**Last Updated:** November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Database Technology](#database-technology)
3. [Schema Design](#schema-design)
4. [Models & Relationships](#models--relationships)
5. [Migrations](#migrations)
6. [Indexing Strategy](#indexing-strategy)
7. [Query Patterns](#query-patterns)
8. [Caching Layer](#caching-layer)
9. [Data Security](#data-security)
10. [Backup & Recovery](#backup--recovery)

---

## Overview

LitXplore uses **PostgreSQL** as its primary relational database, hosted on **Neon** (serverless PostgreSQL) for production. The database is accessed through **SQLAlchemy ORM** with **Alembic** for schema migrations.

### Key Characteristics

- **Relational**: Structured data with foreign key relationships
- **Transactional**: ACID compliance for data integrity
- **Scalable**: Connection pooling and query optimization
- **Versioned**: Alembic migrations for schema evolution
- **Secure**: SSL connections, parameterized queries

### Technology Stack

```
PostgreSQL 15+ (Neon)
    ↓
SQLAlchemy 2.0+ (ORM)
    ↓
Alembic (Migrations)
    ↓
psycopg2 (Driver)
```

---

## Database Technology

### PostgreSQL on Neon

**Why Neon?**

- **Serverless**: Auto-scaling based on demand
- **Branching**: Database branches for development
- **Cold Start**: Fast resume from idle state
- **Cost-Effective**: Pay per usage
- **High Availability**: Built-in replication

**Connection String Format**:

```
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**Connection Configuration**:

```python
engine_args = {
    "pool_pre_ping": True,      # Verify connections before use
    "pool_size": 5,             # Base connection pool size
    "max_overflow": 10,         # Additional connections
    "pool_recycle": 1800,       # Recycle after 30 minutes
    "pool_timeout": 30,         # Wait time for connection
    "connect_args": {
        "connect_timeout": 10,
        "sslmode": "require"    # Force SSL
    }
}
```

---

## Schema Design

### Entity-Relationship Diagram

```
┌─────────────────────┐
│       Users         │
│─────────────────────│
│ id (PK)            │
│ clerk_id (UQ)      │
│ email (UQ)         │
│ first_name         │
│ last_name          │
│ is_active          │
│ created_at         │
│ updated_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
    ┌──────┴───────┬──────────────────┐
    │              │                  │
    │ 1:N          │ 1:N              │
    │              │                  │
┌───▼───────────┐  │          ┌───────▼───────┐
│   Reviews     │  │          │     Tasks     │
│───────────────│  │          │───────────────│
│ id (PK)       │  │          │ id (PK)       │
│ user_id (FK)  │  │          │ user_id (FK)  │
│ title         │  │          │ status        │
│ topic         │  │          │ result_data   │
│ content       │  │          │ error_message │
│ citations     │  │          │ created_at    │
│ created_at    │  │          └───────────────┘
│ updated_at    │  │
└───────────────┘  │
                   │
                   │
          (No direct paper table - papers
           are referenced by arXiv ID or
           upload hash, not stored in DB)
```

### Design Principles

1. **Normalization**: Third normal form (3NF) for data integrity
2. **Foreign Keys**: Enforce referential integrity
3. **Indexes**: Strategic indexing for query performance
4. **Timestamps**: Track creation and modification
5. **Soft Deletes**: Preserve data history (future enhancement)

---

## Models & Relationships

### 1. User Model

**Purpose**: Store user account information

**File**: `/backend/app/models/user.py`

**Schema**:

```python
class User(Base):
    __tablename__ = "users"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Clerk Integration
    clerk_id = Column(String(255), unique=True, index=True, nullable=False)

    # User Information
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reviews = relationship("Review", back_populates="user")
    tasks = relationship("Task", back_populates="user")
```

**Indexes**:

- Primary key: `id`
- Unique indexes: `clerk_id`, `email`
- Query index: `id`, `clerk_id`, `email`

**Relationships**:

- `reviews`: One-to-Many with Review
- `tasks`: One-to-Many with Task

**Sample Data**:

```sql
INSERT INTO users (clerk_id, email, first_name, last_name, is_active)
VALUES ('user_2abc123def', 'john.doe@example.com', 'John', 'Doe', true);
```

### 2. Review Model

**Purpose**: Store generated literature reviews

**File**: `/backend/app/models/review.py`

**Schema**:

```python
class Review(Base):
    __tablename__ = "literature_reviews"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key
    user_id = Column(Integer, ForeignKey("users.id"))

    # Review Content
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    citations = Column(Text, nullable=True)  # JSON string

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reviews")
```

**Indexes**:

- Primary key: `id`
- Foreign key: `user_id`

**Relationships**:

- `user`: Many-to-One with User

**Citations Format**:

```json
[
  {
    "id": "2307.12345",
    "title": "Paper Title",
    "authors": ["Author 1", "Author 2"],
    "year": 2023
  }
]
```

**Sample Data**:

```sql
INSERT INTO literature_reviews (user_id, title, topic, content, citations)
VALUES (
  1,
  'Advances in Transformers',
  'Recent advances in transformer architectures',
  'This literature review explores...',
  '[{"id": "2307.12345", "title": "Attention Is All You Need"}]'
);
```

### 3. Task Model

**Purpose**: Track asynchronous operations

**File**: `/backend/app/models/task.py`

**Schema**:

```python
class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Task(Base):
    __tablename__ = "tasks"

    # Primary Key (UUID)
    id = Column(String(36), primary_key=True, index=True)

    # Foreign Key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Task Status
    status = Column(
        SQLEnum(TaskStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=TaskStatus.PENDING,
        nullable=False
    )

    # Task Data
    result_data = Column(Text, nullable=True)  # JSON string
    error_message = Column(Text, nullable=True)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="tasks")

    # Helper Methods
    def set_result_data(self, data: Dict[str, Any]) -> None:
        self.result_data = json.dumps(data)

    def get_result_data(self) -> Optional[Dict[str, Any]]:
        if self.result_data:
            return json.loads(self.result_data)
        return None
```

**Indexes**:

- Primary key: `id` (UUID)
- Foreign key: `user_id`

**Relationships**:

- `user`: Many-to-One with User

**Sample Data**:

```sql
INSERT INTO tasks (id, user_id, status, result_data)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  1,
  'completed',
  '{"review_id": 123, "citations_count": 10}'
);
```

### 4. Paper References (Conceptual)

**Note**: Papers are NOT stored in the database. They are:

- **arXiv Papers**: Referenced by arXiv ID (e.g., `2307.12345`)
- **Uploaded Papers**: Referenced by content hash (e.g., `upload_abc123def`)
- **Stored in**: File system (`/uploads` directory)
- **Cached in**: Redis for analysis results

**Paper Metadata** (in-memory/API only):

```python
class Paper(BaseModel):
    id: str
    title: str
    authors: List[str]
    published: datetime
    summary: str
    url: str
```

---

## Migrations

### Alembic Configuration

**File**: `alembic.ini`

```ini
[alembic]
script_location = alembic
sqlalchemy.url = postgresql://user:password@host/db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic
```

### Migration Files

**Location**: `/backend/alembic/versions/`

**Existing Migrations**:

1. `74f32592cfec_initial_migration.py` - Initial schema
2. `b9c1403e0770_add_user_model.py` - Add User table
3. `39f6942a01f0_update_user_model_for_clerk_integration.py` - Clerk fields
4. `aaf2ade1b6fd_new_review_history.py` - Review table
5. `create_simplified_tasks_table.py` - Task tracking

**Migration Commands**:

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Upgrade to latest version
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

### Example Migration

**File**: `alembic/versions/xxx_add_user_subscription.py`

```python
"""Add user subscription fields

Revision ID: xxx
Revises: yyy
Create Date: 2025-11-23
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxx'
down_revision = 'yyy'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users',
        sa.Column('subscription_tier', sa.String(50), nullable=True)
    )
    op.add_column('users',
        sa.Column('subscription_status', sa.String(50), nullable=True)
    )
    op.add_column('users',
        sa.Column('stripe_customer_id', sa.String(255), nullable=True)
    )

def downgrade() -> None:
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'subscription_tier')
```

---

## Indexing Strategy

### Current Indexes

**Users Table**:

```sql
CREATE INDEX ix_users_id ON users(id);
CREATE UNIQUE INDEX ix_users_clerk_id ON users(clerk_id);
CREATE UNIQUE INDEX ix_users_email ON users(email);
```

**Reviews Table**:

```sql
CREATE INDEX ix_literature_reviews_id ON literature_reviews(id);
CREATE INDEX ix_literature_reviews_user_id ON literature_reviews(user_id);
```

**Tasks Table**:

```sql
CREATE INDEX ix_tasks_id ON tasks(id);
CREATE INDEX ix_tasks_user_id ON tasks(user_id);
```

### Query Performance

**Most Common Queries**:

1. **Get user by Clerk ID**:

```sql
SELECT * FROM users WHERE clerk_id = 'user_xxx';
-- Index: ix_users_clerk_id (Unique)
-- Performance: O(1) - Hash index lookup
```

2. **Get user's reviews**:

```sql
SELECT * FROM literature_reviews
WHERE user_id = 1
ORDER BY created_at DESC;
-- Index: ix_literature_reviews_user_id
-- Performance: O(log n) - B-tree index
```

3. **Get user's tasks**:

```sql
SELECT * FROM tasks
WHERE user_id = 1 AND status = 'completed'
ORDER BY created_at DESC;
-- Index: ix_tasks_user_id
-- Performance: O(log n) - B-tree index
```

### Optimization Recommendations

**Future Indexes**:

```sql
-- Composite index for task status queries
CREATE INDEX ix_tasks_user_status ON tasks(user_id, status);

-- Full-text search on review content
CREATE INDEX ix_reviews_content_fts ON literature_reviews
USING GIN(to_tsvector('english', content));

-- Timestamp range queries
CREATE INDEX ix_reviews_created_at ON literature_reviews(created_at DESC);
```

---

## Query Patterns

### Common Operations

#### 1. User Operations

**Create User** (via Clerk webhook):

```python
user = User(
    clerk_id=clerk_user_id,
    email=email,
    first_name=first_name,
    last_name=last_name
)
db.add(user)
db.commit()
```

**Get User by Clerk ID**:

```python
user = db.query(User).filter(User.clerk_id == clerk_id).first()
```

**Update User**:

```python
user = db.query(User).filter(User.id == user_id).first()
user.first_name = "New Name"
user.updated_at = datetime.utcnow()
db.commit()
```

#### 2. Review Operations

**Save Review**:

```python
review = Review(
    user_id=user_id,
    title=title,
    topic=topic,
    content=content,
    citations=json.dumps(citations)
)
db.add(review)
db.commit()
```

**Get User's Reviews**:

```python
reviews = db.query(Review)\
    .filter(Review.user_id == user_id)\
    .order_by(Review.created_at.desc())\
    .all()
```

**Delete Review**:

```python
review = db.query(Review).filter(Review.id == review_id).first()
db.delete(review)
db.commit()
```

#### 3. Task Operations

**Create Task**:

```python
import uuid

task = Task(
    id=str(uuid.uuid4()),
    user_id=user_id,
    status=TaskStatus.PENDING
)
db.add(task)
db.commit()
```

**Update Task Status**:

```python
task = db.query(Task).filter(Task.id == task_id).first()
task.status = TaskStatus.COMPLETED
task.set_result_data({"result": "success"})
db.commit()
```

**Get Task**:

```python
task = db.query(Task).filter(Task.id == task_id).first()
result = task.get_result_data()  # Deserialize JSON
```

---

## Caching Layer

### Redis Configuration

**Purpose**: Cache expensive operations

**Connection**:

```python
import redis

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)
```

### Cached Data

#### 1. Paper Analysis Results

**Cache Key Format**:

```
analysis:{paper_id}:v{version}:{env}
in_depth:{paper_id}:v{version}:{env}
key_insights:{paper_id}:v{version}:{env}
```

**TTL**:

- Development: 3600s (1 hour)
- Production: 86400s (24 hours)

**Set Cache**:

```python
cache_key = f"analysis:{paper_id}:v1.0.0:prod"
redis_client.setex(
    cache_key,
    86400,  # 24 hours
    json.dumps(analysis_data)
)
```

**Get Cache**:

```python
cached = redis_client.get(cache_key)
if cached:
    return json.loads(cached)
```

#### 2. Vector Stores

**Cache Key**: `vectorstore:{paper_id}`

**Purpose**: Store FAISS indexes for paper chat

**Data**: Serialized FAISS index + metadata

#### 3. Search Results

**Cache Key**: `search:{query_hash}`

**TTL**: 3600s (1 hour)

**Purpose**: Cache arXiv search results

### Cache Invalidation

**Strategies**:

1. **TTL-based**: Automatic expiration
2. **Version-based**: Change version in key when schema changes
3. **Event-based**: Invalidate on paper update (future)

---

## Data Security

### 1. Connection Security

**SSL/TLS**:

```python
connect_args = {
    "sslmode": "require",  # Force SSL
    "connect_timeout": 10
}
```

### 2. SQL Injection Prevention

**Parameterized Queries** (via SQLAlchemy):

```python
# Safe - parameterized
user = db.query(User).filter(User.email == email).first()

# NEVER do this - vulnerable to SQL injection
# user = db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

### 3. Data Access Control

**User Isolation**:

```python
# Ensure user can only access their own data
reviews = db.query(Review)\
    .filter(Review.user_id == current_user_id)\
    .all()
```

### 4. Sensitive Data

**Password Hashing**: N/A (Clerk handles authentication)

**API Keys**: Stored in environment variables, not in database

**PII Protection**:

- Email addresses encrypted in transit (SSL)
- No credit card data stored (Stripe handles payments)

---

## Backup & Recovery

### Neon Automatic Backups

**Features**:

- **Point-in-time Recovery**: Restore to any point in last 7 days
- **Automated Snapshots**: Daily backups
- **Retention**: 7 days (configurable)

### Manual Backup

**pg_dump**:

```bash
pg_dump -h host.neon.tech -U user -d dbname > backup.sql
```

**Restore**:

```bash
psql -h host.neon.tech -U user -d dbname < backup.sql
```

### Disaster Recovery Plan

1. **Backup Frequency**: Daily automatic + manual before major changes
2. **Backup Storage**: Neon's managed backup system
3. **Recovery Time Objective (RTO)**: < 1 hour
4. **Recovery Point Objective (RPO)**: < 24 hours
5. **Testing**: Quarterly backup restoration tests

### Data Export

**User Data Export**:

```python
def export_user_data(user_id: int) -> Dict:
    user = db.query(User).filter(User.id == user_id).first()
    reviews = db.query(Review).filter(Review.user_id == user_id).all()
    tasks = db.query(Task).filter(Task.user_id == user_id).all()

    return {
        "user": user.__dict__,
        "reviews": [r.__dict__ for r in reviews],
        "tasks": [t.__dict__ for t in tasks]
    }
```

---

## Database Monitoring

### Key Metrics

1. **Connection Pool**:

   - Active connections
   - Pool size
   - Wait time

2. **Query Performance**:

   - Slow queries (> 100ms)
   - Query count
   - Error rate

3. **Database Size**:
   - Table sizes
   - Index sizes
   - Growth rate

### Monitoring Queries

**Active Connections**:

```sql
SELECT count(*) FROM pg_stat_activity;
```

**Slow Queries**:

```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
```

**Table Sizes**:

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Future Enhancements

### Planned Features

1. **Subscription Management**:

   - Add `subscription_tier`, `subscription_status` to User
   - Create `Subscription` table for history

2. **Paper Bookmarks**:

   - Create `Bookmark` table
   - Many-to-Many with User and Paper

3. **Collaboration**:

   - Add `SharedReview` table
   - Team workspaces

4. **Analytics**:

   - Create `UserActivity` table
   - Track usage patterns

5. **Full-Text Search**:
   - PostgreSQL FTS on review content
   - Elasticsearch integration (optional)

---

**End of Database Architecture Document**
