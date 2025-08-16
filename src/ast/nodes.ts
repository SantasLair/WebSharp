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

export abstract class ASTNode {
  constructor(
    public readonly type: string,
    public readonly location?: SourceLocation
  ) {}

  abstract toJSON(): Record<string, any>;
}

// Type nodes
export class TypeNode extends ASTNode {
  constructor(
    public readonly name: string,
    public readonly isNullable: boolean = false,
    public readonly genericArguments: TypeNode[] = [],
    location?: SourceLocation
  ) {
    super('Type', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      isNullable: this.isNullable,
      genericArguments: this.genericArguments.map(arg => arg.toJSON()),
      location: this.location
    };
  }
}

// Access modifier enum
export enum AccessModifier {
  Public = 'public',
  Private = 'private',
  Protected = 'protected',
  Internal = 'internal'
}

// Expression nodes
export abstract class ExpressionNode extends ASTNode {
  constructor(type: string, location?: SourceLocation) {
    super(type, location);
  }
}

export class IdentifierNode extends ExpressionNode {
  constructor(
    public readonly name: string,
    location?: SourceLocation
  ) {
    super('Identifier', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      location: this.location
    };
  }
}

export class LiteralNode extends ExpressionNode {
  constructor(
    public readonly value: any,
    public readonly literalType: 'string' | 'number' | 'boolean' | 'null',
    location?: SourceLocation
  ) {
    super('Literal', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      value: this.value,
      literalType: this.literalType,
      location: this.location
    };
  }
}

export class BinaryExpressionNode extends ExpressionNode {
  constructor(
    public readonly left: ExpressionNode,
    public readonly operator: string,
    public readonly right: ExpressionNode,
    location?: SourceLocation
  ) {
    super('BinaryExpression', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      left: this.left.toJSON(),
      operator: this.operator,
      right: this.right.toJSON(),
      location: this.location
    };
  }
}

export class AssignmentExpressionNode extends ExpressionNode {
  constructor(
    public readonly left: ExpressionNode,
    public readonly right: ExpressionNode,
    location?: SourceLocation
  ) {
    super('AssignmentExpression', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      left: this.left.toJSON(),
      right: this.right.toJSON(),
      location: this.location
    };
  }
}

export class CallExpressionNode extends ExpressionNode {
  constructor(
    public readonly callee: ExpressionNode,
    public readonly args: ExpressionNode[],
    location?: SourceLocation
  ) {
    super('CallExpression', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      callee: this.callee.toJSON(),
      arguments: this.args.map(arg => arg.toJSON()),
      location: this.location
    };
  }
}

export class MemberExpressionNode extends ExpressionNode {
  constructor(
    public readonly object: ExpressionNode,
    public readonly property: ExpressionNode,
    public readonly computed: boolean = false,
    location?: SourceLocation
  ) {
    super('MemberExpression', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      object: this.object.toJSON(),
      property: this.property.toJSON(),
      computed: this.computed,
      location: this.location
    };
  }
}

// Statement nodes
export abstract class StatementNode extends ASTNode {
  constructor(type: string, location?: SourceLocation) {
    super(type, location);
  }
}

export class BlockStatementNode extends StatementNode {
  constructor(
    public readonly statements: StatementNode[],
    location?: SourceLocation
  ) {
    super('BlockStatement', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      statements: this.statements.map(stmt => stmt.toJSON()),
      location: this.location
    };
  }
}

export class ExpressionStatementNode extends StatementNode {
  constructor(
    public readonly expression: ExpressionNode,
    location?: SourceLocation
  ) {
    super('ExpressionStatement', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      expression: this.expression.toJSON(),
      location: this.location
    };
  }
}

export class VariableDeclarationNode extends StatementNode {
  constructor(
    public readonly declarationType: TypeNode,
    public readonly name: string,
    public readonly initializer?: ExpressionNode,
    location?: SourceLocation
  ) {
    super('VariableDeclaration', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      declarationType: this.declarationType.toJSON(),
      name: this.name,
      initializer: this.initializer?.toJSON(),
      location: this.location
    };
  }
}

export class ReturnStatementNode extends StatementNode {
  constructor(
    public readonly argument?: ExpressionNode,
    location?: SourceLocation
  ) {
    super('ReturnStatement', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      argument: this.argument?.toJSON(),
      location: this.location
    };
  }
}

// Member nodes
export class ParameterNode extends ASTNode {
  constructor(
    public readonly name: string,
    public readonly parameterType: TypeNode,
    public readonly defaultValue?: ExpressionNode,
    location?: SourceLocation
  ) {
    super('Parameter', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      parameterType: this.parameterType.toJSON(),
      defaultValue: this.defaultValue?.toJSON(),
      location: this.location
    };
  }
}

export class MethodNode extends ASTNode {
  constructor(
    public readonly name: string,
    public readonly returnType: TypeNode,
    public readonly parameters: ParameterNode[],
    public readonly body: BlockStatementNode | null,
    public readonly accessModifier: AccessModifier = AccessModifier.Public,
    public readonly isStatic: boolean = false,
    public readonly isVirtual: boolean = false,
    public readonly isOverride: boolean = false,
    public readonly isAbstract: boolean = false,
    location?: SourceLocation
  ) {
    super('Method', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      returnType: this.returnType.toJSON(),
      parameters: this.parameters.map(param => param.toJSON()),
      body: this.body?.toJSON(),
      accessModifier: this.accessModifier,
      isStatic: this.isStatic,
      isVirtual: this.isVirtual,
      isOverride: this.isOverride,
      isAbstract: this.isAbstract,
      location: this.location
    };
  }
}

export class PropertyNode extends ASTNode {
  constructor(
    public readonly name: string,
    public readonly propertyType: TypeNode,
    public readonly hasGetter: boolean = true,
    public readonly hasSetter: boolean = true,
    public readonly accessModifier: AccessModifier = AccessModifier.Public,
    public readonly isStatic: boolean = false,
    location?: SourceLocation
  ) {
    super('Property', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      propertyType: this.propertyType.toJSON(),
      hasGetter: this.hasGetter,
      hasSetter: this.hasSetter,
      accessModifier: this.accessModifier,
      isStatic: this.isStatic,
      location: this.location
    };
  }
}

export class FieldNode extends ASTNode {
  constructor(
    public readonly name: string,
    public readonly fieldType: TypeNode,
    public readonly initializer?: ExpressionNode,
    public readonly accessModifier: AccessModifier = AccessModifier.Public,
    public readonly isStatic: boolean = false,
    location?: SourceLocation
  ) {
    super('Field', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      fieldType: this.fieldType.toJSON(),
      initializer: this.initializer?.toJSON(),
      accessModifier: this.accessModifier,
      isStatic: this.isStatic,
      location: this.location
    };
  }
}

export class ConstructorNode extends ASTNode {
  constructor(
    public readonly parameters: ParameterNode[],
    public readonly body: BlockStatementNode,
    public readonly accessModifier: AccessModifier = AccessModifier.Public,
    location?: SourceLocation
  ) {
    super('Constructor', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      parameters: this.parameters.map(param => param.toJSON()),
      body: this.body.toJSON(),
      accessModifier: this.accessModifier,
      location: this.location
    };
  }
}

// Class and compilation unit nodes
export class ClassNode extends ASTNode {
  constructor(
    public readonly name: string,
    public readonly members: (MethodNode | PropertyNode | FieldNode | ConstructorNode)[],
    public readonly baseClass?: string,
    public readonly interfaces: string[] = [],
    public readonly accessModifier: AccessModifier = AccessModifier.Public,
    public readonly isStatic: boolean = false,
    public readonly isAbstract: boolean = false,
    location?: SourceLocation
  ) {
    super('Class', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      name: this.name,
      members: this.members.map(member => member.toJSON()),
      baseClass: this.baseClass,
      interfaces: this.interfaces,
      accessModifier: this.accessModifier,
      isStatic: this.isStatic,
      isAbstract: this.isAbstract,
      location: this.location
    };
  }
}

export class CompilationUnitNode extends ASTNode {
  constructor(
    public readonly classes: ClassNode[],
    public readonly usings: string[] = [],
    location?: SourceLocation
  ) {
    super('CompilationUnit', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      classes: this.classes.map(cls => cls.toJSON()),
      usings: this.usings,
      location: this.location
    };
  }
}

// JavaScript Interop Expression Nodes
export class JSCallExpressionNode extends ExpressionNode {
  constructor(
    public readonly methodPath: string,
    public readonly args: ExpressionNode[],
    location?: SourceLocation
  ) {
    super('JSCallExpression', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      methodPath: this.methodPath,
      arguments: this.args.map(arg => arg.toJSON()),
      location: this.location
    };
  }
}

export class JSSetExpressionNode extends ExpressionNode {
  constructor(
    public readonly object: ExpressionNode,
    public readonly property: ExpressionNode,
    public readonly value: ExpressionNode,
    location?: SourceLocation
  ) {
    super('JSSetExpression', location);
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      object: this.object.toJSON(),
      property: this.property.toJSON(),
      value: this.value.toJSON(),
      location: this.location
    };
  }
}
