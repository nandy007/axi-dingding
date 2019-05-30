import parse from 'mini-html-parser2';

const ComponentWrapper = require('../Base.js')(Component, 'axi-rich-text').Component;


ComponentWrapper({
  properties: {
    'nodes': {
      // memo: 'HTML String',
      type: String,
      observer: function(v){
        if(this.data.core==='dd'){
          this.setData({
            trueNodes: v
          });
          return;
        }
        parse(v||'', (err, nodes) => {
          // nodes数据的变更必须使用原生的setData
          this.ctx.setData({
            trueNodes: err ? [] : nodes,
          });
        });
        
      }
    }
  },
  data: {
    core: my.ap ? 'ap' : 'dd',
    trueNodes : []
  }
});
