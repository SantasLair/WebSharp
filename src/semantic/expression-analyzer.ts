/**
 * Expression analyzer for type checking
 * Handles parsing and type checking of simple expressions for Phase 2
 */

import {
  ExpressionNode,
  IdentifierNode,
  LiteralNode,
  CallExpressionNode,
  AssignmentExpressionNode,
  BinaryExpressionNode,
  TypeNode,
  SourceLocation
} from '../ast/nodes';
import { Token, TokenType } from '../lexer/tokens';
import { SymbolTable, MethodSymbol, ClassSymbol } from './analyzer';

export class ExpressionTypeResult {
  constructor(
    public readonly type: TypeNode,
    public readonly location?: SourceLocation
  ) {}
}

export class SimpleExpressionAnalyzer {
  constructor(
    private symbols: SymbolTable,
    private currentClass?: ClassSymbol,
    private currentMethod?: MethodSymbol
  ) {}

  /**
   * Simplified expression parsing from source text
   * This is a basic implementation for Phase 2 testing
   */
  public parseAndAnalyzeExpression(sourceText: string, startLine: number = 1): ExpressionTypeResult | null {
    // Very simplified parsing for basic test cases
    const trimmed = sourceText.trim();
    
    // Handle string literals
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return new ExpressionTypeResult(
        new TypeNode('string'),
        { start: { line: startLine, column: 1 }, end: { line: startLine, column: trimmed.length } }
      );
    }
    
    // Handle numeric literals
    if (/^\d+$/.test(trimmed)) {
      return new ExpressionTypeResult(
        new TypeNode('int'),
        { start: { line: startLine, column: 1 }, end: { line: startLine, column: trimmed.length } }
      );
    }
    
    if (/^\d+\.\d+$/.test(trimmed)) {
      return new ExpressionTypeResult(
        new TypeNode('double'),
        { start: { line: startLine, column: 1 }, end: { line: startLine, column: trimmed.length } }
      );
    }
    
    // Handle boolean literals
    if (trimmed === 'true' || trimmed === 'false') {
      return new ExpressionTypeResult(
        new TypeNode('bool'),
        { start: { line: startLine, column: 1 }, end: { line: startLine, column: trimmed.length } }
      );
    }
    
    // Handle null literal
    if (trimmed === 'null') {
      return new ExpressionTypeResult(
        new TypeNode('null'),
        { start: { line: startLine, column: 1 }, end: { line: startLine, column: trimmed.length } }
      );
    }
    
    // Handle simple method calls like Add(1, 2)
    const methodCallMatch = trimmed.match(/^(\w+)\s*\(\s*(.*?)\s*\)$/);
    if (methodCallMatch) {
      const methodName = methodCallMatch[1];
      const argsText = methodCallMatch[2];
      
      // Find method in current class
      if (this.currentClass?.methods.has(methodName)) {
        const method = this.currentClass.methods.get(methodName)!;
        return new ExpressionTypeResult(
          method.returnType,
          { start: { line: startLine, column: 1 }, end: { line: startLine, column: trimmed.length } }
        );
      }
    }
    
    // Handle simple identifiers (variables, fields)
    if (/^\w+$/.test(trimmed)) {
      // Check method variables first
      if (this.currentMethod?.variables.has(trimmed)) {
        const variable = this.currentMethod.variables.get(trimmed)!;
        return new ExpressionTypeResult(variable.type);
      }
      
      // Check class fields
      if (this.currentClass?.fields.has(trimmed)) {
        const field = this.currentClass.fields.get(trimmed)!;
        return new ExpressionTypeResult(field.type);
      }
      
      // Check class properties
      if (this.currentClass?.properties.has(trimmed)) {
        const property = this.currentClass.properties.get(trimmed)!;
        return new ExpressionTypeResult(property.type);
      }
    }
    
    return null;
  }

  /**
   * Check if one type can be assigned to another
   */
  public isAssignableFrom(targetType: TypeNode, sourceType: TypeNode): boolean {
    // Exact match
    if (targetType.name === sourceType.name && targetType.isNullable === sourceType.isNullable) {
      return true;
    }

    // Handle null assignment
    if (sourceType.name === 'null') {
      return targetType.isNullable;
    }

    // Handle var type inference
    if (targetType.name === 'var') {
      return true;
    }

    // Handle nullable assignments
    if (targetType.isNullable && !sourceType.isNullable && targetType.name === sourceType.name) {
      return true;
    }

    // Handle numeric conversions
    if (targetType.name === 'double' && sourceType.name === 'int') {
      return true;
    }

    return false;
  }

  /**
   * Infer type from literal value
   */
  public inferTypeFromLiteral(value: string): TypeNode {
    if (value === 'null') {
      return new TypeNode('null');
    }
    
    if (value === 'true' || value === 'false') {
      return new TypeNode('bool');
    }
    
    if (value.startsWith('"') && value.endsWith('"')) {
      return new TypeNode('string');
    }
    
    if (/^\d+$/.test(value)) {
      return new TypeNode('int');
    }
    
    if (/^\d+\.\d+$/.test(value)) {
      return new TypeNode('double');
    }
    
    return new TypeNode('object');
  }
}
