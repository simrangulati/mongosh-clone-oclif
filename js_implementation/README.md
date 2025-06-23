# 🚀 mongosh-clone-js

A JavaScript implementation of a mongosh-like CLI tool built with OCLIF and MongoDB Node.js driver.

## ✨ Features

- 🔌 **MongoDB Connection Management** - Connect to any MongoDB instance
- 🗃️ **Database Operations** - Full CRUD operations support
- 🎯 **Robust Parsing** - Advanced operation parser with excellent error handling
- 📊 **Status Monitoring** - Real-time connection status
- 🔄 **Persistent Configuration** - Remembers your connection settings
- 🎨 **Beautiful Output** - Colorized results and user-friendly messages

## 📦 Installation

### Prerequisites
- Node.js 14+ 
- MongoDB instance (local or remote)

### Install Dependencies
```bash
cd js_implementation
npm install
```

### Make Executable
```bash
chmod +x bin/run
```

## 🚀 Quick Start

### 1. Connect to MongoDB
```bash
./bin/run connect mongodb://localhost:27017
```

### 2. Switch to Database
```bash
./bin/run use sample_mflix
```

### 3. Execute Operations
```bash
# Find documents
./bin/run db 'movies.find({})'

# Insert a document
./bin/run db 'movies.insertOne({"title": "The Matrix", "year": 1999})'

# Update documents
./bin/run db 'movies.updateOne({"title": "The Matrix"}, {"$set": {"rating": 8.7}})'

# Delete documents
./bin/run db 'movies.deleteOne({"title": "The Matrix"})'

# Count documents
./bin/run db 'movies.countDocuments({"year": {"$gte": 2000}})'
```

## 📚 Commands Reference

### Connection Commands

#### `connect <connection-string>`
Connect to a MongoDB instance.

```bash
# Local MongoDB
./bin/run connect mongodb://localhost:27017

# Remote MongoDB with authentication
./bin/run connect mongodb://username:password@host:port/database

# MongoDB Atlas
./bin/run connect mongodb+srv://username:password@cluster.mongodb.net/database
```

#### `disconnect` / `exit` / `quit`
Disconnect from MongoDB and exit.

```bash
./bin/run disconnect
./bin/run exit
./bin/run quit
```

#### `status`
Show current connection status.

```bash
./bin/run status
```

### Database Commands

#### `use <database>`
Switch to a specific database.

```bash
./bin/run use myapp_production
./bin/run use sample_mflix
```

#### `db <operation>`
Execute database operations using MongoDB-like syntax.

## 🔧 Supported Operations

### Insert Operations
```bash
# Insert single document
./bin/run db 'users.insertOne({"name": "John", "age": 30})'

# Insert multiple documents
./bin/run db 'users.insertMany([{"name": "Alice"}, {"name": "Bob"}])'
```

### Query Operations
```bash
# Find all documents
./bin/run db 'users.find({})'

# Find with filter
./bin/run db 'users.find({"age": {"$gte": 18}})'

# Find one document
./bin/run db 'users.findOne({"name": "John"})'

# Count documents
./bin/run db 'users.countDocuments({"active": true})'
```

### Update Operations
```bash
# Update single document
./bin/run db 'users.updateOne({"name": "John"}, {"$set": {"age": 31}})'

# Update multiple documents
./bin/run db 'users.updateMany({"active": false}, {"$set": {"status": "inactive"}})'
```

### Delete Operations
```bash
# Delete single document
./bin/run db 'users.deleteOne({"name": "John"})'

# Delete multiple documents
./bin/run db 'users.deleteMany({"active": false})'
```

### Collection Operations
```bash
# Drop collection
./bin/run db 'old_collection.drop()'
```

## 🧠 Advanced Parser Features

### Complex Collection Names
```bash
# Supports hyphens, dots, and numbers
./bin/run db 'user-profiles.find({})'
./bin/run db 'logs_2023-12.countDocuments({})'
./bin/run db 'items.v2.insertOne({})'
```

### Robust JSON Parsing
```bash
# Handles escaped quotes
./bin/run db 'movies.find({"title": "He said \"Hello\""})'

# Complex nested objects
./bin/run db 'users.insertOne({
  "name": "John",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  },
  "hobbies": ["reading", "coding"]
})'
```

### Empty Operations
```bash
# Empty parentheses work perfectly
./bin/run db 'users.find()'
./bin/run db 'logs.drop()'
```

## 🛡️ Error Handling

The parser provides detailed error messages:

```bash
# Invalid collection name
./bin/run db '123invalid.find({})'
# Error: Invalid collection name: "123invalid"

# Unsupported method
./bin/run db 'users.invalidMethod({})'
# Error: Unsupported method: "invalidMethod". Supported: insertOne, find, updateOne...

# Invalid JSON arguments
./bin/run db 'users.insertOne({invalid: json})'
# Error: Invalid JSON argument: "{invalid: json}". Unexpected token i
```

## 🔧 Shell Quoting

When using complex JSON with special characters, wrap in quotes:

```bash
# Correct - wrapped in single quotes
./bin/run db 'movies.find({"title": "The Matrix"})'

# Correct - escaped quotes
./bin/run db "movies.find({\"title\": \"The Matrix\"})"
```

## 📁 Configuration

Configuration is automatically saved to `~/.mongosh-clone-js-config.json`:

```json
{
  "lastConnection": "mongodb://localhost:27017",
  "isConnected": true,
  "currentDatabase": "sample_mflix"
}
```

## 🎯 Examples

### Complete Workflow
```bash
# 1. Connect to MongoDB
./bin/run connect mongodb://localhost:27017

# 2. Switch to database
./bin/run use myapp

# 3. Check status
./bin/run status

# 4. Insert some data
./bin/run db 'users.insertMany([
  {"name": "Alice", "age": 25, "role": "developer"},
  {"name": "Bob", "age": 30, "role": "designer"},
  {"name": "Charlie", "age": 35, "role": "manager"}
])'

# 5. Query the data
./bin/run db 'users.find({"age": {"$gte": 30}})'

# 6. Update a document
./bin/run db 'users.updateOne({"name": "Bob"}, {"$set": {"age": 31}})'

# 7. Count documents
./bin/run db 'users.countDocuments({"role": "developer"})'

# 8. Clean up
./bin/run db 'users.deleteMany({"age": {"$lt": 30}})'

# 9. Disconnect
./bin/run disconnect
```

## 🏗️ Architecture

```
js_implementation/
├── bin/run                    # Main executable
├── src/
│   ├── commands/             # OCLIF commands
│   │   ├── connect.js       # Connection management
│   │   ├── use.js           # Database switching
│   │   ├── db.js            # Main database operations
│   │   ├── status.js        # Status checking
│   │   └── disconnect.js    # Disconnection
│   └── lib/                 # Core libraries
│       ├── connection-manager.js  # MongoDB connection handling
│       └── operation-parser.js    # Robust operation parsing
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🆚 Comparison with TypeScript Version

| Feature | TypeScript Version | JavaScript Version |
|---------|-------------------|-------------------|
| **Type Safety** | ✅ Compile-time checks | ❌ Runtime only |
| **Setup Complexity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Runtime Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Development Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Error Detection** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🐛 Troubleshooting

### Connection Issues
```bash
# Check if MongoDB is running
./bin/run connect mongodb://localhost:27017

# Test with different port
./bin/run connect mongodb://localhost:27018
```

### Parser Issues
```bash
# Use single quotes for complex JSON
./bin/run db 'collection.find({"complex": "json"})'

# Check for proper JSON syntax
./bin/run db 'collection.insertOne({"valid": "json"})'
```

### Permission Issues
```bash
# Make sure the binary is executable
chmod +x bin/run

# Check Node.js installation
node --version
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [OCLIF](https://oclif.io/) framework
- Uses [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- Inspired by [mongosh](https://docs.mongodb.com/mongodb-shell/)

---

**Happy querying! 🎉** 