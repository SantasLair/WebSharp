import { WebSharpCompiler } from './src/index';

const compiler = new WebSharpCompiler();

const source = `
public class Test {
    public void Method() {
        Console.WriteLine("Hello");
    }
}
`;

try {
    const javascript = compiler.compileToJavaScript(source);
    console.log('Generated JavaScript:');
    console.log(javascript);
} catch (error) {
    console.error('Error:', error);
}
