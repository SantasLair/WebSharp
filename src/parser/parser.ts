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
      const initializer = this.parseExpression();
      this.consume(TokenType.SEMICOLON, 'Expected ";"');
      return new FieldNode(memberName, type, initializer, accessModifier, isStatic, this.getSourceLocation(start));
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
      body = this.parseBlockStatement();
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

  // Statement parsing methods
  private parseBlockStatement(): BlockStatementNode {
    const statements: StatementNode[] = [];
    
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    
    this.consume(TokenType.RIGHT_BRACE, 'Expected "}"');
    
    return new BlockStatementNode(statements);
  }

  private parseStatement(): StatementNode {
    if (this.check(TokenType.RETURN)) {
      return this.parseReturnStatement();
    }
    
    if (this.check(TokenType.IF)) {
      // For now, skip IF statements by parsing them as a placeholder
      // TODO: Implement proper IF statement parsing
      this.advance(); // consume 'if'
      this.consume(TokenType.LEFT_PAREN, 'Expected "("');
      this.parseExpression(); // parse condition (and discard)
      this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');
      this.parseStatement(); // parse then statement (and discard)
      if (this.check(TokenType.ELSE)) {
        this.advance(); // consume 'else'
        this.parseStatement(); // parse else statement (and discard)
      }
      // Return a placeholder expression statement
      return new ExpressionStatementNode(new LiteralNode(null, 'null'));
    }
    
    if (this.check(TokenType.WHILE)) {
      // TODO: Implement proper WHILE statement parsing
      this.advance(); // consume 'while'
      this.consume(TokenType.LEFT_PAREN, 'Expected "("');
      this.parseExpression(); // parse condition (and discard)
      this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');
      this.parseStatement(); // parse body (and discard)
      return new ExpressionStatementNode(new LiteralNode(null, 'null'));
    }
    
    if (this.check(TokenType.FOR)) {
      // TODO: Implement proper FOR statement parsing
      this.advance(); // consume 'for'
      this.consume(TokenType.LEFT_PAREN, 'Expected "("');
      // Skip for loop components for now
      while (!this.check(TokenType.RIGHT_PAREN) && !this.isAtEnd()) {
        this.advance();
      }
      this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');
      this.parseStatement(); // parse body (and discard)
      return new ExpressionStatementNode(new LiteralNode(null, 'null'));
    }
    
    if (this.check(TokenType.LEFT_BRACE)) {
      this.advance(); // consume '{'
      return this.parseBlockStatement();
    }

    // Check for variable declaration or expression statement
    const start = this.current;
    
    // Try to parse as variable declaration
    if (this.isTypeToken() || this.check(TokenType.VAR)) {
      return this.parseVariableDeclaration();
    }
    
    // Otherwise parse as expression statement
    return this.parseExpressionStatement();
  }

  private parseReturnStatement(): ReturnStatementNode {
    this.consume(TokenType.RETURN, 'Expected "return"');
    
    let argument: ExpressionNode | undefined;
    if (!this.check(TokenType.SEMICOLON)) {
      argument = this.parseExpression();
    }
    
    this.consume(TokenType.SEMICOLON, 'Expected ";"');
    
    return new ReturnStatementNode(argument);
  }

  private parseVariableDeclaration(): VariableDeclarationNode {
    let declarationType: TypeNode;
    
    if (this.match(TokenType.VAR)) {
      // Type inference - create a placeholder type
      declarationType = new TypeNode('var', false, []);
    } else {
      declarationType = this.parseType();
    }
    
    const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name').value;
    
    let initializer: ExpressionNode | undefined;
    if (this.match(TokenType.ASSIGN)) {
      initializer = this.parseExpression();
    }
    
    this.consume(TokenType.SEMICOLON, 'Expected ";"');
    
    return new VariableDeclarationNode(declarationType, name, initializer);
  }

  private parseExpressionStatement(): ExpressionStatementNode {
    const expression = this.parseExpression();
    this.consume(TokenType.SEMICOLON, 'Expected ";"');
    return new ExpressionStatementNode(expression);
  }

  // Expression parsing methods
  private parseExpression(): ExpressionNode {
    return this.parseAssignment();
  }

  private parseAssignment(): ExpressionNode {
    const expr = this.parseLogicalOr();
    
    if (this.match(TokenType.ASSIGN)) {
      const right = this.parseAssignment();
      return new AssignmentExpressionNode(expr, right);
    }
    
    return expr;
  }

  private parseLogicalOr(): ExpressionNode {
    let expr = this.parseLogicalAnd();
    
    while (this.match(TokenType.OR)) {
      const operator = this.previous().value;
      const right = this.parseLogicalAnd();
      expr = new BinaryExpressionNode(expr, operator, right);
    }
    
    return expr;
  }

  private parseLogicalAnd(): ExpressionNode {
    let expr = this.parseEquality();
    
    while (this.match(TokenType.AND)) {
      const operator = this.previous().value;
      const right = this.parseEquality();
      expr = new BinaryExpressionNode(expr, operator, right);
    }
    
    return expr;
  }

  private parseEquality(): ExpressionNode {
    let expr = this.parseComparison();
    
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().value;
      const right = this.parseComparison();
      expr = new BinaryExpressionNode(expr, operator, right);
    }
    
    return expr;
  }

  private parseComparison(): ExpressionNode {
    let expr = this.parseAddition();
    
    while (this.match(TokenType.GREATER_THAN, TokenType.GREATER_EQUAL, TokenType.LESS_THAN, TokenType.LESS_EQUAL)) {
      const operator = this.previous().value;
      const right = this.parseAddition();
      expr = new BinaryExpressionNode(expr, operator, right);
    }
    
    return expr;
  }

  private parseAddition(): ExpressionNode {
    let expr = this.parseMultiplication();
    
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.parseMultiplication();
      expr = new BinaryExpressionNode(expr, operator, right);
    }
    
    return expr;
  }

  private parseMultiplication(): ExpressionNode {
    let expr = this.parseUnary();
    
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      expr = new BinaryExpressionNode(expr, operator, right);
    }
    
    return expr;
  }

  private parseUnary(): ExpressionNode {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      return new BinaryExpressionNode(new LiteralNode(null, 'null'), operator, right); // Simplified unary
    }
    
    return this.parseCall();
  }

  private parseCall(): ExpressionNode {
    let expr = this.parsePrimary();
    
    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, 'Expected property name').value;
        expr = new MemberExpressionNode(expr, new IdentifierNode(name), false);
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: ExpressionNode): CallExpressionNode {
    const args: ExpressionNode[] = [];
    
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');
    
    return new CallExpressionNode(callee, args);
  }

  private parsePrimary(): ExpressionNode {
    if (this.match(TokenType.BOOLEAN)) {
      const value = this.previous().value === 'true';
      return new LiteralNode(value, 'boolean');
    }
    
    if (this.match(TokenType.NULL)) {
      return new LiteralNode(null, 'null');
    }
    
    if (this.match(TokenType.NUMBER)) {
      const value = parseFloat(this.previous().value);
      return new LiteralNode(value, 'number');
    }
    
    if (this.match(TokenType.STRING)) {
      const value = this.previous().value;
      // The lexer already removes quotes, so use the value directly
      return new LiteralNode(value, 'string');
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.previous().value;
      return new IdentifierNode(name);
    }
    
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RIGHT_PAREN, 'Expected ")"');
      return expr;
    }
    
    throw new ParseError(`Expected expression, but found ${this.peek().type} with value "${this.peek().value}"`, this.peek());
  }

  private isTypeToken(): boolean {
    return this.check(TokenType.INT) ||
           this.check(TokenType.DOUBLE) ||
           this.check(TokenType.STRING_TYPE) ||
           this.check(TokenType.BOOL) ||
           this.check(TokenType.OBJECT) ||
           this.check(TokenType.DYNAMIC) ||
           this.check(TokenType.VOID) ||
           (this.check(TokenType.IDENTIFIER) && 
            ['int', 'double', 'string', 'bool', 'object', 'dynamic', 'void'].includes(this.peek().value));
  }
}
