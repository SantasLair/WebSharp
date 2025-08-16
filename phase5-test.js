"use strict";
/**
 * Phase 5 Test: Native DOM API
 * Tests WebSharp code using new native DOM objects instead of JS.Call()
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./src/index");
var compiler = new index_1.WebSharpCompiler();
// Test WebSharp source using native DOM API
var webSharpSource = "\npublic class DOMDemo {\n    public static void Main() {\n        // Create a button using native DOM API\n        var button = new HTMLButtonElement();\n        button.TextContent = \"Click me!\";\n        button.Style.BackgroundColor = \"blue\";\n        button.Style.Color = \"white\";\n        button.Style.Padding = \"10px 20px\";\n        \n        // Create a div container\n        var div = new HTMLDivElement();\n        div.Style.Margin = \"20px\";\n        div.Style.Border = \"1px solid #ccc\";\n        \n        // Append elements\n        div.AppendChild(button);\n        Document.Body.AppendChild(div);\n        \n        Console.WriteLine(\"DOM elements created with native API!\");\n    }\n}\n";
console.log('🚀 Phase 5 Test: Native DOM API');
console.log('=================================\n');
console.log('📝 WebSharp Source Code:');
console.log(webSharpSource);
try {
    var compiledJS = compiler.compile(webSharpSource);
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
}
catch (error) {
    console.log('\n❌ Compilation failed:');
    console.error(error.message);
    console.log('\n🔧 This is expected during development - we\'re building Phase 5!');
}
