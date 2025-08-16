/**
 * Phase 4 Tests: Basic Browser Interop
 * Tests JavaScript interop functionality for Web# code
 */

import { WebSharpCompiler } from '../index';

describe('Phase 4: Basic Browser Interop', () => {
  let compiler: WebSharpCompiler;

  beforeEach(() => {
    compiler = new WebSharpCompiler();
  });

  describe('JS.Call() Parsing', () => {
    test('should parse JS.Call with string method name', () => {
      const source = `
        public class Test {
          public static void Main() {
            var element = JS.Call("document.createElement", "button");
          }
        }
      `;

      const ast = compiler.compile(source);
      expect(ast).toBeDefined();
      
      // Should parse without syntax errors
      expect(() => compiler.analyze(source)).not.toThrow();
    });

    test('should parse JS.Call with multiple arguments', () => {
      const source = `
        public class Test {
          public static void Main() {
            JS.Call("console.log", "Hello", "World", 123);
          }
        }
      `;

      const ast = compiler.compile(source);
      expect(ast).toBeDefined();
    });

    test('should parse nested JS.Call expressions', () => {
      const source = `
        public class Test {
          public static void Main() {
            var button = JS.Call("document.createElement", "button");
            JS.Call("document.body.appendChild", button);
          }
        }
      `;

      const ast = compiler.compile(source);
      expect(ast).toBeDefined();
    });
  });

  describe('JS.Set() Parsing', () => {
    test('should parse JS.Set with property assignment', () => {
      const source = `
        public class Test {
          public static void Main() {
            var button = JS.Call("document.createElement", "button");
            JS.Set(button, "textContent", "Click me!");
          }
        }
      `;

      const ast = compiler.compile(source);
      expect(ast).toBeDefined();
    });

    test('should parse JS.Set with variable property name', () => {
      const source = `
        public class Test {
          public static void Main() {
            var element = JS.Call("document.createElement", "div");
            var propName = "className";
            JS.Set(element, propName, "my-class");
          }
        }
      `;

      const ast = compiler.compile(source);
      expect(ast).toBeDefined();
    });
  });

  describe('JavaScript Code Generation', () => {
    test('should generate JS runtime and JS.Call code', () => {
      const source = `
        public class ButtonDemo {
          public static void Main() {
            var button = JS.Call("document.createElement", "button");
            JS.Set(button, "textContent", "Click me!");
            JS.Call("document.body.appendChild", button);
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Should include JS runtime helpers
      expect(javascript).toContain('const JS = {');
      expect(javascript).toContain('Call: function(');
      expect(javascript).toContain('Set: function(');
      
      // Should generate the method calls
      expect(javascript).toContain('JS.Call("document.createElement", "button")');
      expect(javascript).toContain('JS.Set(button, "textContent", "Click me!")');
      expect(javascript).toContain('JS.Call("document.body.appendChild", button)');
    });

    test('should generate working browser-compatible JavaScript', () => {
      const source = `
        public class App {
          public static void Main() {
            JS.Call("console.log", "Hello from Web#!");
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // The generated JavaScript should be valid syntax
      expect(() => {
        new Function(javascript);
      }).not.toThrow();
      
      // Should contain the JS runtime
      expect(javascript).toContain('const JS = {');
      expect(javascript).toContain('JS.Call("console.log", "Hello from Web#!")');
    });

    test('should handle complex DOM manipulation', () => {
      const source = `
        public class WebApp {
          public static void Main() {
            var div = JS.Call("document.createElement", "div");
            JS.Set(div, "innerHTML", "<h1>Web# Works!</h1>");
            JS.Set(div, "className", "container");
            
            var body = JS.Call("document.querySelector", "body");
            JS.Call("body.appendChild", div);
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('JS.Call("document.createElement", "div")');
      expect(javascript).toContain('JS.Set(div, "innerHTML", "<h1>Web# Works!</h1>")');
      expect(javascript).toContain('JS.Set(div, "className", "container")');
      expect(javascript).toContain('JS.Call("document.querySelector", "body")');
      expect(javascript).toContain('JS.Call("body.appendChild", div)');
    });
  });

  describe('Phase 4 Success Criteria', () => {
    test('should generate the target ButtonDemo example', () => {
      const source = `
        public class ButtonDemo {
          public static void Main() {
            var button = JS.Call("document.createElement", "button");
            JS.Set(button, "textContent", "Click me!");
            JS.Call("document.body.appendChild", button);
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      // Verify all the required elements are present
      expect(javascript).toContain('const JS = {');
      expect(javascript).toContain('Call: function(');
      expect(javascript).toContain('Set: function(');
      expect(javascript).toContain('class ButtonDemo');
      expect(javascript).toContain('static Main()');
      
      // Verify the specific calls from the spec
      expect(javascript).toContain('JS.Call("document.createElement", "button")');
      expect(javascript).toContain('JS.Set(button, "textContent", "Click me!")');
      expect(javascript).toContain('JS.Call("document.body.appendChild", button)');
      
      // Should be valid JavaScript
      expect(() => new Function(javascript)).not.toThrow();
    });

    test('should support multiple JS interop patterns', () => {
      const source = `
        public class InteropDemo {
          public static void ShowAlert() {
            JS.Call("alert", "Hello from Web#!");
          }
          
          public static void CreateList() {
            var ul = JS.Call("document.createElement", "ul");
            var li1 = JS.Call("document.createElement", "li");
            var li2 = JS.Call("document.createElement", "li");
            
            JS.Set(li1, "textContent", "Item 1");
            JS.Set(li2, "textContent", "Item 2");
            
            JS.Call("ul.appendChild", li1);
            JS.Call("ul.appendChild", li2);
            JS.Call("document.body.appendChild", ul);
          }
        }
      `;

      const javascript = compiler.compileToJavaScript(source);
      
      expect(javascript).toContain('JS.Call("alert", "Hello from Web#!")');
      expect(javascript).toContain('JS.Call("document.createElement", "ul")');
      expect(javascript).toContain('JS.Call("ul.appendChild", li1)');
      expect(() => new Function(javascript)).not.toThrow();
    });
  });
});
