import parse from 'mini-html-parser2';

const ComponentWrapper = require('../Base.js')(Component, 'axi-progress').Component;


ComponentWrapper({
  properties: {
    'nodes': {
      // memo: 'HTML String',
      type: String,
      observer: function(v){
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
    trueNodes : []
  }
});
