"use strict";
/**
 * Parser implementation for Web#
 * Builds Abstract Syntax Tree from tokens
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.ParseError = void 0;
var tokens_1 = require("../lexer/tokens");
var nodes_1 = require("../ast/nodes");
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError(message, token) {
        var _this = _super.call(this, "".concat(message, " at line ").concat(token.line, ", column ").concat(token.column)) || this;
        _this.token = token;
        return _this;
    }
    return ParseError;
}(Error));
exports.ParseError = ParseError;
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.current = 0;
        this.tokens = tokens.filter(function (token) {
            return token.type !== tokens_1.TokenType.WHITESPACE &&
                token.type !== tokens_1.TokenType.NEWLINE;
        });
    }
    Parser.prototype.parse = function () {
        var classes = [];
        var usings = [];
        while (!this.isAtEnd()) {
            if (this.check(tokens_1.TokenType.USING)) {
                usings.push(this.parseUsing());
            }
            else if (this.check(tokens_1.TokenType.CLASS) ||
                this.check(tokens_1.TokenType.PUBLIC) ||
                this.check(tokens_1.TokenType.PRIVATE) ||
                this.check(tokens_1.TokenType.PROTECTED) ||
                this.check(tokens_1.TokenType.INTERNAL) ||
                this.check(tokens_1.TokenType.ABSTRACT) ||
                this.check(tokens_1.TokenType.STATIC)) {
                classes.push(this.parseClass());
            }
            else {
                throw new ParseError('Expected class declaration or using statement', this.peek());
            }
        }
        return new nodes_1.CompilationUnitNode(classes, usings, this.getSourceLocation(0));
    };
    Parser.prototype.parseUsing = function () {
        this.consume(tokens_1.TokenType.USING, 'Expected "using"');
        var namespace = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected namespace name').value;
        this.consume(tokens_1.TokenType.SEMICOLON, 'Expected ";" after using statement');
        return namespace;
    };
    Parser.prototype.parseClass = function () {
        var start = this.current;
        // Parse access modifiers and other keywords
        var accessModifier = nodes_1.AccessModifier.Public;
        var isStatic = false;
        var isAbstract = false;
        while (this.check(tokens_1.TokenType.PUBLIC) ||
            this.check(tokens_1.TokenType.PRIVATE) ||
            this.check(tokens_1.TokenType.PROTECTED) ||
            this.check(tokens_1.TokenType.INTERNAL) ||
            this.check(tokens_1.TokenType.STATIC) ||
            this.check(tokens_1.TokenType.ABSTRACT)) {
            var token = this.advance();
            switch (token.type) {
                case tokens_1.TokenType.PUBLIC:
                    accessModifier = nodes_1.AccessModifier.Public;
                    break;
                case tokens_1.TokenType.PRIVATE:
                    accessModifier = nodes_1.AccessModifier.Private;
                    break;
                case tokens_1.TokenType.PROTECTED:
                    accessModifier = nodes_1.AccessModifier.Protected;
                    break;
                case tokens_1.TokenType.INTERNAL:
                    accessModifier = nodes_1.AccessModifier.Internal;
                    break;
                case tokens_1.TokenType.STATIC:
                    isStatic = true;
                    break;
                case tokens_1.TokenType.ABSTRACT:
                    isAbstract = true;
                    break;
            }
        }
        this.consume(tokens_1.TokenType.CLASS, 'Expected "class"');
        var className = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected class name').value;
        // Parse inheritance
        var baseClass;
        var interfaces = [];
        if (this.match(tokens_1.TokenType.COLON)) {
            var firstBase = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected base class or interface name').value;
            // Check if it's followed by more interfaces
            if (this.match(tokens_1.TokenType.COMMA)) {
                interfaces.push(firstBase);
                do {
                    interfaces.push(this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected interface name').value);
                } while (this.match(tokens_1.TokenType.COMMA));
            }
            else {
                // Assume it's a base class for now (could be improved with type analysis)
                baseClass = firstBase;
            }
        }
        this.consume(tokens_1.TokenType.LEFT_BRACE, 'Expected "{"');
        // Parse class members
        var members = [];
        while (!this.check(tokens_1.TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            members.push(this.parseClassMember());
        }
        this.consume(tokens_1.TokenType.RIGHT_BRACE, 'Expected "}"');
        return new nodes_1.ClassNode(className, members, baseClass, interfaces, accessModifier, isStatic, isAbstract, this.getSourceLocation(start));
    };
    Parser.prototype.parseClassMember = function () {
        var start = this.current;
        // Parse modifiers
        var accessModifier = nodes_1.AccessModifier.Public;
        var isStatic = false;
        var isVirtual = false;
        var isOverride = false;
        var isAbstract = false;
        while (this.check(tokens_1.TokenType.PUBLIC) ||
            this.check(tokens_1.TokenType.PRIVATE) ||
            this.check(tokens_1.TokenType.PROTECTED) ||
            this.check(tokens_1.TokenType.INTERNAL) ||
            this.check(tokens_1.TokenType.STATIC) ||
            this.check(tokens_1.TokenType.VIRTUAL) ||
            this.check(tokens_1.TokenType.OVERRIDE) ||
            this.check(tokens_1.TokenType.ABSTRACT)) {
            var token = this.advance();
            switch (token.type) {
                case tokens_1.TokenType.PUBLIC:
                    accessModifier = nodes_1.AccessModifier.Public;
                    break;
                case tokens_1.TokenType.PRIVATE:
                    accessModifier = nodes_1.AccessModifier.Private;
                    break;
                case tokens_1.TokenType.PROTECTED:
                    accessModifier = nodes_1.AccessModifier.Protected;
                    break;
                case tokens_1.TokenType.INTERNAL:
                    accessModifier = nodes_1.AccessModifier.Internal;
                    break;
                case tokens_1.TokenType.STATIC:
                    isStatic = true;
                    break;
                case tokens_1.TokenType.VIRTUAL:
                    isVirtual = true;
                    break;
                case tokens_1.TokenType.OVERRIDE:
                    isOverride = true;
                    break;
                case tokens_1.TokenType.ABSTRACT:
                    isAbstract = true;
                    break;
            }
        }
        // Parse type
        var type = this.parseType();
        var memberName = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected member name').value;
        // Determine if it's a method, property, or field
        if (this.check(tokens_1.TokenType.LEFT_PAREN)) {
            // Method
            return this.parseMethod(memberName, type, accessModifier, isStatic, isVirtual, isOverride, isAbstract, start);
        }
        else if (this.check(tokens_1.TokenType.LEFT_BRACE)) {
            // Property with getter/setter
            return this.parseProperty(memberName, type, accessModifier, isStatic, start);
        }
        else if (this.match(tokens_1.TokenType.SEMICOLON)) {
            // Field
            return new nodes_1.FieldNode(memberName, type, undefined, accessModifier, isStatic, this.getSourceLocation(start));
        }
        else if (this.match(tokens_1.TokenType.ASSIGN)) {
            // Field with initializer
            var initializer = this.parseExpression();
            this.consume(tokens_1.TokenType.SEMICOLON, 'Expected ";"');
            return new nodes_1.FieldNode(memberName, type, initializer, accessModifier, isStatic, this.getSourceLocation(start));
        }
        else {
            throw new ParseError('Expected method parameters, property accessors, or field declaration', this.peek());
        }
    };
    Parser.prototype.parseMethod = function (name, returnType, accessModifier, isStatic, isVirtual, isOverride, isAbstract, start) {
        this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "("');
        var parameters = [];
        if (!this.check(tokens_1.TokenType.RIGHT_PAREN)) {
            do {
                var paramType = this.parseType();
                var paramName = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected parameter name').value;
                parameters.push(new nodes_1.ParameterNode(paramName, paramType));
            } while (this.match(tokens_1.TokenType.COMMA));
        }
        this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")"');
        var body = null;
        if (this.match(tokens_1.TokenType.LEFT_BRACE)) {
            body = this.parseBlockStatement();
        }
        else if (this.match(tokens_1.TokenType.SEMICOLON)) {
            // Abstract method or interface method
            body = null;
        }
        else {
            throw new ParseError('Expected method body or ";"', this.peek());
        }
        return new nodes_1.MethodNode(name, returnType, parameters, body, accessModifier, isStatic, isVirtual, isOverride, isAbstract, this.getSourceLocation(start));
    };
    Parser.prototype.parseProperty = function (name, type, accessModifier, isStatic, start) {
        this.consume(tokens_1.TokenType.LEFT_BRACE, 'Expected "{"');
        var hasGetter = false;
        var hasSetter = false;
        while (!this.check(tokens_1.TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            if (this.match(tokens_1.TokenType.GET)) {
                hasGetter = true;
                if (this.match(tokens_1.TokenType.SEMICOLON)) {
                    // Auto-implemented getter
                }
                else if (this.match(tokens_1.TokenType.LEFT_BRACE)) {
                    // Custom getter implementation - skip for now
                    this.skipBlock();
                }
            }
            else if (this.match(tokens_1.TokenType.SET)) {
                hasSetter = true;
                if (this.match(tokens_1.TokenType.SEMICOLON)) {
                    // Auto-implemented setter
                }
                else if (this.match(tokens_1.TokenType.LEFT_BRACE)) {
                    // Custom setter implementation - skip for now
                    this.skipBlock();
                }
            }
            else {
                throw new ParseError('Expected "get" or "set"', this.peek());
            }
        }
        this.consume(tokens_1.TokenType.RIGHT_BRACE, 'Expected "}"');
        return new nodes_1.PropertyNode(name, type, hasGetter, hasSetter, accessModifier, isStatic, this.getSourceLocation(start));
    };
    Parser.prototype.parseType = function () {
        var typeName;
        // Handle built-in types
        if (this.check(tokens_1.TokenType.INT)) {
            typeName = 'int';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.DOUBLE)) {
            typeName = 'double';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.STRING_TYPE)) {
            typeName = 'string';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.BOOL)) {
            typeName = 'bool';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.OBJECT)) {
            typeName = 'object';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.DYNAMIC)) {
            typeName = 'dynamic';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.VOID)) {
            typeName = 'void';
            this.advance();
        }
        else if (this.check(tokens_1.TokenType.VAR)) {
            typeName = 'var';
            this.advance();
        }
        else {
            typeName = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected type name').value;
        }
        // Check for nullable
        var isNullable = false;
        if (this.match(tokens_1.TokenType.QUESTION)) {
            isNullable = true;
        }
        // TODO: Handle generics (List<T>, etc.)
        var genericArguments = [];
        return new nodes_1.TypeNode(typeName, isNullable, genericArguments);
    };
    Parser.prototype.skipBlock = function () {
        var braceCount = 1;
        while (braceCount > 0 && !this.isAtEnd()) {
            if (this.check(tokens_1.TokenType.LEFT_BRACE)) {
                braceCount++;
            }
            else if (this.check(tokens_1.TokenType.RIGHT_BRACE)) {
                braceCount--;
            }
            this.advance();
        }
    };
    Parser.prototype.skipToSemicolon = function () {
        while (!this.check(tokens_1.TokenType.SEMICOLON) && !this.isAtEnd()) {
            this.advance();
        }
        if (this.check(tokens_1.TokenType.SEMICOLON)) {
            this.advance();
        }
    };
    // Utility methods
    Parser.prototype.match = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        for (var _a = 0, types_1 = types; _a < types_1.length; _a++) {
            var type = types_1[_a];
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    };
    Parser.prototype.check = function (type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    };
    Parser.prototype.advance = function () {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    };
    Parser.prototype.isAtEnd = function () {
        return this.peek().type === tokens_1.TokenType.EOF;
    };
    Parser.prototype.peek = function () {
        return this.tokens[this.current];
    };
    Parser.prototype.previous = function () {
        return this.tokens[this.current - 1];
    };
    Parser.prototype.consume = function (type, message) {
        if (this.check(type))
            return this.advance();
        throw new ParseError(message, this.peek());
    };
    Parser.prototype.getSourceLocation = function (start) {
        var startToken = this.tokens[start];
        var endToken = this.previous();
        return {
            start: {
                line: startToken.line,
                column: startToken.column
            },
            end: {
                line: endToken.line,
                column: endToken.column + endToken.value.length
            }
        };
    };
    // Statement parsing methods
    Parser.prototype.parseBlockStatement = function () {
        var statements = [];
        while (!this.check(tokens_1.TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.parseStatement());
        }
        this.consume(tokens_1.TokenType.RIGHT_BRACE, 'Expected "}"');
        return new nodes_1.BlockStatementNode(statements);
    };
    Parser.prototype.parseStatement = function () {
        if (this.check(tokens_1.TokenType.RETURN)) {
            return this.parseReturnStatement();
        }
        if (this.check(tokens_1.TokenType.IF)) {
            // For now, skip IF statements by parsing them as a placeholder
            // TODO: Implement proper IF statement parsing
            this.advance(); // consume 'if'
            this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "("');
            this.parseExpression(); // parse condition (and discard)
            this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")"');
            this.parseStatement(); // parse then statement (and discard)
            if (this.check(tokens_1.TokenType.ELSE)) {
                this.advance(); // consume 'else'
                this.parseStatement(); // parse else statement (and discard)
            }
            // Return a placeholder expression statement
            return new nodes_1.ExpressionStatementNode(new nodes_1.LiteralNode(null, 'null'));
        }
        if (this.check(tokens_1.TokenType.WHILE)) {
            // TODO: Implement proper WHILE statement parsing
            this.advance(); // consume 'while'
            this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "("');
            this.parseExpression(); // parse condition (and discard)
            this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")"');
            this.parseStatement(); // parse body (and discard)
            return new nodes_1.ExpressionStatementNode(new nodes_1.LiteralNode(null, 'null'));
        }
        if (this.check(tokens_1.TokenType.FOR)) {
            // TODO: Implement proper FOR statement parsing
            this.advance(); // consume 'for'
            this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "("');
            // Skip for loop components for now
            while (!this.check(tokens_1.TokenType.RIGHT_PAREN) && !this.isAtEnd()) {
                this.advance();
            }
            this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")"');
            this.parseStatement(); // parse body (and discard)
            return new nodes_1.ExpressionStatementNode(new nodes_1.LiteralNode(null, 'null'));
        }
        if (this.check(tokens_1.TokenType.LEFT_BRACE)) {
            this.advance(); // consume '{'
            return this.parseBlockStatement();
        }
        // Check for variable declaration or expression statement
        var start = this.current;
        // Try to parse as variable declaration
        if (this.isTypeToken() || this.check(tokens_1.TokenType.VAR)) {
            return this.parseVariableDeclaration();
        }
        // Otherwise parse as expression statement
        return this.parseExpressionStatement();
    };
    Parser.prototype.parseReturnStatement = function () {
        this.consume(tokens_1.TokenType.RETURN, 'Expected "return"');
        var argument;
        if (!this.check(tokens_1.TokenType.SEMICOLON)) {
            argument = this.parseExpression();
        }
        this.consume(tokens_1.TokenType.SEMICOLON, 'Expected ";"');
        return new nodes_1.ReturnStatementNode(argument);
    };
    Parser.prototype.parseVariableDeclaration = function () {
        var declarationType;
        if (this.match(tokens_1.TokenType.VAR)) {
            // Type inference - create a placeholder type
            declarationType = new nodes_1.TypeNode('var', false, []);
        }
        else {
            declarationType = this.parseType();
        }
        var name = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected variable name').value;
        var initializer;
        if (this.match(tokens_1.TokenType.ASSIGN)) {
            initializer = this.parseExpression();
        }
        this.consume(tokens_1.TokenType.SEMICOLON, 'Expected ";"');
        return new nodes_1.VariableDeclarationNode(declarationType, name, initializer);
    };
    Parser.prototype.parseExpressionStatement = function () {
        var expression = this.parseExpression();
        this.consume(tokens_1.TokenType.SEMICOLON, 'Expected ";"');
        return new nodes_1.ExpressionStatementNode(expression);
    };
    // Expression parsing methods
    Parser.prototype.parseExpression = function () {
        return this.parseAssignment();
    };
    Parser.prototype.parseAssignment = function () {
        var expr = this.parseLogicalOr();
        if (this.match(tokens_1.TokenType.ASSIGN)) {
            var right = this.parseAssignment();
            return new nodes_1.AssignmentExpressionNode(expr, right);
        }
        return expr;
    };
    Parser.prototype.parseLogicalOr = function () {
        var expr = this.parseLogicalAnd();
        while (this.match(tokens_1.TokenType.OR)) {
            var operator = this.previous().value;
            var right = this.parseLogicalAnd();
            expr = new nodes_1.BinaryExpressionNode(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.parseLogicalAnd = function () {
        var expr = this.parseEquality();
        while (this.match(tokens_1.TokenType.AND)) {
            var operator = this.previous().value;
            var right = this.parseEquality();
            expr = new nodes_1.BinaryExpressionNode(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.parseEquality = function () {
        var expr = this.parseComparison();
        while (this.match(tokens_1.TokenType.EQUAL, tokens_1.TokenType.NOT_EQUAL)) {
            var operator = this.previous().value;
            var right = this.parseComparison();
            expr = new nodes_1.BinaryExpressionNode(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.parseComparison = function () {
        var expr = this.parseAddition();
        while (this.match(tokens_1.TokenType.GREATER_THAN, tokens_1.TokenType.GREATER_EQUAL, tokens_1.TokenType.LESS_THAN, tokens_1.TokenType.LESS_EQUAL)) {
            var operator = this.previous().value;
            var right = this.parseAddition();
            expr = new nodes_1.BinaryExpressionNode(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.parseAddition = function () {
        var expr = this.parseMultiplication();
        while (this.match(tokens_1.TokenType.PLUS, tokens_1.TokenType.MINUS)) {
            var operator = this.previous().value;
            var right = this.parseMultiplication();
            expr = new nodes_1.BinaryExpressionNode(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.parseMultiplication = function () {
        var expr = this.parseUnary();
        while (this.match(tokens_1.TokenType.MULTIPLY, tokens_1.TokenType.DIVIDE, tokens_1.TokenType.MODULO)) {
            var operator = this.previous().value;
            var right = this.parseUnary();
            expr = new nodes_1.BinaryExpressionNode(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.parseUnary = function () {
        if (this.match(tokens_1.TokenType.NOT, tokens_1.TokenType.MINUS)) {
            var operator = this.previous().value;
            var right = this.parseUnary();
            return new nodes_1.BinaryExpressionNode(new nodes_1.LiteralNode(null, 'null'), operator, right); // Simplified unary
        }
        return this.parseCall();
    };
    Parser.prototype.parseCall = function () {
        var expr = this.parsePrimary();
        while (true) {
            if (this.match(tokens_1.TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            }
            else if (this.match(tokens_1.TokenType.DOT)) {
                var name_1 = this.consume(tokens_1.TokenType.IDENTIFIER, 'Expected property name').value;
                expr = new nodes_1.MemberExpressionNode(expr, new nodes_1.IdentifierNode(name_1), false);
            }
            else {
                break;
            }
        }
        return expr;
    };
    Parser.prototype.finishCall = function (callee) {
        var args = [];
        if (!this.check(tokens_1.TokenType.RIGHT_PAREN)) {
            do {
                args.push(this.parseExpression());
            } while (this.match(tokens_1.TokenType.COMMA));
        }
        this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")"');
        return new nodes_1.CallExpressionNode(callee, args);
    };
    Parser.prototype.parsePrimary = function () {
        // Handle new expressions (DOM constructors)
        if (this.match(tokens_1.TokenType.NEW)) {
            var type = this.parseType();
            // Check if this is a DOM type
            if (this.isDOMType(type.name)) {
                this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "(" after DOM constructor');
                var args = [];
                if (!this.check(tokens_1.TokenType.RIGHT_PAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(tokens_1.TokenType.COMMA));
                }
                this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")" after arguments');
                return new nodes_1.DOMConstructorNode(type.name, args);
            }
            // Fall back to regular constructor handling (future implementation)
            throw new ParseError("Constructor for type ".concat(type.name, " not yet implemented"), this.peek());
        }
        // Handle JS interop
        if (this.match(tokens_1.TokenType.JS)) {
            this.consume(tokens_1.TokenType.DOT, 'Expected "." after "JS"');
            if (this.match(tokens_1.TokenType.IDENTIFIER)) {
                var methodName = this.previous().value;
                if (methodName === 'Call') {
                    return this.parseJSCall();
                }
                else if (methodName === 'Set') {
                    return this.parseJSSet();
                }
                else {
                    throw new ParseError("Unknown JS method: ".concat(methodName), this.previous());
                }
            }
            else {
                throw new ParseError('Expected method name after "JS."', this.peek());
            }
        }
        if (this.match(tokens_1.TokenType.BOOLEAN)) {
            var value = this.previous().value === 'true';
            return new nodes_1.LiteralNode(value, 'boolean');
        }
        if (this.match(tokens_1.TokenType.NULL)) {
            return new nodes_1.LiteralNode(null, 'null');
        }
        if (this.match(tokens_1.TokenType.NUMBER)) {
            var value = parseFloat(this.previous().value);
            return new nodes_1.LiteralNode(value, 'number');
        }
        if (this.match(tokens_1.TokenType.STRING)) {
            var value = this.previous().value;
            // The lexer already removes quotes, so use the value directly
            return new nodes_1.LiteralNode(value, 'string');
        }
        if (this.match(tokens_1.TokenType.IDENTIFIER)) {
            var name_2 = this.previous().value;
            return new nodes_1.IdentifierNode(name_2);
        }
        if (this.match(tokens_1.TokenType.LEFT_PAREN)) {
            var expr = this.parseExpression();
            this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")"');
            return expr;
        }
        throw new ParseError("Expected expression, but found ".concat(this.peek().type, " with value \"").concat(this.peek().value, "\""), this.peek());
    };
    Parser.prototype.isTypeToken = function () {
        return this.check(tokens_1.TokenType.INT) ||
            this.check(tokens_1.TokenType.DOUBLE) ||
            this.check(tokens_1.TokenType.STRING_TYPE) ||
            this.check(tokens_1.TokenType.BOOL) ||
            this.check(tokens_1.TokenType.OBJECT) ||
            this.check(tokens_1.TokenType.DYNAMIC) ||
            this.check(tokens_1.TokenType.VOID) ||
            (this.check(tokens_1.TokenType.IDENTIFIER) &&
                ['int', 'double', 'string', 'bool', 'object', 'dynamic', 'void'].includes(this.peek().value));
    };
    Parser.prototype.parseJSCall = function () {
        this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "(" after "JS.Call"');
        // First argument should be the method path string
        var methodPathExpr = this.parseExpression();
        if (!(methodPathExpr instanceof nodes_1.LiteralNode) || methodPathExpr.literalType !== 'string') {
            throw new ParseError('JS.Call first argument must be a string literal', this.peek());
        }
        var methodPath = methodPathExpr.value;
        var args = [];
        // Parse additional arguments
        while (!this.check(tokens_1.TokenType.RIGHT_PAREN) && !this.isAtEnd()) {
            this.consume(tokens_1.TokenType.COMMA, 'Expected "," between arguments');
            args.push(this.parseExpression());
        }
        this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")" after arguments');
        return new nodes_1.JSCallExpressionNode(methodPath, args);
    };
    Parser.prototype.parseJSSet = function () {
        this.consume(tokens_1.TokenType.LEFT_PAREN, 'Expected "(" after "JS.Set"');
        // Parse three arguments: object, property, value
        var object = this.parseExpression();
        this.consume(tokens_1.TokenType.COMMA, 'Expected "," after object argument');
        var property = this.parseExpression();
        this.consume(tokens_1.TokenType.COMMA, 'Expected "," after property argument');
        var value = this.parseExpression();
        this.consume(tokens_1.TokenType.RIGHT_PAREN, 'Expected ")" after value argument');
        return new nodes_1.JSSetExpressionNode(object, property, value);
    };
    /**
     * Check if a type name is a DOM type that should be handled by the runtime bridge
     */
    Parser.prototype.isDOMType = function (typeName) {
        var domTypes = [
            // Base DOM types
            'Node', 'Element', 'HTMLElement', 'Document',
            // Specific HTML elements
            'HTMLButtonElement', 'HTMLInputElement', 'HTMLDivElement',
            'HTMLSpanElement', 'HTMLFormElement', 'HTMLTextAreaElement',
            'HTMLImageElement', 'HTMLAnchorElement', 'HTMLUListElement',
            'HTMLLIElement', 'HTMLTableElement', 'HTMLCanvasElement',
            // DOM utility types
            'CSSStyleDeclaration', 'DOMTokenList', 'FormData',
            'HTMLCollection', 'NodeList'
        ];
        return domTypes.includes(typeName);
    };
    return Parser;
}());
exports.Parser = Parser;
