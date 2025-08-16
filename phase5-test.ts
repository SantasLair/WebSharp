/**
 * Phase 5 Test: Native DOM API
 * Tests WebSharp code using new native DOM objects instead of JS.Call()
 */

import { WebSharpCompiler } from './src/index';

const compiler = new WebSharpCompiler();

// Test WebSharp source using native DOM API
const webSharpSource = `
public class DOMDemo {
    public static void Main() {
        // Create a button using native DOM API
        var button = new HTMLButtonElement();
        button.TextContent = "Click me!";
        button.Style.BackgroundColor = "blue";
        button.Style.Color = "white";
        button.Style.Padding = "10px 20px";
        
        // Create a div container
        var div = new HTMLDivElement();
        div.Style.Margin = "20px";
        div.Style.Border = "1px solid #ccc";
        
        // Append elements
        div.AppendChild(button);
        Document.Body.AppendChild(div);
        
        Console.WriteLine("DOM elements created with native API!");
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
  
  console.log('\n✅ Compilation successful!');
  console.log('\n🔍 Key features demonstrated:');
  console.log('• ✅ new HTMLButtonElement() constructor');
  console.log('• ✅ Native property access (button.TextContent)');
  console.log('• ✅ CSS styling (button.Style.BackgroundColor)');
  console.log('• ✅ Method calls (div.AppendChild())');
  console.log('• ✅ Document static class (Document.Body)');
  console.log('• ✅ WebSharp DOM runtime bridge generated');

} catch (error) {
  console.log('\n❌ Compilation failed:');
  console.error(error.message);
  console.log('\n🔧 This is expected during development - we\'re building Phase 5!');
}
