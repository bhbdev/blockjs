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

const Trace = (s) => { console.log(s) }
const _type = (x) => { return x.constructor.name }

const ShortTags = ['hr','br']

class BlockInterface {
  constructor (map=[]) {
    const _default = [
      { key: "name",  default: 'Block' },
      { key: "tag",   default: 'div'   },
      { key: "block", default: null    },
      { key: "content",   default: ''  },
      { key: "attr",  default: {}      },
      { key: "short", default: false   },
      { key: "slots", default: []      },
      { key: "items", default: null    },
      { key: "item",  default: null    },
      { key: "format", default: function(item){ return item } },
      { key: "hide",  default: false  },
    ]
    this._map = [..._default, ...map]
  }
  get def() {
    return this._map;
  }  
}

class Block {
  constructor (obj, template={}, objMap=[]) {
    this._interface = new BlockInterface(objMap);
    this.init(obj,template)
  }
  init (obj,template) {
    try {
      if (!obj) throw 'undefined';    
      
      this.template = template;
    
      this._interface.def.map(type => {
        if (type.required && !obj[type.key])
          throw 'missing required key: ' + type.key
        this[type.key] = obj[type.key] || type.default
      })
      
      if (!template) throw 'template null or undefined'
        
     // Trace('template data:' + typeof template.data)
      if (template.data) this.data = template.data
      if (template.$components) {
        this.components = template.$components;
      }
      
      if (this.block) {
        Trace('render -> <' + this.block + '>' )
      }
      else
        Trace('render -> ' + this.constructor.name + ' <' + this.tag + '>' )      
      
    } catch (e) {
      Trace('invalid block def\nerror:' + e)
    }
  }
  attrs (str) {
    let attr = ''
    for (const [key,value] of Object.entries(this.attr)) {
        attr += ` ${key}="${value}"`;
    }
    return attr;
  }
  compile () {
    let res = '';
    try {  
      if (this.format.constructor.name != 'Function')
        throw 'format must be defined as function'
        
      if (this.item) {
        res += this.format(this.item);
      }
      else if (this.items)
      {
        if (typeof this.items == "string")
        {
          let method = this.items.replace('::','').split(':');
          let datakey = method[0]
          let arg = method.length==2? method[1]:null

          if (this.template.data[datakey]) {
            this.items = this.template.data[datakey](arg)
          }
        }
    
        if (this.items.constructor.name !== 'Array')
          throw 'items must be array'
      
        this.items.forEach((i) => {
            if (typeof i === "string") {
              res += this.format(i);
            }
            else {
              let block = (i.constructor.name == 'Object' && i.hasOwnProperty('tag')) ? i : this.format(i);
              let cls = block.type || 'Block';
              res += new this.components[cls](block, this.template) + '\n'
            }
        })      
      } 

    } catch (e) {
      res = 'compile failed: ' + e
      Trace(res);
    }    
    
    return res;
  }
  _content() {
    
    if (this.block) 
    {
        let blockdef = new this.components[this.block]()
        Trace('type: ' + _type(blockdef))
        // if (blockdef.constructor.name == 'Array') {
        // }
        return new Block(blockdef,this.template).toString()
    }   

    if (this.items || this.item)
    {
      //Trace('compiled ' + (this.item? 'item':'items'))
      this.content = this.compile()
    }
    
    if (this.content.constructor.name == 'Object' && this.content.hasOwnProperty('tag'))
    {
      return new Block(this.content,this.template)
    }
    
    if (this.content.constructor.name == 'Array')
    {
      let val= '';
      this.content.forEach((v)=>{
        if (this.block) 
        {
            v = new this.components[this.block]()
        }
        
        val += new this.components[v.type || 'Block'](v,this.template) + '\n'
      })
      return val;
    }
    
    if (Object.getPrototypeOf(this.content.constructor).name == 'Block' || this.content.constructor.name == 'Block')
    {
      return this.content.toString()
    } 
    
    if (this.content.constructor.name == 'String')
    {
      return this.content;
    }
    
  }
  toString() {
    if (this.hide===true || typeof this.hide == 'function' && this.hide()) return '';
    if (this.block) return this._content();
//    Trace('render -> ' + this.constructor.name + ' <' + this.tag + '>' )
    let str = `<${this.tag}`;
    str += this.attrs()
    if (ShortTags.find(t => t==this.tag) || this.short)
      str += ` />`;
    else
      str += `>${this._content()}</${this.tag}>`;
    
    return str;
  }
}


class BlockTemplate {
  constructor(template) {   
    this.template = template || { blocks: [] };
  }
  compile () {
    const BlockClass = this.template.components ?
                          Object.assign({}, { Block, ...this.template.components })
                        : Object.assign({}, { Block })
    
    this.template.$components = BlockClass;
    
    let body = ''
    this.template.blocks.forEach(b => {
      body += new BlockClass[b.type || 'Block'](b, this.template) + '\n'    
    })
    return body;
  }
  toString () {
    return this.compile()
  }
  render () {
    Emit(this)
  }  
}


////////////////////////////////
// define some custom Block classes

class ButtonBlock extends Block {
  constructor(props,template={}) {
    const tag = 'button';
    super( {tag,...props}, template )
  }
}


class ListBlock extends Block {
  constructor(props, template={}) {
    const tag = 'ul';
    const ListInterface = [
      { key: "items", default: [] },
      { key: "format", 
        default: (item) => { 
          let obj = ''
          if (typeof item === 'string')
            obj = item;
          else 
          //item may not be a RealV8Obj
          // attempt to convert
            obj = Object.assign({},  item )
          return new Block({ tag:'li', content: obj.toString() }).toString() 
        }
      }
    ]
    super( {tag,...props}, template, ListInterface )
    this.template = template;
    //this.compile()
  }
}

class ListItemBlock extends Block {
  constructor(props, template={}) {
    const tag = 'li';
    super( {tag,...props}, template)
    this.template = template
  }
}
