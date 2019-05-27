// axicomponent/picker/axi-pick-date.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-pick-time').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'value': {
      type: String,
      observer(val){
        this.calculateShow();
      }
    },
    'start': {
      type: String
    },
    'end': {
      type: String
    },
    'disabled': {
      type: Boolean
    },
    'placeholder': {
      type: String,
      observer: function (val) {
        this.calculateShow();
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showText: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    calculateShow: function () {
      this.setData({
        showText: this.data.value || this.data.placeholder
      });
    },
    f: function(e){
      if(e.type==='tap') this.click(e);
    },
    click: function(e){
      if(this.data.disabled) return;
      var cur = this.data.value || '';
      var formats = ['HH', 'mm'];

      my.datePicker({
        format: formats.join(':'),
        currentDate: cur,
        startDate: this.getAttrValue('start') || '',
        endDate: this.getAttrValue('end') || '',
        success: (res) => {
          if(res.date!==cur)
          this.bindchangeFunc({
            detail: {
              value: res.date
            }
          });
        },
      });
    },
    bindchangeFunc(e) {
      this.setData({
        value: e.detail.value
      });
      this.triggerEvent('change', e.detail);
    },
    bindcancelFunc(e) {
      // 支付宝无此功能
      this.triggerEvent('cancel', e.detail);
    }
  }
})
