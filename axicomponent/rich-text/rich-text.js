import parse from 'mini-html-parser2';

const ComponentWrapper = require('../Base.js')(Component, 'rich-text').Component;

const util = require('./util');

const empty = {
  handler: function(node){
    delete node.name;
    delete node.attrs;
    delete node.children;
    node.type = 'text';
    node.text = '';
  },
  def: "area,base,basefont,br,col,frame,hr,input,link,meta,param,embed,command,keygen,source,track,wbr"
};
// Block Elements - HTML 5
const block = {
  handler: function(node){
    node.name = 'view';
  },
  def: "br,a,code,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video"
};

// Inline Elements - HTML 5
const inline = {
  getText: function(nodes, arr){
    arr = arr || [];
    for(let i=0, len=nodes.length;i<len;i++){
      const node = nodes[i];
      if(node.type==='text'){
        arr.push(util.strDiscode(node.text||''));
        inline.getText(node.children||[], arr);
      }
    }
    return arr;
  },
  handler: function(node){
    const children = node.children || [];
    delete node.children;
    // node.children = inline.getText(children);
    delete node.name;
    node.type = 'text';
    node.text = inline.getText(children).join('');
  },
  def: "abbr,acronym,applet,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"
};

const img = {
  handler: function(node,ctx){
    const src = (node.attrs && node.attrs.src) || '';
    node.src = !(src.split(/https?\:\/\//g)[0]) ? src : ctx.getAbsolute(src);
  },
  def: 'img'
}

const tagMap = makeMap(empty, block, inline, img);


function makeMap(...args){
  const obj = {
    formateNode: function(node, ctx){
      if(!node.name) {
        node.text = util.strDiscode(node.text||'');
        return;
      }
      const info = obj.getTagInfo(node.name);
      if(!info) {
        node.ignore = true;
        return;
      }
      node.c = node.name;
      info.handler(node, ctx);
    },
    getTagInfo: function(name){
      for(let i=0,len=args.length;i<len;i++){
        const item = args[i];
        if(item.def.indexOf(name)>-1) return item;
      }
    }
  };
  args.forEach((item)=>{
    item.def = item.def.split(',');
  });
  return obj;
}

function loopNodes(nodes, ctx){
  for(let i=0, len=nodes.length;i<len;i++){
    const node = nodes[i];
    tagMap.formateNode(node, ctx);
    loopNodes(node.children||[]);
  }
  return nodes;
}


ComponentWrapper({
  data: {
    trueNodes: []
  },
  properties: {
    'nodes': {
      // memo: 'HTML String',
      type: String,
      observer: function(v){
        if(!v || v.length===0){
          this.setData({
            trueNodes: []
          });
          return;
        }
        if(v instanceof Array){
          this.setData({
            trueNodes: loopNodes(v, this)
          });
          return;
        }
        parse(v||'', (err, nodes) => {
          nodes = loopNodes(nodes || [], this);
          console.log(nodes)
          // nodes数据的变更必须使用原生的setData
          this.setData({
            trueNodes: nodes,
          });
        });
      }
    }
  }
});
