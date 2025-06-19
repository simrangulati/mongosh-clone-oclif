import { Args, Command } from '@oclif/core';
import { connectionManager } from '../lib/connection';
import chalk from 'chalk';

export default class Db extends Command {
  static description = 'Execute database operations';

  static examples = [
    '<%= config.bin %> <%= command.id %> movies.insertOne({"title":"The Matrix","year":1999})',
    '<%= config.bin %> <%= command.id %> movies.find({"year":1999})',
    '<%= config.bin %> <%= command.id %> users.updateOne({"name":"John"},{"$set":{"age":30}})',
    '<%= config.bin %> <%= command.id %> posts.deleteMany({"published":false})',
  ];

  static strict = false;

  async run(): Promise<void> {
    const { argv } = await this.parse(Db);
    
    if (argv.length === 0) {
      console.error(chalk.red('Error: Please provide a database operation'));
      console.log('Example: mongosh-clone db movies.find({"year": 1999})');
      process.exit(1);
    }

    const operation = argv.join(' ');
    
    try {
      // Ensure we're connected to MongoDB
      await connectionManager.ensureConnected();
      
      // Parse and execute the operation
      await this.executeOperation(operation);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  }

  private async executeOperation(operation: string): Promise<void> {
    console.log(`Debug - Original operation: "${operation}"`);
    
    // Remove outer quotes if they exist (from shell quoting)
    // Handle cases where the entire operation is wrapped in quotes
    let cleanOperation = operation.trim();
    
    // Remove matching outer quotes (single, double, or backticks)
    if ((cleanOperation.startsWith("'") && cleanOperation.endsWith("'")) ||
        (cleanOperation.startsWith('"') && cleanOperation.endsWith('"')) ||
        (cleanOperation.startsWith('`') && cleanOperation.endsWith('`'))) {
      cleanOperation = cleanOperation.slice(1, -1);
    }
    
    console.log(`Debug - Cleaned operation: "${cleanOperation}"`);
    
    // Parse the operation: collection.method(args)
    // Fixed regex without double backslashes
    const match = cleanOperation.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)$/s);
    
    if (!match) {
      console.log(`Debug - Regex failed to match: "${cleanOperation}"`);
      throw new Error(`Invalid operation format. Use: collection.method(args). Got: "${cleanOperation}"`);
    }
    
    console.log(`Debug - Match successful:`, match);
    console.log(`Debug - Collection: "${match[1]}", Method: "${match[2]}", Args: "${match[3]}"`);

    const [, collectionName, method, argsString] = match;
    
    // Get the collection
    const collection = connectionManager.getCollection(collectionName);
    
    // Parse arguments (basic JSON parsing)
    let args: any[] = [];
    if (argsString.trim()) {
      try {
        // Handle multiple arguments separated by commas at the top level
        const parsedArgs = this.parseArguments(argsString);
        args = parsedArgs;
      } catch (error) {
        throw new Error(`Invalid JSON arguments: ${error}`);
      }
    }

    // Execute the operation based on the method
    let result: any;
    switch (method) {
      case 'insertOne':
        if (args.length !== 1) {
          throw new Error('insertOne requires exactly one document argument');
        }
        result = await collection.insertOne(args[0]);
        console.log(chalk.green('Document inserted successfully'));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'insertMany':
        if (args.length !== 1 || !Array.isArray(args[0])) {
          throw new Error('insertMany requires exactly one array argument');
        }
        result = await collection.insertMany(args[0]);
        console.log(chalk.green(`${result.insertedCount} documents inserted successfully`));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'find':
        const query = args[0] || {};
        const projection = args[1] || undefined;
        result = await collection.find(query, projection ? { projection } : {}).toArray();
        console.log(chalk.green(`Found ${result.length} document(s):`));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'findOne':
        const findOneQuery = args[0] || {};
        const findOneProjection = args[1] || undefined;
        result = await collection.findOne(findOneQuery, findOneProjection ? { projection: findOneProjection } : {});
        if (result) {
          console.log(chalk.green('Document found:'));
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(chalk.yellow('No document found'));
        }
        break;

      case 'updateOne':
        if (args.length < 2) {
          throw new Error('updateOne requires filter and update arguments');
        }
        result = await collection.updateOne(args[0], args[1], args[2] || {});
        console.log(chalk.green(`Modified ${result.modifiedCount} document(s)`));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'updateMany':
        if (args.length < 2) {
          throw new Error('updateMany requires filter and update arguments');
        }
        result = await collection.updateMany(args[0], args[1], args[2] || {});
        console.log(chalk.green(`Modified ${result.modifiedCount} document(s)`));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'deleteOne':
        if (args.length < 1) {
          throw new Error('deleteOne requires a filter argument');
        }
        result = await collection.deleteOne(args[0]);
        console.log(chalk.green(`Deleted ${result.deletedCount} document(s)`));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'deleteMany':
        if (args.length < 1) {
          throw new Error('deleteMany requires a filter argument');
        }
        result = await collection.deleteMany(args[0]);
        console.log(chalk.green(`Deleted ${result.deletedCount} document(s)`));
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'countDocuments':
        const countQuery = args[0] || {};
        result = await collection.countDocuments(countQuery);
        console.log(chalk.green(`Count: ${result}`));
        break;

      case 'drop':
        result = await collection.drop();
        console.log(chalk.green(`Collection '${collectionName}' dropped`));
        break;

      default:
        throw new Error(`Unsupported operation: ${method}`);
    }
  }

  private parseArguments(argsString: string): any[] {
    // Simple argument parser for JSON-like syntax
    argsString = argsString.trim();
    
    if (!argsString) {
      return [];
    }

    const args: any[] = [];
    let currentArg = '';
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      const prevChar = i > 0 ? argsString[i - 1] : '';
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        currentArg += char;
      } else if (inString && char === stringChar && prevChar !== '\\\\') {
        inString = false;
        stringChar = '';
        currentArg += char;
      } else if (!inString) {
        if (char === '{') {
          braceCount++;
          currentArg += char;
        } else if (char === '}') {
          braceCount--;
          currentArg += char;
        } else if (char === '[') {
          bracketCount++;
          currentArg += char;
        } else if (char === ']') {
          bracketCount--;
          currentArg += char;
        } else if (char === ',' && braceCount === 0 && bracketCount === 0) {
          // Top-level comma, this separates arguments
          args.push(JSON.parse(currentArg.trim()));
          currentArg = '';
        } else {
          currentArg += char;
        }
      } else {
        currentArg += char;
      }
    }
    
    if (currentArg.trim()) {
      args.push(JSON.parse(currentArg.trim()));
    }
    
    return args;
  }
} 