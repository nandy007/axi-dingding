// axicomponent/textarea/axi-textarea.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-textarea').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'value': {
      // memo: '输入框的初始内容',
      type: String
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
      type: Number
    },
    'autoHeight': {
      // memo: '是否自动增高，设置auto-height时，style.height不生效',
      type: Boolean
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
    f: function(e){
      if(e.type==='tap'){
        this.setData({
          focus: true
        });
      }
    },
    focusFunc: function (e) {
      this.triggerEvent('focus', e.detail);
    },
    blurFunc: function (e) {
      this.setData({
        focus: false
      });
      this.triggerEvent('blur', e.detail);
    },
    linechangeFunc: function (e) {
      // 支付宝小程序无此功能
      this.triggerEvent('linechange', e.detail);
    },
    inputFunc: function (e) {
      this.setData({
        value: e.detail.value
      });
      this.triggerEvent('input', e.detail);
    },
    confirmFunc: function (e) {
      this.triggerEvent('confirm', e.detail);
    },
    click: function () {
      this.setData({
        focus: true
      });
    }
  }
})
