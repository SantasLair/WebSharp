/**
 * Phase 3 Minimal Tests - Core JavaScript Code Generation
 * Focus on basic functionality that demonstrates Phase 3 success
 */

import { WebSharpCompiler } from '../index';

describe('Phase 3: JavaScript Code Generation (Core)', () => {
  let compiler: WebSharpCompiler;

  beforeEach(() => {
    compiler = new WebSharpCompiler();
  });

  describe('Basic Hello World Success', () => {
    test('should generate valid Hello World JavaScript', () => {
      const source = `
        public class App {
          public static void Main() {
            Console.WriteLine("Hello, Web#!");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Core Phase 3 requirements
      expect(javascript).toContain('class App');
      expect(javascript).toContain('static Main()');
      expect(javascript).toContain('Console.WriteLine("Hello, Web#!")');
      expect(javascript).toContain('const Console = {');
      
      // Should be valid JavaScript syntax
      expect(() => {
        new Function(javascript);
      }).not.toThrow();
    });

    test('should execute Hello World successfully', () => {
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
        // Execute the generated JavaScript and call the Main method in one eval
        eval(javascript + '\nApp.Main();');
        
        // Verify output
        expect(consoleLogs).toContain('Hello, Web#!');
      } finally {
        console.log = originalLog;
      }
    });
  });

  describe('Basic Class Generation', () => {
    test('should generate simple class with methods', () => {
      const source = `
        public class Calculator {
          public static void Test() {
            Console.WriteLine("Calculator works");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('class Calculator');
      expect(javascript).toContain('static Test()');
      expect(javascript).toContain('Console.WriteLine("Calculator works")');
    });

    test('should generate properties correctly', () => {
      const source = `
        public class Person {
          public string Name { get; set; }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('class Person');
      expect(javascript).toContain('get Name()');
      expect(javascript).toContain('set Name(value)');
    });
  });

  describe('Phase 3 Success Criteria Verification', () => {
    test('generates clean, readable JavaScript', () => {
      const source = `
        public class App {
          public static void Main() {
            Console.WriteLine("Hello, Web#!");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Should have readable structure
      const lines = javascript.split('\n');
      expect(lines.some(line => line.includes('// Generated JavaScript from Web# source'))).toBe(true);
      expect(lines.some(line => line.includes('class App'))).toBe(true);
      expect(lines.some(line => line.includes('static Main()'))).toBe(true);
    });

    test('classes become JS classes/constructor functions', () => {
      const source = `
        public class MyClass {
          public static void StaticMethod() {
            Console.WriteLine("static");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('class MyClass');
      expect(javascript).toContain('static StaticMethod()');
    });

    test('can run in browser console and output messages', () => {
      const source = `
        public class Demo {
          public static void Run() {
            Console.WriteLine("Phase 3 Success!");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Test that it can execute
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = jest.fn((message: string) => {
        consoleLogs.push(message);
      });

      try {
        eval(javascript + '\nDemo.Run();');
        expect(consoleLogs).toContain('Phase 3 Success!');
      } finally {
        console.log = originalLog;
      }
    });
  });
});
