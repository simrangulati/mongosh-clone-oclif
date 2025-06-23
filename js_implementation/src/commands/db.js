const { Command } = require('@oclif/core');
const { connectionManager } = require('../lib/connection-manager');
const { OperationParser } = require('../lib/operation-parser');
const chalk = require('chalk');

class Db extends Command {
  static description = 'Execute database operations';

  static examples = [
    '<%= config.bin %> <%= command.id %> movies.insertOne({"title":"The Matrix","year":1999})',
    '<%= config.bin %> <%= command.id %> movies.find({"year":1999})',
    '<%= config.bin %> <%= command.id %> users.updateOne({"name":"John"},{"$set":{"age":30}})',
    '<%= config.bin %> <%= command.id %> posts.deleteMany({"published":false})',
  ];

  static strict = false;

  async run() {
    const { argv } = await this.parse(Db);
    
    if (argv.length === 0) {
      console.error(chalk.red('Error: Please provide a database operation'));
      console.log('Example: mongosh-clone-js db movies.find({"year": 1999})');
      process.exit(1);
    }

    const operation = argv.join(' ');
    
    try {
      // Ensure we're connected to MongoDB
      await connectionManager.ensureConnected();
      
      // Parse and execute the operation
      await this.executeOperation(operation);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  }

  async executeOperation(operation) {
    console.log(`Debug - Original operation: "${operation}"`);
    
    // Use the robust parser instead of regex
    const parsed = OperationParser.parse(operation);
    OperationParser.validate(parsed);
    
    console.log(`Debug - Parsed operation:`, parsed);
    
    const { collection: collectionName, method, arguments: args } = parsed;
    
    // Get the collection
    const collection = connectionManager.getCollection(collectionName);

    // Execute the operation based on the method
    let result;
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
}

module.exports = Db; 