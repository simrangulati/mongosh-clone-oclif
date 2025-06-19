import { Args, Command } from '@oclif/core';
import { connectionManager } from '../lib/connection';
import chalk from 'chalk';

export default class Use extends Command {
  static description = 'Switch to a database';

  static examples = [
    '<%= config.bin %> <%= command.id %> sample_mflix',
    '<%= config.bin %> <%= command.id %> myapp',
  ];

  static args = {
    database: Args.string({
      description: 'database name to switch to',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Use);
    
    try {
      // Ensure we're connected to MongoDB
      await connectionManager.ensureConnected();
      
      // Switch to the specified database
      connectionManager.useDatabase(args.database);
      
      console.log(chalk.green(`switched to db ${args.database}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  }
} 