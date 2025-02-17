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

type FormatFunction = (item: any) => any;

interface BlockInterfaceMap {
  key: string;
  default: any;
  required?: boolean;
}

interface BlockProps {
  type?: string;
  name?: string;
  tag?: string;
  block?: string | null;
  content?: any;
  attr?: Record<string, string>;
  short?: boolean;
  slots?: any[];
  items?: any[] | null;
  item?: any;
  format?: FormatFunction;
  hide?: boolean | (() => boolean);
}

interface Template {
  data?: Record<string, any>;
  $components?: Record<string, any>;
  blocks?: BlockProps[];
  components?: Record<string, any>;
}

const Trace = (s: string): void => { console.log(s); }
const _type = (x: any): string => { return x.constructor.name; }

const ShortTags: string[] = ['hr', 'br'];

class BlockInterface {
  private _map: BlockInterfaceMap[];

  constructor(map: BlockInterfaceMap[] = []) {
    const _default: BlockInterfaceMap[] = [
      { key: "name", default: 'Block' },
      { key: "tag", default: 'div' },
      { key: "block", default: null },
      { key: "content", default: '' },
      { key: "attr", default: {} },
      { key: "short", default: false },
      { key: "slots", default: [] },
      { key: "items", default: null },
      { key: "item", default: null },
      { key: "format", default: (item: any) => item },
      { key: "hide", default: false },
    ];
    this._map = [..._default, ...map];
  }

  get def(): BlockInterfaceMap[] {
    return this._map;
  }
}

class Block {
  private _interface: BlockInterface;
  protected template: Template;
  private data: Record<string, any> = {};
  private components: Record<string, any> = {};
  private block: string | null = null;
  private tag: string = '';
  private attr: Record<string, string> = {};
  private short: boolean = false;
  private content: any = '';
  private items: any[] | null = null;
  private item: any = null;
  private format: FormatFunction = (item) => item;
  private hide: boolean | (() => boolean) = false;

  constructor(obj: BlockProps, template: Template = {}, objMap: BlockInterfaceMap[] = []) {
    this._interface = new BlockInterface(objMap);
    this.init(obj, template);
  }

  init(obj: BlockProps, template: Template): void {
    try {
      if (!obj) throw 'undefined';

      this.template = template;

      this._interface.def.map(type => {
        if (type.required && !obj[type.key as keyof BlockProps])
          throw 'missing required key: ' + type.key;
        this[type.key as keyof Block] = obj[type.key as keyof BlockProps] || type.default;
      });

      if (!template) throw 'template null or undefined';

      if (template.data) this.data = template.data;
      if (template.$components) {
        this.components = template.$components;
      }

      if (this.block) {
        Trace('render -> <' + this.block + '>');
      } else {
        Trace('render -> ' + this.constructor.name + ' <' + this.tag + '>');
      }

    } catch (e) {
      Trace('invalid block def\nerror:' + e);
    }
  }

  attrs(): string {
    let attr = '';
    for (const [key, value] of Object.entries(this.attr)) {
      attr += ` ${key}="${value}"`;
    }
    return attr;
  }

  compile(): string {
    let res = '';
    try {
      if (typeof this.format !== 'function')
        throw 'format must be defined as function';

      if (this.item) {
        res += this.format(this.item);
      } else if (this.items) {
        if (typeof this.items === "string" && this.template.data && this.items) {
          let method = (this.items as string).replace('::', '').split(':');
          let datakey = method[0];
          let arg = method.length === 2 ? method[1] : null;

          if (this.template.data[datakey]) {
            this.items = this.template.data[datakey](arg);
          }
        }

        if (!Array.isArray(this.items))
          throw 'items must be array';

        this.items.forEach((i) => {
          if (typeof i === "string") {
            res += this.format(i);
          } else {
            let block = (i.constructor.name === 'Object' && i.hasOwnProperty('tag')) ? i : this.format(i);
            let cls = block.type || 'Block';
            res += new this.components[cls](block, this.template) + '\n';
          }
        });
      }

    } catch (e) {
      res = 'compile failed: ' + e;
      Trace(res);
    }

    return res;
  }

  _content(): any {
    if (this.block) {
      let blockdef = new this.components[this.block!]();
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
      let val = '';
      this.content.forEach((v) => {
        if (this.block) {
          v = new this.components[this.block]();
        }

        val += new this.components[v.type || 'Block'](v, this.template) + '\n';
      });
      return val;
    }

    if (Object.getPrototypeOf(this.content.constructor).name === 'Block' || this.content.constructor.name === 'Block') {
      return this.content.toString();
    }

    if (this.content.constructor.name === 'String') {
      return this.content;
    }
  }

  toString(): string {
    if (this.hide === true || typeof this.hide === 'function' && this.hide()) return '';
    if (this.block) return this._content();
    let str = `<${this.tag}`;
    str += this.attrs();
    if (ShortTags.find(t => t === this.tag) || this.short)
      str += ` />`;
    else
      str += `>${this._content()}</${this.tag}>`;

    return str;
  }
}

class BlockTemplate {
  private template: Template;

  constructor(template: Template) {
    this.template = template || { blocks: [] };
  }

  compile(): string {
    const BlockClass = this.template.components ?
      Object.assign({}, { Block, ...this.template.components })
      : Object.assign({}, { Block });

    this.template.$components = BlockClass;

    let body = '';
    this.template.blocks?.forEach(b => {
      body += new BlockClass[b.type || 'Block'](b, this.template) + '\n';
    });
    return body;
  }

  toString(): string {
    return this.compile();
  }

  render(): void {
    // Define or import Emit function
    // Emit(this);
  }
}

class ButtonBlock extends Block {
  constructor(props: BlockProps, template: Template = {}) {
    const tag = 'button';
    super({ tag, ...props }, template);
  }
}

class ListBlock extends Block {
  constructor(props: BlockProps, template: Template = {}) {
    const tag = 'ul';
    const ListInterface: BlockInterfaceMap[] = [
      { key: "items", default: [] },
      {
        key: "format",
        default: (item: any) => {
          let obj = '';
          if (typeof item === 'string')
            obj = item;
          else
            obj = Object.assign({}, item);
          return new Block({ tag: 'li', content: obj.toString() }).toString();
        }
      }
    ];
    super({ tag, ...props }, template, ListInterface);
    this.template = template;
  }
}

class ListItemBlock extends Block {
  constructor(props: BlockProps, template: Template = {}) {
    const tag = 'li';
    super({ tag, ...props }, template);
    this.template = template;
  }
}

