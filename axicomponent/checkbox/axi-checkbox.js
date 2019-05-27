// axicomponent/icon/axi-icon.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-checkbox').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'value': {
      type: String
    },
    'disabled': {
      type: Boolean
    },
    'checked': {
      type: Boolean,
      value: false,
      observer: function(v){
        this.triggerEvent('change', {
          checked: v,
          value: this.data.value
        });
      }
    },
    'color': {
      type: String
    },
    'name': {
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
      if(this.data.disabled) return;
      this.setData({
        checked: !this.data.checked
      });
    }
  }
})
