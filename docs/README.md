# mongosh-clone Documentation

A MongoDB shell clone built with OCLIF that mimics the behavior of mongosh.

## 📚 Documentation Index

- [🚀 **Getting Started**](./getting-started.md) - Installation and basic setup
- [💻 **Usage Guide**](./usage.md) - Complete command reference and examples  
- [🔧 **API Reference**](./api-reference.md) - Detailed operation documentation
- [⚙️ **Configuration**](./configuration.md) - Connection and settings management
- [🛠️ **Development**](./development.md) - Contributing and development setup
- [❓ **FAQ & Troubleshooting**](./faq.md) - Common issues and solutions
- [🔄 **Migration Guide**](./migration.md) - Migrating from mongosh to mongosh-clone

## 🎯 Quick Start

```bash
# Install
npm install -g mongosh-clone

# Connect to MongoDB
mongosh-clone connect mongodb://localhost:27017

# Use a database
mongosh-clone use sample_mflix

# Run operations
mongosh-clone db 'movies.find({"year": 2018})'
```

## 🌟 Key Features

- ✅ **MongoDB-like syntax** - Familiar commands for MongoDB users
- ✅ **Persistent connections** - Connection state maintained between commands  
- ✅ **CRUD operations** - Full support for Create, Read, Update, Delete
- ✅ **JSON arguments** - Native JSON support with proper parsing
- ✅ **Shell integration** - Works seamlessly with shell scripting
- ✅ **Cross-platform** - Works on macOS, Linux, and Windows

## 🔗 Links

- [GitHub Repository](https://github.com/user/mongosh-clone)
- [npm Package](https://npmjs.com/package/mongosh-clone)
- [Issue Tracker](https://github.com/user/mongosh-clone/issues) 