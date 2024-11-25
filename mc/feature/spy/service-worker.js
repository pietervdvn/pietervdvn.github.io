var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var version = "0.0.0";
function install() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Installing service worker!");
            return [2 /*return*/];
        });
    });
}
addEventListener("install", function (e) { return e.waitUntil(install()); });
addEventListener("activate", function (e) { return e.waitUntil(activate()); });
function clearCaches(exceptVersion) {
    if (exceptVersion === void 0) { exceptVersion = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var keys;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.keys()];
                case 1:
                    keys = _a.sent();
                    return [4 /*yield*/, Promise.all(keys.map(function (k) { return k !== version && caches["delete"](k); }))];
                case 2:
                    _a.sent();
                    console.log("Cleared caches");
                    return [2 /*return*/];
            }
        });
    });
}
function activate() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Activating service worker");
                    return [4 /*yield*/, clearCaches(version)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function fetchAndCache(event) {
    return __awaiter(this, void 0, void 0, function () {
        var networkResponse, cache;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(event.request)];
                case 1:
                    networkResponse = _a.sent();
                    return [4 /*yield*/, caches.open(version)];
                case 2:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.put(event.request, networkResponse.clone())];
                case 3:
                    _a.sent();
                    console.log("Cached", event.request);
                    return [2 /*return*/, networkResponse];
            }
        });
    });
}
function cacheFirst(event, attemptUpdate) {
    if (attemptUpdate === void 0) { attemptUpdate = false; }
    return __awaiter(this, void 0, void 0, function () {
        var cacheResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.match(event.request, { ignoreSearch: true })];
                case 1:
                    cacheResponse = _a.sent();
                    if (cacheResponse === undefined) {
                        return [2 /*return*/, fetchAndCache(event)];
                    }
                    console.debug("Loaded from cache: ", event.request);
                    if (attemptUpdate) {
                        fetchAndCache(event);
                    }
                    return [2 /*return*/, cacheResponse];
            }
        });
    });
}
var neverCache = [/\.html$/, /service-worker/];
var neverCacheHost = [/127\.0\.0\.[0-9]+/, /\.local/, /\.gitpod\.io/, /localhost/];
function handleRequest(event) {
    return __awaiter(this, void 0, void 0, function () {
        var origin, requestUrl, shouldBeCached, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    origin = new URL(self.origin);
                    requestUrl = new URL(event.request.url);
                    if (!requestUrl.pathname.endsWith("service-worker-version")) return [3 /*break*/, 2];
                    console.log("Sending version number...");
                    return [4 /*yield*/, event.respondWith(new Response(JSON.stringify({ "service-worker-version": version })))];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
                case 2:
                    if (!requestUrl.pathname.endsWith("/service-worker-clear")) return [3 /*break*/, 5];
                    return [4 /*yield*/, clearCaches()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, event.respondWith(new Response(JSON.stringify({ "cache-cleared": true })))];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
                case 5:
                    shouldBeCached = origin.host === requestUrl.host &&
                        !neverCacheHost.some(function (blacklisted) { return origin.host.match(blacklisted); }) &&
                        !neverCache.some(function (blacklisted) { return event.request.url.match(blacklisted); });
                    if (!shouldBeCached) {
                        console.debug("Not intercepting ", requestUrl.toString(), origin.host, requestUrl.host);
                        // We return _without_ calling event.respondWith, which signals the browser that it'll have to handle it himself
                        return [2 /*return*/];
                    }
                    _b = (_a = event).respondWith;
                    return [4 /*yield*/, cacheFirst(event)];
                case 6: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
self.addEventListener("fetch", function (e) { return __awaiter(_this, void 0, void 0, function () {
    var event, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                event = e;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 5]);
                return [4 /*yield*/, handleRequest(event)];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3:
                e_1 = _a.sent();
                console.error("CRASH IN SW:", e_1);
                return [4 /*yield*/, event.respondWith(fetch(event.request.url))];
            case 4:
                _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
