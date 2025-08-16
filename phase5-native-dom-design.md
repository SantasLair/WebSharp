# Phase 5: Native DOM API for WebSharp
## Vision: C#-Style Browser Objects

### Overview
Replace the lower-level `JS.Call()` approach with native C#-style objects like `Document`, `Element`, `HTMLElement`, etc. This makes WebSharp feel like a true C# environment for web development.

### Current vs. Proposed Approach

#### Current Phase 4 Approach (JS.Call)
```csharp
// Low-level JavaScript interop
var button = JS.Call("document.createElement", "button");
JS.Set(button, "textContent", "Click me!");
JS.Set(button, "style.backgroundColor", "#blue");
JS.Call("document.body.appendChild", button);
```

#### Proposed Phase 5 Approach (Native DOM Objects)
```csharp
// C#-style DOM manipulation
HTMLButtonElement button = Document.CreateElement<HTMLButtonElement>("button");
button.TextContent = "Click me!";
button.Style.BackgroundColor = "#blue";
Document.Body.AppendChild(button);

// Or even more C#-like:
HTMLButtonElement button = new HTMLButtonElement();
button.TextContent = "Click me!";
button.Style.BackgroundColor = "#blue";
Document.Body.AppendChild(button);
```

### Core DOM Classes Design

#### 1. Document Class
```csharp
public static class Document {
    // Element creation
    public static T CreateElement<T>(string tagName) where T : Element;
    public static Element CreateElement(string tagName);
    public static TextNode CreateTextNode(string text);
    
    // Element selection
    public static Element GetElementById(string id);
    public static Element QuerySelector(string selector);
    public static Element[] QuerySelectorAll(string selector);
    
    // Document properties
    public static HTMLElement Body { get; }
    public static HTMLElement Head { get; }
    public static string Title { get; set; }
    public static string URL { get; }
    
    // Events
    public static event EventHandler<Event> DOMContentLoaded;
    public static event EventHandler<Event> Click;
}
```

#### 2. Element Hierarchy
```csharp
public abstract class Node {
    public string TextContent { get; set; }
    public Node ParentNode { get; }
    public Node[] ChildNodes { get; }
    
    public void AppendChild(Node child);
    public void RemoveChild(Node child);
    public void InsertBefore(Node newNode, Node referenceNode);
}

public abstract class Element : Node {
    public string Id { get; set; }
    public string ClassName { get; set; }
    public string InnerHTML { get; set; }
    public string OuterHTML { get; }
    public CSSStyleDeclaration Style { get; }
    public DOMTokenList ClassList { get; }
    
    // Element methods
    public Element QuerySelector(string selector);
    public Element[] QuerySelectorAll(string selector);
    public void SetAttribute(string name, string value);
    public string GetAttribute(string name);
    public bool HasAttribute(string name);
    public void RemoveAttribute(string name);
    
    // Events
    public void AddEventListener(string type, EventHandler<Event> handler);
    public void RemoveEventListener(string type, EventHandler<Event> handler);
    
    // Shorthand event properties
    public event EventHandler<MouseEvent> Click;
    public event EventHandler<Event> Change;
    public event EventHandler<KeyboardEvent> KeyDown;
}

public class HTMLElement : Element {
    public string AccessKey { get; set; }
    public bool Hidden { get; set; }
    public string Lang { get; set; }
    public string Title { get; set; }
    
    public void Click();
    public void Focus();
    public void Blur();
}
```

#### 3. Specific HTML Elements
```csharp
public class HTMLButtonElement : HTMLElement {
    public bool Disabled { get; set; }
    public string Type { get; set; }
    public string Value { get; set; }
    public HTMLFormElement Form { get; }
    
    public HTMLButtonElement() : base("button") { }
}

public class HTMLInputElement : HTMLElement {
    public string Type { get; set; }
    public string Value { get; set; }
    public string Placeholder { get; set; }
    public bool Required { get; set; }
    public bool Disabled { get; set; }
    public bool Checked { get; set; }
    
    public HTMLInputElement() : base("input") { }
    public HTMLInputElement(string type) : base("input") { Type = type; }
}

public class HTMLDivElement : HTMLElement {
    public HTMLDivElement() : base("div") { }
}

public class HTMLSpanElement : HTMLElement {
    public HTMLSpanElement() : base("span") { }
}
```

#### 4. CSS and Styling
```csharp
public class CSSStyleDeclaration {
    public string BackgroundColor { get; set; }
    public string Color { get; set; }
    public string FontSize { get; set; }
    public string FontFamily { get; set; }
    public string Padding { get; set; }
    public string Margin { get; set; }
    public string Border { get; set; }
    public string Display { get; set; }
    public string Position { get; set; }
    public string Width { get; set; }
    public string Height { get; set; }
    
    // CSS property setter/getter
    public string GetPropertyValue(string property);
    public void SetProperty(string property, string value);
    public void RemoveProperty(string property);
}

public class DOMTokenList {
    public int Length { get; }
    public string Value { get; set; }
    
    public void Add(params string[] tokens);
    public void Remove(params string[] tokens);
    public bool Contains(string token);
    public void Toggle(string token);
    public void Replace(string oldToken, string newToken);
}
```

#### 5. Events
```csharp
public class Event {
    public string Type { get; }
    public Element Target { get; }
    public Element CurrentTarget { get; }
    public bool Bubbles { get; }
    public bool Cancelable { get; }
    public DateTime TimeStamp { get; }
    
    public void PreventDefault();
    public void StopPropagation();
    public void StopImmediatePropagation();
}

public class MouseEvent : Event {
    public int Button { get; }
    public int ClientX { get; }
    public int ClientY { get; }
    public int ScreenX { get; }
    public int ScreenY { get; }
    public bool CtrlKey { get; }
    public bool ShiftKey { get; }
    public bool AltKey { get; }
    public bool MetaKey { get; }
}

public class KeyboardEvent : Event {
    public string Key { get; }
    public string Code { get; }
    public int KeyCode { get; }
    public bool CtrlKey { get; }
    public bool ShiftKey { get; }
    public bool AltKey { get; }
    public bool MetaKey { get; }
}
```

### Usage Examples

#### 1. Simple Button Creation
```csharp
public class ButtonDemo {
    public static void Main() {
        // C#-style object creation
        HTMLButtonElement button = new HTMLButtonElement();
        button.TextContent = "Click me!";
        button.Style.BackgroundColor = "#007bff";
        button.Style.Color = "white";
        button.Style.Padding = "10px 20px";
        
        // Type-safe event handling
        button.Click += (sender, e) => {
            button.TextContent = "Clicked!";
            button.Style.BackgroundColor = "#28a745";
        };
        
        Document.Body.AppendChild(button);
    }
}
```

#### 2. Form Creation
```csharp
public class FormDemo {
    public static void CreateLoginForm() {
        HTMLDivElement container = new HTMLDivElement();
        container.Style.Padding = "20px";
        container.Style.MaxWidth = "400px";
        container.Style.Margin = "0 auto";
        
        HTMLInputElement nameInput = new HTMLInputElement("text");
        nameInput.Placeholder = "Enter your name";
        nameInput.Style.Display = "block";
        nameInput.Style.Width = "100%";
        nameInput.Style.Margin = "10px 0";
        
        HTMLInputElement emailInput = new HTMLInputElement("email");
        emailInput.Placeholder = "Enter your email";
        emailInput.Style.Display = "block";
        emailInput.Style.Width = "100%";
        emailInput.Style.Margin = "10px 0";
        
        HTMLButtonElement submitButton = new HTMLButtonElement();
        submitButton.TextContent = "Submit";
        submitButton.Style.BackgroundColor = "#007bff";
        submitButton.Style.Color = "white";
        submitButton.Style.Padding = "10px 20px";
        submitButton.Style.Border = "none";
        submitButton.Style.BorderRadius = "4px";
        
        submitButton.Click += (sender, e) => {
            string name = nameInput.Value;
            string email = emailInput.Value;
            
            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(email)) {
                Window.Alert("Please fill in all fields");
                return;
            }
            
            Console.WriteLine($"Name: {name}, Email: {email}");
        };
        
        container.AppendChild(nameInput);
        container.AppendChild(emailInput);
        container.AppendChild(submitButton);
        Document.Body.AppendChild(container);
    }
}
```

#### 3. Dynamic List Creation
```csharp
public class ListDemo {
    public static void CreateTodoList() {
        HTMLDivElement todoApp = new HTMLDivElement();
        todoApp.Style.MaxWidth = "600px";
        todoApp.Style.Margin = "20px auto";
        todoApp.Style.Padding = "20px";
        
        HTMLInputElement newTodoInput = new HTMLInputElement("text");
        newTodoInput.Placeholder = "Add a new todo...";
        newTodoInput.Style.Width = "70%";
        newTodoInput.Style.Padding = "10px";
        
        HTMLButtonElement addButton = new HTMLButtonElement();
        addButton.TextContent = "Add";
        addButton.Style.Padding = "10px 20px";
        addButton.Style.MarginLeft = "10px";
        
        HTMLDivElement todoList = new HTMLDivElement();
        todoList.Style.MarginTop = "20px";
        
        addButton.Click += (sender, e) => {
            string todoText = newTodoInput.Value.Trim();
            if (!string.IsNullOrEmpty(todoText)) {
                HTMLDivElement todoItem = CreateTodoItem(todoText);
                todoList.AppendChild(todoItem);
                newTodoInput.Value = "";
            }
        };
        
        newTodoInput.KeyDown += (sender, e) => {
            if (e.Key == "Enter") {
                addButton.Click?.Invoke(addButton, new MouseEvent());
            }
        };
        
        todoApp.AppendChild(newTodoInput);
        todoApp.AppendChild(addButton);
        todoApp.AppendChild(todoList);
        Document.Body.AppendChild(todoApp);
    }
    
    private static HTMLDivElement CreateTodoItem(string text) {
        HTMLDivElement item = new HTMLDivElement();
        item.Style.Display = "flex";
        item.Style.JustifyContent = "space-between";
        item.Style.AlignItems = "center";
        item.Style.Padding = "10px";
        item.Style.Margin = "5px 0";
        item.Style.Border = "1px solid #ddd";
        item.Style.BorderRadius = "4px";
        
        HTMLSpanElement textSpan = new HTMLSpanElement();
        textSpan.TextContent = text;
        
        HTMLButtonElement deleteButton = new HTMLButtonElement();
        deleteButton.TextContent = "Delete";
        deleteButton.Style.BackgroundColor = "#dc3545";
        deleteButton.Style.Color = "white";
        deleteButton.Style.Border = "none";
        deleteButton.Style.Padding = "5px 10px";
        deleteButton.Style.BorderRadius = "3px";
        
        deleteButton.Click += (sender, e) => {
            item.ParentNode.RemoveChild(item);
        };
        
        item.AppendChild(textSpan);
        item.AppendChild(deleteButton);
        
        return item;
    }
}
```

### Implementation Strategy

#### 1. Browser Object Definitions
Create WebSharp classes that map to browser DOM objects, providing C#-style properties and methods.

#### 2. Code Generation Enhancement
Extend the code generator to:
- Convert WebSharp DOM objects to JavaScript DOM calls
- Generate property getters/setters that map to JavaScript properties
- Handle event binding with proper JavaScript event listeners

#### 3. Runtime Bridge
Create a runtime that bridges WebSharp objects to JavaScript DOM:
```javascript
// Generated runtime bridge
const WebSharpDOM = {
    createElement: function(type, tagName) {
        const element = document.createElement(tagName);
        return new WebSharpElement(element, type);
    },
    
    WebSharpElement: class {
        constructor(domElement, type) {
            this._dom = domElement;
            this._type = type;
        }
        
        get TextContent() { return this._dom.textContent; }
        set TextContent(value) { this._dom.textContent = value; }
        
        get Style() { return new WebSharpCSSStyleDeclaration(this._dom.style); }
        
        AppendChild(child) {
            this._dom.appendChild(child._dom);
        }
        
        AddEventListener(type, handler) {
            this._dom.addEventListener(type, handler);
        }
    }
};
```

### Benefits of This Approach

1. **🎯 Natural C# Feel**: DOM manipulation feels like working with .NET objects
2. **🔧 IntelliSense Support**: Full autocompletion for all DOM properties and methods  
3. **🛡️ Type Safety**: Compile-time checking for property names and types
4. **📚 Familiar API**: C# developers already know this style of object manipulation
5. **🚀 Better Productivity**: Less verbose than JS.Call() approach

This would make WebSharp feel like a true C# environment for web development!
