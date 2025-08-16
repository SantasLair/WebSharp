/**
 * Minimal WebSharp Runtime - Proof of Concept
 */

// Simple WebSharp to JavaScript compiler
function compileWebSharp(source) {
    let js = source.trim();
    
    // Basic transformations
    js = js.replace(/Console\.WriteLine\s*\(\s*([^)]+)\s*\)\s*;?/g, 'console.log($1);');
    js = js.replace(/public\s+class\s+(\w+)\s*\{/g, 'class $1 {');
    js = js.replace(/public\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
    
    // DOM transformations
    js = js.replace(/var\s+(\w+)\s*=\s*new\s+HTMLDivElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("div");');
    js = js.replace(/var\s+(\w+)\s*=\s*new\s+HTMLButtonElement\s*\(\s*\)\s*;?/g, 'var $1 = document.createElement("button");');
    js = js.replace(/(\w+)\.TextContent\s*=\s*([^;]+)\s*;?/g, '$1.textContent = $2;');
    js = js.replace(/(\w+)\.Style\.(\w+)\s*=\s*([^;]+)\s*;?/g, '$1.style.$2 = $3;');
    js = js.replace(/Document\.Body\.AppendChild\s*\(\s*([^)]+)\s*\)\s*;?/g, 'document.body.appendChild($1);');
    js = js.replace(/(\w+)\.AppendChild\s*\(\s*([^)]+)\s*\)\s*;?/g, '$1.appendChild($2);');
    
    // Handle method calls without semicolons
    js = js.replace(/(\w+\.\w+\(\));?\s*$/gm, '$1;');
    
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
            console.log(`Generated JavaScript:`, javascript);
            
            // Execute the JavaScript
            console.log('⚡ Executing JavaScript...');
            const func = new Function(javascript);
            func();
            console.log('✅ Execution completed');
            
        } catch (error) {
            console.error('❌ Error processing <wscript> tag:', error);
            
            // Show error in page
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'background: #ffebee; border: 1px solid #f44336; padding: 10px; margin: 10px 0; color: #c62828;';
            errorDiv.textContent = `WebSharp Error: ${error.message}`;
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
