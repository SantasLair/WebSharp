/**
 * Abstract Syntax Tree node definitions for Web#
 */
export interface Position {
    line: number;
    column: number;
}
export interface SourceLocation {
    start: Position;
    end: Position;
}
export declare abstract class ASTNode {
    readonly type: string;
    readonly location?: SourceLocation | undefined;
    constructor(type: string, location?: SourceLocation | undefined);
    abstract toJSON(): Record<string, any>;
}
export declare class TypeNode extends ASTNode {
    readonly name: string;
    readonly isNullable: boolean;
    readonly genericArguments: TypeNode[];
    constructor(name: string, isNullable?: boolean, genericArguments?: TypeNode[], location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare enum AccessModifier {
    Public = "public",
    Private = "private",
    Protected = "protected",
    Internal = "internal"
}
export declare abstract class ExpressionNode extends ASTNode {
    constructor(type: string, location?: SourceLocation);
}
export declare class IdentifierNode extends ExpressionNode {
    readonly name: string;
    constructor(name: string, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class LiteralNode extends ExpressionNode {
    readonly value: any;
    readonly literalType: 'string' | 'number' | 'boolean' | 'null';
    constructor(value: any, literalType: 'string' | 'number' | 'boolean' | 'null', location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare abstract class StatementNode extends ASTNode {
    constructor(type: string, location?: SourceLocation);
}
export declare class BlockStatementNode extends StatementNode {
    readonly statements: StatementNode[];
    constructor(statements: StatementNode[], location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class ParameterNode extends ASTNode {
    readonly name: string;
    readonly parameterType: TypeNode;
    readonly defaultValue?: ExpressionNode | undefined;
    constructor(name: string, parameterType: TypeNode, defaultValue?: ExpressionNode | undefined, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class MethodNode extends ASTNode {
    readonly name: string;
    readonly returnType: TypeNode;
    readonly parameters: ParameterNode[];
    readonly body: BlockStatementNode | null;
    readonly accessModifier: AccessModifier;
    readonly isStatic: boolean;
    readonly isVirtual: boolean;
    readonly isOverride: boolean;
    readonly isAbstract: boolean;
    constructor(name: string, returnType: TypeNode, parameters: ParameterNode[], body: BlockStatementNode | null, accessModifier?: AccessModifier, isStatic?: boolean, isVirtual?: boolean, isOverride?: boolean, isAbstract?: boolean, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class PropertyNode extends ASTNode {
    readonly name: string;
    readonly propertyType: TypeNode;
    readonly hasGetter: boolean;
    readonly hasSetter: boolean;
    readonly accessModifier: AccessModifier;
    readonly isStatic: boolean;
    constructor(name: string, propertyType: TypeNode, hasGetter?: boolean, hasSetter?: boolean, accessModifier?: AccessModifier, isStatic?: boolean, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class FieldNode extends ASTNode {
    readonly name: string;
    readonly fieldType: TypeNode;
    readonly initializer?: ExpressionNode | undefined;
    readonly accessModifier: AccessModifier;
    readonly isStatic: boolean;
    constructor(name: string, fieldType: TypeNode, initializer?: ExpressionNode | undefined, accessModifier?: AccessModifier, isStatic?: boolean, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class ConstructorNode extends ASTNode {
    readonly parameters: ParameterNode[];
    readonly body: BlockStatementNode;
    readonly accessModifier: AccessModifier;
    constructor(parameters: ParameterNode[], body: BlockStatementNode, accessModifier?: AccessModifier, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class ClassNode extends ASTNode {
    readonly name: string;
    readonly members: (MethodNode | PropertyNode | FieldNode | ConstructorNode)[];
    readonly baseClass?: string | undefined;
    readonly interfaces: string[];
    readonly accessModifier: AccessModifier;
    readonly isStatic: boolean;
    readonly isAbstract: boolean;
    constructor(name: string, members: (MethodNode | PropertyNode | FieldNode | ConstructorNode)[], baseClass?: string | undefined, interfaces?: string[], accessModifier?: AccessModifier, isStatic?: boolean, isAbstract?: boolean, location?: SourceLocation);
    toJSON(): Record<string, any>;
}
export declare class CompilationUnitNode extends ASTNode {
    readonly classes: ClassNode[];
    readonly usings: string[];
    constructor(classes: ClassNode[], usings?: string[], location?: SourceLocation);
    toJSON(): Record<string, any>;
}
