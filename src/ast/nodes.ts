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
