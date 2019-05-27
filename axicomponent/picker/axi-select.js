// axicomponent/picker/axi-select.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-select').Component;
ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'options': {
      // memo: 'select的选项，为对象数组，对象必须包含text和value，为自有属性',
      type: Array,
      value: [],
      observer: function (val) {
        // console.log(val)
        this.setData({
          range: val
        });
      }
    },
    // memo: '没有值的时候的提示语',
    'placeholder': {
      type: String,
      observer: function(val){
        this.calculateShow();
      }
    },
    'value': {
      // memo: '设置为options中某个选项的value值，并且为选中状态',
      type: String,
      observer: function (val) {
        this.calculateShow();
      }
    },
    'disabled': {
      // memo: '是否禁用',
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    get showText(){
      return this._showText || ' ';
    },
    set showText(v){
      this._showText = v;
    },
    index: -1,
    range: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    calculateShow: function(){
      var val = this.data.value, palceholder = this.data.placeholder;
      var options = this.data.options;
      var option, index = -1;
      for (var i = 0, len = options.length;i<len;i++){
        if (options[i].value===val){
          index = i;
          option = options[i];
          break;
        }
      }
      this.setData({
        index: index,
        showText: option ? option.text : palceholder
      });
    },
    change: function(e){
      var val = e.detail.value;
      var options = this.data.options;
      var value = options[val].value;
      if (value===this.data.value) return;
      this.setData({
        value: value
      });
      this.triggerEvent('change', {
        value: value
      });
    },
    cancel: function(e){
      // 支付宝小程序无此功能
      this.triggerEvent('cancel');
    }
  }
})
