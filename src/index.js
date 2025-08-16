"use strict";
/**
 * Main entry point for Web# compiler
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptGenerator = exports.SemanticError = exports.SemanticAnalyzer = exports.TokenType = exports.ParseError = exports.Parser = exports.Lexer = exports.WebSharpCompiler = void 0;
exports.main = main;
var lexer_1 = require("./lexer/lexer");
var parser_1 = require("./parser/parser");
var analyzer_1 = require("./semantic/analyzer");
var generator_1 = require("./codegen/generator");
var WebSharpCompiler = /** @class */ (function () {
    function WebSharpCompiler(options) {
        if (options === void 0) { options = {}; }
        this.semanticAnalyzer = new analyzer_1.SemanticAnalyzer();
        this.codeGenerator = new generator_1.JavaScriptGenerator(options);
    }
    WebSharpCompiler.prototype.compile = function (source) {
        // Phase 1: Lexical analysis
        var lexer = new lexer_1.Lexer(source);
        var tokens = lexer.tokenize();
        // Phase 2: Parsing
        var parser = new parser_1.Parser(tokens);
        var ast = parser.parse();
        return ast;
    };
    WebSharpCompiler.prototype.analyze = function (source) {
        // First compile to get the AST
        var ast = this.compile(source);
        // Then perform semantic analysis with original source
        return this.semanticAnalyzer.analyzeWithSource(ast, source);
    };
    WebSharpCompiler.prototype.compileToJson = function (source) {
        var ast = this.compile(source);
        return JSON.stringify(ast.toJSON(), null, 2);
    };
    WebSharpCompiler.prototype.compileToJavaScript = function (source) {
        var ast = this.compile(source);
        return this.codeGenerator.generate(ast);
    };
    WebSharpCompiler.prototype.compileWithAnalysis = function (source) {
        var ast = this.compile(source);
        var analysis = this.semanticAnalyzer.analyzeWithSource(ast, source);
        var javascript = this.codeGenerator.generate(ast);
        return { ast: ast, analysis: analysis, javascript: javascript };
    };
    return WebSharpCompiler;
}());
exports.WebSharpCompiler = WebSharpCompiler;
// Export main classes for external use
var lexer_2 = require("./lexer/lexer");
Object.defineProperty(exports, "Lexer", { enumerable: true, get: function () { return lexer_2.Lexer; } });
var parser_2 = require("./parser/parser");
Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return parser_2.Parser; } });
Object.defineProperty(exports, "ParseError", { enumerable: true, get: function () { return parser_2.ParseError; } });
var tokens_1 = require("./lexer/tokens");
Object.defineProperty(exports, "TokenType", { enumerable: true, get: function () { return tokens_1.TokenType; } });
__exportStar(require("./ast/nodes"), exports);
var analyzer_2 = require("./semantic/analyzer");
Object.defineProperty(exports, "SemanticAnalyzer", { enumerable: true, get: function () { return analyzer_2.SemanticAnalyzer; } });
Object.defineProperty(exports, "SemanticError", { enumerable: true, get: function () { return analyzer_2.SemanticError; } });
var generator_2 = require("./codegen/generator");
Object.defineProperty(exports, "JavaScriptGenerator", { enumerable: true, get: function () { return generator_2.JavaScriptGenerator; } });
// Main function for CLI usage
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var readFileSync, process, sourceFile, source, compiler, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('fs'); })];
                case 1:
                    readFileSync = (_a.sent()).readFileSync;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('process'); })];
                case 2:
                    process = _a.sent();
                    if (process.argv.length < 3) {
                        console.error('Usage: node dist/index.js <source-file>');
                        process.exit(1);
                    }
                    sourceFile = process.argv[2];
                    try {
                        source = readFileSync(sourceFile, 'utf8');
                        compiler = new WebSharpCompiler();
                        json = compiler.compileToJson(source);
                        console.log(json);
                    }
                    catch (error) {
                        console.error('Compilation error:', error);
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
