# 💻 Usage Guide

Complete reference for using mongosh-clone commands.

## Command Overview

| Command | Description | Example |
|---------|-------------|---------|
| `connect` | Connect to MongoDB | `mongosh-clone connect mongodb://localhost:27017` |
| `use` | Switch database | `mongosh-clone use mydb` |
| `db` | Execute operations | `mongosh-clone db 'collection.find({})'` |
| `status` | Show connection info | `mongosh-clone status` |
| `disconnect` | Close connection | `mongosh-clone disconnect` |

## Connection Management

### Connect to MongoDB

```bash
# Local MongoDB (default)
mongosh-clone connect

# Specific connection string
mongosh-clone connect mongodb://localhost:27017

# With authentication
mongosh-clone connect mongodb://user:pass@localhost:27017

# MongoDB Atlas
mongosh-clone connect "mongodb+srv://user:pass@cluster.mongodb.net/db"
```

### Check Connection Status

```bash
mongosh-clone status
```

Output example:
```
=== MongoDB Connection Status ===
✓ Connected to MongoDB
Connection String: mongodb://localhost:27017
Current Database: sample_mflix
```

### Disconnect

```bash
# Disconnect and exit
mongosh-clone disconnect

# Alternative commands
mongosh-clone exit
mongosh-clone quit
```

## Database Operations

### Switch Database

```bash
mongosh-clone use sample_mflix
mongosh-clone use myapp_production
mongosh-clone use test_db
```

### Insert Operations

#### Insert Single Document

```bash
# Basic insert
mongosh-clone db 'movies.insertOne({"title": "The Matrix", "year": 1999})'

# Complex document
mongosh-clone db 'movies.insertOne({
  "title": "The Favourite",
  "genres": ["Drama", "History"],
  "runtime": 121,
  "rated": "R",
  "year": 2018,
  "directors": ["Yorgos Lanthimos"],
  "cast": ["Olivia Colman", "Emma Stone", "Rachel Weisz"],
  "type": "movie"
})'
```

#### Insert Multiple Documents

```bash
mongosh-clone db 'movies.insertMany([
  {"title": "Movie 1", "year": 2020, "rating": 8.5},
  {"title": "Movie 2", "year": 2021, "rating": 7.2},
  {"title": "Movie 3", "year": 2022, "rating": 9.1}
])'
```

### Query Operations

#### Find Documents

```bash
# Find all documents
mongosh-clone db 'movies.find({})'

# Find with filter
mongosh-clone db 'movies.find({"year": 2018})'

# Find with multiple conditions
mongosh-clone db 'movies.find({"year": 2018, "rated": "R"})'

# Find with operators
mongosh-clone db 'movies.find({"year": {"$gte": 2020}})'

# Find with projection
mongosh-clone db 'movies.find({"year": 2018}, {"title": 1, "year": 1})'
```

#### Find Single Document

```bash
# Find one document
mongosh-clone db 'movies.findOne({"title": "The Matrix"})'

# Find one with projection
mongosh-clone db 'movies.findOne({"year": 2018}, {"title": 1, "rating": 1})'
```

#### Count Documents

```bash
# Count all documents
mongosh-clone db 'movies.countDocuments({})'

# Count with filter
mongosh-clone db 'movies.countDocuments({"year": 2018})'

# Count with complex filter
mongosh-clone db 'movies.countDocuments({"year": {"$gte": 2020}, "rating": {"$gt": 8}})'
```

### Update Operations

#### Update Single Document

```bash
# Basic update
mongosh-clone db 'movies.updateOne({"title": "The Matrix"}, {"$set": {"rating": 8.7}})'

# Update with multiple fields
mongosh-clone db 'movies.updateOne(
  {"title": "The Matrix"}, 
  {"$set": {"rating": 8.7, "updated": "2023-12-01"}}
)'

# Update with operators
mongosh-clone db 'movies.updateOne(
  {"title": "The Matrix"}, 
  {"$inc": {"views": 1}, "$set": {"lastViewed": "2023-12-01"}}
)'
```

#### Update Multiple Documents

```bash
# Update all documents matching filter
mongosh-clone db 'movies.updateMany(
  {"year": 2018}, 
  {"$set": {"category": "Recent"}}
)'

# Update with complex filter
mongosh-clone db 'movies.updateMany(
  {"year": {"$lt": 2000}}, 
  {"$set": {"category": "Classic", "archive": true}}
)'
```

### Delete Operations

#### Delete Single Document

```bash
# Delete one document
mongosh-clone db 'movies.deleteOne({"title": "Old Movie"})'

# Delete with complex filter
mongosh-clone db 'movies.deleteOne({"year": {"$lt": 1950}, "rating": {"$lt": 5}})'
```

#### Delete Multiple Documents

```bash
# Delete multiple documents
mongosh-clone db 'movies.deleteMany({"year": {"$lt": 1950}})'

# Delete with multiple conditions
mongosh-clone db 'movies.deleteMany({"rating": {"$lt": 3}, "year": {"$lt": 2000}})'
```

### Collection Operations

#### Drop Collection

```bash
# Drop entire collection
mongosh-clone db 'old_collection.drop()'
mongosh-clone db 'temp_data.drop()'
```

## Advanced Examples

### Complex Queries

```bash
# Find movies from specific years with high ratings
mongosh-clone db 'movies.find({
  "year": {"$in": [2018, 2019, 2020]}, 
  "rating": {"$gte": 8.0}
})'

# Find movies with specific genres
mongosh-clone db 'movies.find({
  "genres": {"$in": ["Action", "Drama"]},
  "year": {"$gte": 2015}
})'
```

### Batch Operations

```bash
# Insert multiple related documents
mongosh-clone db 'users.insertMany([
  {"name": "John Doe", "email": "john@example.com", "role": "admin"},
  {"name": "Jane Smith", "email": "jane@example.com", "role": "user"},
  {"name": "Bob Johnson", "email": "bob@example.com", "role": "user"}
])'

# Update all users in a department
mongosh-clone db 'users.updateMany(
  {"department": "Engineering"}, 
  {"$set": {"status": "active", "lastUpdate": "2023-12-01"}}
)'
```

## Shell Integration

### Script Usage

```bash
#!/bin/bash

# Connect to MongoDB
mongosh-clone connect mongodb://localhost:27017

# Use database
mongosh-clone use analytics

# Insert daily metrics
mongosh-clone db "metrics.insertOne({
  \"date\": \"$(date -I)\",
  \"users\": 1250,
  \"revenue\": 15000
})"

# Query recent metrics
mongosh-clone db 'metrics.find({"date": {"$gte": "2023-12-01"}})'

# Disconnect
mongosh-clone disconnect
```

### Environment Variables

```bash
# Set connection string in environment
export MONGODB_URI="mongodb://localhost:27017"

# Use in scripts
mongosh-clone connect "$MONGODB_URI"
```

## Error Handling

### Common Error Messages

```bash
# Connection errors
Error: Failed to connect to MongoDB: MongoNetworkError

# Authentication errors  
Error: MongoServerError: Command requires authentication

# Invalid syntax errors
Error: Invalid operation format. Use: collection.method(args)

# JSON parsing errors
Error: Invalid JSON arguments: SyntaxError
```

### Debugging Tips

1. **Check connection first**:
   ```bash
   mongosh-clone status
   ```

2. **Test simple operations**:
   ```bash
   mongosh-clone db 'test.find({})'
   ```

3. **Verify JSON syntax**:
   ```bash
   # Use online JSON validators for complex documents
   mongosh-clone db 'collection.find({"valid": "json"})'
   ```

## Best Practices

### 1. Always Quote JSON Arguments

```bash
# ✅ Correct
mongosh-clone db 'movies.find({"year": 2023})'

# ❌ Wrong
mongosh-clone db movies.find({"year": 2023})
```

### 2. Use Meaningful Database Names

```bash
# ✅ Good
mongosh-clone use movie_catalog_prod
mongosh-clone use user_analytics_dev

# ❌ Poor  
mongosh-clone use db1
mongosh-clone use test
```

### 3. Test Operations with Small Datasets

```bash
# First test with limit
mongosh-clone db 'movies.find({"year": {"$lt": 1950}}).limit(5)'

# Then run full operation
mongosh-clone db 'movies.deleteMany({"year": {"$lt": 1950}})'
```

### 4. Check Connection Status Regularly

```bash
# Before important operations
mongosh-clone status
mongosh-clone db 'collection.operation(...)'
```

For more detailed information, see the [API Reference](./api-reference.md). 