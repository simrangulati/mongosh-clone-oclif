const { Command } = require('@oclif/core');
const { connectionManager } = require('../lib/connection-manager');
const chalk = require('chalk');

class Status extends Command {
  static description = 'Show connection status';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  async run() {
    const status = connectionManager.getStatus();
    
    console.log(chalk.blue('📊 Connection Status:'));
    console.log(`Connected: ${status.connected ? chalk.green('✅ Yes') : chalk.red('❌ No')}`);
    console.log(`Database: ${status.database ? chalk.green(status.database) : chalk.gray('None')}`);
    console.log(`Last Connection: ${chalk.gray(status.lastConnection)}`);
  }
}

module.exports = Status; 