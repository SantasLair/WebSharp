public class ButtonDemo {
    public static void Main() {
        var button = JS.Call("document.createElement", "button");
        JS.Set(button, "textContent", "Click me from Web#!");
        JS.Call("document.body.appendChild", button);
    }
}

public class InteractiveApp {
    public static void CreateWelcomeMessage() {
        var div = JS.Call("document.createElement", "div");
        JS.Set(div, "innerHTML", "<h1>Hello from Web#!</h1><p>This DOM was created using Web# code.</p>");
        JS.Set(div, "style", "background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 10px;");
        
        JS.Call("document.body.appendChild", div);
    }
    
    public static void CreateList() {
        var ul = JS.Call("document.createElement", "ul");
        
        var li1 = JS.Call("document.createElement", "li");
        var li2 = JS.Call("document.createElement", "li");
        var li3 = JS.Call("document.createElement", "li");
        
        JS.Set(li1, "textContent", "Web# compiles to JavaScript");
        JS.Set(li2, "textContent", "JS.Call() lets you call any JavaScript function");
        JS.Set(li3, "textContent", "JS.Set() lets you set properties on JS objects");
        
        JS.Call("ul.appendChild", li1);
        JS.Call("ul.appendChild", li2);
        JS.Call("ul.appendChild", li3);
        
        JS.Call("document.body.appendChild", ul);
    }
}
