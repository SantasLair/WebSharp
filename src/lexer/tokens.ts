/**
 * Token definitions for Web# lexer
 */

export enum TokenType {
  // Literals
  STRING = 'STRING',
  NUMBER = 'NUMBER', 
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',

  // Identifiers
  IDENTIFIER = 'IDENTIFIER',

  // Keywords
  CLASS = 'CLASS',
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  INTERNAL = 'INTERNAL',
  STATIC = 'STATIC',
  VIRTUAL = 'VIRTUAL',
  OVERRIDE = 'OVERRIDE',
  ABSTRACT = 'ABSTRACT',
  GET = 'GET',
  SET = 'SET',
  NEW = 'NEW',
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  FOR = 'FOR',
  FOREACH = 'FOREACH',
  IN = 'IN',
  RETURN = 'RETURN',
  TRY = 'TRY',
  CATCH = 'CATCH',
  FINALLY = 'FINALLY',
  THROW = 'THROW',
  USING = 'USING',
  NAMESPACE = 'NAMESPACE',
  INTERFACE = 'INTERFACE',
  VAR = 'VAR',
  CONST = 'CONST',
  ASYNC = 'ASYNC',
  AWAIT = 'AWAIT',
  TASK = 'TASK',

  // Types
  INT = 'INT',
  DOUBLE = 'DOUBLE',
  STRING_TYPE = 'STRING_TYPE',
  BOOL = 'BOOL',
  OBJECT = 'OBJECT',
  DYNAMIC = 'DYNAMIC',
  VOID = 'VOID',

  // Operators
  PLUS = 'PLUS',              // +
  MINUS = 'MINUS',            // -
  MULTIPLY = 'MULTIPLY',      // *
  DIVIDE = 'DIVIDE',          // /
  MODULO = 'MODULO',          // %
  ASSIGN = 'ASSIGN',          // =
  PLUS_ASSIGN = 'PLUS_ASSIGN', // +=
  MINUS_ASSIGN = 'MINUS_ASSIGN', // -=
  MULTIPLY_ASSIGN = 'MULTIPLY_ASSIGN', // *=
  DIVIDE_ASSIGN = 'DIVIDE_ASSIGN', // /=
  INCREMENT = 'INCREMENT',    // ++
  DECREMENT = 'DECREMENT',    // --

  // Comparison
  EQUAL = 'EQUAL',            // ==
  NOT_EQUAL = 'NOT_EQUAL',    // !=
  LESS_THAN = 'LESS_THAN',    // <
  GREATER_THAN = 'GREATER_THAN', // >
  LESS_EQUAL = 'LESS_EQUAL',  // <=
  GREATER_EQUAL = 'GREATER_EQUAL', // >=

  // Logical
  AND = 'AND',                // &&
  OR = 'OR',                  // ||
  NOT = 'NOT',                // !

  // Null operators
  NULL_COALESCING = 'NULL_COALESCING', // ??
  NULL_CONDITIONAL = 'NULL_CONDITIONAL', // ?.

  // Punctuation
  SEMICOLON = 'SEMICOLON',    // ;
  COMMA = 'COMMA',            // ,
  DOT = 'DOT',                // .
  COLON = 'COLON',            // :
  QUESTION = 'QUESTION',      // ?

  // Brackets
  LEFT_PAREN = 'LEFT_PAREN',  // (
  RIGHT_PAREN = 'RIGHT_PAREN', // )
  LEFT_BRACE = 'LEFT_BRACE',  // {
  RIGHT_BRACE = 'RIGHT_BRACE', // }
  LEFT_BRACKET = 'LEFT_BRACKET', // [
  RIGHT_BRACKET = 'RIGHT_BRACKET', // ]
  LEFT_ANGLE = 'LEFT_ANGLE',  // < (for generics)
  RIGHT_ANGLE = 'RIGHT_ANGLE', // > (for generics)

  // Special
  ARROW = 'ARROW',            // =>
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
  WHITESPACE = 'WHITESPACE',

  // Error
  UNKNOWN = 'UNKNOWN'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

export const KEYWORDS: Record<string, TokenType> = {
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
