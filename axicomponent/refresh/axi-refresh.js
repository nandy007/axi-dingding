// components/RefreshView/axi-refresh.js
const ComponentWrapper = require('../Base.js')(Component, 'axi-refresh').Component;

var idIndex = 0;
function getRefreshId(){
  return '__refresh_id_' + (idIndex++) + '__';
}


ComponentWrapper({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    refreshId: ''
  },

  created: function(){
    this.setData({
      refreshId: getRefreshId()
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 刷新组件
    getRefreshView: function(){
      if(this.refreshView) return this.refreshView;
      this.refreshView = this.selectById(this.data.refreshId);
      return this.getRefreshView();
    },
    //触摸开始
    handletouchstart: function (event) {
      this.getRefreshView().handletouchstart(event);
    },
    //触摸移动
    handletouchmove: function (event) {
      this.getRefreshView().handletouchmove(event);
    },
    //触摸结束
    handletouchend: function (event) {
      this.getRefreshView().handletouchend(event);
    },
    //触摸取消
    handletouchcancel: function (event) {
      this.getRefreshView().handletouchcancel(event);
    },
    //页面滚动
    onScroll: function (event) {
      this.getRefreshView().onPageScroll(event);
    },
    onScrollLower: function(){
      var comp = this;
      if (comp.__upFlag) return;
      comp.__upFlag = true;
      this.triggerEvent('pullup', {
        refresh: function () {
          comp.__upFlag = false;
        }
      });
    },
    onPullDownRefresh: function(){
      var comp = this;
      // setTimeout(() => { this.refreshView.stopPullRefresh() }, 1000)
      this.triggerEvent('pulldown', {
        refresh: function(){
          comp.getRefreshView().stopPullRefresh()
        }
      });
    }
  }
})
