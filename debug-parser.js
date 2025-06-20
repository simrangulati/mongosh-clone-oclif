// Debug script to test the tokenization of empty parentheses
function debugTokenize(operation) {
  console.log(`\n=== Testing: "${operation}" ===`);
  
  // Simulate the tokenization process
  const tokens = [];
  let current = '';
  let i = 0;
  
  while (i < operation.length) {
    const char = operation[i];
    console.log(`Processing char '${char}' at position ${i}`);
    
    if (char === '.') {
      if (current.trim()) {
        tokens.push(current.trim());
        console.log(`  Added token: "${current.trim()}"`);
        current = '';
      }
      tokens.push('.');
      console.log(`  Added token: "."`);
    } else if (char === '(') {
      if (current.trim()) {
        tokens.push(current.trim());
        console.log(`  Added token: "${current.trim()}"`);
        current = '';
      }
      tokens.push('(');
      console.log(`  Added token: "(" `);
      
      // Find matching closing parenthesis
      let count = 1;
      let j = i + 1;
      while (j < operation.length && count > 0) {
        if (operation[j] === '(') count++;
        else if (operation[j] === ')') count--;
        j++;
      }
      const argsEnd = j - 1;
      const argsContent = operation.slice(i + 1, argsEnd);
      console.log(`  Args content: "${argsContent}" (length: ${argsContent.length})`);
      
      tokens.push(argsContent);
      console.log(`  Added token: "${argsContent}"`);
      tokens.push(')');
      console.log(`  Added token: ")"`);
      i = argsEnd;
    } else {
      current += char;
    }
    
    i++;
  }
  
  if (current.trim()) {
    tokens.push(current.trim());
    console.log(`  Added final token: "${current.trim()}"`);
  }
  
  console.log(`\nFinal tokens (${tokens.length}):`, tokens);
  
  // Test parsing
  if (tokens.length === 6) {
    const [collection, dot1, method, openParen, argsString, closeParen] = tokens;
    console.log(`✅ Parsing successful:`);
    console.log(`  Collection: "${collection}"`);
    console.log(`  Method: "${method}"`);
    console.log(`  Args: "${argsString}" (empty: ${argsString === ''})`);
  } else {
    console.log(`❌ Wrong token count: expected 6, got ${tokens.length}`);
  }
}

// Test cases
debugTokenize('movies.find()');
debugTokenize('movies.find({})'); 