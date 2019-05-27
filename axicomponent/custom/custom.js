const ComponentWrapper = require('../Base.js')(Component, 'custom').Component;

// Component({
Component({
  data: {
    ccc: 222
  },
  didMount: function(){
    // console.log(this.props.id)
  },
  didUpdate: function(preProps, preData){
    // console.log(333);
  },
  created(){
    // console.log(333, this.selectById('cid'))
    // this.ctx.props.aaa.a = 666;
    // console.log(this.ctx.props)
    this.setData({
      'aaa.a': 666,
      // ccc: 333
    });
  },
  properties: {
    aaa: {
      type: Object,
      value: {},
      obserer: function(v){
        
      }
    }
  },
  observers: {
    'ccc': function(){
      console.log(4444, this.data)
    }
  },
  methods: {
    click: function(e){
      this.props.onTap(e);
    },
    aaa: function(){
      console.log(222)
    }
  },
});
