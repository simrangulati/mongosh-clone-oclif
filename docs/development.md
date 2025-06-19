# 🛠️ Development

Guide for contributing to and developing mongosh-clone.

## Development Setup

### Prerequisites

- Node.js >= 12.0.0
- npm or yarn
- MongoDB server (for testing)
- Git

### Local Development

```bash
# Clone repository  
git clone https://github.com/user/mongosh-clone.git
cd mongosh-clone

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link for global usage
npm link

# Run in development mode (watch)
npm run dev
```

## Project Structure

```
mongosh-clone/
├── src/                    # TypeScript source code
│   ├── commands/          # OCLIF command implementations
│   │   ├── connect.ts    # Connection command
│   │   ├── db.ts         # Database operations command  
│   │   ├── disconnect.ts # Disconnect command
│   │   ├── status.ts     # Status command
│   │   └── use.ts        # Database switch command
│   ├── lib/              # Utility libraries
│   │   └── connection.ts # Connection manager
│   └── index.ts          # Main entry point
├── lib/                   # Compiled JavaScript (built)
├── bin/                   # Executable scripts
│   └── run               # Main CLI entry point
├── test/                 # Test files
├── docs/                 # Documentation
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Main documentation
```

## Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Development mode with file watching
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Generate OCLIF manifest
npm run prepack

# Clean build artifacts
rm -rf lib/
```

## Architecture

### Command Flow

```
User Input → OCLIF Parser → Command Handler → Connection Manager → MongoDB Driver → MongoDB Server
```

### Key Components

1. **OCLIF Commands** (`src/commands/`)
   - Handle CLI argument parsing
   - Validate user input
   - Execute business logic

2. **Connection Manager** (`src/lib/connection.ts`)
   - Manages MongoDB connections
   - Maintains state between commands
   - Handles configuration persistence

3. **Regex Parser** (`src/commands/db.ts`)
   - Parses `collection.method(args)` syntax
   - Handles JSON argument parsing
   - Maps to MongoDB operations

## Adding New Operations

### Step 1: Add Method Handler

Edit `src/commands/db.ts`:

```typescript
// In the switch statement
case 'newOperation':
  if (args.length !== expectedArgs) {
    throw new Error('newOperation requires X arguments');
  }
  result = await collection.newOperation(args[0], args[1]);
  console.log(chalk.green('Operation successful'));
  console.log(JSON.stringify(result, null, 2));
  break;
```

### Step 2: Add Examples

Update command examples:

```typescript
static examples = [
  // ... existing examples
  '<%= config.bin %> <%= command.id %> collection.newOperation(arg1, arg2)',
];
```

### Step 3: Add Tests

Create test in `test/commands/db.test.ts`:

```typescript
test
.stdout()
.command(['db', 'test.newOperation({"param": "value"})'])
.it('runs newOperation', ctx => {
  expect(ctx.stdout).to.contain('Operation successful')
});
```

### Step 4: Update Documentation

Add to `docs/api-reference.md`:

```markdown
#### `newOperation(param1, param2)`

Description of the new operation.

**Examples:**
```bash
mongosh-clone db 'collection.newOperation(param1, param2)'
```
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "db command"

# Run tests in watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Start MongoDB for testing
mongod --dbpath /tmp/test-db --port 27018

# Run integration tests
npm run test:integration
```

### Manual Testing

```bash
# Build and link
npm run build && npm link

# Test basic operations
mongosh-clone connect mongodb://localhost:27017
mongosh-clone use test_db
mongosh-clone db 'test.insertOne({"test": true})'
mongosh-clone db 'test.find({})'
mongosh-clone disconnect
```

## Code Style

### TypeScript Standards

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use async/await over callbacks
- Follow OCLIF patterns for commands

### ESLint Configuration

The project uses OCLIF ESLint presets:

```bash
# Check linting
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Code Formatting

```bash
# Format code (if prettier is configured)
npm run format
```

## Error Handling

### Command Errors

```typescript
// In command handlers
try {
  // Operation logic
  result = await operation();
  console.log(chalk.green('Success message'));
} catch (error) {
  console.error(chalk.red(`Error: ${error}`));
  process.exit(1);
}
```

### Connection Errors

```typescript
// In connection manager
try {
  await this.client.connect();
} catch (error) {
  throw new Error(`Failed to connect: ${error.message}`);
}
```

## Debugging

### Debug Output

Enable debug logging:

```bash
# Enable debug mode
DEBUG=mongosh-clone:* mongosh-clone db 'collection.find({})'

# Node.js debugging
node --inspect bin/run db 'collection.find({})'
```

### Debug Commands

Add debug logging in commands:

```typescript
console.log(`Debug - Operation: "${operation}"`);
console.log(`Debug - Args:`, args);
```

## Contributing

### Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-operation`
3. Make changes and add tests
4. Run tests: `npm test`
5. Lint code: `npm run lint`
6. Commit changes: `git commit -m "Add new operation"`
7. Push branch: `git push origin feature/new-operation`
8. Create Pull Request

### Commit Guidelines

Use conventional commits:

```bash
feat: add support for aggregation operations
fix: handle connection timeout errors
docs: update API reference for new operations
test: add integration tests for update operations
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
```

## Release Process

### Version Bumping

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor  

# Major version (breaking changes)
npm version major
```

### Publishing

```bash
# Build and test
npm run build
npm test

# Publish to npm
npm publish

# Create GitHub release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## IDE Setup

### VS Code

Recommended extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- MongoDB for VS Code

### Settings

`.vscode/settings.json`:
```json
{
  "typescript.preferences.quoteStyle": "single",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

For questions or support, open an issue on [GitHub](https://github.com/user/mongosh-clone/issues). 