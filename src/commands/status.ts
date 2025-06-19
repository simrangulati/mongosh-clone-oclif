import { Command } from '@oclif/core';
import { connectionManager } from '../lib/connection';
import chalk from 'chalk';

export default class Status extends Command {
  static description = 'Show current connection status and database information';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  async run(): Promise<void> {
    try {
      const isConnected = connectionManager.isConnected();
      const currentDb = connectionManager.getCurrentDatabase();
      const connectionString = connectionManager.getConnectionString();
      
      console.log(chalk.blue('=== MongoDB Connection Status ==='));
      
      if (isConnected) {
        console.log(chalk.green('✓ Connected to MongoDB'));
      } else {
        console.log(chalk.red('✗ Not connected to MongoDB'));
      }
      
      if (connectionString) {
        console.log(chalk.blue(`Connection String: ${connectionString}`));
      }
      
      if (currentDb) {
        console.log(chalk.yellow(`Current Database: ${currentDb}`));
      } else {
        console.log(chalk.gray('No database selected'));
      }
      
      if (!isConnected) {
        console.log(chalk.yellow('\\nUse "mongosh-clone connect" to connect to MongoDB'));
      }
      
      if (isConnected && !currentDb) {
        console.log(chalk.yellow('\\nUse "mongosh-clone use <database_name>" to select a database'));
      }
      
    } catch (error) {
      console.error(chalk.red(`Error getting status: ${error}`));
      process.exit(1);
    }
  }
} 