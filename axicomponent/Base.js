import parse from 'mini-html-parser2';

const util = {
  get app() {
    return getApp();
  },
  getEventName: function (evtName) {
    var names = evtName.split('');
    var first = names.shift();
    names.unshift(first.toUpperCase());
    return names.join('');
  },
  getTimeStamp: function () {
    return Math.round(new Date().getTime() / 1000);
  },
  wrapMethods(src, target, isPage) {
    if (!isPage) {
      src = src.methods || {};
      target = target.methods = target.methods || {};
      // 公共事件
      const f = src.f;
      src.f = function (e) {
        const rs = f && f.call(this, e);
        this.triggerEvent(e.type, e.detail, e);
        return rs;
      }
    }
    for (let k in src) {
      if (target[k]) continue;
      if (typeof src[k] === 'function') {
        const func = src[k];
        target[k] = function () {
          const comp = this.component;
          return func.apply(comp, arguments);
        };
      }
    }
  },
  wrapData(opts, data) {
    opts.data = data || {};
  },
  propToData(opt) {
    const properties = opt.properties = opt.properties || {}

    const nameProp = properties.name;
    properties.name = {
      type: String,
      observer: function (v, o) {
        const comp = this, pageCache = comp.__getPageCache();
        o && pageCache.name(o, comp, true);
        v && pageCache.name(v, comp)
        nameProp && nameProp.observer && nameProp.observer.apply(comp, arguments);
      }
    };

    const idProp = properties.id;
    properties.id = {
      type: String,
      observer: function (v, o) {
        const comp = this, pageCache = comp.__getPageCache();
        o && pageCache.id(o, null);
        v && pageCache.id(v, comp);
        idProp && idProp.observer && idProp.observer.apply(comp, arguments);
      }
    };

    opt.data = opt.data || {};
    for (const k in properties) {
      const prop = properties[k];
      let defaultVal = prop.value;
      opt.data[k] = typeof defaultVal === 'undefined' ? null : defaultVal;
    }
  },
  addCache(ctx) {
    const comp = ctx.component, pageCache = comp.__getPageCache(), props = ctx.props, name = props.name, id = props.id;
    pageCache.all(comp);
    name && pageCache.name(name, comp);
    id && pageCache.id(id, comp);
  },
  removeCache(ctx) {
    const comp = ctx.component, pageCache = comp.__getPageCache(), props = ctx.props, name = props.name, id = props.id;
    pageCache.all(comp, true);
    name && pageCache.name(name, comp, true);
    id && pageCache.id(id, null);
  },
  delay(cb) {
    var delayTime = 100;
    setTimeout(function () {
      cb();
    }, delayTime);
  },
  bindModelHandler: function bindModelHandler(opt) {

    var properties = opt.properties = opt.properties || {};

    var models = {
      text: {
        init: function () {
          var pageCache = this.__getPageCache(), comp = this;

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
          var pageCache = this.__getPageCache(), comp = this, modelInfo = comp.__modelInfo;
          var modelAttrName = modelInfo.attr;
          // var exp = comp.data[modelAttrName];
          pageCache.updateModel(modelInfo, params.value);
        }
      },
      checkbox: {
        init: function () {
          var pageCache = this.__getPageCache(), comp = this;

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
          var pageCache = this.__getPageCache(), comp = this, modelInfo = comp.__modelInfo;
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
          var pageCache = this.__getPageCache(), comp = this;

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
          var pageCache = this.__getPageCache(), comp = this, modelInfo = comp.__modelInfo;
          var modelAttrName = modelInfo.attr;
          // var exp = comp.data[modelAttrName];

          pageCache.updateModel(modelInfo, params.value);
        }
      },
      select: {
        init: function () {
          var pageCache = this.__getPageCache(), comp = this;

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
          var pageCache = this.__getPageCache(), comp = this, modelInfo = comp.__modelInfo;
          var modelAttrName = modelInfo.attr;
          // var exp = comp.data[modelAttrName];
          pageCache.updateModel(modelInfo, params.value);
        }
      },
      'switch': {
        init: function () {
          var pageCache = this.__getPageCache(), comp = this;

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
          var pageCache = this.__getPageCache(), comp = this, modelInfo = comp.__modelInfo;
          var modelAttrName = modelInfo.attr;
          // var exp = comp.data[modelAttrName];
          pageCache.updateModel(modelInfo, params.value);
        }
      }
    };

    for (var k in models) {

      (function (type) {
        var modelUtil = models[type];
        var modelAttrName = 'v-model-' + type;
        properties[modelAttrName] = {
          type: String,
          value: '',
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
};


class ComponentBase {

  constructor(ctx, opt) {

    this.ctx = ctx;
    this.observers = opt.observers || {};
    this.properties = opt.properties || {};
    this.absolutePath = opt.absolutePath;

    ctx.component = this;

    if (this.__createPageCache) this.__createPageCache(opt);

    this.__addMethods(ctx);

    this.__initProperties();
  }

  __addMethods(methods) {
    const comp = this, ctx = comp.ctx;
    for (let k in methods) {
      const method = methods[k];
      if (typeof method !== 'function' || comp[k]) continue;
      comp[k] = function () {
        // method已经被wrapper，所以应该传小程序对象本身为作用域
        return method.apply(ctx, arguments);
      }
    }
  }

  __initProperties() {
    const ctx = this.ctx, properties = this.properties, data = {}, props = ctx.props;

    for (let k in properties) {
      const prop = properties[k], defaultVal = prop.value, curVal = this.getAttrValue(k);
      // 没有设置值，且有默认值时进行初始化
      if (typeof curVal !== 'undefined') {
        data[k] = curVal;
      } else if (typeof defaultVal !== 'undefined') {
        data[k] = defaultVal;
      }
    }

    this.setData(data);
  }

  __getPageCache() {
    if (this.pageCache) return this.pageCache;
    const ctx = this.ctx, pageCtx = ctx.$page, pageComp = pageCtx.component;
    return this.pageCache = pageComp.pageCache;
  }

  __observersHandler(ks) {
    const observers = this.observers, funcs = [], properties = this.properties;

    // 变化的数据中如果有属性，则调用observer
    ks.forEach((k) => {
      const prop = properties[k];
      prop && prop.observer && prop.observer.call(this, this.data[k]);
    });

    // 当变化数据中有监听，则触发监听
    for (const line in observers) {
      const lines = line.split(',');
      let flag = false;
      for (let i = 0, len = lines.length; i < len; i++) {
        const l = lines[i].trim();
        if (ks.indexOf(l) > -1) {
          flag = true;
          break;
        }
      }
      if (flag) funcs.push(observers[line]);
    }
    funcs.forEach((func) => {
      func.call(this);
    });

  }

  get data() {
    return this.ctx.data;
  }

  getData() {
    return this.data;
  }

  // setData(data, noTrigger) {
  //   const arrData = {}, ks = [], ctx = this.ctx, pageCache = this.__getPageCache();
  //   for (const k in data) {
  //     ks.push(k);
  //     if (data[k] instanceof Array) {
  //       arrData[k] = data[k];
  //       delete data[k];
  //     }
  //     if (!noTrigger) pageCache.triggerModelUpdate(k, data[k]);
  //   }
  //   ctx.setData(data);
  //   ctx.$spliceData(arrData);
  //   this.__observersHandler(ks);

  // }

  setData(data, noTrigger) {
    const arrData = {}, ks = [], ctx = this.ctx, pageCache = this.__getPageCache();
    for (const k in data) {
      ks.push(k);
      // if (data[k] instanceof Array) {
      //   arrData[k] = data[k];
      //   delete data[k];
      // }
      if (!noTrigger) pageCache.triggerModelUpdate(k, data[k]);
    }
    ctx.setData(data);
    // ctx.$spliceData(arrData);
    this.__observersHandler(ks);

  }

  setNodes(name, nodes) {
    const data = {};
    if (typeof nodes === 'object') {
      data[name] = nodes;
      // nodes数据的变更必须使用原生的setData
      this.ctx.setData(data);
      return;
    }
    parse(nodes || '', (err, arr) => {
      data[name] = arr;
      this.ctx.setData(data);
    });
  }

  getAbsolute() {
    return this.absolutePath;
  }

  triggerEvent(evtName, detail, e) {
    const ctx = this.ctx, props = ctx.props;
    const funcName = util.getEventName(evtName);
    const func = props['on' + funcName] || props['catch' + funcName];
    e = e || {
      detail: detail,
      timeStamp: util.getTimeStamp()
    };
    e.type = evtName;
    func && func.call(this, e);
    if (['input', 'blur', 'change'].indexOf(evtName) > -1) {
      this.__modelInfo && this.__modelInfo.handler && this.__modelInfo.handler(detail || {});
    }
  }

  selectById(id) {
    const pageCache = this.__getPageCache();
    return pageCache.selectById(id);
  }

  selectByName(name) {
    const pageCache = this.__getPageCache();
    return pageCache.selectByName(name);
  }

  selectBySelector(selector) {
    const pageCache = this.__getPageCache();
    return pageCache.selectBySelector(selector);
  }

  getValueByName(name) {
    const pageCache = this.__getPageCache();
    return pageCache.getValueByName(name);
  }

  getValuesByName(name) {
    const pageCache = this.__getPageCache();
    return pageCache.getValuesByName(name);
  }

  getAttrValue(name) {
    const names = name.split('-');
    names.forEach((n, i) => {
      if (i === 0) return;
      const ns = n.split('');
      ns[0] = ns[0].toUpperCase();
      names[i] = ns.join('');
    });
    name = names.join('');
    return this.ctx.props[name];
  }

  getAbsolute(url) {
    if (url.indexOf('/') === 0) return url;
    var urls = url.split('/');
    var pageCache = this.__getPageCache();
    var pageUrl = this.absolutePath || pageCache.getPagePath(), pages = pageUrl.split('/');
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
  }

}

class PageCache {

  _names = {}; _all = []; _models = {}; _idCache = {};

  constructor(ctx, pageParams, absolutePath) {
    this.ctx = ctx;
    this.pageParams = pageParams;
    this.absolutePath = this.absolutePath;

    this.initSelector();
  }

  initSelector() {
    this.$selector = my.createSelectorQuery();
  }

  getPagePath() {
    return this.absolutePath;
  }

  getPageParams() {
    return this.pageParams;
  }

  id(id, comp) {
    const _idCache = this._idCache;
    if (arguments.length === 1) {
      return _idCache[id];
    }
    if (comp) {
      _idCache[id] = comp;
    } else {
      delete _idCache[id];
    }
  }

  name(name, comp, isDel) {
    const _names = this._names;
    _names[name] = _names[name] || [];
    if (isDel) {
      var index = _names[name].indexOf(comp);
      if (index > -1) _names[name].splice(index, 1);
    } else if (comp) {
      if (_names[name].indexOf(comp) === -1) _names[name].push(comp);
    } else {
      return (_names[name] || []).slice(0);
    }
  }

  all(comp, isDel) {
    const _all = this._all;
    if (isDel) {
      var index = _all.indexOf(comp);
      if (index > -1) _all.splice(index, 1);
    } else if (comp) {
      _all.push(comp);
    } else {
      return _all.slice(0);
    }
  }

  selectById(id) {
    const comp = this.id(id);
    return comp;
  }

  selectByName(name) {
    const comps = this.name(name) || [];
    return comps;
  }

  selectBySelector(selector, isFirst) {
    const comps = this.all() || [], rs = [];
    const handlers = {
      '.': function (comp, val) {
        val = val.substring(1);
        const ctx = comp.ctx, className = ctx.props.className || '', cs = className.split(/ /g);
        return cs.indexOf(val) > -1 ? true : false;
      },
      '#': function (comp, val) {
        const ctx = comp.ctx, ids = '#' + (ctx.props.id || '');
        return ids === val;
      }
    };
    const type = selector.substring(0, 1), handler = handlers[type];
    if (!handler) return isFirst ? rs[0] : rs;
    for (let i = 0, len = comps.length; i < len; i++) {
      const comp = comps[i];
      if (handler(comp, selector)) rs.push(comp);
    }
    return isFirst ? rs[0] : rs;
  }

  getValueByName(name) {
    var comps = this.selectByName(name) || [], rs = '';
    for (let i = 0, len = comps.length; i < len; i++) {
      if (comps[i].data.checked) {
        rs = comps[i].data.value;
        break;
      }
    }
    return rs;
  }

  getValuesByName(name) {
    var comps = this.selectByName(name) || [], rs = [];
    for (let i = 0, len = comps.length; i < len; i++) {
      if (comps[i].data.checked) {
        rs.push(comps[i].data.value);
      }
    }
    return rs;
  }

  setData() {
    const ctx = this.ctx;
    ctx.setData.apply(ctx, arguments);
  }

  registerModel(modelInfo, cb) {
    const _models = this._models;
    var models = _models[modelInfo.exp] = _models[modelInfo.exp] || [];
    if (models.indexOf(modelInfo) === -1) {
      modelInfo.cb = cb;
      models.push(modelInfo);
    }
    return this.getValueFromModel(modelInfo);
  }

  getModelCtx(modelInfo) {
    return modelInfo.source ? this.selectById(modelInfo.source) : this.ctx;
  }

  getValueFromModel(modelInfo) {
    var exps = modelInfo.exp.split('.'), e, comp = this.getModelCtx(modelInfo), data = comp.getData(), cur;
    while (e = exps.shift()) {
      cur = (cur || data)[e];
    }
    return cur;
  }

  updateModel(modelInfo, val) {
    var comp = this.getModelCtx(modelInfo);
    var obj = {};
    obj[modelInfo.exp] = val;

    // comp.ctx.setData(obj);
    // comp.__observersHandler([modelInfo.exp]);

    comp.setData(obj, true);
  }

  triggerModelUpdate(exp, v, comp) {
    comp = comp || this.ctx;
    var _models = this._models, models = _models[exp] = _models[exp] || [];
    models.forEach((modelInfo) => {
      var target = this.getModelCtx(modelInfo);
      if (target === comp) modelInfo.cb && modelInfo.cb(v);
    });
  }

  handlerObservers(ctx, keyArr) {
    if (keyArr.length === 0) return;
    var observers = this.ctx.observers;
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


}


class PageBase extends ComponentBase {

  constructor(ctx, opt) {
    super(ctx, opt);
    // this.__createPageCache(opt);
  }

  __createPageCache(opt) {
    this.pageCache = new PageCache(this, opt.pageParams, opt.absolutePath);
    this.__setPageCache();
  }

  __setPageCache() {
    const app = util.app;
    app.globalData.__framework.pageCache = this.pageCache;

  }
}



module.exports = function (Context, tagName, absolutePath) {

  // 某个地址转为相对的绝对地址
  function getAbsolute(url) {
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
  }

  function _Page(opt) {
    const { observers, onLoad, onShow } = opt;

    const opts = {
      onLoad(query) {
        new PageBase(this, {
          observers,
          pageParams: query,
          absolutePath
        });
        const comp = this.component;
        util.delay(function () {
          onLoad && onLoad.call(comp);
        });

      },
      onShow() {
        this.component.__setPageCache();
      }
    };

    util.wrapData(opts, opt.data);
    util.wrapMethods(opt, opts, true);

    Context(opts);
  }

  function _Comp(opt) {

    util.bindModelHandler(opt);
    util.propToData(opt);

    const { observers, properties, created, attached } = opt;

    const opts = {
      didMount() {
        new ComponentBase(this, {
          properties,
          observers,
          absolutePath
        });
        const comp = this.component;
        util.addCache(this);
        created && created.call(comp);
        attached && attached.call(comp);
      },
      didUpdate(prevProps, prevData) {
        const comp = this.component, props = this.props, data = {}, properties = comp.properties;
        for (const k in prevProps) {
          if (prevProps[k] !== props[k]) {
            data[k] = props[k];
          }
        }
        comp.setData(data);
        for (const k in data) {
          const prop = properties[k];
          prop && prop.observer && prop.observer.call(comp, data[k]);
        }
      },
      didUnmount() {
        util.removeCache(this);
      }
    };

    util.wrapData(opts, opt.data);
    util.wrapMethods(opt, opts);

    Context(opts);
  }

  _Page.getAbsolute = _Comp.getAbsolute = getAbsolute;

  return {
    Page: _Page,
    Component: _Comp
  };
};


