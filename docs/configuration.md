# ⚙️ Configuration

Configuration options and connection management for mongosh-clone.

## Configuration File

mongosh-clone stores configuration in:
```
~/.mongosh-clone-config.json
```

### Configuration Format

```json
{
  "currentDb": "sample_mflix",
  "connectionString": "mongodb://localhost:27017"
}
```

### Configuration Fields

- `currentDb` - Currently selected database name
- `connectionString` - Last used MongoDB connection string

## Connection Strings

### Local MongoDB

```bash
# Default local connection
mongodb://localhost:27017

# Local with specific database
mongodb://localhost:27017/mydatabase

# Local with non-standard port
mongodb://localhost:27018
```

### Authentication

```bash
# Username and password
mongodb://user:password@localhost:27017

# Database-specific auth
mongodb://user:password@localhost:27017/mydb?authSource=admin

# URL-encoded passwords (for special characters)
mongodb://user:p%40ssw0rd@localhost:27017
```

### MongoDB Atlas

```bash
# Atlas connection string
mongodb+srv://username:password@cluster.mongodb.net/database

# Atlas with specific options
mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
```

### Connection Options

Common connection string options:

- `authSource=admin` - Authentication database
- `ssl=true` - Enable SSL/TLS
- `retryWrites=true` - Enable retryable writes
- `w=majority` - Write concern
- `readPreference=primary` - Read preference

## Environment Variables

### MONGODB_URI

Set default connection string:

```bash
export MONGODB_URI="mongodb://localhost:27017"
mongosh-clone connect
```

### NODE_ENV

Affects logging and debug output:

```bash
export NODE_ENV=development  # More verbose output
export NODE_ENV=production   # Minimal output
```

## State Management

### Persistent State

mongosh-clone maintains state between commands:

- Current database selection
- Last connection string
- Connection status

### Manual Configuration

Edit `~/.mongosh-clone-config.json`:

```json
{
  "currentDb": "production_db",
  "connectionString": "mongodb://prod-server:27017"
}
```

### Reset Configuration

```bash
# Remove config file to reset
rm ~/.mongosh-clone-config.json

# Next connection will create new config
mongosh-clone connect mongodb://localhost:27017
```

## Security Best Practices

### Connection Strings

```bash
# ✅ Good - Use environment variables
export MONGODB_URI="mongodb://user:pass@host:27017"
mongosh-clone connect "$MONGODB_URI"

# ❌ Avoid - Hardcoded credentials in commands
mongosh-clone connect mongodb://user:pass@host:27017
```

### Configuration File

The config file contains connection strings, which may include credentials. Ensure proper file permissions:

```bash
chmod 600 ~/.mongosh-clone-config.json
```

### Atlas Security

For MongoDB Atlas:
- Use strong passwords
- Enable IP whitelisting
- Use connection string with SSL enabled
- Rotate credentials regularly

## Troubleshooting

### Connection Issues

```bash
# Check current configuration
cat ~/.mongosh-clone-config.json

# Test connection
mongosh-clone connect mongodb://localhost:27017
mongosh-clone status
```

### Authentication Problems

```bash
# Verify credentials
mongosh-clone connect mongodb://user:pass@host:27017

# Check auth database
mongosh-clone connect mongodb://user:pass@host:27017/db?authSource=admin
```

### Configuration Corruption

```bash
# Reset configuration
rm ~/.mongosh-clone-config.json
mongosh-clone connect
```

For more troubleshooting, see [FAQ](./faq.md). 