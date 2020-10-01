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

    this.addCallbackAndRun(update);

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
      throw "Use RemoveClass instead";
    } else if (this.clss.indexOf(clss) < 0) {
      this.clss.push(clss);
      this.Update();
    }

    return this;
  };

  UIElement.prototype.RemoveClass = function (clss) {
    var i = this.clss.indexOf(clss);

    if (i >= 0) {
      this.clss.splice(i, 1);
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
},{"../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"UI/Base/VerticalCombine.ts":[function(require,module,exports) {
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
exports.VerticalCombine = void 0;

var UIElement_1 = require("../UIElement");

var VerticalCombine =
/** @class */
function (_super) {
  __extends(VerticalCombine, _super);

  function VerticalCombine(elements, className) {
    if (className === void 0) {
      className = undefined;
    }

    var _this = _super.call(this, undefined) || this;

    _this._elements = elements;
    _this._className = className;
    return _this;
  }

  VerticalCombine.prototype.InnerRender = function () {
    var html = "";

    for (var _i = 0, _a = this._elements; _i < _a.length; _i++) {
      var element = _a[_i];

      if (element !== undefined && !element.IsEmpty()) {
        html += "<div>" + element.Render() + "</div>";
      }
    }

    if (html === "") {
      return "";
    }

    if (this._className === undefined) {
      return html;
    }

    return "<div class='" + this._className + "'>" + html + "</div>";
  };

  return VerticalCombine;
}(UIElement_1.UIElement);

exports.VerticalCombine = VerticalCombine;
},{"../UIElement":"UI/UIElement.ts"}],"Logic/Web/LocalStorageSource.ts":[function(require,module,exports) {
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
},{"../UIElement":"UI/UIElement.ts"}],"node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"node_modules/jquery/dist/jquery.js":[function(require,module,exports) {
var global = arguments[3];
var process = require("process");
var define;
/*!
 * jQuery JavaScript Library v3.5.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2020-05-04T22:49Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};


var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};


var document = window.document;



	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.5.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( _i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.5
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://js.foundation/
 *
 * Date: 2020-03-14
 */
( function( window ) {
var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ( {} ).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	pushNative = arr.push,
	push = arr.push,
	slice = arr.slice,

	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[ i ] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
		"ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +

		// "Attribute values must be CSS identifiers [capture 5]
		// or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
		whitespace + "*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +

		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
		whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
		"*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rhtml = /HTML$/i,
	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		return nonHex ?

			// Strip the backslash prefix from a non-hex escape sequence
			nonHex :

			// Replace a hexadecimal escape sequence with the encoded Unicode code point
			// Support: IE <=11+
			// For values outside the Basic Multilingual Plane (BMP), manually construct a
			// surrogate pair
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" +
				ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		( arr = slice.call( preferredDoc.childNodes ) ),
		preferredDoc.childNodes
	);

	// Support: Android<4.0
	// Detect silently failing push.apply
	// eslint-disable-next-line no-unused-expressions
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			pushNative.apply( target, slice.call( els ) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;

			// Can't trust NodeList.length
			while ( ( target[ j++ ] = els[ i++ ] ) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

				// Support: IE 8 only
				// Exclude object elements
				( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;

					// We can use :scope instead of the ID hack if the browser
					// supports it & if we're not changing the context.
					if ( newContext !== context || !support.scope ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", ( nid = expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement( "fieldset" );

	try {
		return !!fn( el );
	} catch ( e ) {
		return false;
	} finally {

		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}

		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split( "|" ),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[ i ] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( ( cur = cur.nextSibling ) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return ( name === "input" || name === "button" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
					inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	var namespace = elem.namespaceURI,
		docElem = ( elem.ownerDocument || elem ).documentElement;

	// Support: IE <=8
	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
	// https://bugs.jquery.com/ticket/4833
	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9 - 11+, Edge 12 - 18+
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( preferredDoc != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
	// Safari 4 - 5 only, Opera <=11.6 - 12.x only
	// IE/Edge & older browsers don't support the :scope pseudo-class.
	// Support: Safari 6.0 only
	// Safari 6.0 supports :scope but it's an alias of :root there.
	support.scope = assert( function( el ) {
		docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
		return typeof el.querySelectorAll !== "undefined" &&
			!el.querySelectorAll( ":scope fieldset div" ).length;
	} );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert( function( el ) {
		el.className = "i";
		return !el.getAttribute( "className" );
	} );

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert( function( el ) {
		el.appendChild( document.createComment( "" ) );
		return !el.getElementsByTagName( "*" ).length;
	} );

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert( function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	} );

	// ID filter and find
	if ( support.getById ) {
		Expr.filter[ "ID" ] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		};
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter[ "ID" ] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode( "id" );
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode( "id" );
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( ( elem = elems[ i++ ] ) ) {
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find[ "TAG" ] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,

				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( ( elem = results[ i++ ] ) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert( function( el ) {

			var input;

			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll( "[selected]" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push( "~=" );
			}

			// Support: IE 11+, Edge 15 - 18+
			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
			// Adding a temporary attribute to the document before the selection works
			// around the issue.
			// Interestingly, IE 10 & older don't seem to have the issue.
			input = document.createElement( "input" );
			input.setAttribute( "name", "" );
			el.appendChild( input );
			if ( !el.querySelectorAll( "[name='']" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
					whitespace + "*(?:''|\"\")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll( ":checked" ).length ) {
				rbuggyQSA.push( ":checked" );
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push( ".#.+[+~]" );
			}

			// Support: Firefox <=3.6 - 5 only
			// Old Firefox doesn't throw on a badly-escaped identifier.
			el.querySelectorAll( "\\\f" );
			rbuggyQSA.push( "[\\r\\n\\f]" );
		} );

		assert( function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement( "input" );
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll( "[name=d]" ).length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: Opera 10 - 11 only
			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll( "*,:x" );
			rbuggyQSA.push( ",.*:" );
		} );
	}

	if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector ) ) ) ) {

		assert( function( el ) {

			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		} );
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			) );
		} :
		function( a, b ) {
			if ( b ) {
				while ( ( b = b.parentNode ) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

			// Choose the first element that is related to our preferred document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( a == document || a.ownerDocument == preferredDoc &&
				contains( preferredDoc, a ) ) {
				return -1;
			}

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( b == document || b.ownerDocument == preferredDoc &&
				contains( preferredDoc, b ) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			return a == document ? -1 :
				b == document ? 1 :
				/* eslint-enable eqeqeq */
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( ( cur = cur.parentNode ) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( ( cur = cur.parentNode ) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[ i ] === bp[ i ] ) {
			i++;
		}

		return i ?

			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[ i ], bp[ i ] ) :

			// Otherwise nodes in our document sort first
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			ap[ i ] == preferredDoc ? -1 :
			bp[ i ] == preferredDoc ? 1 :
			/* eslint-enable eqeqeq */
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( support.matchesSelector && documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||

				// As well, disconnected nodes are said to be in a document
				// fragment in IE 9
				elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( context.ownerDocument || context ) != document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( elem.ownerDocument || elem ) != document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],

		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			( val = elem.getAttributeNode( name ) ) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {

		// If no nodeType, this is expected to be an array
		while ( ( node = elem[ i++ ] ) ) {

			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {

			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}

	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
				match[ 5 ] || "" ).replace( runescape, funescape );

			if ( match[ 2 ] === "~=" ) {
				match[ 3 ] = " " + match[ 3 ] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {

			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[ 1 ] = match[ 1 ].toLowerCase();

			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

				// nth-* requires argument
				if ( !match[ 3 ] ) {
					Sizzle.error( match[ 0 ] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[ 4 ] = +( match[ 4 ] ?
					match[ 5 ] + ( match[ 6 ] || 1 ) :
					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

				// other types prohibit arguments
			} else if ( match[ 3 ] ) {
				Sizzle.error( match[ 0 ] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[ 6 ] && match[ 2 ];

			if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[ 3 ] ) {
				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&

				// Get excess from tokenize (recursively)
				( excess = tokenize( unquoted, true ) ) &&

				// advance to the next closing parenthesis
				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

				// excess is a negative index
				match[ 0 ] = match[ 0 ].slice( 0, excess );
				match[ 2 ] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() {
					return true;
				} :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace +
					")" + className + "(" + whitespace + "|$)" ) ) && classCache(
						className, function( elem ) {
							return pattern.test(
								typeof elem.className === "string" && elem.className ||
								typeof elem.getAttribute !== "undefined" &&
									elem.getAttribute( "class" ) ||
								""
							);
				} );
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				/* eslint-disable max-len */

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
				/* eslint-enable max-len */

			};
		},

		"CHILD": function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || ( node[ expando ] = {} );

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								( outerCache[ node.uniqueID ] = {} );

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {

								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || ( node[ expando ] = {} );

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									( outerCache[ node.uniqueID ] = {} );

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] ||
												( node[ expando ] = {} );

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												( outerCache[ node.uniqueID ] = {} );

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction( function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[ i ] );
							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
						}
					} ) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		"not": markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element (issue #299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		"has": markFunction( function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		} ),

		"contains": markFunction( function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement &&
				( !document.hasFocus || document.hasFocus() ) &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return ( nodeName === "input" && !!elem.checked ) ||
				( nodeName === "option" && !!elem.selected );
		},

		"selected": function( elem ) {

			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {

			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos[ "empty" ]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( ( attr = elem.getAttribute( "type" ) ) == null ||
					attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		"last": createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		"even": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"odd": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ?
				argument + length :
				argument > length ?
					length :
					argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rcombinators.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :

			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] ||
							( outerCache[ elem.uniqueID ] = {} );

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = uniqueCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts(
				selector || "*",
				context.nodeType ? [ context ] : context,
				[]
			),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?

				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || Expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

					// If the preceding token was a descendant combinator, insert an implicit any-element `*`
					tokens
						.slice( 0, i - 1 )
						.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
				len = elems.length;

			if ( outermost ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache(
			selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers )
		);

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
			context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

			context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
				.replace( runescape, funescape ), context ) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( Expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = Expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					token.matches[ 0 ].replace( runescape, funescape ),
					rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
						context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert( function( el ) {

	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
} );

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert( function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute( "href" ) === "#";
} ) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	} );
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert( function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
} ) ) {
	addHandle( "value", function( elem, _name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	} );
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert( function( el ) {
	return el.getAttribute( "disabled" ) == null;
} ) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
				( val = elem.getAttributeNode( name ) ) && val.specified ?
					val.value :
					null;
		}
	} );
}

return Sizzle;

} )( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: IE <=9 only
if ( !support.option ) {
	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
					dataPriv.get( this, "events" ) || Object.create( null )
				)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					// Support: IE <=9 - 11+
					// focus() and blur() are asynchronous
					notAsync = expectSync( this, type );
					this[ type ]();
					result = dataPriv.get( this, type );
					if ( saved !== result || notAsync ) {
						dataPriv.set( this, type, false );
					} else {
						result = {};
					}
					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();
						return result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering the
				// native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(

						// Support: IE <=9 - 11+
						// Extend with the prototype to reset the above stopImmediatePropagation()
						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event
				event.stopImmediatePropagation();
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, expectSync );

			// Return false to allow normal processing in the caller
			return false;
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.get( src );
		events = pdataOld.events;

		if ( events ) {
			dataPriv.remove( dest, "handle events" );

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								}, doc );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableTrDimensionsVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		},

		// Support: IE 9 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Behavior in IE 9 is more subtle than in newer versions & it passes
		// some versions of this test; make sure not to make it pass there!
		reliableTrDimensions: function() {
			var table, tr, trChild, trStyle;
			if ( reliableTrDimensionsVal == null ) {
				table = document.createElement( "table" );
				tr = document.createElement( "tr" );
				trChild = document.createElement( "div" );

				table.style.cssText = "position:absolute;left:-11111px";
				tr.style.height = "1px";
				trChild.style.height = "9px";

				documentElement
					.appendChild( table )
					.appendChild( tr )
					.appendChild( trChild );

				trStyle = window.getComputedStyle( tr );
				reliableTrDimensionsVal = parseInt( trStyle.height ) > 3;

				documentElement.removeChild( table );
			}
			return reliableTrDimensionsVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Support: IE 9 - 11 only
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( !support.boxSizingReliable() && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ||

		// Support: Android <=4.1 - 4.3 only
		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"gridArea": true,
		"gridColumn": true,
		"gridColumnEnd": true,
		"gridColumnStart": true,
		"gridRow": true,
		"gridRowEnd": true,
		"gridRowStart": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
					jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = (
					dataPriv.get( cur, "events" ) || Object.create( null )
				)[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {

				// Handle: regular nodes (via `this.ownerDocument`), window
				// (via `this.document`) & document (via `this`).
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = { guid: Date.now() };

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
					uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script
			if ( !isSuccess && jQuery.inArray( "script", s.dataTypes ) > -1 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );


jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			if ( typeof props.top === "number" ) {
				props.top += "px";
			}
			if ( typeof props.left === "number" ) {
				props.left += "px";
			}
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( _i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );

jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );




// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};

jQuery.trim = function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "" );
};



// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

},{"process":"node_modules/process/browser.js"}],"Utils.ts":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Utils = void 0;

var UIElement_1 = require("./UI/UIElement");

var $ = __importStar(require("jquery"));

var FixedUiElement_1 = require("./UI/Base/FixedUiElement");

var Utils =
/** @class */
function () {
  function Utils() {}

  Utils.EncodeXmlValue = function (str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  };
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

  Utils.Times = function (str, count) {
    var res = "";

    for (var i = 0; i < count; i++) {
      res += str;
    }

    return res;
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

  Utils.isRetina = function () {
    if (UIElement_1.UIElement.runningFromConsole) {
      return;
    } // The cause for this line of code: https://github.com/pietervdvn/MapComplete/issues/115
    // See https://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript


    return window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches) || window.devicePixelRatio && window.devicePixelRatio >= 2;
  }; // Date will be undefined on failure


  Utils.changesetDate = function (id, action) {
    $.getJSON("https://www.openstreetmap.org/api/0.6/changeset/" + id, function (data) {
      console.log(data);
      action(new Date(data.elements[0].created_at));
    }).fail(function () {
      action(undefined);
    });
  };

  Utils.generateStats = function (action) {
    // Binary searches the latest changeset
    function search(lowerBound, upperBound, onCsFound, depth) {
      if (depth === void 0) {
        depth = 0;
      }

      if (depth > 30) {
        return;
      }

      var tested = Math.floor((lowerBound + upperBound) / 2);
      console.log("Testing", tested);
      Utils.changesetDate(tested, function (createdAtDate) {
        new FixedUiElement_1.FixedUiElement("Searching, value between " + lowerBound + " and " + upperBound + ". Queries till now: " + depth).AttachTo('maindiv');

        if (lowerBound + 1 >= upperBound) {
          onCsFound(lowerBound, createdAtDate);
          return;
        }

        if (createdAtDate !== undefined) {
          search(tested, upperBound, onCsFound, depth + 1);
        } else {
          search(lowerBound, tested, onCsFound, depth + 1);
        }
      });
    }

    search(91000000, 100000000, function (last, lastDate) {
      var link = "http://osm.org/changeset/" + last;
      var delta = 100000;
      Utils.changesetDate(last - delta, function (prevDate) {
        var diff = (lastDate.getTime() - prevDate.getTime()) / 1000; // Diff: seconds needed/delta changesets

        var secsPerCS = diff / delta;
        var stillNeeded = 1000000 - last % 1000000;
        var timeNeededSeconds = Math.floor(secsPerCS * stillNeeded);
        var secNeeded = timeNeededSeconds % 60;
        var minNeeded = Math.floor(timeNeededSeconds / 60) % 60;
        var hourNeeded = Math.floor(timeNeededSeconds / (60 * 60)) % 24;
        var daysNeeded = Math.floor(timeNeededSeconds / (24 * 60 * 60));
        var result = "Last changeset: <a href='" + link + "'>" + link + "</a><br/>We needed " + Math.floor(diff / 60) + " minutes for the last " + delta + " changesets.<br/>\nThis is around " + secsPerCS + " seconds/changeset.<br/> The next million (still " + stillNeeded + " away) will be broken in around " + daysNeeded + " days " + hourNeeded + ":" + minNeeded + ":" + secNeeded;
        action(result);
      });
    });
  };

  return Utils;
}();

exports.Utils = Utils;
},{"./UI/UIElement":"UI/UIElement.ts","jquery":"node_modules/jquery/dist/jquery.js","./UI/Base/FixedUiElement":"UI/Base/FixedUiElement.ts"}],"UI/Base/Combine.ts":[function(require,module,exports) {
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
      if (ui === undefined || ui === null) {
        return "";
      }

      if (ui.Render === undefined) {
        console.error("Not a UI-element", ui);
        return "";
      }

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
},{"./Translation":"UI/i18n/Translation.ts","../Base/FixedUiElement":"UI/Base/FixedUiElement.ts"}],"Logic/ElementStorage.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ElementStorage = void 0;
/**
 * Keeps track of a dictionary 'elementID' -> element
 */

var UIEventSource_1 = require("./UIEventSource");

var ElementStorage =
/** @class */
function () {
  function ElementStorage() {
    this._elements = [];
  }

  ElementStorage.prototype.addElementById = function (id, eventSource) {
    this._elements[id] = eventSource;
  };

  ElementStorage.prototype.addElement = function (element) {
    var eventSource = new UIEventSource_1.UIEventSource(element.properties);
    this._elements[element.properties.id] = eventSource;
    return eventSource;
  };

  ElementStorage.prototype.addOrGetElement = function (element) {
    var elementId = element.properties.id;

    if (elementId in this._elements) {
      var es = this._elements[elementId];
      var keptKeys = es.data; // The element already exists
      // We add all the new keys to the old keys

      for (var k in element.properties) {
        var v = element.properties[k];

        if (keptKeys[k] !== v) {
          keptKeys[k] = v;
          es.ping();
        }
      }

      return es;
    } else {
      return this.addElement(element);
    }
  };

  ElementStorage.prototype.getElement = function (elementId) {
    if (elementId in this._elements) {
      return this._elements[elementId];
    }

    console.log("Can not find eventsource with id ", elementId);
  };

  return ElementStorage;
}();

exports.ElementStorage = ElementStorage;
},{"./UIEventSource":"Logic/UIEventSource.ts"}],"Logic/Osm/OsmObject.ts":[function(require,module,exports) {
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

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsmRelation = exports.OsmWay = exports.OsmNode = exports.OsmObject = void 0;

var $ = __importStar(require("jquery"));

var Utils_1 = require("../../Utils");

var OsmObject =
/** @class */
function () {
  function OsmObject(type, id) {
    this.tags = {};
    this.changed = false;
    this.id = id;
    this.type = type;
  }

  OsmObject.DownloadObject = function (id, continuation) {
    var splitted = id.split("/");
    var type = splitted[0];
    var idN = splitted[1];

    var newContinuation = function newContinuation(element) {
      console.log("Received: ", element);
      continuation(element);
    };

    switch (type) {
      case "node":
        return new OsmNode(idN).Download(newContinuation);

      case "way":
        return new OsmWay(idN).Download(newContinuation);

      case "relation":
        return new OsmRelation(idN).Download(newContinuation);
    }
  };
  /**
   * Generates the changeset-XML for tags
   * @constructor
   */


  OsmObject.prototype.TagsXML = function () {
    var tags = "";

    for (var key in this.tags) {
      var v = this.tags[key];

      if (v !== "") {
        tags += '        <tag k="' + Utils_1.Utils.EncodeXmlValue(key) + '" v="' + Utils_1.Utils.EncodeXmlValue(this.tags[key]) + '"/>\n';
      }
    }

    return tags;
  };

  OsmObject.prototype.Download = function (continuation) {
    var self = this;
    $.getJSON("https://www.openstreetmap.org/api/0.6/" + this.type + "/" + this.id, function (data) {
      var element = data.elements[0];
      self.tags = element.tags;
      self.version = element.version;
      self.SaveExtraData(element);
      continuation(self);
    });
    return this;
  };

  OsmObject.prototype.addTag = function (k, v) {
    if (k in this.tags) {
      var oldV = this.tags[k];

      if (oldV == v) {
        return;
      }

      console.log("WARNING: overwriting ", oldV, " with ", v, " for key ", k);
    }

    this.tags[k] = v;

    if (v === undefined || v === "") {
      delete this.tags[k];
    }

    this.changed = true;
  };

  OsmObject.prototype.VersionXML = function () {
    if (this.version === undefined) {
      return "";
    }

    return 'version="' + this.version + '"';
  };

  OsmObject.DownloadAll = function (neededIds, knownElements, continuation) {
    if (knownElements === void 0) {
      knownElements = {};
    } // local function which downloads all the objects one by one
    // this is one big loop, running one download, then rerunning the entire function


    if (neededIds.length == 0) {
      continuation(knownElements);
      return;
    }

    var neededId = neededIds.pop();

    if (neededId in knownElements) {
      OsmObject.DownloadAll(neededIds, knownElements, continuation);
      return;
    }

    console.log("Downloading ", neededId);
    OsmObject.DownloadObject(neededId, function (element) {
      knownElements[neededId] = element; // assign the element for later, continue downloading the next element

      OsmObject.DownloadAll(neededIds, knownElements, continuation);
    });
  };

  return OsmObject;
}();

exports.OsmObject = OsmObject;

var OsmNode =
/** @class */
function (_super) {
  __extends(OsmNode, _super);

  function OsmNode(id) {
    return _super.call(this, "node", id) || this;
  }

  OsmNode.prototype.ChangesetXML = function (changesetId) {
    var tags = this.TagsXML();
    var change = '        <node id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + ' lat="' + this.lat + '" lon="' + this.lon + '">\n' + tags + '        </node>\n';
    return change;
  };

  OsmNode.prototype.SaveExtraData = function (element) {
    this.lat = element.lat;
    this.lon = element.lon;
  };

  return OsmNode;
}(OsmObject);

exports.OsmNode = OsmNode;

var OsmWay =
/** @class */
function (_super) {
  __extends(OsmWay, _super);

  function OsmWay(id) {
    return _super.call(this, "way", id) || this;
  }

  OsmWay.prototype.ChangesetXML = function (changesetId) {
    var tags = this.TagsXML();
    var nds = "";

    for (var node in this.nodes) {
      nds += '      <nd ref="' + this.nodes[node] + '"/>\n';
    }

    var change = '    <way id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + '>\n' + nds + tags + '        </way>\n';
    return change;
  };

  OsmWay.prototype.SaveExtraData = function (element) {
    this.nodes = element.nodes;
  };

  return OsmWay;
}(OsmObject);

exports.OsmWay = OsmWay;

var OsmRelation =
/** @class */
function (_super) {
  __extends(OsmRelation, _super);

  function OsmRelation(id) {
    return _super.call(this, "relation", id) || this;
  }

  OsmRelation.prototype.ChangesetXML = function (changesetId) {
    var members = "";

    for (var memberI in this.members) {
      var member = this.members[memberI];
      members += '      <member type="' + member.type + '" ref="' + member.ref + '" role="' + member.role + '"/>\n';
    }

    var tags = this.TagsXML();
    var change = '    <relation id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + '>\n' + members + tags + '        </relation>\n';
    return change;
  };

  OsmRelation.prototype.SaveExtraData = function (element) {
    this.members = element.members;
  };

  return OsmRelation;
}(OsmObject);

exports.OsmRelation = OsmRelation;
},{"jquery":"node_modules/jquery/dist/jquery.js","../../Utils":"Utils.ts"}],"Logic/Tags.ts":[function(require,module,exports) {
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
},{"../Utils":"Utils.ts"}],"Logic/Osm/Changes.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Changes = void 0;
/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */

var OsmObject_1 = require("./OsmObject");

var Tags_1 = require("../Tags");

var State_1 = require("../../State");

var Utils_1 = require("../../Utils");

var Changes =
/** @class */
function () {
  function Changes() {}

  Changes.prototype.addTag = function (elementId, tagsFilter) {
    var changes = this.tagToChange(tagsFilter);

    if (changes.length == 0) {
      return;
    }

    var eventSource = State_1.State.state.allElements.getElement(elementId);
    var elementTags = eventSource.data;
    var pending = [];

    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
      var change = changes_1[_i];

      if (elementTags[change.k] !== change.v) {
        elementTags[change.k] = change.v;
        pending.push({
          elementId: elementTags.id,
          key: change.k,
          value: change.v
        });
      }
    }

    if (pending.length === 0) {
      return;
    }

    eventSource.ping();
    this.uploadAll([], pending);
  };

  Changes.prototype.tagToChange = function (tagsFilter) {
    var changes = [];

    if (tagsFilter instanceof Tags_1.Tag) {
      var tag = tagsFilter;

      if (typeof tag.value !== "string") {
        throw "Invalid value";
      }

      return [this.checkChange(tag.key, tag.value)];
    }

    if (tagsFilter instanceof Tags_1.And) {
      var and = tagsFilter;

      for (var _i = 0, _a = and.and; _i < _a.length; _i++) {
        var tag = _a[_i];
        changes = changes.concat(this.tagToChange(tag));
      }

      return changes;
    }

    console.log("Unsupported tagsfilter element to addTag", tagsFilter);
    throw "Unsupported tagsFilter element";
  };
  /**
   * Adds a change to the pending changes
   * @param elementId
   * @param key
   * @param value
   */


  Changes.prototype.checkChange = function (key, value) {
    if (key === undefined || key === null) {
      console.log("Invalid key");
      return undefined;
    }

    if (value === undefined || value === null) {
      console.log("Invalid value for ", key);
      return undefined;
    }

    if (key.startsWith(" ") || value.startsWith(" ") || value.endsWith(" ") || key.endsWith(" ")) {
      console.warn("Tag starts with or ends with a space - trimming anyway");
    }

    key = key.trim();
    value = value.trim();
    return {
      k: key,
      v: value
    };
  };
  /**
   * Create a new node element at the given lat/long.
   * An internal OsmObject is created to upload later on, a geojson represention is returned.
   * Note that the geojson version shares the tags (properties) by pointer, but has _no_ id in properties
   */


  Changes.prototype.createElement = function (basicTags, lat, lon) {
    console.log("Creating a new element with ", basicTags);
    var osmNode = new OsmObject_1.OsmNode(Changes._nextId);
    Changes._nextId--;
    var id = "node/" + osmNode.id;
    osmNode.lat = lat;
    osmNode.lon = lon;
    var properties = {
      id: id
    };
    var geojson = {
      "type": "Feature",
      "properties": properties,
      "id": id,
      "geometry": {
        "type": "Point",
        "coordinates": [lon, lat]
      }
    }; // The basictags are COPIED, the id is included in the properties
    // The tags are not yet written into the OsmObject, but this is applied onto a 

    var changes = [];

    for (var _i = 0, basicTags_1 = basicTags; _i < basicTags_1.length; _i++) {
      var kv = basicTags_1[_i];
      properties[kv.key] = kv.value;

      if (typeof kv.value !== "string") {
        throw "Invalid value: don't use a regex in a preset";
      }

      changes.push({
        elementId: id,
        key: kv.key,
        value: kv.value
      });
    }

    State_1.State.state.allElements.addOrGetElement(geojson).ping();
    this.uploadAll([osmNode], changes);
    return geojson;
  };

  Changes.prototype.uploadChangesWithLatestVersions = function (knownElements, newElements, pending) {
    // Here, inside the continuation, we know that all 'neededIds' are loaded in 'knownElements', which maps the ids onto the elements
    // We apply the changes on them
    for (var _i = 0, pending_1 = pending; _i < pending_1.length; _i++) {
      var change = pending_1[_i];

      if (parseInt(change.elementId.split("/")[1]) < 0) {
        // This is a new element - we should apply this on one of the new elements
        for (var _a = 0, newElements_1 = newElements; _a < newElements_1.length; _a++) {
          var newElement = newElements_1[_a];

          if (newElement.type + "/" + newElement.id === change.elementId) {
            newElement.addTag(change.key, change.value);
          }
        }
      } else {
        knownElements[change.elementId].addTag(change.key, change.value);
      }
    } // Small sanity check for duplicate information


    var changedElements = [];

    for (var elementId in knownElements) {
      var element = knownElements[elementId];

      if (element.changed) {
        changedElements.push(element);
      }
    }

    if (changedElements.length == 0 && newElements.length == 0) {
      console.log("No changes in any object");
      return;
    }

    console.log("Beginning upload..."); // At last, we build the changeset and upload

    State_1.State.state.osmConnection.UploadChangeset(State_1.State.state.layoutToUse.data, State_1.State.state.allElements, function (csId) {
      var modifications = "";

      for (var _i = 0, changedElements_1 = changedElements; _i < changedElements_1.length; _i++) {
        var element = changedElements_1[_i];

        if (!element.changed) {
          continue;
        }

        modifications += element.ChangesetXML(csId) + "\n";
      }

      var creations = "";

      for (var _a = 0, newElements_2 = newElements; _a < newElements_2.length; _a++) {
        var newElement = newElements_2[_a];
        creations += newElement.ChangesetXML(csId);
      }

      var changes = "<osmChange version='0.6' generator='Mapcomplete " + State_1.State.vNumber + "'>";

      if (creations.length > 0) {
        changes += "<create>" + creations + "</create>";
      }

      if (modifications.length > 0) {
        changes += "<modify>\n" + modifications + "\n</modify>";
      }

      changes += "</osmChange>";
      return changes;
    });
  };

  ;

  Changes.prototype.uploadAll = function (newElements, pending) {
    var self = this;
    var neededIds = [];

    for (var _i = 0, pending_2 = pending; _i < pending_2.length; _i++) {
      var change = pending_2[_i];
      var id = change.elementId;

      if (parseFloat(id.split("/")[1]) < 0) {// New element - we don't have to download this
      } else {
        neededIds.push(id);
      }
    }

    neededIds = Utils_1.Utils.Dedup(neededIds);
    OsmObject_1.OsmObject.DownloadAll(neededIds, {}, function (knownElements) {
      self.uploadChangesWithLatestVersions(knownElements, newElements, pending);
    });
  };

  Changes._nextId = -1; // New assined ID's are negative

  return Changes;
}();

exports.Changes = Changes;
},{"./OsmObject":"Logic/Osm/OsmObject.ts","../Tags":"Logic/Tags.ts","../../State":"State.ts","../../Utils":"Utils.ts"}],"node_modules/jshashes/hashes.js":[function(require,module,exports) {
var global = arguments[3];
var define;
/**
 * jshashes - https://github.com/h2non/jshashes
 * Released under the "New BSD" license
 *
 * Algorithms specification:
 *
 * MD5 - http://www.ietf.org/rfc/rfc1321.txt
 * RIPEMD-160 - http://homes.esat.kuleuven.be/~bosselae/ripemd160.html
 * SHA1   - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA256 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA512 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * HMAC - http://www.ietf.org/rfc/rfc2104.txt
 */
(function() {
  var Hashes;

  function utf8Encode(str) {
    var x, y, output = '',
      i = -1,
      l;

    if (str && str.length) {
      l = str.length;
      while ((i += 1) < l) {
        /* Decode utf-16 surrogate pairs */
        x = str.charCodeAt(i);
        y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
          i += 1;
        }
        /* Encode output as utf-8 */
        if (x <= 0x7F) {
          output += String.fromCharCode(x);
        } else if (x <= 0x7FF) {
          output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
            0x80 | (x & 0x3F));
        } else if (x <= 0xFFFF) {
          output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        } else if (x <= 0x1FFFFF) {
          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
            0x80 | ((x >>> 12) & 0x3F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        }
      }
    }
    return output;
  }

  function utf8Decode(str) {
    var i, ac, c1, c2, c3, arr = [],
      l;
    i = ac = c1 = c2 = c3 = 0;

    if (str && str.length) {
      l = str.length;
      str += '';

      while (i < l) {
        c1 = str.charCodeAt(i);
        ac += 1;
        if (c1 < 128) {
          arr[ac] = String.fromCharCode(c1);
          i += 1;
        } else if (c1 > 191 && c1 < 224) {
          c2 = str.charCodeAt(i + 1);
          arr[ac] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = str.charCodeAt(i + 1);
          c3 = str.charCodeAt(i + 2);
          arr[ac] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
    }
    return arr.join('');
  }

  /**
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */

  function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /**
   * Bitwise rotate a 32-bit number to the left.
   */

  function bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /**
   * Convert a raw string to a hex string
   */

  function rstr2hex(input, hexcase) {
    var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef',
      output = '',
      x, i = 0,
      l = input.length;
    for (; i < l; i += 1) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
  }

  /**
   * Encode a string as utf-16
   */

  function str2rstr_utf16le(input) {
    var i, l = input.length,
      output = '';
    for (i = 0; i < l; i += 1) {
      output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
    }
    return output;
  }

  function str2rstr_utf16be(input) {
    var i, l = input.length,
      output = '';
    for (i = 0; i < l; i += 1) {
      output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
    }
    return output;
  }

  /**
   * Convert an array of big-endian words to a string
   */

  function binb2rstr(input) {
    var i, l = input.length * 32,
      output = '';
    for (i = 0; i < l; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
    }
    return output;
  }

  /**
   * Convert an array of little-endian words to a string
   */

  function binl2rstr(input) {
    var i, l = input.length * 32,
      output = '';
    for (i = 0; i < l; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
    }
    return output;
  }

  /**
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   */

  function rstr2binl(input) {
    var i, l = input.length * 8,
      output = Array(input.length >> 2),
      lo = output.length;
    for (i = 0; i < lo; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < l; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return output;
  }

  /**
   * Convert a raw string to an array of big-endian words
   * Characters >255 have their high-byte silently ignored.
   */

  function rstr2binb(input) {
    var i, l = input.length * 8,
      output = Array(input.length >> 2),
      lo = output.length;
    for (i = 0; i < lo; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < l; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return output;
  }

  /**
   * Convert a raw string to an arbitrary string encoding
   */

  function rstr2any(input, encoding) {
    var divisor = encoding.length,
      remainders = Array(),
      i, q, x, ld, quotient, dividend, output, full_length;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    dividend = Array(Math.ceil(input.length / 2));
    ld = dividend.length;
    for (i = 0; i < ld; i += 1) {
      dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    /**
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. We stop when the dividend is zerHashes.
     * All remainders are stored for later use.
     */
    while (dividend.length > 0) {
      quotient = Array();
      x = 0;
      for (i = 0; i < dividend.length; i += 1) {
        x = (x << 16) + dividend[i];
        q = Math.floor(x / divisor);
        x -= q * divisor;
        if (quotient.length > 0 || q > 0) {
          quotient[quotient.length] = q;
        }
      }
      remainders[remainders.length] = x;
      dividend = quotient;
    }

    /* Convert the remainders to the output string */
    output = '';
    for (i = remainders.length - 1; i >= 0; i--) {
      output += encoding.charAt(remainders[i]);
    }

    /* Append leading zero equivalents */
    full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    for (i = output.length; i < full_length; i += 1) {
      output = encoding[0] + output;
    }
    return output;
  }

  /**
   * Convert a raw string to a base-64 string
   */

  function rstr2b64(input, b64pad) {
    var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = '',
      len = input.length,
      i, j, triplet;
    b64pad = b64pad || '=';
    for (i = 0; i < len; i += 3) {
      triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      for (j = 0; j < 4; j += 1) {
        if (i * 8 + j * 6 > input.length * 8) {
          output += b64pad;
        } else {
          output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
      }
    }
    return output;
  }

  Hashes = {
    /**
     * @property {String} version
     * @readonly
     */
    VERSION: '1.0.6',
    /**
     * @member Hashes
     * @class Base64
     * @constructor
     */
    Base64: function() {
      // private properties
      var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        pad = '=', // default pad according with the RFC standard
        url = false, // URL encoding support @todo
        utf8 = true; // by default enable UTF-8 support encoding

      // public method for encoding
      this.encode = function(input) {
        var i, j, triplet,
          output = '',
          len = input.length;

        pad = pad || '=';
        input = (utf8) ? utf8Encode(input) : input;

        for (i = 0; i < len; i += 3) {
          triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
          for (j = 0; j < 4; j += 1) {
            if (i * 8 + j * 6 > len * 8) {
              output += pad;
            } else {
              output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
            }
          }
        }
        return output;
      };

      // public method for decoding
      this.decode = function(input) {
        // var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var i, o1, o2, o3, h1, h2, h3, h4, bits, ac,
          dec = '',
          arr = [];
        if (!input) {
          return input;
        }

        i = ac = 0;
        input = input.replace(new RegExp('\\' + pad, 'gi'), ''); // use '='
        //input += '';

        do { // unpack four hexets into three octets using index points in b64
          h1 = tab.indexOf(input.charAt(i += 1));
          h2 = tab.indexOf(input.charAt(i += 1));
          h3 = tab.indexOf(input.charAt(i += 1));
          h4 = tab.indexOf(input.charAt(i += 1));

          bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

          o1 = bits >> 16 & 0xff;
          o2 = bits >> 8 & 0xff;
          o3 = bits & 0xff;
          ac += 1;

          if (h3 === 64) {
            arr[ac] = String.fromCharCode(o1);
          } else if (h4 === 64) {
            arr[ac] = String.fromCharCode(o1, o2);
          } else {
            arr[ac] = String.fromCharCode(o1, o2, o3);
          }
        } while (i < input.length);

        dec = arr.join('');
        dec = (utf8) ? utf8Decode(dec) : dec;

        return dec;
      };

      // set custom pad string
      this.setPad = function(str) {
        pad = str || pad;
        return this;
      };
      // set custom tab string characters
      this.setTab = function(str) {
        tab = str || tab;
        return this;
      };
      this.setUTF8 = function(bool) {
        if (typeof bool === 'boolean') {
          utf8 = bool;
        }
        return this;
      };
    },

    /**
     * CRC-32 calculation
     * @member Hashes
     * @method CRC32
     * @static
     * @param {String} str Input String
     * @return {String}
     */
    CRC32: function(str) {
      var crc = 0,
        x = 0,
        y = 0,
        table, i, iTop;
      str = utf8Encode(str);

      table = [
        '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 ',
        '79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 ',
        '84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F ',
        '63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD ',
        'A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC ',
        '51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 ',
        'B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 ',
        '06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 ',
        'E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 ',
        '12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 ',
        'D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 ',
        '33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 ',
        'CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 ',
        '9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E ',
        '7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D ',
        '806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 ',
        '60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA ',
        'AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 ',
        '5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 ',
        'B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 ',
        '05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 ',
        'F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA ',
        '11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 ',
        'D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F ',
        '30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E ',
        'C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D'
      ].join('');

      crc = crc ^ (-1);
      for (i = 0, iTop = str.length; i < iTop; i += 1) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = '0x' + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
      }
      // always return a positive number (that's what >>> 0 does)
      return (crc ^ (-1)) >>> 0;
    },
    /**
     * @member Hashes
     * @class MD5
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See <http://pajhome.org.uk/crypt/md5> for more infHashes.
     */
    MD5: function(options) {
      /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

      // privileged (public) methods
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8), hexcase);
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d), hexcase);
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {Boolean}
       * @return {Object} this
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {String} Pad
       * @return {Object} this
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {Boolean}
       * @return {Object} [this]
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the MD5 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binl2rstr(binl(rstr2binl(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-MD5, of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        var bkey, ipad, opad, hash, i;

        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        bkey = rstr2binl(key);
        if (bkey.length > 16) {
          bkey = binl(bkey, key.length * 8);
        }

        ipad = Array(16), opad = Array(16);
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl(opad.concat(hash), 512 + 128));
      }

      /**
       * Calculate the MD5 of an array of little-endian words, and a bit length.
       */

      function binl(x, len) {
        var i, olda, oldb, oldc, oldd,
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878;

        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;

          a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
      }

      /**
       * These functions implement the four basic operations the algorithm uses.
       */

      function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
      }

      function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
      }

      function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
      }

      function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
      }
    },
    /**
     * @member Hashes
     * @class Hashes.SHA1
     * @param {Object} [config]
     * @constructor
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS 180-1
     * Version 2.2 Copyright Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    SHA1: function(options) {
      /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

      // public methods
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8), hexcase);
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-SHA1 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        var bkey, ipad, opad, i, hash;
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        bkey = rstr2binb(key);

        if (bkey.length > 16) {
          bkey = binb(bkey, key.length * 8);
        }
        ipad = Array(16), opad = Array(16);
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 512 + 160));
      }

      /**
       * Calculate the SHA-1 of an array of big-endian words, and a bit length
       */

      function binb(x, len) {
        var i, j, t, olda, oldb, oldc, oldd, olde,
          w = Array(80),
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878,
          e = -1009589776;

        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;
          olde = e;

          for (j = 0; j < 80; j += 1) {
            if (j < 16) {
              w[j] = x[i + j];
            } else {
              w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
              safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = bit_rol(b, 30);
            b = a;
            a = t;
          }

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
          e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
      }

      /**
       * Perform the appropriate triplet combination function for the current
       * iteration
       */

      function sha1_ft(t, b, c, d) {
        if (t < 20) {
          return (b & c) | ((~b) & d);
        }
        if (t < 40) {
          return b ^ c ^ d;
        }
        if (t < 60) {
          return (b & c) | (b & d) | (c & d);
        }
        return b ^ c ^ d;
      }

      /**
       * Determine the appropriate additive constant for the current iteration
       */

      function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
          (t < 60) ? -1894007588 : -899497514;
      }
    },
    /**
     * @class Hashes.SHA256
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2
     * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://anmar.eu.org/projects/jssha2/
     */
    SHA256: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        sha256_K;

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s, utf8) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-sha256 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        var hash, i = 0,
          bkey = rstr2binb(key),
          ipad = Array(16),
          opad = Array(16);

        if (bkey.length > 16) {
          bkey = binb(bkey, key.length * 8);
        }

        for (; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 512 + 256));
      }

      /*
       * Main sha256 function, with its support functions
       */

      function sha256_S(X, n) {
        return (X >>> n) | (X << (32 - n));
      }

      function sha256_R(X, n) {
        return (X >>> n);
      }

      function sha256_Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
      }

      function sha256_Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
      }

      function sha256_Sigma0256(x) {
        return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));
      }

      function sha256_Sigma1256(x) {
        return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));
      }

      function sha256_Gamma0256(x) {
        return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));
      }

      function sha256_Gamma1256(x) {
        return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));
      }

      function sha256_Sigma0512(x) {
        return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));
      }

      function sha256_Sigma1512(x) {
        return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));
      }

      function sha256_Gamma0512(x) {
        return (sha256_S(x, 1) ^ sha256_S(x, 8) ^ sha256_R(x, 7));
      }

      function sha256_Gamma1512(x) {
        return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));
      }

      sha256_K = [
        1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
        1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
        264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
        113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
        1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
        1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
      ];

      function binb(m, l) {
        var HASH = [1779033703, -1150833019, 1013904242, -1521486534,
          1359893119, -1694144372, 528734635, 1541459225
        ];
        var W = new Array(64);
        var a, b, c, d, e, f, g, h;
        var i, j, T1, T2;

        /* append padding */
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (i = 0; i < m.length; i += 16) {
          a = HASH[0];
          b = HASH[1];
          c = HASH[2];
          d = HASH[3];
          e = HASH[4];
          f = HASH[5];
          g = HASH[6];
          h = HASH[7];

          for (j = 0; j < 64; j += 1) {
            if (j < 16) {
              W[j] = m[j + i];
            } else {
              W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                sha256_Gamma0256(W[j - 15])), W[j - 16]);
            }

            T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
              sha256_K[j]), W[j]);
            T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
            h = g;
            g = f;
            f = e;
            e = safe_add(d, T1);
            d = c;
            c = b;
            b = a;
            a = safe_add(T1, T2);
          }

          HASH[0] = safe_add(a, HASH[0]);
          HASH[1] = safe_add(b, HASH[1]);
          HASH[2] = safe_add(c, HASH[2]);
          HASH[3] = safe_add(d, HASH[3]);
          HASH[4] = safe_add(e, HASH[4]);
          HASH[5] = safe_add(f, HASH[5]);
          HASH[6] = safe_add(g, HASH[6]);
          HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
      }

    },

    /**
     * @class Hashes.SHA512
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-512, as defined in FIPS 180-2
     * Version 2.2 Copyright Anonymous Contributor, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    SHA512: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false,
        /* hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        sha512_k;

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      /* private methods */

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }
      /*
       * Calculate the HMAC-SHA-512 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;

        var hash, i = 0,
          bkey = rstr2binb(key),
          ipad = Array(32),
          opad = Array(32);

        if (bkey.length > 32) {
          bkey = binb(bkey, key.length * 8);
        }

        for (; i < 32; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        hash = binb(ipad.concat(rstr2binb(data)), 1024 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 1024 + 512));
      }

      /**
       * Calculate the SHA-512 of an array of big-endian dwords, and a bit length
       */

      function binb(x, len) {
        var j, i, l,
          W = new Array(80),
          hash = new Array(16),
          //Initial hash values
          H = [
            new int64(0x6a09e667, -205731576),
            new int64(-1150833019, -2067093701),
            new int64(0x3c6ef372, -23791573),
            new int64(-1521486534, 0x5f1d36f1),
            new int64(0x510e527f, -1377402159),
            new int64(-1694144372, 0x2b3e6c1f),
            new int64(0x1f83d9ab, -79577749),
            new int64(0x5be0cd19, 0x137e2179)
          ],
          T1 = new int64(0, 0),
          T2 = new int64(0, 0),
          a = new int64(0, 0),
          b = new int64(0, 0),
          c = new int64(0, 0),
          d = new int64(0, 0),
          e = new int64(0, 0),
          f = new int64(0, 0),
          g = new int64(0, 0),
          h = new int64(0, 0),
          //Temporary variables not specified by the document
          s0 = new int64(0, 0),
          s1 = new int64(0, 0),
          Ch = new int64(0, 0),
          Maj = new int64(0, 0),
          r1 = new int64(0, 0),
          r2 = new int64(0, 0),
          r3 = new int64(0, 0);

        if (sha512_k === undefined) {
          //SHA512 constants
          sha512_k = [
            new int64(0x428a2f98, -685199838), new int64(0x71374491, 0x23ef65cd),
            new int64(-1245643825, -330482897), new int64(-373957723, -2121671748),
            new int64(0x3956c25b, -213338824), new int64(0x59f111f1, -1241133031),
            new int64(-1841331548, -1357295717), new int64(-1424204075, -630357736),
            new int64(-670586216, -1560083902), new int64(0x12835b01, 0x45706fbe),
            new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, -704662302),
            new int64(0x72be5d74, -226784913), new int64(-2132889090, 0x3b1696b1),
            new int64(-1680079193, 0x25c71235), new int64(-1046744716, -815192428),
            new int64(-459576895, -1628353838), new int64(-272742522, 0x384f25e3),
            new int64(0xfc19dc6, -1953704523), new int64(0x240ca1cc, 0x77ac9c65),
            new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
            new int64(0x5cb0a9dc, -1119749164), new int64(0x76f988da, -2096016459),
            new int64(-1740746414, -295247957), new int64(-1473132947, 0x2db43210),
            new int64(-1341970488, -1728372417), new int64(-1084653625, -1091629340),
            new int64(-958395405, 0x3da88fc2), new int64(-710438585, -1828018395),
            new int64(0x6ca6351, -536640913), new int64(0x14292967, 0xa0e6e70),
            new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
            new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, -1651133473),
            new int64(0x650a7354, -1951439906), new int64(0x766a0abb, 0x3c77b2a8),
            new int64(-2117940946, 0x47edaee6), new int64(-1838011259, 0x1482353b),
            new int64(-1564481375, 0x4cf10364), new int64(-1474664885, -1136513023),
            new int64(-1035236496, -789014639), new int64(-949202525, 0x654be30),
            new int64(-778901479, -688958952), new int64(-694614492, 0x5565a910),
            new int64(-200395387, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
            new int64(0x19a4c116, -1194143544), new int64(0x1e376c08, 0x5141ab53),
            new int64(0x2748774c, -544281703), new int64(0x34b0bcb5, -509917016),
            new int64(0x391c0cb3, -976659869), new int64(0x4ed8aa4a, -482243893),
            new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, -692930397),
            new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
            new int64(-2067236844, -1578062990), new int64(-1933114872, 0x1a6439ec),
            new int64(-1866530822, 0x23631e28), new int64(-1538233109, -561857047),
            new int64(-1090935817, -1295615723), new int64(-965641998, -479046869),
            new int64(-903397682, -366583396), new int64(-779700025, 0x21c0c207),
            new int64(-354779690, -840897762), new int64(-176337025, -294727304),
            new int64(0x6f067aa, 0x72176fba), new int64(0xa637dc5, -1563912026),
            new int64(0x113f9804, -1090974290), new int64(0x1b710b35, 0x131c471b),
            new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
            new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, -1676669620),
            new int64(0x4cc5d4be, -885112138), new int64(0x597f299c, -60457430),
            new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817)
          ];
        }

        for (i = 0; i < 80; i += 1) {
          W[i] = new int64(0, 0);
        }

        // append padding to the source string. The format is described in the FIPS.
        x[len >> 5] |= 0x80 << (24 - (len & 0x1f));
        x[((len + 128 >> 10) << 5) + 31] = len;
        l = x.length;
        for (i = 0; i < l; i += 32) { //32 dwords is the block size
          int64copy(a, H[0]);
          int64copy(b, H[1]);
          int64copy(c, H[2]);
          int64copy(d, H[3]);
          int64copy(e, H[4]);
          int64copy(f, H[5]);
          int64copy(g, H[6]);
          int64copy(h, H[7]);

          for (j = 0; j < 16; j += 1) {
            W[j].h = x[i + 2 * j];
            W[j].l = x[i + 2 * j + 1];
          }

          for (j = 16; j < 80; j += 1) {
            //sigma1
            int64rrot(r1, W[j - 2], 19);
            int64revrrot(r2, W[j - 2], 29);
            int64shr(r3, W[j - 2], 6);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;
            //sigma0
            int64rrot(r1, W[j - 15], 1);
            int64rrot(r2, W[j - 15], 8);
            int64shr(r3, W[j - 15], 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
          }

          for (j = 0; j < 80; j += 1) {
            //Ch
            Ch.l = (e.l & f.l) ^ (~e.l & g.l);
            Ch.h = (e.h & f.h) ^ (~e.h & g.h);

            //Sigma1
            int64rrot(r1, e, 14);
            int64rrot(r2, e, 18);
            int64revrrot(r3, e, 9);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;

            //Sigma0
            int64rrot(r1, a, 28);
            int64revrrot(r2, a, 2);
            int64revrrot(r3, a, 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            //Maj
            Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
            Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);

            int64add5(T1, h, s1, Ch, sha512_k[j], W[j]);
            int64add(T2, s0, Maj);

            int64copy(h, g);
            int64copy(g, f);
            int64copy(f, e);
            int64add(e, d, T1);
            int64copy(d, c);
            int64copy(c, b);
            int64copy(b, a);
            int64add(a, T1, T2);
          }
          int64add(H[0], H[0], a);
          int64add(H[1], H[1], b);
          int64add(H[2], H[2], c);
          int64add(H[3], H[3], d);
          int64add(H[4], H[4], e);
          int64add(H[5], H[5], f);
          int64add(H[6], H[6], g);
          int64add(H[7], H[7], h);
        }

        //represent the hash as an array of 32-bit dwords
        for (i = 0; i < 8; i += 1) {
          hash[2 * i] = H[i].h;
          hash[2 * i + 1] = H[i].l;
        }
        return hash;
      }

      //A constructor for 64-bit numbers

      function int64(h, l) {
        this.h = h;
        this.l = l;
        //this.toString = int64toString;
      }

      //Copies src into dst, assuming both are 64-bit numbers

      function int64copy(dst, src) {
        dst.h = src.h;
        dst.l = src.l;
      }

      //Right-rotates a 64-bit number by shift
      //Won't handle cases of shift>=32
      //The function revrrot() is for that

      function int64rrot(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift) | (x.l << (32 - shift));
      }

      //Reverses the dwords of the source and then rotates right by shift.
      //This is equivalent to rotation by 32+shift

      function int64revrrot(dst, x, shift) {
        dst.l = (x.h >>> shift) | (x.l << (32 - shift));
        dst.h = (x.l >>> shift) | (x.h << (32 - shift));
      }

      //Bitwise-shifts right a 64-bit number by shift
      //Won't handle shift>=32, but it's never needed in SHA512

      function int64shr(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift);
      }

      //Adds two 64-bit numbers
      //Like the original implementation, does not rely on 32-bit operations

      function int64add(dst, x, y) {
        var w0 = (x.l & 0xffff) + (y.l & 0xffff);
        var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
        var w2 = (x.h & 0xffff) + (y.h & 0xffff) + (w1 >>> 16);
        var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }

      //Same, except with 4 addends. Works faster than adding them one by one.

      function int64add4(dst, a, b, c, d) {
        var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff);
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
        var w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (w1 >>> 16);
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }

      //Same, except with 5 addends

      function int64add5(dst, a, b, c, d, e) {
        var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff) + (e.l & 0xffff),
          w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16),
          w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (e.h & 0xffff) + (w1 >>> 16),
          w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }
    },
    /**
     * @class Hashes.RMD160
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RIPEMD-160 Algorithm
     * Version 2.2 Copyright Jeremy Lin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://www.ocf.berkeley.edu/~jjlin/jsotp/
     */
    RMD160: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false,
        /* hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pa : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        rmd160_r1 = [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
          7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
          3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
          1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
          4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ],
        rmd160_r2 = [
          5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
          6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
          15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
          8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
          12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ],
        rmd160_s1 = [
          11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
          7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
          11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
          11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
          9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ],
        rmd160_s2 = [
          8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
          9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
          9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
          15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
          8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ];

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        if (typeof a !== 'undefined') {
          b64pad = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      /* private methods */

      /**
       * Calculate the rmd160 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binl2rstr(binl(rstr2binl(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-rmd160 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        var i, hash,
          bkey = rstr2binl(key),
          ipad = Array(16),
          opad = Array(16);

        if (bkey.length > 16) {
          bkey = binl(bkey, key.length * 8);
        }

        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl(opad.concat(hash), 512 + 160));
      }

      /**
       * Convert an array of little-endian words to a string
       */

      function binl2rstr(input) {
        var i, output = '',
          l = input.length * 32;
        for (i = 0; i < l; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
      }

      /**
       * Calculate the RIPE-MD160 of an array of little-endian words, and a bit length.
       */

      function binl(x, len) {
        var T, j, i, l,
          h0 = 0x67452301,
          h1 = 0xefcdab89,
          h2 = 0x98badcfe,
          h3 = 0x10325476,
          h4 = 0xc3d2e1f0,
          A1, B1, C1, D1, E1,
          A2, B2, C2, D2, E2;

        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        l = x.length;

        for (i = 0; i < l; i += 16) {
          A1 = A2 = h0;
          B1 = B2 = h1;
          C1 = C2 = h2;
          D1 = D2 = h3;
          E1 = E2 = h4;
          for (j = 0; j <= 79; j += 1) {
            T = safe_add(A1, rmd160_f(j, B1, C1, D1));
            T = safe_add(T, x[i + rmd160_r1[j]]);
            T = safe_add(T, rmd160_K1(j));
            T = safe_add(bit_rol(T, rmd160_s1[j]), E1);
            A1 = E1;
            E1 = D1;
            D1 = bit_rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = safe_add(A2, rmd160_f(79 - j, B2, C2, D2));
            T = safe_add(T, x[i + rmd160_r2[j]]);
            T = safe_add(T, rmd160_K2(j));
            T = safe_add(bit_rol(T, rmd160_s2[j]), E2);
            A2 = E2;
            E2 = D2;
            D2 = bit_rol(C2, 10);
            C2 = B2;
            B2 = T;
          }

          T = safe_add(h1, safe_add(C1, D2));
          h1 = safe_add(h2, safe_add(D1, E2));
          h2 = safe_add(h3, safe_add(E1, A2));
          h3 = safe_add(h4, safe_add(A1, B2));
          h4 = safe_add(h0, safe_add(B1, C2));
          h0 = T;
        }
        return [h0, h1, h2, h3, h4];
      }

      // specific algorithm methods

      function rmd160_f(j, x, y, z) {
        return (0 <= j && j <= 15) ? (x ^ y ^ z) :
          (16 <= j && j <= 31) ? (x & y) | (~x & z) :
          (32 <= j && j <= 47) ? (x | ~y) ^ z :
          (48 <= j && j <= 63) ? (x & z) | (y & ~z) :
          (64 <= j && j <= 79) ? x ^ (y | ~z) :
          'rmd160_f: j out of range';
      }

      function rmd160_K1(j) {
        return (0 <= j && j <= 15) ? 0x00000000 :
          (16 <= j && j <= 31) ? 0x5a827999 :
          (32 <= j && j <= 47) ? 0x6ed9eba1 :
          (48 <= j && j <= 63) ? 0x8f1bbcdc :
          (64 <= j && j <= 79) ? 0xa953fd4e :
          'rmd160_K1: j out of range';
      }

      function rmd160_K2(j) {
        return (0 <= j && j <= 15) ? 0x50a28be6 :
          (16 <= j && j <= 31) ? 0x5c4dd124 :
          (32 <= j && j <= 47) ? 0x6d703ef3 :
          (48 <= j && j <= 63) ? 0x7a6d76e9 :
          (64 <= j && j <= 79) ? 0x00000000 :
          'rmd160_K2: j out of range';
      }
    }
  };

  // exposes Hashes
  (function(window, undefined) {
    var freeExports = false;
    if (typeof exports === 'object') {
      freeExports = exports;
      if (exports && typeof global === 'object' && global && global === global.global) {
        window = global;
      }
    }

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
      // define as an anonymous module, so, through path mapping, it can be aliased
      define(function() {
        return Hashes;
      });
    } else if (freeExports) {
      // in Node.js or RingoJS v0.8.0+
      if (typeof module === 'object' && module && module.exports === freeExports) {
        module.exports = Hashes;
      }
      // in Narwhal or RingoJS v0.7.0-
      else {
        freeExports.Hashes = Hashes;
      }
    } else {
      // in a browser or Rhino
      window.Hashes = Hashes;
    }
  }(this));
}()); // IIFE

},{}],"node_modules/xtend/immutable.js":[function(require,module,exports) {
module.exports = extend;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
  var target = {};

  for (var i = 0; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
}
},{}],"node_modules/ohauth/index.js":[function(require,module,exports) {
'use strict';

var hashes = require('jshashes'),
    xtend = require('xtend'),
    sha1 = new hashes.SHA1();

var ohauth = {};

ohauth.qsString = function(obj) {
    return Object.keys(obj).sort().map(function(key) {
        return ohauth.percentEncode(key) + '=' +
            ohauth.percentEncode(obj[key]);
    }).join('&');
};

ohauth.stringQs = function(str) {
    return str.split('&').filter(function (pair) {
        return pair !== '';
    }).reduce(function(obj, pair){
        var parts = pair.split('=');
        obj[decodeURIComponent(parts[0])] = (null === parts[1]) ?
            '' : decodeURIComponent(parts[1]);
        return obj;
    }, {});
};

ohauth.rawxhr = function(method, url, data, headers, callback) {
    var xhr = new XMLHttpRequest(),
        twoHundred = /^20\d$/;
    xhr.onreadystatechange = function() {
        if (4 === xhr.readyState && 0 !== xhr.status) {
            if (twoHundred.test(xhr.status)) callback(null, xhr);
            else return callback(xhr, null);
        }
    };
    xhr.onerror = function(e) { return callback(e, null); };
    xhr.open(method, url, true);
    for (var h in headers) xhr.setRequestHeader(h, headers[h]);
    xhr.send(data);
    return xhr;
};

ohauth.xhr = function(method, url, auth, data, options, callback) {
    var headers = (options && options.header) || {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    headers.Authorization = 'OAuth ' + ohauth.authHeader(auth);
    return ohauth.rawxhr(method, url, data, headers, callback);
};

ohauth.nonce = function() {
    for (var o = ''; o.length < 6;) {
        o += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'[Math.floor(Math.random() * 61)];
    }
    return o;
};

ohauth.authHeader = function(obj) {
    return Object.keys(obj).sort().map(function(key) {
        return encodeURIComponent(key) + '="' + encodeURIComponent(obj[key]) + '"';
    }).join(', ');
};

ohauth.timestamp = function() { return ~~((+new Date()) / 1000); };

ohauth.percentEncode = function(s) {
    return encodeURIComponent(s)
        .replace(/\!/g, '%21').replace(/\'/g, '%27')
        .replace(/\*/g, '%2A').replace(/\(/g, '%28').replace(/\)/g, '%29');
};

ohauth.baseString = function(method, url, params) {
    if (params.oauth_signature) delete params.oauth_signature;
    return [
        method,
        ohauth.percentEncode(url),
        ohauth.percentEncode(ohauth.qsString(params))].join('&');
};

ohauth.signature = function(oauth_secret, token_secret, baseString) {
    return sha1.b64_hmac(
        ohauth.percentEncode(oauth_secret) + '&' +
        ohauth.percentEncode(token_secret),
        baseString);
};

/**
 * Takes an options object for configuration (consumer_key,
 * consumer_secret, version, signature_method, token, token_secret)
 * and returns a function that generates the Authorization header
 * for given data.
 *
 * The returned function takes these parameters:
 * - method: GET/POST/...
 * - uri: full URI with protocol, port, path and query string
 * - extra_params: any extra parameters (that are passed in the POST data),
 *   can be an object or a from-urlencoded string.
 *
 * Returned function returns full OAuth header with "OAuth" string in it.
 */

ohauth.headerGenerator = function(options) {
    options = options || {};
    var consumer_key = options.consumer_key || '',
        consumer_secret = options.consumer_secret || '',
        signature_method = options.signature_method || 'HMAC-SHA1',
        version = options.version || '1.0',
        token = options.token || '',
        token_secret = options.token_secret || '';

    return function(method, uri, extra_params) {
        method = method.toUpperCase();
        if (typeof extra_params === 'string' && extra_params.length > 0) {
            extra_params = ohauth.stringQs(extra_params);
        }

        var uri_parts = uri.split('?', 2),
        base_uri = uri_parts[0];

        var query_params = uri_parts.length === 2 ?
            ohauth.stringQs(uri_parts[1]) : {};

        var oauth_params = {
            oauth_consumer_key: consumer_key,
            oauth_signature_method: signature_method,
            oauth_version: version,
            oauth_timestamp: ohauth.timestamp(),
            oauth_nonce: ohauth.nonce()
        };

        if (token) oauth_params.oauth_token = token;

        var all_params = xtend({}, oauth_params, query_params, extra_params),
            base_str = ohauth.baseString(method, base_uri, all_params);

        oauth_params.oauth_signature = ohauth.signature(consumer_secret, token_secret, base_str);

        return 'OAuth ' + ohauth.authHeader(oauth_params);
    };
};

module.exports = ohauth;

},{"jshashes":"node_modules/jshashes/hashes.js","xtend":"node_modules/xtend/immutable.js"}],"node_modules/resolve-url/resolve-url.js":[function(require,module,exports) {
var define;
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],"node_modules/store/src/util.js":[function(require,module,exports) {
var global = arguments[3];
var assign = make_assign()
var create = make_create()
var trim = make_trim()
var Global = (typeof window !== 'undefined' ? window : global)

module.exports = {
	assign: assign,
	create: create,
	trim: trim,
	bind: bind,
	slice: slice,
	each: each,
	map: map,
	pluck: pluck,
	isList: isList,
	isFunction: isFunction,
	isObject: isObject,
	Global: Global
}

function make_assign() {
	if (Object.assign) {
		return Object.assign
	} else {
		return function shimAssign(obj, props1, props2, etc) {
			for (var i = 1; i < arguments.length; i++) {
				each(Object(arguments[i]), function(val, key) {
					obj[key] = val
				})
			}			
			return obj
		}
	}
}

function make_create() {
	if (Object.create) {
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice(arguments, 1)
			return assign.apply(this, [Object.create(obj)].concat(assignArgsList))
		}
	} else {
		function F() {} // eslint-disable-line no-inner-declarations
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice(arguments, 1)
			F.prototype = obj
			return assign.apply(this, [new F()].concat(assignArgsList))
		}
	}
}

function make_trim() {
	if (String.prototype.trim) {
		return function trim(str) {
			return String.prototype.trim.call(str)
		}
	} else {
		return function trim(str) {
			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
		}
	}
}

function bind(obj, fn) {
	return function() {
		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
	}
}

function slice(arr, index) {
	return Array.prototype.slice.call(arr, index || 0)
}

function each(obj, fn) {
	pluck(obj, function(val, key) {
		fn(val, key)
		return false
	})
}

function map(obj, fn) {
	var res = (isList(obj) ? [] : {})
	pluck(obj, function(v, k) {
		res[k] = fn(v, k)
		return false
	})
	return res
}

function pluck(obj, fn) {
	if (isList(obj)) {
		for (var i=0; i<obj.length; i++) {
			if (fn(obj[i], i)) {
				return obj[i]
			}
		}
	} else {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (fn(obj[key], key)) {
					return obj[key]
				}
			}
		}
	}
}

function isList(val) {
	return (val != null && typeof val != 'function' && typeof val.length == 'number')
}

function isFunction(val) {
	return val && {}.toString.call(val) === '[object Function]'
}

function isObject(val) {
	return val && {}.toString.call(val) === '[object Object]'
}

},{}],"node_modules/store/src/store-engine.js":[function(require,module,exports) {
var util = require('./util')
var slice = util.slice
var pluck = util.pluck
var each = util.each
var bind = util.bind
var create = util.create
var isList = util.isList
var isFunction = util.isFunction
var isObject = util.isObject

module.exports = {
	createStore: createStore
}

var storeAPI = {
	version: '2.0.12',
	enabled: false,
	
	// get returns the value of the given key. If that value
	// is undefined, it returns optionalDefaultValue instead.
	get: function(key, optionalDefaultValue) {
		var data = this.storage.read(this._namespacePrefix + key)
		return this._deserialize(data, optionalDefaultValue)
	},

	// set will store the given value at key and returns value.
	// Calling set with value === undefined is equivalent to calling remove.
	set: function(key, value) {
		if (value === undefined) {
			return this.remove(key)
		}
		this.storage.write(this._namespacePrefix + key, this._serialize(value))
		return value
	},

	// remove deletes the key and value stored at the given key.
	remove: function(key) {
		this.storage.remove(this._namespacePrefix + key)
	},

	// each will call the given callback once for each key-value pair
	// in this store.
	each: function(callback) {
		var self = this
		this.storage.each(function(val, namespacedKey) {
			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''))
		})
	},

	// clearAll will remove all the stored key-value pairs in this store.
	clearAll: function() {
		this.storage.clearAll()
	},

	// additional functionality that can't live in plugins
	// ---------------------------------------------------

	// hasNamespace returns true if this store instance has the given namespace.
	hasNamespace: function(namespace) {
		return (this._namespacePrefix == '__storejs_'+namespace+'_')
	},

	// createStore creates a store.js instance with the first
	// functioning storage in the list of storage candidates,
	// and applies the the given mixins to the instance.
	createStore: function() {
		return createStore.apply(this, arguments)
	},
	
	addPlugin: function(plugin) {
		this._addPlugin(plugin)
	},
	
	namespace: function(namespace) {
		return createStore(this.storage, this.plugins, namespace)
	}
}

function _warn() {
	var _console = (typeof console == 'undefined' ? null : console)
	if (!_console) { return }
	var fn = (_console.warn ? _console.warn : _console.log)
	fn.apply(_console, arguments)
}

function createStore(storages, plugins, namespace) {
	if (!namespace) {
		namespace = ''
	}
	if (storages && !isList(storages)) {
		storages = [storages]
	}
	if (plugins && !isList(plugins)) {
		plugins = [plugins]
	}

	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '')
	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null)
	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/ // alpha-numeric + underscore and dash
	if (!legalNamespaces.test(namespace)) {
		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
	}
	
	var _privateStoreProps = {
		_namespacePrefix: namespacePrefix,
		_namespaceRegexp: namespaceRegexp,

		_testStorage: function(storage) {
			try {
				var testStr = '__storejs__test__'
				storage.write(testStr, testStr)
				var ok = (storage.read(testStr) === testStr)
				storage.remove(testStr)
				return ok
			} catch(e) {
				return false
			}
		},

		_assignPluginFnProp: function(pluginFnProp, propName) {
			var oldFn = this[propName]
			this[propName] = function pluginFn() {
				var args = slice(arguments, 0)
				var self = this

				// super_fn calls the old function which was overwritten by
				// this mixin.
				function super_fn() {
					if (!oldFn) { return }
					each(arguments, function(arg, i) {
						args[i] = arg
					})
					return oldFn.apply(self, args)
				}

				// Give mixing function access to super_fn by prefixing all mixin function
				// arguments with super_fn.
				var newFnArgs = [super_fn].concat(args)

				return pluginFnProp.apply(self, newFnArgs)
			}
		},

		_serialize: function(obj) {
			return JSON.stringify(obj)
		},

		_deserialize: function(strVal, defaultVal) {
			if (!strVal) { return defaultVal }
			// It is possible that a raw string value has been previously stored
			// in a storage without using store.js, meaning it will be a raw
			// string value instead of a JSON serialized string. By defaulting
			// to the raw string value in case of a JSON parse error, we allow
			// for past stored values to be forwards-compatible with store.js
			var val = ''
			try { val = JSON.parse(strVal) }
			catch(e) { val = strVal }

			return (val !== undefined ? val : defaultVal)
		},
		
		_addStorage: function(storage) {
			if (this.enabled) { return }
			if (this._testStorage(storage)) {
				this.storage = storage
				this.enabled = true
			}
		},

		_addPlugin: function(plugin) {
			var self = this

			// If the plugin is an array, then add all plugins in the array.
			// This allows for a plugin to depend on other plugins.
			if (isList(plugin)) {
				each(plugin, function(plugin) {
					self._addPlugin(plugin)
				})
				return
			}

			// Keep track of all plugins we've seen so far, so that we
			// don't add any of them twice.
			var seenPlugin = pluck(this.plugins, function(seenPlugin) {
				return (plugin === seenPlugin)
			})
			if (seenPlugin) {
				return
			}
			this.plugins.push(plugin)

			// Check that the plugin is properly formed
			if (!isFunction(plugin)) {
				throw new Error('Plugins must be function values that return objects')
			}

			var pluginProperties = plugin.call(this)
			if (!isObject(pluginProperties)) {
				throw new Error('Plugins must return an object of function properties')
			}

			// Add the plugin function properties to this store instance.
			each(pluginProperties, function(pluginFnProp, propName) {
				if (!isFunction(pluginFnProp)) {
					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
				}
				self._assignPluginFnProp(pluginFnProp, propName)
			})
		},
		
		// Put deprecated properties in the private API, so as to not expose it to accidential
		// discovery through inspection of the store object.
		
		// Deprecated: addStorage
		addStorage: function(storage) {
			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])')
			this._addStorage(storage)
		}
	}

	var store = create(_privateStoreProps, storeAPI, {
		plugins: []
	})
	store.raw = {}
	each(store, function(prop, propName) {
		if (isFunction(prop)) {
			store.raw[propName] = bind(store, prop)			
		}
	})
	each(storages, function(storage) {
		store._addStorage(storage)
	})
	each(plugins, function(plugin) {
		store._addPlugin(plugin)
	})
	return store
}

},{"./util":"node_modules/store/src/util.js"}],"node_modules/store/storages/localStorage.js":[function(require,module,exports) {
var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'localStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

function localStorage() {
	return Global.localStorage
}

function read(key) {
	return localStorage().getItem(key)
}

function write(key, data) {
	return localStorage().setItem(key, data)
}

function each(fn) {
	for (var i = localStorage().length - 1; i >= 0; i--) {
		var key = localStorage().key(i)
		fn(read(key), key)
	}
}

function remove(key) {
	return localStorage().removeItem(key)
}

function clearAll() {
	return localStorage().clear()
}

},{"../src/util":"node_modules/store/src/util.js"}],"node_modules/store/storages/oldFF-globalStorage.js":[function(require,module,exports) {
// oldFF-globalStorage provides storage for Firefox
// versions 6 and 7, where no localStorage, etc
// is available.

var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'oldFF-globalStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var globalStorage = Global.globalStorage

function read(key) {
	return globalStorage[key]
}

function write(key, data) {
	globalStorage[key] = data
}

function each(fn) {
	for (var i = globalStorage.length - 1; i >= 0; i--) {
		var key = globalStorage.key(i)
		fn(globalStorage[key], key)
	}
}

function remove(key) {
	return globalStorage.removeItem(key)
}

function clearAll() {
	each(function(key, _) {
		delete globalStorage[key]
	})
}

},{"../src/util":"node_modules/store/src/util.js"}],"node_modules/store/storages/oldIE-userDataStorage.js":[function(require,module,exports) {
// oldIE-userDataStorage provides storage for Internet Explorer
// versions 6 and 7, where no localStorage, sessionStorage, etc
// is available.

var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'oldIE-userDataStorage',
	write: write,
	read: read,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var storageName = 'storejs'
var doc = Global.document
var _withStorageEl = _makeIEStorageElFunction()
var disable = (Global.navigator ? Global.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./) // MSIE 9.x, MSIE 10.x

function write(unfixedKey, data) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey)
	_withStorageEl(function(storageEl) {
		storageEl.setAttribute(fixedKey, data)
		storageEl.save(storageName)
	})
}

function read(unfixedKey) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey)
	var res = null
	_withStorageEl(function(storageEl) {
		res = storageEl.getAttribute(fixedKey)
	})
	return res
}

function each(callback) {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes
		for (var i=attributes.length-1; i>=0; i--) {
			var attr = attributes[i]
			callback(storageEl.getAttribute(attr.name), attr.name)
		}
	})
}

function remove(unfixedKey) {
	var fixedKey = fixKey(unfixedKey)
	_withStorageEl(function(storageEl) {
		storageEl.removeAttribute(fixedKey)
		storageEl.save(storageName)
	})
}

function clearAll() {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes
		storageEl.load(storageName)
		for (var i=attributes.length-1; i>=0; i--) {
			storageEl.removeAttribute(attributes[i].name)
		}
		storageEl.save(storageName)
	})
}

// Helpers
//////////

// In IE7, keys cannot start with a digit or contain certain chars.
// See https://github.com/marcuswestin/store.js/issues/40
// See https://github.com/marcuswestin/store.js/issues/83
var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
function fixKey(key) {
	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
}

function _makeIEStorageElFunction() {
	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
		return null
	}
	var scriptTag = 'script',
		storageOwner,
		storageContainer,
		storageEl

	// Since #userData storage applies only to specific paths, we need to
	// somehow link our data to a specific path.  We choose /favicon.ico
	// as a pretty safe option, since all browsers already make a request to
	// this URL anyway and being a 404 will not hurt us here.  We wrap an
	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	// since the iframe access rules appear to allow direct access and
	// manipulation of the document element, even for a 404 page.  This
	// document can be used instead of the current document (which would
	// have been limited to the current path) to perform #userData storage.
	try {
		/* global ActiveXObject */
		storageContainer = new ActiveXObject('htmlfile')
		storageContainer.open()
		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
		storageContainer.close()
		storageOwner = storageContainer.w.frames[0].document
		storageEl = storageOwner.createElement('div')
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storageEl = doc.createElement('div')
		storageOwner = doc.body
	}

	return function(storeFunction) {
		var args = [].slice.call(arguments, 0)
		args.unshift(storageEl)
		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
		storageOwner.appendChild(storageEl)
		storageEl.addBehavior('#default#userData')
		storageEl.load(storageName)
		storeFunction.apply(this, args)
		storageOwner.removeChild(storageEl)
		return
	}
}

},{"../src/util":"node_modules/store/src/util.js"}],"node_modules/store/storages/cookieStorage.js":[function(require,module,exports) {
// cookieStorage is useful Safari private browser mode, where localStorage
// doesn't work but cookies do. This implementation is adopted from
// https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage

var util = require('../src/util')
var Global = util.Global
var trim = util.trim

module.exports = {
	name: 'cookieStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var doc = Global.document

function read(key) {
	if (!key || !_has(key)) { return null }
	var regexpStr = "(?:^|.*;\\s*)" +
		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"
	return unescape(doc.cookie.replace(new RegExp(regexpStr), "$1"))
}

function each(callback) {
	var cookies = doc.cookie.split(/; ?/g)
	for (var i = cookies.length - 1; i >= 0; i--) {
		if (!trim(cookies[i])) {
			continue
		}
		var kvp = cookies[i].split('=')
		var key = unescape(kvp[0])
		var val = unescape(kvp[1])
		callback(val, key)
	}
}

function write(key, data) {
	if(!key) { return }
	doc.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/"
}

function remove(key) {
	if (!key || !_has(key)) {
		return
	}
	doc.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
}

function clearAll() {
	each(function(_, key) {
		remove(key)
	})
}

function _has(key) {
	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc.cookie)
}

},{"../src/util":"node_modules/store/src/util.js"}],"node_modules/store/storages/sessionStorage.js":[function(require,module,exports) {
var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'sessionStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll
}

function sessionStorage() {
	return Global.sessionStorage
}

function read(key) {
	return sessionStorage().getItem(key)
}

function write(key, data) {
	return sessionStorage().setItem(key, data)
}

function each(fn) {
	for (var i = sessionStorage().length - 1; i >= 0; i--) {
		var key = sessionStorage().key(i)
		fn(read(key), key)
	}
}

function remove(key) {
	return sessionStorage().removeItem(key)
}

function clearAll() {
	return sessionStorage().clear()
}

},{"../src/util":"node_modules/store/src/util.js"}],"node_modules/store/storages/memoryStorage.js":[function(require,module,exports) {
// memoryStorage is a useful last fallback to ensure that the store
// is functions (meaning store.get(), store.set(), etc will all function).
// However, stored values will not persist when the browser navigates to
// a new page or reloads the current page.

module.exports = {
	name: 'memoryStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var memoryStorage = {}

function read(key) {
	return memoryStorage[key]
}

function write(key, data) {
	memoryStorage[key] = data
}

function each(callback) {
	for (var key in memoryStorage) {
		if (memoryStorage.hasOwnProperty(key)) {
			callback(memoryStorage[key], key)
		}
	}
}

function remove(key) {
	delete memoryStorage[key]
}

function clearAll(key) {
	memoryStorage = {}
}

},{}],"node_modules/store/storages/all.js":[function(require,module,exports) {
module.exports = [
	// Listed in order of usage preference
	require('./localStorage'),
	require('./oldFF-globalStorage'),
	require('./oldIE-userDataStorage'),
	require('./cookieStorage'),
	require('./sessionStorage'),
	require('./memoryStorage')
]

},{"./localStorage":"node_modules/store/storages/localStorage.js","./oldFF-globalStorage":"node_modules/store/storages/oldFF-globalStorage.js","./oldIE-userDataStorage":"node_modules/store/storages/oldIE-userDataStorage.js","./cookieStorage":"node_modules/store/storages/cookieStorage.js","./sessionStorage":"node_modules/store/storages/sessionStorage.js","./memoryStorage":"node_modules/store/storages/memoryStorage.js"}],"node_modules/store/plugins/lib/json2.js":[function(require,module,exports) {
/* eslint-disable */

//  json2.js
//  2016-10-28
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());
},{}],"node_modules/store/plugins/json2.js":[function(require,module,exports) {
module.exports = json2Plugin

function json2Plugin() {
	require('./lib/json2')
	return {}
}

},{"./lib/json2":"node_modules/store/plugins/lib/json2.js"}],"node_modules/store/dist/store.legacy.js":[function(require,module,exports) {
var engine = require('../src/store-engine')

var storages = require('../storages/all')
var plugins = [require('../plugins/json2')]

module.exports = engine.createStore(storages, plugins)

},{"../src/store-engine":"node_modules/store/src/store-engine.js","../storages/all":"node_modules/store/storages/all.js","../plugins/json2":"node_modules/store/plugins/json2.js"}],"node_modules/osm-auth/index.js":[function(require,module,exports) {
'use strict';

var ohauth = require('ohauth');
var resolveUrl = require('resolve-url');
var store = require('store');
var xtend = require('xtend');


// # osm-auth
//
// This code is only compatible with IE10+ because the [XDomainRequest](http://bit.ly/LfO7xo)
// object, IE<10's idea of [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing),
// does not support custom headers, which this uses everywhere.
module.exports = function(o) {

    var oauth = {};

    // authenticated users will also have a request token secret, but it's
    // not used in transactions with the server
    oauth.authenticated = function() {
        return !!(token('oauth_token') && token('oauth_token_secret'));
    };

    oauth.logout = function() {
        token('oauth_token', '');
        token('oauth_token_secret', '');
        token('oauth_request_token_secret', '');
        return oauth;
    };

    // TODO: detect lack of click event
    oauth.authenticate = function(callback) {
        if (oauth.authenticated()) return callback();

        oauth.logout();

        // ## Getting a request token
        var params = timenonce(getAuth(o)),
            url = o.url + '/oauth/request_token';

        params.oauth_signature = ohauth.signature(
            o.oauth_secret, '',
            ohauth.baseString('POST', url, params));

        if (!o.singlepage) {
            // Create a 600x550 popup window in the center of the screen
            var w = 600, h = 550,
                settings = [
                    ['width', w], ['height', h],
                    ['left', screen.width / 2 - w / 2],
                    ['top', screen.height / 2 - h / 2]].map(function(x) {
                        return x.join('=');
                    }).join(','),
                popup = window.open('about:blank', 'oauth_window', settings);
        }

        // Request a request token. When this is complete, the popup
        // window is redirected to OSM's authorization page.
        ohauth.xhr('POST', url, params, null, {}, reqTokenDone);
        o.loading();

        function reqTokenDone(err, xhr) {
            o.done();
            if (err) return callback(err);
            var resp = ohauth.stringQs(xhr.response);
            token('oauth_request_token_secret', resp.oauth_token_secret);
            var authorize_url = o.url + '/oauth/authorize?' + ohauth.qsString({
                oauth_token: resp.oauth_token,
                oauth_callback: resolveUrl(o.landing)
            });

            if (o.singlepage) {
                location.href = authorize_url;
            } else {
                popup.location = authorize_url;
            }
        }

        // Called by a function in a landing page, in the popup window. The
        // window closes itself.
        window.authComplete = function(token) {
            var oauth_token = ohauth.stringQs(token.split('?')[1]);
            get_access_token(oauth_token.oauth_token);
            delete window.authComplete;
        };

        // ## Getting an request token
        //
        // At this point we have an `oauth_token`, brought in from a function
        // call on a landing page popup.
        function get_access_token(oauth_token) {
            var url = o.url + '/oauth/access_token',
                params = timenonce(getAuth(o)),
                request_token_secret = token('oauth_request_token_secret');
            params.oauth_token = oauth_token;
            params.oauth_signature = ohauth.signature(
                o.oauth_secret,
                request_token_secret,
                ohauth.baseString('POST', url, params));

            // ## Getting an access token
            //
            // The final token required for authentication. At this point
            // we have a `request token secret`
            ohauth.xhr('POST', url, params, null, {}, accessTokenDone);
            o.loading();
        }

        function accessTokenDone(err, xhr) {
            o.done();
            if (err) return callback(err);
            var access_token = ohauth.stringQs(xhr.response);
            token('oauth_token', access_token.oauth_token);
            token('oauth_token_secret', access_token.oauth_token_secret);
            callback(null, oauth);
        }
    };

    oauth.bootstrapToken = function(oauth_token, callback) {
        // ## Getting an request token
        // At this point we have an `oauth_token`, brought in from a function
        // call on a landing page popup.
        function get_access_token(oauth_token) {
            var url = o.url + '/oauth/access_token',
                params = timenonce(getAuth(o)),
                request_token_secret = token('oauth_request_token_secret');
            params.oauth_token = oauth_token;
            params.oauth_signature = ohauth.signature(
                o.oauth_secret,
                request_token_secret,
                ohauth.baseString('POST', url, params));

            // ## Getting an access token
            // The final token required for authentication. At this point
            // we have a `request token secret`
            ohauth.xhr('POST', url, params, null, {}, accessTokenDone);
            o.loading();
        }

        function accessTokenDone(err, xhr) {
            o.done();
            if (err) return callback(err);
            var access_token = ohauth.stringQs(xhr.response);
            token('oauth_token', access_token.oauth_token);
            token('oauth_token_secret', access_token.oauth_token_secret);
            callback(null, oauth);
        }

        get_access_token(oauth_token);
    };

    // # xhr
    //
    // A single XMLHttpRequest wrapper that does authenticated calls if the
    // user has logged in.
    oauth.xhr = function(options, callback) {
        if (!oauth.authenticated()) {
            if (o.auto) {
                return oauth.authenticate(run);
            } else {
                callback('not authenticated', null);
                return;
            }
        } else {
            return run();
        }

        function run() {
            var params = timenonce(getAuth(o)),
                oauth_token_secret = token('oauth_token_secret'),
                url = (options.prefix !== false) ? o.url + options.path : options.path,
                url_parts = url.replace(/#.*$/, '').split('?', 2),
                base_url = url_parts[0],
                query = (url_parts.length === 2) ? url_parts[1] : '';

            // https://tools.ietf.org/html/rfc5849#section-3.4.1.3.1
            if ((!options.options || !options.options.header ||
                options.options.header['Content-Type'] === 'application/x-www-form-urlencoded') &&
                options.content) {
                params = xtend(params, ohauth.stringQs(options.content));
            }

            params.oauth_token = token('oauth_token');
            params.oauth_signature = ohauth.signature(
                o.oauth_secret,
                oauth_token_secret,
                ohauth.baseString(options.method, base_url, xtend(params, ohauth.stringQs(query)))
            );

            return ohauth.xhr(options.method, url, params, options.content, options.options, done);
        }

        function done(err, xhr) {
            if (err) return callback(err);
            else if (xhr.responseXML) return callback(err, xhr.responseXML);
            else return callback(err, xhr.response);
        }
    };

    // pre-authorize this object, if we can just get a token and token_secret
    // from the start
    oauth.preauth = function(c) {
        if (!c) return;
        if (c.oauth_token) token('oauth_token', c.oauth_token);
        if (c.oauth_token_secret) token('oauth_token_secret', c.oauth_token_secret);
        return oauth;
    };

    oauth.options = function(_) {
        if (!arguments.length) return o;

        o = _;
        o.url = o.url || 'https://www.openstreetmap.org';
        o.landing = o.landing || 'land.html';
        o.singlepage = o.singlepage || false;

        // Optional loading and loading-done functions for nice UI feedback.
        // by default, no-ops
        o.loading = o.loading || function() {};
        o.done = o.done || function() {};

        return oauth.preauth(o);
    };

    // 'stamp' an authentication object from `getAuth()`
    // with a [nonce](http://en.wikipedia.org/wiki/Cryptographic_nonce)
    // and timestamp
    function timenonce(o) {
        o.oauth_timestamp = ohauth.timestamp();
        o.oauth_nonce = ohauth.nonce();
        return o;
    }

    // get/set tokens. These are prefixed with the base URL so that `osm-auth`
    // can be used with multiple APIs and the keys in `localStorage`
    // will not clash
    var token;

    if (store.enabled) {
        token = function (x, y) {
            if (arguments.length === 1) return store.get(o.url + x);
            else if (arguments.length === 2) return store.set(o.url + x, y);
        };
    } else {
        var storage = {};
        token = function (x, y) {
            if (arguments.length === 1) return storage[o.url + x];
            else if (arguments.length === 2) return storage[o.url + x] = y;
        };
    }

    // Get an authentication object. If you just add and remove properties
    // from a single object, you'll need to use `delete` to make sure that
    // it doesn't contain undesired properties for authentication
    function getAuth(o) {
        return {
            oauth_consumer_key: o.oauth_consumer_key,
            oauth_signature_method: 'HMAC-SHA1'
        };
    }

    // potentially pre-authorize
    oauth.options(o);

    return oauth;
};

},{"ohauth":"node_modules/ohauth/index.js","resolve-url":"node_modules/resolve-url/resolve-url.js","store":"node_modules/store/dist/store.legacy.js","xtend":"node_modules/xtend/immutable.js"}],"Logic/Osm/OsmPreferences.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsmPreferences = void 0;

var UIEventSource_1 = require("../UIEventSource");

var Utils_1 = require("../../Utils");

var OsmPreferences =
/** @class */
function () {
  function OsmPreferences(auth, osmConnection) {
    this.preferences = new UIEventSource_1.UIEventSource({});
    this.preferenceSources = {};
    this.longPreferences = {};
    this.auth = auth;
    this.userDetails = osmConnection.userDetails;
    var self = this;
    osmConnection.OnLoggedIn(function () {
      return self.UpdatePreferences();
    });
  }
  /**
   * OSM preferences can be at most 255 chars
   * @param key
   * @param prefix
   * @constructor
   */


  OsmPreferences.prototype.GetLongPreference = function (key, prefix) {
    if (prefix === void 0) {
      prefix = "mapcomplete-";
    }

    if (this.longPreferences[prefix + key] !== undefined) {
      return this.longPreferences[prefix + key];
    }

    var source = new UIEventSource_1.UIEventSource(undefined);
    this.longPreferences[prefix + key] = source;
    var allStartWith = prefix + key + "-combined"; // Gives the number of combined preferences

    var length = this.GetPreference(allStartWith + "-length", "");
    var self = this;
    source.addCallback(function (str) {
      if (str === undefined || str === "") {
        return;
      }

      var i = 0;

      while (str !== "") {
        if (str === undefined || str === "undefined") {
          throw "Long pref became undefined?";
        }

        if (i > 100) {
          throw "This long preference is getting very long... ";
        }

        self.GetPreference(allStartWith + "-" + i, "").setData(str.substr(0, 255));
        str = str.substr(255);
        i++;
      }

      length.setData("" + i); // We use I, the number of preference fields used
    });

    function updateData(l) {
      if (l === undefined) {
        source.setData(undefined);
        return;
      }

      var prefsCount = Number(l);

      if (prefsCount > 100) {
        throw "Length to long";
      }

      var str = "";

      for (var i = 0; i < prefsCount; i++) {
        str += self.GetPreference(allStartWith + "-" + i, "").data;
      }

      source.setData(str);
      console.log("Long preference", key, "has", str.length, "chars");
    }

    length.addCallback(function (l) {
      updateData(Number(l));
    });
    updateData(Number(length.data));
    return source;
  };

  OsmPreferences.prototype.GetPreference = function (key, prefix) {
    var _this = this;

    if (prefix === void 0) {
      prefix = "mapcomplete-";
    }

    key = prefix + key;

    if (key.length >= 255) {
      throw "Preferences: key length to big";
    }

    if (this.preferenceSources[key] !== undefined) {
      return this.preferenceSources[key];
    }

    if (this.userDetails.data.loggedIn && this.preferences.data[key] === undefined) {
      this.UpdatePreferences();
    }

    var pref = new UIEventSource_1.UIEventSource(this.preferences.data[key]);
    pref.addCallback(function (v) {
      _this.SetPreference(key, v);
    });
    this.preferences.addCallback(function (prefs) {
      if (prefs[key] !== undefined) {
        pref.setData(prefs[key]);
      }
    });
    this.preferenceSources[key] = pref;
    return pref;
  };

  OsmPreferences.prototype.UpdatePreferences = function () {
    var self = this;
    this.auth.xhr({
      method: 'GET',
      path: '/api/0.6/user/preferences'
    }, function (error, value) {
      if (error) {
        console.log("Could not load preferences", error);
        return;
      }

      var prefs = value.getElementsByTagName("preference");

      for (var i = 0; i < prefs.length; i++) {
        var pref = prefs[i];
        var k = pref.getAttribute("k");
        var v = pref.getAttribute("v");
        self.preferences.data[k] = v;
      }

      self.preferences.ping();
    });
  };

  OsmPreferences.prototype.SetPreference = function (k, v) {
    if (!this.userDetails.data.loggedIn) {
      console.log("Not saving preference " + k + ": user not logged in");
      return;
    }

    if (this.preferences.data[k] === v) {
      return;
    }

    console.log("Updating preference", k, " to ", Utils_1.Utils.EllipsesAfter(v, 15));

    if (v === undefined || v === "") {
      this.auth.xhr({
        method: 'DELETE',
        path: '/api/0.6/user/preferences/' + k,
        options: {
          header: {
            'Content-Type': 'text/plain'
          }
        }
      }, function (error) {
        if (error) {
          console.log("Could not remove preference", error);
          return;
        }

        console.log("Preference ", k, "removed!");
      });
      return;
    }

    this.auth.xhr({
      method: 'PUT',
      path: '/api/0.6/user/preferences/' + k,
      options: {
        header: {
          'Content-Type': 'text/plain'
        }
      },
      content: v
    }, function (error) {
      if (error) {
        console.log("Could not set preference \"" + k + "\"'", error);
        return;
      }

      console.log("Preference " + k + " written!");
    });
  };

  return OsmPreferences;
}();

exports.OsmPreferences = OsmPreferences;
},{"../UIEventSource":"Logic/UIEventSource.ts","../../Utils":"Utils.ts"}],"Logic/Osm/ChangesetHandler.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChangesetHandler = void 0;

var State_1 = require("../../State");

var Locale_1 = __importDefault(require("../../UI/i18n/Locale"));

var ChangesetHandler =
/** @class */
function () {
  function ChangesetHandler(layoutName, dryRun, osmConnection, auth) {
    this._dryRun = dryRun;
    this.userDetails = osmConnection.userDetails;
    this.auth = auth;
    this.currentChangeset = osmConnection.GetPreference("current-open-changeset-" + layoutName);

    if (dryRun) {
      console.log("DRYRUN ENABLED");
    }
  }

  ChangesetHandler.prototype.UploadChangeset = function (layout, allElements, generateChangeXML, continuation) {
    var _this = this;

    if (this.userDetails.data.csCount == 0) {
      // The user became a contributor!
      this.userDetails.data.csCount = 1;
      this.userDetails.ping();
    }

    if (this._dryRun) {
      var changesetXML = generateChangeXML("123456");
      console.log(changesetXML);
      continuation();
      return;
    }

    var self = this;

    if (this.currentChangeset.data === undefined || this.currentChangeset.data === "") {
      // We have to open a new changeset
      this.OpenChangeset(layout, function (csId) {
        _this.currentChangeset.setData(csId);

        var changeset = generateChangeXML(csId);
        console.log(changeset);
        self.AddChange(csId, changeset, allElements, function () {}, function (e) {
          console.error("UPLOADING FAILED!", e);
        });
      });
    } else {
      // There still exists an open changeset (or at least we hope so)
      var csId = this.currentChangeset.data;
      self.AddChange(csId, generateChangeXML(csId), allElements, function () {}, function (e) {
        console.warn("Could not upload, changeset is probably closed: ", e); // Mark the CS as closed...

        _this.currentChangeset.setData(""); // ... and try again. As the cs is closed, no recursive loop can exist  


        self.UploadChangeset(layout, allElements, generateChangeXML, continuation);
      });
    }
  };

  ChangesetHandler.prototype.OpenChangeset = function (layout, continuation) {
    var commentExtra = layout.changesetMessage !== undefined ? " - " + layout.changesetMessage : "";
    var surveySource = "";

    if (State_1.State.state.currentGPSLocation.data !== undefined) {
      surveySource = '<tag k="source" v="survey"/>';
    }

    this.auth.xhr({
      method: 'PUT',
      path: '/api/0.6/changeset/create',
      options: {
        header: {
          'Content-Type': 'text/xml'
        }
      },
      content: ["<osm><changeset>", "<tag k=\"created_by\" v=\"MapComplete " + State_1.State.vNumber + "\" />", "<tag k=\"comment\" v=\"Adding data with #MapComplete for theme #" + layout.id + commentExtra + "\"/>", "<tag k=\"theme\" v=\"" + layout.id + "\"/>", "<tag k=\"language\" v=\"" + Locale_1.default.language.data + "\"/>", surveySource, layout.maintainer !== undefined ? "<tag k=\"theme-creator\" v=\"" + layout.maintainer + "\"/>" : "", "</changeset></osm>"].join("")
    }, function (err, response) {
      if (response === undefined) {
        console.log("err", err);
        alert("Could not upload change (opening failed). Please file a bug report");
        return;
      } else {
        continuation(response);
      }
    });
  };

  ChangesetHandler.prototype.AddChange = function (changesetId, changesetXML, allElements, continuation, onFail) {
    if (onFail === void 0) {
      onFail = undefined;
    }

    this.auth.xhr({
      method: 'POST',
      options: {
        header: {
          'Content-Type': 'text/xml'
        }
      },
      path: '/api/0.6/changeset/' + changesetId + '/upload',
      content: changesetXML
    }, function (err, response) {
      if (response == null) {
        console.log("err", err);

        if (onFail) {
          onFail(changesetId);
        }

        return;
      }

      var mapping = ChangesetHandler.parseUploadChangesetResponse(response, allElements);
      console.log("Uploaded changeset ", changesetId);
      continuation(changesetId, mapping);
    });
  };

  ChangesetHandler.prototype.CloseChangeset = function (changesetId, continuation) {
    if (changesetId === void 0) {
      changesetId = undefined;
    }

    if (continuation === void 0) {
      continuation = function continuation() {};
    }

    if (changesetId === undefined) {
      changesetId = this.currentChangeset.data;
    }

    if (changesetId === undefined) {
      return;
    }

    console.log("closing changeset", changesetId);
    this.currentChangeset.setData("");
    this.auth.xhr({
      method: 'PUT',
      path: '/api/0.6/changeset/' + changesetId + '/close'
    }, function (err, response) {
      if (response == null) {
        console.log("err", err);
      }

      console.log("Closed changeset ", changesetId);

      if (continuation !== undefined) {
        continuation();
      }
    });
  };

  ChangesetHandler.parseUploadChangesetResponse = function (response, allElements) {
    var nodes = response.getElementsByTagName("node"); // @ts-ignore

    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
      var node = nodes_1[_i];
      var oldId = parseInt(node.attributes.old_id.value);
      var newId = parseInt(node.attributes.new_id.value);

      if (oldId !== undefined && newId !== undefined && !isNaN(oldId) && !isNaN(newId)) {
        if (oldId == newId) {
          continue;
        }

        console.log("Rewriting id: ", oldId, "-->", newId);
        var element = allElements.getElement("node/" + oldId);
        element.data.id = "node/" + newId;
        allElements.addElementById("node/" + newId, element);
        element.ping();
      }
    }
  };

  return ChangesetHandler;
}();

exports.ChangesetHandler = ChangesetHandler;
},{"../../State":"State.ts","../../UI/i18n/Locale":"UI/i18n/Locale.ts"}],"Logic/Osm/OsmConnection.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsmConnection = exports.UserDetails = void 0; // @ts-ignore

var osm_auth_1 = __importDefault(require("osm-auth"));

var UIEventSource_1 = require("../UIEventSource");

var OsmPreferences_1 = require("./OsmPreferences");

var ChangesetHandler_1 = require("./ChangesetHandler");

var UserDetails =
/** @class */
function () {
  function UserDetails() {
    this.loggedIn = false;
    this.name = "Not logged in";
    this.csCount = 0;
    this.unreadMessages = 0;
    this.totalMessages = 0;
  }

  return UserDetails;
}();

exports.UserDetails = UserDetails;

var OsmConnection =
/** @class */
function () {
  function OsmConnection(dryRun, oauth_token, // Used to keep multiple changesets open and to write to the correct changeset
  layoutName, singlePage) {
    if (singlePage === void 0) {
      singlePage = true;
    }

    this._onLoggedIn = [];
    var pwaStandAloneMode = false;

    try {
      if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
        pwaStandAloneMode = true;
      }
    } catch (e) {
      console.warn("Detecting standalone mode failed", e, ". Assuming in browser and not worrying furhter");
    }

    var iframeMode = window !== window.top;

    if (iframeMode || pwaStandAloneMode || !singlePage) {
      // In standalone mode, we DON'T use single page login, as 'redirecting' opens a new window anyway...
      // Same for an iframe...
      this.auth = new osm_auth_1.default({
        oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
        oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
        singlepage: false,
        auto: true
      });
    } else {
      this.auth = new osm_auth_1.default({
        oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
        oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
        singlepage: true,
        landing: window.location.href,
        auto: true
      });
    }

    this.userDetails = new UIEventSource_1.UIEventSource(new UserDetails());
    this.userDetails.data.dryRun = dryRun;
    this._dryRun = dryRun;
    this.preferencesHandler = new OsmPreferences_1.OsmPreferences(this.auth, this);
    this.changesetHandler = new ChangesetHandler_1.ChangesetHandler(layoutName, dryRun, this, this.auth);

    if (oauth_token.data !== undefined) {
      console.log(oauth_token.data);
      var self_1 = this;
      this.auth.bootstrapToken(oauth_token.data, function (x) {
        console.log("Called back: ", x);
        self_1.AttemptLogin();
      }, this.auth);
      oauth_token.setData(undefined);
    }

    if (this.auth.authenticated()) {
      this.AttemptLogin(); // Also updates the user badge
    } else {
      console.log("Not authenticated");
    }
  }

  OsmConnection.prototype.UploadChangeset = function (layout, allElements, generateChangeXML, continuation) {
    if (continuation === void 0) {
      continuation = function continuation() {};
    }

    this.changesetHandler.UploadChangeset(layout, allElements, generateChangeXML, continuation);
  };

  OsmConnection.prototype.GetPreference = function (key, prefix) {
    if (prefix === void 0) {
      prefix = "mapcomplete-";
    }

    return this.preferencesHandler.GetPreference(key, prefix);
  };

  OsmConnection.prototype.GetLongPreference = function (key, prefix) {
    if (prefix === void 0) {
      prefix = "mapcomplete-";
    }

    return this.preferencesHandler.GetLongPreference(key, prefix);
  };

  OsmConnection.prototype.OnLoggedIn = function (action) {
    this._onLoggedIn.push(action);
  };

  OsmConnection.prototype.LogOut = function () {
    this.auth.logout();
    this.userDetails.data.loggedIn = false;
    this.userDetails.data.csCount = 0;
    this.userDetails.data.name = "";
    this.userDetails.ping();
    console.log("Logged out");
  };

  OsmConnection.prototype.AttemptLogin = function () {
    var self = this;
    console.log("Trying to log in...");
    this.auth.xhr({
      method: 'GET',
      path: '/api/0.6/user/details'
    }, function (err, details) {
      var _a;

      if (err != null) {
        console.log(err);
        return;
      }

      if (details == null) {
        return;
      }

      self.CheckForMessagesContinuously(); // details is an XML DOM of user details

      var userInfo = details.getElementsByTagName("user")[0]; // let moreDetails = new DOMParser().parseFromString(userInfo.innerHTML, "text/xml");

      var data = self.userDetails.data;
      data.loggedIn = true;
      console.log("Login completed, userinfo is ", userInfo);
      data.name = userInfo.getAttribute('display_name');
      data.csCount = userInfo.getElementsByTagName("changesets")[0].getAttribute("count");
      data.img = undefined;
      var imgEl = userInfo.getElementsByTagName("img");

      if (imgEl !== undefined && imgEl[0] !== undefined) {
        data.img = imgEl[0].getAttribute("href");
      }

      data.img = (_a = data.img) !== null && _a !== void 0 ? _a : "./assets/osm-logo.svg";
      var homeEl = userInfo.getElementsByTagName("home");

      if (homeEl !== undefined && homeEl[0] !== undefined) {
        var lat = parseFloat(homeEl[0].getAttribute("lat"));
        var lon = parseFloat(homeEl[0].getAttribute("lon"));
        data.home = {
          lat: lat,
          lon: lon
        };
      }

      var messages = userInfo.getElementsByTagName("messages")[0].getElementsByTagName("received")[0];
      data.unreadMessages = parseInt(messages.getAttribute("unread"));
      data.totalMessages = parseInt(messages.getAttribute("count"));
      self.userDetails.ping();

      for (var _i = 0, _b = self._onLoggedIn; _i < _b.length; _i++) {
        var action = _b[_i];
        action(self.userDetails.data);
      }

      self._onLoggedIn = [];
    });
  };

  OsmConnection.prototype.CheckForMessagesContinuously = function () {
    var _this = this;

    var self = this;
    window.setTimeout(function () {
      if (self.userDetails.data.loggedIn) {
        console.log("Checking for messages");

        _this.AttemptLogin();
      }
    }, 5 * 60 * 1000);
  };

  return OsmConnection;
}();

exports.OsmConnection = OsmConnection;
},{"osm-auth":"node_modules/osm-auth/index.js","../UIEventSource":"Logic/UIEventSource.ts","./OsmPreferences":"Logic/Osm/OsmPreferences.ts","./ChangesetHandler":"Logic/Osm/ChangesetHandler.ts"}],"Logic/Web/QueryParameters.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryParameters = void 0;
/**
 * Wraps the query parameters into UIEventSources
 */

var UIEventSource_1 = require("../UIEventSource");

var QueryParameters =
/** @class */
function () {
  function QueryParameters() {}

  QueryParameters.addOrder = function (key) {
    if (this.order.indexOf(key) < 0) {
      this.order.push(key);
    }
  };

  QueryParameters.init = function () {
    var _a;

    if (this.initialized) {
      return;
    }

    this.initialized = true;

    if ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.search) {
      var params = window.location.search.substr(1).split("&");

      for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var param = params_1[_i];
        var kv = param.split("=");
        var key = kv[0];
        QueryParameters.addOrder(key);
        var v = kv[1];
        var source = new UIEventSource_1.UIEventSource(v);
        source.addCallback(function () {
          return QueryParameters.Serialize();
        });
        QueryParameters.knownSources[key] = source;
      }
    }
  };

  QueryParameters.Serialize = function () {
    var parts = [];

    for (var _i = 0, _a = QueryParameters.order; _i < _a.length; _i++) {
      var key = _a[_i];

      if (QueryParameters.knownSources[key] === undefined || QueryParameters.knownSources[key].data === undefined) {
        continue;
      }

      if (QueryParameters.knownSources[key].data == QueryParameters.defaults[key]) {
        continue;
      }

      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(QueryParameters.knownSources[key].data));
    }

    history.replaceState(null, "", "?" + parts.join("&"));
  };

  QueryParameters.GetQueryParameter = function (key, deflt) {
    if (!this.initialized) {
      this.init();
    }

    if (deflt !== undefined) {
      QueryParameters.defaults[key] = deflt;
    }

    if (QueryParameters.knownSources[key] !== undefined) {
      return QueryParameters.knownSources[key];
    }

    QueryParameters.addOrder(key);
    var source = new UIEventSource_1.UIEventSource(deflt);
    QueryParameters.knownSources[key] = source;
    source.addCallback(function () {
      return QueryParameters.Serialize();
    });
    return source;
  };

  QueryParameters.order = ["layout", "test", "z", "lat", "lon"];
  QueryParameters.knownSources = {};
  QueryParameters.initialized = false;
  QueryParameters.defaults = {};
  return QueryParameters;
}();

exports.QueryParameters = QueryParameters;
},{"../UIEventSource":"Logic/UIEventSource.ts"}],"State.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.State = void 0;

var Utils_1 = require("./Utils");

var ElementStorage_1 = require("./Logic/ElementStorage");

var Changes_1 = require("./Logic/Osm/Changes");

var OsmConnection_1 = require("./Logic/Osm/OsmConnection");

var Locale_1 = __importDefault(require("./UI/i18n/Locale"));

var Translations_1 = __importDefault(require("./UI/i18n/Translations"));

var UIEventSource_1 = require("./Logic/UIEventSource");

var LocalStorageSource_1 = require("./Logic/Web/LocalStorageSource");

var QueryParameters_1 = require("./Logic/Web/QueryParameters");
/**
 * Contains the global state: a bunch of UI-event sources
 */


var State =
/** @class */
function () {
  function State(layoutToUse) {
    var _this = this;

    this.layoutToUse = new UIEventSource_1.UIEventSource(undefined);
    this.filteredLayers = new UIEventSource_1.UIEventSource([]);
    this.presets = new UIEventSource_1.UIEventSource([]);
    /**
     *  The message that should be shown at the center of the screen
     */

    this.centerMessage = new UIEventSource_1.UIEventSource("");
    /**
     This message is shown full screen on mobile devices
     */

    this.fullScreenMessage = new UIEventSource_1.UIEventSource(undefined);
    /**
     The latest element that was selected - used to generate the right UI at the right place
     */

    this.selectedElement = new UIEventSource_1.UIEventSource(undefined);
    /**
     * The map location: currently centered lat, lon and zoom
     */

    this.locationControl = new UIEventSource_1.UIEventSource(undefined);
    /**
     * The location as delivered by the GPS
     */

    this.currentGPSLocation = new UIEventSource_1.UIEventSource(undefined);
    this.layerControlIsOpened = QueryParameters_1.QueryParameters.GetQueryParameter("layer-control-toggle", "false").map(function (str) {
      return str !== "false";
    }, [], function (b) {
      return "" + b;
    });
    this.welcomeMessageOpenedTab = QueryParameters_1.QueryParameters.GetQueryParameter("tab", "0").map(function (str) {
      return isNaN(Number(str)) ? 0 : Number(str);
    }, [], function (n) {
      return "" + n;
    });
    var self = this;
    this.layoutToUse.setData(layoutToUse);

    function asFloat(source) {
      return source.map(function (str) {
        var parsed = parseFloat(str);
        return isNaN(parsed) ? undefined : parsed;
      }, [], function (fl) {
        if (fl === undefined || isNaN(fl)) {
          return undefined;
        }

        return ("" + fl).substr(0, 8);
      });
    }

    this.zoom = asFloat(QueryParameters_1.QueryParameters.GetQueryParameter("z", "" + layoutToUse.startzoom).syncWith(LocalStorageSource_1.LocalStorageSource.Get("zoom"), true));
    this.lat = asFloat(QueryParameters_1.QueryParameters.GetQueryParameter("lat", "" + layoutToUse.startLat).syncWith(LocalStorageSource_1.LocalStorageSource.Get("lat"), true));
    this.lon = asFloat(QueryParameters_1.QueryParameters.GetQueryParameter("lon", "" + layoutToUse.startLon).syncWith(LocalStorageSource_1.LocalStorageSource.Get("lon"), true));
    this.locationControl = new UIEventSource_1.UIEventSource({
      zoom: Utils_1.Utils.asFloat(this.zoom.data),
      lat: Utils_1.Utils.asFloat(this.lat.data),
      lon: Utils_1.Utils.asFloat(this.lon.data)
    }).addCallback(function (latlonz) {
      _this.zoom.setData(latlonz.zoom);

      _this.lat.setData(latlonz.lat);

      _this.lon.setData(latlonz.lon);
    });
    this.layoutToUse.addCallback(function (layoutToUse) {
      var _a, _b, _c;

      var lcd = self.locationControl.data;
      lcd.zoom = (_a = lcd.zoom) !== null && _a !== void 0 ? _a : layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.startzoom;
      lcd.lat = (_b = lcd.lat) !== null && _b !== void 0 ? _b : layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.startLat;
      lcd.lon = (_c = lcd.lon) !== null && _c !== void 0 ? _c : layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.startLon;
      self.locationControl.ping();
    });

    function featSw(key, deflt) {
      var queryParameterSource = QueryParameters_1.QueryParameters.GetQueryParameter(key, undefined); // I'm so sorry about someone trying to decipher this
      // It takes the current layout, extracts the default value for this query paramter. A query parameter event source is then retreived and flattened

      return UIEventSource_1.UIEventSource.flatten(self.layoutToUse.map(function (layout) {
        var defaultValue = deflt(layout);
        var queryParam = QueryParameters_1.QueryParameters.GetQueryParameter(key, "" + defaultValue);
        return queryParam.map(function (str) {
          return str === undefined ? defaultValue : str !== "false";
        });
      }), [queryParameterSource]);
    }

    this.featureSwitchUserbadge = featSw("fs-userbadge", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableUserBadge) !== null && _a !== void 0 ? _a : true;
    });
    this.featureSwitchSearch = featSw("fs-search", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableSearch) !== null && _a !== void 0 ? _a : true;
    });
    this.featureSwitchLayers = featSw("fs-layers", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableLayers) !== null && _a !== void 0 ? _a : true;
    });
    this.featureSwitchAddNew = featSw("fs-add-new", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableAdd) !== null && _a !== void 0 ? _a : true;
    });
    this.featureSwitchWelcomeMessage = featSw("fs-welcome-message", function () {
      return true;
    });
    this.featureSwitchIframe = featSw("fs-iframe", function () {
      return false;
    });
    this.featureSwitchMoreQuests = featSw("fs-more-quests", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableMoreQuests) !== null && _a !== void 0 ? _a : true;
    });
    this.featureSwitchShareScreen = featSw("fs-share-screen", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableShareScreen) !== null && _a !== void 0 ? _a : true;
    });
    this.featureSwitchGeolocation = featSw("fs-geolocation", function (layoutToUse) {
      var _a;

      return (_a = layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.enableGeolocation) !== null && _a !== void 0 ? _a : true;
    });
    var testParam = QueryParameters_1.QueryParameters.GetQueryParameter("test", "false").data;
    this.osmConnection = new OsmConnection_1.OsmConnection(testParam === "true", QueryParameters_1.QueryParameters.GetQueryParameter("oauth_token", undefined), layoutToUse.id, true);
    this.installedThemes = this.osmConnection.preferencesHandler.preferences.map(function (allPreferences) {
      var installedThemes = [];

      if (allPreferences === undefined) {
        return installedThemes;
      }

      for (var allPreferencesKey in allPreferences) {
        var themename = allPreferencesKey.match(/^mapcomplete-installed-theme-(.*)-combined-length$/);

        if (themename && themename[1] !== "") {
          var customLayout = State.state.osmConnection.GetLongPreference("installed-theme-" + themename[1]);

          if (customLayout.data === undefined) {
            console.log("No data defined for ", themename[1]);
            continue;
          }

          try {
            var layout = State.FromBase64(customLayout.data);

            if (layout.id === undefined) {
              // This is an old style theme
              // We remove it
              customLayout.setData(undefined);
              continue;
            }

            installedThemes.push({
              layout: layout,
              definition: customLayout.data
            });
          } catch (e) {
            console.warn("Could not parse custom layout from preferences: ", allPreferencesKey, e, customLayout.data);
          }
        }
      }

      return installedThemes;
    }); // IMportant: the favourite layers are initiliazed _after_ the installed themes, as these might contain an installedTheme

    this.favouriteLayers = this.osmConnection.GetLongPreference("favouriteLayers").map(function (str) {
      var _a;

      return (_a = Utils_1.Utils.Dedup(str === null || str === void 0 ? void 0 : str.split(";"))) !== null && _a !== void 0 ? _a : [];
    }, [], function (layers) {
      var _a;

      return (_a = Utils_1.Utils.Dedup(layers)) === null || _a === void 0 ? void 0 : _a.join(";");
    });
    Locale_1.default.language.syncWith(this.osmConnection.GetPreference("language"));
    Locale_1.default.language.addCallback(function (currentLanguage) {
      var layoutToUse = self.layoutToUse.data;

      if (layoutToUse === undefined) {
        return;
      }

      if (_this.layoutToUse.data.supportedLanguages.indexOf(currentLanguage) < 0) {
        console.log("Resetting language to", layoutToUse.supportedLanguages[0], "as", currentLanguage, " is unsupported"); // The current language is not supported -> switch to a supported one

        Locale_1.default.language.setData(layoutToUse.supportedLanguages[0]);
      }
    }).ping();
    this.layoutToUse.map(function (layoutToUse) {
      var _a, _b;

      return (_b = (_a = Translations_1.default.WT(layoutToUse === null || layoutToUse === void 0 ? void 0 : layoutToUse.title)) === null || _a === void 0 ? void 0 : _a.txt) !== null && _b !== void 0 ? _b : "MapComplete";
    }, [Locale_1.default.language]).addCallbackAndRun(function (title) {
      document.title = title;
    });
    this.allElements = new ElementStorage_1.ElementStorage();
    this.changes = new Changes_1.Changes();

    if (State.runningFromConsole) {
      console.warn("running from console - not initializing map. Assuming test.html");
      return;
    }

    if (document.getElementById("leafletDiv") === null) {
      console.warn("leafletDiv not found - not initializing map. Assuming test.html");
      return;
    }
  }

  State.vNumber = "0.0.9b"; // The user journey states thresholds when a new feature gets unlocked

  State.userJourney = {
    addNewPointsUnlock: 1,
    moreScreenUnlock: 5,
    personalLayoutUnlock: 20,
    tagsVisibleAt: 100,
    mapCompleteHelpUnlock: 200,
    tagsVisibleAndWikiLinked: 150,
    themeGeneratorReadOnlyUnlock: 200,
    themeGeneratorFullUnlock: 500,
    addNewPointWithUnreadMessagesUnlock: 500,
    minZoomLevelToAddNewPoints: Utils_1.Utils.isRetina() ? 18 : 19
  };
  State.runningFromConsole = false;
  State.FromBase64 = undefined;
  return State;
}();

exports.State = State;
},{"./Utils":"Utils.ts","./Logic/ElementStorage":"Logic/ElementStorage.ts","./Logic/Osm/Changes":"Logic/Osm/Changes.ts","./Logic/Osm/OsmConnection":"Logic/Osm/OsmConnection.ts","./UI/i18n/Locale":"UI/i18n/Locale.ts","./UI/i18n/Translations":"UI/i18n/Translations.ts","./Logic/UIEventSource":"Logic/UIEventSource.ts","./Logic/Web/LocalStorageSource":"Logic/Web/LocalStorageSource.ts","./Logic/Web/QueryParameters":"Logic/Web/QueryParameters.ts"}],"Customizations/Layout.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layout = void 0;

var Translations_1 = __importDefault(require("../UI/i18n/Translations"));

var Combine_1 = __importDefault(require("../UI/Base/Combine"));

var State_1 = require("../State");
/**
 * A layout is a collection of settings of the global view (thus: welcome text, title, selection of layers).
 */


var Layout =
/** @class */
function () {
  function Layout(id, supportedLanguages, title, layers, startzoom, startLat, startLon, welcomeMessage, gettingStartedPlzLogin, welcomeBackMessage, welcomeTail) {
    if (gettingStartedPlzLogin === void 0) {
      gettingStartedPlzLogin = new Combine_1.default([Translations_1.default.t.general.getStartedLogin.SetClass("soft").onClick(function () {
        State_1.State.state.osmConnection.AttemptLogin();
      }), Translations_1.default.t.general.getStartedNewAccount]);
    }

    if (welcomeBackMessage === void 0) {
      welcomeBackMessage = Translations_1.default.t.general.welcomeBack;
    }

    if (welcomeTail === void 0) {
      welcomeTail = "";
    }

    this.icon = "./assets/logo.svg";
    this.socialImage = "";
    this.enableAdd = true;
    this.enableUserBadge = true;
    this.enableSearch = true;
    this.enableLayers = true;
    this.enableBackgroundLayers = true;
    this.enableMoreQuests = true;
    this.enableShareScreen = true;
    this.enableGeolocation = true;
    this.hideFromOverview = false;
    /**
     * The BBOX of the currently visible map are widened by this factor, in order to make some panning possible.
     * This number influences this
     */

    this.widenFactor = 0.07;
    this.defaultBackground = "osm";
    this.supportedLanguages = supportedLanguages;
    this.title = Translations_1.default.W(title);
    this.startLon = startLon;
    this.startLat = startLat;
    this.startzoom = startzoom;
    this.id = id;
    this.layers = layers;
    this.welcomeMessage = Translations_1.default.W(welcomeMessage);
    this.gettingStartedPlzLogin = Translations_1.default.W(gettingStartedPlzLogin);
    this.welcomeBackMessage = Translations_1.default.W(welcomeBackMessage);
    this.welcomeTail = Translations_1.default.W(welcomeTail);
  }

  return Layout;
}();

exports.Layout = Layout;
},{"../UI/i18n/Translations":"UI/i18n/Translations.ts","../UI/Base/Combine":"UI/Base/Combine.ts","../State":"State.ts"}],"Customizations/OnlyShowIf.ts":[function(require,module,exports) {
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
exports.OnlyShowIfConstructor = void 0;

var Tags_1 = require("../Logic/Tags");

var UIElement_1 = require("../UI/UIElement");
/**
 * Wrapper around another TagDependandElement, which only shows if the filters match
 */


var OnlyShowIfConstructor =
/** @class */
function () {
  function OnlyShowIfConstructor(tagsFilter, embedded) {
    this._tagsFilter = tagsFilter;
    this._embedded = embedded;
  }

  OnlyShowIfConstructor.prototype.construct = function (dependencies) {
    return new OnlyShowIf(dependencies.tags, this._embedded.construct(dependencies), this._tagsFilter);
  };

  OnlyShowIfConstructor.prototype.IsKnown = function (properties) {
    if (!this.Matches(properties)) {
      return true;
    }

    return this._embedded.IsKnown(properties);
  };

  OnlyShowIfConstructor.prototype.IsQuestioning = function (properties) {
    if (!this.Matches(properties)) {
      return false;
    }

    return this._embedded.IsQuestioning(properties);
  };

  OnlyShowIfConstructor.prototype.GetContent = function (tags) {
    if (!this.IsKnown(tags)) {
      return undefined;
    }

    return this._embedded.GetContent(tags);
  };

  OnlyShowIfConstructor.prototype.Matches = function (properties) {
    return this._tagsFilter.matches(Tags_1.TagUtils.proprtiesToKV(properties));
  };

  return OnlyShowIfConstructor;
}();

exports.OnlyShowIfConstructor = OnlyShowIfConstructor;

var OnlyShowIf =
/** @class */
function (_super) {
  __extends(OnlyShowIf, _super);

  function OnlyShowIf(tags, embedded, filter) {
    var _this = _super.call(this, tags) || this;

    _this._filter = filter;
    _this._embedded = embedded;
    return _this;
  }

  OnlyShowIf.prototype.Matches = function () {
    return this._filter.matches(Tags_1.TagUtils.proprtiesToKV(this._source.data));
  };

  OnlyShowIf.prototype.InnerRender = function () {
    if (this.Matches()) {
      return this._embedded.Render();
    } else {
      return "";
    }
  };

  OnlyShowIf.prototype.IsKnown = function () {
    if (!this.Matches()) {
      return false;
    }

    return this._embedded.IsKnown();
  };

  OnlyShowIf.prototype.IsSkipped = function () {
    if (!this.Matches()) {
      return false;
    }

    return this._embedded.IsSkipped();
  };

  OnlyShowIf.prototype.IsQuestioning = function () {
    if (!this.Matches()) {
      return false;
    }

    return this._embedded.IsQuestioning();
  };

  return OnlyShowIf;
}(UIElement_1.UIElement);
},{"../Logic/Tags":"Logic/Tags.ts","../UI/UIElement":"UI/UIElement.ts"}],"Customizations/TagRenderingOptions.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TagRenderingOptions = void 0;

var Tags_1 = require("../Logic/Tags");

var OnlyShowIf_1 = require("./OnlyShowIf");

var Translations_1 = __importDefault(require("../UI/i18n/Translations"));

var TagRenderingOptions =
/** @class */
function () {
  function TagRenderingOptions(options) {
    this.options = options;
  }

  TagRenderingOptions.prototype.OnlyShowIf = function (tagsFilter) {
    return new OnlyShowIf_1.OnlyShowIfConstructor(tagsFilter, this);
  };

  TagRenderingOptions.prototype.IsQuestioning = function (tags) {
    var _a;

    var tagsKV = Tags_1.TagUtils.proprtiesToKV(tags);

    for (var _i = 0, _b = (_a = this.options.mappings) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
      var oneOnOneElement = _b[_i];

      if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tagsKV)) {
        return false;
      }
    }

    if (this.options.freeform !== undefined && tags[this.options.freeform.key] !== undefined) {
      return false;
    }

    return this.options.question !== undefined;
  };

  TagRenderingOptions.prototype.GetContent = function (tags) {
    var _a;

    var tagsKV = Tags_1.TagUtils.proprtiesToKV(tags);

    for (var _i = 0, _b = (_a = this.options.mappings) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
      var oneOnOneElement = _b[_i];

      if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tagsKV)) {
        return Translations_1.default.WT(oneOnOneElement.txt);
      }
    }

    if (this.options.freeform !== undefined) {
      var template = Translations_1.default.WT(this.options.freeform.renderTemplate);
      return template.Subs(tags);
    }

    console.warn("No content defined for", tags, " with mapping", this);
    return undefined;
  };

  TagRenderingOptions.prototype.construct = function (dependencies) {
    return TagRenderingOptions.tagRendering(dependencies.tags, this.options);
  };

  TagRenderingOptions.prototype.IsKnown = function (properties) {
    return !this.IsQuestioning(properties);
  };

  return TagRenderingOptions;
}();

exports.TagRenderingOptions = TagRenderingOptions;
},{"../Logic/Tags":"Logic/Tags.ts","./OnlyShowIf":"Customizations/OnlyShowIf.ts","../UI/i18n/Translations":"UI/i18n/Translations.ts"}],"Customizations/LayerDefinition.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayerDefinition = void 0;

var LayerDefinition =
/** @class */
function () {
  function LayerDefinition(id, options) {
    if (options === void 0) {
      options = undefined;
    }

    var _a, _b;
    /**
     * If an object of the next layer is contained for this many percent in this feature, it is eaten and not shown
     */


    this.maxAllowedOverlapPercentage = undefined;
    /**
     * If true, then ways (and polygons) will be converted to a 'point' at the center instead before further processing
     */

    this.wayHandling = 0;
    this.id = id;

    if (options === undefined) {
      return;
    }

    this.name = options.name;
    this.description = options.description;
    this.maxAllowedOverlapPercentage = (_a = options.maxAllowedOverlapPercentage) !== null && _a !== void 0 ? _a : 0;
    this.presets = options.presets;
    this.icon = options.icon;
    this.minzoom = options.minzoom;
    this.overpassFilter = options.overpassFilter;
    this.title = options.title;
    this.elementsToShow = options.elementsToShow;
    this.style = options.style;
    this.wayHandling = (_b = options.wayHandling) !== null && _b !== void 0 ? _b : LayerDefinition.WAYHANDLING_DEFAULT;
  }

  LayerDefinition.WAYHANDLING_DEFAULT = 0;
  LayerDefinition.WAYHANDLING_CENTER_ONLY = 1;
  LayerDefinition.WAYHANDLING_CENTER_AND_WAY = 2;
  return LayerDefinition;
}();

exports.LayerDefinition = LayerDefinition;
},{}],"assets/layers/drinking_water/drinking_water.json":[function(require,module,exports) {
module.exports = {
  "id": "drinking_water",
  "name": {
    "en": "Drinking water",
    "nl": "Drinkbaar water",
    "fr": "Eau potable",
    "gl": "Auga potábel",
    "de": "Trinkwasser"
  },
  "title": {
    "render": {
      "en": "Drinking water",
      "nl": "Drinkbaar water",
      "fr": "Eau potable",
      "gl": "Auga potábel",
      "de": "Trinkwasser"
    }
  },
  "icon": "./assets/layers/drinking_water/drinking_water.svg",
  "iconSize": "40,40,bottom",
  "overpassTags": "amenity=drinking_water",
  "minzoom": 13,
  "wayHandling": 1,
  "presets": [{
    "title": {
      "en": "Drinking water",
      "nl": "Drinkbaar water",
      "fr": "Eau potable",
      "gl": "Auga potábel",
      "de": "Trinkwasser"
    },
    "tags": ["amenity=drinking_water"]
  }],
  "color": "#00bb00",
  "tagRenderings": ["images", {
    "#": "Still in use?",
    "question": {
      "en": "Is this drinking water spot still operational?",
      "nl": "Is deze drinkwaterkraan nog steeds werkende?"
    },
    "render": {
      "en": "The operational status is <i>{operational_status</i>",
      "nl": "Deze waterkraan-status is <i>{operational_status}</i>"
    },
    "freeform": {
      "key": "operational_status"
    },
    "mappings": [{
      "if": "operational_status=",
      "then": {
        "en": "This drinking water works",
        "nl": "Deze drinkwaterfonteint werkt"
      },
      "hideInAnswer": true
    }, {
      "if": "operational_status=broken",
      "then": {
        "en": "This drinking water is broken",
        "nl": "Deze drinkwaterfonteint is kapot"
      }
    }, {
      "if": "operational_status=closed",
      "then": {
        "en": "This drinking water is closed",
        "nl": "Deze drinkwaterfonteint is afgesloten"
      }
    }]
  }, {
    "#": "Bottle refill",
    "question": {
      "en": "How easy is it to fill water bottles?",
      "nl": "Hoe gemakkelijk is het om drinkbussen bij te vullen?",
      "de": "Wie einfach ist es, Wasserflaschen zu füllen?"
    },
    "mappings": [{
      "if": "bottle=yes",
      "then": {
        "en": "It is easy to refill water bottles",
        "nl": "Een drinkbus bijvullen gaat makkelijk",
        "de": "Es ist einfach, Wasserflaschen nachzufüllen"
      }
    }, {
      "if": "bottle=no",
      "then": {
        "en": "Water bottles may not fit",
        "nl": "Een drinkbus past moeilijk",
        "de": "Wasserflaschen passen möglicherweise nicht"
      }
    }]
  }]
};
},{}],"assets/layers/ghost_bike/ghost_bike.json":[function(require,module,exports) {
module.exports = {
  "id": "ghost_bike",
  "name": {
    "en": "Ghost bikes",
    "nl": "Witte Fietsen",
    "de": "Geisterrad"
  },
  "overpassTags": "memorial=ghost_bike",
  "minzoom": 0,
  "title": {
    "render": {
      "en": "Ghost bike",
      "nl": "Witte Fiets",
      "de": "Geisterrad"
    },
    "mappings": [{
      "if": "name~*",
      "then": {
        "en": "Ghost bike in the remembrance of {name}",
        "nl": "Witte fiets ter nagedachtenis van {name}",
        "de": "Geisterrad im Gedenken an {name}"
      }
    }]
  },
  "icon": "./assets/layers/ghost_bike/ghost_bike.svg",
  "iconSize": "40,40,bottom",
  "width": "5",
  "color": "#000",
  "wayHandling": 1,
  "presets": [{
    "title": {
      "en": "Ghost bike",
      "nl": "Witte fiets",
      "de": "Geisterrad"
    },
    "tags": ["historic=memorial", "memorial=ghost_bike"]
  }],
  "tagRenderings": [{
    "render": {
      "en": "A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident, in the form of a white bicycle placed permanently near the accident location.",
      "nl": "Een Witte Fiets (of Spookfiets) is een aandenken aan een fietser die bij een verkeersongeval om het leven kwam. Het gaat over een witgeschilderde fiets die geplaatst werd in de buurt van het ongeval.",
      "de": "Ein <b>Geisterrad</b> ist ein Denkmal für einen Radfahrer, der bei einem Verkehrsunfall ums Leben kam, in Form eines weißen Fahrrades, das dauerhaft in der Nähe des Unfallortes aufgestellt wird."
    }
  }, "images", {
    "question": {
      "en": "Whom is remembered by this ghost bike?<span class='question-subtext'><br/>Please respect privacy - only fill out the name if it is widely published or marked on the cycle. Opt to leave out the family name.</span>",
      "nl": "Aan wie is deze witte fiets een eerbetoon?<span class='question-subtext'><br/>Respecteer privacy - voeg enkel een naam toe indien die op de fiets staat of gepubliceerd is. Eventueel voeg je enkel de voornaam toe.</span>",
      "de": "An wen erinnert dieses Geisterrad?<span class='question-subtext'><br/>Bitte respektieren Sie die Privatsphäre - geben Sie den Namen nur an, wenn er weit verbreitet oder auf dem Fahrrad markiert ist. Den Familiennamen können Sie weglassen.</span>"
    },
    "render": {
      "en": "In remembrance of {name}",
      "nl": "Ter nagedachtenis van {name}",
      "de": "Im Gedenken an {name}"
    },
    "freeform": {
      "key": "name"
    },
    "mappings": [{
      "if": "noname=yes",
      "then": {
        "en": "No name is marked on the bike",
        "nl": "De naam is niet aangeduid op de fiets",
        "de": "Auf dem Fahrrad ist kein Name angegeben"
      }
    }]
  }, {
    "question": {
      "en": "On what webpage can one find more information about the Ghost bike or the accident?",
      "nl": "Op welke website kan men meer informatie vinden over de Witte fiets of over het ongeval?",
      "de": "Auf welcher Webseite kann man mehr Informationen über das Geisterrad oder den Unfall finden?"
    },
    "render": {
      "en": "<a href='{source}' target='_blank'>More information is available</a>",
      "nl": "<a href='{source}' target='_blank'>Meer informatie</a>",
      "de": "<a href='{source}' target='_blank'>Mehr Informationen</a>"
    },
    "freeform": {
      "type": "url",
      "key": "source"
    }
  }, {
    "question": {
      "en": "What is the inscription on this Ghost bike?",
      "nl": "Wat is het opschrift op deze witte fiets?",
      "de": "Wie lautet die Inschrift auf diesem Geisterrad?"
    },
    "render": {
      "en": "<i>{inscription}</i>",
      "nl": "<i>{inscription}</i>",
      "de": "<i>{inscription}</i>"
    },
    "freeform": {
      "key": "inscription"
    }
  }, {
    "question": {
      "nl": "Wanneer werd deze witte fiets geplaatst?",
      "en": "When was this Ghost bike installed?"
    },
    "render": {
      "nl": "Geplaatst op {start_date}",
      "en": "Placed on {start_date}"
    },
    "freeform": {
      "key": "start_date",
      "type": "date"
    }
  }]
};
},{}],"assets/layers/viewpoint/viewpoint.json":[function(require,module,exports) {
module.exports = {
  "id": "viewpoint",
  "name": {
    "en": "Viewpoint",
    "nl": "Uitzicht",
    "de": "Aussichtspunkt"
  },
  "description": {
    "en": "A nice viewpoint or nice view. Ideal to add an image if no other category fits",
    "nl": "Een mooi uitzicht - ideaal om een foto toe te voegen wanneer iets niet in een andere categorie past",
    "de": "Ein schöner Aussichtspunkt oder eine schöne Aussicht. Ideal zum Hinzufügen eines Bildes, wenn keine andere Kategorie passt"
  },
  "overpassTags": "tourism=viewpoint",
  "minzoom": 14,
  "icon": "./assets/layers/viewpoint/viewpoint.svg",
  "iconSize": "20,20,center",
  "color": "#ffffff",
  "width": "5",
  "wayhandling": 2,
  "presets": [{
    "title": {
      "en": "Viewpoint",
      "nl": "Uitzicht",
      "de": "Aussichtspunkt"
    },
    "tags": ["tourism=viewpoint"]
  }],
  "title": {
    "render": {
      "en": "Viewpoint",
      "nl": "Uitzicht",
      "de": "Aussichtspunkt"
    }
  },
  "tagRenderings": ["images", {
    "question": {
      "en": "Do you want to add a description?",
      "nl": "Zijn er bijzonderheden die je wilt toevoegen?",
      "de": "Möchten Sie eine Beschreibung hinzufügen?"
    },
    "render": "{description}",
    "freeform": {
      "key": "description"
    }
  }]
};
},{}],"assets/layers/bike_parking/bike_parking.json":[function(require,module,exports) {
module.exports = {
  "id": "bike_parking",
  "name": {
    "en": "Bike parking",
    "nl": "Fietsparking",
    "fr": "Parking à vélo",
    "gl": "Aparcadoiro de bicicletas",
    "de": "Fahrrad-Parkplätze"
  },
  "minzoom": 17,
  "overpassTags": {
    "and": ["amenity=bicycle_parking"]
  },
  "icon": {
    "render": {
      "en": "./assets/layers/bike_parking/parking.svg"
    }
  },
  "iconSize": "40,40,bottom",
  "color": "#00f",
  "width": "1",
  "wayHandling": 2,
  "presets": [{
    "title": {
      "en": "Bike parking",
      "nl": "Fietsparking",
      "fr": "Parking à vélo",
      "gl": "Aparcadoiro de bicicletas",
      "de": "Fahrrad-Parkplätze"
    },
    "tags": ["amenity=bicycle_parking"]
  }],
  "title": {
    "render": {
      "en": "Bike parking",
      "nl": "Fietsparking",
      "fr": "Parking à vélo",
      "gl": "Aparcadoiro de bicicletas",
      "de": "Fahrrad-Parkplätze"
    }
  },
  "tagRenderings": ["images", {
    "#": "Bicycle parking type",
    "question": {
      "en": "What is the type of this bicycle parking?",
      "nl": "Van welk type is deze fietsparking?",
      "fr": "Quelle type de parking s'agit il?",
      "gl": "Que tipo de aparcadoiro de bicicletas é?",
      "de": "Was ist die Art dieses Fahrrad-Parkplatzes?"
    },
    "render": {
      "en": "This is a bicycle parking of the type: {bicycle_parking}",
      "nl": "Dit is een fietsparking van het type: {bicycle_parking}",
      "fr": "Ceci est un parking à vélo de type {bicycle_parking}",
      "gl": "Este é un aparcadoiro de bicicletas do tipo: {bicycle_parking}",
      "de": "Dies ist ein Fahrrad-Parkplatz der Art: {bicycle_parking}"
    },
    "freeform": {
      "key": "bicycle_parking",
      "extraTags": ["fixme=Freeform used on 'bicycle_parking'-tag: possibly a wrong value"]
    },
    "mappings": [{
      "if": "bicycle_parking=stands",
      "then": {
        "en": "Staple racks <img width='150px' src='./assets/layers/bike_parking/staple.svg'>",
        "nl": "Nietjes <img width='150px' src='./assets/layers/bike_parking/staple.svg'>",
        "fr": "Arceaux <img width='150px' src='./assets/layers/bike_parking/staple.svg'>",
        "gl": "De roda (Stands) <img width='150px' src='./assets/layers/bike_parking/staple.svg'>",
        "de": "Fahrradbügel <img width='150px' src='./assets/layers/bike_parking/staple.svg'>"
      }
    }, {
      "if": "bicycle_parking=wall_loops",
      "then": {
        "en": "Wheel rack/loops <img width='150px' src='./assets/layers/bike_parking/wall_loops.svg'>",
        "nl": "Wielrek/lussen <img width='150px' src='./assets/layers/bike_parking/wall_loops.svg'>",
        "fr": "Pinces-roues <img width='150px' src='./assets/layers/bike_parking/wall_loops.svg'>",
        "gl": "Aros <img width='150px' src='./assets/layers/bike_parking/wall_loops.svg'>",
        "de": "Metallgestänge <img width='150px' src='./assets/layers/bike_parking/wall_loops.svg'>"
      }
    }, {
      "if": "bicycle_parking=handlebar_holder",
      "then": {
        "en": "Handlebar holder <img width='150px' src='./assets/layers/bike_parking/handlebar_holder.svg'>",
        "nl": "Stuurhouder <img width='150px' src='./assets/layers/bike_parking/handlebar_holder.svg'>",
        "fr": "Support guidon <img width='150px' src='./assets/layers/bike_parking/handlebar_holder.svg'>",
        "gl": "Cadeado para guiador <img width='150px' src='./assets/layers/bike_parking/handlebar_holder.svg'>",
        "de": "Halter für Fahrradlenker <img width='150px' src='./assets/layers/bike_parking/handlebar_holder.svg'>"
      }
    }, {
      "if": "bicycle_parking=rack",
      "then": {
        "en": "Rack <img width='150px' src='./assets/layers/bike_parking/rack.svg'>",
        "nl": "Rek <img width='150px' src='./assets/layers/bike_parking/rack.svg'>",
        "fr": "Râtelier <img width='150px' src='./assets/layers/bike_parking/rack.svg'>",
        "gl": "Cremalleira <img width='150px' src='./assets/layers/bike_parking/rack.svg'>",
        "de": "Gestell <img width='150px' src='./assets/layers/bike_parking/rack.svg'>"
      }
    }, {
      "if": "bicycle_parking=two_tier",
      "then": {
        "en": "Two-tiered <img width='150px' src='./assets/layers/bike_parking/two_tier.svg'>",
        "nl": "Dubbel (twee verdiepingen) <img width='150px' src='./assets/layers/bike_parking/two_tier.svg'>",
        "fr": "Superposé <img width='150px' src='./assets/layers/bike_parking/two_tier.svg'>",
        "gl": "Dobre cremalleira <img width='150px' src='./assets/layers/bike_parking/two_tier.svg'>",
        "de": "Zweistufig <img width='150px' src='./assets/layers/bike_parking/two_tier.svg'>"
      }
    }, {
      "if": "bicycle_parking=shed",
      "then": {
        "en": "Shed <img width='150px' src='./assets/layers/bike_parking/shed.svg'>",
        "nl": "Schuur <img width='150px' src='./assets/layers/bike_parking/shed.svg'>",
        "fr": "Abri <img width='150px' src='./assets/layers/bike_parking/shed.svg'>",
        "gl": "Abeiro <img width='150px' src='./assets/layers/bike_parking/shed.svg'>",
        "de": "Schuppen <img width='150px' src='./assets/layers/bike_parking/shed.svg'>"
      }
    }, {
      "if": "bicycle_parking=bollard",
      "then": {
        "en": "Bollard <img width='150px' src='./assets/layers/bike_parking/bollard.svg'>",
        "nl": "Paal met ring <img width='150px' src='./assets/layers/bike_parking/bollard.svg'>"
      }
    }, {
      "if": "bicycle_parking=floor",
      "then": {
        "en": "An area on the floor which is  marked for bicycle parking",
        "nl": "Een oppervlakte die gemarkeerd is om fietsen te parkeren"
      }
    }]
  }, {
    "#": "Is covered?",
    "question": {
      "en": "Is this parking covered? Also select \"covered\" for indoor parkings.",
      "nl": "Is deze parking overdekt? Selecteer ook \"overdekt\" voor fietsparkings binnen een gebouw.",
      "gl": "Este aparcadoiro está cuberto? Tamén escolle \"cuberto\" para aparcadoiros interiores.",
      "de": "Ist dieser Parkplatz überdacht? Wählen Sie auch \"überdacht\" für Innenparkplätze."
    },
    "condition": "bicycle_parking!=shed",
    "mappings": [{
      "if": "covered=yes",
      "then": {
        "en": "This parking is covered (it has a roof)",
        "nl": "Deze parking is overdekt (er is een afdak)",
        "gl": "Este aparcadoiro está cuberto (ten un teito)",
        "de": "Dieser Parkplatz ist überdacht (er hat ein Dach)"
      }
    }, {
      "if": "covered=no",
      "then": {
        "en": "This parking is not covered",
        "nl": "Deze parking is niet overdekt",
        "gl": "Este aparcadoiro non está cuberto",
        "de": "Dieser Parkplatz ist nicht überdacht."
      }
    }]
  }, {
    "#": "Capacity",
    "question": {
      "en": "How many bicycles fit in this bicycle parking (including possible cargo bicycles)?",
      "fr": "Combien de vélos entrent dans ce parking à vélos (y compris les éventuels vélos de transport) ?",
      "nl": "Hoeveel fietsen kunnen in deze fietsparking (inclusief potentiëel bakfietsen)?",
      "gl": "Cantas bicicletas caben neste aparcadoiro de bicicletas (incluídas as posíbeis bicicletas de carga)?",
      "de": "Wie viele Fahrräder passen auf diesen Fahrrad-Parkplatz (einschließlich möglicher Lastenfahrräder)?"
    },
    "render": {
      "en": "Place for {capacity} bikes",
      "fr": "Place pour {capacity} vélos",
      "nl": "Plaats voor {capacity} fietsen",
      "gl": "Lugar para {capacity} bicicletas",
      "de": "Platz für {capacity} Fahrräder"
    },
    "freeform": {
      "key": "capacity",
      "type": "nat"
    }
  }, {
    "#": "Access",
    "question": {
      "en": "Who can use this bicycle?",
      "nl": "Wie mag er deze fietsenstalling gebruiken?"
    },
    "render": {
      "en": "{access}"
    },
    "freeform": {
      "key": "access",
      "extraTags": ["fixme=Freeform used on 'access'-tag: possibly a wrong value"]
    },
    "mappings": [{
      "if": "access=yes",
      "then": {
        "en": "Publicly accessible",
        "nl": "Publiek toegankelijke fietsenstalling"
      }
    }, {
      "if": "access=customers",
      "then": {
        "en": "Access is primarily for visitors to a business",
        "nl": "Klanten van de zaak of winkel"
      }
    }, {
      "if": "access=private",
      "then": {
        "en": "Access is limited to members of a school, company or organisation",
        "nl": "Private fietsenstalling van een school, een bedrijf, ..."
      }
    }]
  }, {
    "#": "Cargo bike spaces?",
    "question": {
      "en": "Does this bicycle parking have spots for cargo bikes?",
      "nl": "Heeft deze fietsparking plaats voor bakfietsen?",
      "fr": "TODO: fr",
      "gl": "Este aparcadoiro de bicicletas ten espazo para bicicletas de carga?",
      "de": "Gibt es auf diesem Fahrrad-Parkplatz Plätze für Lastenfahrräder?"
    },
    "mappings": [{
      "if": "cargo_bike=yes",
      "then": {
        "en": "This parking has room for cargo bikes",
        "nl": "Deze parking heeft plaats voor bakfietsen",
        "fr": "TODO: fr",
        "gl": "Este aparcadoiro ten espazo para bicicletas de carga.",
        "de": "Dieser Parkplatz bietet Platz für Lastenfahrräder"
      }
    }, {
      "if": "cargo_bike=designated",
      "then": {
        "en": "This parking has designated (official) spots for cargo bikes.",
        "nl": "Er zijn speciale plaatsen voorzien voor bakfietsen",
        "fr": "TODO: fr",
        "gl": "Este aparcadoiro ten espazos designados (oficiais) para bicicletas de carga.",
        "de": "Dieser Parkplatz verfügt über ausgewiesene (offizielle) Plätze für Lastenfahrräder."
      }
    }, {
      "if": "cargo_bike=no",
      "then": {
        "en": "You're not allowed to park cargo bikes",
        "nl": "Je mag hier geen bakfietsen parkeren",
        "fr": "TODO: fr",
        "gl": "Non está permitido aparcar bicicletas de carga",
        "de": "Es ist nicht erlaubt, Lastenfahrräder zu parken"
      }
    }]
  }, {
    "#": "Cargo bike capacity?",
    "question": {
      "en": "How many cargo bicycles fit in this bicycle parking?",
      "nl": "Voor hoeveel bakfietsen heeft deze fietsparking plaats?",
      "fr": "Combien de vélos de transport entrent dans ce parking à vélos ?",
      "gl": "Cantas bicicletas de carga caben neste aparcadoiro de bicicletas?",
      "de": "Wie viele Lastenfahrräder passen auf diesen Fahrrad-Parkplatz?"
    },
    "render": {
      "en": "This parking fits {capacity:cargo_bike} cargo bikes",
      "nl": "Deze parking heeft plaats voor {capacity:cargo_bike} fietsen",
      "fr": "Ce parking a de la place pour {capacity:cargo_bike} vélos de transport.",
      "gl": "Neste aparcadoiro caben {capacity:cargo_bike} bicicletas de carga",
      "de": "Auf diesen Parkplatz passen {capacity:cargo_bike} Lastenfahrräder"
    },
    "condition": "cargo_bike~designated|yes",
    "freeform": {
      "key": "capacity:cargo_bike",
      "type": "nat"
    }
  }]
};
},{}],"assets/layers/bike_repair_station/bike_repair_station.json":[function(require,module,exports) {
module.exports = {
  "id": "bike_repair_station",
  "name": {
    "en": "Bike stations (repair, pump or both)",
    "nl": "Fietspunten (herstel, pomp of allebei)",
    "fr": "Station velo (réparation, pompe à vélo)",
    "gl": "Estación de bicicletas (arranxo, bomba de ar ou ambos)",
    "de": "Fahrradstationen (Reparatur, Pumpe oder beides)"
  },
  "minzoom": 13,
  "overpassTags": {
    "and": ["amenity=bicycle_repair_station"]
  },
  "title": {
    "render": {
      "en": "Bike station (pump & repair)",
      "nl": "Herstelpunt met pomp",
      "fr": "Point station velo avec pompe",
      "gl": "Estación de bicicletas (arranxo e bomba de ar)",
      "de": "Fahrradstation (Pumpe & Reparatur)"
    },
    "mappings": [{
      "if": {
        "or": ["service:bicycle:pump=no", "service:bicycle:pump:operational_status=broken"]
      },
      "then": {
        "en": "Bike repair station",
        "nl": "Herstelpunt",
        "fr": "Point de réparation velo",
        "gl": "Estación de arranxo de bicicletas",
        "de": "Fahrrad-Reparaturstation"
      }
    }, {
      "if": {
        "and": ["service:bicycle:pump=yes", "service:bicycle:tools=yes"]
      },
      "then": {
        "en": "Bike repair station",
        "nl": "Herstelpunt",
        "fr": "Point de réparation",
        "gl": "Estación de arranxo de bicicletas",
        "de": "Fahrrad-Reparaturstation"
      }
    }, {
      "if": {
        "and": ["service:bicycle:pump:operational_status=broken", {
          "or": ["service:bicycle:tools=no", "service:bicycle:tools="]
        }]
      },
      "then": {
        "en": "Broken pump",
        "nl": "Kapotte fietspomp",
        "fr": "Pompe cassée",
        "gl": "Bomba de ar estragada",
        "de": "Kaputte Pumpe"
      }
    }, {
      "if": {
        "and": ["service:bicycle:pump=yes", "service:bicycle:tools=no"]
      },
      "then": {
        "en": "Bicycle pump",
        "nl": "Fietspomp",
        "fr": "Pompe de vélo",
        "gl": "Bomba de ar",
        "de": "Fahrradpumpe"
      }
    }]
  },
  "tagRenderings": ["images", {
    "question": {
      "en": "Which services are available at this bike station?",
      "nl": "Welke functies biedt dit fietspunt?",
      "fr": "Quels services sont valables à cette station vélo?",
      "gl": "Que servizos están dispoñíbeis nesta estación de bicicletas?",
      "de": "Welche Einrichtungen stehen an dieser Fahrradstation zur Verfügung?"
    },
    "mappings": [{
      "if": {
        "and": ["service:bicycle:tools=no", "service:bicycle:pump=yes"]
      },
      "then": {
        "en": "There is only a pump present",
        "nl": "Er is enkel een pomp aanwezig",
        "fr": "Il y a seulement une pompe",
        "gl": "Só hai unha bomba de ar presente",
        "de": "Es ist nur eine Pumpe vorhanden"
      }
    }, {
      "if": {
        "and": ["service:bicycle:tools=yes", "service:bicycle:pump=no"]
      },
      "then": {
        "en": "There are only tools (screwdrivers, pliers...) present",
        "nl": "Er is enkel gereedschap aanwezig (schroevendraaier, tang...)",
        "fr": "Il y a seulement des outils (tournevis, pinces...)",
        "gl": "Só hai ferramentas (desaparafusadores, alicates...) presentes",
        "de": "Es sind nur Werkzeuge (Schraubenzieher, Zangen...) vorhanden"
      }
    }, {
      "if": {
        "and": ["service:bicycle:tools=yes", "service:bicycle:pump=yes"]
      },
      "then": {
        "en": "There are both tools and a pump present",
        "nl": "Er is zowel een pomp als gereedschap aanwezig",
        "fr": "IL y a des outils et une pompe",
        "gl": "Hai ferramentas e unha bomba de ar presentes",
        "de": "Es sind sowohl Werkzeuge als auch eine Pumpe vorhanden"
      }
    }]
  }, {
    "question": {
      "en": "Does this bike repair station have a special tool to repair your bike chain?",
      "nl": "Heeft dit herstelpunt een speciale reparatieset voor je ketting?",
      "fr": "Est-ce que cette station vélo a un outils specifique pour réparer la chaîne du velo?",
      "gl": "Esta estación de arranxo de bicicletas ten unha ferramenta especial para arranxar a cadea da túa bicicleta?",
      "de": "Verfügt diese Fahrrad-Reparaturstation über Spezialwerkzeug zur Reparatur von Fahrradketten?"
    },
    "condition": "service:bicycle:tools=yes",
    "mappings": [{
      "if": "service:bicycle:chain_tool=yes",
      "then": {
        "en": "There is a chain tool",
        "nl": "Er is een reparatieset voor je ketting",
        "fr": "Il y a un outil pour réparer la chaine",
        "gl": "Hai unha ferramenta para a cadea",
        "de": "Es gibt ein Kettenwerkzeug"
      }
    }, {
      "if": "service:bicycle:chain_tool=no",
      "then": {
        "en": "There is no chain tool",
        "nl": "Er is geen reparatieset voor je ketting",
        "fr": "Il n'y a pas d'outil pour réparer la chaine",
        "gl": "Non hai unha ferramenta para a cadea",
        "de": "Es gibt kein Kettenwerkzeug"
      }
    }]
  }, {
    "question": {
      "en": "Does this bike station have a hook to suspend your bike with or a stand to elevate it?",
      "nl": "Heeft dit herstelpunt een haak of standaard om je fiets op te hangen/zetten?",
      "fr": "Est-ce que cette station vélo à un crochet pour suspendre son velo ou une accroche pour l'élevé?",
      "gl": "Esta estación de bicicletas ten un guindastre para pendurar a túa bicicleta ou un soporte para elevala?",
      "de": "Hat diese Fahrradstation einen Haken, an dem Sie Ihr Fahrrad aufhängen können, oder einen Ständer, um es anzuheben?"
    },
    "condition": "service:bicycle:tools=yes",
    "mappings": [{
      "if": "service:bicycle:stand=yes",
      "then": {
        "en": "There is a hook or stand",
        "nl": "Er is een haak of standaard",
        "fr": "Il y a un crochet ou une accroche",
        "gl": "Hai un guindastre ou soporte",
        "de": "Es gibt einen Haken oder Ständer"
      }
    }, {
      "if": "service:bicycle:stand=no",
      "then": {
        "en": "There is no hook or stand",
        "nl": "Er is geen haak of standaard",
        "fr": "Il n'y pas de crochet ou d'accroche",
        "gl": "Non hai un guindastre ou soporte",
        "de": "Es gibt keinen Haken oder Ständer"
      }
    }]
  }, {
    "question": {
      "en": "Is the bike pump still operational?",
      "nl": "Werkt de fietspomp nog?",
      "fr": "Est-ce que cette pompe marche t'elle toujours?",
      "gl": "Segue a funcionar a bomba de ar?",
      "de": "Ist die Fahrradpumpe noch funktionstüchtig?"
    },
    "condition": "service:bicycle:pump=yes",
    "mappings": [{
      "if": "service:bicycle:pump:operational_status=broken",
      "then": {
        "en": "The bike pump is broken",
        "nl": "De fietspomp is kapot",
        "fr": "La pompe est cassé",
        "gl": "A bomba de ar está estragada",
        "de": "Die Fahrradpumpe ist kaputt"
      }
    }, {
      "if": "service:bicycle:pump:operational_status=",
      "then": {
        "en": "The bike pump is operational",
        "nl": "De fietspomp werkt nog",
        "fr": "La pompe est opérationnelle",
        "gl": "A bomba de ar está operativa",
        "de": "Die Fahrradpumpe ist betriebsbereit"
      }
    }]
  }, {
    "question": {
      "en": "What valves are supported?",
      "nl": "Welke ventielen werken er met de pomp?",
      "fr": "Quelles valves sont compatibles?",
      "gl": "Que válvulas son compatíbeis?",
      "de": "Welche Ventile werden unterstützt?"
    },
    "render": {
      "en": "This pump supports the following valves: {valves}",
      "nl": "Deze pomp werkt met de volgende ventielen: {valves}",
      "fr": "Cette pompe est compatible avec les valves suivantes: {valves}",
      "gl": "Esta bomba de ar admite as seguintes válvulas: {valves}",
      "de": "Diese Pumpe unterstützt die folgenden Ventile: {valves}"
    },
    "freeform": {
      "#addExtraTags": ["fixme=Freeform 'valves'-tag used: possibly a wrong value"],
      "key": "valves"
    },
    "multiAnswer": true,
    "mappings": [{
      "if": "valves=sclaverand",
      "then": {
        "en": "Sclaverand (also known as Presta)",
        "nl": "Sclaverand (ook gekend als Presta)",
        "fr": "Sclaverand (aussi appelé Presta)",
        "gl": "Sclaverand (tamén coñecido como Presta)",
        "de": "Sklaverand (auch bekannt als Presta)"
      }
    }, {
      "if": "valves=dunlop",
      "then": {
        "en": "Dunlop",
        "nl": "Dunlop",
        "fr": "Dunlop",
        "gl": "Dunlop",
        "de": "Dunlop"
      }
    }, {
      "if": "valves=schrader",
      "then": {
        "en": "Schrader (cars)",
        "nl": "Schrader (auto's)",
        "fr": "Schrader (les valves de voitures)",
        "gl": "Schrader (para automóbiles)",
        "de": "Schrader (Autos)"
      }
    }]
  }, {
    "question": {
      "en": "Is this an electric bike pump?",
      "nl": "Is dit een electrische fietspomp?",
      "fr": "Est-ce que cette pompe est électrique?",
      "gl": "Esta é unha bomba de ar eléctrica?",
      "de": "Ist dies eine elektrische Fahrradpumpe?"
    },
    "condition": "service:bicycle:pump=yes",
    "mappings": [{
      "if": "manual=yes",
      "then": {
        "en": "Manual pump",
        "nl": "Manuele pomp",
        "fr": "Pompe manuelle",
        "gl": "Bomba de ar manual",
        "de": "Manuelle Pumpe"
      }
    }, {
      "if": "manual=no",
      "then": {
        "en": "Electrical pump",
        "nl": "Electrische pomp",
        "fr": "Pompe électrique",
        "gl": "Bomba de ar eléctrica",
        "de": "Elektrische Pumpe"
      }
    }]
  }, {
    "question": {
      "en": "Does the pump have a pressure indicator or manometer?",
      "nl": "Heeft deze pomp een luchtdrukmeter?",
      "fr": "Est-ce que la pompe à un manomètre integré?",
      "gl": "Ten a bomba de ar un indicador de presión ou un manómetro?",
      "de": "Verfügt die Pumpe über einen Druckanzeiger oder ein Manometer?"
    },
    "condition": "service:bicycle:pump=yes",
    "mappings": [{
      "if": "manometer=yes",
      "then": {
        "en": "There is a manometer",
        "nl": "Er is een luchtdrukmeter",
        "fr": "Il y a un manomètre",
        "gl": "Hai manómetro",
        "de": "Es gibt ein Manometer"
      }
    }, {
      "if": "manometer=no",
      "then": {
        "en": "There is no manometer",
        "nl": "Er is geen luchtdrukmeter",
        "fr": "Il n'y a pas de manomètre",
        "gl": "Non hai manómetro",
        "de": "Es gibt kein Manometer"
      }
    }, {
      "if": "manometer=broken",
      "then": {
        "en": "There is manometer but it is broken",
        "nl": "Er is een luchtdrukmeter maar die is momenteel defect",
        "fr": "Il y a un manomètre mais il est cassé",
        "gl": "Hai manómetro pero está estragado",
        "de": "Es gibt ein Manometer, aber es ist kaputt"
      }
    }]
  }],
  "icon": {
    "render": {
      "en": "./assets/layers/bike_repair_station/repair_station.svg"
    },
    "mappings": [{
      "if": {
        "and": ["service:bicycle:pump=no", "service:bicycle:pump:operational_status=broken"]
      },
      "then": "./assets/layers/bike_repair_station/repair_station.svg"
    }, {
      "if": {
        "and": ["service:bicycle:pump=yes", "service:bicycle:tools=yes"]
      },
      "then": "./assets/layers/bike_repair_station/repair_station_pump.svg"
    }, {
      "if": {
        "and": ["service:bicycle:pump:operational_status=broken", "service:bicycle:tools=no"]
      },
      "then": "./assets/layers/bike_repair_station/broken_pump_2.svg"
    }, {
      "if": {
        "and": ["service:bicycle:pump=yes", {
          "or": ["service:bicycle:tools=no", "service:bicycle:tools="]
        }]
      },
      "then": "./assets/layers/bike_repair_station/pump.svg"
    }]
  },
  "iconSize": {
    "render": {
      "en": "50,50,bottom"
    }
  },
  "color": {
    "render": {
      "en": "#00f"
    }
  },
  "width": {
    "render": {
      "en": "1"
    }
  },
  "wayHandling": 2,
  "presets": [{
    "title": {
      "en": "Bike pump",
      "nl": "Fietspomp",
      "fr": "Pompe à vélo",
      "gl": "Bomba de ar",
      "de": "Fahrradpumpe"
    },
    "tags": ["amenity=bicycle_repair_station", "service:bicycle:tools=no", "service:bicycle:pump=yes"]
  }, {
    "title": {
      "en": "Bike repair station and pump",
      "nl": "Herstelpunt en pomp",
      "fr": "Point de réparation vélo avec pompe",
      "gl": "Estación de arranxo de bicicletas con bomba de ar",
      "de": "Fahrrad-Reparaturstation und Pumpe"
    },
    "tags": ["amenity=bicycle_repair_station", "service:bicycle:tools=yes", "service:bicycle:pump=yes"]
  }, {
    "title": {
      "en": "Bike repair station without pump",
      "nl": "Herstelpunt zonder pomp",
      "fr": "Point de réparation vélo sans pompe",
      "gl": "Estación de arranxo de bicicletas sin bomba de ar",
      "de": "Fahrrad-Reparaturstation ohne Pumpe"
    },
    "tags": ["amenity=bicycle_repair_station", "service:bicycle:tools=yes", "service:bicycle:pump=no"]
  }]
};
},{}],"assets/layers/bird_hide/birdhides.json":[function(require,module,exports) {
module.exports = {
  "id": "birdhides",
  "name": {
    "nl": "Vogelkijkhutten"
  },
  "minzoom": 14,
  "overpassTags": {
    "and": ["leisure=bird_hide"]
  },
  "title": {
    "render": {
      "nl": "Vogelkijkplaats"
    },
    "mappings": [{
      "if": {
        "and": ["name~((V|v)ogel.*).*"]
      },
      "then": {
        "nl": "{name}"
      }
    }, {
      "if": {
        "and": ["name~*", {
          "or": ["building!~no", "shelter=yes"]
        }]
      },
      "then": {
        "nl": "Vogelkijkhut {name}"
      }
    }, {
      "if": {
        "and": ["name~*"]
      },
      "then": {
        "nl": "Vogelkijkwand {name}"
      }
    }]
  },
  "description": {
    "nl": "Een vogelkijkhut"
  },
  "tagRenderings": [{
    "question": {
      "nl": "Is dit een kijkwand of kijkhut?"
    },
    "mappings": [{
      "if": {
        "and": ["shelter=no", "building=", "amenity="]
      },
      "then": {
        "nl": "Vogelkijkwand"
      }
    }, {
      "if": {
        "and": ["amenity=shelter", "building=yes", "shelter=yes"]
      },
      "then": {
        "nl": "Vogelkijkhut"
      }
    }, {
      "if": {
        "or": ["amenity=shelter", "building=yes", "shelter=yes"]
      },
      "then": {
        "nl": "Vogelkijkhut"
      },
      "hideInAnswer": true
    }]
  }, {
    "question": {
      "nl": "Is deze vogelkijkplaats rolstoeltoegankelijk?"
    },
    "mappings": [{
      "if": {
        "and": ["wheelchair=designated"]
      },
      "then": {
        "nl": "Er zijn speciale voorzieningen voor rolstoelen"
      }
    }, {
      "if": {
        "and": ["wheelchair=yes"]
      },
      "then": {
        "nl": "Een rolstoel raakt er vlot"
      }
    }, {
      "if": {
        "and": ["wheelchair=limited"]
      },
      "then": {
        "nl": "Je kan er raken met een rolstoel, maar het is niet makkelijk"
      }
    }, {
      "if": {
        "and": ["wheelchair=no"]
      },
      "then": {
        "nl": "Niet rolstoeltoegankelijk"
      }
    }]
  }, {
    "render": {
      "nl": "Beheer door {operator}"
    },
    "freeform": {
      "key": "operator"
    },
    "question": {
      "nl": "Wie beheert deze vogelkijkplaats?"
    },
    "mappings": [{
      "if": "operator=Natuurpunt",
      "then": {
        "nl": "Beheer door Natuurpunt"
      }
    }, {
      "if": "operator=Agentschap Natuur en Bos",
      "then": {
        "nl": "Beheer door het Agentschap Natuur en Bos "
      }
    }]
  }],
  "icon": {
    "render": {
      "nl": "./assets/layers/bird_hide/birdhide.svg"
    },
    "mappings": [{
      "if": {
        "or": ["building=yes", "shelter=yes", "amenity=shelter"]
      },
      "then": "./assets/layers/bird_hide/birdshelter.svg"
    }]
  },
  "size": {
    "question": {},
    "freeform": {
      "addExtraTags": []
    },
    "render": {
      "nl": "40,40,center"
    },
    "mappings": []
  },
  "color": {
    "render": {
      "nl": "#94bb28"
    }
  },
  "stroke": {
    "render": {
      "nl": "3"
    }
  },
  "presets": [{
    "tags": ["leisure=bird_hide", "building=yes", "shelter=yes", "amenity=shelter"],
    "title": {
      "nl": "Vogelkijkhut"
    },
    "description": {
      "nl": "Een overdekte hut waarbinnen er warm en droog naar vogels gekeken kan worden"
    }
  }, {
    "tags": ["leisure=bird_hide", "building=no", "shelter=no"],
    "title": {
      "nl": "Vogelkijkwand"
    },
    "description": {
      "nl": "Een vogelkijkwand waarachter men kan staan om vogels te kijken"
    }
  }],
  "wayHandling": 2
};
},{}],"assets/layers/nature_reserve/nature_reserve.json":[function(require,module,exports) {
module.exports = {
  "id": "nature_reserves",
  "name": {
    "nl": "Natuurgebied"
  },
  "minzoom": 12,
  "overpassTags": {
    "or": ["leisure=nature_reserve", "boundary=protected_area"]
  },
  "title": {
    "render": {
      "nl": "Natuurgebied"
    },
    "mappings": [{
      "if": {
        "and": ["name:nl~"]
      },
      "then": {
        "nl": "{name:nl}"
      }
    }, {
      "if": {
        "and": ["name~*"]
      },
      "then": {
        "nl": "{name}"
      }
    }]
  },
  "description": {
    "nl": "Een natuurgebied is een gebied waar actief ruimte gemaakt word voor de natuur. Typisch zijn deze in beheer van Natuurpunt of het Agentschap Natuur en Bos of zijn deze erkend door de overheid."
  },
  "tagRenderings": [{
    "#": "Access tag",
    "render": {
      "nl": "De toegankelijkheid van dit gebied is: {access:description}"
    },
    "question": {
      "nl": "Is dit gebied toegankelijk?"
    },
    "freeform": {
      "key": "access:description"
    },
    "mappings": [{
      "if": {
        "and": ["access=yes", "fee="]
      },
      "then": {
        "nl": "Vrij toegankelijk"
      }
    }, {
      "if": {
        "and": ["access=no", "fee="]
      },
      "then": {
        "nl": "Niet toegankelijk"
      }
    }, {
      "if": {
        "and": ["access=private", "fee="]
      },
      "then": {
        "nl": "Niet toegankelijk, want privégebied"
      }
    }, {
      "if": {
        "and": ["access=permissive", "fee="]
      },
      "then": {
        "nl": "Toegankelijk, ondanks dat het privegebied is"
      }
    }, {
      "if": {
        "and": ["access=guided", "fee="]
      },
      "then": {
        "nl": "Enkel toegankelijk met een gids of tijdens een activiteit"
      }
    }, {
      "if": {
        "and": ["access=yes", "fee=yes"]
      },
      "then": {
        "nl": "Toegankelijk mits betaling"
      }
    }]
  }, {
    "#": "Operator tag",
    "render": {
      "nl": "Beheer door {operator}"
    },
    "question": {
      "nl": "Wie beheert dit gebied?"
    },
    "freeform": {
      "key": "operator"
    },
    "mappings": [{
      "if": {
        "and": ["operator=Natuurpunt"]
      },
      "then": {
        "nl": "<img src=\"./assets/themes/buurtnatuur/Natuurpunt.jpg\" style=\"width:1.5em\">Dit gebied wordt beheerd door Natuurpunt"
      }
    }, {
      "if": {
        "and": ["operator~(n|N)atuurpunt.*"]
      },
      "then": {
        "nl": "<img src=\"./assets/themes/buurtnatuur/Natuurpunt.jpg\" style=\"width:1.5em\">Dit gebied wordt beheerd door {operator}"
      },
      "hideInAnswer": true
    }, {
      "if": {
        "and": ["operator=Agentschap Natuur en Bos"]
      },
      "then": {
        "nl": "<img src=\"./assets/themes/buurtnatuur/ANB.jpg\" style=\"width:1.5em\">Dit gebied wordt beheerd door het Agentschap Natuur en Bos"
      }
    }]
  }, {
    "#": "Name:nl-tag",
    "render": {
      "nl": "Dit gebied heet {name:nl}"
    },
    "question": {
      "nl": "Wat is de Nederlandstalige naam van dit gebied?"
    },
    "freeform": {
      "key": "name:nl"
    },
    "condition": {
      "and": ["name:nl~*"]
    }
  }, {
    "#": "Name tag",
    "render": {
      "nl": "Dit gebied heet {name}"
    },
    "question": {
      "nl": "Wat is de naam van dit gebied?"
    },
    "freeform": {
      "key": "name",
      "addExtraTags": ["noname="]
    },
    "condition": {
      "and": ["name:nl="]
    },
    "mappings": [{
      "if": {
        "and": ["noname=yes", "name="]
      },
      "then": {
        "nl": "Dit gebied heeft geen naam"
      }
    }]
  }, {
    "#": "Dogs?",
    "question": {
      "nl": "Zijn honden toegelaten in dit gebied?",
      "en": "Are dogs allowed in this nature reserve?"
    },
    "condition": {
      "or": ["access=yes", "access=permissive", "access=guided"]
    },
    "mappings": [{
      "if": "dog=leashed",
      "then": {
        "nl": "Honden moeten aan de leiband",
        "en": "Dogs have to be leashed"
      }
    }, {
      "if": "dog=no",
      "then": {
        "nl": "Honden zijn niet toegestaan",
        "en": "No dogs allowed"
      }
    }, {
      "if": "dog=yes",
      "then": {
        "nl": "Honden zijn welkom en mogen vrij rondlopen",
        "en": "Dogs are allowed to roam freely"
      }
    }]
  }, {
    "#": "Website",
    "question": {
      "en": "On which webpage can one find more information about this nature reserve?",
      "nl": "Op welke webpagina kan men meer informatie vinden over dit natuurgebied?"
    },
    "render": "<a href='{website}'target='_blank'>{website}</a>",
    "freeform": {
      "key": "website",
      "type": "url"
    }
  }, {
    "#": "Curator",
    "question": {
      "nl": "Wie is de conservator van dit gebied?<br/><span class='subtle'>Respecteer privacy - geef deze naam enkel als die duidelijk is gepubliceerd",
      "en": "Whom is the curator of this nature reserve?<br/><span class='subtle'>Respect privacy - only fill out a name if this is widely published"
    },
    "render": {
      "nl": "{curator} is de beheerder van dit gebied",
      "en": "{curator} is the curator of this nature reserve"
    },
    "freeform": {
      "key": "curator"
    }
  }, {
    "#": "Email",
    "question": {
      "nl": "Waar kan men naartoe emailen voor vragen en meldingen van dit natuurgebied?<br/><span class='subtle'>Respecteer privacy - geef enkel persoonlijke emailadressen als deze elders zijn gepubliceerd",
      "en": "What email adress can one send to with questions and problems with this nature reserve?<br/><span class='subtle'>Respect privacy - only fill out a personal email address if this is widely published"
    },
    "render": {
      "nl": "<a href='mailto:{email}' target='_blank'>{email}</a>",
      "en": "<a href='mailto:{email}' target='_blank'>{email}</a>"
    },
    "freeform": {
      "key": "email",
      "type": "email"
    }
  }, {
    "#": "phone",
    "question": {
      "nl": "Waar kan men naartoe bellen voor vragen en meldingen van dit natuurgebied?<br/><span class='subtle'>Respecteer privacy - geef enkel persoonlijke telefoonnummers als deze elders zijn gepubliceerd",
      "en": "What phone number can one call to with questions and problems with this nature reserve?<br/><span class='subtle'>Respect privacy - only fill out a personal phone number address if this is widely published"
    },
    "render": {
      "nl": "<a href='tel:{email}' target='_blank'>{phone}</a>",
      "en": "<a href='tel:{email}' target='_blank'>{phone}</a>"
    },
    "freeform": {
      "key": "phone",
      "type": "phone"
    }
  }, {
    "#": "Non-editable description {description}",
    "render": {
      "nl": "Extra info: <i>{description}</i>"
    },
    "freeform": {
      "key": "description"
    }
  }, {
    "#": "Editable description {description:0}",
    "question": "Is er extra info die je kwijt wil?",
    "render": {
      "nl": "Extra info: <i>{description:0}</i>"
    },
    "freeform": {
      "key": "description:0"
    }
  }],
  "hideUnderlayingFeaturesMinPercentage": 10,
  "icon": {
    "render": "./assets/themes/buurtnatuur/nature_reserve.svg"
  },
  "width": {
    "render": "5"
  },
  "iconSize": {
    "render": "50,50,center"
  },
  "color": {
    "render": "#3c3"
  },
  "presets": [{
    "tags": ["leisure=nature_reserve", "fixme=Toegevoegd met MapComplete, geometry nog uit te tekenen"],
    "title": {
      "nl": "Natuurreservaat"
    },
    "description": {
      "nl": "Voeg een ontbrekend, erkend natuurreservaat toe, bv. een gebied dat beheerd wordt door het ANB of natuurpunt"
    }
  }]
};
},{}],"assets/layers/bike_cafe/bike_cafes.json":[function(require,module,exports) {
module.exports = {
  "id": "bike_cafes",
  "name": {
    "en": "Bike cafe",
    "nl": "Fietscafé",
    "fr": "Café vélo",
    "gl": "Café de ciclistas",
    "de": "Fahrrad-Café"
  },
  "minzoom": 13,
  "overpassTags": {
    "and": ["amenity~pub|bar|cafe|restaurant", {
      "#": "Note the double tilde in 'service:bicycle' which interprets the key as regex too",
      "or": ["pub~cycling|bicycle", "theme~cycling|bicycle", "service:bicycle:.*~~*"]
    }]
  },
  "title": {
    "render": {
      "en": "Bike cafe",
      "nl": "Fietscafé",
      "fr": "Café Vélo",
      "gl": "Café de ciclistas",
      "de": "Fahrrad-Café"
    },
    "mappings": [{
      "if": "name~*",
      "then": {
        "en": "Bike cafe <i>{name}</i>",
        "nl": "Fietscafé <i>{name}</i>",
        "fr": "Café Vélo <i>{name}</i>",
        "gl": "Café de ciclistas <i>{name}</i>",
        "de": "Fahrrad-Café <i>{name}</i>"
      }
    }]
  },
  "description": {},
  "tagRenderings": [{
    "question": {
      "en": "What is the name of this bike cafe?",
      "nl": "Wat is de naam van dit fietscafé?",
      "fr": "Quel est le nom de ce Café vélo",
      "gl": "Cal é o nome deste café de ciclistas?",
      "de": "Wie heißt dieses Fahrrad-Café?"
    },
    "render": {
      "en": "This bike cafe is called {name}",
      "nl": "Dit fietscafé heet {name}",
      "fr": "Ce Café vélo s'appelle {name}",
      "gl": "Este café de ciclistas chámase {name}",
      "de": "Dieses Fahrrad-Café heißt {name}"
    },
    "freeform": {
      "key": "name"
    }
  }, {
    "question": {
      "en": "Does this bike cafe offer a bike pump for use by anyone?",
      "nl": "Biedt dit fietscafé een fietspomp aan voor iedereen?",
      "fr": "Est-ce que ce Café vélo propose une pompe en libre accès",
      "gl": "Este café de ciclistas ofrece unha bomba de ar para que calquera persoa poida usala?",
      "de": "Bietet dieses Fahrrad-Café eine Fahrradpumpe an, die von jedem benutzt werden kann?"
    },
    "mappings": [{
      "if": "service:bicycle:pump=yes",
      "then": {
        "en": "This bike cafe offers a bike pump for anyone",
        "nl": "Dit fietscafé biedt een fietspomp aan voor eender wie",
        "fr": "Ce Café vélo offre une pompe en libre accès",
        "gl": "Este café de ciclistas ofrece unha bomba de ar",
        "de": "Dieses Fahrrad-Café bietet eine Fahrradpumpe an, die von jedem benutzt werden kann"
      }
    }, {
      "if": "service:bicycle:pump=no",
      "then": {
        "en": "This bike cafe doesn't offer a bike pump for anyone",
        "nl": "Dit fietscafé biedt geen fietspomp aan voor iedereen",
        "fr": "Ce Café vélo n'offre pas de pompe en libre accès",
        "gl": "Este café de ciclistas non ofrece unha bomba de ar",
        "de": "Dieses Fahrrad-Café bietet keine Fahrradpumpe an, die von jedem benutzt werden kann"
      }
    }]
  }, {
    "question": {
      "en": "Are there tools here to repair your own bike?",
      "nl": "Biedt dit fietscafé gereedschap aan om je fiets zelf te herstellen?",
      "fr": "Est-ce qu'il y a des outils pour réparer soi-même son vélo?",
      "gl": "Hai ferramentas aquí para arranxar a túa propia bicicleta?",
      "de": "Gibt es hier Werkzeuge, um das eigene Fahrrad zu reparieren?"
    },
    "mappings": [{
      "if": "service:bicycle:diy=yes",
      "then": {
        "en": "This bike cafe offers tools for DIY repair",
        "nl": "Dit fietscafé biedt gereedschap aan om je fiets zelf te herstellen",
        "fr": "Ce Café vélo propose des outils pour réparer son vélo soi-même",
        "gl": "Hai ferramentas aquí para arranxar a túa propia bicicleta",
        "de": "Dieses Fahrrad-Café bietet Werkzeuge für die selbständige Reparatur an."
      }
    }, {
      "if": "service:bicycle:diy=no",
      "then": {
        "en": "This bike cafe doesn't offer tools for DIY repair",
        "nl": "Dit fietscafé biedt geen gereedschap aan om je fiets zelf te herstellen",
        "fr": "Ce Café vélo ne propose pas d'outils pour réparer son vélo soi-même",
        "gl": "Non hai ferramentas aquí para arranxar a túa propia bicicleta",
        "de": "Dieses Fahrrad-Café bietet keine Werkzeuge für die selbständige Reparatur an."
      }
    }]
  }, {
    "question": {
      "en": "Does this bike cafe repair bikes?",
      "nl": "Herstelt dit fietscafé fietsen?",
      "fr": "Est-ce que ce Café vélo répare les vélos?",
      "gl": "Este café de ciclistas arranxa bicicletas?",
      "de": "Repariert dieses Fahrrad-Café Fahrräder?"
    },
    "mappings": [{
      "if": "service:bicycle:repair=yes",
      "then": {
        "en": "This bike cafe repairs bikes",
        "nl": "Dit fietscafé herstelt fietsen",
        "fr": "Ce Café vélo répare les vélos",
        "gl": "Este café de ciclistas arranxa bicicletas",
        "de": "Dieses Fahrrad-Café repariert Fahrräder"
      }
    }, {
      "if": "service:bicycle:repair=no",
      "then": {
        "en": "This bike cafe doesn't repair bikes",
        "nl": "Dit fietscafé herstelt geen fietsen",
        "fr": "Ce Café vélo ne répare pas les vélos",
        "gl": "Este café de ciclistas non arranxa bicicletas",
        "de": "Dieses Fahrrad-Café repariert keine Fahrräder"
      }
    }]
  }, {
    "question": {
      "en": "What is the website of {name}?",
      "nl": "Wat is de website van {name}?",
      "fr": "Quel est le site internet de {name}?",
      "gl": "Cal é a páxina web de {name}?",
      "de": "Was ist die Webseite von {name}?"
    },
    "render": "<a href='{website}' target='_blank'>{website}</a>",
    "freeform": {
      "key": "website"
    }
  }, {
    "question": {
      "en": "What is the phone number of {name}?",
      "nl": "Wat is het telefoonnummer van {name}?",
      "fr": "Quel est le nom de {name}?",
      "gl": "Cal é o número de teléfono de {name}?",
      "de": "Wie lautet die Telefonnummer von {name}?"
    },
    "render": "<a href='tel:{phone}'>{phone}</a>",
    "freeform": {
      "key": "phone",
      "type": "phone"
    }
  }, {
    "question": {
      "en": "What is the email address of {name}?",
      "nl": "Wat is het email-adres van {name}?",
      "fr": "Quel est l'adresse email de {name}?",
      "gl": "Cal é o enderezo de correo electrónico de {name}?",
      "de": "Wie lautet die E-Mail-Adresse von {name}?"
    },
    "render": "<a href='mailto:{email}' target='_blank'>{email}</a>",
    "freeform": {
      "key": "email",
      "type": "email"
    }
  }],
  "hideUnderlayingFeaturesMinPercentage": 0,
  "icon": {
    "render": "./assets/layers/bike_cafe/bike_cafe.svg"
  },
  "width": {
    "render": "2"
  },
  "iconSize": {
    "render": "50,50,bottom"
  },
  "color": {
    "render": "#694E2D"
  },
  "presets": [{
    "title": {
      "en": "Bike cafe",
      "nl": "Fietscafé",
      "fr": "Café Vélo",
      "gl": "Café de ciclistas",
      "de": "Fahrrad-Café"
    },
    "tags": ["amenity=pub", "pub=cycling"]
  }],
  "wayHandling": 2
};
},{}],"assets/layers/cycling_themed_object/cycling_themed_objects.json":[function(require,module,exports) {
module.exports = {
  "id": "bike_themed_object",
  "name": {
    "en": "Bike related object",
    "nl": "Fietsgerelateerd object",
    "fr": "Objet cycliste",
    "de": "Mit Fahrrad zusammenhängendes Objekt"
  },
  "minzoom": 13,
  "overpassTags": "theme~cycling|bicycle",
  "title": {
    "render": {
      "en": "Bike related object",
      "nl": "Fietsgerelateerd object",
      "fr": "Objet cycliste",
      "de": "Mit Fahrrad zusammenhängendes Objekt"
    },
    "mappings": [{
      "if": "name~*",
      "then": {
        "en": "<i>{name}</i>",
        "nl": "<i>{name}</i>",
        "fr": "<i>{name}</i>",
        "gl": "<i>{name}</i>",
        "de": "<i>{name}</i>"
      }
    }]
  },
  "description": {},
  "tagRenderings": [{
    "render": "<a href='{website}' target='_blank'>{website}</a>",
    "freeform": {
      "key": "website"
    }
  }, {
    "render": "<a href='tel:{phone}'>{phone}</a>",
    "freeform": {
      "key": "phone"
    }
  }, {
    "render": "<a href='mailto:{email}' target='_blank'>{email}</a>",
    "freeform": {
      "key": "email"
    }
  }],
  "hideUnderlayingFeaturesMinPercentage": 0,
  "icon": {
    "render": "./assets/layers/cycling_themed_object/other_services.svg"
  },
  "width": {
    "render": "2"
  },
  "iconSize": {
    "render": "50,50,bottom"
  },
  "color": {
    "render": "#AB76D5"
  },
  "presets": [],
  "wayHandling": 2
};
},{}],"assets/layers/bike_shop/bike_shop.json":[function(require,module,exports) {
module.exports = {
  "id": "bike_shops",
  "name": {
    "en": "Bike repair/shop",
    "nl": "Fietszaak",
    "fr": "Magasin ou réparateur de vélo",
    "gl": "Tenda/arranxo de bicicletas",
    "de": "Fahrradwerkstatt/geschäft"
  },
  "minzoom": 13,
  "overpassTags": {
    "#": "We select all bicycle shops, sport shops (but we try to weed out non-bicycle related shops), and any shop with a bicycle related tag",
    "or": ["shop=bicycle", {
      "#": "if sport is defined and is not bicycle, it is retrackted; if bicycle retail/repair is marked as 'no', it is retracted too.",
      "##": "There will be a few false-positives with this. They will get filtered out by people marking both 'not selling bikes' and 'not repairing bikes'. Furthermore, the OSMers will add a sports-subcategory on it",
      "and": ["shop=sports", "service:bicycle:retail!=no", "service:bicycle:repair!=no", {
        "or": ["sport=bicycle", "sport=cycling", "sport="]
      }]
    }, {
      "#": "Any shop with any bicycle service",
      "and": ["shop~*", "service:bicycle:.*~~.*"]
    }]
  },
  "title": {
    "render": {
      "en": "Bike repair/shop",
      "nl": "Fietszaak",
      "fr": "Magasin ou réparateur de vélo",
      "gl": "Tenda/arranxo de bicicletas",
      "de": "Fahrradwerkstatt/geschäft"
    },
    "mappings": [{
      "if": {
        "and": ["shop=sports", "name~*"]
      },
      "then": {
        "en": "Sport gear shop <i>{name}</i>",
        "nl": "Sportwinkel <i>{name}</i>",
        "fr": "Magasin de sport <i>{name}</i>"
      }
    }, {
      "if": "shop=sports",
      "then": {
        "en": "Sport gear shop",
        "nl": "Sportwinkel",
        "fr": "Magasin de sport"
      }
    }, {
      "if": "shop!~bicycle",
      "then": "Other shop"
    }, {
      "if": {
        "and": ["name~*", "service:bicycle:retail!~yes", "service:bicycle:repair!~no"]
      },
      "then": {
        "en": "Bike repair <i>{name}</i>",
        "nl": "Fietsenmaker <i>{name}</i>",
        "fr": "Réparateur de vélo <i>{name}</i>",
        "gl": "Arranxo de bicicletas <i>{name}</i>",
        "de": "Fahrradwerkstatt <i>{name}</i>"
      }
    }, {
      "if": {
        "and": ["service:bicycle:retail!~yes", "service:bicycle:repair!~no"]
      },
      "then": {
        "en": "Bike repair",
        "nl": "Fietsenmaker",
        "fr": "Réparateur de vélo",
        "gl": "Arranxo de bicicletas",
        "de": "Fahrradwerkstatt"
      }
    }, {
      "if": {
        "and": ["name~*", "service:bicycle:repair!~yes"]
      },
      "then": {
        "en": "Bike shop <i>{name}</i>",
        "nl": "Fietswinkel <i>{name}</i>",
        "fr": "Magasin de vélo <i>{name}</i>",
        "gl": "Tenda de bicicletas <i>{name}</i>",
        "de": "Fahrradgeschäft <i>{name}</i>"
      }
    }, {
      "if": "service:bicycle:repair!~yes",
      "then": {
        "en": "Bike shop",
        "nl": "Fietswinkel",
        "fr": "Magasin de vélo",
        "gl": "Tenda de bicicletas",
        "de": "Fahrradgeschäft"
      }
    }, {
      "if": "name~*",
      "then": {
        "en": "Bike repair/shop <i>{name}</i>",
        "nl": "Fietszaak <i>{name}</i>",
        "fr": "Magasin ou réparateur de vélo <i>{name}</i>",
        "gl": "Tenda/arranxo de bicicletas <i>{name}</i>",
        "de": "Fahrradwerkstatt/geschäft <i>{name}</i>"
      }
    }]
  },
  "description": {
    "en": "A shop specifically selling bicycles or related items",
    "nl": "Een winkel die hoofdzakelijk fietsen en fietstoebehoren verkoopt"
  },
  "tagRenderings": ["images", {
    "condition": {
      "and": ["shop!~bicycle", "shop!~sports"]
    },
    "render": {
      "en": "This shop is specialized in selling {shop} and does bicycle related activities",
      "nl": "Deze winkel verkoopt {shop} en heeft fiets-gerelateerde activiteiten."
    }
  }, {
    "question": {
      "en": "What is the name of this bicycle shop?",
      "nl": "Wat is de naam van deze fietszaak?",
      "fr": "Quel est le nom du magasin de vélo?",
      "gl": "Cal é o nome desta tenda de bicicletas?",
      "de": "Wie heißt dieser Fahrradladen?"
    },
    "render": {
      "en": "This bicycle shop is called {name}",
      "nl": "Deze fietszaak heet {name}",
      "fr": "Ce magasin s'appelle {name}",
      "gl": "Esta tenda de bicicletas chámase {name}",
      "de": "Dieses Fahrradgeschäft heißt {name}"
    },
    "freeform": {
      "key": "name"
    }
  }, {
    "question": {
      "en": "What is the website of {name}?",
      "nl": "Wat is de website van {name}?",
      "fr": "Quel est le site internet de {name}?",
      "gl": "Cal é a páxina web de {name}?"
    },
    "render": "<a href='{website}' target='_blank'>{website}</a>",
    "freeform": {
      "key": "website"
    }
  }, {
    "question": {
      "en": "What is the phone number of {name}?",
      "nl": "Wat is het telefoonnummer van {name}?",
      "fr": "Quel est le nom de {name}?",
      "gl": "Cal é o número de teléfono de {name}?"
    },
    "render": "<a href='tel:{phone}'>{phone}</a>",
    "freeform": {
      "key": "phone",
      "type": "phone"
    }
  }, {
    "question": {
      "en": "What is the email address of {name}?",
      "nl": "Wat is het email-adres van {name}?",
      "fr": "Quel est l'adresse email de {name}?",
      "gl": "Cal é o enderezo de correo electrónico de {name}?"
    },
    "render": "<a href='mailto:{email}' target='_blank'>{email}</a>",
    "freeform": {
      "key": "email",
      "type": "email"
    }
  }, {
    "question": {
      "en": "Does this shop sell bikes?",
      "nl": "Verkoopt deze fietszaak fietsen?",
      "fr": "Est-ce que ce magasin vend des vélos?",
      "gl": "Esta tenda vende bicicletas?",
      "de": "Verkauft dieser Laden Fahrräder?"
    },
    "mappings": [{
      "if": "service:bicycle:retail=yes",
      "then": {
        "en": "This shop sells bikes",
        "nl": "Deze winkel verkoopt fietsen",
        "fr": "Ce magasin vend des vélos",
        "gl": "Esta tenda vende bicicletas",
        "de": "Dieses Geschäft verkauft Fahrräder"
      }
    }, {
      "if": "service:bicycle:retail=no",
      "then": {
        "en": "This shop doesn't sell bikes",
        "nl": "Deze winkel verkoopt geen fietsen",
        "fr": "Ce magasin ne vend pas de vélo",
        "gl": "Esta tenda non vende bicicletas",
        "de": "Dieses Geschäft verkauft keine Fahrräder"
      }
    }]
  }, {
    "question": {
      "en": "Does this shop repair bikes?",
      "nl": "Herstelt deze winkel fietsen?",
      "fr": "Est-ce que ce magasin répare des vélos?",
      "gl": "Esta tenda arranxa bicicletas?",
      "de": "Repariert dieses Geschäft Fahrräder?"
    },
    "mappings": [{
      "if": "service:bicycle:repair=yes",
      "then": {
        "en": "This shop repairs bikes",
        "nl": "Deze winkel herstelt fietsen",
        "fr": "Ce magasin répare des vélos",
        "gl": "Esta tenda arranxa bicicletas",
        "de": "Dieses Geschäft repariert Fahrräder"
      }
    }, {
      "if": "service:bicycle:repair=no",
      "then": {
        "en": "This shop doesn't repair bikes",
        "nl": "Deze winkel herstelt geen fietsen",
        "fr": "Ce magasin ne répare pas les vélos",
        "gl": "Esta tenda non arranxa bicicletas",
        "de": "Dieses Geschäft repariert keine Fahrräder"
      }
    }, {
      "if": "service:bicycle:repair=only_sold",
      "then": {
        "en": "This shop only repairs bikes bought here",
        "nl": "Deze winkel herstelt enkel fietsen die hier werden gekocht",
        "fr": "Ce magasin ne répare seulement les vélos achetés là-bas",
        "gl": "Esta tenda só arranxa bicicletas mercadas aquí",
        "de": "Dieses Geschäft repariert nur hier gekaufte Fahrräder"
      }
    }, {
      "if": "service:bicycle:repair=brand",
      "then": {
        "en": "This shop only repairs bikes of a certain brand",
        "nl": "Deze winkel herstelt enkel fietsen van een bepaald merk",
        "fr": "Ce magasin ne répare seulement des marques spécifiques",
        "gl": "Esta tenda só arranxa bicicletas dunha certa marca",
        "de": "Dieses Geschäft repariert nur Fahrräder einer bestimmten Marke"
      }
    }]
  }, {
    "question": {
      "en": "Does this shop rent out bikes?",
      "nl": "Verhuurt deze winkel fietsen?",
      "fr": "Est-ce ce magasin loue des vélos?",
      "gl": "Esta tenda aluga bicicletas?",
      "de": "Vermietet dieser Laden Fahrräder?"
    },
    "mappings": [{
      "if": "service:bicycle:rental=yes",
      "then": {
        "en": "This shop rents out bikes",
        "nl": "Deze winkel verhuurt fietsen",
        "fr": "Ce magasin loue des vélos",
        "gl": "Esta tenda aluga bicicletas",
        "de": "Dieses Geschäft vermietet Fahrräder"
      }
    }, {
      "if": "service:bicycle:rental=no",
      "then": {
        "en": "This shop doesn't rent out bikes",
        "nl": "Deze winkel verhuurt geen fietsen",
        "fr": "Ce magasin ne loue pas de vélos",
        "gl": "Esta tenda non aluga bicicletas",
        "de": "Dieses Geschäft vermietet keine Fahrräder"
      }
    }]
  }, {
    "question": {
      "en": "Does this shop sell second-hand bikes?",
      "nl": "Verkoopt deze winkel tweedehands fietsen?",
      "fr": "Est-ce ce magasin vend des vélos d'occasion",
      "gl": "Esta tenda vende bicicletas de segunda man?",
      "de": "Verkauft dieses Geschäft gebrauchte Fahrräder?"
    },
    "mappings": [{
      "if": "service:bicycle:second_hand=yes",
      "then": {
        "en": "This shop sells second-hand bikes",
        "nl": "Deze winkel verkoopt tweedehands fietsen",
        "fr": "Ce magasin vend des vélos d'occasion",
        "gl": "Esta tenda vende bicicletas de segunda man",
        "de": "Dieses Geschäft verkauft gebrauchte Fahrräder"
      }
    }, {
      "if": "service:bicycle:second_hand=no",
      "then": {
        "en": "This shop doesn't sell second-hand bikes",
        "nl": "Deze winkel verkoopt geen tweedehands fietsen",
        "fr": "Ce magasin ne vend pas de vélos d'occasion",
        "gl": "Esta tenda non vende bicicletas de segunda man",
        "de": "Dieses Geschäft verkauft keine gebrauchten Fahrräder"
      }
    }, {
      "if": "service:bicycle:second_hand=only",
      "then": {
        "en": "This shop only sells second-hand bikes",
        "nl": "Deze winkel verkoopt enkel tweedehands fietsen",
        "fr": "Ce magasin vend seulement des vélos d'occasion",
        "gl": "Esta tenda só vende bicicletas de segunda man",
        "de": "Dieses Geschäft verkauft nur gebrauchte Fahrräder"
      }
    }]
  }, {
    "question": {
      "en": "Does this shop offer a bike pump for use by anyone?",
      "nl": "Biedt deze winkel een fietspomp aan voor iedereen?",
      "fr": "Est-ce que ce magasin offre une pompe en accès libre?",
      "gl": "Esta tenda ofrece unha bomba de ar para uso de calquera persoa?",
      "de": "Bietet dieses Geschäft eine Fahrradpumpe zur Benutzung für alle an?"
    },
    "mappings": [{
      "if": "service:bicycle:pump=yes",
      "then": {
        "en": "This shop offers a bike pump for anyone",
        "nl": "Deze winkel biedt een fietspomp aan voor iedereen",
        "fr": "Ce magasin offre une pompe en acces libre",
        "gl": "Esta tenda ofrece unha bomba de ar para uso de calquera persoa",
        "de": "Dieses Geschäft bietet eine Fahrradpumpe für alle an"
      }
    }, {
      "if": "service:bicycle:pump=no",
      "then": {
        "en": "This shop doesn't offer a bike pump for anyone",
        "nl": "Deze winkel biedt geen fietspomp aan voor eender wie",
        "fr": "Ce magasin n'offre pas de pompe en libre accès",
        "gl": "Esta tenda non ofrece unha bomba de ar para uso de calquera persoa",
        "de": "Dieses Geschäft bietet für niemanden eine Fahrradpumpe an"
      }
    }]
  }, {
    "question": {
      "en": "Are there tools here to repair your own bike?",
      "nl": "Biedt deze winkel gereedschap aan om je fiets zelf te herstellen?",
      "fr": "Est-ce qu'il y a des outils pour réparer son vélo dans ce magasin?",
      "gl": "Hai ferramentas aquí para arranxar a túa propia bicicleta?",
      "de": "Gibt es hier Werkzeuge, um das eigene Fahrrad zu reparieren?"
    },
    "mappings": [{
      "if": "service:bicycle:diy=yes",
      "then": {
        "en": "This shop offers tools for DIY repair",
        "nl": "Deze winkel biedt gereedschap aan om je fiets zelf te herstellen",
        "fr": "Ce magasin offre des outils pour réparer son vélo soi-même",
        "gl": "Hai ferramentas aquí para arranxar a túa propia bicicleta",
        "de": "Dieses Geschäft bietet Werkzeuge für die Heimwerkerreparatur an"
      }
    }, {
      "if": "service:bicycle:diy=no",
      "then": {
        "en": "This shop doesn't offer tools for DIY repair",
        "nl": "Deze winkel biedt geen gereedschap aan om je fiets zelf te herstellen",
        "fr": "Ce magasin n'offre pas des outils pour réparer son vélo soi-même",
        "gl": "Non hai ferramentas aquí para arranxar a túa propia bicicleta",
        "de": "Dieses Geschäft bietet keine Werkzeuge für Heimwerkerreparaturen an"
      }
    }]
  }],
  "hideUnderlayingFeaturesMinPercentage": 1,
  "presets": [{
    "title": {
      "en": "Bike repair/shop",
      "nl": "Fietszaak",
      "fr": "Magasin et réparateur de vélo",
      "gl": "Tenda/arranxo de bicicletas",
      "de": "Fahrradwerkstatt/geschäft"
    },
    "tags": ["shop=bicycle"]
  }],
  "icon": {
    "render": "./assets/layers/bike_shop/repair_shop.svg",
    "mappings": [{
      "if": "service:bicycle:retail=yes",
      "then": "./assets/layers/bike_shop/shop.svg"
    }]
  },
  "width": {
    "render": "1"
  },
  "iconSize": {
    "render": "50,50,bottom"
  },
  "color": {
    "render": "#c00"
  },
  "wayHandling": 2
};
},{}],"assets/layers/maps/maps.json":[function(require,module,exports) {
module.exports = {
  "id": "maps",
  "name": {
    "en": "Maps",
    "nl": "Kaarten"
  },
  "minzoom": 12,
  "overpassTags": {
    "or": ["tourism=map", "information=map"]
  },
  "title": {
    "render": {
      "en": "Map",
      "nl": "Kaart"
    }
  },
  "description": {
    "en": "A map, meant for tourists which is permanently installed in the public space",
    "nl": "Een permantent geinstalleerde kaart"
  },
  "tagRenderings": [{
    "question": {
      "en": "On which data is this map based?",
      "nl": "Op welke data is deze kaart gebaseerd?"
    },
    "mappings": [{
      "if": {
        "and": ["map_source=OpenStreetMap", "not:map_source="]
      },
      "then": {
        "en": "This map is based on OpenStreetMap",
        "nl": "Deze kaart is gebaseerd op OpenStreetMap"
      }
    }],
    "freeform": {
      "key": "map_source"
    },
    "render": {
      "en": "This map is based on {map_source}",
      "nl": "Deze kaart is gebaseerd op {map_source}"
    }
  }, {
    "question": {
      "en": "Is the OpenStreetMap-attribution given?",
      "nl": "Is de attributie voor OpenStreetMap aanwezig?"
    },
    "mappings": [{
      "if": {
        "and": ["map_source:attribution=yes"]
      },
      "then": {
        "en": "OpenStreetMap is clearly attributed, including the ODBL-license",
        "nl": "De OpenStreetMap-attributie is duidelijk aangegeven, zelf met vermelding van \"ODBL\" "
      }
    }, {
      "if": {
        "and": ["map_source:attribution=incomplete"]
      },
      "then": {
        "en": "OpenStreetMap is clearly attributed, but the license is not mentioned",
        "nl": "OpenStreetMap is duidelijk aangegeven, maar de licentievermelding ontbreekt"
      }
    }, {
      "if": {
        "and": ["map_source:attribution=sticker"]
      },
      "then": {
        "en": "OpenStreetMap wasn't mentioned, but someone put an OpenStreetMap-sticker on it",
        "nl": "OpenStreetMap was oorspronkelijk niet aangeduid, maar iemand plaatste er een sticker"
      }
    }, {
      "if": {
        "and": ["map_source:attribution=none"]
      },
      "then": {
        "en": "There is no attribution at all",
        "nl": "Er is geen attributie"
      }
    }, {
      "if": {
        "and": ["map_source:attribution=no"]
      },
      "then": {
        "nl": "Er is geen attributie",
        "en": "There is no attribution at all"
      },
      "hideInAnswer": true
    }],
    "condition": {
      "or": ["map_source~(O|)pen(S|s)treet(M|m)ap", "map_source=osm", "map_source=OSM"]
    }
  }],
  "hideUnderlayingFeaturesMinPercentage": 0,
  "icon": {
    "render": "./assets/layers/maps/map.svg",
    "mappings": [{
      "if": {
        "and": ["map_source=OpenStreetMap", "map_source:attribution=sticker"]
      },
      "then": "./assets/layers/maps/map-stickered.svg"
    }, {
      "if": {
        "and": ["map_source=OpenStreetMap", "map_source:attribution=yes"]
      },
      "then": "./assets/layers/maps/osm-logo-white-bg.svg"
    }, {
      "if": {
        "and": ["map_source=OpenStreetMap"]
      },
      "then": "./assets/layers/maps/osm-logo-buggy-attr.svg"
    }]
  },
  "width": {
    "render": "8"
  },
  "iconSize": {
    "render": "50,50,center"
  },
  "color": {
    "render": "#00f"
  },
  "presets": [{
    "tags": ["tourism=map"],
    "title": {
      "en": "Map",
      "nl": "Kaart"
    },
    "description": {
      "en": "Add a missing map",
      "nl": "Voeg een ontbrekende kaart toe"
    }
  }],
  "wayHandling": 2
};
},{}],"assets/layers/information_board/information_board.json":[function(require,module,exports) {
module.exports = {
  "id": "information_boards",
  "name": {
    "nl": "Informatieborden",
    "en": "Information boards"
  },
  "minzoom": 12,
  "overpassTags": {
    "and": ["information=board"]
  },
  "title": {
    "render": {
      "nl": "Informatiebord",
      "en": "Information board"
    }
  },
  "description": {},
  "tagRenderings": [],
  "hideUnderlayingFeaturesMinPercentage": 0,
  "icon": {
    "render": "./assets/layers/information_board/board.svg"
  },
  "width": {
    "render": "8"
  },
  "iconSize": {
    "render": "40,40,center"
  },
  "color": {
    "render": "#00f"
  },
  "presets": [{
    "tags": ["tourism=information", "information=board"],
    "title": {
      "nl": "Informatiebord",
      "en": "Information board"
    }
  }]
};
},{}],"Customizations/UIElementConstructor.ts":[function(require,module,exports) {
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
exports.TagDependantUIElement = void 0;

var UIElement_1 = require("../UI/UIElement");

var TagDependantUIElement =
/** @class */
function (_super) {
  __extends(TagDependantUIElement, _super);

  function TagDependantUIElement() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return TagDependantUIElement;
}(UIElement_1.UIElement);

exports.TagDependantUIElement = TagDependantUIElement;
},{"../UI/UIElement":"UI/UIElement.ts"}],"Logic/Web/Wikimedia.ts":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LicenseInfo = exports.ImagesInCategory = exports.Wikidata = exports.Wikimedia = void 0;

var $ = __importStar(require("jquery"));
/**
 * This module provides endpoints for wikipedia/wikimedia and others
 */


var Wikimedia =
/** @class */
function () {
  function Wikimedia() {}

  Wikimedia.ImageNameToUrl = function (filename, width, height) {
    if (width === void 0) {
      width = 500;
    }

    if (height === void 0) {
      height = 200;
    }

    filename = encodeURIComponent(filename);
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" + filename + "?width=" + width + "&height=" + height;
  };

  Wikimedia.LicenseData = function (filename, handle) {
    if (filename in this.knownLicenses) {
      return this.knownLicenses[filename];
    }

    if (filename === "") {
      return;
    }

    var url = "https://en.wikipedia.org/w/" + "api.php?action=query&prop=imageinfo&iiprop=extmetadata&" + "titles=" + filename + "&format=json&origin=*";
    $.getJSON(url, function (data) {
      var _a, _b, _c, _d, _e, _f, _g, _h;

      var licenseInfo = new LicenseInfo();
      var license = data.query.pages[-1].imageinfo[0].extmetadata;
      licenseInfo.artist = (_a = license.Artist) === null || _a === void 0 ? void 0 : _a.value;
      licenseInfo.license = (_b = license.License) === null || _b === void 0 ? void 0 : _b.value;
      licenseInfo.copyrighted = (_c = license.Copyrighted) === null || _c === void 0 ? void 0 : _c.value;
      licenseInfo.attributionRequired = (_d = license.AttributionRequired) === null || _d === void 0 ? void 0 : _d.value;
      licenseInfo.usageTerms = (_e = license.UsageTerms) === null || _e === void 0 ? void 0 : _e.value;
      licenseInfo.licenseShortName = (_f = license.LicenseShortName) === null || _f === void 0 ? void 0 : _f.value;
      licenseInfo.credit = (_g = license.Credit) === null || _g === void 0 ? void 0 : _g.value;
      licenseInfo.description = (_h = license.ImageDescription) === null || _h === void 0 ? void 0 : _h.value;
      Wikimedia.knownLicenses[filename] = licenseInfo;
      handle(licenseInfo);
    });
  };

  Wikimedia.GetCategoryFiles = function (categoryName, handleCategory, alreadyLoaded, continueParameter) {
    var _this = this;

    if (alreadyLoaded === void 0) {
      alreadyLoaded = 0;
    }

    if (continueParameter === void 0) {
      continueParameter = undefined;
    }

    if (categoryName === undefined || categoryName === null || categoryName === "") {
      return;
    } // @ts-ignore


    if (!categoryName.startsWith("Category:")) {
      categoryName = "Category:" + categoryName;
    }

    var url = "https://commons.wikimedia.org/w/api.php?" + "action=query&list=categorymembers&format=json&" + "&origin=*" + "&cmtitle=" + encodeURIComponent(categoryName);

    if (continueParameter !== undefined) {
      url = url + "&" + continueParameter.k + "=" + continueParameter.param;
    }

    $.getJSON(url, function (response) {
      var _a;

      var imageOverview = new ImagesInCategory();
      var members = (_a = response.query) === null || _a === void 0 ? void 0 : _a.categorymembers;

      if (members === undefined) {
        members = [];
      }

      for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
        var member = members_1[_i];
        imageOverview.images.push(member.title);
      }

      if (response.continue === undefined || alreadyLoaded > 30) {
        handleCategory(imageOverview);
      } else {
        console.log("Recursive load for ", categoryName);

        _this.GetCategoryFiles(categoryName, function (recursiveImages) {
          for (var _i = 0, _a = imageOverview.images; _i < _a.length; _i++) {
            var image = _a[_i];
            recursiveImages.images.push(image);
          }

          handleCategory(recursiveImages);
        }, alreadyLoaded + 10, {
          k: "cmcontinue",
          param: response.continue.cmcontinue
        });
      }
    });
  };

  Wikimedia.GetWikiData = function (id, handleWikidata) {
    var url = "https://www.wikidata.org/wiki/Special:EntityData/Q" + id + ".json";
    $.getJSON(url, function (response) {
      var _a, _b, _c, _d;

      var entity = response.entities["Q" + id];
      var commons = entity.sitelinks.commonswiki;
      var wd = new Wikidata();
      wd.commonsWiki = commons === null || commons === void 0 ? void 0 : commons.title; // P18 is the claim 'depicted in this image'

      var image = (_d = (_c = (_b = (_a = entity.claims.P18) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.mainsnak) === null || _c === void 0 ? void 0 : _c.datavalue) === null || _d === void 0 ? void 0 : _d.value;

      if (image) {
        wd.image = "File:" + image;
      }

      handleWikidata(wd);
    });
  };

  Wikimedia.knownLicenses = {};
  return Wikimedia;
}();

exports.Wikimedia = Wikimedia;

var Wikidata =
/** @class */
function () {
  function Wikidata() {}

  return Wikidata;
}();

exports.Wikidata = Wikidata;

var ImagesInCategory =
/** @class */
function () {
  function ImagesInCategory() {
    // Filenames of relevant images
    this.images = [];
  }

  return ImagesInCategory;
}();

exports.ImagesInCategory = ImagesInCategory;

var LicenseInfo =
/** @class */
function () {
  function LicenseInfo() {
    this.artist = "";
    this.license = "";
    this.licenseShortName = "";
    this.usageTerms = "";
    this.attributionRequired = false;
    this.copyrighted = false;
    this.credit = "";
    this.description = "";
  }

  return LicenseInfo;
}();

exports.LicenseInfo = LicenseInfo;
},{"jquery":"node_modules/jquery/dist/jquery.js"}],"UI/Image/WikimediaImage.ts":[function(require,module,exports) {
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
exports.WikimediaImage = void 0;

var UIElement_1 = require("../UIElement");

var Wikimedia_1 = require("../../Logic/Web/Wikimedia");

var UIEventSource_1 = require("../../Logic/UIEventSource");

var WikimediaImage =
/** @class */
function (_super) {
  __extends(WikimediaImage, _super);

  function WikimediaImage(source) {
    var _this = _super.call(this, undefined) || this;

    _this._imageLocation = source;

    if (WikimediaImage.allLicenseInfos[source] !== undefined) {
      _this._imageMeta = WikimediaImage.allLicenseInfos[source];
    } else {
      _this._imageMeta = new UIEventSource_1.UIEventSource(new Wikimedia_1.LicenseInfo());
      WikimediaImage.allLicenseInfos[source] = _this._imageMeta;
      var self_1 = _this;
      Wikimedia_1.Wikimedia.LicenseData(source, function (info) {
        self_1._imageMeta.setData(info);
      });
    }

    _this.ListenTo(_this._imageMeta);

    return _this;
  }

  WikimediaImage.prototype.InnerRender = function () {
    var _a, _b;

    var url = Wikimedia_1.Wikimedia.ImageNameToUrl(this._imageLocation, 500, 400);
    url = url.replace(/'/g, '%27');
    var wikimediaLink = "<a href='https://commons.wikimedia.org/wiki/" + this._imageLocation + "' target='_blank'>" + "<img style='width:2em;height: 2em' class='wikimedia-link' src='./assets/wikimedia-commons-white.svg' alt='Wikimedia Commons Logo'/>" + "</a> ";
    var attribution = "<span class='attribution-author'>" + ((_a = this._imageMeta.data.artist) !== null && _a !== void 0 ? _a : "") + "</span>" + " <span class='license'>" + ((_b = this._imageMeta.data.licenseShortName) !== null && _b !== void 0 ? _b : "") + "</span>";
    var image = "<img src='" + url + "' " + "alt='" + this._imageMeta.data.description + "' >";
    return "<div class='imgWithAttr'>" + image + "<div class='attribution'>" + wikimediaLink + attribution + "</div>" + "</div>";
  };

  WikimediaImage.allLicenseInfos = {};
  return WikimediaImage;
}(UIElement_1.UIElement);

exports.WikimediaImage = WikimediaImage;
},{"../UIElement":"UI/UIElement.ts","../../Logic/Web/Wikimedia":"Logic/Web/Wikimedia.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"UI/Image/SimpleImageElement.ts":[function(require,module,exports) {
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
exports.SimpleImageElement = void 0;

var UIElement_1 = require("../UIElement");

var SimpleImageElement =
/** @class */
function (_super) {
  __extends(SimpleImageElement, _super);

  function SimpleImageElement(source) {
    return _super.call(this, source) || this;
  }

  SimpleImageElement.prototype.InnerRender = function () {
    return "<img src='" + this._source.data + "' alt='img'>";
  };

  return SimpleImageElement;
}(UIElement_1.UIElement);

exports.SimpleImageElement = SimpleImageElement;
},{"../UIElement":"UI/UIElement.ts"}],"Logic/Web/Imgur.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Imgur = void 0;

var jquery_1 = __importDefault(require("jquery"));

var Wikimedia_1 = require("./Wikimedia");

var Imgur =
/** @class */
function () {
  function Imgur() {}

  Imgur.uploadMultiple = function (title, description, blobs, handleSuccessfullUpload, allDone, onFail, offset) {
    if (offset === undefined) {
      throw "Offset undefined - not uploading to prevent to much uploads!";
    }

    if (blobs.length == offset) {
      allDone();
      return;
    }

    var blob = blobs.item(offset);
    var self = this;
    this.uploadImage(title, description, blob, function (imageUrl) {
      handleSuccessfullUpload(imageUrl);
      self.uploadMultiple(title, description, blobs, handleSuccessfullUpload, allDone, onFail, offset + 1);
    }, onFail);
  };

  Imgur.getDescriptionOfImage = function (url, handleDescription) {
    var hash = url.substr("https://i.imgur.com/".length).split(".jpg")[0];
    var apiUrl = 'https://api.imgur.com/3/image/' + hash;
    var apiKey = '7070e7167f0a25a';
    var settings = {
      async: true,
      crossDomain: true,
      processData: false,
      contentType: false,
      type: 'GET',
      url: apiUrl,
      headers: {
        Authorization: 'Client-ID ' + apiKey,
        Accept: 'application/json'
      }
    };
    jquery_1.default.ajax(settings).done(function (response) {
      var descr = response.data.description;
      var data = {};

      for (var _i = 0, _a = descr.split("\n"); _i < _a.length; _i++) {
        var tag = _a[_i];
        var kv = tag.split(":");
        var k = kv[0];
        var v = kv[1].replace("\r", "");
        data[k] = v;
      }

      var licenseInfo = new Wikimedia_1.LicenseInfo();
      licenseInfo.licenseShortName = data.license;
      licenseInfo.artist = data.author;
      handleDescription(licenseInfo);
    }).fail(function (reason) {
      console.log("Getting metadata from to IMGUR failed", reason);
    });
  };

  Imgur.uploadImage = function (title, description, blob, handleSuccessfullUpload, onFail) {
    var apiUrl = 'https://api.imgur.com/3/image';
    var apiKey = '7070e7167f0a25a';
    var settings = {
      async: true,
      crossDomain: true,
      processData: false,
      contentType: false,
      type: 'POST',
      url: apiUrl,
      headers: {
        Authorization: 'Client-ID ' + apiKey,
        Accept: 'application/json'
      },
      mimeType: 'multipart/form-data'
    };
    var formData = new FormData();
    formData.append('image', blob);
    formData.append("title", title);
    formData.append("description", description); // @ts-ignore

    settings.data = formData; // Response contains stringified JSON
    // Image URL available at response.data.link

    jquery_1.default.ajax(settings).done(function (response) {
      response = JSON.parse(response);
      handleSuccessfullUpload(response.data.link);
    }).fail(function (reason) {
      console.log("Uploading to IMGUR failed", reason);
      onFail(reason);
    });
  };

  return Imgur;
}();

exports.Imgur = Imgur;
},{"jquery":"node_modules/jquery/dist/jquery.js","./Wikimedia":"Logic/Web/Wikimedia.ts"}],"UI/Image/ImgurImage.ts":[function(require,module,exports) {
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
exports.ImgurImage = void 0;

var UIElement_1 = require("../UIElement");

var UIEventSource_1 = require("../../Logic/UIEventSource");

var Imgur_1 = require("../../Logic/Web/Imgur");

var ImgurImage =
/** @class */
function (_super) {
  __extends(ImgurImage, _super);

  function ImgurImage(source) {
    var _this = _super.call(this, undefined) || this;

    _this._imageLocation = source;

    if (ImgurImage.allLicenseInfos[source] !== undefined) {
      _this._imageMeta = ImgurImage.allLicenseInfos[source];
    } else {
      _this._imageMeta = new UIEventSource_1.UIEventSource(null);
      ImgurImage.allLicenseInfos[source] = _this._imageMeta;
      var self_1 = _this;
      Imgur_1.Imgur.getDescriptionOfImage(source, function (license) {
        self_1._imageMeta.setData(license);
      });
    }

    _this.ListenTo(_this._imageMeta);

    return _this;
  }

  ImgurImage.prototype.InnerRender = function () {
    var _a, _b;

    var image = "<img src='" + this._imageLocation + "' " + "alt='' >";

    if (this._imageMeta.data === null) {
      return image;
    }

    var attribution = "<span class='attribution-author'><b>" + ((_a = this._imageMeta.data.artist) !== null && _a !== void 0 ? _a : "") + "</b></span>" + " <span class='license'>" + ((_b = this._imageMeta.data.licenseShortName) !== null && _b !== void 0 ? _b : "") + "</span>";
    return "<div class='imgWithAttr'>" + image + "<div class='attribution'>" + attribution + "</div>" + "</div>";
  };
  /***
   * Dictionary from url to alreayd known license info
   */


  ImgurImage.allLicenseInfos = {};
  return ImgurImage;
}(UIElement_1.UIElement);

exports.ImgurImage = ImgurImage;
},{"../UIElement":"UI/UIElement.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts","../../Logic/Web/Imgur":"Logic/Web/Imgur.ts"}],"Logic/ImageSearcher.ts":[function(require,module,exports) {
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
exports.ImageSearcher = void 0;

var WikimediaImage_1 = require("../UI/Image/WikimediaImage");

var SimpleImageElement_1 = require("../UI/Image/SimpleImageElement");

var ImgurImage_1 = require("../UI/Image/ImgurImage");

var Wikimedia_1 = require("./Web/Wikimedia");

var UIEventSource_1 = require("./UIEventSource");
/**
 * There are multiple way to fetch images for an object
 * 1) There is an image tag
 * 2) There is an image tag, the image tag contains multiple ';'-seperated URLS
 * 3) there are multiple image tags, e.g. 'image', 'image:0', 'image:1', and 'image_0', 'image_1' - however, these are pretty rare so we are gonna ignore them
 * 4) There is a wikimedia_commons-tag, which either has a 'File': or a 'category:' containing images
 * 5) There is a wikidata-tag, and the wikidata item either has an 'image' attribute or has 'a link to a wikimedia commons category'
 * 6) There is a wikipedia article, from which we can deduct the wikidata item
 *
 * For some images, author and license should be shown
 */

/**
 * Class which search for all the possible locations for images and which builds a list of UI-elements for it.
 * Note that this list is embedded into an UIEVentSource, ready to put it into a carousel
 */


var ImageSearcher =
/** @class */
function (_super) {
  __extends(ImageSearcher, _super);

  function ImageSearcher(tags) {
    var _this = _super.call(this, []) || this;

    _this._wdItem = new UIEventSource_1.UIEventSource("");
    _this._commons = new UIEventSource_1.UIEventSource("");
    _this._tags = tags;
    var self = _this;

    _this._wdItem.addCallback(function () {
      // Load the wikidata item, then detect usage on 'commons'
      var allWikidataId = self._wdItem.data.split(";");

      for (var _i = 0, allWikidataId_1 = allWikidataId; _i < allWikidataId_1.length; _i++) {
        var wikidataId = allWikidataId_1[_i]; // @ts-ignore

        if (wikidataId.startsWith("Q")) {
          wikidataId = wikidataId.substr(1);
        }

        Wikimedia_1.Wikimedia.GetWikiData(parseInt(wikidataId), function (wd) {
          self.AddImage(undefined, wd.image);
          Wikimedia_1.Wikimedia.GetCategoryFiles(wd.commonsWiki, function (images) {
            for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
              var image = _a[_i]; // @ts-ignore

              if (image.startsWith("File:")) {
                self.AddImage(undefined, image);
              }
            }
          });
        });
      }
    });

    _this._commons.addCallback(function () {
      var allCommons = self._commons.data.split(";");

      for (var _i = 0, allCommons_1 = allCommons; _i < allCommons_1.length; _i++) {
        var commons = allCommons_1[_i]; // @ts-ignore

        if (commons.startsWith("Category:")) {
          Wikimedia_1.Wikimedia.GetCategoryFiles(commons, function (images) {
            for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
              var image = _a[_i]; // @ts-ignore

              if (image.startsWith("File:")) {
                self.AddImage(undefined, image);
              }
            }
          });
        } else {
          // @ts-ignore
          if (commons.startsWith("File:")) {
            self.AddImage(undefined, commons);
          }
        }
      }
    });

    _this._tags.addCallbackAndRun(function () {
      return self.LoadImages();
    });

    return _this;
  }

  ImageSearcher.prototype.AddImage = function (key, url) {
    if (url === undefined || url === null || url === "") {
      return;
    }

    for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
      var el = _a[_i];

      if (el.url === url) {
        return;
      }
    }

    this.data.push({
      key: key,
      url: url
    });
    this.ping();
  };

  ImageSearcher.prototype.LoadImages = function () {
    var imageTag = this._tags.data.image;

    if (imageTag !== undefined) {
      var bareImages = imageTag.split(";");

      for (var _i = 0, bareImages_1 = bareImages; _i < bareImages_1.length; _i++) {
        var bareImage = bareImages_1[_i];
        this.AddImage("image", bareImage);
      }
    }

    for (var key in this._tags.data) {
      if (key.startsWith("image:")) {
        var url = this._tags.data[key];
        this.AddImage(key, url);
      }
    }

    var wdItem = this._tags.data.wikidata;

    if (wdItem !== undefined) {
      this._wdItem.setData(wdItem);
    }

    var commons = this._tags.data.wikimedia_commons;

    if (commons !== undefined) {
      this._commons.setData(commons);
    }
  };
  /***
   * Creates either a 'simpleimage' or a 'wikimediaimage' based on the string
   * @param url
   * @constructor
   */


  ImageSearcher.CreateImageElement = function (url) {
    // @ts-ignore
    if (url.startsWith("File:")) {
      return new WikimediaImage_1.WikimediaImage(url);
    } else if (url.startsWith("https://commons.wikimedia.org/wiki/")) {
      var commons = url.substr("https://commons.wikimedia.org/wiki/".length);
      return new WikimediaImage_1.WikimediaImage(commons);
    } else if (url.startsWith("https://i.imgur.com/")) {
      return new ImgurImage_1.ImgurImage(url);
    } else {
      return new SimpleImageElement_1.SimpleImageElement(new UIEventSource_1.UIEventSource(url));
    }
  };

  return ImageSearcher;
}(UIEventSource_1.UIEventSource);

exports.ImageSearcher = ImageSearcher;
},{"../UI/Image/WikimediaImage":"UI/Image/WikimediaImage.ts","../UI/Image/SimpleImageElement":"UI/Image/SimpleImageElement.ts","../UI/Image/ImgurImage":"UI/Image/ImgurImage.ts","./Web/Wikimedia":"Logic/Web/Wikimedia.ts","./UIEventSource":"Logic/UIEventSource.ts"}],"UI/SlideShow.ts":[function(require,module,exports) {
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
exports.SlideShow = void 0;

var UIElement_1 = require("./UIElement");

var FixedUiElement_1 = require("./Base/FixedUiElement");

var UIEventSource_1 = require("../Logic/UIEventSource");

var SlideShow =
/** @class */
function (_super) {
  __extends(SlideShow, _super);

  function SlideShow(embeddedElements) {
    var _this = _super.call(this, embeddedElements) || this;

    _this._currentSlide = new UIEventSource_1.UIEventSource(0);
    _this._embeddedElements = embeddedElements;

    _this.ListenTo(_this._currentSlide);

    var self = _this;
    _this._prev = new FixedUiElement_1.FixedUiElement("<div class='prev-button'>" + "<div class='vspan'></div>" + "<img src='assets/arrow-left-smooth.svg' alt='Prev'/>" + "</div>").onClick(function () {
      var current = self._currentSlide.data;
      self.MoveTo(current - 1);
    });
    _this._next = new FixedUiElement_1.FixedUiElement("<div class='next-button'>" + "<div class='vspan'></div>" + "<img src='assets/arrow-right-smooth.svg' alt='Next'/>" + "</div>").onClick(function () {
      var current = self._currentSlide.data;
      self.MoveTo(current + 1);
    });
    return _this;
  }

  SlideShow.prototype.InnerRender = function () {
    if (this._embeddedElements.data.length == 0) {
      return "";
    }

    if (this._embeddedElements.data.length == 1) {
      return "<div class='image-slideshow'><div class='slides'><div class='slide'>" + this._embeddedElements.data[0].Render() + "</div></div></div>";
    }

    var slides = "";

    for (var i = 0; i < this._embeddedElements.data.length; i++) {
      var embeddedElement = this._embeddedElements.data[i];
      var state = "hidden";

      if (this._currentSlide.data === i) {
        state = "active-slide";
      }

      slides += "      <div class=\"slide " + state + "\">" + embeddedElement.Render() + "</div>\n";
    }

    return "<div class='image-slideshow'>" + this._prev.Render() + "<div class='slides'>" + slides + "</div>" + this._next.Render() + "</div>";
  };

  SlideShow.prototype.MoveTo = function (index) {
    if (index < 0) {
      index = this._embeddedElements.data.length - 1;
    }

    index = index % this._embeddedElements.data.length;

    this._currentSlide.setData(index);
  };

  SlideShow.prototype.Update = function () {
    _super.prototype.Update.call(this);

    for (var _i = 0, _a = this._embeddedElements.data; _i < _a.length; _i++) {
      var uiElement = _a[_i];
      uiElement.Update();
    }
  };

  return SlideShow;
}(UIElement_1.UIElement);

exports.SlideShow = SlideShow;
},{"./UIElement":"UI/UIElement.ts","./Base/FixedUiElement":"UI/Base/FixedUiElement.ts","../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"UI/Input/CheckBox.ts":[function(require,module,exports) {
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
exports.CheckBox = void 0;

var UIElement_1 = require("../UIElement");

var Translations_1 = __importDefault(require("../../UI/i18n/Translations"));

var UIEventSource_1 = require("../../Logic/UIEventSource");

var CheckBox =
/** @class */
function (_super) {
  __extends(CheckBox, _super);

  function CheckBox(showEnabled, showDisabled, data) {
    if (data === void 0) {
      data = false;
    }

    var _this = _super.call(this, undefined) || this;

    _this.isEnabled = data instanceof UIEventSource_1.UIEventSource ? data : new UIEventSource_1.UIEventSource(data !== null && data !== void 0 ? data : false);

    _this.ListenTo(_this.isEnabled);

    _this._showEnabled = Translations_1.default.W(showEnabled);
    _this._showDisabled = Translations_1.default.W(showDisabled);
    var self = _this;

    _this.onClick(function () {
      self.isEnabled.setData(!self.isEnabled.data);
    });

    return _this;
  }

  CheckBox.prototype.InnerRender = function () {
    if (this.isEnabled.data) {
      return Translations_1.default.W(this._showEnabled).Render();
    } else {
      return Translations_1.default.W(this._showDisabled).Render();
    }
  };

  return CheckBox;
}(UIElement_1.UIElement);

exports.CheckBox = CheckBox;
},{"../UIElement":"UI/UIElement.ts","../../UI/i18n/Translations":"UI/i18n/Translations.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"UI/Image/DeleteImage.ts":[function(require,module,exports) {
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

var Translations_1 = __importDefault(require("../i18n/Translations"));

var CheckBox_1 = require("../Input/CheckBox");

var Combine_1 = __importDefault(require("../Base/Combine"));

var State_1 = require("../../State");

var Tags_1 = require("../../Logic/Tags");

var DeleteImage =
/** @class */
function (_super) {
  __extends(DeleteImage, _super);

  function DeleteImage(key, tags) {
    var _this = _super.call(this, tags) || this;

    _this.tags = tags;
    _this.key = key;
    _this.isDeletedBadge = Translations_1.default.t.image.isDeleted;
    var style = "display:block;color:white;width:100%;";
    var deleteButton = Translations_1.default.t.image.doDelete.Clone().SetStyle(style + "background:#ff8c8c;").onClick(function () {
      var _a;

      (_a = State_1.State.state) === null || _a === void 0 ? void 0 : _a.changes.addTag(tags.data.id, new Tags_1.Tag(key, ""));
    });
    var cancelButton = Translations_1.default.t.general.cancel;
    _this.deleteDialog = new CheckBox_1.CheckBox(new Combine_1.default([deleteButton, cancelButton]).SetStyle("display:flex;flex-direction:column;"), "<img src='./assets/delete.svg' style='width:1.5em;'>");
    return _this;
  }

  DeleteImage.prototype.InnerRender = function () {
    var value = this.tags.data[this.key];

    if (value === undefined || value === "") {
      return this.isDeletedBadge.Render();
    }

    return this.deleteDialog.Render();
  };

  return DeleteImage;
}(UIElement_1.UIElement);

exports.default = DeleteImage;
},{"../UIElement":"UI/UIElement.ts","../i18n/Translations":"UI/i18n/Translations.ts","../Input/CheckBox":"UI/Input/CheckBox.ts","../Base/Combine":"UI/Base/Combine.ts","../../State":"State.ts","../../Logic/Tags":"Logic/Tags.ts"}],"UI/Image/ImageCarousel.ts":[function(require,module,exports) {
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
exports.ImageCarousel = exports.ImageCarouselConstructor = void 0;

var ImageSearcher_1 = require("../../Logic/ImageSearcher");

var SlideShow_1 = require("../SlideShow");

var UIElementConstructor_1 = require("../../Customizations/UIElementConstructor");

var Translation_1 = __importDefault(require("../i18n/Translation"));

var Combine_1 = __importDefault(require("../Base/Combine"));

var DeleteImage_1 = __importDefault(require("./DeleteImage"));

var ImageCarouselConstructor =
/** @class */
function () {
  function ImageCarouselConstructor() {}

  ImageCarouselConstructor.prototype.IsKnown = function (properties) {
    return true;
  };

  ImageCarouselConstructor.prototype.IsQuestioning = function (properties) {
    return false;
  };

  ImageCarouselConstructor.prototype.Priority = function () {
    return 0;
  };

  ImageCarouselConstructor.prototype.construct = function (dependencies) {
    return new ImageCarousel(dependencies.tags);
  };

  ImageCarouselConstructor.prototype.GetContent = function (tags) {
    return new Translation_1.default({
      "en": "Images without upload"
    });
  };

  return ImageCarouselConstructor;
}();

exports.ImageCarouselConstructor = ImageCarouselConstructor;

var ImageCarousel =
/** @class */
function (_super) {
  __extends(ImageCarousel, _super);

  function ImageCarousel(tags) {
    var _this = _super.call(this, tags) || this;

    var searcher = new ImageSearcher_1.ImageSearcher(tags);
    var uiElements = searcher.map(function (imageURLS) {
      var uiElements = [];

      for (var _i = 0, imageURLS_1 = imageURLS; _i < imageURLS_1.length; _i++) {
        var url = imageURLS_1[_i];
        var image = ImageSearcher_1.ImageSearcher.CreateImageElement(url.url);

        if (url.key !== undefined) {
          image = new Combine_1.default([image, new DeleteImage_1.default(url.key, tags)]);
        }

        uiElements.push(image);
      }

      return uiElements;
    });
    _this.slideshow = new SlideShow_1.SlideShow(uiElements).HideOnEmpty(true);
    return _this;
  }

  ImageCarousel.prototype.InnerRender = function () {
    return this.slideshow.Render();
  };

  ImageCarousel.prototype.IsKnown = function () {
    return true;
  };

  ImageCarousel.prototype.IsQuestioning = function () {
    return false;
  };

  ImageCarousel.prototype.IsSkipped = function () {
    return false;
  };

  ImageCarousel.prototype.Priority = function () {
    return 0;
  };

  return ImageCarousel;
}(UIElementConstructor_1.TagDependantUIElement);

exports.ImageCarousel = ImageCarousel;
},{"../../Logic/ImageSearcher":"Logic/ImageSearcher.ts","../SlideShow":"UI/SlideShow.ts","../../Customizations/UIElementConstructor":"Customizations/UIElementConstructor.ts","../i18n/Translation":"UI/i18n/Translation.ts","../Base/Combine":"UI/Base/Combine.ts","./DeleteImage":"UI/Image/DeleteImage.ts"}],"UI/Input/InputElement.ts":[function(require,module,exports) {
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
exports.InputElement = void 0;

var UIElement_1 = require("../UIElement");

var InputElement =
/** @class */
function (_super) {
  __extends(InputElement, _super);

  function InputElement() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return InputElement;
}(UIElement_1.UIElement);

exports.InputElement = InputElement;
},{"../UIElement":"UI/UIElement.ts"}],"UI/Input/DropDown.ts":[function(require,module,exports) {
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
exports.DropDown = void 0;

var InputElement_1 = require("./InputElement");

var Translations_1 = __importDefault(require("../i18n/Translations"));

var UIEventSource_1 = require("../../Logic/UIEventSource");

var DropDown =
/** @class */
function (_super) {
  __extends(DropDown, _super);

  function DropDown(label, values, value) {
    if (value === void 0) {
      value = undefined;
    }

    var _this = _super.call(this, undefined) || this;

    _this.IsSelected = new UIEventSource_1.UIEventSource(false);
    _this._value = value !== null && value !== void 0 ? value : new UIEventSource_1.UIEventSource(undefined);
    _this._label = Translations_1.default.W(label);
    _this._values = values.map(function (v) {
      return {
        value: v.value,
        shown: Translations_1.default.W(v.shown)
      };
    });

    for (var _i = 0, _a = _this._values; _i < _a.length; _i++) {
      var v = _a[_i];

      _this.ListenTo(v.shown._source);
    }

    _this.ListenTo(_this._value);

    _this.onClick(function () {}); // by registering a click, the click event is consumed and doesn't bubble furter to other elements, e.g. checkboxes


    return _this;
  }

  DropDown.prototype.GetValue = function () {
    return this._value;
  };

  DropDown.prototype.IsValid = function (t) {
    for (var _i = 0, _a = this._values; _i < _a.length; _i++) {
      var value = _a[_i];

      if (value.value === t) {
        return true;
      }
    }

    return false;
  };

  DropDown.prototype.InnerRender = function () {
    if (this._values.length <= 1) {
      return "";
    }

    var options = "";

    for (var i = 0; i < this._values.length; i++) {
      options += "<option value='" + i + "'>" + this._values[i].shown.InnerRender() + "</option>";
    }

    return "<form>" + "<label for='dropdown-" + this.id + "'>" + this._label.Render() + " </label>" + "<select name='dropdown-" + this.id + "' id='dropdown-" + this.id + "'>" + options + "</select>" + "</form>";
  };

  DropDown.prototype.InnerUpdate = function (element) {
    var e = document.getElementById("dropdown-" + this.id);

    if (e === null) {
      return;
    }

    var self = this;

    e.onchange = function () {
      // @ts-ignore
      var index = parseInt(e.selectedIndex);

      self._value.setData(self._values[index].value);
    };

    var t = this._value.data;

    for (var i = 0; i < this._values.length; i++) {
      var value = this._values[i].value;

      if (value === t) {
        // @ts-ignore
        e.selectedIndex = i;
      }
    }
  };

  return DropDown;
}(InputElement_1.InputElement);

exports.DropDown = DropDown;
},{"./InputElement":"UI/Input/InputElement.ts","../i18n/Translations":"UI/i18n/Translations.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"UI/ImageUploadFlow.ts":[function(require,module,exports) {
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
exports.ImageUploadFlow = void 0;

var UIElement_1 = require("./UIElement");

var jquery_1 = __importDefault(require("jquery"));

var DropDown_1 = require("./Input/DropDown");

var Translations_1 = __importDefault(require("./i18n/Translations"));

var Combine_1 = __importDefault(require("./Base/Combine"));

var State_1 = require("../State");

var UIEventSource_1 = require("../Logic/UIEventSource");

var Imgur_1 = require("../Logic/Web/Imgur");

var FixedUiElement_1 = require("./Base/FixedUiElement");

var ImageUploadFlow =
/** @class */
function (_super) {
  __extends(ImageUploadFlow, _super);

  function ImageUploadFlow(preferedLicense, uploadOptions) {
    var _this = _super.call(this, State_1.State.state.osmConnection.userDetails) || this;

    _this._isUploading = new UIEventSource_1.UIEventSource(0);
    _this._didFail = new UIEventSource_1.UIEventSource(false);
    _this._allDone = new UIEventSource_1.UIEventSource(false);
    _this._uploadOptions = uploadOptions;

    _this.ListenTo(_this._isUploading);

    _this.ListenTo(_this._didFail);

    _this.ListenTo(_this._allDone);

    var licensePicker = new DropDown_1.DropDown(Translations_1.default.t.image.willBePublished, [{
      value: "CC0",
      shown: Translations_1.default.t.image.cco
    }, {
      value: "CC-BY-SA 4.0",
      shown: Translations_1.default.t.image.ccbs
    }, {
      value: "CC-BY 4.0",
      shown: Translations_1.default.t.image.ccb
    }], preferedLicense);
    licensePicker.SetStyle("float:left");
    var t = Translations_1.default.t.image;
    _this._licensePicker = licensePicker;
    _this._selectedLicence = licensePicker.GetValue();
    _this._connectButton = new Combine_1.default([t.pleaseLogin]).onClick(function () {
      return State_1.State.state.osmConnection.AttemptLogin();
    }).SetClass("login-button-friendly");
    return _this;
  }

  ImageUploadFlow.prototype.InnerRender = function () {
    var t = Translations_1.default.t.image;

    if (State_1.State.state.osmConnection.userDetails === undefined) {
      return ""; // No user details -> logging in is probably disabled or smthing
    }

    if (!State_1.State.state.osmConnection.userDetails.data.loggedIn) {
      return this._connectButton.Render();
    }

    var currentState = [];

    if (this._isUploading.data == 1) {
      currentState.push(t.uploadingPicture);
    } else if (this._isUploading.data > 0) {
      currentState.push(t.uploadingMultiple.Subs({
        count: "" + this._isUploading.data
      }));
    }

    if (this._didFail.data) {
      currentState.push(t.uploadFailed);
    }

    if (this._allDone.data) {
      currentState.push(t.uploadDone);
    }

    var currentStateHtml = new FixedUiElement_1.FixedUiElement("");

    if (currentState.length > 0) {
      currentStateHtml = new Combine_1.default(currentState);

      if (!this._allDone.data) {
        currentStateHtml.SetClass("alert");
      } else {
        currentStateHtml.SetClass("thanks");
      }

      currentStateHtml.SetStyle("display:block ruby");
    }

    var extraInfo = new Combine_1.default([Translations_1.default.t.image.respectPrivacy, "<br/>", this._licensePicker, "<br/>", currentStateHtml, "<br/>"]);
    var label = new Combine_1.default(["<img style='width: 36px;height: 36px;padding: 0.1em;margin-top: 5px;border-radius: 0;float: left;'  src='./assets/camera-plus.svg'/> ", Translations_1.default.t.image.addPicture.SetStyle("width:max-content;font-size: 28px;" + "font-weight: bold;" + "float: left;" + "margin-top: 4px;" + "padding-top: 4px;" + "padding-bottom: 4px;" + "padding-left: 13px;")]).SetStyle(" display: flex;" + "cursor:pointer;" + "padding: 0.5em;" + "border-radius: 1em;" + "border: 3px solid black;" + "box-sizing:border-box;");
    var actualInputElement = "<input style='display: none' id='fileselector-" + this.id + "' type='file' accept='image/*' name='picField' multiple='multiple' alt=''/>";
    var form = "<form id='fileselector-form-" + this.id + "'>" + ("<label for='fileselector-" + this.id + "'>") + label.Render() + "</label>" + actualInputElement + "</form>";
    return new Combine_1.default([form, extraInfo]).SetStyle("margin-top: 1em;margin-bottom: 2em;text-align: center;").Render();
  };

  ImageUploadFlow.prototype.InnerUpdate = function (htmlElement) {
    _super.prototype.InnerUpdate.call(this, htmlElement);

    var user = State_1.State.state.osmConnection.userDetails.data;

    this._licensePicker.Update();

    var form = document.getElementById('fileselector-form-' + this.id);
    var selector = document.getElementById('fileselector-' + this.id);
    var self = this;

    function submitHandler() {
      var files = jquery_1.default(selector).prop('files');

      self._isUploading.setData(files.length);

      self._allDone.setData(false);

      if (self._selectedLicence.data === undefined) {
        self._selectedLicence.setData("CC0");
      }

      var opts = self._uploadOptions(self._selectedLicence.data);

      Imgur_1.Imgur.uploadMultiple(opts.title, opts.description, files, function (url) {
        console.log("File saved at", url);

        self._isUploading.setData(self._isUploading.data - 1);

        opts.handleURL(url);
      }, function () {
        console.log("All uploads completed");

        self._allDone.setData(true);

        opts.allDone();
      }, function (failReason) {
        console.log("Upload failed due to ", failReason); // No need to call something from the options -> we handle this here

        self._didFail.setData(true);

        self._isUploading.data--;

        self._isUploading.ping();
      }, 0);
    }

    if (selector != null && form != null) {
      selector.onchange = function () {
        submitHandler();
      };

      form.addEventListener('submit', function (e) {
        console.log(e);
        alert('wait');
        e.preventDefault();
        submitHandler();
      });
    }
  };

  return ImageUploadFlow;
}(UIElement_1.UIElement);

exports.ImageUploadFlow = ImageUploadFlow;
},{"./UIElement":"UI/UIElement.ts","jquery":"node_modules/jquery/dist/jquery.js","./Input/DropDown":"UI/Input/DropDown.ts","./i18n/Translations":"UI/i18n/Translations.ts","./Base/Combine":"UI/Base/Combine.ts","../State":"State.ts","../Logic/UIEventSource":"Logic/UIEventSource.ts","../Logic/Web/Imgur":"Logic/Web/Imgur.ts","./Base/FixedUiElement":"UI/Base/FixedUiElement.ts"}],"Logic/Osm/OsmImageUploadHandler.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsmImageUploadHandler = void 0;

var ImageUploadFlow_1 = require("../../UI/ImageUploadFlow");

var State_1 = require("../../State");

var Tags_1 = require("../Tags");

var OsmImageUploadHandler =
/** @class */
function () {
  function OsmImageUploadHandler(tags, preferedLicense, slideShow) {
    this._slideShow = slideShow; // To move the slideshow (if any) to the last, just added element

    this._tags = tags;
    this._preferedLicense = preferedLicense;
  }

  OsmImageUploadHandler.prototype.generateOptions = function (license) {
    var _a;

    var tags = this._tags.data;
    var self = this;
    license = license !== null && license !== void 0 ? license : "CC0";
    var title = (_a = tags.name) !== null && _a !== void 0 ? _a : "Unknown area";
    var description = ["author:" + State_1.State.state.osmConnection.userDetails.data.name, "license:" + license, "wikidata:" + tags.wikidata, "osmid:" + tags.id, "name:" + tags.name].join("\n");
    var changes = State_1.State.state.changes;
    return {
      title: title,
      description: description,
      handleURL: function handleURL(url) {
        var key = "image";

        if (tags["image"] !== undefined) {
          var freeIndex = 0;

          while (tags["image:" + freeIndex] !== undefined) {
            freeIndex++;
          }

          key = "image:" + freeIndex;
        }

        console.log("Adding image:" + key, url);
        changes.addTag(tags.id, new Tags_1.Tag(key, url));

        self._slideShow.MoveTo(-1); // set the last (thus newly added) image) to view

      },
      allDone: function allDone() {}
    };
  };

  OsmImageUploadHandler.prototype.getUI = function () {
    var self = this;
    return new ImageUploadFlow_1.ImageUploadFlow(this._preferedLicense, function (license) {
      return self.generateOptions(license);
    });
  };

  return OsmImageUploadHandler;
}();

exports.OsmImageUploadHandler = OsmImageUploadHandler;
},{"../../UI/ImageUploadFlow":"UI/ImageUploadFlow.ts","../../State":"State.ts","../Tags":"Logic/Tags.ts"}],"UI/Image/ImageCarouselWithUpload.ts":[function(require,module,exports) {
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

var UIElementConstructor_1 = require("../../Customizations/UIElementConstructor");

var ImageCarousel_1 = require("./ImageCarousel");

var OsmImageUploadHandler_1 = require("../../Logic/Osm/OsmImageUploadHandler");

var State_1 = require("../../State");

var Translation_1 = __importDefault(require("../i18n/Translation"));

var ImageCarouselWithUploadConstructor =
/** @class */
function () {
  function ImageCarouselWithUploadConstructor() {}

  ImageCarouselWithUploadConstructor.prototype.IsKnown = function (properties) {
    return true;
  };

  ImageCarouselWithUploadConstructor.prototype.IsQuestioning = function (properties) {
    return false;
  };

  ImageCarouselWithUploadConstructor.prototype.construct = function (dependencies) {
    return new ImageCarouselWithUpload(dependencies);
  };

  ImageCarouselWithUploadConstructor.prototype.GetContent = function (tags) {
    return new Translation_1.default({
      "en": "Image carousel with uploader"
    });
  };

  return ImageCarouselWithUploadConstructor;
}();

exports.default = ImageCarouselWithUploadConstructor;

var ImageCarouselWithUpload =
/** @class */
function (_super) {
  __extends(ImageCarouselWithUpload, _super);

  function ImageCarouselWithUpload(dependencies) {
    var _this = _super.call(this, dependencies.tags) || this;

    var tags = dependencies.tags;
    _this._imageElement = new ImageCarousel_1.ImageCarousel(tags);
    var license = State_1.State.state.osmConnection.GetPreference("pictures-license");
    _this._pictureUploader = new OsmImageUploadHandler_1.OsmImageUploadHandler(tags, license, _this._imageElement.slideshow).getUI();
    return _this;
  }

  ImageCarouselWithUpload.prototype.InnerRender = function () {
    return this._imageElement.Render() + this._pictureUploader.Render();
  };

  ImageCarouselWithUpload.prototype.IsKnown = function () {
    return true;
  };

  ImageCarouselWithUpload.prototype.IsQuestioning = function () {
    return false;
  };

  ImageCarouselWithUpload.prototype.IsSkipped = function () {
    return false;
  };

  return ImageCarouselWithUpload;
}(UIElementConstructor_1.TagDependantUIElement);
},{"../../Customizations/UIElementConstructor":"Customizations/UIElementConstructor.ts","./ImageCarousel":"UI/Image/ImageCarousel.ts","../../Logic/Osm/OsmImageUploadHandler":"Logic/Osm/OsmImageUploadHandler.ts","../../State":"State.ts","../i18n/Translation":"UI/i18n/Translation.ts"}],"Customizations/JSON/FromJSON.ts":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

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

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FromJSON = void 0;

var Layout_1 = require("../Layout");

var Tags_1 = require("../../Logic/Tags");

var TagRenderingOptions_1 = require("../TagRenderingOptions");

var Translation_1 = __importDefault(require("../../UI/i18n/Translation"));

var LayerDefinition_1 = require("../LayerDefinition");

var Combine_1 = __importDefault(require("../../UI/Base/Combine"));

var drinkingWater = __importStar(require("../../assets/layers/drinking_water/drinking_water.json"));

var ghostbikes = __importStar(require("../../assets/layers/ghost_bike/ghost_bike.json"));

var viewpoint = __importStar(require("../../assets/layers/viewpoint/viewpoint.json"));

var bike_parking = __importStar(require("../../assets/layers/bike_parking/bike_parking.json"));

var bike_repair_station = __importStar(require("../../assets/layers/bike_repair_station/bike_repair_station.json"));

var birdhides = __importStar(require("../../assets/layers/bird_hide/birdhides.json"));

var nature_reserve = __importStar(require("../../assets/layers/nature_reserve/nature_reserve.json"));

var bike_cafes = __importStar(require("../../assets/layers/bike_cafe/bike_cafes.json"));

var cycling_themed_objects = __importStar(require("../../assets/layers/cycling_themed_object/cycling_themed_objects.json"));

var bike_shops = __importStar(require("../../assets/layers/bike_shop/bike_shop.json"));

var maps = __importStar(require("../../assets/layers/maps/maps.json"));

var information_boards = __importStar(require("../../assets/layers/information_board/information_board.json"));

var Utils_1 = require("../../Utils");

var ImageCarouselWithUpload_1 = __importDefault(require("../../UI/Image/ImageCarouselWithUpload"));

var ImageCarousel_1 = require("../../UI/Image/ImageCarousel");

var State_1 = require("../../State");

var FromJSON =
/** @class */
function () {
  function FromJSON() {}

  FromJSON.getSharedLayers = function () {
    // We inject a function into state while we are busy
    State_1.State.FromBase64 = FromJSON.FromBase64;
    var sharedLayers = new Map();
    var sharedLayersList = [FromJSON.Layer(drinkingWater), FromJSON.Layer(ghostbikes), FromJSON.Layer(viewpoint), FromJSON.Layer(bike_parking), FromJSON.Layer(bike_repair_station), FromJSON.Layer(birdhides), FromJSON.Layer(nature_reserve), FromJSON.Layer(bike_cafes), FromJSON.Layer(cycling_themed_objects), FromJSON.Layer(bike_shops), FromJSON.Layer(maps), FromJSON.Layer(information_boards)];

    for (var _i = 0, sharedLayersList_1 = sharedLayersList; _i < sharedLayersList_1.length; _i++) {
      var layer = sharedLayersList_1[_i];
      sharedLayers.set(layer.id, layer);
    }

    return sharedLayers;
  };

  FromJSON.FromBase64 = function (layoutFromBase64) {
    return FromJSON.LayoutFromJSON(JSON.parse(atob(layoutFromBase64)));
  };

  FromJSON.LayoutFromJSON = function (json) {
    var _a;

    var _b, _c, _d, _e, _f, _g, _h;

    var tr = FromJSON.Translation;
    var layers = json.layers.map(FromJSON.Layer);
    var roaming = (_c = (_b = json.roamingRenderings) === null || _b === void 0 ? void 0 : _b.map(function (tr, i) {
      return FromJSON.TagRendering(tr, "Roaming rendering " + i);
    })) !== null && _c !== void 0 ? _c : [];

    for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
      var layer = layers_1[_i];

      (_a = layer.elementsToShow).push.apply(_a, roaming);
    }

    var layout = new Layout_1.Layout(json.id, typeof json.language === "string" ? [json.language] : json.language, tr((_d = json.title) !== null && _d !== void 0 ? _d : "Title not defined"), layers, json.startZoom, json.startLat, json.startLon, new Combine_1.default(["<h3>", tr(json.title), "</h3>", tr(json.description)]), undefined, undefined, tr(json.descriptionTail));
    layout.defaultBackground = (_e = json.defaultBackgroundId) !== null && _e !== void 0 ? _e : "osm";
    layout.widenFactor = (_f = json.widenFactor) !== null && _f !== void 0 ? _f : 0.07;
    layout.icon = json.icon;
    layout.maintainer = json.maintainer;
    layout.version = json.version;
    layout.socialImage = json.socialImage;
    layout.description = (_g = tr(json.shortDescription)) !== null && _g !== void 0 ? _g : (_h = tr(json.description)) === null || _h === void 0 ? void 0 : _h.FirstSentence();
    layout.changesetMessage = json.changesetmessage;
    return layout;
  };

  FromJSON.Translation = function (json) {
    if (json === undefined) {
      return undefined;
    }

    if (typeof json === "string") {
      return new Translation_1.default({
        "*": json
      });
    }

    if (json.render !== undefined) {
      console.error("Using a 'render' where a translation is expected. Content is", json.render);
      throw "ERROR: using a 'render' where none is expected";
    }

    var tr = {};
    var keyCount = 0;

    for (var key in json) {
      keyCount++;
      tr[key] = json[key]; // I'm doing this wrong, I know
    }

    if (keyCount == 0) {
      return undefined;
    }

    var transl = new Translation_1.default(tr);
    return transl;
  };

  FromJSON.TagRendering = function (json, propertyeName) {
    return FromJSON.TagRenderingWithDefault(json, propertyeName, undefined);
  };

  FromJSON.TagRenderingWithDefault = function (json, propertyName, defaultValue) {
    var _a, _b, _c;

    if (json === undefined) {
      if (defaultValue !== undefined) {
        return FromJSON.TagRendering(defaultValue, propertyName);
      }

      throw "Tagrendering " + propertyName + " is undefined...";
    }

    if (typeof json === "string") {
      switch (json) {
        case "picture":
          {
            return new ImageCarouselWithUpload_1.default();
          }

        case "pictures":
          {
            return new ImageCarouselWithUpload_1.default();
          }

        case "image":
          {
            return new ImageCarouselWithUpload_1.default();
          }

        case "images":
          {
            return new ImageCarouselWithUpload_1.default();
          }

        case "picturesNoUpload":
          {
            return new ImageCarousel_1.ImageCarouselConstructor();
          }
      }

      return new TagRenderingOptions_1.TagRenderingOptions({
        freeform: {
          key: "id",
          renderTemplate: json,
          template: "$$$"
        }
      });
    } // It's the question that drives us, neo


    var question = FromJSON.Translation(json.question);
    var template = FromJSON.Translation(json.render);
    var freeform = undefined;

    if (((_a = json.freeform) === null || _a === void 0 ? void 0 : _a.key) && json.freeform.key !== "") {
      // Setup the freeform
      if (template === undefined) {
        console.error("Freeform.key is defined, but render is not. This is not allowed.", json);
        throw "Freeform is defined in tagrendering " + propertyName + ", but render is not. This is not allowed.";
      }

      freeform = {
        template: "$" + ((_b = json.freeform.type) !== null && _b !== void 0 ? _b : "string") + "$",
        renderTemplate: template,
        key: json.freeform.key
      };

      if (json.freeform.addExtraTags) {
        freeform.extraTags = new Tags_1.And(json.freeform.addExtraTags.map(FromJSON.SimpleTag));
      }
    } else if (json.render) {
      // Template (aka rendering) is defined, but freeform.key is not. We allow an input as string
      freeform = {
        template: undefined,
        renderTemplate: template,
        key: "id" // every object always has an id

      };
    }

    var mappings = (_c = json.mappings) === null || _c === void 0 ? void 0 : _c.map(function (mapping, i) {
      var k = FromJSON.Tag(mapping.if, "IN mapping #" + i + " of tagrendering " + propertyName);

      if (question !== undefined && !mapping.hideInAnswer && !k.isUsableAsAnswer()) {
        throw "Invalid mapping in " + propertyName + "." + i + ": this mapping uses a regex tag or an OR, but is also answerable. Either mark 'Not an answer option' or only use '=' to map key/values.";
      }

      return {
        k: k,
        txt: FromJSON.Translation(mapping.then),
        hideInAnswer: mapping.hideInAnswer
      };
    });

    if (template === undefined && (mappings === undefined || mappings.length === 0)) {
      console.error("Empty tagrendering detected in " + propertyName + ": no mappings nor template given", json);
      throw "Empty tagrendering " + propertyName + " detected: no mappings nor template given";
    }

    var rendering = new TagRenderingOptions_1.TagRenderingOptions({
      question: question,
      freeform: freeform,
      mappings: mappings,
      multiAnswer: json.multiAnswer
    });

    if (json.condition) {
      var condition = FromJSON.Tag(json.condition, "In tagrendering " + propertyName + ".condition");
      return rendering.OnlyShowIf(condition);
    }

    return rendering;
  };

  FromJSON.SimpleTag = function (json) {
    var tag = Utils_1.Utils.SplitFirst(json, "=");
    return new Tags_1.Tag(tag[0], tag[1]);
  };

  FromJSON.Tag = function (json, context) {
    if (context === void 0) {
      context = "";
    }

    if (json === undefined) {
      throw "Error while parsing a tag: nothing defined. Make sure all the tags are defined and at least one tag is present in a complex expression";
    }

    if (typeof json == "string") {
      var tag = json;

      if (tag.indexOf("!~") >= 0) {
        var split_1 = Utils_1.Utils.SplitFirst(tag, "!~");

        if (split_1[1] === "*") {
          throw "Don't use 'key!~*' - use 'key=' instead (empty string as value (in the tag " + tag + " while parsing " + context + ")";
        }

        return new Tags_1.RegexTag(split_1[0], new RegExp("^" + split_1[1] + "$"), true);
      }

      if (tag.indexOf("~~") >= 0) {
        var split_2 = Utils_1.Utils.SplitFirst(tag, "~~");

        if (split_2[1] === "*") {
          split_2[1] = "..*";
        }

        return new Tags_1.RegexTag(new RegExp("^" + split_2[0] + "$"), new RegExp("^" + split_2[1] + "$"));
      }

      if (tag.indexOf("!=") >= 0) {
        var split_3 = Utils_1.Utils.SplitFirst(tag, "!=");

        if (split_3[1] === "*") {
          split_3[1] = "..*";
        }

        return new Tags_1.RegexTag(split_3[0], new RegExp("^" + split_3[1] + "$"), true);
      }

      if (tag.indexOf("~") >= 0) {
        var split_4 = Utils_1.Utils.SplitFirst(tag, "~");

        if (split_4[1] === "*") {
          split_4[1] = "..*";
        }

        return new Tags_1.RegexTag(split_4[0], new RegExp("^" + split_4[1] + "$"));
      }

      var split = Utils_1.Utils.SplitFirst(tag, "=");

      if (split[1] == "*") {
        throw "Error while parsing tag '" + tag + "' in " + context + ": detected a wildcard on a normal value. Use a regex pattern instead";
      }

      return new Tags_1.Tag(split[0], split[1]);
    }

    if (json.and !== undefined) {
      return new Tags_1.And(json.and.map(function (t) {
        return FromJSON.Tag(t, context);
      }));
    }

    if (json.or !== undefined) {
      return new Tags_1.Or(json.or.map(function (t) {
        return FromJSON.Tag(t, context);
      }));
    }
  };

  FromJSON.Layer = function (json) {
    if (typeof json === "string") {
      var cached = FromJSON.sharedLayers.get(json);

      if (cached) {
        return cached;
      }

      throw "Layer " + json + " not yet loaded...";
    }

    try {
      return FromJSON.LayerUncaught(json);
    } catch (e) {
      throw "While parsing layer " + json.id + ": " + e;
    }
  };

  FromJSON.LayerUncaught = function (json) {
    var _a, _b, _c, _d;

    var tr = FromJSON.Translation;
    var overpassTags = FromJSON.Tag(json.overpassTags, "overpasstags for layer " + json.id);
    var icon = FromJSON.TagRenderingWithDefault(json.icon, "icon", "./assets/bug.svg");
    var iconSize = FromJSON.TagRenderingWithDefault(json.iconSize, "iconSize", "40,40,center");
    var color = FromJSON.TagRenderingWithDefault(json.color, "color", "#0000ff");
    var width = FromJSON.TagRenderingWithDefault(json.width, "width", "10");

    if (json.title === "Layer") {
      json.title = {};
    }

    var title = FromJSON.TagRendering(json.title, "Popup title");
    var tagRenderingDefs = (_a = json.tagRenderings) !== null && _a !== void 0 ? _a : [];
    var hasImageElement = false;

    for (var _i = 0, tagRenderingDefs_1 = tagRenderingDefs; _i < tagRenderingDefs_1.length; _i++) {
      var tagRenderingDef = tagRenderingDefs_1[_i];

      if (typeof tagRenderingDef !== "string") {
        continue;
      }

      var str = tagRenderingDef;

      if (tagRenderingDef.indexOf("images") >= 0 || str.indexOf("pictures") >= 0) {
        hasImageElement = true;
        break;
      }
    }

    if (!hasImageElement) {
      tagRenderingDefs = __spreadArrays(["images"], tagRenderingDefs);
    }

    var tagRenderings = tagRenderingDefs.map(function (tr, i) {
      return FromJSON.TagRendering(tr, "Tagrendering #" + i);
    });
    var renderTags = {
      "id": "node/-1"
    };
    var presets = (_c = (_b = json === null || json === void 0 ? void 0 : json.presets) === null || _b === void 0 ? void 0 : _b.map(function (preset) {
      return {
        title: tr(preset.title),
        description: tr(preset.description),
        tags: preset.tags.map(FromJSON.SimpleTag)
      };
    })) !== null && _c !== void 0 ? _c : [];

    function style(tags) {
      var iconSizeStr = iconSize.GetContent(tags).txt.split(",");
      var iconwidth = Number(iconSizeStr[0]);
      var iconheight = Number(iconSizeStr[1]);
      var iconmode = iconSizeStr[2];
      var iconAnchor = [iconwidth / 2, iconheight / 2]; // x, y
      // If iconAnchor is set to [0,0], then the top-left of the icon will be placed at the geographical location

      if (iconmode.indexOf("left") >= 0) {
        iconAnchor[0] = 0;
      }

      if (iconmode.indexOf("right") >= 0) {
        iconAnchor[0] = iconwidth;
      }

      if (iconmode.indexOf("top") >= 0) {
        iconAnchor[1] = 0;
      }

      if (iconmode.indexOf("bottom") >= 0) {
        iconAnchor[1] = iconheight;
      } // the anchor is always set from the center of the point
      // x, y with x going right and y going down if the values are bigger


      var popupAnchor = [0, 3 - iconAnchor[1]];
      return {
        color: color.GetContent(tags).txt,
        weight: width.GetContent(tags).txt,
        icon: {
          iconUrl: icon.GetContent(tags).txt,
          iconSize: [iconwidth, iconheight],
          popupAnchor: popupAnchor,
          iconAnchor: iconAnchor
        }
      };
    }

    var layer = new LayerDefinition_1.LayerDefinition(json.id, {
      name: tr(json.name),
      description: tr(json.description),
      icon: icon.GetContent(renderTags).txt,
      overpassFilter: overpassTags,
      title: title,
      minzoom: json.minzoom,
      presets: presets,
      elementsToShow: tagRenderings,
      style: style,
      wayHandling: json.wayHandling
    });
    layer.maxAllowedOverlapPercentage = (_d = json.hideUnderlayingFeaturesMinPercentage) !== null && _d !== void 0 ? _d : 0;
    return layer;
  };

  FromJSON.sharedLayers = FromJSON.getSharedLayers();
  return FromJSON;
}();

exports.FromJSON = FromJSON;
},{"../Layout":"Customizations/Layout.ts","../../Logic/Tags":"Logic/Tags.ts","../TagRenderingOptions":"Customizations/TagRenderingOptions.ts","../../UI/i18n/Translation":"UI/i18n/Translation.ts","../LayerDefinition":"Customizations/LayerDefinition.ts","../../UI/Base/Combine":"UI/Base/Combine.ts","../../assets/layers/drinking_water/drinking_water.json":"assets/layers/drinking_water/drinking_water.json","../../assets/layers/ghost_bike/ghost_bike.json":"assets/layers/ghost_bike/ghost_bike.json","../../assets/layers/viewpoint/viewpoint.json":"assets/layers/viewpoint/viewpoint.json","../../assets/layers/bike_parking/bike_parking.json":"assets/layers/bike_parking/bike_parking.json","../../assets/layers/bike_repair_station/bike_repair_station.json":"assets/layers/bike_repair_station/bike_repair_station.json","../../assets/layers/bird_hide/birdhides.json":"assets/layers/bird_hide/birdhides.json","../../assets/layers/nature_reserve/nature_reserve.json":"assets/layers/nature_reserve/nature_reserve.json","../../assets/layers/bike_cafe/bike_cafes.json":"assets/layers/bike_cafe/bike_cafes.json","../../assets/layers/cycling_themed_object/cycling_themed_objects.json":"assets/layers/cycling_themed_object/cycling_themed_objects.json","../../assets/layers/bike_shop/bike_shop.json":"assets/layers/bike_shop/bike_shop.json","../../assets/layers/maps/maps.json":"assets/layers/maps/maps.json","../../assets/layers/information_board/information_board.json":"assets/layers/information_board/information_board.json","../../Utils":"Utils.ts","../../UI/Image/ImageCarouselWithUpload":"UI/Image/ImageCarouselWithUpload.ts","../../UI/Image/ImageCarousel":"UI/Image/ImageCarousel.ts","../../State":"State.ts"}],"assets/themes/bookcases/Bookcases.json":[function(require,module,exports) {
module.exports = {
  "id": "bookcases",
  "maintainer": "MapComplete",
  "version": "2020-08-29",
  "language": ["en", "nl", "de"],
  "title": {
    "en": "Open Bookcase Map",
    "nl": "Open Boekenruilkastenkaart",
    "de": "Öffentliche Bücherschränke Karte"
  },
  "description": {
    "en": "A public bookcase is a small streetside cabinet, box, old phone boot or some other objects where books are stored. Everyone can place or take a book. This map aims to collect all these bookcases. You can discover new bookcases nearby and, with a free OpenStreetMap account, quickly add your favourite bookcases.",
    "nl": "Een boekenruilkast is een kastje waar iedereen een boek kan nemen of achterlaten. Op deze kaart kan je deze boekenruilkasten terugvinden en met een gratis OpenStreetMap-account, ook boekenruilkasten toevoegen of informatie verbeteren",
    "de": "Ein öffentlicher Bücherschrank ist ein kleiner Bücherschrank am Straßenrand, ein Kasten, eine alte Telefonzelle oder andere Gegenstände, in denen Bücher aufbewahrt werden. Jeder kann ein Buch hinstellen oder mitnehmen. Diese Karte zielt darauf ab, all diese Bücherschränke zu sammeln. Sie können neue Bücherschränke in der Nähe entdecken und mit einem kostenlosen OpenStreetMap-Account schnell Ihre Lieblingsbücherschränke hinzufügen."
  },
  "icon": "./assets/themes/bookcases/bookcase.svg",
  "socialImage": null,
  "startLat": 0,
  "startLon": 0,
  "startZoom": 1,
  "widenFactor": 0.05,
  "roamingRenderings": [],
  "layers": [{
    "id": "bookcases",
    "name": {
      "en": "Bookcases",
      "nl": "Boekenruilkastjes",
      "de": "Bücherschränke"
    },
    "description": {
      "en": "A streetside cabinet with books, accessible to anyone",
      "nl": "Een straatkastje met boeken voor iedereen",
      "de": "Ein Bücherschrank am Straßenrand mit Büchern, für jedermann zugänglich"
    },
    "overpassTags": "amenity=public_bookcase",
    "minzoom": 12,
    "title": {
      "render": {
        "en": "Bookcase",
        "nl": "Boekenruilkast",
        "de": "Bücherschrank"
      },
      "mappings": [{
        "if": "name~*",
        "then": {
          "en": "Public bookcase <i>{name}</i>",
          "nl": "Boekenruilkast <i>{name}</i>",
          "de": "Öffentlicher Bücherschrank <i>{name}</i>"
        }
      }]
    },
    "icon": {
      "render": "./assets/themes/bookcases/bookcase.svg"
    },
    "color": {
      "render": "#0000ff"
    },
    "width": {
      "render": "8"
    },
    "presets": [{
      "title": {
        "en": "Bookcase",
        "nl": "Boekenruilkast",
        "de": "Bücherschrank"
      },
      "tags": ["amenity=public_bookcase"]
    }],
    "tagRenderings": ["images", {
      "render": {
        "en": "The name of this bookcase is {name}",
        "nl": "De naam van dit boekenruilkastje is {name}",
        "de": "Der Name dieses Bücherschrank lautet {name}"
      },
      "question": {
        "en": "What is the name of this public bookcase?",
        "nl": "Wat is de naam van dit boekenuilkastje?",
        "de": "Wie heißt dieser öffentliche Bücherschrank?"
      },
      "freeform": {
        "key": "name"
      },
      "mappings": [{
        "if": {
          "and": ["noname=yes", "name="]
        },
        "then": {
          "en": "This bookcase doesn't have a name",
          "nl": "Dit boekenruilkastje heeft geen naam",
          "de": "Dieser Bücherschrank hat keinen Namen"
        }
      }]
    }, {
      "render": {
        "en": "{capacity} books fit in this bookcase",
        "nl": "Er passen {capacity} boeken",
        "de": "{capacity} Bücher passen in diesen Bücherschrank"
      },
      "question": {
        "en": "How many books fit into this public bookcase?",
        "nl": "Hoeveel boeken passen er in dit boekenruilkastje?",
        "de": "Wie viele Bücher passen in diesen öffentlichen Bücherschrank?"
      },
      "freeform": {
        "key": "capacity",
        "type": "nat"
      }
    }, {
      "question": {
        "en": "What kind of books can be found in this public bookcase?",
        "nl": "Voor welke doelgroep zijn de meeste boeken in dit boekenruilkastje?",
        "de": "Welche Art von Büchern sind in diesem öffentlichen Bücherschrank zu finden?"
      },
      "mappings": [{
        "if": "books=children",
        "then": {
          "en": "Mostly children books",
          "nl": "Voornamelijk kinderboeken",
          "de": "Vorwiegend Kinderbücher"
        }
      }, {
        "if": "books=adults",
        "then": {
          "en": "Mostly books for adults",
          "nl": "Voornamelijk boeken voor volwassenen",
          "de": "Vorwiegend Bücher für Erwachsene"
        }
      }, {
        "if": "books=children;adults",
        "then": {
          "en": "Both books for kids and adults",
          "nl": "Boeken voor zowel kinderen als volwassenen",
          "de": "Sowohl Bücher für Kinder als auch für Erwachsene"
        }
      }]
    }, {
      "question": {
        "en": "Is this bookcase located outdoors?",
        "nl": "Staat dit boekenruilkastje binnen of buiten?",
        "de": "Befindet sich dieser Bücherschrank im Freien?"
      },
      "mappings": [{
        "then": {
          "en": "This bookcase is located indoors",
          "nl": "Dit boekenruilkastje staat binnen",
          "de": "Dieser Bücherschrank befindet sich im Innenbereich"
        },
        "if": "indoor=yes"
      }, {
        "then": {
          "en": "This bookcase is located outdoors",
          "nl": "Dit boekenruilkastje staat buiten",
          "de": "Dieser Bücherschrank befindet sich im Freien"
        },
        "if": "indoor=no"
      }, {
        "then": {
          "en": "This bookcase is located outdoors",
          "nl": "Dit boekenruilkastje staat buiten",
          "de": "Dieser Bücherschrank befindet sich im Freien"
        },
        "if": "indoor=",
        "hideInAnswer": true
      }]
    }, {
      "question": {
        "en": "Is this public bookcase freely accessible?",
        "nl": "Is dit boekenruilkastje publiek toegankelijk?",
        "de": "Ist dieser öffentliche Bücherschrank frei zugänglich?"
      },
      "condition": "indoor=yes",
      "mappings": [{
        "then": {
          "en": "Publicly accessible",
          "nl": "Publiek toegankelijk",
          "de": "Öffentlich zugänglich"
        },
        "if": "access=yes"
      }, {
        "then": {
          "en": "Only accessible to customers",
          "nl": "Enkel toegankelijk voor klanten",
          "de": "Nur für Kunden zugänglich"
        },
        "if": "access=customers"
      }]
    }, {
      "question": {
        "en": "Who maintains this public bookcase?",
        "nl": "Wie is verantwoordelijk voor dit boekenruilkastje?",
        "de": "Wer unterhält diesen öffentlichen Bücherschrank?"
      },
      "render": {
        "en": "Operated by {operator}",
        "nl": "Onderhouden door {operator}",
        "de": "Betrieben von {operator}"
      },
      "freeform": {
        "type": "string",
        "key": "operator"
      }
    }, {
      "question": {
        "en": "Is this public bookcase part of a bigger network?",
        "nl": "Is dit boekenruilkastje deel van een netwerk?",
        "de": "Ist dieser öffentliche Bücherschrank Teil eines größeren Netzwerks?"
      },
      "render": {
        "en": "This public bookcase is part of {brand}",
        "nl": "Dit boekenruilkastje is deel van het netwerk {brand}",
        "de": "Dieser Bücherschrank ist Teil von {brand}"
      },
      "condition": "ref=",
      "freeform": {
        "key": "brand"
      },
      "mappings": [{
        "then": {
          "en": "Part of the network 'Little Free Library'",
          "nl": "Deel van het netwerk 'Little Free Library'",
          "de": "Teil des Netzwerks 'Little Free Library'"
        },
        "if": "brand=Little Free Library"
      }, {
        "if": {
          "and": ["nobrand=yes", "brand="]
        },
        "then": {
          "en": "This public bookcase is not part of a bigger network",
          "nl": "Dit boekenruilkastje maakt geen deel uit van een netwerk",
          "de": "Dieser öffentliche Bücherschrank ist nicht Teil eines größeren Netzwerks"
        }
      }]
    }, {
      "render": {
        "en": "The reference number of this public bookcase within {brand} is {ref}",
        "nl": "Het referentienummer binnen {brand} is {ref}",
        "de": "Die Referenznummer dieses öffentlichen Bücherschranks innerhalb {brand} lautet {ref}"
      },
      "question": {
        "en": "What is the reference number of this public bookcase?",
        "nl": "Wat is het referentienummer van dit boekenruilkastje?",
        "de": "Wie lautet die Referenznummer dieses öffentlichen Bücherschranks?"
      },
      "condition": "brand~*",
      "freeform": {
        "key": "ref"
      },
      "mappings": [{
        "then": {
          "en": "This bookcase is not part of a bigger network",
          "nl": "Dit boekenruilkastje maakt geen deel uit van een netwerk",
          "de": "Dieser Bücherschrank ist nicht Teil eines größeren Netzwerks"
        },
        "if": {
          "and": ["nobrand=yes", "brand=", "ref="]
        }
      }]
    }, {
      "question": {
        "en": "When was this public bookcase installed?",
        "nl": "Op welke dag werd dit boekenruilkastje geinstalleerd?",
        "de": "Wann wurde dieser öffentliche Bücherschrank installiert?"
      },
      "render": {
        "en": "Installed on {start_date}",
        "nl": "Geplaatst op {start_date}",
        "de": "Installiert am {start_date}"
      },
      "freeform": {
        "key": "start_date",
        "type": "date"
      }
    }, {
      "render": {
        "en": "More info on <a href='{website}' target='_blank'>the website</a>",
        "nl": "Meer info op <a href='{website}' target='_blank'>de website</a>",
        "de": "Weitere Informationen auf <a href='{website}' target='_blank'>der Webseite</a>"
      },
      "question": {
        "en": "Is there a website with more information about this public bookcase?",
        "nl": "Is er een website over dit boekenruilkastje?",
        "de": "Gibt es eine Webseite mit weiteren Informationen über diesen öffentlichen Bücherschrank?"
      },
      "freeform": {
        "key": "website",
        "type": "url"
      }
    }]
  }]
};
},{}],"assets/themes/aed/aed.json":[function(require,module,exports) {
module.exports = {
  "id": "aed",
  "title": {
    "en": "Open AED Map",
    "fr": "Carte AED",
    "nl": "Open AED-kaart",
    "de": "AED-Karte öffnen"
  },
  "maintainer": "MapComplete",
  "icon": "./assets/themes/aed/aed.svg",
  "description": {
    "en": "On this map, one can find and mark nearby defibrillators",
    "fr": "Sur cette carte, vous pouvez trouver et améliorer les informations sur les défibrillateurs",
    "nl": "Op deze kaart kan je informatie over AEDs vinden en verbeteren",
    "de": "Auf dieser Karte kann man nahe gelegene Defibrillatoren finden und markieren"
  },
  "language": ["en", "fr", "nl", "de"],
  "version": "2020-08-29",
  "startLat": 0,
  "startLon": 0,
  "startZoom": 12,
  "layers": [{
    "id": "Defibrillator",
    "name": {
      "en": "Defibrillators",
      "fr": "Défibrillateurs",
      "nl": "Defibrillatoren",
      "de": "Defibrillatoren"
    },
    "overpassTags": "emergency=defibrillator",
    "minzoom": 12,
    "title": {
      "render": {
        "en": "Defibrillator",
        "fr": "Défibrillateur",
        "nl": "Defibrillator",
        "de": "Defibrillator"
      }
    },
    "icon": "./assets/themes/aed/aed.svg",
    "color": "#0000ff",
    "presets": [{
      "title": {
        "en": "Defibrillator",
        "fr": "Défibrillateur",
        "nl": "Defibrillator",
        "de": "Defibrillator"
      },
      "tags": ["emergency=defibrillator"]
    }],
    "tagRenderings": ["pictures", {
      "question": {
        "en": "Is this defibrillator located indoors?",
        "fr": "Ce défibrillateur est-il disposé en intérieur ?",
        "nl": "Hangt deze defibrillator binnen of buiten?",
        "de": "Befindet sich dieser Defibrillator im Gebäude?"
      },
      "mappings": [{
        "if": "indoor=yes",
        "then": {
          "en": "This defibrillator is located indoors",
          "fr": "Ce défibrillateur est en intérieur (dans un batiment)",
          "nl": "Deze defibrillator bevindt zich in een gebouw",
          "de": "Dieser Defibrillator befindet sich im Gebäude"
        }
      }, {
        "if": "indoor=no",
        "then": {
          "en": "This defibrillator is located outdoors",
          "fr": "Ce défibrillateur est situé en extérieur",
          "nl": "Deze defibrillator hangt buiten",
          "de": "Dieser Defibrillator befindet sich im Freien"
        }
      }]
    }, {
      "question": {
        "en": "Is this defibrillator freely accessible?",
        "fr": "Ce défibrillateur est-il librement accessible?",
        "nl": "Is deze defibrillator vrij toegankelijk?",
        "de": "Ist dieser Defibrillator frei zugänglich?"
      },
      "render": {
        "en": "Access is {access}",
        "fr": "{access} accessible",
        "nl": "Toegankelijkheid is {access}",
        "de": "Zugang ist {access}"
      },
      "condition": "indoor=yes",
      "freeform": {
        "key": "access",
        "addExtraTags": ["fixme=Freeform field used for access - doublecheck the value"]
      },
      "mappings": [{
        "if": "access=yes",
        "then": {
          "en": "Publicly accessible",
          "fr": "Librement accessible",
          "nl": "Publiek toegankelijk",
          "de": "Öffentlich zugänglich"
        }
      }, {
        "if": "access=public",
        "then": {
          "en": "Publicly accessible",
          "fr": "Librement accessible",
          "nl": "Publiek toegankelijk",
          "de": "Öffentlich zugänglich"
        },
        "hideInAnswer": true
      }, {
        "if": "access=customers",
        "then": {
          "en": "Only accessible to customers",
          "fr": "Réservé aux clients du lieu",
          "nl": "Enkel toegankeleijk voor klanten",
          "de": "Nur für Kunden zugänglich"
        }
      }, {
        "if": "access=private",
        "then": {
          "en": "Not accessible to the general public (e.g. only accesible to staff, the owners, ...)",
          "fr": "Non accessible au public (par exemple réservé au personnel, au propriétaire, ...)",
          "nl": "Niet toegankelijk voor het publiek (bv. enkel voor personneel, de eigenaar, ...)",
          "de": "Nicht für die Öffentlichkeit zugänglich (z.B. nur für das Personal, die Eigentümer, ...)"
        }
      }]
    }, {
      "question": {
        "en": "On which floor is this defibrillator located?",
        "fr": "À quel étage est situé ce défibrillateur?",
        "nl": "Op welke verdieping bevindt deze defibrillator zich?",
        "de": "In welchem Stockwerk befindet sich dieser Defibrillator?"
      },
      "condition": {
        "and": ["indoor=yes", "access!~private"]
      },
      "freeform": {
        "key": "level",
        "type": "int"
      },
      "render": {
        "en": "This defibrallator is on floor {level}",
        "fr": "Ce défibrillateur est à l'étage {level}",
        "nl": "De defibrillator bevindt zicht op verdieping {level}",
        "de": "Dieser Defibrallator befindet sich im {level}. Stockwerk"
      }
    }, {
      "render": "{defibrillator:location}",
      "question": {
        "en": "Please give some explanation on where the defibrillator can be found",
        "fr": "Veuillez indiquez plus précisément où se situe le défibrillateur",
        "nl": "Gelieve meer informatie te geven over de exacte locatie van de defibrillator",
        "de": "Bitte geben Sie einige Erläuterungen dazu, wo der Defibrillator zu finden ist"
      },
      "freeform": {
        "type": "text",
        "key": "defibrillator:location"
      }
    }]
  }]
};
},{}],"assets/themes/toilets/toilets.json":[function(require,module,exports) {
module.exports = {
  "id": "toilets",
  "title": {
    "en": "Open Toilet Map",
    "de": "Offene Toilette Karte"
  },
  "description": {
    "en": "A map of public toilets",
    "de": "Eine Karte der öffentlichen Toiletten"
  },
  "maintainer": "MapComplete",
  "version": "2020-08-29",
  "language": ["en", "de"],
  "startZoom": 12,
  "startLat": 51.2095,
  "startLon": 3.2222,
  "widenFactor": 0.05,
  "icon": "./assets/themes/toilets/toilets.svg",
  "layers": [{
    "id": "Toilet",
    "name": {
      "en": "Toilets",
      "de": "Toiletten"
    },
    "overpassTags": "amenity=toilets",
    "title": {
      "render": {
        "en": "Toilet",
        "de": "Toilette"
      }
    },
    "icon": {
      "render": "./assets/themes/toilets/toilets.svg",
      "mappings": [{
        "if": "wheelchair=yes",
        "then": "./assets/themes/toilets/wheelchair.svg"
      }]
    },
    "color": {
      "render": "#0000ff"
    },
    "minzoom": 12,
    "wayHandling": 2,
    "presets": [{
      "title": {
        "en": "Toilet",
        "de": "Toilette"
      },
      "tags": ["amenity=toilets"],
      "description": {
        "en": "A publicly accessible toilet or restroom",
        "de": "Eine öffentlich zugängliche Toilette"
      }
    }, {
      "title": {
        "en": "Toilets with wheelchair accessible toilet",
        "de": "Toiletten mit rollstuhlgerechter Toilette"
      },
      "tags": ["amenity=toilets", "wheelchair=yes"],
      "description": {
        "en": "A restroom which has at least one wheelchair-accessible toilet",
        "de": "Eine Toilettenanlage mit mindestens einer rollstuhlgerechten Toilette"
      }
    }],
    "tagRenderings": ["pictures", {
      "question": {
        "en": "Are these toilets publicly accessible?",
        "de": "Sind diese Toiletten öffentlich zugänglich?"
      },
      "render": {
        "en": "Access is {access}",
        "de": "Zugang ist {access}"
      },
      "freeform": {
        "key": "access",
        "addExtraTags": ["fixme=the tag access was filled out by the user and might need refinement"]
      },
      "mappings": [{
        "if": "access=yes",
        "then": {
          "en": "Public access",
          "de": "Öffentlicher Zugang"
        }
      }, {
        "if": "access=customers",
        "then": {
          "en": "Only access to customers",
          "de": "Nur Zugang für Kunden"
        }
      }, {
        "if": "access=no",
        "then": {
          "en": "Not accessible",
          "de": "Nicht zugänglich"
        }
      }, {
        "if": "access=key",
        "then": {
          "en": "Accessible, but one has to ask a key to enter",
          "de": "Zugänglich, aber man muss einen Schlüssel für die Eingabe verlangen"
        }
      }]
    }, {
      "question": {
        "en": "Are these toilets free to use?",
        "de": "Können diese Toiletten kostenlos benutzt werden?"
      },
      "mappings": [{
        "then": {
          "en": "These are paid toilets",
          "de": "Dies sind bezahlte Toiletten"
        },
        "if": "fee=yes"
      }, {
        "if": "fee=no",
        "then": {
          "en": "Free to use",
          "de": "Kostenlose Nutzung"
        }
      }]
    }, {
      "question": {
        "en": "How much does one have to pay for these toilets?",
        "de": "Wie viel muss man für diese Toiletten bezahlen?"
      },
      "render": {
        "en": "The fee is {charge}",
        "de": "Die Gebühr beträgt {charge}"
      },
      "condition": "fee=yes",
      "freeform": {
        "key": "charge",
        "type": "string"
      }
    }, {
      "question": {
        "en": "Is there a dedicated toilet for wheelchair users",
        "de": "Gibt es eine Toilette für Rollstuhlfahrer?"
      },
      "mappings": [{
        "then": {
          "en": "There is a dedicated toilet for wheelchair users",
          "de": "Es gibt eine Toilette für Rollstuhlfahrer"
        },
        "if": "wheelchair=yes"
      }, {
        "if": "wheelchair=no",
        "then": {
          "en": "No wheelchair access",
          "de": "Kein Zugang für Rollstuhlfahrer"
        }
      }]
    }, {
      "question": {
        "en": "Which kind of toilets are this?",
        "de": "Welche Art von Toiletten sind das?"
      },
      "mappings": [{
        "if": "toilets:position=seated",
        "then": {
          "en": "There are only seated toilets",
          "de": "Es gibt nur Sitztoiletten"
        }
      }, {
        "if": "toilets:position=urinals",
        "then": {
          "en": "There are only urinals here",
          "de": "Hier gibt es nur Pissoirs"
        }
      }, {
        "if": "toilets:position=squat",
        "then": {
          "en": "There are only squat toilets here",
          "de": "Es gibt hier nur Hocktoiletten."
        }
      }, {
        "if": "toilets:position=seated;urinals",
        "then": {
          "en": "Both seated toilets and urinals are available here",
          "de": "Sowohl Sitztoiletten als auch Pissoirs sind hier verfügbar"
        }
      }]
    }, {
      "question": {
        "en": "Is a changing table (to change diapers) available?",
        "de": "Ist ein Wickeltisch (zum Wechseln der Windeln) vorhanden?"
      },
      "mappings": [{
        "then": {
          "en": "A changing table is available",
          "de": "Ein Wickeltisch ist verfügbar"
        },
        "if": "changing_table=yes"
      }, {
        "if": "changing_table=no",
        "then": {
          "en": "No changing table is available",
          "de": "Es ist kein Wickeltisch verfügbar"
        }
      }]
    }, {
      "question": {
        "en": "Where is the changing table located?",
        "de": "Wo befindet sich der Wickeltisch?"
      },
      "render": {
        "en": "The changing table is located at {changing_table:location}",
        "de": "Die Wickeltabelle befindet sich in {changing_table:location}"
      },
      "condition": "changing_table=yes",
      "freeform": {
        "key": "changing_table:location"
      },
      "mappings": [{
        "then": {
          "en": "The changing table is in the toilet for women. ",
          "de": "Der Wickeltisch befindet sich in der Damentoilette. "
        },
        "if": "changing_table:location=female_toilet"
      }, {
        "then": {
          "en": "The changing table is in the toilet for men. ",
          "de": "Der Wickeltisch befindet sich in der Herrentoilette. "
        },
        "if": "changing_table:location=male_toilet"
      }, {
        "if": "changing_table:location=wheelchair_toilet",
        "then": {
          "en": "The changing table is in the toilet for wheelchair users. ",
          "de": "Der Wickeltisch befindet sich in der Toilette für Rollstuhlfahrer. "
        }
      }, {
        "if": "changing_table:location=dedicated_room",
        "then": {
          "en": "The changing table is in a dedicated room. ",
          "de": "Der Wickeltisch befindet sich in einem eigenen Raum. "
        }
      }]
    }]
  }]
};
},{}],"assets/themes/artwork/artwork.json":[function(require,module,exports) {
module.exports = {
  "id": "artworks",
  "version": "2020-08-30",
  "title": {
    "en": "Open Artwork Map",
    "nl": "Kunstwerkenkaart",
    "de": "Freie Kunstwerk-Karte"
  },
  "description": {
    "en": "Welcome to Open Artwork Map, a map of statues, busts, grafittis, ... all over the world",
    "nl": "Welkom op de Open Kunstwerken Kaart",
    "de": "Willkommen bei der Freien Kunstwerk-Karte, einer Karte von Statuen, Büsten, Grafitti, ... auf der ganzen Welt"
  },
  "language": ["en", "nl", "fr", "de"],
  "icon": "./assets/themes/artwork/artwork.svg",
  "maintainer": "MapComplete",
  "startZoom": 12,
  "startLat": 0,
  "startLon": 0,
  "layers": [{
    "id": "artwork",
    "name": {
      "en": "Artworks",
      "nl": "Kunstwerken",
      "fr": "Oeuvres d'art",
      "de": "Kunstwerke"
    },
    "overpassTags": "tourism=artwork",
    "title": {
      "render": {
        "en": "Artwork",
        "nl": "Kunstwerk",
        "fr": "Oeuvre d'art",
        "de": "Kunstwerk"
      },
      "mappings": [{
        "if": "name~*",
        "then": {
          "en": "Artwork <i>{name}</i>",
          "nl": "Kunstwerk <i>{name}</i>",
          "fr": "Oeuvre d'art <i>{name}</i>",
          "de": "Kunstwerk <i>{name}</i>"
        }
      }]
    },
    "icon": {
      "render": "./assets/themes/artwork/artwork.svg"
    },
    "color": {
      "render": "#0000ff"
    },
    "width": {
      "render": "10"
    },
    "description": {
      "en": "Diverse pieces of artwork",
      "nl": "Verschillende soorten kunstwerken",
      "de": "Verschiedene Kunstwerke"
    },
    "minzoom": 12,
    "wayHandling": 2,
    "presets": [{
      "tags": ["tourism=artwork"],
      "title": {
        "en": "Artwork",
        "nl": "Kunstwerk",
        "fr": "Oeuvre d'art",
        "de": "Kunstwerk"
      }
    }],
    "tagRenderings": ["pictures", {
      "render": {
        "en": "This is a {artwork_type}",
        "nl": "Dit is een {artwork_type}",
        "fr": "{artwork_type}",
        "de": "Dies ist ein {artwork_type}"
      },
      "question": {
        "en": "What is the type of this artwork?",
        "nl": "Wat voor soort kunstwerk is dit?",
        "fr": "Quel est le type de cette oeuvre d'art?",
        "de": "Was ist die Art dieses Kunstwerks?"
      },
      "freeform": {
        "key": "artwork_type",
        "addExtraTags": ["fixme=Artowrk type was added with the freeform, might need another check"]
      },
      "mappings": [{
        "if": "artwork_type=architecture",
        "then": {
          "en": "Architecture",
          "nl": "Architectuur",
          "fr": "Architecture",
          "de": "Architektur"
        }
      }, {
        "if": "artwork_type=mural",
        "then": {
          "en": "Mural",
          "nl": "Muurschildering",
          "fr": "Mural",
          "de": "Wandbild"
        }
      }, {
        "if": "artwork_type=painting",
        "then": {
          "en": "Painting",
          "nl": "Schilderij",
          "fr": "Peinture",
          "de": "Malerei"
        }
      }, {
        "if": "artwork_type=sculpture",
        "then": {
          "en": "Sculpture",
          "nl": "Beeldhouwwerk",
          "fr": "Sculpture",
          "de": "Skulptur"
        }
      }, {
        "if": "artwork_type=statue",
        "then": {
          "en": "Statue",
          "nl": "Standbeeld",
          "fr": "Statue",
          "de": "Statue"
        }
      }, {
        "if": "artwork_type=bust",
        "then": {
          "en": "Bust",
          "nl": "Buste",
          "fr": "Buste",
          "de": "Büste"
        }
      }, {
        "if": "artwork_type=stone",
        "then": {
          "en": "Stone",
          "nl": "Steen",
          "fr": "Rocher",
          "de": "Stein"
        }
      }, {
        "if": "artwork_type=installation",
        "then": {
          "en": "Installation",
          "nl": "Installatie",
          "fr": "Installation",
          "de": "Installation"
        }
      }, {
        "if": "artwork_type=graffiti",
        "then": {
          "en": "Graffiti",
          "nl": "Graffiti",
          "fr": "Graffiti",
          "de": "Graffiti"
        }
      }, {
        "if": "artwork_type=relief",
        "then": {
          "en": "Relief",
          "nl": "Reliëf",
          "fr": "Relief",
          "de": "Relief"
        }
      }, {
        "if": "artwork_type=azulejo",
        "then": {
          "en": "Azulejo (Spanish decorative tilework)",
          "nl": "Azulejo (Spaanse siertegels)",
          "fr": "Azulejo",
          "de": "Azulejo (spanische dekorative Fliesenarbeit)"
        }
      }, {
        "if": "artwork_type=tilework",
        "then": {
          "en": "Tilework",
          "nl": "Tegelwerk",
          "fr": "Carrelage",
          "de": "Fliesenarbeit"
        }
      }]
    }, {
      "question": {
        "en": "Which artist created this?",
        "nl": "Welke artist creëerde dit kunstwerk?",
        "fr": "Quel artiste a créé cela?",
        "de": "Welcher Künstler hat das geschaffen?"
      },
      "render": {
        "en": "Created by {artist_name}",
        "nl": "Gecreëerd door {artist_name}",
        "fr": "Créé par {artist_name}",
        "de": "Erstellt von {artist_name}"
      },
      "freeform": {
        "key": "artist_name"
      }
    }, {
      "question": {
        "en": "On which website is more information about this artwork?",
        "nl": "Op welke website kan men meer informatie vinden over dit kunstwerk?",
        "fr": "Sur quel site web pouvons-nous trouver plus d'informations sur cette œuvre d'art?",
        "de": "Auf welcher Website gibt es mehr Informationen über dieses Kunstwerk?"
      },
      "render": {
        "en": "More information on <a href='{website}' target='_blank'>this website</a>",
        "nl": "Meer informatie op <a href='{website}' target='_blank'>deze website</a>",
        "fr": "Plus d'info <a href='{website}' target='_blank'>sûr ce site web</a>",
        "de": "Weitere Informationen auf <a href='{website}' target='_blank'>dieser Webseite</a>"
      },
      "freeform": {
        "key": "website",
        "type": "url"
      }
    }, {
      "question": {
        "en": "Which wikidata-entry corresponds with <b>this artwork</b>?",
        "fr": "Quelle entrée wikidata correspond à <b>cette œuvre d'art</b> ?",
        "nl": "Welk wikidata-item beschrijft dit kunstwerk?",
        "de": "Welcher Wikidata-Eintrag entspricht <b>diesem Kunstwerk</b>?"
      },
      "render": {
        "en": "Corresponds with <a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'>{wikidata}</a>",
        "nl": "Komt overeen met <a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'>{wikidata}</a>",
        "fr": "Correspond à <a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'>{wikidata}</a>",
        "de": "Entspricht <a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'>{wikidata}</a>"
      },
      "freeform": {
        "key": "wikidata",
        "type": "wikidata"
      }
    }]
  }]
};
},{}],"assets/themes/cyclestreets/cyclestreets.json":[function(require,module,exports) {
module.exports = {
  "id": "fietsstraten",
  "version": "2020-08-30",
  "title": {
    "nl": "Fietsstraten"
  },
  "shortDescription": {
    "nl": "Een kaart met alle gekende fietsstraten"
  },
  "description": {
    "nl": "Een fietsstraat is een straat waar <ul><li><b>automobilisten geen fietsers mogen inhalen</b></li><li>Er een maximumsnelheid van <b>30km/u</b> geldt</li><li>Fietsers gemotoriseerde voortuigen links mogen inhalen</li><li>Fietsers nog steeds voorrang aan rechts moeten verlenen - ook aan auto's en voetgangers op het zebrapad</li></ul><br/><br/>Op deze open kaart kan je alle gekende fietsstraten zien en kan je ontbrekende fietsstraten aanduiden. Om de kaart aan te passen, moet je je aanmelden met OpenStreetMap en helemaal inzoomen tot straatniveau."
  },
  "icon": "./assets/themes/cyclestreets/F111.svg",
  "language": ["nl"],
  "startLat": 51.2095,
  "startZoom": 14,
  "startLon": 3.2228,
  "maintainer": "MapComlete",
  "widenfactor": 0.05,
  "roamingRenderings": [{
    "question": {
      "nl": "Is deze straat een fietsstraat?"
    },
    "mappings": [{
      "if": {
        "and": ["cyclestreet=yes", "maxspeed=30", "overtaking:motor_vehicle=no", "proposed:cyclestreet="]
      },
      "then": {
        "nl": "Deze straat is een fietsstraat (en dus zone 30)"
      }
    }, {
      "if": {
        "and": ["cyclestreet=yes", "proposed:cyclestreet="]
      },
      "then": {
        "nl": "Deze straat is een fietsstraat"
      },
      "hideInAnswer": true
    }, {
      "if": {
        "and": ["cyclestreet=", "proposed:cyclestreet=yes"]
      },
      "then": {
        "nl": "Deze straat wordt binnenkort een fietsstraat"
      }
    }, {
      "if": {
        "and": ["cyclestreet=", "proposed:cyclestreet=", "overtaking:motor_vehicle="]
      },
      "then": {
        "nl": "Deze straat is geen fietsstraat"
      }
    }]
  }, {
    "question": {
      "nl": "Wanneer wordt deze straat een fietsstraat?"
    },
    "render": {
      "nl": "Deze straat wordt fietsstraat op {cyclestreet:start_date}"
    },
    "condition": "proposed:cyclestreet=yes",
    "freeform": {
      "type": "date",
      "key": "cyclestreet:start_date"
    }
  }],
  "layers": [{
    "id": "fietsstraat",
    "name": {
      "nl": "Fietsstraten"
    },
    "minzoom": 9,
    "overpassTags": {
      "and": ["cyclestreet=yes", "traffic_sign="]
    },
    "description": {
      "nl": "Een fietsstraat is een straat waar gemotoriseerd verkeer een fietser niet mag inhalen."
    },
    "title": "{name}",
    "icon": "./assets/themes/cyclestreets/F111.svg",
    "color": "#0000ff",
    "width": "10"
  }, {
    "id": "toekomstige_fietsstraat",
    "name": {
      "nl": "Toekomstige fietsstraat"
    },
    "description": {
      "nl": "Deze straat wordt binnenkort een fietsstraat"
    },
    "minzoom": 9,
    "wayHandling": 0,
    "overpassTags": "proposed:cyclestreet=yes",
    "title": {
      "render": {
        "nl": "Toekomstige fietsstraat"
      },
      "mappings": [{
        "then": {
          "nl": "{name} wordt fietsstraat"
        },
        "if": "name~*"
      }]
    },
    "icon": "./assets/themes/cyclestreets/F113.svg",
    "color": "#09f9dd",
    "width": "5"
  }, {
    "id": "all_streets",
    "name": {
      "nl": "Alle straten"
    },
    "description": {
      "nl": "Laag waar je een straat als fietsstraat kan markeren"
    },
    "overpassTags": "highway~residential|tertiary|unclassified",
    "minzoom": 18,
    "wayHandling": 0,
    "title": {
      "render": {
        "nl": "Straat"
      },
      "mappings": [{
        "if": "name~*",
        "then": "{name}"
      }]
    },
    "icon": "./assets/pencil.svg",
    "width": "5",
    "color": {
      "render": "#aaaaaa",
      "mappings": [{
        "then": "#0000ff",
        "if": "cyclestreet=yes"
      }, {
        "then": "#09f9dd",
        "if": "proposed:cyclestreet=yes"
      }]
    }
  }]
};
},{}],"assets/themes/ghostbikes/ghostbikes.json":[function(require,module,exports) {
module.exports = {
  "id": "ghostbikes",
  "maintainer": "MapComplete",
  "version": "2020-08-30",
  "language": ["en", "nl", "de"],
  "title": {
    "en": "Ghost bikes",
    "nl": "Witte Fietsen",
    "de": "Geisterrad"
  },
  "description": {
    "en": "A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident, in the form of a white bicycle placed permanently near the accident location.<br/><br/>On this map, one can see all the ghost bikes which are known by OpenStreetMap. Is a ghost bike missing? Everyone can add or update information here - you only need to have a (free) OpenStreetMap account.",
    "nl": "Een <b>Witte Fiets</b> of <b>Spookfiets</b> is een aandenken aan een fietser die bij een verkeersongeval om het leven kwam. Het gaat om een fiets die volledig wit is geschilderd en in de buurt van het ongeval werd geinstalleerd.<br/><br/>Op deze kaart zie je alle witte fietsen die door OpenStreetMap gekend zijn. Ontbreekt er een Witte Fiets of wens je informatie aan te passen? Meld je dan aan met een (gratis) OpenStreetMap account.",
    "de": "Ein <b>Geisterrad</b> ist ein Denkmal für einen Radfahrer, der bei einem Verkehrsunfall ums Leben kam, in Form eines weißen Fahrrades, das dauerhaft in der Nähe des Unfallortes aufgestellt ist.<br/><br/> Auf dieser Karte kann man alle Geisterräder sehen, die OpenStreetMap kennt. Fehlt ein Geisterrad? Jeder kann hier Informationen hinzufügen oder aktualisieren - Sie benötigen lediglich einen (kostenlosen) OpenStreetMap-Account."
  },
  "icon": "./assets/themes/ghostbikes/logo.svg",
  "startZoom": 1,
  "startLat": 0,
  "startLon": 0,
  "widenFactor": 0.1,
  "layers": ["ghost_bike"],
  "defaultBackgroundId": "CartoDB.Positron"
};
},{}],"assets/themes/cyclofix/cyclofix.json":[function(require,module,exports) {
module.exports = {
  "id": "cyclofix",
  "title": {
    "en": "Cyclofix - an open map for cyclists",
    "nl": "Cyclofix - een open kaart voor fietsers",
    "fr": "Cyclofix - Une carte ouverte pour les cyclistes",
    "gl": "Cyclofix - Un mapa aberto para os ciclistas",
    "de": "Cyclofix - eine offene Karte für Radfahrer"
  },
  "description": {
    "en": "The goal of this map is to present cyclists with an easy-to-use solution to find the appropriate infrastructure for their needs.<br><br>You can track your precise location (mobile only) and select layers that are relevant for you in the bottom left corner. You can also use this tool to add or edit pins (points of interest) to the map and provide more data by answering the questions.<br><br>All changes you make will automatically be saved in the global database of OpenStreetMap and can be freely re-used by others.<br><br>For more information about the cyclofix project, go to <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
    "nl": "Het doel van deze kaart is om fietsers een gebruiksvriendelijke oplossing te bieden voor het vinden van de juiste infrastructuur voor hun behoeften.<br><br>U kunt uw exacte locatie volgen (enkel mobiel) en in de linkerbenedenhoek categorieën selecteren die voor u relevant zijn. U kunt deze tool ook gebruiken om 'spelden' aan de kaart toe te voegen of te bewerken en meer gegevens te verstrekken door de vragen te beantwoorden.<br><br>Alle wijzigingen die u maakt worden automatisch opgeslagen in de wereldwijde database van OpenStreetMap en kunnen  door anderen vrij worden hergebruikt.<br><br>Bekijk voor meer info over cyclofix ook <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
    "fr": "Le but de cette carte est de présenter aux cyclistes une solution facile à utiliser pour trouver l'infrastructure appropriée à leurs besoins.<br><br>Vous pouvez suivre votre localisation précise (mobile uniquement) et sélectionner les couches qui vous concernent dans le coin inférieur gauche. Vous pouvez également utiliser cet outil pour ajouter ou modifier des épingles (points d'intérêt) sur la carte et fournir plus de données en répondant aux questions.<br><br>Toutes les modifications que vous apportez seront automatiquement enregistrées dans la base de données mondiale d'OpenStreetMap et peuvent être librement réutilisées par d'autres.<br><br>Pour plus d'informations sur le projet cyclofix, rendez-vous sur <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
    "gl": "O obxectivo deste mapa é amosar ós ciclistas unha solución doada de empregar para atopar a infraestrutura axeitada para as súas necesidades.<br><br>Podes obter a túa localización precisa (só para dispositivos móbiles) e escoller as capas que sexan relevantes para ti na esquina inferior esquerda. Tamén podes empregar esta ferramenta para engadir ou editar puntos de interese ó mapa e fornecer máis datos respondendo as cuestións.<br><br>Todas as modificacións que fagas serán gardadas de xeito automático na base de datos global do OpenStreetMap e outros poderán reutilizalos libremente.<br><br>Para máis información sobre o proxecto cyclofix, vai a <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
    "de": "Das Ziel dieser Karte ist es, den Radfahrern eine einfach zu benutzende Lösung zu präsentieren, um die geeignete Infrastruktur für ihre Bedürfnisse zu finden.<br><br>Sie können Ihren genauen Standort verfolgen (nur mobil) und in der linken unteren Ecke die für Sie relevanten Ebenen auswählen. Sie können dieses Tool auch verwenden, um Pins (Points of Interest/Interessante Orte) zur Karte hinzuzufügen oder zu bearbeiten und mehr Daten durch Beantwortung der Fragen bereitstellen.<br><br>Alle Änderungen, die Sie vornehmen, werden automatisch in der globalen Datenbank von OpenStreetMap gespeichert und können von anderen frei wiederverwendet werden.<br><br>Weitere Informationen über das Projekt Cyclofix finden Sie unter <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>."
  },
  "language": ["en", "nl", "fr", "gl", "de"],
  "maintainer": "MapComplete",
  "icon": "./assets/themes/cyclofix/logo.svg",
  "version": "0",
  "startLat": 50.8465573,
  "startLon": 4.3516970,
  "startZoom": 16,
  "widenFactor": 0.05,
  "socialImage": "./assets/themes/cyclofix/logo.svg",
  "layers": ["bike_repair_station", "bike_cafes", "bike_shops", "drinking_water", "bike_parking", "bike_themed_object"],
  "roamingRenderings": []
};
},{}],"assets/themes/buurtnatuur/buurtnatuur.json":[function(require,module,exports) {
module.exports = {
  "id": "buurtnatuur",
  "title": {
    "#": "DO NOT TRANSLATE THIS THEME - this one is only meant to be in dutch!",
    "nl": "Breng jouw buurtnatuur in kaart"
  },
  "shortDescription": {
    "nl": "Met deze tool kan je natuur in je buurt in kaart brengen en meer informatie geven over je favoriete plekje"
  },
  "description": {
    "nl": "<img style='float:right;margin: 1em;width: 10em;height: auto;' src='./assets/themes/buurtnatuur/groen_logo.svg' alt='logo-groen' class='logo'> <br /><b>Natuur maakt gelukkig.</b> Aan de hand van deze website willen we de natuur dicht bij ons beter inventariseren. Met als doel meer mensen te laten genieten van toegankelijke natuur én te strijden voor meer natuur in onze buurten. \n<ul><li>In welke natuurgebieden kan jij terecht? Hoe toegankelijk zijn ze?</li><li>In welke bossen kan een gezin in jouw gemeente opnieuw op adem komen?</li><li>Op welke onbekende plekjes is het zalig spelen?</li></ul><p>Samen kleuren we heel Vlaanderen en Brussel groen.</p>Blijf op de hoogte van de resultaten van buurtnatuur.be: <a href=\"https://www.groen.be/buurtnatuur\" target='_blank'>meld je aan voor e-mailupdates</a>."
  },
  "descriptionTail": {
    "nl": "<h4>Tips</h4><ul><li>Over groen ingekleurde gebieden weten we alles wat we willen weten.</li><li>Bij rood ingekleurde gebieden ontbreekt nog heel wat info: klik een gebied aan en beantwoord de vragen.</li><li>Je kan altijd een vraag overslaan als je het antwoord niet weet of niet zeker bent</li><li>Je kan altijd een foto toevoegen</li><li>Je kan ook zelf een gebied toevoegen door op de kaart te klikken</li><li>Open buurtnatuur.be <b>op je smartphone</b> om al wandelend foto's te maken en vragen te beantwoorden</li></ul><small><p>De oorspronkelijke data komt van <b>OpenStreetMap</b> en je antwoorden worden daar bewaard.<br/> Omdat iedereen vrij kan meewerken aan dit project, kunnen we niet garanderen dat er geen fouten opduiken.Kan je hier niet aanpassen wat je wilt, dan kan je dat zelf via OpenStreetMap.org doen. Groen kan <b>geen enkele verantwoordelijkheid</b> nemen over de kaart.</p>Je privacy is belangrijk. We tellen wel hoeveel gebruikers deze website bezoeken. We plaatsen een cookie waar geen persoonlijke informatie in bewaard wordt. Als je inlogt, komt er een tweede cookie bij met je inloggegevens.</small>"
  },
  "language": ["nl"],
  "maintainer": "Pieter Vander Vennet",
  "icon": "./assets/themes/buurtnatuur/groen_logo.svg",
  "version": "0",
  "startLat": 50.8435,
  "startLon": 4.3688,
  "startZoom": 16,
  "widenFactor": 0.05,
  "socialImage": "./assets/themes/buurtnatuur/social_image.jpg",
  "layers": [{
    "id": "nature_reserve",
    "name": {
      "nl": "Natuurgebied"
    },
    "minzoom": 12,
    "overpassTags": {
      "or": ["leisure=nature_reserve", "boundary=protected_area"]
    },
    "title": {
      "render": {
        "nl": "Natuurgebied"
      },
      "mappings": [{
        "if": {
          "and": ["name:nl~"]
        },
        "then": {
          "nl": "{name:nl}"
        }
      }, {
        "if": {
          "and": ["name~*"]
        },
        "then": {
          "nl": "{name}"
        }
      }]
    },
    "description": {
      "nl": "Een natuurgebied is een gebied waar actief ruimte gemaakt word voor de natuur. Typisch zijn deze in beheer van Natuurpunt of het Agentschap Natuur en Bos of zijn deze erkend door de overheid."
    },
    "tagRenderings": [],
    "hideUnderlayingFeaturesMinPercentage": 10,
    "icon": {
      "render": "./assets/themes/buurtnatuur/nature_reserve.svg",
      "mappings": [{
        "#": "This is a little bit a hack to force a circle to be shown while keeping the icon in the 'new' menu",
        "if": "id~node/[0-9]*",
        "then": "$circle"
      }]
    },
    "width": {
      "render": "5"
    },
    "iconSize": {
      "render": "50,50,center"
    },
    "color": {
      "render": "#3c3",
      "mappings": [{
        "if": {
          "and": ["name=", "noname=", "operator=", "access=", "access:description=", "leisure=park"]
        },
        "then": "#cc1100"
      }, {
        "if": {
          "and": ["name=", "noname="]
        },
        "then": "#fccb37"
      }]
    },
    "presets": [{
      "tags": ["leisure=nature_reserve", "fixme=Toegevoegd met MapComplete, geometry nog uit te tekenen"],
      "title": {
        "nl": "Natuurreservaat"
      },
      "description": {
        "nl": "Voeg een ontbrekend, erkend natuurreservaat toe, bv. een gebied dat beheerd wordt door het ANB of natuurpunt"
      }
    }]
  }, {
    "id": "parks",
    "name": {
      "nl": "Park"
    },
    "minzoom": 12,
    "overpassTags": {
      "or": ["leisure=park", "landuse=village_green"]
    },
    "title": {
      "render": {
        "nl": "Park"
      },
      "mappings": [{
        "if": {
          "and": ["name:nl~"]
        },
        "then": {
          "nl": "{name:nl}"
        }
      }, {
        "if": {
          "and": ["name~*"]
        },
        "then": {
          "nl": "{name}"
        }
      }]
    },
    "description": {
      "nl": "Een park is een publiek toegankelijke, groene ruimte binnen de stad. Ze is typisch ingericht voor recreatief gebruik, met (verharde) wandelpaden, zitbanken, vuilnisbakken, een gezellig vijvertje, ..."
    },
    "tagRenderings": [],
    "hideUnderlayingFeaturesMinPercentage": 10,
    "icon": {
      "render": "./assets/themes/buurtnatuur/park.svg",
      "mappings": [{
        "#": "This is a little bit a hack to force a circle to be shown while keeping the icon in the 'new' menu",
        "if": "id~node/[0-9]*",
        "then": "$circle"
      }]
    },
    "width": {
      "render": "5"
    },
    "iconSize": {
      "render": "40,40,center"
    },
    "color": {
      "render": "#3c3",
      "mappings": [{
        "if": {
          "and": ["name=", "noname="]
        },
        "then": "#fccb37"
      }]
    },
    "presets": [{
      "tags": ["leisure=park", "fixme=Toegevoegd met MapComplete, geometry nog uit te tekenen"],
      "title": {
        "nl": "Park"
      },
      "description": {
        "nl": "Voeg een ontbrekend park toe"
      }
    }]
  }, {
    "id": "forest",
    "name": {
      "nl": "Bos"
    },
    "minzoom": 12,
    "overpassTags": {
      "or": ["landuse=forest", "natural=wood", "natural=scrub"]
    },
    "title": {
      "render": {
        "nl": "Bos"
      },
      "mappings": [{
        "if": {
          "and": ["name:nl~"]
        },
        "then": {
          "nl": "{name:nl}"
        }
      }, {
        "if": {
          "and": ["name~*"]
        },
        "then": {
          "nl": "{name}"
        }
      }]
    },
    "description": {
      "nl": "Een bos is een verzameling bomen, al dan niet als productiehout."
    },
    "tagRenderings": [],
    "hideUnderlayingFeaturesMinPercentage": 0,
    "icon": {
      "render": "./assets/themes/buurtnatuur/forest.svg",
      "mappings": [{
        "#": "This is a little bit a hack to force a circle to be shown while keeping the icon in the 'new' menu",
        "if": "id~node/[0-9]*",
        "then": "$circle"
      }]
    },
    "width": {
      "render": "5"
    },
    "iconSize": {
      "render": "40,40,center"
    },
    "color": {
      "render": "#3a3",
      "mappings": [{
        "if": {
          "and": ["operator=", "access=", "access:description="]
        },
        "then": "#cc1100"
      }, {
        "if": {
          "and": ["operator="]
        },
        "then": "#cccc00"
      }, {
        "if": {
          "and": ["name=", "noname="]
        },
        "then": "#fccb37"
      }]
    },
    "presets": [{
      "tags": ["landuse=forest", "fixme=Toegevoegd met MapComplete, geometry nog uit te tekenen"],
      "title": {
        "nl": "Bos"
      },
      "description": {
        "nl": "Voeg een ontbrekend bos toe aan de kaart"
      }
    }]
  }, "viewpoint"],
  "roamingRenderings": [{
    "#": "Access tag",
    "condition": {
      "and": ["tourism!~viewpoint"]
    },
    "render": {
      "nl": "De toegankelijkheid van dit gebied is: {access:description}"
    },
    "question": {
      "nl": "Is dit gebied toegankelijk?"
    },
    "freeform": {
      "key": "access:description",
      "addExtraTags": ["access="]
    },
    "mappings": [{
      "if": {
        "and": ["access:description=", "access=", "leisure=park"]
      },
      "then": {
        "nl": "Dit gebied is vrij toegankelijk"
      },
      "hideInAnswer": true
    }, {
      "if": {
        "and": ["access:description=", "access=yes", "fee="]
      },
      "then": {
        "nl": "Vrij toegankelijk"
      }
    }, {
      "if": {
        "and": ["access:description=", "access=no", "fee="]
      },
      "then": {
        "nl": "Niet toegankelijk"
      }
    }, {
      "if": {
        "and": ["access:description=", "access=private", "fee="]
      },
      "then": {
        "nl": "Niet toegankelijk, want privégebied"
      }
    }, {
      "if": {
        "and": ["access:description=", "access=permissive", "fee="]
      },
      "then": {
        "nl": "Toegankelijk, ondanks dat het privegebied is"
      }
    }, {
      "if": {
        "and": ["access:description=", "access=guided", "fee="]
      },
      "then": {
        "nl": "Enkel toegankelijk met een gids of tijdens een activiteit"
      }
    }, {
      "if": {
        "and": ["access:description=", "access=yes", "fee=yes"]
      },
      "then": {
        "nl": "Toegankelijk mits betaling"
      }
    }]
  }, {
    "#": "Operator tag",
    "render": {
      "nl": "Beheer door {operator}"
    },
    "question": {
      "nl": "Wie beheert dit gebied?"
    },
    "freeform": {
      "key": "operator"
    },
    "mappings": [{
      "if": {
        "and": ["leisure=park", "operator="]
      },
      "then": "Beheer door de gemeente",
      "hideInAnswer": true
    }, {
      "if": {
        "and": ["operator=Natuurpunt"]
      },
      "then": {
        "nl": "<img src=\"./assets/themes/buurtnatuur/Natuurpunt.jpg\" style=\"width:1.5em\">Dit gebied wordt beheerd door Natuurpunt"
      }
    }, {
      "if": {
        "and": ["operator~(n|N)atuurpunt.*"]
      },
      "then": {
        "nl": "<img src=\"./assets/themes/buurtnatuur/Natuurpunt.jpg\" style=\"width:1.5em\">Dit gebied wordt beheerd door {operator}"
      },
      "hideInAnswer": true
    }, {
      "if": {
        "and": ["operator=Agentschap Natuur en Bos"]
      },
      "then": {
        "nl": "<img src=\"./assets/themes/buurtnatuur/ANB.jpg\" style=\"width:1.5em\">Dit gebied wordt beheerd door het Agentschap Natuur en Bos"
      }
    }],
    "condition": {
      "and": ["leisure!~park", "tourism!~viewpoint"]
    }
  }, {
    "#": "Non-editable description {description}",
    "render": {
      "nl": "Extra info: <i>{description}</i>"
    },
    "freeform": {
      "key": "description"
    }
  }, {
    "#": "Editable description {description:0}",
    "question": "Is er extra info die je kwijt wil?<br/><span class='subtle'>De <i>naam</i> van het gebied wordt in de volgende vraag gesteld</span>",
    "render": {
      "nl": "Extra info via buurtnatuur.be: <i>{description:0}</i>"
    },
    "freeform": {
      "key": "description:0"
    }
  }, {
    "#": "Name:nl-tag",
    "render": {
      "nl": "Dit gebied heet {name:nl}"
    },
    "question": {
      "nl": "Wat is de Nederlandstalige naam van dit gebied?"
    },
    "freeform": {
      "key": "name:nl"
    },
    "condition": {
      "and": ["name:nl~*", "viewpoint!~tourism"]
    }
  }, {
    "#": "Name tag",
    "render": {
      "nl": "Dit gebied heet {name}"
    },
    "question": {
      "nl": "Wat is de naam van dit gebied?"
    },
    "freeform": {
      "key": "name",
      "addExtraTags": ["noname="]
    },
    "condition": {
      "and": ["name:nl=", "tourism!~viewpoint"]
    },
    "mappings": [{
      "if": {
        "and": ["noname=yes", "name="]
      },
      "then": {
        "nl": "Dit gebied heeft geen naam"
      }
    }]
  }]
};
},{}],"assets/themes/nature/nature.json":[function(require,module,exports) {
module.exports = {
  "id": "nature",
  "title": {
    "nl": "De Natuur in"
  },
  "shortDescription": {
    "nl": "Deze kaart bevat informatie voor natuurliefhebbers"
  },
  "description": {
    "nl": "Op deze kaart vind je informatie voor natuurliefhebbers, zoals info over het natuurgebied waar je inzit, vogelkijkhutten, informatieborden, ..."
  },
  "language": ["nl"],
  "maintainer": "",
  "icon": "./assets/themes/nature/logo.svg",
  "version": "0",
  "startLat": 51.20875,
  "startLon": 3.22435,
  "startZoom": 12,
  "widenFactor": 0.05,
  "socialImage": "",
  "layers": ["drinking_water", "birdhides", "maps", "information_boards", "nature_reserves"],
  "roamingRenderings": []
};
},{}],"assets/themes/maps/maps.json":[function(require,module,exports) {
module.exports = {
  "id": "maps",
  "title": {
    "en": "A map of maps",
    "nl": "Een kaart met Kaarten"
  },
  "shortDescription": {
    "en": "On this map, all the maps known by OpenStreetMap are shown",
    "nl": "Een kaart met alle kaarten die OpenStreetMap kent"
  },
  "description": {
    "en": "On this map you can find all maps OpenStreetMap knows.<br/><br/>If a map is missing, you can easily map this map on OpenStreetMap.",
    "nl": "Op deze kaart kan je alle kaarten zien die OpenStreetMap kent.<br/><br/>Ontbreekt er een kaart, dan kan je die kaart hier ook gemakelijk aan deze kaart toevoegen."
  },
  "language": ["en", "nl"],
  "maintainer": "MapComplete",
  "icon": "./assets/themes/maps/logo.svg",
  "version": "0",
  "startLat": 0,
  "startLon": 0,
  "startZoom": 1,
  "widenFactor": 0.05,
  "socialImage": "",
  "layers": ["maps"],
  "roamingRenderings": []
};
},{}],"Logic/PersonalLayout.ts":[function(require,module,exports) {
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
exports.PersonalLayout = void 0;

var Layout_1 = require("../Customizations/Layout");

var Translations_1 = __importDefault(require("../UI/i18n/Translations"));

var PersonalLayout =
/** @class */
function (_super) {
  __extends(PersonalLayout, _super);

  function PersonalLayout() {
    var _this = _super.call(this, PersonalLayout.NAME, ["en"], Translations_1.default.t.favourite.title, [], 12, 0, 0, Translations_1.default.t.favourite.description) || this;

    _this.description = "The personal theme allows to select one or more layers from all the layouts, creating a truly personal editor";
    _this.icon = "./assets/star.svg";
    return _this;
  }

  PersonalLayout.NAME = "personal";
  return PersonalLayout;
}(Layout_1.Layout);

exports.PersonalLayout = PersonalLayout;
},{"../Customizations/Layout":"Customizations/Layout.ts","../UI/i18n/Translations":"UI/i18n/Translations.ts"}],"Customizations/StreetWidth/Widths.ts":[function(require,module,exports) {
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
exports.Widths = void 0;

var LayerDefinition_1 = require("../LayerDefinition");

var Tags_1 = require("../../Logic/Tags");

var TagRenderingOptions_1 = require("../TagRenderingOptions");

var FromJSON_1 = require("../JSON/FromJSON");

var Widths =
/** @class */
function (_super) {
  __extends(Widths, _super);

  function Widths(carWidth, cyclistWidth, pedestrianWidth) {
    var _this = _super.call(this, "width") || this;

    _this._bothSideParking = new Tags_1.Tag("parking:lane:both", "parallel");
    _this._noSideParking = new Tags_1.Tag("parking:lane:both", "no_parking");
    _this._otherParkingMode = new Tags_1.Or([new Tags_1.Tag("parking:lane:both", "perpendicular"), new Tags_1.Tag("parking:lane:left", "perpendicular"), new Tags_1.Tag("parking:lane:right", "perpendicular"), new Tags_1.Tag("parking:lane:both", "diagonal"), new Tags_1.Tag("parking:lane:left", "diagonal"), new Tags_1.Tag("parking:lane:right", "diagonal")]);
    _this._leftSideParking = new Tags_1.And([new Tags_1.Tag("parking:lane:left", "parallel"), new Tags_1.Tag("parking:lane:right", "no_parking")]);
    _this._rightSideParking = new Tags_1.And([new Tags_1.Tag("parking:lane:right", "parallel"), new Tags_1.Tag("parking:lane:left", "no_parking")]);
    _this._sidewalkBoth = new Tags_1.Tag("sidewalk", "both");
    _this._sidewalkLeft = new Tags_1.Tag("sidewalk", "left");
    _this._sidewalkRight = new Tags_1.Tag("sidewalk", "right");
    _this._sidewalkNone = new Tags_1.Tag("sidewalk", "none");
    _this._oneSideParking = new Tags_1.Or([_this._leftSideParking, _this._rightSideParking]);
    _this._notCarfree = FromJSON_1.FromJSON.Tag({
      "and": ["highway!~pedestrian|living_street", "access!~destination", "motor_vehicle!~destination|no"]
    });
    _this.carWidth = carWidth;
    _this.cyclistWidth = cyclistWidth;
    _this.pedestrianWidth = pedestrianWidth;
    _this.minzoom = 12;

    function r(n) {
      var pre = Math.floor(n);
      var post = Math.floor(n * 10 % 10);
      return "" + pre + "." + post;
    }

    _this.name = "widths";
    _this.overpassFilter = new Tags_1.RegexTag("width:carriageway", /.*/);
    _this.title = new TagRenderingOptions_1.TagRenderingOptions({
      freeform: {
        renderTemplate: "{name}",
        template: "$$$",
        key: "name"
      }
    });
    var self = _this;

    _this.style = function (properties) {
      var c = "#f00";
      var props = self.calcProps(properties);

      if (props.width >= props.targetWidthIgnoringPedestrians) {
        c = "#fa0";
      }

      if (props.width >= props.targetWidth || !props.cyclingAllowed) {
        c = "#0c0";
      }

      if (!props.parkingStateKnown && properties["note:width:carriageway"] === undefined) {
        c = "#f0f";
      }

      if (!_this._notCarfree.matchesProperties(properties)) {
        c = "#aaa";
      } // Mark probably wrong data


      if (props.width > 15) {
        c = "#f0f";
      }

      var dashArray = undefined;

      if (props.onewayBike) {
        dashArray = [5, 6];
      }

      return {
        icon: null,
        color: c,
        weight: 5,
        dashArray: dashArray
      };
    };

    _this.elementsToShow = [new TagRenderingOptions_1.TagRenderingOptions({
      mappings: [{
        k: _this._bothSideParking,
        txt: "Auto's kunnen langs beide zijden parkeren.<br+>Dit gebruikt <b>" + r(_this.carWidth * 2) + "m</b><br/>"
      }, {
        k: _this._oneSideParking,
        txt: "Auto's kunnen langs één kant parkeren.<br/>Dit gebruikt <b>" + r(_this.carWidth) + "m</b><br/>"
      }, {
        k: _this._otherParkingMode,
        txt: "Deze straat heeft dwarsparkeren of diagonaalparkeren aan minstens één zijde. Deze parkeerruimte is niet opgenomen in de straatbreedte."
      }, {
        k: _this._noSideParking,
        txt: "Auto's mogen hier niet parkeren"
      }],
      freeform: {
        key: "note:width:carriageway",
        renderTemplate: "{note:width:carriageway}",
        template: "$$$"
      }
    }).OnlyShowIf(_this._notCarfree), new TagRenderingOptions_1.TagRenderingOptions({
      mappings: [{
        k: _this._sidewalkNone,
        txt: "Deze straat heeft geen voetpaden. Voetgangers hebben hier <b>" + r(_this.pedestrianWidth * 2) + "m</b> nodig"
      }, {
        k: new Tags_1.Or([_this._sidewalkLeft, _this._sidewalkRight]),
        txt: "Deze straat heeft een voetpad aan één kant. Voetgangers hebben hier <b>" + r(_this.pedestrianWidth) + "m</b> nodig"
      }, {
        k: _this._sidewalkBoth,
        txt: "Deze straat heeft voetpad aan beide zijden."
      }],
      freeform: {
        key: "note:width:carriageway",
        renderTemplate: "{note:width:carriageway}",
        template: "$$$"
      }
    }).OnlyShowIf(_this._notCarfree), new TagRenderingOptions_1.TagRenderingOptions({
      mappings: [{
        k: new Tags_1.Tag("bicycle", "use_sidepath"),
        txt: "Er is een afgescheiden, verplicht te gebruiken fietspad. Fietsen op dit wegsegment hoeft dus niet"
      }, {
        k: new Tags_1.Tag("bicycle", "no"),
        txt: "Fietsen is hier niet toegestaan"
      }, {
        k: new Tags_1.Tag("oneway:bicycle", "yes"),
        txt: "Eenrichtingsverkeer, óók voor fietsers. Dit gebruikt <b>" + r(_this.carWidth + _this.cyclistWidth) + "m</b>"
      }, {
        k: new Tags_1.And([new Tags_1.Tag("oneway", "yes"), new Tags_1.Tag("oneway:bicycle", "no")]),
        txt: "Tweerichtingverkeer voor fietsers, eenrichting voor auto's Dit gebruikt <b>" + r(_this.carWidth + 2 * _this.cyclistWidth) + "m</b>"
      }, {
        k: new Tags_1.Tag("oneway", "yes"),
        txt: "Eenrichtingsverkeer voor iedereen. Dit gebruikt <b>" + (_this.carWidth + _this.cyclistWidth) + "m</b>"
      }, {
        k: null,
        txt: "Tweerichtingsverkeer voor iedereen. Dit gebruikt <b>" + r(2 * _this.carWidth + 2 * _this.cyclistWidth) + "m</b>"
      }]
    }).OnlyShowIf(_this._notCarfree), new TagRenderingOptions_1.TagRenderingOptions({
      tagsPreprocessor: function tagsPreprocessor(tags) {
        var props = self.calcProps(tags);
        tags.targetWidth = r(props.targetWidth);
        tags.short = "";

        if (props.width < props.targetWidth) {
          tags.short = "<span class='alert'>Dit is " + r(props.targetWidth - props.width) + "m te weinig</span>";
        }

        console.log("SHORT", tags.short);
      },
      mappings: [{
        k: null,
        txt: "De totale nodige ruimte voor vlot en veilig verkeer is dus <span class='thanks'>{targetWidth}m</span><br/>{short}"
      }]
    }).OnlyShowIf(_this._notCarfree), new TagRenderingOptions_1.TagRenderingOptions({
      mappings: [{
        k: new Tags_1.Tag("highway", "living_street"),
        txt: "Dit is een woonerf"
      }, {
        k: new Tags_1.Tag("highway", "pedestrian"),
        txt: "Deze weg is autovrij"
      }]
    }), new TagRenderingOptions_1.TagRenderingOptions({
      mappings: [{
        k: new Tags_1.Tag("sidewalk", "none"),
        txt: "De afstand van huis tot huis is <b>{width:carriageway}m</b>"
      }, {
        k: new Tags_1.Tag("sidewalk", "left"),
        txt: "De afstand van huis tot voetpad is <b>{width:carriageway}m</b>"
      }, {
        k: new Tags_1.Tag("sidewalk", "right"),
        txt: "De afstand van huis tot voetpad is <b>{width:carriageway}m</b>"
      }, {
        k: new Tags_1.Tag("sidewalk", "both"),
        txt: "De afstand van voetpad tot voetpad is <b>{width:carriageway}m</b>"
      }, {
        k: new Tags_1.Tag("sidewalk", ""),
        txt: "De straatbreedte is <b>{width:carriageway}m</b>"
      }]
    })];
    return _this;
  }

  Widths.prototype.calcProps = function (properties) {
    var parkingStateKnown = true;
    var parallelParkingCount = 0;

    if (this._oneSideParking.matchesProperties(properties)) {
      parallelParkingCount = 1;
    } else if (this._bothSideParking.matchesProperties(properties)) {
      parallelParkingCount = 2;
    } else if (this._noSideParking.matchesProperties(properties)) {
      parallelParkingCount = 0;
    } else if (this._otherParkingMode.matchesProperties(properties)) {
      parallelParkingCount = 0;
    } else {
      parkingStateKnown = false;
      console.log("No parking data for ", properties.name, properties.id, properties);
    }

    var pedestrianFlowNeeded;

    if (this._sidewalkBoth.matchesProperties(properties)) {
      pedestrianFlowNeeded = 0;
    } else if (this._sidewalkNone.matchesProperties(properties)) {
      pedestrianFlowNeeded = 2;
    } else if (this._sidewalkLeft.matchesProperties(properties) || this._sidewalkRight.matches(properties)) {
      pedestrianFlowNeeded = 1;
    } else {
      pedestrianFlowNeeded = -1;
    }

    var onewayCar = properties.oneway === "yes";
    var onewayBike = properties["oneway:bicycle"] === "yes" || onewayCar && properties["oneway:bicycle"] === undefined;
    var cyclingAllowed = !(properties.bicycle === "use_sidepath" || properties.bicycle === "no");
    var carWidth = (onewayCar ? 1 : 2) * this.carWidth;
    var cyclistWidth = 0;

    if (cyclingAllowed) {
      cyclistWidth = (onewayBike ? 1 : 2) * this.cyclistWidth;
    }

    var width = parseFloat(properties["width:carriageway"]);
    var targetWidthIgnoringPedestrians = carWidth + cyclistWidth + parallelParkingCount * this.carWidth;
    var targetWidth = targetWidthIgnoringPedestrians + Math.max(0, pedestrianFlowNeeded) * this.pedestrianWidth;
    return {
      parkingLanes: parallelParkingCount,
      parkingStateKnown: parkingStateKnown,
      width: width,
      targetWidth: targetWidth,
      targetWidthIgnoringPedestrians: targetWidthIgnoringPedestrians,
      onewayBike: onewayBike,
      pedestrianFlowNeeded: pedestrianFlowNeeded,
      cyclingAllowed: cyclingAllowed
    };
  };

  return Widths;
}(LayerDefinition_1.LayerDefinition);

exports.Widths = Widths;
},{"../LayerDefinition":"Customizations/LayerDefinition.ts","../../Logic/Tags":"Logic/Tags.ts","../TagRenderingOptions":"Customizations/TagRenderingOptions.ts","../JSON/FromJSON":"Customizations/JSON/FromJSON.ts"}],"Customizations/StreetWidth/StreetWidth.ts":[function(require,module,exports) {
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
exports.StreetWidth = void 0;

var Layout_1 = require("../Layout");

var Widths_1 = require("./Widths");

var StreetWidth =
/** @class */
function (_super) {
  __extends(StreetWidth, _super);

  function StreetWidth() {
    var _this = _super.call(this, "width", ["nl"], "Straatbreedtes in Brugge", [new Widths_1.Widths(2, 1.5, 0.75)], 15, 51.20875, 3.22435, "<h3>De straat is opgebruikt</h3>" + "<p>Er is steeds meer druk op de openbare ruimte. Voetgangers, fietsers, steps, auto's, bussen, bestelwagens, buggies, cargobikes, ... willen allemaal hun deel van de openbare ruimte.</p>" + "" + "<p>In deze studie nemen we Brugge onder de loep en kijken we hoe breed elke straat is én hoe breed elke straat zou moeten zijn voor een veilig én vlot verkeer.</p>" + "<h3>Legende</h3>" + "<span style='background: red'>&NonBreakingSpace;&NonBreakingSpace;&NonBreakingSpace;</span> Straat te smal voor veilig verkeer<br/>" + "<span style='background: #0f0'>&NonBreakingSpace;&NonBreakingSpace;&NonBreakingSpace;</span> Straat is breed genoeg veilig verkeer<br/>" + "<span style='background: orange'>&NonBreakingSpace;&NonBreakingSpace;&NonBreakingSpace;</span> Straat zonder voetpad, te smal als ook voetgangers plaats krijgen<br/>" + "<span style='background: lightgrey'>&NonBreakingSpace;&NonBreakingSpace;&NonBreakingSpace;</span> Woonerf, autoluw, autoloos of enkel plaatselijk verkeer<br/>" + "<br/>" + "<br/>" + "Een gestippelde lijn is een straat waar ook voor fietsers éénrichtingsverkeer geldt.<br/>" + "Klik op een straat om meer informatie te zien." + "<h3>Hoe gaan we verder?</h3>" + "Verschillende ingrepen kunnen de stad teruggeven aan de inwoners en de stad leefbaarder en levendiger maken.<br/>" + "Denk aan:" + "<ul>" + "<li>De autovrije zone's uitbreiden</li>" + "<li>De binnenstad fietszone maken</li>" + "<li>Het aantal woonerven uitbreiden</li>" + "<li>Grotere auto's meer belasten - ze nemen immers meer parkeerruimte in.</li>" + "<li>Laat toeristen verplicht parkeren onder het zand; een (fiets)taxi kan hen naar hun hotel brengen</li>" + "<li>Voorzie in elke straat enkele parkeerplaatsen voor kortparkeren. Zo kunnen leveringen, iemand afzetten,... gebeuren zonder op het voetpad en fietspad te parkeren</li>" + "</ul>") || this;

    _this.icon = "./assets/bug.svg";
    _this.enableSearch = false;
    _this.enableUserBadge = false;
    _this.enableAdd = false;
    _this.hideFromOverview = true;
    _this.enableMoreQuests = false;
    _this.enableShareScreen = false;
    _this.defaultBackground = "Stadia.AlidadeSmoothDark";
    _this.enableBackgroundLayers = false;
    return _this;
  }

  StreetWidth.meetMethode = "\n    \n    \n    We meten de ruimte die gedeeld wordt door auto's, fietsers en -in sommige gevallen- voetgangers.\n    We meten dus van _verhoogde_ stoeprand tot stoeprand omdat dit de ruimte is die wordt gedeeld door auto's en fietsers.\n    Daarnaast zoeken we ook een smaller stuk van de weg waar dat smallere stuk toch minstens 2m zo smal blijft.\n    Een obstakel (zoals een trap, elektriciteitkast) negeren we omdat dit de meting te fel beinvloed.\n    \n    In een aantal straten is er geen verhoogde stoep. In dit geval meten we van muur tot muur, omdat dit de gedeelde ruimte is.\n    We geven ook altijd een aanduiding of er al dan niet een voetpad aanwezig (en aan welke kant indien er maar \xE9\xE9n is), want indien er geen is heeft de voetganger ook ruimte nodig.\n    \n   (In sommige straten zijn er wel 'voetpadsuggesties' door een meter in andere kasseien te leggen, bv. met een kleurtje. Dit rekenen we niet als voetpad.\n   \n   Ook het parkeren van auto's wordt opgemeten.\n   Als er een parallele parkeerstrook is, dan duiden we dit aan en nemen we de parkeerstrook mee in de straatbreedte.\n   Als er een witte lijn is, dan negeren we dit. Deze witte lijnen duiden immers vaak een t\xE9 smalle parkeerplaats aan - bv. 1.6m.\n   Een auto is tegenwoordig al snel 1.8m tot zelfs 2.0m, dus dan springt die auto gemakkelijk 20 tot 30cm uit op de baan.\n   \n   Staan de auto's schuin geparkeerd of dwarsgeparkeerd? \n   Ook hier kan men het argument maken dat auto's er soms overspringen, maar dat is hier te variabel om in kaart te brengen.\n   Daarnaast gebeurt het minder dat auto's overspringen \xE9n zijn deze gevallen relatief zeldzaam in de binnenstad.\n   \n   Concreet: \n   - Sla de 'parkeren'-vraag over\n   - Maak een foto en stuur die door naar Pieter (+ vermelding straatnaam of dergelijke)\n   - Meet de breedte vanaf de afbakening van de parkeerstrook.\n   \n   Ook bij andere lastige gevallen: maak een foto en vraag Pieter\n   \n   \n   \n   Instellen van de lasermeter\n   ===========================\n   \n   1) Zet de lasermeter aan met de rode knop\n   2) Het icoontje linksboven indiceert vanaf waar de laser meet - de voorkant of de achterkant van het apparaatje.\n        Dit kan aangepast worden met het knopje links-onderaan.\n        Kies wat je het liefste hebt\n   3) Het icoontje bovenaan-midden indiceert de stand van de laser: directe afstand, of afstand over de grond.\n        Dit MOET een driehoekje tonen.\n        Indien niet: duw op het knopje links-bovenaan totdat dit een rechte driehoek toont\n   4) Duw op de rode knop. Het lasertje gaat branden\n   5) Hou het meetbakje boven de stoeprand (met de juiste rand), richt de laser op de andere stoep\n   6) Duw opnieuw op de rode knop om te meten (de laser flikkert en gaat uit)\n   7) Lees de afstand af op het scherm. Let op: in 'hoekstand' is dit niet de onderste waarde, maar die er net boven.\n    \n    ";
  return StreetWidth;
}(Layout_1.Layout);

exports.StreetWidth = StreetWidth;
},{"../Layout":"Customizations/Layout.ts","./Widths":"Customizations/StreetWidth/Widths.ts"}],"Customizations/AllKnownLayouts.ts":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AllKnownLayouts = void 0;

var FromJSON_1 = require("./JSON/FromJSON");

var bookcases = __importStar(require("../assets/themes/bookcases/Bookcases.json"));

var aed = __importStar(require("../assets/themes/aed/aed.json"));

var toilets = __importStar(require("../assets/themes/toilets/toilets.json"));

var artworks = __importStar(require("../assets/themes/artwork/artwork.json"));

var cyclestreets = __importStar(require("../assets/themes/cyclestreets/cyclestreets.json"));

var ghostbikes = __importStar(require("../assets/themes/ghostbikes/ghostbikes.json"));

var cyclofix = __importStar(require("../assets/themes/cyclofix/cyclofix.json"));

var buurtnatuur = __importStar(require("../assets/themes/buurtnatuur/buurtnatuur.json"));

var nature = __importStar(require("../assets/themes/nature/nature.json"));

var maps = __importStar(require("../assets/themes/maps/maps.json"));

var PersonalLayout_1 = require("../Logic/PersonalLayout");

var StreetWidth_1 = require("./StreetWidth/StreetWidth");

var AllKnownLayouts =
/** @class */
function () {
  function AllKnownLayouts() {}

  AllKnownLayouts.GenerateCycloFix = function () {
    var layout = FromJSON_1.FromJSON.LayoutFromJSON(cyclofix);
    var now = new Date();
    var m = now.getMonth() + 1;
    var day = new Date().getDay() + 1;
    var date = day + "/" + m;

    if (date === "31/10" || date === "1/11" || date === "2/11") {
      // Around Halloween/Fiesta de muerte/Allerzielen, we remember the dead
      layout.layers.push(FromJSON_1.FromJSON.sharedLayers.get("ghost_bike"));
    }

    return layout;
  };

  AllKnownLayouts.GenerateBuurtNatuur = function () {
    var layout = FromJSON_1.FromJSON.LayoutFromJSON(buurtnatuur);
    layout.enableMoreQuests = false;
    layout.enableShareScreen = false;
    layout.hideFromOverview = true;
    return layout;
  };

  AllKnownLayouts.AllLayouts = function () {
    this.allLayers = new Map();

    for (var _i = 0, _a = this.layoutsList; _i < _a.length; _i++) {
      var layout = _a[_i];

      for (var i = 0; i < layout.layers.length; i++) {
        var layer = layout.layers[i];

        if (typeof layer === "string") {
          layer = layout.layers[i] = FromJSON_1.FromJSON.sharedLayers.get(layer);

          if (layer === undefined) {
            console.log("Defined layers are ", FromJSON_1.FromJSON.sharedLayers.keys());
            throw "Layer " + layer + " was not found or defined - probably a type was made";
          }
        }

        if (this.allLayers[layer.id] !== undefined) {
          continue;
        }

        this.allLayers[layer.id] = layer;
        this.allLayers[layer.id.toLowerCase()] = layer;
      }
    }

    var allSets = new Map();

    for (var _b = 0, _c = this.layoutsList; _b < _c.length; _b++) {
      var layout = _c[_b];
      allSets[layout.id] = layout;
      allSets[layout.id.toLowerCase()] = layout;
    }

    return allSets;
  };

  AllKnownLayouts.allLayers = undefined;
  AllKnownLayouts.layoutsList = [new PersonalLayout_1.PersonalLayout(), FromJSON_1.FromJSON.LayoutFromJSON(bookcases), FromJSON_1.FromJSON.LayoutFromJSON(aed), FromJSON_1.FromJSON.LayoutFromJSON(toilets), FromJSON_1.FromJSON.LayoutFromJSON(artworks), AllKnownLayouts.GenerateCycloFix(), FromJSON_1.FromJSON.LayoutFromJSON(ghostbikes), FromJSON_1.FromJSON.LayoutFromJSON(nature), FromJSON_1.FromJSON.LayoutFromJSON(cyclestreets), FromJSON_1.FromJSON.LayoutFromJSON(maps), AllKnownLayouts.GenerateBuurtNatuur(), new StreetWidth_1.StreetWidth()];
  AllKnownLayouts.allSets = AllKnownLayouts.AllLayouts();
  return AllKnownLayouts;
}();

exports.AllKnownLayouts = AllKnownLayouts;
},{"./JSON/FromJSON":"Customizations/JSON/FromJSON.ts","../assets/themes/bookcases/Bookcases.json":"assets/themes/bookcases/Bookcases.json","../assets/themes/aed/aed.json":"assets/themes/aed/aed.json","../assets/themes/toilets/toilets.json":"assets/themes/toilets/toilets.json","../assets/themes/artwork/artwork.json":"assets/themes/artwork/artwork.json","../assets/themes/cyclestreets/cyclestreets.json":"assets/themes/cyclestreets/cyclestreets.json","../assets/themes/ghostbikes/ghostbikes.json":"assets/themes/ghostbikes/ghostbikes.json","../assets/themes/cyclofix/cyclofix.json":"assets/themes/cyclofix/cyclofix.json","../assets/themes/buurtnatuur/buurtnatuur.json":"assets/themes/buurtnatuur/buurtnatuur.json","../assets/themes/nature/nature.json":"assets/themes/nature/nature.json","../assets/themes/maps/maps.json":"assets/themes/maps/maps.json","../Logic/PersonalLayout":"Logic/PersonalLayout.ts","./StreetWidth/StreetWidth":"Customizations/StreetWidth/StreetWidth.ts"}],"UI/Base/SubtleButton.ts":[function(require,module,exports) {
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
exports.SubtleButton = void 0;

var UIElement_1 = require("../UIElement");

var Translations_1 = __importDefault(require("../i18n/Translations"));

var Combine_1 = __importDefault(require("./Combine"));

var FixedUiElement_1 = require("./FixedUiElement");

var SubtleButton =
/** @class */
function (_super) {
  __extends(SubtleButton, _super);

  function SubtleButton(imageUrl, message, linkTo) {
    if (linkTo === void 0) {
      linkTo = undefined;
    }

    var _this = _super.call(this, undefined) || this;

    _this.linkTo = undefined;
    _this.linkTo = linkTo;
    _this.message = Translations_1.default.W(message);

    if (_this.message !== null) {
      _this.message.dumbMode = false;
    }

    if ((imageUrl !== null && imageUrl !== void 0 ? imageUrl : "") === "") {
      _this.image = new FixedUiElement_1.FixedUiElement("");
    } else if (typeof imageUrl === "string") {
      _this.image = new FixedUiElement_1.FixedUiElement("<img style=\"height:3em\" src=\"" + imageUrl + "\">");
    } else {
      _this.image = imageUrl;
    }

    return _this;
  }

  SubtleButton.prototype.InnerRender = function () {
    if (this.message !== null && this.message.IsEmpty()) {
      // Message == null: special case to force empty text
      return "";
    }

    if (this.linkTo != undefined) {
      return new Combine_1.default(["<a class=\"subtle-button\" href=\"" + this.linkTo.url + "\" " + (this.linkTo.newTab ? 'target="_blank"' : "") + ">", this.image, this.message, '</a>']).Render();
    }

    return new Combine_1.default(['<span class="subtle-button">', this.image, this.message, '</span>']).Render();
  };

  return SubtleButton;
}(UIElement_1.UIElement);

exports.SubtleButton = SubtleButton;
},{"../UIElement":"UI/UIElement.ts","../i18n/Translations":"UI/i18n/Translations.ts","./Combine":"UI/Base/Combine.ts","./FixedUiElement":"UI/Base/FixedUiElement.ts"}],"UI/Base/VariableUIElement.ts":[function(require,module,exports) {
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
exports.VariableUiElement = void 0;

var UIElement_1 = require("../UIElement");

var VariableUiElement =
/** @class */
function (_super) {
  __extends(VariableUiElement, _super);

  function VariableUiElement(html) {
    var _this = _super.call(this, html) || this;

    _this._html = html;
    return _this;
  }

  VariableUiElement.prototype.InnerRender = function () {
    return this._html.data;
  };

  return VariableUiElement;
}(UIElement_1.UIElement);

exports.VariableUiElement = VariableUiElement;
},{"../UIElement":"UI/UIElement.ts"}],"UI/MoreScreen.ts":[function(require,module,exports) {
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
exports.MoreScreen = void 0;

var UIElement_1 = require("./UIElement");

var VerticalCombine_1 = require("./Base/VerticalCombine");

var Translations_1 = __importDefault(require("./i18n/Translations"));

var AllKnownLayouts_1 = require("../Customizations/AllKnownLayouts");

var Combine_1 = __importDefault(require("./Base/Combine"));

var SubtleButton_1 = require("./Base/SubtleButton");

var State_1 = require("../State");

var VariableUIElement_1 = require("./Base/VariableUIElement");

var PersonalLayout_1 = require("../Logic/PersonalLayout");

var MoreScreen =
/** @class */
function (_super) {
  __extends(MoreScreen, _super);

  function MoreScreen() {
    var _this = _super.call(this, State_1.State.state.locationControl) || this;

    _this.ListenTo(State_1.State.state.osmConnection.userDetails);

    _this.ListenTo(State_1.State.state.installedThemes);

    return _this;
  }

  MoreScreen.prototype.createLinkButton = function (layout, customThemeDefinition) {
    if (customThemeDefinition === void 0) {
      customThemeDefinition = undefined;
    }

    if (layout === undefined) {
      return undefined;
    }

    if (layout.id === undefined) {
      console.error("ID is undefined for layout", layout);
      return undefined;
    }

    if (layout.hideFromOverview) {
      var pref = State_1.State.state.osmConnection.GetPreference("hidden-theme-" + layout.id + "-enabled");
      this.ListenTo(pref);

      if (pref.data !== "true") {
        return undefined;
      }
    }

    if (layout.id === State_1.State.state.layoutToUse.data.id) {
      return undefined;
    }

    var currentLocation = State_1.State.state.locationControl.data;
    var linkText = "./" + layout.id.toLowerCase() + ".html?z=" + currentLocation.zoom + "&lat=" + currentLocation.lat + "&lon=" + currentLocation.lon;

    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      linkText = "./index.html?layout=" + layout.id + "&z=" + currentLocation.zoom + "&lat=" + currentLocation.lat + "&lon=" + currentLocation.lon;
    }

    if (customThemeDefinition) {
      linkText = "./index.html?userlayout=" + layout.id + "&z=" + currentLocation.zoom + "&lat=" + currentLocation.lat + "&lon=" + currentLocation.lon + "#" + customThemeDefinition;
    }

    var description = Translations_1.default.W(layout.description);

    if (description !== undefined) {
      description = new Combine_1.default(["<br/>", description]);
    }

    var link = new SubtleButton_1.SubtleButton(layout.icon, new Combine_1.default(["<b>", Translations_1.default.W(layout.title), "</b>", description !== null && description !== void 0 ? description : ""]), {
      url: linkText,
      newTab: false
    });
    return link;
  };

  MoreScreen.prototype.InnerRender = function () {
    var _a;

    var tr = Translations_1.default.t.general.morescreen;
    var els = [];
    els.push(new VariableUIElement_1.VariableUiElement(State_1.State.state.osmConnection.userDetails.map(function (userDetails) {
      if (userDetails.csCount < State_1.State.userJourney.themeGeneratorReadOnlyUnlock) {
        return tr.requestATheme.Render();
      }

      return new SubtleButton_1.SubtleButton("./assets/pencil.svg", tr.createYourOwnTheme, {
        url: "./customGenerator.html",
        newTab: false
      }).Render();
    })));

    for (var k in AllKnownLayouts_1.AllKnownLayouts.allSets) {
      var layout = AllKnownLayouts_1.AllKnownLayouts.allSets[k];

      if (k === PersonalLayout_1.PersonalLayout.NAME) {
        if (State_1.State.state.osmConnection.userDetails.data.csCount < State_1.State.userJourney.personalLayoutUnlock) {
          continue;
        }
      }

      if (layout.id !== k) {
        continue; // This layout was added multiple time due to an uppercase
      }

      els.push(this.createLinkButton(layout));
    }

    var customThemesNames = (_a = State_1.State.state.installedThemes.data) !== null && _a !== void 0 ? _a : [];

    if (customThemesNames.length > 0) {
      els.push(Translations_1.default.t.general.customThemeIntro);

      for (var _i = 0, _b = State_1.State.state.installedThemes.data; _i < _b.length; _i++) {
        var installed = _b[_i];
        els.push(this.createLinkButton(installed.layout, installed.definition));
      }
    }

    return new VerticalCombine_1.VerticalCombine([tr.intro, new VerticalCombine_1.VerticalCombine(els), tr.streetcomplete]).Render();
  };

  return MoreScreen;
}(UIElement_1.UIElement);

exports.MoreScreen = MoreScreen;
},{"./UIElement":"UI/UIElement.ts","./Base/VerticalCombine":"UI/Base/VerticalCombine.ts","./i18n/Translations":"UI/i18n/Translations.ts","../Customizations/AllKnownLayouts":"Customizations/AllKnownLayouts.ts","./Base/Combine":"UI/Base/Combine.ts","./Base/SubtleButton":"UI/Base/SubtleButton.ts","../State":"State.ts","./Base/VariableUIElement":"UI/Base/VariableUIElement.ts","../Logic/PersonalLayout":"Logic/PersonalLayout.ts"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "35497" + '/');

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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","UI/MoreScreen.ts"], null)
//# sourceMappingURL=/UI/MoreScreen.js.map