// axicomponent/text/axi-text.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-text').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'selectable': {
      type: Boolean,
      value: false
    },
    'space': {
      type: String,
      value: false
    },
    'text': {
      type: String
    },
    'html': {
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
    // toDo: function(){

    // }
  }
})
