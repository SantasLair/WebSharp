# Phase 5 Implementation Plan: Native DOM API

## 🎯 Architecture Overview

Phase 5 transforms WebSharp from `JS.Call()` interop to native C#-style DOM objects. This requires:

1. **Compile-Time Recognition** - Detect DOM object constructors (e.g., `new HTMLButtonElement()`)
2. **Runtime Bridge Generation** - Create JavaScript wrapper classes for DOM objects  
3. **Code Generation Enhancement** - Transform C# DOM syntax to bridge calls
4. **Type System Extension** - Add DOM types to WebSharp's type system

## 🔧 Implementation Strategy

### Current Phase 4 Flow:
```
WebSharp: JS.Call("document.createElement", "button")
    ↓
Generator: JS.Call("document.createElement", "button") 
    ↓
Runtime: JS.Call function executes JavaScript
```

### New Phase 5 Flow:
```
WebSharp: new HTMLButtonElement()
    ↓
Parser: Recognizes DOM constructor 
    ↓
Generator: WebSharpDOM.HTMLButtonElement()
    ↓
Runtime: Bridge creates wrapped DOM element
```

## 📋 Implementation Tasks

### Task 1: AST Nodes for DOM Objects
Add new AST node types for DOM constructors and method calls.

**New Node Types:**
- `DOMConstructorNode` - for `new HTMLButtonElement()`
- `DOMMethodCallNode` - for `element.AppendChild(child)`
- `DOMPropertyAccessNode` - for `element.TextContent = "text"`

### Task 2: Parser Extensions
Enhance parser to recognize DOM types and transform them.

**Parser Changes:**
- Detect DOM type names (HTMLButtonElement, Document, etc.)
- Transform constructor calls: `new HTMLButtonElement()` → `DOMConstructorNode`
- Transform property access: `element.TextContent` → `DOMPropertyAccessNode`
- Transform method calls: `element.AppendChild()` → `DOMMethodCallNode`

### Task 3: Code Generator Extensions  
Generate JavaScript bridge calls instead of direct DOM access.

**Generator Changes:**
- `DOMConstructorNode` → `new WebSharpDOM.HTMLButtonElement()`
- `DOMMethodCallNode` → `element.AppendChild(child)`  
- `DOMPropertyAccessNode` → `element.TextContent = value`

### Task 4: Runtime Bridge (The "JIT" Component)
JavaScript runtime that provides C#-like DOM wrapper objects.

**Bridge Components:**
- `WebSharpDOM` namespace with all DOM classes
- Wrapper classes for each DOM type (HTMLElement, HTMLButtonElement, etc.)
- Property getters/setters that delegate to real DOM
- Method proxies that call real DOM methods
- Type hierarchy that matches C# expectations

### Task 5: Type System Extensions
Add DOM types to WebSharp's semantic analyzer.

**Type System Changes:**
- Built-in types: HTMLElement, HTMLButtonElement, Document, etc.
- Inheritance hierarchy: HTMLButtonElement : HTMLElement
- Property definitions: TextContent, Style, etc.
- Method signatures: AppendChild, QuerySelector, etc.

## 🏗️ Detailed Implementation

### 1. AST Node Extensions

```typescript
// New AST nodes for DOM operations
export class DOMConstructorNode extends ExpressionNode {
  constructor(
    public readonly domType: string, // "HTMLButtonElement"
    public readonly args: ExpressionNode[] = [],
    location?: SourceLocation
  ) {
    super('DOMConstructor', location);
  }
}

export class DOMPropertyAccessNode extends ExpressionNode {
  constructor(
    public readonly object: ExpressionNode,
    public readonly property: string,
    public readonly isAssignment: boolean = false,
    public readonly value?: ExpressionNode,
    location?: SourceLocation
  ) {
    super('DOMPropertyAccess', location);
  }
}

export class DOMMethodCallNode extends ExpressionNode {
  constructor(
    public readonly object: ExpressionNode,
    public readonly method: string,
    public readonly args: ExpressionNode[],
    location?: SourceLocation
  ) {
    super('DOMMethodCall', location);
  }
}
```

### 2. Parser DOM Detection Logic

```typescript
// In parser.ts - detect DOM constructors
private parseNewExpression(): ExpressionNode {
  this.consume(TokenType.NEW, 'Expected "new"');
  const type = this.parseType();
  
  // Check if this is a DOM type
  if (this.isDOMType(type.name)) {
    this.consume(TokenType.LEFT_PAREN, 'Expected "(" after DOM constructor');
    const args = this.parseArgumentList();
    this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after arguments');
    return new DOMConstructorNode(type.name, args);
  }
  
  // Fall back to regular constructor
  return this.parseRegularConstructor(type);
}

private isDOMType(typeName: string): boolean {
  const domTypes = [
    'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement',
    'HTMLDivElement', 'HTMLSpanElement', 'HTMLFormElement',
    'Document', 'Element', 'Node'
  ];
  return domTypes.includes(typeName);
}
```

### 3. Code Generation for DOM

```typescript
// In generator.ts - generate bridge calls
private generateExpression(expression: ExpressionNode): string {
  switch (expression.type) {
    case 'DOMConstructor':
      const domCtor = expression as DOMConstructorNode;
      return this.generateDOMConstructor(domCtor);
      
    case 'DOMPropertyAccess':
      const domProp = expression as DOMPropertyAccessNode;
      return this.generateDOMPropertyAccess(domProp);
      
    case 'DOMMethodCall':
      const domMethod = expression as DOMMethodCallNode;
      return this.generateDOMMethodCall(domMethod);
      
    // ... existing cases
  }
}

private generateDOMConstructor(node: DOMConstructorNode): string {
  const args = node.args.map(arg => this.generateExpression(arg)).join(', ');
  return `new WebSharpDOM.${node.domType}(${args})`;
}

private generateDOMPropertyAccess(node: DOMPropertyAccessNode): string {
  const object = this.generateExpression(node.object);
  if (node.isAssignment && node.value) {
    const value = this.generateExpression(node.value);
    return `${object}.${node.property} = ${value}`;
  }
  return `${object}.${node.property}`;
}

private generateDOMMethodCall(node: DOMMethodCallNode): string {
  const object = this.generateExpression(node.object);
  const args = node.args.map(arg => this.generateExpression(arg)).join(', ');
  return `${object}.${node.method}(${args})`;
}
```

### 4. Runtime Bridge (The JIT Component)

```javascript
// WebSharp DOM Runtime Bridge - the "JIT" that makes it work
const WebSharpDOM = {
  // Base classes
  Element: class {
    constructor(domElement) {
      this._dom = domElement;
    }
    
    get TextContent() { return this._dom.textContent; }
    set TextContent(value) { this._dom.textContent = value; }
    
    get InnerHTML() { return this._dom.innerHTML; }
    set InnerHTML(value) { this._dom.innerHTML = value; }
    
    get Style() {
      if (!this._style) {
        this._style = new WebSharpDOM.CSSStyleDeclaration(this._dom.style);
      }
      return this._style;
    }
    
    AppendChild(child) {
      this._dom.appendChild(child._dom);
    }
    
    QuerySelector(selector) {
      const element = this._dom.querySelector(selector);
      return element ? new WebSharpDOM.Element(element) : null;
    }
  },
  
  // Specific HTML elements
  HTMLButtonElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('button'));
    }
    
    get Type() { return this._dom.type; }
    set Type(value) { this._dom.type = value; }
  },
  
  HTMLInputElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('input'));
    }
    
    get Value() { return this._dom.value; }
    set Value(value) { this._dom.value = value; }
    
    get Type() { return this._dom.type; }
    set Type(value) { this._dom.type = value; }
  },
  
  // CSS wrapper
  CSSStyleDeclaration: class {
    constructor(style) {
      this._style = style;
    }
    
    get BackgroundColor() { return this._style.backgroundColor; }
    set BackgroundColor(value) { this._style.backgroundColor = value; }
    
    get Color() { return this._style.color; }
    set Color(value) { this._style.color = value; }
    
    get Padding() { return this._style.padding; }
    set Padding(value) { this._style.padding = value; }
  },
  
  // Document static class equivalent
  Document: {
    get Body() {
      return new WebSharpDOM.Element(document.body);
    },
    
    CreateElement(tagName) {
      return new WebSharpDOM.Element(document.createElement(tagName));
    },
    
    QuerySelector(selector) {
      const element = document.querySelector(selector);
      return element ? new WebSharpDOM.Element(element) : null;
    }
  }
};
```

## 🎯 End Result

### Before (Phase 4):
```csharp
public static void Main() {
    var button = JS.Call("document.createElement", "button");
    JS.Set(button, "textContent", "Click me!");
    JS.Set(button, "style.backgroundColor", "blue");
    JS.Call("document.body.appendChild", button);
}
```

### After (Phase 5):
```csharp
public static void Main() {
    var button = new HTMLButtonElement();
    button.TextContent = "Click me!";
    button.Style.BackgroundColor = "blue";
    Document.Body.AppendChild(button);
}
```

### Generated JavaScript:
```javascript
// WebSharp compiler generates this:
function Main() {
    const button = new WebSharpDOM.HTMLButtonElement();
    button.TextContent = "Click me!";
    button.Style.BackgroundColor = "blue";
    WebSharpDOM.Document.Body.AppendChild(button);
}
```

## 🚀 Implementation Priority

1. **Start with AST nodes** - Add DOM-specific AST node types
2. **Extend parser** - Detect and parse DOM constructors/calls  
3. **Update generator** - Transform DOM AST to bridge calls
4. **Create runtime bridge** - The JavaScript "JIT" that makes it work
5. **Add tests** - Verify DOM code compiles and runs correctly

The "JIT" aspect is really the runtime bridge - it dynamically creates the C#-like object wrappers around real DOM elements, making WebSharp feel like a native .NET DOM API while actually manipulating the browser's DOM underneath.

**Ready to start implementation?** I suggest beginning with the AST nodes and parser extensions.
