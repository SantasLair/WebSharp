/**
 * Abstract Syntax Tree node definitions for Web#
 */
export class ASTNode {
    type;
    location;
    constructor(type, location) {
        this.type = type;
        this.location = location;
    }
}
// Type nodes
export class TypeNode extends ASTNode {
    name;
    isNullable;
    genericArguments;
    constructor(name, isNullable = false, genericArguments = [], location) {
        super('Type', location);
        this.name = name;
        this.isNullable = isNullable;
        this.genericArguments = genericArguments;
    }
    toJSON() {
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
export var AccessModifier;
(function (AccessModifier) {
    AccessModifier["Public"] = "public";
    AccessModifier["Private"] = "private";
    AccessModifier["Protected"] = "protected";
    AccessModifier["Internal"] = "internal";
})(AccessModifier || (AccessModifier = {}));
// Expression nodes
export class ExpressionNode extends ASTNode {
    constructor(type, location) {
        super(type, location);
    }
}
export class IdentifierNode extends ExpressionNode {
    name;
    constructor(name, location) {
        super('Identifier', location);
        this.name = name;
    }
    toJSON() {
        return {
            type: this.type,
            name: this.name,
            location: this.location
        };
    }
}
export class LiteralNode extends ExpressionNode {
    value;
    literalType;
    constructor(value, literalType, location) {
        super('Literal', location);
        this.value = value;
        this.literalType = literalType;
    }
    toJSON() {
        return {
            type: this.type,
            value: this.value,
            literalType: this.literalType,
            location: this.location
        };
    }
}
// Statement nodes
export class StatementNode extends ASTNode {
    constructor(type, location) {
        super(type, location);
    }
}
export class BlockStatementNode extends StatementNode {
    statements;
    constructor(statements, location) {
        super('BlockStatement', location);
        this.statements = statements;
    }
    toJSON() {
        return {
            type: this.type,
            statements: this.statements.map(stmt => stmt.toJSON()),
            location: this.location
        };
    }
}
// Member nodes
export class ParameterNode extends ASTNode {
    name;
    parameterType;
    defaultValue;
    constructor(name, parameterType, defaultValue, location) {
        super('Parameter', location);
        this.name = name;
        this.parameterType = parameterType;
        this.defaultValue = defaultValue;
    }
    toJSON() {
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
    name;
    returnType;
    parameters;
    body;
    accessModifier;
    isStatic;
    isVirtual;
    isOverride;
    isAbstract;
    constructor(name, returnType, parameters, body, accessModifier = AccessModifier.Public, isStatic = false, isVirtual = false, isOverride = false, isAbstract = false, location) {
        super('Method', location);
        this.name = name;
        this.returnType = returnType;
        this.parameters = parameters;
        this.body = body;
        this.accessModifier = accessModifier;
        this.isStatic = isStatic;
        this.isVirtual = isVirtual;
        this.isOverride = isOverride;
        this.isAbstract = isAbstract;
    }
    toJSON() {
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
    name;
    propertyType;
    hasGetter;
    hasSetter;
    accessModifier;
    isStatic;
    constructor(name, propertyType, hasGetter = true, hasSetter = true, accessModifier = AccessModifier.Public, isStatic = false, location) {
        super('Property', location);
        this.name = name;
        this.propertyType = propertyType;
        this.hasGetter = hasGetter;
        this.hasSetter = hasSetter;
        this.accessModifier = accessModifier;
        this.isStatic = isStatic;
    }
    toJSON() {
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
    name;
    fieldType;
    initializer;
    accessModifier;
    isStatic;
    constructor(name, fieldType, initializer, accessModifier = AccessModifier.Public, isStatic = false, location) {
        super('Field', location);
        this.name = name;
        this.fieldType = fieldType;
        this.initializer = initializer;
        this.accessModifier = accessModifier;
        this.isStatic = isStatic;
    }
    toJSON() {
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
    parameters;
    body;
    accessModifier;
    constructor(parameters, body, accessModifier = AccessModifier.Public, location) {
        super('Constructor', location);
        this.parameters = parameters;
        this.body = body;
        this.accessModifier = accessModifier;
    }
    toJSON() {
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
    name;
    members;
    baseClass;
    interfaces;
    accessModifier;
    isStatic;
    isAbstract;
    constructor(name, members, baseClass, interfaces = [], accessModifier = AccessModifier.Public, isStatic = false, isAbstract = false, location) {
        super('Class', location);
        this.name = name;
        this.members = members;
        this.baseClass = baseClass;
        this.interfaces = interfaces;
        this.accessModifier = accessModifier;
        this.isStatic = isStatic;
        this.isAbstract = isAbstract;
    }
    toJSON() {
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
    classes;
    usings;
    constructor(classes, usings = [], location) {
        super('CompilationUnit', location);
        this.classes = classes;
        this.usings = usings;
    }
    toJSON() {
        return {
            type: this.type,
            classes: this.classes.map(cls => cls.toJSON()),
            usings: this.usings,
            location: this.location
        };
    }
}
