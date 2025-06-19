# 🔧 API Reference

Complete reference for all mongosh-clone operations.

## Commands

### Connection Commands
- `connect [uri]` - Connect to MongoDB
- `disconnect` / `exit` / `quit` - Disconnect and exit
- `status` - Show connection status

### Database Commands  
- `use <database>` - Switch database
- `db '<collection>.<operation>(...)'` - Execute operations

## Operations Reference

### Insert Operations
```bash
# Insert single document
mongosh-clone db 'collection.insertOne({"field": "value"})'

# Insert multiple documents  
mongosh-clone db 'collection.insertMany([{...}, {...}])'
```

### Query Operations
```bash
# Find documents
mongosh-clone db 'collection.find({"field": "value"})'

# Find one document
mongosh-clone db 'collection.findOne({"field": "value"})'

# Count documents
mongosh-clone db 'collection.countDocuments({"field": "value"})'
```

### Update Operations
```bash
# Update one document
mongosh-clone db 'collection.updateOne({"filter": "value"}, {"$set": {"field": "new"}})'

# Update many documents
mongosh-clone db 'collection.updateMany({"filter": "value"}, {"$set": {"field": "new"}})'
```

### Delete Operations
```bash
# Delete one document
mongosh-clone db 'collection.deleteOne({"field": "value"})'

# Delete many documents
mongosh-clone db 'collection.deleteMany({"field": "value"})'
```

### Collection Operations
```bash
# Drop collection
mongosh-clone db 'collection.drop()'
```

## Query Operators
- `$eq`, `$ne` - Equal, not equal
- `$gt`, `$gte`, `$lt`, `$lte` - Comparison
- `$in`, `$nin` - In/not in array

## Update Operators
- `$set` - Set field value
- `$inc` - Increment number
- `$push` - Add to array
- `$pull` - Remove from array

## Examples

### Basic Workflow
```bash
mongosh-clone connect mongodb://localhost:27017
mongosh-clone use movies_db
mongosh-clone db 'movies.insertOne({"title": "The Matrix", "year": 1999})'  
mongosh-clone db 'movies.find({"year": 1999})'
mongosh-clone disconnect
```

For detailed examples, see the [Usage Guide](./usage.md). 