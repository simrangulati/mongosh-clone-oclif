/**
 * Computational Complexity Analysis
 * Actually calculate and measure algorithmic complexity of parsing approaches
 */

const OperationParser = require('./src/lib/operation-parser-complete.js');

class ComplexityAnalyzer {
  /**
   * Analyze computational complexity by measuring operations
   * with inputs of varying sizes
   */
  static analyzeComplexity() {
    console.log('🔬 COMPUTATIONAL COMPLEXITY ANALYSIS');
    console.log('=' .repeat(80));
    
    // Test with different input sizes to determine Big O complexity
    const inputSizes = [10, 50, 100, 500, 1000, 2000, 5000];
    const approaches = [
      { name: 'Regex Parser', analyzer: this.analyzeRegexComplexity },
      { name: 'Full Parser', analyzer: this.analyzeFullParserComplexity },
      { name: 'Hybrid Parser', analyzer: this.analyzeHybridComplexity }
    ];
    
    approaches.forEach(({ name, analyzer }) => {
      console.log(`\n📊 ${name} Complexity Analysis:`);
      console.log('-'.repeat(50));
      
      const results = analyzer.call(this, inputSizes);
      this.printComplexityResults(results);
      this.calculateBigO(results, name);
    });
    
    // Analyze specific operation complexities
    this.analyzeOperationSpecificComplexity();
  }
  
  /**
   * Analyze regex parsing complexity
   */
  static analyzeRegexComplexity(inputSizes) {
    const results = [];
    
    inputSizes.forEach(size => {
      const testString = this.generateTestString(size);
      const iterations = Math.max(100, 10000 / size); // Adjust iterations based on size
      
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        try {
          this.regexParse(testString);
        } catch (error) {
          // Count failures but continue
        }
      }
      
      const end = process.hrtime.bigint();
      const avgTime = Number(end - start) / 1000000 / iterations; // ms
      
      results.push({
        inputSize: size,
        avgTime: avgTime,
        operations: this.countRegexOperations(testString)
      });
    });
    
    return results;
  }
  
  /**
   * Analyze full parser complexity
   */
  static analyzeFullParserComplexity(inputSizes) {
    const results = [];
    
    inputSizes.forEach(size => {
      const testString = this.generateTestString(size);
      const iterations = Math.max(100, 10000 / size);
      
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        try {
          OperationParser.parse(testString);
        } catch (error) {
          // Count failures but continue
        }
      }
      
      const end = process.hrtime.bigint();
      const avgTime = Number(end - start) / 1000000 / iterations; // ms
      
      results.push({
        inputSize: size,
        avgTime: avgTime,
        operations: this.countParserOperations(testString)
      });
    });
    
    return results;
  }
  
  /**
   * Analyze hybrid parser complexity
   */
  static analyzeHybridComplexity(inputSizes) {
    const results = [];
    
    inputSizes.forEach(size => {
      const testString = this.generateTestString(size);
      const iterations = Math.max(100, 10000 / size);
      
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        try {
          // Simulate hybrid logic
          if (this.isSimpleOperation(testString)) {
            this.regexParse(testString);
          } else {
            OperationParser.parse(testString);
          }
        } catch (error) {
          // Fallback logic
          try {
            OperationParser.parse(testString);
          } catch (e) {
            // Count failures
          }
        }
      }
      
      const end = process.hrtime.bigint();
      const avgTime = Number(end - start) / 1000000 / iterations; // ms
      
      results.push({
        inputSize: size,
        avgTime: avgTime,
        operations: this.countHybridOperations(testString)
      });
    });
    
    return results;
  }
  
  /**
   * Generate test strings of varying complexity
   */
  static generateTestString(size) {
    if (size <= 50) {
      // Simple operations
      return `users.find({"id": ${Math.floor(Math.random() * 1000)}})`;
    } else if (size <= 200) {
      // Medium complexity
      const fields = Array.from({length: Math.floor(size/20)}, (_, i) => 
        `"field${i}": "value${i}"`
      ).join(', ');
      return `collection.insertOne({${fields}})`;
    } else {
      // Complex operations with nested structures
      const nestedLevels = Math.floor(size / 100);
      let nested = '{"level0": "value0"';
      
      for (let i = 1; i < nestedLevels; i++) {
        nested += `, "level${i}": {"nested${i}": "value${i}"`;
      }
      
      // Close all nested objects
      nested += '}'.repeat(nestedLevels);
      
      return `complexCollection.insertOne(${nested})`;
    }
  }
  
  /**
   * Count actual operations in regex parsing
   */
  static countRegexOperations(input) {
    const operations = {
      regexMatch: 1, // Main regex match
      stringOperations: 2, // Quote removal, trimming
      splitOperations: input.includes(',') ? input.split(',').length : 0,
      jsonParse: (input.match(/[{}]/g) || []).length > 0 ? 1 : 0
    };
    
    return Object.values(operations).reduce((sum, count) => sum + count, 0);
  }
  
  /**
   * Count actual operations in full parser
   */
  static countParserOperations(input) {
    const operations = {
      quoteRemoval: 1,
      tokenization: 3, // indexOf operations for dot, parens
      structureValidation: 4, // Collection, method, format checks
      argumentParsing: this.countArgumentParsingOps(input),
      semanticValidation: 2 // Method validation, argument validation
    };
    
    return Object.values(operations).reduce((sum, count) => sum + count, 0);
  }
  
  /**
   * Count argument parsing operations (most complex part)
   */
  static countArgumentParsingOps(input) {
    const argsSection = input.match(/\((.*)\)$/);
    if (!argsSection || !argsSection[1]) return 1;
    
    const argsString = argsSection[1];
    let operations = 0;
    
    // Character iteration
    operations += argsString.length; // O(n) character scanning
    
    // Depth tracking
    operations += (argsString.match(/[{}[\]()]/g) || []).length;
    
    // String boundary detection
    operations += (argsString.match(/["']/g) || []).length;
    
    // Value parsing for each argument
    const commaCount = (argsString.match(/,/g) || []).length;
    operations += (commaCount + 1) * 3; // Parse each value
    
    return operations;
  }
  
  /**
   * Count hybrid operations
   */
  static countHybridOperations(input) {
    const heuristicOps = 4; // Simple operation detection
    
    if (this.isSimpleOperation(input)) {
      return heuristicOps + this.countRegexOperations(input);
    } else {
      return heuristicOps + this.countParserOperations(input);
    }
  }
  
  /**
   * Simple regex parser for comparison
   */
  static regexParse(operation) {
    const cleaned = operation.replace(/^['"]|['"]$/g, '');
    const match = cleaned.match(/^(\w+)\.(\w+)\((.*)\)$/);
    
    if (!match) throw new Error('Invalid format');
    
    const [, collection, method, argsString] = match;
    let args = [];
    
    if (argsString.trim()) {
      args = argsString.split(',').map(arg => {
        const trimmed = arg.trim();
        if (trimmed.startsWith('{')) return JSON.parse(trimmed);
        return trimmed.replace(/^['"]|['"]$/g, '');
      });
    }
    
    return { collection, method, arguments: args };
  }
  
  /**
   * Simple operation detection
   */
  static isSimpleOperation(operation) {
    const hasCommasInStrings = /["'][^"']*,.*["']/.test(operation);
    const hasDeepNesting = (operation.match(/[{[]/g) || []).length > 2;
    const hasEscapedChars = /\\/.test(operation);
    
    return !(hasCommasInStrings || hasDeepNesting || hasEscapedChars);
  }
  
  /**
   * Print complexity analysis results
   */
  static printComplexityResults(results) {
    console.log('Input Size | Avg Time (ms) | Operations | Time/Op (µs)');
    console.log('-'.repeat(50));
    
    results.forEach(result => {
      const timePerOp = (result.avgTime * 1000) / result.operations; // microseconds
      console.log(
        `${result.inputSize.toString().padStart(9)} | ` +
        `${result.avgTime.toFixed(4).padStart(12)} | ` +
        `${result.operations.toString().padStart(10)} | ` +
        `${timePerOp.toFixed(2).padStart(10)}`
      );
    });
  }
  
  /**
   * Calculate Big O complexity from results
   */
  static calculateBigO(results, parserName) {
    console.log(`\n🧮 Big O Analysis for ${parserName}:`);
    
    // Calculate growth rates
    const growthRates = [];
    for (let i = 1; i < results.length; i++) {
      const prev = results[i-1];
      const curr = results[i];
      
      const sizeRatio = curr.inputSize / prev.inputSize;
      const timeRatio = curr.avgTime / prev.avgTime;
      const opsRatio = curr.operations / prev.operations;
      
      growthRates.push({
        sizeRatio: sizeRatio.toFixed(2),
        timeRatio: timeRatio.toFixed(2),
        opsRatio: opsRatio.toFixed(2)
      });
    }
    
    // Analyze growth pattern
    const avgTimeGrowth = growthRates.reduce((sum, rate) => 
      sum + parseFloat(rate.timeRatio), 0) / growthRates.length;
    
    const avgOpsGrowth = growthRates.reduce((sum, rate) => 
      sum + parseFloat(rate.opsRatio), 0) / growthRates.length;
    
    console.log(`Average time growth ratio: ${avgTimeGrowth.toFixed(2)}`);
    console.log(`Average operations growth ratio: ${avgOpsGrowth.toFixed(2)}`);
    
    // Determine complexity class
    let complexityClass;
    if (avgOpsGrowth < 1.5) {
      complexityClass = 'O(1) - Constant';
    } else if (avgOpsGrowth < 2.5) {
      complexityClass = 'O(n) - Linear';
    } else if (avgOpsGrowth < 4) {
      complexityClass = 'O(n log n) - Linearithmic';
    } else if (avgOpsGrowth < 8) {
      complexityClass = 'O(n²) - Quadratic';
    } else {
      complexityClass = 'O(n^k) - Polynomial or worse';
    }
    
    console.log(`📈 Estimated complexity: ${complexityClass}`);
    
    // Performance prediction
    const lastResult = results[results.length - 1];
    const predicted10k = this.predictPerformance(lastResult, 10000, avgOpsGrowth);
    console.log(`🔮 Predicted time for 10,000 char input: ${predicted10k.toFixed(2)}ms`);
  }
  
  /**
   * Predict performance for larger inputs
   */
  static predictPerformance(lastResult, targetSize, growthRate) {
    const sizeMultiplier = targetSize / lastResult.inputSize;
    const expectedGrowth = Math.pow(sizeMultiplier, Math.log2(growthRate));
    return lastResult.avgTime * expectedGrowth;
  }
  
  /**
   * Analyze complexity of specific operations
   */
  static analyzeOperationSpecificComplexity() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 OPERATION-SPECIFIC COMPLEXITY ANALYSIS');
    console.log('='.repeat(80));
    
    const operations = [
      {
        name: 'Simple find()',
        operation: 'users.find()',
        expectedComplexity: 'O(1)'
      },
      {
        name: 'Basic insertOne',
        operation: 'users.insertOne({"name": "John", "age": 30})',
        expectedComplexity: 'O(n) - where n is JSON size'
      },
      {
        name: 'Complex nested object',
        operation: 'orders.insertOne({"customer": {"details": {"address": {"street": "123 Main St", "city": "Boston"}}}, "items": [{"id": 1, "qty": 2}]})',
        expectedComplexity: 'O(n) - where n is total characters'
      },
      {
        name: 'String with commas',
        operation: 'movies.insertOne({"title": "Hello, World", "description": "A movie about greetings, punctuation, and syntax"})',
        expectedComplexity: 'O(n) - requires character-by-character parsing'
      }
    ];
    
    operations.forEach(({ name, operation, expectedComplexity }) => {
      console.log(`\n📝 ${name}:`);
      console.log(`   Operation: ${operation}`);
      console.log(`   Length: ${operation.length} characters`);
      
      // Measure actual complexity
      const regexOps = this.countRegexOperations(operation);
      const parserOps = this.countParserOperations(operation);
      
      console.log(`   Regex operations: ${regexOps}`);
      console.log(`   Parser operations: ${parserOps}`);
      console.log(`   Expected complexity: ${expectedComplexity}`);
      
      // Calculate operations per character
      const regexDensity = (regexOps / operation.length).toFixed(3);
      const parserDensity = (parserOps / operation.length).toFixed(3);
      
      console.log(`   Regex ops/char: ${regexDensity}`);
      console.log(`   Parser ops/char: ${parserDensity}`);
    });
  }
}

// Export for testing
module.exports = ComplexityAnalyzer;

// Run analysis if this file is executed directly
if (require.main === module) {
  ComplexityAnalyzer.analyzeComplexity();
} 