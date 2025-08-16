"use strict";
/**
 * JavaScript Code Generator for Web#
 * Transpiles Web# AST to executable JavaScript
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptGenerator = void 0;
var nodes_1 = require("../ast/nodes");
var JavaScriptGenerator = /** @class */ (function () {
    function JavaScriptGenerator(options) {
        if (options === void 0) { options = {}; }
        this.indentLevel = 0;
        this.options = __assign({ indentSize: 2, useES6Classes: true, generateSourceMaps: false }, options);
    }
    JavaScriptGenerator.prototype.generate = function (ast) {
        var output = [];
        // Add header comment
        output.push('// Generated JavaScript from Web# source');
        output.push('// Web# - Browser-native C#-like language');
        output.push('');
        // Check if JS interop or DOM API is used
        var usesJSInterop = this.detectJSInterop(ast);
        var usesDOMAPI = this.detectDOMAPI(ast);
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
        for (var _i = 0, _a = ast.classes; _i < _a.length; _i++) {
            var classNode = _a[_i];
            output.push(this.generateClass(classNode));
            output.push('');
        }
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateConsolePolyfill = function () {
        return "// Console.WriteLine polyfill for Web#\nconst Console = {\n  WriteLine: function(message) {\n    console.log(message);\n  }\n};";
    };
    JavaScriptGenerator.prototype.generateClass = function (classNode) {
        var output = [];
        if (this.options.useES6Classes) {
            output.push(this.generateES6Class(classNode));
        }
        else {
            output.push(this.generateES5Class(classNode));
        }
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateES6Class = function (classNode) {
        var output = [];
        // Class declaration
        var classDecl = "class ".concat(classNode.name);
        if (classNode.baseClass) {
            classDecl += " extends ".concat(classNode.baseClass);
        }
        output.push(classDecl + ' {');
        this.indentLevel++;
        // Generate constructor
        var constructors = classNode.members.filter(function (m) { return m instanceof nodes_1.ConstructorNode; });
        if (constructors.length > 0) {
            output.push(this.generateConstructor(constructors[0]));
            output.push('');
        }
        // Generate fields as constructor assignments (will be added to constructor later)
        var fields = classNode.members.filter(function (m) { return m instanceof nodes_1.FieldNode; });
        // Generate properties as getters/setters
        var properties = classNode.members.filter(function (m) { return m instanceof nodes_1.PropertyNode; });
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var prop = properties_1[_i];
            output.push(this.generateProperty(prop));
            output.push('');
        }
        // Generate methods
        var methods = classNode.members.filter(function (m) { return m instanceof nodes_1.MethodNode; });
        for (var _a = 0, methods_1 = methods; _a < methods_1.length; _a++) {
            var method = methods_1[_a];
            output.push(this.generateMethod(method));
            output.push('');
        }
        this.indentLevel--;
        output.push('}');
        // Generate static field initializations after class
        var staticFields = fields.filter(function (f) { return f.isStatic; });
        if (staticFields.length > 0) {
            output.push('');
            for (var _b = 0, staticFields_1 = staticFields; _b < staticFields_1.length; _b++) {
                var field = staticFields_1[_b];
                if (field.initializer) {
                    output.push("".concat(classNode.name, ".").concat(field.name, " = ").concat(this.generateExpression(field.initializer), ";"));
                }
            }
        }
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateES5Class = function (classNode) {
        // ES5 function constructor approach (for older browser support)
        var output = [];
        output.push("function ".concat(classNode.name, "() {"));
        this.indentLevel++;
        // Initialize fields in constructor
        var fields = classNode.members.filter(function (m) { return m instanceof nodes_1.FieldNode && !m.isStatic; });
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            if (field.initializer) {
                output.push(this.indent("this.".concat(field.name, " = ").concat(this.generateExpression(field.initializer), ";")));
            }
            else {
                output.push(this.indent("this.".concat(field.name, " = ").concat(this.getDefaultValue(field.fieldType), ";")));
            }
        }
        this.indentLevel--;
        output.push('}');
        // Add methods to prototype
        var methods = classNode.members.filter(function (m) { return m instanceof nodes_1.MethodNode && !m.isStatic; });
        for (var _a = 0, methods_2 = methods; _a < methods_2.length; _a++) {
            var method = methods_2[_a];
            output.push('');
            output.push("".concat(classNode.name, ".prototype.").concat(method.name, " = ").concat(this.generateMethodFunction(method), ";"));
        }
        // Add static methods
        var staticMethods = classNode.members.filter(function (m) { return m instanceof nodes_1.MethodNode && m.isStatic; });
        for (var _b = 0, staticMethods_1 = staticMethods; _b < staticMethods_1.length; _b++) {
            var method = staticMethods_1[_b];
            output.push('');
            output.push("".concat(classNode.name, ".").concat(method.name, " = ").concat(this.generateMethodFunction(method), ";"));
        }
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateConstructor = function (constructor) {
        var params = constructor.parameters.map(function (p) { return p.name; }).join(', ');
        var output = [];
        output.push(this.indent("constructor(".concat(params, ") {")));
        this.indentLevel++;
        if (constructor.body) {
            var bodyCode = this.generateBlockStatement(constructor.body);
            if (bodyCode.trim()) {
                output.push(bodyCode);
            }
        }
        this.indentLevel--;
        output.push(this.indent('}'));
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateProperty = function (property) {
        var output = [];
        if (property.hasGetter) {
            output.push(this.indent("get ".concat(property.name, "() {")));
            this.indentLevel++;
            output.push(this.indent("return this._".concat(property.name, ";")));
            this.indentLevel--;
            output.push(this.indent('}'));
        }
        if (property.hasSetter) {
            if (property.hasGetter)
                output.push('');
            output.push(this.indent("set ".concat(property.name, "(value) {")));
            this.indentLevel++;
            output.push(this.indent("this._".concat(property.name, " = value;")));
            this.indentLevel--;
            output.push(this.indent('}'));
        }
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateMethod = function (method) {
        var staticModifier = method.isStatic ? 'static ' : '';
        var params = method.parameters.map(function (p) { return p.name; }).join(', ');
        var output = [];
        output.push(this.indent("".concat(staticModifier).concat(method.name, "(").concat(params, ") {")));
        this.indentLevel++;
        if (method.body) {
            var bodyCode = this.generateBlockStatement(method.body);
            if (bodyCode.trim()) {
                output.push(bodyCode);
            }
        }
        this.indentLevel--;
        output.push(this.indent('}'));
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateMethodFunction = function (method) {
        var params = method.parameters.map(function (p) { return p.name; }).join(', ');
        var output = [];
        output.push("function(".concat(params, ") {"));
        this.indentLevel++;
        if (method.body) {
            var bodyCode = this.generateBlockStatement(method.body);
            if (bodyCode.trim()) {
                output.push(bodyCode);
            }
        }
        this.indentLevel--;
        output.push('}');
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateBlockStatement = function (block) {
        var output = [];
        for (var _i = 0, _a = block.statements; _i < _a.length; _i++) {
            var statement = _a[_i];
            var stmtCode = this.generateStatement(statement);
            if (stmtCode.trim()) {
                output.push(stmtCode);
            }
        }
        return output.join('\n');
    };
    JavaScriptGenerator.prototype.generateStatement = function (statement) {
        switch (statement.type) {
            case 'ExpressionStatement':
                var exprStmt = statement;
                return this.indent(this.generateExpression(exprStmt.expression) + ';');
            case 'VariableDeclaration':
                var varDecl = statement;
                var init = varDecl.initializer ? " = ".concat(this.generateExpression(varDecl.initializer)) : '';
                return this.indent("let ".concat(varDecl.name).concat(init, ";"));
            case 'ReturnStatement':
                var returnStmt = statement;
                var arg = returnStmt.argument ? " ".concat(this.generateExpression(returnStmt.argument)) : '';
                return this.indent("return".concat(arg, ";"));
            case 'BlockStatement':
                return this.generateBlockStatement(statement);
            default:
                return this.indent("// TODO: Statement type ".concat(statement.type));
        }
    };
    JavaScriptGenerator.prototype.generateExpression = function (expression) {
        switch (expression.type) {
            case 'Identifier':
                var identifier = expression;
                return identifier.name;
            case 'Literal':
                var literal = expression;
                return this.generateLiteral(literal);
            case 'BinaryExpression':
                var binary = expression;
                return "".concat(this.generateExpression(binary.left), " ").concat(binary.operator, " ").concat(this.generateExpression(binary.right));
            case 'AssignmentExpression':
                var assignment = expression;
                return "".concat(this.generateExpression(assignment.left), " = ").concat(this.generateExpression(assignment.right));
            case 'CallExpression':
                var call = expression;
                return this.generateCallExpression(call);
            case 'MemberExpression':
                var member = expression;
                var object = this.generateExpression(member.object);
                var property = member.computed
                    ? "[".concat(this.generateExpression(member.property), "]")
                    : ".".concat(this.generateExpression(member.property));
                return "".concat(object).concat(property);
            case 'JSCallExpression':
                var jsCall = expression;
                return this.generateJSCallExpression(jsCall);
            case 'JSSetExpression':
                var jsSet = expression;
                return this.generateJSSetExpression(jsSet);
            case 'DOMConstructor':
                var domCtor = expression;
                return this.generateDOMConstructor(domCtor);
            case 'DOMPropertyAccess':
                var domProp = expression;
                return this.generateDOMPropertyAccess(domProp);
            case 'DOMMethodCall':
                var domMethod = expression;
                return this.generateDOMMethodCall(domMethod);
            default:
                return "/* TODO: Expression type ".concat(expression.type, " */");
        }
    };
    JavaScriptGenerator.prototype.generateCallExpression = function (call) {
        var _this = this;
        var callee = this.generateExpression(call.callee);
        var args = call.args.map(function (arg) { return _this.generateExpression(arg); }).join(', ');
        // Handle special Web# method calls
        if (callee === 'Console.WriteLine') {
            return "Console.WriteLine(".concat(args, ")");
        }
        return "".concat(callee, "(").concat(args, ")");
    };
    JavaScriptGenerator.prototype.generateLiteral = function (literal) {
        switch (literal.literalType) {
            case 'string':
                return "\"".concat(literal.value.replace(/"/g, '\\"'), "\"");
            case 'number':
                return literal.value.toString();
            case 'boolean':
                return literal.value.toString();
            case 'null':
                return 'null';
            default:
                return literal.value.toString();
        }
    };
    JavaScriptGenerator.prototype.getDefaultValue = function (type) {
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
    };
    JavaScriptGenerator.prototype.indent = function (text) {
        var indentation = ' '.repeat(this.indentLevel * this.options.indentSize);
        return indentation + text;
    };
    JavaScriptGenerator.prototype.generateJSCallExpression = function (jsCall) {
        var _this = this;
        var args = jsCall.args.map(function (arg) { return _this.generateExpression(arg); }).join(', ');
        var allArgs = args ? "\"".concat(jsCall.methodPath, "\", ").concat(args) : "\"".concat(jsCall.methodPath, "\"");
        return "JS.Call(".concat(allArgs, ")");
    };
    JavaScriptGenerator.prototype.generateJSSetExpression = function (jsSet) {
        var object = this.generateExpression(jsSet.object);
        var property = this.generateExpression(jsSet.property);
        var value = this.generateExpression(jsSet.value);
        return "JS.Set(".concat(object, ", ").concat(property, ", ").concat(value, ")");
    };
    // Phase 5: DOM API Generator Methods
    JavaScriptGenerator.prototype.generateDOMConstructor = function (node) {
        var _this = this;
        var args = node.args.map(function (arg) { return _this.generateExpression(arg); }).join(', ');
        return "new WebSharpDOM.".concat(node.domType, "(").concat(args, ")");
    };
    JavaScriptGenerator.prototype.generateDOMPropertyAccess = function (node) {
        var object = this.generateExpression(node.object);
        if (node.isAssignment && node.value) {
            var value = this.generateExpression(node.value);
            return "".concat(object, ".").concat(node.property, " = ").concat(value);
        }
        return "".concat(object, ".").concat(node.property);
    };
    JavaScriptGenerator.prototype.generateDOMMethodCall = function (node) {
        var _this = this;
        var object = this.generateExpression(node.object);
        var args = node.args.map(function (arg) { return _this.generateExpression(arg); }).join(', ');
        return "".concat(object, ".").concat(node.method, "(").concat(args, ")");
    };
    JavaScriptGenerator.prototype.generateJSRuntime = function () {
        return "// JavaScript Interop Runtime\nconst JS = {\n  Call: function(path, ...args) {\n    const parts = path.split('.');\n    let obj = window;\n    for (let i = 0; i < parts.length - 1; i++) {\n      obj = obj[parts[i]];\n    }\n    const method = parts[parts.length - 1];\n    return obj[method](...args);\n  },\n  \n  Set: function(obj, prop, value) {\n    obj[prop] = value;\n  }\n};\n\n";
    };
    JavaScriptGenerator.prototype.generateDOMRuntime = function () {
        return "// WebSharp DOM Runtime Bridge - Phase 5\nconst WebSharpDOM = {\n  // Base element wrapper\n  Element: class {\n    constructor(domElement) {\n      this._dom = domElement;\n    }\n    \n    // Properties\n    get TextContent() { return this._dom.textContent; }\n    set TextContent(value) { this._dom.textContent = value; }\n    \n    get InnerHTML() { return this._dom.innerHTML; }\n    set InnerHTML(value) { this._dom.innerHTML = value; }\n    \n    get Id() { return this._dom.id; }\n    set Id(value) { this._dom.id = value; }\n    \n    get ClassName() { return this._dom.className; }\n    set ClassName(value) { this._dom.className = value; }\n    \n    get Style() {\n      if (!this._style) {\n        this._style = new WebSharpDOM.CSSStyleDeclaration(this._dom.style);\n      }\n      return this._style;\n    }\n    \n    // Methods\n    AppendChild(child) {\n      this._dom.appendChild(child._dom);\n    }\n    \n    RemoveChild(child) {\n      this._dom.removeChild(child._dom);\n    }\n    \n    QuerySelector(selector) {\n      const element = this._dom.querySelector(selector);\n      return element ? new WebSharpDOM.Element(element) : null;\n    }\n    \n    SetAttribute(name, value) {\n      this._dom.setAttribute(name, value);\n    }\n    \n    GetAttribute(name) {\n      return this._dom.getAttribute(name);\n    }\n  },\n  \n  // HTML Elements\n  HTMLButtonElement: class extends WebSharpDOM.Element {\n    constructor() {\n      super(document.createElement('button'));\n    }\n    \n    get Type() { return this._dom.type; }\n    set Type(value) { this._dom.type = value; }\n  },\n  \n  HTMLInputElement: class extends WebSharpDOM.Element {\n    constructor() {\n      super(document.createElement('input'));\n    }\n    \n    get Value() { return this._dom.value; }\n    set Value(value) { this._dom.value = value; }\n    \n    get Type() { return this._dom.type; }\n    set Type(value) { this._dom.type = value; }\n    \n    get Placeholder() { return this._dom.placeholder; }\n    set Placeholder(value) { this._dom.placeholder = value; }\n  },\n  \n  HTMLDivElement: class extends WebSharpDOM.Element {\n    constructor() {\n      super(document.createElement('div'));\n    }\n  },\n  \n  HTMLFormElement: class extends WebSharpDOM.Element {\n    constructor() {\n      super(document.createElement('form'));\n    }\n  },\n  \n  // CSS wrapper\n  CSSStyleDeclaration: class {\n    constructor(style) {\n      this._style = style;\n    }\n    \n    get BackgroundColor() { return this._style.backgroundColor; }\n    set BackgroundColor(value) { this._style.backgroundColor = value; }\n    \n    get Color() { return this._style.color; }\n    set Color(value) { this._style.color = value; }\n    \n    get Padding() { return this._style.padding; }\n    set Padding(value) { this._style.padding = value; }\n    \n    get Margin() { return this._style.margin; }\n    set Margin(value) { this._style.margin = value; }\n    \n    get Border() { return this._style.border; }\n    set Border(value) { this._style.border = value; }\n    \n    get BorderRadius() { return this._style.borderRadius; }\n    set BorderRadius(value) { this._style.borderRadius = value; }\n  },\n  \n  // Document static class equivalent\n  Document: {\n    get Body() {\n      return new WebSharpDOM.Element(document.body);\n    },\n    \n    CreateElement(tagName) {\n      return new WebSharpDOM.Element(document.createElement(tagName));\n    },\n    \n    QuerySelector(selector) {\n      const element = document.querySelector(selector);\n      return element ? new WebSharpDOM.Element(element) : null;\n    },\n    \n    QuerySelectorAll(selector) {\n      const elements = document.querySelectorAll(selector);\n      return Array.from(elements).map(el => new WebSharpDOM.Element(el));\n    }\n  }\n};\n\n";
    };
    JavaScriptGenerator.prototype.detectJSInterop = function (ast) {
        // Recursively check all expressions in the AST for JS interop usage
        for (var _i = 0, _a = ast.classes; _i < _a.length; _i++) {
            var classNode = _a[_i];
            if (this.detectJSInteropInClass(classNode)) {
                return true;
            }
        }
        return false;
    };
    JavaScriptGenerator.prototype.detectDOMAPI = function (ast) {
        // Recursively check all expressions in the AST for DOM API usage
        for (var _i = 0, _a = ast.classes; _i < _a.length; _i++) {
            var classNode = _a[_i];
            if (this.detectDOMAPIInClass(classNode)) {
                return true;
            }
        }
        return false;
    };
    JavaScriptGenerator.prototype.detectDOMAPIInClass = function (classNode) {
        for (var _i = 0, _a = classNode.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if (member.type === 'Method') {
                var method = member;
                if (method.body && this.detectDOMAPIInStatement(method.body)) {
                    return true;
                }
            }
        }
        return false;
    };
    JavaScriptGenerator.prototype.detectDOMAPIInStatement = function (statement) {
        var _this = this;
        switch (statement.type) {
            case 'BlockStatement':
                var block = statement;
                return block.statements.some(function (stmt) { return _this.detectDOMAPIInStatement(stmt); });
            case 'ExpressionStatement':
                var exprStmt = statement;
                return this.detectDOMAPIInExpression(exprStmt.expression);
            case 'VariableDeclaration':
                var varDecl = statement;
                return varDecl.initializer ? this.detectDOMAPIInExpression(varDecl.initializer) : false;
            case 'ReturnStatement':
                var returnStmt = statement;
                return returnStmt.argument ? this.detectDOMAPIInExpression(returnStmt.argument) : false;
            default:
                return false;
        }
    };
    JavaScriptGenerator.prototype.detectDOMAPIInExpression = function (expression) {
        var _this = this;
        switch (expression.type) {
            case 'DOMConstructor':
            case 'DOMPropertyAccess':
            case 'DOMMethodCall':
                return true;
            case 'BinaryExpression':
                var binary = expression;
                return this.detectDOMAPIInExpression(binary.left) || this.detectDOMAPIInExpression(binary.right);
            case 'AssignmentExpression':
                var assignment = expression;
                return this.detectDOMAPIInExpression(assignment.left) || this.detectDOMAPIInExpression(assignment.right);
            case 'CallExpression':
                var call = expression;
                return this.detectDOMAPIInExpression(call.callee) || call.args.some(function (arg) { return _this.detectDOMAPIInExpression(arg); });
            case 'MemberExpression':
                var member = expression;
                return this.detectDOMAPIInExpression(member.object) || this.detectDOMAPIInExpression(member.property);
            default:
                return false;
        }
    };
    JavaScriptGenerator.prototype.detectJSInteropInClass = function (classNode) {
        for (var _i = 0, _a = classNode.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if (member.type === 'Method') {
                var method = member;
                if (method.body && this.detectJSInteropInStatement(method.body)) {
                    return true;
                }
            }
        }
        return false;
    };
    JavaScriptGenerator.prototype.detectJSInteropInStatement = function (statement) {
        var _this = this;
        switch (statement.type) {
            case 'BlockStatement':
                var block = statement;
                return block.statements.some(function (stmt) { return _this.detectJSInteropInStatement(stmt); });
            case 'ExpressionStatement':
                var exprStmt = statement;
                return this.detectJSInteropInExpression(exprStmt.expression);
            case 'VariableDeclaration':
                var varDecl = statement;
                return varDecl.initializer ? this.detectJSInteropInExpression(varDecl.initializer) : false;
            case 'ReturnStatement':
                var returnStmt = statement;
                return returnStmt.argument ? this.detectJSInteropInExpression(returnStmt.argument) : false;
            default:
                return false;
        }
    };
    JavaScriptGenerator.prototype.detectJSInteropInExpression = function (expression) {
        var _this = this;
        switch (expression.type) {
            case 'JSCallExpression':
            case 'JSSetExpression':
                return true;
            case 'BinaryExpression':
                var binary = expression;
                return this.detectJSInteropInExpression(binary.left) || this.detectJSInteropInExpression(binary.right);
            case 'AssignmentExpression':
                var assignment = expression;
                return this.detectJSInteropInExpression(assignment.left) || this.detectJSInteropInExpression(assignment.right);
            case 'CallExpression':
                var call = expression;
                return this.detectJSInteropInExpression(call.callee) || call.args.some(function (arg) { return _this.detectJSInteropInExpression(arg); });
            case 'MemberExpression':
                var member = expression;
                return this.detectJSInteropInExpression(member.object) || this.detectJSInteropInExpression(member.property);
            default:
                return false;
        }
    };
    return JavaScriptGenerator;
}());
exports.JavaScriptGenerator = JavaScriptGenerator;
