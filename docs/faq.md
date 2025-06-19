# ❓ FAQ & Troubleshooting

Common questions and solutions for mongosh-clone.

## Frequently Asked Questions

### General Usage

#### Q: How is mongosh-clone different from real mongosh?

**A:** mongosh-clone is a CLI tool that parses commands using regex, while real mongosh is a JavaScript REPL. Key differences:

- ✅ **mongosh-clone**: Simple CLI commands, shell scripting friendly
- ✅ **Real mongosh**: Full JavaScript support, variables, functions, REPL

#### Q: Can I use mongosh-clone in production?

**A:** Yes, but consider these limitations:
- No advanced MongoDB features (aggregation, indexes, etc.)
- Limited to basic CRUD operations
- No transaction support

#### Q: Why use mongosh-clone instead of mongosh?

**A:** Best for:
- Shell scripting and automation
- CI/CD pipelines  
- Simple CRUD operations
- When you don't need JavaScript features

### Installation & Setup

#### Q: Command not found after installation

```bash
npm install -g mongosh-clone
# If still not found:
npm list -g mongosh-clone
npm link mongosh-clone
```

#### Q: Permission errors during installation

```bash
# Use npm prefix for user installation
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or use sudo (not recommended)
sudo npm install -g mongosh-clone
```

### Connection Issues

#### Q: "Failed to connect to MongoDB" error

**Common solutions:**

1. **Check MongoDB is running:**
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod
   
   # Start MongoDB
   mongod --dbpath /data/db
   ```

2. **Verify connection string:**
   ```bash
   # Test basic connection
   mongosh-clone connect mongodb://localhost:27017
   mongosh-clone status
   ```

3. **Check firewall/network:**
   ```bash
   # Test network connectivity
   telnet localhost 27017
   ```

#### Q: Authentication required error

```bash
# Error: MongoServerError: Command requires authentication

# Solution: Provide credentials
mongosh-clone connect mongodb://username:password@localhost:27017

# Or disable auth for local development
mongod --noauth
```

#### Q: SSL/TLS connection errors

```bash
# For MongoDB Atlas
mongosh-clone connect "mongodb+srv://user:pass@cluster.mongodb.net/db"

# For self-hosted with SSL
mongosh-clone connect "mongodb://user:pass@host:27017/db?ssl=true"
```

### Command Syntax Issues

#### Q: "Invalid operation format" error

**Common causes:**

1. **Missing quotes:**
   ```bash
   # ❌ Wrong
   mongosh-clone db movies.find({"year": 2023})
   
   # ✅ Correct  
   mongosh-clone db 'movies.find({"year": 2023})'
   ```

2. **Incorrect JSON syntax:**
   ```bash
   # ❌ Wrong - single quotes in JSON
   mongosh-clone db "movies.find({'year': 2023})"
   
   # ✅ Correct - double quotes in JSON
   mongosh-clone db 'movies.find({"year": 2023})'
   ```

3. **Unmatched parentheses:**
   ```bash
   # ❌ Wrong - missing closing parenthesis
   mongosh-clone db 'movies.find({"year": 2023}'
   
   # ✅ Correct
   mongosh-clone db 'movies.find({"year": 2023})'
   ```

#### Q: Shell interprets special characters

**Problem:** Shell treats `{}` as special characters

**Solutions:**

1. **Use single quotes (recommended):**
   ```bash
   mongosh-clone db 'movies.find({"year": 2023})'
   ```

2. **Escape special characters:**
   ```bash
   mongosh-clone db movies.find\(\{\"year\": 2023\}\)
   ```

3. **Use double quotes with escaping:**
   ```bash
   mongosh-clone db "movies.find({\"year\": 2023})"
   ```

### JSON Parsing Issues

#### Q: "Invalid JSON arguments" error

**Common JSON mistakes:**

1. **Trailing commas:**
   ```bash
   # ❌ Wrong
   mongosh-clone db 'movies.find({"year": 2023,})'
   
   # ✅ Correct
   mongosh-clone db 'movies.find({"year": 2023})'
   ```

2. **Single quotes in JSON:**
   ```bash
   # ❌ Wrong
   mongosh-clone db "movies.find({'title': 'Movie'})"
   
   # ✅ Correct
   mongosh-clone db 'movies.find({"title": "Movie"})'
   ```

3. **Unescaped quotes:**
   ```bash
   # ❌ Wrong
   mongosh-clone db 'movies.find({"title": "The "Movie""})'
   
   # ✅ Correct
   mongosh-clone db 'movies.find({"title": "The \"Movie\""})'
   ```

### Database & Collection Issues

#### Q: "No database selected" error

```bash
# Error: No database selected. Use "use <database_name>" first.

# Solution: Select a database
mongosh-clone use mydatabase
mongosh-clone db 'collection.find({})'
```

#### Q: Collection doesn't exist

**Note:** MongoDB creates collections automatically on first insert:

```bash
# This creates the collection if it doesn't exist
mongosh-clone db 'newcollection.insertOne({"test": "data"})'
```

#### Q: Database doesn't appear in results

**Common causes:**
1. Empty database (no collections)
2. No documents in collections
3. Incorrect database name

```bash
# Check current database
mongosh-clone status

# Switch to correct database
mongosh-clone use correct_database_name
```

## Troubleshooting Steps

### 1. Basic Connectivity Test

```bash
# Step 1: Check MongoDB is running
ps aux | grep mongod

# Step 2: Test connection
mongosh-clone connect mongodb://localhost:27017

# Step 3: Check status
mongosh-clone status

# Step 4: Try simple operation
mongosh-clone use test
mongosh-clone db 'test.find({})'
```

### 2. Debug Mode

Enable debug output:

```bash
# Enable detailed logging
DEBUG=mongosh-clone:* mongosh-clone db 'collection.find({})'

# Check what's being parsed
mongosh-clone db 'collection.find({})' 2>&1 | grep "Debug"
```

### 3. Configuration Check

```bash
# Check configuration file
cat ~/.mongosh-clone-config.json

# Reset configuration if corrupted
rm ~/.mongosh-clone-config.json
mongosh-clone connect mongodb://localhost:27017
```

### 4. Environment Check

```bash
# Check Node.js version
node --version  # Should be >= 12.0.0

# Check npm installation
npm list -g mongosh-clone

# Check PATH
echo $PATH | grep npm
```

## Error Reference

### Connection Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `MongoNetworkError` | Can't reach MongoDB | Check MongoDB is running, verify host/port |
| `MongoTimeoutError` | Connection timeout | Check network, increase timeout |
| `MongoAuthenticationError` | Invalid credentials | Verify username/password |
| `MongoTopologyClosedError` | Connection closed | Reconnect to MongoDB |

### Command Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid operation format` | Syntax error | Check `collection.method()` format |
| `Invalid JSON arguments` | Malformed JSON | Validate JSON syntax |
| `Command not found` | Not installed | Run `npm install -g mongosh-clone` |
| `Permission denied` | File permissions | Check config file permissions |

### MongoDB Operation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Document validation failed` | Schema validation | Check document structure |
| `Duplicate key error` | Unique index violation | Modify document or remove duplicate |
| `Command requires authentication` | Auth enabled | Provide credentials |
| `Collection not found` | Collection doesn't exist | Create collection or check name |

## Performance Tips

### 1. Connection Reuse

```bash
# Connect once, run multiple operations
mongosh-clone connect mongodb://localhost:27017
mongosh-clone use mydb
mongosh-clone db 'collection1.find({})'
mongosh-clone db 'collection2.insertOne({})'
mongosh-clone disconnect
```

### 2. Efficient Queries

```bash
# Use specific queries instead of finding all
mongosh-clone db 'users.find({"status": "active"})'

# Count instead of retrieving all documents
mongosh-clone db 'users.countDocuments({"status": "active"})'
```

### 3. Batch Operations

```bash
# Insert multiple documents at once
mongosh-clone db 'users.insertMany([{...}, {...}, {...}])'

# Update multiple documents
mongosh-clone db 'users.updateMany({"status": "inactive"}, {"$set": {"archived": true}})'
```

## Getting Help

### Community Support

- **GitHub Issues:** [Report bugs and feature requests](https://github.com/user/mongosh-clone/issues)
- **Discussions:** [Ask questions and share ideas](https://github.com/user/mongosh-clone/discussions)

### Documentation

- [Getting Started](./getting-started.md) - Installation and setup
- [Usage Guide](./usage.md) - Complete command reference
- [API Reference](./api-reference.md) - Detailed operation docs
- [Configuration](./configuration.md) - Connection and settings

### MongoDB Resources

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Community Forums](https://community.mongodb.com/)

Still having issues? [Open an issue](https://github.com/user/mongosh-clone/issues/new) with:
- Operating system and version
- Node.js version
- MongoDB version
- Complete error message
- Commands that reproduce the issue 