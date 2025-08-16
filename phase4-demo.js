/**
 * Phase 4 Demonstration - JavaScript Interop
 * Shows Web# code that can manipulate the DOM via JS.Call() and JS.Set()
 */
import { WebSharpCompiler } from './dist/index.js';
const compiler = new WebSharpCompiler();
// Web# source code that uses JavaScript interop
const webSharpSource = `
public class ButtonDemo {
    public static void Main() {
        var button = JS.Call("document.createElement", "button");
        JS.Set(button, "textContent", "Click me!");
        JS.Call("document.body.appendChild", button);
    }
}

public class InteractiveApp {
    public static void CreateWelcomeMessage() {
        var div = JS.Call("document.createElement", "div");
        JS.Set(div, "innerHTML", "<h1>Hello from Web#!</h1><p>This DOM was created using Web# code.</p>");
        JS.Set(div, "style", "background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 10px;");
        
        var body = JS.Call("document.querySelector", "body");
        JS.Call("body.appendChild", div);
    }
    
    public static void CreateList() {
        var ul = JS.Call("document.createElement", "ul");
        
        var li1 = JS.Call("document.createElement", "li");
        var li2 = JS.Call("document.createElement", "li");
        var li3 = JS.Call("document.createElement", "li");
        
        JS.Set(li1, "textContent", "Web# compiles to JavaScript");
        JS.Set(li2, "textContent", "JS.Call() lets you call any JavaScript function");
        JS.Set(li3, "textContent", "JS.Set() lets you set properties on JS objects");
        
        JS.Call("ul.appendChild", li1);
        JS.Call("ul.appendChild", li2);
        JS.Call("ul.appendChild", li3);
        
        JS.Call("document.body.appendChild", ul);
    }
}
`;
console.log("=== Phase 4: JavaScript Interop Demo ===");
console.log("\n=== Web# Source Code ===");
console.log(webSharpSource);
try {
    console.log("\n=== Generated JavaScript ===");
    const generatedJS = compiler.compileToJavaScript(webSharpSource);
    console.log(generatedJS);
    console.log("\n✅ Phase 4 Success!");
    console.log("🎉 Web# can now interact with JavaScript and manipulate the DOM!");
    console.log("\nTo test in a browser:");
    console.log("1. Copy the generated JavaScript above");
    console.log("2. Paste it into a browser console");
    console.log("3. Call: ButtonDemo.Main()");
    console.log("4. Call: InteractiveApp.CreateWelcomeMessage()");
    console.log("5. Call: InteractiveApp.CreateList()");
    console.log("\nYou should see DOM elements created and added to the page!");
}
catch (error) {
    console.error("❌ Error:", error);
}
