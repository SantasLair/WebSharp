/**
 * Working WebSharp Runtime - Step by Step Build
 */

// Step-by-step compiler that we can debug
function compileWebSharpWorking(source) {
    let js = source.trim();
    let className = '';
    
    console.log('🔧 Step 0 - Input:', js);
    
    try {
        // Step 0.1: Remove C# style comments first (they break JavaScript)
        js = js.replace(/\/\/[^\r\n]*/g, '');
        console.log('🔧 Step 0.1 - After removing comments:', js);
        
        // Step 0.5: Extract class name for method resolution
        const classMatch = js.match(/(?:public\s+)?class\s+(\w+)\s*\{/);
        if (classMatch) {
            className = classMatch[1];
            console.log('🔧 Step 0.5 - Found class:', className);
        }
        
        // Step 0.7: Handle C# string concatenation (+ operator with strings)
        js = js.replace(/("[^"]*")\s*\+\s*(\w+)/g, '$1 + $2');
        js = js.replace(/(\w+)\s*\+\s*("[^"]*")/g, '$1 + $2');
        console.log('🔧 Step 0.7 - After string concatenation:', js);
        
        // Step 1: Handle Console.WriteLine (safest first)
        js = js.replace(/Console\.WriteLine\s*\(\s*"([^"]*)"\s*\)\s*;?/g, 'console.log("$1");');
        js = js.replace(/Console\.WriteLine\s*\(\s*([^)]+)\s*\)\s*;?/g, 'console.log($1);');
        console.log('🔧 Step 1 - After Console.WriteLine:', js);
        
        // Step 2: Handle class declarations
        js = js.replace(/public\s+class\s+(\w+)\s*\{/g, 'class $1 {');
        console.log('🔧 Step 2 - After class:', js);
        
        // Step 3: Handle method declarations
        js = js.replace(/public\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
        js = js.replace(/private\s+static\s+void\s+(\w+)\s*\(\s*\)\s*\{/g, 'static $1() {');
        console.log('🔧 Step 3 - After methods:', js);
        
        // Step 4: Handle static fields (simple integer only)
        js = js.replace(/private\s+static\s+int\s+(\w+)\s*=\s*(\d+)\s*;/g, 'static $1 = $2;');
        console.log('🔧 Step 4 - After fields:', js);
        
        // Step 5: Handle DOM creation (one at a time)
        js = js.replace(/var\s+(\w+)\s*=\s*document\.createElement\s*\(\s*"([^"]*)"\s*\)\s*;?/g, 'var $1 = document.createElement("$2");');
        console.log('🔧 Step 5 - After createElement:', js);
        
        // Step 6: Handle basic properties
        js = js.replace(/(\w+)\.textContent\s*=\s*([^;]+)\s*;?/g, '$1.textContent = $2;');
        js = js.replace(/(\w+)\.className\s*=\s*([^;]+)\s*;?/g, '$1.className = $2;');
        js = js.replace(/(\w+)\.id\s*=\s*([^;]+)\s*;?/g, '$1.id = $2;');
        console.log('🔧 Step 6 - After properties:', js);
        
        // Step 6.5: Handle style properties
        js = js.replace(/(\w+)\.style\.(\w+)\s*=\s*([^;]+)\s*;?/g, '$1.style.$2 = $3;');
        console.log('🔧 Step 6.5 - After style properties:', js);
        
        // Step 7: Handle basic DOM methods
        js = js.replace(/(\w+)\.appendChild\s*\(\s*([^)]+)\s*\)\s*;?/g, '$1.appendChild($2);');
        js = js.replace(/document\.getElementById\s*\(\s*([^)]+)\s*\)/g, 'document.getElementById($1)');
        console.log('🔧 Step 7 - After DOM methods:', js);
        
        // Step 7.5: Handle toString calls
        js = js.replace(/(\w+)\.toString\s*\(\s*\)/g, '$1.toString()');
        console.log('🔧 Step 7.5 - After toString:', js);
        
        // Step 7.7: Handle C# operators
        js = js.replace(/(\w+)\+\+/g, '$1++');
        js = js.replace(/(\w+)\s*==\s*(\d+)/g, '$1 === $2');
        console.log('🔧 Step 7.7 - After C# operators:', js);
        
        // Step 8: Handle method calls within the same class - CRITICAL FIX!
        if (className) {
            const methodNames = ['Initialize', 'UpdateDisplay', 'Increment', 'Reset'];
            methodNames.forEach(methodName => {
                const regex = new RegExp(`\\b${methodName}\\s*\\(\\s*\\)\\s*;?`, 'g');
                js = js.replace(regex, `${className}.${methodName}();`);
                console.log(`🔧 Step 8a - Qualified ${methodName} calls`);
            });
            console.log('🔧 Step 8 - After method qualification:', js);
        }
        
        // Step 9: Handle standalone method calls (final cleanup)
        js = js.replace(/^(\s*)(\w+\.\w+\(\))\s*$/gm, '$1$2;');
        console.log('🔧 Step 9 - After method calls:', js);
        
        console.log('🔧 Final result:', js);
        return js;
        
    } catch (error) {
        console.error('🔧 Compilation step failed:', error);
        throw error;
    }
}

// Process wscript tags with detailed debugging
function processWebScriptTagsWorking() {
    console.log('🔍 Processing WebScript tags with working runtime...');
    
    const wscriptTags = document.querySelectorAll('wscript');
    console.log(`Found ${wscriptTags.length} <wscript> tags`);
    
    wscriptTags.forEach((tag, index) => {
        console.log(`\n📝 === Processing tag ${index + 1} ===`);
        
        const source = tag.textContent || tag.innerHTML;
        console.log(`Source:`, source);
        
        if (!source.trim()) {
            console.warn('⚠️ Empty tag, skipping');
            return;
        }
        
        try {
            const javascript = compileWebSharpWorking(source);
            
            console.log(`✅ Compilation successful`);
            console.log(`📤 Generated:`, javascript);
            
            // Validate syntax
            try {
                new Function(javascript);
                console.log(`✅ Syntax validation passed`);
            } catch (syntaxError) {
                console.error('❌ Syntax validation failed:', syntaxError);
                throw new Error(`Invalid JavaScript generated: ${syntaxError.message}`);
            }
            
            // Execute
            console.log('⚡ Executing...');
            const func = new Function(javascript);
            func();
            console.log('✅ Execution completed successfully');
            
        } catch (error) {
            console.error(`❌ Error in tag ${index + 1}:`, error);
            
            // Show error in page
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'background: #ffebee; border: 2px solid #f44336; padding: 15px; margin: 10px 0; color: #c62828; border-radius: 5px; font-family: monospace;';
            errorDiv.innerHTML = `
                <strong>❌ WebSharp Error in Tag ${index + 1}:</strong><br>
                ${error.message}<br>
                <details style="margin-top: 10px;">
                    <summary>Debug Details</summary>
                    <pre style="background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 3px;">Source:\n${source}</pre>
                </details>
            `;
            tag.parentNode.insertBefore(errorDiv, tag.nextSibling);
        }
    });
}

// Initialize working runtime
function initWorkingWebSharp() {
    console.log('🎯 Working WebSharp Runtime starting...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processWebScriptTagsWorking);
    } else {
        processWebScriptTagsWorking();
    }
}

initWorkingWebSharp();
console.log('🚀 Working WebSharp Runtime loaded!');
