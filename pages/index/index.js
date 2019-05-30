const PageWrapper = require('../../axicomponent/Base.js')(Page, '', '/pages/index/index').Page;
var article = '<p><div>1.绘制命令和修改</div><div>1.绘制命令和修改</div><div>1.绘制命令和修改</div></p>';
PageWrapper({
  data: {
    imgSrc: '',
    aaa: {
      a: 555
    },
    class1: 444,
    ccc: 'ttt',
    top: '10',
    cn: 'test',
    percent: 20,
    nodes: [],
    nodeStr: article,//'<span style="color:red" class="ttt">wwwww</span><img src="https://www.baidu.com/img/baidu_jgylogo3.gif">',
    iptVal: '111',
    textarea: '',
    rd: '1',
    ck: ['2'],
    sw: true,
    sel: [
      {
        text: '选项一',
        value: '1'
      },
      {
        text: '选项二',
        value: '2'
      },
      {
        text: '选项三',
        value: '3'
      }
    ],
    myId: 'ck1',
    selV: '2',
    dateV: '2018-09-21',
    timeV: '21:22',
    tabIndex: 1,
    tablist: [{ text: '组件', iconPath: '/resources/imgs/icon_component.png', selectedIconPath: '/resources/imgs/icon_component_HL.png' }, { text: '接口', iconPath: '/resources/imgs/icon_API.png', selectedIconPath: '/resources/imgs/icon_API_HL.png' }]
  },
  observers: {
    'ccc': function(){
      // console.log(333, this.data)
    },
    'ck': function(){
      // console.log(this.data.ck)
    }
  },
  pulldown: function(e){
    setTimeout(()=>{
      e.detail.refresh()
    }, 3000);
  },
  move: function(e){
    console.log(e.type)
  },
  click: function(e){
    console.log(22222)
    this.setData({
      ccc: 'ddd',
      top: '20',
      percent: 80,
      iptVal: '2222'
    });
    console.log(3333, this.data.ck)
  },
  tabChange: function(e){
    // console.log(e)
  },
  clickProgress: function(e){
    // console.log(e)
  },
  scroll: function(e){
    // console.log(e)
  },
  activeend: function(e){
    // console.log(e)
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`)
    // console.log(this.selectByName('cname'));
    this.setData({
      class1: 555,
      ccc: 'eee',
      myId: 'ck2',
      imgSrc: this.getAbsolute('../../resources/imgs/green_tri.png')
      // aaa: {
      //   a: 666
      // }
    })


    // this.click()
    
    // console.log(my.createSelectorQuery().select)
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});
