/**
 * Lexer implementation for Web#
 */
import { TokenType, KEYWORDS } from './tokens';
export class Lexer {
    input;
    position = 0;
    line = 1;
    column = 1;
    constructor(input) {
        this.input = input;
    }
    tokenize() {
        const tokens = [];
        while (!this.isAtEnd()) {
            const token = this.nextToken();
            if (token.type !== TokenType.WHITESPACE) {
                tokens.push(token);
            }
        }
        tokens.push(this.createToken(TokenType.EOF, ''));
        return tokens;
    }
    nextToken() {
        const start = this.position;
        const char = this.advance();
        switch (char) {
            // Whitespace
            case ' ':
            case '\r':
            case '\t':
                return this.createToken(TokenType.WHITESPACE, char, start);
            case '\n':
                this.line++;
                this.column = 1;
                return this.createToken(TokenType.NEWLINE, char, start);
            // Single character tokens
            case '(':
                return this.createToken(TokenType.LEFT_PAREN, char, start);
            case ')':
                return this.createToken(TokenType.RIGHT_PAREN, char, start);
            case '{':
                return this.createToken(TokenType.LEFT_BRACE, char, start);
            case '}':
                return this.createToken(TokenType.RIGHT_BRACE, char, start);
            case '[':
                return this.createToken(TokenType.LEFT_BRACKET, char, start);
            case ']':
                return this.createToken(TokenType.RIGHT_BRACKET, char, start);
            case ';':
                return this.createToken(TokenType.SEMICOLON, char, start);
            case ',':
                return this.createToken(TokenType.COMMA, char, start);
            // Operators that can be compound
            case '+':
                if (this.match('+'))
                    return this.createToken(TokenType.INCREMENT, '++', start);
                if (this.match('='))
                    return this.createToken(TokenType.PLUS_ASSIGN, '+=', start);
                return this.createToken(TokenType.PLUS, char, start);
            case '-':
                if (this.match('-'))
                    return this.createToken(TokenType.DECREMENT, '--', start);
                if (this.match('='))
                    return this.createToken(TokenType.MINUS_ASSIGN, '-=', start);
                return this.createToken(TokenType.MINUS, char, start);
            case '*':
                if (this.match('='))
                    return this.createToken(TokenType.MULTIPLY_ASSIGN, '*=', start);
                return this.createToken(TokenType.MULTIPLY, char, start);
            case '/':
                if (this.match('='))
                    return this.createToken(TokenType.DIVIDE_ASSIGN, '/=', start);
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
                return this.createToken(TokenType.DIVIDE, char, start);
            case '%':
                return this.createToken(TokenType.MODULO, char, start);
            case '=':
                if (this.match('='))
                    return this.createToken(TokenType.EQUAL, '==', start);
                if (this.match('>'))
                    return this.createToken(TokenType.ARROW, '=>', start);
                return this.createToken(TokenType.ASSIGN, char, start);
            case '!':
                if (this.match('='))
                    return this.createToken(TokenType.NOT_EQUAL, '!=', start);
                return this.createToken(TokenType.NOT, char, start);
            case '<':
                if (this.match('='))
                    return this.createToken(TokenType.LESS_EQUAL, '<=', start);
                return this.createToken(TokenType.LESS_THAN, char, start);
            case '>':
                if (this.match('='))
                    return this.createToken(TokenType.GREATER_EQUAL, '>=', start);
                return this.createToken(TokenType.GREATER_THAN, char, start);
            case '&':
                if (this.match('&'))
                    return this.createToken(TokenType.AND, '&&', start);
                return this.createToken(TokenType.UNKNOWN, char, start);
            case '|':
                if (this.match('|'))
                    return this.createToken(TokenType.OR, '||', start);
                return this.createToken(TokenType.UNKNOWN, char, start);
            case '?':
                if (this.match('?'))
                    return this.createToken(TokenType.NULL_COALESCING, '??', start);
                if (this.match('.'))
                    return this.createToken(TokenType.NULL_CONDITIONAL, '?.', start);
                return this.createToken(TokenType.QUESTION, char, start);
            case '.':
                return this.createToken(TokenType.DOT, char, start);
            case ':':
                return this.createToken(TokenType.COLON, char, start);
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
                return this.createToken(TokenType.UNKNOWN, char, start);
        }
    }
    scanString(start) {
        let value = '';
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
                this.column = 1;
            }
            if (this.peek() === '\\') {
                this.advance(); // consume backslash
                const escaped = this.advance();
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
            throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
        }
        // Consume closing quote
        this.advance();
        return this.createToken(TokenType.STRING, value, start);
    }
    scanCharLiteral(start) {
        let value = '';
        if (this.peek() === '\\') {
            this.advance(); // consume backslash
            const escaped = this.advance();
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
            throw new Error(`Unterminated character literal at line ${this.line}, column ${this.column}`);
        }
        // Consume closing quote
        this.advance();
        return this.createToken(TokenType.STRING, value, start);
    }
    scanNumber(start) {
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
        const value = this.input.substring(start, this.position);
        return this.createToken(TokenType.NUMBER, value, start);
    }
    scanIdentifier(start) {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        const value = this.input.substring(start, this.position);
        const type = KEYWORDS[value] || TokenType.IDENTIFIER;
        return this.createToken(type, value, start);
    }
    skipLineComment() {
        while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
        }
    }
    skipBlockComment() {
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
    }
    advance() {
        const char = this.input.charAt(this.position);
        this.position++;
        this.column++;
        return char;
    }
    match(expected) {
        if (this.isAtEnd())
            return false;
        if (this.input.charAt(this.position) !== expected)
            return false;
        this.position++;
        this.column++;
        return true;
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.input.charAt(this.position);
    }
    peekNext() {
        if (this.position + 1 >= this.input.length)
            return '\0';
        return this.input.charAt(this.position + 1);
    }
    isAtEnd() {
        return this.position >= this.input.length;
    }
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            char === '_';
    }
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }
    createToken(type, value, start) {
        const tokenStart = start ?? this.position - value.length;
        const tokenColumn = this.column - value.length;
        return {
            type,
            value,
            line: this.line,
            column: tokenColumn,
            start: tokenStart,
            end: this.position
        };
    }
}
