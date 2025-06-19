import { Command } from '@oclif/core';
import { connectionManager } from '../lib/connection';
import chalk from 'chalk';

export default class Disconnect extends Command {
  static description = 'Disconnect from MongoDB and exit';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static aliases = ['exit', 'quit'];

  async run(): Promise<void> {
    try {
      const isConnected = connectionManager.isConnected();
      
      if (isConnected) {
        console.log(chalk.blue('Disconnecting from MongoDB...'));
        await connectionManager.disconnect();
        console.log(chalk.green('Successfully disconnected from MongoDB'));
      } else {
        console.log(chalk.yellow('No active connection to disconnect'));
      }
      
      console.log(chalk.blue('Goodbye!'));
      process.exit(0);
      
    } catch (error) {
      console.error(chalk.red(`Error during disconnect: ${error}`));
      process.exit(1);
    }
  }
} 