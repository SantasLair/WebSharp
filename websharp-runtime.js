/**
 * WebSharp Browser Runtime - Enables <wscript> tags in HTML
 * This runtime allows WebSharp code to be embedded directly in HTML pages
 */

// Browser-compatible WebSharp Compiler (simplified for client-side use)
class WebSharpBrowserCompiler {
  constructor() {
    this.console = { WriteLine: (msg) => console.log(msg) };
  }

  // Robust WebSharp to JavaScript compilation for browser use
  compileToJavaScript(wsSource) {
    try {
      let js = wsSource.trim();
      
      // Step 1: Handle using statements (remove them for browser)
      js = js.replace(/using\s+[^;]+;/g, '');
      
      // Step 2: Transform class declarations
      js = js.replace(/public\s+class\s+(\w+)\s*\{/g, 'class $1 {');
      js = js.replace(/private\s+class\s+(\w+)\s*\{/g, 'class $1 {');
      js = js.replace(/internal\s+class\s+(\w+)\s*\{/g, 'class $1 {');
      
      // Step 3: Transform method declarations
      js = js.replace(/public\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
      js = js.replace(/public\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, '$1() {');
      js = js.replace(/private\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
      js = js.replace(/public\s+static\s+(\w+)\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $2() {');
      
      // Step 4: Transform variable declarations
      js = js.replace(/var\s+(\w+)\s*=\s*new\s+(HTML\w+Element)\s*\(\s*\)\s*;/g, 'var $1 = new WebSharpDOM.$2();');
      js = js.replace(/(\w+)\s+(\w+)\s*=\s*new\s+(HTML\w+Element)\s*\(\s*\)\s*;/g, 'var $2 = new WebSharpDOM.$3();');
      
      // Step 5: Transform Console.WriteLine
      js = js.replace(/Console\.WriteLine\s*\(\s*([^)]+)\s*\)\s*;/g, 'console.log($1);');
      
      // Step 6: Transform DOM property assignments
      js = js.replace(/(\w+)\.TextContent\s*=\s*([^;]+)\s*;/g, '$1.TextContent = $2;');
      js = js.replace(/(\w+)\.InnerHTML\s*=\s*([^;]+)\s*;/g, '$1.InnerHTML = $2;');
      js = js.replace(/(\w+)\.ClassName\s*=\s*([^;]+)\s*;/g, '$1.ClassName = $2;');
      js = js.replace(/(\w+)\.Value\s*=\s*([^;]+)\s*;/g, '$1.Value = $2;');
      js = js.replace(/(\w+)\.Type\s*=\s*([^;]+)\s*;/g, '$1.Type = $2;');
      js = js.replace(/(\w+)\.Placeholder\s*=\s*([^;]+)\s*;/g, '$1.Placeholder = $2;');
      
      // Step 7: Transform Style property assignments
      js = js.replace(/(\w+)\.Style\.(\w+)\s*=\s*([^;]+)\s*;/g, '$1.Style.$2 = $3;');
      
      // Step 8: Transform Document static references
      js = js.replace(/Document\.Body\.AppendChild\s*\(\s*([^)]+)\s*\)\s*;/g, 'WebSharpDOM.Document.Body.AppendChild($1);');
      js = js.replace(/Document\.GetElementById\s*\(\s*([^)]+)\s*\)/g, 'WebSharpDOM.Document.GetElementById($1)');
      
      // Step 9: Transform method calls
      js = js.replace(/(\w+)\.AppendChild\s*\(\s*([^)]+)\s*\)\s*;/g, '$1.AppendChild($2);');
      js = js.replace(/(\w+)\.SetAttribute\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)\s*;/g, '$1.SetAttribute($2, $3);');
      
      // Step 10: Handle method calls without semicolons (for auto-execution)
      js = js.replace(/(\w+)\.(\w+)\s*\(\s*\)\s*$/gm, '$1.$2();');
      
      // Step 11: Transform new Date() calls
      js = js.replace(/new\s+Date\s*\(\s*\)\.ToString\s*\(\s*\)/g, 'new Date().toString()');
      
      // Step 12: Handle string concatenation
      js = js.replace(/([^+\s]+)\s*\+\s*([^+\s]+)/g, '$1 + $2');
      
      // Debug logging
      console.log('🔄 WebSharp source:', wsSource);
      console.log('🔄 Generated JS:', js);
      
      return js;
    } catch (error) {
      console.error('WebSharp compilation error:', error);
      return `console.error('WebSharp compilation failed: ${error.message}');`;
    }
  }
}

// WebSharp DOM Runtime Bridge (same as Phase 5)
const WebSharpDOM = {
  Element: class {
    constructor(domElement) {
      this._dom = domElement;
    }
    
    get TextContent() { return this._dom.textContent; }
    set TextContent(value) { this._dom.textContent = value; }
    
    get InnerHTML() { return this._dom.innerHTML; }
    set InnerHTML(value) { this._dom.innerHTML = value; }
    
    get Id() { return this._dom.id; }
    set Id(value) { this._dom.id = value; }
    
    get ClassName() { return this._dom.className; }
    set ClassName(value) { this._dom.className = value; }
    
    get Style() {
      if (!this._style) {
        this._style = new WebSharpDOM.CSSStyleDeclaration(this._dom.style);
      }
      return this._style;
    }
    
    AppendChild(child) {
      this._dom.appendChild(child._dom);
    }
    
    RemoveChild(child) {
      this._dom.removeChild(child._dom);
    }
    
    QuerySelector(selector) {
      const element = this._dom.querySelector(selector);
      return element ? new WebSharpDOM.Element(element) : null;
    }
    
    SetAttribute(name, value) {
      this._dom.setAttribute(name, value);
    }
    
    GetAttribute(name) {
      return this._dom.getAttribute(name);
    }
  },
  
  HTMLButtonElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('button'));
    }
    
    get Type() { return this._dom.type; }
    set Type(value) { this._dom.type = value; }
  },
  
  HTMLInputElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('input'));
    }
    
    get Value() { return this._dom.value; }
    set Value(value) { this._dom.value = value; }
    
    get Type() { return this._dom.type; }
    set Type(value) { this._dom.type = value; }
    
    get Placeholder() { return this._dom.placeholder; }
    set Placeholder(value) { this._dom.placeholder = value; }
  },
  
  HTMLDivElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('div'));
    }
  },
  
  HTMLSpanElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('span'));
    }
  },
  
  HTMLFormElement: class extends WebSharpDOM.Element {
    constructor() {
      super(document.createElement('form'));
    }
  },
  
  CSSStyleDeclaration: class {
    constructor(style) {
      this._style = style;
    }
    
    get BackgroundColor() { return this._style.backgroundColor; }
    set BackgroundColor(value) { this._style.backgroundColor = value; }
    
    get Color() { return this._style.color; }
    set Color(value) { this._style.color = value; }
    
    get Padding() { return this._style.padding; }
    set Padding(value) { this._style.padding = value; }
    
    get Margin() { return this._style.margin; }
    set Margin(value) { this._style.margin = value; }
    
    get Border() { return this._style.border; }
    set Border(value) { this._style.border = value; }
    
    get BorderRadius() { return this._style.borderRadius; }
    set BorderRadius(value) { this._style.borderRadius = value; }
    
    get FontSize() { return this._style.fontSize; }
    set FontSize(value) { this._style.fontSize = value; }
    
    get FontWeight() { return this._style.fontWeight; }
    set FontWeight(value) { this._style.fontWeight = value; }
    
    get Width() { return this._style.width; }
    set Width(value) { this._style.width = value; }
    
    get Height() { return this._style.height; }
    set Height(value) { this._style.height = value; }
  },
  
  Document: {
    get Body() {
      return new WebSharpDOM.Element(document.body);
    },
    
    CreateElement(tagName) {
      return new WebSharpDOM.Element(document.createElement(tagName));
    },
    
    GetElementById(id) {
      const element = document.getElementById(id);
      return element ? new WebSharpDOM.Element(element) : null;
    },
    
    QuerySelector(selector) {
      const element = document.querySelector(selector);
      return element ? new WebSharpDOM.Element(element) : null;
    },
    
    QuerySelectorAll(selector) {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).map(el => new WebSharpDOM.Element(el));
    }
  }
};

// WebSharp Runtime - processes <wscript> tags
class WebSharpRuntime {
  constructor() {
    this.compiler = new WebSharpBrowserCompiler();
    this.processed = new Set(); // Track processed scripts to avoid duplicates
  }

  // Initialize runtime and process all WebSharp scripts
  async initialize() {
    console.log('🚀 WebSharp Runtime initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.processAllScripts());
    } else {
      await this.processAllScripts();
    }
  }

  // Process all WebSharp script tags in the document
  async processAllScripts() {
    try {
      // Find <wscript> tags
      const wscriptTags = document.querySelectorAll('wscript');
      console.log(`Found ${wscriptTags.length} <wscript> tags`);
      
      // Find <script type="text/websharp"> tags
      const scriptTags = document.querySelectorAll('script[type="text/websharp"]');
      console.log(`Found ${scriptTags.length} <script type="text/websharp"> tags`);
      
      const allTags = [...wscriptTags, ...scriptTags];
      
      for (const tag of allTags) {
        await this.processScript(tag);
      }
      
      console.log('✅ WebSharp Runtime processing complete');
    } catch (error) {
      console.error('❌ WebSharp Runtime error:', error);
    }
  }

  // Process individual script tag
  async processScript(tag) {
    // Skip if already processed
    if (this.processed.has(tag)) return;
    this.processed.add(tag);

    try {
      let source;
      
      if (tag.src) {
        // External WebSharp file
        console.log(`📂 Loading external WebSharp file: ${tag.src}`);
        const response = await fetch(tag.src);
        if (!response.ok) {
          throw new Error(`Failed to load ${tag.src}: ${response.statusText}`);
        }
        source = await response.text();
      } else {
        // Inline WebSharp code
        source = tag.textContent || tag.innerHTML;
      }

      if (!source.trim()) {
        console.warn('⚠️ Empty WebSharp script found');
        return;
      }

      console.log('🔄 Compiling WebSharp code...');
      
      // Compile WebSharp to JavaScript
      const javascript = this.compiler.compileToJavaScript(source);
      
      console.log('⚡ Executing compiled JavaScript...');
      
      // Execute the generated JavaScript
      this.executeJavaScript(javascript, tag);
      
    } catch (error) {
      console.error('❌ Error processing WebSharp script:', error);
      // Display error in the page for debugging
      this.displayError(error, tag);
    }
  }

  // Execute JavaScript code safely
  executeJavaScript(jsCode, sourceTag) {
    try {
      // Create a new Function to execute the code in a controlled scope
      const executeFunc = new Function('WebSharpDOM', 'console', jsCode);
      executeFunc(WebSharpDOM, console);
    } catch (error) {
      console.error('❌ JavaScript execution error:', error);
      this.displayError(error, sourceTag);
    }
  }

  // Display compilation/runtime errors in the page
  displayError(error, sourceTag) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      background: #ffebee;
      border: 1px solid #f44336;
      border-radius: 4px;
      padding: 10px;
      margin: 10px 0;
      font-family: monospace;
      color: #c62828;
    `;
    errorDiv.innerHTML = `
      <strong>WebSharp Error:</strong><br>
      ${error.message}<br>
      <small>Check browser console for details</small>
    `;
    
    // Insert error after the problematic script tag
    sourceTag.parentNode.insertBefore(errorDiv, sourceTag.nextSibling);
  }
}

// Auto-initialize WebSharp runtime when DOM is ready
function initializeWebSharp() {
  const webSharpRuntime = new WebSharpRuntime();
  webSharpRuntime.initialize();

  // Make runtime available globally for debugging
  window.WebSharpRuntime = webSharpRuntime;
  window.WebSharpDOM = WebSharpDOM;

  console.log('🎯 WebSharp Browser Runtime initialized! Processing <wscript> tags...');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebSharp);
} else {
  // DOM is already ready
  initializeWebSharp();
}

console.log('🎯 WebSharp Browser Runtime loaded! Waiting for DOM ready...');
