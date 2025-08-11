/**
 * Phase 1 Tests: Minimal Parser & AST
 * Tests the basic parsing functionality for the target Web# syntax
 */

import { WebSharpCompiler } from '../index';
import { TokenType } from '../lexer/tokens';
import { Lexer } from '../lexer/lexer';
import { AccessModifier } from '../ast/nodes';

describe('Phase 1: Minimal Parser & AST', () => {
  let compiler: WebSharpCompiler;

  beforeEach(() => {
    compiler = new WebSharpCompiler();
  });

  describe('Lexer', () => {
    test('should tokenize basic Web# keywords', () => {
      const source = 'public class Person { }';
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(6); // public, class, Person, {, }, EOF
      expect(tokens[0].type).toBe(TokenType.PUBLIC);
      expect(tokens[1].type).toBe(TokenType.CLASS);
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('Person');
      expect(tokens[3].type).toBe(TokenType.LEFT_BRACE);
      expect(tokens[4].type).toBe(TokenType.RIGHT_BRACE);
    });

    test('should tokenize operators and punctuation', () => {
      const source = '{ get; set; }';
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();

      expect(tokens).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: TokenType.LEFT_BRACE }),
          expect.objectContaining({ type: TokenType.GET }),
          expect.objectContaining({ type: TokenType.SEMICOLON }),
          expect.objectContaining({ type: TokenType.SET }),
          expect.objectContaining({ type: TokenType.SEMICOLON }),
          expect.objectContaining({ type: TokenType.RIGHT_BRACE })
        ])
      );
    });
  });

  describe('Parser', () => {
    test('should parse the target Person class from project specs', () => {
      const source = `
        public class Person {
            public string Name { get; set; }
            public int Age;
            
            public void SayHello() {
                Console.WriteLine("Hello");
            }
        }
      `;

      const ast = compiler.compile(source);
      
      expect(ast.classes).toHaveLength(1);
      
      const personClass = ast.classes[0];
      expect(personClass.name).toBe('Person');
      expect(personClass.accessModifier).toBe(AccessModifier.Public);
      expect(personClass.members).toHaveLength(3);

      // Check Name property
      const nameProperty = personClass.members[0] as any;
      expect(nameProperty.type).toBe('Property');
      expect(nameProperty.name).toBe('Name');
      
      // Check Age field
      const ageField = personClass.members[1] as any;
      expect(ageField.type).toBe('Field');
      expect(ageField.name).toBe('Age');
      
      // Check SayHello method
      const sayHelloMethod = personClass.members[2] as any;
      expect(sayHelloMethod.type).toBe('Method');
      expect(sayHelloMethod.name).toBe('SayHello');
    });

    test('should output AST as JSON', () => {
      const source = `
        public class Calculator {
            public int Add(int a, int b) {
                return a + b;
            }
        }
      `;

      const json = compiler.compileToJson(source);
      const parsed = JSON.parse(json);
      
      expect(parsed.type).toBe('CompilationUnit');
      expect(parsed.classes).toHaveLength(1);
      expect(parsed.classes[0].name).toBe('Calculator');
      expect(parsed.classes[0].members).toHaveLength(1);
      expect(parsed.classes[0].members[0].name).toBe('Add');
      expect(parsed.classes[0].members[0].parameters).toHaveLength(2);
    });

    test('should handle access modifiers correctly', () => {
      const source = `
        internal static class Utils {
            private string field;
            protected virtual void Method() { }
            public override string Property { get; set; }
        }
      `;

      const ast = compiler.compile(source);
      const utilsClass = ast.classes[0];
      
      expect(utilsClass.accessModifier).toBe(AccessModifier.Internal);
      expect(utilsClass.isStatic).toBe(true);
      
      expect(utilsClass.members[0].accessModifier).toBe(AccessModifier.Private);
      expect(utilsClass.members[1].accessModifier).toBe(AccessModifier.Protected);
      expect(utilsClass.members[2].accessModifier).toBe(AccessModifier.Public);
    });

    test('should parse method parameters', () => {
      const source = `
        public class Math {
            public double Calculate(int x, double y, string operation) {
                return 0.0;
            }
        }
      `;

      const ast = compiler.compile(source);
      const method = ast.classes[0].members[0] as any;
      
      expect(method.parameters).toHaveLength(3);
      expect(method.parameters[0].name).toBe('x');
      expect(method.parameters[0].parameterType.name).toBe('int');
      expect(method.parameters[1].name).toBe('y');
      expect(method.parameters[1].parameterType.name).toBe('double');
      expect(method.parameters[2].name).toBe('operation');
      expect(method.parameters[2].parameterType.name).toBe('string');
    });

    test('should handle nullable types', () => {
      const source = `
        public class Example {
            public string? NullableString { get; set; }
            public int? NullableInt;
        }
      `;

      const ast = compiler.compile(source);
      const members = ast.classes[0].members;
      
      expect((members[0] as any).propertyType.isNullable).toBe(true);
      expect((members[1] as any).fieldType.isNullable).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw meaningful error for invalid syntax', () => {
      const source = 'public class { }'; // Missing class name
      
      expect(() => {
        compiler.compile(source);
      }).toThrow(/Expected class name/);
    });

    test('should include line and column information in errors', () => {
      const source = `
        public class Person {
          public string
        }
      `; // Missing member name
      
      try {
        compiler.compile(source);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toMatch(/line \d+/);
      }
    });
  });
});
