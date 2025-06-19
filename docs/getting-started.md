# 🚀 Getting Started

This guide will help you install and set up mongosh-clone on your system.

## Prerequisites

- **Node.js** >= 12.0.0
- **npm** or **yarn**
- **MongoDB** server (local or remote)

## Installation

### Option 1: Global Installation (Recommended)

```bash
npm install -g mongosh-clone
```

After installation, you can use `mongosh-clone` from anywhere in your terminal.

### Option 2: Development Installation

```bash
# Clone the repository
git clone https://github.com/user/mongosh-clone.git
cd mongosh-clone

# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage
npm link
```

## First Connection

### Connect to Local MongoDB

```bash
# Default connection (localhost:27017)
mongosh-clone connect

# Explicit local connection
mongosh-clone connect mongodb://localhost:27017
```

### Connect with Authentication

```bash
# Basic authentication
mongosh-clone connect mongodb://username:password@localhost:27017

# Connection with specific database
mongosh-clone connect mongodb://username:password@localhost:27017/mydatabase
```

### Connect to MongoDB Atlas

```bash
# Atlas connection string
mongosh-clone connect "mongodb+srv://username:password@cluster.mongodb.net/database"
```

## Basic Usage

### 1. Select a Database

```bash
mongosh-clone use sample_mflix
```

### 2. Insert a Document

```bash
mongosh-clone db 'movies.insertOne({"title": "Test Movie", "year": 2023})'
```

### 3. Query Documents

```bash
mongosh-clone db 'movies.find({"year": 2023})'
```

### 4. Check Connection Status

```bash
mongosh-clone status
```

### 5. Disconnect

```bash
mongosh-clone disconnect
```

## Shell Quoting Guide

⚠️ **Important**: Always quote JSON arguments to prevent shell interpretation.

### ✅ Correct Usage

```bash
# Single quotes (recommended)
mongosh-clone db 'movies.find({"year": 2023})'

# Double quotes with escaping
mongosh-clone db "movies.find({\"year\": 2023})"
```

### ❌ Common Mistakes

```bash
# This will fail - shell interprets {}
mongosh-clone db movies.find({"year": 2023})

# This will fail - unmatched quotes
mongosh-clone db 'movies.find({"title": "Movie"})'
```

## Next Steps

- Read the [Usage Guide](./usage.md) for detailed command examples
- Check the [API Reference](./api-reference.md) for complete operation list
- Review [Configuration](./configuration.md) for advanced settings

## Troubleshooting

### Command Not Found

```bash
# If you get "command not found"
npm list -g mongosh-clone  # Check if installed
npm link                   # Re-link if needed
```

### Connection Issues

```bash
# Check MongoDB is running
mongod --version

# Test basic connection
mongosh-clone connect mongodb://localhost:27017
mongosh-clone status
```

For more troubleshooting, see the [FAQ](./faq.md). 