/**
 * Token definitions for Web# lexer
 */
export var TokenType;
(function (TokenType) {
    // Literals
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["BOOLEAN"] = "BOOLEAN";
    TokenType["NULL"] = "NULL";
    // Identifiers
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    // Keywords
    TokenType["CLASS"] = "CLASS";
    TokenType["PUBLIC"] = "PUBLIC";
    TokenType["PRIVATE"] = "PRIVATE";
    TokenType["PROTECTED"] = "PROTECTED";
    TokenType["INTERNAL"] = "INTERNAL";
    TokenType["STATIC"] = "STATIC";
    TokenType["VIRTUAL"] = "VIRTUAL";
    TokenType["OVERRIDE"] = "OVERRIDE";
    TokenType["ABSTRACT"] = "ABSTRACT";
    TokenType["GET"] = "GET";
    TokenType["SET"] = "SET";
    TokenType["NEW"] = "NEW";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["WHILE"] = "WHILE";
    TokenType["FOR"] = "FOR";
    TokenType["FOREACH"] = "FOREACH";
    TokenType["IN"] = "IN";
    TokenType["RETURN"] = "RETURN";
    TokenType["TRY"] = "TRY";
    TokenType["CATCH"] = "CATCH";
    TokenType["FINALLY"] = "FINALLY";
    TokenType["THROW"] = "THROW";
    TokenType["USING"] = "USING";
    TokenType["NAMESPACE"] = "NAMESPACE";
    TokenType["INTERFACE"] = "INTERFACE";
    TokenType["VAR"] = "VAR";
    TokenType["CONST"] = "CONST";
    TokenType["ASYNC"] = "ASYNC";
    TokenType["AWAIT"] = "AWAIT";
    TokenType["TASK"] = "TASK";
    // Types
    TokenType["INT"] = "INT";
    TokenType["DOUBLE"] = "DOUBLE";
    TokenType["STRING_TYPE"] = "STRING_TYPE";
    TokenType["BOOL"] = "BOOL";
    TokenType["OBJECT"] = "OBJECT";
    TokenType["DYNAMIC"] = "DYNAMIC";
    TokenType["VOID"] = "VOID";
    // Operators
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["MULTIPLY"] = "MULTIPLY";
    TokenType["DIVIDE"] = "DIVIDE";
    TokenType["MODULO"] = "MODULO";
    TokenType["ASSIGN"] = "ASSIGN";
    TokenType["PLUS_ASSIGN"] = "PLUS_ASSIGN";
    TokenType["MINUS_ASSIGN"] = "MINUS_ASSIGN";
    TokenType["MULTIPLY_ASSIGN"] = "MULTIPLY_ASSIGN";
    TokenType["DIVIDE_ASSIGN"] = "DIVIDE_ASSIGN";
    TokenType["INCREMENT"] = "INCREMENT";
    TokenType["DECREMENT"] = "DECREMENT";
    // Comparison
    TokenType["EQUAL"] = "EQUAL";
    TokenType["NOT_EQUAL"] = "NOT_EQUAL";
    TokenType["LESS_THAN"] = "LESS_THAN";
    TokenType["GREATER_THAN"] = "GREATER_THAN";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    // Logical
    TokenType["AND"] = "AND";
    TokenType["OR"] = "OR";
    TokenType["NOT"] = "NOT";
    // Null operators
    TokenType["NULL_COALESCING"] = "NULL_COALESCING";
    TokenType["NULL_CONDITIONAL"] = "NULL_CONDITIONAL";
    // Punctuation
    TokenType["SEMICOLON"] = "SEMICOLON";
    TokenType["COMMA"] = "COMMA";
    TokenType["DOT"] = "DOT";
    TokenType["COLON"] = "COLON";
    TokenType["QUESTION"] = "QUESTION";
    // Brackets
    TokenType["LEFT_PAREN"] = "LEFT_PAREN";
    TokenType["RIGHT_PAREN"] = "RIGHT_PAREN";
    TokenType["LEFT_BRACE"] = "LEFT_BRACE";
    TokenType["RIGHT_BRACE"] = "RIGHT_BRACE";
    TokenType["LEFT_BRACKET"] = "LEFT_BRACKET";
    TokenType["RIGHT_BRACKET"] = "RIGHT_BRACKET";
    TokenType["LEFT_ANGLE"] = "LEFT_ANGLE";
    TokenType["RIGHT_ANGLE"] = "RIGHT_ANGLE";
    // Special
    TokenType["ARROW"] = "ARROW";
    TokenType["EOF"] = "EOF";
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["WHITESPACE"] = "WHITESPACE";
    // Error
    TokenType["UNKNOWN"] = "UNKNOWN";
})(TokenType || (TokenType = {}));
export const KEYWORDS = {
    'class': TokenType.CLASS,
    'public': TokenType.PUBLIC,
    'private': TokenType.PRIVATE,
    'protected': TokenType.PROTECTED,
    'internal': TokenType.INTERNAL,
    'static': TokenType.STATIC,
    'virtual': TokenType.VIRTUAL,
    'override': TokenType.OVERRIDE,
    'abstract': TokenType.ABSTRACT,
    'get': TokenType.GET,
    'set': TokenType.SET,
    'new': TokenType.NEW,
    'if': TokenType.IF,
    'else': TokenType.ELSE,
    'while': TokenType.WHILE,
    'for': TokenType.FOR,
    'foreach': TokenType.FOREACH,
    'in': TokenType.IN,
    'return': TokenType.RETURN,
    'try': TokenType.TRY,
    'catch': TokenType.CATCH,
    'finally': TokenType.FINALLY,
    'throw': TokenType.THROW,
    'using': TokenType.USING,
    'namespace': TokenType.NAMESPACE,
    'interface': TokenType.INTERFACE,
    'var': TokenType.VAR,
    'const': TokenType.CONST,
    'async': TokenType.ASYNC,
    'await': TokenType.AWAIT,
    'Task': TokenType.TASK,
    // Types
    'int': TokenType.INT,
    'double': TokenType.DOUBLE,
    'string': TokenType.STRING_TYPE,
    'bool': TokenType.BOOL,
    'object': TokenType.OBJECT,
    'dynamic': TokenType.DYNAMIC,
    'void': TokenType.VOID,
    // Literals
    'true': TokenType.BOOLEAN,
    'false': TokenType.BOOLEAN,
    'null': TokenType.NULL,
};
