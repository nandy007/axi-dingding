
const util = {
  get app() {
    return getApp();
  },
  getEventName: function(evtName){
    var names = evtName.split('');
    var first = names.shift();
    names.unshift(first.toLowerCase());
    return 'on' + names.join('');
  },
  getTimeStamp: function(){
    return Math.round(new Date().getTime()/1000);
  }
};

function delay(cb) {
  var delayTime = 50;
  setTimeout(function () {
    cb();
  }, delayTime);
}

function createPageCache(ctx, pageParams, absolutePath) {
  var _names = {}, _all = [], _models = {};
  var _idCache = {};

  var $selector = my.createSelectorQuery();

  var util = {
    getPagePath: function () {
      return absolutePath;
    },
    getPageParams: function () {
      return pageParams;
    },
    id: function(id, comp){
      if(arguments.length===1){
        return _idCache[id];
      }
      if(comp){
        _idCache[id] = comp;
      }else{
        delete _idCache[id];
      }
    },
    name: function (name, comp, isDel) {
      _names[name] = _names[name] || [];
      if (isDel) {
        var index = _names[name].indexOf(comp);
        if (index > -1) _names[name].splice(index, 1);
      } else if (comp) {
        if (_names[name].indexOf(comp) === -1) _names[name].push(comp);
      } else {
        return (_names[name] || []).slice(0);
      }
    },
    all: function (comp, isDel) {
      if (isDel) {
        var index = _all.indexOf(comp);
        if (index > -1) _all.splice(index, 1);
      } else if (comp) {
        _all.push(comp);
      } else {
        return _all.slice(0);
      }
    },
    selectById: function (id) {
      return $selector.select(`#${id}`);
    },
    selectByName: function (name) {
      return util.name(name);
    },
    selectBySelector: function (selector, isFirst) {
      var comps = $selector.selectAll(selector) || [];
      return isFirst ? comps[0] : comps;
    },
    getValueByName(name) {
      var comps = this.selectByName(name) || [], rs = '';
      for (var i = 0, len = comps.length; i < len; i++) {
        if (comps[i].data.checked) {
          rs = comps[i].data.value;
          break;
        }
      }
      return rs;
    },
    getValuesByName(name) {
      var comps = this.selectByName(name) || [], rs = [];
      for (var i = 0, len = comps.length; i < len; i++) {
        if (comps[i].data.checked) {
          rs.push(comps[i].data.value);
        }
      }
      return rs;
    },
    setData: function () {
      ctx.setData.apply(ctx, arguments);
    },
    registerModel: function (modelInfo, cb) {
      var models = _models[modelInfo.exp] = _models[modelInfo.exp] || [];
      if (models.indexOf(modelInfo) === -1) {
        modelInfo.cb = cb;
        models.push(modelInfo);
      }
      return this.getValueFromModel(modelInfo);
    },
    getModelCtx: function (modelInfo) {
      return modelInfo.source ? util.selectById(modelInfo.source) : ctx;
    },
    getValueFromModel: function (modelInfo) {
      var exps = modelInfo.exp.split('.'), e, comp = util.getModelCtx(modelInfo), data = comp.data, cur;
      while (e = exps.shift()) {
        cur = (cur || data)[e];
      }
      return cur;
    },
    updateModel: function (modelInfo, val) {
      var comp = util.getModelCtx(modelInfo);
      var obj = {};
      obj[modelInfo.exp] = val;
      comp.setData(obj, true);
    },
    triggerModelUpdate: function (exp, v, comp) {
      comp = comp || ctx;
      var models = _models[exp] = _models[exp] || [];
      models.forEach((modelInfo) => {
        var target = util.getModelCtx(modelInfo);
        if (target === comp) modelInfo.cb && modelInfo.cb(v);

      });
    },
    handlerObservers: function (ctx, keyArr) {
      if (keyArr.length === 0) return;
      var observers = ctx.observers;
      if (!observers) return;
      for (var k in observers) {
        var ks = k.replace(/ /g, '').split(','), flag = false;
        for (var i = 0, len = keyArr.length; i < len; i++) {
          if (ks.indexOf(keyArr[i]) > -1) {
            flag = true;
            break;
          }
        }
        if (flag) {
          observers[k].apply(ctx);
        }
      }
    }
  };

  return util;
}

function addPageLifetimes(opt, absolutePath) {
  var onLoad = opt.onLoad;
  opt.onLoad = function (options) {
    var pageCache = this.pageCache = util.app.globalData.__framework.pageCache = createPageCache(this, options, absolutePath);

    // 重写page的setData
    var setData = this.setData;
    this.setData = function (data, noTrigger) {
      var keyArr = [];
      var arrData = {};
      for (var exp in data) {
        if(data[exp] instanceof Array) {
          arrData[exp] = data[exp];
          delete data[exp];
        }
        keyArr.push(exp);
        if (!noTrigger) pageCache.triggerModelUpdate(exp, data[exp]);
      }
      setData.call(this, data);
      this.$spliceData(arrData);
      if (keyArr.length > 0) pageCache.handlerObservers(this, keyArr);
    };

    onLoad && onLoad.call(this);
  };
  // var events = ['onShow', 'onUnload'];
  var events = ['onShow'];

  events.forEach((name) => {
    var func = events[name];
    opt[name] = function () {
      util.app.globalData.__framework.pageCache = this.pageCache;
      func && func.apply(this, arguments);
    }
  });

}

function addCompLifetimes(opt) {
  var detached = opt.detached;
  opt.didUnmount = function () {
    var pageCache = util.app.globalData.__framework.pageCache;

    // 将组件从names缓存中清除
    var attrs = ['name'];
    var nameVal = this.props.name;
    if (nameVal) {
      pageCache.name(nameVal, this, true);
    }

    // 将组件从all缓存中清除
    pageCache.all(this, true);

    detached && detached.call(this);

  };

  opt.didMount = function(){
    opt.created && opt.created.call(this);
    opt.attached && opt.attached.call(this);
  };

  var created = opt.created;
  opt.created = function () {
    var pageCache = util.app.globalData.__framework.pageCache;
    pageCache.all(this);

    // 重写comp的triggerEvent
    // var triggerEvent = this.triggerEvent;
    this.triggerEvent = function (name, params, e) {
      var evtName = util.getEventName(name);
      var func = this.props[evtName];
      e = e || {
        type: name,
        detail: params,
        timeStamp: util.getTimeStamp()
      };
      func && func.call(this, e);
      if (['input', 'blur', 'change'].indexOf(name) > -1) {
        this.__modelInfo && this.__modelInfo.handler && this.__modelInfo.handler(params || {});
      }
    };

    // 重写page的setData
    var setData = this.setData;
    this.setData = function (data, noTrigger) {
      var arrData = {};
      for (var exp in data) {
        if(data[exp] instanceof Array){
          arrData[exp] = data[exp];
          delete data[exp];
        }
        if(!noTrigger) pageCache.triggerModelUpdate(exp, data[exp], this);
      }
      setData.apply(this, arguments);
      this.$spliceData(arrData);
    };

    created && created.call(this);
  };

  var events = ['created', 'attatched'];
  events.forEach((name) => {
    var func = opt[name];
    if (func) opt[name] = function () {
      var args = arguments;
      delay(() => {
        func.apply(this, args);
      });
    };
  });
}

function getMethods(opt, isPage) {
  var methods = isPage ? opt : (function () {
    return opt.methods = opt.methods || {};
  })();
  if (isPage && opt.methods) {
    for (var k in opt.methods) {
      (function (k) {
        var old = opt[k];
        opt[k] = function () {
          old && old.apply(this, arguments);
          return opt.methods[k].apply(this, arguments);
        };
      })(k);
    }
  }
  if(!isPage){
    methods.__f__ = function(e){
      this.triggerEvent(e.type, e.detail, e);
    }
  }
  return methods;
}

function addMethods(opt, absolutePath, isPage) {
  var methods = getMethods(opt, isPage);

  var methodNames = ['selectById', 'selectByName', 'selectBySelector', 'getValueByName', 'getValuesByName'];

  methodNames.forEach((methodName) => {
    methods[methodName] = function () {
      var pageCache = util.app.globalData.__framework.pageCache;
      return pageCache[methodName].apply(pageCache, arguments);
    };
  });

  methods.getAttrValue = function (attrName) {
    return this.props[attrName];
  };
}

function addValueOberser(opt) {

  var properties = opt.properties = opt.properties || {};

  // 添加name属性监听
  var nameProperty = properties.name = properties.name || { type: 'String' };
  var nameObserver = nameProperty.observer;
  nameProperty.observer = function (v, o) {
    var pageCache = util.app.globalData.__framework.pageCache;
    if (o) {
      // 删除原缓存
      pageCache.name(o, this, true);
    }
    if (v) {
      // 添加新缓存
      pageCache.name(v, this);
    }

    nameObserver && nameObserver.apply(this, arguments);
  };


  var attrs = Object.keys(properties || {});

  // 为所有的属性添加延迟触发
  attrs.forEach((attr) => {

    var property = properties[attr];

    var observer = property.observer;

    if (!observer) return;

    property.observer = function () {
      var args = arguments;
      // 延迟触发，确保page的onload先进入
      delay(() => {
        observer.apply(this, args);
      });
    }

  });
}


function bindModelHandler(opt) {

  var properties = opt.properties = opt.properties || {};

  var models = {
    text: {
      init: function () {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this;

        var modelVal = pageCache.registerModel(comp.__modelInfo, function (n) {
          comp.setData({
            value: n
          });
        });

        comp.setData({
          value: modelVal
        });
      },
      handler: function (params) {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this, modelInfo = comp.__modelInfo;
        var modelAttrName = modelInfo.attr;
        // var exp = comp.data[modelAttrName];
        pageCache.updateModel(modelInfo, params.value);
      }
    },
    checkbox: {
      init: function () {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this;

        var modelVal = pageCache.registerModel(comp.__modelInfo, function (n) {
          comp.setData({
            checked: n.indexOf(comp.data.value) > -1
          });
        });


        comp.setData({
          checked: modelVal.indexOf(comp.data.value) > -1
        });
      },
      handler: function (params) {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this, modelInfo = comp.__modelInfo;
        var modelAttrName = modelInfo.attr;
        // var exp = comp.data[modelAttrName];
        var modelValue = pageCache.getValueFromModel(modelInfo).slice(0);
        if (params.checked) {
          if (modelValue.indexOf(params.value) < 0) modelValue.push(params.value);
        } else {
          var index = modelValue.indexOf(params.value);
          if (index > -1) modelValue.splice(index, 1);
        }
        pageCache.updateModel(modelInfo, modelValue);
      }
    },
    radio: {
      init: function () {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this;

        var modelVal = pageCache.registerModel(comp.__modelInfo, function (n) {
          comp.setData({
            checked: n === comp.data.value
          });
        });

        comp.setData({
          checked: modelVal === comp.data.value
        });
      },
      handler: function (params) {

        if (!params.checked) return;
        var pageCache = util.app.globalData.__framework.pageCache, comp = this, modelInfo = comp.__modelInfo;
        var modelAttrName = modelInfo.attr;
        // var exp = comp.data[modelAttrName];

        pageCache.updateModel(modelInfo, params.value);
      }
    },
    select: {
      init: function () {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this;

        var modelVal = pageCache.registerModel(comp.__modelInfo, function (n) {
          comp.setData({
            value: n
          });
        });

        comp.setData({
          value: modelVal
        });
      },
      handler: function (params) {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this, modelInfo = comp.__modelInfo;
        var modelAttrName = modelInfo.attr;
        // var exp = comp.data[modelAttrName];
        pageCache.updateModel(modelInfo, params.value);
      }
    },
    'switch': {
      init: function () {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this;

        var modelVal = pageCache.registerModel(comp.__modelInfo, function (n) {
          comp.setData({
            checked: !!n
          });
        });

        comp.setData({
          checked: !!modelVal
        });
      },
      handler: function (params) {
        var pageCache = util.app.globalData.__framework.pageCache, comp = this, modelInfo = comp.__modelInfo;
        var modelAttrName = modelInfo.attr;
        // var exp = comp.data[modelAttrName];
        pageCache.updateModel(modelInfo, params.value);
      }
    }
  };

  for (var k in models) {

    (function (type) {
      var modelUtil = models[type];
      var modelAttrName = 'v-model:' + type;
      properties[modelAttrName] = {
        type: String,
        observer: function (v, o) {
          if (!v) return;
          if (!this.__modelInfo) {
            var comp = this;
            var modelInfo = {
              attr: modelAttrName,
              get source() {
                return comp.data.modelFrom;
              },
              exp: v,
              handler: function (params) {
                modelUtil.handler && modelUtil.handler.call(comp, params);
              }
            };
            this.__modelInfo = modelInfo;

            this.__modelUtil = modelUtil;

            modelUtil.init && modelUtil.init.call(this);
          }
        }
      }

    })(k);

  }

  // modelFrom属性指明该model的值来源，为来源组件的id，若不指定则来源于当前页
  properties.modelFrom = {
    type: String,
    observer: function (v, o) {
      var modelUtil = this.__modelUtil;
      if (modelUtil) {
        // 当绑定id变化时，重新注册
        modelUtil.init && modelUtil.init.call(this);
      }
    }
  };

}

function formatProps(opt){
  var properties = opt.properties || {};
  return formatProps;
}



module.exports = function (Comp, tagName, absolutePath) {
  // 某个地址转为相对的绝对地址
  var getAbsolute = function (url) {
    if (url.indexOf('/') === 0) return url;
    var urls = url.split('/');
    var pageCache = util.app.globalData.__framework.pageCache;
    var pageUrl = absolutePath || pageCache.getPagePath(), pages = pageUrl.split('/');
    pages.pop(); // 去掉同级
    var arr = [], cur;
    while (cur = urls.shift()) {
      if (cur === '.') {

      } else if (cur === '..') {
        pages.pop();
      } else {
        arr.push(cur);
      }
    }
    var arr = pages.concat(arr);
    return arr.join('/');
  };
  var _Page = function (opt) {
    addPageLifetimes(opt, absolutePath);
    addMethods(opt, absolutePath, true);
    Comp(opt);
  };
  var _Comp = function (opt) {
    opt.tagName = tagName;
    // opt.externalClasses = ['slot-class'];
    // opt.options = {
    //   addGlobalClass: true
    // };
    var properties = formatProps(opt);
    addCompLifetimes(opt);
    bindModelHandler(opt);
    addValueOberser(opt);
    addMethods(opt, absolutePath);
    Comp(opt);
  };

  _Page.getAbsolute = _Comp.getAbsolute = getAbsolute;

  return {
    Page: _Page,
    Component: _Comp
  };
};