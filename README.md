# mongosh-clone

A MongoDB shell clone built with OCLIF that mimics the behavior of mongosh.

📚 **[Complete Documentation →](./docs/README.md)**

## Features

- Connect to MongoDB instances
- Switch between databases using `use` command
- Execute database operations with MongoDB-like syntax
- Support for common CRUD operations (insertOne, find, updateOne, deleteMany, etc.)
- Persistent connection and database state

## Installation

```bash
npm install -g mongosh-clone
```

Or for development:

```bash
npm install
npm run build
npm link
```

## Usage

### Connect to MongoDB

```bash
# Connect to default localhost:27017
mongosh-clone connect

# Connect to specific MongoDB instance
mongosh-clone connect mongodb://localhost:27017

# Connect with authentication
mongosh-clone connect mongodb://username:password@host:port/database
```

### Switch Database

```bash
mongosh-clone use sample_mflix
mongosh-clone use myapp_db
```

### Database Operations

The tool supports MongoDB-like syntax for database operations:

#### Insert Operations

```bash
# Insert a single document
mongosh-clone db movies.insertOne({"title": "The Favourite", "year": 2018, "rating": "R"})

# Insert multiple documents
mongosh-clone db movies.insertMany([{"title": "Movie 1", "year": 2020}, {"title": "Movie 2", "year": 2021}])
```

#### Query Operations

```bash
# Find documents
mongosh-clone db movies.find({"year": 2018})
mongosh-clone db movies.find({})

# Find one document
mongosh-clone db movies.findOne({"title": "The Favourite"})

# Count documents
mongosh-clone db movies.countDocuments({"year": 2018})
```

#### Update Operations

```bash
# Update one document
mongosh-clone db movies.updateOne({"title": "The Favourite"}, {"$set": {"rating": "R"}})

# Update multiple documents
mongosh-clone db movies.updateMany({"year": 2018}, {"$set": {"category": "Recent"}})
```

#### Delete Operations

```bash
# Delete one document
mongosh-clone db movies.deleteOne({"title": "Old Movie"})

# Delete multiple documents
mongosh-clone db movies.deleteMany({"year": {"$lt": 1950}})
```

#### Collection Operations

```bash
# Drop a collection
mongosh-clone db old_collection.drop()
```

### Check Status

```bash
mongosh-clone status
```

### Disconnect

```bash
# Disconnect from MongoDB and exit
mongosh-clone disconnect

# Alternative aliases
mongosh-clone exit
mongosh-clone quit
```

## Example Workflow

```bash
# 1. Connect to MongoDB (connection stays persistent)
mongosh-clone connect mongodb://localhost:27017

# 2. Switch to your database
mongosh-clone use sample_mflix

# 3. Insert a movie
mongosh-clone db movies.insertOne({
  "title": "The Favourite",
  "genres": ["Drama", "History"],
  "runtime": 121,
  "rated": "R",
  "year": 2018,
  "directors": ["Yorgos Lanthimos"],
  "cast": ["Olivia Colman", "Emma Stone", "Rachel Weisz"],
  "type": "movie"
})

# 4. Find the movie
mongosh-clone db movies.find({"title": "The Favourite"})

# 5. Run more operations (connection stays alive)
mongosh-clone db movies.countDocuments({})

# 6. Check your connection status
mongosh-clone status

# 7. When done, disconnect and exit
mongosh-clone disconnect
```

## Supported Operations

- `insertOne(document)` - Insert a single document
- `insertMany(documents)` - Insert multiple documents
- `find(query, projection)` - Find documents matching query
- `findOne(query, projection)` - Find a single document
- `updateOne(filter, update, options)` - Update a single document
- `updateMany(filter, update, options)` - Update multiple documents
- `deleteOne(filter)` - Delete a single document
- `deleteMany(filter)` - Delete multiple documents
- `countDocuments(query)` - Count documents matching query
- `drop()` - Drop a collection

## Configuration

The tool stores connection and database state in `~/.mongosh-clone-config.json`.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode with watch
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Link for local development
npm link
```

## Requirements

- Node.js >= 12.0.0
- MongoDB server (local or remote)

## License

MIT
