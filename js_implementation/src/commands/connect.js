const { Args, Command } = require('@oclif/core');
const { connectionManager } = require('../lib/connection-manager');

class Connect extends Command {
  static description = 'Connect to MongoDB database';

  static examples = [
    '<%= config.bin %> <%= command.id %> mongodb://localhost:27017',
    '<%= config.bin %> <%= command.id %> mongodb://username:password@localhost:27017/database',
  ];

  static args = {
    connectionString: Args.string({
      description: 'MongoDB connection string',
      required: true,
    }),
  };

  async run() {
    const { args } = await this.parse(Connect);
    
    try {
      const success = await connectionManager.connect(args.connectionString);
      if (!success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`Connection error: ${error.message}`);
      process.exit(1);
    }
  }
}

module.exports = Connect; 