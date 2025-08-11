/**
 * Parser implementation for Web#
 * Builds Abstract Syntax Tree from tokens
 */
import { TokenType } from '../lexer/tokens.js';
import { CompilationUnitNode, ClassNode, MethodNode, PropertyNode, FieldNode, ParameterNode, TypeNode, BlockStatementNode, AccessModifier } from '../ast/nodes.js';
export class ParseError extends Error {
    token;
    constructor(message, token) {
        super(`${message} at line ${token.line}, column ${token.column}`);
        this.token = token;
    }
}
export class Parser {
    tokens;
    current = 0;
    constructor(tokens) {
        this.tokens = tokens.filter(token => token.type !== TokenType.WHITESPACE &&
            token.type !== TokenType.NEWLINE);
    }
    parse() {
        const classes = [];
        const usings = [];
        while (!this.isAtEnd()) {
            if (this.check(TokenType.USING)) {
                usings.push(this.parseUsing());
            }
            else if (this.check(TokenType.CLASS) ||
                this.check(TokenType.PUBLIC) ||
                this.check(TokenType.PRIVATE) ||
                this.check(TokenType.PROTECTED) ||
                this.check(TokenType.INTERNAL) ||
                this.check(TokenType.ABSTRACT) ||
                this.check(TokenType.STATIC)) {
                classes.push(this.parseClass());
            }
            else {
                throw new ParseError('Expected class declaration or using statement', this.peek());
            }
        }
        return new CompilationUnitNode(classes, usings, this.getSourceLocation(0));
    }
    parseUsing() {
        this.consume(TokenType.USING, 'Expected "using"');
        const namespace = this.consume(TokenType.IDENTIFIER, 'Expected namespace name').value;
        this.consume(TokenType.SEMICOLON, 'Expected ";" after using statement');
        return namespace;
    }
    parseClass() {
        const start = this.current;
        // Parse access modifiers and other keywords
        let accessModifier = AccessModifier.Public;
        let isStatic = false;
        let isAbstract = false;
        while (this.check(TokenType.PUBLIC) ||
            this.check(TokenType.PRIVATE) ||
            this.check(TokenType.PROTECTED) ||
            this.check(TokenType.INTERNAL) ||
            this.check(TokenType.STATIC) ||
            this.check(TokenType.ABSTRACT)) {
            const token = this.advance();
            switch (token.type) {
                case TokenType.PUBLIC:
                    accessModifier = AccessModifier.Public;
                    break;
                case TokenType.PRIVATE:
                    accessModifier = AccessModifier.Private;
                    break;
                case TokenType.PROTECTED:
                    accessModifier = AccessModifier.Protected;
                    break;
                case TokenType.INTERNAL:
                    accessModifier = AccessModifier.Internal;
                    break;
                case TokenType.STATIC:
                    isStatic = true;
                    break;
                case TokenType.ABSTRACT:
                    isAbstract = true;
                    break;
            }
        }
        this.consume(TokenType.CLASS, 'Expected "class"');
        const className = this.consume(TokenType.IDENTIFIER, 'Expected class name').value;
        // Parse inheritance
        let baseClass;
        const interfaces = [];
        if (this.match(TokenType.COLON)) {
            const firstBase = this.consume(TokenType.IDENTIFIER, 'Expected base class or interface name').value;
            // Check if it's followed by more interfaces
            if (this.match(TokenType.COMMA)) {
                interfaces.push(firstBase);
                do {
                    interfaces.push(this.consume(TokenType.IDENTIFIER, 'Expected interface name').value);
                } while (this.match(TokenType.COMMA));
            }
            else {
                // Assume it's a base class for now (could be improved with type analysis)
                baseClass = firstBase;
            }
        }
        this.consume(TokenType.LEFT_BRACE, 'Expected "{"');
        // Parse class members
        const members = [];
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            members.push(this.parseClassMember());
        }
        this.consume(TokenType.RIGHT_BRACE, 'Expected "}"');
        return new ClassNode(className, members, baseClass, interfaces, accessModifier, isStatic, isAbstract, this.getSourceLocation(start));
    }
    parseClassMember() {
        const start = this.current;
        // Parse modifiers
        let accessModifier = AccessModifier.Public;
        let isStatic = false;
        let isVirtual = false;
        let isOverride = false;
        let isAbstract = false;
        while (this.check(TokenType.PUBLIC) ||
            this.check(TokenType.PRIVATE) ||
            this.check(TokenType.PROTECTED) ||
            this.check(TokenType.INTERNAL) ||
            this.check(TokenType.STATIC) ||
            this.check(TokenType.VIRTUAL) ||
            this.check(TokenType.OVERRIDE) ||
            this.check(TokenType.ABSTRACT)) {
            const token = this.advance();
            switch (token.type) {
                case TokenType.PUBLIC:
                    accessModifier = AccessModifier.Public;
                    break;
                case TokenType.PRIVATE:
                    accessModifier = AccessModifier.Private;
                    break;
                case TokenType.PROTECTED:
                    accessModifier = AccessModifier.Protected;
                    break;
                case TokenType.INTERNAL:
                    accessModifier = AccessModifier.Internal;
                    break;
                case TokenType.STATIC:
                    isStatic = true;
                    break;
                case TokenType.VIRTUAL:
                    isVirtual = true;
                    break;
                case TokenType.OVERRIDE:
                    isOverride = true;
                    break;
                case TokenType.ABSTRACT:
                    isAbstract = true;
                    break;
            }
        }
        // Parse type
        const type = this.parseType();
        const memberName = this.consume(TokenType.IDENTIFIER, 'Expected member name').value;
        // Determine if it's a method, property, or field
        if (this.check(TokenType.LEFT_PAREN)) {
            // Method
            return this.parseMethod(memberName, type, accessModifier, isStatic, isVirtual, isOverride, isAbstract, start);
        }
        else if (this.check(TokenType.LEFT_BRACE)) {
            // Property with getter/setter
            return this.parseProperty(memberName, type, accessModifier, isStatic, start);
        }
        else if (this.match(TokenType.SEMICOLON)) {
            // Field
            return new FieldNode(memberName, type, undefined, accessModifier, isStatic, this.getSourceLocation(start));
        }
        else if (this.match(TokenType.ASSIGN)) {
            // Field with initializer
            // For now, skip the initializer (would need expression parsing)
            this.skipToSemicolon();
            return new FieldNode(memberName, type, undefined, accessModifier, isStatic, this.getSourceLocation(start));
        }
        else {
            throw new ParseError('Expected method parameters, property accessors, or field declaration', this.peek());
        }
    }
    parseMethod(name, returnType, accessModifier, isStatic, isVirtual, isOverride, isAbstract, start) {
        this.consume(TokenType.LEFT_PAREN, 'Expected "("');
        const parameters = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                const paramType = this.parseType();
                const paramName = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;
                parameters.push(new ParameterNode(paramName, paramType));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');
        let body = null;
        if (this.match(TokenType.LEFT_BRACE)) {
            // For now, just skip the method body
            this.skipBlock();
            body = new BlockStatementNode([]); // Empty body for now
        }
        else if (this.match(TokenType.SEMICOLON)) {
            // Abstract method or interface method
            body = null;
        }
        else {
            throw new ParseError('Expected method body or ";"', this.peek());
        }
        return new MethodNode(name, returnType, parameters, body, accessModifier, isStatic, isVirtual, isOverride, isAbstract, this.getSourceLocation(start));
    }
    parseProperty(name, type, accessModifier, isStatic, start) {
        this.consume(TokenType.LEFT_BRACE, 'Expected "{"');
        let hasGetter = false;
        let hasSetter = false;
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            if (this.match(TokenType.GET)) {
                hasGetter = true;
                if (this.match(TokenType.SEMICOLON)) {
                    // Auto-implemented getter
                }
                else if (this.match(TokenType.LEFT_BRACE)) {
                    // Custom getter implementation - skip for now
                    this.skipBlock();
                }
            }
            else if (this.match(TokenType.SET)) {
                hasSetter = true;
                if (this.match(TokenType.SEMICOLON)) {
                    // Auto-implemented setter
                }
                else if (this.match(TokenType.LEFT_BRACE)) {
                    // Custom setter implementation - skip for now
                    this.skipBlock();
                }
            }
            else {
                throw new ParseError('Expected "get" or "set"', this.peek());
            }
        }
        this.consume(TokenType.RIGHT_BRACE, 'Expected "}"');
        return new PropertyNode(name, type, hasGetter, hasSetter, accessModifier, isStatic, this.getSourceLocation(start));
    }
    parseType() {
        let typeName;
        // Handle built-in types
        if (this.check(TokenType.INT)) {
            typeName = 'int';
            this.advance();
        }
        else if (this.check(TokenType.DOUBLE)) {
            typeName = 'double';
            this.advance();
        }
        else if (this.check(TokenType.STRING_TYPE)) {
            typeName = 'string';
            this.advance();
        }
        else if (this.check(TokenType.BOOL)) {
            typeName = 'bool';
            this.advance();
        }
        else if (this.check(TokenType.OBJECT)) {
            typeName = 'object';
            this.advance();
        }
        else if (this.check(TokenType.DYNAMIC)) {
            typeName = 'dynamic';
            this.advance();
        }
        else if (this.check(TokenType.VOID)) {
            typeName = 'void';
            this.advance();
        }
        else if (this.check(TokenType.VAR)) {
            typeName = 'var';
            this.advance();
        }
        else {
            typeName = this.consume(TokenType.IDENTIFIER, 'Expected type name').value;
        }
        // Check for nullable
        let isNullable = false;
        if (this.match(TokenType.QUESTION)) {
            isNullable = true;
        }
        // TODO: Handle generics (List<T>, etc.)
        const genericArguments = [];
        return new TypeNode(typeName, isNullable, genericArguments);
    }
    skipBlock() {
        let braceCount = 1;
        while (braceCount > 0 && !this.isAtEnd()) {
            if (this.check(TokenType.LEFT_BRACE)) {
                braceCount++;
            }
            else if (this.check(TokenType.RIGHT_BRACE)) {
                braceCount--;
            }
            this.advance();
        }
    }
    skipToSemicolon() {
        while (!this.check(TokenType.SEMICOLON) && !this.isAtEnd()) {
            this.advance();
        }
        if (this.check(TokenType.SEMICOLON)) {
            this.advance();
        }
    }
    // Utility methods
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        throw new ParseError(message, this.peek());
    }
    getSourceLocation(start) {
        const startToken = this.tokens[start];
        const endToken = this.previous();
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
    }
}
