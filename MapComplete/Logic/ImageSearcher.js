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
    if (callback === console.log) {
      // This ^^^ actually works!
      throw "Don't add console.log directly as a callback - you'll won't be able to find it afterwards. Wrap it in a lambda instead.";
    }

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

  UIEventSource.Chronic = function (millis, asLong) {
    if (asLong === void 0) {
      asLong = undefined;
    }

    var source = new UIEventSource(undefined);

    function run() {
      source.setData(new Date());

      if (asLong === undefined || asLong()) {
        window.setTimeout(run, millis);
      }
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
},{"../Logic/UIEventSource":"Logic/UIEventSource.ts"}],"node_modules/process/browser.js":[function(require,module,exports) {

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

},{"process":"node_modules/process/browser.js"}],"Logic/Web/Wikimedia.ts":[function(require,module,exports) {
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
},{"jquery":"node_modules/jquery/dist/jquery.js"}],"UI/Img.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Img = void 0;

var Img =
/** @class */
function () {
  function Img() {}

  Img.AsData = function (source) {
    if (this.runningFromConsole) {
      return source;
    }

    return "data:image/svg+xml;base64," + btoa(source);
  };

  Img.AsImageElement = function (source) {
    return "<img src=\"" + Img.AsData(source) + "\">";
  };

  Img.runningFromConsole = false;
  return Img;
}();

exports.Img = Img;
},{}],"UI/Base/FixedUiElement.ts":[function(require,module,exports) {
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
},{"../UIElement":"UI/UIElement.ts"}],"Svg.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Img_1 = require("./UI/Img");

var FixedUiElement_1 = require("./UI/Base/FixedUiElement");

var Svg =
/** @class */
function () {
  function Svg() {}

  Svg.add_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.add);
  };

  Svg.add_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.add_img);
  };

  Svg.addSmall_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.addSmall);
  };

  Svg.addSmall_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.addSmall_img);
  };

  Svg.ampersand_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.ampersand);
  };

  Svg.ampersand_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.ampersand_img);
  };

  Svg.arrow_left_smooth_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.arrow_left_smooth);
  };

  Svg.arrow_left_smooth_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.arrow_left_smooth_img);
  };

  Svg.arrow_right_smooth_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.arrow_right_smooth);
  };

  Svg.arrow_right_smooth_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.arrow_right_smooth_img);
  };

  Svg.bug_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.bug);
  };

  Svg.bug_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.bug_img);
  };

  Svg.camera_plus_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.camera_plus);
  };

  Svg.camera_plus_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.camera_plus_img);
  };

  Svg.checkmark_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.checkmark);
  };

  Svg.checkmark_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.checkmark_img);
  };

  Svg.close_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.close);
  };

  Svg.close_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.close_img);
  };

  Svg.compass_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.compass);
  };

  Svg.compass_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.compass_img);
  };

  Svg.crosshair_blue_center_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.crosshair_blue_center);
  };

  Svg.crosshair_blue_center_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.crosshair_blue_center_img);
  };

  Svg.crosshair_blue_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.crosshair_blue);
  };

  Svg.crosshair_blue_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.crosshair_blue_img);
  };

  Svg.crosshair_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.crosshair);
  };

  Svg.crosshair_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.crosshair_img);
  };

  Svg.delete_icon_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.delete_icon);
  };

  Svg.delete_icon_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.delete_icon_img);
  };

  Svg.direction_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.direction);
  };

  Svg.direction_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.direction_img);
  };

  Svg.direction_gradient_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.direction_gradient);
  };

  Svg.direction_gradient_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.direction_gradient_img);
  };

  Svg.down_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.down);
  };

  Svg.down_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.down_img);
  };

  Svg.envelope_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.envelope);
  };

  Svg.envelope_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.envelope_img);
  };

  Svg.floppy_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.floppy);
  };

  Svg.floppy_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.floppy_img);
  };

  Svg.gear_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.gear);
  };

  Svg.gear_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.gear_img);
  };

  Svg.help_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.help);
  };

  Svg.help_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.help_img);
  };

  Svg.home_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.home);
  };

  Svg.home_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.home_img);
  };

  Svg.home_white_bg_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.home_white_bg);
  };

  Svg.home_white_bg_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.home_white_bg_img);
  };

  Svg.josm_logo_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.josm_logo);
  };

  Svg.josm_logo_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.josm_logo_img);
  };

  Svg.layers_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.layers);
  };

  Svg.layers_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.layers_img);
  };

  Svg.layersAdd_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.layersAdd);
  };

  Svg.layersAdd_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.layersAdd_img);
  };

  Svg.logo_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.logo);
  };

  Svg.logo_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.logo_img);
  };

  Svg.logout_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.logout);
  };

  Svg.logout_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.logout_img);
  };

  Svg.mapillary_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.mapillary);
  };

  Svg.mapillary_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.mapillary_img);
  };

  Svg.no_checkmark_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.no_checkmark);
  };

  Svg.no_checkmark_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.no_checkmark_img);
  };

  Svg.or_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.or);
  };

  Svg.or_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.or_img);
  };

  Svg.osm_logo_us_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.osm_logo_us);
  };

  Svg.osm_logo_us_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.osm_logo_us_img);
  };

  Svg.osm_logo_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.osm_logo);
  };

  Svg.osm_logo_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.osm_logo_img);
  };

  Svg.pencil_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.pencil);
  };

  Svg.pencil_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.pencil_img);
  };

  Svg.phone_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.phone);
  };

  Svg.phone_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.phone_img);
  };

  Svg.pop_out_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.pop_out);
  };

  Svg.pop_out_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.pop_out_img);
  };

  Svg.reload_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.reload);
  };

  Svg.reload_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.reload_img);
  };

  Svg.search_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.search);
  };

  Svg.search_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.search_img);
  };

  Svg.send_email_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.send_email);
  };

  Svg.send_email_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.send_email_img);
  };

  Svg.share_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.share);
  };

  Svg.share_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.share_img);
  };

  Svg.star_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.star);
  };

  Svg.star_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.star_img);
  };

  Svg.statistics_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.statistics);
  };

  Svg.statistics_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.statistics_img);
  };

  Svg.up_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.up);
  };

  Svg.up_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.up_img);
  };

  Svg.wikimedia_commons_white_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.wikimedia_commons_white);
  };

  Svg.wikimedia_commons_white_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.wikimedia_commons_white_img);
  };

  Svg.wikipedia_svg = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.wikipedia);
  };

  Svg.wikipedia_ui = function () {
    return new FixedUiElement_1.FixedUiElement(Svg.wikipedia_img);
  };

  Svg.add = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"98\"    height=\"121\"    viewBox=\"0 0 98 121\"    fill=\"none\"    version=\"1.1\"    id=\"svg132\"    sodipodi:docname=\"repair_station_pump.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata136\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1680\"      inkscape:window-height=\"1013\"      id=\"namedview134\"      showgrid=\"false\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:zoom=\"5.5166017\"      inkscape:cx=\"39.674211\"      inkscape:cy=\"51.981151\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg132\">     <sodipodi:guide        position=\"48.580633,-10.69499\"        orientation=\"1,0\"        id=\"guide959\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <path      d=\"M53.0072 111.614C51.1916 115.395 45.8084 115.395 43.9928 111.614L13.4024 47.9145C11.8084 44.5952 14.2275 40.75 17.9097 40.75L79.0903 40.75C82.7725 40.75 85.1916 44.5952 83.5976 47.9145L53.0072 111.614Z\"      fill=\"#70C549\"      id=\"path2\" />   <circle      cx=\"49\"      cy=\"49\"      r=\"49\"      fill=\"#70C549\"      id=\"circle4\" />   <defs      id=\"defs130\">     <filter        id=\"filter0_d\"        x=\"58.84\"        y=\"52.704\"        width=\"25.4126\"        height=\"17.436\"        filterUnits=\"userSpaceOnUse\"        color-interpolation-filters=\"sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood52\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix54\" />       <feOffset          dy=\"4\"          id=\"feOffset56\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur58\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix60\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend62\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend64\" />     </filter>     <filter        id=\"filter1_d\"        x=\"14\"        y=\"15\"        width=\"38.0001\"        height=\"38\"        filterUnits=\"userSpaceOnUse\"        color-interpolation-filters=\"sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood67\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix69\" />       <feOffset          dy=\"4\"          id=\"feOffset71\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur73\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix75\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend77\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend79\" />     </filter>     <filter        id=\"filter2_d\"        x=\"39.5\"        y=\"7\"        width=\"53\"        height=\"53\"        filterUnits=\"userSpaceOnUse\"        color-interpolation-filters=\"sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood82\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix84\" />       <feOffset          dy=\"4\"          id=\"feOffset86\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur88\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix90\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend92\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend94\" />     </filter>     <filter        id=\"filter3_d\"        x=\"11\"        y=\"54\"        width=\"54.7667\"        height=\"38.1429\"        filterUnits=\"userSpaceOnUse\"        color-interpolation-filters=\"sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood97\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix99\" />       <feOffset          dy=\"4\"          id=\"feOffset101\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur103\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix105\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend107\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend109\" />     </filter>     <filter        id=\"filter4_d\"        x=\"41\"        y=\"64\"        width=\"28\"        height=\"29\"        filterUnits=\"userSpaceOnUse\"        color-interpolation-filters=\"sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood112\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix114\" />       <feOffset          dy=\"4\"          id=\"feOffset116\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur118\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix120\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend122\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend124\" />     </filter>     <clipPath        id=\"clip0\">       <rect          width=\"31.8198\"          height=\"31.8198\"          fill=\"white\"          transform=\"translate(43.5 29.5) rotate(-45)\"          id=\"rect127\" />     </clipPath>   </defs>   <g      transform=\"matrix(1.5647038,-1.5647038,1.5647038,1.5647038,-416.27812,-373.25946)\"      id=\"layer1\"      inkscape:label=\"Layer 1\">     <path        inkscape:connector-curvature=\"0\"        id=\"path815\"        d=\"M 22.100902,291.35894 5.785709,275.04375 v 0\"        style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />     <path        inkscape:connector-curvature=\"0\"        id=\"path815-3\"        d=\"M 22.125504,274.96508 5.8103071,291.28027 v 0\"        style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />   </g> </svg> ";
  Svg.add_img = Img_1.Img.AsImageElement(Svg.add);
  Svg.addSmall = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"98\"    height=\"98\"    viewBox=\"0 0 98 98\"    version=\"1.1\"    id=\"svg132\"    sodipodi:docname=\"addSmall.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\"    style=\"fill:none\">   <metadata      id=\"metadata136\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview134\"      showgrid=\"false\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:zoom=\"5.5166017\"      inkscape:cx=\"9.5832222\"      inkscape:cy=\"51.981151\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg132\">     <sodipodi:guide        position=\"48.580633,-10.69499\"        orientation=\"1,0\"        id=\"guide959\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <circle      cx=\"48.999996\"      cy=\"49.02142\"      r=\"49\"      id=\"circle4\"      style=\"fill:#70c549\" />   <defs      id=\"defs130\">     <filter        id=\"filter0_d\"        x=\"58.84\"        y=\"52.703999\"        width=\"25.4126\"        height=\"17.436001\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood52\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix54\" />       <feOffset          dy=\"4\"          id=\"feOffset56\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur58\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix60\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend62\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend64\" />     </filter>     <filter        id=\"filter1_d\"        x=\"14\"        y=\"15\"        width=\"38.000099\"        height=\"38\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood67\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix69\" />       <feOffset          dy=\"4\"          id=\"feOffset71\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur73\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix75\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend77\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend79\" />     </filter>     <filter        id=\"filter2_d\"        x=\"39.5\"        y=\"7\"        width=\"53\"        height=\"53\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood82\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix84\" />       <feOffset          dy=\"4\"          id=\"feOffset86\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur88\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix90\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend92\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend94\" />     </filter>     <filter        id=\"filter3_d\"        x=\"11\"        y=\"54\"        width=\"54.766701\"        height=\"38.142899\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood97\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix99\" />       <feOffset          dy=\"4\"          id=\"feOffset101\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur103\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix105\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend107\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend109\" />     </filter>     <filter        id=\"filter4_d\"        x=\"41\"        y=\"64\"        width=\"28\"        height=\"29\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood112\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix114\" />       <feOffset          dy=\"4\"          id=\"feOffset116\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur118\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix120\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend122\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend124\" />     </filter>     <clipPath        id=\"clip0\">       <rect          width=\"31.819799\"          height=\"31.819799\"          transform=\"rotate(-45,57.35965,-37.759145)\"          id=\"rect127\"          x=\"0\"          y=\"0\"          style=\"fill:#ffffff\" />     </clipPath>   </defs>   <g      transform=\"matrix(1.5647038,-1.5647038,1.5647038,1.5647038,-416.27812,-373.23804)\"      id=\"layer1\"      inkscape:label=\"Layer 1\">     <path        inkscape:connector-curvature=\"0\"        id=\"path815\"        d=\"M 22.100902,291.35894 5.785709,275.04375 v 0\"        style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />     <path        inkscape:connector-curvature=\"0\"        id=\"path815-3\"        d=\"M 22.125504,274.96508 5.8103071,291.28027 v 0\"        style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />   </g> </svg> ";
  Svg.addSmall_img = Img_1.Img.AsImageElement(Svg.addSmall);
  Svg.ampersand = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"275.9444\"    height=\"243.66881\"    version=\"1.1\"    id=\"svg6\"    sodipodi:docname=\"Ampersand.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata12\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs10\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1680\"      inkscape:window-height=\"1013\"      id=\"namedview8\"      showgrid=\"false\"      inkscape:zoom=\"0.5503876\"      inkscape:cx=\"319.5\"      inkscape:cy=\"120\"      inkscape:window-x=\"1560\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg6\" />   <path      d=\"M 69.184621,88.05971 C 65.398038,84.28878 45.405425,62.369149 47.716835,38.654524 49.990823,15.323837 73.884556,1.2473955 95.97427,0.11693352 c 20.36977,-1.042443 43.85918,4.70805898 53.3103,24.39507048 10.11956,21.079395 -1.28925,45.999521 -18.03685,58.640336 -5.82684,4.398004 -7.18682,4.599329 -15.78717,8.35864 -12.3926,5.41695 -24.869636,10.70587 -37.591472,15.28724 -26.286247,9.46617 -46.329939,30.90918 -45.609377,60.10938 0.656673,26.61116 24.371436,47.43668 49.951101,51.46486 27.220348,4.28654 49.202778,-0.15657 67.923898,-21.02736 8.04442,-8.96814 24.45293,-23.68334 32.63281,-32.53125 14.48284,-15.66562 21.97669,-28.32038 27.29668,-49.45345 3.60407,-14.31675 -20.5185,-11.01811 -16.28105,-23.06216 25.44722,-2.93304 51.02915,-3.7848 76.5625,-5.66406 4.00323,11.84618 -9.36778,8.3653 -26.72951,23.04671 -19.60573,16.579 -28.72934,30.72561 -45.60418,49.85029 l -11.89837,13.48472 c -8.00837,9.07609 -21.15724,23.50336 -29.33044,32.43076 -17.4629,19.07433 -33.57017,30.64012 -59.50887,35.61559 -27.730664,5.31919 -60.623141,2.30496 -80.151308,-20.4437 C -3.6264102,196.44728 -7.0848351,156.57316 15.462826,132.33729 30.171306,116.52755 38.031184,108.84767 57.724466,100.76314 73.147466,94.43165 97.05575,88.100173 109.29677,82.829346 136.69178,71.033402 137.40896,42.147541 124.50818,21.048935 113.44184,2.9504655 80.908653,4.4216525 74.904904,25.669377 69.689417,44.127381 77.089538,56.651269 88.37226,69.60789 l 96.21768,110.49249 c 11.83509,14.20823 29.6542,37.45695 49.80585,41.07969 13.32763,2.39596 30.53611,-3.5713 39.88214,-12.02915 4.97541,9.00928 -2.24528,16.35839 -7.83854,22.01449 -18.29468,18.50022 -49.85481,14.73994 -70.12946,-0.0122 -12.30082,-8.95026 -20.35382,-15.29947 -31.35277,-27.32693 z\"      id=\"path2\"      inkscape:connector-curvature=\"0\" /> </svg> ";
  Svg.ampersand_img = Img_1.Img.AsImageElement(Svg.ampersand);
  Svg.arrow_left_smooth = " <!-- Created with Inkscape (http://www.inkscape.org/) -->  <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 26.458333 26.458334\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"arrow-left-smooth.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <defs      id=\"defs2\" />   <sodipodi:namedview      id=\"base\"      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1.0\"      inkscape:pageopacity=\"0.0\"      inkscape:pageshadow=\"2\"      inkscape:zoom=\"4\"      inkscape:cx=\"19.262262\"      inkscape:cy=\"36.323203\"      inkscape:document-units=\"px\"      inkscape:current-layer=\"layer1\"      showgrid=\"false\"      units=\"px\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\">     <sodipodi:guide        position=\"13.229167,23.859748\"        orientation=\"1,0\"        id=\"guide815\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"14.944824,13.229167\"        orientation=\"0,1\"        id=\"guide817\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <g      inkscape:label=\"Layer 1\"      inkscape:groupmode=\"layer\"      id=\"layer1\"      transform=\"translate(0,-270.54165)\">     <path        style=\"fill: none !important;stroke:#ffffff;stroke-width:3.59588718;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"        d=\"m 20.139011,294.16029 c 0,0 -13.7995299,-7.53922 -13.8484369,-10.36091 -0.04891,-2.82169 13.8484369,-10.38607 13.8484369,-10.38607\"        id=\"path821\"        inkscape:connector-curvature=\"0\" />   </g> </svg> ";
  Svg.arrow_left_smooth_img = Img_1.Img.AsImageElement(Svg.arrow_left_smooth);
  Svg.arrow_right_smooth = " <!-- Created with Inkscape (http://www.inkscape.org/) -->  <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 26.458333 26.458334\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"arrow-right-smooth.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <defs      id=\"defs2\" />   <sodipodi:namedview      id=\"base\"      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1.0\"      inkscape:pageopacity=\"0.0\"      inkscape:pageshadow=\"2\"      inkscape:zoom=\"4\"      inkscape:cx=\"-22.237738\"      inkscape:cy=\"36.323203\"      inkscape:document-units=\"px\"      inkscape:current-layer=\"layer1\"      showgrid=\"false\"      units=\"px\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\">     <sodipodi:guide        position=\"13.229167,23.859748\"        orientation=\"1,0\"        id=\"guide815\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"14.944824,13.229167\"        orientation=\"0,1\"        id=\"guide817\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <g      inkscape:label=\"Layer 1\"      inkscape:groupmode=\"layer\"      id=\"layer1\"      transform=\"translate(0,-270.54165)\">     <path        style=\"fill: none !important;stroke:#ffffff;stroke-width:3.59588718;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"        d=\"m 6.3128214,273.41335 c 0,0 13.7995296,7.53922 13.8484366,10.36091 0.04891,2.82169 -13.8484366,10.38607 -13.8484366,10.38607\"        id=\"path821\"        inkscape:connector-curvature=\"0\" />   </g> </svg> ";
  Svg.arrow_right_smooth_img = Img_1.Img.AsImageElement(Svg.arrow_right_smooth);
  Svg.bug = "<svg height=\"1024\" width=\"733.886\" xmlns=\"http://www.w3.org/2000/svg\">   <path d=\"M243.621 156.53099999999995C190.747 213.312 205.34 304 205.34 304s53.968 64 160 64c106.031 0 160.031-64 160.031-64s14.375-89.469-37.375-146.312c32.375-18.031 51.438-44.094 43.562-61.812-8.938-19.969-48.375-21.75-88.25-3.969-14.812 6.594-27.438 14.969-37.25 23.875-12.438-2.25-25.625-3.781-40.72-3.781-14.061 0-26.561 1.344-38.344 3.25-9.656-8.75-22.062-16.875-36.531-23.344-39.875-17.719-79.375-15.938-88.25 3.969C194.465 113.21900000000005 212.497 138.562 243.621 156.53099999999995zM644.746 569.75c-8.25-1.75-16.125-2.75-23.75-3.5 0-2.125 0.375-4.125 0.375-6.312 0-33.594-4.75-65.654-12.438-96.125 16.438 1.406 37.375-2.375 58.562-11.779 39.875-17.781 65-48.375 56.125-68.219-8.875-19.969-48.375-21.75-88.25-3.969-18.625 8.312-33.812 19.469-44 30.906-7.75-18.25-16.5-35.781-26.812-51.719-30.188 25.156-87.312 62.719-167.062 71.062v321.781c0 0-0.25 32-32.031 32-31.75 0-32-32-32-32V430.219c-79.811-8.344-136.968-45.969-167.093-71.062-9.875 15.312-18.375 32-25.938 49.344-10.281-10.625-24.625-20.844-41.969-28.594-39.875-17.719-79.375-15.938-88.25 3.969-8.906 19.906 16.25 50.438 56.125 68.219 19.844 8.846 39.531 12.812 55.469 12.096-7.656 30.404-12.469 62.344-12.469 95.812 0 2.188 0.375 4.25 0.438 6.5-6.719 0.75-13.688 1.75-20.781 3.25-51.969 10.75-91.781 37.625-88.844 59.812 2.938 22.312 47.5 31.5 99.594 20.688 6.781-1.375 13.438-3.125 19.781-5.062C128.684 686 143.34 723.875 163.622 756.5c-12.031 6.062-24.531 15-36.031 26.625C95.715 815 82.779 853.75 98.715 869.688c15.938 15.937 54.656 3 86.531-28.812 9.344-9.375 16.844-19.25 22.656-29C251.434 854.5 305.965 880 365.465 880c60.343 0 115.781-26.25 159.531-69.938 5.875 10.312 13.75 20.812 23.625 30.688 31.812 31.875 70.625 44.812 86.562 28.875s3-54.625-28.875-86.5c-12.312-12.375-25.688-21.75-38.438-27.938 20.125-32.5 34.625-70.375 43.688-111.062 7.188 2.25 14.688 4.375 22.562 6.062 52.061 10.812 96.625 1.562 99.625-20.688C736.558 607.375 696.746 580.5 644.746 569.75z\"/> </svg>";
  Svg.bug_img = Img_1.Img.AsImageElement(Svg.bug);
  Svg.camera_plus = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    viewBox=\"0 -256 1950 1950\"    version=\"1.1\"    id=\"svg4\"    sodipodi:docname=\"camera.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata10\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs8\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1680\"      inkscape:window-height=\"1013\"      id=\"namedview6\"      showgrid=\"false\"      inkscape:zoom=\"0.1711561\"      inkscape:cx=\"1154.0868\"      inkscape:cy=\"749.93142\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg4\" />   <path      d=\"m 881.19,449.05 c 79.33333,0 147.1667,28.16667 203.5,84.5 56.3333,56.33333 84.5,124.16667 84.5,203.5 0,79.33333 -28.1667,147.16667 -84.5,203.5 -56.3333,56.3333 -124.16667,84.5 -203.5,84.5 -79.33333,0 -147.16667,-28.1667 -203.5,-84.5 -56.33333,-56.33333 -84.5,-124.16667 -84.5,-203.5 0,-79.33333 28.16667,-147.16667 84.5,-203.5 56.33333,-56.33333 124.16667,-84.5 203.5,-84.5 m 798,-316 c 70.6667,0 131,25 181,75 50,50 75,110.33333 75,181 v 896 c 0,70.6667 -25,131 -75,181 -50,50 -110.3333,75 -181,75 h -1408 c -70.66667,0 -131,-25 -181,-75 -50,-50 -75,-110.3333 -75,-181 v -896 c 0,-70.66667 25,-131 75,-181 50,-50 110.33333,-75 181,-75 h 130 l 51,-136 c 12.66667,-32.666667 35.83333,-60.833333 69.5,-84.5 33.66667,-23.66667 68.16667,-35.5 103.5,-35.5 h 512 c 35.3333,0 69.8333,11.83333 103.5,35.5 33.6667,23.666667 56.8333,51.833333 69.5,84.5 l 51,136 h 318 m -798,1052 c 123.3333,0 228.8333,-43.8333 316.5,-131.5 87.6667,-87.6667 131.5,-193.16667 131.5,-316.5 0,-123.33333 -43.8333,-228.83333 -131.5,-316.5 -87.6667,-87.66667 -193.1667,-131.5 -316.5,-131.5 -123.33333,0 -228.83333,43.83333 -316.5,131.5 -87.66667,87.66667 -131.5,193.16667 -131.5,316.5 0,123.33333 43.83333,228.8333 131.5,316.5 87.66667,87.6667 193.16667,131.5 316.5,131.5\"      id=\"path2\"      inkscape:connector-curvature=\"0\"      sodipodi:nodetypes=\"csssssssccsssssssssssccssssccccsssssssc\" />   <g      id=\"g854\"      transform=\"translate(259.86064,302.45965)\">     <g        id=\"g847\">       <circle          style=\"fill:#7ebc6f;fill-opacity:1;stroke:none;stroke-width:21.93531036;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\"          id=\"path819\"          cx=\"1351.3682\"          cy=\"1044.5065\"          r=\"335.30353\" />     </g>     <g        id=\"g844\">       <path          style=\"fill: none !important;stroke:#ffffff !important;stroke-width:95.51803589;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"          d=\"m 1154.7797,1044.3443 h 389.1358\"          id=\"path821\"          inkscape:connector-curvature=\"0\" />       <path          style=\"fill: none !important;stroke:#ffffff !important;stroke-width:95.51803589;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"          d=\"M 1349.9206,849.36269 V 1238.4985\"          id=\"path821-3\"          inkscape:connector-curvature=\"0\" />     </g>   </g> </svg> ";
  Svg.camera_plus_img = Img_1.Img.AsImageElement(Svg.camera_plus);
  Svg.checkmark = "<svg width=\"26\" height=\"18\" viewBox=\"0 0 26 18\"  xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M3 7.28571L10.8261 15L23 3\" stroke=\"black\" stroke-width=\"4\" stroke-linejoin=\"round\" style=\"fill:none !important;\"/></svg>";
  Svg.checkmark_img = Img_1.Img.AsImageElement(Svg.checkmark);
  Svg.close = " <!-- Created with Inkscape (http://www.inkscape.org/) -->  <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 26.458333 26.458334\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"close.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <defs      id=\"defs2\" />   <sodipodi:namedview      id=\"base\"      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1.0\"      inkscape:pageopacity=\"0.0\"      inkscape:pageshadow=\"2\"      inkscape:zoom=\"2.8284271\"      inkscape:cx=\"-12.514944\"      inkscape:cy=\"118.94409\"      inkscape:document-units=\"px\"      inkscape:current-layer=\"layer1\"      showgrid=\"false\"      units=\"px\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\">     <sodipodi:guide        position=\"13.229167,23.859748\"        orientation=\"1,0\"        id=\"guide815\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"14.944824,13.229167\"        orientation=\"0,1\"        id=\"guide817\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <g      inkscape:label=\"Layer 1\"      inkscape:groupmode=\"layer\"      id=\"layer1\"      transform=\"translate(0,-270.54165)\">     <g        id=\"g836\"        transform=\"matrix(1.7481308,0,0,1.7481308,-10.001295,-212.27744)\">       <path          inkscape:connector-curvature=\"0\"          id=\"path815\"          d=\"M 18.972892,289.3838 7.7469352,278.15784 v 0\"          style=\"fill: none !important;stroke:#000000;stroke-width:3.4395833;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />       <path          inkscape:connector-curvature=\"0\"          id=\"path815-3\"          d=\"M 18.98982,278.10371 7.7638604,289.32967 v 0\"          style=\"fill: none !important;stroke:#000000;stroke-width:3.4395833;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />     </g>   </g> </svg> ";
  Svg.close_img = Img_1.Img.AsImageElement(Svg.close);
  Svg.compass = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    id=\"svg8\"    version=\"1.1\"    viewBox=\"0 0 100 100\"    height=\"100\"    width=\"100\"    sodipodi:docname=\"compass.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview6\"      showgrid=\"false\"      inkscape:zoom=\"4.72\"      inkscape:cx=\"59.602211\"      inkscape:cy=\"33.556025\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg8\" />   <metadata      id=\"metadata8\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs6\" />   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:27.00369644px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#f00000;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"39.290302\"      y=\"25.678265\"      id=\"text818\"><tspan        sodipodi:role=\"line\"        id=\"tspan816\"        x=\"39.290302\"        y=\"25.678265\"        style=\"stroke-width:1;fill:#f00000;fill-opacity:1;\">N</tspan></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:26.37678909px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"41.584614\"      y=\"90.136795\"      id=\"text822\"><tspan        sodipodi:role=\"line\"        id=\"tspan820\"        x=\"41.584614\"        y=\"90.136795\"        style=\"stroke-width:1;fill:#ffffff;fill-opacity:1;\">S</tspan><tspan        sodipodi:role=\"line\"        x=\"41.584614\"        y=\"123.10778\"        id=\"tspan824\"        style=\"stroke-width:1;fill:#ffffff;fill-opacity:1;\" /></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:26.37678909px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"75.969528\"      y=\"59.416515\"      id=\"text822-3\"><tspan        sodipodi:role=\"line\"        id=\"tspan820-6\"        x=\"75.969528\"        y=\"59.416515\"        style=\"stroke-width:1;fill:#ffffff;fill-opacity:1;\">E</tspan><tspan        sodipodi:role=\"line\"        x=\"75.969528\"        y=\"92.387505\"        id=\"tspan824-7\"        style=\"stroke-width:1;fill:#ffffff;fill-opacity:1;\" /></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:23.66192627px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"9.1795397\"      y=\"54.821461\"      id=\"text822-5\"      transform=\"scale(0.8970738,1.1147355)\"><tspan        sodipodi:role=\"line\"        id=\"tspan820-3\"        x=\"9.1795397\"        y=\"54.821461\"        style=\"stroke-width:1;fill:#ffffff;fill-opacity:1;\">W</tspan><tspan        sodipodi:role=\"line\"        x=\"9.1795397\"        y=\"84.398872\"        id=\"tspan824-5\"        style=\"stroke-width:1;fill:#ffffff;fill-opacity:1;\" /></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:9.30213261px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"18.772408\"      y=\"9.4910574\"      id=\"text822-5-3\"      transform=\"scale(0.89707379,1.1147355)\"><tspan        sodipodi:role=\"line\"        id=\"tspan820-3-6\"        x=\"18.772408\"        y=\"17.954838\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\"></tspan><tspan        sodipodi:role=\"line\"        x=\"18.772408\"        y=\"29.582502\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\"        id=\"tspan846\">NW</tspan><tspan        sodipodi:role=\"line\"        x=\"18.772408\"        y=\"41.210167\"        id=\"tspan824-5-7\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:9.30213261px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"20.798214\"      y=\"50.509953\"      id=\"text822-5-3-5\"      transform=\"scale(0.89707379,1.1147355)\"><tspan        sodipodi:role=\"line\"        id=\"tspan820-3-6-3\"        x=\"20.798214\"        y=\"58.973732\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /><tspan        sodipodi:role=\"line\"        x=\"20.798214\"        y=\"70.601395\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\"        id=\"tspan846-5\">SW</tspan><tspan        sodipodi:role=\"line\"        x=\"20.798214\"        y=\"82.229057\"        id=\"tspan824-5-7-6\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:9.30213261px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"74.850243\"      y=\"9.8078442\"      id=\"text822-5-3-2\"      transform=\"scale(0.89707379,1.1147355)\"><tspan        sodipodi:role=\"line\"        id=\"tspan820-3-6-9\"        x=\"74.850243\"        y=\"18.271624\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /><tspan        sodipodi:role=\"line\"        x=\"74.850243\"        y=\"29.899288\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\"        id=\"tspan846-1\">NE</tspan><tspan        sodipodi:role=\"line\"        x=\"74.850243\"        y=\"41.526955\"        id=\"tspan824-5-7-2\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /></text>   <text      xml:space=\"preserve\"      style=\"font-style:normal;font-weight:normal;font-size:9.30213261px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1;\"      x=\"76.876053\"      y=\"50.826736\"      id=\"text822-5-3-5-7\"      transform=\"scale(0.89707379,1.1147355)\"><tspan        sodipodi:role=\"line\"        id=\"tspan820-3-6-3-0\"        x=\"76.876053\"        y=\"59.290516\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /><tspan        sodipodi:role=\"line\"        x=\"76.876053\"        y=\"70.918182\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\"        id=\"tspan846-5-9\">SE</tspan><tspan        sodipodi:role=\"line\"        x=\"76.876053\"        y=\"82.545845\"        id=\"tspan824-5-7-6-3\"        style=\"fill:#ffffff;fill-opacity:1;stroke-width:1;\" /></text> </svg> ";
  Svg.compass_img = Img_1.Img.AsImageElement(Svg.compass);
  Svg.crosshair_blue_center = " <!-- Created with Inkscape (http://www.inkscape.org/) -->  <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 26.458333 26.458334\"    version=\"1.1\"    id=\"svg8\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\"    sodipodi:docname=\"crosshair-blue-center.svg\">   <defs      id=\"defs2\" />   <sodipodi:namedview      id=\"base\"      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1.0\"      inkscape:pageopacity=\"0.0\"      inkscape:pageshadow=\"2\"      inkscape:zoom=\"2\"      inkscape:cx=\"-70.101755\"      inkscape:cy=\"23.072799\"      inkscape:document-units=\"px\"      inkscape:current-layer=\"layer1\"      showgrid=\"false\"      units=\"px\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\">     <sodipodi:guide        position=\"13.229167,23.859748\"        orientation=\"1,0\"        id=\"guide815\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"14.944824,13.229167\"        orientation=\"0,1\"        id=\"guide817\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <g      inkscape:label=\"Layer 1\"      inkscape:groupmode=\"layer\"      id=\"layer1\"      transform=\"translate(0,-270.54165)\">     <circle        style=\"fill: none !important;fill-opacity:1;stroke:#555555;stroke-width:2.64583335;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:0.98823529\"        id=\"path815\"        cx=\"13.16302\"        cy=\"283.77081\"        r=\"8.8715391\" />     <path        style=\"fill: none !important;stroke:#555555;stroke-width:2.09723878;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"M 3.2841366,283.77082 H 1.0418969\"        id=\"path817\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#555555;stroke-width:2.11666679;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"M 25.405696,283.77082 H 23.286471\"        id=\"path817-3\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#555555;stroke-width:2.11666679;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"m 13.229167,295.9489 v -2.11763\"        id=\"path817-3-6\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#555555;stroke-width:2.11666668;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"m 13.229167,275.05759 v -3.44507\"        id=\"path817-3-6-7\"        inkscape:connector-curvature=\"0\" />     <circle        style=\"fill:#5555f5;fill-opacity:0.99004978;stroke:none;stroke-width:2.81138086;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\"        id=\"path866\"        cx=\"13.229166\"        cy=\"283.77081\"        r=\"3.4070117\" />   </g> </svg> ";
  Svg.crosshair_blue_center_img = Img_1.Img.AsImageElement(Svg.crosshair_blue_center);
  Svg.crosshair_blue = " <!-- Created with Inkscape (http://www.inkscape.org/) -->  <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 26.458333 26.458334\"    version=\"1.1\"    id=\"svg8\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\"    sodipodi:docname=\"crosshair-blue.svg\">   <defs      id=\"defs2\" />   <sodipodi:namedview      id=\"base\"      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1.0\"      inkscape:pageopacity=\"0.0\"      inkscape:pageshadow=\"2\"      inkscape:zoom=\"2.8284271\"      inkscape:cx=\"-32.58162\"      inkscape:cy=\"58.072292\"      inkscape:document-units=\"px\"      inkscape:current-layer=\"layer1\"      showgrid=\"false\"      units=\"px\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\">     <sodipodi:guide        position=\"13.229167,23.859748\"        orientation=\"1,0\"        id=\"guide815\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"14.944824,13.229167\"        orientation=\"0,1\"        id=\"guide817\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <g      inkscape:label=\"Layer 1\"      inkscape:groupmode=\"layer\"      id=\"layer1\"      transform=\"translate(0,-270.54165)\">     <circle        style=\"fill: none !important;fill-opacity:1;stroke:#5555ec;stroke-width:2.64583335;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:0.98823529\"        id=\"path815\"        cx=\"13.16302\"        cy=\"283.77081\"        r=\"8.8715391\" />     <path        style=\"fill: none !important;stroke:#5555ec;stroke-width:2.09723878;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"M 3.2841366,283.77082 H 1.0418969\"        id=\"path817\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#5555ec;stroke-width:2.11666679;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"M 25.405696,283.77082 H 23.286471\"        id=\"path817-3\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#5555ec;stroke-width:2.11666679;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"m 13.229167,295.9489 v -2.11763\"        id=\"path817-3-6\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#5555ec;stroke-width:2.11666668;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\"        d=\"m 13.229167,275.05759 v -3.44507\"        id=\"path817-3-6-7\"        inkscape:connector-curvature=\"0\" />     <circle        style=\"fill:#5555ff;fill-opacity:0.99004978;stroke:none;stroke-width:2.81138086;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\"        id=\"path866\"        cx=\"13.229166\"        cy=\"283.77081\"        r=\"3.4070117\" />   </g> </svg> ";
  Svg.crosshair_blue_img = Img_1.Img.AsImageElement(Svg.crosshair_blue);
  Svg.crosshair = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    id=\"svg8\"    version=\"1.1\"    viewBox=\"0 0 26.458333 26.458334\"    height=\"100\"    width=\"100\">   <defs      id=\"defs2\" />   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <g      transform=\"translate(0,-270.54165)\"      id=\"layer1\">     <circle        r=\"8.8715391\"        cy=\"283.77081\"        cx=\"13.16302\"        id=\"path815\"        style=\"fill: none !important;fill-opacity:1;stroke:#000000;stroke-width:2.64583335;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:0.98823529\" />     <path        id=\"path817\"        d=\"M 3.2841366,283.77082 H 1.0418969\"        style=\"fill: none !important;stroke:#000000;stroke-width:2.09723878;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\" />     <path        id=\"path817-3\"        d=\"M 25.405696,283.77082 H 23.286471\"        style=\"fill: none !important;stroke:#000000;stroke-width:2.11666679;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\" />     <path        id=\"path817-3-6\"        d=\"m 13.229167,295.9489 v -2.11763\"        style=\"fill: none !important;stroke:#000000;stroke-width:2.11666679;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\" />     <path        id=\"path817-3-6-7\"        d=\"m 13.229167,275.05759 v -3.44507\"        style=\"fill: none !important;stroke:#000000;stroke-width:2.11666668;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.98823529\" />     <circle        r=\"3.4070117\"        cy=\"283.77081\"        cx=\"13.229166\"        id=\"path866\"        style=\"fill:#000000;fill-opacity:1;stroke:none;stroke-width:2.81138086;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\" />   </g> </svg> ";
  Svg.crosshair_img = Img_1.Img.AsImageElement(Svg.crosshair);
  Svg.delete_icon = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    viewBox=\"0 -256 1792 1792\"    id=\"svg3741\"    version=\"1.1\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\"    width=\"100%\"    height=\"100%\"    sodipodi:docname=\"delete.svg\">   <metadata      id=\"metadata3751\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs3749\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview3747\"      showgrid=\"false\"      inkscape:zoom=\"0.18624688\"      inkscape:cx=\"795.91988\"      inkscape:cy=\"822.60792\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg3741\" />   <path      style=\"fill:#ff0000;fill-opacity:1\"      inkscape:connector-curvature=\"0\"      id=\"path3745\"      d=\"m 709.42373,455.0508 v 576 q 0,14 -9,23 -9,9 -23,9 h -64 q -14,0 -23,-9 -9,-9 -9,-23 v -576 q 0,-14 9,-23 9,-9 23,-9 h 64 q 14,0 23,9 9,9 9,23 z m 256,0 v 576 q 0,14 -9,23 -9,9 -23,9 h -64 q -14,0 -23,-9 -9,-9 -9,-23 v -576 q 0,-14 9,-23 9,-9 23,-9 h 64 q 14,0 23,9 9,9 9,23 z m 255.99997,0 v 576 q 0,14 -9,23 -9,9 -23,9 h -64 q -14,0 -23,-9 -9,-9 -9,-23 v -576 q 0,-14 9,-23 9,-9 23,-9 h 64 q 14,0 23,9 9,9 9,23 z m 128,724 v -948 H 453.42373 v 948 q 0,22 7,40.5 7,18.5 14.5,27 7.5,8.5 10.5,8.5 h 831.99997 q 3,0 10.5,-8.5 7.5,-8.5 14.5,-27 7,-18.5 7,-40.5 z m -671.99997,-1076 h 447.99997 l -48,-117 q -7,-9 -17,-11 H 743.42373 q -10,2 -17,11 z m 927.99997,32 v 64 q 0,14 -9,23 -9,9 -23,9 h -96 v 948 q 0,83 -47,143.5 -47,60.5 -113,60.5 H 485.42373 q -66,0 -113,-58.5 -47,-58.5 -47,-141.5 v -952 h -96 q -14,0 -23,-9 -9,-9 -9,-23 v -64 q 0,-14 9,-23 9,-9 23,-9 h 309 l 70,-167 q 15,-37 54,-63 39,-26 79,-26 h 319.99997 q 40,0 79,26 39,26 54,63 l 70,167 h 309 q 14,0 23,9 9,9 9,23 z\" /> </svg> ";
  Svg.delete_icon_img = Img_1.Img.AsImageElement(Svg.delete_icon);
  Svg.direction = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    id=\"svg8\"    version=\"1.1\"    viewBox=\"0 0 100 100\"    height=\"100\"    width=\"100\">   <metadata      id=\"metadata8\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs6\" />   <path      id=\"path821\"      d=\"M 49.787737,49.857275 20.830626,9.2566092 C 35.979158,-2.144159 60.514289,-3.8195259 78.598237,9.0063685 Z\"      style=\"fill:#000000;fill-opacity:1;stroke:none;stroke-width:0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" /> </svg> ";
  Svg.direction_img = Img_1.Img.AsImageElement(Svg.direction);
  Svg.direction_gradient = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:xlink=\"http://www.w3.org/1999/xlink\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 100 100\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"direction_gradient.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview10\"      showgrid=\"false\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:zoom=\"9.44\"      inkscape:cx=\"69.372244\"      inkscape:cy=\"85.073455\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg8\">     <sodipodi:guide        position=\"50,117.79661\"        orientation=\"1,0\"        id=\"guide819\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"57.627119,50\"        orientation=\"0,1\"        id=\"guide821\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata8\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs6\">     <linearGradient        id=\"linearGradient820\">       <stop          id=\"innercolor\"          offset=\"0\"          style=\"stop-color:#000000;stop-opacity:1;\" />       <stop          id=\"outercolor\"          offset=\"1\"          style=\"stop-color:#000000;stop-opacity:0\" />     </linearGradient>     <radialGradient        gradientUnits=\"userSpaceOnUse\"        gradientTransform=\"matrix(1.5439431,-0.01852438,0.02075364,1.7297431,-27.986574,-42.187244)\"        r=\"28.883806\"        fy=\"53.828533\"        fx=\"49.787739\"        cy=\"53.828533\"        cx=\"49.787739\"        id=\"radialGradient828\"        xlink:href=\"#linearGradient820\" />   </defs>   <path      style=\"fill:url(#radialGradient828);fill-opacity:1;stroke:none;stroke-width:0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"      d=\"M 50,50 21.042889,9.3993342 C 36.191421,-2.001434 60.726552,-3.6768009 78.8105,9.1490935 Z\"      id=\"path821\"      inkscape:connector-curvature=\"0\" /> </svg> ";
  Svg.direction_gradient_img = Img_1.Img.AsImageElement(Svg.direction_gradient);
  Svg.down = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    version=\"1.0\"    width=\"700\"    height=\"700\"    id=\"svg6\"    sodipodi:docname=\"down.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata12\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs10\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview8\"      showgrid=\"false\"      inkscape:zoom=\"0.33714286\"      inkscape:cx=\"477.91309\"      inkscape:cy=\"350\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg6\" />   <g      transform=\"rotate(-180,342.1439,335.17672)\"      id=\"g4\">     <path        d=\"m -20,670.71582 c 0,-1.85843 349.99229,-699.98853 350.57213,-699.28671 1.94549,2.35478 350.06752,699.46087 349.427,699.71927 -0.41837,0.16878 -79.29725,-33.69092 -175.2864,-75.24377 l -174.52574,-75.55065 -174.2421,75.53732 c -95.83317,41.54551 -174.625237,75.5373 -175.093498,75.5373 -0.46826,0 -0.851382,-0.32075 -0.851382,-0.71276 z\"        style=\"fill:#00ff00;stroke:none\"        id=\"path2\"        inkscape:connector-curvature=\"0\" />   </g> </svg> ";
  Svg.down_img = Img_1.Img.AsImageElement(Svg.down);
  Svg.envelope = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    id=\"svg4\"    version=\"1.1\"    viewBox=\"0 0 114 114\"    height=\"114\"    width=\"114\">   <metadata      id=\"metadata10\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs8\" />   <path      id=\"path817\"      d=\"M 9.6696131,22.725039 42.932885,56.977838 c 0,0 12.343058,14.397206 26.130256,0 C 88.864049,36.30085 103.12276,22.224485 103.12276,22.224485\"      style=\"fill: none !important;stroke:#000000;stroke-width:8.16401958;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />   <path      id=\"path823\"      d=\"M 9.9025424,22.944915 102.88983,22.461864 v 69.921611\"      style=\"fill: none !important;stroke:#000000;stroke-width:8;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none\" />   <path      id=\"path823-3\"      d=\"M 102.88983,92.383475 9.902543,92.866526 V 22.944915\"      style=\"fill: none !important;stroke:#000000;stroke-width:8;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />   <path      id=\"path840\"      d=\"M 15.059836,89.897056 52.138595,60.125694\"      style=\"fill: none !important;stroke:#000000;stroke-width:2.88938379;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" />   <path      id=\"path840-7\"      d=\"M 59.644597,61.331869 98.071505,89.49552\"      style=\"fill: none !important;stroke:#000000;stroke-width:2.89490533;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" /> </svg> ";
  Svg.envelope_img = Img_1.Img.AsImageElement(Svg.envelope);
  Svg.floppy = " <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"48\" height=\"48\">   <defs>     <linearGradient id=\"d\">       <stop offset=\"0\"/>       <stop offset=\"1\" stop-opacity=\"0\"/>     </linearGradient>     <linearGradient id=\"c\">       <stop offset=\"0\" stop-color=\"#858585\"/>       <stop offset=\".5\" stop-color=\"#cbcbcb\"/>       <stop offset=\"1\" stop-color=\"#6b6b6b\"/>     </linearGradient>     <linearGradient id=\"b\">       <stop offset=\"0\" stop-color=\"#fff\"/>       <stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/>     </linearGradient>     <linearGradient id=\"a\">       <stop offset=\"0\" stop-color=\"#1e2d69\"/>       <stop offset=\"1\" stop-color=\"#78a7e0\"/>     </linearGradient>     <linearGradient id=\"f\" x1=\"40.885\" x2=\"16.88\" y1=\"71.869\" y2=\"-.389\" gradientTransform=\"matrix(.97661 0 0 1.13979 .564 -3.271)\" gradientUnits=\"userSpaceOnUse\" xlink:href=\"#a\"/>     <linearGradient id=\"g\" x1=\"13.784\" x2=\"33.075\" y1=\"-.997\" y2=\"55.702\" gradientTransform=\"matrix(.98543 0 0 1.14818 .641 -2.934)\" gradientUnits=\"userSpaceOnUse\" xlink:href=\"#b\"/>     <linearGradient id=\"h\" x1=\"20.125\" x2=\"28.563\" y1=\"21.844\" y2=\"42.469\" gradientTransform=\"matrix(1.0677 0 0 1.12153 -1.369 -5.574)\" gradientUnits=\"userSpaceOnUse\" xlink:href=\"#c\"/>     <radialGradient id=\"e\" cx=\"24.313\" cy=\"41.156\" r=\"22.875\" fx=\"24.313\" fy=\"41.156\" gradientTransform=\"matrix(1 0 0 .26913 0 30.08)\" gradientUnits=\"userSpaceOnUse\" xlink:href=\"#d\"/>   </defs>   <path fill=\"url(#e)\" d=\"M47.188 41.156a22.875 6.156 0 1 1-45.75 0 22.875 6.156 0 1 1 45.75 0z\" opacity=\".506\" transform=\"matrix(.91803 0 0 .98122 1.68 .648)\"/>   <path fill=\"url(#f)\" stroke=\"#25375f\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.558 3.568h38.89c.59 0 1.064.474 1.064 1.063v37.765c0 .59-.475 1.064-1.064 1.064H6.558l-3.064-3.064V4.631a1.06 1.06 0 0 1 1.064-1.063z\"/>   <path fill=\"#fff\" d=\"M9 4h30v23H9z\"/>   <rect width=\"30\" height=\"4\" x=\"9\" y=\"4\" fill=\"#d31c00\" rx=\".126\" ry=\".126\"/>   <rect width=\"2\" height=\"2\" x=\"6\" y=\"6\" opacity=\".739\" rx=\".126\" ry=\".126\"/>   <path stroke=\"#000\" d=\"M11 12.5h26m-26 5h26m-26 5h26\" opacity=\".131\"/>   <path fill=\"none\" stroke=\"url(#g)\" stroke-linecap=\"round\" d=\"M4.619 4.528h38.768c.07 0 .127.056.127.126v37.648c0 .07-.057.126-.127.126H6.928l-2.435-2.391V4.654c0-.07.056-.126.126-.126z\" opacity=\".597\"/>   <path fill=\"url(#h)\" stroke=\"#525252\" d=\"M14.114 28.562h19.75c.888 0 1.603.751 1.603 1.684v13.201H12.51V30.246c0-.933.715-1.684 1.603-1.684z\"/>   <rect width=\"5.03\" height=\"10.066\" x=\"16.464\" y=\"30.457\" fill=\"#4967a2\" stroke=\"#525252\" rx=\".751\" ry=\".751\"/> </svg>";
  Svg.floppy_img = Img_1.Img.AsImageElement(Svg.floppy);
  Svg.gear = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">     <path fill-rule=\"evenodd\" d=\"M16 12a4 4 0 11-8 0 4 4 0 018 0zm-1.5 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z\"/>     <path fill-rule=\"evenodd\" d=\"M12 1c-.268 0-.534.01-.797.028-.763.055-1.345.617-1.512 1.304l-.352 1.45c-.02.078-.09.172-.225.22a8.45 8.45 0 00-.728.303c-.13.06-.246.044-.315.002l-1.274-.776c-.604-.368-1.412-.354-1.99.147-.403.348-.78.726-1.129 1.128-.5.579-.515 1.387-.147 1.99l.776 1.275c.042.069.059.185-.002.315-.112.237-.213.48-.302.728-.05.135-.143.206-.221.225l-1.45.352c-.687.167-1.249.749-1.304 1.512a11.149 11.149 0 000 1.594c.055.763.617 1.345 1.304 1.512l1.45.352c.078.02.172.09.22.225.09.248.191.491.303.729.06.129.044.245.002.314l-.776 1.274c-.368.604-.354 1.412.147 1.99.348.403.726.78 1.128 1.129.579.5 1.387.515 1.99.147l1.275-.776c.069-.042.185-.059.315.002.237.112.48.213.728.302.135.05.206.143.225.221l.352 1.45c.167.687.749 1.249 1.512 1.303a11.125 11.125 0 001.594 0c.763-.054 1.345-.616 1.512-1.303l.352-1.45c.02-.078.09-.172.225-.22.248-.09.491-.191.729-.303.129-.06.245-.044.314-.002l1.274.776c.604.368 1.412.354 1.99-.147.403-.348.78-.726 1.129-1.128.5-.579.515-1.387.147-1.99l-.776-1.275c-.042-.069-.059-.185.002-.315.112-.237.213-.48.302-.728.05-.135.143-.206.221-.225l1.45-.352c.687-.167 1.249-.749 1.303-1.512a11.125 11.125 0 000-1.594c-.054-.763-.616-1.345-1.303-1.512l-1.45-.352c-.078-.02-.172-.09-.22-.225a8.469 8.469 0 00-.303-.728c-.06-.13-.044-.246-.002-.315l.776-1.274c.368-.604.354-1.412-.147-1.99-.348-.403-.726-.78-1.128-1.129-.579-.5-1.387-.515-1.99-.147l-1.275.776c-.069.042-.185.059-.315-.002a8.465 8.465 0 00-.728-.302c-.135-.05-.206-.143-.225-.221l-.352-1.45c-.167-.687-.749-1.249-1.512-1.304A11.149 11.149 0 0012 1zm-.69 1.525a9.648 9.648 0 011.38 0c.055.004.135.05.162.16l.351 1.45c.153.628.626 1.08 1.173 1.278.205.074.405.157.6.249a1.832 1.832 0 001.733-.074l1.275-.776c.097-.06.186-.036.228 0 .348.302.674.628.976.976.036.042.06.13 0 .228l-.776 1.274a1.832 1.832 0 00-.074 1.734c.092.195.175.395.248.6.198.547.652 1.02 1.278 1.172l1.45.353c.111.026.157.106.161.161a9.653 9.653 0 010 1.38c-.004.055-.05.135-.16.162l-1.45.351a1.833 1.833 0 00-1.278 1.173 6.926 6.926 0 01-.25.6 1.832 1.832 0 00.075 1.733l.776 1.275c.06.097.036.186 0 .228a9.555 9.555 0 01-.976.976c-.042.036-.13.06-.228 0l-1.275-.776a1.832 1.832 0 00-1.733-.074 6.926 6.926 0 01-.6.248 1.833 1.833 0 00-1.172 1.278l-.353 1.45c-.026.111-.106.157-.161.161a9.653 9.653 0 01-1.38 0c-.055-.004-.135-.05-.162-.16l-.351-1.45a1.833 1.833 0 00-1.173-1.278 6.928 6.928 0 01-.6-.25 1.832 1.832 0 00-1.734.075l-1.274.776c-.097.06-.186.036-.228 0a9.56 9.56 0 01-.976-.976c-.036-.042-.06-.13 0-.228l.776-1.275a1.832 1.832 0 00.074-1.733 6.948 6.948 0 01-.249-.6 1.833 1.833 0 00-1.277-1.172l-1.45-.353c-.111-.026-.157-.106-.161-.161a9.648 9.648 0 010-1.38c.004-.055.05-.135.16-.162l1.45-.351a1.833 1.833 0 001.278-1.173 6.95 6.95 0 01.249-.6 1.832 1.832 0 00-.074-1.734l-.776-1.274c-.06-.097-.036-.186 0-.228.302-.348.628-.674.976-.976.042-.036.13-.06.228 0l1.274.776a1.832 1.832 0 001.734.074 6.95 6.95 0 01.6-.249 1.833 1.833 0 001.172-1.277l.353-1.45c.026-.111.106-.157.161-.161z\"/> </svg>";
  Svg.gear_img = Img_1.Img.AsImageElement(Svg.gear);
  Svg.help = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    id=\"svg11382\"    height=\"900\"    width=\"900\"    viewBox=\"0 0 900 900\"    version=\"1.0\">   <g      id=\"layer1\"      transform=\"matrix(0.90103258,0,0,0.90103258,112.84058,-1.9060177)\"   >     <g        id=\"g11476\">       <path          id=\"path11472\"          style=\"font-style:normal;font-weight:normal;font-size:1201.92492676px;font-family:'Bitstream Vera Sans';text-align:center;text-anchor:middle;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"          d=\"M 474.50888,718.22841 H 303.49547 v -22.30134 c -2.4e-4,-37.95108 4.30352,-68.76211 12.9113,-92.43319 8.60728,-23.67032 23.63352,-45.28695 40.65324,-64.84996 17.01914,-19.56211 41.98734,-26.33264 101.45793,-75.63085 31.69095,-25.82203 55.2813,-77.1523 55.28175,-98.67174 2.21232,-56.92245 -13.93983,-79.3422 -34.56287,-99.96524 -22.67355,-19.67717 -60.67027,-30.06998 -90.99892,-30.06998 -27.77921,6.9e-4 -68.46735,8.08871 -87.7666,25.37047 -25.93817,17.28308 -65.23747,73.70611 -57.04687,130.54577 l -194.516943,1.70222 c 0,-157.21399 29.393699,-198.69465 99.004113,-263.03032 67.39739,-54.376643 126.53128,-73.268365 243.84757,-73.268365 89.71791,0 161.89728,17.80281 214.32552,53.405855 71.20714,48.12472 122.30105,111.18354 122.30105,230.11281 -6.9e-4,44.32081 -19.15253,90.78638 -43.0726,128.33299 -18.38947,30.90938 -60.37511,66.45236 -118.21237,104.41628 -42.83607,25.7686 -66.67196,53.11926 -77.03964,72.0946 -10.36863,18.97603 -15.55271,43.72267 -15.55225,74.23999 z\" />       <path          id=\"path11474\"          style=\"fill-opacity:1;stroke:none;stroke-width:3;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\"          transform=\"translate(1.106383,-5.5319149)\"          d=\"m 482.38298,869.80902 a 94.042557,73.021278 0 1 1 -188.08511,0 94.042557,73.021278 0 1 1 188.08511,0 z\" />     </g>   </g> </svg> ";
  Svg.help_img = Img_1.Img.AsImageElement(Svg.help);
  Svg.home = " <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> <svg height=\"16px\" id=\"Layer_1\" style=\"enable-background:new 0 0 16 16;fill: #000000;\" version=\"1.1\" viewBox=\"0 0 16 16\" width=\"16px\"      xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\">     <path d=\"M15.45,7L14,5.551V2c0-0.55-0.45-1-1-1h-1c-0.55,0-1,0.45-1,1v0.553L9,0.555C8.727,0.297,8.477,0,8,0S7.273,0.297,7,0.555  L0.55,7C0.238,7.325,0,7.562,0,8c0,0.563,0.432,1,1,1h1v6c0,0.55,0.45,1,1,1h3v-5c0-0.55,0.45-1,1-1h2c0.55,0,1,0.45,1,1v5h3  c0.55,0,1-0.45,1-1V9h1c0.568,0,1-0.437,1-1C16,7.562,15.762,7.325,15.45,7z\"/> </svg>";
  Svg.home_img = Img_1.Img.AsImageElement(Svg.home);
  Svg.home_white_bg = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xml:space=\"preserve\"    width=\"16px\"    viewBox=\"0 0 16 16\"    version=\"1.1\"    style=\"enable-background:new 0 0 16 16;fill: #000000;\"    id=\"Layer_1\"    height=\"16px\"><metadata    id=\"metadata11\"><rdf:RDF><cc:Work        rdf:about=\"\"><dc:format>image/svg+xml</dc:format><dc:type          rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs    id=\"defs9\" />     <circle    id=\"circle2\"    fill=\"white\"    r=\"8\"    cy=\"8\"    cx=\"8\" />     <path    style=\"stroke-width:1\"    id=\"path4\"    d=\"m 13.429661,7.2711864 -1.05678,-1.0560508 v -2.588017 c 0,-0.4008474 -0.327966,-0.7288135 -0.728813,-0.7288135 h -0.728814 c -0.400847,0 -0.728813,0.3279661 -0.728813,0.7288135 V 4.0301525 L 8.7288135,2.573983 C 8.5298474,2.3859491 8.347644,2.1694915 8,2.1694915 c -0.3476441,0 -0.5298475,0.2164576 -0.7288136,0.4044915 L 2.570339,7.2711864 C 2.3429491,7.5080508 2.1694915,7.6807796 2.1694915,8 c 0,0.410322 0.3148475,0.7288135 0.7288136,0.7288135 h 0.7288135 v 4.3728815 c 0,0.400847 0.3279661,0.728813 0.7288136,0.728813 h 2.1864407 v -3.644067 c 0,-0.4008478 0.3279661,-0.7288139 0.7288135,-0.7288139 h 1.4576271 c 0.4008475,0 0.7288136,0.3279661 0.7288136,0.7288139 v 3.644067 h 2.1864409 c 0.400847,0 0.728813,-0.327966 0.728813,-0.728813 V 8.7288135 h 0.728814 c 0.413966,0 0.728813,-0.3184915 0.728813,-0.7288135 0,-0.3192204 -0.173457,-0.4919492 -0.400847,-0.7288136 z\" /> </svg>";
  Svg.home_white_bg_img = Img_1.Img.AsImageElement(Svg.home_white_bg);
  Svg.josm_logo = " <svg version=\"1.1\" viewBox=\"0 0 1000 1000\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">  <title>JOSM Logotype 2019</title>  <defs>   <linearGradient id=\"linearGradient9147\">    <stop stop-color=\"#ffd555\" offset=\"0\"/>    <stop stop-color=\"#ffcb27\" offset=\"1\"/>   </linearGradient>   <linearGradient id=\"linearGradient3892\" x1=\"716.07\" x2=\"787.83\" y1=\"454.99\" y2=\"219.39\" gradientTransform=\"matrix(.98704 .23824 -.9468 1.3017 230.53 -134.51)\" gradientUnits=\"userSpaceOnUse\">    <stop offset=\"0\"/>    <stop stop-color=\"#3c3c3c\" stop-opacity=\"0\" offset=\"1\"/>   </linearGradient>   <filter id=\"filter4005\">    <feGaussianBlur stdDeviation=\"10\"/>   </filter>   <linearGradient id=\"linearGradient4017\" x1=\"455\" x2=\"532.2\" y1=\"690\" y2=\"656.35\" gradientTransform=\"matrix(1.0062 .23807 -.23807 1.0062 94.828 -143.1)\" gradientUnits=\"userSpaceOnUse\">    <stop stop-opacity=\".36869\" offset=\"0\"/>    <stop stop-color=\"#3c3c3c\" stop-opacity=\"0\" offset=\"1\"/>   </linearGradient>   <filter id=\"filter3987\" x=\"-.033087\" y=\"-.30881\" width=\"1.0662\" height=\"1.6176\">    <feGaussianBlur stdDeviation=\"11.58046\"/>   </filter>   <filter id=\"filter4629-1\" color-interpolation-filters=\"sRGB\">    <feGaussianBlur stdDeviation=\"0.5\"/>   </filter>   <clipPath id=\"clipPath3411\">    <path d=\"m1320 320c15 5 25 20 25 20 10 15 10 40 10 40 5 10 5 30 0 40 0 0 0 25-10 40 0 0-10 15-25 20h540l40-20 20-40v-40l-20-40-40-20z\" fill=\"none\" stroke=\"#000\" stroke-width=\"1px\"/>   </clipPath>   <clipPath id=\"clipPath3446\">    <path d=\"m1320 320-200 80 200 80 60-20v-120z\" fill=\"#dfc4b3\"/>   </clipPath>   <clipPath>    <path d=\"m1478.6-6.6948v326.69h264.09v-326.69z\" fill=\"#fff\"/>   </clipPath>   <clipPath id=\"clipPath5203\">    <rect x=\"80\" y=\"140\" width=\"800\" height=\"800\" fill=\"none\" stroke=\"#515151\" stroke-dasharray=\"8, 8\" stroke-width=\"4\" style=\"paint-order:normal\"/>   </clipPath>   <clipPath>    <rect x=\"80\" y=\"140\" width=\"800\" height=\"800\" fill=\"none\" stroke=\"#515151\" stroke-dasharray=\"8, 8\" stroke-width=\"4\" style=\"paint-order:normal\"/>   </clipPath>   <clipPath id=\"clipPath9081\">    <rect transform=\"matrix(.98233 .18717 0 1 0 0)\" x=\"255.85\" y=\"-55.827\" width=\"427.56\" height=\"1040\" fill=\"#fff\" fill-opacity=\".17172\" style=\"paint-order:normal\"/>   </clipPath>   <clipPath id=\"clipPath9114\">    <path d=\"m31.923 874.34 200.04 100.23 419.97-80.09 199.44 99.734v-840.06l-199.44-99.73-419.97 80.091-200.04-100.23z\" fill=\"#ff4dcf\" fill-opacity=\".17172\"/>   </clipPath>   <clipPath id=\"clipPath9126\">    <path d=\"m24.202 100.97 225.77 18.969 9.9354 7.2365 4.9204 812.94-14.817 19.843-225.81 112.71z\" fill=\"none\" stroke=\"#515151\" stroke-dasharray=\"7.37136328, 7.37136328\" stroke-width=\"3.6857\" style=\"paint-order:normal\"/>   </clipPath>   <clipPath id=\"clipPath9132\">    <path d=\"m670.56 120.09 220.5-38.478-6.6071 882.19-213.89-3.6131-16.826-7.4582-3.1965-803.02z\" fill=\"none\" stroke=\"#515151\" stroke-dasharray=\"8.19754535, 8.19754535\" stroke-width=\"4.0988\" style=\"paint-order:normal\"/>   </clipPath>   <linearGradient id=\"linearGradient9261\" x1=\"146.47\" x2=\"826.26\" y1=\"211.9\" y2=\"900.62\" gradientUnits=\"userSpaceOnUse\" xlink:href=\"#linearGradient9147\"/>   <linearGradient id=\"linearGradient9439\" x1=\"1240\" x2=\"1240\" y1=\"480\" y2=\"320\" gradientUnits=\"userSpaceOnUse\">    <stop stop-color=\"#ad7a4a\" offset=\"0\"/>    <stop stop-color=\"#edb096\" offset=\"1\"/>   </linearGradient>   <linearGradient id=\"linearGradient1085\" x1=\"215.46\" x2=\"280.41\" y1=\"753.18\" y2=\"715.68\" gradientTransform=\"translate(1555.5 -347.95)\" gradientUnits=\"userSpaceOnUse\">    <stop stop-color=\"#e6b636\" offset=\"0\"/>    <stop stop-color=\"#f1cf09\" offset=\".5\"/>    <stop stop-color=\"#f0d609\" offset=\".5625\"/>    <stop stop-color=\"#f0b10a\" offset=\".625\"/>    <stop stop-color=\"#f0ce0b\" offset=\".6875\"/>    <stop stop-color=\"#f0aa0c\" offset=\".75\"/>    <stop stop-color=\"#ffd900\" offset=\"1\"/>   </linearGradient>   <linearGradient id=\"linearGradient1686\" x1=\"1655.9\" x2=\"1561.9\" y1=\"655.03\" y2=\"367.53\" gradientTransform=\"translate(-73.236 -11.978)\" gradientUnits=\"userSpaceOnUse\">    <stop stop-color=\"#1e427c\" offset=\"0\"/>    <stop stop-color=\"#5373a7\" offset=\"1\"/>   </linearGradient>   <linearGradient id=\"linearGradient1141\" x1=\"893.78\" x2=\"1255.8\" y1=\"-484.92\" y2=\"1410.1\" gradientUnits=\"userSpaceOnUse\">    <stop stop-color=\"#1e427c\" offset=\"0\"/>    <stop stop-color=\"#4471aa\" offset=\"1\"/>   </linearGradient>   <radialGradient id=\"radialGradient1164\" cx=\"494\" cy=\"556.57\" r=\"1922\" gradientTransform=\"matrix(1.0725 -.64308 .38446 .64115 -249.77 517.41)\" gradientUnits=\"userSpaceOnUse\">    <stop stop-color=\"#e3e5fc\" stop-opacity=\".28283\" offset=\"0\"/>    <stop stop-color=\"#7ca4e5\" stop-opacity=\"0\" offset=\"1\"/>   </radialGradient>   <clipPath id=\"clipPath1210\">    <path d=\"m80 140v800h800v-800z\" fill=\"url(#linearGradient1214)\"/>   </clipPath>   <linearGradient id=\"linearGradient1214\" x1=\"146.47\" x2=\"826.26\" y1=\"211.9\" y2=\"900.62\" gradientTransform=\"translate(-289.08 -8.1047)\" gradientUnits=\"userSpaceOnUse\" xlink:href=\"#linearGradient9147\"/>  </defs>  <metadata>   <rdf:RDF>    <cc:Work rdf:about=\"\">     <dc:format>image/svg+xml</dc:format>     <dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\"/>     <dc:title>JOSM Logotype 2019</dc:title>     <dc:date>2019-08-05</dc:date>     <dc:creator>      <cc:Agent>       <dc:title>Diamond00744</dc:title>      </cc:Agent>     </dc:creator>     <dc:rights>      <cc:Agent>       <dc:title>Public Domain</dc:title>      </cc:Agent>     </dc:rights>    </cc:Work>   </rdf:RDF>  </metadata>  <g display=\"none\">   <rect x=\"-2053.4\" y=\"-1194.9\" width=\"5871.8\" height=\"3264\" fill=\"url(#linearGradient1141)\" style=\"paint-order:stroke fill markers\"/>  </g>  <g display=\"none\">   <rect x=\"-2552\" y=\"-1640\" width=\"6912\" height=\"4221.1\" fill=\"url(#radialGradient1164)\" style=\"paint-order:stroke fill markers\"/>  </g>  <g display=\"none\" fill=\"none\" stroke=\"#eaf4ff\" stroke-dasharray=\"28, 28\" stroke-opacity=\".14646\" stroke-width=\"7\">   <path d=\"m-8.4853-1197.7c47.111 86.643 70.205 115.9 137.36 181.59 185.99 181.92 170.87 310.74 351.96 418.04 84.996 50.361 132.32 249.25 48.083 370.52-105.99 152.61-85.579 254.78-95.196 334.78\"/>   <path d=\"m154.51-1201.7c33.581 25.249 46.873 65.448 76.368 89.338 124.18 100.58 92.794 127.5 180.24 253.47 16.291 23.469 134.24 144.69 157.4 161.82 120.45 89.119 143.9 309.39 59.397 438.41-151.39 231.13-107.72 267.5-117.97 357.75\"/>   <path d=\"m613.77 882.62c-4.8013 5.6138-28.135 21.151-22.489 50.855 3.428 18.035-33.063 25.07-37.845 28.258-27.543 18.362-15.746-29.349-33.711-59.314\"/>   <path d=\"m110 892c-47.659 68.525-79.01 140.02-116 214-37.539 75.079 81.241 233.52 74 248-24.76 49.52-22.686 106.74-36 160-14.026 56.104-46.616 112.54-68 166-28.498 71.245-113.33 166.65-148 236-16.131 32.263-65.92 50.861-86 86-24.257 42.45-45.633 96.042-76 134\"/>   <path d=\"m178 2076c70.928-81.82 80-202.19 80-306 0-194.09-48.906-380.65-46-574 1.153-76.721 120.87-190.07 138-146 7.6446 19.665 65.662 16.765 62 46-4.3284 34.551 141.47-30.407 102 8-15.17 14.763 18.872 54.561 52 60 71.852 11.797 103.51-20.048 116-42 11.231-19.731 61.669 5.8195 72 6 127.7 2.2312 90.204-96.578 134-100 63.884-4.991 69.116 12.994 116.46 18.567 32.325 3.8047 66.516 87.759 71.47 116.16 10.159-65.215-6.9881-103.17-9.0036-108.92-6.7324-19.226-52.482-65.605-82.929-73.799-106.33-28.615-110.3-54.497-146-114\"/>   <path d=\"m1075.9 1162.7c21 79-69.932 106.28-69.932 183.28\"/>  </g>  <g display=\"none\" shape-rendering=\"auto\">   <path d=\"m364.01 1281.2c-21.552 0-33.852 4.0186-41.337 9.7764-3.7425 2.8789-6.0956 6.2209-7.3367 9.0856-1.2416 2.8646-1.4125 6.1813-1.4125 6.1813v109.56s0.17215 3.3167 1.4125 6.1813c1.2411 2.8646 3.5942 6.2067 7.3367 9.0856 7.4851 5.7577 19.786 9.7764 41.337 9.7764 21.552 0 33.852-4.0187 41.337-9.7764 3.7425-2.8789 6.0956-6.221 7.3368-9.0856 1.2415-2.8646 1.4124-6.1813 1.4124-6.1813v-109.56s-0.17215-3.3167-1.4124-6.1813c-1.2412-2.8647-3.5943-6.2067-7.3368-9.0856-7.4851-5.7578-19.786-9.7764-41.337-9.7764zm122.09 0c-21.552 0-33.852 4.0186-41.337 9.7764-3.7424 2.8789-6.0956 6.2209-7.3368 9.0856-1.2415 2.8646-1.4124 6.1813-1.4124 6.1813v31.304c0 6.026 3.4641 10.09 6.6888 12.925 3.2249 2.835 6.9417 5.022 11.134 7.1718 8.3841 4.2997 18.721 8.2357 28.895 12.149 10.174 3.913 20.185 7.803 27.061 11.33 3.4382 1.7631 6.08 3.4892 7.3061 4.5672 0.3068 0.2707 0.21921 0.2013 0.3068 0.3056v28.675c-0.0593 0.1453-0.20029 0.5821-1.4246 1.5224-2.6906 2.0687-10.737 5.8759-29.88 5.8759-19.144 0-27.191-3.8075-29.879-5.8756-1.286-0.9893-1.4544-1.4937-1.4979-1.6019-1.4857-11.68-18.749-10.558-18.709 1.2167 0 0 0.17214 3.3167 1.4124 6.1813 1.2412 2.8646 3.5945 6.2067 7.3368 9.0856 7.4851 5.7577 19.786 9.7764 41.337 9.7764 21.552 0 33.852-4.0187 41.337-9.7764 3.7425-2.8789 6.0956-6.221 7.3368-9.0856 1.2415-2.8646 1.4125-6.1813 1.4125-6.1813v-31.304c0-6.0261-3.4642-10.09-6.6889-12.925-3.2249-2.835-6.9417-5.022-11.134-7.1718-8.3842-4.2997-18.721-8.2357-28.895-12.149-10.174-3.913-20.185-7.803-27.061-11.33-3.4381-1.7631-6.08-3.4892-7.306-4.5672-0.30996-0.2708-0.21909-0.2012-0.30681-0.3055v-28.675c0.0593-0.1452 0.20029-0.5819 1.4247-1.5224 2.6906-2.0685 10.737-5.8758 29.88-5.8758 19.144 0 27.191 3.8074 29.88 5.8757 1.2859 0.9892 1.4544 1.4936 1.4978 1.6019 1.4857 11.68 18.749 10.558 18.709-1.2167 0 0-0.17227-3.3167-1.4125-6.1813-1.2412-2.8647-3.5943-6.2067-7.3368-9.0856-7.4851-5.7578-19.786-9.7764-41.337-9.7764zm-203.62 2.9959c-5.1842 0.078-9.3248 4.3414-9.2506 9.5257v124.64c-1.5583 1.5205-4.0301 3.7113-6.2608 3.7113h-31.304c-3.1304 0-7.8383-5.2092-7.8383-5.2092-6.8897-10.692-22.847-0.054-15.628 10.418 0 0 7.8138 13.573 23.466 13.573h31.304c15.652 0 23.466-13.573 23.466-13.573 1.0283-1.5426 1.5774-3.3552 1.5774-5.2092v-128.35c0.0757-5.2944-4.2375-9.605-9.532-9.5257zm378.64 0.1406c-3.2524 0.097-6.223 1.8718-7.8508 4.6895l-38.824 67.298-38.824-67.298c-4.8068-8.3135-17.517-4.9075-17.523 4.6956v134.61c-0.17846 12.7 18.962 12.7 18.782 0v-99.537l29.433 51.016c3.6159 6.2569 12.648 6.2569 16.264 0l29.433-51.016v99.537c-0.17846 12.7 18.962 12.7 18.783 0v-134.61c0-5.2958-4.3788-9.5431-9.6724-9.3851zm-297.11 15.646c19.144 0 27.191 3.8074 29.88 5.8757 1.2227 0.9405 1.3638 1.377 1.4246 1.5224v107.29c-0.0593 0.1452-0.20041 0.5819-1.4246 1.5224-2.6888 2.0681-10.736 5.8756-29.88 5.8756-19.144 0-27.191-3.8075-29.879-5.8756-1.2228-0.9405-1.3639-1.377-1.4247-1.5224v-107.29c0.0593-0.1453 0.20041-0.5819 1.4247-1.5224 2.6887-2.0683 10.736-5.8757 29.879-5.8757z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"#182f51\" fill-opacity=\".4596\" image-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>   <path d=\"m361.31 1277.6c-21.552 0-33.852 4.0187-41.337 9.7764-3.7425 2.8789-6.0956 6.221-7.3368 9.0856-1.2415 2.8646-1.4124 6.1813-1.4124 6.1813v109.56s0.17214 3.3167 1.4124 6.1813c1.2412 2.8647 3.5943 6.2067 7.3368 9.0856 7.4851 5.7578 19.786 9.7764 41.337 9.7764 21.552 0 33.852-4.0186 41.337-9.7764 3.7425-2.8789 6.0956-6.2209 7.3368-9.0856 1.2415-2.8646 1.4124-6.1813 1.4124-6.1813v-109.56s-0.17214-3.3167-1.4124-6.1813c-1.2412-2.8646-3.5943-6.2067-7.3368-9.0856-7.4851-5.7577-19.786-9.7764-41.337-9.7764zm122.09 0c-21.552 0-33.852 4.0187-41.337 9.7764-3.7424 2.8789-6.0956 6.221-7.3368 9.0856-1.2415 2.8646-1.4124 6.1813-1.4124 6.1813v31.304c0 6.0261 3.4641 10.09 6.6888 12.925 3.2249 2.835 6.9417 5.022 11.134 7.1718 8.3842 4.2997 18.721 8.2357 28.895 12.149 10.174 3.913 20.185 7.8032 27.061 11.33 3.4381 1.7631 6.08 3.4892 7.306 4.5672 0.30681 0.2708 0.21922 0.2013 0.30681 0.3056v28.675c-0.0593 0.1451-0.20029 0.5819-1.4246 1.5223-2.6906 2.0686-10.737 5.8759-29.88 5.8759-19.144 0-27.191-3.8074-29.88-5.8757-1.2859-0.9893-1.4543-1.4936-1.4978-1.6019-1.4857-11.68-18.749-10.558-18.709 1.2167 0 0 0.17215 3.3167 1.4124 6.1813 1.2412 2.8647 3.5945 6.2067 7.3368 9.0856 7.4851 5.7578 19.786 9.7764 41.337 9.7764 21.552 0 33.852-4.0186 41.337-9.7764 3.7425-2.8789 6.0956-6.2209 7.3368-9.0856 1.2415-2.8646 1.4125-6.1813 1.4125-6.1813v-31.304c0-6.026-3.4642-10.09-6.6889-12.925-3.2249-2.835-6.9417-5.022-11.134-7.1718-8.3842-4.2997-18.721-8.2357-28.895-12.149-10.174-3.913-20.185-7.803-27.061-11.33-3.4382-1.7631-6.08-3.4892-7.306-4.5671-0.30997-0.2708-0.2191-0.2013-0.30681-0.3055v-28.675c0.0593-0.1453 0.20029-0.582 1.4247-1.5225 2.6904-2.0685 10.737-5.8757 29.88-5.8757 19.144 0 27.191 3.8073 29.879 5.8756 1.286 0.9892 1.4544 1.4937 1.4979 1.6019 1.4857 11.68 18.749 10.558 18.709-1.2167 0 0-0.17227-3.3167-1.4125-6.1813-1.2412-2.8646-3.5943-6.2067-7.3368-9.0856-7.4851-5.7577-19.786-9.7764-41.337-9.7764zm-203.62 2.9959c-5.1843 0.078-9.3248 4.3415-9.2506 9.5258v124.64c-1.5583 1.5206-4.0301 3.7114-6.2608 3.7114h-31.304c-3.1304 0-7.8383-5.2093-7.8383-5.2093-6.8897-10.692-22.847-0.054-15.628 10.418 0 0 7.8138 13.573 23.466 13.573h31.304c15.652 0 23.466-13.573 23.466-13.573 1.0284-1.5426 1.5774-3.3552 1.5774-5.2091v-128.35c0.0745-5.2945-4.2374-9.6051-9.5318-9.5258zm378.64 0.1406c-3.2524 0.097-6.223 1.8719-7.8508 4.6895l-38.824 67.298-38.824-67.298c-4.8068-8.3135-17.518-4.9075-17.523 4.6957v134.61c-0.17845 12.7 18.962 12.7 18.782 0v-99.538l29.433 51.016c3.6159 6.2569 12.648 6.2569 16.264 0l29.433-51.016v99.538c-0.17845 12.7 18.962 12.7 18.783 0v-134.61c0-5.2959-4.3788-9.5431-9.6724-9.3852zm-297.11 15.646c19.144 0 27.191 3.8073 29.88 5.8756 1.2227 0.9405 1.3638 1.377 1.4246 1.5224v107.29c-0.0593 0.1453-0.20042 0.5819-1.4246 1.5224-2.6888 2.0683-10.736 5.8757-29.88 5.8757-19.144 0-27.191-3.8074-29.879-5.8757-1.2228-0.9405-1.3639-1.377-1.4247-1.5224v-107.29c0.0593-0.1452 0.20041-0.5819 1.4247-1.5224 2.6887-2.0683 10.736-5.8756 29.879-5.8756z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"#d6e3fa\" fill-opacity=\".93939\" image-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>  </g>  <g display=\"none\" shape-rendering=\"auto\">   <path d=\"m1321.2 365.6c-36.24 0-56.924 6.7575-69.51 16.439-6.2931 4.841-10.25 10.461-12.337 15.278-2.0877 4.8169-2.3751 10.394-2.3751 10.394v184.24s0.2896 5.5773 2.3751 10.394c2.0872 4.8169 6.044 10.437 12.337 15.278 12.586 9.682 33.27 16.439 69.51 16.439 36.24 0 56.924-6.7575 69.51-16.439 6.2931-4.841 10.25-10.461 12.337-15.278 2.0876-4.8169 2.3751-10.394 2.3751-10.394v-184.24s-0.2896-5.5773-2.3751-10.394c-2.0872-4.8169-6.044-10.437-12.337-15.278-12.586-9.682-33.27-16.439-69.51-16.439zm205.29 0c-36.24 0-56.924 6.7575-69.51 16.439-6.293 4.841-10.25 10.461-12.337 15.278-2.0877 4.8169-2.3751 10.394-2.3751 10.394v52.639c0 10.133 5.8251 16.967 11.247 21.734 5.423 4.7672 11.673 8.4446 18.722 12.06 14.098 7.2301 31.48 13.849 48.588 20.429 17.108 6.5799 33.941 13.121 45.504 19.051 5.7813 2.9648 10.224 5.8673 12.285 7.68 0.5159 0.45533 0.3685 0.33847 0.5159 0.51376v48.218c-0.1001 0.24424-0.337 0.97861-2.3957 2.56-4.5243 3.4783-18.054 9.8804-50.245 9.8804s-45.722-6.4023-50.244-9.8801c-2.1624-1.6635-2.4456-2.5116-2.5188-2.6936-2.4982-19.641-31.527-17.753-31.46 2.0459 0 0 0.2896 5.5773 2.3751 10.394 2.0872 4.8169 6.0441 10.437 12.337 15.278 12.586 9.682 33.271 16.439 69.51 16.439 36.24 0 56.924-6.7575 69.51-16.439 6.2931-4.841 10.25-10.461 12.337-15.278 2.0876-4.8169 2.3751-10.394 2.3751-10.394v-52.639c0-10.133-5.8251-16.967-11.248-21.734-5.4228-4.7672-11.673-8.4446-18.722-12.06-14.098-7.2301-31.48-13.849-48.588-20.429-17.108-6.5799-33.941-13.121-45.504-19.051-5.7814-2.9648-10.224-5.8673-12.286-7.68-0.5211-0.45533-0.3684-0.33847-0.5158-0.51376v-48.218c0.1-0.24425 0.3368-0.97862 2.3956-2.56 4.5243-3.4783 18.054-9.8804 50.245-9.8804s45.722 6.4023 50.244 9.8801c2.1624 1.6634 2.4456 2.5116 2.5187 2.6936 2.4983 19.641 31.527 17.753 31.46-2.0459 0 0-0.2895-5.5773-2.3751-10.394-2.0872-4.8169-6.044-10.437-12.337-15.278-12.586-9.682-33.27-16.439-69.51-16.439zm-342.39 5.0377c-8.7175 0.13055-15.68 7.3003-15.555 16.018v209.58c-2.6203 2.5568-6.7768 6.2406-10.528 6.2406h-52.639c-5.2639 0-13.18-8.7595-13.18-8.7595-11.585-17.979-38.419-0.0905-26.278 17.519 0 0 13.139 22.824 39.459 22.824h52.639c26.319 0 39.459-22.824 39.459-22.824 1.7292-2.594 2.6526-5.6419 2.6526-8.7595v-215.82c0.1262-8.9028-7.1253-16.151-16.028-16.018zm636.7 0.23636c-5.4692 0.16422-10.464 3.1477-13.201 7.8857l-65.285 113.16-65.285-113.16c-8.0827-13.98-29.456-8.2522-29.466 7.8959v226.35c-0.3001 21.356 31.886 21.356 31.583 0v-167.38l49.493 85.785c6.0804 10.521 21.268 10.521 27.348 0l49.493-85.785v167.38c-0.3 21.356 31.886 21.356 31.584 0v-226.35c0-8.9051-7.3631-16.047-16.264-15.781zm-499.6 26.309c32.191 0 45.722 6.4023 50.244 9.8801 2.0561 1.5814 2.2934 2.3155 2.3956 2.56v180.41c-0.1 0.24424-0.3369 0.97861-2.3956 2.56-4.5212 3.4778-18.053 9.8801-50.244 9.8801-32.191 0-45.722-6.4023-50.244-9.8801-2.0561-1.5814-2.2934-2.3155-2.3957-2.56v-180.41c0.1001-0.24425 0.337-0.97862 2.3957-2.56 4.5212-3.4778 18.053-9.8801 50.244-9.8801z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"#182f51\" fill-opacity=\".5303\" image-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>   <path d=\"m1316.7 359.51c-36.24 0-56.924 6.7575-69.51 16.439-6.2931 4.841-10.25 10.461-12.337 15.278-2.0876 4.8169-2.3751 10.394-2.3751 10.394v184.24s0.2896 5.5773 2.3751 10.394c2.0872 4.8169 6.044 10.437 12.337 15.278 12.586 9.682 33.27 16.439 69.51 16.439 36.24 0 56.924-6.7575 69.51-16.439 6.2931-4.841 10.25-10.461 12.337-15.278 2.0877-4.8169 2.3751-10.394 2.3751-10.394v-184.24s-0.2896-5.5773-2.3751-10.394c-2.0872-4.8169-6.044-10.437-12.337-15.278-12.586-9.682-33.27-16.439-69.51-16.439zm205.29 0c-36.24 0-56.924 6.7575-69.51 16.439-6.293 4.841-10.25 10.461-12.337 15.278-2.0876 4.8169-2.3751 10.394-2.3751 10.394v52.639c0 10.133 5.8251 16.967 11.248 21.734 5.4229 4.7672 11.673 8.4446 18.722 12.06 14.098 7.2301 31.48 13.849 48.588 20.429 17.108 6.5799 33.941 13.121 45.504 19.051 5.7813 2.9648 10.224 5.8673 12.285 7.68 0.5159 0.45533 0.3685 0.33847 0.5159 0.51377v48.218c-0.1 0.24425-0.3369 0.97862-2.3956 2.56-4.5243 3.4783-18.054 9.8804-50.245 9.8804-32.191 0-45.722-6.4023-50.244-9.8801-2.1624-1.6634-2.4455-2.5116-2.5187-2.6936-2.4982-19.641-31.527-17.753-31.46 2.0459 0 0 0.2896 5.5773 2.3751 10.394 2.0872 4.8169 6.0441 10.437 12.337 15.278 12.586 9.682 33.271 16.439 69.51 16.439 36.24 0 56.924-6.7575 69.511-16.439 6.293-4.841 10.25-10.461 12.337-15.278 2.0877-4.8169 2.3752-10.394 2.3752-10.394v-52.639c0-10.133-5.8252-16.967-11.248-21.734-5.4229-4.7672-11.673-8.4446-18.722-12.06-14.098-7.2301-31.48-13.849-48.588-20.429-17.108-6.5799-33.941-13.121-45.504-19.051-5.7814-2.9648-10.224-5.8673-12.286-7.68-0.5211-0.45533-0.3684-0.33847-0.5158-0.51376v-48.218c0.1001-0.24424 0.3369-0.97861 2.3957-2.56 4.5243-3.4783 18.054-9.8804 50.245-9.8804 32.191 0 45.722 6.4023 50.244 9.8801 2.1624 1.6635 2.4456 2.5116 2.5188 2.6936 2.4982 19.641 31.527 17.753 31.46-2.0459 0 0-0.2896-5.5773-2.3752-10.394-2.0872-4.8169-6.044-10.437-12.337-15.278-12.587-9.682-33.271-16.439-69.511-16.439zm-342.39 5.0377c-8.7176 0.13054-15.68 7.3003-15.555 16.018v209.58c-2.6203 2.5568-6.7768 6.2406-10.528 6.2406h-52.639c-5.264 0-13.18-8.7595-13.18-8.7595-11.585-17.979-38.419-0.0905-26.279 17.519 0 0 13.139 22.824 39.459 22.824h52.639c26.32 0 39.459-22.824 39.459-22.824 1.7292-2.594 2.6525-5.6418 2.6525-8.7595v-215.82c0.1263-8.9028-7.1253-16.151-16.028-16.018zm636.7 0.23635c-5.4692 0.16423-10.464 3.1477-13.201 7.8857l-65.285 113.16-65.285-113.16c-8.0827-13.98-29.456-8.2522-29.466 7.8959v226.35c-0.3001 21.356 31.886 21.356 31.584 0v-167.38l49.493 85.785c6.0803 10.521 21.268 10.521 27.348 0l49.493-85.785v167.38c-0.3 21.356 31.886 21.356 31.584 0v-226.35c0-8.9051-7.3632-16.047-16.264-15.781zm-499.6 26.309c32.191 0 45.722 6.4023 50.244 9.8801 2.0561 1.5814 2.2934 2.3155 2.3957 2.56v180.41c-0.1001 0.24425-0.337 0.97862-2.3957 2.56-4.5212 3.4778-18.053 9.8801-50.244 9.8801s-45.722-6.4023-50.244-9.8801c-2.0561-1.5814-2.2934-2.3155-2.3956-2.56v-180.41c0.1-0.24424 0.3369-0.97861 2.3956-2.56 4.5212-3.4778 18.053-9.8801 50.244-9.8801z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"#bdd2f3\" image-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>  </g>  <g display=\"none\" shape-rendering=\"auto\">   <path d=\"m1364.5 335.87c-44.454 0-69.825 8.289-85.264 20.165-7.7194 5.9381-12.573 12.832-15.133 18.74-2.5608 5.9086-2.9134 12.75-2.9134 12.75v225.99s0.3552 6.8413 2.9134 12.75c2.5602 5.9086 7.4138 12.802 15.133 18.74 15.439 11.876 40.811 20.165 85.264 20.165 44.453 0 69.825-8.289 85.264-20.165 7.7194-5.9381 12.573-12.832 15.133-18.74 2.5608-5.9086 2.9134-12.75 2.9134-12.75v-225.99s-0.3552-6.8413-2.9134-12.75c-2.5602-5.9086-7.4138-12.802-15.133-18.74-15.439-11.876-40.811-20.165-85.264-20.165zm251.82 0c-44.453 0-69.825 8.289-85.264 20.165-7.7193 5.9381-12.573 12.832-15.133 18.74-2.5608 5.9086-2.9134 12.75-2.9134 12.75v64.569c0 12.43 7.1453 20.812 13.797 26.66 6.652 5.8476 14.318 10.359 22.965 14.793 17.294 8.8687 38.615 16.987 59.6 25.058 20.985 8.0712 41.634 16.095 55.818 23.369 7.0916 3.6368 12.541 7.197 15.07 9.4206 0.6328 0.55853 0.452 0.41518 0.6328 0.63021v59.147c-0.1227 0.2996-0.4133 1.2004-2.9386 3.1402-5.5497 4.2667-22.146 12.12-61.633 12.12-39.487 0-56.085-7.8533-61.631-12.119-2.6525-2.0405-2.9998-3.0808-3.0896-3.3041-3.0644-24.093-38.672-21.777-38.591 2.5096 0 0 0.3552 6.8413 2.9134 12.75 2.5602 5.9086 7.4139 12.802 15.133 18.74 15.439 11.876 40.811 20.165 85.264 20.165 44.454 0 69.825-8.289 85.265-20.165 7.7193-5.9381 12.573-12.832 15.133-18.74 2.5608-5.9086 2.9135-12.75 2.9135-12.75v-64.569c0-12.43-7.1454-20.812-13.797-26.66-6.6519-5.8476-14.318-10.359-22.965-14.793-17.294-8.8687-38.615-16.987-59.6-25.058-20.985-8.0712-41.634-16.095-55.818-23.369-7.0917-3.6368-12.541-7.197-15.07-9.4206-0.6392-0.55853-0.4519-0.41518-0.6327-0.6302v-59.147c0.1227-0.2996 0.4132-1.2004 2.9386-3.1402 5.5497-4.2667 22.146-12.12 61.633-12.12 39.487 0 56.085 7.8533 61.631 12.119 2.6525 2.0405 2.9999 3.0808 3.0896 3.3041 3.0645 24.093 38.672 21.777 38.591-2.5096 0 0-0.3552-6.8413-2.9135-12.75-2.5602-5.9086-7.4138-12.802-15.133-18.74-15.439-11.876-40.811-20.165-85.265-20.165zm-419.99 6.1795c-10.693 0.16013-19.234 8.9549-19.081 19.648v257.08c-3.2142 3.1363-8.3127 7.655-12.914 7.655h-64.569c-6.457 0-16.168-10.745-16.168-10.745-14.211-22.054-47.126-0.11106-32.234 21.489 0 0 16.117 27.997 48.402 27.997h64.569c32.285 0 48.402-27.997 48.402-27.997 2.1211-3.1819 3.2537-6.9205 3.2537-10.745v-264.73c0.1549-10.921-8.7402-19.812-19.661-19.648zm781 0.28992c-6.7088 0.20145-12.836 3.8611-16.193 9.6729l-80.081 138.81-80.081-138.81c-9.9146-17.148-36.132-10.122-36.144 9.6854v277.65c-0.3681 26.196 39.112 26.196 38.742 0v-205.31l60.71 105.23c7.4584 12.906 26.088 12.906 33.546 0l60.71-105.23v205.31c-0.368 26.196 39.112 26.196 38.742 0v-277.65c0-10.923-9.032-19.684-19.951-19.358zm-612.83 32.272c39.487 0 56.085 7.8533 61.631 12.119 2.5221 1.9398 2.8132 2.8403 2.9386 3.1402v221.3c-0.1227 0.2996-0.4133 1.2004-2.9386 3.1402-5.5459 4.266-22.144 12.119-61.631 12.119-39.487 0-56.085-7.8533-61.631-12.119-2.5221-1.9398-2.8132-2.8403-2.9386-3.1402v-221.3c0.1227-0.2996 0.4133-1.2004 2.9386-3.1402 5.5459-4.266 22.144-12.119 61.631-12.119z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"#182f51\" fill-opacity=\".075758\" image-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>   <path d=\"m1359 328.4c-44.454 0-69.825 8.289-85.264 20.165-7.7194 5.9381-12.573 12.832-15.133 18.74-2.5608 5.9086-2.9134 12.75-2.9134 12.75v225.99s0.3552 6.8413 2.9134 12.75c2.5602 5.9086 7.4138 12.802 15.133 18.74 15.439 11.876 40.811 20.165 85.264 20.165 44.453 0 69.825-8.289 85.264-20.165 7.7194-5.9381 12.573-12.832 15.133-18.74 2.5608-5.9086 2.9134-12.75 2.9134-12.75v-225.99s-0.3552-6.8413-2.9134-12.75c-2.5602-5.9086-7.4138-12.802-15.133-18.74-15.439-11.876-40.811-20.165-85.264-20.165zm251.82 0c-44.453 0-69.825 8.289-85.264 20.165-7.7193 5.9381-12.573 12.832-15.133 18.74-2.5608 5.9086-2.9134 12.75-2.9134 12.75v64.569c0 12.43 7.1453 20.812 13.797 26.66 6.652 5.8476 14.318 10.359 22.965 14.793 17.294 8.8687 38.615 16.987 59.6 25.058 20.985 8.0712 41.634 16.095 55.818 23.369 7.0916 3.6368 12.541 7.197 15.07 9.4206 0.6328 0.55853 0.452 0.41518 0.6328 0.63021v59.147c-0.1227 0.2996-0.4133 1.2004-2.9386 3.1402-5.5497 4.2667-22.146 12.12-61.633 12.12-39.487 0-56.085-7.8533-61.631-12.119-2.6525-2.0405-2.9998-3.0808-3.0896-3.3041-3.0644-24.093-38.672-21.777-38.591 2.5096 0 0 0.3552 6.8413 2.9134 12.75 2.5602 5.9086 7.4139 12.802 15.133 18.74 15.439 11.876 40.811 20.165 85.264 20.165 44.454 0 69.825-8.289 85.265-20.165 7.7193-5.9381 12.573-12.832 15.133-18.74 2.5608-5.9086 2.9135-12.75 2.9135-12.75v-64.569c0-12.43-7.1454-20.812-13.797-26.66-6.6519-5.8476-14.318-10.359-22.965-14.793-17.294-8.8687-38.615-16.987-59.6-25.058-20.985-8.0712-41.634-16.095-55.818-23.369-7.0917-3.6368-12.541-7.197-15.07-9.4206-0.6392-0.55853-0.4519-0.41518-0.6327-0.6302v-59.147c0.1227-0.2996 0.4132-1.2004 2.9386-3.1402 5.5497-4.2667 22.146-12.12 61.633-12.12 39.487 0 56.085 7.8533 61.631 12.119 2.6525 2.0405 2.9999 3.0808 3.0896 3.3041 3.0645 24.093 38.672 21.777 38.591-2.5096 0 0-0.3552-6.8413-2.9135-12.75-2.5602-5.9086-7.4138-12.802-15.133-18.74-15.439-11.876-40.811-20.165-85.265-20.165zm-419.99 6.1795c-10.693 0.16013-19.234 8.9549-19.081 19.648v257.08c-3.2142 3.1363-8.3127 7.655-12.914 7.655h-64.569c-6.457 0-16.168-10.745-16.168-10.745-14.211-22.054-47.126-0.11106-32.234 21.489 0 0 16.117 27.997 48.402 27.997h64.569c32.285 0 48.402-27.997 48.402-27.997 2.1211-3.1819 3.2537-6.9205 3.2537-10.745v-264.73c0.1549-10.921-8.7402-19.812-19.661-19.648zm781 0.28992c-6.7088 0.20145-12.836 3.8611-16.193 9.6729l-80.081 138.81-80.081-138.81c-9.9146-17.148-36.132-10.122-36.144 9.6854v277.65c-0.3681 26.196 39.112 26.196 38.742 0v-205.31l60.71 105.23c7.4584 12.906 26.088 12.906 33.546 0l60.71-105.23v205.31c-0.368 26.196 39.112 26.196 38.742 0v-277.65c0-10.923-9.032-19.684-19.951-19.358zm-612.83 32.272c39.487 0 56.085 7.8533 61.631 12.119 2.5221 1.9398 2.8132 2.8403 2.9386 3.1402v221.3c-0.1227 0.2996-0.4133 1.2004-2.9386 3.1402-5.5459 4.266-22.144 12.119-61.631 12.119-39.487 0-56.085-7.8533-61.631-12.119-2.5221-1.9398-2.8132-2.8403-2.9386-3.1402v-221.3c0.1227-0.2996 0.4133-1.2004 2.9386-3.1402 5.5459-4.266 22.144-12.119 61.631-12.119z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"url(#linearGradient1686)\" image-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>  </g>  <g display=\"none\">   <g fill=\"none\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"6\">    <path d=\"m1085 185v30s0 15-15 15c-3 0-5-3-5-3\" display=\"inline\"/>    <path d=\"m1100 220v-25s0-12 15-12 15 12 15 12v25s1 12-15 12c-15 0-15-12-15-12z\" display=\"inline\"/>    <path d=\"m1175 188s0-5-15-5-15 17-15 17c0 10 30 5 30 15 0 0 0 17-15 17s-15-7-15-7\" display=\"inline\"/>    <path d=\"m1190 230v-45l15 25 15-25v45\" display=\"inline\"/>    <path d=\"m1085 261v41s-2 3-5 3h-10c-3 0-5-3-5-3\" display=\"inline\"/>    <path d=\"m1100 300v-35s0-5 15-5 15 5 15 5v35s1 5-15 5c-15 0-15-5-15-5z\" display=\"inline\"/>    <path d=\"m1190 304v-43l15 26 15-26v43\" display=\"inline\"/>    <path d=\"m1175 265s0-5-15-5-15 5-15 5v10c0 5 30 10 30 15v10s1 5-15 5c-15 0-15-5-15-5\" display=\"inline\"/>    <path d=\"m1085 331v41s-2 3-5 3h-10c-3 0-5-3-5-3\" display=\"inline\"/>    <path d=\"m1098 370v-35s0-5 15-5 15 5 15 5v35s1 5-15 5c-15 0-15-5-15-5z\" display=\"inline\"/>    <path d=\"m1184 374v-43l15 26 15-26v43\" display=\"inline\"/>    <path d=\"m1171 335s0-5-15-5-15 5-15 5v10c0 5 30 10 30 15v10s1 5-15 5c-15 0-15-5-15-5\" display=\"inline\"/>    <path d=\"m1085 395v41s-2 3-5 3h-10c-3 0-5-3-5-3\" display=\"inline\"/>    <path d=\"m1098 434v-35s0-5 13-5 13 5 13 5v35s0 5-13 5-13-5-13-5z\" display=\"inline\"/>    <path d=\"m1176 438v-43l15 26 15-26v43\" display=\"inline\"/>    <path d=\"m1163 399s0-5-13-5-13 5-13 5v10c0 5 26 10 26 15v10s0 5-13 5-13-5-13-5\" display=\"inline\"/>   </g>   <path d=\"m1110 452c-6.8846 0-10.814 1.2837-13.205 3.123-1.1955 0.91965-1.9472 1.9873-2.3437 2.9023-0.3966 0.91508-0.4512 1.9746-0.4512 1.9746v35s0.055 1.0595 0.4512 1.9746c0.3965 0.91508 1.1482 1.9827 2.3437 2.9023 2.3911 1.8393 6.3205 3.123 13.205 3.123s10.814-1.2837 13.205-3.123c1.1955-0.91965 1.9472-1.9873 2.3437-2.9023 0.3966-0.91508 0.4512-1.9746 0.4512-1.9746v-35s-0.055-1.0595-0.4512-1.9746c-0.3965-0.91508-1.1482-1.9827-2.3437-2.9023-2.3911-1.8393-6.3205-3.123-13.205-3.123zm39 0c-6.8846 0-10.814 1.2837-13.205 3.123-1.1955 0.91965-1.9472 1.9873-2.3437 2.9023-0.3966 0.91508-0.4512 1.9746-0.4512 1.9746v10c0 1.925 1.1066 3.2233 2.1367 4.1289 1.0302 0.90563 2.2175 1.6042 3.5567 2.291 2.6783 1.3735 5.9804 2.6309 9.2304 3.8809s6.4479 2.4927 8.6446 3.6191c1.0983 0.56324 1.9422 1.1146 2.3339 1.459 0.098 0.0865 0.07 0.0643 0.098 0.0976v9.1602c-0.019 0.0464-0.064 0.18591-0.4551 0.48633-0.8595 0.66079-3.4298 1.877-9.5452 1.877s-8.686-1.2163-9.5449-1.877c-0.4108-0.31601-0.4646-0.47713-0.4785-0.51172-0.4746-3.7313-5.9892-3.3726-5.9766 0.38867 0 0 0.055 1.0595 0.4512 1.9746 0.3965 0.91508 1.1482 1.9827 2.3437 2.9023 2.3911 1.8393 6.3205 3.123 13.205 3.123s10.814-1.2837 13.205-3.123c1.1955-0.91965 1.9472-1.9873 2.3437-2.9023 0.3966-0.91508 0.4512-1.9746 0.4512-1.9746v-10c0-1.925-1.1066-3.2233-2.1367-4.1289-1.0302-0.90563-2.2175-1.6042-3.5567-2.291-2.6783-1.3735-5.9804-2.6309-9.2304-3.8809s-6.4479-2.4927-8.6446-3.6191c-1.0983-0.56324-1.9422-1.1146-2.3339-1.459-0.099-0.0865-0.07-0.0643-0.098-0.0976v-9.1602c0.019-0.0464 0.064-0.18591 0.4551-0.48633 0.8595-0.66079 3.4298-1.877 9.5452-1.877s8.686 1.2163 9.5449 1.877c0.4108 0.31601 0.4646 0.47713 0.4785 0.51172 0.4746 3.7313 5.9892 3.3726 5.9766-0.38867 0 0-0.055-1.0595-0.4512-1.9746-0.3965-0.91508-1.1482-1.9827-2.3437-2.9023-2.3911-1.8393-6.3205-3.123-13.205-3.123zm-65.045 0.95703c-1.6561 0.0248-2.9788 1.3869-2.9551 3.043v39.814c-0.4978 0.48573-1.2874 1.1856-2 1.1856h-10c-1 0-2.5039-1.6641-2.5039-1.6641-2.2009-3.4156-7.2985-0.0172-4.9922 3.3281 0 0 2.4961 4.3359 7.4961 4.3359h10c5 0 7.4961-4.3359 7.4961-4.3359 0.3285-0.49279 0.5039-1.0718 0.5039-1.6641v-41c0.024-1.6913-1.3536-3.0683-3.0449-3.043zm120.96 0.0449c-1.039 0.0312-1.9879 0.59798-2.5079 1.4981l-12.402 21.498-12.402-21.498c-1.5355-2.6557-5.5959-1.5677-5.5977 1.5v43c-0.057 4.057 6.0574 4.057 6 0v-31.797l9.4023 16.297c1.1551 1.9987 4.0403 1.9987 5.1954 0l9.4023-16.297v31.797c-0.057 4.057 6.0574 4.057 6 0v-43c-5e-4 -1.6917-1.3988-3.0485-3.0898-2.998zm-94.91 4.9981c6.1154 0 8.686 1.2163 9.5449 1.877 0.3906 0.30042 0.4357 0.43989 0.4551 0.48633v34.273c-0.019 0.0464-0.064 0.18591-0.4551 0.48633-0.8589 0.66069-3.4295 1.877-9.5449 1.877s-8.686-1.2163-9.5449-1.877c-0.3906-0.30042-0.4357-0.43989-0.4551-0.48633v-34.273c0.019-0.0464 0.064-0.18591 0.4551-0.48633 0.8589-0.66069 3.4295-1.877 9.5449-1.877z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" image-rendering=\"auto\" shape-rendering=\"auto\" solid-color=\"#000000\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>  </g>  <g display=\"none\">   <g id=\"g3773\" transform=\"translate(-40,-320)\">    <path d=\"m1320 320-126.92 50.767-31.082 21.733-42 7.5 41.772 3.2586 31.203 25.931 127.03 50.81 60-20v-120z\" display=\"inline\" fill=\"url(#linearGradient9439)\"/>    <g clip-path=\"url(#clipPath3411)\">     <path d=\"m1280 350v100h660v-100z\" clip-path=\"none\" display=\"inline\" fill=\"#853909\"/>     <path d=\"m1940 380v-40l-85-10h-480l-95 10v40z\" clip-path=\"none\" fill=\"#974613\"/>     <path d=\"m1940 420v40l-85 10h-495l-80-10v-40z\" clip-path=\"none\" fill=\"#642b06\"/>     <path d=\"m1280 320v20h660v-20z\" clip-path=\"none\" display=\"inline\" fill=\"#b25c28\"/>     <path d=\"m1280 460v20h660v-20z\" clip-path=\"none\" display=\"inline\" fill=\"#4d2105\"/>    </g>    <path d=\"m1780.1 386.07c-3.9797 0-6.2505 0.74145-7.6328 1.8047-0.691 0.53161-1.1262 1.1488-1.3554 1.6777-0.2288 0.52896-0.2618 1.1406-0.2618 1.1406v20.232s0.033 0.61361 0.2618 1.1426c0.2292 0.52897 0.6644 1.1461 1.3554 1.6777 1.3823 1.0632 3.6531 1.8047 7.6328 1.8047 3.9798 0 6.2506-0.74146 7.6328-1.8047 0.6911-0.53162 1.1263-1.1488 1.3555-1.6777 0.2288-0.52897 0.2598-1.1426 0.2598-1.1426v-20.232s-0.031-0.61167-0.2598-1.1406c-0.2292-0.52898-0.6643-1.1461-1.3555-1.6777-1.3821-1.0632-3.653-1.8047-7.6328-1.8047zm22.545 0c-3.9798 0-6.2526 0.74145-7.6348 1.8047-0.6911 0.53161-1.1243 1.1488-1.3535 1.6777-0.2297 0.52896-0.2617 1.1406-0.2617 1.1406v5.7812c0 1.1128 0.6388 1.8632 1.2343 2.3867 0.5955 0.52351 1.2826 0.92722 2.0567 1.3242 1.5483 0.79397 3.4572 1.5216 5.3359 2.2441s3.7282 1.4406 4.9981 2.0918c0.6349 0.32559 1.1212 0.64468 1.3476 0.84375 0.059 0.0496 0.043 0.0373 0.059 0.0566v5.2949c-0.011 0.0268-0.038 0.10759-0.2637 0.28125-0.4968 0.38198-1.9824 1.084-5.5175 1.084s-5.0212-0.70207-5.5176-1.084c-0.2374-0.18268-0.2674-0.27688-0.2774-0.29688-0.2731-2.1586-3.465-1.9512-3.455 0.22461 0 0 0.033 0.61361 0.2617 1.1426 0.2292 0.52897 0.6625 1.1461 1.3535 1.6777 1.3822 1.0632 3.6551 1.8047 7.6348 1.8047s6.2506-0.74146 7.6328-1.8047c0.691-0.53162 1.1261-1.1488 1.3554-1.6777 0.2298-0.52897 0.2598-1.1426 0.2598-1.1426v-5.7793c0-1.1128-0.639-1.8632-1.2344-2.3867-0.5956-0.52351-1.2825-0.92919-2.0566-1.3262-1.5483-0.79398-3.4572-1.5196-5.3359-2.2422-1.8787-0.7226-3.7263-1.4406-4.9961-2.0918-0.6349-0.32558-1.1232-0.64468-1.3496-0.84375-0.057-0.0496-0.041-0.0373-0.057-0.0566v-5.2949c0.011-0.0268 0.038-0.10759 0.2637-0.28125 0.4968-0.38198 1.9825-1.0859 5.5176-1.0859s5.021 0.70402 5.5175 1.0859c0.2374 0.18267 0.2654 0.27492 0.2754 0.29492 0.2721 2.1597 3.4651 1.9522 3.4551-0.22461 0 0-0.031-0.61167-0.2598-1.1406-0.2293-0.52898-0.6644-1.1461-1.3554-1.6777-1.3822-1.0632-3.6531-1.8047-7.6328-1.8047zm-37.602 0.55274c-0.9572 0.015-1.721 0.80261-1.707 1.7598v23.014c-0.2878 0.28077-0.7444 0.68555-1.1563 0.68555h-5.7812c-0.5781 0-1.4473-0.96094-1.4473-0.96094-1.2643-2.0118-4.2562-0.0165-2.8848 1.9238 0 0 1.4418 2.5059 4.3321 2.5059h5.7812c2.8903 0 4.332-2.5059 4.332-2.5059 0.1907-0.28495 0.2926-0.62003 0.293-0.96289v-23.699c0.014-0.97858-0.7832-1.7753-1.7617-1.7598zm52.719 0.0234c-0.9047-0.0348-1.8222 0.62738-1.8222 1.7363v24.855c-0.01 2.3208 3.4787 2.3208 3.4687 0v-18.381l5.4336 9.4219c0.6675 1.1561 2.3363 1.1561 3.0039 0l5.4356-9.4219v18.381c-0.01 2.3208 3.4787 2.3208 3.4687 0v-24.855c4e-4 -0.97885-0.8087-1.7642-1.7871-1.7344-0.6007 0.0185-1.149 0.34656-1.4492 0.86718l-7.1699 12.426-7.168-12.426c-0.3327-0.5762-0.8712-0.84826-1.4141-0.86914zm-37.662 2.8906c3.5351 0 5.0211 0.70403 5.5176 1.0859 0.2257 0.17367 0.2527 0.25445 0.2637 0.28125v19.812c-0.011 0.0268-0.038 0.10759-0.2637 0.28125-0.4965 0.38192-1.9825 1.084-5.5176 1.084s-5.0209-0.70206-5.5175-1.084c-0.2257-0.17366-0.2527-0.25445-0.2637-0.28125v-19.812c0.011-0.0268 0.038-0.10758 0.2637-0.28125 0.4966-0.38191 1.9824-1.0859 5.5175-1.0859z\" display=\"inline\" fill=\"#120e02\" fill-opacity=\".84343\" filter=\"url(#filter4629-1)\" style=\"paint-order:normal\"/>    <path d=\"m1115 400 65-40c30 15 30 65 0 80z\" clip-path=\"url(#clipPath3446)\" fill=\"#3d3d3d\"/>    <path d=\"m1779.5 385.19c-3.9797 0-6.2511 0.74208-7.6334 1.8053-0.691 0.53161-1.1255 1.1488-1.3548 1.6777-0.2292 0.52896-0.2608 1.1414-0.2608 1.1414v20.232s0.032 0.61248 0.2608 1.1414c0.2293 0.52897 0.6638 1.1461 1.3548 1.6777 1.3823 1.0632 3.6537 1.8053 7.6334 1.8053 3.9798 0 6.2512-0.74208 7.6334-1.8053 0.6911-0.53162 1.1256-1.1488 1.3548-1.6777s0.2609-1.1414 0.2609-1.1414v-20.232s-0.032-0.61248-0.2609-1.1414c-0.2292-0.52898-0.6637-1.1461-1.3548-1.6777-1.3822-1.0632-3.6536-1.8053-7.6334-1.8053zm22.544 0c-3.9798 0-6.2512 0.74208-7.6334 1.8053-0.6911 0.53161-1.1256 1.1488-1.3548 1.6777-0.2292 0.52896-0.2609 1.1414-0.2609 1.1414v5.7806c0 1.1128 0.6397 1.8633 1.2352 2.3868 0.5955 0.52351 1.2819 0.92735 2.056 1.3244 1.5483 0.79397 3.4571 1.5208 5.3358 2.2434s3.7272 1.4409 4.9971 2.0921c0.6349 0.32559 1.1227 0.64432 1.3491 0.84339 0.057 0.05 0.041 0.0371 0.057 0.0564v5.2951c-0.011 0.0268-0.037 0.10747-0.2631 0.28113-0.4968 0.38198-1.9826 1.085-5.5177 1.085s-5.0211-0.70308-5.5175-1.085c-0.2376-0.18268-0.2686-0.27582-0.2767-0.29581a1.7344 1.7344 0 0 0-3.4548 0.22467s0.032 0.61248 0.2608 1.1414c0.2292 0.52897 0.6638 1.1461 1.3548 1.6777 1.3822 1.0632 3.6537 1.8053 7.6334 1.8053s6.2512-0.74208 7.6334-1.8053c0.691-0.53162 1.1255-1.1488 1.3548-1.6777s0.2608-1.1414 0.2608-1.1414v-5.7806c0-1.1128-0.6397-1.8632-1.2351-2.3868-0.5956-0.52351-1.2819-0.92736-2.056-1.3244-1.5483-0.79398-3.4571-1.5208-5.3358-2.2434-1.8787-0.72259-3.7273-1.4409-4.9971-2.0921-0.6349-0.32558-1.1227-0.64432-1.3491-0.84339-0.058-0.05-0.041-0.0371-0.057-0.0564v-5.2951c0.011-0.0268 0.037-0.10747 0.2631-0.28113 0.4968-0.38198 1.9826-1.085 5.5177-1.085s5.0211 0.70308 5.5176 1.085c0.2374 0.18267 0.2685 0.27581 0.2765 0.29581a1.7344 1.7344 0 0 0 3.4549-0.22468s-0.032-0.61248-0.2608-1.1414c-0.2293-0.52898-0.6638-1.1461-1.3548-1.6777-1.3822-1.0632-3.6537-1.8053-7.6334-1.8053zm-37.6 0.55322a1.7344 1.7344 0 0 0-1.7082 1.759v23.015c-0.2878 0.28077-0.7442 0.68532-1.1561 0.68532h-5.7806c-0.5781 0-1.4474-0.96193-1.4474-0.96193a1.7344 1.7344 0 1 0-2.8858 1.9239s1.4429 2.5064 4.3332 2.5064h5.7806c2.8903 0 4.3332-2.5064 4.3332-2.5064a1.7344 1.7344 0 0 0 0.2913-0.96193v-23.701a1.7344 1.7344 0 0 0-1.7602-1.759zm69.92 0.026a1.7344 1.7344 0 0 0-1.4498 0.86597l-7.1693 12.427-7.1693-12.427a1.7344 1.7344 0 0 0-3.2358 0.8671v24.857a1.7344 1.7344 0 1 0 3.4684 0v-18.381l5.4351 9.4206a1.7344 1.7344 0 0 0 3.0033 0l5.4351-9.4206v18.381a1.7344 1.7344 0 1 0 3.4684 0v-24.857a1.7344 1.7344 0 0 0-1.7861-1.7331zm-54.864 2.8892c3.5351 0 5.0211 0.70308 5.5176 1.085 0.2258 0.17367 0.2518 0.25429 0.2631 0.28114v19.812c-0.011 0.0268-0.037 0.10747-0.2631 0.28113-0.4965 0.38192-1.9825 1.085-5.5176 1.085s-5.021-0.70307-5.5176-1.085c-0.2257-0.17366-0.2518-0.25429-0.263-0.28113v-19.812c0.011-0.0268 0.037-0.10747 0.263-0.28114 0.4966-0.38191 1.9825-1.085 5.5176-1.085z\" color=\"#000000\" color-rendering=\"auto\" display=\"inline\" dominant-baseline=\"auto\" fill=\"url(#linearGradient1085)\" image-rendering=\"auto\" shape-rendering=\"auto\" solid-color=\"#000000\" stroke=\"#000\" stroke-opacity=\".13433\" stroke-width=\".5\" style=\"font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;isolation:auto;mix-blend-mode:normal;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal\"/>   </g>  </g>  <g display=\"none\">   <g id=\"g8930\" clip-path=\"url(#clipPath1210)\">    <path d=\"m80 140v800h800v-800h-533.33z\" display=\"inline\" fill=\"url(#linearGradient9261)\"/>    <path d=\"m531.5 222.5 15 92 35 55.5 70 68 12.5 59.5 38 206.5 49 69 58.257-28.161s-2.1864-22.553-4.9461-33.497c-3.0728-12.186-6.5571-24.564-12.837-35.45-6.7681-11.733-19.666-19.213-26.147-31.107-8.2251-15.095-7.3774-33.969-15.183-49.285-6.7183-13.182-20.046-22.257-26.644-35.5-9.1263-18.319-13.796-38.786-17-59-4.6213-29.153 5.0205-60.094-3-88.5-8.4371-29.882-24.655-58.45-46-81-19.069-20.145-50.438-25.333-70-45-11.836-11.9-20.345-27.092-27-42.5-11.185-25.894-20.895-82-20.895-82l-12.105-4.0005zm-191.75 616.43s63.309 0.96432 94.581 5.3432c23.45 3.2836 46.793 8.2605 69.296 15.627 18.808 6.1569 34.679 22.427 54.426 23.716 16.721 1.0915 35.08-3.6281 48.304-13.919 11.784-9.1705 18.18-24.415 22.596-38.679 4.4046-14.228 5.7993-29.902 3.201-44.569-4.0062-22.613-28.243-62.841-28.243-62.841l107.44 79.811-16 127.22-41.559 11.355-93.244 1-218.56-23.598z\" fill=\"#fff3aa\"/>    <path d=\"m550.71 133.99-61.414 0.70711c-10 20-29.293 64.072-29.293 105.3 0 110 43.061 102.8 70 170 26.924 67.167 25.747 148.73 40 220 10 50 26.769 121.42 70 145 12.415 6.772 40 65 40 95 0 31.181-14.254 51.281-32.71 74l235.71-2 3-83c-10-80-136-189-170.28-233.28-48.427-62.554-31.486-96.719-45.719-170.72-16.322-84.86-90.308-90.354-110-155-33.636-110.42-9.2929-126.01-9.2929-166.01zm-187.79 696.02c-47.495-5.0249-87.293 15.056-126.93 33.75-22.567 10.642-36.972-11.182-77.421 79.236l408.48 1c-25.217-26.943-59.673-69.761-113.61-77.117-44.093-6.0127-19.929-29.401-90.515-36.868z\" fill=\"#316ed9\"/>    <path d=\"m410.16 136.5c-10 20-34.115 55.17-59.539 71.06-24.626 15.391-90.258 24.027-128.91 19.938-45.235-4.7851-54.207-16.326-147.71-2.5097l3-88.988z\" fill=\"#009d00\"/>   </g>  </g>  <g display=\"none\">   <g id=\"g5199\" clip-path=\"url(#clipPath5203)\">    <rect transform=\"rotate(-5.9986)\" x=\"-125.68\" y=\"332\" width=\"266.73\" height=\"297.25\" fill=\"#8c133f\" style=\"paint-order:normal\"/>    <rect transform=\"rotate(-5.9986)\" x=\"211.04\" y=\"436.22\" width=\"108.51\" height=\"193.02\" ry=\"0\" display=\"inline\" fill=\"#33757c\" style=\"paint-order:normal\"/>    <path d=\"m-23.249 725.65 457.48-48.083\" display=\"inline\" fill=\"none\" stroke=\"#234868\" stroke-opacity=\".87879\" stroke-width=\"50\"/>    <path d=\"m19.638 942.35 165.96-238.66\" display=\"inline\" fill=\"none\" stroke=\"#234868\" stroke-opacity=\".87879\" stroke-width=\"40\"/>    <path d=\"m220.71 694.29c5.1944 19.388-6.3115 39.315-25.699 44.51-19.388 5.1944-39.315-6.3116-44.51-25.699-5.1944-19.388 6.3115-39.315 25.699-44.51 19.388-5.1944 39.315 6.3115 44.51 25.699z\" display=\"inline\" fill=\"#fff\" stroke=\"#0d4474\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-opacity=\".87879\" stroke-width=\"8\" style=\"paint-order:stroke fill markers\"/>    <path d=\"m469.34 668.16c5.1944 19.388-6.3116 39.315-25.699 44.51-19.388 5.1944-39.315-6.3116-44.51-25.699-5.1944-19.388 6.3116-39.315 25.699-44.51 19.388-5.1944 39.315 6.3116 44.51 25.699z\" display=\"inline\" fill=\"#fff\" stroke=\"#0d4474\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-opacity=\".87879\" stroke-width=\"8\" style=\"paint-order:stroke fill markers\"/>   </g>  </g>  <g display=\"none\">   <g id=\"g8961\" transform=\"matrix(1.0501 0 0 1.0501 -44.07 -27.074)\">    <use width=\"100%\" height=\"100%\" display=\"inline\" xlink:href=\"#g8930\"/>    <use width=\"100%\" height=\"100%\" display=\"inline\" xlink:href=\"#g5199\"/>   </g>  </g>  <g>   <path transform=\"matrix(1.1752 0 0 1.1752 -3.5969 -179.75)\" d=\"m42.5 875 157 82.5 339.5-49.5 167.42 58.282-159.72-193.81-349.3 31.287z\" filter=\"url(#filter3987)\"/>  </g>  <g>   <use transform=\"matrix(.93735 .46871 0 .98421 13.567 -378.78)\" width=\"100%\" height=\"100%\" clip-path=\"url(#clipPath9132)\" xlink:href=\"#g8961\"/>   <use transform=\"matrix(.93735 .46968 0 .98421 -5.5112 -103.04)\" width=\"100%\" height=\"100%\" clip-path=\"url(#clipPath9126)\" xlink:href=\"#g8961\"/>   <use transform=\"matrix(.98421 -.18753 0 .98421 -18.576 61.421)\" width=\"100%\" height=\"100%\" clip-path=\"url(#clipPath9081)\" xlink:href=\"#g8961\"/>  </g>  <g>   <path transform=\"matrix(.98421 0 0 .98421 .50408 .023626)\" d=\"m31.074 33.33-0.32002 842.49 201.21 100.42v-843.52zm620.77 20.744v843.93l202.14 98.428-1.3149-843.29z\" clip-path=\"url(#clipPath9114)\" fill=\"#fff\" fill-opacity=\".40909\"/>  </g>  <g>   <path transform=\"matrix(1.0219 .16971 -.15751 1.02 2.6685 -114.58)\" d=\"m572.1 580.75-95.569 102.6 204.98-117.81 25.757-36.294 161.97-75.173-34.804-178.53-170.78 127.79z\" fill=\"url(#linearGradient3892)\" filter=\"url(#filter4005)\"/>   <path d=\"m382.15 663.32 195.91-58.147-3.4364-48.982z\" fill=\"url(#linearGradient4017)\"/>  </g>  <g>   <use transform=\"matrix(.69887 -.76199 .76199 .69887 -433.6 1430.4)\" width=\"100%\" height=\"100%\" xlink:href=\"#g3773\"/>  </g> </svg>";
  Svg.josm_logo_img = Img_1.Img.AsImageElement(Svg.josm_logo);
  Svg.layers = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"27\"    height=\"27\"    viewBox=\"0 0 27 27\"    fill=\"none\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"layers.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata14\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs12\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1680\"      inkscape:window-height=\"1013\"      id=\"namedview10\"      showgrid=\"false\"      inkscape:zoom=\"12.361274\"      inkscape:cx=\"13.100126\"      inkscape:cy=\"2.3570853\"      inkscape:window-x=\"1560\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg8\" />   <path      d=\"M26.5353 8.13481C26.4422 8.35428 26.2683 8.47598 26.0632 8.58537C21.9977 10.7452 17.935 12.9085 13.8758 15.0799C13.6475 15.2016 13.4831 15.1962 13.2568 15.0751C9.19822 12.903 5.13484 10.7404 1.07215 8.5758C0.490599 8.26608 0.448478 7.52562 0.991303 7.13796C1.0803 7.07438 1.17813 7.0231 1.2746 6.97045C5.15862 4.86462 9.04536 2.7629 12.9246 0.648187C13.3805 0.399316 13.7779 0.406837 14.2311 0.65434C18.0954 2.76153 21.9658 4.85779 25.8383 6.94926C26.1569 7.12155 26.411 7.32872 26.5353 7.67604C26.5353 7.82919 26.5353 7.98166 26.5353 8.13481Z\"      fill=\"#003B8B\"      id=\"path2\"      style=\"fill:#030000;fill-opacity:1\" />   <path      d=\"M13.318 26.535C12.1576 25.9046 10.9972 25.2736 9.83614 24.6439C6.96644 23.0877 4.09674 21.533 1.22704 19.9762C0.694401 19.6876 0.466129 19.2343 0.669943 18.7722C0.759621 18.5691 0.931505 18.3653 1.11969 18.2512C1.66659 17.9182 2.23727 17.6228 2.80863 17.3329C2.89423 17.2892 3.04981 17.3206 3.14493 17.3712C6.40799 19.1031 9.66969 20.837 12.9239 22.5845C13.3703 22.8238 13.7609 22.83 14.208 22.59C17.4554 20.8472 20.7117 19.1202 23.9605 17.3801C24.1493 17.2789 24.2838 17.283 24.4632 17.3876C24.8926 17.6386 25.3301 17.8772 25.7751 18.1001C26.11 18.2683 26.3838 18.4857 26.5346 18.8385C26.5346 18.9916 26.5346 19.1441 26.5346 19.2972C26.4049 19.6528 26.1399 19.8613 25.8152 20.0363C22.9964 21.5549 20.1831 23.0829 17.3684 24.609C16.1863 25.2496 15.0055 25.893 13.8248 26.535C13.6556 26.535 13.4865 26.535 13.318 26.535Z\"      fill=\"#003B8B\"      id=\"path4\"      style=\"fill:#030000;fill-opacity:1\" />   <path      d=\"M26.3988 13.7412C26.2956 13.9661 26.1026 14.081 25.8927 14.1924C21.8198 16.3577 17.749 18.5258 13.6815 20.7013C13.492 20.8025 13.3602 20.7902 13.1795 20.6938C9.09638 18.5114 5.01059 16.3359 0.924798 14.1582C0.399637 13.8786 0.307921 13.2646 0.735251 12.838C0.829005 12.7443 0.947217 12.6705 1.06407 12.6055C1.56545 12.3279 2.07635 12.0654 2.57297 11.7789C2.74214 11.6812 2.86579 11.6921 3.03291 11.7817C6.27492 13.5155 9.52303 15.2378 12.761 16.9792C13.2352 17.2343 13.6394 17.2322 14.1129 16.9772C17.3509 15.2358 20.5996 13.5142 23.8416 11.7796C24.0095 11.69 24.1338 11.6818 24.3016 11.7789C24.7384 12.0339 25.1821 12.2794 25.6352 12.5037C25.9701 12.6691 26.2426 12.8831 26.3995 13.2304C26.3988 13.4014 26.3988 13.5716 26.3988 13.7412Z\"      fill=\"#003B8B\"      id=\"path6\"      style=\"fill:#030000;fill-opacity:1\" /> </svg> ";
  Svg.layers_img = Img_1.Img.AsImageElement(Svg.layers);
  Svg.layersAdd = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"27\"    height=\"27\"    viewBox=\"0 0 27 27\"    fill=\"none\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"layersAdd.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata14\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs12\">     <filter        style=\"color-interpolation-filters:sRGB\"        filterUnits=\"userSpaceOnUse\"        height=\"17.436001\"        width=\"25.4126\"        y=\"52.703999\"        x=\"58.84\"        id=\"filter0_d\">       <feFlood          id=\"feFlood52\"          result=\"BackgroundImageFix\"          flood-opacity=\"0\" />       <feColorMatrix          id=\"feColorMatrix54\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          type=\"matrix\"          in=\"SourceAlpha\" />       <feOffset          id=\"feOffset56\"          dy=\"4\" />       <feGaussianBlur          id=\"feGaussianBlur58\"          stdDeviation=\"2\" />       <feColorMatrix          id=\"feColorMatrix60\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          type=\"matrix\" />       <feBlend          id=\"feBlend62\"          result=\"effect1_dropShadow\"          in2=\"BackgroundImageFix\"          mode=\"normal\" />       <feBlend          id=\"feBlend64\"          result=\"shape\"          in2=\"effect1_dropShadow\"          in=\"SourceGraphic\"          mode=\"normal\" />     </filter>     <filter        style=\"color-interpolation-filters:sRGB\"        filterUnits=\"userSpaceOnUse\"        height=\"38\"        width=\"38.000099\"        y=\"15\"        x=\"14\"        id=\"filter1_d\">       <feFlood          id=\"feFlood67\"          result=\"BackgroundImageFix\"          flood-opacity=\"0\" />       <feColorMatrix          id=\"feColorMatrix69\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          type=\"matrix\"          in=\"SourceAlpha\" />       <feOffset          id=\"feOffset71\"          dy=\"4\" />       <feGaussianBlur          id=\"feGaussianBlur73\"          stdDeviation=\"2\" />       <feColorMatrix          id=\"feColorMatrix75\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          type=\"matrix\" />       <feBlend          id=\"feBlend77\"          result=\"effect1_dropShadow\"          in2=\"BackgroundImageFix\"          mode=\"normal\" />       <feBlend          id=\"feBlend79\"          result=\"shape\"          in2=\"effect1_dropShadow\"          in=\"SourceGraphic\"          mode=\"normal\" />     </filter>     <filter        style=\"color-interpolation-filters:sRGB\"        filterUnits=\"userSpaceOnUse\"        height=\"53\"        width=\"53\"        y=\"7\"        x=\"39.5\"        id=\"filter2_d\">       <feFlood          id=\"feFlood82\"          result=\"BackgroundImageFix\"          flood-opacity=\"0\" />       <feColorMatrix          id=\"feColorMatrix84\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          type=\"matrix\"          in=\"SourceAlpha\" />       <feOffset          id=\"feOffset86\"          dy=\"4\" />       <feGaussianBlur          id=\"feGaussianBlur88\"          stdDeviation=\"2\" />       <feColorMatrix          id=\"feColorMatrix90\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          type=\"matrix\" />       <feBlend          id=\"feBlend92\"          result=\"effect1_dropShadow\"          in2=\"BackgroundImageFix\"          mode=\"normal\" />       <feBlend          id=\"feBlend94\"          result=\"shape\"          in2=\"effect1_dropShadow\"          in=\"SourceGraphic\"          mode=\"normal\" />     </filter>     <filter        style=\"color-interpolation-filters:sRGB\"        filterUnits=\"userSpaceOnUse\"        height=\"38.142899\"        width=\"54.766701\"        y=\"54\"        x=\"11\"        id=\"filter3_d\">       <feFlood          id=\"feFlood97\"          result=\"BackgroundImageFix\"          flood-opacity=\"0\" />       <feColorMatrix          id=\"feColorMatrix99\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          type=\"matrix\"          in=\"SourceAlpha\" />       <feOffset          id=\"feOffset101\"          dy=\"4\" />       <feGaussianBlur          id=\"feGaussianBlur103\"          stdDeviation=\"2\" />       <feColorMatrix          id=\"feColorMatrix105\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          type=\"matrix\" />       <feBlend          id=\"feBlend107\"          result=\"effect1_dropShadow\"          in2=\"BackgroundImageFix\"          mode=\"normal\" />       <feBlend          id=\"feBlend109\"          result=\"shape\"          in2=\"effect1_dropShadow\"          in=\"SourceGraphic\"          mode=\"normal\" />     </filter>     <filter        style=\"color-interpolation-filters:sRGB\"        filterUnits=\"userSpaceOnUse\"        height=\"29\"        width=\"28\"        y=\"64\"        x=\"41\"        id=\"filter4_d\">       <feFlood          id=\"feFlood112\"          result=\"BackgroundImageFix\"          flood-opacity=\"0\" />       <feColorMatrix          id=\"feColorMatrix114\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          type=\"matrix\"          in=\"SourceAlpha\" />       <feOffset          id=\"feOffset116\"          dy=\"4\" />       <feGaussianBlur          id=\"feGaussianBlur118\"          stdDeviation=\"2\" />       <feColorMatrix          id=\"feColorMatrix120\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          type=\"matrix\" />       <feBlend          id=\"feBlend122\"          result=\"effect1_dropShadow\"          in2=\"BackgroundImageFix\"          mode=\"normal\" />       <feBlend          id=\"feBlend124\"          result=\"shape\"          in2=\"effect1_dropShadow\"          in=\"SourceGraphic\"          mode=\"normal\" />     </filter>     <clipPath        id=\"clip0\">       <rect          style=\"fill:#ffffff\"          y=\"0\"          x=\"0\"          id=\"rect127\"          transform=\"rotate(-45,57.35965,-37.759145)\"          height=\"31.819799\"          width=\"31.819799\" />     </clipPath>   </defs>   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1680\"      inkscape:window-height=\"1013\"      id=\"namedview10\"      showgrid=\"false\"      inkscape:zoom=\"12.361274\"      inkscape:cx=\"10.353576\"      inkscape:cy=\"3.3905227\"      inkscape:window-x=\"1560\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg8\" />   <path      d=\"M26.5353 8.13481C26.4422 8.35428 26.2683 8.47598 26.0632 8.58537C21.9977 10.7452 17.935 12.9085 13.8758 15.0799C13.6475 15.2016 13.4831 15.1962 13.2568 15.0751C9.19822 12.903 5.13484 10.7404 1.07215 8.5758C0.490599 8.26608 0.448478 7.52562 0.991303 7.13796C1.0803 7.07438 1.17813 7.0231 1.2746 6.97045C5.15862 4.86462 9.04536 2.7629 12.9246 0.648187C13.3805 0.399316 13.7779 0.406837 14.2311 0.65434C18.0954 2.76153 21.9658 4.85779 25.8383 6.94926C26.1569 7.12155 26.411 7.32872 26.5353 7.67604C26.5353 7.82919 26.5353 7.98166 26.5353 8.13481Z\"      fill=\"#003B8B\"      id=\"path2\"      style=\"fill:#030000;fill-opacity:1\" />   <path      d=\"M13.318 26.535C12.1576 25.9046 10.9972 25.2736 9.83614 24.6439C6.96644 23.0877 4.09674 21.533 1.22704 19.9762C0.694401 19.6876 0.466129 19.2343 0.669943 18.7722C0.759621 18.5691 0.931505 18.3653 1.11969 18.2512C1.66659 17.9182 2.23727 17.6228 2.80863 17.3329C2.89423 17.2892 3.04981 17.3206 3.14493 17.3712C6.40799 19.1031 9.66969 20.837 12.9239 22.5845C13.3703 22.8238 13.7609 22.83 14.208 22.59C17.4554 20.8472 20.7117 19.1202 23.9605 17.3801C24.1493 17.2789 24.2838 17.283 24.4632 17.3876C24.8926 17.6386 25.3301 17.8772 25.7751 18.1001C26.11 18.2683 26.3838 18.4857 26.5346 18.8385C26.5346 18.9916 26.5346 19.1441 26.5346 19.2972C26.4049 19.6528 26.1399 19.8613 25.8152 20.0363C22.9964 21.5549 20.1831 23.0829 17.3684 24.609C16.1863 25.2496 15.0055 25.893 13.8248 26.535C13.6556 26.535 13.4865 26.535 13.318 26.535Z\"      fill=\"#003B8B\"      id=\"path4\"      style=\"fill:#030000;fill-opacity:1\" />   <path      d=\"M26.3988 13.7412C26.2956 13.9661 26.1026 14.081 25.8927 14.1924C21.8198 16.3577 17.749 18.5258 13.6815 20.7013C13.492 20.8025 13.3602 20.7902 13.1795 20.6938C9.09638 18.5114 5.01059 16.3359 0.924798 14.1582C0.399637 13.8786 0.307921 13.2646 0.735251 12.838C0.829005 12.7443 0.947217 12.6705 1.06407 12.6055C1.56545 12.3279 2.07635 12.0654 2.57297 11.7789C2.74214 11.6812 2.86579 11.6921 3.03291 11.7817C6.27492 13.5155 9.52303 15.2378 12.761 16.9792C13.2352 17.2343 13.6394 17.2322 14.1129 16.9772C17.3509 15.2358 20.5996 13.5142 23.8416 11.7796C24.0095 11.69 24.1338 11.6818 24.3016 11.7789C24.7384 12.0339 25.1821 12.2794 25.6352 12.5037C25.9701 12.6691 26.2426 12.8831 26.3995 13.2304C26.3988 13.4014 26.3988 13.5716 26.3988 13.7412Z\"      fill=\"#003B8B\"      id=\"path6\"      style=\"fill:#030000;fill-opacity:1\" />   <g      style=\"fill:none\"      id=\"g937\"      transform=\"matrix(0.10434568,0,0,0.10434568,16.419348,16.024978)\">     <circle        style=\"fill:#70c549\"        id=\"circle4\"        r=\"49\"        cy=\"49.02142\"        cx=\"48.999996\" />     <g        inkscape:label=\"Layer 1\"        id=\"layer1\"        transform=\"matrix(1.5647038,-1.5647038,1.5647038,1.5647038,-416.27812,-373.23804)\">       <path          style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"          d=\"M 22.100902,291.35894 5.785709,275.04375 v 0\"          id=\"path815\"          inkscape:connector-curvature=\"0\" />       <path          style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"          d=\"M 22.125504,274.96508 5.8103071,291.28027 v 0\"          id=\"path815-3\"          inkscape:connector-curvature=\"0\" />     </g>   </g> </svg> ";
  Svg.layersAdd_img = Img_1.Img.AsImageElement(Svg.layersAdd);
  Svg.logo = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"150\"    height=\"150\"    viewBox=\"0 0 150 150\"    version=\"1.1\"    id=\"svg132\"    sodipodi:docname=\"logo.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\"    style=\"fill:none\">   <metadata      id=\"metadata136\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview134\"      showgrid=\"false\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:zoom=\"3.9008265\"      inkscape:cx=\"102.42572\"      inkscape:cy=\"85.632784\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg132\">     <sodipodi:guide        position=\"74.86493,117.10108\"        orientation=\"1,0\"        id=\"guide959\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <defs      id=\"defs130\">     <filter        id=\"filter0_d\"        x=\"58.84\"        y=\"52.703999\"        width=\"25.4126\"        height=\"17.436001\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood52\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix54\" />       <feOffset          dy=\"4\"          id=\"feOffset56\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur58\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix60\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend62\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend64\" />     </filter>     <filter        id=\"filter1_d\"        x=\"14\"        y=\"15\"        width=\"38.000099\"        height=\"38\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood67\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix69\" />       <feOffset          dy=\"4\"          id=\"feOffset71\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur73\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix75\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend77\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend79\" />     </filter>     <filter        id=\"filter2_d\"        x=\"39.5\"        y=\"7\"        width=\"53\"        height=\"53\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood82\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix84\" />       <feOffset          dy=\"4\"          id=\"feOffset86\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur88\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix90\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend92\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend94\" />     </filter>     <filter        id=\"filter3_d\"        x=\"11\"        y=\"54\"        width=\"54.766701\"        height=\"38.142899\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood97\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix99\" />       <feOffset          dy=\"4\"          id=\"feOffset101\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur103\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix105\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend107\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend109\" />     </filter>     <filter        id=\"filter4_d\"        x=\"41\"        y=\"64\"        width=\"28\"        height=\"29\"        filterUnits=\"userSpaceOnUse\"        style=\"color-interpolation-filters:sRGB\">       <feFlood          flood-opacity=\"0\"          result=\"BackgroundImageFix\"          id=\"feFlood112\" />       <feColorMatrix          in=\"SourceAlpha\"          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"          id=\"feColorMatrix114\" />       <feOffset          dy=\"4\"          id=\"feOffset116\" />       <feGaussianBlur          stdDeviation=\"2\"          id=\"feGaussianBlur118\" />       <feColorMatrix          type=\"matrix\"          values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"          id=\"feColorMatrix120\" />       <feBlend          mode=\"normal\"          in2=\"BackgroundImageFix\"          result=\"effect1_dropShadow\"          id=\"feBlend122\" />       <feBlend          mode=\"normal\"          in=\"SourceGraphic\"          in2=\"effect1_dropShadow\"          result=\"shape\"          id=\"feBlend124\" />     </filter>     <clipPath        id=\"clip0\">       <rect          width=\"31.819799\"          height=\"31.819799\"          transform=\"rotate(-45,57.35965,-37.759145)\"          id=\"rect127\"          x=\"0\"          y=\"0\"          style=\"fill:#ffffff\" />     </clipPath>   </defs>   <g      id=\"g867\"      transform=\"matrix(1.2580494,0,0,1.2580494,13.748078,-34.889483)\">     <path        style=\"fill:#70c549\"        inkscape:connector-curvature=\"0\"        id=\"path2\"        d=\"m 53.0072,140.614 c -1.8156,3.781 -7.1988,3.781 -9.0144,0 L 13.4024,76.9145 C 11.8084,73.5952 14.2275,69.75 17.9097,69.75 h 61.1806 c 3.6822,0 6.1013,3.8452 4.5073,7.1645 z\" />     <circle        style=\"fill:#70c549\"        id=\"circle4\"        r=\"49\"        cy=\"78\"        cx=\"49\" />     <g        inkscape:label=\"Layer 1\"        id=\"layer1\"        transform=\"matrix(1.5647038,-1.5647038,1.5647038,1.5647038,-416.27812,-344.25946)\">       <path          style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"          d=\"M 22.100902,291.35894 5.785709,275.04375 v 0\"          id=\"path815\"          inkscape:connector-curvature=\"0\" />       <path          style=\"fill: none !important;stroke:#ffffff;stroke-width:7.51411438;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"          d=\"M 22.125504,274.96508 5.8103071,291.28027 v 0\"          id=\"path815-3\"          inkscape:connector-curvature=\"0\" />     </g>   </g> </svg> ";
  Svg.logo_img = Img_1.Img.AsImageElement(Svg.logo);
  Svg.logout = " <!-- Created with Inkscape (http://www.inkscape.org/) -->  <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"100\"    height=\"100\"    viewBox=\"0 0 26.458333 26.458334\"    version=\"1.1\"    id=\"svg8\"    sodipodi:docname=\"logout.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <defs      id=\"defs2\" />   <sodipodi:namedview      id=\"base\"      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1.0\"      inkscape:pageopacity=\"0.0\"      inkscape:pageshadow=\"2\"      inkscape:zoom=\"2.8284271\"      inkscape:cx=\"23.385148\"      inkscape:cy=\"69.345626\"      inkscape:document-units=\"px\"      inkscape:current-layer=\"layer1\"      showgrid=\"false\"      units=\"px\"      showguides=\"true\"      inkscape:guide-bbox=\"true\"      inkscape:window-width=\"1680\"      inkscape:window-height=\"1013\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:snap-nodes=\"false\">     <sodipodi:guide        position=\"13.229167,23.859748\"        orientation=\"1,0\"        id=\"guide815\"        inkscape:locked=\"false\" />     <sodipodi:guide        position=\"14.944824,13.229167\"        orientation=\"0,1\"        id=\"guide817\"        inkscape:locked=\"false\" />   </sodipodi:namedview>   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <g      inkscape:label=\"Layer 1\"      inkscape:groupmode=\"layer\"      id=\"layer1\"      transform=\"translate(0,-270.54165)\">     <path        style=\"fill: none !important;stroke:#000000;stroke-width:2.80336833;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"        d=\"m 18.611217,277.1845 c 0,0 6.517226,4.80116 6.540324,6.59809 0.02311,1.79692 -6.540324,6.61409 -6.540324,6.61409\"        id=\"path821\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#000000;stroke-width:2.38125001;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"        d=\"M 24.831034,283.7682 H 9.9804997 v 0\"        id=\"path815\"        inkscape:connector-curvature=\"0\" />     <path        style=\"fill: none !important;stroke:#000000;stroke-width:2.21004868;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"        d=\"m 11.765496,277.99911 v -2.01547 c 0,-2.34108 -1.8943631,-2.37258 -1.8943631,-2.37258 0,0 -3.7205638,-0.0526 -6.0661374,-0.0526 -2.3455737,0 -2.087099,2.36246 -2.087099,2.36246 l -0.015829,7.9293\"        id=\"path819\"        inkscape:connector-curvature=\"0\"        sodipodi:nodetypes=\"cscscc\" />     <path        style=\"fill: none !important;stroke:#000000;stroke-width:2.21004868;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"        d=\"m 11.765496,289.70121 v 2.01546 c 0,2.34108 -1.8943631,2.37258 -1.8943631,2.37258 0,0 -3.7205636,0.0527 -6.0661373,0.0527 -2.3455738,0 -2.1574723,-2.33048 -2.1574723,-2.33048 l 0.054544,-7.96128\"        id=\"path819-3\"        inkscape:connector-curvature=\"0\"        sodipodi:nodetypes=\"cscscc\" />   </g> </svg> ";
  Svg.logout_img = Img_1.Img.AsImageElement(Svg.logout);
  Svg.mapillary = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"none\" viewBox=\"0 0 32 32\"><path fill=\"#fff\" fill-rule=\"evenodd\" d=\"M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0s16 7.163 16 16zm-24.44-.974c-.371-.201-.303-.725.166-.859.398-.113 3.627-1.196 4.605-1.524a.59.59 0 00.373-.369l1.57-4.603c.146-.43.678-.432.894-.015.024.046.325.593.731 1.331v.001c.896 1.629 2.302 4.185 2.372 4.34a.473.473 0 01-.194.617c-.133.083-.314.19-.469.28l-.269.16c-.237.148-.464.045-.573-.183-.065-.137-.39-.719-.713-1.299-.217-.389-.433-.776-.57-1.027-.17-.313-.682-.433-.854.072l-.566 1.66a.613.613 0 01-.376.373l-1.703.564c-.336.111-.5.626-.046.843.038.018.383.202.798.423h.001c.631.337 1.425.76 1.552.82.21.1.328.39.204.595-.168.28-.384.635-.462.75a.48.48 0 01-.626.149c-.223-.119-5.711-3.027-5.844-3.099zm7.378 3.9c.288.147 7.276 3.844 7.496 3.963.441.238.907-.222.668-.652-.041-.073-.507-.929-1.107-2.034l-.002-.004c-1.166-2.144-2.84-5.224-2.925-5.365-.128-.214-.442-.322-.678-.178-.232.14-.498.298-.648.374-.3.153-.338.383-.203.639.297.562 1.232 2.267 1.34 2.446.223.374-.276.801-.615.615-.054-.03-.408-.217-.834-.442-.697-.368-1.587-.839-1.684-.896-.157-.09-.435-.09-.626.218-.138.224-.308.502-.386.642-.155.274-.084.527.204.674z\" clip-rule=\"evenodd\" style=\"transition: all 0.2s ease 0s;\"></path></svg>";
  Svg.mapillary_img = Img_1.Img.AsImageElement(Svg.mapillary);
  Svg.no_checkmark = "<svg width=\"26\" height=\"18\" viewBox=\"0 0 26 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> </svg>";
  Svg.no_checkmark_img = Img_1.Img.AsImageElement(Svg.no_checkmark);
  Svg.or = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    width=\"275.9444\"    height=\"243.66881\"    version=\"1.1\"    id=\"svg6\"    sodipodi:docname=\"or.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <metadata      id=\"metadata12\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs10\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1001\"      id=\"namedview8\"      showgrid=\"false\"      inkscape:zoom=\"1.5567312\"      inkscape:cx=\"116.77734\"      inkscape:cy=\"95.251996\"      inkscape:window-x=\"1560\"      inkscape:window-y=\"1060\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg6\" />   <path      style=\"fill: none !important;stroke:#000000;stroke-width:27.45802498;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"      d=\"M 136.18279,27.932469 V 214.66155\"      id=\"path812\"      inkscape:connector-curvature=\"0\" /> </svg> ";
  Svg.or_img = Img_1.Img.AsImageElement(Svg.or);
  Svg.osm_logo_us = "<svg class='osm-logo' xmlns=\"http://www.w3.org/2000/svg\" height=\"100px\" width=\"100px\" version=\"1.1\" viewBox=\"0 0 66 64\">     <g transform=\"translate(-0.849, -61)\" fill=\"#7ebc6f\">         <path d=\"M0.849,61 L6.414,75.609 L0.849,90.217 L6.414,104.826 L0.849,119.435 L4.266,120.739 L22.831,102.183 L26.162,102.696 L30.205,98.652 C27.819,95.888 26.033,92.59 25.057,88.948 L26.953,87.391 C26.627,85.879 26.449,84.313 26.449,82.704 C26.449,74.67 30.734,67.611 37.136,63.696 L30.066,61 L15.457,66.565 L0.849,61 z\"/>         <path d=\"M48.71,64.617 C48.406,64.617 48.105,64.629 47.805,64.643 C47.52,64.657 47.234,64.677 46.953,64.704 C46.726,64.726 46.499,64.753 46.275,64.783 C46.039,64.814 45.811,64.847 45.579,64.887 C45.506,64.9 45.434,64.917 45.362,64.93 C45.216,64.958 45.072,64.987 44.927,65.017 C44.812,65.042 44.694,65.06 44.579,65.087 C44.442,65.119 44.307,65.156 44.17,65.191 C43.943,65.25 43.716,65.315 43.492,65.383 C43.323,65.433 43.155,65.484 42.988,65.539 C42.819,65.595 42.65,65.652 42.483,65.713 C42.475,65.716 42.466,65.719 42.457,65.722 C35.819,68.158 31.022,74.369 30.649,81.774 C30.633,82.083 30.622,82.391 30.622,82.704 C30.622,83.014 30.631,83.321 30.649,83.626 C30.649,83.629 30.648,83.632 30.649,83.635 C30.662,83.862 30.681,84.088 30.701,84.313 C31.466,93.037 38.377,99.948 47.101,100.713 C47.326,100.733 47.552,100.754 47.779,100.765 C47.782,100.765 47.785,100.765 47.788,100.765 C48.093,100.783 48.399,100.791 48.709,100.791 C53.639,100.791 58.096,98.833 61.353,95.652 C61.532,95.477 61.712,95.304 61.883,95.122 C61.913,95.09 61.941,95.058 61.97,95.026 C61.98,95.015 61.987,95.002 61.996,94.991 C62.132,94.845 62.266,94.698 62.396,94.548 C62.449,94.487 62.501,94.426 62.553,94.365 C62.594,94.316 62.634,94.267 62.675,94.217 C62.821,94.04 62.961,93.861 63.101,93.678 C63.279,93.444 63.456,93.199 63.622,92.956 C63.956,92.471 64.267,91.97 64.553,91.452 C64.661,91.257 64.757,91.06 64.857,90.861 C64.89,90.796 64.93,90.735 64.962,90.67 C64.98,90.633 64.996,90.594 65.014,90.556 C65.125,90.324 65.234,90.09 65.336,89.852 C65.349,89.82 65.365,89.789 65.379,89.756 C65.48,89.517 65.575,89.271 65.666,89.026 C65.678,88.994 65.689,88.962 65.701,88.93 C65.792,88.679 65.881,88.43 65.962,88.174 C65.97,88.148 65.98,88.122 65.988,88.096 C66.069,87.832 66.144,87.564 66.214,87.296 C66.219,87.275 66.226,87.255 66.231,87.235 C66.301,86.962 66.365,86.686 66.423,86.409 C66.426,86.391 66.428,86.374 66.431,86.356 C66.445,86.291 66.453,86.223 66.466,86.156 C66.511,85.925 66.552,85.695 66.588,85.461 C66.632,85.169 66.671,84.878 66.701,84.583 C66.701,84.574 66.701,84.565 66.701,84.556 C66.731,84.258 66.755,83.955 66.77,83.652 C66.77,83.646 66.77,83.641 66.77,83.635 C66.786,83.326 66.797,83.017 66.797,82.704 C66.797,72.69 58.723,64.617 48.71,64.617 z\"/>         <path d=\"M62.936,99.809 C59.074,103.028 54.115,104.965 48.71,104.965 C47.101,104.965 45.535,104.787 44.023,104.461 L42.466,106.357 C39.007,105.43 35.855,103.781 33.179,101.574 L28.996,105.765 L29.51,108.861 L13.953,124.426 L15.457,125 L30.066,119.435 L44.675,125 L59.283,119.435 L64.849,104.826 L62.936,99.809 z\"/>     </g> </svg>";
  Svg.osm_logo_us_img = Img_1.Img.AsImageElement(Svg.osm_logo_us);
  Svg.osm_logo = " <!-- Created with Inkscape (http://www.inkscape.org/) --> <svg xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\" width=\"256\" height=\"256\" id=\"svg3038\" version=\"1.1\" inkscape:version=\"0.48.2 r9819\" sodipodi:docname=\"Public-images-osm_logo.svg\" inkscape:export-filename=\"/home/fred/bla.png\" inkscape:export-xdpi=\"180\" inkscape:export-ydpi=\"180\" sodipodi:version=\"0.32\" inkscape:output_extension=\"org.inkscape.output.svg.inkscape\">   <title id=\"title3594\">OpenStreetMap logo 2011</title>   <defs id=\"defs3040\">     <linearGradient inkscape:collect=\"always\" id=\"linearGradient8729\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8731\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8733\"/>     </linearGradient>     <linearGradient id=\"linearGradient6846\">       <stop id=\"stop6848\" offset=\"0\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0.93050194;\" offset=\"0.5\" id=\"stop6852\"/>       <stop id=\"stop6850\" offset=\"1\" style=\"stop-color:#ffffff;stop-opacity:0;\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient6589\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop6591\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop6593\"/>     </linearGradient>     <linearGradient id=\"linearGradient5862\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864\"/>       <stop id=\"stop5876\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866\"/>     </linearGradient>     <linearGradient id=\"linearGradient5762\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764\"/>       <stop id=\"stop5770\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766\"/>     </linearGradient>     <linearGradient id=\"linearGradient5745\">       <stop style=\"stop-color:#d0e9f2;stop-opacity:0;\" offset=\"0\" id=\"stop5747\"/>       <stop id=\"stop5753\" offset=\"0.83932751\" style=\"stop-color:#d0e9f2;stop-opacity:0;\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:0.28185329;\" offset=\"0.94308507\" id=\"stop5755\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:1;\" offset=\"1\" id=\"stop5749\"/>     </linearGradient>     <linearGradient id=\"linearGradient4680\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684\"/>     </linearGradient>     <inkscape:perspective sodipodi:type=\"inkscape:persp3d\" inkscape:vp_x=\"0 : 32 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_z=\"64 : 32 : 1\" inkscape:persp3d-origin=\"32 : 21.333333 : 1\" id=\"perspective3046\"/>     <inkscape:perspective id=\"perspective3056\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective3844\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective3871\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective3897\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective3926\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective3953\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective3979\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4005\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4028\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4054\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4083\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4132\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4158\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4184\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4219\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4276\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4302\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4328\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4354\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4386\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4413\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4439\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4465\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4497\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4523\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4549\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4575\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4601\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4627\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4653\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective4837\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4686-3\" x1=\"94.25\" y1=\"-94.671967\" x2=\"9\" y2=\"-179.96893\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-7\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-2\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-7\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4742-3\" x1=\"50.75\" y1=\"-114.4375\" x2=\"35.75\" y2=\"-30.4375\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4846\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4848\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4850\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4734-3\" x1=\"77.625\" y1=\"-163.125\" x2=\"115.25\" y2=\"-74.625\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4853\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4855\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4857\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4726-9\" x1=\"56.5\" y1=\"-50.4375\" x2=\"125.71875\" y2=\"7.0625\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4860\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4862\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4864\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4710-2\" x1=\"35\" y1=\"-163.29688\" x2=\"180.75\" y2=\"-146.79688\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4867\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4869\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4871\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4718-4\" x1=\"57.000099\" y1=\"-141.10941\" x2=\"179\" y2=\"-41.609402\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4874\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4876\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4878\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4694-4\" x1=\"156\" y1=\"-26.5\" x2=\"208.25\" y2=\"39.75\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4881\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4883\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4885\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7\" id=\"linearGradient4702-4\" x1=\"142.75\" y1=\"-169.29688\" x2=\"235\" y2=\"-77.296875\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4888\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4890\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4892\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4806-9\" x1=\"214.25\" y1=\"-161.35938\" x2=\"166.5\" y2=\"-113.71875\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient4744-9\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop4746-3\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop4748-8\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4790-3\" x1=\"53.25\" y1=\"-126.5\" x2=\"57.65625\" y2=\"-62.46875\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4758-2\" x1=\"39.5\" y1=\"6.6250248\" x2=\"75.71875\" y2=\"-17.124975\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4750-9\" x1=\"102\" y1=\"-162.34375\" x2=\"85.3125\" y2=\"-121.4375\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4782-5\" x1=\"117.75\" y1=\"-78.09375\" x2=\"63.5\" y2=\"-14.75\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4798-4\" x1=\"180.68745\" y1=\"-125.125\" x2=\"133.93745\" y2=\"-60.74995\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4766-3\" x1=\"170.75\" y1=\"-23.5\" x2=\"130.21875\" y2=\"33.375\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9\" id=\"linearGradient4774-9\" x1=\"213.5\" y1=\"-76\" x2=\"181.75005\" y2=\"-5.6563001\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient y2=\"-5.6563001\" x2=\"181.75005\" y1=\"-76\" x1=\"213.5\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient4965\" xlink:href=\"#linearGradient4744-9\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective5148\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680\" id=\"linearGradient5168\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(0,-10)\"/>     <inkscape:perspective id=\"perspective5179\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5201\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5201-7\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5201-72\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5201-0\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5260\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5296\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5339\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5383\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5385\"/>     </clipPath>     <inkscape:perspective id=\"perspective5412\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5426\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5428\"/>     </clipPath>     <inkscape:perspective id=\"perspective5452\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5466\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5468\"/>     </clipPath>     <inkscape:perspective id=\"perspective5614\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5638\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5638-1\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5638-3\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5679\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5701\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <inkscape:perspective id=\"perspective5723\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5745\" id=\"radialGradient5751\" cx=\"128\" cy=\"86\" fx=\"128\" fy=\"86\" r=\"47\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(1.0212766,0,0,-1.0212766,-212.7234,173.82979)\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762\" id=\"linearGradient5768\" x1=\"123\" y1=\"150.375\" x2=\"133\" y2=\"150.375\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-1,0,0,1,46,0)\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762\" id=\"linearGradient5778\" x1=\"128\" y1=\"134.35938\" x2=\"130.875\" y2=\"143.35938\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(-210,0)\"/>     <inkscape:perspective id=\"perspective5788\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762-9\" id=\"linearGradient5768-1\" x1=\"123\" y1=\"150.375\" x2=\"133\" y2=\"150.375\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-1,0,0,1,256,0)\"/>     <linearGradient id=\"linearGradient5762-9\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-6\"/>       <stop id=\"stop5770-3\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-6\"/>     </linearGradient>     <linearGradient y2=\"150.375\" x2=\"133\" y1=\"150.375\" x1=\"123\" gradientTransform=\"matrix(-2,0,0,1.7699115,174,-86.65044)\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient5798\" xlink:href=\"#linearGradient5762-9\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective5829\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient y2=\"150.375\" x2=\"133\" y1=\"150.375\" x1=\"123\" gradientTransform=\"matrix(-2,0,0,1.7699115,384,-86.65044)\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient5798-4\" xlink:href=\"#linearGradient5762-9-6\" inkscape:collect=\"always\"/>     <linearGradient id=\"linearGradient5762-9-6\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-6-6\"/>       <stop id=\"stop5770-3-7\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-6-2\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5862\" id=\"linearGradient5868\" x1=\"120\" y1=\"186.5\" x2=\"136\" y2=\"186.5\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(-210,0)\"/>     <inkscape:perspective id=\"perspective5886\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5862-1\" id=\"linearGradient5868-4\" x1=\"120\" y1=\"186.5\" x2=\"136\" y2=\"186.5\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient5862-1\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-0\"/>       <stop id=\"stop5876-0\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-6\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-4\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-4\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-3\"/>     </linearGradient>     <linearGradient y2=\"186.5\" x2=\"136\" y1=\"186.5\" x1=\"120\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient5899\" xlink:href=\"#linearGradient5862-1\" inkscape:collect=\"always\" gradientTransform=\"translate(-210,67)\"/>     <inkscape:perspective id=\"perspective5936\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient y2=\"186.5\" x2=\"136\" y1=\"186.5\" x1=\"120\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient5899-3\" xlink:href=\"#linearGradient5862-1-4\" inkscape:collect=\"always\" gradientTransform=\"translate(0,69)\"/>     <linearGradient id=\"linearGradient5862-1-4\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-0-7\"/>       <stop id=\"stop5876-0-2\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-6-1\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-4-7\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-4-9\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-3-5\"/>     </linearGradient>     <inkscape:perspective id=\"perspective5936-8\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient y2=\"186.5\" x2=\"136\" y1=\"186.5\" x1=\"120\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient5899-9\" xlink:href=\"#linearGradient5862-1-5\" inkscape:collect=\"always\" gradientTransform=\"translate(0,69)\"/>     <linearGradient id=\"linearGradient5862-1-5\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-0-5\"/>       <stop id=\"stop5876-0-21\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-6-5\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-4-9\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-4-91\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-3-6\"/>     </linearGradient>     <inkscape:perspective id=\"perspective6014\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient y2=\"186.5\" x2=\"136\" y1=\"186.5\" x1=\"120\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient5899-0\" xlink:href=\"#linearGradient5862-1-53\" inkscape:collect=\"always\" gradientTransform=\"translate(0,67)\"/>     <linearGradient id=\"linearGradient5862-1-53\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-0-2\"/>       <stop id=\"stop5876-0-1\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-6-9\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-4-76\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-4-8\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-3-2\"/>     </linearGradient>     <inkscape:perspective id=\"perspective6080\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient id=\"linearGradient5745-3\">       <stop style=\"stop-color:#d0e9f2;stop-opacity:0;\" offset=\"0\" id=\"stop5747-3\"/>       <stop id=\"stop5753-6\" offset=\"0.83932751\" style=\"stop-color:#d0e9f2;stop-opacity:0;\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:0.28185329;\" offset=\"0.94308507\" id=\"stop5755-9\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:1;\" offset=\"1\" id=\"stop5749-0\"/>     </linearGradient>     <linearGradient id=\"linearGradient5762-8\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-5\"/>       <stop id=\"stop5770-1\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-2\"/>     </linearGradient>     <linearGradient id=\"linearGradient6096\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop6098\"/>       <stop id=\"stop6100\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop6102\"/>     </linearGradient>     <linearGradient id=\"linearGradient5862-3\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-8\"/>       <stop id=\"stop5876-09\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-2\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-3\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-1\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-8\"/>     </linearGradient>     <linearGradient id=\"linearGradient5762-9-4\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-6-1\"/>       <stop id=\"stop5770-3-6\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-6-3\"/>     </linearGradient>     <linearGradient id=\"linearGradient5862-1-55\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-0-0\"/>       <stop id=\"stop5876-0-12\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-6-6\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-4-4\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-4-85\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-3-62\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5862-1-55\" id=\"linearGradient6241\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(0.9842718,0.9842718,-0.9842718,0.9842718,66.992154,-59.215687)\" x1=\"120\" y1=\"186.5\" x2=\"136\" y2=\"186.5\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762-9-4\" id=\"linearGradient6244\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-1.9685436,-1.9685436,-1.742074,1.742074,596.18632,167.51089)\" x1=\"123\" y1=\"150.375\" x2=\"133\" y2=\"150.375\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5862-3\" id=\"linearGradient6247\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(0.98427179,0.98427179,-0.98427179,0.98427179,132.93836,-125.1619)\" x1=\"120\" y1=\"186.5\" x2=\"136\" y2=\"186.5\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762-8\" id=\"linearGradient6250\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-0.98427179,-0.98427179,-0.98427179,0.98427179,384.91194,126.81168)\" x1=\"123\" y1=\"150.375\" x2=\"133\" y2=\"150.375\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762-8\" id=\"linearGradient6253\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(0.98427179,0.98427179,-0.98427179,0.98427179,132.93836,-125.1619)\" x1=\"128\" y1=\"134.35938\" x2=\"130.875\" y2=\"143.35938\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5745-3\" id=\"radialGradient6256\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(1.0052137,1.0052137,1.0052137,-1.0052137,-40.83796,43.253296)\" cx=\"128\" cy=\"86\" fx=\"128\" fy=\"86\" r=\"47\"/>     <inkscape:perspective id=\"perspective6269\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5762-9-4-6\" id=\"linearGradient6244-4\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-1.9685436,-1.9685436,-1.742074,1.742074,596.18632,177.51089)\" x1=\"123\" y1=\"150.375\" x2=\"133\" y2=\"150.375\"/>     <linearGradient id=\"linearGradient5762-9-4-6\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-6-1-0\"/>       <stop id=\"stop5770-3-6-7\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-6-3-4\"/>     </linearGradient>     <linearGradient y2=\"150.375\" x2=\"133\" y1=\"167.7272\" x1=\"108.00327\" gradientTransform=\"matrix(-1.9685436,-1.9685436,-1.742074,1.742074,596.18632,167.51089)\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient6279\" xlink:href=\"#linearGradient4680\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective6314\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6846\" id=\"radialGradient6427\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-46.348455,24.528408)\" gradientUnits=\"userSpaceOnUse\"/>     <inkscape:perspective id=\"perspective6437\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-9\" id=\"radialGradient6427-8\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1,0,0,0.69209216,-1.4142136,17.754313)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient4744-9-9\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop4746-3-8\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop4748-8-3\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-9\" id=\"radialGradient6445\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1,0,0,0.69209216,-1.4142136,17.754313)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-9\" id=\"radialGradient6453\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1,0,0,0.69209216,-1.4142136,17.754313)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-9\" id=\"radialGradient6461\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1,0,0,0.69209216,-1.4142136,17.754313)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-9\" id=\"radialGradient6469\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1,0,0,0.69209216,-1.4142136,17.754313)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-45.919787,25.814437)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6482\" xlink:href=\"#linearGradient4744-9-9\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective6551\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5745-3-3\" id=\"radialGradient6256-6\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(1.0052137,1.0052137,1.0052137,-1.0052137,-40.83796,53.253296)\" cx=\"128\" cy=\"86\" fx=\"128\" fy=\"86\" r=\"47\"/>     <linearGradient id=\"linearGradient5745-3-3\">       <stop style=\"stop-color:#d0e9f2;stop-opacity:0;\" offset=\"0\" id=\"stop5747-3-0\"/>       <stop id=\"stop5753-6-1\" offset=\"0.83932751\" style=\"stop-color:#d0e9f2;stop-opacity:0;\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:0.28185329;\" offset=\"0.94308507\" id=\"stop5755-9-4\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:1;\" offset=\"1\" id=\"stop5749-0-8\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6589\" id=\"linearGradient6595\" x1=\"126.64295\" y1=\"29.814894\" x2=\"179.96115\" y2=\"137.19565\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(0,-10)\"/>     <inkscape:perspective id=\"perspective6605\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6589-6\" id=\"linearGradient6595-6\" x1=\"126.64295\" y1=\"29.814894\" x2=\"179.96115\" y2=\"137.19565\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient6589-6\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop6591-6\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop6593-1\"/>     </linearGradient>     <linearGradient gradientTransform=\"matrix(-0.50295302,0.19839946,0.19720153,-0.43253662,276.15635,123.41729)\" y2=\"137.19565\" x2=\"179.96115\" y1=\"29.814894\" x1=\"126.64295\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient6614\" xlink:href=\"#linearGradient6589-6\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective6643\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6589-2\" id=\"linearGradient6595-8\" x1=\"126.64295\" y1=\"29.814894\" x2=\"179.96115\" y2=\"137.19565\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient6589-2\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop6591-9\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop6593-6\"/>     </linearGradient>     <inkscape:perspective id=\"perspective6681\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-4\" id=\"radialGradient6427-9\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient4744-9-4\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop4746-3-3\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop4748-8-7\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-4\" id=\"radialGradient6689\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-4\" id=\"radialGradient6697\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-4\" id=\"radialGradient6705\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-4\" id=\"radialGradient6713\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914634,-47.895492,34.408018)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6726\" xlink:href=\"#linearGradient4744-9-4\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective6681-6\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-49\" id=\"radialGradient6427-0\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient4744-9-49\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop4746-3-1\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop4748-8-2\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-49\" id=\"radialGradient6689-2\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-49\" id=\"radialGradient6697-2\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-49\" id=\"radialGradient6705-4\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-49\" id=\"radialGradient6713-6\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914634,-47.895492,34.408018)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6726-0\" xlink:href=\"#linearGradient4744-9-49\" inkscape:collect=\"always\"/>     <inkscape:perspective id=\"perspective6863\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient id=\"linearGradient6589-6-9\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop6591-6-7\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop6593-1-2\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6846-8\" id=\"radialGradient6427-6\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914634,-47.895493,34.408019)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient6846-8\">       <stop id=\"stop6848-8\" offset=\"0\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0.93050194;\" offset=\"0.5\" id=\"stop6852-9\"/>       <stop id=\"stop6850-8\" offset=\"1\" style=\"stop-color:#ffffff;stop-opacity:0;\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6846-8\" id=\"radialGradient6876\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient6878\">       <stop id=\"stop6880\" offset=\"0\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0.93050194;\" offset=\"0.5\" id=\"stop6882\"/>       <stop id=\"stop6884\" offset=\"1\" style=\"stop-color:#ffffff;stop-opacity:0;\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6846-8\" id=\"radialGradient6886\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient6888\">       <stop id=\"stop6890\" offset=\"0\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0.93050194;\" offset=\"0.5\" id=\"stop6892\"/>       <stop id=\"stop6894\" offset=\"1\" style=\"stop-color:#ffffff;stop-opacity:0;\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6846-8\" id=\"radialGradient6896\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient6898\">       <stop id=\"stop6900\" offset=\"0\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0.93050194;\" offset=\"0.5\" id=\"stop6902\"/>       <stop id=\"stop6904\" offset=\"1\" style=\"stop-color:#ffffff;stop-opacity:0;\"/>     </linearGradient>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient6846-8\" id=\"radialGradient6906\" cx=\"159.61317\" cy=\"72.588303\" fx=\"159.61317\" fy=\"72.588303\" r=\"38.416904\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.895494,34.408017)\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient6908\">       <stop id=\"stop6910\" offset=\"0\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0.93050194;\" offset=\"0.5\" id=\"stop6912\"/>       <stop id=\"stop6914\" offset=\"1\" style=\"stop-color:#ffffff;stop-opacity:0;\"/>     </linearGradient>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914634,-47.466825,35.694048)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6482-8\" xlink:href=\"#linearGradient4744-9-9-1\" inkscape:collect=\"always\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient4744-9-9-1\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop4746-3-8-6\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop4748-8-3-8\"/>     </linearGradient>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.466826,35.694046)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6920\" xlink:href=\"#linearGradient4744-9-9-1\" inkscape:collect=\"always\"/>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.466826,35.694046)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6928\" xlink:href=\"#linearGradient4744-9-9-1\" inkscape:collect=\"always\"/>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.466826,35.694046)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6936\" xlink:href=\"#linearGradient4744-9-9-1\" inkscape:collect=\"always\"/>     <radialGradient r=\"38.416904\" fy=\"72.588303\" fx=\"159.61317\" cy=\"72.588303\" cx=\"159.61317\" gradientTransform=\"matrix(1.2124778,0,0,0.83914635,-47.466826,35.694046)\" gradientUnits=\"userSpaceOnUse\" id=\"radialGradient6944\" xlink:href=\"#linearGradient4744-9-9-1\" inkscape:collect=\"always\"/>     <linearGradient id=\"linearGradient5862-1-55-2\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-0-0-9\"/>       <stop id=\"stop5876-0-12-6\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-6-6-4\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-4-4-5\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-4-85-5\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-3-62-4\"/>     </linearGradient>     <linearGradient id=\"linearGradient4680-0\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-5\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-76\"/>     </linearGradient>     <linearGradient id=\"linearGradient5762-9-4-5\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-6-1-3\"/>       <stop id=\"stop5770-3-6-73\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-6-3-2\"/>     </linearGradient>     <linearGradient id=\"linearGradient5862-3-3\">       <stop style=\"stop-color:#f9e295;stop-opacity:1;\" offset=\"0\" id=\"stop5864-8-0\"/>       <stop id=\"stop5876-09-8\" offset=\"0.125\" style=\"stop-color:#f7dd84;stop-opacity:1;\"/>       <stop id=\"stop5874-2-6\" offset=\"0.20580582\" style=\"stop-color:#ffffff;stop-opacity:1;\"/>       <stop id=\"stop5870-3-6\" offset=\"0.30112621\" style=\"stop-color:#f4ce51;stop-opacity:1;\"/>       <stop style=\"stop-color:#f9e7aa;stop-opacity:1;\" offset=\"0.3412039\" id=\"stop5872-1-9\"/>       <stop style=\"stop-color:#efbb0e;stop-opacity:1;\" offset=\"1\" id=\"stop5866-8-7\"/>     </linearGradient>     <linearGradient id=\"linearGradient5762-8-9\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop5764-5-3\"/>       <stop id=\"stop5770-1-7\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop5766-2-1\"/>     </linearGradient>     <linearGradient id=\"linearGradient6987\">       <stop style=\"stop-color:#2d3335;stop-opacity:1;\" offset=\"0\" id=\"stop6989\"/>       <stop id=\"stop6991\" offset=\"0.5\" style=\"stop-color:#4c464a;stop-opacity:1;\"/>       <stop style=\"stop-color:#384042;stop-opacity:1;\" offset=\"1\" id=\"stop6993\"/>     </linearGradient>     <linearGradient id=\"linearGradient5745-3-5\">       <stop style=\"stop-color:#d0e9f2;stop-opacity:0;\" offset=\"0\" id=\"stop5747-3-7\"/>       <stop id=\"stop5753-6-0\" offset=\"0.83932751\" style=\"stop-color:#d0e9f2;stop-opacity:0;\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:0.28185329;\" offset=\"0.94308507\" id=\"stop5755-9-2\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:1;\" offset=\"1\" id=\"stop5749-0-6\"/>     </linearGradient>     <filter inkscape:collect=\"always\" id=\"filter7286\">       <feGaussianBlur inkscape:collect=\"always\" stdDeviation=\"4.2868936\" id=\"feGaussianBlur7288\"/>     </filter>     <inkscape:perspective id=\"perspective7298\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-6\" id=\"linearGradient5168-6\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-6\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-3\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-2\"/>     </linearGradient>     <inkscape:perspective id=\"perspective7298-3\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-4\" id=\"linearGradient5168-60\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-4\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-36\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-3\"/>     </linearGradient>     <inkscape:perspective id=\"perspective7298-9\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-2\" id=\"linearGradient5168-4\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-2\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-9\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-38\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-2\" id=\"linearGradient7376\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(1,-0.08087767,0,1,0,203.0563)\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\"/>     <inkscape:perspective id=\"perspective7716\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient id=\"linearGradient4680-7-3\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-2-2\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-7-2\"/>     </linearGradient>     <linearGradient id=\"linearGradient7725\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7727\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7729\"/>     </linearGradient>     <linearGradient id=\"linearGradient7732\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7734\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7736\"/>     </linearGradient>     <linearGradient id=\"linearGradient7739\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7741\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7743\"/>     </linearGradient>     <linearGradient id=\"linearGradient7746\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7748\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7750\"/>     </linearGradient>     <linearGradient id=\"linearGradient7753\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7755\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7757\"/>     </linearGradient>     <linearGradient id=\"linearGradient7760\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7762\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7764\"/>     </linearGradient>     <linearGradient id=\"linearGradient7767\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop7769\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop7771\"/>     </linearGradient>     <linearGradient id=\"linearGradient4680-22\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-27\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-36\"/>     </linearGradient>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5426-1\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5428-0\"/>     </clipPath>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5383-0\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5385-7\"/>     </clipPath>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5466-2\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5468-3\"/>     </clipPath>     <inkscape:perspective id=\"perspective8183\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5466-2-3\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5468-3-2\"/>     </clipPath>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5383-0-0\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5385-7-8\"/>     </clipPath>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath5426-1-6\">       <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"m 9,12.25 c 0,0 7.5,13 11.75,27.75 C 25,54.75 27,65.5 27,65.5 c 0,0 -5.5,12.75 -8.25,24.75 -2.75,12 -5.75,23 -5.75,23 0,0 5.75,16 9.25,30 3.5,14 3.75,24.25 3.75,24.25 0,0 -4,10.25 -7.5,24.25 -3.5,14 -5,30.75 -5,30.75 0,0 9.25,-2 28.5,1.25 19.25,3.25 32.25,6 32.25,6 0,0 12.75,-2.75 24,-6.25 11.25,-3.5 16.25,-6.5 16.25,-6.5 0,0 5.5,0.5 22.5,6.25 17,5.75 29.25,8.5 29.25,8.5 0,0 13,-2.75 26,-5.75 13,-3 26.5,-8 26.5,-8 0,0 -0.75,-5 4.25,-24.5 5,-19.5 8.75,-28 8.75,-28 0,0 -0.5,-4.5 -3.75,-19.75 C 224.75,130.5 218,116 218,116 c 0,0 1.75,-10.5 6.75,-23.75 C 229.75,79 235,65.5 235,65.5 c 0,0 -4.75,-15.25 -7.5,-29.75 C 224.75,21.25 219.25,10 219.25,10 c 0,0 -24.25,9 -31.75,10.5 -7.5,1.5 -21,5.25 -21,5.25 0,0 -9.75,-4.25 -22,-8.5 -12.25,-4.25 -29.75,-5.5 -29.75,-5.5 0,0 -3.25,3.5 -22,8 -18.75,4.5 -27.5,5.75 -27.5,5.75 0,0 -18.5,-9 -31.5,-11.5 -13,-2.5 -24,-2 -24.75,-1.75 z\" id=\"path5428-0-9\"/>     </clipPath>     <linearGradient gradientTransform=\"translate(0,192)\" inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-22-2\" id=\"linearGradient5168-2-9\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-22-2\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-27-3\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-36-5\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4806-9-8-4\" x1=\"214.25\" y1=\"-161.35938\" x2=\"166.5\" y2=\"-113.71875\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" id=\"linearGradient4744-9-7-8\">       <stop style=\"stop-color:#ffffff;stop-opacity:1;\" offset=\"0\" id=\"stop4746-3-0-1\"/>       <stop style=\"stop-color:#ffffff;stop-opacity:0;\" offset=\"1\" id=\"stop4748-8-4-0\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4790-3-9-7\" x1=\"53.25\" y1=\"-126.5\" x2=\"57.65625\" y2=\"-62.46875\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4758-2-6-2\" x1=\"39.5\" y1=\"6.6250248\" x2=\"75.71875\" y2=\"-17.124975\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4750-9-9-4\" x1=\"102\" y1=\"-162.34375\" x2=\"85.3125\" y2=\"-121.4375\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4782-5-5-9\" x1=\"117.75\" y1=\"-78.09375\" x2=\"63.5\" y2=\"-14.75\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4798-4-1-9\" x1=\"180.68745\" y1=\"-125.125\" x2=\"133.93745\" y2=\"-60.74995\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4744-9-7-8\" id=\"linearGradient4766-3-6-2\" x1=\"170.75\" y1=\"-23.5\" x2=\"130.21875\" y2=\"33.375\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient y2=\"-5.6563001\" x2=\"181.75005\" y1=\"-76\" x1=\"213.5\" gradientUnits=\"userSpaceOnUse\" id=\"linearGradient4965-0-3\" xlink:href=\"#linearGradient4744-9-7-8\" inkscape:collect=\"always\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4686-3-4-6\" x1=\"94.25\" y1=\"-94.671967\" x2=\"9\" y2=\"-179.96893\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-7-3-6\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-2-2-7\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-7-2-7\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4742-3-4-4\" x1=\"50.75\" y1=\"-114.4375\" x2=\"35.75\" y2=\"-30.4375\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8255\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8257\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8259\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4734-3-7-6\" x1=\"77.625\" y1=\"-163.125\" x2=\"115.25\" y2=\"-74.625\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8262\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8264\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8266\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4726-9-4-9\" x1=\"56.5\" y1=\"-50.4375\" x2=\"125.71875\" y2=\"7.0625\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8269\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8271\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8273\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4710-2-1-6\" x1=\"35\" y1=\"-163.29688\" x2=\"180.75\" y2=\"-146.79688\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8276\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8278\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8280\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4718-4-6-0\" x1=\"57.000099\" y1=\"-141.10941\" x2=\"179\" y2=\"-41.609402\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8283\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8285\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8287\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4694-4-1-9\" x1=\"156\" y1=\"-26.5\" x2=\"208.25\" y2=\"39.75\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8290\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8292\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8294\"/>     </linearGradient>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-7-3-6\" id=\"linearGradient4702-4-6-9\" x1=\"142.75\" y1=\"-169.29688\" x2=\"235\" y2=\"-77.296875\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient8297\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop8299\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop8301\"/>     </linearGradient>     <inkscape:perspective id=\"perspective8581\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5745-3-1\" id=\"radialGradient6256-5\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(1.0052137,1.0052137,1.0052137,-1.0052137,-40.83796,53.253296)\" cx=\"128\" cy=\"86\" fx=\"128\" fy=\"86\" r=\"47\"/>     <linearGradient id=\"linearGradient5745-3-1\">       <stop style=\"stop-color:#d0e9f2;stop-opacity:0;\" offset=\"0\" id=\"stop5747-3-73\"/>       <stop id=\"stop5753-6-08\" offset=\"0.83932751\" style=\"stop-color:#d0e9f2;stop-opacity:0;\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:0.28185329;\" offset=\"0.94308507\" id=\"stop5755-9-5\"/>       <stop style=\"stop-color:#d0e9f2;stop-opacity:1;\" offset=\"1\" id=\"stop5749-0-4\"/>     </linearGradient>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath8617\">       <path style=\"fill:url(#radialGradient8621);fill-opacity:1;stroke:none\" d=\"m 123.62289,141.06193 c 20.83191,20.24317 54.6071,19.28863 75.439,-2.132 20.8319,-21.42064 20.8319,-55.195816 0,-75.438984 -20.83191,-20.243167 -54.60709,-19.288643 -75.439,2.131999 -20.83189,21.42063 -20.8319,55.195815 0,75.438985 z\" id=\"path8619\" sodipodi:nodetypes=\"csssc\"/>     </clipPath>     <radialGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient5745-3-1\" id=\"radialGradient8621\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(0.80254238,0.77986154,0.80254238,-0.82522321,-10.401684,73.423363)\" cx=\"128\" cy=\"86\" fx=\"128\" fy=\"86\" r=\"47\"/>     <inkscape:perspective id=\"perspective8631\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <filter inkscape:collect=\"always\" id=\"filter8661\">       <feGaussianBlur inkscape:collect=\"always\" stdDeviation=\"6.3109704\" id=\"feGaussianBlur8663\"/>     </filter>     <inkscape:perspective id=\"perspective8673\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-62\" id=\"linearGradient5168-8\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient id=\"linearGradient4680-62\">       <stop style=\"stop-color:#000000;stop-opacity:1;\" offset=\"0\" id=\"stop4682-7\"/>       <stop style=\"stop-color:#000000;stop-opacity:0;\" offset=\"1\" id=\"stop4684-0\"/>     </linearGradient>     <inkscape:perspective id=\"perspective8711\" inkscape:persp3d-origin=\"0.5 : 0.33333333 : 1\" inkscape:vp_z=\"1 : 0.5 : 1\" inkscape:vp_y=\"0 : 1000 : 0\" inkscape:vp_x=\"0 : 0.5 : 1\" sodipodi:type=\"inkscape:persp3d\"/>     <filter inkscape:collect=\"always\" id=\"filter8725\">       <feGaussianBlur inkscape:collect=\"always\" stdDeviation=\"4.4575\" id=\"feGaussianBlur8727\"/>     </filter>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient8729\" id=\"linearGradient8735\" x1=\"122\" y1=\"245.448\" x2=\"122\" y2=\"4.302\" gradientUnits=\"userSpaceOnUse\"/>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-2\" id=\"linearGradient8742\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(0,181.99999)\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\"/>     <clipPath clipPathUnits=\"userSpaceOnUse\" id=\"clipPath8750\">       <path id=\"path8752\" d=\"m 9,22.578406 c 0,0 7.5,12.393417 11.75,26.799687 C 25,63.784363 27,74.372608 27,74.372608 c 0,0 -5.5,13.194827 -8.25,25.417241 C 16,112.01226 13,123.2549 13,123.2549 c 0,0 5.75,15.53495 9.25,29.25188 3.5,13.71692 3.75,23.94671 3.75,23.94671 0,0 -4,10.57351 -7.5,24.85658 -3.5,14.28307 -5,31.15439 -5,31.15439 0,0 9.25,-2.74812 28.5,-1.05502 19.25,1.69311 32.25,3.3917 32.25,3.3917 0,0 12.75,-3.78119 24,-8.19107 11.25,-4.40987 16.25,-7.81426 16.25,-7.81426 0,0 5.5,0.0552 22.5,4.43025 17,4.37508 29.25,6.13433 29.25,6.13433 0,0 13,-3.80141 26,-7.85282 13,-4.05141 26.5,-10.14326 26.5,-10.14326 0,0 -0.75,-4.93934 4.25,-24.84373 5,-19.90438 8.75,-28.70768 8.75,-28.70768 0,0 -0.5145,-4.4553 -3.75,-19.4467 -1.75,-8.10847 -2.25,-4.06803 -2.25,-4.06803 0,0 16.264,-26.15535 16.5,-40.334481 C 242.5,78.94347 235,57.550053 235,57.550053 c 0,0 -4.75,-14.865832 -7.5,-29.143418 -2.75,-14.277586 -8.25,-25.0827591 -8.25,-25.0827591 0,0 -24.25,10.9612831 -31.75,13.0678661 -7.5,2.106582 -21,6.948431 -21,6.948431 0,0 -9.75,-3.461443 -22,-6.720691 -12.25,-3.259249 -29.75,-3.09389 -29.75,-3.09389 0,0 -3.25,3.762853 -22,9.779309 -18.75,6.016456 -27.5,7.974136 -27.5,7.974136 0,0 -18.5,-7.503763 -31.5,-8.952353 -13,-1.448591 -24,-0.05894 -24.75,0.251722 z\" style=\"opacity:0.03913042;fill:url(#linearGradient8754);fill-opacity:1;stroke:none\" sodipodi:nodetypes=\"cscscscscscscscscscscscscscscscsc\"/>     </clipPath>     <linearGradient inkscape:collect=\"always\" xlink:href=\"#linearGradient4680-2\" id=\"linearGradient8754\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(1,-0.08087767,0,1,0,203.05629)\" x1=\"210.17188\" y1=\"72.064125\" x2=\"9\" y2=\"-213.25346\"/>   </defs>   <sodipodi:namedview id=\"base\" pagecolor=\"#ffffff\" bordercolor=\"#666666\" borderopacity=\"1.0\" inkscape:pageopacity=\"0.0\" inkscape:pageshadow=\"2\" inkscape:zoom=\"1.8066556\" inkscape:cx=\"-64.277238\" inkscape:cy=\"49.616655\" inkscape:current-layer=\"layer5\" showgrid=\"true\" inkscape:document-units=\"px\" inkscape:grid-bbox=\"true\" inkscape:window-width=\"1024\" inkscape:window-height=\"689\" inkscape:window-x=\"0\" inkscape:window-y=\"27\" inkscape:window-maximized=\"1\"/>   <metadata id=\"metadata3043\">     <rdf:RDF>       <cc:Work rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\"/>         <dc:title>OpenStreetMap logo 2011</dc:title>         <dc:creator>           <cc:Agent>             <dc:title>Ken Vermette</dc:title>           </cc:Agent>         </dc:creator>         <cc:license rdf:resource=\"http://creativecommons.org/licenses/by-sa/3.0/\"/>         <dc:date>April 2011</dc:date>         <dc:publisher>           <cc:Agent>             <dc:title>OpenStreetMap.org</dc:title>           </cc:Agent>         </dc:publisher>         <dc:description>Replacement logo for OpenStreetMap Foundation</dc:description>         <dc:subject>           <rdf:Bag>             <rdf:li>OSM openstreetmap logo</rdf:li>           </rdf:Bag>         </dc:subject>         <dc:source>http://wiki.openstreetmap.org/wiki/File:Public-images-osm_logo.svg</dc:source>       </cc:Work>       <cc:License rdf:about=\"http://creativecommons.org/licenses/by-sa/3.0/\">         <cc:permits rdf:resource=\"http://creativecommons.org/ns#Reproduction\"/>         <cc:permits rdf:resource=\"http://creativecommons.org/ns#Distribution\"/>         <cc:requires rdf:resource=\"http://creativecommons.org/ns#Notice\"/>         <cc:requires rdf:resource=\"http://creativecommons.org/ns#Attribution\"/>         <cc:permits rdf:resource=\"http://creativecommons.org/ns#DerivativeWorks\"/>         <cc:requires rdf:resource=\"http://creativecommons.org/ns#ShareAlike\"/>       </cc:License>     </rdf:RDF>   </metadata>   <g inkscape:groupmode=\"layer\" id=\"layer8\" inkscape:label=\"map_shadow\" style=\"display:inline\">     <g id=\"g8737\" transform=\"translate(0,-10)\">       <path clip-path=\"none\" transform=\"matrix(1,6.864071e-2,0,0.848698,-6.6011175e-8,36.913089)\" id=\"path5604-26-0-3\" d=\"M 174.28125,35.875 C 156.6825,35.875 139.08909,42.514475 125.5625,55.78125 C 125.39528,55.944528 125.22813,56.084367 125.0625,56.25 C 103.00655,78.305948 98.853795,111.50122 112.59375,137.75 L 110.3125,139.375 C 112.56129,143.61488 115.25415,147.6818 118.40625,151.5 L 105.09375,164.84375 C 103.75238,164.258 102.30517,163.81044 100.53125,163.46875 L 97.6875,166.3125 C 96.578031,165.82863 95.549481,165.49662 94.625,165.4375 L 30.5,229.5625 C 30.46313,230.66337 30.72615,231.74988 31.15625,232.84375 L 30.625,233.375 L 29.53125,234.46875 C 30.246688,238.20655 31.541682,241.29169 35,244.75 C 38.458318,248.20832 41.420414,249.38027 45.28125,250.21875 L 46.375,249.125 L 47.09375,248.40625 C 48.181953,248.8685 49.223649,249.19242 50.1875,249.25 L 114.3125,185.125 C 114.06964,184.15025 113.69207,183.18954 113.28125,182.21875 L 116.28125,179.21875 C 116.03142,177.48677 115.60454,176.02072 114.96875,174.625 L 128.25,161.34375 C 132.0682,164.49585 136.13512,167.18872 140.375,169.4375 L 142,167.15625 C 168.24878,180.8962 201.44405,176.74344 223.5,154.6875 C 223.66563,154.52186 223.80547,154.35472 223.96875,154.1875 C 250.66292,126.97054 250.51736,83.267352 223.5,56.25 C 209.91004,42.660041 192.09307,35.875 174.28125,35.875 z M 173.78125,39.15625 C 173.88592,39.15775 173.98908,39.15425 174.09375,39.15625 C 175.04294,39.17465 175.98913,39.22152 176.9375,39.28125 C 177.89594,39.34161 178.8563,39.428763 179.8125,39.53125 C 179.9062,39.5413 180.00004,39.55205 180.09375,39.5625 C 180.18775,39.57298 180.28105,39.58287 180.375,39.59375 C 180.5207,39.61063 180.66687,39.63839 180.8125,39.65625 C 181.7087,39.766152 182.60741,39.884369 183.5,40.03125 C 184.11909,40.133124 184.72687,40.255367 185.34375,40.375 C 185.6867,40.44144 186.03282,40.49058 186.375,40.5625 C 187.0987,40.714611 187.81147,40.885892 188.53125,41.0625 C 188.8443,41.13931 189.15653,41.199811 189.46875,41.28125 C 189.54185,41.30031 189.61445,41.32444 189.6875,41.34375 C 190.6434,41.596587 191.58423,41.860044 192.53125,42.15625 C 192.60365,42.17886 192.67766,42.19588 192.75,42.21875 C 193.69741,42.518592 194.65684,42.844291 195.59375,43.1875 C 195.64685,43.20695 195.69698,43.23041 195.75,43.25 C 196.70458,43.602395 197.65174,43.977633 198.59375,44.375 C 198.64525,44.39672 198.69853,44.41564 198.75,44.4375 C 199.69184,44.837551 200.63491,45.273781 201.5625,45.71875 C 201.6045,45.73891 201.6455,45.761 201.6875,45.78125 C 202.62288,46.232337 203.54958,46.690779 204.46875,47.1875 C 204.50185,47.20538 204.52945,47.23206 204.56245,47.25 C 205.48926,47.752833 206.40387,48.263321 207.31245,48.8125 C 207.34455,48.83189 207.37415,48.85555 207.40615,48.875 C 208.31425,49.425934 209.20552,49.996562 210.09365,50.59375 C 210.6426,50.962824 211.17785,51.36329 211.71865,51.75 C 212.08335,52.010827 212.45156,52.262412 212.8124,52.53125 C 212.8309,52.54506 212.8564,52.54867 212.8749,52.5625 C 213.75254,53.217706 214.61511,53.922431 215.46865,54.625 C 217.21133,56.059371 218.90007,57.587673 220.53115,59.21875 C 222.15163,60.83923 223.66733,62.519314 225.09365,64.25 C 225.10265,64.26124 225.11565,64.27 225.12485,64.28125 C 225.82806,65.135607 226.53159,65.996485 227.18735,66.875 C 227.47012,67.253769 227.72592,67.648223 227.99985,68.03125 C 228.36958,68.548307 228.73999,69.069236 229.0936,69.59375 C 229.1098,69.61774 229.14,69.63224 229.1561,69.65625 C 229.75422,70.545876 230.32314,71.434083 230.87485,72.34375 C 230.89435,72.37582 230.91795,72.40541 230.93735,72.4375 C 231.48294,73.340419 232.00002,74.266573 232.49985,75.1875 C 232.51775,75.22044 232.54455,75.24829 232.56235,75.28125 C 233.06035,76.202462 233.51643,77.124994 233.9686,78.0625 C 233.9888,78.10444 234.011,78.14552 234.0311,78.1875 C 234.47721,79.117367 234.91137,80.055804 235.31235,81 C 235.33415,81.05123 235.35325,81.104977 235.37485,81.15625 C 235.76965,82.092372 236.14946,83.051461 236.49985,84 C 236.51925,84.05253 236.54305,84.103686 236.56235,84.15625 C 236.90996,85.10461 237.22793,86.040882 237.5311,87 C 237.5538,87.07167 237.5712,87.147026 237.5936,87.21875 C 237.88758,88.159922 238.15494,89.112572 238.4061,90.0625 C 238.4256,90.13603 238.4494,90.207672 238.4686,90.28125 C 238.5493,90.590804 238.61118,90.908382 238.68735,91.21875 C 238.86396,91.938529 239.03524,92.651296 239.18735,93.375 C 239.25925,93.717177 239.30841,94.063299 239.37485,94.40625 C 239.49448,95.023132 239.61673,95.630911 239.7186,96.25 C 239.86548,97.142594 239.9837,98.041302 240.0936,98.9375 C 240.1115,99.083459 240.1392,99.228963 240.1561,99.375 C 240.1669,99.46829 240.1769,99.562929 240.1873,99.65625 C 240.1978,99.75023 240.2085,99.843493 240.2185,99.9375 C 240.32099,100.8937 240.40814,101.85406 240.4685,102.8125 C 240.5277,103.75494 240.57511,104.71299 240.5935,105.65625 C 240.5955,105.76038 240.5915,105.86462 240.5935,105.96875 C 240.6089,107.02208 240.5975,108.0726 240.5623,109.125 C 240.5307,110.05556 240.4776,110.97779 240.40605,111.90625 C 240.39605,112.03118 240.38515,112.15637 240.37485,112.28125 C 240.29875,113.19932 240.20894,114.11665 240.0936,115.03125 C 239.973,115.98751 239.81965,116.95518 239.6561,117.90625 C 239.6419,117.98865 239.6393,118.07392 239.6249,118.15625 C 239.6029,118.2811 239.5852,118.40651 239.5624,118.53125 C 239.39714,119.43903 239.2045,120.34852 238.9999,121.25 C 238.9693,121.38463 238.9376,121.52178 238.9062,121.65625 C 238.69845,122.54491 238.46486,123.43135 238.2187,124.3125 C 238.05479,124.89922 237.86842,125.47955 237.68745,126.0625 C 237.51204,126.62662 237.34761,127.18974 237.1562,127.75 C 236.86153,128.61381 236.55145,129.45882 236.2187,130.3125 C 236.1581,130.46799 236.09304,130.62612 236.0312,130.78125 C 235.9863,130.89371 235.9517,131.01273 235.9062,131.125 C 235.5501,132.00362 235.17807,132.8526 234.7812,133.71875 C 234.40422,134.54222 234.0076,135.34519 233.5937,136.15625 C 233.5132,136.31403 233.42563,136.46772 233.3437,136.625 C 232.92842,137.4224 232.51372,138.21595 232.06245,139 C 231.96725,139.16556 231.87805,139.33506 231.7812,139.5 C 231.58213,139.83885 231.36205,140.16384 231.1562,140.5 C 230.79455,141.09093 230.41383,141.66777 230.0312,142.25 C 230.0262,142.257 230.0362,142.2738 230.0312,142.2812 C 229.54039,143.02694 229.02527,143.76939 228.49995,144.49995 C 228.04268,145.13587 227.54591,145.75123 227.06245,146.37495 C 226.86549,146.62904 226.70126,146.90421 226.49995,147.1562 C 226.36593,147.32399 226.22965,147.48935 226.0937,147.6562 C 225.93019,147.85684 225.76,148.05071 225.5937,148.24995 C 225.03708,148.917 224.46291,149.5678 223.87495,150.2187 C 223.26864,150.88974 222.63964,151.56575 221.99995,152.2187 C 221.83899,152.38296 221.69428,152.55562 221.5312,152.7187 C 200.40085,173.84905 169.27251,177.21358 144.3437,163.87495 L 144.4687,163.68745 C 140.76453,161.79084 137.20703,159.54699 133.8437,156.9062 C 133.30478,156.48305 132.77833,156.03638 132.24995,155.5937 C 131.73554,155.16273 131.22265,154.7308 130.7187,154.2812 C 130.6258,154.1976 130.52998,154.1154 130.43745,154.0312 C 129.61572,153.28344 128.82556,152.51306 128.0312,151.7187 C 127.23684,150.92434 126.46647,150.13418 125.7187,149.31245 C 125.6345,149.21995 125.55231,149.12407 125.4687,149.0312 C 125.0191,148.52725 124.58717,148.01436 124.1562,147.49995 C 123.71352,146.97157 123.26685,146.44512 122.8437,145.9062 C 120.20291,142.54287 117.95906,138.98536 116.06245,135.2812 L 115.87495,135.4062 C 102.53632,110.47739 105.90085,79.349046 127.0312,58.2187 C 127.19428,58.05562 127.36694,57.910915 127.5312,57.74995 C 128.18415,57.110265 128.86016,56.481261 129.5312,55.87495 C 130.1821,55.286994 130.8329,54.712816 131.49995,54.1562 C 131.77209,53.929114 132.03772,53.690576 132.31245,53.4687 C 132.65592,53.191271 133.02754,52.956742 133.37495,52.68745 C 133.99867,52.203987 134.61403,51.707219 135.24995,51.24995 C 135.98748,50.719619 136.74695,50.21386 137.49995,49.7187 C 138.08218,49.336066 138.65902,48.955346 139.24995,48.5937 C 139.69662,48.32034 140.1423,48.042584 140.5937,47.7812 C 141.27515,47.386414 141.96454,47.023727 142.6562,46.6562 C 142.83226,46.56265 143.01076,46.46674 143.18745,46.37495 C 144.1327,45.883975 145.06888,45.40925 146.0312,44.9687 C 146.89735,44.571825 147.74633,44.1998 148.62495,43.8437 C 148.77776,43.78177 148.94054,43.74815 149.0937,43.68745 C 150.06209,43.303428 151.01838,42.928541 151.99995,42.5937 C 152.56021,42.402293 153.12333,42.237857 153.68745,42.06245 C 154.2704,41.881482 154.85073,41.695111 155.43745,41.5312 C 156.3186,41.285037 157.20504,41.051454 158.0937,40.8437 C 158.1648,40.82706 158.24127,40.82884 158.31245,40.81245 C 158.72838,40.71671 159.14509,40.618551 159.56245,40.5312 C 160.23458,40.390375 160.91827,40.244039 161.5937,40.12495 C 161.676,40.11046 161.76133,40.10786 161.8437,40.0937 C 162.79477,39.930149 163.76244,39.776798 164.7187,39.6562 C 166.68235,39.408555 168.64857,39.254564 170.62495,39.18745 C 171.67735,39.15181 172.72787,39.14082 173.7812,39.1562 L 173.78125,39.15625 z\" style=\"opacity:0.7;fill:#2d3335;fill-opacity:1;stroke:none;filter:url(#filter8661)\"/>       <path transform=\"matrix(1,0,0,0.846566,0,37.660073)\" sodipodi:nodetypes=\"cscscscscscscscscscscscscscscscsc\" id=\"path3834-49-7\" d=\"M 9,17.25 C 9,17.25 16.5,28.25 20.75,43 C 25,57.75 27,68.5 27,68.5 C 27,68.5 21.5,81.25 18.75,93.25 C 16,105.25 13,118.25 13,118.25 C 13,118.25 18.75,134.25 22.25,148.25 C 25.75,162.25 26,170.5 26,170.5 C 26,170.5 22,180.75 18.5,194.75 C 15,208.75 13.5,225.5 13.5,225.5 C 13.5,225.5 22.75,223.5 42,226.75 C 61.25,230 74.25,232.75 74.25,232.75 C 74.25,232.75 87,230 98.25,226.5 C 109.5,223 114.5,220 114.5,220 C 114.5,220 120,220.5 137,226.25 C 154,232 166.25,234.75 166.25,234.75 C 166.25,234.75 179.25,232 192.25,229 C 205.25,226 218.75,221 218.75,221 C 218.75,221 218,216 223,196.5 C 228,177 231.75,168.5 231.75,168.5 C 231.75,168.5 231.25,166 228,150.75 C 224.75,135.5 218,121 218,121 C 218,121 219.75,108.5 224.75,95.25 C 229.75,82 235,68.5 235,68.5 C 235,68.5 230.25,53.25 227.5,38.75 C 224.75,24.25 219.25,15 219.25,15 C 219.25,15 195,24 187.5,25.5 C 180,27 166.5,30.75 166.5,30.75 C 166.5,30.75 156.75,26.5 144.5,22.25 C 132.25,18 114.75,16.75 114.75,16.75 C 114.75,16.75 111.5,20.25 92.75,24.75 C 74,29.25 65.25,30.5 65.25,30.5 C 65.25,30.5 46.75,21.5 33.75,19 C 20.75,16.5 9.75,17 9,17.25 z\" style=\"opacity:0.5;fill:url(#linearGradient8735);fill-opacity:1;stroke:none;filter:url(#filter8725)\"/>     </g>   </g>   <g inkscape:groupmode=\"layer\" id=\"layer4\" inkscape:label=\"map_details\" sodipodi:insensitive=\"true\" style=\"display:inline\">     <path style=\"fill:#ceeeab;fill-opacity:1;stroke:none\" d=\"M 9,2.25 C 9,2.25 16.5,15.25 20.75,30 C 25,44.75 27,55.5 27,55.5 C 27,55.5 21.5,68.25 18.75,80.25 C 16,92.25 13,103.25 13,103.25 C 13,103.25 18.75,119.25 22.25,133.25 C 25.75,147.25 26,157.5 26,157.5 C 26,157.5 22,167.75 18.5,181.75 C 15,195.75 13.5,212.5 13.5,212.5 C 13.5,212.5 22.75,210.5 42,213.75 C 61.25,217 74.25,219.75 74.25,219.75 C 74.25,219.75 87,217 98.25,213.5 C 109.5,210 114.5,207 114.5,207 C 114.5,207 120,207.5 137,213.25 C 154,219 166.25,221.75 166.25,221.75 C 166.25,221.75 179.25,219 192.25,216 C 205.25,213 218.75,208 218.75,208 C 218.75,208 218,203 223,183.5 C 228,164 231.75,155.5 231.75,155.5 C 231.75,155.5 231.25,151 228,135.75 C 224.75,120.5 218,106 218,106 C 218,106 219.75,95.5 224.75,82.25 C 229.75,69 235,55.5 235,55.5 C 235,55.5 230.25,40.25 227.5,25.75 C 224.75,11.25 219.25,0 219.25,0 C 219.25,0 195,9 187.5,10.5 C 180,12 166.5,15.75 166.5,15.75 C 166.5,15.75 156.75,11.5 144.5,7.25 C 132.25,3 114.75,1.75 114.75,1.75 C 114.75,1.75 111.5,5.25 92.75,9.75 C 74,14.25 65.25,15.5 65.25,15.5 C 65.25,15.5 46.75,6.5 33.75,4 C 20.75,1.5 9.75,2 9,2.25 z\" id=\"path3834-9\"/>     <g id=\"g5438\" clip-path=\"url(#clipPath5466)\" transform=\"translate(0,-10)\">       <path style=\"fill:#a6dd8b;fill-opacity:1;stroke:none\" d=\"M 110.75,5.5 L 106.5,12.5 C 105.75,21.5 104.25,26.25 98,29 C 91.75,31.75 85.75,32.5 87,36.5 C 88.25,40.5 100,45.75 101.25,49.5 C 102.5,53.25 109.5,51.25 112.25,56.5 C 115,61.75 114.25,71.75 108.5,73.75 C 102.75,75.75 91,74.25 88.25,83.25 C 85.5,92.25 83.5,93.75 79.25,96 C 75,98.25 72,106.5 75.75,112.5 C 79.5,118.5 88,111.25 90.75,106 C 93.5,100.75 98,97.25 98,97.25 L 121.75,97.25 L 180.75,95.5 L 184,91.75 C 184,91.75 187.25,95.75 186.75,100.5 C 186.25,105.25 183,115.25 187,117.75 C 191,120.25 206.5,115.75 211,110.75 C 215.5,105.75 206.25,82.5 200.5,81.25 C 194.75,80 182,79.5 183.5,74.25 C 185,69 195.25,78.75 200.75,77.5 C 206.25,76.25 217.5,56.5 212.75,52.25 C 208,48 188.5,47 187,44.25 C 185.5,41.5 208,36.25 209.25,33.25 C 210.5,30.25 206.75,26 203,24.75 C 199.25,23.5 189,41 182,40.5 C 175,40 162,46.25 164.75,52 C 167.5,57.75 158.75,63 150.25,58.5 C 141.75,54 125.5,45.5 128.5,34.5 C 131.5,23.5 150,15.75 150,15.75 L 110.75,5.5 z M 97.1875,112.71875 C 95.592651,112.86523 92.71875,117.40625 92.25,119.75 C 91.75,122.25 89,126.5 88.75,132 C 88.5,137.5 93.5,138.75 97.5,138.5 C 101.5,138.25 100.25,131.75 99.5,123.5 C 99.25,123.5 99,113.25 97.5,112.75 C 97.40625,112.7188 97.293823,112.709 97.1875,112.7188 L 97.1875,112.71875 z M 189.90625,164.375 C 183.5708,164.67041 183.28125,171.84375 182.5,173.25 C 181.25,175.5 184.75,187 184.5,191.25 C 184.25,195.5 179.75,196.5 175,201 C 170.25,205.5 175.5,217 186.25,232 L 231,233.25 L 230,198.25 C 230,198.25 234.75,194 209.25,174 C 199.6875,166.5 193.70752,164.19775 189.90625,164.375 z M 39.9375,180.90625 C 35.908264,180.80371 31.65625,186.625 30.25,188.5 C 28.75,190.5 24,193.5 13.25,198 L -1.25,232.25 L 51.75,236.5 C 51.75,236.5 53.5,225.5 47.5,220.75 C 41.5,216 30.25,215 29.25,207.5 C 28.25,200 38.5,197.5 43,193.25 C 47.5,189 45,182 40.75,181 C 40.484375,180.9375 40.206116,180.9131 39.9375,180.9063 L 39.9375,180.90625 z\" id=\"path5436\"/>     </g>     <path style=\"fill:#aac3e7;fill-opacity:1;stroke:none\" d=\"M 158.53125,75.34375 C 153.77142,75.329407 149.5,76.3125 147,78.5 C 139,85.5 112,79.25 98.5,85.5 C 85,91.75 85.25,123.5 83.75,130 C 82.25,136.5 66.25,150.75 63.75,153.5 C 61.25,156.25 50.5,160.75 44.25,162 C 38,163.25 31.5,169.25 28.75,173 C 26.728876,175.75608 21.343981,179.45031 18.625,181.21875 C 18.5792,181.40003 18.54564,181.56743 18.5,181.75 C 18.366311,182.28475 18.25288,182.83331 18.125,183.375 C 23.104513,181.77018 29.304508,175.19549 34.75,169.75 C 41,163.5 54.75,162 62.5,158.25 C 70.25,154.5 76.75,138.5 89,134.5 C 101.25,130.5 110.25,146.25 113.25,153 C 116.25,159.75 115,165.75 117,170 C 119,174.25 128,181.75 128.5,183.5 C 129,185.25 123.5,190 122.25,192 C 121,194 111.75,199 110.5,200.75 C 109.53432,202.10195 108.57684,207.52314 108.1875,209.96875 C 108.60053,209.79955 108.94168,209.65822 109.3125,209.5 C 109.7965,206.97067 110.82799,202.42201 112.25,201 C 114.25,199 123.5,196.5 124.75,192.5 C 126,188.5 131.75,186 131.75,186 C 131.75,186 134.5,190 147.75,200 C 156.58333,206.66667 160.5081,215.53356 162.15625,220.71875 C 162.82985,220.8894 163.6892,221.12815 164.1875,221.25 C 162.96635,216.93129 159.35104,205.01115 155.25,200.5 C 150.25,195 136.75,189.75 132.5,178.5 C 128.25,167.25 108,144.25 115,138.25 C 122,132.25 131.5,134.25 143.5,145.75 C 155.5,157.25 189.75,151.5 201.25,149.5 C 211.20453,147.76878 222.08445,164.38321 225.15625,175.53125 C 225.74525,173.43558 226.28288,171.52906 226.8125,169.78125 C 225.07444,167.85545 223.11528,165.16129 221.5,161.5 C 217.75,153 209.5,148.25 209.5,148.25 C 209.5,148.25 218.25,143.25 224.25,140.5 C 225.86703,139.75886 227.25627,138.82287 228.4375,137.84375 C 228.27516,137.06972 228.17857,136.5879 228,135.75 C 227.9689,135.60389 227.938,135.45846 227.9063,135.3125 C 223.14065,140.8749 208.67404,144.92782 206.25005,146.25 C 203.50005,147.75 188.00005,149.25 170.50005,150.75 C 153.00005,152.25 143.75005,143.25 136.25005,136 C 128.75005,128.75 123.25005,100 133.25005,98 C 143.25005,96 153.25005,111.75 163.25005,115 C 173.25005,118.25 184.75005,99.25 183.00005,88 C 181.79693,80.265625 169.00292,75.375305 158.5313,75.34375 L 158.53125,75.34375 z M 105.1875,88.625 C 106.46283,88.6265 111.04688,90.21875 111.75,91 C 114,93.5 113.75,98.25 111.75,99 C 109.75,99.75 99,107 101.25,113.25 C 103.5,119.5 103,131.25 97.75,131.25 C 92.5,131.25 89.75,131.25 87.75,128.75 C 85.75,126.25 85.75,116.75 87.75,109 C 89.75,101.25 91.25,94 95.75,90.75 C 98.84375,88.51562 102.38177,88.621643 105.1875,88.625 L 105.1875,88.625 z M 118.78125,161.71875 C 118.9845,161.73245 120.6875,165.23438 123.5,168.75 C 126.5,172.5 126.75,177 126.75,177 C 126.75,177 122.5,172.25 120.75,169 C 119,165.75 118.75,161.75 118.75,161.75 C 118.75,161.7188 118.7678,161.7177 118.7812,161.7188 L 118.78125,161.71875 z\" id=\"path5280\"/>     <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 122.75,62.25 C 129,62.75 135,60 133.5,55.75 C 132,51.5 121,48.5 120.25,52.75 C 119.5,57 122.25,63.25 122.75,62.25 z\" id=\"path5319\"/>     <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 108.75,46.75 C 100.25,41.25 100.25,39.5 101.75,38.75 C 103.25,38 112,43.75 114.5,46.75 C 117,49.75 112.25,48.75 108.75,46.75 z\" id=\"path5321\"/>     <g id=\"g5373\" clip-path=\"url(#clipPath5383)\" transform=\"translate(0,-10)\">       <path id=\"path5323\" d=\"M 15.75,151.25 C 48.75,148.75 54,147.75 52,141 C 50,134.25 43.25,117.5 29,118.5 C 14.75,119.5 6.25,111.75 6.25,111.75\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5311\" d=\"M 17.5,177.25 C 35.75,167.25 46.25,168.75 52.5,165.75 C 58.75,162.75 65.75,160 68.25,156.25 C 70.75,152.5 74,144.75 74,138.25 C 74,131.75 70.5,102.25 77.25,94.75 C 84,87.25 94.5,68.75 103.25,71.5 C 112,74.25 115.5,81.25 125.25,81 C 135,80.75 147,77 149.5,68.75 C 152,60.5 133.75,52.75 133.5,45.75 C 133.25,38.75 139,31.5 153.75,28.75 C 168.5,26 177.25,17.25 177.25,17.25\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-opacity:1\"/>       <path id=\"path5313\" d=\"M 14.5,161 C 29.75,159.5 36.75,164.5 46,162.75 C 55.25,161 59.25,159.75 63.75,157 C 68.25,154.25 69.75,153.25 70,150.5 C 70.25,147.75 71,138 67,128.5 C 63,119 54.5,97 58.75,89.75 C 63,82.5 64,68.25 74.5,65.25 C 85,62.25 95.5,59 102.25,64 C 109,69 115,78.25 122.25,78.5 C 129.5,78.75 134,77 136.75,74 C 139.5,71 141.25,63.75 138.5,60.25 C 135.75,56.75 123,54.75 121.25,50.75 C 119.5,46.75 110.5,33.75 121,24 C 131.5,14.25 157.25,15.75 157.25,15.75\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5315\" d=\"M 21.25,159 C 35,160 42.75,163.25 54.75,158.5 C 66.75,153.75 68.25,153.25 68.5,149.75 C 68.75,146.25 68.25,134 65.5,129.75 C 62.75,125.5 52.5,116 49.75,105.5 C 47,95 50,64.5 58.25,57.25 C 66.5,50 90.25,50 95.75,46.75 C 101.25,43.5 101,30 108.75,22.25 C 116.5,14.5 135.75,9.9999997 135.75,9.9999997\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5317\" d=\"M 190,18.5 C 201.75,23.5 229,28.25 237.25,58.75\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5325\" d=\"M 9.75,214 C 28.75,201.5 45.75,212.75 58.75,210 C 71.75,207.25 97,172.75 104.75,173 C 112.5,173.25 110.25,161.25 113.25,159.75 C 116.25,158.25 118.75,165.75 125,167.75 C 131.25,169.75 149.5,165 148.5,162 C 147.5,159 141.5,154.25 143,153.5 C 144.5,152.75 151.5,158.5 155.75,157 C 160,155.5 199.5,156 204.25,143.5 C 209,131 225.75,130 225.75,130\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path sodipodi:nodetypes=\"csssssssc\" id=\"path5327\" d=\"M 77.5,233.5 C 91,222 100.75,208.5 106,206.5 C 111.25,204.5 118.75,202.75 121.75,198.5 C 124.75,194.25 124.25,187.75 127,186.5 C 129.75,185.25 130.75,192.25 135.75,192.5 C 140.75,192.75 172.5,187.5 178.5,180.75 C 184.5,174 210.75,168.25 211,166.25 C 211.25,164.25 210,161.5 211.25,160.75 C 212.5,160 236,154.75 236,154.75\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5329\" d=\"M 168.75,236 C 177.75,222.25 189.25,195 198.25,194 C 207.25,193 208.5,191.5 210.75,189.75 C 213,188 227.75,192 227.75,192\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>     </g>     <g id=\"g5400\" clip-path=\"url(#clipPath5426)\" transform=\"translate(0,-10)\">       <path id=\"path5387\" d=\"M 57.75,20 L 49.25,48.25 L 67.25,54.5 L 75,90.75 L 54,113 L 63,123.5 L 51,135 L 51.5,139.5 L 71.75,164 L 85.75,157.25 L 106.25,175.75 L 95.75,204 L 106,212.5 L 103.25,225.5\" style=\"fill: none !important;stroke:#d38484;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5389\" d=\"M 105.75,212.25 L 118.25,184.5 L 129.25,177.5 L 156.75,193.25 L 177.25,189.5 L 177,173.75 L 166.75,167.75 L 179.5,141.5 L 185.25,137.75 L 224,127.75\" style=\"fill: none !important;stroke:#d38484;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>     </g>   </g>   <g id=\"layer1\" inkscape:label=\"Layer 1\" inkscape:groupmode=\"layer\" transform=\"translate(0,192)\" sodipodi:insensitive=\"true\" style=\"display:inline\">     <g id=\"g4199\" transform=\"translate(0,320)\" style=\"opacity:0.5043478\">       <path sodipodi:nodetypes=\"cscscscscscccccsc\" id=\"path3834-4\" transform=\"translate(0,-192)\" d=\"M 219.25,10 C 219.25,10 195,19 187.5,20.5 C 180,22 166.5,25.75 166.5,25.75 C 166.5,25.75 156.75,21.5 144.5,17.25 C 132.25,13 114.75,11.75 114.75,11.75 C 114.75,11.75 111.5,15.25 92.75,19.75 C 74.000003,24.25 65.25,25.5 65.25,25.5 C 65.25,25.5 46.75,16.5 33.75,14 C 20.75,11.5 9.75,12 9,12.25 C 9,12.25 16.5,25.25 20.75,40 C 25,54.75 27,65.5 27,65.5 L 78.46875,70.625 L 127.4375,66.625 L 179.6875,78.65625 C 190.07319,74.238496 231.80421,73.755785 235,65.5 C 235,65.5 230.25,50.25 227.5,35.75 C 224.75,21.25 219.25,10 219.25,10 z\" style=\"fill:#b1e479;fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"cscccccsccccc\" id=\"path3834-7-2\" transform=\"translate(0,-192)\" d=\"M 27,65.5 C 27,65.5 21.5,78.25 18.75,90.25 C 16,102.25 13,113.25 13,113.25 L 63.96875,129.625 L 117.6875,113.875 L 169.9375,131.40625 C 186.30214,127.14964 202.33444,122.28803 218,116 C 218,116 219.75,105.5 224.75,92.25 C 229.75,79 235,65.5 235,65.5 C 231.80421,73.75579 190.07319,74.2385 179.6875,78.65625 L 127.4375,66.625 L 79.46875,70.625 L 27,65.5 z\" style=\"fill:#87d531;fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26\" transform=\"translate(0,-192)\" d=\"M 231.75,165.5 C 213.85059,173.17118 195.80681,180.40405 177.4375,186.90625 L 125.1875,168.375 L 74.96875,177.375 L 26,167.5 C 26,167.5 22,177.75 18.5,191.75 C 15,205.75 13.5,222.5 13.5,222.5 C 13.5,222.5 22.75,220.5 42,223.75 C 61.25,227 74.25,229.75 74.25,229.75 C 74.25,229.75 87.000003,227 98.25,223.5 C 109.5,220 114.5,217 114.5,217 C 114.5,217 120,217.5 137,223.25 C 154,229 166.25,231.75 166.25,231.75 C 166.25,231.75 179.25,229 192.25,226 C 205.25,223 218.75,218 218.75,218 C 218.75,218 218,213 223,193.5 C 228,174 231.75,165.5 231.75,165.5 z\" style=\"fill:#ceeeab;fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"cscccccsccccc\" id=\"path3834-7-26-0\" transform=\"translate(0,-192)\" d=\"M 13,113.25 C 13,113.25 18.75,129.25 22.25,143.25 C 25.75,157.25 26,167.5 26,167.5 L 74.96875,177.375 L 125.1875,168.375 L 177.4375,186.90625 C 195.80681,180.40405 213.85059,173.17118 231.75,165.5 C 231.75,165.5 231.25,161 228,145.75 C 224.75,130.5 218,116 218,116 C 202.33444,122.28803 186.30214,127.14964 169.9375,131.40625 L 117.6875,113.875 L 63.96875,129.625 L 13,113.25 z\" style=\"fill:#b9e787;fill-opacity:1;stroke:none\"/>     </g>     <g id=\"g4205\" style=\"opacity:0.52173911\" transform=\"translate(0,140)\">       <path sodipodi:nodetypes=\"ccscscscscscccccsc\" id=\"path3834-2\" d=\"M 13.71875,0.03125 C 10.989746,0.02425 9.28125,0.15625 9,0.25 C 9,0.25 16.5,13.25 20.75,28 C 25,42.75 27,53.5 27,53.5 C 27,53.5 21.5,66.25 18.75,78.25 C 16,90.25 13,101.25 13,101.25 C 13,101.25 18.75,117.25 22.25,131.25 C 25.75,145.25 26,155.5 26,155.5 C 26,155.5 22,165.75 18.5,179.75 C 15,193.75 13.5,210.5 13.5,210.5 C 13.5,210.5 22.75,208.5 42,211.75 C 61.25,215 74.25,217.75 74.25,217.75 L 75.75,164.5 L 63.5,118 L 79.5,58.25 C 77.279793,42.77003 70.432295,28.20354 65.25,13.5 C 65.25,13.5 46.75,4.5 33.75,2 C 25.625,0.4375 18.26709,0.04346 13.71875,0.03125 z\" style=\"fill:#83d32b;fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"cscccccsccccc\" id=\"path3834-6-2\" d=\"M 114.75,-0.25 C 114.75,-0.25 111.5,3.25 92.75,7.75 C 74,12.25 65.25,13.5 65.25,13.5 C 70.432295,28.20354 77.279793,42.77003 79.5,58.25 L 63.5,118 L 75.75,164.5 L 74.25,217.75 C 74.25,217.75 87,215 98.25,211.5 C 109.5,208 114.5,205 114.5,205 L 125.75,156.5 L 117.5,102.25 L 129.25,57.25 C 125.81031,47.52322 121.18553,0.32024 114.75,-0.25 z\" style=\"fill:#b1e479;fill-opacity:1;stroke:none\"/>       <path id=\"path3834-6-6\" d=\"M 219.25,-2 C 219.25,-2 195,7 187.5,8.5 C 180,10 166.5,13.75 166.5,13.75 C 171.42395,12.39167 177.93679,59.14247 180.75,66 L 169.5,119.25 L 179,174.25 L 166.25,219.75 C 166.25,219.75 179.25,217 192.25,214 C 205.25,211 218.75,206 218.75,206 C 218.75,206 218,201 223,181.5 C 228,162 231.75,153.5 231.75,153.5 C 231.75,153.5 231.25,149 228,133.75 C 224.75,118.5 218,104 218,104 C 218,104 219.75,93.5 224.75,80.25 C 229.75,67 235,53.5 235,53.5 C 235,53.5 230.25,38.25 227.5,23.75 C 224.75,9.25 219.25,-2 219.25,-2 z\" style=\"fill:#a4df62;fill-opacity:1;stroke:none\" sodipodi:nodetypes=\"cscccccscscscscsc\"/>       <path sodipodi:nodetypes=\"cccccscccccsc\" id=\"path3834-6-6-9\" d=\"M 114.75,-0.25 C 121.18553,0.32024 125.81031,47.52322 129.25,57.25 L 117.5,102.25 L 125.75,155.5 L 114.5,205 C 114.5,205 120,205.5 137,211.25 C 154,217 166.25,219.75 166.25,219.75 L 179,174.25 L 169.5,119.25 L 180.75,66 C 177.93679,59.14247 171.42395,12.39167 166.5,13.75 C 166.5,13.75 156.75,9.5 144.5,5.25 C 132.25,1 114.75,-0.25 114.75,-0.25 z\" style=\"fill:#ceeeab;fill-opacity:1;stroke:none\"/>     </g>     <path style=\"opacity:0.03913042;fill:url(#linearGradient5168);fill-opacity:1;stroke:none\" d=\"M 9,-189.75 C 9,-189.75 16.5,-176.75 20.75,-162 C 25,-147.25 27,-136.5 27,-136.5 C 27,-136.5 21.5,-123.75 18.75,-111.75 C 16,-99.75 13,-88.75 13,-88.75 C 13,-88.75 18.75,-72.75 22.25,-58.75 C 25.75,-44.75 26,-34.5 26,-34.5 C 26,-34.5 22,-24.25 18.5,-10.25 C 15,3.75 13.5,20.5 13.5,20.5 C 13.5,20.5 22.75,18.5 42,21.75 C 61.25,25 74.25,27.75 74.25,27.75 C 74.25,27.75 87,25 98.25,21.5 C 109.5,18 114.5,15 114.5,15 C 114.5,15 120,15.5 137,21.25 C 154,27 166.25,29.75 166.25,29.75 C 166.25,29.75 179.25,27 192.25,24 C 205.25,21 218.75,16 218.75,16 C 218.75,16 218,11 223,-8.5 C 228,-28 231.75,-36.5 231.75,-36.5 C 231.75,-36.5 231.25,-41 228,-56.25 C 224.75,-71.5 218,-86 218,-86 C 218,-86 219.75,-96.5 224.75,-109.75 C 229.75,-123 235,-136.5 235,-136.5 C 235,-136.5 230.25,-151.75 227.5,-166.25 C 224.75,-180.75 219.25,-192 219.25,-192 C 219.25,-192 195,-183 187.5,-181.5 C 180,-180 166.5,-176.25 166.5,-176.25 C 166.5,-176.25 156.75,-180.5 144.5,-184.75 C 132.25,-189 114.75,-190.25 114.75,-190.25 C 114.75,-190.25 111.5,-186.75 92.75,-182.25 C 74,-177.75 65.25,-176.5 65.25,-176.5 C 65.25,-176.5 46.75,-185.5 33.75,-188 C 20.75,-190.5 9.75,-190 9,-189.75 z\" id=\"path3834-49\"/>   </g>   <g inkscape:groupmode=\"layer\" id=\"layer3\" inkscape:label=\"grid_shade\" style=\"display:inline\" sodipodi:insensitive=\"true\">     <g transform=\"translate(0,182)\" id=\"g4808\" style=\"opacity:0.2695656\">       <path id=\"path3834-4-9\" d=\"M 219.25,-182 C 219.25,-182 195,-173 187.5,-171.5 C 180,-170 166.5,-166.25 166.5,-166.25 C 171.42395,-167.60833 177.93679,-120.85753 180.75,-114 L 180.6875,-113.71875 C 192.49544,-117.79254 231.89797,-118.48643 235,-126.5 C 235,-126.5 230.25,-141.75 227.5,-156.25 C 224.75,-170.75 219.25,-182 219.25,-182 z\" style=\"fill:url(#linearGradient4806-9);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-2-4-9\" d=\"M 27,-126.5 C 27,-126.5 21.5,-113.75 18.75,-101.75 C 16,-89.75 13,-78.75 13,-78.75 L 63.625,-62.46875 L 79.40625,-121.375 L 27,-126.5 z\" style=\"fill:url(#linearGradient4790-3);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-9-7\" d=\"M 26,-24.5 C 26,-24.5 22,-14.25 18.5,-0.25 C 15,13.75 13.5,30.5 13.5,30.5 C 13.5,30.5 13.646973,30.4546 13.9375,30.4063 C 15.971191,30.06792 25.15625,28.9063 42,31.75005 C 61.25,35.00005 74.25,37.75005 74.25,37.75005 L 75.71875,-14.74995 L 74.96875,-14.62495 L 26,-24.5 z\" style=\"fill:url(#linearGradient4758-2);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-4-9-6\" d=\"M 114.75,-180.25 C 114.75,-180.25 111.5,-176.75 92.75,-172.25 C 74.000003,-167.75 65.25,-166.5 65.25,-166.5 C 70.432295,-151.79646 77.279793,-137.22997 79.5,-121.75 L 79.40625,-121.4375 L 127.4375,-125.375 L 128.5625,-125.125 C 125.20002,-138.4478 120.76647,-179.71689 114.75,-180.25 z\" style=\"fill:url(#linearGradient4750-9);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-0-0-9\" d=\"M 117.59375,-78.09375 L 63.96875,-62.375 L 63.625,-62.46875 L 63.5,-62 L 75.75,-15.5 L 75.71875,-14.75 L 125.1875,-23.625 L 125.71875,-23.4375 L 125.74995,-23.5 L 117.49995,-77.75 L 117.59365,-78.09375 L 117.59375,-78.09375 z\" style=\"fill:url(#linearGradient4782-5);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-2-4-3\" d=\"M 128.5625,-125.125 C 128.7967,-124.19705 129.02602,-123.38337 129.25,-122.75 L 117.59375,-78.09375 L 117.68745,-78.12495 L 169.49995,-60.74995 L 180.68745,-113.7187 C 180.33054,-113.59556 179.99216,-113.47332 179.68745,-113.3437 L 128.56245,-125.12495 L 128.5625,-125.125 z\" style=\"fill:url(#linearGradient4798-4);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-9-85\" d=\"M 125.53125,-23.5 L 114.5,25 C 114.5,25 120,25.5 137,31.25 C 139.125,31.96875 141.16309,32.65576 143.125,33.28125 C 145.08691,33.90674 146.98047,34.4668 148.75,35 C 159.36719,38.19922 166.25,39.75 166.25,39.75 L 178.96875,-5.65625 C 178.45649,-5.47361 177.95026,-5.27525 177.4375,-5.09375 L 125.53125,-23.5 z\" style=\"fill:url(#linearGradient4766-3);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-0-0-3\" d=\"M 218,-76 C 202.33444,-69.71197 186.30214,-64.85036 169.9375,-60.59375 L 169.5,-60.75 L 179,-5.75 L 178.9688,-5.6563 C 196.80782,-12.01643 214.35028,-19.043 231.75005,-26.50005 C 231.75005,-26.50005 231.25005,-31.00005 228.00005,-46.25005 C 224.75,-61.5 218,-76 218,-76 z\" style=\"fill:url(#linearGradient4965);fill-opacity:1;stroke:none\"/>     </g>     <g transform=\"translate(0,182)\" id=\"g4818\" style=\"opacity:0.04347827\">       <path id=\"path3834-4-9-1\" d=\"M 13.71875,-179.96875 C 12.61251,-179.97175 11.746535,-179.93665 11,-179.90625 C 10.55476,-179.88815 10.144586,-179.86725 9.84375,-179.84375 C 9.81446,-179.84175 9.7778,-179.84575 9.75,-179.84375 C 9.352051,-179.81105 9.09375,-179.78125 9,-179.75005 C 9,-179.75005 16.5,-166.75005 20.75,-152.00005 C 25,-137.25 27,-126.5 27,-126.5 L 78.46875,-121.375 L 79.40625,-121.4375 L 79.5,-121.75 C 77.279793,-137.22997 70.432295,-151.79646 65.25,-166.5 C 65.25,-166.5 46.75,-175.5 33.75,-178 C 32.731734,-178.19582 31.73976,-178.37068 30.75,-178.53125 C 30.154387,-178.62795 29.583119,-178.72763 29,-178.8125 C 28.763416,-178.8469 28.546809,-178.8737 28.3125,-178.9062 C 27.006022,-179.08805 25.724495,-179.24659 24.5,-179.37495 C 23.765447,-179.45195 23.105404,-179.50254 22.40625,-179.56245 C 21.721361,-179.62155 21.053311,-179.67434 20.40625,-179.7187 C 19.414378,-179.7865 18.515844,-179.83704 17.625,-179.87495 C 16.168632,-179.93805 14.855835,-179.96565 13.71875,-179.96865 L 13.71875,-179.96875 z\" style=\"fill:url(#linearGradient4686-3);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-0-0-7\" d=\"M 13,-78.75 C 13,-78.75 18.75,-62.75 22.25,-48.75 C 25.75,-34.75 26,-24.5 26,-24.5 L 74.96875,-14.625 L 75.71875,-14.75 L 75.75,-15.5 L 63.5,-62 L 63.625,-62.46875 L 13,-78.75 z\" style=\"fill:url(#linearGradient4742-3);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-2-4-6\" d=\"M 127.4375,-125.375 L 79.46875,-121.375 L 79.40625,-121.375 L 63.625,-62.46875 L 63.96875,-62.375 L 117.59375,-78.09375 L 129.25,-122.75 C 129.02602,-123.38337 128.7967,-124.19705 128.5625,-125.125 L 127.4375,-125.375 L 127.4375,-125.375 z\" style=\"fill:url(#linearGradient4734-3);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-9-8\" d=\"M 125.1875,-23.625 L 75.71875,-14.75 L 74.25,37.75 C 74.25,37.75 87.000003,35 98.25,31.5 C 109.5,28 114.5,25 114.5,25 L 125.71875,-23.4375 L 125.1875,-23.625 z\" style=\"fill:url(#linearGradient4726-9);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-4-9-2\" d=\"M 114.75,-180.25 C 120.76647,-179.71689 125.20002,-138.4478 128.5625,-125.125 L 179.6875,-113.34375 C 179.99221,-113.47337 180.33059,-113.59561 180.6875,-113.71875 L 180.75,-114 C 177.93679,-120.85753 171.42395,-167.60833 166.5,-166.25 C 166.5,-166.25 165.88672,-166.50391 164.78125,-166.96875 C 161.46484,-168.36328 153.6875,-171.5625 144.5,-174.75 C 132.25,-179 114.75,-180.25 114.75,-180.25 z\" style=\"fill:url(#linearGradient4710-2);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-0-0-0\" d=\"M 117.6875,-78.125 L 117.5938,-78.0938 L 117.5001,-77.75005 L 125.7501,-24.50005 L 125.53135,-23.50005 L 177.4376,-5.0938 C 177.95036,-5.2753 178.45659,-5.47366 178.96885,-5.6563 L 179,-5.75 L 169.5,-60.75 L 117.6875,-78.125 L 117.6875,-78.125 z\" style=\"fill:url(#linearGradient4718-4);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-26-9-9\" d=\"M 231.75,-26.5 C 214.35023,-19.04295 196.80777,-12.01638 178.96875,-5.65625 L 166.25,39.75 C 166.25,39.75 179.25,37 192.25,34 C 205.25,31 218.75,26 218.75,26 C 218.75,26 218,21 223,1.5 C 228,-18 231.75,-26.5 231.75,-26.5 z\" style=\"fill:url(#linearGradient4694-4);fill-opacity:1;stroke:none\"/>       <path id=\"path3834-7-2-4-5\" d=\"M 235,-126.5 C 231.89797,-118.48643 192.49544,-117.79254 180.6875,-113.71875 L 169.5,-60.75 L 169.9375,-60.59375 C 186.30214,-64.85036 202.33444,-69.71197 218,-76 C 218,-76 219.75,-86.5 224.75,-99.75 C 229.75,-113 235,-126.5 235,-126.5 z\" style=\"fill:url(#linearGradient4702-4);fill-opacity:1;stroke:none\"/>     </g>   </g>   <g inkscape:groupmode=\"layer\" id=\"layer7\" inkscape:label=\"mag_zoom\" sodipodi:insensitive=\"true\" style=\"display:inline\">     <g style=\"display:inline\" id=\"g8102\" transform=\"matrix(1.2525366,3.539823e-2,0,1.2525366,-27.80947,-48.34395)\" clip-path=\"url(#clipPath8617)\">       <path id=\"path3834-9-1\" d=\"M 9,12.25 C 9,12.25 16.5,25.25 20.75,40 C 25,54.75 27,65.5 27,65.5 C 27,65.5 21.5,78.25 18.75,90.25 C 16,102.25 13,113.25 13,113.25 C 13,113.25 18.75,129.25 22.25,143.25 C 25.75,157.25 26,167.5 26,167.5 C 26,167.5 22,177.75 18.5,191.75 C 15,205.75 13.5,222.5 13.5,222.5 C 13.5,222.5 22.75,220.5 42,223.75 C 61.25,227 74.25,229.75 74.25,229.75 C 74.25,229.75 87,227 98.25,223.5 C 109.5,220 114.5,217 114.5,217 C 114.5,217 120,217.5 137,223.25 C 154,229 166.25,231.75 166.25,231.75 C 166.25,231.75 179.25,229 192.25,226 C 205.25,223 218.75,218 218.75,218 C 218.75,218 218,213 223,193.5 C 228,174 231.75,165.5 231.75,165.5 C 231.75,165.5 231.25,161 228,145.75 C 224.75,130.5 218,116 218,116 C 218,116 219.75,105.5 224.75,92.25 C 229.75,79 235,65.5 235,65.5 C 235,65.5 230.25,50.25 227.5,35.75 C 224.75,21.25 219.25,10 219.25,10 C 219.25,10 195,19 187.5,20.5 C 180,22 166.5,25.75 166.5,25.75 C 166.5,25.75 156.75,21.5 144.5,17.25 C 132.25,13 114.75,11.75 114.75,11.75 C 114.75,11.75 111.5,15.25 92.75,19.75 C 74,24.25 65.25,25.5 65.25,25.5 C 65.25,25.5 46.75,16.5 33.75,14 C 20.75,11.5 9.75,12 9,12.25 z\" style=\"fill:#ceeeab;fill-opacity:1;stroke:none\"/>       <g clip-path=\"url(#clipPath5466-2-3)\" id=\"g5438-0\">         <path id=\"path5436-7\" d=\"M 110.75,5.5 L 106.5,12.5 C 105.75,21.5 104.25,26.25 98,29 C 91.75,31.75 85.75,32.5 87,36.5 C 88.25,40.5 100,45.75 101.25,49.5 C 102.5,53.25 109.5,51.25 112.25,56.5 C 115,61.75 114.25,71.75 108.5,73.75 C 102.75,75.75 91,74.25 88.25,83.25 C 85.5,92.25 83.5,93.75 79.25,96 C 75,98.25 72,106.5 75.75,112.5 C 79.5,118.5 88,111.25 90.75,106 C 93.5,100.75 98,97.25 98,97.25 L 121.75,97.25 L 180.75,95.5 L 184,91.75 C 184,91.75 187.25,95.75 186.75,100.5 C 186.25,105.25 183,115.25 187,117.75 C 191,120.25 206.5,115.75 211,110.75 C 215.5,105.75 206.25,82.5 200.5,81.25 C 194.75,80 182,79.5 183.5,74.25 C 185,69 195.25,78.75 200.75,77.5 C 206.25,76.25 217.5,56.5 212.75,52.25 C 208,48 188.5,47 187,44.25 C 185.5,41.5 208,36.25 209.25,33.25 C 210.5,30.25 206.75,26 203,24.75 C 199.25,23.5 189,41 182,40.5 C 175,40 162,46.25 164.75,52 C 167.5,57.75 158.75,63 150.25,58.5 C 141.75,54 125.5,45.5 128.5,34.5 C 131.5,23.5 150,15.75 150,15.75 L 110.75,5.5 z M 97.1875,112.71875 C 95.592651,112.86523 92.71875,117.40625 92.25,119.75 C 91.75,122.25 89,126.5 88.75,132 C 88.5,137.5 93.5,138.75 97.5,138.5 C 101.5,138.25 100.25,131.75 99.5,123.5 C 99.25,123.5 99,113.25 97.5,112.75 C 97.40625,112.7188 97.293823,112.709 97.1875,112.7188 L 97.1875,112.71875 z M 189.90625,164.375 C 183.5708,164.67041 183.28125,171.84375 182.5,173.25 C 181.25,175.5 184.75,187 184.5,191.25 C 184.25,195.5 179.75,196.5 175,201 C 170.25,205.5 175.5,217 186.25,232 L 231,233.25 L 230,198.25 C 230,198.25 234.75,194 209.25,174 C 199.6875,166.5 193.70752,164.19775 189.90625,164.375 z M 39.9375,180.90625 C 35.908264,180.80371 31.65625,186.625 30.25,188.5 C 28.75,190.5 24,193.5 13.25,198 L -1.25,232.25 L 51.75,236.5 C 51.75,236.5 53.5,225.5 47.5,220.75 C 41.5,216 30.25,215 29.25,207.5 C 28.25,200 38.5,197.5 43,193.25 C 47.5,189 45,182 40.75,181 C 40.484375,180.9375 40.206116,180.9131 39.9375,180.9063 L 39.9375,180.90625 z\" style=\"fill:#a6dd8b;fill-opacity:1;stroke:none\"/>       </g>       <path id=\"path5280-4\" d=\"M 158.53125,85.34375 C 153.77142,85.329407 149.5,86.3125 147,88.5 C 139,95.5 112,89.25 98.5,95.5 C 85,101.75 85.25,133.5 83.75,140 C 82.25,146.5 66.25,160.75 63.75,163.5 C 61.25,166.25 50.5,170.75 44.25,172 C 38,173.25 31.5,179.25 28.75,183 C 26.728876,185.75608 21.343981,189.45031 18.625,191.21875 C 18.5792,191.40003 18.54564,191.56743 18.5,191.75 C 18.366311,192.28475 18.25288,192.83331 18.125,193.375 C 23.104513,191.77018 29.304508,185.19549 34.75,179.75 C 41,173.5 54.75,172 62.5,168.25 C 70.25,164.5 76.75,148.5 89,144.5 C 101.25,140.5 110.25,156.25 113.25,163 C 116.25,169.75 115,175.75 117,180 C 119,184.25 128,191.75 128.5,193.5 C 129,195.25 123.5,200 122.25,202 C 121,204 111.75,209 110.5,210.75 C 109.53432,212.10195 108.57684,217.52314 108.1875,219.96875 C 108.60053,219.79955 108.94168,219.65822 109.3125,219.5 C 109.7965,216.97067 110.82799,212.42201 112.25,211 C 114.25,209 123.5,206.5 124.75,202.5 C 126,198.5 131.75,196 131.75,196 C 131.75,196 134.5,200 147.75,210 C 156.58333,216.66667 160.5081,225.53356 162.15625,230.71875 C 162.82985,230.8894 163.6892,231.12815 164.1875,231.25 C 162.96635,226.93129 159.35104,215.01115 155.25,210.5 C 150.25,205 136.75,199.75 132.5,188.5 C 128.25,177.25 108,154.25 115,148.25 C 122,142.25 131.5,144.25 143.5,155.75 C 155.5,167.25 189.75,161.5 201.25,159.5 C 211.20453,157.76878 222.08445,174.38321 225.15625,185.53125 C 225.74525,183.43558 226.28288,181.52906 226.8125,179.78125 C 225.07444,177.85545 223.11528,175.16129 221.5,171.5 C 217.75,163 209.5,158.25 209.5,158.25 C 209.5,158.25 218.25,153.25 224.25,150.5 C 225.86703,149.75886 227.25627,148.82287 228.4375,147.84375 C 228.27516,147.06972 228.17857,146.5879 228,145.75 C 227.9689,145.60389 227.938,145.45846 227.9063,145.3125 C 223.14065,150.8749 208.67404,154.92782 206.25005,156.25 C 203.50005,157.75 188.00005,159.25 170.50005,160.75 C 153.00005,162.25 143.75005,153.25 136.25005,146 C 128.75005,138.75 123.25005,110 133.25005,108 C 143.25005,106 153.25005,121.75 163.25005,125 C 173.25005,128.25 184.75005,109.25 183.00005,98 C 181.79693,90.265625 169.00292,85.375305 158.5313,85.34375 L 158.53125,85.34375 z M 105.1875,98.625 C 106.46283,98.6265 111.04688,100.21875 111.75,101 C 114,103.5 113.75,108.25 111.75,109 C 109.75,109.75 99,117 101.25,123.25 C 103.5,129.5 103,141.25 97.75,141.25 C 92.5,141.25 89.75,141.25 87.75,138.75 C 85.75,136.25 85.75,126.75 87.75,119 C 89.75,111.25 91.25,104 95.75,100.75 C 98.84375,98.51562 102.38177,98.621643 105.1875,98.625 L 105.1875,98.625 z M 118.78125,171.71875 C 118.9845,171.73245 120.6875,175.23438 123.5,178.75 C 126.5,182.5 126.75,187 126.75,187 C 126.75,187 122.5,182.25 120.75,179 C 119,175.75 118.75,171.75 118.75,171.75 C 118.75,171.7188 118.7678,171.7177 118.7812,171.7188 L 118.78125,171.71875 z\" style=\"fill:#aac3e7;fill-opacity:1;stroke:none\"/>       <path id=\"path5319-8\" d=\"M 122.75,72.25 C 129,72.75 135,70 133.5,65.75 C 132,61.5 121,58.5 120.25,62.75 C 119.5,67 122.25,73.25 122.75,72.25 z\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <path id=\"path5321-0\" d=\"M 108.75,56.75 C 100.25,51.25 100.25,49.5 101.75,48.75 C 103.25,48 112,53.75 114.5,56.75 C 117,59.75 112.25,58.75 108.75,56.75 z\" style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"/>       <g clip-path=\"url(#clipPath5383-0-0)\" id=\"g5373-1\">         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 15.75,151.25 C 48.75,148.75 54,147.75 52,141 C 50,134.25 43.25,117.5 29,118.5 C 14.75,119.5 6.25,111.75 6.25,111.75\" id=\"path5323-8\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-opacity:1\" d=\"M 17.5,177.25 C 35.75,167.25 46.25,168.75 52.5,165.75 C 58.75,162.75 65.75,160 68.25,156.25 C 70.75,152.5 74,144.75 74,138.25 C 74,131.75 70.5,102.25 77.25,94.75 C 84,87.25 94.5,68.75 103.25,71.5 C 112,74.25 115.5,81.25 125.25,81 C 135,80.75 147,77 149.5,68.75 C 152,60.5 133.75,52.75 133.5,45.75 C 133.25,38.75 139,31.5 153.75,28.75 C 168.5,26 177.25,17.25 177.25,17.25\" id=\"path5311-7\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 14.5,161 C 29.75,159.5 36.75,164.5 46,162.75 C 55.25,161 59.25,159.75 63.75,157 C 68.25,154.25 69.75,153.25 70,150.5 C 70.25,147.75 71,138 67,128.5 C 63,119 54.5,97 58.75,89.75 C 63,82.5 64,68.25 74.5,65.25 C 85,62.25 95.5,59 102.25,64 C 109,69 115,78.25 122.25,78.5 C 129.5,78.75 134,77 136.75,74 C 139.5,71 141.25,63.75 138.5,60.25 C 135.75,56.75 123,54.75 121.25,50.75 C 119.5,46.75 110.5,33.75 121,24 C 131.5,14.25 157.25,15.75 157.25,15.75\" id=\"path5313-3\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 21.25,159 C 35,160 42.75,163.25 54.75,158.5 C 66.75,153.75 68.25,153.25 68.5,149.75 C 68.75,146.25 68.25,134 65.5,129.75 C 62.75,125.5 52.5,116 49.75,105.5 C 47,95 50,64.5 58.25,57.25 C 66.5,50 90.25,50 95.75,46.75 C 101.25,43.5 101,30 108.75,22.25 C 116.5,14.5 135.75,9.9999997 135.75,9.9999997\" id=\"path5315-4\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 190,18.5 C 201.75,23.5 229,28.25 237.25,58.75\" id=\"path5317-7\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 9.75,214 C 28.75,201.5 45.75,212.75 58.75,210 C 71.75,207.25 97,172.75 104.75,173 C 112.5,173.25 110.25,161.25 113.25,159.75 C 116.25,158.25 118.75,165.75 125,167.75 C 131.25,169.75 149.5,165 148.5,162 C 147.5,159 141.5,154.25 143,153.5 C 144.5,152.75 151.5,158.5 155.75,157 C 160,155.5 199.5,156 204.25,143.5 C 209,131 225.75,130 225.75,130\" id=\"path5325-1\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 77.5,233.5 C 91,222 100.75,208.5 106,206.5 C 111.25,204.5 118.75,202.75 121.75,198.5 C 124.75,194.25 124.25,187.75 127,186.5 C 129.75,185.25 130.75,192.25 135.75,192.5 C 140.75,192.75 172.5,187.5 178.5,180.75 C 184.5,174 210.75,168.25 211,166.25 C 211.25,164.25 210,161.5 211.25,160.75 C 212.5,160 236,154.75 236,154.75\" id=\"path5327-3\" sodipodi:nodetypes=\"csssssssc\"/>         <path style=\"opacity:0.38695655;fill: none !important;stroke:#6d7f42;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 168.75,236 C 177.75,222.25 189.25,195 198.25,194 C 207.25,193 208.5,191.5 210.75,189.75 C 213,188 227.75,192 227.75,192\" id=\"path5329-4\"/>       </g>       <g clip-path=\"url(#clipPath5426-1-6)\" id=\"g5400-4\">         <path style=\"fill: none !important;stroke:#d38484;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 57.75,20 L 49.25,48.25 L 67.25,54.5 L 75,90.75 L 54,113 L 63,123.5 L 51,135 L 51.5,139.5 L 71.75,164 L 85.75,157.25 L 106.25,175.75 L 95.75,204 L 106,212.5 L 103.25,225.5\" id=\"path5387-2\"/>         <path style=\"fill: none !important;stroke:#d38484;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" d=\"M 105.75,212.25 L 118.25,184.5 L 129.25,177.5 L 156.75,193.25 L 177.25,189.5 L 177,173.75 L 166.75,167.75 L 179.5,141.5 L 185.25,137.75 L 224,127.75\" id=\"path5389-4\"/>       </g>       <path id=\"path3834-49-6\" d=\"M 9,12.25 C 9,12.25 16.5,25.25 20.75,40 C 25,54.75 27,65.5 27,65.5 C 27,65.5 21.5,78.25 18.75,90.25 C 16,102.25 13,113.25 13,113.25 C 13,113.25 18.75,129.25 22.25,143.25 C 25.75,157.25 26,167.5 26,167.5 C 26,167.5 22,177.75 18.5,191.75 C 15,205.75 13.5,222.5 13.5,222.5 C 13.5,222.5 22.75,220.5 42,223.75 C 61.25,227 74.25,229.75 74.25,229.75 C 74.25,229.75 87,227 98.25,223.5 C 109.5,220 114.5,217 114.5,217 C 114.5,217 120,217.5 137,223.25 C 154,229 166.25,231.75 166.25,231.75 C 166.25,231.75 179.25,229 192.25,226 C 205.25,223 218.75,218 218.75,218 C 218.75,218 218,213 223,193.5 C 228,174 231.75,165.5 231.75,165.5 C 231.75,165.5 231.25,161 228,145.75 C 224.75,130.5 218,116 218,116 C 218,116 219.75,105.5 224.75,92.25 C 229.75,79 235,65.5 235,65.5 C 235,65.5 230.25,50.25 227.5,35.75 C 224.75,21.25 219.25,10 219.25,10 C 219.25,10 195,19 187.5,20.5 C 180,22 166.5,25.75 166.5,25.75 C 166.5,25.75 156.75,21.5 144.5,17.25 C 132.25,13 114.75,11.75 114.75,11.75 C 114.75,11.75 111.5,15.25 92.75,19.75 C 74,24.25 65.25,25.5 65.25,25.5 C 65.25,25.5 46.75,16.5 33.75,14 C 20.75,11.5 9.75,12 9,12.25 z\" style=\"opacity:0.03913042;fill:url(#linearGradient5168-2-9);fill-opacity:1;stroke:none\"/>       <g style=\"opacity:0.2695656;display:inline\" id=\"g4808-4\" transform=\"translate(0,192)\">         <path style=\"fill:url(#linearGradient4806-9-8-4);fill-opacity:1;stroke:none\" d=\"M 219.25,-182 C 219.25,-182 195,-173 187.5,-171.5 C 180,-170 166.5,-166.25 166.5,-166.25 C 171.42395,-167.60833 177.93679,-120.85753 180.75,-114 L 180.6875,-113.71875 C 192.49544,-117.79254 231.89797,-118.48643 235,-126.5 C 235,-126.5 230.25,-141.75 227.5,-156.25 C 224.75,-170.75 219.25,-182 219.25,-182 z\" id=\"path3834-4-9-9\"/>         <path style=\"fill:url(#linearGradient4790-3-9-7);fill-opacity:1;stroke:none\" d=\"M 27,-126.5 C 27,-126.5 21.5,-113.75 18.75,-101.75 C 16,-89.75 13,-78.75 13,-78.75 L 63.625,-62.46875 L 79.40625,-121.375 L 27,-126.5 z\" id=\"path3834-7-2-4-9-8\"/>         <path style=\"fill:url(#linearGradient4758-2-6-2);fill-opacity:1;stroke:none\" d=\"M 26,-24.5 C 26,-24.5 22,-14.25 18.5,-0.25 C 15,13.75 13.5,30.5 13.5,30.5 C 13.5,30.5 13.646973,30.4546 13.9375,30.4063 C 15.971191,30.06792 25.15625,28.9063 42,31.75005 C 61.25,35.00005 74.25,37.75005 74.25,37.75005 L 75.71875,-14.74995 L 74.96875,-14.62495 L 26,-24.5 z\" id=\"path3834-7-26-9-7-4\"/>         <path style=\"fill:url(#linearGradient4750-9-9-4);fill-opacity:1;stroke:none\" d=\"M 114.75,-180.25 C 114.75,-180.25 111.5,-176.75 92.75,-172.25 C 74.000003,-167.75 65.25,-166.5 65.25,-166.5 C 70.432295,-151.79646 77.279793,-137.22997 79.5,-121.75 L 79.40625,-121.4375 L 127.4375,-125.375 L 128.5625,-125.125 C 125.20002,-138.4478 120.76647,-179.71689 114.75,-180.25 z\" id=\"path3834-4-9-6-2\"/>         <path style=\"fill:url(#linearGradient4782-5-5-9);fill-opacity:1;stroke:none\" d=\"M 117.59375,-78.09375 L 63.96875,-62.375 L 63.625,-62.46875 L 63.5,-62 L 75.75,-15.5 L 75.71875,-14.75 L 125.1875,-23.625 L 125.71875,-23.4375 L 125.74995,-23.5 L 117.49995,-77.75 L 117.59365,-78.09375 L 117.59375,-78.09375 z\" id=\"path3834-7-26-0-0-9-5\"/>         <path style=\"fill:url(#linearGradient4798-4-1-9);fill-opacity:1;stroke:none\" d=\"M 128.5625,-125.125 C 128.7967,-124.19705 129.02602,-123.38337 129.25,-122.75 L 117.59375,-78.09375 L 117.68745,-78.12495 L 169.49995,-60.74995 L 180.68745,-113.7187 C 180.33054,-113.59556 179.99216,-113.47332 179.68745,-113.3437 L 128.56245,-125.12495 L 128.5625,-125.125 z\" id=\"path3834-7-2-4-3-7\"/>         <path style=\"fill:url(#linearGradient4766-3-6-2);fill-opacity:1;stroke:none\" d=\"M 125.53125,-23.5 L 114.5,25 C 114.5,25 120,25.5 137,31.25 C 139.125,31.96875 141.16309,32.65576 143.125,33.28125 C 145.08691,33.90674 146.98047,34.4668 148.75,35 C 159.36719,38.19922 166.25,39.75 166.25,39.75 L 178.96875,-5.65625 C 178.45649,-5.47361 177.95026,-5.27525 177.4375,-5.09375 L 125.53125,-23.5 z\" id=\"path3834-7-26-9-85-2\"/>         <path style=\"fill:url(#linearGradient4965-0-3);fill-opacity:1;stroke:none\" d=\"M 218,-76 C 202.33444,-69.71197 186.30214,-64.85036 169.9375,-60.59375 L 169.5,-60.75 L 179,-5.75 L 178.9688,-5.6563 C 196.80782,-12.01643 214.35028,-19.043 231.75005,-26.50005 C 231.75005,-26.50005 231.25005,-31.00005 228.00005,-46.25005 C 224.75,-61.5 218,-76 218,-76 z\" id=\"path3834-7-26-0-0-3-7\"/>       </g>       <g style=\"opacity:0.04347827;display:inline\" id=\"g4818-4\" transform=\"translate(0,192)\">         <path style=\"fill:url(#linearGradient4686-3-4-6);fill-opacity:1;stroke:none\" d=\"M 13.71875,-179.96875 C 12.61251,-179.97175 11.746535,-179.93665 11,-179.90625 C 10.55476,-179.88815 10.144586,-179.86725 9.84375,-179.84375 C 9.81446,-179.84175 9.7778,-179.84575 9.75,-179.84375 C 9.352051,-179.81105 9.09375,-179.78125 9,-179.75005 C 9,-179.75005 16.5,-166.75005 20.75,-152.00005 C 25,-137.25 27,-126.5 27,-126.5 L 78.46875,-121.375 L 79.40625,-121.4375 L 79.5,-121.75 C 77.279793,-137.22997 70.432295,-151.79646 65.25,-166.5 C 65.25,-166.5 46.75,-175.5 33.75,-178 C 32.731734,-178.19582 31.73976,-178.37068 30.75,-178.53125 C 30.154387,-178.62795 29.583119,-178.72763 29,-178.8125 C 28.763416,-178.8469 28.546809,-178.8737 28.3125,-178.9062 C 27.006022,-179.08805 25.724495,-179.24659 24.5,-179.37495 C 23.765447,-179.45195 23.105404,-179.50254 22.40625,-179.56245 C 21.721361,-179.62155 21.053311,-179.67434 20.40625,-179.7187 C 19.414378,-179.7865 18.515844,-179.83704 17.625,-179.87495 C 16.168632,-179.93805 14.855835,-179.96565 13.71875,-179.96865 L 13.71875,-179.96875 z\" id=\"path3834-4-9-1-4\"/>         <path style=\"fill:url(#linearGradient4742-3-4-4);fill-opacity:1;stroke:none\" d=\"M 13,-78.75 C 13,-78.75 18.75,-62.75 22.25,-48.75 C 25.75,-34.75 26,-24.5 26,-24.5 L 74.96875,-14.625 L 75.71875,-14.75 L 75.75,-15.5 L 63.5,-62 L 63.625,-62.46875 L 13,-78.75 z\" id=\"path3834-7-26-0-0-7-0\"/>         <path style=\"fill:url(#linearGradient4734-3-7-6);fill-opacity:1;stroke:none\" d=\"M 127.4375,-125.375 L 79.46875,-121.375 L 79.40625,-121.375 L 63.625,-62.46875 L 63.96875,-62.375 L 117.59375,-78.09375 L 129.25,-122.75 C 129.02602,-123.38337 128.7967,-124.19705 128.5625,-125.125 L 127.4375,-125.375 L 127.4375,-125.375 z\" id=\"path3834-7-2-4-6-5\"/>         <path style=\"fill:url(#linearGradient4726-9-4-9);fill-opacity:1;stroke:none\" d=\"M 125.1875,-23.625 L 75.71875,-14.75 L 74.25,37.75 C 74.25,37.75 87.000003,35 98.25,31.5 C 109.5,28 114.5,25 114.5,25 L 125.71875,-23.4375 L 125.1875,-23.625 z\" id=\"path3834-7-26-9-8-6\"/>         <path style=\"fill:url(#linearGradient4710-2-1-6);fill-opacity:1;stroke:none\" d=\"M 114.75,-180.25 C 120.76647,-179.71689 125.20002,-138.4478 128.5625,-125.125 L 179.6875,-113.34375 C 179.99221,-113.47337 180.33059,-113.59561 180.6875,-113.71875 L 180.75,-114 C 177.93679,-120.85753 171.42395,-167.60833 166.5,-166.25 C 166.5,-166.25 165.88672,-166.50391 164.78125,-166.96875 C 161.46484,-168.36328 153.6875,-171.5625 144.5,-174.75 C 132.25,-179 114.75,-180.25 114.75,-180.25 z\" id=\"path3834-4-9-2-0\"/>         <path style=\"fill:url(#linearGradient4718-4-6-0);fill-opacity:1;stroke:none\" d=\"M 117.6875,-78.125 L 117.5938,-78.0938 L 117.5001,-77.75005 L 125.7501,-24.50005 L 125.53135,-23.50005 L 177.4376,-5.0938 C 177.95036,-5.2753 178.45659,-5.47366 178.96885,-5.6563 L 179,-5.75 L 169.5,-60.75 L 117.6875,-78.125 L 117.6875,-78.125 z\" id=\"path3834-7-26-0-0-0-0\"/>         <path style=\"fill:url(#linearGradient4694-4-1-9);fill-opacity:1;stroke:none\" d=\"M 231.75,-26.5 C 214.35023,-19.04295 196.80777,-12.01638 178.96875,-5.65625 L 166.25,39.75 C 166.25,39.75 179.25,37 192.25,34 C 205.25,31 218.75,26 218.75,26 C 218.75,26 218,21 223,1.5 C 228,-18 231.75,-26.5 231.75,-26.5 z\" id=\"path3834-7-26-9-9-4\"/>         <path style=\"fill:url(#linearGradient4702-4-6-9);fill-opacity:1;stroke:none\" d=\"M 235,-126.5 C 231.89797,-118.48643 192.49544,-117.79254 180.6875,-113.71875 L 169.5,-60.75 L 169.9375,-60.59375 C 186.30214,-64.85036 202.33444,-69.71197 218,-76 C 218,-76 219.75,-86.5 224.75,-99.75 C 229.75,-113 235,-126.5 235,-126.5 z\" id=\"path3834-7-2-4-5-0\"/>       </g>     </g>   </g>   <g inkscape:groupmode=\"layer\" id=\"layer6\" inkscape:label=\"Mag Shadow\" style=\"display:inline\" sodipodi:insensitive=\"true\">     <path style=\"fill:#2d3335;fill-opacity:1;stroke:none;filter:url(#filter7286)\" d=\"M 174.28125,35.875 C 156.6825,35.875 139.08909,42.514475 125.5625,55.78125 C 125.39528,55.944528 125.22813,56.084367 125.0625,56.25 C 103.00655,78.305948 98.853795,111.50122 112.59375,137.75 L 110.3125,139.375 C 112.56129,143.61488 115.25415,147.6818 118.40625,151.5 L 105.09375,164.84375 C 103.75238,164.258 102.30517,163.81044 100.53125,163.46875 L 97.6875,166.3125 C 96.578031,165.82863 95.549481,165.49662 94.625,165.4375 L 30.5,229.5625 C 30.46313,230.66337 30.72615,231.74988 31.15625,232.84375 L 30.625,233.375 L 29.53125,234.46875 C 30.246688,238.20655 31.541682,241.29169 35,244.75 C 38.458318,248.20832 41.420414,249.38027 45.28125,250.21875 L 46.375,249.125 L 47.09375,248.40625 C 48.181953,248.8685 49.223649,249.19242 50.1875,249.25 L 114.3125,185.125 C 114.06964,184.15025 113.69207,183.18954 113.28125,182.21875 L 116.28125,179.21875 C 116.03142,177.48677 115.60454,176.02072 114.96875,174.625 L 128.25,161.34375 C 132.0682,164.49585 136.13512,167.18872 140.375,169.4375 L 142,167.15625 C 168.24878,180.8962 201.44405,176.74344 223.5,154.6875 C 223.66563,154.52186 223.80547,154.35472 223.96875,154.1875 C 250.66292,126.97054 250.51736,83.267352 223.5,56.25 C 209.91004,42.660041 192.09307,35.875 174.28125,35.875 z M 173.78125,39.15625 C 173.88592,39.15775 173.98908,39.15425 174.09375,39.15625 C 175.04294,39.17465 175.98913,39.22152 176.9375,39.28125 C 177.89594,39.34161 178.8563,39.428763 179.8125,39.53125 C 179.9062,39.5413 180.00004,39.55205 180.09375,39.5625 C 180.18775,39.57298 180.28105,39.58287 180.375,39.59375 C 180.5207,39.61063 180.66687,39.63839 180.8125,39.65625 C 181.7087,39.766152 182.60741,39.884369 183.5,40.03125 C 184.11909,40.133124 184.72687,40.255367 185.34375,40.375 C 185.6867,40.44144 186.03282,40.49058 186.375,40.5625 C 187.0987,40.714611 187.81147,40.885892 188.53125,41.0625 C 188.8443,41.13931 189.15653,41.199811 189.46875,41.28125 C 189.54185,41.30031 189.61445,41.32444 189.6875,41.34375 C 190.6434,41.596587 191.58423,41.860044 192.53125,42.15625 C 192.60365,42.17886 192.67766,42.19588 192.75,42.21875 C 193.69741,42.518592 194.65684,42.844291 195.59375,43.1875 C 195.64685,43.20695 195.69698,43.23041 195.75,43.25 C 196.70458,43.602395 197.65174,43.977633 198.59375,44.375 C 198.64525,44.39672 198.69853,44.41564 198.75,44.4375 C 199.69184,44.837551 200.63491,45.273781 201.5625,45.71875 C 201.6045,45.73891 201.6455,45.761 201.6875,45.78125 C 202.62288,46.232337 203.54958,46.690779 204.46875,47.1875 C 204.50185,47.20538 204.52945,47.23206 204.56245,47.25 C 205.48926,47.752833 206.40387,48.263321 207.31245,48.8125 C 207.34455,48.83189 207.37415,48.85555 207.40615,48.875 C 208.31425,49.425934 209.20552,49.996562 210.09365,50.59375 C 210.6426,50.962824 211.17785,51.36329 211.71865,51.75 C 212.08335,52.010827 212.45156,52.262412 212.8124,52.53125 C 212.8309,52.54506 212.8564,52.54867 212.8749,52.5625 C 213.75254,53.217706 214.61511,53.922431 215.46865,54.625 C 217.21133,56.059371 218.90007,57.587673 220.53115,59.21875 C 222.15163,60.83923 223.66733,62.519314 225.09365,64.25 C 225.10265,64.26124 225.11565,64.27 225.12485,64.28125 C 225.82806,65.135607 226.53159,65.996485 227.18735,66.875 C 227.47012,67.253769 227.72592,67.648223 227.99985,68.03125 C 228.36958,68.548307 228.73999,69.069236 229.0936,69.59375 C 229.1098,69.61774 229.14,69.63224 229.1561,69.65625 C 229.75422,70.545876 230.32314,71.434083 230.87485,72.34375 C 230.89435,72.37582 230.91795,72.40541 230.93735,72.4375 C 231.48294,73.340419 232.00002,74.266573 232.49985,75.1875 C 232.51775,75.22044 232.54455,75.24829 232.56235,75.28125 C 233.06035,76.202462 233.51643,77.124994 233.9686,78.0625 C 233.9888,78.10444 234.011,78.14552 234.0311,78.1875 C 234.47721,79.117367 234.91137,80.055804 235.31235,81 C 235.33415,81.05123 235.35325,81.104977 235.37485,81.15625 C 235.76965,82.092372 236.14946,83.051461 236.49985,84 C 236.51925,84.05253 236.54305,84.103686 236.56235,84.15625 C 236.90996,85.10461 237.22793,86.040882 237.5311,87 C 237.5538,87.07167 237.5712,87.147026 237.5936,87.21875 C 237.88758,88.159922 238.15494,89.112572 238.4061,90.0625 C 238.4256,90.13603 238.4494,90.207672 238.4686,90.28125 C 238.5493,90.590804 238.61118,90.908382 238.68735,91.21875 C 238.86396,91.938529 239.03524,92.651296 239.18735,93.375 C 239.25925,93.717177 239.30841,94.063299 239.37485,94.40625 C 239.49448,95.023132 239.61673,95.630911 239.7186,96.25 C 239.86548,97.142594 239.9837,98.041302 240.0936,98.9375 C 240.1115,99.083459 240.1392,99.228963 240.1561,99.375 C 240.1669,99.46829 240.1769,99.562929 240.1873,99.65625 C 240.1978,99.75023 240.2085,99.843493 240.2185,99.9375 C 240.32099,100.8937 240.40814,101.85406 240.4685,102.8125 C 240.5277,103.75494 240.57511,104.71299 240.5935,105.65625 C 240.5955,105.76038 240.5915,105.86462 240.5935,105.96875 C 240.6089,107.02208 240.5975,108.0726 240.5623,109.125 C 240.5307,110.05556 240.4776,110.97779 240.40605,111.90625 C 240.39605,112.03118 240.38515,112.15637 240.37485,112.28125 C 240.29875,113.19932 240.20894,114.11665 240.0936,115.03125 C 239.973,115.98751 239.81965,116.95518 239.6561,117.90625 C 239.6419,117.98865 239.6393,118.07392 239.6249,118.15625 C 239.6029,118.2811 239.5852,118.40651 239.5624,118.53125 C 239.39714,119.43903 239.2045,120.34852 238.9999,121.25 C 238.9693,121.38463 238.9376,121.52178 238.9062,121.65625 C 238.69845,122.54491 238.46486,123.43135 238.2187,124.3125 C 238.05479,124.89922 237.86842,125.47955 237.68745,126.0625 C 237.51204,126.62662 237.34761,127.18974 237.1562,127.75 C 236.86153,128.61381 236.55145,129.45882 236.2187,130.3125 C 236.1581,130.46799 236.09304,130.62612 236.0312,130.78125 C 235.9863,130.89371 235.9517,131.01273 235.9062,131.125 C 235.5501,132.00362 235.17807,132.8526 234.7812,133.71875 C 234.40422,134.54222 234.0076,135.34519 233.5937,136.15625 C 233.5132,136.31403 233.42563,136.46772 233.3437,136.625 C 232.92842,137.4224 232.51372,138.21595 232.06245,139 C 231.96725,139.16556 231.87805,139.33506 231.7812,139.5 C 231.58213,139.83885 231.36205,140.16384 231.1562,140.5 C 230.79455,141.09093 230.41383,141.66777 230.0312,142.25 C 230.0262,142.257 230.0362,142.2738 230.0312,142.2812 C 229.54039,143.02694 229.02527,143.76939 228.49995,144.49995 C 228.04268,145.13587 227.54591,145.75123 227.06245,146.37495 C 226.86549,146.62904 226.70126,146.90421 226.49995,147.1562 C 226.36593,147.32399 226.22965,147.48935 226.0937,147.6562 C 225.93019,147.85684 225.76,148.05071 225.5937,148.24995 C 225.03708,148.917 224.46291,149.5678 223.87495,150.2187 C 223.26864,150.88974 222.63964,151.56575 221.99995,152.2187 C 221.83899,152.38296 221.69428,152.55562 221.5312,152.7187 C 200.40085,173.84905 169.27251,177.21358 144.3437,163.87495 L 144.4687,163.68745 C 140.76453,161.79084 137.20703,159.54699 133.8437,156.9062 C 133.30478,156.48305 132.77833,156.03638 132.24995,155.5937 C 131.73554,155.16273 131.22265,154.7308 130.7187,154.2812 C 130.6258,154.1976 130.52998,154.1154 130.43745,154.0312 C 129.61572,153.28344 128.82556,152.51306 128.0312,151.7187 C 127.23684,150.92434 126.46647,150.13418 125.7187,149.31245 C 125.6345,149.21995 125.55231,149.12407 125.4687,149.0312 C 125.0191,148.52725 124.58717,148.01436 124.1562,147.49995 C 123.71352,146.97157 123.26685,146.44512 122.8437,145.9062 C 120.20291,142.54287 117.95906,138.98536 116.06245,135.2812 L 115.87495,135.4062 C 102.53632,110.47739 105.90085,79.349046 127.0312,58.2187 C 127.19428,58.05562 127.36694,57.910915 127.5312,57.74995 C 128.18415,57.110265 128.86016,56.481261 129.5312,55.87495 C 130.1821,55.286994 130.8329,54.712816 131.49995,54.1562 C 131.77209,53.929114 132.03772,53.690576 132.31245,53.4687 C 132.65592,53.191271 133.02754,52.956742 133.37495,52.68745 C 133.99867,52.203987 134.61403,51.707219 135.24995,51.24995 C 135.98748,50.719619 136.74695,50.21386 137.49995,49.7187 C 138.08218,49.336066 138.65902,48.955346 139.24995,48.5937 C 139.69662,48.32034 140.1423,48.042584 140.5937,47.7812 C 141.27515,47.386414 141.96454,47.023727 142.6562,46.6562 C 142.83226,46.56265 143.01076,46.46674 143.18745,46.37495 C 144.1327,45.883975 145.06888,45.40925 146.0312,44.9687 C 146.89735,44.571825 147.74633,44.1998 148.62495,43.8437 C 148.77776,43.78177 148.94054,43.74815 149.0937,43.68745 C 150.06209,43.303428 151.01838,42.928541 151.99995,42.5937 C 152.56021,42.402293 153.12333,42.237857 153.68745,42.06245 C 154.2704,41.881482 154.85073,41.695111 155.43745,41.5312 C 156.3186,41.285037 157.20504,41.051454 158.0937,40.8437 C 158.1648,40.82706 158.24127,40.82884 158.31245,40.81245 C 158.72838,40.71671 159.14509,40.618551 159.56245,40.5312 C 160.23458,40.390375 160.91827,40.244039 161.5937,40.12495 C 161.676,40.11046 161.76133,40.10786 161.8437,40.0937 C 162.79477,39.930149 163.76244,39.776798 164.7187,39.6562 C 166.68235,39.408555 168.64857,39.254564 170.62495,39.18745 C 171.67735,39.15181 172.72787,39.14082 173.7812,39.1562 L 173.78125,39.15625 z\" id=\"path5604-26-0\" transform=\"matrix(1,8.087767e-2,0,1,0,-21.056305)\" clip-path=\"url(#clipPath8750)\"/>   </g>   <g inkscape:groupmode=\"layer\" id=\"layer5\" inkscape:label=\"Magnifying Galss\" style=\"display:inline\">     <path style=\"fill:url(#linearGradient6241);fill-opacity:1;stroke:none\" d=\"M 48.010249,227.45683 L 43.202749,232.01466 C 38.19646,226.69951 32.962779,221.30836 28.123445,215.88155 L 32.613667,211.80898 C 39.442824,218.34324 41.486314,220.33887 48.010249,227.45683 z\" id=\"rect5757-8-7-7-9\" sodipodi:nodetypes=\"ccccc\"/>     <path style=\"fill:#d0e9f2;fill-opacity:0.47593581;stroke:none\" d=\"M -95.5,225 C -66.78119,225 -43.5,248.28119 -43.5,277 C -43.5,305.71881 -66.78119,329 -95.5,329 C -124.21881,329 -147.5,305.71881 -147.5,277 C -147.5,248.28119 -124.21881,225 -95.5,225 z\" id=\"path5604-9-1-8\" sodipodi:nodetypes=\"csssc\"/>     <g id=\"g6060\">       <path sodipodi:nodetypes=\"csssccsssc\" id=\"path5604\" d=\"M -82,136 C -109.61424,136 -132,113.61424 -132,86 C -132,58.38576 -109.61424,36 -82,36 C -54.38576,36 -32,58.38576 -32,86 C -32,113.61424 -54.38576,136 -82,136 z M -82,133 C -55.49033,133 -34,112.50967 -34,86 C -34,59.49033 -55.49033,39 -82,39 C -108.50967,39 -130,59.49033 -130,86 C -130,112.50967 -108.50967,133 -82,133 z\" style=\"fill:#2d3335;fill-opacity:1;stroke:none\"/>       <path id=\"path5604-2\" d=\"M -82.00007,136 C -109.61431,136 -132.00007,113.61424 -132.00007,86 C -132.00007,85.831721 -132.00207,85.667887 -132.00007,85.5 C -131.72953,112.88199 -109.44603,135 -82.00007,135 C -54.55411,135 -32.27061,112.88199 -32.00007,85.5 C -31.99807,85.667887 -32.00007,85.831721 -32.00007,86 C -32.00007,113.61424 -54.38583,136 -82.00007,136 z M -130.00007,85.5 C -130.00207,85.33281 -130.00007,85.167675 -130.00007,85 C -130.00007,58.49033 -108.50974,38 -82.00007,38 C -55.4904,38 -34.00007,58.49033 -34.00007,85 C -34.00007,85.167675 -33.99807,85.33281 -34.00007,85.5 C -34.26955,59.23424 -55.65808,39 -82.00007,39 C -108.34206,39 -129.73058,59.23424 -130.00007,85.5 z\" style=\"fill:#9eaaac;fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"csssc\" id=\"path5604-9\" d=\"M -82,134 C -55.49033,134 -34,112.50967 -34,86 C -34,59.49033 -55.49033,38 -82,38 C -108.50967,38 -130,59.49033 -130,86 C -130,112.50967 -108.50967,134 -82,134 z\" style=\"fill:#d0e9f2;fill-opacity:0.47593581;stroke:none\"/>       <path sodipodi:nodetypes=\"csssc\" id=\"path5604-9-1\" d=\"M -82,134 C -55.49033,134 -34,112.50966 -34,86 C -34,59.490325 -55.49033,38 -82,38 C -108.50967,38 -130,59.490325 -130,86 C -130,112.50966 -108.50967,134 -82,134 z\" style=\"fill:url(#radialGradient5751);fill-opacity:1;stroke:none\"/>       <path id=\"path5604-9-1-8-8\" d=\"M -96.4375,130.71875 L -97.28125,135.71875 C -92.45117,137.2009 -87.31584,138 -82,138 C -76.68416,138 -71.54883,137.2009 -66.71875,135.71875 L -67.5625,130.71875 C -72.11472,132.1879 -76.95892,133 -82,133 C -87.04108,133 -91.88528,132.1879 -96.4375,130.71875 L -96.4375,130.71875 z\" style=\"fill:url(#linearGradient5778);fill-opacity:1;stroke:none\"/>       <path id=\"rect5757\" d=\"M -82,136.25 C -80.24321,136.25 -78.5686,136.54816 -77,137.0625 L -77,163.6875 C -78.5686,164.20184 -80.24321,164.5 -82,164.5 C -83.75679,164.5 -85.4314,164.20184 -87,163.6875 L -87,137.0625 C -85.4314,136.54816 -83.75679,136.25 -82,136.25 z\" style=\"fill:url(#linearGradient5768);fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"cccsccc\" id=\"rect5757-8-7\" d=\"M -82,150.5 C -78.48642,150.5 -76.3872,151.15272 -74,152.93805 L -74,220.06195 C -77.1372,220.97228 -78.48642,221.5 -82,221.5 C -85.51358,221.5 -86.8628,220.97228 -90,220.06195 L -90,152.93805 C -87.3628,151.15272 -85.51358,150.5 -82,150.5 z\" style=\"fill:url(#linearGradient5868);fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"cccsccc\" id=\"rect5757-8\" d=\"M -82,154.5 C -78.48642,154.5 -74.7622,155.27772 -72,156.93805 L -72,222.06195 C -74.0122,223.84728 -78.48642,224.5 -82,224.5 C -85.51358,224.5 -89.8628,224.34728 -92,222.06195 L -92,156.93805 C -90.1128,155.27772 -85.51358,154.5 -82,154.5 z\" style=\"fill:url(#linearGradient5798);fill-opacity:1;stroke:none\"/>       <path sodipodi:nodetypes=\"cccsccc\" id=\"rect5757-8-7-7\" d=\"M -82,217.5 C -78.48642,217.5 -76.1372,218.27772 -74,219.93805 L -74,225.06195 C -76.3872,226.59728 -78.48642,227.5 -82,227.5 C -85.51358,227.5 -87.7378,226.59728 -90,225.06195 L -90,219.93805 C -87.6128,218.02772 -85.51358,217.5 -82,217.5 z\" style=\"fill:url(#linearGradient5899);fill-opacity:1;stroke:none\"/>       <path id=\"rect5757-8-7-7-0\" d=\"M -82,221.5 C -85.51358,221.5 -87.6128,221.77717 -90,223.9375 L -90,225.0625 C -87.7378,226.59783 -85.51358,227.5 -82,227.5 C -78.48642,227.5 -76.3872,226.59783 -74,225.0625 L -74,223.9375 C -76.5122,221.90217 -78.48642,221.5 -82,221.5 z\" style=\"fill:#e0bb41;fill-opacity:1;stroke:none\"/>     </g>     <path style=\"fill:#2d3335;fill-opacity:1;stroke:none\" d=\"M 125.06419,134.68586 C 97.884272,107.50594 97.884272,63.438594 125.06419,36.258677 C 152.24411,9.078759 196.31145,9.078759 223.49137,36.258677 C 250.67129,63.438594 250.67129,107.50594 223.49137,134.68586 C 196.31145,161.86577 152.24411,161.86577 125.06419,134.68586 z M 128.01701,131.73304 C 154.10973,157.82576 195.4301,158.81003 221.52283,132.71731 C 247.61555,106.62459 246.63127,65.304212 220.53855,39.211492 C 194.44583,13.118772 153.12545,12.1345 127.03273,38.22722 C 100.94001,64.319941 101.92428,105.64032 128.01701,131.73304 L 128.01701,131.73304 z\" id=\"path5604-26\" sodipodi:nodetypes=\"csssccsssc\"/>     <path style=\"fill:#9eaaac;fill-opacity:1;stroke:none\" d=\"M 125.06412,134.68579 C 97.884203,107.50587 97.884203,63.438525 125.06412,36.258608 C 125.22975,36.092975 125.38904,35.92975 125.55626,35.766472 C 98.871221,62.984077 99.034108,106.68723 126.04839,133.70151 C 153.06268,160.7158 196.76583,160.87869 223.98344,134.19365 C 223.82016,134.36087 223.65693,134.52015 223.4913,134.68579 C 196.31138,161.8657 152.24404,161.8657 125.06412,134.68579 z M 127.5248,37.735015 C 127.68739,37.568487 127.8519,37.407917 128.01694,37.24288 C 154.10966,11.150159 195.43004,12.134431 221.52276,38.227151 C 247.61548,64.319872 248.59975,105.64025 222.50703,131.73297 C 222.34199,131.89801 222.18142,132.06252 222.01489,132.22511 C 247.6023,106.10722 246.46616,65.139101 220.53848,39.211423 C 194.61081,13.283745 153.6427,12.14762 127.5248,37.735015 L 127.5248,37.735015 z\" id=\"path5604-2-9\"/>     <path style=\"fill:#d0e9f2;fill-opacity:0.47593581;stroke:none\" d=\"M 127.03273,132.71731 C 153.12545,158.81003 195.4301,158.81003 221.52283,132.71731 C 247.61555,106.62459 247.61555,64.319941 221.52283,38.22722 C 195.4301,12.1345 153.12545,12.1345 127.03273,38.22722 C 100.94001,64.319941 100.94001,106.62459 127.03273,132.71731 z\" id=\"path5604-9-13\" sodipodi:nodetypes=\"csssc\"/>     <path style=\"fill:url(#radialGradient6256);fill-opacity:1;stroke:none\" d=\"M 127.03273,132.71731 C 153.12545,158.81003 195.43011,158.81002 221.52283,132.71731 C 247.61555,106.62459 247.61555,64.319941 221.52283,38.22722 C 195.4301,12.1345 153.12546,12.134495 127.03273,38.22722 C 100.94002,64.319931 100.94001,106.62459 127.03273,132.71731 z\" id=\"path5604-9-1-3\" sodipodi:nodetypes=\"csssc\"/>     <path style=\"fill:url(#linearGradient6253);fill-opacity:1;stroke:none\" d=\"M 116.05195,115.27725 L 110.30011,119.36813 C 113.59539,125.58108 117.86341,131.42217 123.09565,136.6544 C 128.32788,141.88663 134.16897,146.15466 140.38192,149.44993 L 144.4728,143.69809 C 138.54613,140.66352 132.9788,136.69483 128.01701,131.73304 C 123.05521,126.77125 119.08653,121.20391 116.05195,115.27725 L 116.05195,115.27725 z\" id=\"path5604-9-1-8-8-1\"/>     <path style=\"fill:url(#linearGradient6250);fill-opacity:1;stroke:none\" d=\"M 124.81812,134.93192 C 126.54728,136.66108 127.90208,138.60282 128.93976,140.653 L 102.73352,166.85924 C 100.68334,165.82156 98.741603,164.46676 97.012444,162.7376 C 95.283285,161.00844 93.928484,159.0667 92.890806,157.01652 L 119.09704,130.81029 C 121.14722,131.84796 123.08896,133.20276 124.81812,134.93192 z\" id=\"rect5757-5\"/>     <path style=\"fill:url(#linearGradient6247);fill-opacity:1;stroke:none\" d=\"M 116.26672,159.23167 L 50.198558,225.29984 C 46.214689,223.10799 44.367269,222.29941 40.908952,218.84109 C 37.450634,215.38278 36.642055,213.53536 34.450209,209.55149 L 100.51837,143.48333 C 105.58172,147.23135 112.63531,153.88125 116.26672,159.23167 z\" id=\"rect5757-8-7-2\" sodipodi:nodetypes=\"ccsccc\"/>     <path style=\"fill:url(#linearGradient6244);fill-opacity:1;stroke:none\" d=\"M 105.77884,154.11797 C 109.23716,157.57629 113.21364,160.78433 114.29818,165.13731 L 50.198558,229.23692 C 43.682447,224.0819 35.643787,216.44629 30.513122,209.55149 L 94.61274,145.45187 C 98.104474,145.67517 102.27159,150.61074 105.72991,154.06905 L 105.77884,154.11797 z\" id=\"rect5757-8-6\" sodipodi:nodetypes=\"ccccccc\"/>     <path style=\"opacity:0.59565214;fill:url(#linearGradient6279);fill-opacity:1;stroke:none\" d=\"M 105.53422,154.36259 C 108.99254,157.82091 113.21364,160.78433 114.29818,165.13731 L 50.198558,229.23692 C 42.321633,222.32946 38.401371,218.6125 30.513122,209.55149 L 94.61274,145.45187 C 98.104474,145.67517 102.02698,150.90428 105.4853,154.36259 L 105.53422,154.36259 z\" id=\"rect5757-8-6-3\" sodipodi:nodetypes=\"ccccccc\"/>     <path style=\"opacity:0.6043478;fill:url(#linearGradient6595);fill-opacity:1;stroke:none\" d=\"M 131.1683,37.049946 C 171.82694,4.876587 209.3036,24.322024 208.95005,42.353247 C 208.5965,60.38447 152.38151,112.71037 132.58252,108.46773 C 112.78353,104.22509 107.12667,55.081169 131.1683,37.049946 z\" id=\"path6587\"/>     <text xml:space=\"preserve\" style=\"font-size:19.79973221px;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;opacity:0.46086958;fill:url(#radialGradient6482);fill-opacity:1;stroke:none;font-family:Sans;-inkscape-font-specification:Sans\" x=\"99.83886\" y=\"69.184349\" id=\"text6302-7\" transform=\"matrix(0.9879609,-0.1547039,0.1547039,0.9879609,0,0)\"><tspan sodipodi:role=\"line\" id=\"tspan6304-0\" x=\"99.83886\" y=\"69.184349\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6482);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\">01011001</tspan><tspan sodipodi:role=\"line\" x=\"99.83886\" y=\"93.934013\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6482);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\" id=\"tspan6415-7\">00110101</tspan><tspan sodipodi:role=\"line\" x=\"99.83886\" y=\"118.68368\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6482);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\" id=\"tspan6417-1\">10010011</tspan><tspan sodipodi:role=\"line\" x=\"99.83886\" y=\"143.43335\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6482);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\" id=\"tspan6419-9\"/></text>     <text xml:space=\"preserve\" style=\"font-size:19.79973221px;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;fill:url(#radialGradient6427);fill-opacity:1;stroke:none;font-family:Sans;-inkscape-font-specification:Sans\" x=\"99.410172\" y=\"67.898323\" id=\"text6302\" transform=\"matrix(0.9879609,-0.1547039,0.1547039,0.9879609,0,0)\"><tspan sodipodi:role=\"line\" id=\"tspan6304\" x=\"99.410172\" y=\"67.898323\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6427);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\">01011001</tspan><tspan sodipodi:role=\"line\" x=\"99.410172\" y=\"92.647987\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6427);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\" id=\"tspan6415\">00110101</tspan><tspan sodipodi:role=\"line\" x=\"99.410172\" y=\"117.39765\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6427);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\" id=\"tspan6417\">10010011</tspan><tspan sodipodi:role=\"line\" x=\"99.410172\" y=\"142.14732\" style=\"font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;fill:url(#radialGradient6427);fill-opacity:1;font-family:Monospace;-inkscape-font-specification:Monospace Bold\" id=\"tspan6419\"/></text>     <path style=\"opacity:0.76521738;fill:url(#linearGradient6614);fill-opacity:1;stroke:none\" d=\"M 219.46318,129.09019 C 192.66917,151.07299 177.65484,150.09749 181.38844,142.22816 C 185.12205,134.35887 223.71429,100.57298 232.83561,98.47996 C 241.95691,96.38695 235.11079,116.52117 219.46318,129.09019 z\" id=\"path6587-7\"/>   </g> </svg>";
  Svg.osm_logo_img = Img_1.Img.AsImageElement(Svg.osm_logo);
  Svg.pencil = "<svg height=\"1024\" width=\"896\" viewBox=\"0 0 896 1024\" xmlns=\"http://www.w3.org/2000/svg\">   <path d=\"M704 64L576 192l192 192 128-128L704 64zM0 768l0.688 192.562L192 960l512-512L512 256 0 768zM192 896H64V768h64v64h64V896z\"/> </svg>";
  Svg.pencil_img = Img_1.Img.AsImageElement(Svg.pencil);
  Svg.phone = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    viewBox=\"0 -256 1792 1792\"    id=\"svg3013\"    version=\"1.1\"    inkscape:version=\"0.48.3.1 r9886\"    width=\"100%\"    height=\"100%\"    sodipodi:docname=\"phone_font_awesome.svg\">   <metadata      id=\"metadata3023\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs3021\" />   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"640\"      inkscape:window-height=\"480\"      id=\"namedview3019\"      showgrid=\"false\"      inkscape:zoom=\"0.13169643\"      inkscape:cx=\"896\"      inkscape:cy=\"896\"      inkscape:window-x=\"0\"      inkscape:window-y=\"25\"      inkscape:window-maximized=\"0\"      inkscape:current-layer=\"svg3013\" />   <g      transform=\"matrix(1,0,0,-1,159.45763,1293.0169)\"      id=\"g3015\">     <path        d=\"m 1408,296 q 0,-27 -10,-70.5 Q 1388,182 1377,157 1356,107 1255,51 1161,0 1069,0 1042,0 1016.5,3.5 991,7 959,16 927,25 911.5,30.5 896,36 856,51 816,66 807,69 709,104 632,152 504,231 367.5,367.5 231,504 152,632 104,709 69,807 66,816 51,856 36,896 30.5,911.5 25,927 16,959 7,991 3.5,1016.5 0,1042 0,1069 q 0,92 51,186 56,101 106,122 25,11 68.5,21 43.5,10 70.5,10 14,0 21,-3 18,-6 53,-76 11,-19 30,-54 19,-35 35,-63.5 16,-28.5 31,-53.5 3,-4 17.5,-25 14.5,-21 21.5,-35.5 7,-14.5 7,-28.5 0,-20 -28.5,-50 -28.5,-30 -62,-55 -33.5,-25 -62,-53 -28.5,-28 -28.5,-46 0,-9 5,-22.5 5,-13.5 8.5,-20.5 3.5,-7 14,-24 10.5,-17 11.5,-19 76,-137 174,-235 98,-98 235,-174 2,-1 19,-11.5 17,-10.5 24,-14 7,-3.5 20.5,-8.5 13.5,-5 22.5,-5 18,0 46,28.5 28,28.5 53,62 25,33.5 55,62 30,28.5 50,28.5 14,0 28.5,-7 14.5,-7 35.5,-21.5 21,-14.5 25,-17.5 25,-15 53.5,-31 28.5,-16 63.5,-35 35,-19 54,-30 70,-35 76,-53 3,-7 3,-21 z\"        id=\"path3017\"        inkscape:connector-curvature=\"0\"        style=\"fill:currentColor\" />   </g> </svg> ";
  Svg.phone_img = Img_1.Img.AsImageElement(Svg.phone);
  Svg.pop_out = " <!-- Svg Vector Icons : http://www.onlinewebfonts.com/icon --> <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 1000 1000\" enable-background=\"new 0 0 1000 1000\" xml:space=\"preserve\"> <metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata> <g><g><path d=\"M485,379.5l130.6,130.6l245.8-245.8l126.9,126.9l0.2-379L607.1,10l123.8,123.7L485,379.5L485,379.5z M986.4,546.3l-94.1-95.4l1.7,441.3l-784.7,0.4l0.8-782.7l438.9-2l-98-98H108C53.9,10,10,54,10,108v784c0,54.1,43.9,98,98,98h784c54.1,0,98-43.9,98-98L986.4,546.3z\"/></g></g> </svg>";
  Svg.pop_out_img = Img_1.Img.AsImageElement(Svg.pop_out);
  Svg.reload = " <!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --> <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> <svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" 	 width=\"487.23px\" height=\"487.23px\" viewBox=\"0 0 487.23 487.23\" style=\"enable-background:new 0 0 487.23 487.23;\" 	 xml:space=\"preserve\"> <g> 	<g> 		<path d=\"M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61 			c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512 			c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205 			c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332 			c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06 			c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z\"/> 		<path d=\"M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854 			c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369 			c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089 			c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943 			c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805 			c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059 			C473.197,326.043,471.903,312.157,464.635,301.184z\"/> 	</g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg> ";
  Svg.reload_img = Img_1.Img.AsImageElement(Svg.reload);
  Svg.search = " <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 12 12\"> <g id=\"search\"> <path id=\"magnifying-glass\" d=\"M1.63 9.474L4.006 7.1l.17-.1a3.45 3.45 0 0 1-.644-2.01A3.478 3.478 0 1 1 7.01 8.47 3.43 3.43 0 0 1 5 7.822l-.098.17-2.375 2.373c-.19.188-.543.142-.79-.105s-.293-.6-.104-.79zm5.378-2.27A2.21 2.21 0 1 0 4.8 4.994 2.21 2.21 0 0 0 7.01 7.21z\"/> </g> </svg>";
  Svg.search_img = Img_1.Img.AsImageElement(Svg.search);
  Svg.send_email = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"    xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"    id=\"svg4\"    version=\"1.1\"    viewBox=\"0 0 114 114\"    height=\"114\"    width=\"114\"    sodipodi:docname=\"send_email.svg\"    inkscape:version=\"0.92.4 (5da689c313, 2019-01-14)\">   <sodipodi:namedview      pagecolor=\"#ffffff\"      bordercolor=\"#666666\"      borderopacity=\"1\"      objecttolerance=\"10\"      gridtolerance=\"10\"      guidetolerance=\"10\"      inkscape:pageopacity=\"0\"      inkscape:pageshadow=\"2\"      inkscape:window-width=\"1920\"      inkscape:window-height=\"1043\"      id=\"namedview10\"      showgrid=\"false\"      inkscape:zoom=\"8.2807017\"      inkscape:cx=\"88.036216\"      inkscape:cy=\"65.244666\"      inkscape:window-x=\"0\"      inkscape:window-y=\"0\"      inkscape:window-maximized=\"1\"      inkscape:current-layer=\"svg4\" />   <metadata      id=\"metadata10\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title />       </cc:Work>     </rdf:RDF>   </metadata>   <defs      id=\"defs8\" />   <path      id=\"path817\"      d=\"M 3.8621242,4.4070108 30.859027,32.600653 c 0,0 10.017786,11.850409 21.207654,0 C 68.137354,15.581325 79.709909,3.9950038 79.709909,3.9950038\"      style=\"fill: none !important;stroke:#000000;stroke-width:6.67276907;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"      inkscape:connector-curvature=\"0\" />   <path      id=\"path823\"      d=\"M 3.5728144,4.2106267 79.709909,3.9950038 79.830672,61.118664\"      style=\"fill: none !important;stroke:#000000;stroke-width:6.57718801;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"      inkscape:connector-curvature=\"0\"      sodipodi:nodetypes=\"ccc\" />   <path      id=\"path823-3\"      d=\"M 80.022174,61.299435 3.5728144,61.696575 V 4.2106267\"      style=\"fill: none !important;stroke:#000000;stroke-width:6.57718801;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"      inkscape:connector-curvature=\"0\" />   <path      d=\"M 56.292497,77.917252 V 95.007654 H 88.45805 v 16.606216 l 24.81119,-24.785005 -24.81119,-25.099078 0.0066,16.194007 z\"      id=\"path4\"      inkscape:connector-curvature=\"0\"      sodipodi:nodetypes=\"cccccccc\"      style=\"stroke-width:0.09253246\" />   <g      inkscape:groupmode=\"layer\"      id=\"layer1\"      inkscape:label=\"bg\"      style=\"display:none\">     <circle        style=\"fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\"        id=\"path828\"        cx=\"86.758408\"        cy=\"87.016083\"        r=\"35.352345\" />   </g>   <g      inkscape:groupmode=\"layer\"      id=\"layer2\"      inkscape:label=\"fg\" /> </svg> ";
  Svg.send_email_img = Img_1.Img.AsImageElement(Svg.send_email);
  Svg.share = " <svg    xmlns:dc=\"http://purl.org/dc/elements/1.1/\"    xmlns:cc=\"http://creativecommons.org/ns#\"    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"    xmlns:svg=\"http://www.w3.org/2000/svg\"    xmlns=\"http://www.w3.org/2000/svg\"    id=\"svg8\"    version=\"1.1\"    viewBox=\"0 0 20.06869 19.489862\"    height=\"73.662468\"    width=\"75.850166\">   <defs      id=\"defs2\" />   <metadata      id=\"metadata5\">     <rdf:RDF>       <cc:Work          rdf:about=\"\">         <dc:format>image/svg+xml</dc:format>         <dc:type            rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />         <dc:title></dc:title>       </cc:Work>     </rdf:RDF>   </metadata>   <g      transform=\"translate(-3.3314588,-273.65084)\"      id=\"layer1\">     <path        id=\"path819\"        d=\"m 19.212364,278.17517 -11.9689358,5.52059 11.9388628,5.50669\"        style=\"fill:none !important;stroke-width:2.43863511;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;stroke:#000000\" />     <circle        r=\"3.9119694\"        cy=\"283.69574\"        cx=\"7.2434282\"        id=\"path820\"        style=\"fill-opacity:1;stroke:none;stroke-width:0.53329796;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\" />     <circle        r=\"3.9119689\"        cy=\"289.22873\"        cx=\"19.48818\"        id=\"path820-3\"        style=\"fill-opacity:1;stroke:none;stroke-width:0.53329796;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:0.97014926\" />     <circle        r=\"3.9119689\"        cy=\"277.56281\"        cx=\"19.48818\"        id=\"path820-3-6\"        style=\"fill-opacity:1;stroke:none;stroke-width:0.53329796;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\" />   </g> </svg> ";
  Svg.share_img = Img_1.Img.AsImageElement(Svg.share);
  Svg.star = " <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 20010904//EN\" \"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd\"> <svg version=\"1.0\" xmlns=\"http://www.w3.org/2000/svg\" width=\"1278.000000pt\" height=\"1280.000000pt\" viewBox=\"0 0 1278.000000 1280.000000\" preserveAspectRatio=\"xMidYMid meet\"> <metadata> Created by potrace 1.15, written by Peter Selinger 2001-2017 </metadata> <g transform=\"translate(0.000000,1280.000000) scale(0.100000,-0.100000)\" fill=\"#000000\" stroke=\"none\"> <path d=\"M6760 12443 c-137 -26 -302 -163 -453 -375 -207 -293 -384 -645 -802 -1598 -347 -790 -486 -1070 -667 -1337 -211 -311 -357 -373 -878 -374 -303 0 -573 22 -1315 106 -310 36 -666 73 -930 97 -191 17 -792 17 -905 0 -359 -56 -525 -174 -538 -382 -7 -128 43 -265 161 -442 197 -294 514 -612 1317 -1323 955 -845 1247 -1174 1290 -1452 37 -234 -95 -656 -453 -1458 -364 -816 -430 -963 -490 -1110 -252 -611 -352 -998 -318 -1236 31 -222 145 -333 357 -346 311 -21 768 169 1699 704 749 431 885 508 1051 596 451 240 718 338 924 341 121 1 161 -10 310 -84 265 -133 574 -380 1300 -1040 1006 -916 1405 -1206 1752 -1276 102 -21 173 -13 255 27 103 50 160 135 204 304 21 81 23 111 23 315 0 125 -5 267 -12 320 -51 379 -107 674 -253 1335 -229 1034 -279 1327 -279 1647 0 162 16 260 55 346 101 221 462 490 1275 952 661 375 831 473 1005 578 739 446 1065 761 1065 1027 0 155 -96 273 -306 378 -300 150 -748 236 -1764 342 -1052 108 -1334 148 -1637 225 -387 100 -514 201 -648 515 -117 276 -211 629 -391 1482 -135 644 -212 973 -289 1237 -115 398 -240 668 -380 824 -94 105 -221 156 -335 135z\"/> </g> </svg>";
  Svg.star_img = Img_1.Img.AsImageElement(Svg.star);
  Svg.statistics = " <!-- Svg Vector Icons : http://www.onlinewebfonts.com/icon --> <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 1000 1000\" enable-background=\"new 0 0 1000 1000\" xml:space=\"preserve\"> <metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata> <g><path d=\"M255,567.4v312.4h147V567.4l-73.5-61.3L255,567.4L255,567.4z M10,879.8h147V640.9L10,757.3V879.8L10,879.8z M745,493.9v385.9h147V371.4L745,493.9L745,493.9z M500,647v232.8h147V573.5l-116.4,98L500,647L500,647z M990,120.3H708.3l116.4,110.2l-300.1,245l-196-165.4L10,561.3v110.2l318.5-251.1l202.1,165.4l361.4-294l98,91.9L990,120.3L990,120.3z\"/></g> </svg>";
  Svg.statistics_img = Img_1.Img.AsImageElement(Svg.statistics);
  Svg.up = " <svg xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.0\" width=\"700\" height=\"700\">  <g transform=\"translate(19.99999,28.57142)\"> <path d=\"M -20,670.71582 C -20,668.85739 329.99229,-29.27271 330.57213,-28.57089 C 332.51762,-26.21611 680.63965,670.88998 679.99913,671.14838 C 679.58076,671.31716 600.70188,637.45746 504.71273,595.90461 L 330.18699,520.35396 L 155.94489,595.89128 C 60.11172,637.43679 -18.680347,671.42858 -19.148608,671.42858 C -19.616868,671.42858 -19.99999,671.10783 -19.99999,670.71582 z \" style=\"fill:#00ff00;stroke:none\" /> </g>  </svg> ";
  Svg.up_img = Img_1.Img.AsImageElement(Svg.up);
  Svg.wikimedia_commons_white = " <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" width=\"1024\" height=\"1376\" viewBox=\"-305 -516 610 820\"> <title>Wikimedia Commons Logo</title> <defs> 	<clipPath id=\"c\"><circle r=\"298\"/></clipPath> </defs> <circle r=\"100\" fill=\"#fff\"/> <g fill=\"#fff\"> 	<g id=\"arrow\" clip-path=\"url(#c)\"> 		<path d=\"m-11 180v118h22v-118\"/> 		<path d=\"m-43 185l43-75 43 75\"/> 	</g> 	<g id=\"arrows3\"> 		<use xlink:href=\"#arrow\" transform=\"rotate(45)\"/> 		<use xlink:href=\"#arrow\" transform=\"rotate(90)\"/> 		<use xlink:href=\"#arrow\" transform=\"rotate(135)\"/> 	</g> 	<use xlink:href=\"#arrows3\" transform=\"scale(-1 1)\"/> 	<path id=\"blue_path\" transform=\"rotate(-45)\" stroke=\"#fff\" stroke-width=\"84\" fill=\"none\" d=\"M 0,-256 A 256 256 0 1 0 256,0 C 256,-100 155,-150 250,-275\"/> 	<path id=\"arrow_top\" d=\"m-23-515s-36 135-80 185 116-62 170-5-90-180-90-180z\"/> </g> </svg> ";
  Svg.wikimedia_commons_white_img = Img_1.Img.AsImageElement(Svg.wikimedia_commons_white);
  Svg.wikipedia = " <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" width=\"103px\" height=\"94px\" viewBox=\"0 0 103 94\"><title>Wikipedia logo version 2</title><radialGradient id=\"SVGID_1_\" cx=\"244.5713\" cy=\"-427.1392\" r=\"68.6868\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".4835\" stop-color=\"#EAEAEB\"/><stop offset=\".9451\" stop-color=\"#A9ABAE\"/><stop offset=\"1\" stop-color=\"#999B9E\"/></radialGradient><path style=\"fill:url(#SVGID_1_);\" d=\"M49.85,17.003c0.014-0.606-0.392-1.27-0.392-1.27l-0.025-0.058c0,0-0.487-0.949-1.301-1.228c-0.815-0.278-1.478,0.342-1.478,0.342s-0.114,0.131-0.428,0.494c-0.313,0.364-0.507,0.666-1.198,0.938c-0.692,0.271-1.379,0.204-1.743,0.033c-0.365-0.172-0.457-0.537-0.457-0.537s-0.229-0.722-0.313-1.049c-0.086-0.331-0.308-1.694-0.308-1.694s-0.492-2.747-0.535-3.304c0,0,1.475-0.126,3.686-0.775c2.3-0.673,3.043-1.206,3.043-1.206s-0.432-0.156-0.484-0.662c-0.051-0.507-0.089-1.19-0.089-1.19s-0.089-0.5,0.483-1.139c0.572-0.64,1.354-0.863,1.763-0.953c0.41-0.089,1.281-0.17,2.092-0.134c0.813,0.038,1.266,0.112,1.594,0.291c0.327,0.178,0.356,0.61,0.356,0.61l-0.009,1.146c0,0-0.035,0.402,0.262,0.529c0,0,0.505,0.305,2.197,0.133c0,0,0.719-0.126,1.845-0.46c1.125-0.335,4.129-1.229,4.554-1.341c0.426-0.111,0.953-0.291,1.645-0.469c0.693-0.179,2.041-0.626,2.309-0.73c0.27-0.104,1.811-0.618,2.928-0.81c1.114-0.195,2.226-0.186,2.813,0.149c0,0,0.357,0.304,0.521,0.662c0.162,0.358,0.476,0.863,0.92,1.088c0.457,0.227,0.754,0.371,1.877,0.273c0,0,0.021-0.096-0.396-0.37c-0.417-0.277-0.991-0.701-0.991-0.701s-0.334-0.245-0.408-0.447c-0.072-0.202-0.043-0.306-0.043-0.306l0.877-1.406c0,0,0-0.172,0.506-0.238c0.506-0.067,1.074-0.134,1.742-0.313c0.67-0.178,0.789-0.312,0.789-0.312l0.578,0.178c0,0,3.547,2.853,4.655,3.583l0.198-0.239c0,0,0.437,0.018,0.828,0.172c0.393,0.154,0.979,0.562,0.979,0.562s1.613,1.31,2.072,2.2l0.222,0.679l-0.102,0.161c0,0,0.919,1.307,2.096,2.602c0,0,1.229,1.664,1.689,2.09c0,0-0.108-0.399-0.203-0.849l0.339-0.226l0.2-0.144l0.617,0.259c3.575,4.811,6.435,10.424,8.144,16.328l-0.121,0.484l0.396,0.501c1.129,4.212,1.729,8.643,1.729,13.211c0,1.122-0.038,2.236-0.109,3.339l-0.304,0.511l0.226,0.555C99.95,72.645,78.057,93.131,51.38,93.131c-18.502,0-34.702-9.854-43.637-24.601l-0.102-0.365l-0.205-0.151c-3.387-5.742-5.682-12.205-6.595-19.104l0.212-0.524l-0.336-0.482c-0.213-1.892-0.322-3.812-0.322-5.758c0-2.985,0.255-5.909,0.748-8.755l0.25-0.562l-0.087-0.328C2.463,26.451,4.689,20.783,7.78,15.7l0.684-0.384l0.081,0.032c0,0,0.233-0.169,0.354-0.217l0.076-0.023c0,0,1.179-1.971,1.625-2.601c0,0,0.542-0.348,0.745-0.407c0,0,0.124-0.016,0.189,0.076c0,0,0.496-0.432,1.699-2.054c0.004-0.005,0.007-0.011,0.012-0.017c0,0-0.114-0.076-0.131-0.174c-0.018-0.097,0.108-0.591,0.173-0.717s0.108-0.156,0.108-0.156s1.722-2.032,3.151-3.238c0,0,0.26-0.202,0.678-0.25c0,0,1.472-0.613,3.264-2.184c0,0,0.051-0.289,0.478-0.858c0.428-0.57,1.456-1.163,2.222-1.337c0.764-0.174,0.896-0.038,0.896-0.038l0.064,0.065l0.515,0.766c0,0,0.565-0.316,1.413-0.604c0.847-0.289,0.979-0.262,0.979-0.262l0.823,1.336l-0.987,2c0,0-0.644,1.421-1.655,2.185c0,0-0.472,0.284-1.12,0.127c-0.648-0.157-1.072,0.333-1.072,0.333l-0.17,0.14c0,0,0.14-0.024,0.346-0.103c0,0,0.158,0.065,0.274,0.223c0.114,0.158,0.913,1.175,0.913,1.175s0.005,0.837-0.415,1.938c-0.419,1.1-1.467,2.891-1.467,2.891s-0.733,1.424-1.075,2.253c-0.342,0.829-0.515,1.765-0.488,2.262c0,0,0.187,0.062,0.707-0.202c0.655-0.332,1.083,0.027,1.083,0.027s0.719,0.53,1.041,0.881c0.262,0.289,0.802,1.765,0.209,3.224c0,0-0.402,1.008-1.377,1.724c0,0-0.216,0.332-1.529,0.174c-0.368-0.043-0.585-0.276-1.372-0.2c-0.785,0.077-1.231,0.815-1.231,0.815l0.013-0.024c-0.692,0.999-1.154,2.458-1.154,2.458l-0.057,0.165c0,0-0.241,0.509-0.292,1.752c-0.053,1.284,0.284,3.109,0.284,3.109s7.876-1.387,9.88-0.055l0.58,0.532c0,0,0.046,0.174-0.031,0.376c-0.08,0.204-0.375,0.673-0.987,1.113c-0.611,0.438-1.222,1.583-0.313,2.304c1.034,0.818,1.691,0.766,3.43,0.468c1.74-0.297,2.898-1.269,2.898-1.269s0.972-0.72,0.783-1.628c-0.188-0.908-1.017-1.189-1.017-1.189s-0.658-0.423-0.141-1.238c0,0,0.141-0.689,2.553-1.316c2.414-0.626,6.812-1.52,10.557-1.989c0,0-2.539-8.223-0.738-9.289c0,0,0.438-0.296,1.224-0.408l0.72-0.037c0.131-0.027,0.343,0.005,0.796,0.045c0.453,0.038,1.001,0.076,1.678-0.441c0.676-0.519,0.697-0.819,0.697-0.819\"/><radialGradient id=\"SVGID_2_\" cx=\"197.6416\" cy=\"-371.8613\" r=\"0\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".4835\" stop-color=\"#EAEAEB\"/><stop offset=\".9451\" stop-color=\"#A9ABAE\"/><stop offset=\"1\" stop-color=\"#999B9E\"/></radialGradient><path style=\"fill:url(#SVGID_2_);\" d=\"M-16.122-14.641\"/><linearGradient id=\"SVGID_3_\" gradientUnits=\"userSpaceOnUse\" x1=\"456.2744\" y1=\"510.1602\" x2=\"502.7757\" y2=\"582.9122\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#8A8A8A\"/><stop offset=\".5687\" stop-color=\"#606060\"/><stop offset=\".5914\" stop-color=\"#FFF\"/><stop offset=\".6116\" stop-color=\"#585858\"/><stop offset=\"1\" stop-color=\"#303030\"/></linearGradient><path style=\"opacity:.69;fill:url(#SVGID_3_);\" d=\"M82.447,79.307l0.451,0.168c-0.032,0.061-0.067,0.119-0.101,0.179c-0.864,1.573-0.936,1.927-1.36,2.253c-0.424,0.326-0.58,0.539-1.443,0.695c-0.865,0.156-1.771,1.175-1.771,1.175s-0.875,0.835-0.48,0.866c0.396,0.025,1.177-0.609,1.177-0.609s0.497-0.354,0.625-0.255c0.125,0.099-0.539,0.751-0.539,0.751s-1.161,1.176-2.479,1.982l-0.396,0.213c0,0,1.869-1.392,2.764-2.395c0,0,0.185-0.271-0.185,0.057c-0.369,0.325-1.332,0.821-1.741,0.821c-0.41,0,0.016-0.563,0.016-0.563s0.596-0.768,1.812-1.758c1.22-0.994,2.239-0.922,2.239-0.922s0.227,0.043,0.253-0.271c0.028-0.313,0.312-0.863,0.312-0.863s0.453-1.032,1.674-2.749c1.218-1.714,1.77-2.195,1.77-2.195s1.588-1.629,2.423-3.259c0,0,0.581-1.006-0.364-0.255c-0.951,0.753-2.211,1.7-3.44,2.014c-1.233,0.312-1.349-0.836-1.349-0.836s-0.271-1.884,1.049-3.344c1.188-1.316,2.492-1.273,3.684-1.415c1.188-0.144,2.21-1.571,2.21-1.571s0.82-0.922,1.289-3.797c0.218-1.337,0.067-2.244-0.144-2.818l0.021-0.647l-0.368-0.021c-0.078-0.106-0.135-0.153-0.135-0.153s-0.297-0.299-0.607-0.524c-0.313-0.227-0.692-0.649-1.063-1.457c0,0-1.019-2.11-0.792-5.156c0.227-3.047,2.762-2.762,2.762-2.762s1.475,0.143,1.76-0.298c0.283-0.438,0.553-0.993,0.649-2.223c0.101-1.233-0.396-2.408-0.396-2.408s-0.186-0.609-1.049-0.708c-0.863-0.1-1.051,0.169-1.051,0.169s-0.255,0.072-0.723,1.09c-0.471,1.021-0.75,1.488-1.602,1.702c-0.849,0.211-2.023,0.099-2.549-0.992c-0.515-1.072-1.757-3.693-2.351-5.772l0.084-0.735l-0.325-0.471c-0.063-0.396-0.117-0.846-0.13-1.236c-0.026-0.992-0.312-2.097-0.638-3.2c-0.326-1.106-1.459-2.972-1.672-3.399c-0.324-0.667-0.621-0.949-1.021-0.893c-0.396,0.056-0.339,0.056-0.513,0.056c-0.168,0-0.266,0.212-0.311,0.425c-0.042,0.212-0.375,1.315-1.104,1.812c-0.752,0.51-1.147,0.737-2.438,0.85c0,0-1.487,0.099-2.661-2.097C71,29.36,71.301,27.96,71.398,27.45c0.099-0.51,0.539-1.247,1.229-1.388c0.693-0.141,1.119-0.184,1.119-0.184s1.122-0.01,1.603-0.071c0.551-0.071,0.283-1.006,0.283-1.006s-0.361-2.371-2.348-4.318l-0.096-0.487l-0.756-0.381c-1.881-2.04-4.354-5.354-4.354-5.354s-1.105-1.048-0.17-2.493c0,0,0.438-0.963,1.742-0.792c0.419,0.081,0.457,0.123,0.818,0.199c0.481,0.099,1.008,0.225,1.478-0.398c0,0,0.438-0.792-0.271-1.812s-0.923-1.742-1.785-1.687c0,0-0.397-0.055-0.793,0.384C68.702,8.1,67.682,8.378,67.086,8.44c-0.679,0.071-2.252-0.528-3.156-2.082c-0.513-0.874-0.752-1.35-0.865-1.595l0.231-0.34l0.72,0.08c0.186,0.358,0.549,1.056,0.978,1.812c0.552,0.978,1.048,1.118,1.373,1.261c0.325,0.141,1.049-0.071,1.431-0.283c0.385-0.213,0.766-0.695,1.43-0.738c0.668-0.043,1.629,0.071,2.311,0.793c0.682,0.723,1.531,2.224,1.459,2.932c-0.068,0.708-0.111,1.403-1.035,1.699c-0.921,0.298-1.303,0.043-1.884-0.084c-0.581-0.128-0.864-0.072-1.104,0.211c-0.242,0.284-0.512,0.892-0.412,1.162c0.102,0.27,0.186,0.454,0.75,1.262c0.566,0.806,3.474,4.25,4.031,4.766l-0.152,0.698l0.968,0.176c0.625,0.724,1.358,1.668,1.687,2.263c0.493,0.907,0.752,2.337,0.779,3.002c0.025,0.666-0.299,0.963-0.299,0.963s-0.313,0.524-2.012,0.524c-1.517,0-1.614,0.297-1.614,0.297s-0.47,0.467-0.369,1.615c0.103,1.146,0.616,2.344,1.56,3.37c0.778,0.851,2.252-0.006,2.748-0.295c0.51-0.299,0.822-1.264,0.822-1.264s0.102-1.217,1.432-1.217c1.377,0,1.969,1.318,1.969,1.318s0.963,1.295,1.941,4.121c0.481,1.389,0.566,2.281,0.566,2.281l0.126,1.668l-0.513,0.892l0.732,0.312c0.135,0.541,0.348,1.24,0.686,2.044c0,0,1.008,2.381,1.443,3.286c0.44,0.906,0.896,0.766,1.264,0.808c0,0,0.85,0.113,1.16-0.282c0.313-0.398,0.61-1.092,0.61-1.092s0.663-1.812,2.138-1.657c1.475,0.156,1.84,1.092,2.096,2.168c0.256,1.074,0.313,3.229-0.479,4.545c-0.798,1.318-1.688,1.135-1.688,1.135s-1.813-0.17-2.225,0.213c-0.41,0.382-0.623,0.724-0.681,1.613c-0.058,0.894,0.026,2.336,0.751,4.08c0.631,1.523,1.146,1.361,1.432,1.728c0.284,0.368,1.188,1.204,1.104,3.272c-0.082,2.067-0.791,4.149-1.586,5.439c-0.793,1.288-1.997,2.053-1.997,2.053s-0.338,0.211-1.076,0.311c-0.735,0.102-1.784,0.086-2.534,0.513c-0.75,0.426-0.992,1.501-1.063,1.971c-0.069,0.468-0.112,1.529,0.921,1.413c1.034-0.109,2.577-1.4,2.577-1.4s1.486-1.104,1.685-0.752c0.199,0.354-0.636,1.784-0.636,1.784s-1.035,1.562-1.898,2.523c-0.709,0.791-1.641,1.868-2.431,3.102L82.447,79.307L82.447,79.307z\"/><linearGradient id=\"SVGID_4_\" gradientUnits=\"userSpaceOnUse\" x1=\"425.2861\" y1=\"502.9512\" x2=\"445.7861\" y2=\"598.6606\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#A8A9AB\"/><stop offset=\"1\" stop-color=\"#636668\"/></linearGradient><path style=\"fill:url(#SVGID_4_);\" d=\"M23.441,22.732c-0.007,0.008-0.013,0.018-0.021,0.025C23.428,22.75,23.434,22.74,23.441,22.732z\"/><linearGradient id=\"SVGID_5_\" gradientUnits=\"userSpaceOnUse\" x1=\"421.0684\" y1=\"504.3701\" x2=\"441.068\" y2=\"597.7433\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#A8A9AB\"/><stop offset=\"1\" stop-color=\"#636668\"/></linearGradient><path style=\"opacity:.45;fill:url(#SVGID_5_);\" d=\"M38.188,89.707l0.163,0.01c-0.163-0.147-0.37-0.281-0.62-0.414c-0.699-0.371-3.731-2.375-4.669-3.009c-0.936-0.633-2.575-1.7-3.297-1.478c-0.554,0.172-0.475,0.394-0.804,0.556c-0.331,0.157-0.687,0.052-1.504-0.384c-0.818-0.434-1.424-0.725-3.02-2.239c-1.245-1.185,1.595-0.118,1.595-0.118s0.619,0.262,0.343-0.385c-0.277-0.646-1.676-2.333-2.994-3.691c-1.068-1.098-1.674-1.86-2.435-2.97l-0.566-0.661l0.007-0.166c-0.018-0.024-0.035-0.054-0.052-0.078c0,0-1.874-3.377-1.676-4.617c0,0,0.068-0.828,1.241-1.188c0.817-0.251,0.71,0.542,3.112,0.975c0,0,2.07,0.559,2.611-0.945c0.539-1.505-0.567-3.393-0.567-3.393s-1.449-2.656-3.244-2.758c-0.95-0.053-0.692,0.586-2.125,0.926c0,0-1.913,0.184-2.519-0.963c-0.734-1.389-1.04-2.969-1.015-4.022c0.022-1,0.054-1.079,0.119-1.371c0.045-0.206,0.192-0.582,0.254-1.128l-0.134-0.667l0.204-0.501c0.002-0.26-0.004-0.535-0.021-0.83c-0.091-1.66-0.213-4.221-0.437-5.71c-0.223-1.491-0.633-3.798-1.991-3.866c0,0-0.671-0.051-1.634,0.885c-0.884,0.856-1.684-0.708-1.728-1.663c-0.053-1.121,0.131-2.254,0.409-2.795c0.277-0.541,1.042-0.567,1.186-0.555c0.146,0.013,0.555,0.171,1.043,0.474c0.488,0.305,1.16,0.305,1.557-0.092c0.395-0.394,0.947-0.856,1.173-2.598c0.224-1.741,0.224-3.547,0.013-5.71l-0.225-0.484l1.339-0.289c-0.001-0.017-0.021-0.126-0.032-0.193c0-0.002,0-0.003,0-0.005c-0.002-0.017-0.005-0.032-0.007-0.049c-0.001-0.003-0.001-0.005-0.001-0.007c-0.003-0.019-0.007-0.038-0.009-0.057c0-0.001-0.001-0.001-0.001-0.003c-0.003-0.02-0.006-0.042-0.009-0.062c0-0.001,0-0.001,0-0.001c-0.004-0.023-0.007-0.045-0.011-0.068c0-0.004-0.001-0.006-0.001-0.008c-0.002-0.022-0.006-0.045-0.008-0.066c-0.001-0.006-0.001-0.01-0.003-0.017c-0.002-0.023-0.005-0.046-0.009-0.069c-0.001-0.004-0.001-0.007-0.002-0.014c-0.003-0.026-0.007-0.05-0.011-0.076c0-0.002,0-0.004,0-0.005c-0.004-0.024-0.008-0.05-0.011-0.076c-0.001-0.007-0.001-0.01-0.003-0.017c-0.002-0.025-0.006-0.052-0.009-0.08c-0.001-0.005-0.001-0.011-0.002-0.021c-0.005-0.027-0.007-0.053-0.011-0.081c-0.001-0.006-0.002-0.013-0.002-0.019c-0.002-0.029-0.006-0.058-0.01-0.087c0-0.004-0.001-0.008-0.003-0.014c-0.002-0.028-0.005-0.056-0.009-0.082c-0.001-0.006-0.001-0.011-0.002-0.016c-0.002-0.031-0.006-0.06-0.01-0.09c0-0.006-0.001-0.015-0.002-0.021c-0.004-0.03-0.006-0.061-0.011-0.09c0-0.007-0.001-0.015-0.002-0.022c-0.003-0.03-0.006-0.062-0.01-0.093c0-0.006-0.002-0.012-0.002-0.019c-0.003-0.032-0.005-0.063-0.009-0.094c0-0.002,0-0.005,0-0.009c-0.004-0.032-0.005-0.066-0.01-0.1c0-0.005,0-0.012-0.001-0.02c-0.002-0.033-0.005-0.065-0.007-0.098c-0.001-0.007-0.001-0.014-0.001-0.021c-0.004-0.033-0.006-0.067-0.008-0.099c0-0.005,0-0.012-0.001-0.02c-0.002-0.033-0.006-0.069-0.007-0.102c0-0.003,0-0.007-0.001-0.01c-0.002-0.033-0.004-0.066-0.006-0.1c-0.001-0.006-0.001-0.011-0.001-0.017c-0.001-0.032-0.003-0.068-0.005-0.1c0-0.008,0-0.014-0.001-0.021c-0.001-0.031-0.002-0.065-0.003-0.099c-0.001-0.006-0.001-0.013-0.001-0.021c-0.002-0.033-0.003-0.066-0.004-0.1c0-0.005,0-0.009,0-0.014c-0.001-0.032-0.001-0.066-0.002-0.099c0-0.003,0-0.005,0-0.009c0-0.034,0-0.067-0.001-0.101c0-0.005,0-0.013,0-0.017c0-0.033,0-0.067,0-0.098c0-0.005,0.001-0.012,0.001-0.019c0-0.032,0-0.065,0.001-0.095c0-0.005,0-0.009,0-0.015c0.001-0.033,0.001-0.065,0.003-0.099c0.052-1.244,0.292-1.752,0.292-1.752l0.057-0.164c0,0,0.46-1.459,1.154-2.459l-0.013,0.024c0,0,0.446-0.738,1.231-0.814c0.785-0.079,1.004,0.156,1.371,0.2c0.04,0.004,0.078,0.008,0.115,0.013c0.013,0.002,0.025,0.002,0.037,0.004c0.025,0.002,0.051,0.004,0.075,0.006c0.014,0.001,0.027,0.003,0.041,0.003c0.021,0.001,0.043,0.003,0.064,0.004c0.014,0.001,0.028,0.002,0.041,0.003c0.02,0.001,0.04,0.001,0.058,0.003c0.014,0,0.026,0,0.042,0c0.019,0.001,0.036,0.002,0.055,0.002c0.013,0.001,0.026,0.001,0.038,0.002c0.017,0,0.034,0,0.051,0c0.011,0,0.023,0,0.034,0c0.017,0,0.033,0,0.05,0c0.011,0,0.02-0.001,0.032-0.001c0.016-0.001,0.031-0.001,0.046-0.001c0.011-0.001,0.02-0.001,0.03-0.002c0.016,0,0.03-0.002,0.045-0.002c0.009,0,0.019,0,0.026-0.001c0.016-0.001,0.03-0.002,0.044-0.004c0.006,0,0.016-0.001,0.023-0.002c0.015-0.001,0.029-0.001,0.044-0.003c0.006-0.001,0.013-0.002,0.02-0.002c0.016-0.002,0.03-0.004,0.045-0.008c0.004,0,0.008,0,0.013-0.001c0.019-0.002,0.036-0.005,0.052-0.008l0,0c0.035-0.006,0.068-0.014,0.098-0.021c0,0,0,0,0.002-0.002c0.012-0.002,0.026-0.005,0.039-0.01c0.002,0,0.004,0,0.008-0.001c0.009-0.003,0.019-0.006,0.028-0.009c0.004,0,0.007-0.002,0.01-0.003c0.009-0.003,0.019-0.007,0.026-0.009c0.002-0.001,0.005-0.002,0.008-0.003c0.008-0.003,0.015-0.006,0.021-0.009c0.004-0.001,0.006-0.003,0.009-0.003c0.007-0.004,0.014-0.005,0.02-0.009c0.003-0.001,0.006-0.003,0.008-0.004c0.005-0.002,0.012-0.005,0.019-0.007c0.001-0.001,0.003-0.002,0.005-0.004c0.005-0.003,0.01-0.005,0.016-0.007c0.002-0.002,0.003-0.002,0.006-0.004c0.004-0.001,0.008-0.005,0.012-0.007c0.002-0.001,0.004-0.001,0.005-0.003c0.004-0.002,0.008-0.006,0.012-0.008c0.001,0,0.003-0.002,0.004-0.003c0.003-0.003,0.007-0.004,0.011-0.007c0.001-0.001,0.001-0.001,0.002-0.003c0.004-0.001,0.006-0.005,0.008-0.008h0.002c0.003-0.002,0.005-0.005,0.008-0.007l0.001-0.001c0.002-0.002,0.004-0.004,0.006-0.006s0.002-0.002,0.003-0.003c0.001,0,0.002-0.002,0.002-0.002c0.001-0.003,0.001-0.003,0.003-0.005c0.003-0.001,0.003-0.004,0.003-0.004c0.328-0.241,0.593-0.516,0.797-0.775c0.014-0.017,0.026-0.033,0.04-0.05c0.002-0.004,0.005-0.009,0.008-0.012c0.013-0.015,0.026-0.031,0.038-0.048c0.002-0.004,0.006-0.008,0.007-0.011c0.012-0.018,0.025-0.033,0.038-0.05c0.001,0,0.001,0,0.001-0.001c0.039-0.054,0.075-0.109,0.109-0.159c0-0.002,0.002-0.004,0.003-0.007c0.01-0.016,0.02-0.029,0.03-0.044c0.001-0.004,0.005-0.007,0.007-0.011c0.008-0.014,0.017-0.029,0.024-0.042c0.003-0.004,0.005-0.009,0.009-0.013c0.008-0.014,0.017-0.028,0.024-0.042l0.001-0.002c0.017-0.027,0.032-0.055,0.046-0.079c0.002-0.003,0.004-0.008,0.007-0.012c0.005-0.009,0.01-0.021,0.016-0.03c0.003-0.007,0.007-0.014,0.012-0.02c0.004-0.008,0.01-0.017,0.014-0.024c0.002-0.008,0.006-0.017,0.011-0.023c0.004-0.007,0.009-0.016,0.012-0.022c0.004-0.007,0.007-0.014,0.011-0.021c0.002-0.006,0.007-0.011,0.01-0.018c0.066-0.13,0.097-0.207,0.097-0.207c0.594-1.459,0.052-2.935-0.21-3.224c-0.32-0.354-1.041-0.883-1.041-0.883s-0.426-0.357-1.08-0.025c-0.521,0.264-0.711,0.201-0.711,0.201c-0.024-0.498,0.149-1.432,0.491-2.263c0.341-0.829,1.075-2.253,1.075-2.253s1.047-1.792,1.467-2.89c0.418-1.102,0.415-1.94,0.415-1.94s-0.795-1.019-0.91-1.177c-0.115-0.158-0.272-0.223-0.272-0.223c-0.205,0.078-0.345,0.103-0.345,0.103l0.169-0.14c0,0,0.424-0.492,1.073-0.334c0.648,0.158,1.119-0.126,1.119-0.126c1.011-0.764,1.654-2.187,1.654-2.187l0.988-1.997L27.059,1.12c0,0-0.131-0.028-0.979,0.259c0,0-0.773,1.905-1.725,3.087c0,0-0.374,0.552-0.664,0.416c-0.289-0.134-0.629-0.144-0.91-0.085c-0.281,0.06-1.156,0.349-1.948,1.413c-0.79,1.064-0.883,1.863-0.458,2.101c0.425,0.238,1.045-0.076,1.42-0.407c0.375-0.333,0.638-0.485,0.757-0.47c0.118,0.02,0.093,0.315,0.068,0.41c-0.026,0.094-0.154,1.364-1.625,3.913c-0.369,0.64-0.845,1.589-1.069,2.046l0.608,0.447l-0.999,0.503c-0.266,0.758-0.605,1.945-0.471,2.61c0.204,1.011,1.158,1.011,1.158,1.011s0.621,0.027,1.344-0.348c0.722-0.375,0.892,1.242,0.892,1.505c0,0.264-0.007,1.726-1.02,2.442c0,0-0.409,0.313-0.985,0.313c-0.579,0-0.954-0.169-0.954-0.169s-0.984-0.272-1.59,0.083c-0.604,0.358-1.326,1.098-1.897,2.17c-0.569,1.072-1.045,2.986-1.019,4.397c0.02,1.111,0.18,2.162,0.291,2.879l0.667,0.435l-0.543,0.623c0.079,1.136,0.168,3.363,0.155,4.109c-0.018,0.911-0.154,2.84-1.115,3.292c0,0-0.324,0.171-0.868-0.238s-1.132-0.426-1.37-0.435c-0.238-0.007-1.285,0.162-1.692,1.311c-0.408,1.145-0.375,2.688-0.29,3.597c0.086,0.91,0.876,2.458,1.872,2.458c0,0,0.484,0.035,1.055-0.553c0.568-0.586,0.902-0.637,1.156-0.629c0.255,0.009,0.749,0.272,1.072,2.851c0.307,2.442,0.437,4.442,0.414,6.668l0.605,0.392l-0.758,0.768c-0.042,0.199-0.089,0.417-0.142,0.626c-0.169,0.682-0.187,1.364-0.024,2.569c0.161,1.21,0.811,3.72,1.754,4.375c1.252,0.871,2.071,0.856,2.916,0.791c0.842-0.067,1.424-0.712,1.424-0.712s0.331-0.342,0.685-0.237c0.356,0.104,1.346,0.66,2.058,2.084c0.713,1.425,0.871,2.992-0.316,3.272c-1.187,0.272-3.231-0.846-3.231-0.846s-1.161-0.647-2.109,0.064c-0.951,0.713-0.977,1.807-0.502,3.15c0.261,0.738,0.782,1.938,1.513,3.188l0.721,0.302l-0.193,0.551c0.492,0.748,1.055,1.479,1.678,2.105c0,0,2.466,2.729,3.838,4.457c0,0,0.08,0.157-0.158,0.016c-0.238-0.146-1.266-0.621-1.82-0.566c-0.555,0.054-0.45,0.395-0.45,0.395s0.238,1.254,4.01,3.365c0,0,1.359,0.766,2.216,0.766c0,0,0.277,0.039,0.619-0.346c0.346-0.381,0.45-0.341,0.688-0.262c0.237,0.076,0.553,0.249,1.741,1.105c1.188,0.857,3.496,2.176,4.325,2.731c0.83,0.555,0.793,0.657,0.621,1.054c-0.171,0.396,0.593,0.619,0.593,0.619s1.899,0.855,2.928,0.846c1.029-0.016,1.464-0.119,2.097,0.012c0.632,0.133,1.28,0.291,1.345,0.346c0.066,0.053-0.315,0.038-0.315,0.038s-2.362-0.276-2.494-0.21c-0.13,0.066,0.014,0.184,0.99,0.436v0.006c1.245,0.217,2.507,0.387,3.782,0.51c-0.489-0.061-2.52-0.322-3.823-0.713c0,0-0.131-0.078,0.173-0.014c0.303,0.065,2.018,0.225,2.466,0.157c0.448-0.065-0.092-0.274-0.092-0.274s-0.897-0.425-2.889-0.582c0,0-0.803-0.055-1.503,0.014c-0.699,0.066-1.41-0.264-1.41-0.264s-1.028-0.317-0.78-0.646c0.126-0.165,0.137-0.336,0.065-0.502L38.188,89.707L38.188,89.707z\"/><linearGradient id=\"SVGID_6_\" gradientUnits=\"userSpaceOnUse\" x1=\"444.7598\" y1=\"550.8145\" x2=\"473.8418\" y2=\"550.8145\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#231F20\"/><stop offset=\"1\" stop-color=\"#474747\"/></linearGradient><path style=\"opacity:.35;fill:url(#SVGID_6_);\" d=\"M62.342,86.16l-0.438,0.646c0.096,0.655-0.104,0.875-0.254,1.119c-0.156,0.26-0.59,0.592-0.375,1.185c0.218,0.59,1.687,0.401,2.535,0.144c0.852-0.26,1.569-0.49,2.134-0.693c0.562-0.198,0.719,0.086,0.719,0.086s0.246,0.175-0.574,0.606c-0.821,0.433-2.336,0.634-3.055,0.72c-0.724,0.086-0.506-0.043-1.586,0.33c-1.082,0.377-0.07,0.707-0.07,0.707c2.435,0.635,4.188,0.115,4.188,0.115l0.332-0.097c0.27-0.077,0.535-0.161,0.803-0.244c-2.021,0.456-3.326,0.149-3.739,0.095c-0.431-0.058-0.778-0.145-0.88-0.361c-0.102-0.215,0.479-0.2,0.479-0.2s1.683-0.188,3.24-0.69c1.557-0.506,1.932-0.98,1.871-1.341c-0.057-0.358-0.848-0.332-1.785-0.028c-0.937,0.305-2.334,0.75-2.662,0.821c-0.334,0.07-0.691,0.06-0.812-0.146c-0.114-0.203-0.216-0.53,0.146-0.905c0.36-0.376,0.402-0.694,0.402-0.694c0.055-0.254,0.057-0.523,0.021-0.8L62.342,86.16l0.545-0.118c-0.298-1.124-1.052-2.218-1.279-2.577c-0.314-0.507-0.836-0.793-2.393-0.535c-1.556,0.26-3.386,1.035-3.386,1.035s-1.888,0.997-3.298,0.812c-1.413-0.188-1.703-1.614-1.688-2.063c0.015-0.447,0.304-0.835,1.039-1.123c0.735-0.289,2.465-0.678,4.985-0.808s3.458-1.771,3.458-1.771c0.33-0.478,0.922-1.543-0.489-2.336c-1.41-0.791-1.441-0.593-2.119-1.107c-0.678-0.52-1.412-1.153-1.701-2.033c-0.025-0.084-0.066-0.197-0.104-0.292l-0.849-0.558l0.41-0.371c-0.34-0.67-0.693-1.271-0.693-1.271s-1.281-1.902-0.246-3.703c1.038-1.803,2.736-2.348,2.736-2.348s1.5-0.332,2.996,0.016c1.418,0.324,2.133-0.219,2.133-0.219s0.865-0.374,1.123-2.102c0.264-1.729-0.014-4.943-2.316-5.578c-2.307-0.633-3.527,0.563-3.527,0.563s-1.24,1.369-1.644,1.57c-0.404,0.201-1.022,0.563-1.022,0.563s-0.867,0.519-1.453,0.648c-0.393,0.086-1.791-1.771-1.933-3.201c-0.133-1.316-0.401-2.388-0.306-5.096l-0.485-0.63l0.537-0.533c0.101-2.999-0.417-5.116-1.188-6.461c-0.807-1.412-2.119-2.161-2.766-2.478c-0.648-0.318-2.147-0.462-3.17-0.086c-1.023,0.374-1.239,0.678-1.613,1.326c-0.376,0.648-0.836,0.605-0.836,0.605s-1.427,0.043-1.888-2.133c-0.646-3.049,0.359-4.035,0.359-4.035s0.318-0.476,1.369-0.619c1.053-0.144,1.73,0.115,2.537,0.315c0.806,0.202,1.41,0.116,2.419-0.374c1.008-0.491,1.442-1.297,1.238-2.739c-0.195-1.393-0.255-1.742-1.483-5.964l-0.875-0.46l0.583-0.579C44.87,23.032,44.8,20.35,44.8,20.35c-0.106-0.977,0.049-1.292,0.598-1.54c0.576-0.259,1.116-0.175,1.934-0.123c0.818,0.053,1.425-0.079,1.847-0.316c0.422-0.237,1.581-0.87,1.504-2.162c-0.08-1.292-1.109-2.824-1.953-3.351c-0.843-0.528-1.953-0.316-2.558,0.131c-0.606,0.45-0.845,1.029-1.214,1.214c-0.369,0.183-0.895,0.605-1.45,0.474c-0.554-0.132-0.581-1.371-0.818-2.77c-0.153-0.907-0.271-1.611-0.338-1.989l-0.678-0.254c0.044,0.557,0.535,3.304,0.535,3.304s0.223,1.364,0.308,1.692c0.086,0.329,0.314,1.05,0.314,1.05s0.092,0.364,0.456,0.535c0.365,0.172,1.052,0.24,1.743-0.032c0.692-0.271,0.886-0.572,1.199-0.938c0.315-0.364,0.429-0.493,0.429-0.493s0.663-0.622,1.478-0.343c0.813,0.278,1.299,1.228,1.299,1.228l0.028,0.06c0,0,0.403,0.661,0.392,1.269v-0.057c0,0-0.022,0.301-0.697,0.818c-0.676,0.519-1.226,0.479-1.678,0.442c-0.454-0.04-0.666-0.072-0.797-0.045l-0.719,0.038C45.178,18.303,44.74,18.6,44.74,18.6c-1.8,1.064,0.736,9.288,0.736,9.288l0,0L45.2,28.501c0,0,0.514,2.052,0.904,3.378c0.388,1.326,0.562,2.637,0.62,2.91c0.058,0.274,0.044,0.762-0.317,1.051c-0.359,0.289-1.239,0.534-1.425,0.562c-0.187,0.029-0.535-0.042-0.996-0.201c-0.462-0.158-0.922-0.187-0.922-0.187s-1.11-0.188-2.291,0.173c-1.182,0.359-2.076,1.569-2.148,3.083c-0.071,1.513-0.057,2.278,0.535,3.617c0.59,1.34,1.657,2.104,2.463,2.118c0.808,0.014,1.469-0.403,1.931-1.051c0.459-0.65,0.59-0.751,0.59-0.751c0.548-0.302,1.944-0.433,2.651-0.172c0.708,0.258,2.007,1.073,2.723,2.679c0.579,1.298,0.76,2.75,0.729,5.363l0.584,0.448l-0.61,0.703c-0.007,0.246-0.016,0.498-0.026,0.761c-0.143,3.876,0.72,5.864,0.72,5.864c0.491,1.065,1.023,1.83,1.745,2.318c0.719,0.489,1.699,0.156,2.018,0c0.315-0.158,1.194-0.563,1.943-1.037c0.749-0.477,0.725-0.679,1.629-1.515c0.907-0.833,2.076-0.604,2.076-0.604s1.107,0.028,1.74,1.313c0.637,1.283,0.509,3.109,0.347,3.773c-0.158,0.662-0.444,1.097-1.063,0.979c-0.621-0.114-1.645-0.217-2.019-0.231c-0.375-0.014-1.433-0.049-2.394,0.203c-0.938,0.244-2.205,0.92-3.414,2.883c-0.938,1.52-0.478,3.013-0.262,3.603c0.17,0.462,0.635,1.104,1.043,1.896l0.756,0.252l-0.35,0.656c0.398,0.963,0.701,1.493,1.305,2.151c0.648,0.705,1.672,1.251,2.881,1.714c1.213,0.462,0.662,1.282,0.662,1.282c-0.69,1.497-2.75,1.557-3.354,1.628c-0.604,0.07-1.872,0.188-3.058,0.447c-1.182,0.261-2.291,0.418-2.954,1.182c-0.661,0.764-0.402,1.557-0.013,2.393c0.388,0.834,1.427,1.28,2.853,1.226c1.426-0.058,2.35-0.476,3.214-0.851s2.362-0.809,2.81-0.937c0.445-0.129,1.051-0.39,1.498,0.26c0.482,0.701,0.994,1.697,1.229,2.45L62.342,86.16L62.342,86.16z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M101.566,51.162c0,0,0.347-3.236,0.457-4.392c0.018-0.173,0.031-0.343,0.045-0.513l-0.098-0.241c-0.459,5.815-0.938,7.727-0.938,7.727s0.013-0.037,0.031-0.101c0.189-0.817,0.357-1.646,0.51-2.48C101.568,51.162,101.566,51.162,101.566,51.162L101.566,51.162z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M91.268,12.579l0.328,0.413l0.279,0.5c1.021,1.648,2.846,4.295,2.846,4.295s0.739,0.958,0.905,0.968c0.164,0.01-0.084-0.741-0.084-0.741s-0.271-0.979,0.517,0.298c0.73,1.19,1.207,2.359,1.317,2.72c0.114,0.361,0.042,0.411,0.042,0.411s-0.146,0.072-0.146,0.33c0,0.505,0.496,1.659,0.496,1.659s1.545,3.926,2.07,5.563c0.526,1.641,1.133,4.368,1.133,4.368s0.187,0.804,0.207,1.174c0.021,0.371-0.063,0.381-0.229,0.186c-0.164-0.196-0.329-0.072-0.329-0.072s-0.175,0.072-0.175,0.773c0,0.7,0.085,2.346,0.217,3.615c0.152,1.505,0.616,2.133,0.616,2.133s0.413,0.618,0.526-0.577c0.096-1.028,0.185-0.228,0.185-0.228c0.196,1.557,0.062,4.544,0.03,4.955c-0.019,0.218-0.032,0.433-0.049,0.64l0.133-0.221c0.201-2.971,0.06-5.359,0.06-5.359s-0.144-1.323-0.3-1.311c-0.155,0.01-0.211,0.701-0.211,0.701s-0.065,0.467-0.156,0.456c-0.088-0.011-0.369,0.022-0.566-1.412c-0.199-1.436-0.156-2.949-0.156-2.949s-0.043-0.155,0.048-0.189c0.09-0.034,0.188,0.1,0.188,0.1s0.133,0.189,0.287,0.033c0.156-0.154,0.19-0.622-0.301-3.08c-0.288-1.454-0.711-2.896-1.006-3.832l-0.294-0.333l-0.058-0.718c0,0-0.311-0.913-1.033-2.737c-0.723-1.824-0.846-2.458-0.846-2.458s-0.045-0.2,0.066-0.234c0.111-0.032,0.091-0.178,0.091-0.178s-0.013-0.245-0.278-0.99c-0.268-0.746-0.426-1.281-1.356-2.86c-0.869-1.468-1.124-1.558-1.124-1.558s-0.426-0.234-0.112,0.591c0.313,0.823-0.075,0.232-0.075,0.232c-0.925-1.177-2.838-4.292-2.838-4.292l-0.537-0.373l-0.508-1.261l-0.015,0.01\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M1.547,32.696l-0.183,0.37c-0.472,2.495-0.625,5.135-0.62,5.31c0.01,0.208-0.036,0.211-0.075,0.178c-0.042-0.035,0.03-0.16-0.048-0.16c-0.079,0-0.108,0.211-0.108,0.211L0.512,38.6c-0.021,0.288-0.038,0.574-0.053,0.861l0.016-0.003c0.068-0.098,0.097-0.028,0.097-0.028s-0.029,0.126,0.097,0.056c0.126-0.07,0.21-1.379,0.21-1.379s0.014-2.813,0.836-6.14c0.819-3.327,1.281-4.259,1.281-4.259s0.154-0.418,0.138-0.083C3.12,27.958,3.33,27.986,3.33,27.986c0.375-0.054,0.821-1.125,1.267-2.493c0.445-1.363,0.668-2.589,0.668-2.7c0-0.11-0.055-0.194-0.152-0.138c-0.098,0.056-0.125,0.014-0.125,0.014c-0.014-0.208,0.361-1.127,0.361-1.127c1.253-3.202,3.104-5.694,3.104-5.694l0.09-0.504c-0.164,0.254-0.27,0.419-0.421,0.661c-0.056,0.089-0.042,0.297-0.001,0.32c-0.201,0.191-0.365,0.35-0.476,0.456c-2.707,4.473-3.059,6.556-3.059,6.556c-0.017,0.214,0.004,0.311,0.111,0.306c0.065-0.003,0.251-0.349,0.116,0.354c-0.09,0.468-0.524,1.708-0.693,2.212c-0.171,0.505-0.358,0.85-0.495,0.826C3.49,27.01,3.49,26.801,3.49,26.801s-0.042-0.546-0.398,0.245c-0.356,0.791-0.713,1.859-1.425,4.65c-0.031,0.125-0.063,0.251-0.092,0.38L1.547,32.696L1.547,32.696z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M4.841,62.626c-0.15-0.401-0.264-0.722-0.179-0.581c0.085,0.143,0.198,0.432,0.462,0.725c0.263,0.291,0.442-0.226-0.622-3.104s-1.354-3.04-1.402-3.095c-0.046-0.058-0.215-0.237-0.167,0.167c0.045,0.404,0.018,0.656-0.51-1.146c-0.528-1.806-0.996-4.844-1.025-5.089c-0.027-0.243-0.169-1.778-0.396-3.594c-0.226-1.814-0.246-3.743-0.207-4.28c0.039-0.537-0.066-0.828-0.123-0.837c-0.056-0.008-0.094,0.047-0.131,0.284c-0.038,0.234-0.01,0.395-0.067,0.385c-0.057-0.009-0.076-0.471-0.076-0.471H0.391c0,0.05,0,0.1,0,0.151c0,0.174,0.001,0.345,0.002,0.519l0.039,0.402c0.033,0.597,0.129,0.354,0.135,0.246c0.006-0.109,0.03-0.329,0.03-0.329s0.103-0.884,0.084,0.02c-0.019,0.904,0.236,4.563,0.236,4.563c0.019,0.236,0.041,0.479,0.068,0.729l0.063,0.092l-0.042,0.104c0.265,2.425,0.795,5.086,0.795,5.086c0.507,2.417,1.11,3.846,1.308,4.25c0.198,0.405,0.236,0.085,0.17-0.271c-0.066-0.357,0.546,0.688,0.873,1.674c0.332,0.99,0.556,1.815,0.556,1.815s0.254,0.781,0.142,0.828c-0.113,0.046-0.292-0.293-0.292-0.293s-0.473-0.835-0.274-0.228c0.398,1.231,1.6,3.822,1.6,3.822l1.396,2.471C6.282,65.836,4.982,63.004,4.841,62.626L4.841,62.626z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M7.281,67.639c0.069,0.125,0.136,0.246,0.202,0.359L7.281,67.639z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M20.722,2.874C20.51,3.216,20.48,3.388,20.48,3.388s0.112-0.118,0.183-0.237C20.733,3.033,20.722,2.874,20.722,2.874z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M17.216,5.572c-0.417,0.048-0.677,0.25-0.677,0.25S16.889,5.761,17.216,5.572z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M84.005,4.909c0,0,0.247-0.03,0.347,0.02c0.101,0.049,0.066-0.158,0.066-0.158s-0.287-0.406-0.322-0.556c-0.32-0.089-0.611-0.1-0.611-0.1l-0.028,0.034c-0.01,0.075-0.036,0.188-0.012,0.297C83.441,4.448,83.917,4.811,84.005,4.909L84.005,4.909z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M87.487,7.88l0.095-0.152l-0.223-0.679c-0.004-0.012-0.012-0.022-0.021-0.036c-0.007,0.066-0.049,0.125-0.172,0.115c0,0-0.099-0.03-0.011,0.198C87.219,7.469,87.355,7.699,87.487,7.88L87.487,7.88z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M101.566,51.162c0,0,0.347-3.236,0.457-4.392c0.018-0.173,0.031-0.343,0.045-0.513l-0.098-0.241c-0.459,5.815-0.938,7.727-0.938,7.727s0.013-0.037,0.031-0.101c0.189-0.817,0.357-1.646,0.51-2.48C101.568,51.162,101.566,51.162,101.566,51.162L101.566,51.162z\"/><linearGradient id=\"SVGID_7_\" gradientUnits=\"userSpaceOnUse\" x1=\"266.4922\" y1=\"-395.2783\" x2=\"295.9644\" y2=\"-485.0349\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".0094\" stop-color=\"#FCFCFC\"/><stop offset=\".0655\" stop-color=\"#EEEEEE\"/><stop offset=\".1342\" stop-color=\"#E5E5E5\"/><stop offset=\".2515\" stop-color=\"#E3E3E3\"/><stop offset=\".3357\" stop-color=\"#8A8A8A\"/><stop offset=\".4422\" stop-color=\"#B8B8B8\"/><stop offset=\"1\" stop-color=\"#3B3B3B\"/></linearGradient><path style=\"opacity:.5;fill:url(#SVGID_7_);\" d=\"M79.003,84.528c0,0,0.667-0.653,0.539-0.752c-0.128-0.101-0.623,0.256-0.623,0.256s-0.073,0.062-0.185,0.142l0.393-0.252c0,0-0.038,0.238-0.355,0.555c0,0-0.094,0.094-0.258,0.248c-0.957,0.938-2.386,1.998-2.386,1.998l0.396-0.211C77.844,85.703,79.003,84.528,79.003,84.528z\"/><linearGradient id=\"SVGID_8_\" gradientUnits=\"userSpaceOnUse\" x1=\"460.4629\" y1=\"512.5557\" x2=\"509.5884\" y2=\"573.3062\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EFF0F0\"/><stop offset=\".5914\" stop-color=\"#F0F1F2\"/><stop offset=\".599\" stop-color=\"#787878\"/><stop offset=\".6456\" stop-color=\"#EEEFF0\"/><stop offset=\"1\" stop-color=\"#D8D9DB\"/></linearGradient><path style=\"opacity:.73;fill:url(#SVGID_8_);\" d=\"M82.984,39.705l0.51-0.891l-0.127-1.667c0,0-0.085-0.893-0.566-2.28c-0.979-2.828-1.941-4.122-1.941-4.122s-0.592-1.318-1.969-1.318c-1.33,0-1.431,1.219-1.431,1.219s-0.312,0.963-0.821,1.261c-0.5,0.29-1.972,1.146-2.748,0.296c-0.941-1.026-1.461-2.225-1.56-3.372c-0.101-1.146,0.367-1.615,0.367-1.615s0.1-0.296,1.614-0.296c1.703,0,2.014-0.525,2.014-0.525s0.324-0.296,0.297-0.963s-0.284-2.097-0.779-3.001c-0.324-0.596-1.058-1.537-1.684-2.261l-0.967-0.178l0.15-0.699c-0.56-0.514-3.465-3.959-4.031-4.766c-0.564-0.808-0.65-0.993-0.75-1.262c-0.099-0.269,0.17-0.877,0.412-1.161c0.238-0.283,0.521-0.341,1.104-0.212c0.58,0.127,0.961,0.381,1.886,0.084c0.919-0.297,0.962-0.992,1.033-1.699c0.071-0.708-0.78-2.209-1.458-2.932c-0.684-0.721-1.645-0.836-2.311-0.792c-0.664,0.042-1.047,0.523-1.433,0.737c-0.382,0.213-1.103,0.425-1.429,0.284c-0.326-0.142-0.823-0.284-1.375-1.261c-0.43-0.76-0.794-1.459-0.979-1.817L63.299,4.42v0.012c0,0,0.633,1.654,1.633,2.811c0.998,1.157,2.266,0.919,2.266,0.919s0.82-0.089,1.533-0.772c0.711-0.683,1.761-0.148,2.024,0.04c0.269,0.189,0.853,0.911,1.478,2.127c0.621,1.216-0.355,2.058-0.355,2.058s-0.555,0.535-1.691,0.088c-1.14-0.443-1.813,0.259-1.986,0.614c-0.182,0.357-0.508,0.99,0.076,1.73c0.584,0.742,3.178,4.273,4.916,5.945c1.74,1.672,2.314,3.047,2.682,4.342c0.365,1.297,0.079,1.899-0.521,2.018c-0.604,0.118-1.148,0.021-2.086,0.187c-0.94,0.17-1.349,0.367-1.543,1.653c-0.199,1.286,0.562,3.373,1.67,4.361c1.106,0.989,2.334,0.386,2.76,0.228c0.427-0.159,1.352-0.653,1.681-2.027c0.188-0.783,0.851-0.721,0.851-0.721s0.563-0.071,0.854,0.117c0.287,0.19,0.633,0.525,1.402,1.87c0.772,1.346,1.453,3.146,1.724,4.738C82.924,38.35,82.729,38.576,82.984,39.705c0.256,1.128,1.078,3.245,1.466,4.074c0.383,0.832,0.78,1.662,0.989,2.107c0.205,0.445,0.531,0.782,1.443,0.802c0.908,0.02,1.273-0.228,1.541-0.662c0.27-0.435,0.612-1.088,0.713-1.316c0.1-0.228,0.467-0.911,1.146-1.02c0.685-0.108,1.762,0.01,2.106,1.198c0.313,1.071,0.76,2.622-0.158,4.5c-0.65,1.334-1.129,0.859-2.451,0.948c0,0-1.165-0.01-1.781,0.921c-0.611,0.93-0.416,2.61-0.286,3.877s0.988,3.113,1.621,3.563c0.636,0.443,0.86,0.849,1.08,1.256c0.216,0.404,0.534,1.205,0.216,3.313c-0.313,2.106-0.979,3.74-1.867,4.521c-0.024,0.021-0.05,0.043-0.07,0.063c-0.067,0.065-0.141,0.135-0.219,0.201c-0.537,0.521-0.371,0.543-0.889,0.793c-0.594,0.289-0.988,0.207-1.958,0.365c-0.97,0.16-1.583,0.327-2.088,0.821c-0.503,0.495-1.243,1.409-0.979,3.187c0.148,0.986,1.318,0.584,2.229,0.111c-0.274,0.125-0.553,0.221-0.798,0.246c-1.033,0.113-0.991-0.949-0.921-1.415c0.069-0.47,0.313-1.544,1.063-1.97s1.799-0.41,2.533-0.512c0.738-0.101,1.076-0.313,1.076-0.313s1.205-0.766,1.997-2.055c0.793-1.289,1.502-3.371,1.587-5.438c0.084-2.068-0.821-2.902-1.104-3.271c-0.283-0.366-0.799-0.203-1.431-1.729c-0.724-1.74-0.81-3.188-0.751-4.079c0.057-0.892,0.27-1.231,0.682-1.612c0.41-0.383,2.223-0.213,2.223-0.213s0.893,0.185,1.686-1.134c0.793-1.317,0.738-3.471,0.481-4.546c-0.253-1.076-0.623-2.013-2.097-2.168c-1.471-0.152-2.138,1.66-2.138,1.66s-0.297,0.693-0.608,1.092c-0.312,0.395-1.16,0.285-1.16,0.285c-0.37-0.044-0.821,0.099-1.264-0.81c-0.438-0.906-1.442-3.286-1.442-3.286c-0.339-0.809-0.556-1.512-0.688-2.055L82.984,39.705L82.984,39.705z\"/><linearGradient id=\"SVGID_9_\" gradientUnits=\"userSpaceOnUse\" x1=\"272.8721\" y1=\"-392.8257\" x2=\"302.4699\" y2=\"-482.9646\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"opacity:.53;fill:url(#SVGID_9_);\" d=\"M82.487,79.313l0.801-0.479c0.788-1.231,1.72-2.31,2.431-3.103c0.863-0.961,1.896-2.522,1.896-2.522s0.835-1.431,0.638-1.784c-0.13-0.23-0.704,0.02-1.687,0.752c-3.674,2.746-3.971,1.246-3.971,1.246c0.422,2.438,4.729-1.633,5.108-1.375c-0.063,0.563-0.457,1.172-1.25,2.25c0,0-0.388,0.555-0.78,0.953c-0.369,0.432-0.578,0.641-0.578,0.641s-0.088,0.09-0.125,0.125c-0.471,0.541-1.024,1.242-1.595,2.018c-0.019,0.021-0.104,0.113-0.125,0.143c-0.295,0.416-0.491,0.73-0.702,1.062c-0.014,0.022-0.064,0.011-0.076,0.034c0-0.002-0.013,0.014-0.025,0.037c-0.245,0.39-0.373,0.713-0.508,0.959c-0.012,0.029-0.021,0.065-0.03,0.095c0,0-0.319,0.665-0.457,1.067c-0.14,0.405-0.12,0.547-0.623,0.625c-0.504,0.078-0.276-0.053-1.021,0.196c0,0-0.403,0.199-0.938,0.571c-0.027,0.021-0.057,0.042-0.082,0.063c-0.736,0.604-1.247,1.119-1.534,1.436c-0.051,0.063-0.099,0.13-0.146,0.195c0,0-0.157,0.168,0.051,0.188c0.206,0.021,0.633-0.01,1.008-0.169l0.088-0.057c-0.186,0.103-0.373,0.174-0.513,0.162c-0.396-0.026,0.479-0.864,0.479-0.864s0.906-1.019,1.771-1.175c0.862-0.156,1.021-0.371,1.444-0.693c0.426-0.327,0.494-0.682,1.359-2.254c0.03-0.059,0.064-0.115,0.098-0.176L82.487,79.313L82.487,79.313z\"/><linearGradient id=\"SVGID_10_\" gradientUnits=\"userSpaceOnUse\" x1=\"444.6943\" y1=\"510.9561\" x2=\"469.7246\" y2=\"592.0699\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".7473\" stop-color=\"#F9F9F9\"/><stop offset=\"1\" stop-color=\"#D5D7D8\"/></linearGradient><path style=\"opacity:.96;fill:url(#SVGID_10_);\" d=\"M55.064,72.686l0.408-0.377c-0.34-0.668-0.693-1.269-0.693-1.269s-1.282-1.901-0.245-3.703c1.036-1.803,2.737-2.348,2.737-2.348s1.5-0.332,2.996,0.017c1.418,0.323,2.133-0.22,2.133-0.22s0.865-0.376,1.123-2.104c0.261-1.729-0.014-4.94-2.317-5.576c-2.306-0.633-3.528,0.563-3.528,0.563s-1.242,1.369-1.644,1.57c-0.404,0.2-1.024,0.562-1.024,0.562s-0.865,0.52-1.453,0.648c-0.39,0.087-1.788-1.771-1.931-3.2c-0.133-1.313-0.4-2.385-0.305-5.084c0-0.005,0-0.01,0-0.017l-0.486-0.629l0.537-0.526c0.102-3-0.418-5.119-1.188-6.463c-0.805-1.414-2.118-2.163-2.766-2.479c-0.647-0.317-2.146-0.461-3.169-0.086c-1.022,0.375-1.237,0.677-1.613,1.325c-0.376,0.65-0.835,0.606-0.835,0.606s-1.427,0.044-1.89-2.132c-0.644-3.049,0.36-4.036,0.36-4.036s0.318-0.475,1.369-0.619c1.053-0.144,1.73,0.115,2.536,0.317c0.807,0.2,1.41,0.114,2.42-0.374c1.009-0.49,1.442-1.298,1.24-2.738c-0.196-1.397-0.249-1.727-1.484-5.966l-0.874-0.458l0.582-0.579c-1.182-4.271-1.257-6.961-1.257-6.961c-0.105-0.975,0.049-1.29,0.598-1.537c0.576-0.261,1.117-0.177,1.934-0.125c0.819,0.052,1.425-0.079,1.847-0.316c0.423-0.236,1.583-0.87,1.503-2.163c-0.078-1.292-1.108-2.823-1.951-3.35c-0.844-0.528-1.952-0.317-2.56,0.132c-0.606,0.447-0.843,1.028-1.213,1.212c-0.368,0.185-0.896,0.607-1.45,0.474c-0.554-0.132-0.581-1.372-0.818-2.77c-0.155-0.915-0.276-1.614-0.342-1.989l-0.674-0.254c0.043,0.557,0.535,3.304,0.535,3.304l0.294,1.624c0,0,0,0.007,0,0.02c0.006,0.018,0.009,0.036,0.013,0.05c0.019,0.079,0.049,0.18,0.082,0.289c0.114,0.215,0.37,0.456,0.942,0.502c1.076,0.089,1.772-0.468,2.025-0.709c0.254-0.239,0.86-0.911,0.86-0.911s0.329-0.632,1.253-0.494c0.922,0.14,1.238,0.773,1.403,1.013c0.167,0.242,1.57,1.961,0.672,2.861c-0.039,0.039-0.093,0.089-0.152,0.146c-0.104,0.111-0.245,0.246-0.446,0.399c-0.675,0.517-1.226,0.48-1.678,0.442c-0.453-0.039-0.665-0.07-0.795-0.043l-0.72,0.038c-0.787,0.11-1.224,0.408-1.224,0.408c-1.8,1.065,0.735,9.287,0.735,9.287s0.671,2.029,0.973,2.979c0.301,0.949,0.496,1.625,0.791,3.264c0.295,1.639-0.231,2.092-0.525,2.251c-0.294,0.158-0.984,0.568-1.77,0.604c-0.783,0.034-1.027-0.368-2.371-0.432c-1.345-0.065-2.246,0.345-2.661,0.906c-0.417,0.561-0.913,1.862-0.675,3.4c0.237,1.541,0.504,2.064,1.092,2.748c0.59,0.681,1.165,0.97,1.978,0.696c0.792-0.266,0.764-0.756,1.173-1.164c0.517-0.519,0.855-0.792,2.063-0.821c1.208-0.029,1.979,0.288,2.594,0.784c0.619,0.496,1.934,1.646,2.294,3.356c0.359,1.713,0.424,2.268,0.424,3.676s-0.101,2.978-0.064,4.381c0.036,1.4,0.187,2.841,0.577,3.795c0.386,0.955,0.926,1.755,1.4,2.18c0.475,0.426,0.896,0.438,1.373,0.252c0.475-0.188,1.511-0.771,2.373-1.324c0.861-0.555,0.797-0.99,1.576-1.502c0.875-0.576,1.799-0.605,2.457-0.486c0.661,0.112,1.676,0.631,2.092,1.889C63.059,60.58,63,61.998,63,61.998s0.035,1.186-0.445,1.876c-0.48,0.688-1.272,0.616-1.625,0.545c-0.354-0.071-1.094-0.136-1.094-0.136s-1.451-0.165-2.563,0.094c-1.105,0.258-2.077,1.085-2.73,1.896c-0.652,0.813-0.941,1.57-0.984,2.158c-0.043,0.59,0.027,1.595,0.642,2.572c0.612,0.979,0.712,1.432,1.409,2.827c0.695,1.396,2.15,2.17,2.201,2.206c0.05,0.037,1.388,0.523,1.89,0.949c0.505,0.425,0.555,0.826,0.411,1.208c-0.145,0.381-0.438,1.094-1.604,1.604c-1.166,0.512-2.591,0.523-3.496,0.617c-0.906,0.094-2.651,0.332-3.697,0.834c-1.043,0.503-0.97,1.454-0.97,1.454s-0.028,1.556,1.337,1.983c1.365,0.434,2.64,0,3.201-0.237c0.562-0.238,1.487-0.583,1.487-0.583s1.791-0.631,2.752-0.848c0.965-0.217,1.533-0.323,2.188,0.832c0.652,1.158,1.014,1.886,1.078,2.625c0.064,0.74-0.209,1.148-0.461,1.432c-0.25,0.279-0.217,0.46-0.217,0.46c-0.105,0.873,1.182,0.763,1.182,0.763s0.041-0.004,0.11-0.018c-0.26,0.021-0.499-0.021-0.59-0.178c-0.116-0.202-0.217-0.531,0.146-0.906c0.359-0.374,0.402-0.693,0.402-0.693c0.305-1.439-1.038-3.371-1.354-3.875c-0.315-0.503-0.836-0.791-2.394-0.531c-1.556,0.26-3.386,1.037-3.386,1.037s-1.891,0.995-3.299,0.809c-1.413-0.188-1.701-1.614-1.687-2.063c0.016-0.444,0.304-0.836,1.038-1.122c0.733-0.289,2.464-0.679,4.984-0.809c2.522-0.128,3.458-1.771,3.458-1.771c0.331-0.478,0.923-1.543-0.489-2.338c-1.412-0.789-1.44-0.589-2.116-1.104c-0.68-0.521-1.412-1.153-1.701-2.034c-0.026-0.084-0.07-0.198-0.108-0.291L55.064,72.686L55.064,72.686z\"/><linearGradient id=\"SVGID_11_\" gradientUnits=\"userSpaceOnUse\" x1=\"390.042\" y1=\"485.6797\" x2=\"390.042\" y2=\"485.6797\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".7473\" stop-color=\"#F9F9F9\"/><stop offset=\"1\" stop-color=\"#D5D7D8\"/></linearGradient><path style=\"fill:url(#SVGID_11_);\" d=\"M-16.122-14.641\"/><linearGradient id=\"SVGID_12_\" gradientUnits=\"userSpaceOnUse\" x1=\"390.042\" y1=\"485.6797\" x2=\"390.042\" y2=\"485.6797\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".7473\" stop-color=\"#F9F9F9\"/><stop offset=\"1\" stop-color=\"#D5D7D8\"/></linearGradient><path style=\"fill:url(#SVGID_12_);\" d=\"M-16.122-14.641\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M92.002,13.363c1.021,1.649,2.844,4.295,2.844,4.295s0.256,0.332,0.5,0.605l0.01-0.011c0.011-0.375-0.051-0.571-0.06-0.621l-0.091-0.274c-0.021-0.367,0.438,0.095,0.611,0.288c-0.498-0.754-0.659-0.811-0.659-0.811s-0.423-0.234-0.111,0.59c0.312,0.824-0.075,0.233-0.075,0.233c-0.924-1.177-2.838-4.293-2.838-4.293l-0.553-0.383L92.002,13.363L92.002,13.363z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M101.539,51.352c0.014-0.063,0.023-0.125,0.034-0.188c-0.004,0-0.009,0-0.009,0s0.005-0.03,0.013-0.089C101.563,51.17,101.551,51.262,101.539,51.352L101.539,51.352z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M100.822,35.679c0.088-0.033,0.188,0.1,0.188,0.1s0.135,0.189,0.289,0.033c0.107-0.104,0.155-0.353,0.025-1.257c-0.004,0.229-0.053,0.409-0.137,0.59c-0.139,0.296-0.314,0.02-0.441-0.081c-0.129-0.098-0.168,0.07-0.168,0.07l-0.004,0.162c0,0.7,0.087,2.346,0.217,3.617c0.063,0.605,0.173,1.071,0.287,1.408l0.041,0.076c0.089,0.148,0.188,0.343,0.307,0.255c0.116-0.089,0.274-0.582,0.274-0.582l0.128-0.591c0.191,0.113,0.291,0.529,0.341,0.962c-0.002-0.037-0.004-0.056-0.004-0.056s-0.144-1.324-0.3-1.313c-0.155,0.01-0.21,0.701-0.21,0.701s-0.066,0.468-0.157,0.456c-0.088-0.011-0.365,0.022-0.564-1.412c-0.201-1.436-0.158-2.949-0.158-2.949S100.732,35.713,100.822,35.679L100.822,35.679z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M99.696,28.566l0.298,0.341c0.479,1.494,0.996,3.843,1.092,4.264c-0.027-0.139-0.056-0.286-0.088-0.441c-0.288-1.454-0.711-2.896-1.006-3.832L99.696,28.566l-0.05-0.702c-0.004-0.01-0.006-0.016-0.006-0.016s-0.312-0.913-1.033-2.737c-0.725-1.824-0.848-2.458-0.848-2.458s-0.043-0.2,0.066-0.234c0.109-0.032,0.09-0.178,0.09-0.178s-0.013-0.245-0.277-0.99c-0.182-0.503-0.312-0.911-0.662-1.607c0.281,0.585,0.463,1.052,0.524,1.259l0.028,0.068c0,0,0.099,0.148,0.066,0.552c-0.027,0.403-0.146,0.452-0.146,0.452l0.022,0.14c0.141,0.538,0.418,1.187,0.418,1.187s1.065,2.709,1.748,4.54L99.696,28.566L99.696,28.566z\"/><linearGradient id=\"SVGID_13_\" gradientUnits=\"userSpaceOnUse\" x1=\"274.5342\" y1=\"-396.1577\" x2=\"255.2091\" y2=\"-490.1944\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_13_);\" d=\"M42.958,91.536c0.938,0.177,1.723,0.358,1.889,0.396C44.514,91.822,43.895,91.653,42.958,91.536z\"/><linearGradient id=\"SVGID_14_\" gradientUnits=\"userSpaceOnUse\" x1=\"422.5586\" y1=\"518.7568\" x2=\"427.2878\" y2=\"578.1768\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\".2198\" stop-color=\"#989A9C\"/><stop offset=\".2527\" stop-color=\"#FFF\"/></linearGradient><path style=\"fill:url(#SVGID_14_);\" d=\"M20.381,74.92l0.007-0.164l-0.052-0.08c0,0-1.874-3.375-1.676-4.615c0,0,0.069-0.827,1.241-1.187c0.817-0.25,0.71,0.538,3.112,0.976c0,0,2.07,0.557,2.611-0.946c0.539-1.507-0.566-3.394-0.566-3.394s-1.45-2.656-3.244-2.756c-0.95-0.055-0.692,0.583-2.125,0.924c0,0-1.913,0.185-2.519-0.963c-0.733-1.389-1.015-2.968-1.015-4.021c0-1.058,0.045-1.001,0.126-1.405c0.045-0.219,0.186-0.548,0.248-1.09l-0.134-0.675l0.204-0.499c0.002-0.26-0.004-0.535-0.021-0.83c-0.092-1.661-0.211-4.221-0.436-5.711c-0.223-1.491-0.633-3.799-1.991-3.865c0,0-0.671-0.052-1.636,0.885c-0.882,0.856-1.682-0.708-1.726-1.663c-0.052-1.121,0.131-2.255,0.409-2.795c0.277-0.541,1.042-0.566,1.186-0.554c0.146,0.012,0.555,0.17,1.042,0.474c0.489,0.304,1.161,0.304,1.558-0.092c0.395-0.395,0.948-0.856,1.173-2.598c0.225-1.741,0.225-3.547,0.013-5.71l-0.224-0.485l1.339-0.288c-0.001-0.016-0.021-0.125-0.032-0.195c0,0,0-0.001-0.001-0.002c-0.001-0.017-0.004-0.033-0.007-0.052c0-0.002,0-0.004,0-0.005c-0.003-0.019-0.007-0.038-0.009-0.057c-0.001-0.001-0.001-0.001-0.001-0.003c-0.003-0.022-0.006-0.042-0.009-0.062c0-0.001,0-0.001,0-0.001c-0.004-0.022-0.006-0.045-0.011-0.067c0-0.003-0.001-0.006-0.001-0.007c-0.002-0.022-0.006-0.045-0.008-0.068c-0.001-0.005-0.001-0.01-0.003-0.015c-0.002-0.023-0.005-0.047-0.009-0.069c-0.001-0.004-0.002-0.01-0.002-0.014c-0.003-0.026-0.007-0.05-0.012-0.076c0-0.002,0-0.005,0-0.005c-0.004-0.025-0.008-0.05-0.012-0.076c0-0.007-0.001-0.012-0.002-0.018c-0.002-0.024-0.006-0.052-0.009-0.079c-0.001-0.005-0.001-0.011-0.003-0.021c-0.004-0.027-0.006-0.053-0.01-0.081c-0.001-0.007-0.002-0.013-0.003-0.02c-0.003-0.028-0.005-0.057-0.009-0.087c-0.001-0.003-0.001-0.008-0.003-0.013c-0.003-0.028-0.005-0.056-0.009-0.082c-0.001-0.006-0.001-0.011-0.002-0.017c-0.003-0.031-0.006-0.06-0.01-0.091c-0.001-0.007-0.001-0.014-0.002-0.02c-0.004-0.03-0.006-0.062-0.011-0.09c0-0.007-0.001-0.015-0.002-0.022c-0.003-0.031-0.006-0.063-0.01-0.094c-0.001-0.006-0.002-0.011-0.002-0.018c-0.003-0.032-0.005-0.063-0.009-0.094c0-0.003,0-0.005-0.001-0.009c-0.003-0.033-0.004-0.068-0.009-0.1c0-0.005,0-0.013-0.001-0.02c-0.002-0.035-0.005-0.065-0.007-0.099c-0.001-0.008-0.001-0.015-0.002-0.021c-0.003-0.032-0.005-0.066-0.007-0.099c0-0.005-0.001-0.011-0.001-0.02c-0.002-0.033-0.006-0.068-0.007-0.101c0-0.003-0.001-0.008-0.001-0.009c-0.002-0.033-0.004-0.066-0.007-0.1c0-0.006,0-0.012,0-0.017c-0.001-0.032-0.003-0.068-0.005-0.1c0-0.008,0-0.014-0.001-0.022c-0.001-0.033-0.004-0.067-0.005-0.098c0-0.006,0-0.013,0-0.021c-0.002-0.033-0.003-0.066-0.004-0.101c0-0.005,0-0.008,0-0.013c-0.001-0.032-0.002-0.066-0.002-0.099c0-0.003,0-0.005,0-0.009c0-0.034-0.001-0.067-0.001-0.102c0-0.005,0-0.012,0-0.016c0-0.033,0-0.067,0-0.098c0-0.005,0-0.012,0-0.019c0.001-0.032,0.001-0.065,0.001-0.096c0-0.004,0.001-0.009,0.001-0.014c0-0.033,0.001-0.066,0.003-0.1c0.052-1.243,0.291-1.751,0.291-1.751l0.058-0.166c0,0,0.46-1.458,1.152-2.458l-0.011,0.024c0,0,0.446-0.738,1.231-0.816c0.785-0.077,1.003,0.158,1.371,0.202c0.04,0.004,0.078,0.008,0.115,0.013c0.013,0.001,0.025,0.002,0.037,0.004c0.025,0.002,0.051,0.003,0.074,0.006c0.014,0.001,0.028,0.002,0.042,0.003c0.021,0.001,0.043,0.002,0.064,0.004c0.014,0.001,0.028,0.001,0.041,0.002c0.02,0.001,0.04,0.002,0.058,0.002c0.013,0.002,0.026,0.002,0.04,0.002c0.021,0.001,0.037,0.002,0.055,0.002c0.014,0,0.026,0.001,0.039,0.001c0.016,0,0.034,0.001,0.051,0.001c0.011,0,0.023,0,0.034,0c0.017,0,0.032,0,0.05-0.001c0.01,0,0.02,0,0.032-0.001c0.016,0,0.031,0,0.046-0.001c0.011,0,0.02-0.001,0.03-0.001c0.015,0,0.03-0.002,0.045-0.002c0.009,0,0.017-0.001,0.026-0.001c0.015-0.001,0.03-0.003,0.044-0.004c0.006-0.001,0.016-0.002,0.022-0.002c0.016-0.001,0.03-0.002,0.044-0.004c0.007-0.001,0.014-0.001,0.019-0.002c0.016-0.002,0.03-0.004,0.045-0.007c0.006,0,0.009,0,0.014-0.001c0.019-0.002,0.036-0.006,0.052-0.008l0,0c0.035-0.008,0.068-0.014,0.098-0.021c0,0,0-0.002,0.002-0.002c0.012-0.002,0.025-0.005,0.039-0.01c0.002,0,0.004-0.001,0.007-0.001c0.01-0.003,0.02-0.006,0.029-0.009c0.003-0.001,0.007-0.002,0.01-0.004c0.009-0.002,0.018-0.006,0.026-0.008c0.002-0.002,0.005-0.003,0.008-0.003c0.008-0.003,0.015-0.006,0.021-0.009c0.003-0.001,0.006-0.003,0.009-0.004c0.006-0.003,0.014-0.004,0.02-0.009c0.003-0.001,0.006-0.002,0.008-0.003c0.005-0.002,0.012-0.005,0.019-0.007c0.001-0.002,0.003-0.003,0.005-0.004c0.005-0.004,0.01-0.005,0.015-0.008c0.003-0.001,0.004-0.003,0.008-0.003c0.004-0.002,0.008-0.005,0.012-0.008c0,0,0.004,0,0.005-0.002c0.004-0.003,0.008-0.006,0.012-0.008c0.001-0.002,0.002-0.002,0.004-0.003c0.003-0.003,0.007-0.004,0.01-0.008c0.002,0,0.002,0,0.002-0.002c0.003-0.001,0.007-0.005,0.011-0.008c0,0,0.001,0,0.001-0.001c0.004-0.002,0.005-0.004,0.009-0.007h0.001c0.002-0.002,0.004-0.004,0.006-0.007c0.001-0.001,0.002-0.001,0.003-0.002s0.002-0.002,0.002-0.002c0.001-0.003,0.001-0.003,0.003-0.005c0.002-0.002,0.004-0.004,0.004-0.004c0.328-0.241,0.591-0.516,0.797-0.775c0.014-0.017,0.026-0.034,0.04-0.05c0.002-0.004,0.005-0.009,0.008-0.012c0.013-0.016,0.026-0.032,0.038-0.05c0.002-0.003,0.006-0.006,0.007-0.01c0.012-0.018,0.025-0.032,0.038-0.05c0,0,0,0,0.001,0c0.039-0.055,0.075-0.109,0.109-0.159c0-0.003,0.002-0.006,0.003-0.008c0.01-0.015,0.021-0.028,0.03-0.044c0.001-0.003,0.004-0.007,0.007-0.01c0.008-0.016,0.017-0.029,0.024-0.042c0.002-0.004,0.005-0.009,0.009-0.013c0.008-0.014,0.017-0.028,0.023-0.042c0.001-0.001,0.001-0.002,0.002-0.002c0.017-0.028,0.032-0.055,0.046-0.079c0.002-0.003,0.004-0.008,0.006-0.013c0.006-0.01,0.01-0.021,0.017-0.029c0.003-0.007,0.007-0.014,0.012-0.02c0.004-0.008,0.009-0.017,0.014-0.024c0.002-0.008,0.006-0.017,0.01-0.023c0.004-0.007,0.009-0.016,0.012-0.023c0.004-0.006,0.006-0.014,0.011-0.021c0.002-0.006,0.007-0.013,0.01-0.021c0.066-0.128,0.097-0.205,0.097-0.205c0.593-1.459,0.052-2.936-0.21-3.225c-0.32-0.353-1.041-0.882-1.041-0.882s-0.288-0.241-0.751-0.144c0.349-0.049,0.791,0.091,0.966,0.558c0.277,0.734,0.376,1.335,0.212,2.33c0,0-0.26,1.387-1.384,2.233c-1.125,0.848-1.923,0.096-2.885,0.13c-0.962,0.032-1.516,0.701-1.809,1.157c-0.293,0.457-1.417,2.2-1.319,5.067c0.097,2.868,0.291,4.301,0.325,5.558c0.033,1.205,0.178,3.976-0.635,5.278c-0.815,1.303-1.628,0.65-2.2,0.309c-0.571-0.341-1.223-0.245-1.744,0.131c-0.521,0.375-0.833,1.124-0.848,3.324c-0.016,2.364,1.532,2.606,1.532,2.606s0.293,0.146,0.945-0.537c0,0,0.651-0.685,1.253-0.603c0.604,0.082,0.995,0.716,1.255,1.808c0.261,1.092,0.796,5.621,0.717,8.668c-0.034,1.271-0.62,1.286-0.36,3.617c0,0,0.409,3.13,1.401,4.089c0.995,0.962,2.378,0.781,2.706,0.75c0.324-0.032,0.7-0.26,0.7-0.26s0.309-0.197,0.537-0.374c0.23-0.182,0.522-0.428,1.011-0.277c0.489,0.146,1.645,0.896,2.557,2.571c0.915,1.678,0.496,3.317-0.26,3.521c-0.668,0.182-0.848,0.229-1.971-0.05c-1.124-0.274-1.451-0.567-1.957-0.766c-0.504-0.196-1.043-0.263-1.547,0.114c-0.505,0.373-1.345,1.057-0.343,3.32c0.961,2.174,1.692,3.797,3.518,5.623c-0.522-0.607-0.956-1.188-1.427-1.871L20.381,74.92L20.381,74.92z\"/><linearGradient id=\"SVGID_15_\" gradientUnits=\"userSpaceOnUse\" x1=\"237.3721\" y1=\"-388.3604\" x2=\"218.8474\" y2=\"-478.5023\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_15_);\" d=\"M22.494,7.387l-0.05,0.025C22.45,7.41,22.469,7.401,22.494,7.387z\"/><linearGradient id=\"SVGID_16_\" gradientUnits=\"userSpaceOnUse\" x1=\"259.9063\" y1=\"-479.3379\" x2=\"259.8987\" y2=\"-479.3752\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_16_);\" d=\"M46.028,92.85c0.13,0.014,0.26,0.026,0.391,0.041c-0.114-0.016-0.31-0.039-0.561-0.074C45.916,92.828,45.972,92.838,46.028,92.85L46.028,92.85z\"/><path style=\"fill:#9FA2A3;\" d=\"M24.089,5.489c-0.649,0.36-0.7-0.016-1.141,0.017c-0.439,0.033-1.026,0.212-1.596,1.043c-0.571,0.831-0.586,1.89,0.326,1.417c0,0,0.436-0.428,0.815-0.579c0.081-0.043,0.24-0.126,0.406-0.174l0.144-0.117c0,0,0.424-0.491,1.073-0.333c0.648,0.156,1.119-0.129,1.119-0.129c1.01-0.761,1.655-2.184,1.655-2.184l0.987-1.998l-0.826-1.336c0,0-0.698,1.489-1.383,2.53C24.986,4.692,25.033,4.972,24.089,5.489L24.089,5.489z\"/><path style=\"fill:#9FA2A3;\" d=\"M19.871,16.292c0,0-0.424,1.89,1.156,1.597c0,0,0.006-0.002,0.022-0.007c-0.062,0.003-0.089-0.006-0.089-0.006c-0.025-0.497,0.149-1.432,0.49-2.261c0.341-0.83,1.075-2.254,1.075-2.254s1.047-1.791,1.467-2.89c0.42-1.102,0.416-1.939,0.416-1.939s-0.8-1.019-0.915-1.176c-0.115-0.157-0.272-0.223-0.272-0.223c-0.054,0.019-0.103,0.036-0.146,0.051c0.115-0.007,0.221,0.021,0.283,0.114c0.213,0.31-0.39,2.036-0.39,2.036s-0.522,1.238-1.548,3.03C20.393,14.157,19.871,16.292,19.871,16.292L19.871,16.292z\"/><linearGradient id=\"SVGID_17_\" gradientUnits=\"userSpaceOnUse\" x1=\"268.9033\" y1=\"-394.6382\" x2=\"249.4966\" y2=\"-489.0725\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_17_);\" d=\"M38.185,89.697l0.166,0.02c-0.134-0.119-0.305-0.236-0.497-0.347c0.184,0.113,0.489,0.358,0.312,0.665c-0.245,0.424-0.048,0.457,0.489,0.863c0,0,0.022,0.013,0.061,0.033c-0.156-0.107-0.253-0.234-0.156-0.362c0.125-0.166,0.136-0.334,0.065-0.499L38.185,89.697L38.185,89.697z\"/><linearGradient id=\"SVGID_18_\" gradientUnits=\"userSpaceOnUse\" x1=\"254.4561\" y1=\"-391.5991\" x2=\"235.0337\" y2=\"-486.1104\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_18_);\" d=\"M24.437,82.749c-1.245-1.185,1.595-0.118,1.595-0.118s0.619,0.262,0.343-0.385c-0.246-0.57-1.373-1.963-2.543-3.219l0.144,0.156c0,0,2.346,2.721,2.183,2.966c-0.164,0.245-1.108-0.325-1.108-0.325s-1.401-0.539-1.206,0.13c0.143,0.491,1.059,1.271,1.536,1.649C25.109,83.372,24.798,83.09,24.437,82.749z\"/><linearGradient id=\"SVGID_19_\" gradientUnits=\"userSpaceOnUse\" x1=\"262.6514\" y1=\"-392.9692\" x2=\"243.1559\" y2=\"-487.8355\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_19_);\" d=\"M26.977,84.73c0.424,0.256,0.903,0.513,1.365,0.676c0,0,0.831,0.293,1.337-0.114c0.503-0.403,0.503-0.601,1.238-0.243c0,0,1.388,0.696,2.382,1.444c0.98,0.735,3.557,2.336,4.396,2.791c-0.764-0.417-3.712-2.365-4.633-2.99c-0.936-0.633-2.574-1.698-3.297-1.476c-0.554,0.172-0.474,0.396-0.804,0.555c-0.331,0.158-0.688,0.055-1.504-0.383C27.291,84.9,27.134,84.818,26.977,84.73L26.977,84.73z\"/><linearGradient id=\"SVGID_20_\" gradientUnits=\"userSpaceOnUse\" x1=\"271.5479\" y1=\"-390.9575\" x2=\"251.1904\" y2=\"-490.0176\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_20_);\" d=\"M39.903,91.448c0.37,0.104,0.672,0.06,0.787,0.035c-0.678,0.04-1.35-0.269-1.35-0.269s-0.067-0.021-0.165-0.061C39.413,91.268,39.689,91.385,39.903,91.448z\"/><linearGradient id=\"SVGID_21_\" gradientUnits=\"userSpaceOnUse\" x1=\"274.6582\" y1=\"-395.8442\" x2=\"255.2559\" y2=\"-490.2569\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#E4E5E6\"/></linearGradient><path style=\"fill:url(#SVGID_21_);\" d=\"M44.293,92.169c0,0-1.344-0.163-1.939-0.163c0,0-0.037,0.064,0.226,0.158c-0.021-0.021-0.031-0.049,0.189,0c0.304,0.064,2.018,0.225,2.465,0.158c0.448-0.068-0.091-0.278-0.091-0.278s-0.088-0.041-0.267-0.102C44.553,92.201,44.293,92.169,44.293,92.169L44.293,92.169z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M4.662,62.045c0.085,0.143,0.198,0.432,0.462,0.725c0.146,0.16,0.266,0.072,0.162-0.525c-0.253-0.182-0.407-0.318-0.464-0.371c-0.113-0.013-0.263-0.297-0.263-0.297s-0.471-0.835-0.274-0.227c0.398,1.23,1.6,3.821,1.6,3.821l1.396,2.47c-0.999-1.803-2.299-4.633-2.44-5.013C4.691,62.223,4.577,61.904,4.662,62.045L4.662,62.045z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M1.547,32.696l0.032-0.643c0.027-0.122,0.057-0.241,0.087-0.36c0.712-2.789,1.069-3.858,1.425-4.649c0.356-0.792,0.398-0.245,0.398-0.245s0,0.209,0.136,0.234c0.135,0.023,0.324-0.32,0.494-0.826c0.17-0.504,0.604-1.745,0.693-2.212c0.135-0.704-0.051-0.358-0.115-0.354c-0.108,0.005-0.126-0.091-0.113-0.306c0,0,0.382-2.122,3.064-6.563c0.18-0.17,0.321-0.307,0.47-0.449c-0.055-0.052-0.033-0.265,0.001-0.32c0.136-0.214,0.275-0.435,0.422-0.661l-0.09,0.504c0,0-1.85,2.492-3.104,5.694c0,0-0.342,0.835-0.359,1.094c-0.025,0.154-0.104,0.739,0.152,0.582l0.065-0.048c-0.093,0.484-0.295,1.37-0.607,2.325c-0.288,0.878-0.573,1.633-0.841,2.078l-0.002-0.004c-0.08,0.067-0.098-0.016-0.146-0.21c-0.048-0.198-0.113-0.198-0.113-0.198c-0.179,0-0.324,0.202-0.41,0.359c-0.04,0.056-0.089,0.19-0.089,0.19s-0.461,0.934-1.281,4.26c-0.822,3.328-0.836,6.14-0.836,6.14s-0.084,1.309-0.21,1.379c-0.126,0.07-0.097-0.056-0.097-0.056s-0.045-0.052-0.114,0.045c0,0,0.02-0.76,0.044-0.875c0,0,0.041-0.206,0.119-0.206s0.006,0.125,0.048,0.16c0.039,0.032,0.084,0.03,0.075-0.178c-0.005-0.176,0.147-2.816,0.621-5.312L1.547,32.696L1.547,32.696z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M0.392,41.994c0-0.002,0-0.004,0-0.005c0,0,0.018,0.217,0.042,0.356l-0.003,0.01c0.078,0.357,0.187,0.357,0.187,0.357c0.008-0.096,0.087-0.273,0.183-0.458c0.007,0.106,0.007,0.231-0.004,0.375c-0.037,0.537-0.019,2.466,0.209,4.28c0.225,1.815,0.367,3.349,0.394,3.594c0.029,0.245,0.498,3.283,1.025,5.089c0.285,0.967,0.422,1.344,0.483,1.424l0.008,0.049c0,0,0.097,0.184,0.348,0.32c0,0,0.111-0.097,0.112-0.412c0.018,0.031,0.037,0.065,0.057,0.105c-0.083,0.262-0.105,0.426-0.105,0.426l0,0c-0.042-0.043-0.06-0.031-0.046,0.045c0.067,0.357,0.027,0.68-0.169,0.272c-0.198-0.403-0.8-1.832-1.307-4.251c0,0-0.531-2.659-0.795-5.084l0.042-0.105L0.989,48.29c-0.027-0.248-0.048-0.491-0.067-0.729c0,0-0.255-3.657-0.237-4.562c0.019-0.904-0.085-0.02-0.085-0.02s-0.021,0.219-0.028,0.329c-0.008,0.109-0.103,0.352-0.136-0.246C0.459,43.322,0.392,42.261,0.392,41.994L0.392,41.994z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M24.672,1.974l-0.53-0.753l-0.066-0.065c0,0-0.131-0.136-0.896,0.038l-0.11,0.022c0,0,0.38-0.094,0.168,0.191c-0.212,0.285-0.56,0.496-1.172,1.15c-0.612,0.655-0.411,0.803-0.01,0.668c0.401-0.138,1.188-0.499,2.606-1.243L24.672,1.974z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M23.106,1.21c-0.022,0.003-0.036,0.006-0.036,0.006L23.106,1.21z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M23.637,1.811c0.31-0.272,0.429-0.484,0.454-0.641l-0.015-0.014c0,0-0.131-0.136-0.896,0.038l-0.075,0.015c0.09-0.015,0.303-0.032,0.133,0.198c-0.212,0.285-0.56,0.496-1.172,1.151c-0.612,0.656-0.411,0.803-0.01,0.667c0.106-0.038,0.239-0.088,0.4-0.157C22.599,2.755,23.046,2.325,23.637,1.811z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M83.482,4.115l-0.2,0.235c0,0,0.136,0.081,0.208,0.141c0.008,0.005,0.014,0.01,0.021,0.012c-0.043-0.034-0.07-0.056-0.07-0.056c-0.023-0.109,0.004-0.223,0.014-0.297L83.482,4.115c0,0,0.055,0.002,0.143,0.011L83.482,4.115L83.482,4.115z\"/><path style=\"opacity:.53;fill:#FFF;\" d=\"M62.559,90.319c0,0,1.686-0.187,3.239-0.691c1.558-0.504,1.935-0.981,1.874-1.341c-0.037-0.238-0.396-0.305-0.906-0.238c0.271-0.021,0.514,0.032,0.354,0.332c-0.313,0.582-0.861,0.782-0.861,0.782s-0.267,0.19-0.89,0.371c-0.806,0.245-1.794,0.375-2.335,0.438c-0.691,0.082-0.521-0.033-1.465,0.291c-0.023,0.016-0.047,0.025-0.065,0.043c-0.289,0.237,1.071,0.514,1.071,0.514s1.302,0.361,3.257,0.23l0.067-0.021c0.267-0.078,0.533-0.161,0.8-0.245c-2.021,0.457-3.324,0.149-3.737,0.095c-0.434-0.058-0.777-0.144-0.88-0.359C61.98,90.305,62.559,90.319,62.559,90.319L62.559,90.319z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M63.301,4.417l0.717,0.076c1.429-0.405,2.651-0.776,2.651-0.776s1.265-0.41,1.901-0.636c0.635-0.227,1.09-0.313,1.656-0.41c0.563-0.096,1.309-0.14,1.709-0.131c0.398,0.007,0.528,0.122,0.528,0.122s0.166,0.131,0.245,0.27c0.077,0.138,0.74,1.891,2.975,2.005c2.231,0.112,2.261-1.096,2.063-1.464c-0.226-0.427-0.896-0.863-0.896-0.863s-0.898-0.575-1.09-0.846c-0.192-0.271,0.033-0.358,0.104-0.376c0.066-0.018,2.433-0.497,2.729-0.608l0.021-0.02l-0.563-0.174c0,0-0.119,0.134-0.789,0.312c-0.67,0.179-1.233,0.246-1.742,0.313c-0.504,0.067-0.504,0.239-0.504,0.239l-0.879,1.406c0,0-0.029,0.104,0.043,0.305c0.073,0.202,0.41,0.448,0.41,0.448s0.573,0.424,0.99,0.699c0.418,0.275,0.395,0.373,0.395,0.373c-1.123,0.095-1.418-0.048-1.875-0.276c-0.445-0.223-0.76-0.729-0.922-1.086c-0.162-0.357-0.521-0.663-0.521-0.663c-0.589-0.336-1.696-0.343-2.813-0.15c-1.115,0.194-2.656,0.707-2.923,0.812c-0.271,0.104-1.616,0.551-2.309,0.729c-0.694,0.179-1.224,0.357-1.646,0.47c-0.426,0.11-3.431,1.005-4.557,1.339c-1.124,0.333-1.848,0.461-1.848,0.461c-1.688,0.171-2.193-0.134-2.193-0.134c-0.297-0.125-0.262-0.527-0.262-0.527l0.009-1.147c0,0-0.029-0.433-0.356-0.611c-0.328-0.179-0.779-0.252-1.593-0.29c-0.811-0.038-1.683,0.044-2.093,0.134c-0.408,0.09-1.19,0.313-1.764,0.952c-0.573,0.641-0.481,1.141-0.481,1.141s0.035,0.683,0.088,1.19c0.052,0.504,0.484,0.662,0.484,0.662s-0.744,0.532-3.045,1.206c-2.209,0.648-3.682,0.774-3.682,0.774l0.678,0.254c0,0,5.468-1.015,7.148-2.616c0,0,0.624-0.293,0.02-0.88c-0.606-0.585-0.897-0.761-0.897-0.761s-0.41-0.224,0.019-0.771c0.43-0.547,0.923-0.795,1.352-0.933c0.429-0.138,1.753-0.25,2.925-0.093c0,0,0.491,0.041,0.459,0.408c-0.034,0.366-0.088,0.872-0.077,1.028c0.008,0.158,0.023,0.515,0.398,0.845c0.378,0.332,1.099,0.453,1.099,0.453s1.257,0.228,2.843-0.217c1.584-0.445,3.642-1.14,5.431-1.629L63.301,4.417L63.301,4.417z\"/><path style=\"fill:#232323;\" d=\"M-16.122-14.641\"/><path style=\"fill:#616161;\" d=\"M48.462,6.628c0.31,0.207,0.476,0.221,0.5,0.421c0.055,0.339-0.56,0.64-0.56,0.64l-0.006-0.011c0,0-0.431-0.157-0.484-0.664c-0.052-0.505-0.088-1.19-0.088-1.19s0.001,0.2,0.046,0.26C48.004,6.256,48.087,6.378,48.462,6.628z\"/><path style=\"opacity:.17;fill:#FFF;\" d=\"M82.447,79.307l0.451,0.17c1.104-0.617,1.496-0.809,1.759-0.963c1.183-0.703,2.592-1.563,2.963-1.855c0,0,0.761-0.518,0.116,0.195s-0.969,1.007-0.969,1.007s-0.625,0.626-0.471,0.782c0,0,0.166,0.246,1.193-0.687c1.023-0.929,2.15-2.258,2.275-2.44c0.127-0.188,0.146-0.293,0.146-0.293s0.107-0.215,0.273-0.393c0.145-0.15,1.377-1.496,1.994-2.121c0,0,0.002,0.001,0.006,0.003c0.273-0.362,0.541-0.729,0.806-1.102c-0.358,0.379-1.724,1.829-2.483,2.684c0,0-0.713,0.763-0.938,1.056s-0.225,0.47-0.225,0.47s-0.117,0.196-0.392,0.519s-1.24,1.186-1.24,1.186s-0.577,0.47-0.754,0.478c-0.179,0.011,0.431-0.538,0.431-0.538s0.588-0.625,0.967-1.123c0.382-0.498,0.137-0.47,0.137-0.47s-0.186-0.049-0.986,0.459c-0.8,0.508-1.367,0.858-1.367,0.858s-1.722,0.986-2.814,1.623c-1.096,0.636-3.6,1.908-5.021,2.492c-1.43,0.588-2.162,0.715-2.035,0.527c0.127-0.186,0.461-0.459,0.461-0.459s0.399-0.4,0.399-0.803c0,0,0.128-0.586-1.604-0.223c-1.729,0.36-3.293,1.213-3.293,1.213s-2.571,1.182-1.965,1.887c0,0,0.117,0.186,0.635,0.352c0.52,0.166-0.92,0.606-0.92,0.606c-1.365,0.448-2.413,0.651-3.74,0.926c-1.963,0.403-3.564,0.761-4.165,0.894c-0.165,0.035-0.253,0.059-0.253,0.059s-1.212,0.292-3.229,1.072c-2.015,0.783-5.972,1.43-5.972,1.43s-2.542,0.293-2.777,0.627c-0.234,0.331,0.177,0.499,0.177,0.499s0.362,0.224,1.671,0.283c0,0,0.451,0,0.471,0.036c0.018,0.039,0.046,0.068-0.235,0.156c-0.286,0.088-0.854,0.314-2.778,0.558c-1.936,0.245-1.896-0.067-1.896-0.067s-0.01-0.076,0.078-0.216c0.087-0.134,0.009-0.369-0.293-0.535c0,0-0.419-0.272-1.829-0.262c-1.408,0.009-4.212,0.017-6.833-0.14c-2.374-0.143-5.59-0.551-6.099-0.664c0,0-0.117-0.029-0.206-0.117c-0.088-0.09-0.646-0.422-1.164-0.733c-0.517-0.313-2.073-0.907-2.073-0.907s-2.011-0.783-1.945-0.521c0.015,0.063,0.13,0.153,0.268,0.246c0.351,0.188,0.704,0.375,1.06,0.56l0.002-0.002c0,0-0.743-0.402-0.538-0.402s0.438,0.109,0.438,0.109s1.213,0.332,1.966,0.686c0.753,0.353,1.407,0.83,1.407,0.83s0.929,0.549,2.319,0.732c1.346,0.182,3.174,0.389,3.777,0.448l0.594-0.272l0.433,0.354c1.106,0.068,2.575,0.146,2.575,0.146s2.976,0.111,4.605-0.019c0.733-0.063,0.507,0.317,0.507,0.317s-0.214,0.354,0.206,0.529c0,0,0.771,0.439,3.343,0.157c2.573-0.286,3.138-0.862,3.138-0.862s0.299-0.275-0.351-0.398c-0.513-0.1-0.513-0.051-1.175-0.117c-0.665-0.067-0.998-0.205-0.557-0.323c0.441-0.114,1.174-0.175,1.174-0.175s2.249-0.313,4.066-0.783c0,0,1.938-0.458,3.861-1.134c0.756-0.265,1.395-0.459,1.887-0.599l0.438-0.644l0.644,0.372c0.065-0.014,0.103-0.021,0.103-0.021s2.306-0.539,3.274-0.703c0.966-0.168,3.154-0.637,4.087-1.086c0.928-0.448,1.396-0.805,1.505-1.075c0.107-0.272-0.393-0.431-0.393-0.431s-0.588-0.138-0.508-0.34c0.075-0.205,0.293-0.382,1.213-0.793c0.918-0.41,2.07-0.859,3.227-1.144c1.154-0.282,0.732,0.194,0.732,0.194s-0.692,0.705-0.783,0.979c-0.086,0.273,0.029,0.285,0.119,0.333c0.088,0.05,0.646,0.028,1.022-0.067c0.383-0.099,3.464-1.271,5.341-2.347c0.049-0.026,0.094-0.054,0.139-0.08L82.447,79.307z\"/><linearGradient id=\"SVGID_22_\" gradientUnits=\"userSpaceOnUse\" x1=\"221.1826\" y1=\"-454.5649\" x2=\"221.373\" y2=\"-454.5649\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#808080\"/><stop offset=\".0868\" stop-color=\"#7A7A7A\"/><stop offset=\".36\" stop-color=\"#6B6B6B\"/><stop offset=\".5192\" stop-color=\"#686868\"/><stop offset=\".6377\" stop-color=\"#5F5F5F\"/><stop offset=\".7431\" stop-color=\"#4E4E4E\"/><stop offset=\".8408\" stop-color=\"#383838\"/><stop offset=\".9324\" stop-color=\"#1B1B1B\"/><stop offset=\"1\" stop-color=\"#000\"/></linearGradient><path style=\"opacity:.68;fill:url(#SVGID_22_);\" d=\"M7.432,68.01l0.178,0.131c-0.105-0.099-0.167-0.155-0.167-0.155s-0.008,0.003-0.024,0.003C7.423,67.993,7.429,68.002,7.432,68.01L7.432,68.01z\"/><linearGradient id=\"SVGID_23_\" gradientUnits=\"userSpaceOnUse\" x1=\"221.4043\" y1=\"-449.8027\" x2=\"316.0254\" y2=\"-449.8027\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#808080\"/><stop offset=\".0868\" stop-color=\"#7A7A7A\"/><stop offset=\".3817\" stop-color=\"#828282\"/><stop offset=\".5185\" stop-color=\"#808080\"/><stop offset=\".5677\" stop-color=\"#797979\"/><stop offset=\".6027\" stop-color=\"#6E6E6E\"/><stop offset=\".608\" stop-color=\"#6B6B6B\"/><stop offset=\"1\" stop-color=\"#4E4E4E\"/></linearGradient><path style=\"opacity:.43;fill:url(#SVGID_23_);\" d=\"M90.412,59.954l-0.371-0.021c-1.807,1.463-2.342,1.938-3.781,2.955c0,0-1.644,1.228-3.44,2.196c-1.804,0.97-3.919,0.853-3.919,0.853s-0.573-0.062-0.295-0.477c0.275-0.415,0.634-1.425,0.771-1.938c0.141-0.516,0.415-1.82-0.633-2.235s-3.018,0.196-3.018,0.196s-4.525,1.205-6.371,3.23c-1.793,1.969-0.286,2.846-0.286,2.846s0.702,0.49,1.386,0.73c0.645,0.229,0.516,0.436,0.354,0.555c0,0-2.021,1.287-4.408,1.974c0,0-3.268,1.001-6.441,1.206c-3.154,0.203-4.495,0.283-4.495,0.283l-0.399,0.379l-0.758-0.252c-1.283,0.154-3.455,0.463-5.596,0.979c-2.622,0.64-5.123,1.147-6.903,2.296c0,0-1.333,0.887-0.566,1.746c0.765,0.862,1.565,1.23,1.565,1.23s0.472,0.207,0.464,0.336c-0.009,0.164-0.015,0.309-0.367,0.512c0,0-1.394,0.814-4.108,0.859c-2.714,0.045-3.911,0.021-4.707-0.695c-0.658-0.591,0.165-1.844,0.165-1.844s0.33-0.612,0-1.453c-0.33-0.84-2.218-0.854-2.218-0.854l-2.615-0.134c-3.095-0.081-7.182-0.427-9.001-0.653c0,0-0.012-0.002-0.033-0.006l-0.006,0.166l-0.721-0.303c-1.139-0.221-3.243-0.668-4.075-1.084c-0.759-0.38-1.167-0.313-1.066-1.102c0.101-0.769-0.753-1.836-0.753-1.836s-1.188-1.287-2.257-2.086c-1.069-0.804-1.523-0.564-1.523-0.564s-0.484,0.258-0.049,1.296c0.436,1.04,0.86,1.403,0.86,1.403s0.208,0.22,0.089,0.279c-0.118,0.06-0.484-0.219-0.789-0.478c-0.253-0.21-1.885-1.742-2.456-2.276l0.105,0.356c0.019,0.028,0.035,0.062,0.052,0.086c0.184,0.291,0.855,1.269,2.155,2.28c1.549,1.213,1.559,0.729,1.559,0.729s0.061-0.399-0.297-0.84c-0.359-0.44-0.934-1.373-0.791-1.715c0.144-0.339,0.309-0.31,0.309-0.31s0.133-0.051,0.596,0.299c0.462,0.351,1.498,1.076,2.011,1.703c0.513,0.623,0.48,1.181,0.48,1.181s-0.102,0.563,0.453,1.17c0.553,0.604,1.733,1.714,5.859,2.351c0.025,0.004,0.034,0.006,0.059,0.01l0.193-0.551l0.573,0.663c3.598,0.521,5.555,0.563,5.555,0.563s4.709,0.162,5.982,0.162c1.272,0,1.035,0.666,1.035,0.666s-0.072,0.359-0.225,0.646c-0.155,0.287-0.524,1.365-0.144,1.939c0,0,0.585,1.427,4.381,1.527c0,0,3.324,0.268,5.643-0.688c2.319-0.954,0.226-2.275,0.226-2.275s-0.794-0.481-1.13-0.739c-0.308-0.234-0.184-0.481-0.121-0.646c0.06-0.162,0.297-0.359,0.563-0.492c0.266-0.134,1.239-0.654,5.365-1.722c4.124-1.069,6.587-1.183,6.587-1.183s0.02-0.002,0.055-0.004l0.338-0.656l0.854,0.556c0.732-0.06,1.681-0.129,2.526-0.171c1.691-0.082,4.341-0.471,5.879-0.807c1.54-0.343,3.869-1.062,5.592-1.951c1.725-0.895,1.809-1.519,1.809-1.519s0.328-0.475-0.392-0.995c-0.719-0.523-1.036-0.382-1.673-1.027c-0.637-0.646,0.557-1.62,0.557-1.62s0.612-0.861,4.021-2.175c3.403-1.313,3.979-0.873,4.153-0.729s0.195,0.615,0.123,0.935c-0.069,0.317-0.494,1.455-0.721,2.053c-0.227,0.594-0.316,1.406,0.605,1.601c0.923,0.194,2.215-0.008,3.428-0.442c2.893-1.033,3.756-2.295,8.534-5.764c0.012-0.008,0.021-0.017,0.03-0.021L90.412,59.954l0.689,0.108c1.978-1.573,3.869-3.571,3.869-3.571s1.258-1.261,1.889-2.356c0.595-1.026,0.027,0.89,0.027,0.89s-0.32,1.516,0.19,2.077c0.405,0.445,1.563-0.795,1.563-0.795s0.688-0.789,0.965-2.061c0.408-1.875,0.185-2.248,0.185-2.248s-0.246-0.389-0.093-0.852c0.154-0.459,1.158-3.047,1.98-4.01l0.502-0.563c0-0.008,0.002-0.02,0.002-0.027l-0.224-0.557l0.304-0.512c0,0-0.279,0.322-1.404,2.177c-1.266,2.087-1.467,3.771-1.467,3.771s-0.119,0.653-0.054,1.034c0.063,0.355,0.188,0.519,0.192,0.622c0.009,0.104-0.073,0.959-0.508,1.773c-0.438,0.814-0.815,1.031-0.815,1.031s-0.756,0.545-0.86,0.157c-0.104-0.39-0.074-0.72-0.035-0.966c0.035-0.248,0.289-1.579,0.252-2.072c-0.035-0.494-0.479-0.098-0.479-0.098s-0.104,0.119-0.298,0.366s-1.288,1.637-1.705,2.125c-0.988,1.157-1.886,1.989-4.292,3.93c-0.007,0.003-0.015,0.011-0.019,0.015L90.412,59.954L90.412,59.954z\"/><linearGradient id=\"SVGID_24_\" gradientUnits=\"userSpaceOnUse\" x1=\"214.5928\" y1=\"-431.356\" x2=\"314.4043\" y2=\"-431.356\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#555555\"/><stop offset=\"1\" stop-color=\"#231F20\"/></linearGradient><path style=\"opacity:.31;fill:url(#SVGID_24_);\" d=\"M1.193,48.543l0.104,0.975c0.235,0.285,0.577,0.677,1.071,1.187c1.084,1.121,1.427,0.416,1.427,0.416s0.253-0.705-0.054-1.985C3.434,47.85,3.488,47.09,4.066,47.11c0.578,0.019,2.258,0.361,2.782,1.752c0,0,0.217,0.649,0.018,1.479c-0.2,0.834-0.162,1.57-0.018,2.295c0.145,0.725,0.759,1.407,1.464,1.971c0.706,0.562,2.746,1.535,4.734,1.66c1.987,0.127,2.601,0.021,2.601,0.021l0.746-0.767l0.134,0.668c0.812-0.09,2.116-0.229,3.62-0.393c2.528-0.271,4.227-0.544,5.798-0.308c1.573,0.235,2.079,1.462,2.079,1.462s0.108,0.314-0.253,0.544c-0.349,0.224-0.749,0.547-0.948,0.89c-0.199,0.346-0.411,1.068,0.16,2.035c0.572,0.963,2.142,1.592,3.478,1.432c1.335-0.155,3.335-0.67,4.52-0.979c1.287-0.337,2.424-0.971,2.572-1.98c0.147-1.008-1.534-2.295-1.534-2.295s-0.812-0.609-0.91-0.75c-0.1-0.139,0.099-0.197,0.099-0.197s0.949-0.229,1.357-0.414c0.404-0.189,1.522-0.646,3.353-1.219s5.608-1.248,5.608-1.248s2.084-0.332,4.685-0.543l0.622-0.702l0.485,0.625c0.409-0.024,0.825-0.046,1.243-0.063c3.572-0.129,5.344-0.554,7.242-0.979c1.897-0.427,4.568-1.978,4.965-2.276c0.396-0.295,1.229-0.66,1.396-1.957c0.168-1.295-1.364-2.157-1.364-2.157s-1.218-0.644-1.475-0.93c-0.258-0.287-0.02-0.562-0.02-0.562s0.689-1.485,2.896-2.354c2.205-0.872,3.689-1.107,4.618-1.208c0.932-0.099,1.245,0.237,1.374,0.396c0.128,0.157,0.128,0.485,0.021,0.821c-0.102,0.308-0.444,1.038-0.645,1.395c-0.197,0.356-0.523,1.216-0.316,1.622c0.208,0.405,0.843,0.593,1.662,0.445c0.821-0.149,2.988-0.761,4.888-1.553c1.9-0.792,5.073-2.345,5.073-2.345s0.009-0.004,0.022-0.012l0.086-0.729l0.729,0.295c1.02-0.562,2.764-1.58,4.01-2.631c1.871-1.573,3.699-3.225,4.166-3.639c0.465-0.417,0.892-0.752,1.307-0.732c0.414,0.021,0.732,0.317,0.988,1.434c0.258,1.118,0.308,2.038,0.426,2.582c0.117,0.543,0.285,1.175,0.931,1.304c0.646,0.129,1.513-0.434,1.838-0.713c0.33-0.276,0.92-1.176,0.882-2.382c0,0,0.068-1.604-0.761-3.127c0,0-0.351-0.614-0.479-0.782c-0.088-0.118-0.155-0.238-0.01-0.525c0.148-0.286,0.467-0.821,1.062-1.156c0.448-0.256,0.88-0.316,1.128-0.396c0,0,0.275-0.067,0.626-0.261l-0.126-0.412l0.289,0.316c0.404-0.239,0.652,0.045,0.652,0.045l-0.392-0.501l0.119-0.484c0,0-0.304-0.163-0.685-0.088c-0.383,0.078-0.42,0.362-1.014,0.458c-0.593,0.096-1.275,0.306-1.945,1.319c-0.67,1.011,0,2.271,0,2.271s0.359,0.592,0.533,0.896c0.172,0.306,1.066,2.215,0.037,3.608c0,0-0.552,0.643-1.525,0.86c-0.86,0.19-0.642-0.816-0.729-1.355c0,0-0.129-2.281-1.237-3.588c-0.976-1.146-2.746,0.888-3.629,1.566c-0.822,0.629-3.228,3.112-6.684,4.925l-0.51,0.892l-0.324-0.472c-1.658,0.827-5.418,2.656-7.87,3.514c0,0-1.875,0.762-2.64,0.782c0,0-0.17,0.006-0.034-0.179c0.133-0.185,0.276-0.322,0.507-0.737c0.23-0.418,0.646-1.357,0.646-2.327c0-0.969-1.119-1.917-2.68-1.748c-1.561,0.167-3.052,0.6-4.849,1.292c-1.796,0.692-3.343,2.159-3.55,3.375c-0.209,1.216,1.105,1.92,1.105,1.92s1.484,0.751,1.674,1.157c0.188,0.406,0.049,0.783,0.049,0.783s-0.129,0.406-0.783,0.782c-0.649,0.377-2.42,1.287-2.42,1.287s-2.207,1.217-5.562,1.512c0,0-3.058,0.26-4.817,0.348c-0.022,0.002-0.046,0.002-0.069,0.003l-0.541,0.53l-0.587-0.449c-1.64,0.136-3.54,0.359-3.54,0.359s-4.29,0.609-8.219,1.822c-3.336,1.027-3.971,1.594-3.971,1.594s-0.711,0.596-0.118,1.453c0,0,0.341,0.539,1.03,1.08c0.685,0.541,1.237,1.057,1.159,1.317c-0.08,0.265-0.29,0.382-0.29,0.382s-0.961,0.856-4.894,1.518c0,0-2.531,0.488-3.31-0.275c-0.778-0.766-0.435-1.279-0.435-1.279s0.052-0.173,0.62-0.527c0,0,0.951-0.596,0.647-1.727c-0.303-1.135-2.129-2.545-4.101-2.533c0,0-2.303,0.006-8.196,0.762c0,0-0.008,0-0.027,0.005l-0.204,0.501l-0.605-0.393c-0.324,0.039-0.713,0.076-1.114,0.107c-1.012,0.07-2.477-0.057-4.3-0.596c-1.824-0.543-2.963-1.535-3.126-2.133c-0.114-0.412,0.035-0.996,0.035-0.996S7.62,50.2,7.405,49.115c-0.22-1.083-0.582-1.934-1.631-2.567c-1.048-0.632-1.643-0.522-1.643-0.522s-0.939-0.144-0.904,1.446c0.037,1.59,0.235,2.256,0.235,2.256s0.181,0.562-0.108,0.635c-0.288,0.072-0.74-0.361-0.74-0.361s-1.021-0.924-1.619-1.688l0.048,0.066l-0.214,0.525c0,0,0.067,0.115,0.266,0.375L1.193,48.543L1.193,48.543z\"/><linearGradient id=\"SVGID_25_\" gradientUnits=\"userSpaceOnUse\" x1=\"214.8965\" y1=\"-410.8818\" x2=\"306.501\" y2=\"-410.8818\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#A0A0A0\"/><stop offset=\".0769\" stop-color=\"#656767\"/><stop offset=\"1\" stop-color=\"#717375\"/></linearGradient><path style=\"opacity:.34;fill:url(#SVGID_25_);\" d=\"M91.075,11.742l0.183,0.846c0,0-0.563,0.313-1.678,0.613c-1.113,0.3-2.188,0.801-2.188,0.801s-0.89,0.289-0.551,1.013c0.338,0.726,0.838,1.076,0.838,1.076s0.711,0.69,0.736,1.213c0.021,0.526-0.199,0.765-0.764,1.076c-0.563,0.313-1.075,0.375-1.075,0.375s-1.338,0.24-2.001-0.387c-0.663-0.626-0.787-1.663-0.787-1.663s-0.05-0.876-1.148-1.251c-1.102-0.375-2.453,0.425-2.453,0.425s-1.063,0.563-2.2,1.3c-1.14,0.738-3.291,1.64-4.642,2.114l-0.152,0.699l-0.758-0.382c-1.422,0.489-3.271,1.109-3.271,1.109S66.652,21.645,65,21.871c-1.648,0.224-2.016-0.014-2.238-0.238c-0.228-0.224,0.039-1.012,0.039-1.012s0.674-1.376,0.348-2.09c-0.324-0.714-2.451-0.9-2.486-0.9c-0.04,0-2.318-0.265-4.451,0.932c-1.895,1.062-2.143,1.642-2.143,1.642s-0.604,0.938,0.113,1.867c0.807,1.051,1.879,1.146,1.879,1.146s1.021,0.079,1.258,0.38c0.24,0.299,0.076,0.626,0.076,0.626s-0.336,0.925-2.228,1.312c0,0-3.181,0.933-9.113,1.776l-0.582,0.579c-3.743,0.47-8.143,1.363-10.555,1.989c-2.412,0.627-2.553,1.317-2.553,1.317c-0.519,0.813,0.141,1.236,0.141,1.236s0.829,0.283,1.017,1.19c0.19,0.91-0.783,1.629-0.783,1.629s-1.159,0.972-2.898,1.269c-1.739,0.297-2.396,0.35-3.429-0.47c-0.91-0.721-0.298-1.863,0.312-2.301c0.612-0.438,0.909-0.91,0.988-1.112c0.079-0.204,0.032-0.377,0.032-0.377l-0.58-0.534c-2.005-1.33-9.883,0.063-9.883,0.063s0,0.002,0,0l-1.341,0.289l-0.673-0.435c0,0-2.291,0.604-4.876,0.589c-2.712-0.014-1.27-2.128-1.27-2.128s0.638-1.118,0.75-1.764c0,0,0.224-1.745-1.42-1.631c-1.645,0.112-1.968,1.546-1.968,1.546s-0.112,0.801-0.089,1.392c0.021,0.594-0.002,1.847-0.742,2.56c-0.737,0.713-1.529,0.495-1.529,0.495s-1.331-0.582-1.595-0.718c-0.274-0.142-0.517-0.151-0.751-0.066c-0.02,0.007-0.039,0.018-0.057,0.029l-0.175,0.75l0.025-0.623c-0.156,0.176-0.271,0.42-0.271,0.42l0.088,0.327l-0.248,0.565c-0.002,0.012-0.005,0.023-0.006,0.035l0.008,0.003c0,0,0.087-0.196,0.222-0.357l0.182-0.369L1.493,32.94c0.055-0.044,0.112-0.07,0.172-0.074c0.281-0.017,0.629,0.158,0.629,0.158s1.135,0.611,1.642,0.716s0.875-0.065,1.205-0.292c0.527-0.365,1.143-1.121,1.4-1.839c0.229-0.646,0.279-2.394,0.279-2.394l0.004,0.014c0,0,0-0.421-0.011-0.518c-0.012-0.098-0.075-0.553,0.204-0.783c0.278-0.234,0.459-0.347,1.144-0.364c0.68-0.017,0.886,0.38,0.886,0.38S9.28,28.269,9.28,28.48c0,0.21-0.068,0.34-0.068,0.34s-0.371,0.626-0.5,0.934c-0.13,0.307-0.636,1.323-0.489,2.177c0.148,0.852,1.479,1.251,1.479,1.251s1.062,0.25,2.575,0.027l3.12-0.503l0.543-0.624l0.218,0.474c0.805-0.147,2.14-0.369,3.583-0.511c2.326-0.228,4.787-0.262,5.821-0.132c0,0,0.484,0.061,0.405,0.234c-0.062,0.136-0.421,0.415-0.421,0.415s-0.135,0.081-0.654,0.667s-0.671,1.155-0.693,1.661c-0.024,0.505,0.516,1.995,2.415,2.394c1.901,0.397,4.077-0.341,4.077-0.341s1.427-0.314,2.786-1.674c1.41-1.411,0.012-3.108,0.012-3.108s-0.22-0.304-0.647-0.442c0,0-0.187-0.05-0.079-0.17c0.108-0.12,0.37-0.647,1.37-0.905c1-0.257,3.977-1.198,11.065-2.135l0.274-0.617l0.874,0.459c2.708-0.373,4.551-0.694,7.827-1.454c0,0,3.04-0.539,3.675-1.651c0.368-0.65,1.032-1.539-0.045-2.434c0,0-0.125-0.161-0.791-0.312c-0.666-0.151-1.179-0.252-1.738-0.653c-0.563-0.403-0.551-0.869-0.551-0.869s-0.047-0.445,0.862-0.958c0,0,0.851-0.623,2.54-1.158c1.691-0.533,3.648-0.296,3.648-0.296s0.82,0.089,0.685,0.643c-0.14,0.555-0.604,1.482-0.622,1.959c-0.021,0.474,0.012,1.027,0.938,1.414c0.931,0.386,2.267,0.266,2.267,0.266s1.386-0.069,3.647-0.801c2.265-0.731,4.594-1.573,4.594-1.573l-0.094-0.483l0.971,0.173c0.591-0.22,1.406-0.539,2.285-0.936c1.801-0.81,2.656-1.488,3.48-1.958c0,0,1.815-1.118,2.887-1.088c0,0,0.25-0.009,0.272,0.32c0.022,0.329,0.104,0.814,0.218,1.096c0.111,0.281,0.734,1.822,2.729,2.048c1.993,0.228,2.846-1.118,2.846-1.118s0.683-1.049-0.493-2.296c0,0-0.961-1.028-0.99-1.107c0,0-0.104-0.155,0.168-0.233c0.269-0.078,3.152-0.884,4.268-1.398c0,0,0.012-0.005,0.036-0.015l-0.271-0.485l0.535,0.365c0.202-0.101,0.449-0.246,0.544-0.395c0.171-0.271-0.054-0.797-0.054-0.797l0.006-0.007c-0.133-0.184-0.266-0.366-0.4-0.546l-0.606-0.256l-0.06,0.033L91.075,11.742\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M8.12,16.324l-0.291,0.435c0.134-0.023,0.244-0.056,0.244-0.056s0.404-0.066,1.112,0.12c0.917,0.244,2.067-0.496,2.067-0.496s0.872-0.523,1.274-1.381l0.361-1.005c0,0,0.291-0.972,1.105-1.281c0,0,0.317-0.171,0.831-0.177c0.513-0.005,0.392,0.354,0.392,0.354s-0.056,0.233-0.586,0.912c-0.529,0.677-0.671,1.196-0.671,1.196s-0.318,0.722,0.193,0.957c0,0,0.24,0.141,0.939-0.091c0.7-0.233,3.02-0.843,4.438-1.06l0.993-0.506c-0.313-0.23-0.602-0.444-0.602-0.444c-2.388,0.442-4.168,0.995-4.775,1.226c-0.609,0.23-0.62,0.082-0.62,0.082c-0.211-0.248,0.435-1.022,0.435-1.022s0.655-0.894,0.913-1.715c0.259-0.82-0.892-0.707-0.892-0.707c-0.758,0.121-1.303,0.48-1.93,1.236c-0.486,0.586-0.782,1.389-0.893,1.814c-0.071,0.267-0.193,0.515-0.193,0.515s-0.091,0.165-0.45,0.322c-0.416,0.182-1.228,0.396-1.228,0.396s-0.54,0.045-0.931-0.15c-0.24-0.118-0.901,0.05-0.901,0.05l0.091-0.504l-0.082-0.032l-0.683,0.383c-0.115,0.189-0.228,0.379-0.341,0.569c-0.063,0.146-0.179,0.475,0.044,0.51c0.05,0.008,0.113,0.008,0.164,0.008L8.12,16.324L8.12,16.324z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M13.295,9.19c0,0,0.342-0.271,0.342-0.026c0,0.248-0.333,0.69-0.333,0.69s-0.107,0.134-0.172,0.134C13.068,9.987,13.15,9.516,13.295,9.19L13.295,9.19z\"/><path style=\"fill:#232323;\" d=\"M-16.122-14.641\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M10.595,12.501c0,0-0.388,0.46,0,0.52l0.838-0.828c-0.037-0.037-0.054-0.055-0.157-0.112C11.277,12.081,10.752,12.343,10.595,12.501L10.595,12.501z\"/><path style=\"opacity:.3;fill:#FFF;\" d=\"M77.807,85.745c0,0-1.75,0.806-3.396,1.603c-1.647,0.803-2.25,1.14-2.25,1.14s-0.088,0.049-0.031,0.082c0.056,0.028-0.008,0.063-0.008,0.063c-0.847,0.409-2.703,1.07-2.703,1.07s-0.167,0.057-0.157,0.02c0.006-0.041,0.199-0.105,0.199-0.105s0.381-0.146,0.283-0.217c-0.098-0.072-1.21,0.305-1.21,0.305s-1.949,0.621-2.894,0.887c-0.941,0.269-2.75,0.735-2.75,0.735c-1.201,0.298-3.75,0.798-4.315,0.901c-0.562,0.104-0.417,0.064-0.417,0.064s0.492-0.189-0.411-0.226c-1.146-0.05-2.362,0.112-3.612,0.288c-1.25,0.18-1.178,0.324-1.178,0.324s-0.04,0.154,0.708,0.14c0.752-0.019,0.534,0.046,0.534,0.046c-1.396,0.202-4.2,0.238-4.2,0.238l0.005,0.01c0.456,0.014,0.916,0.018,1.376,0.018c0.608,0,1.218-0.01,1.822-0.031c0.241-0.021,1.483-0.15,1.925-0.244c0.486-0.105-0.093-0.105-0.093-0.105l-0.74-0.023c0,0-0.776-0.026-0.052-0.158c0.729-0.133,1.834-0.192,2.388-0.252c0.83-0.094,0.541,0.105,0.541,0.105l-0.04,0.023c0,0,0.014,0.094,0.528,0.066c0.515-0.024,4.721-0.804,7.069-1.487c2.347-0.688,4.102-1.255,4.102-1.255s0.157-0.055,0.066,0.025c-0.094,0.078-0.463,0.2-0.463,0.2s-0.595,0.3,0.844-0.108c0.066-0.02,0.134-0.039,0.197-0.06c1.234-0.469,2.446-0.983,3.635-1.543c0.029-0.028,0.131-0.146-0.021-0.101c-0.172,0.056,0-0.065,0.187-0.131c0.184-0.066,2.267-1.162,3.363-1.608l0.002,0.003c0.394-0.227,0.781-0.455,1.17-0.691L77.807,85.745L77.807,85.745z\"/><linearGradient id=\"SVGID_26_\" gradientUnits=\"userSpaceOnUse\" x1=\"217.6563\" y1=\"-436.751\" x2=\"217.6563\" y2=\"-436.751\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".078\" stop-color=\"#F4F4F4\"/><stop offset=\".3807\" stop-color=\"#CECECE\"/><stop offset=\".5396\" stop-color=\"#BFBFBF\"/><stop offset=\".8357\" stop-color=\"#7C7C7C\"/><stop offset=\".8996\" stop-color=\"#A8A8A8\"/><stop offset=\".9093\" stop-color=\"#9A9A9A\"/><stop offset=\".9327\" stop-color=\"#7D7D7D\"/><stop offset=\".9558\" stop-color=\"#686868\"/><stop offset=\".9785\" stop-color=\"#5B5B5B\"/><stop offset=\"1\" stop-color=\"#575757\"/></linearGradient><path style=\"fill:url(#SVGID_26_);\" d=\"M3.893,50.249L3.893,50.249L3.893,50.249z\"/><linearGradient id=\"SVGID_27_\" gradientUnits=\"userSpaceOnUse\" x1=\"214.3262\" y1=\"-436.5107\" x2=\"322.8717\" y2=\"-424.4851\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".078\" stop-color=\"#F4F4F4\"/><stop offset=\".3807\" stop-color=\"#CECECE\"/><stop offset=\".5396\" stop-color=\"#BFBFBF\"/><stop offset=\".8357\" stop-color=\"#7C7C7C\"/><stop offset=\".8996\" stop-color=\"#A8A8A8\"/><stop offset=\".9093\" stop-color=\"#9A9A9A\"/><stop offset=\".9327\" stop-color=\"#7D7D7D\"/><stop offset=\".9558\" stop-color=\"#686868\"/><stop offset=\".9785\" stop-color=\"#5B5B5B\"/><stop offset=\"1\" stop-color=\"#575757\"/></linearGradient><path style=\"fill:url(#SVGID_27_);\" d=\"M1.193,48.543l0.107,0.98c0.236,0.285,0.579,0.675,1.067,1.181c1.084,1.121,1.428,0.416,1.428,0.416s0.072-0.201,0.092-0.586c-0.042,0.216-0.209,0.403-0.788-0.056c-0.298-0.237-0.688-0.627-1.076-1.049c-0.326-0.326-0.723-0.742-1.021-1.117l0.048,0.065l-0.213,0.526c0,0,0.069,0.115,0.268,0.376L1.193,48.543L1.193,48.543z\"/><linearGradient id=\"SVGID_28_\" gradientUnits=\"userSpaceOnUse\" x1=\"213.8887\" y1=\"-436.4771\" x2=\"336.8819\" y2=\"-422.851\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".078\" stop-color=\"#F4F4F4\"/><stop offset=\".3807\" stop-color=\"#CECECE\"/><stop offset=\".5396\" stop-color=\"#BFBFBF\"/><stop offset=\".8357\" stop-color=\"#7C7C7C\"/><stop offset=\".8996\" stop-color=\"#A8A8A8\"/><stop offset=\".9093\" stop-color=\"#9A9A9A\"/><stop offset=\".9327\" stop-color=\"#7D7D7D\"/><stop offset=\".9558\" stop-color=\"#686868\"/><stop offset=\".9785\" stop-color=\"#5B5B5B\"/><stop offset=\"1\" stop-color=\"#575757\"/></linearGradient><path style=\"fill:url(#SVGID_28_);\" d=\"M3.741,49.133c-0.006-0.027-0.013-0.054-0.02-0.078c0.012,0.088,0.028,0.179,0.043,0.272c0,0,0.094,0.394,0.12,0.753C3.87,49.813,3.83,49.498,3.741,49.133z\"/><linearGradient id=\"SVGID_29_\" gradientUnits=\"userSpaceOnUse\" x1=\"411.2539\" y1=\"557.002\" x2=\"507.2363\" y2=\"537.6277\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\"1\" stop-color=\"#BFC0C2\"/></linearGradient><path style=\"fill:url(#SVGID_29_);\" d=\"M99.696,28.566l0.29,0.316c0.406-0.238,0.654,0.045,0.654,0.045l-0.386-0.494c-0.383,0.082-1.093,0.256-2.233,0.61c0,0-1.353,0.594-1.59,1.532c-0.016,0.332,0.049,0.641,0.116,0.876c0.753,1.429,0.913,1.666,0.913,1.666c0.499,1.091,0.422,1.993,0.25,2.824c-0.188,0.921-1.188,1.668-1.794,1.842c-0.608,0.171-0.953,0-1.14-0.483c-0.188-0.485-0.157-0.845-0.438-2.34c-0.28-1.499-0.653-2.2-1.216-2.372c-0.563-0.173-1.313,0.468-1.749,0.811c-0.438,0.344-2.417,2.152-2.417,2.152s-2.324,2.091-5.743,4.026c-3.417,1.935-7.69,3.418-7.69,3.418s-2.842,1.092-3.525,0.998c-0.688-0.093-0.516-0.718-0.297-1.076c0.219-0.36,0.516-0.937,0.766-1.545c0.313-0.756,0.201-1.654-0.359-1.967c-0.562-0.311-1.248-0.468-3.523,0.094s-3.197,1.076-3.838,1.451c-0.643,0.376-1.576,1.233-1.842,1.716c-0.266,0.484-0.563,0.983,0.126,1.576c0.688,0.594,0.763,0.485,1.56,1.046c0.797,0.562,0.922,0.64,0.969,1.466c0.045,0.827-0.766,1.341-0.766,1.341s-3.123,2.082-6.602,2.777c-2.34,0.469-6.833,0.639-6.833,0.639s-1.327-0.045-5.384,0.547c-4.056,0.594-6.787,1.514-7.738,1.856c-0.952,0.343-2.34,0.81-3.136,1.17c-0.795,0.358-0.375,0.89-0.203,1.015c0.172,0.123,1.185,1.074,1.498,1.354c0.312,0.282,1.466,1.279,0.108,2.108c-1.356,0.826-3.603,1.264-3.603,1.264s-3.121,0.654-4.119,0.234c-1.001-0.422-1.2-0.778-1.452-1.358c-0.313-0.718-0.016-1.263,0.794-1.78c0.77-0.486,0.469-1.199,0.469-1.199c-0.983-1.9-3.058-2.058-4.774-1.936c-2.72,0.198-5.358,0.471-7.425,0.734c-3.059,0.39-4.541-0.063-5.992-0.516c-1.452-0.453-2.997-1.529-3.154-2.498c-0.027-0.097-0.039-0.199-0.042-0.307c-0.078-0.758,0.074-1.146,0.184-1.784c0.108-0.625-0.043-1.532-0.084-1.758c-0.008-0.026-0.016-0.058-0.023-0.085c-0.507-1.304-1.725-1.903-2.668-2.058c-0.953-0.157-0.983,0.857-0.983,0.857s-0.002,0.012-0.006,0.04c0.078-0.208,0.222-0.315,0.444-0.31c0.577,0.02,2.259,0.361,2.781,1.754c0,0,0.218,0.648,0.019,1.479c-0.199,0.832-0.162,1.571-0.019,2.295c0.145,0.725,0.759,1.408,1.465,1.969c0.704,0.562,2.745,1.535,4.734,1.66c1.814,0.117,2.483,0.037,2.587,0.023l0.759-0.768l0.135,0.666c0.81-0.088,2.115-0.229,3.619-0.394c2.529-0.271,4.227-0.541,5.8-0.306c1.572,0.232,2.078,1.463,2.078,1.463s0.107,0.313-0.253,0.542c-0.349,0.226-0.75,0.548-0.947,0.891c-0.2,0.345-0.411,1.066,0.159,2.033c0.572,0.965,2.142,1.595,3.478,1.435c1.336-0.158,3.336-0.672,4.521-0.98c1.286-0.336,2.424-0.969,2.572-1.979c0.148-1.009-1.534-2.297-1.534-2.297s-0.81-0.611-0.909-0.75c-0.1-0.14,0.099-0.197,0.099-0.197s0.95-0.229,1.356-0.416c0.403-0.19,1.523-0.644,3.353-1.217c1.831-0.572,5.609-1.248,5.609-1.248s2.09-0.332,4.694-0.543l0.612-0.705l0.493,0.627c0.406-0.023,0.819-0.045,1.235-0.061c3.572-0.129,5.343-0.555,7.24-0.979c1.897-0.426,4.569-1.979,4.965-2.276c0.396-0.296,1.229-0.662,1.395-1.958c0.17-1.294-1.363-2.157-1.363-2.157s-1.218-0.643-1.476-0.929c-0.256-0.288-0.019-0.562-0.019-0.562s0.689-1.485,2.896-2.355c2.207-0.872,3.69-1.106,4.619-1.207c0.931-0.099,1.247,0.237,1.375,0.395c0.128,0.158,0.128,0.485,0.021,0.821c-0.101,0.308-0.443,1.039-0.644,1.396c-0.199,0.356-0.522,1.216-0.317,1.622c0.211,0.405,0.842,0.592,1.662,0.444c0.822-0.147,2.987-0.761,4.889-1.553c1.897-0.793,5.074-2.344,5.074-2.344s0.01-0.005,0.021-0.013l0.086-0.729l0.729,0.296c1.021-0.562,2.764-1.582,4.01-2.63c1.871-1.574,3.699-3.225,4.166-3.641c0.465-0.415,0.89-0.751,1.305-0.732c0.416,0.021,0.734,0.318,0.99,1.434c0.258,1.119,0.306,2.038,0.426,2.583c0.117,0.542,0.285,1.176,0.929,1.305c0.644,0.128,1.513-0.436,1.841-0.713c0.326-0.277,0.918-1.176,0.879-2.383c0,0,0.068-1.605-0.762-3.127c0,0-0.348-0.614-0.477-0.782c-0.088-0.119-0.155-0.238-0.008-0.523c0.146-0.288,0.465-0.821,1.059-1.157c0.449-0.256,0.881-0.316,1.128-0.396c0,0,0.28-0.069,0.636-0.266L99.696,28.566L99.696,28.566z\"/><path style=\"fill:#FFF;\" d=\"M1.547,32.696l-0.05,0.239c0.053-0.041,0.111-0.068,0.17-0.072c0.281-0.018,0.629,0.158,0.629,0.158s1.135,0.61,1.642,0.716c0.507,0.105,0.875-0.065,1.205-0.292c0.25-0.174,0.521-0.434,0.763-0.737c-0.29,0.29-0.725,0.548-1.365,0.595c0,0-0.571-0.049-1.419-0.587c-0.846-0.537-1.327-0.231-1.729,0.105l0,0l-0.249,0.564c-0.001,0.013-0.003,0.023-0.006,0.036l0.009,0.001c0,0,0.087-0.192,0.217-0.352L1.547,32.696L1.547,32.696z\"/><path style=\"opacity:.73;fill:#FFF;\" d=\"M6.387,31.961c0.059-0.12,0.112-0.238,0.155-0.354c0.05-0.14,0.09-0.334,0.125-0.55c-0.096,0.44-0.223,0.73-0.223,0.73S6.428,31.853,6.387,31.961L6.387,31.961z\"/><path style=\"opacity:.73;fill:#FFF;\" d=\"M6.807,28.654c-0.038,0.439-0.038,0.987-0.038,1.493l0,0c0.04-0.509,0.052-0.935,0.052-0.935l0.004,0.014c0,0,0-0.421-0.011-0.518C6.811,28.695,6.809,28.677,6.807,28.654z\"/><linearGradient id=\"SVGID_30_\" gradientUnits=\"userSpaceOnUse\" x1=\"413.5137\" y1=\"516.4121\" x2=\"417.999\" y2=\"516.4121\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#E2E3E4\"/><stop offset=\".5055\" stop-color=\"#FFF\"/></linearGradient><path style=\"fill:url(#SVGID_30_);\" d=\"M8.12,16.324l-0.291,0.435c0.087-0.014,0.089-0.007,0.244-0.056c0,0,0.404-0.066,1.112,0.12c0.917,0.244,2.067-0.496,2.067-0.496s0.272-0.164,0.583-0.458c-0.4,0.24-1.385,0.762-2.132,0.585c-0.961-0.229-0.994-0.017-1.336-0.049c-0.292-0.028-0.292-0.11-0.275-0.314c0.002-0.032,0.023-0.054,0.03-0.092c0.05-0.261,0.339-0.689,0.339-0.689l-0.684,0.383c-0.115,0.189-0.227,0.378-0.34,0.569c-0.063,0.146-0.179,0.475,0.044,0.509c0.055,0.009,0.11,0.011,0.163,0.009L8.12,16.324L8.12,16.324z\"/><path style=\"fill:#FFF;\" d=\"M17.019,15.036c-1.027,0.278-1.972,0.734-2.494,0.604c-0.438-0.109-0.084-0.76,0.042-0.965c0.069-0.146,0.167-0.292,0.249-0.406c0.31-0.506,0.833-1.351,0.833-1.351s0,0,0-0.002c0.017-0.032,0.033-0.067,0.049-0.102c0.067-0.18,0.12-0.537-0.472-0.597c-0.799-0.082-1.613,0.619-1.613,0.619s-0.547,0.301-0.838,1.417l0.112-0.313c0,0,0.291-0.973,1.105-1.281c0,0,0.317-0.171,0.831-0.177c0.513-0.005,0.392,0.354,0.392,0.354s-0.056,0.233-0.586,0.912c-0.529,0.677-0.671,1.195-0.671,1.195s-0.319,0.723,0.193,0.957c0,0,0.238,0.141,0.939-0.091c0.7-0.233,3.02-0.843,4.438-1.06l0.993-0.506C19.849,14.299,18.012,14.769,17.019,15.036L17.019,15.036z\"/><path style=\"fill:#FFF;\" d=\"M-16.122-14.641\"/><path style=\"fill:#FFF;\" d=\"M-16.122-14.641\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M90.578,74.217c0.006-0.004,0.009-0.008,0.014-0.013C90.587,74.21,90.582,74.213,90.578,74.217z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M90.821,73.951c0.001-0.002,0.002-0.004,0.003-0.004C90.823,73.947,90.822,73.949,90.821,73.951z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M90.738,74.042c0.003-0.004,0.008-0.009,0.011-0.013C90.746,74.033,90.741,74.038,90.738,74.042z\"/><path style=\"opacity:.25;fill:#231F20;\" d=\"M87.9,76.68l-0.164,0.174c-0.646,0.716-0.969,1.007-0.969,1.007l-0.242,0.269l0,0c-0.002,0.006-0.006,0.012-0.012,0.014c0.008,0.002,0.018,0.004,0.041,0.004c0,0,0.229-0.002,0.588-0.219c-0.072,0.041-0.139,0.068-0.181,0.07c-0.177,0.012,0.431-0.538,0.431-0.538s0.588-0.626,0.967-1.125c0.382-0.497,0.138-0.468,0.138-0.468s-0.087-0.021-0.397,0.125C88.125,76.018,88.268,76.223,87.9,76.68L87.9,76.68z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M90.657,74.133c0.003-0.006,0.007-0.013,0.013-0.017C90.664,74.121,90.662,74.128,90.657,74.133z\"/><path style=\"opacity:.22;fill:#231F20;\" d=\"M72.945,81.21c0,0,2.215-0.931,3.402-0.79c0,0,0.611,0.059-0.062,0.711c-0.672,0.652-0.892,1.168,0.396,0.752c0,0,0.094-0.033,0.244-0.086c-0.504,0.143-0.734,0.143-0.658,0.033c0.127-0.188,0.461-0.461,0.461-0.461s0.399-0.4,0.399-0.801c0,0,0.128-0.588-1.604-0.225c-1.01,0.209-1.969,0.59-2.588,0.867C72.941,81.211,72.943,81.211,72.945,81.21L72.945,81.21z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.234,81.555l-0.004,0.002C72.232,81.557,72.234,81.555,72.234,81.555z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M88.057,76.014c-0.014,0.008-0.026,0.015-0.043,0.021C88.028,76.027,88.043,76.021,88.057,76.014z\"/><path style=\"opacity:.28;fill:#231F20;\" d=\"M78.305,81.299c1.448-0.521,3.93-1.854,5.023-2.492C82.232,79.442,79.73,80.717,78.305,81.299z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.512,76.325c0.026-0.017,0.055-0.032,0.08-0.049C87.566,76.293,87.538,76.309,87.512,76.325z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.618,73.084c0.008-0.011,0.019-0.023,0.026-0.029C91.637,73.061,91.626,73.073,91.618,73.084z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.434,73.281c0.01-0.012,0.019-0.02,0.023-0.027C91.451,73.264,91.441,73.27,91.434,73.281z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.521,73.188c0.01-0.012,0.02-0.022,0.029-0.032C91.539,73.165,91.53,73.178,91.521,73.188z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M90.9,73.863c0.003-0.006,0.007-0.01,0.012-0.016C90.907,73.854,90.903,73.857,90.9,73.863z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.246,82.088c-0.014,0.008-0.023,0.018-0.036,0.022C71.221,82.105,71.232,82.096,71.246,82.088z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.346,73.375c0.008-0.008,0.014-0.015,0.021-0.021C91.359,73.36,91.354,73.367,91.346,73.375z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.077,73.669c0.006-0.006,0.01-0.011,0.013-0.015C91.087,73.659,91.083,73.663,91.077,73.669z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.251,73.479c0.007-0.006,0.015-0.012,0.021-0.021C91.266,73.463,91.255,73.473,91.251,73.479z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M90.987,73.768c0.004-0.006,0.01-0.012,0.016-0.021C90.997,73.756,90.991,73.762,90.987,73.768z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.161,73.578c0.006-0.006,0.011-0.014,0.017-0.02C91.172,73.564,91.165,73.572,91.161,73.578z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.816,81.764c-0.008,0.006-0.02,0.012-0.026,0.017C71.799,81.774,71.809,81.77,71.816,81.764z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.044,81.646c-0.006,0.004-0.012,0.006-0.019,0.009C72.032,81.652,72.038,81.649,72.044,81.646z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.305,82.055c-0.011,0.008-0.021,0.014-0.031,0.021C71.283,82.067,71.294,82.063,71.305,82.055z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.969,81.684c-0.008,0.004-0.015,0.009-0.021,0.014C71.953,81.692,71.961,81.688,71.969,81.684z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.109,81.613c-0.004,0.005-0.01,0.006-0.016,0.01C72.102,81.619,72.105,81.617,72.109,81.613z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.008,81.665c-0.007,0.004-0.013,0.007-0.021,0.011C71.994,81.672,72.001,81.669,72.008,81.665z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.206,81.566c-0.003,0.002-0.005,0.003-0.007,0.004C72.201,81.569,72.203,81.568,72.206,81.566z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.148,81.594c-0.008,0.004-0.016,0.01-0.024,0.015C72.135,81.604,72.141,81.598,72.148,81.594z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.928,81.707c-0.01,0.003-0.02,0.01-0.027,0.016C71.908,81.715,71.918,81.711,71.928,81.707z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.193,81.575c-0.006,0.001-0.01,0.003-0.014,0.004C72.184,81.578,72.189,81.575,72.193,81.575z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.172,81.585c-0.004,0.003-0.008,0.005-0.015,0.007C72.164,81.59,72.168,81.585,72.172,81.585z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.079,81.631c-0.008,0.002-0.013,0.004-0.019,0.006C72.066,81.635,72.071,81.633,72.079,81.631z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.866,81.739c-0.011,0.002-0.021,0.008-0.027,0.013C71.848,81.747,71.857,81.741,71.866,81.739z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.555,81.906c-0.018,0.012-0.033,0.02-0.052,0.029C71.521,81.924,71.539,81.918,71.555,81.906z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.219,81.561c0,0.002-0.002,0.002-0.002,0.004C72.217,81.563,72.219,81.563,72.219,81.561z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.421,81.986c-0.011,0.006-0.022,0.01-0.03,0.02C71.398,81.996,71.41,81.992,71.421,81.986z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.363,82.02c-0.012,0.005-0.021,0.013-0.032,0.021C71.342,82.032,71.354,82.024,71.363,82.02z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.482,81.948c-0.014,0.006-0.023,0.015-0.036,0.021C71.458,81.963,71.471,81.956,71.482,81.948z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.768,81.79c-0.01,0.004-0.018,0.009-0.024,0.017C71.751,81.799,71.758,81.794,71.768,81.79z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.708,72.984c0.013-0.014,0.024-0.028,0.04-0.042C91.734,72.956,91.723,72.971,91.708,72.984z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.717,81.818c-0.01,0.004-0.019,0.009-0.027,0.015C71.698,81.827,71.707,81.822,71.717,81.818z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.665,81.846c-0.011,0.006-0.021,0.014-0.028,0.018C71.645,81.858,71.654,81.852,71.665,81.846z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.609,81.875c-0.01,0.008-0.021,0.014-0.03,0.02C71.589,81.889,71.602,81.881,71.609,81.875z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.443,72.197c-0.021,0.021-0.037,0.039-0.055,0.061C92.406,72.238,92.423,72.217,92.443,72.197z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.359,72.287c-0.021,0.021-0.041,0.044-0.061,0.066C92.318,72.331,92.339,72.309,92.359,72.287z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.501,72.135c-0.011,0.015-0.021,0.023-0.028,0.033C92.48,72.157,92.49,72.148,92.501,72.135z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.786,72.899c0.022-0.021,0.042-0.042,0.062-0.063C91.828,72.857,91.807,72.878,91.786,72.899z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.273,72.379c-0.014,0.016-0.025,0.029-0.041,0.045C92.245,72.409,92.26,72.395,92.273,72.379z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.579,72.053c-0.013,0.012-0.021,0.021-0.03,0.032C92.559,72.074,92.569,72.063,92.579,72.053z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.762,71.858c-0.002,0-0.002,0-0.002,0.001C92.76,71.858,92.76,71.858,92.762,71.858z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.703,71.919c-0.004,0.005-0.01,0.013-0.014,0.017C92.693,71.928,92.699,71.924,92.703,71.919z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.938,76.074c-0.017,0.008-0.027,0.016-0.043,0.023C87.907,76.09,87.922,76.082,87.938,76.074z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.648,71.98c-0.012,0.011-0.021,0.021-0.029,0.029C92.629,72,92.637,71.991,92.648,71.98z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.666,76.229c-0.018,0.013-0.031,0.021-0.051,0.031C87.633,76.25,87.648,76.241,87.666,76.229z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.204,91.026c0,0-0.001,0-0.003,0.002C48.203,91.026,48.203,91.026,48.204,91.026z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.073,91.03c-0.007,0-0.013,0-0.021,0C48.06,91.03,48.066,91.03,48.073,91.03z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.136,91.028c-0.007,0.002-0.013,0.002-0.02,0.002C48.123,91.03,48.129,91.03,48.136,91.028z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.005,91.032c-0.003,0-0.007,0-0.012,0C47.998,91.032,48.002,91.032,48.005,91.032z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.94,91.035c-0.004,0-0.009,0-0.015,0C47.93,91.035,47.935,91.035,47.94,91.035z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.869,76.111c-0.014,0.006-0.021,0.015-0.039,0.021C87.848,76.126,87.857,76.117,87.869,76.111z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.807,76.146c-0.014,0.009-0.025,0.018-0.041,0.021C87.779,76.164,87.793,76.155,87.807,76.146z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.738,76.186c-0.016,0.011-0.028,0.018-0.044,0.024C87.71,76.203,87.723,76.196,87.738,76.186z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.951,76.067c0.02-0.011,0.035-0.021,0.054-0.027C87.986,76.047,87.971,76.057,87.951,76.067z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M87.719,77.52c0,0-0.082,0.064-0.193,0.147C87.592,77.621,87.664,77.566,87.719,77.52z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.205,72.452c-0.021,0.022-0.042,0.046-0.064,0.067C92.163,72.498,92.186,72.475,92.205,72.452z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.05,87.006c-0.019-0.007-0.037-0.016-0.056-0.021C28.013,86.991,28.031,86.999,28.05,87.006z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.051,82.217c-0.013,0.008-0.021,0.017-0.037,0.021C71.027,82.23,71.038,82.223,71.051,82.217z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M45.854,89.871c-0.024,0-0.049-0.004-0.074-0.004C45.806,89.867,45.831,89.871,45.854,89.871z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.678,86.883c0.02,0.004,0.039,0.01,0.058,0.019C27.717,86.893,27.696,86.887,27.678,86.883z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.555,86.844c0.038,0.012,0.078,0.022,0.119,0.037C27.633,86.869,27.593,86.854,27.555,86.844z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.862,86.941c-0.041-0.014-0.082-0.026-0.123-0.04C27.78,86.913,27.82,86.928,27.862,86.941z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.88,72.799c0.015-0.016,0.026-0.027,0.04-0.043C91.907,72.771,91.895,72.784,91.88,72.799z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.058,87.006c0.04,0.016,0.079,0.026,0.116,0.041C28.137,87.033,28.098,87.021,28.058,87.006z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M91.977,72.695c0.014-0.016,0.026-0.027,0.041-0.044C92.002,72.668,91.989,72.68,91.977,72.695z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M92.057,72.612c0.021-0.022,0.039-0.041,0.061-0.062C92.096,72.571,92.076,72.59,92.057,72.612z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.991,86.985c-0.021-0.009-0.041-0.017-0.062-0.022C27.95,86.969,27.97,86.977,27.991,86.985z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.133,82.162c0.021-0.013,0.037-0.021,0.055-0.036C71.17,82.139,71.152,82.149,71.133,82.162z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.361,89.926c-0.016-0.002-0.035-0.004-0.053-0.008C46.325,89.922,46.345,89.924,46.361,89.926z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M71.122,82.17c-0.019,0.012-0.034,0.021-0.049,0.032C71.088,82.191,71.105,82.18,71.122,82.17z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.439,89.939c-0.017-0.002-0.032-0.006-0.049-0.008C46.407,89.934,46.422,89.938,46.439,89.939z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.513,89.953c-0.016-0.005-0.031-0.007-0.047-0.011C46.481,89.946,46.497,89.948,46.513,89.953z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.096,89.891c-0.031-0.002-0.065-0.006-0.1-0.01C46.031,89.885,46.065,89.889,46.096,89.891z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.278,89.913c-0.02-0.002-0.041-0.004-0.061-0.006C46.237,89.909,46.259,89.911,46.278,89.913z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.19,89.904c-0.028-0.005-0.054-0.008-0.084-0.012C46.136,89.896,46.163,89.899,46.19,89.904z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M45.971,89.881c-0.025-0.005-0.051-0.006-0.079-0.009C45.92,89.875,45.945,89.877,45.971,89.881z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.926,86.961c-0.02-0.004-0.039-0.011-0.058-0.019C27.888,86.953,27.908,86.957,27.926,86.961z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.395,90.975c0.001,0.004,0.003,0.004,0.004,0.004C47.398,90.979,47.396,90.979,47.395,90.975z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.375,90.969c0.001,0,0.002,0,0.003,0C47.378,90.969,47.376,90.969,47.375,90.969z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.418,90.982L47.418,90.982L47.418,90.982z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.465,90.996c0.003,0,0.004,0.001,0.006,0.001C47.47,90.997,47.468,90.996,47.465,90.996z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.442,90.988c0.001,0,0.002,0.002,0.002,0.002L47.442,90.988z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.342,90.955L47.342,90.955L47.342,90.955z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.589,89.967c-0.02-0.002-0.036-0.009-0.054-0.013C46.553,89.959,46.57,89.965,46.589,89.967z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.764,90.012c-0.011-0.004-0.021-0.008-0.033-0.012C46.742,90.006,46.753,90.008,46.764,90.012z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M49.049,90.953c-0.01,0.001-0.021,0.002-0.032,0.004C49.028,90.955,49.038,90.954,49.049,90.953z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.659,89.984c-0.021-0.006-0.039-0.01-0.061-0.014C46.619,89.975,46.639,89.979,46.659,89.984z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.767,91.028c0.003,0,0.003,0,0.006,0C47.773,91.028,47.77,91.028,47.767,91.028z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.821,91.03c0.003,0,0.007,0,0.013,0C47.828,91.03,47.824,91.03,47.821,91.03z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M45.214,89.855c0.047,0,0.092,0,0.139,0C45.308,89.855,45.261,89.855,45.214,89.855z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.716,91.026c0.005,0,0.009,0,0.013,0.002C47.727,91.026,47.722,91.026,47.716,91.026z\"/><path style=\"opacity:.36;fill:#231F20;\" d=\"M46.772,90.014c0,0,0.158,0.021,0.059,0.338c-0.1,0.313,0.06,0.451,0.475,0.594l0.023,0.006c0,0,0.001,0,0.002,0c-0.079-0.04-0.074-0.08-0.074-0.08s-0.01-0.078,0.078-0.216c0.087-0.136,0.009-0.369-0.293-0.536C47.044,90.118,46.967,90.07,46.772,90.014L46.772,90.014L46.772,90.014z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.869,91.032c0.006,0,0.012,0,0.018,0C47.881,91.032,47.875,91.032,47.869,91.032z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.495,91.002c0.001,0,0.004,0,0.004,0C47.497,91.002,47.496,91.002,47.495,91.002z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.677,91.024c0.004,0,0.007,0,0.01,0C47.684,91.024,47.681,91.024,47.677,91.024z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.529,91.006c0.001,0,0.002,0,0.002,0S47.53,91.006,47.529,91.006z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.559,91.01c0.002,0.002,0.005,0.002,0.008,0.002C47.566,91.012,47.561,91.01,47.559,91.01z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M47.594,91.016c0.002,0,0.004,0,0.008,0C47.599,91.016,47.596,91.016,47.594,91.016z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M46.711,89.997c-0.011-0.002-0.026-0.007-0.043-0.011C46.685,89.99,46.701,89.995,46.711,89.997z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.748,87.256c-0.008-0.003-0.018-0.007-0.025-0.01C28.731,87.25,28.739,87.254,28.748,87.256z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.776,87.27c-0.007-0.002-0.016-0.008-0.024-0.012C28.761,87.262,28.769,87.268,28.776,87.27z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.681,87.23c-0.008-0.004-0.021-0.006-0.03-0.01C28.66,87.225,28.672,87.227,28.681,87.23z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M45.66,89.862c0.026,0,0.052,0.005,0.074,0.005C45.711,89.865,45.686,89.865,45.66,89.862z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.797,87.275c-0.005-0.002-0.013-0.006-0.021-0.008C28.784,87.271,28.792,87.273,28.797,87.275z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.38,86.794c0.038,0.011,0.074,0.022,0.112,0.031C27.453,86.816,27.417,86.803,27.38,86.794z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M27.492,86.825c0.021,0.004,0.039,0.011,0.058,0.019C27.53,86.836,27.512,86.829,27.492,86.825z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.814,87.284c-0.003-0.002-0.006-0.005-0.012-0.007C28.808,87.279,28.811,87.282,28.814,87.284z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.64,87.219c-0.011-0.006-0.021-0.01-0.03-0.014C28.621,87.21,28.629,87.213,28.64,87.219z\"/><path style=\"opacity:.38;fill:#231F20;\" d=\"M27.687,87.239c-0.014-0.013-0.023-0.022-0.03-0.032c-0.263-0.197-0.343-0.418-0.343-0.418l0.009-0.011c0.017,0.007,0.034,0.011,0.052,0.014c-0.291-0.075-0.5-0.104-0.479-0.018c0.015,0.061,0.131,0.153,0.269,0.245c0.174,0.094,0.346,0.187,0.522,0.279V87.239L27.687,87.239z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.716,87.245c-0.009-0.003-0.018-0.006-0.027-0.01C28.699,87.239,28.708,87.242,28.716,87.245z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.602,87.202c-0.013-0.004-0.027-0.01-0.042-0.015C28.574,87.192,28.59,87.198,28.602,87.202z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.841,87.293c0,0-0.006-0.004-0.022-0.009C28.835,87.29,28.841,87.293,28.841,87.293z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.232,87.068c-0.018-0.006-0.031-0.014-0.047-0.018C28.201,87.055,28.215,87.063,28.232,87.068z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M45.534,89.858c0.028,0,0.054,0.002,0.081,0.002C45.587,89.858,45.562,89.858,45.534,89.858z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M45.397,89.855c0.029,0,0.06,0,0.089,0C45.457,89.855,45.427,89.855,45.397,89.855z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.348,87.11c-0.034-0.013-0.07-0.025-0.106-0.039C28.278,87.085,28.314,87.098,28.348,87.11z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.506,87.168c-0.013-0.005-0.025-0.01-0.037-0.015C28.481,87.158,28.494,87.162,28.506,87.168z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.401,87.129c-0.013-0.006-0.028-0.011-0.043-0.015C28.373,87.118,28.388,87.123,28.401,87.129z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.557,87.186c-0.013-0.004-0.025-0.012-0.04-0.017C28.531,87.176,28.544,87.182,28.557,87.186z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M28.458,87.15c-0.016-0.008-0.031-0.014-0.047-0.018C28.427,87.137,28.442,87.143,28.458,87.15z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.02,84.389c0.004,0,0.006,0,0.006,0C70.023,84.389,70.023,84.389,70.02,84.389z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.789,84.087c-0.001,0.003-0.003,0.005-0.004,0.005C70.786,84.09,70.788,84.088,70.789,84.087z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.762,84.102c-0.002,0.002-0.004,0.002-0.006,0.004C70.758,84.104,70.76,84.104,70.762,84.102z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.732,84.116c-0.002,0.002-0.004,0.003-0.006,0.004C70.729,84.119,70.73,84.118,70.732,84.116z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.697,84.133c-0.001,0-0.002,0-0.002,0.002C70.695,84.133,70.696,84.133,70.697,84.133z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.417,84.249c0.006-0.001,0.009-0.002,0.011-0.002C70.426,84.247,70.423,84.248,70.417,84.249z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.389,84.262h0.002H70.389z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.662,84.146L70.662,84.146L70.662,84.146z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.316,84.289c0.002-0.002,0.007-0.003,0.009-0.003C70.321,84.286,70.318,84.287,70.316,84.289z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.285,84.299c0.003,0,0.005-0.002,0.009-0.004C70.29,84.297,70.288,84.299,70.285,84.299z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.354,84.275c0.002-0.002,0.002-0.002,0.002-0.002S70.354,84.273,70.354,84.275z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.946,90.965c-0.011,0-0.022,0.004-0.033,0.004C48.924,90.969,48.935,90.965,48.946,90.965z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.256,84.311c0.002,0,0.004,0,0.006-0.002C70.26,84.311,70.258,84.311,70.256,84.311z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.78,82.41c0.013-0.009,0.026-0.021,0.042-0.032C70.809,82.389,70.793,82.401,70.78,82.41z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.956,82.279c0.013-0.008,0.022-0.016,0.033-0.023C70.98,82.264,70.969,82.271,70.956,82.279z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.898,82.321c0.012-0.009,0.022-0.017,0.033-0.022C70.923,82.305,70.91,82.313,70.898,82.321z\"/><path style=\"opacity:.19;fill:#231F20;\" d=\"M70.903,83.794c0.2,0.064,0.106,0.171-0.087,0.278l0.089-0.033c0,0,0.793-0.436,0.458-0.633c-0.338-0.198-1.129-0.275-0.613-0.969l0.02-0.02c-0.442,0.344-0.756,0.727-0.498,1.021C70.27,83.443,70.387,83.629,70.903,83.794z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.566,84.191c-0.002,0-0.006,0.002-0.008,0.003C70.561,84.193,70.564,84.191,70.566,84.191z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.631,84.163c-0.002,0.001-0.004,0.002-0.006,0.003C70.627,84.165,70.629,84.164,70.631,84.163z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.598,84.176c0,0.002-0.004,0.004-0.006,0.004C70.594,84.18,70.598,84.178,70.598,84.176z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.493,84.223c-0.003,0-0.003,0-0.007,0.002C70.49,84.223,70.49,84.223,70.493,84.223z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.459,84.233c-0.002,0-0.004,0.002-0.008,0.004C70.455,84.235,70.457,84.233,70.459,84.233z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.842,82.363c0.012-0.01,0.024-0.018,0.034-0.025C70.866,82.346,70.854,82.354,70.842,82.363z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.293,91.024c-0.007,0-0.016,0-0.023,0C48.277,91.024,48.286,91.024,48.293,91.024z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.444,91.014c-0.004,0-0.011,0-0.017,0C48.434,91.014,48.44,91.014,48.444,91.014z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.369,91.02c-0.009,0-0.017,0-0.027,0C48.352,91.02,48.359,91.02,48.369,91.02z\"/><path style=\"opacity:.25;fill:#231F20;\" d=\"M50.023,89.904c0,0,0.362,0.225,1.673,0.285c0,0,0.45,0,0.468,0.035c0.016,0.028,0.036,0.056-0.068,0.102l0,0c0.06-0.021,0.793-0.254,0.476-0.391c-0.04-0.019-0.063-0.024-0.074-0.028c-0.006,0-0.013,0-0.019-0.003l0,0c-0.008-0.002-0.016-0.002-0.021-0.004c-0.007,0-0.009-0.001-0.013-0.001c-0.006-0.003-0.014-0.003-0.021-0.005c-0.004,0-0.009,0-0.015-0.002c-0.005,0-0.011-0.002-0.017-0.002c-0.004,0-0.011-0.002-0.017-0.004c-0.005,0-0.012,0-0.015,0c-0.008-0.002-0.014-0.002-0.018-0.004c-0.004,0-0.012,0-0.016-0.002c-0.005,0-0.012,0-0.018,0c-0.002-0.004-0.008-0.004-0.01-0.004c-0.011-0.002-0.015-0.003-0.021-0.003c-0.004,0-0.006-0.001-0.008-0.001c-0.01-0.001-0.021-0.001-0.028-0.002c0,0-0.002,0-0.004-0.002c-0.007,0-0.015,0-0.021,0c-0.005-0.002-0.007-0.002-0.012-0.002s-0.011,0-0.02,0c-0.004,0-0.006,0-0.008,0c-0.008-0.002-0.013-0.002-0.019-0.002c-0.003,0-0.007,0-0.009,0c-0.008,0-0.014-0.002-0.018-0.002c-0.005,0-0.009-0.003-0.012-0.003c-0.006,0-0.014,0-0.021,0c-0.004,0-0.004,0-0.006,0c-0.039-0.004-0.08-0.004-0.128-0.009c-0.002,0-0.004,0-0.004,0c-0.009,0-0.015-0.002-0.022-0.002c-0.002,0-0.007,0-0.011,0c-0.007,0-0.013,0-0.021,0c-0.004-0.002-0.01-0.002-0.014-0.002c-0.006,0-0.013-0.002-0.02-0.002c-0.005,0-0.011,0-0.016-0.002c-0.005,0-0.011,0-0.019,0c-0.01,0-0.02-0.002-0.028-0.004c-0.006,0-0.012,0-0.019,0c-0.008,0-0.018-0.002-0.028-0.002c-0.005,0-0.011-0.002-0.016-0.002c-0.008,0-0.019,0-0.024-0.001c-0.006-0.001-0.013-0.001-0.021-0.001c-0.007-0.002-0.018-0.002-0.026-0.004c-0.005,0-0.013-0.001-0.02-0.001c-0.008-0.001-0.018-0.003-0.026-0.003c-0.007-0.001-0.016-0.001-0.023-0.003c-0.01,0-0.019-0.002-0.027-0.002c-0.007-0.002-0.014-0.002-0.021-0.002c-0.012,0-0.024-0.003-0.035-0.005c-0.007,0-0.014,0-0.02,0c-0.02-0.004-0.037-0.006-0.057-0.006c-0.142-0.019-0.271-0.033-0.378-0.055l-0.187-0.025c0,0-0.47-0.014-0.653-0.316c-0.118-0.197,0.457-0.318,0.457-0.318s0.956-0.193,1.917-0.321c0,0-2.542,0.294-2.777,0.626C49.613,89.737,50.023,89.904,50.023,89.904L50.023,89.904z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M69.986,84.401L69.986,84.401L69.986,84.401z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M69.989,84.399c0.001,0,0.001,0,0.004,0C69.991,84.399,69.99,84.399,69.989,84.399z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.839,90.979c-0.007,0-0.015,0.002-0.021,0.002C48.824,90.98,48.831,90.979,48.839,90.979z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.727,90.988c-0.009,0-0.017,0.002-0.026,0.002C48.71,90.99,48.718,90.988,48.727,90.988z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.637,90.998c-0.009,0-0.019,0.001-0.029,0.003C48.619,90.999,48.628,90.998,48.637,90.998z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M48.55,91.004c-0.009,0-0.018,0.002-0.025,0.004C48.532,91.006,48.54,91.004,48.55,91.004z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.139,84.35c0.004,0,0.006-0.002,0.01-0.004C70.145,84.348,70.143,84.35,70.139,84.35z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.116,84.359c0.002-0.002,0.004-0.002,0.007-0.002C70.12,84.357,70.118,84.357,70.116,84.359z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.193,84.332c0.002,0,0.002-0.002,0.004-0.002C70.195,84.33,70.195,84.332,70.193,84.332z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.068,84.374c0.003,0,0.004,0,0.007-0.002C70.072,84.374,70.07,84.374,70.068,84.374z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.163,84.342c0.005,0,0.007-0.002,0.011-0.005C70.17,84.34,70.167,84.342,70.163,84.342z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M69.996,84.395c0.002,0,0.002,0,0.004,0C69.998,84.395,69.998,84.395,69.996,84.395z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.004,84.395c0.002,0,0.006-0.002,0.008-0.002C70.006,84.395,70.006,84.395,70.004,84.395z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M72.23,81.559c-0.002,0-0.004,0-0.004,0S72.229,81.559,72.23,81.559z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.053,84.379c0.002,0,0.002,0,0.004,0C70.053,84.379,70.053,84.379,70.053,84.379z\"/><path style=\"opacity:.1;fill:#231F20;\" d=\"M70.036,84.385c0.001,0,0.003,0,0.004-0.002C70.039,84.385,70.037,84.385,70.036,84.385z\"/><linearGradient id=\"SVGID_31_\" gradientUnits=\"userSpaceOnUse\" x1=\"414.2451\" y1=\"568.2656\" x2=\"509.0055\" y2=\"545.7273\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\".9505\" stop-color=\"#B2B4B6\"/></linearGradient><path style=\"fill:url(#SVGID_31_);\" d=\"M7.61,68.141c-0.065-0.062-0.112-0.105-0.139-0.131L7.45,68.021L7.61,68.141L7.61,68.141z\"/><linearGradient id=\"SVGID_32_\" gradientUnits=\"userSpaceOnUse\" x1=\"416.6992\" y1=\"578.5645\" x2=\"511.8228\" y2=\"555.9398\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\".9505\" stop-color=\"#B2B4B6\"/></linearGradient><path style=\"opacity:.83;fill:url(#SVGID_32_);\" d=\"M90.412,59.954l0.689,0.108c1.976-1.573,3.869-3.571,3.869-3.571s1.258-1.261,1.889-2.356c0.22-0.381,0.281-0.356,0.271-0.177c0.023-0.09,0.103-0.456-0.038-0.714c-0.094-0.176-0.381,0.288-0.83,0.861c0,0-2.013,2.926-5.798,5.816c-3.786,2.891-4.776,3.771-8.083,5.655c0,0-2.309,1.021-3.914,0.669c-1.246-0.271,0-1.547,0.271-2.699c0.271-1.146,0.063-1.58-0.225-1.807c-0.287-0.225-0.91-0.385-2.142-0.109c0,0-4.709,1.264-6.819,3.307c-1.918,1.854,0.478,2.619,1.021,2.875c0,0,0.78,0.338,0.719,0.672c-0.063,0.336-0.496,0.623-0.733,0.783c-0.239,0.16-3.338,1.977-8.324,2.764c-4.039,0.641-3.26,0.255-7.143,0.654c-3.881,0.399-4.952,0.72-8.068,1.453c-3.116,0.734-4.945,1.537-5.352,2.349c-0.336,0.671,0.479,1.103,0.991,1.407c0.511,0.304,1.423,0.781,1.119,1.293c-0.305,0.512-1.631,1.277-4.874,1.391c-3.243,0.114-4.569-0.336-5.16-1.04c-0.548-0.649-0.08-1.323,0.096-1.946c0,0,0.382-0.814,0.16-1.215c-0.224-0.398-0.737-0.494-1.278-0.559c-0.544-0.064-3.245-0.158-5.337-0.271c-2.372-0.127-5.208-0.211-8.611-0.928c0,0-2.237-0.441-3.69-1.262c-0.096-0.055-0.18-0.107-0.25-0.156c-0.11-0.059-0.194-0.122-0.25-0.209c-0.41-0.432-0.047-0.748-0.186-1.168c-0.121-0.359-0.352-0.878-0.896-1.501c-0.176-0.183-0.428-0.437-0.72-0.713c-0.08-0.069-0.165-0.144-0.254-0.214c-1.276-1.037-1.422-1.149-1.964-1.166c-0.542-0.019-0.235,0.895-0.129,1.246c0.041,0.136,0.139,0.328,0.242,0.508c-0.2-0.364-0.336-0.729-0.257-0.915c0.144-0.337,0.309-0.308,0.309-0.308s0.133-0.053,0.595,0.297c0.463,0.35,1.499,1.078,2.012,1.705c0.512,0.625,0.481,1.18,0.481,1.18s-0.103,0.563,0.451,1.17c0.555,0.604,1.733,1.714,5.859,2.349c0.021,0.005,0.041,0.005,0.06,0.009l0.193-0.549l0.568,0.663c0.006,0,0.01,0.001,0.016,0.002c3.592,0.519,5.544,0.563,5.544,0.563s4.709,0.164,5.982,0.164c1.271,0,1.035,0.664,1.035,0.664s-0.072,0.361-0.225,0.647c-0.153,0.288-0.524,1.365-0.144,1.94c0,0,0.585,1.426,4.382,1.527c0,0,3.324,0.267,5.643-0.688c2.317-0.954,0.224-2.277,0.224-2.277s-0.794-0.483-1.129-0.737c-0.308-0.233-0.184-0.48-0.122-0.646c0.061-0.163,0.297-0.355,0.564-0.492c0.265-0.134,1.241-0.652,5.365-1.722c4.124-1.067,6.587-1.183,6.587-1.183s0.021-0.004,0.062-0.006l0.334-0.656l0.845,0.559c0.732-0.061,1.686-0.129,2.537-0.17c1.691-0.083,4.341-0.475,5.879-0.811c1.539-0.342,3.869-1.059,5.591-1.951c1.724-0.891,1.808-1.519,1.808-1.519s0.328-0.472-0.391-0.995c-0.719-0.521-1.037-0.38-1.672-1.024c-0.638-0.646,0.553-1.619,0.553-1.619s0.615-0.865,4.021-2.177c3.408-1.313,3.98-0.873,4.156-0.728c0.175,0.142,0.195,0.613,0.123,0.933c-0.072,0.316-0.494,1.455-0.721,2.055c-0.227,0.592-0.316,1.402,0.604,1.6c0.924,0.193,2.215-0.009,3.427-0.443c2.893-1.033,3.757-2.295,8.535-5.764c0.011-0.01,0.021-0.016,0.029-0.023L90.412,59.954L90.412,59.954z\"/><linearGradient id=\"SVGID_33_\" gradientUnits=\"userSpaceOnUse\" x1=\"415.4736\" y1=\"573.4199\" x2=\"510.5869\" y2=\"550.7977\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\".9505\" stop-color=\"#B2B4B6\"/></linearGradient><path style=\"fill:url(#SVGID_33_);\" d=\"M100.895,47.596c-0.635,1.186-1.164,2.608-1.443,3.5c-0.045,0.213-0.061,0.33-0.061,0.33s-0.119,0.654-0.054,1.036c0.028,0.161,0.069,0.279,0.106,0.375c0.021,0.052,0.039,0.095,0.055,0.134c0.02,0.045,0.031,0.082,0.033,0.111c0.007,0.082-0.044,0.614-0.27,1.23l0,0c0,0,0,0,0,0.002c-0.063,0.176-0.143,0.359-0.24,0.539c-0.024,0.05-0.053,0.095-0.074,0.139c-0.458,0.814-1.098,1.457-1.604,1.532c-0.324,0.049-0.484-0.117-0.557-0.386c0.014,0.369,0.086,0.738,0.289,0.963c0.406,0.441,1.563-0.795,1.563-0.795s0.688-0.789,0.965-2.062c0.406-1.875,0.187-2.248,0.187-2.248s-0.247-0.389-0.093-0.853c0.152-0.461,1.156-3.047,1.979-4.01l0.502-0.562c0-0.009,0.002-0.02,0.002-0.029l-0.211-0.521c-0.129,0.13-0.259,0.284-0.385,0.454C101.405,46.763,101.178,47.129,100.895,47.596L100.895,47.596z\"/><linearGradient id=\"SVGID_34_\" gradientUnits=\"userSpaceOnUse\" x1=\"414.7754\" y1=\"570.4785\" x2=\"509.8697\" y2=\"547.861\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\".9505\" stop-color=\"#B2B4B6\"/></linearGradient><path style=\"fill:url(#SVGID_34_);\" d=\"M10.564,70.807L10.564,70.807c-0.146-0.092-0.315-0.229-0.469-0.356c-0.133-0.112-0.641-0.585-1.18-1.086c-0.212-0.194-0.411-0.382-0.589-0.55c-0.277-0.262-0.524-0.493-0.688-0.646l0.107,0.358c0.017,0.028,0.034,0.06,0.052,0.089c0.183,0.29,0.854,1.264,2.153,2.277c1.549,1.213,1.559,0.729,1.559,0.729s0.062-0.4-0.296-0.84c-0.063-0.076-0.131-0.167-0.202-0.27v0.002C11.011,70.516,12.023,71.998,10.564,70.807z\"/><linearGradient id=\"SVGID_35_\" gradientUnits=\"userSpaceOnUse\" x1=\"414.915\" y1=\"571.0664\" x2=\"510.04\" y2=\"548.4415\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\".9505\" stop-color=\"#B2B4B6\"/></linearGradient><path style=\"fill:url(#SVGID_35_);\" d=\"M10.678,69.98c0.103,0.186,0.219,0.371,0.333,0.533C11,70.501,10.833,70.253,10.678,69.98z\"/><linearGradient id=\"SVGID_36_\" gradientUnits=\"userSpaceOnUse\" x1=\"416.1035\" y1=\"576.0654\" x2=\"511.2286\" y2=\"553.4405\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#EDEDEE\"/><stop offset=\".4176\" stop-color=\"#FFF\"/><stop offset=\".6264\" stop-color=\"#F8F9F9\"/><stop offset=\".9505\" stop-color=\"#B2B4B6\"/></linearGradient><path style=\"fill:url(#SVGID_36_);\" d=\"M96.887,55.023c0,0,0.227-0.76,0.243-1.066c-0.003,0.014-0.005,0.021-0.005,0.021s-0.513,1.443-0.333,2.16C96.771,55.579,96.887,55.023,96.887,55.023z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M63.301,4.417l0.728,0.072c1.426-0.402,2.643-0.772,2.643-0.772s1.265-0.41,1.901-0.637c0.635-0.226,1.09-0.313,1.654-0.409c0.565-0.096,1.311-0.14,1.709-0.131c0.4,0.007,0.531,0.122,0.531,0.122s0.166,0.131,0.244,0.27c0.077,0.138,0.74,1.891,2.973,2.005c2.233,0.112,2.263-1.096,2.065-1.464c-0.226-0.427-0.896-0.863-0.896-0.863s-0.899-0.575-1.092-0.847c-0.191-0.27,0.034-0.357,0.104-0.375c0.065-0.017,2.435-0.497,2.729-0.609l0.021-0.021l-0.562-0.171c0,0-0.119,0.134-0.789,0.313c-0.67,0.179-1.235,0.246-1.742,0.313c-0.506,0.066-0.506,0.239-0.506,0.239l-0.086,0.136c-0.025,0.075-0.067,0.321,0.375,0.642c0.528,0.387,1.172,0.75,1.438,1.04s0.586,0.783,0.012,1.137C76.48,4.576,76.27,4.64,75.977,4.671c0.002,0.008,0,0.012,0,0.012c-0.248,0.021-0.457,0.03-0.638,0.03c-0.049,0.002-0.102,0.006-0.155,0.009l-0.017-0.013c-0.506-0.024-0.746-0.142-1.067-0.302c-0.442-0.223-0.758-0.73-0.92-1.087s-0.521-0.662-0.521-0.662c-0.588-0.336-1.695-0.343-2.813-0.15c-1.115,0.193-2.656,0.707-2.925,0.812c-0.268,0.104-1.616,0.551-2.307,0.73c-0.693,0.178-1.222,0.357-1.646,0.47c-0.427,0.111-3.432,1.005-4.556,1.339c-1.126,0.334-1.849,0.46-1.849,0.46c-1.688,0.172-2.193-0.134-2.193-0.134c-0.296-0.124-0.261-0.526-0.261-0.526l0.009-1.147c0,0-0.027-0.433-0.357-0.611c-0.328-0.179-0.779-0.252-1.593-0.29c-0.811-0.038-1.683,0.044-2.093,0.134c-0.408,0.09-1.189,0.313-1.764,0.952c-0.572,0.641-0.481,1.139-0.481,1.139s0.004,0.079,0.01,0.201c0.154,0.245,0.416,0.524,0.862,0.739c1.015,0.485-1.137,1.342-1.137,1.342l0,0c-0.479,0.208-1.191,0.478-2.208,0.777c-2.21,0.647-3.684,0.774-3.684,0.774l0.679,0.254c0,0,5.468-1.016,7.148-2.616c0,0,0.625-0.293,0.021-0.88c-0.606-0.585-0.898-0.761-0.898-0.761s-0.41-0.223,0.02-0.772c0.428-0.546,0.922-0.794,1.352-0.933c0.428-0.135,1.754-0.249,2.925-0.093c0,0,0.491,0.042,0.457,0.407c-0.032,0.365-0.087,0.873-0.077,1.028c0.01,0.157,0.025,0.515,0.399,0.845c0.379,0.332,1.098,0.453,1.098,0.453s1.257,0.228,2.845-0.218c1.586-0.444,3.65-1.141,5.438-1.629L63.301,4.417L63.301,4.417z\"/><linearGradient id=\"SVGID_37_\" gradientUnits=\"userSpaceOnUse\" x1=\"412.6152\" y1=\"535.3994\" x2=\"501.5865\" y2=\"514.8846\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".6538\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#CBCCCE\"/></linearGradient><path style=\"fill:url(#SVGID_37_);\" d=\"M91.596,12.992l0.271,0.486c-0.021,0.01-0.034,0.014-0.034,0.014c-1.114,0.515-3.999,1.32-4.271,1.398c-0.271,0.08-0.166,0.234-0.166,0.234c0.029,0.078,0.988,1.106,0.988,1.106c1.178,1.249,0.494,2.296,0.494,2.296s-0.852,1.347-2.844,1.12c-1.993-0.227-2.618-1.767-2.729-2.049c-0.111-0.282-0.197-0.768-0.22-1.095c-0.022-0.33-0.272-0.32-0.272-0.32c-1.069-0.03-2.887,1.089-2.887,1.089c-0.824,0.47-1.682,1.147-3.479,1.958c-0.879,0.396-1.694,0.716-2.287,0.936l-0.967-0.173l0.091,0.482c-0.042,0.013-0.063,0.021-0.063,0.021s-2.268,0.822-4.529,1.553c-2.268,0.732-3.65,0.8-3.65,0.8s-1.336,0.12-2.266-0.266c-0.93-0.386-0.959-0.94-0.939-1.415c0.021-0.476,0.483-1.404,0.623-1.958c0.139-0.555-0.683-0.644-0.683-0.644s-1.958-0.236-3.65,0.296c-1.69,0.535-2.54,1.159-2.54,1.159c-0.91,0.512-0.863,0.957-0.863,0.957s-0.012,0.467,0.551,0.869s1.072,0.505,1.736,0.654c0.668,0.149,0.791,0.311,0.791,0.311c1.08,0.894,0.416,1.785,0.047,2.434c-0.631,1.113-3.674,1.653-3.674,1.653c-3.276,0.758-5.12,1.08-7.827,1.452l-0.876-0.46l-0.276,0.615c-7.089,0.936-10.065,1.877-11.065,2.135c-1,0.257-1.261,0.784-1.369,0.904c-0.108,0.12,0.079,0.171,0.079,0.171c0.427,0.137,0.647,0.442,0.647,0.442s1.399,1.697-0.012,3.108c-1.359,1.36-2.785,1.674-2.785,1.674s-2.177,0.737-4.077,0.341c-1.899-0.399-2.439-1.889-2.416-2.395c0.024-0.505,0.176-1.075,0.694-1.661c0.517-0.585,0.654-0.667,0.654-0.667s0.358-0.279,0.421-0.415c0.079-0.172-0.404-0.233-0.404-0.233c-1.034-0.13-3.496-0.097-5.822,0.131c-1.439,0.14-2.769,0.374-3.578,0.518l-0.223-0.48l-0.543,0.625l-3.12,0.504c-1.514,0.222-2.576-0.028-2.576-0.028s-1.331-0.397-1.479-1.252c-0.147-0.852,0.359-1.87,0.49-2.177c0.13-0.307,0.5-0.934,0.5-0.934s0.068-0.13,0.068-0.34c0-0.211-0.233-0.536-0.233-0.536s-0.205-0.396-0.886-0.38c-0.682,0.018-0.866,0.131-1.144,0.364c-0.044,0.038-0.079,0.081-0.108,0.127c0.021-0.064,0.045-0.117,0.073-0.158c0.21-0.309,0.65-0.668,1.401-0.7c0.748-0.034,1.041,0.228,1.041,0.228c0.719,0.82,0.115,1.845-0.351,2.76c-0.057,0.095-0.155,0.271-0.229,0.483c-0.032,0.076-0.062,0.153-0.087,0.227c-0.358,1.06,0.292,1.565,0.668,1.661c0.376,0.097,1.141,0.57,4.269-0.031c3.13-0.603,3.587-0.731,3.587-0.731s6.145-1.087,8.96-0.425l0.023,0.004c0,0,1.297,0.367,0.331,1.334c-0.966,0.966-1.729,1.617-1.504,2.377c0.223,0.762,1.267,1.903,3.646,1.603c0,0,0.842-0.113,1.105-0.165c1.733-0.336,2.899-1.268,2.899-1.268s0.972-0.721,0.782-1.631c-0.187-0.908-1.017-1.189-1.017-1.189s-0.659-0.424-0.141-1.237c0,0,0.141-0.69,2.553-1.317c2.412-0.626,6.813-1.518,10.555-1.989c3.49-0.408,9.652-1.575,10.89-2.08c1.235-0.508,1.497-1.4,1.521-1.708c0.024-0.31,0.072-0.83-1.14-1.09c-1.213-0.259-1.758-0.655-1.931-0.79c-0.172-0.138-0.545-0.483-0.545-1.275c0-0.791,1.607-1.745,3.392-2.35c1.78-0.606,3.927-0.34,3.927-0.34c1.948,0.167,0.936,1.963,0.936,1.963c-0.074,0.322-0.946,1.785,0.5,2.169c1.541,0.409,4.175-0.347,5.188-0.669c0.829-0.261,3.141-1.074,4.688-1.62c0.352-0.122,0.66-0.231,0.908-0.318c1.656-0.577,3.019-1.219,3.785-1.681c0.771-0.462,2.144-1.297,2.144-1.297s1.351-0.744,1.799-0.808c0.451-0.064,1.619-0.346,1.771,0.771c0.155,1.115,0.631,1.899,1.4,2.271c0.771,0.371,2.064,0.538,3.246-0.231c1.182-0.771,0.359-1.901,0.359-1.901c-0.021-0.028-0.039-0.057-0.062-0.085c-0.151-0.27-0.369-0.518-0.487-0.646c-0.388-0.47-0.736-0.822-0.736-0.822c-0.295-0.436,0.053-0.692,0.425-0.834c0.373-0.141,2.351-0.758,2.351-0.758c1.155-0.383,1.592-0.551,2.053-0.988c0.445-0.419-0.189-1.34-0.239-1.412l0.004-0.002l0.608,0.256c0.136,0.182,0.27,0.362,0.4,0.547l-0.007,0.005c0,0,0.226,0.527,0.054,0.799c-0.095,0.149-0.343,0.293-0.545,0.395L91.596,12.992L91.596,12.992z\"/><linearGradient id=\"SVGID_38_\" gradientUnits=\"userSpaceOnUse\" x1=\"390.042\" y1=\"485.6797\" x2=\"390.042\" y2=\"485.6797\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#FFF\"/><stop offset=\".6538\" stop-color=\"#FFF\"/><stop offset=\"1\" stop-color=\"#CBCCCE\"/></linearGradient><path style=\"fill:url(#SVGID_38_);\" d=\"M-16.122-14.641\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M57.455,92.28c-0.034-0.042-0.042-0.034-0.012-0.063c0.021-0.021,0.086-0.082,0.115-0.137c0,0-1.17-0.063-2.141,0.077c-0.962,0.137-1.933,0.335-1.933,0.335l0.301,0.146c0,0,0.127-0.055,1.047-0.183c0.921-0.128,1.267-0.128,1.267-0.128s0.808-0.063,0.969-0.063c0.162,0,0.061,0.104,0.061,0.104s-0.078,0.136,0.366,0.124c0,0,0.663-0.027,1.313-0.188C58.809,92.309,57.678,92.544,57.455,92.28z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M54.469,92.691c0,0,0.146,0.266-2.923,0.394c0,0,1.788,0.052,3.31-0.198C55.963,92.707,54.469,92.691,54.469,92.691L54.469,92.691z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M13.114,9.856c0,0-0.005,0.096,0.019,0.131c0.024,0.034,0.107,0.112,0.107,0.112s0.328-0.5,0.194-0.438c0,0-0.119,0.187-0.164,0.23c0,0-0.029,0.04-0.088,0.077C13.123,10.006,13.117,9.991,13.114,9.856L13.114,9.856z\"/><path style=\"opacity:.1;fill:#232323;\" d=\"M10.595,12.501c0,0-0.388,0.46,0,0.52l0.528-0.527c0,0,0.139-0.234,0.139-0.398C11.263,12.095,10.752,12.343,10.595,12.501L10.595,12.501z\"/><path style=\"fill:#232323;\" d=\"M-16.122-14.641\"/><path style=\"fill:#6B6B6B;\" d=\"M21.093,23.707c1.227,0.146,1.499-0.132,1.527-0.172c0.294-0.003,1.475-0.034,2.865-0.207c1.685-0.21,3.564-0.891,3.564-0.891s1.554-0.568,2.096-1.18l0.016-0.002c0,0-0.693-0.6-1.057-1.122c0,0-0.286-0.557,0.027-1.035c0.316-0.479,0.836-1.008,2.344-1.643c1.506-0.636,2.356-0.514,2.356-0.514s0.594-0.006,1.007,0.45c0.415,0.458,0.649,1.006,0.649,1.006s0.029,0.38-0.115,0.63c-0.141,0.251-0.155,0.277-0.155,0.277s0.049,0.017,0.378-0.007c0.329-0.021,1.165-0.142,2.67-0.506c1.508-0.363,3.407-0.972,3.407-0.972s4.9-1.578,5.407-1.714c0.507-0.135,1.357-0.436,1.357-0.436l0.027,0.059c0,0,0.405,0.663,0.392,1.269V16.94c0,0-0.021,0.301-0.698,0.818c-0.674,0.517-1.226,0.479-1.678,0.442c-0.452-0.039-0.665-0.071-0.794-0.045l-0.72,0.04c-0.787,0.111-1.224,0.407-1.224,0.407c-1.804,1.065,0.731,9.287,0.731,9.287c-3.742,0.47-8.143,1.363-10.555,1.989c-2.412,0.627-2.553,1.317-2.553,1.317c-0.519,0.813,0.141,1.236,0.141,1.236s0.829,0.283,1.017,1.19c0.19,0.91-0.783,1.629-0.783,1.629s-1.159,0.97-2.898,1.268c-1.738,0.298-2.396,0.35-3.429-0.47c-0.91-0.721-0.297-1.864,0.312-2.301c0.612-0.438,0.909-0.91,0.988-1.113c0.079-0.203,0.032-0.376,0.032-0.376l-0.58-0.534c-2.005-1.33-9.884,0.063-9.884,0.063c-0.213-1.169-0.362-1.171-0.282-3.117c0.051-1.244,0.291-1.752,0.291-1.752l0.058-0.164c0,0,0.448-1.443,1.141-2.44c0,0,0.602-0.172,1.364-0.349C20.616,23.793,21.093,23.707,21.093,23.707L21.093,23.707z\"/><linearGradient id=\"SVGID_39_\" gradientUnits=\"userSpaceOnUse\" x1=\"231.2324\" y1=\"-407.8711\" x2=\"263.6191\" y2=\"-407.8711\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#696969\"/><stop offset=\".3702\" stop-color=\"#2E2E2E\"/><stop offset=\".4554\" stop-color=\"#424242\"/><stop offset=\".6014\" stop-color=\"#303030\"/><stop offset=\".6947\" stop-color=\"#4A4A4A\"/><stop offset=\"1\" stop-color=\"#666666\"/></linearGradient><path style=\"opacity:.45;fill:url(#SVGID_39_);\" d=\"M49.855,16.94c0,0-4.085,1.326-3.891,1.254c0,0-0.39,0.075-0.686,0.161c-0.294,0.086-0.539,0.247-0.539,0.247s-3.288,1.222-6.438,1.848c-3.148,0.627-2.977-0.361-2.708-0.83c0.232-0.409,0.829-1.112-0.188-1.254c-1.019-0.14-1.788,0.251-2.21,0.439c-0.422,0.189-3.162,1.362-1.251,2.254c0,0,1.423,0.642-0.377,1.755c0,0-1.816,1.16-5.355,1.77c0,0-0.565,0.063-1.88,0.111c-1.316,0.046-2.558,0.213-4.12,0.658c-1.378,0.391-1.992,0.579-2.744,1.065l0.194-0.501l0.2-0.462c1.069-0.533,3.719-1.288,5.717-1.378c1.997-0.089,2.908-0.16,4.721-0.624c2.134-0.546,2.702-1.019,2.93-1.163c0.194-0.123,0.771-0.479,0.493-0.633c-0.359-0.199-0.895-0.729-0.895-0.729c-0.217-0.256-0.39-0.373-0.158-1.046c0.356-1.029,2.196-1.644,2.196-1.644s1.028-0.534,2.334-0.514c1.305,0.021,1.287,0.752,1.287,0.752s0.062,0.34-0.268,0.827c0,0-0.503,0.579-0.049,0.656c0.454,0.081,1.622,0.179,5.48-1.028c3.859-1.207,8.085-2.611,8.085-2.611S49.855,16.66,49.855,16.94L49.855,16.94z\"/><linearGradient id=\"SVGID_40_\" gradientUnits=\"userSpaceOnUse\" x1=\"231.623\" y1=\"-407.063\" x2=\"263.4941\" y2=\"-407.063\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#525252\"/><stop offset=\".1856\" stop-color=\"#333333\"/><stop offset=\".354\" stop-color=\"#AEAEAE\"/><stop offset=\".4199\" stop-color=\"#ADADAD\"/><stop offset=\".4276\" stop-color=\"#9D9D9D\"/><stop offset=\".4433\" stop-color=\"#818181\"/><stop offset=\".4611\" stop-color=\"#6A6A6A\"/><stop offset=\".4814\" stop-color=\"#585858\"/><stop offset=\".506\" stop-color=\"#4C4C4C\"/><stop offset=\".539\" stop-color=\"#444444\"/><stop offset=\".6166\" stop-color=\"#424242\"/><stop offset=\".6684\" stop-color=\"#454545\"/><stop offset=\"1\" stop-color=\"#BDBDBD\"/></linearGradient><path style=\"fill:url(#SVGID_40_);\" d=\"M31.145,21.257c-0.541,0.612-2.096,1.18-2.096,1.18s-1.88,0.68-3.564,0.891c-1.608,0.201-2.777,0.209-2.777,0.209l-0.082-0.002c-0.175,0.145-0.483,0.188-0.728,0.21c-0.244,0.023-0.806-0.039-0.806-0.039s-2.156,0.432-2.603,0.616c0,0-0.253,0.392-0.331,0.539c-0.08,0.146-0.299,0.594-0.299,0.594c1.069-0.534,3.718-1.289,5.717-1.379c1.997-0.089,2.908-0.159,4.721-0.624c2.134-0.546,2.702-1.019,2.929-1.163c0.195-0.123,0.771-0.479,0.493-0.633c-0.358-0.199-0.894-0.729-0.894-0.729c-0.217-0.256-0.391-0.373-0.158-1.046c0.356-1.029,2.196-1.644,2.196-1.644s1.028-0.533,2.333-0.514c1.306,0.021,1.287,0.753,1.287,0.753s0.062,0.34-0.269,0.826c0,0-0.503,0.579-0.049,0.657c0.455,0.08,1.622,0.178,5.48-1.028c3.858-1.208,8.085-2.612,8.085-2.612c-0.098-0.29-0.296-0.652-0.296-0.652s-0.85,0.301-1.358,0.436c-0.506,0.136-5.407,1.714-5.407,1.714s-1.9,0.608-3.407,0.972c-1.506,0.364-2.342,0.485-2.671,0.508c-0.329,0.021-0.378,0.006-0.378,0.006s0.013-0.027,0.156-0.279c0.144-0.248,0.115-0.629,0.115-0.629s-0.235-0.548-0.649-1.006c-0.414-0.457-1.007-0.45-1.007-0.45s-0.849-0.121-2.355,0.514c-1.508,0.636-2.029,1.164-2.346,1.643c-0.312,0.478-0.026,1.035-0.026,1.035c0.365,0.521,1.057,1.122,1.057,1.122\"/><linearGradient id=\"SVGID_41_\" gradientUnits=\"userSpaceOnUse\" x1=\"236.917\" y1=\"-417.333\" x2=\"235.8882\" y2=\"-410.5272\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\"><stop offset=\"0\" stop-color=\"#969696\"/><stop offset=\"1\" stop-color=\"#000\"/></linearGradient><path style=\"opacity:.2;fill:url(#SVGID_41_);\" d=\"M21.606,31.241c0,0-0.064-0.328,0.172-0.939c0.234-0.611,0.908-0.595,1.362-0.503c0.455,0.095,0.846,0.298,1.472-0.124c0.627-0.423,0.47-1.583,0.046-2.852c-0.423-1.267-0.328-2.128-0.328-2.128l-0.608-0.649l-0.237,0.696c0.047,1.316,0.657,3.226,0.829,3.759c0.173,0.533,0.297,0.8-0.735,0.517c-1.034-0.282-1.519,0.125-1.519,0.125c-1.332,0.862-1.082,2.161-1.082,2.161L21.606,31.241z\"/><path style=\"opacity:.5;fill:#141414;\" d=\"M27.498,36.633c-0.264-1.763-0.917-2.749-0.917-2.749c-0.25,0.188-0.513,0.693-0.513,0.693s0.179,0.208,0.471,1.568c0,0,0.141,0.106,0.438,0.279C27.273,36.597,27.498,36.633,27.498,36.633z\"/><path style=\"opacity:.5;fill:#141414;\" d=\"M33.152,32.881c0,0-0.78,0.907-0.378,2.336c0,0,0.454-0.379,0.585-0.68c0,0-0.145-0.458,0.138-1.017C33.5,33.52,33.37,33.1,33.152,32.881L33.152,32.881z\"/><linearGradient id=\"SVGID_42_\" gradientUnits=\"userSpaceOnUse\" x1=\"428.7803\" y1=\"532.0527\" x2=\"429.5303\" y2=\"524.4692\" gradientTransform=\"matrix(1 0 0 1 -406.1641 -500.3203)\"><stop offset=\"0\" stop-color=\"#333333\"/><stop offset=\".431\" stop-color=\"#000\"/><stop offset=\"1\" stop-color=\"#2E2E2E\"/></linearGradient><path style=\"opacity:.18;fill:url(#SVGID_42_);\" d=\"M21.2,31.253c0.017-1.299,0.471-1.492,0.905-1.818c0.436-0.328,1.326-0.024,1.326-0.024s0.678,0.218,1.046-0.1c0.369-0.319-0.017-1.467-0.217-2.123c-0.202-0.653-0.41-1.599-0.445-2.262c-0.025-0.489-0.091-0.707-0.125-0.789l-0.205,0.604c0.047,1.316,0.657,3.226,0.829,3.759c0.173,0.533,0.297,0.8-0.735,0.517c-1.035-0.282-1.519,0.125-1.519,0.125c-1.332,0.862-1.082,2.162-1.082,2.162l0.259-0.027L21.2,31.253L21.2,31.253z\"/><path style=\"opacity:.3;fill:#505050;\" d=\"M26.239,34.29c0.045,0.06,0.421,0.597,0.736,2.113l0.005,0.025c0.294,0.17,0.519,0.205,0.519,0.205c-0.264-1.763-0.917-2.749-0.917-2.749C26.46,33.977,26.336,34.143,26.239,34.29L26.239,34.29z\"/><path style=\"opacity:.3;fill:#505050;\" d=\"M33.152,32.881c0,0-0.78,0.907-0.378,2.336c0,0,0.125-0.104,0.262-0.248l0.021-0.051c-0.304-1.033,0.283-1.763,0.283-1.763l0.004-0.003C33.291,33.053,33.225,32.957,33.152,32.881z\"/><path style=\"opacity:.88;fill:#231F20;\" d=\"M17.159,8.189h0.117c-0.16,0.481-0.789,1.141-1.068,1.583c-0.156,0.248-0.252,0.572-0.474,0.751c0.038,0.043-0.003,0.003,0.04,0.04c0.088,0.052,0.813-0.139,0.95-0.236c0.082,0.015,0.076,0.011,0.12,0.039c0.042,0.07-0.481,0.991-0.595,1.109v0.04c0.196-0.023,0.502-0.056,0.634-0.16c0.383-0.299,0.47-0.937,0.75-1.346c-0.013-0.066-0.026-0.132-0.04-0.196c-0.222-0.04-0.681,0.02-0.87,0.157h-0.039c0.091-0.473,0.868-1.346,1.146-1.741c0.454-0.647,0.881-1.269,1.345-1.9c0.243-0.331,0.585-0.622,0.831-0.949c0.276-0.367,0.569-0.85,0.949-1.107V4.194h-0.158c-0.186,0.135-0.675,0.218-0.908,0.354c0.032,0.135,0.019,0.101,0.118,0.158c-0.139,0.386-0.598,0.673-0.832,0.991c-0.371,0.5-0.784,0.968-1.147,1.464c-0.123,0.164-0.205,0.421-0.356,0.553c-0.237,0.208-0.913,0.185-1.185,0.396h-0.08c0.056-0.332,0.907-1.392,1.147-1.622v-0.04c-0.408,0.057-0.724,0.273-0.989,0.473c0.044,0.091,0.037,0.073,0.12,0.12c-0.145,0.238-0.361,0.415-0.515,0.633c-0.197,0.275-0.305,0.602-0.514,0.871c0.014,0.04,0.028,0.077,0.04,0.118C15.948,8.641,17.001,8.307,17.159,8.189L17.159,8.189z M51.936,13.534c0.199,0.066,0.396,0.131,0.596,0.197c0.159,0.002,0.327-0.002,0.432-0.04c-0.009-0.654-0.364-0.913-0.593-1.345c-0.113-0.22-0.175-0.523-0.355-0.673c0.069-0.242,0.727-0.308,0.988-0.396c0.643-0.211,1.371-0.422,2.02-0.633c0.305-0.099,0.664-0.077,0.91-0.236c0.146,0.015,0.22,0.029,0.277,0.118c0.143,0.212,0.26,1.667,0.156,2.097c-0.398,1.663-0.896,2.963-1.938,3.958v0.039c0.385-0.062,0.568-0.436,0.83-0.632c1.051-0.794,1.762-1.972,2.137-3.444c0.221-0.865-0.14-1.713,0.199-2.452h-0.039c-0.074-0.188-1.082-0.553-1.388-0.555c-0.164,0.177-0.399,0.416-0.634,0.515c-0.357,0.152-0.838,0.109-1.146,0.315c-0.287-0.024-0.506-0.57-0.315-0.791c-0.011-0.09-0.009-0.112-0.04-0.158c-0.239-0.191-0.85-0.171-1.268-0.158c-0.133,0.125-0.252,0.15-0.314,0.358h-0.039c-0.021,0.076,0.02,0.05,0.039,0.078c0.025,0.016,0.163-0.007,0.236,0.04c0.449,0.047,0.438,0.566,0.675,0.831c-0.027,0.069-0.011,0.04-0.042,0.08c-0.155,0.123-1.301,0.453-1.543,0.515c-0.185,0.046-0.414-0.068-0.553-0.081c-0.336-0.028-0.633,0.16-0.831,0.277c0.107,0.157,0.434,0.118,0.554,0.276C51.368,12.193,51.556,12.913,51.936,13.534L51.936,13.534z M59.807,12.977c0.187,0.093,0.187,0.332,0.278,0.514c0.185,0.371,0.437,0.82,0.554,1.228v0.316c0.092,0.252,0.396,0.284,0.596,0.435c0.156-0.021,0.214-0.061,0.314-0.118c-0.066-0.753-0.525-1.378-0.791-1.979c-0.08-0.188-0.207-0.452-0.236-0.633c-0.021-0.109,0.063-0.169,0-0.276c-0.051-0.123-0.072-0.085-0.156-0.159c-0.059-0.04-0.031-0.016,0-0.078c0.068-0.144,0.213-0.287,0.275-0.436c0.133-0.313,0.127-0.576,0.396-0.751c-0.04-0.41-0.639-0.457-1.107-0.435c-0.057,0.042-0.156,0.064-0.24,0.077c0.05,0.103,0.082,0.124,0.199,0.157c0.113,1.161-0.699,2.225-1.229,2.928c-0.208,0.279-0.556,0.456-0.75,0.754h-0.04v0.038C58.395,14.473,59.54,13.383,59.807,12.977L59.807,12.977z M12.407,22.83c-0.081,0.017-0.076,0.009-0.117,0.039c-0.288,0.148-0.773,1.426-1.346,1.069c-0.292,0.002-0.319-0.055-0.476-0.16c0.02-0.376,0.659-1.063,0.913-1.226c0.031-0.604,0.187-1.252,0.118-1.819c-0.041-0.014-0.08-0.028-0.118-0.039c-0.14-0.046-0.25,0.168-0.357,0.276c-0.29,0.291-0.648,0.597-0.871,0.949c-0.337-0.003-1.414-0.013-1.623,0.119H8.411c0.099-0.256,0.86-1.096,0.633-1.464c-0.013-0.041-0.025-0.08-0.04-0.12c-0.722,0.002-1.592,1.287-1.82,1.82c-0.115,0.266-0.115,0.573-0.276,0.791v0.04c0.54-0.066,1.082-0.133,1.622-0.199c0.205-0.044,0.487,0.052,0.633-0.039h0.554c0.092-0.118,0.184-0.238,0.277-0.356c0.33-0.349,0.768-0.702,1.028-1.106h0.119v0.551c-0.303,0.273-0.773,0.695-0.91,1.108v0.316c-0.203,0.88,0.223,1.329,0.99,1.267c0.5-0.466,1.324-0.848,1.226-1.779C12.405,22.833,12.444,22.873,12.407,22.83L12.407,22.83z M7.819,22.118H7.58c0.109-0.436,0.537-0.935,1.069-0.95v0.197c-0.185,0.239-0.369,0.475-0.554,0.713C7.982,22.076,7.88,22.076,7.819,22.118z M93.044,22.315c-0.164-0.405-0.294-0.722-0.475-1.068c-0.3-0.574-0.613-1.414-1.464-1.425c-0.211,0.179-0.435,0.322-0.555,0.593c-0.777,1.762,0.819,3.747,1.543,4.71c0.256,0.339,0.557,0.712,0.948,0.908c-0.091,1.376-1.269,1.813-2.53,1.267c-0.899-0.386-1.617-1.237-2.179-1.979c-0.188-0.249-0.481-0.457-0.672-0.713c-0.177-0.239-0.304-0.507-0.515-0.713v-0.039h-0.078c0.107,0.426,0.354,0.815,0.514,1.188c0.669,1.538,1.52,2.614,2.811,3.521c0.608,0.428,1.621,1.104,2.494,0.475C94.412,27.942,93.669,23.851,93.044,22.315L93.044,22.315z M92.928,24.216c-0.104,0.1-0.539-0.419-0.635-0.515c-0.441-0.443-1.329-1.221-0.83-1.979h0.197c0.388,0.403,0.746,0.788,0.99,1.344c0.129,0.299,0.152,0.805,0.313,1.069C92.941,24.205,92.958,24.175,92.928,24.216L92.928,24.216z M66.693,32.128v-0.395c0.179-0.801,0.137-1.765,0.314-2.572c0.241-1.088-0.101-2.148,0.99-2.414c0.021-0.106,0.057-0.148,0-0.238c-0.025-0.067-0.009-0.039-0.04-0.079c-0.043-0.031-0.038-0.024-0.116-0.039c-0.305,0.222-1.131,0.373-1.543,0.474c-0.313,0.076-0.639,0.01-0.871,0.158c-0.039,0.013-0.078,0.027-0.119,0.04c0.014,0.079,0.025,0.159,0.041,0.237c0.451,0.147,0.867-0.031,1.067,0.356c0.13,0.252,0.112,1.157,0.039,1.504c-0.251,1.163-0.146,2.491-0.396,3.64c-0.086,0.397,0.022,1.171-0.157,1.463v0.08c-0.241-0.115-0.397-0.426-0.554-0.633c-0.354-0.467-0.875-0.84-1.229-1.305c-0.213-0.281-0.437-0.617-0.712-0.833c0.037-0.761,0.259-1.56,0.438-2.254c0.131-0.522,0.135-1.005,0.395-1.386c0.148-0.217,0.505-0.355,0.751-0.475c-0.002-0.1-0.004-0.146-0.04-0.198c-0.014-0.04-0.023-0.079-0.037-0.119c-0.543,0.081-1.003,0.341-1.505,0.475c-0.454,0.123-0.911,0.092-1.269,0.276c0.012,0.091,0.01,0.112,0.041,0.158c0.014,0.039,0.024,0.08,0.039,0.118c1.391-0.078,1.18,0.678,0.912,1.742c-0.084,0.326-0.029,0.775-0.199,1.028v0.079h-0.039c-0.285-0.433-0.713-0.852-1.067-1.227c-0.146-0.132-0.291-0.264-0.435-0.395c-0.104-0.137-0.16-0.312-0.278-0.436c0.024-0.437,0.38-0.549,0.713-0.672c-0.015-0.183-0.052-0.206-0.118-0.317c-1.031,0.151-1.927,0.73-3.086,0.791v0.041h-0.04c0.004,0.1,0.004,0.146,0.04,0.197v0.079c0.227,0.039,0.564-0.054,0.831,0.04c0.427,0.15,0.81,0.648,1.067,0.99c0.388,0.513,0.996,0.949,1.384,1.463c0.204,0.274,0.434,0.634,0.713,0.832c-0.038,0.696-0.229,1.428-0.396,2.058c-0.086,0.323-0.035,0.735-0.197,0.988c-0.025,0.069-0.01,0.039-0.041,0.08c-0.377-0.718-1.104-1.265-1.582-1.9c-0.918-1.22-1.938-2.319-2.889-3.521c0-0.167,0.01-0.268,0.08-0.356c0.073-0.229,0.359-0.443,0.633-0.476c0.015-0.12,0.033-0.135-0.039-0.238c-0.016-0.038-0.026-0.077-0.041-0.118c-0.803,0.123-1.521,0.497-2.293,0.714c-0.401,0.112-0.928,0.057-1.229,0.276c-0.04,0.013-0.08,0.026-0.117,0.04c0.021,0.152,0.061,0.176,0.117,0.277c0.314-0.005,0.646-0.092,0.949,0c0.793,0.241,1.361,1.137,1.818,1.742c0.201,0.266,0.513,0.483,0.713,0.751c0.849,1.129,1.808,2.146,2.65,3.285c0.328,0.442,0.771,0.825,1.066,1.304c0.179-0.004,0.216-0.025,0.316-0.079c0.213-0.929,0.332-1.866,0.596-2.81c0.119-0.432,0.269-0.942,0.314-1.424c0.327,0.117,0.592,0.607,0.793,0.871c0.618,0.821,1.491,1.502,2.057,2.373c0.164-0.007,0.182-0.026,0.277-0.078C66.352,34.819,66.521,33.473,66.693,32.128L66.693,32.128z M4.297,38.894c-0.013,2.467-0.142,6.269,1.781,6.806c0.7,0.193,1.087-0.271,1.306-0.595c0.786-1.17,0.565-3.446-0.199-4.43c-0.339,0.034-0.825,0.84-0.988,1.106c-0.082-0.016-0.075-0.011-0.119-0.04c-0.091-0.041-0.085-0.066-0.159-0.118c-0.06-0.933,0.127-1.802,0.159-2.691c1.044,0.102,1.941,0.696,3.007,0.751c-0.001-0.185,0-0.434,0.077-0.552c-0.009-0.092-0.007-0.112-0.04-0.16c-0.145-0.115-0.949-0.306-1.186-0.315v-0.04h-0.04c0.146-1.174-0.186-2.082-0.99-2.414c-0.449-0.08-0.897-0.16-1.346-0.239c-0.229-0.083-0.341-0.266-0.514-0.395c-0.058-0.38-0.133-0.806,0.159-1.029c-0.021-0.142-0.032-0.168-0.119-0.238v-0.039h-0.04c-0.133,0.228-0.245,0.493-0.315,0.792c-0.234,0.983,0.309,1.818,0.909,2.018c0.397,0.065,0.792,0.132,1.188,0.197c0.314,0.122,0.453,0.379,0.671,0.595c-0.009,0.512-0.5,0.568-0.91,0.435c-0.64-0.208-1.321-0.353-1.977-0.592c-0.172-0.064-0.333-0.17-0.555-0.199c-0.027,0.25-0.054,0.501-0.08,0.751c0.554,0.171,1.109,0.343,1.662,0.515c-0.023,1.398-0.574,3.074,0.119,4.153c0.084,0.021,0.143,0.037,0.198,0.08c0.78-0.054,0.943-0.68,1.345-1.108c0.342,0.82,0.086,2.253-0.671,2.453c-0.326,0.224-0.803-0.066-0.989-0.237c-0.648-0.599-0.785-1.511-1.027-2.532c-0.083-0.344,0.033-1.042-0.118-1.307c0.006-0.404,0.092-1.134-0.12-1.344v-0.039L4.297,38.894L4.297,38.894z M99.336,45.543c-0.143-0.666,0.055-1.478-0.08-2.097v-0.633c-0.097-0.453-0.059-1.056-0.156-1.502c-0.189-0.882-0.022-1.926-0.355-2.652c-0.197-0.047-0.393-0.084-0.671-0.08c-0.103,0.104-0.179,0.158-0.159,0.278c0.083,0.359,0.547,0.432,0.673,0.792c0.015,0.172,0.026,0.343,0.04,0.514c0.133,0.561,0.111,1.286,0.236,1.86v0.475c0.063,0.289,0.16,1.036,0.078,1.267c-0.139,0.41-0.584,0.78-0.868,1.068c-0.754,0.755-1.64,1.715-2.97,1.859c-0.025,0.068-0.01,0.039-0.041,0.08c0.022,0.494,0.476,0.396,0.793,0.594c0.08-0.014,0.158-0.028,0.236-0.042c0.122-0.074,0.191-0.242,0.276-0.356c0.2-0.261,0.563-0.399,0.751-0.671h0.04c0.002,1.205,0.028,2.561,0.04,3.718h0.117c0.272-1.172,0.252-2.61,0.238-4.039c0.521-0.486,0.853-1.19,1.385-1.66v-0.078h0.041c0.007,1.251,0.037,2.529,0.037,3.797c0,0.407-0.102,1.378,0,1.544v0.237h0.08c0.106-0.425,0.133-1.023,0.236-1.501v-0.674C99.451,47.107,99.45,46.078,99.336,45.543L99.336,45.543z M28.313,48.073c-0.347-0.144-0.776-0.461-0.989-0.751c-0.637-0.875-1.337-2.948-0.87-4.51c0.379-1.266,1.202-2.127,2.532-2.454c0.673-0.163,1.397,0.062,1.821,0.278c1.208,0.622,1.725,1.506,2.096,2.967c0.48,1.887-0.132,3.619-1.385,4.194c0.078,0.764,0.158,1.529,0.237,2.295c0.444-0.013,0.852-0.105,1.227-0.199c0.629-0.155,1.271-0.176,1.86-0.315c0.431-0.104,1.052-0.015,1.384-0.237c0.079-0.17-0.247-1.35-0.315-1.623c-0.057-0.229-0.009-0.461-0.119-0.633v-0.079c-0.091,0.012-0.185,0.025-0.277,0.039c0.018,1.195-0.834,1.032-1.781,1.267c-0.473,0.119-1.049,0.27-1.581,0.276c0-0.17,0-0.343-0.001-0.514c0.045-0.083,0.739-0.386,0.868-0.476c0.461-0.318,0.931-0.826,1.229-1.304c0.202-0.327,0.366-0.764,0.473-1.149c0.138-0.489,0.154-1.17,0.041-1.662c-0.079-0.338-0.048-0.603-0.158-0.91c-0.427-1.187-1.322-2.054-2.453-2.532c-0.513-0.216-1.093-0.224-1.7-0.356c-0.539-0.116-1.509,0.124-1.901,0.238c-1.905,0.562-3.198,1.48-3.799,3.323c-0.236,0.728-0.163,1.736,0.04,2.414c0.467,1.561,1.773,3.02,3.72,3.047v0.039c0.062,0.088,0.06,0.264,0.118,0.355c-0.024,0.067-0.009,0.039-0.04,0.08c-0.164,0.111-0.404,0.061-0.633,0.117c-0.47,0.118-1.986,0.486-2.334,0.158c-0.222-0.072-0.37-0.363-0.396-0.632c-0.099,0.004-0.146,0.004-0.197,0.039h-0.082c0.146,0.767,0.291,1.53,0.435,2.296h0.041v0.04c1.385-0.239,2.77-0.478,4.154-0.713c-0.198-0.728-0.395-1.451-0.593-2.179C28.873,48.139,28.517,48.159,28.313,48.073L28.313,48.073z M96.014,43.682c0.086,0.218,0.254,0.58,0.435,0.712c0.086,0.063,0.132,0.04,0.198,0.119c1.31,0.113,1.842-2.143,1.308-3.442c-0.095-0.225-0.517-0.885-0.911-0.633h-0.08c0.026-0.069,0.01-0.038,0.04-0.08c-0.001-0.188-0.021-0.25-0.077-0.356c-0.08-0.013-0.156-0.026-0.238-0.038c-0.039,0.031-0.01,0.014-0.078,0.038c0.027,0.24,0.111,0.247,0.119,0.514C96.09,41.099,95.545,42.497,96.014,43.682z M96.446,41.585c0.088-0.213,0.265-0.35,0.396-0.515c0.082-0.015,0.075-0.01,0.117-0.04c0.301-0.001,0.385,0.057,0.555,0.159c0.301,0.711,0.346,1.954-0.156,2.494c-0.077,0.085-0.229,0.116-0.315,0.197C96.214,43.817,96.146,42.305,96.446,41.585L96.446,41.585z M78.092,57.168c-0.445-0.273-0.507-1.675-0.673-2.294c-0.327-1.215-0.483-2.489-0.831-3.72c-0.223-0.788-0.523-1.605-0.435-2.572c0.139-0.138,0.231-0.32,0.396-0.436c0.223-0.154,0.58-0.229,0.752-0.436c0.027-0.051-0.019-0.128-0.041-0.238c-0.459,0.074-0.879,0.35-1.267,0.515c-0.792,0.337-1.567,0.536-2.373,0.87c-0.252,0.104-0.515,0.282-0.833,0.315v0.238c0.027,0.014,0.055,0.025,0.08,0.04c0.042,0.045,1.033-0.392,1.346-0.118c0.356,0.125,0.311,0.59,0.514,0.872c-0.061,0.614-0.672,1.558-0.912,2.097c-0.58,1.326-1.17,2.592-1.816,3.836c-0.248,0.477-0.543,1.334-0.871,1.701v0.039c-0.216-0.296-0.199-1.051-0.314-1.462c-0.353-1.235-0.578-2.591-0.951-3.798c-0.068-0.23-0.305-1.279-0.156-1.503c0.051-0.546,0.822-0.785,1.266-0.95c-0.012-0.092-0.024-0.186-0.039-0.277c-0.701,0.105-1.429,0.479-2.058,0.713c-0.595,0.223-1.14,0.313-1.741,0.516c-0.298,0.102-0.636,0.275-0.986,0.314v0.041h-0.041c0.015,0.112,0.025,0.172,0.078,0.237c0.162,0.107,1.03-0.352,1.386-0.077c0.557,0.19,0.573,1.075,0.752,1.66c0.481,1.579,0.728,3.327,1.187,4.947c0.115,0.404,0.391,1.686,0.119,2.018c-0.148,0.439-0.885,0.615-1.306,0.791c0.014,0.08,0.024,0.159,0.036,0.237c0.609-0.09,1.162-0.373,1.707-0.56c1.063-0.354,2.066-0.65,3.089-1.029c-0.017-0.092-0.027-0.186-0.041-0.275c-0.437,0.116-0.773,0.248-1.386,0.236c-0.08-0.068-0.157-0.133-0.235-0.199c-0.067-0.21-0.134-0.422-0.199-0.632c0.043-0.499,0.683-1.421,0.91-1.86c0.673-1.293,1.262-2.6,1.856-3.955c0.229-0.519,0.754-1.275,0.832-1.857c0.184,0.111,0.133,0.438,0.197,0.672c0.135,0.475,0.211,0.98,0.355,1.503c0.281,1,0.391,2.075,0.673,3.126c0.104,0.387,0.261,1.048,0.08,1.464c-0.179,0.404-0.841,0.673-1.267,0.83c0.017,0.084,0.037,0.183,0.08,0.238c0.004,0.007,0.906-0.288,1.064-0.354c1.104-0.471,2.236-0.959,3.361-1.386c-0.015-0.093-0.024-0.187-0.039-0.274C79.117,57.043,78.477,57.407,78.092,57.168L78.092,57.168z M96.803,60.498c-0.143,0.13-0.354,0.163-0.514,0.277c-0.501,0.359-1.025,0.962-1.385,1.463c-0.288,0.402-0.534,0.843-0.791,1.268c-0.112,0.188-0.137,0.402-0.277,0.553v0.08c0.346-0.059,0.549-0.283,0.792-0.436c0.659-0.408,1.249-0.781,1.858-1.225c0.295-0.217,0.515-0.551,0.83-0.754c0.029-0.473,0.125-0.844-0.077-1.188C97.115,60.512,96.975,60.496,96.803,60.498z M96.329,61.921c-0.239,0.177-0.47,0.423-0.712,0.595c-0.208,0.146-0.458,0.224-0.633,0.396h-0.04c0.13-0.408,0.817-1.107,1.146-1.344c0.17-0.124,0.383-0.157,0.557-0.279h0.156c0.036,0.046,0.034,0.044,0.08,0.08C96.846,61.667,96.523,61.774,96.329,61.921L96.329,61.921z M10.825,63.465c-0.166-0.502-0.278-0.99-0.435-1.465c-0.079-0.246-0.062-0.525-0.199-0.713v-0.118c0.269,0.097,0.679,0.087,0.911,0.238h0.201c-0.045-0.206-0.086-0.552-0.201-0.713c-0.12-0.195-0.886-0.197-1.106-0.354c-0.312-0.244-0.607-0.947-0.832-1.307c-0.56-0.887-1.302-1.832-2.137-2.453c-0.443-0.329-0.751-0.671-1.544-0.673c-0.092,0.065-0.185,0.132-0.276,0.198c-0.178,0.789,0.139,2.248,0.592,2.611v0.078c-0.189-0.051-0.393-0.152-0.514-0.275h-0.04c0.007,0.227,0.051,0.522,0.158,0.672c0.046,0.195,0.362,0.354,0.554,0.396c0.248,1.037,0.592,2.101,0.95,3.05c0.289,0.758,0.436,1.48,0.75,2.213c0.155,0.356,0.522,0.617,0.634,0.99h0.117c-0.089-0.334-0.271-0.646-0.394-0.949c-0.364-0.875-0.653-1.804-0.952-2.688C6.868,61.62,6.734,61.057,6.548,60.5c-0.069-0.21-0.049-0.427-0.158-0.595v-0.039c0.269,0.049,0.43,0.188,0.634,0.276c0.461,0.201,0.903,0.277,1.385,0.476c0.353,0.146,0.796,0.347,1.228,0.396c0.048,0.359,0.253,1.301,0.435,1.545v0.117c-0.602-0.412-0.589-1-1.663-0.91c-0.054,0.063-0.128,0.117-0.197,0.158c-0.098,0.244-0.104,0.646,0,0.909c0.257,0.646,1.072,1.991,1.741,2.179c0.257,0.184,0.634-0.043,0.75-0.24c0.242,0.127,0.293,0.682,0.395,0.951c0.212,0.558,0.522,1.289,1.031,1.543v0.041h0.083c-0.066-0.447-0.318-0.851-0.475-1.229C11.387,65.223,11.113,64.324,10.825,63.465L10.825,63.465z M9.678,60.26C9.26,60.23,8.905,60.067,8.57,59.945c-0.894-0.332-1.703-0.615-2.492-0.991c-0.095-0.358-0.76-1.644-0.396-2.095c0.026-0.04,0.053-0.081,0.079-0.12c0.081-0.019,0.077-0.011,0.119-0.039c1.219,0.146,2.442,1.629,3.046,2.452c0.236,0.32,0.43,0.799,0.752,1.029V60.26L9.678,60.26z M10.311,63.701c-0.12,0.146-0.237,0.291-0.356,0.436c-0.105,0.078-0.223,0.109-0.316,0.198c-0.68-0.021-0.704-0.686-0.989-1.108c0.005-0.389,0.152-0.39,0.315-0.594c0.092-0.007,0.112-0.007,0.158-0.037c0.614,0.004,0.753,0.278,1.109,0.515C10.29,63.344,10.327,63.445,10.311,63.701L10.311,63.701z M33.578,69.794c-0.165-0.271-0.49-0.342-0.713-0.554c-0.069-0.023-0.04-0.007-0.079-0.039c0.51-0.264,1.053-0.555,1.583-0.79c0.142,0.158,0.801,0.792,1.029,0.671c0.04-0.012,0.079-0.023,0.118-0.038c-0.013-0.224-0.025-0.448-0.04-0.673c-0.499-0.498-1.234-0.91-2.059-1.066v0.039h-0.039c0.093,0.273,0.398,0.534,0.636,0.672v0.119c-0.469,0.068-0.885,0.295-1.307,0.437c-0.289,0.093-0.638,0.08-0.873,0.235h-0.117c0.171-0.479,0.737-0.871,1.028-1.267c0.576-0.776,1.033-1.728,1.94-2.176c-0.024-0.365-1.076-1.12-1.464-0.871c-0.097,0.051-0.029-0.021-0.079,0.078c-0.059,0.144,0.137,0.321,0.079,0.554c-0.076,0.305-0.831,1.74-1.029,1.9v0.041c-0.408-0.139-0.718-0.523-1.107-0.713c0.069-0.364,0.375-0.644,0.554-0.91c0.453-0.684,0.816-1.335,1.503-1.782c-0.006-0.526-0.855-1.075-1.425-1.065c0.002,0.242,0.125,0.379,0.08,0.592c-0.14,0.646-0.435,1.297-0.672,1.861c-0.156,0.364-0.226,0.799-0.476,1.065c-0.054,0.03-0.492-0.006-0.594-0.077c-0.149-0.002-0.298,0.005-0.394,0.038v0.079c0.666,0.645,1.387,0.865,2.295,1.268c-0.126,0.655-0.786,1.092-1.108,1.584c-0.166,0-0.3-0.011-0.395-0.08c-0.091,0.017-0.098,0.021-0.158,0.041c0.016,0.582,0.5,1.077,0.987,1.188c0.327-0.366,0.737-0.543,1.228-0.751c0.449,0.468,0.578,1.137,0.751,1.897c0.075,0.332-0.047,0.697,0.04,0.988c0.152,0.514,0.426,0.667,0.672,1.027h0.277c0.174-0.93-0.253-1.832-0.475-2.571C33.71,70.43,33.644,70.111,33.578,69.794L33.578,69.794z M96.09,63.108c-0.238,0.202-0.57,0.296-0.83,0.475c-0.4,0.282-0.758,0.659-1.146,0.95c-0.177,0.134-0.435,0.253-0.556,0.436c-0.199,0.299-0.16,0.806-0.396,1.067v0.157c0.314-0.114,0.464-0.483,0.713-0.672c0.307-0.23,0.563-0.536,0.87-0.754c0.192-0.133,0.411-0.207,0.594-0.355c0.125,0.023,0.115,0.037,0.199,0.081c-0.021,1.005-0.549,1.714-0.871,2.454c-0.093,0.215-0.121,0.551-0.276,0.71c-0.074,0.076-0.229,0.094-0.314,0.157c-0.264,0.291-0.528,0.58-0.794,0.873c-0.25,0.344-0.365,0.803-0.632,1.146c-0.002,0.114-0.002,0.216,0.037,0.276c0.041,0.031,0.11,0.059,0.16,0.08c0.51-0.483,1.004-0.887,1.424-1.465c0.658-0.904,0.986-2.047,1.465-3.125c0.3-0.683,0.734-1.354,0.711-2.334c-0.047-0.045-0.084-0.102-0.117-0.158L96.09,63.108L96.09,63.108z M93.32,69.361V69.4h-0.04c0.069-0.475,0.43-0.606,0.596-0.952h0.079C93.904,68.842,93.605,69.194,93.32,69.361L93.32,69.361z M34.171,69.993c-0.08,0.342,0.76,1.106,1.027,1.308c0.133,0.1,0.312,0.328,0.515,0.235c0.104-0.008,0.136-0.019,0.199-0.04c0.046-0.105,0.115-0.24,0.039-0.354C35.93,70.645,34.64,70.088,34.171,69.993z M37.97,73.037c0.067,0.034,0.122,0.021,0.198-0.039c0.139-0.113,0.063-0.313,0.159-0.475c0.222-0.159,0.615-0.118,0.911-0.199c0.809-0.213,1.753-0.198,2.65-0.396c0.425-0.093,1.128,0.16,1.464-0.037c0.04-0.016,0.081-0.026,0.118-0.043c-0.019-0.517-1.009-0.737-1.545-0.588c-0.237,0.066-0.513,0.213-0.751,0.275c-0.185,0.014-0.37,0.027-0.555,0.038c-0.062-0.644-0.38-1.144-0.395-1.817c0.595-0.013,1.341-0.091,1.739-0.316c-0.008-0.2-0.045-0.2-0.118-0.314c-0.453-0.107-1.23-0.126-1.583,0.116c-0.1-0.004-0.147-0.004-0.197-0.039c-0.221-0.28-0.116-0.851-0.316-1.146v-0.158c0.426-0.092,1.122-0.168,1.345-0.475c0.031-0.041,0.014-0.011,0.039-0.078c-0.036-0.035-0.051-0.068-0.079-0.119c-0.619-0.156-0.887-0.049-1.423,0.158c-0.167-0.535,0.034-0.959-0.514-1.108c0.117-0.203,0.506-0.194,0.751-0.276c0.382-0.126,0.817-0.296,1.148-0.474c0.026-0.068,0.007-0.04,0.04-0.08c-0.022-0.2-0.078-0.193-0.159-0.316c-0.571-0.044-1.027,0.011-1.346,0.316h-0.076c0.047-0.295,0.231-0.718,0.394-0.949c0.112-0.162,0.318-0.14,0.396-0.356h0.04V64.1c-0.081-0.104-0.159-0.211-0.238-0.314c-0.186-0.13-0.454-0.143-0.632-0.279c-0.263-0.004-0.515-0.003-0.672,0.079c0.021,0.152,0.089,0.248,0.119,0.356c0.109,0.408-0.284,1.669-0.436,1.859c-0.123,0.154-1.551,0.672-1.939,0.555c-0.092-0.029-0.36-0.164-0.435-0.239c-0.032-0.039-0.015-0.008-0.04-0.077c0.561-0.527,0.965-1.702,1.741-1.939c0.014-0.064,0.027-0.131,0.041-0.196c-0.194-0.2-1.135-1.188-1.622-0.871c-0.04,0.014-0.079,0.022-0.117,0.038c0,0.338,0.168,0.593,0.078,0.949c-0.182,0.711-0.587,1.556-0.95,2.139c-0.218,0.35-0.693,0.729-0.712,1.229c0.646-0.064,0.802-0.731,1.304-0.912c0.146,0.135,0.29,0.267,0.436,0.396c0.207,0.311,0.168,0.778,0.276,1.186c0.185,0.856,0.371,1.715,0.554,2.571c0.025,0.425,0.052,0.845,0.08,1.269C37.246,72.28,37.561,72.945,37.97,73.037L37.97,73.037z M39.233,70.032c0.031,0.368,0.258,1.407,0.436,1.662c0.001,0.024,0.001,0.054,0.001,0.08c-0.477,0.102-0.973,0.239-1.504,0.237c-0.082-0.564-0.352-1.061-0.355-1.662C38.418,70.338,38.731,70.094,39.233,70.032z M36.939,66.75c0.063-0.107,1.113-0.273,1.228-0.199c0.42,0.195,0.27,0.813,0.514,1.188c-0.083,0.194-1.047,0.487-1.345,0.514C37.283,67.834,37.213,66.977,36.939,66.75L36.939,66.75z M38.76,68.253h0.04c0.076,0.36,0.119,0.978,0.317,1.267c-0.142,0.348-1.016,0.317-1.346,0.516c-0.138-0.083-0.32-1.076-0.316-1.346C37.757,68.662,38.541,68.402,38.76,68.253L38.76,68.253z M31.914,70.506c-0.06,0.135-0.053,0.354-0.117,0.514c-0.342,0.84-0.454,1.015,0.079,1.82c0.237,0,0.269-0.037,0.396-0.119C32.429,72.064,32.454,70.814,31.914,70.506L31.914,70.506z M77.023,70.744c-1.154-0.285-2.125,0.285-3.325,0.199c-0.114-0.121-0.2-0.19-0.275-0.356c-0.835,0.024-1.757,1.886-0.909,2.453c0.453,0.308,1.744,0.129,2.295,0c0.306-0.071,0.783-0.139,1.027,0.038c0.332,0.247,0.273,1.182,0.157,1.703c-0.132,0.975-0.265,1.951-0.396,2.929c-0.117,0.593-0.236,1.185-0.356,1.779c0.606-0.003,1.178-0.623,1.349-1.069c0.1-0.258,0.047-0.502,0.119-0.791c0.209-0.83,0.237-1.82,0.436-2.689c0.127-0.563,0.041-1.1,0.156-1.621c0.086-0.393,0.143-1.696,0.041-2.059C77.281,71.059,77.126,70.901,77.023,70.744z M22.857,82.695c-0.135-0.102-0.229-0.283-0.356-0.395c-0.473-0.42-1.029-0.826-1.543-1.188c-0.426-0.298-1.008-0.476-1.387-0.829c-0.01-0.086,0.123-0.296,0.041-0.516c-0.335-0.896-1.589-1.933-2.374-2.412c-0.363-0.225-0.972-0.328-1.305-0.555c-0.246-0.017-0.374-0.025-0.435,0.155c-0.097,0.218,0.209,0.521,0.315,0.675c0.271,0.381,0.581,0.826,0.95,1.104c0.276,0.209,0.591,0.392,0.83,0.635h0.119c-0.154-0.426-0.609-0.657-0.949-0.909c-0.311-0.229-0.449-0.632-0.712-0.909c0.021-0.125,0.035-0.115,0.08-0.199c1.093,0.009,1.802,1.012,2.294,1.662c0.22,0.291,0.571,0.461,0.594,0.951c-0.116,0-0.216,0-0.276-0.041h-0.119c0.188,0.522,0.824,0.479,1.267,0.754c0.888,0.549,1.603,1.409,2.373,2.094c0.262,0.234,0.719,0.466,0.791,0.873c-0.537-0.028-0.917-0.327-1.261-0.555c-0.614-0.4-1.597-1.1-2.019-1.662c-0.08-0.104-0.106-0.263-0.199-0.355c-0.109-0.111-0.261-0.145-0.355-0.275h-0.158c-0.039,0.41,0.407,0.705,0.671,0.948c0.819,0.75,1.696,1.442,2.73,1.979c0.373,0.191,1.053,0.521,1.465,0.275C23.874,83.434,23.227,82.975,22.857,82.695L22.857,82.695z M47.226,85.307c-2.014-1.379-4.985-2.775-8.427-2.689c-0.167,0.104-0.503,0.021-0.711,0.078c-0.288,0.076-0.464,0.223-0.672,0.355c-0.008,0.971,1.446,1.496,2.255,1.698c0.483,0.123,0.909-0.104,1.188-0.198c0.215-0.82-0.776-0.94-1.227-1.347h-0.081v-0.038c3.036-0.119,5.308,0.729,7.043,2.02c0.433,0.322,0.93,0.783,1.148,1.306c0.081,0.194,0.116,0.515,0,0.674c-0.159,0.44-0.685,0.401-1.188,0.515c-1.162,0.267-2.755-0.391-3.285-0.91c-0.108,0.189,0.049,0.48-0.118,0.674c-0.176,0.478-0.788,0.354-1.346,0.474c-0.917,0.199-2.353-0.271-2.888-0.632c-0.149-0.104-0.257-0.286-0.396-0.396c-0.007-0.103-0.018-0.136-0.041-0.199c0.081-0.073,0.177-0.187,0.237-0.275c1.139-0.085,1.718-0.027,2.376,0.596c-0.017,0.078-0.01,0.073-0.041,0.114c-0.074,0.152-0.245,0.17-0.474,0.161v0.074c0.417,0.004,0.593-0.059,0.83-0.197c0.013-0.079,0.027-0.159,0.04-0.236c-0.136-0.141-0.231-0.328-0.396-0.438c-0.65-0.426-1.991-0.641-2.729-0.156c-0.116,0.561,0.232,0.864,0.554,1.105c0.646,0.488,1.191,0.771,2.098,1.029c0.291,0.082,0.55,0.008,0.871,0.076c0.28,0.064,0.765,0.079,1.068,0c0.504-0.128,1.205-0.658,0.632-1.268v-0.037c0.299,0.109,0.544,0.402,0.831,0.556c0.761,0.397,2.021,0.726,3.167,0.476c0.562-0.125,1.143-0.125,1.303-0.635c0.179-0.277-0.068-0.668-0.156-0.826C48.322,86.151,47.836,85.721,47.226,85.307L47.226,85.307z M39.906,83.485c0.14,0.094,0.22,0.291,0.356,0.396c-0.003,0.1-0.004,0.148-0.04,0.199c-0.257,0.697-1.706,0.182-2.058-0.081c-0.11-0.08-0.153-0.248-0.236-0.354c0.015-0.082,0.01-0.076,0.041-0.116c0.108-0.306,0.417-0.203,0.671-0.354C39.142,83.174,39.596,83.274,39.906,83.485z M76.625,83.881h-0.396c-0.262,0.209-0.692,0.236-0.991,0.396c-0.263,0.141-0.581,0.332-0.829,0.515c-0.207,0.148-0.326,0.418-0.516,0.592c0.004,0.197,0.008,0.229,0.16,0.277c0.039,0.029,0.01,0.018,0.075,0.04c0.042-0.047,0.08-0.063,0.12-0.12c0.033-0.023-0.027-0.104-0.04-0.232c0.384-0.386,0.667-0.598,1.228-0.832c0.144-0.059,0.447-0.233,0.634-0.119h0.079c-0.026,0.391-0.916,1.591-1.188,1.781v0.115c0.729-0.188,1.215-1.643,1.702-2.174c-0.013-0.09-0.01-0.111-0.04-0.157L76.625,83.881L76.625,83.881z M73.459,86.809c-0.234,0.209-0.807,0.229-1.066,0.435h-0.041c0.104-0.149,0.291-0.213,0.396-0.354c0.076-0.104,0.107-0.226,0.197-0.315c-0.018-0.081-0.01-0.075-0.039-0.117v-0.08c-1.155-0.212-3.084,0.784-3.68,1.308c-0.155,0.135-0.248,0.336-0.396,0.477c0.003,0.111,0.016,0.168,0.039,0.236c0.701,0.047,2.016-0.383,2.174-0.949c0.031-0.025,0.012-0.002,0-0.04v-0.079c-0.479-0.027-1.124,0.075-1.422,0.355h-0.039c0.26-0.396,1.223-0.746,1.739-0.91c0.172-0.053,0.55-0.149,0.714-0.039c0.037,0.015,0.077,0.025,0.117,0.039c-0.094,0.396-0.657,0.838-1.029,0.949v0.08c0.607-0.141,1.163-0.416,1.7-0.634c0.368-0.149,0.786-0.188,1.108-0.396c0.229-0.149,1.008-1.207,1.068-1.504C74.086,85.409,74.012,86.313,73.459,86.809L73.459,86.809z M70.333,87.6v0.119c-0.075,0.049-0.129,0.156-0.198,0.196c-0.205,0.12-0.479,0.106-0.674,0.238c-0.09-0.011-0.109-0.009-0.156-0.041h-0.039C69.373,87.775,70.025,87.621,70.333,87.6L70.333,87.6z M53.835,91.317c0.015-0.037,0.025-0.078,0.039-0.117c-0.976-0.04-1.953-0.079-2.927-0.119c-0.123,0.082-0.312,0.035-0.475,0.079c-0.202,0.059-0.426,0.15-0.593,0.239c0.026,0.067,0.008,0.038,0.04,0.077c0.238,0.188,1.624,0.199,1.9,0h0.078v-0.077c-0.419-0.134-1.183,0.2-1.503,0h-0.041v-0.041c1.052-0.073,2.23-0.044,3.325-0.04c-0.105,0.072-0.328,0.051-0.436,0.119c-0.039,0.014-0.078,0.027-0.117,0.039v0.08c0.238,0.037,0.475,0.078,0.711,0.117c0.037,0.041-0.004,0.004,0.039,0.037c-0.35,0.233-1.254,0.139-1.581-0.037v-0.08c-0.178-0.082-0.991,0.084-1.148,0.117c-0.133,0.03-0.27-0.014-0.357,0.039c-0.165,0.01-0.181,0.029-0.276,0.079c0.022,0.128,0.035,0.115,0.08,0.198c0.255,0.06,0.696,0.064,0.987,0.156v-0.039h0.04v-0.039c-0.148-0.057-0.559-0.025-0.713-0.115h-0.079c0.132-0.104,1.425-0.278,1.663-0.119c0.067,0.023,0.039,0.007,0.079,0.039c-0.211,0.038-0.424,0.08-0.634,0.117c0.025,0.066,0.009,0.039,0.04,0.078c0.065,0.045,0.193,0.045,0.316,0.039c-0.04,0.074-0.054,0.109-0.119,0.158c0.013,0.023,0.027,0.051,0.04,0.078c0.561,0,1.031-0.057,1.502-0.156c0.28-0.062,0.624,0.052,0.831-0.08h0.317v-0.078c-0.539-0.002-1.885-0.055-2.215,0.158h-0.117c0.033-0.043-0.004-0.004,0.038-0.041c0.155-0.18,0.471-0.09,0.75-0.156c0.44-0.104,1.168-0.284,1.544,0c0.105,0.064,0.04-0.008,0.039,0.117c0.107-0.002,0.181-0.002,0.236-0.036h0.277v-0.081c-0.359-0.088-0.889-0.251-1.188-0.434C54.057,91.488,54.135,91.344,53.835,91.317L53.835,91.317z M13.635,18.359c-0.088,0.32-0.274,0.593-0.395,0.87c-0.268,0.613-0.507,1.225-0.751,1.822c-0.207,0.496-0.335,1.295-0.633,1.699v0.079c0.416-0.074,0.698-0.493,0.949-0.751c0.617-0.634,1.92-2.22,1.9-3.402c-0.062-0.061-0.119-0.162-0.159-0.237C14.3,18.38,13.982,18.353,13.635,18.359z M13.794,20.022c-0.181,0.298-0.281,0.592-0.476,0.871c-0.178,0.255-0.46,0.452-0.633,0.713h-0.041c0.051-0.302,0.214-0.546,0.319-0.792c0.235-0.561,0.396-1.118,0.671-1.621c0.152,0.003,0.268,0.015,0.356,0.078c0.095,0.052,0.028-0.018,0.079,0.08C14.15,19.548,13.89,19.862,13.794,20.022L13.794,20.022z M84.023,7.875c-0.414-0.416-0.729-0.938-1.147-1.346V6.49c-0.205,0.073-0.899,0.688-1.028,0.871c-0.25-0.095-0.391-0.365-0.594-0.514c-0.676-0.508-1.313-1.167-2.49-1.147c-0.148,0.115-0.367,0.118-0.556,0.197c-0.53,0.23-1.083,0.688-1.305,1.227c-0.249,0.602,0.004,1.491,0.196,1.939c0.392,0.904,1.03,1.667,1.582,2.414c0.457,0.615,0.973,1.252,1.819,1.464c0.956,0.238,1.422-0.884,1.781-1.308c0.37-0.435,1.182-0.539,1.464-1.107c0.104-0.207,0.034-0.615-0.039-0.791c-0.18-0.426-1.066-1.622-1.425-1.859c0.024-0.239,0.135-0.247,0.235-0.396c0.248,0.121,0.338,0.471,0.516,0.673c0.227,0.258,0.546,0.396,0.791,0.632c0.378,0.003,0.604-0.094,0.79-0.277h0.041C84.561,8.243,84.212,8.06,84.023,7.875L84.023,7.875z M81.77,12.148c-0.699,0.165-1.047-0.293-1.424-0.673c-0.938-0.935-1.57-2.093-2.298-3.244c-0.247-0.396-0.885-1.134-0.554-1.702h0.156c0.199,0.299,0.539,0.507,0.754,0.792c0.591,0.784,1.313,1.469,1.898,2.255c0.359,0.485,0.758,0.94,1.106,1.424c0.178,0.249,0.315,0.565,0.556,0.751C81.924,11.931,81.848,12.015,81.77,12.148L81.77,12.148z M82.361,9.339c0.32,0.439,0.755,0.688,0.751,1.463c-0.122,0.116-0.157,0.224-0.356,0.276c-0.039,0.032-0.011,0.015-0.078,0.041c-0.56-0.932-1.367-1.711-2.017-2.573c-0.212-0.282-0.541-0.511-0.752-0.791c-0.362-0.48-0.793-0.864-1.188-1.305c-0.113-0.131-0.168-0.257-0.313-0.357c0.033-0.086,0.031-0.057,0.076-0.118c0.672,0.006,0.994,0.458,1.386,0.753C80.837,7.453,81.648,8.354,82.361,9.339L82.361,9.339z\"/><radialGradient id=\"SVGID_43_\" cx=\"251.8086\" cy=\"-408.3613\" r=\"72.7509\" gradientTransform=\"matrix(1 0 0 -1 -213.7637 -386.502)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#000\" stop-opacity=\"0\"/><stop offset=\".8022\" stop-color=\"#000\" stop-opacity=\".08\"/><stop offset=\"1\" stop-color=\"#000\" stop-opacity=\".3882\"/></radialGradient><path style=\"opacity:.38;fill:url(#SVGID_43_);\" d=\"M49.885,17.037c0.014-0.606-0.392-1.27-0.392-1.27l-0.025-0.058c0,0-0.487-0.949-1.302-1.228c-0.815-0.278-1.478,0.342-1.478,0.342s-0.114,0.131-0.429,0.494c-0.313,0.364-0.507,0.666-1.198,0.938c-0.692,0.271-1.379,0.204-1.743,0.033c-0.364-0.172-0.457-0.537-0.457-0.537s-0.229-0.722-0.313-1.049c-0.086-0.331-0.309-1.694-0.309-1.694s-0.491-2.747-0.534-3.304c0,0,1.475-0.126,3.687-0.775c2.299-0.673,3.043-1.206,3.043-1.206s-0.432-0.156-0.484-0.662c-0.051-0.507-0.089-1.19-0.089-1.19s-0.089-0.5,0.483-1.139c0.571-0.64,1.354-0.863,1.762-0.953c0.41-0.089,1.281-0.17,2.093-0.134c0.812,0.038,1.267,0.112,1.593,0.291c0.328,0.178,0.357,0.61,0.357,0.61l-0.008,1.146c0,0-0.037,0.402,0.261,0.529c0,0,0.505,0.305,2.196,0.133c0,0,0.72-0.126,1.846-0.46c1.125-0.335,4.129-1.229,4.554-1.341c0.425-0.111,0.953-0.291,1.646-0.469c0.691-0.179,2.039-0.626,2.308-0.73c0.271-0.104,1.812-0.618,2.927-0.81c1.115-0.195,2.227-0.186,2.813,0.149c0,0,0.357,0.304,0.521,0.662c0.163,0.358,0.478,0.863,0.923,1.088c0.454,0.227,0.752,0.371,1.875,0.273c0,0,0.022-0.096-0.395-0.37c-0.417-0.277-0.991-0.701-0.991-0.701S74.29,3.4,74.215,3.198c-0.072-0.202-0.043-0.306-0.043-0.306l0.877-1.406c0,0,0-0.172,0.508-0.238c0.506-0.067,1.071-0.134,1.74-0.313c0.67-0.178,0.788-0.312,0.788-0.312l0.58,0.178c0,0,3.546,2.853,4.655,3.583l0.199-0.239c0,0,0.436,0.018,0.826,0.172c0.394,0.154,0.979,0.562,0.979,0.562s1.612,1.31,2.071,2.2l0.223,0.679l-0.102,0.161c0,0,0.918,1.307,2.096,2.602c0,0,1.227,1.664,1.689,2.09c0,0-0.108-0.399-0.201-0.849l0.336-0.226l0.203-0.144l0.617,0.259c3.573,4.811,6.432,10.424,8.141,16.328l-0.12,0.484l0.395,0.501c1.128,4.212,1.728,8.643,1.728,13.211c0,1.122-0.036,2.236-0.107,3.339l-0.304,0.511l0.225,0.555c-2.231,26.1-24.124,46.584-50.801,46.584c-18.502,0-34.702-9.854-43.637-24.6L7.674,68.2l-0.205-0.153c-3.387-5.742-5.682-12.205-6.595-19.103l0.212-0.525L0.75,47.936c-0.213-1.892-0.322-3.812-0.322-5.756c0-2.985,0.255-5.909,0.748-8.755l0.25-0.562l-0.087-0.328c1.157-6.048,3.383-11.716,6.474-16.799l0.684-0.384l0.081,0.032c0,0,0.233-0.169,0.354-0.217l0.076-0.023c0,0,1.179-1.971,1.625-2.601c0,0,0.542-0.348,0.745-0.407c0,0,0.124-0.016,0.189,0.076c0,0,0.496-0.432,1.699-2.054c0.004-0.005,0.007-0.011,0.012-0.017c0,0-0.114-0.076-0.131-0.174c-0.018-0.097,0.108-0.591,0.173-0.717c0.065-0.126,0.108-0.156,0.108-0.156s1.722-2.032,3.151-3.238c0,0,0.26-0.202,0.678-0.25c0,0,1.472-0.613,3.264-2.184c0,0,0.051-0.289,0.478-0.858c0.428-0.57,1.456-1.163,2.222-1.337c0.764-0.174,0.896-0.038,0.896-0.038l0.064,0.065l0.515,0.766c0,0,0.565-0.316,1.413-0.604c0.847-0.289,0.979-0.262,0.979-0.262l0.825,1.336l-0.987,2c0,0-0.644,1.421-1.655,2.185c0,0-0.472,0.284-1.12,0.127c-0.648-0.157-1.072,0.333-1.072,0.333l-0.17,0.14c0,0,0.14-0.024,0.346-0.103c0,0,0.158,0.065,0.274,0.223c0.114,0.158,0.913,1.175,0.913,1.175s0.005,0.837-0.415,1.938c-0.419,1.1-1.467,2.891-1.467,2.891s-0.733,1.424-1.075,2.253c-0.342,0.829-0.515,1.765-0.488,2.262c0,0,0.187,0.062,0.707-0.202c0.655-0.332,1.083,0.027,1.083,0.027s0.719,0.53,1.041,0.881c0.262,0.289,0.802,1.765,0.209,3.224c0,0-0.402,1.008-1.377,1.724c0,0-0.216,0.332-1.529,0.174c-0.368-0.043-0.585-0.276-1.372-0.2c-0.785,0.077-1.231,0.815-1.231,0.815l0.013-0.024c-0.692,0.999-1.154,2.458-1.154,2.458l-0.057,0.165c0,0-0.241,0.509-0.292,1.752c-0.053,1.284,0.284,3.109,0.284,3.109s7.876-1.387,9.88-0.055l0.58,0.532c0,0,0.046,0.174-0.031,0.376c-0.08,0.204-0.375,0.673-0.987,1.113c-0.611,0.438-1.222,1.583-0.313,2.304c1.034,0.818,1.691,0.766,3.43,0.468c1.74-0.297,2.898-1.269,2.898-1.269s0.972-0.72,0.783-1.628c-0.188-0.908-1.017-1.189-1.017-1.189s-0.658-0.423-0.141-1.238c0,0,0.141-0.689,2.553-1.316c2.414-0.626,6.812-1.52,10.556-1.989c0,0-2.539-8.223-0.737-9.289c0,0,0.438-0.296,1.224-0.408l0.721-0.037c0.131-0.027,0.344,0.005,0.796,0.045c0.452,0.038,1.001,0.076,1.678-0.441c0.676-0.519,0.697-0.819,0.697-0.819\"/></svg>";
  Svg.wikipedia_img = Img_1.Img.AsImageElement(Svg.wikipedia);
  Svg.All = {
    "add.svg": Svg.add,
    "addSmall.svg": Svg.addSmall,
    "ampersand.svg": Svg.ampersand,
    "arrow-left-smooth.svg": Svg.arrow_left_smooth,
    "arrow-right-smooth.svg": Svg.arrow_right_smooth,
    "bug.svg": Svg.bug,
    "camera-plus.svg": Svg.camera_plus,
    "checkmark.svg": Svg.checkmark,
    "close.svg": Svg.close,
    "compass.svg": Svg.compass,
    "crosshair-blue-center.svg": Svg.crosshair_blue_center,
    "crosshair-blue.svg": Svg.crosshair_blue,
    "crosshair.svg": Svg.crosshair,
    "delete_icon.svg": Svg.delete_icon,
    "direction.svg": Svg.direction,
    "direction_gradient.svg": Svg.direction_gradient,
    "down.svg": Svg.down,
    "envelope.svg": Svg.envelope,
    "floppy.svg": Svg.floppy,
    "gear.svg": Svg.gear,
    "help.svg": Svg.help,
    "home.svg": Svg.home,
    "home_white_bg.svg": Svg.home_white_bg,
    "josm_logo.svg": Svg.josm_logo,
    "layers.svg": Svg.layers,
    "layersAdd.svg": Svg.layersAdd,
    "logo.svg": Svg.logo,
    "logout.svg": Svg.logout,
    "mapillary.svg": Svg.mapillary,
    "no_checkmark.svg": Svg.no_checkmark,
    "or.svg": Svg.or,
    "osm-logo-us.svg": Svg.osm_logo_us,
    "osm-logo.svg": Svg.osm_logo,
    "pencil.svg": Svg.pencil,
    "phone.svg": Svg.phone,
    "pop-out.svg": Svg.pop_out,
    "reload.svg": Svg.reload,
    "search.svg": Svg.search,
    "send_email.svg": Svg.send_email,
    "share.svg": Svg.share,
    "star.svg": Svg.star,
    "statistics.svg": Svg.statistics,
    "up.svg": Svg.up,
    "wikimedia-commons-white.svg": Svg.wikimedia_commons_white,
    "wikipedia.svg": Svg.wikipedia
  };
  return Svg;
}();

exports.default = Svg;
},{"./UI/Img":"UI/Img.ts","./UI/Base/FixedUiElement":"UI/Base/FixedUiElement.ts"}],"Utils.ts":[function(require,module,exports) {
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

  Utils.TwoDigits = function (i) {
    if (i < 10) {
      return "0" + i;
    }

    return "" + i;
  };

  Utils.Round = function (i) {
    if (i < 0) {
      return "-" + Utils.Round(-i);
    }

    var j = "" + Math.floor(i * 10);

    if (j.length == 1) {
      return "0." + j;
    }

    return j.substr(0, j.length - 1) + "." + j.substr(j.length - 1, j.length);
  };

  Utils.Times = function (f, count) {
    var res = "";

    for (var i = 0; i < count; i++) {
      res += f(i);
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

  Utils.LoadCustomCss = function (location) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.id = "customCss";
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = location;
    link.media = 'all';
    head.appendChild(link);
    console.log("Added custom layout ", location);
  };

  Utils.assets_path = "./assets/svg/";
  return Utils;
}();

exports.Utils = Utils;
},{"./UI/UIElement":"UI/UIElement.ts","jquery":"node_modules/jquery/dist/jquery.js"}],"UI/Base/Combine.ts":[function(require,module,exports) {
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
},{"../UIElement":"UI/UIElement.ts","./FixedUiElement":"UI/Base/FixedUiElement.ts","../../Utils":"Utils.ts"}],"Logic/Web/LocalStorageSource.ts":[function(require,module,exports) {
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
},{"../UIElement":"UI/UIElement.ts","../../Logic/Web/LocalStorageSource":"Logic/Web/LocalStorageSource.ts"}],"UI/i18n/Translation.ts":[function(require,module,exports) {
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
exports.Translation = void 0;

var UIElement_1 = require("../UIElement");

var Combine_1 = __importDefault(require("../Base/Combine"));

var Locale_1 = __importDefault(require("./Locale"));

var Utils_1 = require("../../Utils");

var Translation =
/** @class */
function (_super) {
  __extends(Translation, _super);

  function Translation(translations, context) {
    var _this = _super.call(this, Locale_1.default.language) || this;

    if (translations === undefined) {
      throw "Translation without content (" + context + ")";
    }

    var count = 0;

    for (var translationsKey in translations) {
      count++;
    }

    _this.translations = translations;

    if (count === 0) {
      throw "No translations given in the object (" + context + ")";
    }

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
      return "";
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

exports.Translation = Translation;
},{"../UIElement":"UI/UIElement.ts","../Base/Combine":"UI/Base/Combine.ts","./Locale":"UI/i18n/Locale.ts","../../Utils":"Utils.ts"}],"AllTranslationAssets.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Translation_1 = require("./UI/i18n/Translation");

var AllTranslationAssets =
/** @class */
function () {
  function AllTranslationAssets() {}

  AllTranslationAssets.t = {
    image: {
      addPicture: new Translation_1.Translation({
        "en": "Add picture",
        "es": "Añadir foto",
        "ca": "Afegir foto",
        "nl": "Voeg foto toe",
        "fr": "Ajoutez une photo",
        "gl": "Engadir imaxe",
        "de": "Bild hinzufügen"
      }),
      uploadingPicture: new Translation_1.Translation({
        "en": "Uploading your picture...",
        "nl": "Bezig met een foto te uploaden...",
        "es": "Subiendo tu imagen ...",
        "ca": "Pujant la teva imatge ...",
        "fr": "Mettre votre photo en ligne",
        "gl": "Subindo a túa imaxe...",
        "de": "Ihr Bild hochladen..."
      }),
      uploadingMultiple: new Translation_1.Translation({
        "en": "Uploading {count} of your picture...",
        "nl": "Bezig met {count} foto's te uploaden...",
        "ca": "Pujant {count} de la teva imatge...",
        "es": "Subiendo {count} de tus fotos...",
        "fr": "Mettre votre {count} photos en ligne",
        "gl": "Subindo {count} das túas imaxes...",
        "de": "{count} Ihrer Bilder hochgeladen..."
      }),
      pleaseLogin: new Translation_1.Translation({
        "en": "Please login to add a picure",
        "nl": "Gelieve je aan te melden om een foto toe te voegen",
        "es": "Entra para subir una foto",
        "ca": "Entra per pujar una foto",
        "fr": "Connectez vous pour mettre une photo en ligne",
        "gl": "Inicia a sesión para subir unha imaxe",
        "de": "Bitte einloggen, um ein Bild hinzuzufügen"
      }),
      willBePublished: new Translation_1.Translation({
        "en": "Your picture will be published: ",
        "es": "Tu foto será publicada: ",
        "ca": "La teva foto serà publicada: ",
        "nl": "Jouw foto wordt gepubliceerd: ",
        "fr": "Votre photo va être publié: ",
        "gl": "A túa imaxe será publicada: ",
        "de": "Ihr Bild wird veröffentlicht: "
      }),
      cco: new Translation_1.Translation({
        "en": "in the public domain",
        "ca": "en domini públic",
        "es": "en dominio público",
        "nl": "in het publiek domein",
        "fr": "sur le domaine publique",
        "gl": "no dominio público",
        "de": "in die Public Domain"
      }),
      ccbs: new Translation_1.Translation({
        "en": "under the CC-BY-SA-license",
        "nl": "onder de CC-BY-SA-licentie",
        "ca": "sota llicència CC-BY-SA",
        "es": "bajo licencia CC-BY-SA",
        "fr": "sous la license CC-BY-SA",
        "gl": "baixo a licenza CC-BY-SA",
        "de": "unter der CC-BY-SA-Lizenz"
      }),
      ccb: new Translation_1.Translation({
        "en": "under the CC-BY-license",
        "ca": "sota la llicència CC-BY",
        "es": "bajo licencia CC-BY",
        "nl": "onder de CC-BY-licentie",
        "fr": "sous la license CC-BY",
        "gl": "baixo a licenza CC-BY",
        "de": "unter der CC-BY-Lizenz"
      }),
      uploadFailed: new Translation_1.Translation({
        "en": "Could not upload your picture. Do you have internet and are third party API's allowed? Brave browser or UMatrix might block them.",
        "nl": "Afbeelding uploaden mislukt. Heb je internet? Gebruik je Brave of UMatrix? Dan moet je derde partijen toelaten.",
        "ca": "No s'ha pogut carregar la imatge. Tens Internet i es permeten API de tercers? El navegador Brave o UMatrix podria bloquejar-les.",
        "es": "No se pudo cargar la imagen. ¿Tienes Internet y se permiten API de terceros? El navegador Brave o UMatrix podría bloquearlas.",
        "fr": "L'ajout de la photo a échoué. Êtes-vous connecté à Internet?",
        "gl": "Non foi posíbel subir a imaxe. Tes internet e permites API de terceiros? O navegador Brave ou UMatrix podería bloquealas.",
        "de": "Wir konnten Ihr Bild nicht hochladen. Haben Sie Internet und sind API's von Dritten erlaubt? Brave Browser oder UMatrix blockieren evtl.."
      }),
      respectPrivacy: new Translation_1.Translation({
        "en": "Do not photograph people nor license plates. Do not upload Google Maps, Google Streetview or other copyrighted sources.",
        "ca": "Respecta la privacitat. No fotografiïs gent o matrícules",
        "es": "Respeta la privacidad. No fotografíes gente o matrículas",
        "nl": "Fotografeer geen mensen of nummerplaten. Voeg geen Google Maps, Google Streetview of foto's met auteursrechten toe.",
        "fr": "Merci de respecter la vie privée. Ne publiez pas les plaques d'immatriculation",
        "gl": "Respecta a privacidade. Non fotografes xente ou matrículas",
        "de": "Bitte respektieren Sie die Privatsphäre. Fotografieren Sie weder Personen noch Nummernschilder"
      }),
      uploadDone: new Translation_1.Translation({
        "en": "<span class='thanks'>Your picture has been added. Thanks for helping out!</span>",
        "ca": "<span class='thanks'>La teva imatge ha estat afegida. Gràcies per ajudar.</span>",
        "es": "<span class='thanks'>Tu imagen ha sido añadida. Gracias por ayudar.</span>",
        "nl": "<span class='thanks'>Je afbeelding is toegevoegd. Bedankt om te helpen!</span>",
        "fr": "<span class='thanks'>Votre photo est ajouté. Merci beaucoup!</span>",
        "gl": "<span class='thanks'>A túa imaxe foi engadida. Grazas por axudar.</span>",
        "de": "<span class='thanks'>Ihr Bild wurde hinzugefügt. Vielen Dank für Ihre Hilfe!</span>"
      }),
      dontDelete: new Translation_1.Translation({
        "nl": "Terug",
        "en": "Cancel",
        "ca": "Cancel·lar",
        "es": "Cancelar",
        "de": "Abbrechen"
      }),
      doDelete: new Translation_1.Translation({
        "nl": "Verwijder afbeelding",
        "en": "Remove image",
        "ca": "Esborrar imatge",
        "es": "Borrar imagen",
        "de": "Bild entfernen"
      }),
      isDeleted: new Translation_1.Translation({
        "nl": "Verwijderd",
        "en": "Deleted",
        "ca": "Esborrada",
        "es": "Borrada",
        "de": "Gelöscht"
      })
    },
    centerMessage: {
      loadingData: new Translation_1.Translation({
        "en": "Loading data...",
        "ca": "Carregant dades...",
        "es": "Cargando datos...",
        "nl": "Data wordt geladen...",
        "fr": "Chargement des données",
        "gl": "Cargando os datos...",
        "de": "Daten werden geladen..."
      }),
      zoomIn: new Translation_1.Translation({
        "en": "Zoom in to view or edit the data",
        "ca": "Amplia per veure o editar les dades",
        "es": "Amplía para ver o editar los datos",
        "nl": "Zoom in om de data te zien en te bewerken",
        "fr": "Rapprochez vous sur la carte pour voir ou éditer les données",
        "gl": "Achégate para ollar ou editar os datos",
        "de": "Vergrößern, um die Daten anzuzeigen oder zu bearbeiten"
      }),
      ready: new Translation_1.Translation({
        "en": "Done!",
        "ca": "Fet.",
        "es": "Hecho.",
        "nl": "Klaar!",
        "fr": "Finis!",
        "gl": "Feito!",
        "de": "Erledigt!"
      }),
      retrying: new Translation_1.Translation({
        "en": "Loading data failed. Trying again... ({count})",
        "ca": "La càrrega de dades ha fallat.Tornant-ho a intentar... ({count})",
        "es": "La carga de datos ha fallado.Volviéndolo a probar... ({count})",
        "gl": "A carga dos datos fallou. Tentándoo de novo... ({count})",
        "de": "Laden von Daten fehlgeschlagen. Erneuter Versuch... ({count})"
      })
    },
    general: {
      loginWithOpenStreetMap: new Translation_1.Translation({
        "en": "Login with OpenStreetMap",
        "ca": "Entra a OpenStreetMap",
        "es": "Entra en OpenStreetMap",
        "nl": "Aanmelden met OpenStreetMap",
        "fr": "Se connecter avec OpenStreeMap",
        "gl": "Inicia a sesión no OpenStreetMap",
        "de": "Anmeldung mit OpenStreetMap"
      }),
      welcomeBack: new Translation_1.Translation({
        "en": "You are logged in, welcome back!",
        "ca": "Has entrat, benvingut.",
        "es": "Has entrado, bienvenido.",
        "nl": "Je bent aangemeld. Welkom terug!",
        "fr": "Vous êtes connecté, bienvenue",
        "gl": "Iniciaches a sesión, benvido.",
        "de": "Sie sind eingeloggt, willkommen zurück!"
      }),
      loginToStart: new Translation_1.Translation({
        "en": "Login to answer this question",
        "ca": "Entra per contestar aquesta pregunta",
        "es": "Entra para contestar esta pregunta",
        "nl": "Meld je aan om deze vraag te beantwoorden",
        "fr": "Connectez vous pour répondre à cette question",
        "gl": "Inicia a sesión para responder esta pregunta",
        "de": "Anmelden, um diese Frage zu beantworten"
      }),
      search: {
        search: new Translation_1.Translation({
          "en": "Search a location",
          "ca": "Cerca una ubicació",
          "es": "Busca una ubicación",
          "nl": "Zoek naar een locatie",
          "fr": "Chercher une location",
          "gl": "Procurar unha localización",
          "de": "Einen Ort suchen"
        }),
        searching: new Translation_1.Translation({
          "en": "Searching...",
          "ca": "Cercant...",
          "es": "Buscando...",
          "nl": "Aan het zoeken...",
          "fr": "Chargement",
          "gl": "Procurando...",
          "de": "Auf der Suche..."
        }),
        nothing: new Translation_1.Translation({
          "en": "Nothing found...",
          "ca": "Res trobat.",
          "es": "Nada encontrado.",
          "nl": "Niet gevonden...",
          "fr": "Rien n'a été trouvé ",
          "gl": "Nada atopado...",
          "de": "Nichts gefunden..."
        }),
        error: new Translation_1.Translation({
          "en": "Something went wrong...",
          "ca": "Alguna cosa no ha sortit bé...",
          "es": "Alguna cosa no ha ido bien...",
          "nl": "Niet gelukt...",
          "fr": "Quelque chose n'a pas marché...",
          "gl": "Algunha cousa non foi ben...",
          "de": "Etwas ging schief..."
        })
      },
      returnToTheMap: new Translation_1.Translation({
        "en": "Return to the map",
        "ca": "Tornar al mapa",
        "es": "Volver al mapa",
        "nl": "Naar de kaart",
        "fr": "Retourner sur la carte",
        "gl": "Voltar ó mapa",
        "de": "Zurück zur Karte"
      }),
      save: new Translation_1.Translation({
        "en": "Save",
        "ca": "Desar",
        "es": "Guardar",
        "nl": "Opslaan",
        "fr": "Sauvegarder",
        "gl": "Gardar",
        "de": "Speichern"
      }),
      cancel: new Translation_1.Translation({
        "en": "Cancel",
        "ca": "Cancel·lar",
        "es": "Cancelar",
        "nl": "Annuleren",
        "fr": "Annuler",
        "gl": "Desbotar",
        "de": "Abbrechen"
      }),
      skip: new Translation_1.Translation({
        "en": "Skip this question",
        "ca": "Saltar aquesta pregunta",
        "es": "Saltar esta pregunta",
        "nl": "Vraag overslaan",
        "fr": "Passer la question",
        "gl": "Ignorar esta pregunta",
        "de": "Diese Frage überspringen"
      }),
      oneSkippedQuestion: new Translation_1.Translation({
        "en": "One question is skipped",
        "ca": "Has ignorat una pregunta",
        "es": "Has ignorado una pregunta",
        "nl": "Een vraag is overgeslaan",
        "fr": "Une question a été passé",
        "gl": "Ignoraches unha pregunta",
        "de": "Eine Frage wurde übersprungen"
      }),
      skippedQuestions: new Translation_1.Translation({
        "en": "Some questions are skipped",
        "ca": "Has ignorat algunes preguntes",
        "es": "Has ignorado algunas preguntas",
        "nl": "Sommige vragen zijn overgeslaan",
        "fr": "Questions passées",
        "gl": "Ignoraches algunhas preguntas",
        "de": "Einige Fragen wurden übersprungen"
      }),
      number: new Translation_1.Translation({
        "en": "number",
        "ca": "nombre",
        "es": "número",
        "nl": "getal",
        "fr": "Nombre",
        "gl": "número",
        "de": "Zahl"
      }),
      osmLinkTooltip: new Translation_1.Translation({
        "en": "See this object on OpenStreetMap for history and more editing options",
        "ca": "Mira aquest objecte a OpenStreetMap per veure historial i altres opcions d'edició",
        "es": "Mira este objeto en OpenStreetMap para ver historial y otras opciones de edición",
        "nl": "Bekijk dit object op OpenStreetMap waar geschiedenis en meer aanpasopties zijn",
        "fr": "Voir l'historique de cet objet sur OpenStreetMap et plus d'options d'édition",
        "gl": "Ollar este obxecto no OpenStreetMap para ollar o historial e outras opcións de edición",
        "de": "Dieses Objekt auf OpenStreetMap anschauen für die Geschichte und weitere Bearbeitungsmöglichkeiten"
      }),
      add: {
        addNew: new Translation_1.Translation({
          "en": "Add a new {category} here",
          "ca": "Afegir {category} aquí",
          "es": "Añadir {category} aquí",
          "nl": "Voeg hier een {category} toe",
          "fr": "Ajouter un/une {category} ici",
          "gl": "Engadir {category} aquí",
          "de": "Hier eine neue {category} hinzufügen"
        }),
        header: new Translation_1.Translation({
          "en": "<h2>Add a point?</h2>You clicked somewhere where no data is known yet.<br/>",
          "ca": "<h2>Vols afegir un punt?</h2>Has marcat un lloc on no coneixem les dades.<br/>",
          "es": "<h2>Quieres añadir un punto?</h2>Has marcado un lugar del que no conocemos los datos.<br/>",
          "nl": "<h2>Punt toevoegen?</h2>Je klikte ergens waar er nog geen data is. Kies hieronder welk punt je wilt toevoegen<br/>",
          "fr": "<h2>Pas de données</h2>Vous avez cliqué sur un endroit ou il n'y a pas encore de données. <br/>",
          "gl": "<h2>Queres engadir un punto?</h2>Marcaches un lugar onde non coñecemos os datos.<br/>",
          "de": "<h2>Punkt hinzufügen?</h2>Sie haben irgendwo geklickt, wo noch keine Daten bekannt sind.<br/>"
        }),
        pleaseLogin: new Translation_1.Translation({
          "en": "<a class='activate-osm-authentication'>Please log in to add a new point</a>",
          "ca": "<a class='activate-osm-authentication'>Entra per afegir un nou punt</a>",
          "es": "<a class='activate-osm-authentication'>Entra para añadir un nuevo punto</a>",
          "nl": "<a class='activate-osm-authentication'>Gelieve je aan te melden om een punt to te voegen</a>",
          "fr": "<a class='activate-osm-authentication'>Vous devez vous connecter pour ajouter un point</a>",
          "gl": "<a class='activate-osm-authentication'>Inicia a sesión para engadir un novo punto</a>",
          "de": "<a class='activate-osm-authentication'>Bitte loggen Sie sich ein, um einen neuen Punkt hinzuzufügen</a>"
        }),
        zoomInFurther: new Translation_1.Translation({
          "en": "Zoom in further to add a point.",
          "ca": "Apropa per afegir un punt.",
          "es": "Acerca para añadir un punto.",
          "nl": "Gelieve verder in te zoomen om een punt toe te voegen.",
          "fr": "Rapprochez vous pour ajouter un point.",
          "gl": "Achégate para engadir un punto.",
          "de": "Weiter einzoomen, um einen Punkt hinzuzufügen."
        }),
        stillLoading: new Translation_1.Translation({
          "en": "The data is still loading. Please wait a bit before you add a new point.",
          "ca": "Les dades es segueixen carregant. Espera una mica abans d'afegir cap punt.",
          "es": "Los datos se siguen cargando. Espera un poco antes de añadir ningún punto.",
          "nl": "De data wordt nog geladen. Nog even geduld en dan kan je een punt toevoegen.",
          "fr": "Chargement des donnés. Patientez un instant avant d'ajouter un nouveau point.",
          "gl": "Os datos seguen a cargarse. Agarda un intre antes de engadir ningún punto.",
          "de": "Die Daten werden noch geladen. Bitte warten Sie etwas, bevor Sie einen neuen Punkt hinzufügen."
        }),
        confirmIntro: new Translation_1.Translation({
          "en": "<h3>Add a {title} here?</h3>The point you create here will be <b>visible for everyone</b>. Please, only add things on to the map if they truly exist. A lot of applications use this data.",
          "ca": "<h3>Afegir {title} aquí?</h3>El punt que estàs creant <b>el veurà tothom</b>. Només afegeix coses que realment existeixin. Moltes aplicacions fan servir aquestes dades.",
          "es": "<h3>Añadir {title} aquí?</h3>El punto que estás creando <b>lo verá todo el mundo</b>. Sólo añade cosas que realmente existan. Muchas aplicaciones usan estos datos.",
          "nl": "<h3>Voeg hier een {title} toe?</h3>Het punt dat je hier toevoegt, is <b>zichtbaar voor iedereen</b>. Veel applicaties gebruiken deze data, voeg dus enkel punten toe die echt bestaan.",
          "fr": "<h3>Ajouter un/une {title} ici?</h3>Le point que vous ajouter sera visible par tout le monde. Merci d'etre sûr que ce point existe réellement. Beaucoup d'autres applications reposent sur ces données.",
          "gl": "<h3>Engadir {title} aquí?</h3>O punto que estás a crear <b>será ollado por todo o mundo</b>. Só engade cousas que realmente existan. Moitas aplicacións empregan estes datos.",
          "de": "<h3>Hier einen {title} hinzufügen?</h3>Der Punkt, den Sie hier anlegen, wird <b>für alle sichtbar sein</b>. Bitte fügen Sie der Karte nur dann Dinge hinzu, wenn sie wirklich existieren. Viele Anwendungen verwenden diese Daten."
        }),
        confirmButton: new Translation_1.Translation({
          "en": "Add a {category} here",
          "ca": "Afegir {category} aquí",
          "es": "Añadir {category} aquí",
          "nl": "Voeg hier een {category} toe",
          "fr": "Ajouter un/une {category} ici",
          "gl": "Engadir {category} aquí",
          "de": "Hier eine {category} hinzufügen"
        }),
        openLayerControl: new Translation_1.Translation({
          "en": "Open the layer control box",
          "ca": "Obrir el control de capes",
          "es": "Abrir el control de capas",
          "nl": "Open de laag-instellingen",
          "de": "Das Ebenen-Kontrollkästchen öffnen"
        }),
        layerNotEnabled: new Translation_1.Translation({
          "en": "The layer {layer} is not enabled. Enable this layer to add a point",
          "ca": "La capa {layer} no està habilitada. Fes-ho per poder afegir un punt a aquesta capa",
          "es": "La capa {layer} no está habilitada. Hazlo para poder añadir un punto en esta capa",
          "nl": "De laag {layer} is gedeactiveerd. Activeer deze om een punt toe te voegn",
          "de": "Die Ebene {layer} ist nicht aktiviert. Aktivieren Sie diese Ebene, um einen Punkt hinzuzufügen"
        })
      },
      pickLanguage: new Translation_1.Translation({
        "en": "Choose a language",
        "ca": "Tria idioma",
        "es": "Escoge idioma",
        "nl": "Kies je taal",
        "fr": "Choisir la langue",
        "gl": "Escoller lingua",
        "de": "Wählen Sie eine Sprache"
      }),
      about: new Translation_1.Translation({
        "en": "Easily edit and add OpenStreetMap for a certain theme",
        "ca": "Edita facilment i afegeix punts a OpenStreetMap d'una temàtica determinada",
        "es": "Edita facilmente y añade puntos en OpenStreetMap de un tema concreto",
        "nl": "Easily edit and add OpenStreetMap for a certain theme",
        "fr": "Édition facile et ajouter OpenStreetMap pour un certain thème",
        "gl": "Editar doadamente e engadir puntos no OpenStreetMap dun eido en concreto",
        "de": "OpenStreetMap für ein bestimmtes Thema einfach bearbeiten und hinzufügen"
      }),
      nameInlineQuestion: new Translation_1.Translation({
        "en": "The name of this {category} is $$$",
        "ca": "{category}: El seu nom és $$$",
        "es": "{category}: Su nombre es $$$",
        "nl": "De naam van dit {category} is $$$",
        "fr": "Le nom de cet/cette {category} est $$$",
        "gl": "{category}: O teu nome é $$$",
        "de": "Der Name dieser {category} ist $$$"
      }),
      noNameCategory: new Translation_1.Translation({
        "en": "{category} without a name",
        "ca": "{category} sense nom",
        "es": "{category} sin nombre",
        "nl": "{category} zonder naam",
        "fr": "{category} sans nom",
        "gl": "{category} sen nome",
        "de": "{category} ohne Namen"
      }),
      questions: {
        phoneNumberOf: new Translation_1.Translation({
          "en": "What is the phone number of {category}?",
          "ca": "Quin és el telèfon de {category}?",
          "es": "Qué teléfono tiene {category}?",
          "nl": "Wat is het telefoonnummer van {category}?",
          "fr": "Quel est le nom de {category}?",
          "gl": "Cal é o número de teléfono de {category}?",
          "de": "Wie lautet die Telefonnummer der {category}?"
        }),
        phoneNumberIs: new Translation_1.Translation({
          "en": "The phone number of this {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
          "ca": "El número de telèfon de {category} és <a href='tel:{phone}' target='_blank'>{phone}</a>",
          "es": "El número de teléfono de {category} es <a href='tel:{phone}' target='_blank'>{phone}</a>",
          "nl": "Het telefoonnummer van {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
          "fr": "Le numéro de téléphone de {category} est <a href='tel:{phone}' target='_blank'>{phone}</a>",
          "gl": "O número de teléfono de {category} é <a href='tel:{phone}' target='_blank'>{phone}</a>",
          "de": "Die Telefonnummer der {category} lautet <a href='tel:{phone}' target='_blank'>{phone}</a>"
        }),
        websiteOf: new Translation_1.Translation({
          "en": "What is the website of {category}?",
          "ca": "Quina és la pàgina web de {category}?",
          "es": "Cual es la página web de {category}?",
          "nl": "Wat is de website van {category}?",
          "fr": "Quel est le site internet de {category}?",
          "gl": "Cal é a páxina web de {category}?",
          "de": "Was ist die Website der {category}?"
        }),
        websiteIs: new Translation_1.Translation({
          "en": "Website: <a href='{website}' target='_blank'>{website}</a>",
          "ca": "Pàgina web: <a href='{website}' target='_blank'>{website}</a>",
          "es": "Página web: <a href='{website}' target='_blank'>{website}</a>",
          "nl": "Website: <a href='{website}' target='_blank'>{website}</a>",
          "fr": "Website: <a href='{website}' target='_blank'>{website}</a>",
          "gl": "Páxina web: <a href='{website}' target='_blank'>{website}</a>",
          "de": "Webseite: <a href='{website}' target='_blank'>{website}</a>"
        }),
        emailOf: new Translation_1.Translation({
          "en": "What is the email address of {category}?",
          "ca": "Quina és l'adreça de correu-e de {category}?",
          "es": "¿Qué dirección de correu tiene {category}?",
          "nl": "Wat is het email-adres van {category}?",
          "fr": "Quel est l'adresse email de {category}?",
          "gl": "Cal é o enderezo de correo electrónico de {category}?",
          "de": "Wie lautet die E-Mail-Adresse der {category}?"
        }),
        emailIs: new Translation_1.Translation({
          "en": "The email address of this {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
          "ca": "L'adreça de correu de {category} és <a href='mailto:{email}' target='_blank'>{email}</a>",
          "es": "La dirección de correo de {category} es <a href='mailto:{email}' target='_blank'>{email}</a>",
          "nl": "Het email-adres van {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
          "fr": "L'adresse email de {category} est <a href='mailto:{email}' target='_blank'>{email}</a>",
          "gl": "O enderezo de correo electrónico de {category} é <a href='mailto:{email}' target='_blank'>{email}</a>",
          "de": "Die E-Mail-Adresse dieser {category} lautet <a href='mailto:{email}' target='_blank'>{email}</a>"
        })
      },
      openStreetMapIntro: new Translation_1.Translation({
        "en": "<h3>An Open Map</h3><p>Wouldn't it be cool if there was a single map, which everyone could freely use and edit? A single place to store all geo-information? Then, all those websites with different, small and incompatible maps (which are always outdated) wouldn't be needed anymore.</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is this map. The map data can be used for free (with <a href='https://osm.org/copyright' target='_blank'>attribution and publication of changes to that data</a>). On top of that, everyone can freely add new data and fix errors. This website uses OpenStreetMap as well. All the data is from there, and your answers and corrections are added there as well.</p><p>A ton of people and application already use OpenStreetMap:  <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, but also the maps at Facebook, Instagram, Apple-maps and Bing-maps are (partly) powered by OpenStreetMap.If you change something here, it'll be reflected in those applications too - after their next update!</p>",
        "es": "<h3>Un mapa abierto</h3><p></p>¿No sería genial si hubiera un solo mapa, que todos pudieran usar y editar libremente?¿Un solo lugar para almacenar toda la información geográfica? Entonces, todos esos sitios web con mapas diferentes, pequeños e incompatibles (que siempre están desactualizados) ya no serían necesarios.</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> es ese mapa. Los datos del mapa se pueden utilizar de forma gratuita (con <a href='https://osm.org/copyright' target='_blank'> atribución y publicación de cambios en esos datos</a>).Además de eso, todos pueden agregar libremente nuevos datos y corregir errores. Este sitio web también usa OpenStreetMap. Todos los datos provienen de allí, y tus respuestas y correcciones también se añadirán allí.</p><p>Muchas personas y aplicaciones ya usan OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, pero también los mapas de Facebook, Instagram, Apple y Bing son (en parte) impulsados ​​por OpenStreetMap .Si cambias algo aquí, también se reflejará en esas aplicaciones, en su próxima actualización</p>",
        "ca": "<h3>Un mapa obert</h3><p></p>No seria genial si hagués un únic mapa, que tothom pogués utilitzar i editar lliurement?Un sol lloc on emmagatzemar tota la informació geogràfica? Llavors tots aquests llocs web amb mapes diferents petits i incompatibles (que sempre estaran desactulitzats) ja no serien necessaris.</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> és aquest mapa. Les dades del mapa es poden utilitzar de franc (amb <a href='https://osm.org/copyright' target='_blank'> atribució i publicació de canvis en aquestes dades</a>).A més a més, tothom pot agregar lliurement noves dades i corregir errors. De fet, aquest lloc web també fa servir OpenStreetMap. Totes les dades provenen d'allà i les teves respostes i correccions també s'afegiran allà.</p><p>Moltes persones i aplicacions ja utilitzen OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, però també els mapes de Facebook, Instagram, Apple i Bing són (en part) impulsats ​​per OpenStreetMap.Si canvies alguna cosa aquí també es reflectirà en aquestes aplicacions en la seva propera actualització.</p>",
        "nl": "<h3>Een open kaart</h3><p>Zou het niet fantastisch zijn als er een open kaart zou zijn die door iedereen aangepast én gebruikt kan worden? Een kaart waar iedereen zijn interesses aan zou kunnen toevoegen? Dan zouden er geen duizend-en-één verschillende kleine kaartjes, websites, ... meer nodig zijn</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is deze open kaart. Je mag de kaartdata gratis gebruiken (mits <a href='https://osm.org/copyright' target='_blank'>bronvermelding en herpublicatie van aanpassingen</a>). Daarenboven mag je de kaart ook gratis aanpassen als je een account maakt. Ook deze website is gebaseerd op OpenStreetMap. Als je hier een vraag beantwoord, gaat het antwoord daar ook naartoe</p><p>Tenslotte zijn er reeds vele gebruikers van OpenStreetMap. Denk maar <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, verschillende gespecialiseerde routeplanners, de achtergrondkaarten op Facebook, Instagram,...<br/>Zelfs Apple Maps en Bing-Maps gebruiken OpenStreetMap in hun kaarten!</p></p><p>Kortom, als je hier een punt toevoegd of een vraag beantwoord, zal dat na een tijdje ook in al dié applicaties te zien zijn.</p>",
        "fr": "<h3>Une carte ouverte</h3><p></p>How incroyable se serait d'avoir sur une carte que tout le monde pourrait éditer ouvertement?Une seule et unique plateforme regroupant toutes les informations geographiques? Ainsi nous n'aurons plus besoin de toutes ces petites et incompatibles cartes (souvent non mises à jour).</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> est la carte qu'il vous faut!. Toutes les donnees de cette carte peuvent être utilisé gratuitement (avec <a href='https://osm.org/copyright' target='_blank'> d'attribution et de publication des changements de données</a>). De plus tout le monde est libre d'ajouter de nouvelles données et corriger les erreurs. Ce site internet utilise également OpenStreetMap. Toutes les données y proviennent et tous les ajouts et modifications y seront également ajoutés.</p><p>De nombreux individus et d'applications utilisent déjà OpenStreetMap:  <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, mais aussi les cartes de Facebook, Instagram, Apple-maps et Bing-maps sont(en partie) supporté par OpenStreetMap.Si vous modifié quelque chose ici, ces changement seront retranscris sur ces applications aussi - des lors de leur mise à jour! </p>",
        "gl": "<h3>Un mapa aberto</h3><p></p>Non sería xenial se houbera un só mapa, que todos puideran empregar e editar de xeito libre?Un só lugar para almacenar toda a información xeográfica? Entón, todos eses sitios web con mapas diferentes, pequenos e incompatíbeis (que sempre están desactualizados) xa non serían necesarios.</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> é ese mapa. Os datos do mapa pódense empregar de balde (con <a href='https://osm.org/copyright' target='_blank'> atribución e publicación de modificacións neses datos</a>).Ademais diso, todos poden engadir de xeito ceibe novos datos e corrixir erros. Este sitio web tamén emprega o OpenStreetMap. Todos os datos proveñen de alí, e as túas respostas e correccións tamén serán engadidas alí.</p><p>Moitas persoas e aplicacións xa empregan o OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, pero tamén os mapas do Facebook, Instagram, Apple e Bing son (en parte) impulsados ​​polo OpenStreetMap.Se mudas algo aquí, tamén será reflexado nesas aplicacións, na súa seguinte actualización!</p>",
        "de": "<h3>Eine offene Karte</h3><p>Wäre es nicht toll, wenn es eine offene Karte gäbe, die von jedem angepasst und benutzt werden könnte? Eine Karte, zu der jeder seine Interessen hinzufügen kann? Dann bräuchte man all diese Websites mit unterschiedlichen, kleinen und inkompatiblen Karten (die immer veraltet sind) nicht mehr.</p><p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> ist diese offene Karte. Die Kartendaten können kostenlos verwendet werden (mit <a href='https://osm.org/copyright' target='_blank'>Attribution und Veröffentlichung von Änderungen an diesen Daten</a>). Darüber hinaus können Sie die Karte kostenlos ändern und Fehler beheben, wenn Sie ein Konto erstellen. Diese Website basiert ebenfalls auf OpenStreetMap. Wenn Sie eine Frage hier beantworten, geht die Antwort auch dorthin.</p>Viele Menschen und Anwendungen nutzen OpenStreetMap bereits: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, verschiedene spezialisierte Routenplaner, die Hintergrundkarten auf Facebook, Instagram,...<br/>Sogar Apple Maps und Bing Maps verwenden OpenStreetMap in ihren Karten!</p></p><p>Wenn Sie hier einen Punkt hinzufügen oder eine Frage beantworten, wird er nach einer Weile in all diesen Anwendungen sichtbar sein.</p>"
      }),
      sharescreen: {
        intro: new Translation_1.Translation({
          "en": "<h3>Share this map</h3> Share this map by copying the link below and sending it to friends and family:",
          "ca": "<h3>Comparteix aquest mapa</h3> Comparteix aquest mapa copiant l'enllaç de sota i enviant-lo a amics i família:",
          "es": "<h3>Comparte este mapa</h3> Comparte este mapa copiando el enlace de debajo y enviándolo a amigos y familia:",
          "fr": "<h3>Partager cette carte</h3> Partagez cette carte en copiant le lien suivant et envoyer le à vos amis:",
          "nl": "<h3>Deel deze kaart</h3> Kopieer onderstaande link om deze kaart naar vrienden en familie door te sturen:",
          "gl": "<h3>Comparte este mapa</h3> Comparte este mapa copiando a ligazón de embaixo e enviándoa ás amizades e familia:",
          "de": "<h3>Diese Karte teilen</h3> Sie können diese Karte teilen, indem Sie den untenstehenden Link kopieren und an Freunde und Familie schick"
        }),
        addToHomeScreen: new Translation_1.Translation({
          "en": "<h3>Add to your home screen</h3>You can easily add this website to your smartphone home screen for a native feel. Click the 'add to home screen button' in the URL bar to do this.",
          "ca": "<h3>Afegir-lo a la pantalla d'inici</h3>Pots afegir aquesta web a la pantalla d'inici del teu smartphone per a que es vegi més nadiu. Apreta al botó 'afegir a l'inici' a la barra d'adreces URL per fer-ho.",
          "es": "<h3>Añadir a la pantalla de inicio</h3>Puedes añadir esta web en la pantalla de inicio de tu smartphone para que se vea más nativo. Aprieta el botón 'añadir a inicio' en la barra de direcciones URL para hacerlo.",
          "fr": "<h3>Ajouter à votre page d'accueil</h3> Vous pouvez facilement ajouter la carte à votre écran d'accueil de téléphone. Cliquer sur le boutton 'ajouter à l'evran d'accueil' dans la barre d'URL pour éffecteur cette tâche",
          "gl": "<h3>Engadir á pantalla de inicio</h3>Podes engadir esta web na pantalla de inicio do teu smartphone para que se vexa máis nativo. Preme o botón 'engadir ó inicio' na barra de enderezos URL para facelo.",
          "nl": "<h3>Voeg toe aan je thuis-scherm</h3>Je kan deze website aan je thuisscherm van je smartphone toevoegen voor een native feel",
          "de": "<h3>Zum Startbildschirm hinzufügen</h3> Sie können diese Website einfach zum Startbildschirm Ihres Smartphones hinzufügen, um ein natives Gefühl zu erhalten. Klicken Sie dazu in der URL-Leiste auf die Schaltfläche 'Zum Startbildschirm hinzufügen'."
        }),
        embedIntro: new Translation_1.Translation({
          "en": "<h3>Embed on your website</h3>Please, embed this map into your website. <br/>We encourage you to do it - you don't even have to ask permission. <br/>  It is free, and always will be. The more people using this, the more valuable it becomes.",
          "ca": "<h3>Inclou-ho a la teva pàgina web</h3>Inclou aquest mapa dins de la teva pàgina web. <br/> T'animem a que ho facis, no cal que demanis permís. <br/>  És de franc, i sempre ho serà. A més gent que ho faci servir més valuós serà.",
          "es": "<h3>Inclúyelo en tu página web</h3>Incluye este mapa en tu página web. <br/> Te animamos a que lo hagas, no hace falta que pidas permiso. <br/> Es gratis, y siempre lo será. A más gente que lo use más valioso será.",
          "fr": "<h3>Incorporer à votre website</h3>AJouter la carte à votre website. <br/>On vous en encourage - pas besoin de permission. <br/>  C'est gratuit et pour toujours. Le plus de personnes l'utilisent, le mieux ce sera.",
          "gl": "<h3>Inclúeo na túa páxina web</h3>Inclúe este mapa na túa páxina web. <br/> Animámoche a que o fagas, non fai falla que pidas permiso. <br/> É de balde, e sempre será. Canta máis xente que o empregue máis valioso será.",
          "nl": "<h3>Plaats dit op je website</h3>Voeg dit kaartje toe op je eigen website.<br/>We moedigen dit zelfs aan - je hoeft geen toestemming te vragen.<br/> Het is gratis en zal dat altijd blijven. Hoe meer het gebruikt wordt, hoe waardevoller",
          "de": "<h3>Auf Ihrer Website einbetten</h3>Bitte, betten Sie diese Karte in Ihre Website ein. <br/>Wir ermutigen Sie, es zu tun - Sie müssen nicht einmal um Erlaubnis fragen. <br/> Es ist kostenlos und wird es immer sein. Je mehr Leute sie benutzen, desto wertvoller wird sie."
        }),
        copiedToClipboard: new Translation_1.Translation({
          "en": "Link copied to clipboard",
          "ca": "Enllaç copiat al portapapers",
          "es": "Enlace copiado en el portapapeles",
          "gl": "Ligazón copiada ó portapapeis",
          "nl": "Link gekopieerd naar klembord",
          "de": "Link in die Zwischenablage kopiert"
        }),
        thanksForSharing: new Translation_1.Translation({
          "en": "Thanks for sharing!",
          "ca": "Gràcies per compartir",
          "es": "Gracias por compartir",
          "gl": "Grazas por compartir!",
          "nl": "Bedankt om te delen!",
          "de": "Danke für das Teilen!"
        }),
        editThisTheme: new Translation_1.Translation({
          "en": "Edit this theme",
          "ca": "Editar aquest repte",
          "es": "Editar este reto",
          "gl": "Editar este tema",
          "nl": "Pas dit thema aan",
          "de": "Dieses Thema bearbeiten"
        }),
        editThemeDescription: new Translation_1.Translation({
          "en": "Add or change questions to this map theme",
          "ca": "Afegir o canviar preguntes d'aquest repte",
          "es": "Añadir o cambiar preguntas de este reto",
          "gl": "Engadir ou mudar preguntas a este tema do mapa",
          "nl": "Pas vragen aan of voeg vragen toe aan dit kaartthema",
          "de": "Fragen zu diesem Kartenthema hinzufügen oder ändern"
        }),
        fsUserbadge: new Translation_1.Translation({
          "en": "Enable the login-button",
          "ca": "Activar el botó d'entrada",
          "es": "Activar el botón de entrada",
          "gl": "Activar botón de inicio de sesión",
          "nl": "Activeer de login-knop",
          "de": " Anmelde-Knopf aktivieren"
        }),
        fsSearch: new Translation_1.Translation({
          "en": "Enable the search bar",
          "ca": "Activar la barra de cerca",
          "es": "Activar la barra de búsqueda",
          "gl": "Activar a barra de procura",
          "nl": "Activeer de zoekbalk",
          "de": " Suchleiste aktivieren"
        }),
        fsWelcomeMessage: new Translation_1.Translation({
          "en": "Show the welcome message popup and associated tabs",
          "ca": "Mostra el missatge emergent de benvinguda i pestanyes associades",
          "es": "Muestra el mensaje emergente de bienvenida y pestañas asociadas",
          "gl": "Amosar a xanela emerxente da mensaxe de benvida e as lapelas asociadas",
          "nl": "Toon het welkomstbericht en de bijhorende tabbladen",
          "de": "Popup der Begrüßungsnachricht und zugehörige Registerkarten anzeigen"
        }),
        fsLayers: new Translation_1.Translation({
          "en": "Enable thelayer control",
          "ca": "Activar el control de capes",
          "es": "Activar el control de capas",
          "gl": "Activar o control de capas",
          "nl": "Toon de knop voor laagbediening",
          "de": "Aktivieren der Layersteuerung"
        }),
        fsLayerControlToggle: new Translation_1.Translation({
          "en": "Start with the layer control expanded",
          "gl": "Comenza co control de capas expandido",
          "ca": "Iniciar el control de capes avançat",
          "es": "Iniciar el control de capas avanzado",
          "nl": "Toon de laagbediening meteen volledig",
          "de": "Mit der erweiterten Ebenenkontrolle beginnen"
        }),
        fsAddNew: new Translation_1.Translation({
          "en": "Enable the 'add new POI' button",
          "ca": "Activar el botó d'afegir nou PDI'",
          "es": "Activar el botón de añadir nuevo PDI'",
          "nl": "Activeer het toevoegen van nieuwe POI",
          "gl": "Activar o botón de 'engadir novo PDI'",
          "de": "Schaltfläche 'neuen POI hinzufügen' aktivieren"
        }),
        fsGeolocation: new Translation_1.Translation({
          "en": "Enable the 'geolocate-me' button (mobile only)",
          "ca": "Activar el botó de 'geolocalitza'm' (només mòbil)",
          "es": "Activar el botón de 'geolocalízame' (només mòbil)",
          "gl": "Activar o botón de 'xeolocalizarme' (só móbil)",
          "nl": "Toon het knopje voor geolocalisatie (enkel op mobiel)",
          "de": "Die Schaltfläche 'Mich geolokalisieren' aktivieren (nur für Mobil)"
        }),
        fsIncludeCurrentBackgroundMap: new Translation_1.Translation({
          "en": "Include the current background choice <b>{name}</b>",
          "ca": "Incloure l'opció de fons actual <b>{name}</b>",
          "es": "Incluir la opción de fondo actual <b>{name}</b>",
          "nl": "Gebruik de huidige achtergrond <b>{name}</b>",
          "de": "Die aktuelle Hintergrundwahl einschließen <b>{name}</b>"
        }),
        fsIncludeCurrentLayers: new Translation_1.Translation({
          "en": "Include the current layer choices",
          "ca": "Incloure les opcions de capa actual",
          "es": "Incluir las opciones de capa actual",
          "nl": "Toon enkel de huidig getoonde lagen",
          "de": "Die aktuelle Ebenenauswahl einbeziehen"
        }),
        fsIncludeCurrentLocation: new Translation_1.Translation({
          "en": "Include current location",
          "es": "Incluir localización actual",
          "ca": "Incloure localització actual",
          "nl": "Start op de huidige locatie",
          "de": "Aktuelle Position einbeziehen"
        })
      },
      morescreen: {
        intro: new Translation_1.Translation({
          "en": "<h3>More thematic maps?</h3>Do you enjoy collecting geodata? <br/>There are more themes available.",
          "ca": "<h3>Més peticions</h3>T'agrada captar dades? <br/>Hi ha més capes disponibles.",
          "es": "<h3>Más peticiones</h3>Te gusta captar datos? <br/>Hay más capas disponibles.",
          "fr": "<h3>Plus de thème </h3>Vous aimez collecter des données? <br/>Il y a plus de thèmes disponible.",
          "nl": "<h3>Meer thematische kaarten</h3>Vind je het leuk om geodata te verzamelen? <br/> Hier vind je meer kaartthemas.",
          "gl": "<h3>Máis tarefas</h3>Góstache captar datos? <br/>Hai máis capas dispoñíbeis.",
          "de": "<h3>Weitere Quests</h3>Sammeln Sie gerne Geodaten? <br/>Es sind weitere Themen verfügbar."
        }),
        requestATheme: new Translation_1.Translation({
          "en": "If you want a custom-built quest, request it <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>here</a>",
          "ca": "Si vols que et fem una petició pròpia , demana-la <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
          "es": "Si quieres que te hagamos una petición propia , pídela <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
          "nl": "Wil je een eigen kaartthema, vraag dit <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier aan</a>",
          "fr": "Si vous voulez une autre carte thématique, demandez <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>ici</a>",
          "gl": "Se queres que che fagamos unha tarefa propia , pídea <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
          "de": "Wenn Sie einen speziell angefertigte Quest wünschen, können Sie diesen <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier</a> anfragen"
        }),
        streetcomplete: new Translation_1.Translation({
          "en": "Another, similar application is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          "ca": "Una altra aplicació similar és <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          "es": "Otra aplicación similar es <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          "fr": "Une autre application similaire est <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          "nl": "Een andere, gelijkaardige Android-applicatie is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          "gl": "Outra aplicación semellante é <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
          "de": "Eine andere, ähnliche Anwendung ist <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>"
        }),
        createYourOwnTheme: new Translation_1.Translation({
          "en": "Create your own MapComplete theme from scratch",
          "ca": "Crea la teva pròpia petició completa de MapComplete des de zero.",
          "es": "Crea tu propia petición completa de MapComplete desde cero.",
          "nl": "Maak je eigen MapComplete-kaart",
          "fr": "Créez votre propre MapComplete carte",
          "gl": "Crea o teu propio tema completo do MapComplete dende cero.",
          "de": "Erstellen Sie Ihr eigenes MapComplete-Thema von Grund auf neu"
        })
      },
      readYourMessages: new Translation_1.Translation({
        "en": "Please, read all your OpenStreetMap-messages before adding a new point.",
        "ca": "Llegeix tots els teus missatges d'OpenStreetMap abans d'afegir nous punts.",
        "es": "Lee todos tus mensajes de OpenStreetMap antes de añadir nuevos puntos.",
        "nl": "Gelieve eerst je berichten op OpenStreetMap te lezen alvorens nieuwe punten toe te voegen.",
        "fr": "Merci de lire tout vos messages d'OpenStreetMap avant d'ajouter un nouveau point.",
        "gl": "Le todos a túas mensaxes do OpenStreetMap antes de engadir novos puntos.",
        "de": "Bitte lesen Sie alle Ihre OpenStreetMap-Nachrichten, bevor Sie einen neuen Punkt hinzufügen"
      }),
      fewChangesBefore: new Translation_1.Translation({
        "en": "Please, answer a few questions of existing points before adding a new point.",
        "ca": "Contesta unes quantes preguntes sobre punts existents abans d'afegir-ne un de nou.",
        "es": "Contesta unas cuantas preguntas sobre puntos existentes antes de añadir nuevos.",
        "nl": "Gelieve eerst enkele vragen van bestaande punten te beantwoorden vooraleer zelf punten toe te voegen.",
        "fr": "Merci de répondre à quelques questions à propos de point déjà existant avant d'ajouter de nouveaux points",
        "gl": "Responde unhas cantas preguntas sobre puntos existentes antes de engadir novos.",
        "de": "Bitte beantworten Sie ein paar Fragen zu bestehenden Punkten, bevor Sie einen neuen Punkt hinzufügen."
      }),
      goToInbox: new Translation_1.Translation({
        "en": "Open inbox",
        "es": "Abrir mensajes",
        "ca": "Obrir missatges",
        "nl": "Ga naar de berichten",
        "fr": "Ouvrir les messages",
        "gl": "Abrir mensaxes",
        "de": "Posteingang öffnen"
      }),
      getStartedLogin: new Translation_1.Translation({
        "en": "Login with OpenStreetMap to get started",
        "es": "Entra en OpenStreetMap para empezar",
        "ca": "Entra a OpenStreetMap per començar",
        "nl": "Login met OpenStreetMap om te beginnen",
        "fr": "Connectez vous avec OpenStreetMap pour commencer",
        "de": "Mit OpenStreetMap einloggen und loslegen"
      }),
      getStartedNewAccount: new Translation_1.Translation({
        "en": " or <a href='https://www.openstreetmap.org/user/new' target='_blank'>create a new account</a>",
        "nl": " of <a href='https://www.openstreetmap.org/user/new' target='_blank'>maak een nieuwe account aan</a> ",
        "fr": " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>registrez vous</a>",
        "es": " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea una nueva cuenta</a>",
        "ca": " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea un nou compte</a>",
        "gl": " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea unha nova conta</a>",
        "de": " oder <a href='https://www.openstreetmap.org/user/new' target='_blank'>ein neues Konto anlegen</a>"
      }),
      noTagsSelected: new Translation_1.Translation({
        "en": "No tags selected",
        "es": "No se han seleccionado etiquetas",
        "ca": "No s'han seleccionat etiquetes",
        "gl": "Non se seleccionaron etiquetas",
        "de": "Keine Tags ausgewählt"
      }),
      customThemeIntro: new Translation_1.Translation({
        "en": "<h3>Custom themes</h3>These are previously visited user-generated themes.",
        "nl": "<h3>Onofficiële themea's</h3>Je bezocht deze thema's gemaakt door andere OpenStreetMappers eerder",
        "gl": "<h3>Temas personalizados</h3>Estes son temas xerados por usuarios previamente visitados.",
        "de": "<h3>Kundenspezifische Themen</h3>Dies sind zuvor besuchte benutzergenerierte Themen"
      }),
      aboutMapcomplete: new Translation_1.Translation({
        "en": "<h3>About MapComplete</h3><p>MapComplete is an OpenStreetMap editor that is meant to help everyone to easily add information on a <b>single theme.</b></p><p>Only features relevant to a single theme are shown with a few predefined questions, in order to keep things <b>simple and extremly user-friendly</b>.The theme maintainer can also choose a language for the interface, choose to disable elements or even to embed it into a different website without any UI-element at all.</p><p>However, another important part of MapComplete is to always <b>offer the next step</b> to learn more about OpenStreetMap:<ul><li>An iframe without UI-elements will link to a full-screen version</li><li>The fullscreen version offers information about OpenStreetMap</li><li>If you're not logged in, you're asked to log in</li><li>If you answered a single question, you are allowed to add points</li><li>At a certain point, the actual added tags appear which later get linked to the wiki...</li></ul></p><p>Do you notice an issue with MapComplete? Do you have a feature request? Do you want to help translating? Head over to <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>the source code</a> or <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>issue tracker.</a> Follow the edit count on <a href='https://osmcha.org/?filters=%7B%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22mapcomplete%22%2C%22value%22%3A%22mapcomplete%22%7D%5D%7D' target='_blank' >OsmCha</a></p>",
        "nl": "<h3>Over MapComplete</h3><p>MapComplete is een OpenStreetMap-editor om eenvoudig informatie toe te voegen over <b>één enkel onderwerp</b>.</p><p>Om de editor zo <b>simpel en gebruiksvriendelijk mogelijk</b> te houden, worden enkel objecten relevant voor het thema getoond.Voor deze objecten kunnen dan vragen beantwoord worden, of men kan een nieuw punt van dit thema toevoegen.De maker van het thema kan er ook voor opteren om een aantal elementen van de gebruikersinterface uit te schakelen of de taal ervan in te stellen.</p><p>Een ander belangrijk aspect is om bezoekers stap voor stap meer te leren over OpenStreetMap:<ul><li>Een iframe zonder verdere uitleg linkt naar de volledige versie van MapComplete</li><li>De volledige versie heeft uitleg over OpenStreetMap</li><li>Als je niet aangemeld bent, wordt er je gevraagd dit te doen</li><li>Als je minstens één vraag hebt beantwoord, kan je punten gaan toevoegen.</li><li>Heb je genoeg changesets, dan verschijnen de tags die wat later doorlinken naar de wiki</li></ul></p><p>Merk je een bug of wil je een extra feature? Wil je helpen vertalen? Bezoek dan de <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>broncode</a> en <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>issue tracker</a>. Volg de edits <a href='https://osmcha.org/?filters=%7B%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22mapcomplete%22%2C%22value%22%3A%22mapcomplete%22%7D%5D%7D' target='_blank' >op OsmCha</a></p>",
        "de": "<h3>Über MapComplete</h3><p>MapComplete ist ein OpenStreetMap-Editor, der jedem helfen soll, auf einfache Weise Informationen zu einem <b>Einzelthema hinzuzufügen.</b></p><p>Nur Merkmale, die für ein einzelnes Thema relevant sind, werden mit einigen vordefinierten Fragen gezeigt, um die Dinge <b>einfach und extrem benutzerfreundlich</b> zu halten.Der Themen-Betreuer kann auch eine Sprache für die Schnittstelle wählen, Elemente deaktivieren oder sogar in eine andere Website ohne jegliches UI-Element einbetten.</p><p>Ein weiterer wichtiger Teil von MapComplete ist jedoch, immer <b>den nächsten Schritt anzubieten</b>um mehr über OpenStreetMap zu erfahren:<ul><li>Ein iframe ohne UI-Elemente verlinkt zu einer Vollbildversion</li><li>Die Vollbildversion bietet Informationen über OpenStreetMap</li><li>Wenn Sie nicht eingeloggt sind, werden Sie gebeten, sich einzuloggen</li><li>Wenn Sie eine einzige Frage beantwortet haben, dürfen Sie Punkte hinzufügen</li><li>An einem bestimmten Punkt erscheinen die tatsächlich hinzugefügten Tags, die später mit dem Wiki verlinkt werden...</li></ul></p><p>Fällt Ihnen ein Problem mit MapComplete auf? Haben Sie einen Feature-Wunsch? Wollen Sie beim Übersetzen helfen? Gehen Sie <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>zum Quellcode</a> oder <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>zur Problemverfolgung</a>.</p>"
      }),
      backgroundMap: new Translation_1.Translation({
        "en": "Background map",
        "ca": "Mapa de fons",
        "es": "Mapa de fondo",
        "nl": "Achtergrondkaart",
        "de": "Hintergrundkarte"
      }),
      zoomInToSeeThisLayer: new Translation_1.Translation({
        "en": "Zoom in to see this layer",
        "ca": "Amplia per veure aquesta capa",
        "es": "Amplía para ver esta capa",
        "nl": "Vergroot de kaart om deze laag te zien",
        "de": "Vergrößern, um diese Ebene zu sehen"
      }),
      weekdays: {
        abbreviations: {
          monday: new Translation_1.Translation({
            "en": "Mon",
            "ca": "Dil",
            "es": "Lun",
            "nl": "Maan",
            "fr": "Lun"
          }),
          tuesday: new Translation_1.Translation({
            "en": "Tue",
            "ca": "Dim",
            "es": "Mar",
            "nl": "Din",
            "fr": "Mar"
          }),
          wednesday: new Translation_1.Translation({
            "en": "Wed",
            "ca": "Dic",
            "es": "Mie",
            "nl": "Woe",
            "fr": "Mercr"
          }),
          thursday: new Translation_1.Translation({
            "en": "Thu",
            "ca": "Dij",
            "es": "Jue",
            "nl": "Don",
            "fr": "Jeudi"
          }),
          friday: new Translation_1.Translation({
            "en": "Fri",
            "ca": "Div",
            "es": "Vie",
            "nl": "Vrij",
            "fr": "Vendr"
          }),
          saturday: new Translation_1.Translation({
            "en": "Sat",
            "ca": "Dis",
            "es": "Sab",
            "nl": "Zat",
            "fr": "Sam"
          }),
          sunday: new Translation_1.Translation({
            "en": "Sun",
            "ca": "Diu",
            "es": "Dom",
            "nl": "Zon",
            "fr": "Dim"
          })
        },
        monday: new Translation_1.Translation({
          "en": "Monday",
          "ca": "Dilluns",
          "es": "Lunes",
          "nl": "Maandag",
          "fr": "Lundi"
        }),
        tuesday: new Translation_1.Translation({
          "en": "Tuesday",
          "ca": "Dimarts",
          "es": "Martes",
          "nl": "Dinsdag",
          "fr": "Mardi"
        }),
        wednesday: new Translation_1.Translation({
          "en": "Wednesday",
          "ca": "Dimecres",
          "es": "Miércoles",
          "nl": "Woensdag",
          "fr": "Mercredi"
        }),
        thursday: new Translation_1.Translation({
          "en": "Thursday",
          "ca": "Dijous",
          "es": "Jueves",
          "nl": "Donderdag",
          "fr": "Jeudi"
        }),
        friday: new Translation_1.Translation({
          "en": "Friday",
          "ca": "Divendres",
          "es": "Viernes",
          "nl": "Vrijdag",
          "fr": "Vendredi"
        }),
        saturday: new Translation_1.Translation({
          "en": "Saturday",
          "ca": "Dissabte",
          "es": "Sábado",
          "nl": "Zaterdag",
          "fr": "Samedi"
        }),
        sunday: new Translation_1.Translation({
          "en": "Sunday",
          "ca": "Diumenge",
          "es": "Domingo",
          "nl": "Zondag",
          "fr": "Dimance"
        })
      },
      opening_hours: {
        open_during_ph: new Translation_1.Translation({
          "nl": "Op een feestdag is deze zaak",
          "ca": "Durant festes aquest servei és",
          "es": "Durante fiestas este servicio está",
          "en": "During a public holiday, this amenity is"
        }),
        opensAt: new Translation_1.Translation({
          "en": "from",
          "ca": "des de",
          "es": "desde",
          "nl": "vanaf"
        }),
        openTill: new Translation_1.Translation({
          "en": "till",
          "ca": "fins",
          "es": " hasta",
          "nl": "tot"
        }),
        not_all_rules_parsed: new Translation_1.Translation({
          "en": "The opening hours of this shop are complicated. The following rules are ignored in the input element:",
          "ca": "L'horari d'aquesta botiga és complicat. Les normes següents seran ignorades en l'entrada:",
          "es": "El horario de esta tienda es complejo. Las normas siguientes serán ignoradas en la entrada:"
        }),
        closed_until: new Translation_1.Translation({
          "en": "Closed until {date}",
          "ca": "Tancat fins {date}",
          "es": "Cerrado hasta {date}",
          "nl": "Gesloten - open op {date}"
        }),
        closed_permanently: new Translation_1.Translation({
          "en": "Closed - no opening day known",
          "ca": "Tancat - sense dia d'obertura conegut",
          "es": "Cerrado - sin día de apertura conocido",
          "nl": "Gesloten"
        }),
        ph_not_known: new Translation_1.Translation({
          "en": " ",
          "ca": " ",
          "es": " ",
          "nl": " "
        }),
        ph_closed: new Translation_1.Translation({
          "en": "closed",
          "ca": "tancat",
          "es": "cerrado",
          "nl": "gesloten"
        }),
        ph_open: new Translation_1.Translation({
          "en": "opened",
          "ca": "tancat",
          "es": "abierto",
          "nl": "open"
        })
      }
    },
    favourite: {
      panelIntro: new Translation_1.Translation({
        "en": "<h3>Your personal theme</h3>Activate your favourite layers from all the official themes",
        "ca": "<h3>La teva interfície personal</h3>Activa les teves capes favorites de totes les interfícies oficials",
        "es": "<h3>Tu interficie personal</h3>Activa tus capas favoritas de todas las interficies oficiales",
        "gl": "<h3>O teu tema personalizado</h3>Activa as túas capas favoritas de todos os temas oficiais",
        "de": "<h3>Ihr persönliches Thema</h3>Aktivieren Sie Ihre Lieblingsebenen aus allen offiziellen Themen"
      }),
      loginNeeded: new Translation_1.Translation({
        "en": "<h3>Log in</h3>A personal layout is only available for OpenStreetMap users",
        "es": "<h3>Entrar</h3>El diseño personalizado sólo está disponible para los usuarios de OpenstreetMap",
        "ca": "<h3>Entrar</h3>El disseny personalizat només està disponible pels usuaris d' OpenstreetMap",
        "gl": "<h3>Iniciar a sesión</h3>O deseño personalizado só está dispoñíbel para os usuarios do OpenstreetMap",
        "de": "<h3>Anmelden</h3>Ein persönliches Layout ist nur für OpenStreetMap-Benutzer verfügbar"
      }),
      reload: new Translation_1.Translation({
        "en": "Reload the data",
        "es": "Recargar datos",
        "ca": "Recarregar dades",
        "gl": "Recargar os datos",
        "de": "Daten neu laden"
      })
    }
  };
  return AllTranslationAssets;
}();

exports.default = AllTranslationAssets;
},{"./UI/i18n/Translation":"UI/i18n/Translation.ts"}],"UI/i18n/Translations.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var FixedUiElement_1 = require("../Base/FixedUiElement");

var AllTranslationAssets_1 = __importDefault(require("../../AllTranslationAssets"));

var Translation_1 = require("./Translation");

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

  Translations.T = function (t) {
    if (t === undefined) {
      return undefined;
    }

    if (typeof t === "string") {
      return new Translation_1.Translation({
        "*": t
      });
    }

    if (t.render !== undefined) {
      var msg = "Creating a translation, but this object contains a 'render'-field. Use the translation directly";
      console.error(msg, t);
      throw msg;
    }

    return new Translation_1.Translation(t);
  };

  Translations.WT = function (s) {
    if (s === undefined) {
      return undefined;
    }

    if (typeof s === "string") {
      if (Translations.wtcache[s]) {
        return Translations.wtcache[s];
      }

      var tr = new Translation_1.Translation({
        en: s
      });
      Translations.wtcache[s] = tr;
      return tr;
    }

    if (s instanceof Translation_1.Translation) {
      return s;
    }

    console.error("Trying to Translation.WT, but got ", s);
    throw "??? Not a valid translation";
  };

  Translations.CountTranslations = function () {
    var queue = [Translations.t];
    var tr = [];

    while (queue.length > 0) {
      var item = queue.pop();

      if (item instanceof Translation_1.Translation || item.translations !== undefined) {
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

  Translations.t = AllTranslationAssets_1.default.t;
  Translations.wtcache = {};
  return Translations;
}();

exports.default = Translations;
},{"../Base/FixedUiElement":"UI/Base/FixedUiElement.ts","../../AllTranslationAssets":"AllTranslationAssets.ts","./Translation":"UI/i18n/Translation.ts"}],"UI/Base/Link.ts":[function(require,module,exports) {
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

var Link =
/** @class */
function (_super) {
  __extends(Link, _super);

  function Link(embeddedShow, target, newTab) {
    if (newTab === void 0) {
      newTab = false;
    }

    var _this = _super.call(this) || this;

    _this._embeddedShow = Translations_1.default.W(embeddedShow);
    _this._target = target;
    _this._newTab = "";

    if (newTab) {
      _this._newTab = "target='_blank'";
    }

    return _this;
  }

  Link.prototype.InnerRender = function () {
    return "<a href=\"" + this._target + "\" " + this._newTab + ">" + this._embeddedShow.Render() + "</a>";
  };

  return Link;
}(UIElement_1.UIElement);

exports.default = Link;
},{"../UIElement":"UI/UIElement.ts","../i18n/Translations":"UI/i18n/Translations.ts"}],"UI/Image/WikimediaImage.ts":[function(require,module,exports) {
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
exports.WikimediaImage = void 0;

var UIElement_1 = require("../UIElement");

var Wikimedia_1 = require("../../Logic/Web/Wikimedia");

var UIEventSource_1 = require("../../Logic/UIEventSource");

var Svg_1 = __importDefault(require("../../Svg"));

var Link_1 = __importDefault(require("../Base/Link"));

var FixedUiElement_1 = require("../Base/FixedUiElement");

var Combine_1 = __importDefault(require("../Base/Combine"));

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
    var wikimediaLink = new Link_1.default(Svg_1.default.wikimedia_commons_white_img, "https://commons.wikimedia.org/wiki/" + this._imageLocation, true).SetStyle("width:2em;height: 2em");
    var attribution = new FixedUiElement_1.FixedUiElement((_a = this._imageMeta.data.artist) !== null && _a !== void 0 ? _a : "").SetClass("attribution-author");
    var license = new FixedUiElement_1.FixedUiElement((_b = this._imageMeta.data.licenseShortName) !== null && _b !== void 0 ? _b : "").SetClass("license");
    var image = "<img src='" + url + "' " + "alt='" + this._imageMeta.data.description + "' >";
    return "<div class='imgWithAttr'>" + image + new Combine_1.default([wikimediaLink, attribution]).SetClass("attribution").Render() + "</div>";
  };

  WikimediaImage.allLicenseInfos = {};
  return WikimediaImage;
}(UIElement_1.UIElement);

exports.WikimediaImage = WikimediaImage;
},{"../UIElement":"UI/UIElement.ts","../../Logic/Web/Wikimedia":"Logic/Web/Wikimedia.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts","../../Svg":"Svg.ts","../Base/Link":"UI/Base/Link.ts","../Base/FixedUiElement":"UI/Base/FixedUiElement.ts","../Base/Combine":"UI/Base/Combine.ts"}],"UI/Image/SimpleImageElement.ts":[function(require,module,exports) {
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
      var _a;

      var descr = (_a = response.data.description) !== null && _a !== void 0 ? _a : "";
      var data = {};

      for (var _i = 0, _b = descr.split("\n"); _i < _b.length; _i++) {
        var tag = _b[_i];
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

    var image = "<img src='" + this._imageLocation + "' alt='' >";

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
},{"../UIElement":"UI/UIElement.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts","../../Logic/Web/Imgur":"Logic/Web/Imgur.ts"}],"Logic/Web/Mapillary.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mapillary = void 0;

var jquery_1 = __importDefault(require("jquery"));

var Wikimedia_1 = require("./Wikimedia");

var Mapillary =
/** @class */
function () {
  function Mapillary() {}

  Mapillary.getDescriptionOfImage = function (key, handleDescription) {
    var url = "https://a.mapillary.com/v3/images/" + key + "?client_id=TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2";
    var settings = {
      async: true,
      type: 'GET',
      url: url
    };
    jquery_1.default.getJSON(url, function (data) {
      var _a;

      var license = new Wikimedia_1.LicenseInfo();
      license.artist = (_a = data.properties) === null || _a === void 0 ? void 0 : _a.username;
      license.licenseShortName = "CC BY-SA 4.0";
      license.license = "Creative Commons Attribution-ShareAlike 4.0 International License";
      license.attributionRequired = true;
      handleDescription(license);
    });
  };

  return Mapillary;
}();

exports.Mapillary = Mapillary;
},{"jquery":"node_modules/jquery/dist/jquery.js","./Wikimedia":"Logic/Web/Wikimedia.ts"}],"UI/Image/MapillaryImage.ts":[function(require,module,exports) {
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
exports.MapillaryImage = void 0;

var UIElement_1 = require("../UIElement");

var UIEventSource_1 = require("../../Logic/UIEventSource");

var Mapillary_1 = require("../../Logic/Web/Mapillary");

var Svg_1 = __importDefault(require("../../Svg"));

var MapillaryImage =
/** @class */
function (_super) {
  __extends(MapillaryImage, _super);

  function MapillaryImage(source) {
    var _this = _super.call(this) || this;

    if (source.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
      source = source.substring("https://www.mapillary.com/map/im/".length);
    }

    _this._imageLocation = source;

    if (MapillaryImage.allLicenseInfos[source] !== undefined) {
      _this._imageMeta = MapillaryImage.allLicenseInfos[source];
    } else {
      _this._imageMeta = new UIEventSource_1.UIEventSource(null);
      MapillaryImage.allLicenseInfos[source] = _this._imageMeta;
      var self_1 = _this;
      Mapillary_1.Mapillary.getDescriptionOfImage(source, function (license) {
        self_1._imageMeta.setData(license);
      });
    }

    _this.ListenTo(_this._imageMeta);

    return _this;
  }

  MapillaryImage.prototype.InnerRender = function () {
    var _a, _b;

    var url = "https://images.mapillary.com/" + this._imageLocation + "/thumb-640.jpg?client_id=TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2";
    var image = "<img src='" + url + "'>";

    if (this._imageMeta === undefined || this._imageMeta.data === null) {
      return image;
    }

    var attribution = "<span class='attribution-author'><b>" + ((_a = this._imageMeta.data.artist) !== null && _a !== void 0 ? _a : "") + "</b></span>" + " <span class='license'>" + ((_b = this._imageMeta.data.licenseShortName) !== null && _b !== void 0 ? _b : "") + "</span>";
    return "<div class='imgWithAttr'>" + image + "<div class='attribution'>" + Svg_1.default.mapillary_ui().Render() + attribution + "</div>" + "</div>";
  };
  /***
   * Dictionary from url to alreayd known license info
   */


  MapillaryImage.allLicenseInfos = {};
  return MapillaryImage;
}(UIElement_1.UIElement);

exports.MapillaryImage = MapillaryImage;
},{"../UIElement":"UI/UIElement.ts","../../Logic/UIEventSource":"Logic/UIEventSource.ts","../../Logic/Web/Mapillary":"Logic/Web/Mapillary.ts","../../Svg":"Svg.ts"}],"Logic/ImageSearcher.ts":[function(require,module,exports) {
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

var MapillaryImage_1 = require("../UI/Image/MapillaryImage");
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

  function ImageSearcher(tags, imagePrefix, loadSpecial) {
    if (imagePrefix === void 0) {
      imagePrefix = "image";
    }

    if (loadSpecial === void 0) {
      loadSpecial = true;
    }

    var _this = _super.call(this, []) || this;

    _this._wdItem = new UIEventSource_1.UIEventSource("");
    _this._commons = new UIEventSource_1.UIEventSource("");
    _this._tags = tags;
    var self = _this; // By wrapping this in a UIEventSource, we prevent multiple queries of loadWikiData

    _this._wdItem.addCallback(function () {
      return self.loadWikidata();
    });

    _this._commons.addCallback(function () {
      return self.LoadCommons();
    });

    _this._tags.addCallbackAndRun(function () {
      return self.LoadImages(imagePrefix, loadSpecial);
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
        // This url is already seen -> don't add it
        return;
      }
    }

    this.data.push({
      key: key,
      url: url
    });
    this.ping();
  };

  ImageSearcher.prototype.loadWikidata = function () {
    var _this = this; // Load the wikidata item, then detect usage on 'commons'


    var allWikidataId = this._wdItem.data.split(";");

    for (var _i = 0, allWikidataId_1 = allWikidataId; _i < allWikidataId_1.length; _i++) {
      var wikidataId = allWikidataId_1[_i]; // @ts-ignore

      if (wikidataId.startsWith("Q")) {
        wikidataId = wikidataId.substr(1);
      }

      Wikimedia_1.Wikimedia.GetWikiData(parseInt(wikidataId), function (wd) {
        _this.AddImage(undefined, wd.image);

        Wikimedia_1.Wikimedia.GetCategoryFiles(wd.commonsWiki, function (images) {
          for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
            var image = _a[_i]; // @ts-ignore

            if (image.startsWith("File:")) {
              _this.AddImage(undefined, image);
            }
          }
        });
      });
    }
  };

  ImageSearcher.prototype.LoadCommons = function () {
    var _this = this;

    var allCommons = this._commons.data.split(";");

    for (var _i = 0, allCommons_1 = allCommons; _i < allCommons_1.length; _i++) {
      var commons = allCommons_1[_i]; // @ts-ignore

      if (commons.startsWith("Category:")) {
        Wikimedia_1.Wikimedia.GetCategoryFiles(commons, function (images) {
          for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
            var image = _a[_i]; // @ts-ignore

            if (image.startsWith("File:")) {
              _this.AddImage(undefined, image);
            }
          }
        });
      } else {
        // @ts-ignore
        if (commons.startsWith("File:")) {
          this.AddImage(undefined, commons);
        }
      }
    }
  };

  ImageSearcher.prototype.LoadImages = function (imagePrefix, loadAdditional) {
    var imageTag = this._tags.data[imagePrefix];

    if (imageTag !== undefined) {
      var bareImages = imageTag.split(";");

      for (var _i = 0, bareImages_1 = bareImages; _i < bareImages_1.length; _i++) {
        var bareImage = bareImages_1[_i];
        this.AddImage(imagePrefix, bareImage);
      }
    }

    for (var key in this._tags.data) {
      if (key.startsWith(imagePrefix + ":")) {
        var url = this._tags.data[key];
        this.AddImage(key, url);
      }
    }

    if (loadAdditional) {
      var wdItem = this._tags.data.wikidata;

      if (wdItem !== undefined) {
        this._wdItem.setData(wdItem);
      }

      var commons = this._tags.data.wikimedia_commons;

      if (commons !== undefined) {
        this._commons.setData(commons);
      }

      if (this._tags.data.mapillary) {
        var mapillary = this._tags.data.mapillary;
        var prefix = "https://www.mapillary.com/map/im/";

        if (mapillary.indexOf(prefix) < 0) {
          mapillary = prefix + mapillary;
        }

        this.AddImage(undefined, mapillary);
      }
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
    } else if (url.toLowerCase().startsWith("https://commons.wikimedia.org/wiki/")) {
      var commons = url.substr("https://commons.wikimedia.org/wiki/".length);
      return new WikimediaImage_1.WikimediaImage(commons);
    } else if (url.toLowerCase().startsWith("https://i.imgur.com/")) {
      return new ImgurImage_1.ImgurImage(url);
    } else if (url.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
      return new MapillaryImage_1.MapillaryImage(url);
    } else {
      return new SimpleImageElement_1.SimpleImageElement(new UIEventSource_1.UIEventSource(url));
    }
  };

  return ImageSearcher;
}(UIEventSource_1.UIEventSource);

exports.ImageSearcher = ImageSearcher;
},{"../UI/Image/WikimediaImage":"UI/Image/WikimediaImage.ts","../UI/Image/SimpleImageElement":"UI/Image/SimpleImageElement.ts","../UI/Image/ImgurImage":"UI/Image/ImgurImage.ts","./Web/Wikimedia":"Logic/Web/Wikimedia.ts","./UIEventSource":"Logic/UIEventSource.ts","../UI/Image/MapillaryImage":"UI/Image/MapillaryImage.ts"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "38741" + '/');

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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","Logic/ImageSearcher.ts"], null)
//# sourceMappingURL=/Logic/ImageSearcher.js.map