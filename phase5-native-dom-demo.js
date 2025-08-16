/**
 * Phase 5 Demo: Native DOM API for WebSharp
 * Shows C#-style DOM manipulation instead of JS.Call()
 */

// Example of how WebSharp could look with native DOM objects
const nativeDOMExamples = {
    
    // Current Phase 4 approach with JS.Call()
    currentApproach: `
public class ButtonDemo {
    public static void Main() {
        // Low-level JavaScript interop
        var button = JS.Call("document.createElement", "button");
        JS.Set(button, "textContent", "Click me!");
        JS.Set(button, "style.backgroundColor", "#007bff");
        JS.Set(button, "style.color", "white");
        JS.Set(button, "onclick", () => {
            JS.Set(button, "textContent", "Clicked!");
        });
        JS.Call("document.body.appendChild", button);
    }
}`,

    // Proposed Phase 5 approach with native DOM objects
    proposedApproach: `
public class ButtonDemo {
    public static void Main() {
        // C#-style DOM manipulation
        HTMLButtonElement button = new HTMLButtonElement();
        button.TextContent = "Click me!";
        button.Style.BackgroundColor = "#007bff";
        button.Style.Color = "white";
        
        // Type-safe event handling
        button.Click += (sender, e) => {
            button.TextContent = "Clicked!";
            button.Style.BackgroundColor = "#28a745";
        };
        
        Document.Body.AppendChild(button);
    }
}`,

    // Complex form example
    formExample: `
public class FormDemo {
    public static void CreateLoginForm() {
        HTMLDivElement container = new HTMLDivElement();
        container.Style.Padding = "20px";
        container.Style.MaxWidth = "400px";
        container.Style.Margin = "0 auto";
        container.Style.BackgroundColor = "#f8f9fa";
        container.Style.BorderRadius = "8px";
        
        HTMLInputElement nameInput = new HTMLInputElement("text");
        nameInput.Placeholder = "Enter your name";
        nameInput.Style.Display = "block";
        nameInput.Style.Width = "100%";
        nameInput.Style.Padding = "10px";
        nameInput.Style.Margin = "10px 0";
        nameInput.Style.Border = "1px solid #ddd";
        nameInput.Style.BorderRadius = "4px";
        
        HTMLInputElement emailInput = new HTMLInputElement("email");
        emailInput.Placeholder = "Enter your email";
        emailInput.Style.Display = "block";
        emailInput.Style.Width = "100%";
        emailInput.Style.Padding = "10px";
        emailInput.Style.Margin = "10px 0";
        emailInput.Style.Border = "1px solid #ddd";
        emailInput.Style.BorderRadius = "4px";
        
        HTMLButtonElement submitButton = new HTMLButtonElement();
        submitButton.TextContent = "Submit";
        submitButton.Style.BackgroundColor = "#007bff";
        submitButton.Style.Color = "white";
        submitButton.Style.Padding = "12px 24px";
        submitButton.Style.Border = "none";
        submitButton.Style.BorderRadius = "4px";
        submitButton.Style.Cursor = "pointer";
        submitButton.Style.Width = "100%";
        
        // Type-safe event handling with validation
        submitButton.Click += (sender, e) => {
            string name = nameInput.Value;
            string email = emailInput.Value;
            
            if (string.IsNullOrEmpty(name)) {
                nameInput.Style.BorderColor = "#dc3545";
                Window.Alert("Please enter your name");
                return;
            }
            
            if (string.IsNullOrEmpty(email)) {
                emailInput.Style.BorderColor = "#dc3545";
                Window.Alert("Please enter your email");
                return;
            }
            
            // Reset border colors
            nameInput.Style.BorderColor = "#28a745";
            emailInput.Style.BorderColor = "#28a745";
            
            // Show success message
            HTMLDivElement success = new HTMLDivElement();
            success.TextContent = $"Welcome, {name}! Email: {email}";
            success.Style.Padding = "10px";
            success.Style.BackgroundColor = "#d4edda";
            success.Style.Color = "#155724";
            success.Style.Border = "1px solid #c3e6cb";
            success.Style.BorderRadius = "4px";
            success.Style.MarginTop = "10px";
            
            container.AppendChild(success);
        };
        
        // Enter key handling
        Action<KeyboardEvent> handleEnter = (e) => {
            if (e.Key == "Enter") {
                submitButton.Click?.Invoke(submitButton, new MouseEvent());
            }
        };
        
        nameInput.KeyDown += handleEnter;
        emailInput.KeyDown += handleEnter;
        
        container.AppendChild(nameInput);
        container.AppendChild(emailInput);
        container.AppendChild(submitButton);
        Document.Body.AppendChild(container);
    }
}`,

    // Dynamic todo list example
    todoExample: `
public class TodoListDemo {
    private static HTMLDivElement todoList;
    private static int todoCounter = 0;
    
    public static void CreateTodoApp() {
        HTMLDivElement app = new HTMLDivElement();
        app.Style.MaxWidth = "600px";
        app.Style.Margin = "20px auto";
        app.Style.Padding = "20px";
        app.Style.FontFamily = "Arial, sans-serif";
        
        // Header
        HTMLElement header = Document.CreateElement<HTMLElement>("h1");
        header.TextContent = "WebSharp Todo List";
        header.Style.Color = "#333";
        header.Style.TextAlign = "center";
        
        // Input section
        HTMLDivElement inputSection = new HTMLDivElement();
        inputSection.Style.Display = "flex";
        inputSection.Style.MarginBottom = "20px";
        
        HTMLInputElement newTodoInput = new HTMLInputElement("text");
        newTodoInput.Placeholder = "Add a new todo...";
        newTodoInput.Style.Flex = "1";
        newTodoInput.Style.Padding = "10px";
        newTodoInput.Style.FontSize = "16px";
        newTodoInput.Style.Border = "2px solid #ddd";
        newTodoInput.Style.BorderRadius = "4px 0 0 4px";
        
        HTMLButtonElement addButton = new HTMLButtonElement();
        addButton.TextContent = "Add";
        addButton.Style.Padding = "10px 20px";
        addButton.Style.FontSize = "16px";
        addButton.Style.BackgroundColor = "#007bff";
        addButton.Style.Color = "white";
        addButton.Style.Border = "none";
        addButton.Style.BorderRadius = "0 4px 4px 0";
        addButton.Style.Cursor = "pointer";
        
        // Todo list container
        todoList = new HTMLDivElement();
        todoList.Style.MinHeight = "200px";
        
        // Event handlers
        Action addTodo = () => {
            string todoText = newTodoInput.Value.Trim();
            if (!string.IsNullOrEmpty(todoText)) {
                HTMLDivElement todoItem = CreateTodoItem(todoText);
                todoList.AppendChild(todoItem);
                newTodoInput.Value = "";
                newTodoInput.Focus();
            }
        };
        
        addButton.Click += (sender, e) => addTodo();
        
        newTodoInput.KeyDown += (sender, e) => {
            if (e.Key == "Enter") {
                addTodo();
            }
        };
        
        // Assembly
        inputSection.AppendChild(newTodoInput);
        inputSection.AppendChild(addButton);
        
        app.AppendChild(header);
        app.AppendChild(inputSection);
        app.AppendChild(todoList);
        Document.Body.AppendChild(app);
        
        // Focus input
        newTodoInput.Focus();
    }
    
    private static HTMLDivElement CreateTodoItem(string text) {
        todoCounter++;
        
        HTMLDivElement item = new HTMLDivElement();
        item.Style.Display = "flex";
        item.Style.JustifyContent = "space-between";
        item.Style.AlignItems = "center";
        item.Style.Padding = "12px";
        item.Style.Margin = "8px 0";
        item.Style.BackgroundColor = "#f8f9fa";
        item.Style.Border = "1px solid #dee2e6";
        item.Style.BorderRadius = "6px";
        item.Style.Transition = "all 0.2s ease";
        
        HTMLDivElement leftSection = new HTMLDivElement();
        leftSection.Style.Display = "flex";
        leftSection.Style.AlignItems = "center";
        leftSection.Style.Flex = "1";
        
        HTMLInputElement checkbox = new HTMLInputElement("checkbox");
        checkbox.Style.MarginRight = "10px";
        checkbox.Style.Transform = "scale(1.2)";
        
        HTMLSpanElement textSpan = new HTMLSpanElement();
        textSpan.TextContent = text;
        textSpan.Style.FontSize = "16px";
        
        HTMLSpanElement idSpan = new HTMLSpanElement();
        idSpan.TextContent = $"#{todoCounter}";
        idSpan.Style.Color = "#6c757d";
        idSpan.Style.FontSize = "12px";
        idSpan.Style.MarginLeft = "10px";
        
        HTMLButtonElement deleteButton = new HTMLButtonElement();
        deleteButton.TextContent = "Delete";
        deleteButton.Style.BackgroundColor = "#dc3545";
        deleteButton.Style.Color = "white";
        deleteButton.Style.Border = "none";
        deleteButton.Style.Padding = "6px 12px";
        deleteButton.Style.BorderRadius = "4px";
        deleteButton.Style.Cursor = "pointer";
        deleteButton.Style.FontSize = "14px";
        
        // Event handlers
        checkbox.Change += (sender, e) => {
            if (checkbox.Checked) {
                textSpan.Style.TextDecoration = "line-through";
                textSpan.Style.Color = "#6c757d";
                item.Style.BackgroundColor = "#e9ecef";
            } else {
                textSpan.Style.TextDecoration = "none";
                textSpan.Style.Color = "#212529";
                item.Style.BackgroundColor = "#f8f9fa";
            }
        };
        
        deleteButton.Click += (sender, e) => {
            // Add fade out animation effect
            item.Style.Opacity = "0";
            item.Style.Transform = "translateX(100%)";
            
            // Remove after animation
            Window.SetTimeout(() => {
                if (item.ParentNode != null) {
                    item.ParentNode.RemoveChild(item);
                }
            }, 200);
        };
        
        // Hover effects
        item.MouseEnter += (sender, e) => {
            item.Style.BackgroundColor = "#e9ecef";
            item.Style.Transform = "translateY(-1px)";
            item.Style.BoxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        };
        
        item.MouseLeave += (sender, e) => {
            if (!checkbox.Checked) {
                item.Style.BackgroundColor = "#f8f9fa";
            }
            item.Style.Transform = "translateY(0)";
            item.Style.BoxShadow = "none";
        };
        
        // Assembly
        leftSection.AppendChild(checkbox);
        leftSection.AppendChild(textSpan);
        leftSection.AppendChild(idSpan);
        
        item.AppendChild(leftSection);
        item.AppendChild(deleteButton);
        
        return item;
    }
}`,

    // Browser API integrations
    browserAPIExample: `
public class BrowserAPIDemo {
    public static void ShowBrowserCapabilities() {
        HTMLDivElement container = new HTMLDivElement();
        container.Style.Padding = "20px";
        container.Style.FontFamily = "monospace";
        
        // Window information
        HTMLElement windowInfo = Document.CreateElement<HTMLElement>("h2");
        windowInfo.TextContent = "Window Information";
        container.AppendChild(windowInfo);
        
        HTMLDivElement windowData = new HTMLDivElement();
        windowData.InnerHTML = $@"
            <p><strong>URL:</strong> {Window.Location.Href}</p>
            <p><strong>User Agent:</strong> {Navigator.UserAgent}</p>
            <p><strong>Screen Size:</strong> {Screen.Width} x {Screen.Height}</p>
            <p><strong>Window Size:</strong> {Window.InnerWidth} x {Window.InnerHeight}</p>
            <p><strong>Language:</strong> {Navigator.Language}</p>
        ";
        container.AppendChild(windowData);
        
        // Local Storage demo
        HTMLElement storageInfo = Document.CreateElement<HTMLElement>("h2");
        storageInfo.TextContent = "Local Storage Demo";
        container.AppendChild(storageInfo);
        
        HTMLInputElement keyInput = new HTMLInputElement("text");
        keyInput.Placeholder = "Storage key";
        keyInput.Style.Margin = "5px";
        
        HTMLInputElement valueInput = new HTMLInputElement("text");
        valueInput.Placeholder = "Storage value";
        valueInput.Style.Margin = "5px";
        
        HTMLButtonElement saveButton = new HTMLButtonElement();
        saveButton.TextContent = "Save to LocalStorage";
        saveButton.Style.Margin = "5px";
        
        HTMLButtonElement loadButton = new HTMLButtonElement();
        loadButton.TextContent = "Load from LocalStorage";
        loadButton.Style.Margin = "5px";
        
        HTMLDivElement storageOutput = new HTMLDivElement();
        storageOutput.Style.Padding = "10px";
        storageOutput.Style.BackgroundColor = "#f8f9fa";
        storageOutput.Style.Border = "1px solid #dee2e6";
        storageOutput.Style.MarginTop = "10px";
        
        saveButton.Click += (sender, e) => {
            string key = keyInput.Value;
            string value = valueInput.Value;
            
            if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(value)) {
                LocalStorage.SetItem(key, value);
                storageOutput.TextContent = $"Saved: {key} = {value}";
            }
        };
        
        loadButton.Click += (sender, e) => {
            string key = keyInput.Value;
            if (!string.IsNullOrEmpty(key)) {
                string value = LocalStorage.GetItem(key);
                valueInput.Value = value ?? "";
                storageOutput.TextContent = $"Loaded: {key} = {value ?? "null"}";
            }
        };
        
        container.AppendChild(keyInput);
        container.AppendChild(valueInput);
        container.AppendChild(saveButton);
        container.AppendChild(loadButton);
        container.AppendChild(storageOutput);
        
        Document.Body.AppendChild(container);
    }
}`,

    // Generated JavaScript runtime bridge
    runtimeBridge: `
// WebSharp DOM Runtime Bridge
const WebSharpDOM = {
    // Document static class
    Document: {
        CreateElement: function(tagName, type) {
            const element = document.createElement(tagName);
            return new WebSharpElement(element, type || 'Element');
        },
        
        GetElementById: function(id) {
            const element = document.getElementById(id);
            return element ? new WebSharpElement(element, 'Element') : null;
        },
        
        QuerySelector: function(selector) {
            const element = document.querySelector(selector);
            return element ? new WebSharpElement(element, 'Element') : null;
        },
        
        QuerySelectorAll: function(selector) {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => new WebSharpElement(el, 'Element'));
        },
        
        get Body() {
            return new WebSharpElement(document.body, 'HTMLElement');
        },
        
        get Head() {
            return new WebSharpElement(document.head, 'HTMLElement');
        },
        
        get Title() { return document.title; },
        set Title(value) { document.title = value; },
        
        get URL() { return document.URL; }
    },
    
    // WebSharp Element wrapper
    WebSharpElement: class {
        constructor(domElement, type) {
            this._dom = domElement;
            this._type = type;
            this._eventHandlers = new Map();
        }
        
        // Properties
        get TextContent() { return this._dom.textContent; }
        set TextContent(value) { this._dom.textContent = value; }
        
        get InnerHTML() { return this._dom.innerHTML; }
        set InnerHTML(value) { this._dom.innerHTML = value; }
        
        get OuterHTML() { return this._dom.outerHTML; }
        
        get Id() { return this._dom.id; }
        set Id(value) { this._dom.id = value; }
        
        get ClassName() { return this._dom.className; }
        set ClassName(value) { this._dom.className = value; }
        
        get Style() {
            if (!this._styleWrapper) {
                this._styleWrapper = new WebSharpCSSStyleDeclaration(this._dom.style);
            }
            return this._styleWrapper;
        }
        
        get ClassList() {
            if (!this._classListWrapper) {
                this._classListWrapper = new WebSharpDOMTokenList(this._dom.classList);
            }
            return this._classListWrapper;
        }
        
        get ParentNode() {
            return this._dom.parentNode ? new WebSharpElement(this._dom.parentNode, 'Node') : null;
        }
        
        get ChildNodes() {
            return Array.from(this._dom.childNodes).map(node => new WebSharpElement(node, 'Node'));
        }
        
        // Methods
        AppendChild(child) {
            this._dom.appendChild(child._dom);
        }
        
        RemoveChild(child) {
            this._dom.removeChild(child._dom);
        }
        
        InsertBefore(newNode, referenceNode) {
            this._dom.insertBefore(newNode._dom, referenceNode._dom);
        }
        
        QuerySelector(selector) {
            const element = this._dom.querySelector(selector);
            return element ? new WebSharpElement(element, 'Element') : null;
        }
        
        QuerySelectorAll(selector) {
            const elements = this._dom.querySelectorAll(selector);
            return Array.from(elements).map(el => new WebSharpElement(el, 'Element'));
        }
        
        SetAttribute(name, value) {
            this._dom.setAttribute(name, value);
        }
        
        GetAttribute(name) {
            return this._dom.getAttribute(name);
        }
        
        HasAttribute(name) {
            return this._dom.hasAttribute(name);
        }
        
        RemoveAttribute(name) {
            this._dom.removeAttribute(name);
        }
        
        AddEventListener(type, handler) {
            this._dom.addEventListener(type, handler);
        }
        
        RemoveEventListener(type, handler) {
            this._dom.removeEventListener(type, handler);
        }
        
        Click() {
            this._dom.click();
        }
        
        Focus() {
            this._dom.focus();
        }
        
        Blur() {
            this._dom.blur();
        }
    },
    
    // CSS Style Declaration wrapper
    WebSharpCSSStyleDeclaration: class {
        constructor(domStyle) {
            this._dom = domStyle;
        }
        
        get BackgroundColor() { return this._dom.backgroundColor; }
        set BackgroundColor(value) { this._dom.backgroundColor = value; }
        
        get Color() { return this._dom.color; }
        set Color(value) { this._dom.color = value; }
        
        get FontSize() { return this._dom.fontSize; }
        set FontSize(value) { this._dom.fontSize = value; }
        
        get FontFamily() { return this._dom.fontFamily; }
        set FontFamily(value) { this._dom.fontFamily = value; }
        
        get Padding() { return this._dom.padding; }
        set Padding(value) { this._dom.padding = value; }
        
        get Margin() { return this._dom.margin; }
        set Margin(value) { this._dom.margin = value; }
        
        get Border() { return this._dom.border; }
        set Border(value) { this._dom.border = value; }
        
        get Display() { return this._dom.display; }
        set Display(value) { this._dom.display = value; }
        
        get Position() { return this._dom.position; }
        set Position(value) { this._dom.position = value; }
        
        get Width() { return this._dom.width; }
        set Width(value) { this._dom.width = value; }
        
        get Height() { return this._dom.height; }
        set Height(value) { this._dom.height = value; }
        
        GetPropertyValue(property) {
            return this._dom.getPropertyValue(property);
        }
        
        SetProperty(property, value) {
            this._dom.setProperty(property, value);
        }
        
        RemoveProperty(property) {
            this._dom.removeProperty(property);
        }
    }
};

// Element constructors
class HTMLButtonElement extends WebSharpDOM.WebSharpElement {
    constructor() {
        super(document.createElement('button'), 'HTMLButtonElement');
    }
    
    get Disabled() { return this._dom.disabled; }
    set Disabled(value) { this._dom.disabled = value; }
    
    get Type() { return this._dom.type; }
    set Type(value) { this._dom.type = value; }
    
    get Value() { return this._dom.value; }
    set Value(value) { this._dom.value = value; }
}

class HTMLInputElement extends WebSharpDOM.WebSharpElement {
    constructor(type = 'text') {
        super(document.createElement('input'), 'HTMLInputElement');
        this.Type = type;
    }
    
    get Type() { return this._dom.type; }
    set Type(value) { this._dom.type = value; }
    
    get Value() { return this._dom.value; }
    set Value(value) { this._dom.value = value; }
    
    get Placeholder() { return this._dom.placeholder; }
    set Placeholder(value) { this._dom.placeholder = value; }
    
    get Required() { return this._dom.required; }
    set Required(value) { this._dom.required = value; }
    
    get Disabled() { return this._dom.disabled; }
    set Disabled(value) { this._dom.disabled = value; }
    
    get Checked() { return this._dom.checked; }
    set Checked(value) { this._dom.checked = value; }
}

class HTMLDivElement extends WebSharpDOM.WebSharpElement {
    constructor() {
        super(document.createElement('div'), 'HTMLDivElement');
    }
}

class HTMLSpanElement extends WebSharpDOM.WebSharpElement {
    constructor() {
        super(document.createElement('span'), 'HTMLSpanElement');
    }
}

// Expose Document as global
const Document = WebSharpDOM.Document;`
};

console.log('🚀 Phase 5 Vision: Native DOM API for WebSharp');
console.log('==============================================\n');

console.log('📋 Current Phase 4 Approach (JS.Call):');
console.log(nativeDOMExamples.currentApproach);

console.log('\n🔷 Proposed Phase 5 Approach (Native DOM Objects):');
console.log(nativeDOMExamples.proposedApproach);

console.log('\n🌐 Complex Form Example:');
console.log(nativeDOMExamples.formExample);

console.log('\n📝 Dynamic Todo List Example:');
console.log(nativeDOMExamples.todoExample);

console.log('\n🌍 Browser APIs Integration:');
console.log(nativeDOMExamples.browserAPIExample);

console.log('\n⚙️ Generated JavaScript Runtime Bridge:');
console.log(nativeDOMExamples.runtimeBridge);

console.log('\n✨ Key Benefits of Native DOM API:');
console.log('• 🎯 Natural C# feel - DOM objects work like .NET objects');
console.log('• 🔧 Full IntelliSense - Autocompletion for all properties/methods');
console.log('• 🛡️ Type Safety - Compile-time checking for property names');
console.log('• 📚 Familiar API - C# developers already know this pattern');
console.log('• 🚀 Better Productivity - Less verbose than JS.Call() approach');
console.log('• 🎮 Event Handling - Natural C# event syntax with += operator');

console.log('\n🔧 Implementation Strategy:');
console.log('• Create WebSharp DOM class definitions');
console.log('• Extend code generator for DOM object compilation');
console.log('• Generate JavaScript runtime bridge');
console.log('• Support for all HTML elements and CSS properties');
console.log('• Type-safe event handling with C# delegates');

console.log('\n🎯 This would make WebSharp feel like a true C# environment for web development!');
