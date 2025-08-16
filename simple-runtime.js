/**
 * Ultra-Simple WebSharp Runtime - Debug Version
 */

// Extremely simple compiler that only handles basic cases
function compileWebSharpSimple(source) {
    let js = source.trim();
    
    console.log('🔍 Input source:', JSON.stringify(js));
    
    // Only handle the most basic transformations
    // 1. Console.WriteLine
    js = js.replace(/Console\.WriteLine\s*\(\s*"([^"]*)"\s*\)/g, 'console.log("$1")');
    js = js.replace(/Console\.WriteLine\s*\(\s*([^)]+)\s*\)/g, 'console.log($1)');
    
    // 2. Basic class (very simple)
    js = js.replace(/public\s+class\s+(\w+)\s*{/g, 'class $1 {');
    js = js.replace(/public\s+static\s+void\s+(\w+)\s*\(\s*\)\s*{/g, 'static $1() {');
    js = js.replace(/private\s+static\s+void\s+(\w+)\s*\(\s*\)\s*{/g, 'static $1() {');
    
    // 3. Static fields (very basic)
    js = js.replace(/private\s+static\s+int\s+(\w+)\s*=\s*(\d+)\s*;/g, 'static $1 = $2;');
    
    // 4. Basic method calls
    js = js.replace(/(\w+)\.(\w+)\(\)\s*;?\s*$/gm, '$1.$2();');
    
    console.log('🔍 Output JS:', JSON.stringify(js));
    
    return js;
}

// Process wscript tags with minimal error handling
function processWebScriptTagsSimple() {
    console.log('🔍 Looking for <wscript> tags...');
    
    const wscriptTags = document.querySelectorAll('wscript');
    console.log(`Found ${wscriptTags.length} <wscript> tags`);
    
    wscriptTags.forEach((tag, index) => {
        console.log(`📝 Processing <wscript> tag ${index + 1}...`);
        
        const source = tag.textContent || tag.innerHTML;
        console.log(`Raw content:`, source);
        
        if (!source.trim()) {
            console.warn('⚠️ Empty <wscript> tag found');
            return;
        }
        
        try {
            const javascript = compileWebSharpSimple(source);
            console.log(`Generated JavaScript:`, javascript);
            
            // Simple validation
            if (!javascript.trim()) {
                throw new Error('Compilation produced empty result');
            }
            
            // Execute
            console.log('⚡ Executing...');
            const func = new Function(javascript);
            func();
            console.log('✅ Success');
            
        } catch (error) {
            console.error('❌ Error:', error);
            
            // Show error in page
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'background: #ffebee; border: 2px solid #f44336; padding: 10px; margin: 10px 0; color: #c62828; border-radius: 5px;';
            errorDiv.innerHTML = `
                <strong>❌ WebSharp Error:</strong><br>
                ${error.message}<br>
                <details>
                    <summary>Debug Info</summary>
                    <pre>Source: ${source}</pre>
                    <pre>Generated: ${javascript || 'undefined'}</pre>
                </details>
            `;
            tag.parentNode.insertBefore(errorDiv, tag.nextSibling);
        }
    });
}

// Initialize when DOM is ready
function initSimpleWebSharp() {
    console.log('🎯 Simple WebSharp Runtime initializing...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM loaded, processing WebSharp...');
            processWebScriptTagsSimple();
        });
    } else {
        console.log('📄 DOM already loaded, processing WebSharp...');
        processWebScriptTagsSimple();
    }
}

// Start immediately
initSimpleWebSharp();

console.log('🚀 Simple WebSharp Runtime loaded!');
