const { Args, Command } = require('@oclif/core');
const { connectionManager } = require('../lib/connection-manager');
const chalk = require('chalk');

class Use extends Command {
  static description = 'Switch to a database';

  static examples = [
    '<%= config.bin %> <%= command.id %> sample_mflix',
    '<%= config.bin %> <%= command.id %> myapp_production',
  ];

  static args = {
    database: Args.string({
      description: 'Database name to switch to',
      required: true,
    }),
  };

  async run() {
    const { args } = await this.parse(Use);
    
    try {
      connectionManager.useDatabase(args.database);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  }
}

module.exports = Use; 