/**
 * Lexer implementation for Web#
 */
import { Token } from './tokens.js';
export declare class Lexer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    tokenize(): Token[];
    private nextToken;
    private scanString;
    private scanCharLiteral;
    private scanNumber;
    private scanIdentifier;
    private skipLineComment;
    private skipBlockComment;
    private advance;
    private match;
    private peek;
    private peekNext;
    private isAtEnd;
    private isDigit;
    private isAlpha;
    private isAlphaNumeric;
    private createToken;
}
