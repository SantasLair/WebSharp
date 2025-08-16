# Phase 6: TypeScript Type Import System
## Vision: Bridging WebSharp and TypeScript Ecosystems

### Overview
Enable WebSharp to import and use TypeScript type definitions (.d.ts files), allowing seamless interoperability with the vast TypeScript ecosystem while maintaining WebSharp's C#-like syntax.

### Core Features

#### 1. TypeScript Type Import Syntax
```csharp
// Import specific types from TypeScript definition files
using TypeScript from "./types/dom.d.ts" import { HTMLElement, Event };
using TypeScript from "@types/node" import { Process, Buffer };
using TypeScript from "./api-types.d.ts" import { UserAPI, ProductData };

// Import entire modules with type information
using TypeScript module "lodash" as _;
using TypeScript module "axios" as Http;
```

#### 2. TypeScript Type Mapping to C#
```csharp
// TypeScript interface becomes WebSharp interface
// From: interface User { name: string; age: number; }
public interface IUser {
    string Name { get; set; }
    int Age { get; set; }
}

// TypeScript type aliases become WebSharp types
// From: type Status = "pending" | "complete" | "error";
public enum Status { Pending, Complete, Error }

// TypeScript function types become WebSharp delegates
// From: type EventHandler = (event: Event) => void;
public delegate void EventHandler(Event @event);
```

#### 3. Enhanced JavaScript Interop with Types
```csharp
public class TypedDOMDemo {
    public static void Main() {
        // Type-safe DOM manipulation using imported TypeScript types
        HTMLElement button = JS.Call<HTMLElement>("document.createElement", "button");
        button.textContent = "Click me!";
        button.style.backgroundColor = "blue";
        
        // Event handling with proper types
        button.addEventListener("click", (Event e) => {
            JS.Call("console.log", "Button clicked!", e.target);
        });
        
        // API calls with typed responses
        UserAPI api = new UserAPI();
        Task<User[]> users = api.GetUsersAsync();
    }
}
```

### Technical Implementation

#### 1. TypeScript Definition Parser
```typescript
// New component: TypeScript Definition Parser
export class TypeScriptDefinitionParser {
    public parseDefinitionFile(filePath: string): TypeDefinitions {
        // Parse .d.ts files using TypeScript's own parser
        // Extract interfaces, types, functions, modules
        // Convert to WebSharp-compatible type information
    }
    
    public resolveNpmTypes(packageName: string): TypeDefinitions {
        // Resolve @types/* packages
        // Load from node_modules/@types/
        // Handle DefinitelyTyped packages
    }
}
```

#### 2. Enhanced Token System
```typescript
// Add new tokens for TypeScript imports
export enum TokenType {
    // ... existing tokens
    
    // TypeScript Import
    TYPESCRIPT = 'TYPESCRIPT',    // TypeScript keyword
    FROM = 'FROM',                // from keyword
    IMPORT = 'IMPORT',            // import keyword
    MODULE = 'MODULE',            // module keyword
    AS = 'AS',                    // as keyword
}
```

#### 3. Extended AST Nodes
```typescript
// New AST nodes for TypeScript imports
export class TypeScriptImportNode extends ASTNode {
    constructor(
        public readonly source: string,           // "./types/dom.d.ts"
        public readonly imports: ImportSpecifier[], // { HTMLElement, Event }
        public readonly isModule: boolean = false,   // using module "lodash"
        public readonly alias?: string,             // as _
        location?: SourceLocation
    ) {
        super('TypeScriptImport', location);
    }
}

export interface ImportSpecifier {
    name: string;        // HTMLElement
    alias?: string;      // as Element
    isDefault: boolean;  // default import
}
```

#### 4. Type System Integration
```typescript
// Enhanced type system with TypeScript type support
export class EnhancedSemanticAnalyzer extends SemanticAnalyzer {
    private typeScriptTypes: Map<string, TypeScriptTypeDefinition> = new Map();
    
    public loadTypeScriptDefinitions(imports: TypeScriptImportNode[]): void {
        for (const importNode of imports) {
            const definitions = this.parseTypeScriptFile(importNode.source);
            this.registerTypeScriptTypes(definitions);
        }
    }
    
    public resolveTypeScriptType(typeName: string): TypeNode | null {
        const tsType = this.typeScriptTypes.get(typeName);
        if (tsType) {
            return this.convertTypeScriptTypeToWebSharp(tsType);
        }
        return null;
    }
}
```

### Example Usage Scenarios

#### 1. DOM Manipulation with Full Type Safety
```csharp
using TypeScript from "@types/dom" import { 
    HTMLElement, HTMLButtonElement, MouseEvent, CSSStyleDeclaration 
};

public class TypeSafeDOM {
    public static void CreateStyledButton() {
        HTMLButtonElement button = JS.Call<HTMLButtonElement>(
            "document.createElement", "button"
        );
        
        // Full IntelliSense and type checking
        button.textContent = "Styled Button";
        button.className = "btn btn-primary";
        
        CSSStyleDeclaration style = button.style;
        style.backgroundColor = "#007bff";
        style.color = "white";
        style.padding = "10px 20px";
        
        button.addEventListener("click", (MouseEvent e) => {
            HTMLButtonElement target = e.target as HTMLButtonElement;
            target.disabled = true;
            target.textContent = "Clicked!";
        });
        
        JS.Call("document.body.appendChild", button);
    }
}
```

#### 2. API Integration with Typed Responses
```csharp
using TypeScript from "./api-types.d.ts" import { User, ApiResponse, CreateUserRequest };
using TypeScript module "axios" as Http;

public class UserService {
    private string baseUrl = "https://api.example.com";
    
    public async Task<ApiResponse<User[]>> GetUsersAsync() {
        var response = await JS.CallAsync<ApiResponse<User[]>>(
            "Http.get", $"{baseUrl}/users"
        );
        return response.data;
    }
    
    public async Task<ApiResponse<User>> CreateUserAsync(CreateUserRequest request) {
        var response = await JS.CallAsync<ApiResponse<User>>(
            "Http.post", $"{baseUrl}/users", request
        );
        return response.data;
    }
}
```

#### 3. Library Integration
```csharp
using TypeScript module "lodash" as _;
using TypeScript from "@types/lodash" import { Collection };

public class DataProcessor {
    public static T[] ProcessData<T>(T[] data, Func<T, bool> predicate) where T : class {
        // Use lodash with full type safety
        return JS.Call<T[]>("_.filter", data, predicate);
    }
    
    public static Dictionary<TKey, TValue[]> GroupData<TKey, TValue>(
        TValue[] data, 
        Func<TValue, TKey> keySelector
    ) {
        return JS.Call<Dictionary<TKey, TValue[]>>("_.groupBy", data, keySelector);
    }
}
```

### Implementation Phases

#### Phase 6.1: TypeScript Definition Parser
- Parse .d.ts files using TypeScript compiler API
- Extract interface, type, and function definitions
- Convert to WebSharp-compatible type representations

#### Phase 6.2: Import Syntax & AST Extensions
- Add TypeScript import syntax to lexer/parser
- Extend AST with import nodes
- Update semantic analyzer to process imports

#### Phase 6.3: Type System Integration
- Map TypeScript types to WebSharp types
- Implement type conversion algorithms
- Add type checking for imported types

#### Phase 6.4: Enhanced JavaScript Interop
- Add generic JS.Call<T>() and JS.Set<T>() methods
- Implement typed promise handling
- Support for complex object mapping

#### Phase 6.5: Tooling & Developer Experience
- IntelliSense for imported TypeScript types
- Error reporting with TypeScript type information
- Hot reload with type definition updates

### Benefits

1. **Massive Ecosystem Access**: Leverage thousands of TypeScript definition packages
2. **Type Safety**: Full compile-time type checking for JavaScript APIs
3. **Developer Experience**: IntelliSense and auto-completion for all imported types
4. **Gradual Migration**: Easy path for TypeScript projects to adopt WebSharp
5. **Library Interop**: Use any JavaScript library with TypeScript definitions

### Challenges & Solutions

#### Challenge: TypeScript Complexity
- **Solution**: Support subset of TypeScript features initially
- Focus on interfaces, basic types, and function signatures
- Gradually expand support for advanced features

#### Challenge: Type Mapping
- **Solution**: Create comprehensive mapping between TypeScript and C# type systems
- Handle union types as interfaces or enums
- Map generic constraints appropriately

#### Challenge: Performance
- **Solution**: Cache parsed type definitions
- Lazy load type information
- Optimize type resolution algorithms

This would make WebSharp the first language to seamlessly bridge C# syntax with the entire TypeScript ecosystem!
