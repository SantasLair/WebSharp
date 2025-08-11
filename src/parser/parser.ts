/**
 * Parser implementation for Web#
 * Builds Abstract Syntax Tree from tokens
 */

import { Token, TokenType } from '../lexer/tokens';
import {
  ASTNode,
  CompilationUnitNode,
  ClassNode,
  MethodNode,
  PropertyNode,
  FieldNode,
  ParameterNode,
  TypeNode,
  BlockStatementNode,
  AccessModifier,
  SourceLocation,
  Position
} from '../ast/nodes';

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly token: Token
  ) {
    super(`${message} at line ${token.line}, column ${token.column}`);
  }
}

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.WHITESPACE && 
      token.type !== TokenType.NEWLINE
    );
  }

  public parse(): CompilationUnitNode {
    const classes: ClassNode[] = [];
    const usings: string[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.USING)) {
        usings.push(this.parseUsing());
      } else if (this.check(TokenType.CLASS) || 
                 this.check(TokenType.PUBLIC) ||
                 this.check(TokenType.PRIVATE) ||
                 this.check(TokenType.PROTECTED) ||
                 this.check(TokenType.INTERNAL) ||
                 this.check(TokenType.ABSTRACT) ||
                 this.check(TokenType.STATIC)) {
        classes.push(this.parseClass());
      } else {
        throw new ParseError('Expected class declaration or using statement', this.peek());
      }
    }

    return new CompilationUnitNode(classes, usings, this.getSourceLocation(0));
  }

  private parseUsing(): string {
    this.consume(TokenType.USING, 'Expected "using"');
    const namespace = this.consume(TokenType.IDENTIFIER, 'Expected namespace name').value;
    this.consume(TokenType.SEMICOLON, 'Expected ";" after using statement');
    return namespace;
  }

  private parseClass(): ClassNode {
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
    let baseClass: string | undefined;
    const interfaces: string[] = [];

    if (this.match(TokenType.COLON)) {
      const firstBase = this.consume(TokenType.IDENTIFIER, 'Expected base class or interface name').value;
      
      // Check if it's followed by more interfaces
      if (this.match(TokenType.COMMA)) {
        interfaces.push(firstBase);
        do {
          interfaces.push(this.consume(TokenType.IDENTIFIER, 'Expected interface name').value);
        } while (this.match(TokenType.COMMA));
      } else {
        // Assume it's a base class for now (could be improved with type analysis)
        baseClass = firstBase;
      }
    }

    this.consume(TokenType.LEFT_BRACE, 'Expected "{"');

    // Parse class members
    const members: (MethodNode | PropertyNode | FieldNode)[] = [];
    
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      members.push(this.parseClassMember());
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expected "}"');

    return new ClassNode(
      className,
      members,
      baseClass,
      interfaces,
      accessModifier,
      isStatic,
      isAbstract,
      this.getSourceLocation(start)
    );
  }

  private parseClassMember(): MethodNode | PropertyNode | FieldNode {
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
    } else if (this.check(TokenType.LEFT_BRACE)) {
      // Property with getter/setter
      return this.parseProperty(memberName, type, accessModifier, isStatic, start);
    } else if (this.match(TokenType.SEMICOLON)) {
      // Field
      return new FieldNode(memberName, type, undefined, accessModifier, isStatic, this.getSourceLocation(start));
    } else if (this.match(TokenType.ASSIGN)) {
      // Field with initializer
      // For now, skip the initializer (would need expression parsing)
      this.skipToSemicolon();
      return new FieldNode(memberName, type, undefined, accessModifier, isStatic, this.getSourceLocation(start));
    } else {
      throw new ParseError('Expected method parameters, property accessors, or field declaration', this.peek());
    }
  }

  private parseMethod(
    name: string,
    returnType: TypeNode,
    accessModifier: AccessModifier,
    isStatic: boolean,
    isVirtual: boolean,
    isOverride: boolean,
    isAbstract: boolean,
    start: number
  ): MethodNode {
    this.consume(TokenType.LEFT_PAREN, 'Expected "("');
    
    const parameters: ParameterNode[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        const paramType = this.parseType();
        const paramName = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;
        parameters.push(new ParameterNode(paramName, paramType));
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');

    let body: BlockStatementNode | null = null;
    if (this.match(TokenType.LEFT_BRACE)) {
      // For now, just skip the method body
      this.skipBlock();
      body = new BlockStatementNode([]); // Empty body for now
    } else if (this.match(TokenType.SEMICOLON)) {
      // Abstract method or interface method
      body = null;
    } else {
      throw new ParseError('Expected method body or ";"', this.peek());
    }

    return new MethodNode(
      name,
      returnType,
      parameters,
      body,
      accessModifier,
      isStatic,
      isVirtual,
      isOverride,
      isAbstract,
      this.getSourceLocation(start)
    );
  }

  private parseProperty(
    name: string,
    type: TypeNode,
    accessModifier: AccessModifier,
    isStatic: boolean,
    start: number
  ): PropertyNode {
    this.consume(TokenType.LEFT_BRACE, 'Expected "{"');
    
    let hasGetter = false;
    let hasSetter = false;

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.GET)) {
        hasGetter = true;
        if (this.match(TokenType.SEMICOLON)) {
          // Auto-implemented getter
        } else if (this.match(TokenType.LEFT_BRACE)) {
          // Custom getter implementation - skip for now
          this.skipBlock();
        }
      } else if (this.match(TokenType.SET)) {
        hasSetter = true;
        if (this.match(TokenType.SEMICOLON)) {
          // Auto-implemented setter
        } else if (this.match(TokenType.LEFT_BRACE)) {
          // Custom setter implementation - skip for now
          this.skipBlock();
        }
      } else {
        throw new ParseError('Expected "get" or "set"', this.peek());
      }
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expected "}"');

    return new PropertyNode(
      name,
      type,
      hasGetter,
      hasSetter,
      accessModifier,
      isStatic,
      this.getSourceLocation(start)
    );
  }

  private parseType(): TypeNode {
    let typeName: string;
    
    // Handle built-in types
    if (this.check(TokenType.INT)) {
      typeName = 'int';
      this.advance();
    } else if (this.check(TokenType.DOUBLE)) {
      typeName = 'double';
      this.advance();
    } else if (this.check(TokenType.STRING_TYPE)) {
      typeName = 'string';
      this.advance();
    } else if (this.check(TokenType.BOOL)) {
      typeName = 'bool';
      this.advance();
    } else if (this.check(TokenType.OBJECT)) {
      typeName = 'object';
      this.advance();
    } else if (this.check(TokenType.DYNAMIC)) {
      typeName = 'dynamic';
      this.advance();
    } else if (this.check(TokenType.VOID)) {
      typeName = 'void';
      this.advance();
    } else if (this.check(TokenType.VAR)) {
      typeName = 'var';
      this.advance();
    } else {
      typeName = this.consume(TokenType.IDENTIFIER, 'Expected type name').value;
    }

    // Check for nullable
    let isNullable = false;
    if (this.match(TokenType.QUESTION)) {
      isNullable = true;
    }

    // TODO: Handle generics (List<T>, etc.)
    const genericArguments: TypeNode[] = [];

    return new TypeNode(typeName, isNullable, genericArguments);
  }

  private skipBlock(): void {
    let braceCount = 1;
    while (braceCount > 0 && !this.isAtEnd()) {
      if (this.check(TokenType.LEFT_BRACE)) {
        braceCount++;
      } else if (this.check(TokenType.RIGHT_BRACE)) {
        braceCount--;
      }
      this.advance();
    }
  }

  private skipToSemicolon(): void {
    while (!this.check(TokenType.SEMICOLON) && !this.isAtEnd()) {
      this.advance();
    }
    if (this.check(TokenType.SEMICOLON)) {
      this.advance();
    }
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParseError(message, this.peek());
  }

  private getSourceLocation(start: number): SourceLocation {
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
