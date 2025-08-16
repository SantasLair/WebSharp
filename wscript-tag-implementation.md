# WebSharp `<wscript>` Tag Implementation Plan

## 🎯 Vision: Native HTML Integration

Enable developers to write WebSharp directly in HTML using `<wscript>` tags:

```html
<wscript>
public class MyApp {
    public static void Main() {
        var button = new HTMLButtonElement();
        button.TextContent = "Hello WebSharp!";
        Document.Body.AppendChild(button);
    }
}
MyApp.Main();
</wscript>
```

## 🛠️ Implementation Strategy

### **1. Browser Runtime with Script Tag Detection**
The WebSharp runtime will:
- Scan for `<wscript>` tags when page loads
- Extract WebSharp source code from tag content
- Compile to JavaScript in real-time
- Execute the generated code

### **2. Script Tag Variations**
Support multiple patterns:
```html
<!-- Inline WebSharp code -->
<wscript>
  // WebSharp code here
</wscript>

<!-- External WebSharp file -->
<wscript src="app.ws"></wscript>

<!-- With explicit type -->
<script type="text/websharp">
  // WebSharp code here  
</script>

<!-- External with type -->
<script type="text/websharp" src="app.ws"></script>
```

### **3. Runtime Architecture**
```javascript
// WebSharp Browser Runtime
const WebSharpRuntime = {
  compiler: new WebSharpCompiler(),
  
  // Scan and process all WebSharp scripts
  processScripts() {
    // Find <wscript> tags
    const wscriptTags = document.querySelectorAll('wscript');
    // Find <script type="text/websharp"> tags  
    const scriptTags = document.querySelectorAll('script[type="text/websharp"]');
    
    [...wscriptTags, ...scriptTags].forEach(tag => {
      this.processScript(tag);
    });
  },
  
  // Process individual script tag
  async processScript(tag) {
    let source;
    
    if (tag.src) {
      // External file
      source = await fetch(tag.src).then(r => r.text());
    } else {
      // Inline code
      source = tag.textContent;
    }
    
    // Compile WebSharp to JavaScript
    const js = this.compiler.compileToJavaScript(source);
    
    // Execute generated JavaScript
    this.executeJS(js);
  }
};
```

## 🚀 Implementation Steps

1. **Create browser-compatible WebSharp runtime**
2. **Add script tag detection and processing**  
3. **Handle both inline and external .ws files**
4. **Add error handling and debugging support**
5. **Create demo HTML pages**

Let's implement this!
