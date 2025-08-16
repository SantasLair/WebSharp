"use strict";
/**
 * Abstract Syntax Tree node definitions for Web#
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMMethodCallNode = exports.DOMPropertyAccessNode = exports.DOMConstructorNode = exports.JSSetExpressionNode = exports.JSCallExpressionNode = exports.CompilationUnitNode = exports.ClassNode = exports.ConstructorNode = exports.FieldNode = exports.PropertyNode = exports.MethodNode = exports.ParameterNode = exports.ReturnStatementNode = exports.VariableDeclarationNode = exports.ExpressionStatementNode = exports.BlockStatementNode = exports.StatementNode = exports.MemberExpressionNode = exports.CallExpressionNode = exports.AssignmentExpressionNode = exports.BinaryExpressionNode = exports.LiteralNode = exports.IdentifierNode = exports.ExpressionNode = exports.AccessModifier = exports.TypeNode = exports.ASTNode = void 0;
var ASTNode = /** @class */ (function () {
    function ASTNode(type, location) {
        this.type = type;
        this.location = location;
    }
    return ASTNode;
}());
exports.ASTNode = ASTNode;
// Type nodes
var TypeNode = /** @class */ (function (_super) {
    __extends(TypeNode, _super);
    function TypeNode(name, isNullable, genericArguments, location) {
        if (isNullable === void 0) { isNullable = false; }
        if (genericArguments === void 0) { genericArguments = []; }
        var _this = _super.call(this, 'Type', location) || this;
        _this.name = name;
        _this.isNullable = isNullable;
        _this.genericArguments = genericArguments;
        return _this;
    }
    TypeNode.prototype.toJSON = function () {
        return {
            type: this.type,
            name: this.name,
            isNullable: this.isNullable,
            genericArguments: this.genericArguments.map(function (arg) { return arg.toJSON(); }),
            location: this.location
        };
    };
    return TypeNode;
}(ASTNode));
exports.TypeNode = TypeNode;
// Access modifier enum
var AccessModifier;
(function (AccessModifier) {
    AccessModifier["Public"] = "public";
    AccessModifier["Private"] = "private";
    AccessModifier["Protected"] = "protected";
    AccessModifier["Internal"] = "internal";
})(AccessModifier || (exports.AccessModifier = AccessModifier = {}));
// Expression nodes
var ExpressionNode = /** @class */ (function (_super) {
    __extends(ExpressionNode, _super);
    function ExpressionNode(type, location) {
        return _super.call(this, type, location) || this;
    }
    return ExpressionNode;
}(ASTNode));
exports.ExpressionNode = ExpressionNode;
var IdentifierNode = /** @class */ (function (_super) {
    __extends(IdentifierNode, _super);
    function IdentifierNode(name, location) {
        var _this = _super.call(this, 'Identifier', location) || this;
        _this.name = name;
        return _this;
    }
    IdentifierNode.prototype.toJSON = function () {
        return {
            type: this.type,
            name: this.name,
            location: this.location
        };
    };
    return IdentifierNode;
}(ExpressionNode));
exports.IdentifierNode = IdentifierNode;
var LiteralNode = /** @class */ (function (_super) {
    __extends(LiteralNode, _super);
    function LiteralNode(value, literalType, location) {
        var _this = _super.call(this, 'Literal', location) || this;
        _this.value = value;
        _this.literalType = literalType;
        return _this;
    }
    LiteralNode.prototype.toJSON = function () {
        return {
            type: this.type,
            value: this.value,
            literalType: this.literalType,
            location: this.location
        };
    };
    return LiteralNode;
}(ExpressionNode));
exports.LiteralNode = LiteralNode;
var BinaryExpressionNode = /** @class */ (function (_super) {
    __extends(BinaryExpressionNode, _super);
    function BinaryExpressionNode(left, operator, right, location) {
        var _this = _super.call(this, 'BinaryExpression', location) || this;
        _this.left = left;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    BinaryExpressionNode.prototype.toJSON = function () {
        return {
            type: this.type,
            left: this.left.toJSON(),
            operator: this.operator,
            right: this.right.toJSON(),
            location: this.location
        };
    };
    return BinaryExpressionNode;
}(ExpressionNode));
exports.BinaryExpressionNode = BinaryExpressionNode;
var AssignmentExpressionNode = /** @class */ (function (_super) {
    __extends(AssignmentExpressionNode, _super);
    function AssignmentExpressionNode(left, right, location) {
        var _this = _super.call(this, 'AssignmentExpression', location) || this;
        _this.left = left;
        _this.right = right;
        return _this;
    }
    AssignmentExpressionNode.prototype.toJSON = function () {
        return {
            type: this.type,
            left: this.left.toJSON(),
            right: this.right.toJSON(),
            location: this.location
        };
    };
    return AssignmentExpressionNode;
}(ExpressionNode));
exports.AssignmentExpressionNode = AssignmentExpressionNode;
var CallExpressionNode = /** @class */ (function (_super) {
    __extends(CallExpressionNode, _super);
    function CallExpressionNode(callee, args, location) {
        var _this = _super.call(this, 'CallExpression', location) || this;
        _this.callee = callee;
        _this.args = args;
        return _this;
    }
    CallExpressionNode.prototype.toJSON = function () {
        return {
            type: this.type,
            callee: this.callee.toJSON(),
            arguments: this.args.map(function (arg) { return arg.toJSON(); }),
            location: this.location
        };
    };
    return CallExpressionNode;
}(ExpressionNode));
exports.CallExpressionNode = CallExpressionNode;
var MemberExpressionNode = /** @class */ (function (_super) {
    __extends(MemberExpressionNode, _super);
    function MemberExpressionNode(object, property, computed, location) {
        if (computed === void 0) { computed = false; }
        var _this = _super.call(this, 'MemberExpression', location) || this;
        _this.object = object;
        _this.property = property;
        _this.computed = computed;
        return _this;
    }
    MemberExpressionNode.prototype.toJSON = function () {
        return {
            type: this.type,
            object: this.object.toJSON(),
            property: this.property.toJSON(),
            computed: this.computed,
            location: this.location
        };
    };
    return MemberExpressionNode;
}(ExpressionNode));
exports.MemberExpressionNode = MemberExpressionNode;
// Statement nodes
var StatementNode = /** @class */ (function (_super) {
    __extends(StatementNode, _super);
    function StatementNode(type, location) {
        return _super.call(this, type, location) || this;
    }
    return StatementNode;
}(ASTNode));
exports.StatementNode = StatementNode;
var BlockStatementNode = /** @class */ (function (_super) {
    __extends(BlockStatementNode, _super);
    function BlockStatementNode(statements, location) {
        var _this = _super.call(this, 'BlockStatement', location) || this;
        _this.statements = statements;
        return _this;
    }
    BlockStatementNode.prototype.toJSON = function () {
        return {
            type: this.type,
            statements: this.statements.map(function (stmt) { return stmt.toJSON(); }),
            location: this.location
        };
    };
    return BlockStatementNode;
}(StatementNode));
exports.BlockStatementNode = BlockStatementNode;
var ExpressionStatementNode = /** @class */ (function (_super) {
    __extends(ExpressionStatementNode, _super);
    function ExpressionStatementNode(expression, location) {
        var _this = _super.call(this, 'ExpressionStatement', location) || this;
        _this.expression = expression;
        return _this;
    }
    ExpressionStatementNode.prototype.toJSON = function () {
        return {
            type: this.type,
            expression: this.expression.toJSON(),
            location: this.location
        };
    };
    return ExpressionStatementNode;
}(StatementNode));
exports.ExpressionStatementNode = ExpressionStatementNode;
var VariableDeclarationNode = /** @class */ (function (_super) {
    __extends(VariableDeclarationNode, _super);
    function VariableDeclarationNode(declarationType, name, initializer, location) {
        var _this = _super.call(this, 'VariableDeclaration', location) || this;
        _this.declarationType = declarationType;
        _this.name = name;
        _this.initializer = initializer;
        return _this;
    }
    VariableDeclarationNode.prototype.toJSON = function () {
        var _a;
        return {
            type: this.type,
            declarationType: this.declarationType.toJSON(),
            name: this.name,
            initializer: (_a = this.initializer) === null || _a === void 0 ? void 0 : _a.toJSON(),
            location: this.location
        };
    };
    return VariableDeclarationNode;
}(StatementNode));
exports.VariableDeclarationNode = VariableDeclarationNode;
var ReturnStatementNode = /** @class */ (function (_super) {
    __extends(ReturnStatementNode, _super);
    function ReturnStatementNode(argument, location) {
        var _this = _super.call(this, 'ReturnStatement', location) || this;
        _this.argument = argument;
        return _this;
    }
    ReturnStatementNode.prototype.toJSON = function () {
        var _a;
        return {
            type: this.type,
            argument: (_a = this.argument) === null || _a === void 0 ? void 0 : _a.toJSON(),
            location: this.location
        };
    };
    return ReturnStatementNode;
}(StatementNode));
exports.ReturnStatementNode = ReturnStatementNode;
// Member nodes
var ParameterNode = /** @class */ (function (_super) {
    __extends(ParameterNode, _super);
    function ParameterNode(name, parameterType, defaultValue, location) {
        var _this = _super.call(this, 'Parameter', location) || this;
        _this.name = name;
        _this.parameterType = parameterType;
        _this.defaultValue = defaultValue;
        return _this;
    }
    ParameterNode.prototype.toJSON = function () {
        var _a;
        return {
            type: this.type,
            name: this.name,
            parameterType: this.parameterType.toJSON(),
            defaultValue: (_a = this.defaultValue) === null || _a === void 0 ? void 0 : _a.toJSON(),
            location: this.location
        };
    };
    return ParameterNode;
}(ASTNode));
exports.ParameterNode = ParameterNode;
var MethodNode = /** @class */ (function (_super) {
    __extends(MethodNode, _super);
    function MethodNode(name, returnType, parameters, body, accessModifier, isStatic, isVirtual, isOverride, isAbstract, location) {
        if (accessModifier === void 0) { accessModifier = AccessModifier.Public; }
        if (isStatic === void 0) { isStatic = false; }
        if (isVirtual === void 0) { isVirtual = false; }
        if (isOverride === void 0) { isOverride = false; }
        if (isAbstract === void 0) { isAbstract = false; }
        var _this = _super.call(this, 'Method', location) || this;
        _this.name = name;
        _this.returnType = returnType;
        _this.parameters = parameters;
        _this.body = body;
        _this.accessModifier = accessModifier;
        _this.isStatic = isStatic;
        _this.isVirtual = isVirtual;
        _this.isOverride = isOverride;
        _this.isAbstract = isAbstract;
        return _this;
    }
    MethodNode.prototype.toJSON = function () {
        var _a;
        return {
            type: this.type,
            name: this.name,
            returnType: this.returnType.toJSON(),
            parameters: this.parameters.map(function (param) { return param.toJSON(); }),
            body: (_a = this.body) === null || _a === void 0 ? void 0 : _a.toJSON(),
            accessModifier: this.accessModifier,
            isStatic: this.isStatic,
            isVirtual: this.isVirtual,
            isOverride: this.isOverride,
            isAbstract: this.isAbstract,
            location: this.location
        };
    };
    return MethodNode;
}(ASTNode));
exports.MethodNode = MethodNode;
var PropertyNode = /** @class */ (function (_super) {
    __extends(PropertyNode, _super);
    function PropertyNode(name, propertyType, hasGetter, hasSetter, accessModifier, isStatic, location) {
        if (hasGetter === void 0) { hasGetter = true; }
        if (hasSetter === void 0) { hasSetter = true; }
        if (accessModifier === void 0) { accessModifier = AccessModifier.Public; }
        if (isStatic === void 0) { isStatic = false; }
        var _this = _super.call(this, 'Property', location) || this;
        _this.name = name;
        _this.propertyType = propertyType;
        _this.hasGetter = hasGetter;
        _this.hasSetter = hasSetter;
        _this.accessModifier = accessModifier;
        _this.isStatic = isStatic;
        return _this;
    }
    PropertyNode.prototype.toJSON = function () {
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
    };
    return PropertyNode;
}(ASTNode));
exports.PropertyNode = PropertyNode;
var FieldNode = /** @class */ (function (_super) {
    __extends(FieldNode, _super);
    function FieldNode(name, fieldType, initializer, accessModifier, isStatic, location) {
        if (accessModifier === void 0) { accessModifier = AccessModifier.Public; }
        if (isStatic === void 0) { isStatic = false; }
        var _this = _super.call(this, 'Field', location) || this;
        _this.name = name;
        _this.fieldType = fieldType;
        _this.initializer = initializer;
        _this.accessModifier = accessModifier;
        _this.isStatic = isStatic;
        return _this;
    }
    FieldNode.prototype.toJSON = function () {
        var _a;
        return {
            type: this.type,
            name: this.name,
            fieldType: this.fieldType.toJSON(),
            initializer: (_a = this.initializer) === null || _a === void 0 ? void 0 : _a.toJSON(),
            accessModifier: this.accessModifier,
            isStatic: this.isStatic,
            location: this.location
        };
    };
    return FieldNode;
}(ASTNode));
exports.FieldNode = FieldNode;
var ConstructorNode = /** @class */ (function (_super) {
    __extends(ConstructorNode, _super);
    function ConstructorNode(parameters, body, accessModifier, location) {
        if (accessModifier === void 0) { accessModifier = AccessModifier.Public; }
        var _this = _super.call(this, 'Constructor', location) || this;
        _this.parameters = parameters;
        _this.body = body;
        _this.accessModifier = accessModifier;
        return _this;
    }
    ConstructorNode.prototype.toJSON = function () {
        return {
            type: this.type,
            parameters: this.parameters.map(function (param) { return param.toJSON(); }),
            body: this.body.toJSON(),
            accessModifier: this.accessModifier,
            location: this.location
        };
    };
    return ConstructorNode;
}(ASTNode));
exports.ConstructorNode = ConstructorNode;
// Class and compilation unit nodes
var ClassNode = /** @class */ (function (_super) {
    __extends(ClassNode, _super);
    function ClassNode(name, members, baseClass, interfaces, accessModifier, isStatic, isAbstract, location) {
        if (interfaces === void 0) { interfaces = []; }
        if (accessModifier === void 0) { accessModifier = AccessModifier.Public; }
        if (isStatic === void 0) { isStatic = false; }
        if (isAbstract === void 0) { isAbstract = false; }
        var _this = _super.call(this, 'Class', location) || this;
        _this.name = name;
        _this.members = members;
        _this.baseClass = baseClass;
        _this.interfaces = interfaces;
        _this.accessModifier = accessModifier;
        _this.isStatic = isStatic;
        _this.isAbstract = isAbstract;
        return _this;
    }
    ClassNode.prototype.toJSON = function () {
        return {
            type: this.type,
            name: this.name,
            members: this.members.map(function (member) { return member.toJSON(); }),
            baseClass: this.baseClass,
            interfaces: this.interfaces,
            accessModifier: this.accessModifier,
            isStatic: this.isStatic,
            isAbstract: this.isAbstract,
            location: this.location
        };
    };
    return ClassNode;
}(ASTNode));
exports.ClassNode = ClassNode;
var CompilationUnitNode = /** @class */ (function (_super) {
    __extends(CompilationUnitNode, _super);
    function CompilationUnitNode(classes, usings, location) {
        if (usings === void 0) { usings = []; }
        var _this = _super.call(this, 'CompilationUnit', location) || this;
        _this.classes = classes;
        _this.usings = usings;
        return _this;
    }
    CompilationUnitNode.prototype.toJSON = function () {
        return {
            type: this.type,
            classes: this.classes.map(function (cls) { return cls.toJSON(); }),
            usings: this.usings,
            location: this.location
        };
    };
    return CompilationUnitNode;
}(ASTNode));
exports.CompilationUnitNode = CompilationUnitNode;
// JavaScript Interop Expression Nodes
var JSCallExpressionNode = /** @class */ (function (_super) {
    __extends(JSCallExpressionNode, _super);
    function JSCallExpressionNode(methodPath, args, location) {
        var _this = _super.call(this, 'JSCallExpression', location) || this;
        _this.methodPath = methodPath;
        _this.args = args;
        return _this;
    }
    JSCallExpressionNode.prototype.toJSON = function () {
        return {
            type: this.type,
            methodPath: this.methodPath,
            arguments: this.args.map(function (arg) { return arg.toJSON(); }),
            location: this.location
        };
    };
    return JSCallExpressionNode;
}(ExpressionNode));
exports.JSCallExpressionNode = JSCallExpressionNode;
var JSSetExpressionNode = /** @class */ (function (_super) {
    __extends(JSSetExpressionNode, _super);
    function JSSetExpressionNode(object, property, value, location) {
        var _this = _super.call(this, 'JSSetExpression', location) || this;
        _this.object = object;
        _this.property = property;
        _this.value = value;
        return _this;
    }
    JSSetExpressionNode.prototype.toJSON = function () {
        return {
            type: this.type,
            object: this.object.toJSON(),
            property: this.property.toJSON(),
            value: this.value.toJSON(),
            location: this.location
        };
    };
    return JSSetExpressionNode;
}(ExpressionNode));
exports.JSSetExpressionNode = JSSetExpressionNode;
// Phase 5: Native DOM API Expression Nodes
var DOMConstructorNode = /** @class */ (function (_super) {
    __extends(DOMConstructorNode, _super);
    function DOMConstructorNode(domType, args, location) {
        if (args === void 0) { args = []; }
        var _this = _super.call(this, 'DOMConstructor', location) || this;
        _this.domType = domType;
        _this.args = args;
        return _this;
    }
    DOMConstructorNode.prototype.toJSON = function () {
        return {
            type: this.type,
            domType: this.domType,
            arguments: this.args.map(function (arg) { return arg.toJSON(); }),
            location: this.location
        };
    };
    return DOMConstructorNode;
}(ExpressionNode));
exports.DOMConstructorNode = DOMConstructorNode;
var DOMPropertyAccessNode = /** @class */ (function (_super) {
    __extends(DOMPropertyAccessNode, _super);
    function DOMPropertyAccessNode(object, property, isAssignment, value, location) {
        if (isAssignment === void 0) { isAssignment = false; }
        var _this = _super.call(this, 'DOMPropertyAccess', location) || this;
        _this.object = object;
        _this.property = property;
        _this.isAssignment = isAssignment;
        _this.value = value;
        return _this;
    }
    DOMPropertyAccessNode.prototype.toJSON = function () {
        var _a;
        return {
            type: this.type,
            object: this.object.toJSON(),
            property: this.property,
            isAssignment: this.isAssignment,
            value: (_a = this.value) === null || _a === void 0 ? void 0 : _a.toJSON(),
            location: this.location
        };
    };
    return DOMPropertyAccessNode;
}(ExpressionNode));
exports.DOMPropertyAccessNode = DOMPropertyAccessNode;
var DOMMethodCallNode = /** @class */ (function (_super) {
    __extends(DOMMethodCallNode, _super);
    function DOMMethodCallNode(object, method, args, location) {
        var _this = _super.call(this, 'DOMMethodCall', location) || this;
        _this.object = object;
        _this.method = method;
        _this.args = args;
        return _this;
    }
    DOMMethodCallNode.prototype.toJSON = function () {
        return {
            type: this.type,
            object: this.object.toJSON(),
            method: this.method,
            arguments: this.args.map(function (arg) { return arg.toJSON(); }),
            location: this.location
        };
    };
    return DOMMethodCallNode;
}(ExpressionNode));
exports.DOMMethodCallNode = DOMMethodCallNode;
