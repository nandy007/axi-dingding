// axicomponent/bar/axi-titlebar.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-titlebar').Component;

ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {
    'title': {
      // memo: '标题内容',
      type: String,
      observer: function (n, o) {
        my.setNavigationBar({
          title: n,
          // backgroundColor: '#108ee9',
          // success() {
          //   my.alert({
          //     content: '设置成功',
          //   });
          // },
          // fail() {
          //   my.alert({
          //     content: '设置是失败',
          //   });
          // },
        });
      }
    },
    'color': {
      // memo: '标题颜色',
      type: String,
      value: '#000000'
    },
    'size': {
      // memo: '字体大小',
      type: Number,
      value: 20
    },
    'hideLeftSide': {
      // memo: '隐藏左边区域',
      type: Boolean,
      value: false
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
    ontap: function () {
      my.navigateBack({
        delta: 1
      });
    }
  },
  created: function () {
    // console.log(111, this.data.hideLeftSide)
  }
})
