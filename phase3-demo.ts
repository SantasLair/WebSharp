/**
 * Phase 3 Demonstration - Web# to JavaScript Compilation
 * Shows working JavaScript code generation
 */

import { WebSharpCompiler } from './src/index';

const compiler = new WebSharpCompiler();

// Web# source code
const webSharpSource = `
public class App {
    public static void Main() {
        Console.WriteLine("Hello, Web#!");
        Console.WriteLine("Phase 3 JavaScript Generation Works!");
    }
}

public class Calculator {
    public static int Add(int a, int b) {
        return a + b;
    }
}

public class Person {
    public string Name { get; set; }
    public int Age;
}
`;

console.log("=== Web# Source Code ===");
console.log(webSharpSource);

console.log("\n=== Generated JavaScript ===");
try {
    const generatedJS = compiler.compileToJavaScript(webSharpSource);
    console.log(generatedJS);
    
    console.log("\n=== Executing Generated JavaScript ===");
    
    // Execute the generated JavaScript
    eval(generatedJS);
    
    // Call the Main method
    eval('App.Main()');
    
    console.log("\n✅ Phase 3 Success: JavaScript generation and execution completed!");
    
} catch (error) {
    console.error("❌ Error:", error);
}
