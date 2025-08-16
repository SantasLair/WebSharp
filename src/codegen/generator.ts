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
}
