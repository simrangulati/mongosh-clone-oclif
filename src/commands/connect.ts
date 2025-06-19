import { Args, Command } from '@oclif/core';
import { connectionManager } from '../lib/connection';
import chalk from 'chalk';

export default class Connect extends Command {
  static description = 'Connect to a MongoDB instance';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> mongodb://localhost:27017',
    '<%= config.bin %> <%= command.id %> mongodb://user:pass@host:port/database',
  ];

  static args = {
    connectionString: Args.string({
      description: 'MongoDB connection string',
      required: false,
      default: 'mongodb://localhost:27017',
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Connect);
    
    try {
      console.log(chalk.blue(`Connecting to ${args.connectionString}...`));
      await connectionManager.connect(args.connectionString);
      console.log(chalk.green('Successfully connected to MongoDB'));
      
      const currentDb = connectionManager.getCurrentDatabase();
      if (currentDb) {
        console.log(chalk.yellow(`Current database: ${currentDb}`));
      } else {
        console.log(chalk.yellow('No database selected. Use "mongosh-clone use <database_name>" to select a database.'));
      }
    } catch (error) {
      console.error(chalk.red(`Failed to connect: ${error}`));
      process.exit(1);
    }
  }
} 