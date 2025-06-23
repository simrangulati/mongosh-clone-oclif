const { Command } = require('@oclif/core');
const { connectionManager } = require('../lib/connection-manager');

class Disconnect extends Command {
  static description = 'Disconnect from MongoDB and exit';

  static aliases = ['exit', 'quit'];

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> exit',
    '<%= config.bin %> quit',
  ];

  async run() {
    try {
      await connectionManager.disconnect();
      console.log('Goodbye! 👋');
      process.exit(0);
    } catch (error) {
      console.error(`Disconnect error: ${error.message}`);
      process.exit(1);
    }
  }
}

module.exports = Disconnect; 