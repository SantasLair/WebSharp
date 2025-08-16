/**
 * JavaScript Code Generator for Web#
 * Transpiles Web# AST to executable JavaScript
 */
import { MethodNode, PropertyNode, FieldNode, ConstructorNode } from '../ast/nodes';
export class JavaScriptGenerator {
    options;
    indentLevel = 0;
    constructor(options = {}) {
        this.options = {
            indentSize: 2,
            useES6Classes: true,
            generateSourceMaps: false,
            ...options
        };
    }
    generate(ast) {
        const output = [];
        // Add header comment
        output.push('// Generated JavaScript from Web# source');
        output.push('// Web# - Browser-native C#-like language');
        output.push('');
        // Check if JS interop is used
        const usesJSInterop = this.detectJSInterop(ast);
        // Generate JS runtime if needed
        if (usesJSInterop) {
            output.push(this.generateJSRuntime());
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
    generateConsolePolyfill() {
        return `// Console.WriteLine polyfill for Web#
const Console = {
  WriteLine: function(message) {
    console.log(message);
  }
};`;
    }
    generateClass(classNode) {
        const output = [];
        if (this.options.useES6Classes) {
            output.push(this.generateES6Class(classNode));
        }
        else {
            output.push(this.generateES5Class(classNode));
        }
        return output.join('\n');
    }
    generateES6Class(classNode) {
        const output = [];
        // Class declaration
        let classDecl = `class ${classNode.name}`;
        if (classNode.baseClass) {
            classDecl += ` extends ${classNode.baseClass}`;
        }
        output.push(classDecl + ' {');
        this.indentLevel++;
        // Generate constructor
        const constructors = classNode.members.filter(m => m instanceof ConstructorNode);
        if (constructors.length > 0) {
            output.push(this.generateConstructor(constructors[0]));
            output.push('');
        }
        // Generate fields as constructor assignments (will be added to constructor later)
        const fields = classNode.members.filter(m => m instanceof FieldNode);
        // Generate properties as getters/setters
        const properties = classNode.members.filter(m => m instanceof PropertyNode);
        for (const prop of properties) {
            output.push(this.generateProperty(prop));
            output.push('');
        }
        // Generate methods
        const methods = classNode.members.filter(m => m instanceof MethodNode);
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
    generateES5Class(classNode) {
        // ES5 function constructor approach (for older browser support)
        const output = [];
        output.push(`function ${classNode.name}() {`);
        this.indentLevel++;
        // Initialize fields in constructor
        const fields = classNode.members.filter(m => m instanceof FieldNode && !m.isStatic);
        for (const field of fields) {
            if (field.initializer) {
                output.push(this.indent(`this.${field.name} = ${this.generateExpression(field.initializer)};`));
            }
            else {
                output.push(this.indent(`this.${field.name} = ${this.getDefaultValue(field.fieldType)};`));
            }
        }
        this.indentLevel--;
        output.push('}');
        // Add methods to prototype
        const methods = classNode.members.filter(m => m instanceof MethodNode && !m.isStatic);
        for (const method of methods) {
            output.push('');
            output.push(`${classNode.name}.prototype.${method.name} = ${this.generateMethodFunction(method)};`);
        }
        // Add static methods
        const staticMethods = classNode.members.filter(m => m instanceof MethodNode && m.isStatic);
        for (const method of staticMethods) {
            output.push('');
            output.push(`${classNode.name}.${method.name} = ${this.generateMethodFunction(method)};`);
        }
        return output.join('\n');
    }
    generateConstructor(constructor) {
        const params = constructor.parameters.map(p => p.name).join(', ');
        const output = [];
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
    generateProperty(property) {
        const output = [];
        if (property.hasGetter) {
            output.push(this.indent(`get ${property.name}() {`));
            this.indentLevel++;
            output.push(this.indent(`return this._${property.name};`));
            this.indentLevel--;
            output.push(this.indent('}'));
        }
        if (property.hasSetter) {
            if (property.hasGetter)
                output.push('');
            output.push(this.indent(`set ${property.name}(value) {`));
            this.indentLevel++;
            output.push(this.indent(`this._${property.name} = value;`));
            this.indentLevel--;
            output.push(this.indent('}'));
        }
        return output.join('\n');
    }
    generateMethod(method) {
        const staticModifier = method.isStatic ? 'static ' : '';
        const params = method.parameters.map(p => p.name).join(', ');
        const output = [];
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
    generateMethodFunction(method) {
        const params = method.parameters.map(p => p.name).join(', ');
        const output = [];
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
    generateBlockStatement(block) {
        const output = [];
        for (const statement of block.statements) {
            const stmtCode = this.generateStatement(statement);
            if (stmtCode.trim()) {
                output.push(stmtCode);
            }
        }
        return output.join('\n');
    }
    generateStatement(statement) {
        switch (statement.type) {
            case 'ExpressionStatement':
                const exprStmt = statement;
                return this.indent(this.generateExpression(exprStmt.expression) + ';');
            case 'VariableDeclaration':
                const varDecl = statement;
                const init = varDecl.initializer ? ` = ${this.generateExpression(varDecl.initializer)}` : '';
                return this.indent(`let ${varDecl.name}${init};`);
            case 'ReturnStatement':
                const returnStmt = statement;
                const arg = returnStmt.argument ? ` ${this.generateExpression(returnStmt.argument)}` : '';
                return this.indent(`return${arg};`);
            case 'BlockStatement':
                return this.generateBlockStatement(statement);
            default:
                return this.indent(`// TODO: Statement type ${statement.type}`);
        }
    }
    generateExpression(expression) {
        switch (expression.type) {
            case 'Identifier':
                const identifier = expression;
                return identifier.name;
            case 'Literal':
                const literal = expression;
                return this.generateLiteral(literal);
            case 'BinaryExpression':
                const binary = expression;
                return `${this.generateExpression(binary.left)} ${binary.operator} ${this.generateExpression(binary.right)}`;
            case 'AssignmentExpression':
                const assignment = expression;
                return `${this.generateExpression(assignment.left)} = ${this.generateExpression(assignment.right)}`;
            case 'CallExpression':
                const call = expression;
                return this.generateCallExpression(call);
            case 'MemberExpression':
                const member = expression;
                const object = this.generateExpression(member.object);
                const property = member.computed
                    ? `[${this.generateExpression(member.property)}]`
                    : `.${this.generateExpression(member.property)}`;
                return `${object}${property}`;
            case 'JSCallExpression':
                const jsCall = expression;
                return this.generateJSCallExpression(jsCall);
            case 'JSSetExpression':
                const jsSet = expression;
                return this.generateJSSetExpression(jsSet);
            default:
                return `/* TODO: Expression type ${expression.type} */`;
        }
    }
    generateCallExpression(call) {
        const callee = this.generateExpression(call.callee);
        const args = call.args.map(arg => this.generateExpression(arg)).join(', ');
        // Handle special Web# method calls
        if (callee === 'Console.WriteLine') {
            return `Console.WriteLine(${args})`;
        }
        return `${callee}(${args})`;
    }
    generateLiteral(literal) {
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
    getDefaultValue(type) {
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
    indent(text) {
        const indentation = ' '.repeat(this.indentLevel * this.options.indentSize);
        return indentation + text;
    }
    generateJSCallExpression(jsCall) {
        const args = jsCall.args.map(arg => this.generateExpression(arg)).join(', ');
        const allArgs = args ? `"${jsCall.methodPath}", ${args}` : `"${jsCall.methodPath}"`;
        return `JS.Call(${allArgs})`;
    }
    generateJSSetExpression(jsSet) {
        const object = this.generateExpression(jsSet.object);
        const property = this.generateExpression(jsSet.property);
        const value = this.generateExpression(jsSet.value);
        return `JS.Set(${object}, ${property}, ${value})`;
    }
    generateJSRuntime() {
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
    detectJSInterop(ast) {
        // Recursively check all expressions in the AST for JS interop usage
        for (const classNode of ast.classes) {
            if (this.detectJSInteropInClass(classNode)) {
                return true;
            }
        }
        return false;
    }
    detectJSInteropInClass(classNode) {
        for (const member of classNode.members) {
            if (member.type === 'Method') {
                const method = member;
                if (method.body && this.detectJSInteropInStatement(method.body)) {
                    return true;
                }
            }
        }
        return false;
    }
    detectJSInteropInStatement(statement) {
        switch (statement.type) {
            case 'BlockStatement':
                const block = statement;
                return block.statements.some(stmt => this.detectJSInteropInStatement(stmt));
            case 'ExpressionStatement':
                const exprStmt = statement;
                return this.detectJSInteropInExpression(exprStmt.expression);
            case 'VariableDeclaration':
                const varDecl = statement;
                return varDecl.initializer ? this.detectJSInteropInExpression(varDecl.initializer) : false;
            case 'ReturnStatement':
                const returnStmt = statement;
                return returnStmt.argument ? this.detectJSInteropInExpression(returnStmt.argument) : false;
            default:
                return false;
        }
    }
    detectJSInteropInExpression(expression) {
        switch (expression.type) {
            case 'JSCallExpression':
            case 'JSSetExpression':
                return true;
            case 'BinaryExpression':
                const binary = expression;
                return this.detectJSInteropInExpression(binary.left) || this.detectJSInteropInExpression(binary.right);
            case 'AssignmentExpression':
                const assignment = expression;
                return this.detectJSInteropInExpression(assignment.left) || this.detectJSInteropInExpression(assignment.right);
            case 'CallExpression':
                const call = expression;
                return this.detectJSInteropInExpression(call.callee) || call.args.some(arg => this.detectJSInteropInExpression(arg));
            case 'MemberExpression':
                const member = expression;
                return this.detectJSInteropInExpression(member.object) || this.detectJSInteropInExpression(member.property);
            default:
                return false;
        }
    }
}
