/**
 * Minimal WebSharp Runtime - Proof of Concept
 */

// Simple WebSharp to JavaScript compiler
function compileWebSharp(source) {
    let js = source.trim();
    
    // Remove extra whitespace and normalize line endings
    js = js.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Handle class and method declarations
    js = js.replace(/public\s+class\s+(\w+)\s*\{/g, 'class $1 {');
    js = js.replace(/private\s+class\s+(\w+)\s*\{/g, 'class $1 {');
    js = js.replace(/public\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
    js = js.replace(/private\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
    js = js.replace(/public\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, '$1() {');
    js = js.replace(/private\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, '$1() {');
    
    // Handle field declarations (must come before variable declarations)
    js = js.replace(/private\s+static\s+int\s+(\w+)\s*=\s*([^;]+)\s*;/g, 'static $1 = $2;');
    js = js.replace(/private\s+static\s+HTMLDivElement\s+(\w+)\s*;/g, 'static $1 = null;');
    js = js.replace(/private\s+static\s+HTMLButtonElement\s+(\w+)\s*;/g, 'static $1 = null;');
    js = js.replace(/private\s+static\s+(\w+)\s+(\w+)\s*;/g, 'static $2 = null;');
    js = js.replace(/private\s+static\s+(\w+)\s+(\w+)\s*=\s*([^;]+)\s*;/g, 'static $2 = $3;');
    
    // Handle Console.WriteLine (simplified - no string interpolation for now)
    js = js.replace(/Console\.WriteLine\s*\(\s*([^)]+)\s*\)\s*;?/g, 'console.log($1);');
    
    // Handle variable declarations with explicit types
    js = js.replace(/var\s+(\w+)\s*=\s*new\s+HTMLDivElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("div");');
    js = js.replace(/var\s+(\w+)\s*=\s*new\s+HTMLButtonElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("button");');
    js = js.replace(/var\s+(\w+)\s*=\s*new\s+HTMLInputElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("input");');
    js = js.replace(/HTMLDivElement\s+(\w+)\s*=\s*new\s+HTMLDivElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("div");');
    js = js.replace(/HTMLButtonElement\s+(\w+)\s*=\s*new\s+HTMLButtonElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("button");');
    
    // Handle property assignments
    js = js.replace(/(\w+)\.TextContent\s*=\s*([^;]+)\s*;?/g, '$1.textContent = $2;');
    js = js.replace(/(\w+)\.ClassName\s*=\s*([^;]+)\s*;?/g, '$1.className = $2;');
    js = js.replace(/(\w+)\.Value\s*=\s*([^;]+)\s*;?/g, '$1.value = $2;');
    js = js.replace(/(\w+)\.OnClick\s*=\s*(\w+)\s*;?/g, '$1.onclick = $2;');
    js = js.replace(/(\w+)\.id\s*=\s*([^;]+)\s*;?/g, '$1.id = $2;');
    
    // Handle style properties (convert PascalCase to camelCase)
    js = js.replace(/(\w+)\.Style\.BackgroundColor\s*=\s*([^;]+)\s*;?/g, '$1.style.backgroundColor = $2;');
    js = js.replace(/(\w+)\.Style\.Color\s*=\s*([^;]+)\s*;?/g, '$1.style.color = $2;');
    js = js.replace(/(\w+)\.Style\.Padding\s*=\s*([^;]+)\s*;?/g, '$1.style.padding = $2;');
    js = js.replace(/(\w+)\.Style\.Margin\s*=\s*([^;]+)\s*;?/g, '$1.style.margin = $2;');
    js = js.replace(/(\w+)\.Style\.Border\s*=\s*([^;]+)\s*;?/g, '$1.style.border = $2;');
    js = js.replace(/(\w+)\.Style\.BorderRadius\s*=\s*([^;]+)\s*;?/g, '$1.style.borderRadius = $2;');
    js = js.replace(/(\w+)\.Style\.FontSize\s*=\s*([^;]+)\s*;?/g, '$1.style.fontSize = $2;');
    js = js.replace(/(\w+)\.Style\.FontWeight\s*=\s*([^;]+)\s*;?/g, '$1.style.fontWeight = $2;');
    js = js.replace(/(\w+)\.Style\.FontStyle\s*=\s*([^;]+)\s*;?/g, '$1.style.fontStyle = $2;');
    js = js.replace(/(\w+)\.Style\.MarginTop\s*=\s*([^;]+)\s*;?/g, '$1.style.marginTop = $2;');
    js = js.replace(/(\w+)\.Style\.Animation\s*=\s*([^;]+)\s*;?/g, '$1.style.animation = $2;');
    
    // Handle DOM manipulation
    js = js.replace(/Document\.Body\.AppendChild\s*\(\s*([^)]+)\s*\)\s*;?/g, 'document.body.appendChild($1);');
    js = js.replace(/Document\.GetElementById\s*\(\s*([^)]+)\s*\)/g, 'document.getElementById($1)');
    js = js.replace(/(\w+)\.AppendChild\s*\(\s*([^)]+)\s*\)\s*;?/g, '$1.appendChild($2);');
    js = js.replace(/(\w+)\.RemoveChild\s*\(\s*([^)]+)\s*\)\s*;?/g, '$1.removeChild($2);');
    
    // Handle numeric methods like ToString()
    js = js.replace(/(\w+)\.ToString\s*\(\s*\)/g, '$1.toString()');
    js = js.replace(/(\d+)\.ToString\s*\(\s*\)/g, '$1.toString()');
    
    // Handle increment operations
    js = js.replace(/(\w+)\+\+\s*;?/g, '$1++;');
    
    // Handle string concatenation (C# + operator)
    js = js.replace(/"([^"]*?)"\s*\+\s*(\w+)/g, '"$1" + $2');
    js = js.replace(/(\w+)\s*\+\s*"([^"]*?)"/g, '$1 + "$2"');
    
    // Handle method calls without semicolons (at end of lines)
    js = js.replace(/^(\s*)(\w+\.\w+\(\))\s*$/gm, '$1$2;');
    
    // Clean up any double semicolons
    js = js.replace(/;;/g, ';');
    
    return js;
}

// Process wscript tags
function processWebScriptTags() {
    console.log('🔍 Looking for <wscript> tags...');
    
    const wscriptTags = document.querySelectorAll('wscript');
    console.log(`Found ${wscriptTags.length} <wscript> tags`);
    
    wscriptTags.forEach((tag, index) => {
        console.log(`📝 Processing <wscript> tag ${index + 1}...`);
        
        const source = tag.textContent || tag.innerHTML;
        console.log(`Source code:`, source);
        
        if (!source.trim()) {
            console.warn('⚠️ Empty <wscript> tag found');
            return;
        }
        
        try {
            const javascript = compileWebSharp(source);
            console.log(`📝 Original WebSharp:`, source);
            console.log(`🔄 Generated JavaScript:`, javascript);
            
            // Store last compilation for debugging
            if (typeof window !== 'undefined') {
                window.lastWebSharpCompilation = {
                    source: source,
                    javascript: javascript
                };
            }
            
            // Validate JavaScript syntax before execution
            try {
                new Function(javascript);
            } catch (syntaxError) {
                console.error('❌ JavaScript syntax error:', syntaxError);
                console.error('💔 Generated code that failed:', javascript);
                console.error('🔍 Original WebSharp code:', source);
                throw new Error(`JavaScript compilation failed: ${syntaxError.message}\n\nGenerated code:\n${javascript}`);
            }
            
            // Execute the JavaScript
            console.log('⚡ Executing JavaScript...');
            const func = new Function(javascript);
            func();
            console.log('✅ Execution completed');
            
        } catch (error) {
            console.error('❌ Error processing <wscript> tag:', error);
            
            // Show detailed error in page
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'background: #ffebee; border: 2px solid #f44336; padding: 15px; margin: 10px 0; color: #c62828; font-family: monospace; white-space: pre-wrap; border-radius: 5px;';
            errorDiv.innerHTML = `<strong>❌ WebSharp Error:</strong>\n${error.message}\n\n<small>Check browser console for more details</small>`;
            tag.parentNode.insertBefore(errorDiv, tag.nextSibling);
        }
    });
}

// Initialize when DOM is ready
function initMinimalWebSharp() {
    console.log('🎯 Minimal WebSharp Runtime initializing...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM loaded, processing WebSharp...');
            processWebScriptTags();
        });
    } else {
        console.log('📄 DOM already loaded, processing WebSharp...');
        processWebScriptTags();
    }
}

// Start immediately
initMinimalWebSharp();

console.log('🚀 Minimal WebSharp Runtime loaded!');
