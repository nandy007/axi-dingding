App({
  onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    console.info('App onLaunch');
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  globalData: {
    userInfo: null,
    __framework: {
      pageCache: null,
      // Wrapper: require('./axicomponent/include.js'),
      // agileBridge: require('./axicomponent/bridgejs/agileBridge.js'),
      session: {},
      // axiConfig: require('./axiConfig.js')
    }
  }
});
