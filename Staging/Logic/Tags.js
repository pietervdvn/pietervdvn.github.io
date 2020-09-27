// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"Logic/UIEventSource.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UIEventSource = void 0;

var UIEventSource =
/** @class */
function () {
  function UIEventSource(data) {
    this._callbacks = [];
    this.data = data;
  }

  UIEventSource.prototype.addCallback = function (callback) {
    this._callbacks.push(callback);

    return this;
  };

  UIEventSource.prototype.addCallbackAndRun = function (callback) {
    callback(this.data);
    return this.addCallback(callback);
  };

  UIEventSource.prototype.setData = function (t) {
    if (this.data === t) {
      return;
    }

    this.data = t;
    this.ping();
    return this;
  };

  UIEventSource.prototype.ping = function () {
    for (var _i = 0, _a = this._callbacks; _i < _a.length; _i++) {
      var callback = _a[_i];
      callback(this.data);
    }
  };

  UIEventSource.flatten = function (source, possibleSources) {
    var _a;

    var sink = new UIEventSource((_a = source.data) === null || _a === void 0 ? void 0 : _a.data);
    source.addCallback(function (latestData) {
      sink.setData(latestData === null || latestData === void 0 ? void 0 : latestData.data);
    });

    for (var _i = 0, possibleSources_1 = possibleSources; _i < possibleSources_1.length; _i++) {
      var possibleSource = possibleSources_1[_i];
      possibleSource === null || possibleSource === void 0 ? void 0 : possibleSource.addCallback(function () {
        var _a;

        sink.setData((_a = source.data) === null || _a === void 0 ? void 0 : _a.data);
      });
    }

    return sink;
  };

  UIEventSource.prototype.map = function (f, extraSources, g) {
    if (extraSources === void 0) {
      extraSources = [];
    }

    if (g === void 0) {
      g = undefined;
    }

    var self = this;
    var newSource = new UIEventSource(f(this.data));

    var update = function update() {
      newSource.setData(f(self.data));
    };

    this.addCallback(update);

    for (var _i = 0, extraSources_1 = extraSources; _i < extraSources_1.length; _i++) {
      var extraSource = extraSources_1[_i];
      extraSource === null || extraSource === void 0 ? void 0 : extraSource.addCallback(update);
    }

    if (g !== undefined) {
      newSource.addCallback(function (latest) {
        self.setData(g(latest));
      });
    }

    return newSource;
  };

  UIEventSource.prototype.syncWith = function (otherSource, reverseOverride) {
    if (reverseOverride === void 0) {
      reverseOverride = false;
    }

    this.addCallback(function (latest) {
      return otherSource.setData(latest);
    });
    var self = this;
    otherSource.addCallback(function (latest) {
      return self.setData(latest);
    });

    if (reverseOverride && otherSource.data !== undefined) {
      this.setData(otherSource.data);
    } else if (this.data === undefined) {
      this.setData(otherSource.data);
    } else {
      otherSource.setData(this.data);
    }

    return this;
  };

  UIEventSource.prototype.stabilized = function (millisToStabilize) {
    var newSource = new UIEventSource(this.data);
    var currentCallback = 0;
    this.addCallback(function (latestData) {
      currentCallback++;
      var thisCallback = currentCallback;
      window.setTimeout(function () {
        if (thisCallback === currentCallback) {
          newSource.setData(latestData);
        }
      }, millisToStabilize);
    });
    return newSource;
  };

  UIEventSource.Chronic = function (millis) {
    var source = new UIEventSource(undefined);

    function run() {
      source.setData(new Date());
      window.setTimeout(run, millis);
    }

    run();
    return source;
  };

  return UIEventSource;
}();

exports.UIEventSource = UIEventSource;
},{}],"UI/UIElement.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UIElement = void 0;

var UIEventSource_1 = require("../Logic/UIEventSource");

var UIElement =
/** @class */
function (_super) {
  __extends(UIElement, _super);

  function UIElement(source) {
    if (source === void 0) {
      source = undefined;
    }

    var _this = _super.call(this, "") || this;

    _this.clss = [];
    _this._hideIfEmpty = false;
    _this.dumbMode = false;
    _this.id = "ui-element-" + UIElement.nextId;
    _this._source = source;
    UIElement.nextId++;
    _this.dumbMode = true;

    _this.ListenTo(source);

    return _this;
  }

  UIElement.prototype.ListenTo = function (source) {
    if (source === undefined) {
      return this;
    }

    this.dumbMode = false;
    var self = this;
    source.addCallback(function () {
      self.lastInnerRender = undefined;
      self.Update();
    });
    return this;
  };

  UIElement.prototype.onClick = function (f) {
    this.dumbMode = false;
    this._onClick = f;
    this.SetClass("clickable");
    this.Update();
    return this;
  };

  UIElement.prototype.IsHovered = function () {
    this.dumbMode = false;

    if (this._onHover !== undefined) {
      return this._onHover;
    } // Note: we just save it. 'Update' will register that an eventsource exist and install the necessary hooks


    this._onHover = new UIEventSource_1.UIEventSource(false);
    return this._onHover;
  };

  UIElement.prototype.Update = function () {
    if (UIElement.runningFromConsole) {
      return;
    }

    var element = document.getElementById(this.id);

    if (element === undefined || element === null) {
      // The element is not painted or, in the case of 'dumbmode' this UI-element is not explicitely present
      if (this.dumbMode) {
        // We update all the children anyway
        this.UpdateAllChildren();
      }

      return;
    }

    var newRender = this.InnerRender();

    if (newRender !== this.lastInnerRender) {
      this.lastInnerRender = newRender;
      this.setData(this.InnerRender());
      element.innerHTML = this.data;
    }

    if (this._hideIfEmpty) {
      if (element.innerHTML === "") {
        element.parentElement.style.display = "none";
      } else {
        element.parentElement.style.display = "block";
      }
    }

    if (this._onClick !== undefined) {
      var self_1 = this;

      element.onclick = function (e) {
        // @ts-ignore
        if (e.consumed) {
          return;
        }

        self_1._onClick(); // @ts-ignore


        e.consumed = true;
      };

      element.style.pointerEvents = "all";
      element.style.cursor = "pointer";
    }

    if (this._onHover !== undefined) {
      var self_2 = this;
      element.addEventListener('mouseover', function () {
        return self_2._onHover.setData(true);
      });
      element.addEventListener('mouseout', function () {
        return self_2._onHover.setData(false);
      });
    }

    this.InnerUpdate(element);
    this.UpdateAllChildren();
  };

  UIElement.prototype.UpdateAllChildren = function () {
    for (var i in this) {
      var child = this[i];

      if (child instanceof UIElement) {
        child.Update();
      } else if (child instanceof Array) {
        for (var _i = 0, child_1 = child; _i < child_1.length; _i++) {
          var ch = child_1[_i];

          if (ch instanceof UIElement) {
            ch.Update();
          }
        }
      }
    }
  };

  UIElement.prototype.HideOnEmpty = function (hide) {
    this._hideIfEmpty = hide;
    this.Update();
    return this;
  }; // Called after the HTML has been replaced. Can be used for css tricks


  UIElement.prototype.InnerUpdate = function (htmlElement) {};

  UIElement.prototype.Render = function () {
    this.lastInnerRender = this.InnerRender();

    if (this.dumbMode) {
      return this.lastInnerRender;
    }

    var style = "";

    if (this.style !== undefined && this.style !== "") {
      style = "style=\"" + this.style + "\" ";
    }

    var clss = "";

    if (this.clss.length > 0) {
      clss = "class='" + this.clss.join(" ") + "' ";
    }

    return "<span " + clss + style + "id='" + this.id + "'>" + this.lastInnerRender + "</span>";
  };

  UIElement.prototype.AttachTo = function (divId) {
    this.dumbMode = false;
    var element = document.getElementById(divId);

    if (element === null) {
      throw "SEVERE: could not attach UIElement to " + divId;
    }

    element.innerHTML = this.Render();
    this.Update();
    return this;
  };

  UIElement.prototype.IsEmpty = function () {
    return this.InnerRender() === "";
  };

  UIElement.prototype.SetClass = function (clss) {
    this.dumbMode = false;

    if (clss === "" && this.clss.length > 0) {
      this.clss = [];
      this.Update();
    } else if (this.clss.indexOf(clss) < 0) {
      this.clss.push(clss);
      this.Update();
    }

    return this;
  };

  UIElement.prototype.SetStyle = function (style) {
    this.dumbMode = false;
    this.style = style;
    this.Update();
    return this;
  };

  UIElement.nextId = 0;
  /**
   * In the 'deploy'-step, some code needs to be run by ts-node.
   * However, ts-node crashes when it sees 'document'. When running from console, we flag this and disable all code where document is needed.
   * This is a workaround and yet another hack
   */

  UIElement.runningFromConsole = false;
  return UIElement;
}(UIEventSource_1.UIEventSource);

exports.UIElement = UIElement;
},{"../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"Utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Utils = void 0;

var UIElement_1 = require("./UI/UIElement");

var Utils =
/** @class */
function () {
  function Utils() {}
  /**
   * Gives a clean float, or undefined if parsing fails
   * @param str
   */


  Utils.asFloat = function (str) {
    if (str) {
      var i = parseFloat(str);

      if (isNaN(i)) {
        return undefined;
      }

      return i;
    }

    return undefined;
  };

  Utils.Upper = function (str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  };

  Utils.DoEvery = function (millis, f) {
    if (UIElement_1.UIElement.runningFromConsole) {
      return;
    }

    window.setTimeout(function () {
      f();
      Utils.DoEvery(millis, f);
    }, millis);
  };

  Utils.NoNull = function (array) {
    var ls = [];

    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
      var t = array_1[_i];

      if (t === undefined || t === null) {
        continue;
      }

      ls.push(t);
    }

    return ls;
  };

  Utils.NoEmpty = function (array) {
    var ls = [];

    for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
      var t = array_2[_i];

      if (t === "") {
        continue;
      }

      ls.push(t);
    }

    return ls;
  };

  Utils.EllipsesAfter = function (str, l) {
    if (l === void 0) {
      l = 100;
    }

    if (str === undefined) {
      return undefined;
    }

    if (str.length <= l) {
      return str;
    }

    return str.substr(0, l - 3) + "...";
  };

  Utils.Dedup = function (arr) {
    if (arr === undefined) {
      return undefined;
    }

    var newArr = [];

    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
      var string = arr_1[_i];

      if (newArr.indexOf(string) < 0) {
        newArr.push(string);
      }
    }

    return newArr;
  };

  Utils.MergeTags = function (a, b) {
    var t = {};

    for (var k in a) {
      t[k] = a[k];
    }

    for (var k in b) {
      t[k] = b[k];
    }

    return t;
  };

  Utils.SplitFirst = function (a, sep) {
    var index = a.indexOf(sep);

    if (index < 0) {
      return [a];
    }

    return [a.substr(0, index), a.substr(index + sep.length)];
  };

  return Utils;
}();

exports.Utils = Utils;
},{"./UI/UIElement":"UI/UIElement.ts"}],"Logic/Tags.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArrays = this && this.__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TagUtils = exports.And = exports.Or = exports.Tag = exports.RegexTag = exports.TagsFilter = void 0;

var Utils_1 = require("../Utils");

var TagsFilter =
/** @class */
function () {
  function TagsFilter() {}

  TagsFilter.prototype.matchesProperties = function (properties) {
    return this.matches(TagUtils.proprtiesToKV(properties));
  };

  return TagsFilter;
}();

exports.TagsFilter = TagsFilter;

var RegexTag =
/** @class */
function (_super) {
  __extends(RegexTag, _super);

  function RegexTag(key, value, invert) {
    if (invert === void 0) {
      invert = false;
    }

    var _this = _super.call(this) || this;

    _this.key = key;
    _this.value = value;
    _this.invert = invert;
    return _this;
  }

  RegexTag.prototype.asOverpass = function () {
    if (typeof this.key === "string") {
      return ["['" + this.key + "'" + (this.invert ? "!" : "") + "~'" + RegexTag.source(this.value) + "']"];
    }

    return ["[~'" + this.key.source + "'" + (this.invert ? "!" : "") + "~'" + RegexTag.source(this.value) + "']"];
  };

  RegexTag.doesMatch = function (fromTag, possibleRegex) {
    if (typeof possibleRegex === "string") {
      return fromTag === possibleRegex;
    }

    return fromTag.match(possibleRegex) !== null;
  };

  RegexTag.source = function (r) {
    if (typeof r === "string") {
      return r;
    }

    return r.source;
  };

  RegexTag.prototype.isUsableAsAnswer = function () {
    return false;
  };

  RegexTag.prototype.matches = function (tags) {
    for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
      var tag = tags_1[_i];

      if (RegexTag.doesMatch(tag.k, this.key)) {
        return RegexTag.doesMatch(tag.v, this.value) != this.invert;
      }
    } // The matching key was not found


    return this.invert;
  };

  RegexTag.prototype.substituteValues = function (tags) {
    return this;
  };

  RegexTag.prototype.asHumanString = function () {
    if (typeof this.key === "string") {
      return "" + this.key + (this.invert ? "!" : "") + "~" + RegexTag.source(this.value);
    }

    return "" + this.key.source + (this.invert ? "!" : "") + "~~" + RegexTag.source(this.value);
  };

  RegexTag.prototype.isEquivalent = function (other) {
    if (other instanceof RegexTag) {
      return other.asHumanString() == this.asHumanString();
    }

    if (other instanceof Tag) {
      return RegexTag.doesMatch(other.key, this.key) && RegexTag.doesMatch(other.value, this.value);
    }

    return false;
  };

  return RegexTag;
}(TagsFilter);

exports.RegexTag = RegexTag;

var Tag =
/** @class */
function (_super) {
  __extends(Tag, _super);

  function Tag(key, value) {
    var _this = _super.call(this) || this;

    _this.key = key;
    _this.value = value;

    if (key === undefined || key === "") {
      throw "Invalid key: undefined or empty";
    }

    if (value === undefined) {
      throw "Invalid value: value is undefined";
    }

    if (value === "*") {
      console.warn("Got suspicious tag " + key + "=*   ; did you mean " + key + "~* ?");
    }

    return _this;
  }

  Tag.prototype.matches = function (tags) {
    for (var _i = 0, tags_2 = tags; _i < tags_2.length; _i++) {
      var tag = tags_2[_i];

      if (this.key == tag.k) {
        return this.value === tag.v;
      }
    } // The tag was not found


    if (this.value === "") {
      // and it shouldn't be found!
      return true;
    }

    return false;
  };

  Tag.prototype.asOverpass = function () {
    if (this.value === "") {
      // NOT having this key
      return ['[!"' + this.key + '"]'];
    }

    return ["[\"" + this.key + "\"=\"" + this.value + "\"]"];
  };

  Tag.prototype.substituteValues = function (tags) {
    return new Tag(this.key, TagUtils.ApplyTemplate(this.value, tags));
  };

  Tag.prototype.asHumanString = function (linkToWiki, shorten) {
    var v = this.value;

    if (shorten) {
      v = Utils_1.Utils.EllipsesAfter(v, 25);
    }

    if (linkToWiki) {
      return "<a href='https://wiki.openstreetmap.org/wiki/Key:" + this.key + "' target='_blank'>" + this.key + "</a>" + "=" + ("<a href='https://wiki.openstreetmap.org/wiki/Tag:" + this.key + "%3D" + this.value + "' target='_blank'>" + v + "</a>");
    }

    return this.key + "=" + v;
  };

  Tag.prototype.isUsableAsAnswer = function () {
    return true;
  };

  Tag.prototype.isEquivalent = function (other) {
    if (other instanceof Tag) {
      return this.key === other.key && this.value === other.value;
    }

    if (other instanceof RegexTag) {
      other.isEquivalent(this);
    }

    return false;
  };

  return Tag;
}(TagsFilter);

exports.Tag = Tag;

var Or =
/** @class */
function (_super) {
  __extends(Or, _super);

  function Or(or) {
    var _this = _super.call(this) || this;

    _this.or = or;
    return _this;
  }

  Or.prototype.matches = function (tags) {
    for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
      var tagsFilter = _a[_i];

      if (tagsFilter.matches(tags)) {
        return true;
      }
    }

    return false;
  };

  Or.prototype.asOverpass = function () {
    var choices = [];

    for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
      var tagsFilter = _a[_i];
      var subChoices = tagsFilter.asOverpass();

      for (var _b = 0, subChoices_1 = subChoices; _b < subChoices_1.length; _b++) {
        var subChoice = subChoices_1[_b];
        choices.push(subChoice);
      }
    }

    return choices;
  };

  Or.prototype.substituteValues = function (tags) {
    var newChoices = [];

    for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
      var c = _a[_i];
      newChoices.push(c.substituteValues(tags));
    }

    return new Or(newChoices);
  };

  Or.prototype.asHumanString = function (linkToWiki, shorten) {
    return this.or.map(function (t) {
      return t.asHumanString(linkToWiki, shorten);
    }).join("|");
  };

  Or.prototype.isUsableAsAnswer = function () {
    return false;
  };

  Or.prototype.isEquivalent = function (other) {
    if (other instanceof Or) {
      for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
        var selfTag = _a[_i];
        var matchFound = false;

        for (var i = 0; i < other.or.length && !matchFound; i++) {
          var otherTag = other.or[i];
          matchFound = selfTag.isEquivalent(otherTag);
        }

        if (!matchFound) {
          return false;
        }
      }

      return true;
    }

    return false;
  };

  return Or;
}(TagsFilter);

exports.Or = Or;

var And =
/** @class */
function (_super) {
  __extends(And, _super);

  function And(and) {
    var _this = _super.call(this) || this;

    _this.and = and;
    return _this;
  }

  And.prototype.matches = function (tags) {
    for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
      var tagsFilter = _a[_i];

      if (!tagsFilter.matches(tags)) {
        return false;
      }
    }

    return true;
  };

  And.combine = function (filter, choices) {
    var values = [];

    for (var _i = 0, choices_1 = choices; _i < choices_1.length; _i++) {
      var or = choices_1[_i];
      values.push(filter + or);
    }

    return values;
  };

  And.prototype.asOverpass = function () {
    var allChoices = null;

    for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
      var andElement = _a[_i];
      var andElementFilter = andElement.asOverpass();

      if (allChoices === null) {
        allChoices = andElementFilter;
        continue;
      }

      var newChoices = [];

      for (var _b = 0, allChoices_1 = allChoices; _b < allChoices_1.length; _b++) {
        var choice = allChoices_1[_b];
        newChoices.push.apply(newChoices, And.combine(choice, andElementFilter));
      }

      allChoices = newChoices;
    }

    return allChoices;
  };

  And.prototype.substituteValues = function (tags) {
    var newChoices = [];

    for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
      var c = _a[_i];
      newChoices.push(c.substituteValues(tags));
    }

    return new And(newChoices);
  };

  And.prototype.asHumanString = function (linkToWiki, shorten) {
    return this.and.map(function (t) {
      return t.asHumanString(linkToWiki, shorten);
    }).join("&");
  };

  And.prototype.isUsableAsAnswer = function () {
    for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
      var t = _a[_i];

      if (!t.isUsableAsAnswer()) {
        return false;
      }
    }

    return true;
  };

  And.prototype.isEquivalent = function (other) {
    if (other instanceof And) {
      for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
        var selfTag = _a[_i];
        var matchFound = false;

        for (var i = 0; i < other.and.length && !matchFound; i++) {
          var otherTag = other.and[i];
          matchFound = selfTag.isEquivalent(otherTag);
        }

        if (!matchFound) {
          return false;
        }
      }

      return true;
    }

    return false;
  };

  return And;
}(TagsFilter);

exports.And = And;

var TagUtils =
/** @class */
function () {
  function TagUtils() {}

  TagUtils.proprtiesToKV = function (properties) {
    var result = [];

    for (var k in properties) {
      result.push({
        k: k,
        v: properties[k]
      });
    }

    return result;
  };

  TagUtils.ApplyTemplate = function (template, tags) {
    for (var k in tags) {
      while (template.indexOf("{" + k + "}") >= 0) {
        var escaped = tags[k].replace(/</g, '&lt;').replace(/>/g, '&gt;');
        template = template.replace("{" + k + "}", escaped);
      }
    }

    return template;
  };

  TagUtils.KVtoProperties = function (tags) {
    var properties = {};

    for (var _i = 0, tags_3 = tags; _i < tags_3.length; _i++) {
      var tag = tags_3[_i];
      properties[tag.key] = tag.value;
    }

    return properties;
  };
  /**
   * Given multiple tagsfilters which can be used as answer, will take the tags with the same keys together as set.
   * E.g:
   *
   * FlattenMultiAnswer([and: [ "x=a", "y=0;1"], and: ["x=b", "y=2"], and: ["x=", "y=3"]])
   * will result in
   * ["x=a;b", "y=0;1;2;3"]
   *
   * @param tagsFilters
   * @constructor
   */


  TagUtils.FlattenMultiAnswer = function (tagsFilters) {
    var _a;

    if (tagsFilters === undefined) {
      return new And([]);
    }

    var keyValues = {}; // Map string -> string[]

    tagsFilters = __spreadArrays(tagsFilters);

    while (tagsFilters.length > 0) {
      var tagsFilter = tagsFilters.pop();

      if (tagsFilter === undefined) {
        continue;
      }

      if (tagsFilter instanceof And) {
        tagsFilters.push.apply(tagsFilters, tagsFilter.and);
        continue;
      }

      if (tagsFilter instanceof Tag) {
        if (keyValues[tagsFilter.key] === undefined) {
          keyValues[tagsFilter.key] = [];
        }

        (_a = keyValues[tagsFilter.key]).push.apply(_a, tagsFilter.value.split(";"));

        continue;
      }

      console.error("Invalid type to flatten the multiAnswer", tagsFilter);
      throw "Invalid type to FlattenMultiAnswer";
    }

    var and = [];

    for (var key in keyValues) {
      and.push(new Tag(key, Utils_1.Utils.Dedup(keyValues[key]).join(";")));
    }

    return new And(and);
  };
  /**
   * Splits the actualTags onto a list of which the values are the same as the tagsFilters.
   * Leftovers are returned in the list too if there is an 'undefined' value
   */


  TagUtils.SplitMultiAnswer = function (actualTags, possibleTags, freeformKey, freeformExtraTags) {
    var _a;

    var _b;

    var queue = [actualTags];
    var keyValues = {}; // key ==> value[]

    while (queue.length > 0) {
      var tf = queue.pop();

      if (tf instanceof And) {
        queue.push.apply(queue, tf.and);
        continue;
      }

      if (tf instanceof Tag) {
        if (keyValues[tf.key] === undefined) {
          keyValues[tf.key] = [];
        }

        (_a = keyValues[tf.key]).push.apply(_a, tf.value.split(";"));

        continue;
      }

      if (tf === undefined) {
        continue;
      }

      throw "Invalid tagfilter: " + JSON.stringify(tf);
    }

    var foundValues = [];

    for (var _i = 0, possibleTags_1 = possibleTags; _i < possibleTags_1.length; _i++) {
      var possibleTag = possibleTags_1[_i];

      if (possibleTag === undefined) {
        continue;
      }

      if (possibleTag instanceof Tag) {
        var key = possibleTag.key;
        var actualValues = (_b = keyValues[key]) !== null && _b !== void 0 ? _b : [];
        var possibleValues = possibleTag.value.split(";");
        var allPossibleValuesFound = true;

        for (var _c = 0, possibleValues_1 = possibleValues; _c < possibleValues_1.length; _c++) {
          var possibleValue = possibleValues_1[_c];

          if (actualValues.indexOf(possibleValue) < 0) {
            allPossibleValuesFound = false;
          }
        }

        if (!allPossibleValuesFound) {
          continue;
        } // At this point, we know that 'possibleTag' is completely present in the tagset
        // we add the possibleTag to the found values


        foundValues.push(possibleTag);

        for (var _d = 0, possibleValues_2 = possibleValues; _d < possibleValues_2.length; _d++) {
          var possibleValue = possibleValues_2[_d];
          actualValues.splice(actualValues.indexOf(possibleValue), 1);
        }

        continue;
      }

      throw "Unsupported possibletag: " + JSON.stringify(possibleTag);
    }

    var leftoverTag = undefined;

    if (keyValues[freeformKey] !== undefined && keyValues[freeformKey].length !== 0) {
      leftoverTag = new Tag(freeformKey, keyValues[freeformKey].join(";"));

      if (freeformExtraTags !== undefined) {
        leftoverTag = new And([leftoverTag, freeformExtraTags]);
      }

      foundValues.push(leftoverTag);
    }

    return foundValues;
  };

  return TagUtils;
}();

exports.TagUtils = TagUtils;
},{"../Utils":"Utils.ts"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "41243" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","Logic/Tags.ts"], null)
//# sourceMappingURL=/Logic/Tags.js.map