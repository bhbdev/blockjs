/***************************************************************
____    ___                   __
/\  _`\ /\_ \                 /\ \            __
\ \ \L\ \//\ \     ___     ___\ \ \/'\       /\_\    ____
 \ \  _ <'\ \ \   / __`\  /'___\ \ , <       \/\ \  /',__\
  \ \ \L\ \\_\ \_/\ \L\ \/\ \__/\ \ \\`\   __ \ \ \/\__, `\
   \ \____//\____\ \____/\ \____\\ \_\ \_\/\_\_\ \ \/\____/
    \/___/ \/____/\/___/  \/____/ \/_/\/_/\/_/\ \_\ \/___/
                                             \ \____/
                                              \/___/

block.js - Render HTML with JavaScript ¯\_(ツ)_/¯
@author: Beau Bishop - github.com/bhbdev/blockjs
@version: 0.1.0

***************************************************************/
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Trace = function (s) { console.log(s); };
var _type = function (x) { return x.constructor.name; };
var ShortTags = ['hr', 'br'];
var BlockInterface = /** @class */ (function () {
    function BlockInterface(map) {
        if (map === void 0) { map = []; }
        var _default = [
            { key: "name", default: 'Block' },
            { key: "tag", default: 'div' },
            { key: "block", default: null },
            { key: "content", default: '' },
            { key: "attr", default: {} },
            { key: "short", default: false },
            { key: "slots", default: [] },
            { key: "items", default: null },
            { key: "item", default: null },
            { key: "format", default: function (item) { return item; } },
            { key: "hide", default: false },
        ];
        this._map = __spreadArray(__spreadArray([], _default, true), map, true);
    }
    Object.defineProperty(BlockInterface.prototype, "def", {
        get: function () {
            return this._map;
        },
        enumerable: false,
        configurable: true
    });
    return BlockInterface;
}());
var Block = /** @class */ (function () {
    function Block(obj, template, objMap) {
        if (template === void 0) { template = {}; }
        if (objMap === void 0) { objMap = []; }
        this.data = {};
        this.components = {};
        this.block = null;
        this.tag = '';
        this.attr = {};
        this.short = false;
        this.content = '';
        this.items = null;
        this.item = null;
        this.format = function (item) { return item; };
        this.hide = false;
        this._interface = new BlockInterface(objMap);
        this.init(obj, template);
    }
    Block.prototype.init = function (obj, template) {
        var _this = this;
        try {
            if (!obj)
                throw 'undefined';
            this.template = template;
            this._interface.def.map(function (type) {
                if (type.required && !obj[type.key])
                    throw 'missing required key: ' + type.key;
                _this[type.key] = obj[type.key] || type.default;
            });
            if (!template)
                throw 'template null or undefined';
            if (template.data)
                this.data = template.data;
            if (template.$components) {
                this.components = template.$components;
            }
            if (this.block) {
                Trace('render -> <' + this.block + '>');
            }
            else {
                Trace('render -> ' + this.constructor.name + ' <' + this.tag + '>');
            }
        }
        catch (e) {
            Trace('invalid block def\nerror:' + e);
        }
    };
    Block.prototype.attrs = function () {
        var attr = '';
        for (var _i = 0, _a = Object.entries(this.attr); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            attr += " ".concat(key, "=\"").concat(value, "\"");
        }
        return attr;
    };
    Block.prototype.compile = function () {
        var _this = this;
        var res = '';
        try {
            if (typeof this.format !== 'function')
                throw 'format must be defined as function';
            if (this.item) {
                res += this.format(this.item);
            }
            else if (this.items) {
                if (typeof this.items === "string" && this.template.data && this.items) {
                    var method = this.items.replace('::', '').split(':');
                    var datakey = method[0];
                    var arg = method.length === 2 ? method[1] : null;
                    if (this.template.data[datakey]) {
                        this.items = this.template.data[datakey](arg);
                    }
                }
                if (!Array.isArray(this.items))
                    throw 'items must be array';
                this.items.forEach(function (i) {
                    if (typeof i === "string") {
                        res += _this.format(i);
                    }
                    else {
                        var block = (i.constructor.name === 'Object' && i.hasOwnProperty('tag')) ? i : _this.format(i);
                        var cls = block.type || 'Block';
                        res += new _this.components[cls](block, _this.template) + '\n';
                    }
                });
            }
        }
        catch (e) {
            res = 'compile failed: ' + e;
            Trace(res);
        }
        return res;
    };
    Block.prototype._content = function () {
        var _this = this;
        if (this.block) {
            var blockdef = new this.components[this.block]();
            Trace('type: ' + _type(blockdef));
            return new Block(blockdef, this.template).toString();
        }
        if (this.items || this.item) {
            this.content = this.compile();
        }
        if (this.content.constructor.name === 'Object' && this.content.hasOwnProperty('tag')) {
            return new Block(this.content, this.template);
        }
        if (this.content.constructor.name === 'Array') {
            var val_1 = '';
            this.content.forEach(function (v) {
                if (_this.block) {
                    v = new _this.components[_this.block]();
                }
                val_1 += new _this.components[v.type || 'Block'](v, _this.template) + '\n';
            });
            return val_1;
        }
        if (Object.getPrototypeOf(this.content.constructor).name === 'Block' || this.content.constructor.name === 'Block') {
            return this.content.toString();
        }
        if (this.content.constructor.name === 'String') {
            return this.content;
        }
    };
    Block.prototype.toString = function () {
        var _this = this;
        if (this.hide === true || typeof this.hide === 'function' && this.hide())
            return '';
        if (this.block)
            return this._content();
        var str = "<".concat(this.tag);
        str += this.attrs();
        if (ShortTags.find(function (t) { return t === _this.tag; }) || this.short)
            str += " />";
        else
            str += ">".concat(this._content(), "</").concat(this.tag, ">");
        return str;
    };
    return Block;
}());
var BlockTemplate = /** @class */ (function () {
    function BlockTemplate(template) {
        this.template = template || { blocks: [] };
    }
    BlockTemplate.prototype.compile = function () {
        var _this = this;
        var _a;
        var BlockClass = this.template.components ?
            Object.assign({}, __assign({ Block: Block }, this.template.components))
            : Object.assign({}, { Block: Block });
        this.template.$components = BlockClass;
        var body = '';
        (_a = this.template.blocks) === null || _a === void 0 ? void 0 : _a.forEach(function (b) {
            body += new BlockClass[b.type || 'Block'](b, _this.template) + '\n';
        });
        return body;
    };
    BlockTemplate.prototype.toString = function () {
        return this.compile();
    };
    BlockTemplate.prototype.render = function () {
        // Define or import Emit function
        // Emit(this);
    };
    return BlockTemplate;
}());
var ButtonBlock = /** @class */ (function (_super) {
    __extends(ButtonBlock, _super);
    function ButtonBlock(props, template) {
        if (template === void 0) { template = {}; }
        var tag = 'button';
        return _super.call(this, __assign({ tag: tag }, props), template) || this;
    }
    return ButtonBlock;
}(Block));
var ListBlock = /** @class */ (function (_super) {
    __extends(ListBlock, _super);
    function ListBlock(props, template) {
        if (template === void 0) { template = {}; }
        var _this = this;
        var tag = 'ul';
        var ListInterface = [
            { key: "items", default: [] },
            {
                key: "format",
                default: function (item) {
                    var obj = '';
                    if (typeof item === 'string')
                        obj = item;
                    else
                        obj = Object.assign({}, item);
                    return new Block({ tag: 'li', content: obj.toString() }).toString();
                }
            }
        ];
        _this = _super.call(this, __assign({ tag: tag }, props), template, ListInterface) || this;
        _this.template = template;
        return _this;
    }
    return ListBlock;
}(Block));
var ListItemBlock = /** @class */ (function (_super) {
    __extends(ListItemBlock, _super);
    function ListItemBlock(props, template) {
        if (template === void 0) { template = {}; }
        var _this = this;
        var tag = 'li';
        _this = _super.call(this, __assign({ tag: tag }, props), template) || this;
        _this.template = template;
        return _this;
    }
    return ListItemBlock;
}(Block));
