// External WebSharp file for demonstration
public class ExternalDemo {
    public static void CreateWelcomeMessage() {
        var container = new HTMLDivElement();
        container.Style.Border = "3px solid #ff6b6b";
        container.Style.BorderRadius = "15px";
        container.Style.Padding = "20px";
        container.Style.Margin = "20px 0";
        container.Style.BackgroundColor = "#ffe0e0";
        container.Style.TextAlign = "center";
        
        var title = new HTMLDivElement();
        title.TextContent = "🎉 Loaded from External .ws File!";
        title.Style.FontSize = "24px";
        title.Style.FontWeight = "bold";
        title.Style.Color = "#c92a2a";
        title.Style.MarginBottom = "10px";
        
        var description = new HTMLDivElement();
        description.TextContent = "This WebSharp code was loaded from external-demo.ws";
        description.Style.FontSize = "16px";
        description.Style.Color = "#495057";
        
        var timestamp = new HTMLDivElement();
        timestamp.TextContent = "Compiled and executed at: " + new Date().ToString();
        timestamp.Style.FontSize = "12px";
        timestamp.Style.Color = "#6c757d";
        timestamp.Style.MarginTop = "10px";
        timestamp.Style.FontStyle = "italic";
        
        container.AppendChild(title);
        container.AppendChild(description);
        container.AppendChild(timestamp);
        
        Document.Body.AppendChild(container);
        
        Console.WriteLine("📁 External WebSharp file loaded and executed successfully!");
    }
}

// Auto-execute when loaded
ExternalDemo.CreateWelcomeMessage();
