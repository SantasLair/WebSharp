/**
 * Phase 5 Tests: Native DOM API
 * Tests for C#-style DOM object creation and manipulation
 */

import { WebSharpCompiler } from '../index';

describe('Phase 5: Native DOM API', () => {
  let compiler: WebSharpCompiler;

  beforeEach(() => {
    compiler = new WebSharpCompiler();
  });

  describe('DOM Constructor Parsing', () => {
    test('should parse HTMLButtonElement constructor', () => {
      const source = `
        public class Test {
          public static void Main() {
            var button = new HTMLButtonElement();
          }
        }
      `;
      
      expect(() => compiler.compileToJavaScript(source)).not.toThrow();
    });

    test('should parse HTMLDivElement constructor', () => {
      const source = `
        public class Test {
          public static void Main() {
            var div = new HTMLDivElement();
          }
        }
      `;
      
      expect(() => compiler.compileToJavaScript(source)).not.toThrow();
    });

    test('should parse HTMLInputElement constructor', () => {
      const source = `
        public class Test {
          public static void Main() {
            var input = new HTMLInputElement();
          }
        }
      `;
      
      expect(() => compiler.compileToJavaScript(source)).not.toThrow();
    });
  });

  describe('DOM Code Generation', () => {
    test('should generate WebSharpDOM constructor calls', () => {
      const source = `
        public class Test {
          public static void Main() {
            var button = new HTMLButtonElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('new WebSharpDOM.HTMLButtonElement()');
    });

    test('should include DOM runtime bridge when DOM types are used', () => {
      const source = `
        public class Test {
          public static void Main() {
            var div = new HTMLDivElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('WebSharp DOM Runtime Bridge');
      expect(result).toContain('const WebSharpDOM = {');
      expect(result).toContain('HTMLDivElement: class extends WebSharpDOM.Element');
    });

    test('should not include DOM runtime if no DOM types are used', () => {
      const source = `
        public class Test {
          public static void Main() {
            Console.WriteLine("Hello World");
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).not.toContain('WebSharp DOM Runtime Bridge');
      expect(result).not.toContain('const WebSharpDOM = {');
    });
  });

  describe('DOM Runtime Bridge', () => {
    test('should include base Element class in runtime', () => {
      const source = `
        public class Test {
          public static void Main() {
            var element = new HTMLButtonElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('Element: class {');
      expect(result).toContain('get TextContent()');
      expect(result).toContain('set TextContent(value)');
      expect(result).toContain('AppendChild(child)');
    });

    test('should include specific HTML element classes', () => {
      const source = `
        public class Test {
          public static void Main() {
            var button = new HTMLButtonElement();
            var input = new HTMLInputElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('HTMLButtonElement: class extends WebSharpDOM.Element');
      expect(result).toContain('HTMLInputElement: class extends WebSharpDOM.Element');
    });

    test('should include CSSStyleDeclaration wrapper', () => {
      const source = `
        public class Test {
          public static void Main() {
            var div = new HTMLDivElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('CSSStyleDeclaration: class {');
      expect(result).toContain('get BackgroundColor()');
      expect(result).toContain('set BackgroundColor(value)');
    });

    test('should include Document static class', () => {
      const source = `
        public class Test {
          public static void Main() {
            var element = new HTMLDivElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('Document: {');
      expect(result).toContain('get Body()');
      expect(result).toContain('CreateElement(tagName)');
    });
  });

  describe('Complex DOM Scenarios', () => {
    test('should handle multiple DOM element creation', () => {
      const source = `
        public class App {
          public static void Main() {
            var container = new HTMLDivElement();
            var title = new HTMLDivElement();
            var button = new HTMLButtonElement();
            var input = new HTMLInputElement();
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('new WebSharpDOM.HTMLDivElement()');
      expect(result).toContain('new WebSharpDOM.HTMLButtonElement()');
      expect(result).toContain('new WebSharpDOM.HTMLInputElement()');
    });

    test('should work alongside traditional Console.WriteLine', () => {
      const source = `
        public class MixedApp {
          public static void Main() {
            Console.WriteLine("Creating DOM elements...");
            var button = new HTMLButtonElement();
            Console.WriteLine("Button created!");
          }
        }
      `;
      
      const result = compiler.compileToJavaScript(source);
      expect(result).toContain('Console.WriteLine');
      expect(result).toContain('new WebSharpDOM.HTMLButtonElement()');
      expect(result).toContain('WebSharp DOM Runtime Bridge');
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown DOM types gracefully', () => {
      const source = `
        public class Test {
          public static void Main() {
            var unknown = new UnknownHTMLElement();
          }
        }
      `;
      
      // Should fall back to regular constructor error since UnknownHTMLElement is not a recognized DOM type
      expect(() => compiler.compileToJavaScript(source)).toThrow();
    });
  });
});
