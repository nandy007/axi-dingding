// axicomponent/bar/axi-tabbar.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-tabbar').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'color': {
      // memo: '文字颜色',
      type: String,
      value: '#7A7E83'
    },
    'selectedColor': {
      // memo: '选中文字颜色',
      type: String,
      value: '#3cc51f'
      // value: '#3d8ee2'
    },
    'borderStyle': {
      // memo: '边框颜色',
      type: String,
      value: '#ececec'
    },
    'backgroundColor': {
      // memo: '背景颜色',
      type: String,
      value: '#ffffff'
    },
    'current': {
      // memo: '当前所在item的 index',
      type: Number,
      value: 0,
      observer: function (val) {
        if (this.data.curIndex === val) return;
        this.setData({
          curIndex: val
        });
        var arr = [];
        this.setItems(arr);
        this.setData({
          tablist: arr
        });
      },
    },
    'list': {
      // memo: 'tabbar item数组',
      type: Object,
      value: [],
      observer: function (val) {
        this.__listData = val || [];
        var arr = [];
        this.setItems(arr);
        this.setData({
          tablist: arr
        });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tablist: [],
    curIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectItem: function(e){
      var index = e.currentTarget.dataset.index;
      if (this.data.curIndex === index) return;
      this.setData({
        current: index
      });
    },
    setItems: function(arr){
      var curIndex = this.data.curIndex || 0;

      var ls = this.__listData || [];

      ls.forEach((source, i)=>{
        var active = i === curIndex;
        if (!arr[i]) arr[i] = {};
        var item = arr[i];
        item.text = source.text;
        item.src = active ? source.selectedIconPath : source.iconPath;
        item.color = active ? this.data.selectedColor : this.data.color;
        if (active) this.triggerEvent('changed', {
          value: i
        }); // 触发changed事件
      });
    }
  }
})
