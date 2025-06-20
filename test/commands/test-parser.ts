/**
 * Test script for the improved operation parser
 * This validates the parser logic without needing full compilation
 */

class OperationParser {
    static parse(operation) {
      const cleanOp = this.cleanOperation(operation);
      const tokens = this.tokenize(cleanOp);
      return this.parseTokens(tokens);
    }
  
    static cleanOperation(operation) {
      let clean = operation.trim();
      const quoteChars = ["'", '"', '`'];
      for (const quote of quoteChars) {
        if (clean.startsWith(quote) && clean.endsWith(quote) && clean.length > 1) {
          clean = clean.slice(1, -1);
          break;
        }
      }
      return clean.trim();
    }
  
    static tokenize(operation) {
      const tokens = [];
      let current = '';
      let i = 0;
      
      while (i < operation.length) {
        const char = operation[i];
        
        if (char === '.' && !this.isInString(operation, i)) {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          tokens.push('.');
        } else if (char === '(' && !this.isInString(operation, i)) {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          tokens.push('(');
          
          const argsEnd = this.findMatchingParen(operation, i);
          const argsContent = operation.slice(i + 1, argsEnd);
          tokens.push(argsContent);
          tokens.push(')');
          i = argsEnd;
        } else {
          current += char;
        }
        
        i++;
      }
      
      if (current.trim()) {
        tokens.push(current.trim());
      }
      
      return tokens.filter(token => token.length > 0);
    }
  
    static isInString(text, position) {
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < position; i++) {
        const char = text[i];
        const prevChar = i > 0 ? text[i - 1] : '';
        
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
      
      return inString;
    }
  
    static findMatchingParen(text, startPos) {
      let count = 1;
      let i = startPos + 1;
      
      while (i < text.length && count > 0) {
        if (!this.isInString(text, i)) {
          if (text[i] === '(') {
            count++;
          } else if (text[i] === ')') {
            count--;
          }
        }
        i++;
      }
      
      return i - 1;
    }
  
    static parseTokens(tokens) {
      if (tokens.length < 6) {
        throw new Error(`Invalid operation format. Expected: collection.method(args)`);
      }
      
      const [collection, dot1, method, openParen, argsString, closeParen] = tokens;
      
      if (dot1 !== '.' || openParen !== '(' || closeParen !== ')') {
        throw new Error(`Invalid syntax. Use: collection.method(args)`);
      }
      
      if (!this.isValidIdentifier(collection)) {
        throw new Error(`Invalid collection name: "${collection}"`);
      }
      
      if (!this.isValidIdentifier(method)) {
        throw new Error(`Invalid method name: "${method}"`);
      }
      
      const args = this.parseArguments(argsString);
      
      return {
        collection,
        method,
        arguments: args
      };
    }
  
    static isValidIdentifier(name) {
      return /^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(name);
    }
  
    static parseArguments(argsString) {
      const trimmed = argsString.trim();
      
      if (!trimmed) {
        return [];
      }
  
      try {
        const singleValue = JSON.parse(trimmed);
        return [singleValue];
      } catch {
        return this.parseMultipleArguments(trimmed);
      }
    }
  
    static parseMultipleArguments(argsString) {
      const args = [];
      const segments = this.splitArguments(argsString);
      
      for (const segment of segments) {
        try {
          const parsed = JSON.parse(segment.trim());
          args.push(parsed);
        } catch (error) {
          throw new Error(`Invalid JSON argument: "${segment.trim()}". ${error.message}`);
        }
      }
      
      return args;
    }
  
    static splitArguments(argsString) {
      const segments = [];
      let current = '';
      let braceDepth = 0;
      let bracketDepth = 0;
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < argsString.length; i++) {
        const char = argsString[i];
        const prevChar = i > 0 ? argsString[i - 1] : '';
        
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
          current += char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
          inString = false;
          stringChar = '';
          current += char;
        } else if (!inString) {
          if (char === '{') {
            braceDepth++;
            current += char;
          } else if (char === '}') {
            braceDepth--;
            current += char;
          } else if (char === '[') {
            bracketDepth++;
            current += char;
          } else if (char === ']') {
            bracketDepth--;
            current += char;
          } else if (char === ',' && braceDepth === 0 && bracketDepth === 0) {
            segments.push(current);
            current = '';
          } else {
            current += char;
          }
        } else {
          current += char;
        }
      }
      
      if (current.trim()) {
        segments.push(current);
      }
      
      return segments;
    }
  }
  
  // Test cases
  const testCases = [
    // Basic cases
    'movies.find({})',
    'users.insertOne({"name": "John"})',
    
    // Complex collection names
    'user-profiles.find({})',
    'logs_2023-12.countDocuments({})',
    'items.v2.insertOne({})',
    
    // Complex JSON
    'movies.find({"title": "Hello, World!"})',
    'users.find({"name": "O\'Brien"})',
    'logs.find({"message": "Error: \\"File not found\\""})',
    
    // Multiple arguments
    'users.updateOne({"id": 1}, {"$set": {"name": "Jane"}})',
    'movies.insertMany([{"title": "A"}, {"title": "B"}])',
    
    // Edge cases that should fail
    '123movies.find({})',  // Invalid collection name
    'movies.invalidMethod({})',  // This should be caught by validation
  ];
  
  console.log('🧪 Testing Improved Parser\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`Input: ${testCase}`);
      const result = OperationParser.parse(testCase);
      console.log(`✅ Success:`, result);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---');
  }
  
  console.log('\n🎯 Parser robustness analysis complete!');