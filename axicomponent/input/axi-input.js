// axicomponent/input/axi-input.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-input').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'value': {
        // memo: '输入框的初始内容',
        type: String
    },
    'type': {
        // memo: 'input 的类型',
        type: String
    },
    'password': {
        // memo: '是否是密码类型',
        type: Boolean
    },
    'placeholder': {
        // memo: '输入框为空时占位符',
        type: String
    },
    'placeholderColor': {
        // memo: '输入框为空时占位符文字颜色，自定义独有',
        type: String
    },
    'disabled': {
        // memo: '是否禁用',
        type: Boolean
    },
    'maxlength': {
        // memo: '最大输入长度，设置为 -1 的时候不限制最大长度',
        type: Number,
        value: 140
    },
    'confirmType': {
        // memo: '设置键盘右下角按钮的文字，仅在type='text'时生效',
        type: String
    },
    'focus': {
        // memo: '获取焦点',
        type: Boolean
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
    focusFunc: function(e) {
        this.triggerEvent('focus', e.detail);
    },
    blurFunc: function(e) {
      this.setData({
        value: e.detail.value
      });
      this.triggerEvent('blur', e.detail);
    },
    inputFunc: function(e) {
      this.setData({
        value: e.detail.value
      });
      this.triggerEvent('input', e.detail);
    },
    confirmFunc: function(e) {
        this.triggerEvent('confirm', e.detail);
    },
    click: function(){
      this.setData({
        focus: true
      });
    }
  }
})
