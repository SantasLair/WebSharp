/**
 * Phase 3 Tests: JavaScript Code Generation
 * Tests transpilation of Web# code to executable JavaScript
 */

import { WebSharpCompiler } from '../index';
import { JavaScriptGenerator } from '../codegen/generator';

describe('Phase 3: JavaScript Code Generation', () => {
  let compiler: WebSharpCompiler;

  beforeEach(() => {
    compiler = new WebSharpCompiler();
  });

  describe('Basic Class Generation', () => {
    test('should generate ES6 class from Web# class', () => {
      const source = `
        public class Person {
          public string Name { get; set; }
          public int Age;
          
          public void SayHello() {
            Console.WriteLine("Hello");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('class Person {');
      expect(javascript).toContain('get Name()');
      expect(javascript).toContain('set Name(value)');
      expect(javascript).toContain('SayHello() {');
      expect(javascript).toContain('Console.WriteLine("Hello")');
    });

    test('should generate static methods correctly', () => {
      const source = `
        public class Math {
          public static int Add(int a, int b) {
            return a + b;
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('static Add(a, b) {');
      expect(javascript).toContain('return a + b;');
    });

    test('should handle fields with initializers', () => {
      const source = `
        public class Counter {
          private int count = 0;
          
          public void Increment() {
            count = count + 1;
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('class Counter');
      expect(javascript).toContain('Increment() {');
      expect(javascript).toContain('count = count + 1');
    });
  });

  describe('Hello World Example', () => {
    test('should generate working Hello World JavaScript', () => {
      const source = `
        public class App {
          public static void Main() {
            var message = "Hello, Web#!";
            Console.WriteLine(message);
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Should contain Console polyfill
      expect(javascript).toContain('const Console = {');
      expect(javascript).toContain('WriteLine: function(message)');
      expect(javascript).toContain('console.log(message)');
      
      // Should contain the App class
      expect(javascript).toContain('class App {');
      expect(javascript).toContain('static Main() {');
      expect(javascript).toContain('let message = "Hello, Web#!";');
      expect(javascript).toContain('Console.WriteLine(message);');
      
      // The generated JavaScript should be valid syntax
      expect(() => {
        new Function(javascript);
      }).not.toThrow();
    });

    test('should execute Hello World in browser environment', () => {
      const source = `
        public class App {
          public static void Main() {
            Console.WriteLine("Hello, Web#!");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Mock console.log to capture output
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = jest.fn((message: string) => {
        consoleLogs.push(message);
      });

      try {
        // Execute the generated JavaScript
        eval(javascript);
        // Call the Main method
        eval('App.Main()');
        
        expect(consoleLogs).toContain('Hello, Web#!');
      } finally {
        console.log = originalLog;
      }
    });
  });

  describe('Expression Generation', () => {
    test('should handle binary expressions', () => {
      const source = `
        public class Calculator {
          public int Add(int a, int b) {
            return a + b;
          }
          
          public int Multiply(int x, int y) {
            return x * y;
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('return a + b;');
      expect(javascript).toContain('return x * y;');
    });

    test('should handle string literals correctly', () => {
      const source = `
        public class Greeter {
          public void Greet() {
            Console.WriteLine("Hello World");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('Console.WriteLine("Hello World")');
    });

    test('should handle method calls', () => {
      const source = `
        public class Test {
          public void Method() {
            var result = Add(1, 2);
          }
          
          public int Add(int a, int b) {
            return a + b;
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('let result = Add(1, 2);');
    });
  });

  describe('Variable Declarations', () => {
    test('should generate let declarations for local variables', () => {
      const source = `
        public class Test {
          public void Method() {
            int x = 5;
            string message = "test";
            bool flag = true;
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('let x = 5;');
      expect(javascript).toContain('let message = "test";');
      expect(javascript).toContain('let flag = true;');
    });

    test('should handle var with type inference', () => {
      const source = `
        public class Test {
          public void Method() {
            var count = 10;
            var name = "test";
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('let count = 10;');
      expect(javascript).toContain('let name = "test";');
    });
  });

  describe('Code Quality', () => {
    test('should generate readable JavaScript with proper indentation', () => {
      const source = `
        public class Example {
          public void Method() {
            if (true) {
              Console.WriteLine("nested");
            }
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      const lines = javascript.split('\n');
      const classLine = lines.find(line => line.includes('class Example'));
      const methodLine = lines.find(line => line.includes('Method() {'));
      
      expect(classLine).toBeDefined();
      expect(methodLine).toBeDefined();
      
      // Check indentation (method should be indented more than class)
      const classIndent = classLine!.search(/\S/);
      const methodIndent = methodLine!.search(/\S/);
      expect(methodIndent).toBeGreaterThan(classIndent);
    });

    test('should include helpful comments', () => {
      const source = `
        public class Test {
          public void Method() {
            Console.WriteLine("test");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('// Generated JavaScript from Web# source');
      expect(javascript).toContain('// Web# - Browser-native C#-like language');
    });
  });

  describe('Integration with Full Pipeline', () => {
    test('should work with semantic analysis', () => {
      const source = `
        public class Calculator {
          public int Add(int a, int b) {
            return a + b;
          }
          
          public void Test() {
            var result = Add(1, 2);
            Console.WriteLine(result);
          }
        }
      `;

      const result = compiler.compileWithAnalysis(source);
      
      expect(result.analysis.errors).toHaveLength(0);
      expect(result.javascript).toContain('class Calculator');
      expect(result.javascript).toContain('Console.WriteLine(result)');
    });

    test('should generate JavaScript even with semantic errors', () => {
      const source = `
        public class Test {
          public void Method() {
            string result = 123; // Type error
            Console.WriteLine(result);
          }
        }
      `;

      const result = compiler.compileWithAnalysis(source);
      
      // Should have semantic errors but still generate JavaScript
      expect(result.analysis.errors.length).toBeGreaterThan(0);
      expect(result.javascript).toContain('class Test');
      expect(result.javascript).toContain('Console.WriteLine(result)');
    });
  });
});
