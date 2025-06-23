#!/usr/bin/env node

/**
 * Command Generator Script
 * Automatically generates OCLIF command files from the CommandFactory configuration
 * This eliminates manual command creation and ensures consistency
 */

const fs = require('fs');
const path = require('path');
const { CommandFactory, COMMAND_REGISTRY, COLLECTION_OPERATIONS } = require('../src/lib/command-factory');

const COMMANDS_DIR = path.join(__dirname, '../src/commands');

/**
 * Generate a standard command file
 */
function generateStandardCommand(commandName, config) {
  const className = commandName.charAt(0).toUpperCase() + commandName.slice(1);
  
  return `/**
 * Auto-generated command: ${commandName}
 * Generated from CommandFactory configuration
 * Category: ${config.category}
 * MVP: ${config.mvp}
 */

const { Command, Args, Flags } = require('@oclif/core');
const chalk = require('chalk');
const { abdbClient } = require('../lib/abdb-client'); // Your ABDB client integration

class ${className} extends Command {
  static description = '${config.description}';
  
  static examples = [
${config.examples.map(ex => `    '${ex}'`).join(',\n')}
  ];
  
  ${config.aliases ? `static aliases = ['${config.aliases.join("', '")}'];` : ''}

  ${generateArgsDefinition(config.args)}
  
  ${generateFlagsDefinition(config.flags)}

  async run() {
    const { args, flags } = await this.parse(${className});
    
    try {
      ${config.requiresConnection ? `
      // Ensure connection is established
      if (!abdbClient.isConnected()) {
        throw new Error('Not connected to database. Run "aio app db connect" first.');
      }` : ''}
      
      // Execute the command
      console.log(chalk.blue('Executing ${commandName}...'));
      
      const result = await this.execute${className}(args, flags);
      
      // Handle response
      this.handleResponse(result);
      
    } catch (error) {
      this.handleError(error);
    }
  }

  async execute${className}(args, flags) {
    // TODO: Implement actual ${config.libMethod} call
    console.log(chalk.gray('Library method: ${config.libMethod}'));
    console.log(chalk.gray('Args:', JSON.stringify(args, null, 2)));
    console.log(chalk.gray('Flags:', JSON.stringify(flags, null, 2)));
    
    // Example implementation:
    // return await abdbClient.${config.libMethod.split('.').pop()}(args, flags);
    
    // Mock response for now
    return {
      success: true,
      data: \`\${commandName} executed successfully\`,
      metadata: {
        command: '${commandName}',
        category: '${config.category}',
        timestamp: new Date().toISOString()
      }
    };
  }

  handleResponse(result) {
    if (result.success) {
      console.log(chalk.green('✅ Success'));
      
      if (result.data) {
        if (typeof result.data === 'object') {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          console.log(result.data);
        }
      }
      
      if (result.metadata) {
        console.log(chalk.gray(\`Completed at: \${result.metadata.timestamp}\`));
      }
    } else {
      console.log(chalk.red('❌ Failed'));
      console.log(result.error || 'Unknown error occurred');
    }
  }

  handleError(error) {
    console.error(chalk.red(\`Error in ${commandName}: \${error.message}\`));
    
    // Add helpful hints based on error type
    if (error.message.includes('not connected')) {
      console.log(chalk.yellow('💡 Tip: Run "aio app db connect" to establish connection'));
    }
    
    if (error.message.includes('permission')) {
      console.log(chalk.yellow('💡 Tip: Check your workspace permissions'));
    }
    
    process.exit(1);
  }
}

module.exports = ${className};
`;
}

/**
 * Generate a collection operation command file
 */
function generateCollectionCommand(operationName, config) {
  const className = `Db${operationName.charAt(0).toUpperCase() + operationName.slice(1)}`;
  
  return `/**
 * Auto-generated collection operation: ${operationName}
 * Generated from CommandFactory configuration
 * Category: ${config.category}
 * MVP: ${config.mvp}
 * Supports: db.<collection>.${operationName}(args)
 */

const { Command } = require('@oclif/core');
const chalk = require('chalk');
const { OperationParser } = require('../lib/operation-parser');
const { abdbClient } = require('../lib/abdb-client'); // Your ABDB client integration

class ${className} extends Command {
  static description = '${config.description} - Collection operation';
  
  static examples = [
${config.examples.map(ex => `    '${ex}'`).join(',\n')}
  ];
  
  static strict = false; // Allow flexible arguments for collection operations

  async run() {
    const { argv } = await this.parse(${className});
    
    if (argv.length === 0) {
      console.error(chalk.red('Error: Please provide a collection operation'));
      console.log('Example: aio app db db.users.${operationName}(${generateExampleArgs(config.args)})');
      process.exit(1);
    }

    const operation = argv.join(' ');
    
    try {
      // Ensure connection is established
      if (!abdbClient.isConnected()) {
        throw new Error('Not connected to database. Run "aio app db connect" first.');
      }
      
      // Parse the collection operation
      const parsed = OperationParser.parse(operation);
      
      // Validate it's the correct operation
      if (parsed.method !== '${operationName}') {
        throw new Error(\`Expected ${operationName} operation, got: \${parsed.method}\`);
      }
      
      // Validate arguments
      this.validateArguments(parsed.arguments);
      
      // Execute the operation
      console.log(chalk.blue(\`Executing \${parsed.collection}.${operationName}...\`));
      
      const result = await this.execute${operationName.charAt(0).toUpperCase() + operationName.slice(1)}(parsed);
      
      // Handle response
      this.handleResponse(result, parsed);
      
    } catch (error) {
      this.handleError(error);
    }
  }

  validateArguments(args) {
    ${generateArgumentValidation(config.args)}
  }

  async execute${operationName.charAt(0).toUpperCase() + operationName.slice(1)}(parsed) {
    const { collection, arguments: args } = parsed;
    
    // TODO: Implement actual ${config.libMethod} call
    console.log(chalk.gray('Library method: ${config.libMethod}'));
    console.log(chalk.gray('Collection:', collection));
    console.log(chalk.gray('Arguments:', JSON.stringify(args, null, 2)));
    
    // Example implementation:
    // const dbCollection = abdbClient.collection(collection);
    // return await dbCollection.${operationName}(...args);
    
    // Mock response for now
    return {
      success: true,
      data: {
        operation: '${operationName}',
        collection: collection,
        ${generateMockResponseData(operationName)}
      },
      metadata: {
        timestamp: new Date().toISOString(),
        operation: '${operationName}'
      }
    };
  }

  handleResponse(result, parsed) {
    if (result.success) {
      console.log(chalk.green('✅ Operation successful'));
      
      ${config.supportsCursor ? `
      // Handle cursor responses (for find operations)
      if (result.data && Array.isArray(result.data.documents)) {
        this.handleCursorResponse(result.data.documents);
        return;
      }` : ''}
      
      if (result.data) {
        console.log(JSON.stringify(result.data, null, 2));
      }
      
      // Show operation summary
      console.log(chalk.gray(\`Operation: \${parsed.collection}.${operationName}\`));
      
    } else {
      console.log(chalk.red('❌ Operation failed'));
      console.log(result.error || 'Unknown error occurred');
    }
  }

  ${config.supportsCursor ? `
  handleCursorResponse(documents) {
    const BATCH_SIZE = 20;
    
    if (documents.length <= BATCH_SIZE) {
      console.log(JSON.stringify(documents, null, 2));
    } else {
      console.log(JSON.stringify(documents.slice(0, BATCH_SIZE), null, 2));
      console.log(chalk.yellow(\`\\nShowing \${BATCH_SIZE} of \${documents.length} documents\`));
      console.log(chalk.blue('Type "it" for more'));
      
      // TODO: Implement cursor continuation
      // This would require maintaining cursor state between commands
    }
  }` : ''}

  handleError(error) {
    console.error(chalk.red(\`Error in ${operationName}: \${error.message}\`));
    
    // Add operation-specific error hints
    ${generateErrorHints(operationName)}
    
    process.exit(1);
  }
}

module.exports = ${className};
`;
}

/**
 * Helper functions for code generation
 */
function generateArgsDefinition(args = []) {
  if (args.length === 0) return '';
  
  const argDefs = args.map(arg => {
    return `    ${arg.name}: Args.string({
      description: '${arg.description}',
      required: ${arg.required || false}${arg.default ? `,\n      default: '${arg.default}'` : ''}
    })`;
  }).join(',\n');
  
  return `static args = {
${argDefs}
  };`;
}

function generateFlagsDefinition(flags = []) {
  if (!flags || flags.length === 0) return '';
  
  const flagDefs = flags.map(flag => {
    return `    ${flag.name}: Flags.string({
      description: '${flag.description}',
      required: ${flag.required || false}${flag.default ? `,\n      default: '${flag.default}'` : ''}
    })`;
  }).join(',\n');
  
  return `static flags = {
${flagDefs}
  };`;
}

function generateArgumentValidation(args = []) {
  if (args.length === 0) return '// No argument validation needed';
  
  const validations = args.map((arg, index) => {
    if (arg.required) {
      return `    if (!args[${index}]) {
      throw new Error('${arg.description} is required');
    }`;
    }
    return '';
  }).filter(v => v).join('\n');
  
  return validations || '// Arguments are optional';
}

function generateExampleArgs(args = []) {
  if (args.length === 0) return '';
  
  const examples = args.map(arg => {
    if (arg.parser === 'json') {
      return arg.name === 'documents' ? '[{...}]' : '{...}';
    }
    return `"${arg.name}"`;
  });
  
  return examples.join(', ');
}

function generateMockResponseData(operationName) {
  const responses = {
    insertOne: 'insertedId: "507f1f77bcf86cd799439011"',
    insertMany: 'insertedCount: 2',
    updateOne: 'modifiedCount: 1',
    updateMany: 'modifiedCount: 5',
    deleteOne: 'deletedCount: 1',
    deleteMany: 'deletedCount: 3',
    find: 'documents: [{...}]',
    findOne: 'document: {...}',
    countDocuments: 'count: 42'
  };
  
  return responses[operationName] || 'result: "completed"';
}

function generateErrorHints(operationName) {
  const hints = {
    insertOne: `
    if (error.message.includes('validation')) {
      console.log(chalk.yellow('💡 Tip: Check document structure against collection schema'));
    }`,
    updateOne: `
    if (error.message.includes('filter')) {
      console.log(chalk.yellow('💡 Tip: Ensure filter matches existing documents'));
    }`,
    deleteOne: `
    if (error.message.includes('filter')) {
      console.log(chalk.yellow('💡 Tip: Use a specific filter to avoid accidental deletions'));
    }`
  };
  
  return hints[operationName] || `
    if (error.message.includes('syntax')) {
      console.log(chalk.yellow('💡 Tip: Check JSON syntax in arguments'));
    }`;
}

/**
 * Main generation logic
 */
function generateAllCommands() {
  // Ensure commands directory exists
  if (!fs.existsSync(COMMANDS_DIR)) {
    fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  }

  console.log(chalk.blue('🏭 Generating commands from factory configuration...\n'));

  let generatedCount = 0;

  // Generate standard commands
  console.log(chalk.yellow('📝 Standard Commands:'));
  Object.entries(COMMAND_REGISTRY).forEach(([name, config]) => {
    const filename = `${name}.js`;
    const filepath = path.join(COMMANDS_DIR, filename);
    const content = generateStandardCommand(name, config);
    
    fs.writeFileSync(filepath, content);
    console.log(chalk.green(`  ✅ ${filename} ${config.mvp ? '(MVP)' : ''}`));
    generatedCount++;
  });

  // Generate collection operation commands
  console.log(chalk.yellow('\n🗃️  Collection Operations:'));
  Object.entries(COLLECTION_OPERATIONS).forEach(([name, config]) => {
    const filename = `db-${name}.js`;
    const filepath = path.join(COMMANDS_DIR, filename);
    const content = generateCollectionCommand(name, config);
    
    fs.writeFileSync(filepath, content);
    console.log(chalk.green(`  ✅ ${filename} ${config.mvp ? '(MVP)' : ''}`));
    generatedCount++;
  });

  console.log(chalk.blue(`\n🎉 Generated ${generatedCount} commands successfully!`));
  console.log(chalk.gray(`Commands saved to: ${COMMANDS_DIR}`));
  
  // Generate summary
  const mvpCount = Object.values(COMMAND_REGISTRY).filter(c => c.mvp).length + 
                   Object.values(COLLECTION_OPERATIONS).filter(c => c.mvp).length;
  
  console.log(chalk.yellow(`\n📊 Summary:`));
  console.log(`  • Total commands: ${generatedCount}`);
  console.log(`  • MVP commands: ${mvpCount}`);
  console.log(`  • Non-MVP commands: ${generatedCount - mvpCount}`);
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node generate-commands.js [options]

Options:
  --help, -h     Show this help message
  --mvp-only     Generate only MVP commands
  --category     Generate commands for specific category

Examples:
  node generate-commands.js
  node generate-commands.js --mvp-only
  node generate-commands.js --category provisioning
`);
    process.exit(0);
  }
  
  generateAllCommands();
}

module.exports = {
  generateStandardCommand,
  generateCollectionCommand,
  generateAllCommands
}; 