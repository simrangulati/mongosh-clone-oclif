const acorn = require('acorn');
const walk = require('acorn-walk');

// Test cases including chained operations
const CLI_TEST_PATTERNS = [
  // === BASIC CRUD OPERATIONS ===
  'db.users.insertOne({ name: "John", age: 30 })',
  'db.users.insertMany([{ name: "Alice" }, { name: "Bob" }])',
  'db.users.find({ age: { $gte: 18 } })',
  'db.users.findOne({ name: "John" })',
  'db.users.updateOne({ name: "John" }, { $set: { age: 31 } })',
  'db.users.updateMany({ age: { $lt: 18 } }, { $set: { status: "minor" } })',
  'db.users.replaceOne({ name: "John" }, { name: "John", age: 32, status: "active" })',
  'db.users.deleteOne({ name: "John" })',
  'db.users.deleteMany({ status: "inactive" })',
  
  // === CHAINED OPERATIONS ===
  'db.users.find({}).sort({ name: 1 })',
  'db.users.find({}).limit(10)',
  'db.users.find({}).skip(20)',
  'db.users.find({}).sort({ age: -1 }).limit(5)',
  'db.users.find({ status: "active" }).sort({ createdAt: -1 }).limit(10).skip(20)',
  'db.users.find({}).hint({ name: 1 }).explain()',
  'db.users.find({}).sort({ name: 1 }).limit(10).skip(5).hint({ name: 1 })',
  'db.products.find({ category: "electronics" }).sort({ price: 1 }).limit(20)',
  'db.orders.find({ status: "pending" }).sort({ createdAt: -1 }).limit(100)',
  
  // === COMPLEX CHAINED OPERATIONS ===
  'db.users.find({ age: { $gte: 18 } }).sort({ name: 1, age: -1 }).limit(50).skip(100)',
  'db.articles.find({ $text: { $search: "mongodb" } }).sort({ score: { $meta: "textScore" } }).limit(10)',
  'db.logs.find({ level: "error" }).sort({ timestamp: -1 }).limit(1000).hint({ timestamp: -1 })',
  
  // === AGGREGATION FRAMEWORK ===
  'db.users.aggregate([{ $match: { age: { $gte: 18 } } }, { $group: { _id: "$status", count: { $sum: 1 } } }])',
  'db.sales.aggregate([{ $unwind: "$items" }, { $group: { _id: "$items.category", total: { $sum: "$items.price" } } }])',
  
  // === COUNTING AND STATISTICS ===
  'db.users.countDocuments({ status: "active" })',
  'db.users.count({ age: { $gte: 18 } })',
  'db.users.estimatedDocumentCount()',
  'db.users.distinct("status")',
  'db.users.distinct("age", { status: "active" })',
  
  // === INDEXING OPERATIONS ===
  'db.users.createIndex({ name: 1 })',
  'db.users.createIndex({ name: 1, age: -1 })',
  'db.users.createIndex({ email: 1 }, { unique: true })',
  'db.users.createIndex({ location: "2dsphere" })',
  'db.users.createIndex({ title: "text", content: "text" })',
  'db.users.getIndexes()',
  'db.users.dropIndex({ name: 1 })',
  'db.users.dropIndex("name_1")',
  'db.users.dropIndexes()',
  'db.users.reIndex()',
  
  // === DATABASE LEVEL OPERATIONS ===
  'db.createCollection("new_collection")',
  'db.createCollection("capped_collection", { capped: true, size: 100000 })',
  'db.dropDatabase()',
  'db.stats()',
  'db.serverStatus()',
  'db.runCommand({ ping: 1 })',
  'db.runCommand({ collStats: "users" })',
  'db.runCommand({ dbStats: 1 })',
  'db.adminCommand({ listCollections: 1 })',
  'db.getCollectionNames()',
  'db.getCollectionInfos()',
  'db.getMongo()',
  'db.getName()',
  
  // === TRANSACTIONS ===
  'db.users.findOneAndUpdate({ name: "John" }, { $inc: { visits: 1 } })',
  'db.users.findOneAndReplace({ name: "John" }, { name: "John", age: 30 })',
  'db.users.findOneAndDelete({ name: "John" })',
];

// CHAINED OPERATIONS TEST CASES
const CHAINED_TEST_CASES = [
  // Valid chained operations
  'db.users.find({}).sort({ name: 1 })',
  'db.users.find({}).limit(10)',
  'db.users.find({}).skip(5)',
  'db.users.find({}).hint({ name: 1 })',
  'db.users.find({}).explain()',
  'db.users.find({}).explain("executionStats")',
  
  // Multiple chains
  'db.users.find({}).sort({ name: 1 }).limit(10)',
  'db.users.find({}).skip(20).limit(10)',
  'db.users.find({}).sort({ age: -1 }).limit(5).skip(10)',
  'db.users.find({}).hint({ name: 1 }).sort({ name: 1 }).limit(20)',
  'db.users.find({}).sort({ name: 1 }).limit(10).skip(5).hint({ name: 1 }).explain()',
  
  // Complex chaining with filters
  'db.products.find({ category: "electronics", price: { $lt: 1000 } }).sort({ price: 1 }).limit(20)',
  'db.orders.find({ status: "completed", total: { $gte: 100 } }).sort({ createdAt: -1 }).skip(50).limit(25)',
  
  // Invalid chaining (should be caught)
  'db.users.insertOne({}).sort({ name: 1 })',  // insertOne doesn't return cursor
  'db.users.updateOne({}, {}).limit(10)',      // updateOne doesn't return cursor
  'db.users.find({}).insertOne({})',           // Can't chain insertOne after find
];

// Operations that support chaining (return cursors)
const CHAINABLE_OPERATIONS = {
  'find': { returnsCursor: true, description: 'Find documents' },
  'aggregate': { returnsCursor: true, description: 'Run aggregation pipeline' }
};

// Cursor methods (can be chained after find/aggregate)
const CURSOR_METHODS = {
  'sort': { requiresArgs: true, description: 'Sort results' },
  'limit': { requiresArgs: true, description: 'Limit number of results' },
  'skip': { requiresArgs: true, description: 'Skip number of results' },
  'hint': { requiresArgs: true, description: 'Force use of specific index' },
  'explain': { requiresArgs: false, description: 'Explain query execution' },
  'count': { requiresArgs: false, description: 'Count results' },
  'toArray': { requiresArgs: false, description: 'Convert to array' },
  'forEach': { requiresArgs: true, description: 'Iterate over results' },
  'map': { requiresArgs: true, description: 'Map over results' },
  'next': { requiresArgs: false, description: 'Get next document' },
  'hasNext': { requiresArgs: false, description: 'Check if more documents' },
  'close': { requiresArgs: false, description: 'Close cursor' }
};

// All valid MongoDB operations (non-chainable)
const VALID_OPERATIONS = {
  // CRUD Operations
  'insertOne': { requiresArgs: true, returnsCursor: false, description: 'Insert a single document' },
  'insertMany': { requiresArgs: true, returnsCursor: false, description: 'Insert multiple documents' },
  'find': { requiresArgs: false, returnsCursor: true, description: 'Find documents' },
  'findOne': { requiresArgs: false, returnsCursor: false, description: 'Find a single document' },
  'updateOne': { requiresArgs: true, returnsCursor: false, description: 'Update a single document' },
  'updateMany': { requiresArgs: true, returnsCursor: false, description: 'Update multiple documents' },
  'replaceOne': { requiresArgs: true, returnsCursor: false, description: 'Replace a single document' },
  'deleteOne': { requiresArgs: true, returnsCursor: false, description: 'Delete a single document' },
  'deleteMany': { requiresArgs: true, returnsCursor: false, description: 'Delete multiple documents' },
  
  // Aggregation
  'aggregate': { requiresArgs: true, returnsCursor: true, description: 'Run aggregation pipeline' },
  'mapReduce': { requiresArgs: true, returnsCursor: false, description: 'Run map-reduce operation' },
  
  // Counting and Statistics
  'countDocuments': { requiresArgs: false, returnsCursor: false, description: 'Count documents matching filter' },
  'count': { requiresArgs: false, returnsCursor: false, description: 'Count documents (deprecated)' },
  'estimatedDocumentCount': { requiresArgs: false, returnsCursor: false, description: 'Estimate total document count' },
  'distinct': { requiresArgs: true, returnsCursor: false, description: 'Get distinct values for a field' },
  
  // Indexing
  'createIndex': { requiresArgs: true, returnsCursor: false, description: 'Create an index' },
  'getIndexes': { requiresArgs: false, returnsCursor: false, description: 'List all indexes' },
  'dropIndex': { requiresArgs: true, returnsCursor: false, description: 'Drop an index' },
  'dropIndexes': { requiresArgs: false, returnsCursor: false, description: 'Drop all indexes' },
  'reIndex': { requiresArgs: false, returnsCursor: false, description: 'Rebuild all indexes' },
  
  // Collection Management
  'drop': { requiresArgs: false, returnsCursor: false, description: 'Drop the collection' },
  'stats': { requiresArgs: false, returnsCursor: false, description: 'Get collection statistics' },
  'validate': { requiresArgs: false, returnsCursor: false, description: 'Validate collection' },
  'renameCollection': { requiresArgs: true, returnsCursor: false, description: 'Rename collection' },
  
  // Find and Modify
  'findOneAndUpdate': { requiresArgs: true, returnsCursor: false, description: 'Find and update a document' },
  'findOneAndReplace': { requiresArgs: true, returnsCursor: false, description: 'Find and replace a document' },
  'findOneAndDelete': { requiresArgs: true, returnsCursor: false, description: 'Find and delete a document' }
};

// Database-level operations
const DB_LEVEL_OPERATIONS = {
  'createCollection': { requiresArgs: true, description: 'Create a new collection' },
  'dropDatabase': { requiresArgs: false, description: 'Drop the entire database' },
  'stats': { requiresArgs: false, description: 'Get database statistics' },
  'serverStatus': { requiresArgs: false, description: 'Get server status' },
  'runCommand': { requiresArgs: true, description: 'Run a database command' },
  'adminCommand': { requiresArgs: true, description: 'Run an admin command' },
  'getCollectionNames': { requiresArgs: false, description: 'List collection names' },
  'getCollectionInfos': { requiresArgs: false, description: 'Get collection information' },
  'getMongo': { requiresArgs: false, description: 'Get MongoDB connection' },
  'getName': { requiresArgs: false, description: 'Get database name' }
};

// Performance metrics
let performanceMetrics = {
  totalTests: 0,
  successfulParses: 0,
  failedParses: 0,
  validCommands: 0,
  invalidCommands: 0,
  chainedCommands: 0,
  totalParseTime: 0,
  averageParseTime: 0,
  maxParseTime: 0,
  minParseTime: Infinity
};

// Function to extract value from AST node
function extractValue(node) {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'ObjectExpression':
      const obj = {};
      node.properties.forEach(prop => {
        const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
        obj[key] = extractValue(prop.value);
      });
      return obj;
    case 'ArrayExpression':
      return node.elements.map(el => el ? extractValue(el) : null);
    case 'Identifier':
      return node.name;
    case 'UnaryExpression':
      if (node.operator === '-') {
        return -extractValue(node.argument);
      }
      return `[UnaryExpression: ${node.operator}]`;
    case 'FunctionExpression':
      return `[Function]`;
    case 'RegExpLiteral':
      return `[RegExp: ${node.pattern}]`;
    default:
      return `[${node.type}]`;
  }
}

// Enhanced function to parse chained operations
function parseChainedOperation(node) {
  const operations = [];
  let current = node;
  
  // Walk through the chain from right to left
  while (current && current.type === 'CallExpression') {
    const method = current.callee.property ? current.callee.property.name : null;
    const args = current.arguments.map(extractValue);
    
    if (method) {
      operations.unshift({ method, args });
    }
    
    // Move to the next level in the chain
    current = current.callee.object;
  }
  
  // Extract the base chain (db.collection)
  const baseChain = [];
  while (current) {
    if (current.type === 'MemberExpression') {
      baseChain.unshift(current.property.name);
      current = current.object;
    } else if (current.type === 'Identifier') {
      baseChain.unshift(current.name);
      break;
    } else {
      break;
    }
  }
  
  return { baseChain, operations };
}

function validateChainedOperations(baseChain, operations) {
  const errors = [];
  
  // Validate base chain first
  if (baseChain.length < 2 || baseChain[0] !== 'db') {
    errors.push(`Invalid base chain: ${baseChain.join('.')}. Must start with 'db'`);
    return errors;
  }
  
  if (operations.length === 0) {
    errors.push('No operations found in chain');
    return errors;
  }
  
  // Check if it's a database-level operation
  if (baseChain.length === 2) {
    const dbOperation = DB_LEVEL_OPERATIONS[operations[0].method];
    if (!dbOperation) {
      errors.push(`Invalid database operation '${operations[0].method}'`);
    }
    if (operations.length > 1) {
      errors.push(`Database operations cannot be chained`);
    }
    return errors;
  }
  
  // Collection-level operations
  if (baseChain.length !== 3) {
    errors.push(`Invalid collection chain length: ${baseChain.length}. Expected db.collection`);
    return errors;
  }
  
  // Validate collection name
  const collection = baseChain[1];
  if (!/^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(collection)) {
    errors.push(`Invalid collection name '${collection}'`);
  }
  
  // Validate operation chain
  let expectsCursor = false;
  
  for (let i = 0; i < operations.length; i++) {
    const { method, args } = operations[i];
    
    if (i === 0) {
      // First operation must be a valid collection operation
      const operation = VALID_OPERATIONS[method];
      if (!operation) {
        errors.push(`Invalid collection operation '${method}'`);
        continue;
      }
      
      // Check if operation requires arguments
      if (operation.requiresArgs && (!args || args.length === 0)) {
        errors.push(`Operation '${method}' requires arguments`);
      }
      
      // Check if this operation returns a cursor
      expectsCursor = operation.returnsCursor;
      
    } else {
      // Subsequent operations must be cursor methods
      if (!expectsCursor) {
        errors.push(`Cannot chain '${method}' after '${operations[i-1].method}' - previous operation doesn't return a cursor`);
        continue;
      }
      
      const cursorMethod = CURSOR_METHODS[method];
      if (!cursorMethod) {
        errors.push(`Invalid cursor method '${method}'. Valid cursor methods: ${Object.keys(CURSOR_METHODS).join(', ')}`);
        continue;
      }
      
      // Check if cursor method requires arguments
      if (cursorMethod.requiresArgs && (!args || args.length === 0)) {
        errors.push(`Cursor method '${method}' requires arguments`);
      }
      
      // Most cursor methods still return cursors (for further chaining)
      // Only terminal methods like toArray(), forEach() don't return cursors
      expectsCursor = !['toArray', 'forEach', 'next', 'close'].includes(method);
    }
  }
  
  return errors;
}

function parseMongoCommandWithMetrics(code, testType = 'STANDARD') {
  const startTime = Date.now();
  performanceMetrics.totalTests++;
  
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    let foundValidCommand = false;
    
    walk.simple(ast, {
      CallExpression(node) {
        // Parse the chained operation
        const { baseChain, operations } = parseChainedOperation(node);
        
        // Validate the chained operations
        const validationErrors = validateChainedOperations(baseChain, operations);
        
        if (validationErrors.length === 0) {
          performanceMetrics.validCommands++;
          foundValidCommand = true;
          
          if (operations.length > 1) {
            performanceMetrics.chainedCommands++;
          }
          
          if (testType === 'VERBOSE') {
            console.log('✅ Valid MongoDB operation chain:');
            console.log('  Base Chain:', baseChain.join('.'));
            if (baseChain.length === 3) {
              console.log('  Collection:', baseChain[1]);
            }
            console.log('  Operations:');
            operations.forEach((op, i) => {
              const isFirst = i === 0;
              const isCursorMethod = !isFirst;
              const opType = isFirst ? 
                (baseChain.length === 2 ? 'Database' : 'Collection') : 
                'Cursor';
              console.log(`    ${i + 1}. ${op.method}(${JSON.stringify(op.args)}) [${opType} Method]`);
            });
            console.log('  Chain Type:', operations.length > 1 ? 'CHAINED' : 'SINGLE');
          }
        } else {
          performanceMetrics.invalidCommands++;
          if (testType === 'VERBOSE') {
            console.log('❌ Invalid MongoDB operation chain:');
            console.log('  Base Chain:', baseChain.join('.'));
            console.log('  Operations:', operations.map(op => op.method).join(' -> '));
            validationErrors.forEach(error => console.log(`  • ${error}`));
          }
        }
      }
    });
    
    performanceMetrics.successfulParses++;
    
  } catch (error) {
    performanceMetrics.failedParses++;
    if (testType === 'VERBOSE') {
      console.log('❌ Parse error:', error.message);
    }
  }
  
  const parseTime = Date.now() - startTime;
  performanceMetrics.totalParseTime += parseTime;
  performanceMetrics.maxParseTime = Math.max(performanceMetrics.maxParseTime, parseTime);
  performanceMetrics.minParseTime = Math.min(performanceMetrics.minParseTime, parseTime);
}

function runChainedOperationTests() {
  console.log('🔗 MongoDB Chained Operations Test\n');
  console.log('='.repeat(50));
  
  // Test standard operations
  console.log('\n📋 STANDARD OPERATIONS');
  console.log('-'.repeat(30));
  CLI_TEST_PATTERNS.forEach(pattern => {
    parseMongoCommandWithMetrics(pattern, 'SILENT');
  });
  
  // Test chained operations specifically
  console.log('\n🔗 CHAINED OPERATIONS TEST');
  console.log('-'.repeat(30));
  console.log(`Testing ${CHAINED_TEST_CASES.length} chained operation patterns...`);
  
  CHAINED_TEST_CASES.forEach(pattern => {
    parseMongoCommandWithMetrics(pattern, 'SILENT');
  });
  
  // Performance summary
  performanceMetrics.averageParseTime = performanceMetrics.totalParseTime / performanceMetrics.totalTests;
  
  console.log('\n📊 CHAINED OPERATIONS SUMMARY');
  console.log('-'.repeat(30));
  console.log(`Total Tests: ${performanceMetrics.totalTests}`);
  console.log(`Valid Commands: ${performanceMetrics.validCommands}`);
  console.log(`Invalid Commands: ${performanceMetrics.invalidCommands}`);
  console.log(`Chained Commands: ${performanceMetrics.chainedCommands}`);
  console.log(`Chain Success Rate: ${((performanceMetrics.chainedCommands / performanceMetrics.validCommands) * 100).toFixed(1)}%`);
  console.log(`Average Parse Time: ${performanceMetrics.averageParseTime.toFixed(2)}ms`);
  
  console.log('\n🎯 CHAINING CAPABILITIES');
  console.log('-'.repeat(30));
  console.log(`✅ Cursor-returning operations: ${Object.keys(VALID_OPERATIONS).filter(op => VALID_OPERATIONS[op].returnsCursor).length}`);
  console.log(`✅ Cursor methods: ${Object.keys(CURSOR_METHODS).length}`);
  console.log(`✅ Supports complex chains: find().sort().limit().skip().hint().explain()`);
  console.log(`✅ Validates chain compatibility: prevents invalid chaining`);
}

// Simulate command line chained operations
function simulateChainedCLI() {
  console.log('\n💻 CHAINED COMMAND LINE SIMULATION');
  console.log('='.repeat(50));
  
  const chainedCliArgs = [
    'users.find({age: {$gte: 18}}).sort({name: 1}).limit(10)',
    'products.find({category: "electronics"}).sort({price: 1})',
    'orders.find({status: "completed"}).sort({createdAt: -1}).skip(20).limit(10)',
    'users.insertOne({name: "John"}).sort({name: 1})',  // Invalid - insertOne doesn't return cursor
    'logs.find({level: "error"}).sort({timestamp: -1}).limit(100).hint({timestamp: -1})'
  ];
  
  console.log('Simulating CLI chained patterns:');
  chainedCliArgs.forEach((arg, i) => {
    console.log(`\n${i + 1}. mongosh-clone db "${arg}"`);
    const fullCommand = `db.${arg}`;
    parseMongoCommandWithMetrics(fullCommand, 'VERBOSE');
  });
}

// Run chained operation tests
runChainedOperationTests();
simulateChainedCLI();
