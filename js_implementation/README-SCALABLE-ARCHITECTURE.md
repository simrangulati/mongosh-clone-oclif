# Scalable AIO ABDB CLI Architecture

## Overview

This document describes the scalable architecture designed to support all AIO ABDB CLI commands with minimal code duplication and maximum maintainability. The system is built to handle the extensive command specification provided while avoiding rework when adding new commands.

## Architecture Components

### 1. Command Factory (`src/lib/command-factory.js`)

The **Command Factory** is the heart of the scalable architecture. It provides:

- **Dynamic Command Generation**: Creates OCLIF commands from configuration
- **Categorized Operations**: Groups commands by functionality (provisioning, connection, CRUD, etc.)
- **MVP Filtering**: Separates MVP commands from extended functionality
- **Consistent Patterns**: Ensures all commands follow the same structure

```javascript
// Example usage
const { CommandFactory } = require('./src/lib/command-factory');

// Generate all commands
const allCommands = CommandFactory.generateAllCommands();

// Generate only MVP commands
const mvpCommands = CommandFactory.getMVPCommands();

// Generate commands by category
const provisioningCommands = CommandFactory.getCommandsByCategory('provisioning');
```

### 2. Command Generator Script (`scripts/generate-commands.js`)

The **Command Generator** automatically creates command files from the factory configuration:

- **Auto-Generation**: Creates command files without manual coding
- **Template-Based**: Uses templates for consistent command structure
- **Category Support**: Generates commands by category or all at once
- **MVP Mode**: Can generate only MVP commands for faster deployment

```bash
# Generate all commands
npm run generate:commands

# Generate only MVP commands
npm run generate:mvp

# Clean generated commands
npm run clean
```

### 3. ABDB Client Integration (`src/lib/abdb-client.js`)

The **ABDB Client** provides a unified interface to the ABDB library:

- **Connection Management**: Handles database connections and state
- **Error Handling**: Consistent error handling across all operations
- **Response Formatting**: Standardizes response formats
- **Mock Support**: Built-in mock mode for testing and development

### 4. Configuration System (`config/commands.json`)

The **Configuration System** allows fine-tuned control over command generation:

- **Feature Toggles**: Enable/disable command categories
- **Deployment Phases**: Define MVP vs extended functionality
- **Validation Rules**: Configure argument validation
- **Performance Settings**: Set timeouts and limits

## Command Categories

### Provisioning Commands
- `provision` - Request database provisioning
- `status` - Check provisioning status  
- `ping` - Test ABDB service connectivity

### Connection Commands
- `connect` - Establish database connection
- `dbStats` - Show database statistics
- `getCollectionNames` - List collections
- `close` - Close database connection

### Collection Management
- `createCollection` - Create collections with options
- Collection drop, rename, validate operations

### Single Document Operations
- `insertOne` - Insert single document
- `findOne` - Find single document
- `updateOne` - Update single document
- `deleteOne` - Delete single document

### Multi-Document Operations
- `insertMany` - Insert multiple documents
- `updateMany` - Update multiple documents
- `deleteMany` - Delete multiple documents

### Cursor Operations
- `find` - Find documents with cursor support
- Automatic pagination with "Type 'it' for more"
- Cursor state management

### Index Management
- `createIndex` - Create indexes
- `getIndexes` - List indexes
- `dropIndex`, `hideIndex`, `unhideIndex`

### Aggregate Operations
- `countDocuments` - Count matching documents
- `distinct` - Get distinct values
- `estimatedDocumentCount` - Estimate document count

## Benefits of This Architecture

### 1. **Zero Code Duplication**
- Commands are generated from configuration
- Common patterns are abstracted into the factory
- Changes to one command template affect all commands

### 2. **Rapid Command Addition**
Adding a new command requires only configuration:

```javascript
// Add to COMMAND_REGISTRY or COLLECTION_OPERATIONS
'newCommand': {
  category: COMMAND_CATEGORIES.SINGLE_DOC,
  description: 'New command description',
  args: [...],
  libMethod: 'collection.newMethod',
  mvp: true,
  examples: ['example usage']
}
```

Then run: `npm run generate:commands`

### 3. **Consistent Error Handling**
All commands use the same error handling patterns:
- Connection validation
- Argument validation
- Helpful error messages with tips
- Graceful failure handling

### 4. **MVP-First Development**
Commands are marked as MVP or extended, allowing phased deployment:

```bash
# Deploy MVP features first
npm run generate:mvp

# Later add extended features
npm run generate:commands
```

### 5. **Flexible Integration**
The ABDB client layer abstracts the actual library integration:
- Easy to switch from mock to real ABDB library
- Consistent interface across all commands
- Centralized connection management

## Adding New Commands

### Step 1: Define in Configuration

Add your command to either `COMMAND_REGISTRY` (for standard commands) or `COLLECTION_OPERATIONS` (for db.collection.method commands):

```javascript
'myNewCommand': {
  category: COMMAND_CATEGORIES.SINGLE_DOC,
  description: 'My new command description',
  requiresConnection: true,
  args: [
    { name: 'param1', description: 'First parameter', required: true },
    { name: 'param2', description: 'Second parameter', required: false }
  ],
  libMethod: 'collection.myNewMethod',
  mvp: true,
  examples: [
    'aio app db myNewCommand param1Value',
    'aio app db myNewCommand param1Value param2Value'
  ]
}
```

### Step 2: Generate Commands

```bash
npm run generate:commands
```

### Step 3: Implement ABDB Integration

Add the actual implementation to the ABDB client:

```javascript
// In ABDBCollection class
async myNewMethod(param1, param2, options = {}) {
  try {
    console.log(chalk.blue(`Executing myNewMethod on ${this.name}`));
    
    // TODO: Replace with actual ABDB call
    // const result = await this.client.client.collection(this.name).myNewMethod(param1, param2, options);
    
    return {
      success: true,
      data: { /* result data */ }
    };
  } catch (error) {
    return {
      success: false,
      error: `My new method failed: ${error.message}`
    };
  }
}
```

### Step 4: Test and Deploy

```bash
# Test the new command
./bin/run myNewCommand --help
./bin/run myNewCommand param1Value

# Deploy
npm publish
```

## Command Structure

All generated commands follow this consistent structure:

```javascript
class MyCommand extends Command {
  static description = 'Command description';
  static examples = ['example1', 'example2'];
  static args = { /* OCLIF args */ };
  static flags = { /* OCLIF flags */ };

  async run() {
    // 1. Parse arguments
    // 2. Validate connection (if required)
    // 3. Execute command
    // 4. Handle response
    // 5. Handle errors
  }

  async executeMyCommand(args, flags) {
    // Command-specific logic
  }

  handleResponse(result) {
    // Consistent response handling
  }

  handleError(error) {
    // Consistent error handling with helpful tips
  }
}
```

## Configuration Options

### Command Generation
```json
{
  "commandGeneration": {
    "enabled": true,
    "outputDirectory": "src/commands",
    "generateMVPOnly": false,
    "categories": {
      "provisioning": { "enabled": true, "priority": 1 },
      "connection": { "enabled": true, "priority": 2 }
    }
  }
}
```

### Deployment Phases
```json
{
  "deployment": {
    "phases": {
      "mvp": {
        "description": "Core functionality",
        "commands": ["connect", "insertOne", "findOne", ...]
      },
      "extended": {
        "description": "Advanced operations", 
        "commands": ["bulkWrite", "aggregate", ...]
      }
    }
  }
}
```

### Validation Rules
```json
{
  "validation": {
    "strictMode": true,
    "argumentValidation": {
      "json": { "maxDepth": 10, "maxSize": "1MB" },
      "collection": { "namePattern": "^[a-zA-Z][a-zA-Z0-9_-]*$" }
    }
  }
}
```

## Performance Considerations

### Connection Management
- Persistent connections across commands
- Connection pooling for multiple operations
- Automatic reconnection on failure

### Cursor Handling
- Batch processing (20 documents at a time)
- Memory-efficient cursor iteration
- "Type 'it' for more" functionality

### Error Recovery
- Graceful degradation on connection loss
- Retry mechanisms for transient failures
- Helpful error messages with troubleshooting tips

## Testing Strategy

### Mock Mode
The architecture includes comprehensive mock support:

```javascript
// Enable mock mode in configuration
{
  "integration": {
    "abdbLibrary": {
      "mockMode": true,
      "mockData": {
        "collections": ["users", "products"],
        "sampleDocuments": { /* sample data */ }
      }
    }
  }
}
```

### Unit Testing
Each command can be tested independently:

```javascript
const { CommandFactory } = require('./src/lib/command-factory');
const ConnectCommand = CommandFactory.createCommand('connect', connectConfig);

// Test command execution
const command = new ConnectCommand();
await command.run();
```

### Integration Testing
Test against real ABDB service by disabling mock mode:

```json
{
  "integration": {
    "abdbLibrary": {
      "mockMode": false
    }
  }
}
```

## Migration Path

### From Mock to Production
1. Update configuration to disable mock mode
2. Install actual ABDB library: `npm install @adobe/aio-lib-abdb`
3. Update imports in `abdb-client.js`
4. Replace mock implementations with real ABDB calls
5. Test and deploy

### Adding New Categories
1. Define new category in `COMMAND_CATEGORIES`
2. Add commands to `COMMAND_REGISTRY` or `COLLECTION_OPERATIONS`
3. Update configuration to enable the new category
4. Generate commands: `npm run generate:commands`

## Conclusion

This scalable architecture provides:

- **Zero rework** when adding new commands
- **Consistent patterns** across all operations
- **MVP-first development** approach
- **Easy testing** with mock support
- **Flexible deployment** options
- **Professional error handling** and user experience

The system can handle all the AIO ABDB commands specified in your requirements while maintaining clean, maintainable code that scales with your needs. 