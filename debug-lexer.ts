import { Lexer } from './src/lexer/lexer';

const code = `
public class Test {
  private int field = 10;
}
`;

console.log('Tokenizing simple field declaration...');
const lexer = new Lexer(code);
const tokens = lexer.tokenize();

tokens.forEach((token, i) => {
  console.log(`${i}: ${token.type} = "${token.value}" at line ${token.line}, col ${token.column}`);
});
