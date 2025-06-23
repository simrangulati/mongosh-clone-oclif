/**
 * Performance Benchmark: Regex vs Parser Class vs Hybrid Approach
 * Measures actual execution times for different parsing strategies
 */

const OperationParser = require('./src/lib/operation-parser-complete.js');

// Simple regex parser for comparison
class RegexParser {
  static parse(operation) {
    // Remove quotes
    const cleaned = operation.replace(/^['"]|['"]$/g, '');
    
    // Basic regex pattern
    const match = cleaned.match(/^(\w+)\.(\w+)\((.*)\)$/);
    if (!match) {
      throw new Error('Invalid operation format');
    }
    
    const [, collection, method, argsString] = match;
    
    // Simple argument parsing (will break on complex cases)
    let args = [];
    if (argsString.trim()) {
      try {
        // Try to split by comma and parse each part
        args = argsString.split(',').map(arg => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return JSON.parse(trimmed);
          }
          if (trimmed === 'true') return true;
          if (trimmed === 'false') return false;
          if (trimmed === 'null') return null;
          if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
          if (/^\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
          return trimmed.replace(/^['"]|['"]$/g, '');
        });
      } catch (error) {
        throw new Error(`Failed to parse arguments: ${error.message}`);
      }
    }
    
    return { collection, method, arguments: args };
  }
}

// Hybrid parser that tries regex first, falls back to full parser
class HybridParser {
  static parse(operation) {
    // Quick heuristic check
    if (this.isSimpleOperation(operation)) {
      try {
        return RegexParser.parse(operation);
      } catch (error) {
        // Fall back to full parser
        return OperationParser.parse(operation);
      }
    } else {
      return OperationParser.parse(operation);
    }
  }
  
  static isSimpleOperation(operation) {
    // Heuristics to identify simple cases
    const hasCommasInStrings = /["'][^"']*,.*["']/.test(operation);
    const hasDeepNesting = (operation.match(/[{[]/g) || []).length > 2;
    const hasEscapedChars = /\\/.test(operation);
    const hasSpecialCollectionName = /^\[/.test(operation.trim());
    
    return !(hasCommasInStrings || hasDeepNesting || hasEscapedChars || hasSpecialCollectionName);
  }
}

// Test cases with varying complexity
const testCases = [
  // Simple cases (should favor regex)
  {
    name: 'Simple find with empty args',
    operation: 'movies.find()',
    complexity: 'simple'
  },
  {
    name: 'Simple insertOne with basic object',
    operation: 'users.insertOne({"name": "John", "age": 30})',
    complexity: 'simple'
  },
  {
    name: 'Simple find with basic query',
    operation: 'products.find({"category": "electronics"})',
    complexity: 'simple'
  },
  {
    name: 'Simple updateOne',
    operation: 'users.updateOne({"_id": 1}, {"$set": {"status": "active"}})',
    complexity: 'simple'
  },
  {
    name: 'Simple deleteOne',
    operation: 'logs.deleteOne({"level": "debug"})',
    complexity: 'simple'
  },
  
  // Medium complexity cases
  {
    name: 'Nested object with arrays',
    operation: 'orders.insertOne({"customer": {"name": "Alice", "tags": ["vip", "regular"]}, "total": 99.99})',
    complexity: 'medium'
  },
  {
    name: 'Multiple conditions',
    operation: 'products.find({"price": {"$gte": 10, "$lte": 100}, "inStock": true})',
    complexity: 'medium'
  },
  {
    name: 'Update with complex operators',
    operation: 'users.updateMany({"status": "inactive"}, {"$set": {"lastLogin": null}, "$inc": {"loginCount": 1}})',
    complexity: 'medium'
  },
  
  // Complex cases (should favor full parser)
  {
    name: 'Comma in string value',
    operation: 'movies.insertOne({"title": "Hello, World", "description": "A movie about greetings, punctuation"})',
    complexity: 'complex'
  },
  {
    name: 'Escaped quotes',
    operation: 'quotes.insertOne({"text": "She said \\"Hello\\" to me", "author": "Unknown"})',
    complexity: 'complex'
  },
  {
    name: 'Deep nesting with arrays',
    operation: 'analytics.insertOne({"events": [{"type": "click", "data": {"x": 100, "y": 200}}, {"type": "scroll", "data": {"direction": "down"}}]})',
    complexity: 'complex'
  },
  {
    name: 'Aggregation pipeline',
    operation: 'sales.aggregate([{"$match": {"date": {"$gte": "2023-01-01"}}}, {"$group": {"_id": "$product", "total": {"$sum": "$amount"}}}])',
    complexity: 'complex'
  },
  {
    name: 'Special collection name',
    operation: '["my-special-collection"].find({"status": "active"})',
    complexity: 'complex'
  }
];

// Benchmark function
function benchmark(parser, testCase, iterations = 1000) {
  const start = process.hrtime.bigint();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < iterations; i++) {
    try {
      parser.parse(testCase.operation);
      successCount++;
    } catch (error) {
      errorCount++;
    }
  }
  
  const end = process.hrtime.bigint();
  const totalTime = Number(end - start) / 1000000; // Convert to milliseconds
  const avgTime = totalTime / iterations;
  const successRate = (successCount / iterations) * 100;
  
  return {
    totalTime: totalTime.toFixed(3),
    avgTime: avgTime.toFixed(6),
    successRate: successRate.toFixed(1),
    successCount,
    errorCount
  };
}

// Run comprehensive benchmarks
function runBenchmarks() {
  console.log('🚀 Parser Performance Benchmark\n');
  console.log('=' .repeat(80));
  
  const parsers = [
    { name: 'Regex Parser', parser: RegexParser },
    { name: 'Full Parser', parser: OperationParser },
    { name: 'Hybrid Parser', parser: HybridParser }
  ];
  
  const results = {};
  
  // Test each parser on each test case
  testCases.forEach(testCase => {
    console.log(`\n📝 Test Case: ${testCase.name}`);
    console.log(`   Operation: ${testCase.operation}`);
    console.log(`   Complexity: ${testCase.complexity}`);
    console.log('-'.repeat(80));
    
    results[testCase.name] = {};
    
    parsers.forEach(({ name, parser }) => {
      const result = benchmark(parser, testCase);
      results[testCase.name][name] = result;
      
      console.log(`${name.padEnd(15)} | ` +
                 `Avg: ${result.avgTime}ms | ` +
                 `Success: ${result.successRate}% | ` +
                 `Errors: ${result.errorCount}`);
    });
  });
  
  // Summary statistics
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY STATISTICS');
  console.log('='.repeat(80));
  
  const summaryStats = {};
  
  parsers.forEach(({ name }) => {
    const allResults = Object.values(results).map(r => r[name]);
    const avgTimes = allResults.map(r => parseFloat(r.avgTime));
    const successRates = allResults.map(r => parseFloat(r.successRate));
    
    summaryStats[name] = {
      avgTime: (avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length).toFixed(6),
      minTime: Math.min(...avgTimes).toFixed(6),
      maxTime: Math.max(...avgTimes).toFixed(6),
      avgSuccessRate: (successRates.reduce((a, b) => a + b, 0) / successRates.length).toFixed(1),
      totalTests: allResults.length
    };
  });
  
  console.log('\nOverall Performance:');
  Object.entries(summaryStats).forEach(([name, stats]) => {
    console.log(`\n${name}:`);
    console.log(`  Average Time: ${stats.avgTime}ms`);
    console.log(`  Range: ${stats.minTime}ms - ${stats.maxTime}ms`);
    console.log(`  Success Rate: ${stats.avgSuccessRate}%`);
  });
  
  // Performance by complexity
  console.log('\n📈 Performance by Complexity:');
  ['simple', 'medium', 'complex'].forEach(complexity => {
    console.log(`\n${complexity.toUpperCase()} Cases:`);
    
    const complexityCases = testCases.filter(tc => tc.complexity === complexity);
    const complexityResults = {};
    
    parsers.forEach(({ name }) => {
      const times = complexityCases.map(tc => parseFloat(results[tc.name][name].avgTime));
      const successRates = complexityCases.map(tc => parseFloat(results[tc.name][name].successRate));
      
      complexityResults[name] = {
        avgTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(6),
        avgSuccessRate: (successRates.reduce((a, b) => a + b, 0) / successRates.length).toFixed(1)
      };
    });
    
    Object.entries(complexityResults).forEach(([name, stats]) => {
      console.log(`  ${name.padEnd(15)}: ${stats.avgTime}ms (${stats.avgSuccessRate}% success)`);
    });
  });
  
  // Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(80));
  
  const regexStats = summaryStats['Regex Parser'];
  const fullStats = summaryStats['Full Parser'];
  const hybridStats = summaryStats['Hybrid Parser'];
  
  console.log('\nBased on benchmark results:');
  
  if (parseFloat(regexStats.avgSuccessRate) < 90) {
    console.log('❌ Regex Parser: Low reliability, not recommended for production');
  } else {
    console.log('✅ Regex Parser: Fast but limited - good for simple prototypes');
  }
  
  console.log('✅ Full Parser: Most reliable - recommended for production');
  
  if (parseFloat(hybridStats.avgTime) < parseFloat(fullStats.avgTime) && 
      parseFloat(hybridStats.avgSuccessRate) >= 95) {
    console.log('🏆 Hybrid Parser: Best balance of speed and reliability - RECOMMENDED');
  } else {
    console.log('⚠️  Hybrid Parser: Check implementation - may need tuning');
  }
  
  return results;
}

// Export for testing
module.exports = {
  RegexParser,
  HybridParser,
  benchmark,
  runBenchmarks,
  testCases
};

// Run benchmarks if this file is executed directly
if (require.main === module) {
  runBenchmarks();
} 