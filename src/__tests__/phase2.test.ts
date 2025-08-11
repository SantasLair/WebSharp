/**
 * Phase 2 Tests: Type System & Semantic Analysis
 * Tests type checking and symbol resolution functionality
 */

import { WebSharpCompiler } from '../index';
import { SemanticError } from '../semantic/analyzer';

describe('Phase 2: Type System & Semantic Analysis', () => {
  let compiler: WebSharpCompiler;

  beforeEach(() => {
    compiler = new WebSharpCompiler();
  });

  describe('Symbol Table & Resolution', () => {
    test('should track class symbols', () => {
      const source = `
        public class Calculator {
          public int Add(int a, int b) {
            return a + b;
          }
        }
        
        public class Math {
          public Calculator calc;
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.symbols.classes.has('Calculator')).toBe(true);
      expect(result.symbols.classes.has('Math')).toBe(true);
      
      const calculatorSymbol = result.symbols.classes.get('Calculator');
      expect(calculatorSymbol?.methods.has('Add')).toBe(true);
    });

    test('should track method symbols and parameters', () => {
      const source = `
        public class Example {
          public double Calculate(int x, double y, string operation) {
            return x + y;
          }
        }
      `;

      const result = compiler.analyze(source);
      const exampleClass = result.symbols.classes.get('Example');
      const calculateMethod = exampleClass?.methods.get('Calculate');
      
      expect(calculateMethod?.parameters).toHaveLength(3);
      expect(calculateMethod?.parameters[0].name).toBe('x');
      expect(calculateMethod?.parameters[0].type.name).toBe('int');
      expect(calculateMethod?.returnType.name).toBe('double');
    });

    test('should resolve variable references', () => {
      const source = `
        public class Test {
          private int field = 10;
          
          public int GetValue() {
            int local = 5;
            return field + local;
          }
        }
      `;

      const result = compiler.analyze(source);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Type Checking', () => {
    test('should detect type mismatch in assignment', () => {
      const source = `
        public class Calculator {
          public int Add(int a, int b) {
            return a + b;
          }
          
          public void Test() {
            string result = Add(1, 2); // Should error: int to string
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(SemanticError);
      expect(result.errors[0].message).toMatch(/Cannot assign.*int.*to.*string/i);
      expect(result.errors[0].location?.start.line).toBeGreaterThan(0);
    });

    test('should detect invalid method call', () => {
      const source = `
        public class Test {
          public void Method() {
            NonExistentMethod(); // Should error: method not found
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toMatch(/Method.*NonExistentMethod.*not found/i);
    });

    test('should detect parameter count mismatch', () => {
      const source = `
        public class Math {
          public int Add(int a, int b) {
            return a + b;
          }
          
          public void Test() {
            int result = Add(1); // Should error: wrong parameter count
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toMatch(/Expected 2 parameters.*received 1/i);
    });

    test('should detect parameter type mismatch', () => {
      const source = `
        public class Test {
          public void Method(int number) {
            // method body
          }
          
          public void Caller() {
            Method("hello"); // Should error: string to int
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toMatch(/Cannot convert.*string.*to.*int/i);
    });

    test('should validate return type', () => {
      const source = `
        public class Test {
          public int GetNumber() {
            return "hello"; // Should error: string to int
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toMatch(/Cannot return.*string.*from method expecting.*int/i);
    });
  });

  describe('Type Inference', () => {
    test('should infer var type from assignment', () => {
      const source = `
        public class Test {
          public void Method() {
            var number = 42;        // Should infer int
            var text = "hello";     // Should infer string
            var flag = true;        // Should infer bool
          }
        }
      `;

      const result = compiler.analyze(source);
      expect(result.errors).toHaveLength(0);
      
      // Check that types were inferred correctly
      const testClass = result.symbols.classes.get('Test');
      const method = testClass?.methods.get('Method');
      expect(method?.variables.get('number')?.type.name).toBe('int');
      expect(method?.variables.get('text')?.type.name).toBe('string');
      expect(method?.variables.get('flag')?.type.name).toBe('bool');
    });

    test('should infer var type from method call', () => {
      const source = `
        public class Test {
          public string GetText() {
            return "hello";
          }
          
          public void Method() {
            var result = GetText(); // Should infer string
          }
        }
      `;

      const result = compiler.analyze(source);
      expect(result.errors).toHaveLength(0);
      
      const testClass = result.symbols.classes.get('Test');
      const method = testClass?.methods.get('Method');
      expect(method?.variables.get('result')?.type.name).toBe('string');
    });

    test('should error on var without initializer', () => {
      const source = `
        public class Test {
          public void Method() {
            var x; // Should error: cannot infer type
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toMatch(/Cannot infer type.*var.*without initializer/i);
    });
  });

  describe('Nullable Types', () => {
    test('should allow null assignment to nullable types', () => {
      const source = `
        public class Test {
          public string? nullableString = null; // Should be valid
          public int? nullableInt = null;       // Should be valid
        }
      `;

      const result = compiler.analyze(source);
      expect(result.errors).toHaveLength(0);
    });

    test('should error on null assignment to non-nullable types', () => {
      const source = `
        public class Test {
          public string text = null;  // Should error
          public int number = null;   // Should error
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toMatch(/Cannot assign null to non-nullable type/i);
      expect(result.errors[1].message).toMatch(/Cannot assign null to non-nullable type/i);
    });
  });

  describe('Inheritance & Polymorphism', () => {
    test('should resolve inherited members', () => {
      const source = `
        public class Base {
          public virtual void Method() { }
          public int BaseField;
        }
        
        public class Derived : Base {
          public override void Method() { }
          
          public void Test() {
            BaseField = 10; // Should resolve to inherited field
            Method();       // Should resolve to overridden method
          }
        }
      `;

      const result = compiler.analyze(source);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid override', () => {
      const source = `
        public class Base {
          public void Method() { } // Not virtual
        }
        
        public class Derived : Base {
          public override void Method() { } // Should error: cannot override non-virtual
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toMatch(/Cannot override non-virtual method/i);
    });
  });

  describe('Error Messages', () => {
    test('should provide meaningful error messages with location', () => {
      const source = `
        public class Test {
          public void Method() {
            int x = "hello";
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(1);
      const error = result.errors[0];
      expect(error.message).toContain('Cannot assign');
      expect(error.message).toContain('string');
      expect(error.message).toContain('int');
      expect(error.location?.start.line).toBe(4); // Line with the error
    });

    test('should handle multiple errors in same file', () => {
      const source = `
        public class Test {
          public void Method() {
            int x = "hello";        // Error 1
            string y = 123;         // Error 2
            NonExistent();          // Error 3
          }
        }
      `;

      const result = compiler.analyze(source);
      
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].location?.start.line).toBeLessThan(result.errors[1].location?.start.line!);
      expect(result.errors[1].location?.start.line).toBeLessThan(result.errors[2].location?.start.line!);
    });
  });
});
