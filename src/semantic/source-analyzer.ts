/**
 * Source code pattern analyzer for Phase 2
 * Extracts and analyzes patterns from source code to detect type errors
 */

import { SymbolTable, ClassSymbol, MethodSymbol, SemanticError } from './analyzer';
import { TypeNode, SourceLocation } from '../ast/nodes';
import { SimpleExpressionAnalyzer } from './expression-analyzer';

export interface AnalysisPattern {
  type: 'assignment' | 'method_call' | 'return' | 'variable_declaration';
  line: number;
  column: number;
  details: any;
}

export class SourceAnalyzer {
  private expressionAnalyzer: SimpleExpressionAnalyzer;

  constructor(
    private symbols: SymbolTable,
    private currentClass?: ClassSymbol,
    private currentMethod?: MethodSymbol
  ) {
    this.expressionAnalyzer = new SimpleExpressionAnalyzer(symbols, currentClass, currentMethod);
  }

  public analyzeMethodBody(source: string, methodName: string, className: string): SemanticError[] {
    const errors: SemanticError[] = [];
    const lines = source.split('\n');
    
    const classSymbol = this.symbols.classes.get(className);
    const methodSymbol = classSymbol?.methods.get(methodName);
    
    if (!classSymbol || !methodSymbol) {
      return errors;
    }

    // Update context
    this.currentClass = classSymbol;
    this.currentMethod = methodSymbol;
    this.expressionAnalyzer = new SimpleExpressionAnalyzer(this.symbols, classSymbol, methodSymbol);

    let lineNumber = 1;
    for (const line of lines) {
      errors.push(...this.analyzeLine(line, lineNumber, methodSymbol, classSymbol));
      lineNumber++;
    }

    return errors;
  }

  private analyzeLine(line: string, lineNumber: number, method: MethodSymbol, classSymbol: ClassSymbol): SemanticError[] {
    const errors: SemanticError[] = [];
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('//')) {
      return errors;
    }

    // Check for standalone method calls like: NonExistentMethod(); // comment
    const standaloneCallMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)\s*;?\s*(?:\/\/.*)?$/);
    if (standaloneCallMatch) {
      const methodName = standaloneCallMatch[1];
      const argsText = standaloneCallMatch[2];
      
      errors.push(...this.checkMethodCall(methodName, argsText, lineNumber, classSymbol));
      return errors;
    }

    // Check for method calls in assignments like: int result = Add(1); (MUST BE BEFORE general assignment)
    const assignmentWithCallMatch = trimmed.match(/^(\w+)\s+(\w+)\s*=\s*(\w+)\s*\(([^)]*)\)\s*;?\s*(?:\/\/.*)?$/);
    if (assignmentWithCallMatch) {
      const typeName = assignmentWithCallMatch[1];
      const varName = assignmentWithCallMatch[2];
      const methodName = assignmentWithCallMatch[3];
      const argsText = assignmentWithCallMatch[4];

      // Check method call (parameter count mismatch handled inside checkMethodCall)
      const callErrors = this.checkMethodCall(methodName, argsText, lineNumber, classSymbol);
      errors.push(...callErrors);

      // If no errors in method call, handle assignment
      if (callErrors.length === 0 && classSymbol.methods.has(methodName)) {
        const methodSymbol = classSymbol.methods.get(methodName)!;
        
        if (typeName === 'var') {
          // Handle var type inference from method call
          if (this.currentMethod) {
            this.currentMethod.variables.set(varName, {
              name: varName,
              type: methodSymbol.returnType,
              location: { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
            });
          }
        } else {
          // Handle typed assignment - check type compatibility
          const targetType = new TypeNode(typeName);
          if (!this.expressionAnalyzer.isAssignableFrom(targetType, methodSymbol.returnType)) {
            errors.push(new SemanticError(
              `Cannot assign value of type '${methodSymbol.returnType.name}' to variable of type '${targetType.name}'`,
              { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
            ));
          }
        }
      }
      return errors;
    }

    // Check for variable assignments like: string result = "hello"; // comment
    const assignmentMatch = trimmed.match(/^(\w+)\s+(\w+)\s*=\s*(.+?)(?:\s*;)?(?:\s*\/\/.*)?$/);
    if (assignmentMatch) {
      const typeName = assignmentMatch[1];
      const varName = assignmentMatch[2];
      let valueExpr = assignmentMatch[3].trim();
      
      // Skip if this is a var declaration
      if (typeName === 'var') {
        // Let it fall through to var declaration handling below
      } else {
        // Remove trailing semicolon if present
        if (valueExpr.endsWith(';')) {
          valueExpr = valueExpr.slice(0, -1).trim();
        }

        errors.push(...this.checkAssignment(typeName, varName, valueExpr, lineNumber));
        return errors;
      }
    }

    // Check for var declarations like: var number = 42; // comment
    const varDeclMatch = trimmed.match(/^var\s+(\w+)\s*=\s*(.+?)(?:\s*;)?\s*(?:\/\/.*)?$/);
    if (varDeclMatch) {
      const varName = varDeclMatch[1];
      let valueExpr = varDeclMatch[2].trim();
      
      // Remove trailing semicolon if present
      if (valueExpr.endsWith(';')) {
        valueExpr = valueExpr.slice(0, -1).trim();
      }

      errors.push(...this.checkVarDeclaration(varName, valueExpr, lineNumber));
      return errors;
    }

    // Check for var without initializer: var x; // comment
    const varNoInitMatch = trimmed.match(/^var\s+(\w+)\s*(?:;)?(?:\s*\/\/.*)?$/);
    if (varNoInitMatch) {
      const varName = varNoInitMatch[1];
      errors.push(new SemanticError(
        `Cannot infer type for 'var' variable '${varName}' without initializer`,
        { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: trimmed.length } }
      ));
      return errors;
    }

    // Check for return statements like: return "hello"; // comment
    const returnMatch = trimmed.match(/^return\s+(.+?)(?:\s*;)?(?:\s*\/\/.*)?$/);
    if (returnMatch) {
      let returnExpr = returnMatch[1].trim();
      
      // Remove trailing semicolon if present
      if (returnExpr.endsWith(';')) {
        returnExpr = returnExpr.slice(0, -1).trim();
      }
      
      errors.push(...this.checkReturn(returnExpr, method.returnType, lineNumber));
      return errors;
    }

    // Check for field assignments like: name = "hello"; // comment
    const fieldAssignMatch = trimmed.match(/^(\w+)\s*=\s*(.+?)(?:\s*;)?(?:\s*\/\/.*)?$/);
    if (fieldAssignMatch) {
      const fieldName = fieldAssignMatch[1];
      const valueExpr = fieldAssignMatch[2];
      
      // Check if it's a field assignment
      if (classSymbol.fields.has(fieldName)) {
        const field = classSymbol.fields.get(fieldName)!;
        errors.push(...this.checkValueAssignment(field.type, valueExpr, lineNumber));
      }
      return errors;
    }

    return errors;
  }

  private checkAssignment(typeName: string, varName: string, valueExpr: string, lineNumber: number): SemanticError[] {
    const errors: SemanticError[] = [];
    
    const targetType = new TypeNode(typeName);
    const valueResult = this.expressionAnalyzer.parseAndAnalyzeExpression(valueExpr, lineNumber);
    
    if (valueResult) {
      if (!this.expressionAnalyzer.isAssignableFrom(targetType, valueResult.type)) {
        errors.push(new SemanticError(
          `Cannot assign value of type '${valueResult.type.name}' to variable of type '${targetType.name}'`,
          { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
        ));
      }
    }

    return errors;
  }

  private checkVarDeclaration(varName: string, valueExpr: string, lineNumber: number): SemanticError[] {
    const errors: SemanticError[] = [];
    
    const valueResult = this.expressionAnalyzer.parseAndAnalyzeExpression(valueExpr, lineNumber);
    
    if (valueResult && this.currentMethod) {
      // Add the variable to the method's symbol table with inferred type
      this.currentMethod.variables.set(varName, {
        name: varName,
        type: valueResult.type,
        location: { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
      });
    }

    return errors;
  }

  private checkReturn(returnExpr: string, expectedType: TypeNode, lineNumber: number): SemanticError[] {
    const errors: SemanticError[] = [];
    
    const valueResult = this.expressionAnalyzer.parseAndAnalyzeExpression(returnExpr, lineNumber);
    
    if (valueResult) {
      if (!this.expressionAnalyzer.isAssignableFrom(expectedType, valueResult.type)) {
        errors.push(new SemanticError(
          `Cannot return value of type '${valueResult.type.name}' from method expecting '${expectedType.name}'`,
          { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
        ));
      }
    }

    return errors;
  }

  private checkMethodCall(methodName: string, argsText: string, lineNumber: number, classSymbol: ClassSymbol): SemanticError[] {
    const errors: SemanticError[] = [];
    
    if (!classSymbol.methods.has(methodName)) {
      errors.push(new SemanticError(
        `Method '${methodName}' not found in class '${classSymbol.name}'`,
        { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
      ));
      return errors;
    }

    const method = classSymbol.methods.get(methodName)!;
    const args = argsText.trim() ? argsText.split(',').map(arg => arg.trim()) : [];
    
    // Check parameter count
    if (args.length !== method.parameters.length) {
      errors.push(new SemanticError(
        `Expected ${method.parameters.length} parameters but received ${args.length}`,
        { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
      ));
      return errors;
    }

    // Check parameter types
    for (let i = 0; i < args.length; i++) {
      const argExpr = args[i];
      const expectedParam = method.parameters[i];
      const argResult = this.expressionAnalyzer.parseAndAnalyzeExpression(argExpr, lineNumber);
      
      if (argResult) {
        if (!this.expressionAnalyzer.isAssignableFrom(expectedParam.type, argResult.type)) {
          errors.push(new SemanticError(
            `Cannot convert argument ${i + 1} from '${argResult.type.name}' to '${expectedParam.type.name}'`,
            { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
          ));
        }
      }
    }

    return errors;
  }

  private checkValueAssignment(targetType: TypeNode, valueExpr: string, lineNumber: number): SemanticError[] {
    const errors: SemanticError[] = [];
    
    const valueResult = this.expressionAnalyzer.parseAndAnalyzeExpression(valueExpr, lineNumber);
    
    if (valueResult) {
      if (!this.expressionAnalyzer.isAssignableFrom(targetType, valueResult.type)) {
        errors.push(new SemanticError(
          `Cannot assign value of type '${valueResult.type.name}' to variable of type '${targetType.name}'`,
          { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: 50 } }
        ));
      }
    }

    return errors;
  }

  public analyzeSourceForPatterns(source: string): SemanticError[] {
    const errors: SemanticError[] = [];
    const lines = source.split('\n');
    
    let currentClass: ClassSymbol | undefined;
    let currentMethod: MethodSymbol | undefined;
    let insideMethodBody = false;
    let methodBodyLines: string[] = [];
    let methodStartLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNumber = i + 1;
      
      // Detect class context
      const classMatch = trimmed.match(/class\s+(\w+)/);
      if (classMatch) {
        const className = classMatch[1];
        currentClass = this.symbols.classes.get(className);
        continue;
      }
      
      // Detect field declarations with initializers (outside methods)
      if (!insideMethodBody && currentClass) {
        const fieldMatch = trimmed.match(/^(?:public|private|protected)?\s*(\w+\??)\s+(\w+)\s*=\s*(.+?);/);
        if (fieldMatch) {
          const typeName = fieldMatch[1];
          const fieldName = fieldMatch[2];
          const valueExpr = fieldMatch[3].trim();
          
          // Check if it's a field in the class
          const field = currentClass.fields.get(fieldName);
          if (field && valueExpr === 'null' && !field.type.isNullable) {
            errors.push(new SemanticError(
              `Cannot assign null to non-nullable type '${field.type.name}'`,
              { start: { line: lineNumber, column: 1 }, end: { line: lineNumber, column: trimmed.length } }
            ));
          }
        }
      }
      
      // Detect method start and handle opening brace on same line
      const methodMatch = trimmed.match(/(\w+)\s+(\w+)\s*\((.*?)\)\s*(\{.*)?/);
      if (methodMatch && currentClass) {
        const methodName = methodMatch[2];
        const methodBody = methodMatch[4]; // Capture anything after the {
        currentMethod = currentClass.methods.get(methodName);
        if (currentMethod) {
          methodBodyLines = [];
          methodStartLine = lineNumber;
          
          // Check if opening brace is on same line
          if (methodBody !== undefined) {
            insideMethodBody = true;
            // Extract content after the opening brace
            const bodyContent = methodBody.substring(1).trim(); // Remove the {
            if (bodyContent && bodyContent !== '}') {
              methodBodyLines.push(bodyContent);
            }
          }
        }
        continue;
      }
      
      // Detect standalone opening brace
      if (trimmed === '{' && currentMethod && !insideMethodBody) {
        insideMethodBody = true;
        continue;
      }
      
      // Detect method body end
      if (trimmed === '}' && insideMethodBody && currentMethod && currentClass) {
        insideMethodBody = false;
        
        // Analyze the collected method body
        const methodBodySource = methodBodyLines.join('\n');
        
        const bodyAnalyzer = new SourceAnalyzer(this.symbols, currentClass, currentMethod);
        const methodErrors = bodyAnalyzer.analyzeMethodBody(methodBodySource, currentMethod.name, currentClass.name);
        
        // Adjust line numbers
        for (const error of methodErrors) {
          if (error.location) {
            error.location.start.line += methodStartLine;
            error.location.end.line += methodStartLine;
          }
        }
        
        errors.push(...methodErrors);
        
        // Preserve variables in the method symbol for type inference tests
        for (const [varName, varSymbol] of bodyAnalyzer.currentMethod?.variables || new Map()) {
          if (!currentMethod.variables.has(varName)) {
            currentMethod.variables.set(varName, varSymbol);
          }
        }
        
        currentMethod = undefined;
        methodBodyLines = [];
        continue;
      }
      
      // Collect method body lines
      if (insideMethodBody) {
        methodBodyLines.push(line);
      }
    }
    
    return errors;
  }
}
