// axicomponent/label/axi-label.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-label').Component;
ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'for': {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    f: function(e){
      if(e.type!=='tap') return;
      this.click(e);
    },
    click: function(e){
      var id = this.getAttrValue('for');
      if (!id) return;

      var comp = this.selectById(id);

      comp && !comp.data.disabled && comp.click && comp.click();
    }
  }
})
