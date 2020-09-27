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
},{"../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"Logic/Web/LocalStorageSource.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalStorageSource = void 0;

var UIEventSource_1 = require("../UIEventSource");

var LocalStorageSource =
/** @class */
function () {
  function LocalStorageSource() {}

  LocalStorageSource.Get = function (key, defaultValue) {
    if (defaultValue === void 0) {
      defaultValue = undefined;
    }

    try {
      var saved = localStorage.getItem(key);
      var source = new UIEventSource_1.UIEventSource(saved !== null && saved !== void 0 ? saved : defaultValue);
      source.addCallback(function (data) {
        localStorage.setItem(key, data);
      });
      return source;
    } catch (e) {
      return new UIEventSource_1.UIEventSource(defaultValue);
    }
  };

  return LocalStorageSource;
}();

exports.LocalStorageSource = LocalStorageSource;
},{"../UIEventSource":"Logic/UIEventSource.ts"}],"UI/i18n/Locale.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var UIElement_1 = require("../UIElement");

var LocalStorageSource_1 = require("../../Logic/Web/LocalStorageSource");

var Locale =
/** @class */
function () {
  function Locale() {}

  Locale.setup = function () {
    var source = LocalStorageSource_1.LocalStorageSource.Get('language', "en");

    if (!UIElement_1.UIElement.runningFromConsole) {
      // @ts-ignore
      window.setLanguage = function (language) {
        source.setData(language);
      };
    }

    return source;
  };

  Locale.language = Locale.setup();
  return Locale;
}();

exports.default = Locale;
},{"../UIElement":"UI/UIElement.ts","../../Logic/Web/LocalStorageSource":"Logic/Web/LocalStorageSource.ts"}],"UI/Base/FixedUiElement.ts":[function(require,module,exports) {
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
exports.FixedUiElement = void 0;

var UIElement_1 = require("../UIElement");

var FixedUiElement =
/** @class */
function (_super) {
  __extends(FixedUiElement, _super);

  function FixedUiElement(html) {
    var _this = _super.call(this, undefined) || this;

    _this._html = html !== null && html !== void 0 ? html : "";
    return _this;
  }

  FixedUiElement.prototype.InnerRender = function () {
    return this._html;
  };

  return FixedUiElement;
}(UIElement_1.UIElement);

exports.FixedUiElement = FixedUiElement;
},{"../UIElement":"UI/UIElement.ts"}],"Utils.ts":[function(require,module,exports) {
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
},{"./UI/UIElement":"UI/UIElement.ts"}],"UI/Base/Combine.ts":[function(require,module,exports) {
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

var UIElement_1 = require("../UIElement");

var FixedUiElement_1 = require("./FixedUiElement");

var Utils_1 = require("../../Utils");

var Combine =
/** @class */
function (_super) {
  __extends(Combine, _super);

  function Combine(uiElements) {
    var _this = _super.call(this) || this;

    _this.uiElements = Utils_1.Utils.NoNull(uiElements).map(function (el) {
      if (typeof el === "string") {
        return new FixedUiElement_1.FixedUiElement(el);
      }

      return el;
    });
    return _this;
  }

  Combine.prototype.InnerRender = function () {
    return this.uiElements.map(function (ui) {
      return ui.Render();
    }).join("");
  };

  return Combine;
}(UIElement_1.UIElement);

exports.default = Combine;
},{"../UIElement":"UI/UIElement.ts","./FixedUiElement":"UI/Base/FixedUiElement.ts","../../Utils":"Utils.ts"}],"UI/i18n/Translation.ts":[function(require,module,exports) {
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

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var UIElement_1 = require("../UIElement");

var Locale_1 = __importDefault(require("./Locale"));

var Combine_1 = __importDefault(require("../Base/Combine"));

var Utils_1 = require("../../Utils");

var Translation =
/** @class */
function (_super) {
  __extends(Translation, _super);

  function Translation(translations) {
    var _this = _super.call(this, Locale_1.default.language) || this;

    var count = 0;

    for (var translationsKey in translations) {
      count++;
    }

    _this.translations = translations;
    return _this;
  }

  Translation.prototype.Subs = function (text) {
    var newTranslations = {};

    for (var lang in this.translations) {
      var template = this.translations[lang];

      for (var k in text) {
        var combined = [];
        var parts = template.split("{" + k + "}");
        var el = text[k];

        if (el === undefined) {
          continue;
        }

        var rtext = "";

        if (typeof el === "string") {
          rtext = el;
        } else {
          Translation.forcedLanguage = lang; // This is a very dirty hack - it'll bite me one day

          rtext = el.InnerRender();
        }

        for (var i = 0; i < parts.length - 1; i++) {
          combined.push(parts[i]);
          combined.push(rtext);
        }

        combined.push(parts[parts.length - 1]);
        template = new Combine_1.default(combined).InnerRender();
      }

      newTranslations[lang] = template;
    }

    Translation.forcedLanguage = undefined;
    return new Translation(newTranslations);
  };

  Object.defineProperty(Translation.prototype, "txt", {
    get: function get() {
      var _a;

      if (this.translations["*"]) {
        return this.translations["*"];
      }

      var txt = this.translations[(_a = Translation.forcedLanguage) !== null && _a !== void 0 ? _a : Locale_1.default.language.data];

      if (txt !== undefined) {
        return txt;
      }

      var en = this.translations["en"];

      if (en !== undefined) {
        return en;
      }

      for (var i in this.translations) {
        return this.translations[i]; // Return a random language
      }

      console.error("Missing language ", Locale_1.default.language.data, "for", this.translations);
      return undefined;
    },
    enumerable: false,
    configurable: true
  });

  Translation.prototype.InnerRender = function () {
    return this.txt;
  };

  Translation.prototype.replace = function (a, b) {
    var _a;

    if (a.startsWith("{") && a.endsWith("}")) {
      a = a.substr(1, a.length - 2);
    }

    var result = this.Subs((_a = {}, _a[a] = b, _a));
    return result;
  };

  Translation.prototype.Clone = function () {
    return new Translation(this.translations);
  };

  Translation.prototype.FirstSentence = function () {
    var tr = {};

    for (var lng in this.translations) {
      var txt = this.translations[lng];
      txt = txt.replace(/\..*/, "");
      txt = Utils_1.Utils.EllipsesAfter(txt, 255);
      tr[lng] = txt;
    }

    return new Translation(tr);
  };

  Translation.forcedLanguage = undefined;
  return Translation;
}(UIElement_1.UIElement);

exports.default = Translation;
},{"../UIElement":"UI/UIElement.ts","./Locale":"UI/i18n/Locale.ts","../Base/Combine":"UI/Base/Combine.ts","../../Utils":"Utils.ts"}],"UI/i18n/Translations.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Translation_1 = __importDefault(require("./Translation"));

var Translation_2 = __importDefault(require("./Translation"));

var FixedUiElement_1 = require("../Base/FixedUiElement");

var Translations =
/** @class */
function () {
  function Translations() {
    throw "Translations is static. If you want to intitialize a new translation, use the singular form";
  }

  Translations.W = function (s) {
    if (typeof s === "string") {
      return new FixedUiElement_1.FixedUiElement(s);
    }

    return s;
  };

  Translations.WT = function (s) {
    if (typeof s === "string") {
      return new Translation_1.default({
        en: s
      });
    }

    return s;
  };

  Translations.CountTranslations = function () {
    var queue = [Translations.t];
    var tr = [];

    while (queue.length > 0) {
      var item = queue.pop();

      if (item instanceof Translation_1.default || item.translations !== undefined) {
        tr.push(item);
      } else if (typeof item === "string") {
        console.warn("Got single string in translationgs file: ", item);
      } else {
        for (var t in item) {
          var x = item[t];
          queue.push(x);
        }
      }
    }

    var langaugeCounts = {};

    for (var _i = 0, tr_1 = tr; _i < tr_1.length; _i++) {
      var translation = tr_1[_i];

      for (var language in translation.translations) {
        if (langaugeCounts[language] === undefined) {
          langaugeCounts[language] = 1;
        } else {
          langaugeCounts[language]++;
        }
      }
    }

    for (var language in langaugeCounts) {
      console.log("Total translations in ", language, langaugeCounts[language], "/", tr.length);
    }
  };

  Translations.t = {
    image: {
      addPicture: new Translation_2.default({
        en: 'Add picture',
        es: 'Añadir foto',
        ca: 'Afegir foto',
        nl: 'Voeg foto toe',
        fr: 'Ajoutez une photo',
        gl: 'Engadir imaxe',
        de: "Bild hinzufügen"
      }),
      uploadingPicture: new Translation_2.default({
        en: 'Uploading your picture...',
        nl: 'Bezig met een foto te uploaden...',
        es: 'Subiendo tu imagen ...',
        ca: 'Pujant la teva imatge ...',
        fr: 'Mettre votre photo en ligne',
        gl: 'Subindo a túa imaxe...',
        de: 'Ihr Bild hochladen...'
      }),
      uploadingMultiple: new Translation_2.default({
        en: "Uploading {count} of your picture...",
        nl: "Bezig met {count} foto's te uploaden...",
        ca: "Pujant {count} de la teva imatge...",
        es: "Subiendo {count} de tus fotos...",
        fr: "Mettre votre {count} photos en ligne",
        gl: "Subindo {count} das túas imaxes...",
        de: "{count} Ihrer Bilder hochgeladen..."
      }),
      pleaseLogin: new Translation_2.default({
        en: 'Please login to add a picure',
        nl: 'Gelieve je aan te melden om een foto toe te voegen',
        es: 'Entra para subir una foto',
        ca: 'Entra per pujar una foto',
        fr: 'Connectez vous pour mettre une photo en ligne',
        gl: 'Inicia a sesión para subir unha imaxe',
        de: 'Bitte einloggen, um ein Bild hinzuzufügen'
      }),
      willBePublished: new Translation_2.default({
        en: 'Your picture will be published: ',
        es: 'Tu foto será publicada: ',
        ca: 'La teva foto serà publicada: ',
        nl: 'Jouw foto wordt gepubliceerd: ',
        fr: 'Votre photo va être publié: ',
        gl: 'A túa imaxe será publicada: ',
        de: 'Ihr Bild wird veröffentlicht: '
      }),
      cco: new Translation_2.default({
        en: 'in the public domain',
        ca: 'en domini públic',
        es: 'en dominio público',
        nl: 'in het publiek domein',
        fr: 'sur le domaine publique',
        gl: 'no dominio público',
        de: 'in die Public Domain'
      }),
      ccbs: new Translation_2.default({
        en: 'under the CC-BY-SA-license',
        nl: 'onder de CC-BY-SA-licentie',
        ca: 'sota llicència CC-BY-SA',
        es: 'bajo licencia CC-BY-SA',
        fr: 'sous la license CC-BY-SA',
        gl: 'baixo a licenza CC-BY-SA',
        de: 'unter der CC-BY-SA-Lizenz'
      }),
      ccb: new Translation_2.default({
        en: 'under the CC-BY-license',
        ca: 'sota la llicència CC-BY',
        es: 'bajo licencia CC-BY',
        nl: 'onder de CC-BY-licentie',
        fr: 'sous la license CC-BY',
        gl: 'baixo a licenza CC-BY',
        de: 'unter der CC-BY-Lizenz'
      }),
      uploadFailed: new Translation_2.default({
        en: "Could not upload your picture. Do you have internet and are third party API's allowed? Brave browser or UMatrix might block them.",
        nl: "Afbeelding uploaden mislukt. Heb je internet? Gebruik je Brave of UMatrix? Dan moet je derde partijen toelaten.",
        ca: "No s\'ha pogut carregar la imatge. Tens Internet i es permeten API de tercers? El navegador Brave o UMatrix podria bloquejar-les.",
        es: "No se pudo cargar la imagen. ¿Tienes Internet y se permiten API de terceros? El navegador Brave o UMatrix podría bloquearlas.",
        fr: "L'ajout de la photo a échoué. Êtes-vous connecté à Internet?",
        gl: "Non foi posíbel subir a imaxe. Tes internet e permites API de terceiros? O navegador Brave ou UMatrix podería bloquealas.",
        de: "Wir konnten Ihr Bild nicht hochladen. Haben Sie Internet und sind API's von Dritten erlaubt? Brave Browser oder UMatrix blockieren evtl.."
      }),
      respectPrivacy: new Translation_2.default({
        en: "Please respect privacy. Do not photograph people nor license plates",
        ca: "Respecta la privacitat. No fotografiïs gent o matrícules",
        es: "Respeta la privacidad. No fotografíes gente o matrículas",
        nl: "Respecteer privacy. Fotografeer geen mensen of nummerplaten",
        fr: "Merci de respecter la vie privée. Ne publiez pas les plaques d\'immatriculation",
        gl: "Respecta a privacidade. Non fotografes xente ou matrículas",
        de: "Bitte respektieren Sie die Privatsphäre. Fotografieren Sie weder Personen noch Nummernschilder"
      }),
      uploadDone: new Translation_2.default({
        en: "<span class='thanks'>Your picture has been added. Thanks for helping out!</span>",
        ca: "<span class='thanks'>La teva imatge ha estat afegida. Gràcies per ajudar.</span>",
        es: "<span class='thanks'>Tu imagen ha sido añadida. Gracias por ayudar.</span>",
        nl: "<span class='thanks'>Je afbeelding is toegevoegd. Bedankt om te helpen!</span>",
        fr: "<span class='thanks'>Votre photo est ajouté. Merci beaucoup!</span>",
        gl: "<span class='thanks'>A túa imaxe foi engadida. Grazas por axudar.</span>",
        de: "<span class='thanks'>Ihr Bild wurde hinzugefügt. Vielen Dank für Ihre Hilfe!</span>"
      }),
      dontDelete: new Translation_2.default({
        "nl": "Terug",
        "en": "Cancel",
        "de": "Abbrechen"
      }),
      doDelete: new Translation_2.default({
        "nl": "Verwijder afbeelding",
        "en": "Remove image",
        "de": "Bild entfernen"
      }),
      isDeleted: new Translation_2.default({
        "nl": "Verwijderd",
        "en": "Deleted",
        "de": "Gelöscht"
      })
    },
    centerMessage: {
      loadingData: new Translation_2.default({
        en: 'Loading data...',
        ca: 'Carregant dades...',
        es: 'Cargando datos...',
        nl: 'Data wordt geladen...',
        fr: 'Chargement des données',
        gl: 'Cargando os datos...',
        de: 'Daten werden geladen...'
      }),
      zoomIn: new Translation_2.default({
        en: 'Zoom in to view or edit the data',
        ca: 'Amplia per veure o editar les dades',
        es: 'Amplía para ver o editar los datos',
        nl: 'Zoom in om de data te zien en te bewerken',
        fr: 'Rapprochez vous sur la carte pour voir ou éditer les données',
        gl: 'Achégate para ollar ou editar os datos',
        de: 'Vergrößern, um die Daten anzuzeigen oder zu bearbeiten'
      }),
      ready: new Translation_2.default({
        en: "Done!",
        ca: "Fet.",
        es: "Hecho.",
        nl: "Klaar!",
        fr: "Finis!",
        gl: "Feito!",
        de: "Erledigt!"
      }),
      retrying: new Translation_2.default({
        en: "Loading data failed. Trying again... ({count})",
        ca: "La càrrega de dades ha fallat.Tornant-ho a intentar... ({count})",
        es: "La carga de datos ha fallado.Volviéndolo a probar... ({count})",
        gl: "A carga dos datos fallou. Tentándoo de novo... ({count})",
        de: "Laden von Daten fehlgeschlagen. Erneuter Versuch... ({count})"
      })
    },
    general: {
      loginWithOpenStreetMap: new Translation_2.default({
        en: "Login with OpenStreetMap",
        ca: "Entra a OpenStreetMap",
        es: "Entra en OpenStreetMap",
        nl: "Aanmelden met OpenStreetMap",
        fr: 'Se connecter avec OpenStreeMap',
        gl: "Inicia a sesión no OpenStreetMap",
        de: "Anmeldung mit OpenStreetMap"
      }),
      welcomeBack: new Translation_2.default({
        en: "You are logged in, welcome back!",
        ca: "Has entrat, benvingut.",
        es: "Has entrado, bienvenido.",
        nl: "Je bent aangemeld. Welkom terug!",
        fr: "Vous êtes connecté, bienvenue",
        gl: "Iniciaches a sesión, benvido.",
        de: "Sie sind eingeloggt, willkommen zurück!"
      }),
      loginToStart: new Translation_2.default({
        en: "Login to answer this question",
        ca: "Entra per contestar aquesta pregunta",
        es: "Entra para contestar esta pregunta",
        nl: "Meld je aan om deze vraag te beantwoorden",
        fr: "Connectez vous pour répondre à cette question",
        gl: "Inicia a sesión para responder esta pregunta",
        de: "Anmelden, um diese Frage zu beantworten"
      }),
      search: {
        search: new Translation_1.default({
          en: "Search a location",
          ca: "Cerca una ubicació",
          es: "Busca una ubicación",
          nl: "Zoek naar een locatie",
          fr: "Chercher une location",
          gl: "Procurar unha localización",
          de: "Einen Ort suchen"
        }),
        searching: new Translation_1.default({
          en: "Searching...",
          ca: "Cercant...",
          es: "Buscando...",
          nl: "Aan het zoeken...",
          fr: "Chargement",
          gl: "Procurando...",
          de: "Auf der Suche..."
        }),
        nothing: new Translation_1.default({
          en: "Nothing found...",
          ca: "Res trobat.",
          es: "Nada encontrado.",
          nl: "Niet gevonden...",
          fr: "Rien n'a été trouvé ",
          gl: "Nada atopado...",
          de: "Nichts gefunden..."
        }),
        error: new Translation_1.default({
          en: "Something went wrong...",
          ca: "Alguna cosa no ha sortit bé...",
          es: "Alguna cosa no ha ido bien...",
          nl: "Niet gelukt...",
          fr: "Quelque chose n\'a pas marché...",
          gl: "Algunha cousa non foi ben...",
          de: "Etwas ging schief..."
        })
      },
      returnToTheMap: new Translation_2.default({
        en: "Return to the map",
        ca: "Tornar al mapa",
        es: "Volver al mapa",
        nl: "Naar de kaart",
        fr: "Retourner sur la carte",
        gl: "Voltar ó mapa",
        de: "Zurück zur Karte"
      }),
      save: new Translation_2.default({
        en: "Save",
        ca: "Desar",
        es: "Guardar",
        nl: "Opslaan",
        fr: "Sauvegarder",
        gl: "Gardar",
        de: "Speichern"
      }),
      cancel: new Translation_2.default({
        en: "Cancel",
        ca: "Cancel·lar",
        es: "Cancelar",
        nl: "Annuleren",
        fr: "Annuler",
        gl: "Desbotar",
        de: "Abbrechen"
      }),
      skip: new Translation_2.default({
        en: "Skip this question",
        ca: "Saltar aquesta pregunta",
        es: "Saltar esta pregunta",
        nl: "Vraag overslaan",
        fr: "Passer la question",
        gl: "Ignorar esta pregunta",
        de: "Diese Frage überspringen"
      }),
      oneSkippedQuestion: new Translation_2.default({
        en: "One question is skipped",
        ca: "Has ignorat una pregunta",
        es: "Has ignorado una pregunta",
        nl: "Een vraag is overgeslaan",
        fr: "Une question a été passé",
        gl: "Ignoraches unha pregunta",
        de: "Eine Frage wurde übersprungen"
      }),
      skippedQuestions: new Translation_2.default({
        en: "Some questions are skipped",
        ca: "Has ignorat algunes preguntes",
        es: "Has ignorado algunas preguntas",
        nl: "Sommige vragen zijn overgeslaan",
        fr: "Questions passées",
        gl: "Ignoraches algunhas preguntas",
        de: "Einige Fragen wurden übersprungen"
      }),
      number: new Translation_2.default({
        en: "number",
        ca: "nombre",
        es: "número",
        nl: "getal",
        fr: "Nombre",
        gl: "número",
        de: "Zahl"
      }),
      osmLinkTooltip: new Translation_2.default({
        en: "See this object on OpenStreetMap for history and more editing options",
        ca: "Mira aquest objecte a OpenStreetMap per veure historial i altres opcions d\'edició",
        es: "Mira este objeto en OpenStreetMap para ver historial y otras opciones de edición",
        nl: "Bekijk dit object op OpenStreetMap waar geschiedenis en meer aanpasopties zijn",
        fr: "Voir l'historique de cet objet sur OpenStreetMap et plus d'options d'édition",
        gl: "Ollar este obxecto no OpenStreetMap para ollar o historial e outras opcións de edición",
        de: "Dieses Objekt auf OpenStreetMap anschauen für die Geschichte und weitere Bearbeitungsmöglichkeiten"
      }),
      add: {
        addNew: new Translation_2.default({
          en: "Add a new {category} here",
          ca: "Afegir {category} aquí",
          es: "Añadir {category} aquí",
          nl: "Voeg hier een {category} toe",
          fr: "Ajouter un/une {category} ici",
          gl: "Engadir {category} aquí",
          de: "Hier eine neue {category} hinzufügen"
        }),
        header: new Translation_2.default({
          en: "<h2>Add a point?</h2>You clicked somewhere where no data is known yet.<br/>",
          ca: "<h2>Vols afegir un punt?</h2>Has marcat un lloc on no coneixem les dades.<br/>",
          es: "<h2>Quieres añadir un punto?</h2>Has marcado un lugar del que no conocemos los datos.<br/>",
          nl: "<h2>Punt toevoegen?</h2>Je klikte ergens waar er nog geen data is. Kies hieronder welk punt je wilt toevoegen<br/>",
          fr: "<h2>Pas de données</h2>Vous avez cliqué sur un endroit ou il n'y a pas encore de données. <br/>",
          gl: "<h2>Queres engadir un punto?</h2>Marcaches un lugar onde non coñecemos os datos.<br/>",
          de: "<h2>Punkt hinzufügen?</h2>Sie haben irgendwo geklickt, wo noch keine Daten bekannt sind.<br/>"
        }),
        pleaseLogin: new Translation_2.default({
          en: "<a class='activate-osm-authentication'>Please log in to add a new point</a>",
          ca: "<a class='activate-osm-authentication'>Entra per afegir un nou punt</a>",
          es: "<a class='activate-osm-authentication'>Entra para añadir un nuevo punto</a>",
          nl: "<a class='activate-osm-authentication'>Gelieve je aan te melden om een punt to te voegen</a>",
          fr: "<a class='activate-osm-authentication'>Vous devez vous connecter pour ajouter un point</a>",
          gl: "<a class='activate-osm-authentication'>Inicia a sesión para engadir un novo punto</a>",
          de: "<a class='activate-osm-authentication'>Bitte loggen Sie sich ein, um einen neuen Punkt hinzuzufügen</a>"
        }),
        zoomInFurther: new Translation_2.default({
          en: "Zoom in further to add a point.",
          ca: "Apropa per afegir un punt.",
          es: "Acerca para añadir un punto.",
          nl: "Gelieve verder in te zoomen om een punt toe te voegen.",
          fr: "Rapprochez vous pour ajouter un point.",
          gl: "Achégate para engadir un punto.",
          de: "Weiter einzoomen, um einen Punkt hinzuzufügen."
        }),
        stillLoading: new Translation_2.default({
          en: "The data is still loading. Please wait a bit before you add a new point.",
          ca: "Les dades es segueixen carregant. Espera una mica abans d\'afegir cap punt.",
          es: "Los datos se siguen cargando. Espera un poco antes de añadir ningún punto.",
          nl: "De data wordt nog geladen. Nog even geduld en dan kan je een punt toevoegen.",
          fr: "Chargement des donnés. Patientez un instant avant d'ajouter un nouveau point.",
          gl: "Os datos seguen a cargarse. Agarda un intre antes de engadir ningún punto.",
          de: "Die Daten werden noch geladen. Bitte warten Sie etwas, bevor Sie einen neuen Punkt hinzufügen."
        }),
        confirmIntro: new Translation_2.default({
          en: "<h3>Add a {title} here?</h3>The point you create here will be <b>visible for everyone</b>. Please, only add things on to the map if they truly exist. A lot of applications use this data.",
          ca: "<h3>Afegir {title} aquí?</h3>El punt que estàs creant <b>el veurà tothom</b>. Només afegeix coses que realment existeixin. Moltes aplicacions fan servir aquestes dades.",
          es: "<h3>Añadir {title} aquí?</h3>El punto que estás creando <b>lo verá todo el mundo</b>. Sólo añade cosas que realmente existan. Muchas aplicaciones usan estos datos.",
          nl: "<h3>Voeg hier een {title} toe?</h3>Het punt dat je hier toevoegt, is <b>zichtbaar voor iedereen</b>. Veel applicaties gebruiken deze data, voeg dus enkel punten toe die echt bestaan.",
          fr: "<h3>Ajouter un/une {title} ici?</h3>Le point que vous ajouter sera visible par tout le monde. Merci d'etre sûr que ce point existe réellement. Beaucoup d'autres applications reposent sur ces données.",
          gl: "<h3>Engadir {title} aquí?</h3>O punto que estás a crear <b>será ollado por todo o mundo</b>. Só engade cousas que realmente existan. Moitas aplicacións empregan estes datos.",
          de: "<h3>Hier einen {title} hinzufügen?</h3>Der Punkt, den Sie hier anlegen, wird <b>für alle sichtbar sein</b>. Bitte fügen Sie der Karte nur dann Dinge hinzu, wenn sie wirklich existieren. Viele Anwendungen verwenden diese Daten."
        }),
        confirmButton: new Translation_2.default({
          en: "Add a {category} here",
          ca: "Afegir {category} aquí",
          es: "Añadir {category} aquí",
          nl: "Voeg hier een {category} toe",
          fr: "Ajouter un/une {category} ici",
          gl: "Engadir {category} aquí",
          de: "Hier eine {category} hinzufügen"
        }),
        openLayerControl: new Translation_2.default({
          "en": "Open the layer control box",
          "nl": "Open de laag-instellingen",
          "de": "Das Ebenen-Kontrollkästchen öffnen"
        }),
        layerNotEnabled: new Translation_2.default({
          "en": "The layer {layer} is not enabled. Enable this layer to add a point",
          "nl": "De laag {layer} is gedeactiveerd. Activeer deze om een punt toe te voegn",
          "de": "Die Ebene {layer} ist nicht aktiviert. Aktivieren Sie diese Ebene, um einen Punkt hinzuzufügen"
        })
      },
      pickLanguage: new Translation_2.default({
        en: "Choose a language",
        ca: "Tria idioma",
        es: "Escoge idioma",
        nl: "Kies je taal",
        fr: "Choisir la langue",
        gl: "Escoller lingua",
        de: "Wählen Sie eine Sprache"
      }),
      about: new Translation_2.default({
        en: "Easily edit and add OpenStreetMap for a certain theme",
        ca: "Edita facilment i afegeix punts a OpenStreetMap d\'una temàtica determinada",
        es: "Edita facilmente y añade puntos en OpenStreetMap de un tema concreto",
        nl: "Easily edit and add OpenStreetMap for a certain theme",
        fr: "Édition facile et ajouter OpenStreetMap pour un certain thème",
        gl: "Editar doadamente e engadir puntos no OpenStreetMap dun eido en concreto",
        de: "OpenStreetMap für ein bestimmtes Thema einfach bearbeiten und hinzufügen"
      }),
      nameInlineQuestion: new Translation_2.default({
        en: "The name of this {category} is $$$",
        ca: "{category}: El seu nom és $$$",
        es: "{category}: Su nombre es $$$",
        nl: "De naam van dit {category} is $$$",
        fr: "Le nom de cet/cette {category} est $$$",
        gl: "{category}: O teu nome é $$$",
        de: "Der Name dieser {category} ist $$$"
      }),
      noNameCategory: new Translation_2.default({
        en: "{category} without a name",
        ca: "{category} sense nom",
        es: "{category} sin nombre",
        nl: "{category} zonder naam",
        fr: "{category} sans nom",
        gl: "{category} sen nome",
        de: "{category} ohne Namen"
      }),
      questions: {
        phoneNumberOf: new Translation_2.default({
          en: "What is the phone number of {category}?",
          ca: "Quin és el telèfon de {category}?",
          es: "Qué teléfono tiene {category}?",
          nl: "Wat is het telefoonnummer van {category}?",
          fr: "Quel est le nom de {category}?",
          gl: "Cal é o número de teléfono de {category}?",
          de: "Wie lautet die Telefonnummer der {category}?"
        }),
        phoneNumberIs: new Translation_2.default({
          en: "The phone number of this {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
          ca: "El número de telèfon de {category} és <a href='tel:{phone}' target='_blank'>{phone}</a>",
          es: "El número de teléfono de {category} es <a href='tel:{phone}' target='_blank'>{phone}</a>",
          nl: "Het telefoonnummer van {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
          fr: "Le numéro de téléphone de {category} est <a href='tel:{phone}' target='_blank'>{phone}</a>",
          gl: "O número de teléfono de {category} é <a href='tel:{phone}' target='_blank'>{phone}</a>",
          de: "Die Telefonnummer der {category} lautet <a href='tel:{phone}' target='_blank'>{phone}</a>"
        }),
        websiteOf: new Translation_2.default({
          en: "What is the website of {category}?",
          ca: "Quina és la pàgina web de {category}?",
          es: "Cual es la página web de {category}?",
          nl: "Wat is de website van {category}?",
          fr: "Quel est le site internet de {category}?",
          gl: "Cal é a páxina web de {category}?",
          de: "Was ist die Website der {category}?"
        }),
        websiteIs: new Translation_2.default({
          en: "Website: <a href='{website}' target='_blank'>{website}</a>",
          ca: "Pàgina web: <a href='{website}' target='_blank'>{website}</a>",
          es: "Página web: <a href='{website}' target='_blank'>{website}</a>",
          nl: "Website: <a href='{website}' target='_blank'>{website}</a>",
          fr: "Website: <a href='{website}' target='_blank'>{website}</a>",
          gl: "Páxina web: <a href='{website}' target='_blank'>{website}</a>",
          de: "Webseite: <a href='{website}' target='_blank'>{website}</a>"
        }),
        emailOf: new Translation_2.default({
          en: "What is the email address of {category}?",
          ca: "Quina és l\'adreça de correu-e de {category}?",
          es: "¿Qué dirección de correu tiene {category}?",
          nl: "Wat is het email-adres van {category}?",
          fr: "Quel est l'adresse email de {category}?",
          gl: "Cal é o enderezo de correo electrónico de {category}?",
          de: "Wie lautet die E-Mail-Adresse der {category}?"
        }),
        emailIs: new Translation_2.default({
          en: "The email address of this {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
          ca: "L\'adreça de correu de {category} és <a href='mailto:{email}' target='_blank'>{email}</a>",
          es: "La dirección de correo de {category} es <a href='mailto:{email}' target='_blank'>{email}</a>",
          nl: "Het email-adres van {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
          fr: "L'adresse email de {category} est <a href='mailto:{email}' target='_blank'>{email}</a>",
          gl: "O enderezo de correo electrónico de {category} é <a href='mailto:{email}' target='_blank'>{email}</a>",
          de: "Die E-Mail-Adresse dieser {category} lautet <a href='mailto:{email}' target='_blank'>{email}</a>"
        })
      },
      openStreetMapIntro: new Translation_2.default({
        en: "<h3>An Open Map</h3>" + "<p>Wouldn't it be cool if there was a single map, which everyone could freely use and edit? " + "A single place to store all geo-information? Then, all those websites with different, small and incompatible maps (which are always outdated) wouldn't be needed anymore.</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is this map. The map data can be used for free (with <a href='https://osm.org/copyright' target='_blank'>attribution and publication of changes to that data</a>)." + " On top of that, everyone can freely add new data and fix errors. This website uses OpenStreetMap as well. All the data is from there, and your answers and corrections are added there as well.</p>" + "<p>A ton of people and application already use OpenStreetMap:  <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, but also the maps at Facebook, Instagram, Apple-maps and Bing-maps are (partly) powered by OpenStreetMap." + "If you change something here, it'll be reflected in those applications too - after their next update!</p>",
        es: "<h3>Un mapa abierto</h3>" + "<p></p>¿No sería genial si hubiera un solo mapa, que todos pudieran usar y editar libremente?" + "¿Un solo lugar para almacenar toda la información geográfica? Entonces, todos esos sitios web con mapas diferentes, pequeños e incompatibles (que siempre están desactualizados) ya no serían necesarios.</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> es ese mapa. Los datos del mapa se pueden utilizar de forma gratuita (con <a href='https://osm.org/copyright' target='_blank'> atribución y publicación de cambios en esos datos</a>)." + "Además de eso, todos pueden agregar libremente nuevos datos y corregir errores. Este sitio web también usa OpenStreetMap. Todos los datos provienen de allí, y tus respuestas y correcciones también se añadirán allí.</p>" + "<p>Muchas personas y aplicaciones ya usan OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, pero también los mapas de Facebook, Instagram, Apple y Bing son (en parte) impulsados ​​por OpenStreetMap ." + "Si cambias algo aquí, también se reflejará en esas aplicaciones, en su próxima actualización</p>",
        ca: "<h3>Un mapa obert</h3>" + "<p></p>No seria genial si hagués un únic mapa, que tothom pogués utilitzar i editar lliurement?" + "Un sol lloc on emmagatzemar tota la informació geogràfica? Llavors tots aquests llocs web amb mapes diferents petits i incompatibles (que sempre estaran desactulitzats) ja no serien necessaris.</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> és aquest mapa. Les dades del mapa es poden utilitzar de franc (amb <a href='https://osm.org/copyright' target='_blank'> atribució i publicació de canvis en aquestes dades</a>)." + "A més a més, tothom pot agregar lliurement noves dades i corregir errors. De fet, aquest lloc web també fa servir OpenStreetMap. Totes les dades provenen d\'allà i les teves respostes i correccions també s\'afegiran allà.</p>" + "<p>Moltes persones i aplicacions ja utilitzen OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, però també els mapes de Facebook, Instagram, Apple i Bing són (en part) impulsats ​​per OpenStreetMap." + "Si canvies alguna cosa aquí també es reflectirà en aquestes aplicacions en la seva propera actualització.</p>",
        nl: "<h3>Een open kaart</h3>" + "<p>Zou het niet fantastisch zijn als er een open kaart zou zijn die door iedereen aangepast én gebruikt kan worden? Een kaart waar iedereen zijn interesses aan zou kunnen toevoegen? " + "Dan zouden er geen duizend-en-één verschillende kleine kaartjes, websites, ... meer nodig zijn</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is deze open kaart. Je mag de kaartdata gratis gebruiken (mits <a href='https://osm.org/copyright' target='_blank'>bronvermelding en herpublicatie van aanpassingen</a>). Daarenboven mag je de kaart ook gratis aanpassen als je een account maakt. " + "Ook deze website is gebaseerd op OpenStreetMap. Als je hier een vraag beantwoord, gaat het antwoord daar ook naartoe</p>" + "<p>Tenslotte zijn er reeds vele gebruikers van OpenStreetMap. Denk maar <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, verschillende gespecialiseerde routeplanners, de achtergrondkaarten op Facebook, Instagram,...<br/>" + "Zelfs Apple Maps en Bing-Maps gebruiken OpenStreetMap in hun kaarten!</p>" + "</p>" + "<p>Kortom, als je hier een punt toevoegd of een vraag beantwoord, zal dat na een tijdje ook in al dié applicaties te zien zijn.</p>",
        fr: "<h3>Une carte ouverte</h3>" + "<p></p>How incroyable se serait d'avoir sur une carte que tout le monde pourrait éditer ouvertement?" + "Une seule et unique plateforme regroupant toutes les informations geographiques? Ainsi nous n'aurons plus besoin de toutes ces petites et incompatibles cartes (souvent non mises à jour).</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> est la carte qu'il vous faut!. Toutes les donnees de cette carte peuvent être utilisé gratuitement (avec <a href='https://osm.org/copyright' target='_blank'> d\'attribution et de publication des changements de données</a>)." + " De plus tout le monde est libre d'ajouter de nouvelles données et corriger les erreurs. Ce site internet utilise également OpenStreetMap. Toutes les données y proviennent et tous les ajouts et modifications y seront également ajoutés.</p>" + "<p>De nombreux individus et d'applications utilisent déjà OpenStreetMap:  <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, mais aussi les cartes de Facebook, Instagram, Apple-maps et Bing-maps sont(en partie) supporté par OpenStreetMap." + "Si vous modifié quelque chose ici, ces changement seront retranscris sur ces applications aussi - des lors de leur mise à jour! </p>",
        gl: "<h3>Un mapa aberto</h3>" + "<p></p>Non sería xenial se houbera un só mapa, que todos puideran empregar e editar de xeito libre?" + "Un só lugar para almacenar toda a información xeográfica? Entón, todos eses sitios web con mapas diferentes, pequenos e incompatíbeis (que sempre están desactualizados) xa non serían necesarios.</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> é ese mapa. Os datos do mapa pódense empregar de balde (con <a href='https://osm.org/copyright' target='_blank'> atribución e publicación de modificacións neses datos</a>)." + "Ademais diso, todos poden engadir de xeito ceibe novos datos e corrixir erros. Este sitio web tamén emprega o OpenStreetMap. Todos os datos proveñen de alí, e as túas respostas e correccións tamén serán engadidas alí.</p>" + "<p>Moitas persoas e aplicacións xa empregan o OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, pero tamén os mapas do Facebook, Instagram, Apple e Bing son (en parte) impulsados ​​polo OpenStreetMap." + "Se mudas algo aquí, tamén será reflexado nesas aplicacións, na súa seguinte actualización!</p>",
        de: "<h3>Eine offene Karte</h3>" + "<p>Wäre es nicht toll, wenn es eine offene Karte gäbe, die von jedem angepasst und benutzt werden könnte? Eine Karte, zu der jeder seine Interessen hinzufügen kann? " + "Dann bräuchte man all diese Websites mit unterschiedlichen, kleinen und inkompatiblen Karten (die immer veraltet sind) nicht mehr.</p>" + "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> ist diese offene Karte. Die Kartendaten können kostenlos verwendet werden (mit <a href='https://osm.org/copyright' target='_blank'>Attribution und Veröffentlichung von Änderungen an diesen Daten</a>). Darüber hinaus können Sie die Karte kostenlos ändern und Fehler beheben, wenn Sie ein Konto erstellen. " + "Diese Website basiert ebenfalls auf OpenStreetMap. Wenn Sie eine Frage hier beantworten, geht die Antwort auch dorthin.</p>" + "Viele Menschen und Anwendungen nutzen OpenStreetMap bereits: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, verschiedene spezialisierte Routenplaner, die Hintergrundkarten auf Facebook, Instagram,...<br/>" + "Sogar Apple Maps und Bing Maps verwenden OpenStreetMap in ihren Karten!</p>" + "</p>" + "<p>Wenn Sie hier einen Punkt hinzufügen oder eine Frage beantworten, wird er nach einer Weile in all diesen Anwendungen sichtbar sein.</p>"
      }),
      sharescreen: {
        intro: new Translation_2.default({
          en: "<h3>Share this map</h3> Share this map by copying the link below and sending it to friends and family:",
          ca: "<h3>Comparteix aquest mapa</h3> Comparteix aquest mapa copiant l\'enllaç de sota i enviant-lo a amics i família:",
          es: "<h3>Comparte este mapa</h3> Comparte este mapa copiando el enlace de debajo y enviándolo a amigos y familia:",
          fr: "<h3>Partager cette carte</h3> Partagez cette carte en copiant le lien suivant et envoyer le à vos amis:",
          nl: "<h3>Deel deze kaart</h3> Kopieer onderstaande link om deze kaart naar vrienden en familie door te sturen:",
          gl: "<h3>Comparte este mapa</h3> Comparte este mapa copiando a ligazón de embaixo e enviándoa ás amizades e familia:",
          de: "<h3>Diese Karte teilen</h3> Sie können diese Karte teilen, indem Sie den untenstehenden Link kopieren und an Freunde und Familie schicken:"
        }),
        addToHomeScreen: new Translation_2.default({
          en: "<h3>Add to your home screen</h3>You can easily add this website to your smartphone home screen for a native feel. Click the 'add to home screen button' in the URL bar to do this.",
          ca: "<h3>Afegir-lo a la pantalla d\'inici</h3>Pots afegir aquesta web a la pantalla d\'inici del teu smartphone per a que es vegi més nadiu. Apreta al botó 'afegir a l\'inici' a la barra d\'adreces URL per fer-ho.",
          es: "<h3>Añadir a la pantalla de inicio</h3>Puedes añadir esta web en la pantalla de inicio de tu smartphone para que se vea más nativo. Aprieta el botón 'añadir a inicio' en la barra de direcciones URL para hacerlo.",
          fr: "<h3>Ajouter à votre page d'accueil</h3> Vous pouvez facilement ajouter la carte à votre écran d'accueil de téléphone. Cliquer sur le boutton 'ajouter à l'evran d'accueil' dans la barre d'URL pour éffecteur cette tâche",
          gl: "<h3>Engadir á pantalla de inicio</h3>Podes engadir esta web na pantalla de inicio do teu smartphone para que se vexa máis nativo. Preme o botón 'engadir ó inicio' na barra de enderezos URL para facelo.",
          nl: "<h3>Voeg toe aan je thuis-scherm</h3>Je kan deze website aan je thuisscherm van je smartphone toevoegen voor een native feel",
          de: "<h3>Zum Startbildschirm hinzufügen</h3> Sie können diese Website einfach zum Startbildschirm Ihres Smartphones hinzufügen, um ein natives Gefühl zu erhalten. Klicken Sie dazu in der URL-Leiste auf die Schaltfläche 'Zum Startbildschirm hinzufügen'."
        }),
        embedIntro: new Translation_2.default({
          en: "<h3>Embed on your website</h3>Please, embed this map into your website. <br/>We encourage you to do it - you don't even have to ask permission. <br/>  It is free, and always will be. The more people using this, the more valuable it becomes.",
          ca: "<h3>Inclou-ho a la teva pàgina web</h3>Inclou aquest mapa dins de la teva pàgina web. <br/> T\'animem a que ho facis, no cal que demanis permís. <br/>  És de franc, i sempre ho serà. A més gent que ho faci servir més valuós serà.",
          es: "<h3>Inclúyelo en tu página web</h3>Incluye este mapa en tu página web. <br/> Te animamos a que lo hagas, no hace falta que pidas permiso. <br/> Es gratis, y siempre lo será. A más gente que lo use más valioso será.",
          fr: "<h3>Incorporer à votre website</h3>AJouter la carte à votre website. <br/>On vous en encourage - pas besoin de permission. <br/>  C'est gratuit et pour toujours. Le plus de personnes l'utilisent, le mieux ce sera.",
          gl: "<h3>Inclúeo na túa páxina web</h3>Inclúe este mapa na túa páxina web. <br/> Animámoche a que o fagas, non fai falla que pidas permiso. <br/> É de balde, e sempre será. Canta máis xente que o empregue máis valioso será.",
          nl: "<h3>Plaats dit op je website</h3>Voeg dit kaartje toe op je eigen website.<br/>We moedigen dit zelfs aan - je hoeft geen toestemming te vragen.<br/> Het is gratis en zal dat altijd blijven. Hoe meer het gebruikt wordt, hoe waardevoller",
          de: "<h3>Auf Ihrer Website einbetten</h3>Bitte, betten Sie diese Karte in Ihre Website ein. <br/>Wir ermutigen Sie, es zu tun - Sie müssen nicht einmal um Erlaubnis fragen. <br/> Es ist kostenlos und wird es immer sein. Je mehr Leute sie benutzen, desto wertvoller wird sie."
        }),
        copiedToClipboard: new Translation_2.default({
          en: "Link copied to clipboard",
          gl: "Ligazón copiada ó portapapeis",
          nl: "Link gekopieerd naar klembord",
          de: "Link in die Zwischenablage kopiert"
        }),
        thanksForSharing: new Translation_2.default({
          en: "Thanks for sharing!",
          gl: "Grazas por compartir!",
          nl: "Bedankt om te delen!",
          de: "Danke für das Teilen!"
        }),
        editThisTheme: new Translation_2.default({
          en: "Edit this theme",
          gl: "Editar este tema",
          nl: "Pas dit thema aan",
          de: "Dieses Thema bearbeiten"
        }),
        editThemeDescription: new Translation_2.default({
          en: "Add or change questions to this map theme",
          gl: "Engadir ou mudar preguntas a este tema do mapa",
          nl: "Pas vragen aan of voeg vragen toe aan dit kaartthema",
          de: "Fragen zu diesem Kartenthema hinzufügen oder ändern"
        }),
        fsUserbadge: new Translation_2.default({
          en: "Enable the login-button",
          gl: "Activar botón de inicio de sesión",
          nl: "Activeer de login-knop",
          de: " Anmelde-Knopf aktivieren"
        }),
        fsSearch: new Translation_2.default({
          en: "Enable the search bar",
          gl: "Activar a barra de procura",
          nl: "Activeer de zoekbalk",
          de: " Suchleiste aktivieren"
        }),
        fsWelcomeMessage: new Translation_2.default({
          en: "Show the welcome message popup and associated tabs",
          gl: "Amosar a xanela emerxente da mensaxe de benvida e as lapelas asociadas",
          nl: "Toon het welkomstbericht en de bijhorende tabbladen",
          de: "Popup der Begrüßungsnachricht und zugehörige Registerkarten anzeigen"
        }),
        fsLayers: new Translation_2.default({
          en: "Enable thelayer control",
          gl: "Activar o control de capas",
          nl: "Toon de knop voor laagbediening",
          de: "Aktivieren der Layersteuerung"
        }),
        fsLayerControlToggle: new Translation_2.default({
          en: "Start with the layer control expanded",
          gl: "Comenza co control de capas expandido",
          nl: "Toon de laagbediening meteen volledig",
          de: "Mit der erweiterten Ebenenkontrolle beginnen"
        }),
        fsAddNew: new Translation_2.default({
          en: "Enable the 'add new POI' button",
          nl: "Activeer het toevoegen van nieuwe POI",
          gl: "Activar o botón de 'engadir novo PDI'",
          de: "Schaltfläche 'neuen POI hinzufügen' aktivieren"
        }),
        fsGeolocation: new Translation_2.default({
          en: "Enable the 'geolocate-me' button (mobile only)",
          gl: "Activar o botón de 'xeolocalizarme' (só móbil)",
          nl: "Toon het knopje voor geolocalisatie (enkel op mobiel)",
          de: "Die Schaltfläche 'Mich geolokalisieren' aktivieren (nur für Mobil)"
        }),
        fsIncludeCurrentBackgroundMap: new Translation_2.default({
          en: "Include the current background choice <b>{name}</b>",
          nl: "Gebruik de huidige achtergrond <b>{name}</b>",
          de: "Die aktuelle Hintergrundwahl einschließen <b>{name}</b>"
        }),
        fsIncludeCurrentLayers: new Translation_2.default({
          en: "Include the current layer choices",
          nl: "Toon enkel de huidig getoonde lagen",
          de: "Die aktuelle Ebenenauswahl einbeziehen"
        }),
        fsIncludeCurrentLocation: new Translation_2.default({
          en: "Include current location",
          nl: "Start op de huidige locatie",
          de: "Aktuelle Position einbeziehen"
        })
      },
      morescreen: {
        intro: new Translation_2.default({
          en: "<h3>More quests</h3>Do you enjoy collecting geodata? <br/>There are more themes available.",
          ca: "<h3>Més peticions</h3>T\'agrada captar dades? <br/>Hi ha més capes disponibles.",
          es: "<h3>Más peticiones</h3>Te gusta captar datos? <br/>Hay más capas disponibles.",
          fr: "<h3>Plus de thème </h3>Vous aimez collecter des données? <br/>Il y a plus de thèmes disponible.",
          nl: "<h3>Meer thema's</h3>Vind je het leuk om geodata te verzamelen? <br/> Hier vind je meer kaartthemas.",
          gl: "<h3>Máis tarefas</h3>Góstache captar datos? <br/>Hai máis capas dispoñíbeis.",
          de: "<h3>Weitere Quests</h3>Sammeln Sie gerne Geodaten? <br/>Es sind weitere Themen verfügbar."
        }),
        requestATheme: new Translation_2.default({
          en: "If you want a custom-built quest, request it <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>here</a>",
          ca: "Si vols que et fem una petició pròpia , demana-la <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
          es: "Si quieres que te hagamos una petición propia , pídela <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
          nl: "Wil je een eigen kaartthema, vraag dit <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier aan</a>",
          fr: "Si vous voulez une autre carte thématique, demandez <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>ici</a>",
          gl: "Se queres que che fagamos unha tarefa propia , pídea <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
          de: "Wenn Sie einen speziell angefertigte Quest wünschen, können Sie diesen <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier</a> anfragen"
        }),
        streetcomplete: new Translation_2.default({
          en: "Another, similar application is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          ca: "Una altra aplicació similar és <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          es: "Otra aplicación similar es <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          fr: "Une autre application similaire est <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          nl: "Een andere, gelijkaardige Android-applicatie is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          gl: "Outra aplicación semellante é <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          de: "Eine andere, ähnliche Anwendung ist <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>"
        }),
        createYourOwnTheme: new Translation_2.default({
          en: "Create your own MapComplete theme from scratch",
          ca: "Crea la teva pròpia petició completa de MapComplete des de zero.",
          es: "Crea tu propia petición completa de MapComplete desde cero.",
          nl: "Maak je eigen MapComplete-kaart",
          fr: "Créez votre propre MapComplete carte",
          gl: "Crea o teu propio tema completo do MapComplete dende cero.",
          de: "Erstellen Sie Ihr eigenes MapComplete-Thema von Grund auf neu"
        })
      },
      readYourMessages: new Translation_2.default({
        en: "Please, read all your OpenStreetMap-messages before adding a new point.",
        ca: "Llegeix tots els teus missatges d\'OpenStreetMap abans d\'afegir nous punts.",
        es: "Lee todos tus mensajes de OpenStreetMap antes de añadir nuevos puntos.",
        nl: "Gelieve eerst je berichten op OpenStreetMap te lezen alvorens nieuwe punten toe te voegen.",
        fr: "Merci de lire tout vos messages d'OpenStreetMap avant d'ajouter un nouveau point.",
        gl: "Le todos a túas mensaxes do OpenStreetMap antes de engadir novos puntos.",
        de: "Bitte lesen Sie alle Ihre OpenStreetMap-Nachrichten, bevor Sie einen neuen Punkt hinzufügen"
      }),
      fewChangesBefore: new Translation_2.default({
        en: "Please, answer a few questions of existing points before adding a new point.",
        ca: "Contesta unes quantes preguntes sobre punts existents abans d\'afegir-ne un de nou.",
        es: "Contesta unas cuantas preguntas sobre puntos existentes antes de añadir nuevos.",
        nl: "Gelieve eerst enkele vragen van bestaande punten te beantwoorden vooraleer zelf punten toe te voegen.",
        fr: "Merci de répondre à quelques questions à propos de point déjà existant avant d'ajouter de nouveaux points",
        gl: "Responde unhas cantas preguntas sobre puntos existentes antes de engadir novos.",
        de: "Bitte beantworten Sie ein paar Fragen zu bestehenden Punkten, bevor Sie einen neuen Punkt hinzufügen."
      }),
      goToInbox: new Translation_2.default({
        en: "Open inbox",
        es: "Abrir mensajes",
        ca: "Obrir missatges",
        nl: "Ga naar de berichten",
        fr: "Ouvrir les messages",
        gl: "Abrir mensaxes",
        de: "Posteingang öffnen"
      }),
      getStartedLogin: new Translation_2.default({
        en: "Login with OpenStreetMap to get started",
        es: "Entra en OpenStreetMap para empezar",
        ca: "Entra a OpenStreetMap per començar",
        nl: "Login met OpenStreetMap om te beginnen",
        fr: "Connectez vous avec OpenStreetMap pour commencer",
        de: "Mit OpenStreetMap einloggen und loslegen"
      }),
      getStartedNewAccount: new Translation_2.default({
        en: " or <a href='https://www.openstreetmap.org/user/new' target='_blank'>create a new account</a>",
        nl: " of <a href='https://www.openstreetmap.org/user/new' target='_blank'>maak een nieuwe account aan</a> ",
        fr: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>registrez vous</a>",
        es: " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea una nueva cuenta</a>",
        ca: " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea un nou compte</a>",
        gl: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea unha nova conta</a>",
        de: " oder <a href='https://www.openstreetmap.org/user/new' target='_blank'>ein neues Konto anlegen</a>"
      }),
      noTagsSelected: new Translation_2.default({
        en: "No tags selected",
        es: "No se han seleccionado etiquetas",
        ca: "No s\'han seleccionat etiquetes",
        gl: "Non se seleccionaron etiquetas",
        de: "Keine Tags ausgewählt"
      }),
      customThemeIntro: new Translation_2.default({
        en: "<h3>Custom themes</h3>These are previously visited user-generated themes.",
        nl: "<h3>Onofficiële themea's</h3>Je bezocht deze thema's gemaakt door andere OpenStreetMappers eerder",
        gl: "<h3>Temas personalizados</h3>Estes son temas xerados por usuarios previamente visitados.",
        de: "<h3>Kundenspezifische Themen</h3>Dies sind zuvor besuchte benutzergenerierte Themen"
      }),
      aboutMapcomplete: new Translation_2.default({
        en: "<h3>About MapComplete</h3>" + "<p>MapComplete is an OpenStreetMap editor that is meant to help everyone to easily add information on a <b>single theme.</b></p>" + "<p>Only features relevant to a single theme are shown with a few predefined questions, in order to keep things <b>simple and extremly user-friendly</b>." + "The theme maintainer can also choose a language for the interface, choose to disable elements or even to embed it into a different website without any UI-element at all.</p>" + "<p>However, another important part of MapComplete is to always <b>offer the next step</b> to learn more about OpenStreetMap:" + "<ul>" + "<li>An iframe without UI-elements will link to a full-screen version</li>" + "<li>The fullscreen version offers information about OpenStreetMap</li>" + "<li>If you're not logged in, you're asked to log in</li>" + "<li>If you answered a single question, you are allowed to add points</li>" + "<li>At a certain point, the actual added tags appear which later get linked to the wiki...</li>" + "</ul></p>" + "<p>Do you notice an issue with MapComplete? Do you have a feature request? Do you want to help translating? " + "Head over to <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>the source code</a> or <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>issue tracker.</a></p>",
        nl: "<h3>Over MapComplete</h3>" + "<p>MapComplete is een OpenStreetMap-editor om eenvoudig informatie toe te voegen over <b>één enkel onderwerp</b>.</p>" + "<p>Om de editor zo <b>simpel en gebruiksvriendelijk mogelijk</b> te houden, worden enkel objecten relevant voor het thema getoond." + "Voor deze objecten kunnen dan vragen beantwoord worden, of men kan een nieuw punt van dit thema toevoegen." + "De maker van het thema kan er ook voor opteren om een aantal elementen van de gebruikersinterface uit te schakelen of de taal ervan in te stellen.</p>" + "<p>Een ander belangrijk aspect is om bezoekers stap voor stap meer te leren over OpenStreetMap:" + "<ul>" + "<li>Een iframe zonder verdere uitleg linkt naar de volledige versie van MapComplete</li>" + "<li>De volledige versie heeft uitleg over OpenStreetMap</li>" + "<li>Als je niet aangemeld bent, wordt er je gevraagd dit te doen</li>" + "<li>Als je minstens één vraag hebt beantwoord, kan je punten gaan toevoegen.</li>" + "<li>Heb je genoeg changesets, dan verschijnen de tags die wat later doorlinken naar de wiki</li>" + "</ul></p>" + "<p>Merk je een bug of wil je een extra feature? Wil je helpen vertalen? Bezoek dan de <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>broncode</a> en <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>issue tracker</a></p>",
        de: "<h3>Über MapComplete</h3>" + "<p>MapComplete ist ein OpenStreetMap-Editor, der jedem helfen soll, auf einfache Weise Informationen zu einem <b>Einzelthema hinzuzufügen.</b></p>" + "<p>Nur Merkmale, die für ein einzelnes Thema relevant sind, werden mit einigen vordefinierten Fragen gezeigt, um die Dinge <b>einfach und extrem benutzerfreundlich</b> zu halten." + "Der Themen-Betreuer kann auch eine Sprache für die Schnittstelle wählen, Elemente deaktivieren oder sogar in eine andere Website ohne jegliches UI-Element einbetten.</p>" + "<p>Ein weiterer wichtiger Teil von MapComplete ist jedoch, immer <b>den nächsten Schritt anzubieten</b>um mehr über OpenStreetMap zu erfahren:" + "<ul>" + "<li>Ein iframe ohne UI-Elemente verlinkt zu einer Vollbildversion</li>" + "<li>Die Vollbildversion bietet Informationen über OpenStreetMap</li>" + "<li>Wenn Sie nicht eingeloggt sind, werden Sie gebeten, sich einzuloggen</li>" + "<li>Wenn Sie eine einzige Frage beantwortet haben, dürfen Sie Punkte hinzufügen</li>" + "<li>An einem bestimmten Punkt erscheinen die tatsächlich hinzugefügten Tags, die später mit dem Wiki verlinkt werden...</li>" + "</ul></p>" + "<p>Fällt Ihnen ein Problem mit MapComplete auf? Haben Sie einen Feature-Wunsch? Wollen Sie beim Übersetzen helfen? " + "Gehen Sie <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>zum Quellcode</a> oder <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>zur Problemverfolgung</a>.</p>"
      }),
      backgroundMap: new Translation_2.default({
        "en": "Background map",
        "nl": "Achtergrondkaart",
        "de": "Hintergrundkarte"
      }),
      zoomInToSeeThisLayer: new Translation_2.default({
        "en": "Zoom in to see this layer",
        "nl": "Vergroot de kaart om deze laag te zien",
        "de": "Vergrößern, um diese Ebene zu sehen"
      })
    },
    favourite: {
      title: new Translation_2.default({
        en: "Personal theme",
        nl: "Persoonlijk thema",
        es: "Interficie personal",
        ca: "Interfície personal",
        gl: "Tema personalizado",
        de: "Persönliches Thema"
      }),
      description: new Translation_2.default({
        en: "Create a personal theme based on all the available layers of all themes",
        es: "Crea una interficie basada en todas las capas disponibles de todas las interficies",
        ca: "Crea una interfície basada en totes les capes disponibles de totes les interfícies",
        gl: "Crea un tema baseado en todas as capas dispoñíbeis de todos os temas",
        de: "Erstellen Sie ein persönliches Thema auf der Grundlage aller verfügbaren Ebenen aller Themen"
      }),
      panelIntro: new Translation_2.default({
        en: "<h3>Your personal theme</h3>Activate your favourite layers from all the official themes",
        ca: "<h3>La teva interfície personal</h3>Activa les teves capes favorites de totes les interfícies oficials",
        es: "<h3>Tu interficie personal</h3>Activa tus capas favoritas de todas las interficies oficiales",
        gl: "<h3>O teu tema personalizado</h3>Activa as túas capas favoritas de todos os temas oficiais",
        de: "<h3>Ihr persönliches Thema</h3>Aktivieren Sie Ihre Lieblingsebenen aus allen offiziellen Themen"
      }),
      loginNeeded: new Translation_2.default({
        en: "<h3>Log in</h3>A personal layout is only available for OpenStreetMap users",
        es: "<h3>Entrar</h3>El diseño personalizado sólo está disponible para los usuarios de OpenstreetMap",
        ca: "<h3>Entrar</h3>El disseny personalizat només està disponible pels usuaris d\' OpenstreetMap",
        gl: "<h3>Iniciar a sesión</h3>O deseño personalizado só está dispoñíbel para os usuarios do OpenstreetMap",
        de: "<h3>Anmelden</h3>Ein persönliches Layout ist nur für OpenStreetMap-Benutzer verfügbar"
      }),
      reload: new Translation_2.default({
        en: "Reload the data",
        es: "Recarga los datos",
        ca: "Recarrega les dades",
        gl: "Recargar os datos",
        de: "Daten neu laden"
      })
    }
  };
  return Translations;
}();

exports.default = Translations;
},{"./Translation":"UI/i18n/Translation.ts","../Base/FixedUiElement":"UI/Base/FixedUiElement.ts"}],"UI/SaveButton.ts":[function(require,module,exports) {
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

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SaveButton = void 0;

var UIElement_1 = require("./UIElement");

var Translations_1 = __importDefault(require("./i18n/Translations"));

var SaveButton =
/** @class */
function (_super) {
  __extends(SaveButton, _super);

  function SaveButton(value) {
    var _this = _super.call(this, value) || this;

    if (value === undefined) {
      throw "No event source for savebutton, something is wrong";
    }

    _this._value = value;
    return _this;
  }

  SaveButton.prototype.InnerRender = function () {
    if (this._value.data === undefined || this._value.data === null || this._value.data === "") {
      return "<span class='save-non-active'>" + Translations_1.default.t.general.save.Render() + "</span>";
    }

    return "<span class='save'>" + Translations_1.default.t.general.save.Render() + "</span>";
  };

  return SaveButton;
}(UIElement_1.UIElement);

exports.SaveButton = SaveButton;
},{"./UIElement":"UI/UIElement.ts","./i18n/Translations":"UI/i18n/Translations.ts"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","UI/SaveButton.ts"], null)
//# sourceMappingURL=/UI/SaveButton.js.map