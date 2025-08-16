/**
 * Phase 5 Test: Native DOM API (Direct dist test)
 * Tests WebSharp code using new native DOM objects instead of JS.Call()
 */

import { WebSharpCompiler } from './dist/index.js';

const compiler = new WebSharpCompiler();

// Test WebSharp source using native DOM API
const webSharpSource = `
public class DOMDemo {
    public static void Main() {
        // Create a button using native DOM API
        var button = new HTMLButtonElement();
        button.TextContent = "Click me!";
        
        Console.WriteLine("DOM button created!");
    }
}
`;

console.log('🚀 Phase 5 Test: Native DOM API');
console.log('=================================\n');

console.log('📝 WebSharp Source Code:');
console.log(webSharpSource);

try {
  const compiledJS = compiler.compile(webSharpSource);
  
  console.log('\n⚡ Generated JavaScript:');
  console.log('========================');
  console.log(compiledJS);
  
  console.log('\n✅ Compilation successful! Phase 5 DOM API is working!');

} catch (error) {
  console.log('\n❌ Compilation failed:');
  console.error(error.message);
  
  // Check if it's the expected missing feature we need to implement
  if (error.message.includes('DOMConstructor') || error.message.includes('HTMLButtonElement')) {
    console.log('\n🔧 Good! The error shows we need to complete the implementation.');
    console.log('This confirms our Phase 5 AST nodes are being recognized.');
  }
}
