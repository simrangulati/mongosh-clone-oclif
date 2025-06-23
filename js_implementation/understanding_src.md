# Understanding the `src` Directory

This document provides a comprehensive explanation of each file in the `src` directory and their relationships within the mongosh-clone OCLIF application.

## File Structure and Relationships

The `src` directory is organized into two main subdirectories:

### `src/lib/` - Core Library Components

#### 1. **`connection-manager.js`** (142 lines)
**Purpose**: Manages MongoDB connections and database state.

**Key Features**:
- Singleton pattern for managing a single MongoDB connection
- Handles connection/disconnection to MongoDB
- Manages database switching (`use <database>`)
- Provides collection access
- Persists connection configuration in `~/.mongosh-clone-js-config.json`

**Key Methods**:
- `connect(connectionString)` - Connect to MongoDB
- `disconnect()` - Close connection
- `useDatabase(dbName)` - Switch to a database
- `getCollection(collectionName)` - Get collection instance
- `getStatus()` - Get connection status

#### 2. **`operation-parser.js`** (340 lines)
**Purpose**: Parses MongoDB-like operation syntax into structured data.

**Key Features**:
- Tokenizes operations like `collection.method(args)`
- Handles complex JSON arguments with proper parsing
- Validates operation syntax and arguments
- Supports nested JSON and multiple arguments

**Key Methods**:
- `parse(operation)` - Main parsing method
- `tokenize(operation)` - Break operation into tokens
- `parseArguments(argsString)` - Parse JSON arguments
- `validate(parsed)` - Validate parsed operations

#### 3. **`abdb-client.js`** (681 lines)
**Purpose**: ABDB (Adobe Database) client integration layer.

**Key Features**:
- Mock implementation of ABDB operations (for development)
- Handles provisioning, connection, and database operations
- Provides MongoDB-like API for ABDB
- Manages workspace connections and configuration

**Note**: This appears to be a different database system (ABDB) than the MongoDB implementation used by other files.

#### 4. **`command-factory.js`** (517 lines)
**Purpose**: Dynamic command generation factory for OCLIF commands.

**Key Features**:
- Registry-based command configuration
- Automatically generates OCLIF commands from configuration
- Supports different command categories (provisioning, connection, collection operations)
- Handles both direct commands and collection operations

### `src/commands/` - OCLIF Command Implementations

#### 1. **`connect.js`** (34 lines)
**Purpose**: OCLIF command for connecting to MongoDB.

**Functionality**:
- Takes MongoDB connection string as argument
- Uses `connectionManager` to establish connection
- Handles connection errors and exits on failure

**Example Usage**:
```bash
mongosh-clone-js connect mongodb://localhost:27017
mongosh-clone-js connect mongodb://username:password@localhost:27017/database
```

#### 2. **`disconnect.js`** (27 lines)
**Purpose**: OCLIF command for disconnecting from MongoDB.

**Functionality**:
- Closes MongoDB connection via `connectionManager`
- Has aliases: `exit`, `quit`
- Gracefully exits the application

**Example Usage**:
```bash
mongosh-clone-js disconnect
mongosh-clone-js exit
mongosh-clone-js quit
```

#### 3. **`status.js`** (22 lines)
**Purpose**: OCLIF command to show connection status.

**Functionality**:
- Displays current connection state
- Shows connected database name
- Uses colored output with `chalk`

**Example Usage**:
```bash
mongosh-clone-js status
```

#### 4. **`use.js`** (32 lines)
**Purpose**: OCLIF command to switch databases.

**Functionality**:
- Takes database name as argument
- Uses `connectionManager.useDatabase()` to switch context
- Updates current database state

**Example Usage**:
```bash
mongosh-clone-js use sample_mflix
mongosh-clone-js use myapp_production
```

#### 5. **`db.js`** (149 lines)
**Purpose**: Main command for executing database operations.

**Functionality**:
- Accepts flexible arguments for MongoDB operations
- Uses `OperationParser` to parse operation syntax
- Executes operations on collections via `connectionManager`
- Supports multiple MongoDB operations

**Supported Operations**:
- `insertOne` - Insert a single document
- `insertMany` - Insert multiple documents
- `find` - Find documents with query
- `findOne` - Find a single document
- `updateOne` - Update a single document
- `updateMany` - Update multiple documents
- `deleteOne` - Delete a single document
- `deleteMany` - Delete multiple documents
- `countDocuments` - Count documents matching query
- `drop` - Drop collection

**Example Usage**:
```bash
mongosh-clone-js db movies.insertOne({"title":"The Matrix","year":1999})
mongosh-clone-js db movies.find({"year":1999})
mongosh-clone-js db users.updateOne({"name":"John"},{"$set":{"age":30}})
mongosh-clone-js db posts.deleteMany({"published":false})
```

## Relationships and Data Flow

```
User Input
    ↓
OCLIF Commands (src/commands/)
    ↓
ConnectionManager (manages MongoDB connection)
    ↓
OperationParser (parses operation syntax)
    ↓
MongoDB Operations (via native MongoDB driver)
```

### Key Relationships:

1. **`connection-manager.js`** is the **central hub** - all commands depend on it for database access
2. **`operation-parser.js`** is used by **`db.js`** to parse complex MongoDB operation syntax
3. **`command-factory.js`** and **`abdb-client.js`** appear to be part of a different system (ABDB) that's not currently integrated with the main MongoDB commands
4. All commands in `src/commands/` import and use the singleton `connectionManager`

### Architecture Pattern:

The codebase follows a **layered architecture**:
- **Command Layer**: OCLIF commands handle CLI interaction
- **Business Logic Layer**: ConnectionManager handles state and operations
- **Parsing Layer**: OperationParser handles syntax parsing
- **Data Layer**: MongoDB native driver handles database operations

## Usage Flow

The typical usage flow for the application:

1. **Connect**: `mongosh-clone-js connect mongodb://localhost:27017`
2. **Select Database**: `mongosh-clone-js use mydb`
3. **Execute Operations**: `mongosh-clone-js db collection.find({})`
4. **Check Status**: `mongosh-clone-js status`
5. **Disconnect**: `mongosh-clone-js disconnect`

## Dependencies Between Files

### Direct Dependencies:
- `src/commands/connect.js` → `src/lib/connection-manager.js`
- `src/commands/disconnect.js` → `src/lib/connection-manager.js`
- `src/commands/status.js` → `src/lib/connection-manager.js`
- `src/commands/use.js` → `src/lib/connection-manager.js`
- `src/commands/db.js` → `src/lib/connection-manager.js` + `src/lib/operation-parser.js`

### Isolated Components:
- `src/lib/abdb-client.js` - Standalone ABDB implementation
- `src/lib/command-factory.js` - Standalone command generator (not currently used by main commands)

## Configuration and State Management

- **Connection State**: Managed by `ConnectionManager` singleton
- **Configuration Persistence**: Stored in `~/.mongosh-clone-js-config.json`
- **Current Database**: Tracked in `ConnectionManager.currentDb`
- **MongoDB Client**: Managed by `ConnectionManager.client`

This architecture provides a clean separation of concerns while maintaining a MongoDB shell-like experience through the CLI interface. 