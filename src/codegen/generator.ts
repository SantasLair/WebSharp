/**
 * JavaScript Code Generator for Web#
 * Transpiles Web# AST to executable JavaScript
 */

import {
  ASTNode,
  CompilationUnitNode,
  ClassNode,
  MethodNode,
  PropertyNode,
  FieldNode,
  ConstructorNode,
  ParameterNode,
  TypeNode,
  BlockStatementNode,
  ExpressionStatementNode,
  VariableDeclarationNode,
  ReturnStatementNode,
  StatementNode,
  ExpressionNode,
  IdentifierNode,
  LiteralNode,
  BinaryExpressionNode,
  AssignmentExpressionNode,
  CallExpressionNode,
  MemberExpressionNode,
  JSCallExpressionNode,
  JSSetExpressionNode,
  DOMConstructorNode,
  DOMPropertyAccessNode,
  DOMMethodCallNode,
  AccessModifier
} from '../ast/nodes';

export interface CodeGenOptions {
  indentSize: number;
  useES6Classes: boolean;
  generateSourceMaps: boolean;
}

export class JavaScriptGenerator {
  private options: CodeGenOptions;
  private indentLevel: number = 0;

  constructor(options: Partial<CodeGenOptions> = {}) {
    this.options = {
      indentSize: 2,
      useES6Classes: true,
      generateSourceMaps: false,
      ...options
    };
  }

  public generate(ast: CompilationUnitNode): string {
    const output: string[] = [];
    
    // Add header comment
    output.push('// Generated JavaScript from Web# source');
    output.push('// Web# - Browser-native C#-like language');
    output.push('');

    // Check if JS interop or DOM API is used
    const usesJSInterop = this.detectJSInterop(ast);
    const usesDOMAPI = this.detectDOMAPI(ast);
    
    // Generate JS runtime if needed
    if (usesJSInterop) {
      output.push(this.generateJSRuntime());
    }

    // Generate DOM runtime if needed (Phase 5)
    if (usesDOMAPI) {
      output.push(this.generateDOMRuntime());
    }

    // Generate Console.WriteLine polyfill
    output.push(this.generateConsolePolyfill());
    output.push('');

    // Generate classes
    for (const classNode of ast.classes) {
      output.push(this.generateClass(classNode));
      output.push('');
    }

    return output.join('\n');
  }

  private generateConsolePolyfill(): string {
    return `// Console.WriteLine polyfill for Web#
const Console = {
  WriteLine: function(message) {
    console.log(message);
  }
};`;
  }

  private generateClass(classNode: ClassNode): string {
    const output: string[] = [];
    
    if (this.options.useES6Classes) {
      output.push(this.generateES6Class(classNode));
    } else {
      output.push(this.generateES5Class(classNode));
    }

    return output.join('\n');
  }

  private generateES6Class(classNode: ClassNode): string {
    const output: string[] = [];
    
    // Class declaration
    let classDecl = `class ${classNode.name}`;
    if (classNode.baseClass) {
      classDecl += ` extends ${classNode.baseClass}`;
    }
    output.push(classDecl + ' {');
    
    this.indentLevel++;

    // Generate constructor
    const constructors = classNode.members.filter(m => m instanceof ConstructorNode) as ConstructorNode[];
    if (constructors.length > 0) {
      output.push(this.generateConstructor(constructors[0]));
      output.push('');
    }

    // Generate fields as constructor assignments (will be added to constructor later)
    const fields = classNode.members.filter(m => m instanceof FieldNode) as FieldNode[];
    
    // Generate properties as getters/setters
    const properties = classNode.members.filter(m => m instanceof PropertyNode) as PropertyNode[];
    for (const prop of properties) {
      output.push(this.generateProperty(prop));
      output.push('');
    }

    // Generate methods
    const methods = classNode.members.filter(m => m instanceof MethodNode) as MethodNode[];
    for (const method of methods) {
      output.push(this.generateMethod(method));
      output.push('');
    }

    this.indentLevel--;
    output.push('}');

    // Generate static field initializations after class
    const staticFields = fields.filter(f => f.isStatic);
    if (staticFields.length > 0) {
      output.push('');
      for (const field of staticFields) {
        if (field.initializer) {
          output.push(`${classNode.name}.${field.name} = ${this.generateExpression(field.initializer)};`);
        }
      }
    }

    return output.join('\n');
  }

  private generateES5Class(classNode: ClassNode): string {
    // ES5 function constructor approach (for older browser support)
    const output: string[] = [];
    
    output.push(`function ${classNode.name}() {`);
    this.indentLevel++;
    
    // Initialize fields in constructor
    const fields = classNode.members.filter(m => m instanceof FieldNode && !m.isStatic) as FieldNode[];
    for (const field of fields) {
      if (field.initializer) {
        output.push(this.indent(`this.${field.name} = ${this.generateExpression(field.initializer)};`));
      } else {
        output.push(this.indent(`this.${field.name} = ${this.getDefaultValue(field.fieldType)};`));
      }
    }
    
    this.indentLevel--;
    output.push('}');

    // Add methods to prototype
    const methods = classNode.members.filter(m => m instanceof MethodNode && !m.isStatic) as MethodNode[];
    for (const method of methods) {
      output.push('');
      output.push(`${classNode.name}.prototype.${method.name} = ${this.generateMethodFunction(method)};`);
    }

    // Add static methods
    const staticMethods = classNode.members.filter(m => m instanceof MethodNode && m.isStatic) as MethodNode[];
    for (const method of staticMethods) {
      output.push('');
      output.push(`${classNode.name}.${method.name} = ${this.generateMethodFunction(method)};`);
    }

    return output.join('\n');
  }

  private generateConstructor(constructor: ConstructorNode): string {
    const params = constructor.parameters.map(p => p.name).join(', ');
    const output: string[] = [];
    
    output.push(this.indent(`constructor(${params}) {`));
    this.indentLevel++;
    
    if (constructor.body) {
      const bodyCode = this.generateBlockStatement(constructor.body);
      if (bodyCode.trim()) {
        output.push(bodyCode);
      }
    }
    
    this.indentLevel--;
    output.push(this.indent('}'));
    
    return output.join('\n');
  }

  private generateProperty(property: PropertyNode): string {
    const output: string[] = [];
    
    if (property.hasGetter) {
      output.push(this.indent(`get ${property.name}() {`));
      this.indentLevel++;
      output.push(this.indent(`return this._${property.name};`));
      this.indentLevel--;
      output.push(this.indent('}'));
    }

    if (property.hasSetter) {
      if (property.hasGetter) output.push('');
      output.push(this.indent(`set ${property.name}(value) {`));
      this.indentLevel++;
      output.push(this.indent(`this._${property.name} = value;`));
      this.indentLevel--;
      output.push(this.indent('}'));
    }

    return output.join('\n');
  }

  private generateMethod(method: MethodNode): string {
    const staticModifier = method.isStatic ? 'static ' : '';
    const params = method.parameters.map(p => p.name).join(', ');
    
    const output: string[] = [];
    output.push(this.indent(`${staticModifier}${method.name}(${params}) {`));
    
    this.indentLevel++;
    if (method.body) {
      const bodyCode = this.generateBlockStatement(method.body);
      if (bodyCode.trim()) {
        output.push(bodyCode);
      }
    }
    this.indentLevel--;
    
    output.push(this.indent('}'));
    
    return output.join('\n');
  }

  private generateMethodFunction(method: MethodNode): string {
    const params = method.parameters.map(p => p.name).join(', ');
    
    const output: string[] = [];
    output.push(`function(${params}) {`);
    
    this.indentLevel++;
    if (method.body) {
      const bodyCode = this.generateBlockStatement(method.body);
      if (bodyCode.trim()) {
        output.push(bodyCode);
      }
    }
    this.indentLevel--;
    
    output.push('}');
    
    return output.join('\n');
  }

  private generateBlockStatement(block: BlockStatementNode): string {
    const output: string[] = [];
    
    for (const statement of block.statements) {
      const stmtCode = this.generateStatement(statement);
      if (stmtCode.trim()) {
        output.push(stmtCode);
      }
    }
    
    return output.join('\n');
  }

  private generateStatement(statement: StatementNode): string {
    switch (statement.type) {
      case 'ExpressionStatement':
        const exprStmt = statement as ExpressionStatementNode;
        return this.indent(this.generateExpression(exprStmt.expression) + ';');
        
      case 'VariableDeclaration':
        const varDecl = statement as VariableDeclarationNode;
        const init = varDecl.initializer ? ` = ${this.generateExpression(varDecl.initializer)}` : '';
        return this.indent(`let ${varDecl.name}${init};`);
        
      case 'ReturnStatement':
        const returnStmt = statement as ReturnStatementNode;
        const arg = returnStmt.argument ? ` ${this.generateExpression(returnStmt.argument)}` : '';
        return this.indent(`return${arg};`);
        
      case 'BlockStatement':
        return this.generateBlockStatement(statement as BlockStatementNode);
        
      default:
        return this.indent(`// TODO: Statement type ${statement.type}`);
    }
  }

  private generateExpression(expression: ExpressionNode): string {
    switch (expression.type) {
      case 'Identifier':
        const identifier = expression as IdentifierNode;
        return identifier.name;
        
      case 'Literal':
        const literal = expression as LiteralNode;
        return this.generateLiteral(literal);
        
      case 'BinaryExpression':
        const binary = expression as BinaryExpressionNode;
        return `${this.generateExpression(binary.left)} ${binary.operator} ${this.generateExpression(binary.right)}`;
        
      case 'AssignmentExpression':
        const assignment = expression as AssignmentExpressionNode;
        return `${this.generateExpression(assignment.left)} = ${this.generateExpression(assignment.right)}`;
        
      case 'CallExpression':
        const call = expression as CallExpressionNode;
        return this.generateCallExpression(call);
        
      case 'MemberExpression':
        const member = expression as MemberExpressionNode;
        const object = this.generateExpression(member.object);
        const property = member.computed 
          ? `[${this.generateExpression(member.property)}]`
          : `.${this.generateExpression(member.property)}`;
        return `${object}${property}`;
        
      case 'JSCallExpression':
        const jsCall = expression as JSCallExpressionNode;
        return this.generateJSCallExpression(jsCall);
        
      case 'JSSetExpression':
        const jsSet = expression as JSSetExpressionNode;
        return this.generateJSSetExpression(jsSet);
        
      case 'DOMConstructor':
        const domCtor = expression as DOMConstructorNode;
        return this.generateDOMConstructor(domCtor);
        
      case 'DOMPropertyAccess':
        const domProp = expression as DOMPropertyAccessNode;
        return this.generateDOMPropertyAccess(domProp);
        
      case 'DOMMethodCall':
        const domMethod = expression as DOMMethodCallNode;
        return this.generateDOMMethodCall(domMethod);
        
      default:
        return `/* TODO: Expression type ${expression.type} */`;
    }
  }

  private generateCallExpression(call: CallExpressionNode): string {
    const callee = this.generateExpression(call.callee);
    const args = call.args.map(arg => this.generateExpression(arg)).join(', ');
    
    // Handle special Web# method calls
    if (callee === 'Console.WriteLine') {
      return `Console.WriteLine(${args})`;
    }
    
    return `${callee}(${args})`;
  }

  private generateLiteral(literal: LiteralNode): string {
    switch (literal.literalType) {
      case 'string':
        return `"${literal.value.replace(/"/g, '\\"')}"`;
      case 'number':
        return literal.value.toString();
      case 'boolean':
        return literal.value.toString();
      case 'null':
        return 'null';
      default:
        return literal.value.toString();
    }
  }

  private getDefaultValue(type: TypeNode): string {
    switch (type.name) {
      case 'int':
      case 'double':
      case 'float':
        return '0';
      case 'string':
        return '""';
      case 'bool':
        return 'false';
      case 'object':
      case 'dynamic':
        return 'null';
      default:
        return 'null';
    }
  }

  private indent(text: string): string {
    const indentation = ' '.repeat(this.indentLevel * this.options.indentSize);
    return indentation + text;
  }

  private generateJSCallExpression(jsCall: JSCallExpressionNode): string {
    const args = jsCall.args.map(arg => this.generateExpression(arg)).join(', ');
    const allArgs = args ? `"${jsCall.methodPath}", ${args}` : `"${jsCall.methodPath}"`;
    return `JS.Call(${allArgs})`;
  }

  private generateJSSetExpression(jsSet: JSSetExpressionNode): string {
    const object = this.generateExpression(jsSet.object);
    const property = this.generateExpression(jsSet.property);
    const value = this.generateExpression(jsSet.value);
    return `JS.Set(${object}, ${property}, ${value})`;
  }

  // Phase 5: DOM API Generator Methods
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

  private generateJSRuntime(): string {
    return `// JavaScript Interop Runtime
const JS = {
  Call: function(path, ...args) {
    const parts = path.split('.');
    let obj = window;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    const method = parts[parts.length - 1];
    return obj[method](...args);
  },
  
  Set: function(obj, prop, value) {
    obj[prop] = value;
  }
};

`;
  }

  private generateDOMRuntime(): string {
    return `// WebSharp DOM Runtime Bridge - Phase 5
const WebSharpDOM = {
  // Base element wrapper
  Element: class {
    constructor(domElement) {
      this._dom = domElement;
    }
    
    // Properties
    get TextContent() { return this._dom.textContent; }
    set TextContent(value) { this._dom.textContent = value; }
    
    get InnerHTML() { return this._dom.innerHTML; }
    set InnerHTML(value) { this._dom.innerHTML = value; }
    
    get Id() { return this._dom.id; }
    set Id(value) { this._dom.id = value; }
    
    get ClassName() { return this._dom.className; }
    set ClassName(value) { this._dom.className = value; }
    
    get Style() {
      if (!this._style) {
        this._style = new WebSharpDOM.CSSStyleDeclaration(this._dom.style);
      }
      return this._style;
    }
    
    // Methods
    AppendChild(child) {
      this._dom.appendChild(child._dom);
    }
    
    RemoveChild(child) {
      this._dom.removeChild(child._dom);
    }
    
    QuerySelector(selector) {
      const element = this._dom.querySelector(selector);
      return element ? new WebSharpDOM.Element(element) : null;
    }
    
    SetAttribute(name, value) {
      this._dom.setAttribute(name, value);
    }
    
    GetAttribute(name) {
      return this._dom.getAttribute(name);
    }
  },
  
  // HTML Elements
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
    
    get Placeholder() { return this._dom.placeholder; }
    set Placeholder(value) { this._dom.placeholder = value; }
  },
  
  HTMLDivElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('div'));
    }
  },
  
  HTMLFormElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('form'));
    }
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
    
    get Margin() { return this._style.margin; }
    set Margin(value) { this._style.margin = value; }
    
    get Border() { return this._style.border; }
    set Border(value) { this._style.border = value; }
    
    get BorderRadius() { return this._style.borderRadius; }
    set BorderRadius(value) { this._style.borderRadius = value; }
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
    },
    
    QuerySelectorAll(selector) {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).map(el => new WebSharpDOM.Element(el));
    }
  }
};

`;
  }

  private detectJSInterop(ast: CompilationUnitNode): boolean {
    // Recursively check all expressions in the AST for JS interop usage
    for (const classNode of ast.classes) {
      if (this.detectJSInteropInClass(classNode)) {
        return true;
      }
    }
    return false;
  }

  private detectDOMAPI(ast: CompilationUnitNode): boolean {
    // Recursively check all expressions in the AST for DOM API usage
    for (const classNode of ast.classes) {
      if (this.detectDOMAPIInClass(classNode)) {
        return true;
      }
    }
    return false;
  }

  private detectDOMAPIInClass(classNode: ClassNode): boolean {
    for (const member of classNode.members) {
      if (member.type === 'Method') {
        const method = member as MethodNode;
        if (method.body && this.detectDOMAPIInStatement(method.body)) {
          return true;
        }
      }
    }
    return false;
  }

  private detectDOMAPIInStatement(statement: StatementNode): boolean {
    switch (statement.type) {
      case 'BlockStatement':
        const block = statement as BlockStatementNode;
        return block.statements.some(stmt => this.detectDOMAPIInStatement(stmt));
      
      case 'ExpressionStatement':
        const exprStmt = statement as ExpressionStatementNode;
        return this.detectDOMAPIInExpression(exprStmt.expression);
      
      case 'VariableDeclaration':
        const varDecl = statement as VariableDeclarationNode;
        return varDecl.initializer ? this.detectDOMAPIInExpression(varDecl.initializer) : false;
      
      case 'ReturnStatement':
        const returnStmt = statement as ReturnStatementNode;
        return returnStmt.argument ? this.detectDOMAPIInExpression(returnStmt.argument) : false;
      
      default:
        return false;
    }
  }

  private detectDOMAPIInExpression(expression: ExpressionNode): boolean {
    switch (expression.type) {
      case 'DOMConstructor':
      case 'DOMPropertyAccess':
      case 'DOMMethodCall':
        return true;
      
      case 'BinaryExpression':
        const binary = expression as BinaryExpressionNode;
        return this.detectDOMAPIInExpression(binary.left) || this.detectDOMAPIInExpression(binary.right);
      
      case 'AssignmentExpression':
        const assignment = expression as AssignmentExpressionNode;
        return this.detectDOMAPIInExpression(assignment.left) || this.detectDOMAPIInExpression(assignment.right);
      
      case 'CallExpression':
        const call = expression as CallExpressionNode;
        return this.detectDOMAPIInExpression(call.callee) || call.args.some(arg => this.detectDOMAPIInExpression(arg));
      
      case 'MemberExpression':
        const member = expression as MemberExpressionNode;
        return this.detectDOMAPIInExpression(member.object) || this.detectDOMAPIInExpression(member.property);
      
      default:
        return false;
    }
  }

  private detectJSInteropInClass(classNode: ClassNode): boolean {
    for (const member of classNode.members) {
      if (member.type === 'Method') {
        const method = member as MethodNode;
        if (method.body && this.detectJSInteropInStatement(method.body)) {
          return true;
        }
      }
    }
    return false;
  }

  private detectJSInteropInStatement(statement: StatementNode): boolean {
    switch (statement.type) {
      case 'BlockStatement':
        const block = statement as BlockStatementNode;
        return block.statements.some(stmt => this.detectJSInteropInStatement(stmt));
      
      case 'ExpressionStatement':
        const exprStmt = statement as ExpressionStatementNode;
        return this.detectJSInteropInExpression(exprStmt.expression);
      
      case 'VariableDeclaration':
        const varDecl = statement as VariableDeclarationNode;
        return varDecl.initializer ? this.detectJSInteropInExpression(varDecl.initializer) : false;
      
      case 'ReturnStatement':
        const returnStmt = statement as ReturnStatementNode;
        return returnStmt.argument ? this.detectJSInteropInExpression(returnStmt.argument) : false;
      
      default:
        return false;
    }
  }

  private detectJSInteropInExpression(expression: ExpressionNode): boolean {
    switch (expression.type) {
      case 'JSCallExpression':
      case 'JSSetExpression':
        return true;
      
      case 'BinaryExpression':
        const binary = expression as BinaryExpressionNode;
        return this.detectJSInteropInExpression(binary.left) || this.detectJSInteropInExpression(binary.right);
      
      case 'AssignmentExpression':
        const assignment = expression as AssignmentExpressionNode;
        return this.detectJSInteropInExpression(assignment.left) || this.detectJSInteropInExpression(assignment.right);
      
      case 'CallExpression':
        const call = expression as CallExpressionNode;
        return this.detectJSInteropInExpression(call.callee) || call.args.some(arg => this.detectJSInteropInExpression(arg));
      
      case 'MemberExpression':
        const member = expression as MemberExpressionNode;
        return this.detectJSInteropInExpression(member.object) || this.detectJSInteropInExpression(member.property);
      
      default:
        return false;
    }
  }
}
