"use strict";
/**
 * Lexer implementation for Web#
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
var tokens_1 = require("./tokens");
var Lexer = /** @class */ (function () {
    function Lexer(input) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.input = input;
    }
    Lexer.prototype.tokenize = function () {
        var tokens = [];
        while (!this.isAtEnd()) {
            var token = this.nextToken();
            if (token.type !== tokens_1.TokenType.WHITESPACE) {
                tokens.push(token);
            }
        }
        tokens.push(this.createToken(tokens_1.TokenType.EOF, ''));
        return tokens;
    };
    Lexer.prototype.nextToken = function () {
        var start = this.position;
        var char = this.advance();
        switch (char) {
            // Whitespace
            case ' ':
            case '\r':
            case '\t':
                return this.createToken(tokens_1.TokenType.WHITESPACE, char, start);
            case '\n':
                this.line++;
                this.column = 1;
                return this.createToken(tokens_1.TokenType.NEWLINE, char, start);
            // Single character tokens
            case '(':
                return this.createToken(tokens_1.TokenType.LEFT_PAREN, char, start);
            case ')':
                return this.createToken(tokens_1.TokenType.RIGHT_PAREN, char, start);
            case '{':
                return this.createToken(tokens_1.TokenType.LEFT_BRACE, char, start);
            case '}':
                return this.createToken(tokens_1.TokenType.RIGHT_BRACE, char, start);
            case '[':
                return this.createToken(tokens_1.TokenType.LEFT_BRACKET, char, start);
            case ']':
                return this.createToken(tokens_1.TokenType.RIGHT_BRACKET, char, start);
            case ';':
                return this.createToken(tokens_1.TokenType.SEMICOLON, char, start);
            case ',':
                return this.createToken(tokens_1.TokenType.COMMA, char, start);
            // Operators that can be compound
            case '+':
                if (this.match('+'))
                    return this.createToken(tokens_1.TokenType.INCREMENT, '++', start);
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.PLUS_ASSIGN, '+=', start);
                return this.createToken(tokens_1.TokenType.PLUS, char, start);
            case '-':
                if (this.match('-'))
                    return this.createToken(tokens_1.TokenType.DECREMENT, '--', start);
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.MINUS_ASSIGN, '-=', start);
                return this.createToken(tokens_1.TokenType.MINUS, char, start);
            case '*':
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.MULTIPLY_ASSIGN, '*=', start);
                return this.createToken(tokens_1.TokenType.MULTIPLY, char, start);
            case '/':
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.DIVIDE_ASSIGN, '/=', start);
                if (this.match('/')) {
                    // Single line comment
                    this.skipLineComment();
                    return this.nextToken();
                }
                if (this.match('*')) {
                    // Multi-line comment
                    this.skipBlockComment();
                    return this.nextToken();
                }
                return this.createToken(tokens_1.TokenType.DIVIDE, char, start);
            case '%':
                return this.createToken(tokens_1.TokenType.MODULO, char, start);
            case '=':
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.EQUAL, '==', start);
                if (this.match('>'))
                    return this.createToken(tokens_1.TokenType.ARROW, '=>', start);
                return this.createToken(tokens_1.TokenType.ASSIGN, char, start);
            case '!':
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.NOT_EQUAL, '!=', start);
                return this.createToken(tokens_1.TokenType.NOT, char, start);
            case '<':
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.LESS_EQUAL, '<=', start);
                return this.createToken(tokens_1.TokenType.LESS_THAN, char, start);
            case '>':
                if (this.match('='))
                    return this.createToken(tokens_1.TokenType.GREATER_EQUAL, '>=', start);
                return this.createToken(tokens_1.TokenType.GREATER_THAN, char, start);
            case '&':
                if (this.match('&'))
                    return this.createToken(tokens_1.TokenType.AND, '&&', start);
                return this.createToken(tokens_1.TokenType.UNKNOWN, char, start);
            case '|':
                if (this.match('|'))
                    return this.createToken(tokens_1.TokenType.OR, '||', start);
                return this.createToken(tokens_1.TokenType.UNKNOWN, char, start);
            case '?':
                if (this.match('?'))
                    return this.createToken(tokens_1.TokenType.NULL_COALESCING, '??', start);
                if (this.match('.'))
                    return this.createToken(tokens_1.TokenType.NULL_CONDITIONAL, '?.', start);
                return this.createToken(tokens_1.TokenType.QUESTION, char, start);
            case '.':
                return this.createToken(tokens_1.TokenType.DOT, char, start);
            case ':':
                return this.createToken(tokens_1.TokenType.COLON, char, start);
            // String literals
            case '"':
                return this.scanString(start);
            case '\'':
                return this.scanCharLiteral(start);
            default:
                if (this.isDigit(char)) {
                    return this.scanNumber(start);
                }
                if (this.isAlpha(char)) {
                    return this.scanIdentifier(start);
                }
                return this.createToken(tokens_1.TokenType.UNKNOWN, char, start);
        }
    };
    Lexer.prototype.scanString = function (start) {
        var value = '';
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
                this.column = 1;
            }
            if (this.peek() === '\\') {
                this.advance(); // consume backslash
                var escaped = this.advance();
                switch (escaped) {
                    case 'n':
                        value += '\n';
                        break;
                    case 't':
                        value += '\t';
                        break;
                    case 'r':
                        value += '\r';
                        break;
                    case '\\':
                        value += '\\';
                        break;
                    case '"':
                        value += '"';
                        break;
                    case '\'':
                        value += '\'';
                        break;
                    default:
                        value += escaped;
                        break;
                }
            }
            else {
                value += this.advance();
            }
        }
        if (this.isAtEnd()) {
            throw new Error("Unterminated string at line ".concat(this.line, ", column ").concat(this.column));
        }
        // Consume closing quote
        this.advance();
        return this.createToken(tokens_1.TokenType.STRING, value, start);
    };
    Lexer.prototype.scanCharLiteral = function (start) {
        var value = '';
        if (this.peek() === '\\') {
            this.advance(); // consume backslash
            var escaped = this.advance();
            switch (escaped) {
                case 'n':
                    value = '\n';
                    break;
                case 't':
                    value = '\t';
                    break;
                case 'r':
                    value = '\r';
                    break;
                case '\\':
                    value = '\\';
                    break;
                case '"':
                    value = '"';
                    break;
                case '\'':
                    value = '\'';
                    break;
                default:
                    value = escaped;
                    break;
            }
        }
        else {
            value = this.advance();
        }
        if (this.peek() !== '\'') {
            throw new Error("Unterminated character literal at line ".concat(this.line, ", column ").concat(this.column));
        }
        // Consume closing quote
        this.advance();
        return this.createToken(tokens_1.TokenType.STRING, value, start);
    };
    Lexer.prototype.scanNumber = function (start) {
        while (this.isDigit(this.peek())) {
            this.advance();
        }
        // Look for decimal point
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance(); // consume '.'
            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }
        var value = this.input.substring(start, this.position);
        return this.createToken(tokens_1.TokenType.NUMBER, value, start);
    };
    Lexer.prototype.scanIdentifier = function (start) {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        var value = this.input.substring(start, this.position);
        var type = tokens_1.KEYWORDS[value] || tokens_1.TokenType.IDENTIFIER;
        return this.createToken(type, value, start);
    };
    Lexer.prototype.skipLineComment = function () {
        while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
        }
    };
    Lexer.prototype.skipBlockComment = function () {
        while (!this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
                this.column = 1;
            }
            if (this.peek() === '*' && this.peekNext() === '/') {
                this.advance(); // consume '*'
                this.advance(); // consume '/'
                break;
            }
            this.advance();
        }
    };
    Lexer.prototype.advance = function () {
        var char = this.input.charAt(this.position);
        this.position++;
        this.column++;
        return char;
    };
    Lexer.prototype.match = function (expected) {
        if (this.isAtEnd())
            return false;
        if (this.input.charAt(this.position) !== expected)
            return false;
        this.position++;
        this.column++;
        return true;
    };
    Lexer.prototype.peek = function () {
        if (this.isAtEnd())
            return '\0';
        return this.input.charAt(this.position);
    };
    Lexer.prototype.peekNext = function () {
        if (this.position + 1 >= this.input.length)
            return '\0';
        return this.input.charAt(this.position + 1);
    };
    Lexer.prototype.isAtEnd = function () {
        return this.position >= this.input.length;
    };
    Lexer.prototype.isDigit = function (char) {
        return char >= '0' && char <= '9';
    };
    Lexer.prototype.isAlpha = function (char) {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            char === '_';
    };
    Lexer.prototype.isAlphaNumeric = function (char) {
        return this.isAlpha(char) || this.isDigit(char);
    };
    Lexer.prototype.createToken = function (type, value, start) {
        var tokenStart = start !== null && start !== void 0 ? start : this.position - value.length;
        var tokenColumn = this.column - value.length;
        return {
            type: type,
            value: value,
            line: this.line,
            column: tokenColumn,
            start: tokenStart,
            end: this.position
        };
    };
    return Lexer;
}());
exports.Lexer = Lexer;
