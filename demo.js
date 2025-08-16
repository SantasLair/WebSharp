/**
 * Simple demo to verify the compiler works
 * Uses the compiled JavaScript output
 */

import { WebSharpCompiler } from './dist/index.js';

const compiler = new WebSharpCompiler();

const webSharpSource = `
public class App {
    public static void Main() {
        Console.WriteLine("Hello, Web#!");
        Console.WriteLine("Phase 3 Complete - JavaScript Generation Works!");
    }
}
`;

console.log("=== Web# to JavaScript Demo ===");
console.log("Source:", webSharpSource.trim());

try {
    const javascript = compiler.compileToJavaScript(webSharpSource);
    console.log("\n=== Generated JavaScript ===");
    console.log(javascript);
    
    console.log("\n=== Executing Generated Code ===");
    eval(javascript + '\nApp.Main();');
    
    console.log("\n✅ Demo Complete: Web# compiler working perfectly!");
} catch (error) {
    console.error("❌ Demo failed:", error.message);
    process.exit(1);
}
