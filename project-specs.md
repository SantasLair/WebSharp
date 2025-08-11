# Web# Programming Language Specification

You're designing a new browser-native programming language called Web#. It should look and feel like C#, but only support functionality available in the browser—similar to JavaScript. The goal is to enable contributors to write expressive, modular, and shareable code for web apps using familiar C# syntax.

## Web# Language Subset (Core Features)

**Type System:**
- Primitive types: `int`, `double`, `string`, `bool` (mapped to JS number, string, boolean)
- Reference types: `object`, `dynamic` (mapped to JS objects)
- Collections: `T[]` arrays, `List<T>`, `Dictionary<TKey, TValue>` (mapped to JS arrays and objects)
- Nullable types: `string?`, `int?` with null-coalescing operators `??`, `?.`
- `var` type inference

**Object-Oriented Features:**
- Classes with fields, properties (auto-implemented), and methods
- Constructors (primary and secondary)
- Inheritance (single class inheritance, multiple interface inheritance)
- Interfaces with default implementations
- Access modifiers: `public`, `private`, `protected`, `internal`
- `static` members and classes
- `abstract` classes and `virtual`/`override` methods

**Generics:**
- Generic classes and methods: `List<T>`, `Dictionary<TKey, TValue>`
- Generic constraints: `where T : class`, `where T : new()`
- Simplified constraint system (no struct constraints, ref constraints)

**Functional Features:**
- Lambda expressions: `x => x * 2`, `(x, y) => x + y`
- LINQ query syntax (subset): `from`, `where`, `select`, `join`, `group by`
- LINQ method syntax: `.Where()`, `.Select()`, `.First()`, `.Any()`, `.Sum()`, etc.
- Expression-bodied members: `int Square(int x) => x * x;`

**Async Programming:**
- `async`/`await` keywords
- `Task<T>` and `Task` (mapped to JS Promises)
- `async` methods return Promises under the hood

**Control Flow:**
- Standard control structures: `if`, `else`, `while`, `for`, `foreach`
- `switch` expressions and pattern matching (basic patterns)
- Exception handling: `try`, `catch`, `finally`, `throw`

**Excluded C# Features:**
- Value types (`struct`) - use classes instead
- Pointers, unsafe code, ref/out parameters
- Operator overloading (except implicit/explicit conversions)
- Events (use JS event model instead)
- Delegates (use lambda expressions and JS functions)
- LINQ to SQL/Entities (use fetch/REST APIs)
- Threading/locks (use async/await and web workers)
- File I/O (use web APIs like FileReader)

## Project Goals

- Language Design
- Define an EBNF grammar for Web# that supports the above feature subset.
- Ensure domain models written in Web# can be reused in .NET with minimal changes.
- Restrict the language to browser-native APIs only: DOM, Canvas, WebGL, fetch, events, timers, JSON, etc.
- Provide first-class interop with JavaScript: allow calling JS functions, accessing JS objects, and binding DOM events.

## JavaScript Interop Specifications

**Calling JavaScript from Web#:**
```csharp
// Direct JS function calls
var result = JS.Call("Math.sqrt", 16); // returns 4
var element = JS.Call("document.getElementById", "myButton");

// Accessing JS objects and properties
dynamic window = JS.Global.window;
string userAgent = JS.Global.navigator.userAgent;

// Working with DOM
var button = new HtmlElement("button");
button.TextContent = "Click me";
button.OnClick += async () => { /* handle click */ };
```

**Type Mapping:**
- Web# `string` ↔ JS string
- Web# `int`/`double` ↔ JS number  
- Web# `bool` ↔ JS boolean
- Web# `object`/`dynamic` ↔ JS object
- Web# `T[]` ↔ JS Array
- Web# `Task<T>` ↔ JS Promise
- Web# classes ↔ JS objects with prototype methods

**Browser API Bindings:**
- DOM: `Document`, `Element`, `Node` classes with Web# property syntax
- Fetch: `HttpClient` class wrapping fetch() with async/await
- Canvas: `CanvasContext` with strongly-typed method signatures
- Storage: `LocalStorage`, `SessionStorage` with dictionary-like syntax

## Implementation Phases (Testable Milestones)

### Phase 1: Minimal Parser & AST (Week 1-2)
**Deliverable:** Parse basic Web# syntax into Abstract Syntax Tree
**Test:** Parse simple class with properties and methods
```csharp
public class Person {
    public string Name { get; set; }
    public int Age;
    
    public void SayHello() {
        Console.WriteLine("Hello");
    }
}
```
**Success Criteria:**
- Lexer tokenizes Web# keywords, identifiers, operators
- Parser builds AST for classes, properties, methods, basic types
- Can output parsed AST as JSON
- Unit tests for parser edge cases

### Phase 2: Type System & Semantic Analysis (Week 3-4)
**Deliverable:** Type checking and symbol resolution
**Test:** Detect type errors and resolve references
```csharp
public class Calculator {
    public int Add(int a, int b) {
        return a + b; // Should validate types
    }
    
    public void Test() {
        string result = Add(1, 2); // Should error: int to string
    }
}
```
**Success Criteria:**
- Symbol table tracks classes, methods, variables
- Type checker validates assignments and method calls
- Reports meaningful error messages with line numbers
- Handles basic type inference with `var`

### Phase 3: JavaScript Code Generation (Week 5-6)
**Deliverable:** Transpile Web# to executable JavaScript
**Test:** Generate JS that runs in browser
```csharp
public class App {
    public static void Main() {
        var message = "Hello, Web#!";
        Console.WriteLine(message);
    }
}
```
**Success Criteria:**
- Generates clean, readable JavaScript
- Classes become JS classes/constructor functions
- Methods and properties work correctly
- Can run in browser console and output "Hello, Web#!"

### Phase 4: Basic Browser Interop (Week 7-8)
**Deliverable:** Call JavaScript APIs from Web#
**Test:** Create interactive DOM element
```csharp
public class ButtonDemo {
    public static void Main() {
        var button = JS.Call("document.createElement", "button");
        JS.Set(button, "textContent", "Click me!");
        JS.Call("document.body.appendChild", button);
    }
}
```
**Success Criteria:**
- `JS.Call()` and `JS.Set()` helper functions work
- Can manipulate DOM from Web# code
- Button appears and can be clicked in browser

### Phase 5: CLI Tooling (Week 9-10)
**Deliverable:** Command-line development workflow
**Test:** Scaffold and build Web# project
```bash
npx create-websharp-app my-app
cd my-app
npm run dev  # Compiles .ws files and starts dev server
```
**Success Criteria:**
- Project scaffolding with sample Web# files
- File watcher compiles `.ws` files to `.js` on save
- Dev server serves compiled JavaScript
- Hot reload works for basic changes

### Phase 6: Enhanced Language Features (Week 11-12)
**Deliverable:** Generics, LINQ, async/await subset
**Test:** Generic list with LINQ operations
```csharp
public class DataProcessor {
    public async Task<List<string>> ProcessAsync() {
        var numbers = new List<int> { 1, 2, 3, 4, 5 };
        var doubled = numbers.Where(x => x > 2).Select(x => x * 2);
        return doubled.Select(x => x.ToString()).ToList();
    }
}
```
**Success Criteria:**
- Generic classes and methods compile correctly
- Basic LINQ methods (Where, Select, ToList) work
- async/await generates Promise-based JavaScript
- Can chain LINQ operations like C#

### Phase 7: VSCode Extension (Week 13-14)
**Deliverable:** Basic IDE support
**Test:** Syntax highlighting and error squiggles in VSCode
**Success Criteria:**
- `.ws` files get syntax highlighting
- Real-time error detection and red squiggles
- Basic autocomplete for built-in types
- Can compile and run from VSCode terminal

Each phase builds on the previous one and has a concrete, testable deliverable that demonstrates progress toward the full Web# vision.

## Additional Components

- Compiler & Runtime
- Implement a TypeScript-based compiler that parses Web# code and emits bytecode.
- Build a JS-based VM that interprets the bytecode and integrates with browser APIs.
- Optionally, prototype a C++ interpreter compiled to WebAssembly for performance and sandboxing.
- Define a bytecode format optimized for browser execution and debugging.
- Tooling & Developer Experience
- Create a CLI tool (create-websharp-app) that scaffolds a new project with npm install && npm run dev support.
- Define a websharp.config.json file for compiler options and interop bindings.
- Build a VSCode extension that provides syntax highlighting, intellisense, error diagnostics, and a live preview panel.
- Support hot reloading, bytecode visualization, and JS ↔ Web# interop tracing.
- Contributor Ergonomics
- Ensure contributors can write domain models, UI logic, and browser interactions with minimal friction.
- Support shared .cs files for domain classes between Web# and .NET.
- Provide onboarding examples, tooltips, and a playground for remixing Web# code.
- Enable declarative UI binding, schema validation, and illusion-based UX effects.
- Integration with Microsoft 365 and GitHub Copilot
- Ensure compatibility with GitHub Copilot inside VSCode via the VS Code Language Model API.
- Optionally support Microsoft 365 Agents Toolkit for building agents that use calendar, email, or document context.
- Allow contributors to scaffold and run Web# projects as easily as an npm project (npm run dev).

## Node.js Runtime Support

While Web# is primarily designed for browser environments, the language can also target Node.js for:

**Server-Side Rendering (SSR):**
- Pre-render Web# components on the server using jsdom or similar DOM simulation
- Share domain models between client and server without modification
- Enable isomorphic/universal Web# applications

**Build Tools & CLI Applications:**
- Web# scripts for build automation, scaffolding, and developer tooling
- Command-line utilities written in familiar C# syntax
- Integration with existing Node.js build pipelines (webpack, vite, etc.)

**Development Environment:**
- Hot reload and development servers written in Web#
- Custom bundlers, linters, and code transformation tools
- Testing frameworks and development utilities

**Node.js API Bindings:**
```csharp
// File system operations
var content = await File.ReadAllTextAsync("./config.json");
var config = JsonSerializer.Deserialize<Config>(content);

// HTTP server
var server = new HttpServer(3000);
server.OnRequest += async (req, res) => {
    var html = await RenderComponent(new MyApp());
    res.Send(html);
};

// Process and environment
var nodeVersion = Process.Version;
var isDev = Environment.GetVariable("NODE_ENV") == "development";
```

**Deployment Targets:**
- **Browser**: Traditional client-side Web# applications
- **Node.js**: Server-side rendering, build tools, CLI applications
- **Hybrid**: Applications that share code between browser and server
- **WebAssembly**: Performance-critical components compiled to WASM

## Development Approach

Start by scaffolding the grammar and compiler pipeline. Then prototype the VM and interop layer. Prioritize simplicity, modularity, and contributor joy. Design the transpiler to emit different JavaScript targets based on the runtime environment (browser vs Node.js) while maintaining a unified Web# codebase.
