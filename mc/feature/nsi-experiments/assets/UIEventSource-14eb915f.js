var v=Object.defineProperty;var w=(h,i,t)=>i in h?v(h,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[i]=t;var e=(h,i,t)=>(w(h,typeof i!="symbol"?i+"":i,t),t);import{U as b}from"./Utils-e0968e8e.js";class R{static Chronic(i,t=void 0){const a=new u(void 0);function s(){a.setData(new Date),!b.runningFromConsole&&(t===void 0||t())&&window.setTimeout(s,i)}return s(),a}static FromPromiseWithErr(i){return u.FromPromiseWithErr(i)}static FromPromise(i){const t=new u(void 0);return i==null||i.then(a=>t.setData(a)),i==null||i.catch(a=>console.warn("Promise failed:",a)),t}static flatten(i,t){return u.flatten(i,t)}static ListStabilized(i){const t=new u(void 0);return i.addCallbackAndRun(a=>{if(a===void 0){t.setData(void 0);return}b.sameList(t.data,a)||t.setData(a)}),t}}class p{constructor(i=void 0){e(this,"tag");e(this,"M");if(this.tag=i,i===void 0||i===""){let t=b.runningFromConsole;if(b.runningFromConsole||(t=window.location.hostname==="127.0.0.1"),t){const a=new Error().stack.split(`
`);this.tag=a[1]}}}mapD(i,t,a){return this.map(s=>{if(s!==void 0)return s===null?null:i(s)},t)}withEqualityStabilized(i){let t;return this.map(a=>a==t||i(t,a)?t:(t=a,a))}bind(i){const t=this.map(i),a=new u(void 0),s=new Set;return t.addCallbackAndRun(n=>{if(n===null){a.setData(null);return}if(n===void 0){a.setData(void 0);return}if(s.has(n)){a.setData(n.data);return}s.add(n),n.addCallbackAndRun(r=>{t.data===n&&a.setData(r)})}),a}bindD(i){return this.bind(t=>{if(t===null)return null;if(t!==void 0)return i(t)})}stabilized(i){if(b.runningFromConsole)return this;const t=new u(this.data),a=this;return this.addCallback(s=>{window.setTimeout(()=>{a.data==s&&t.setData(s)},i)}),t}AsPromise(i){const t=this;return i=i??(a=>a!==void 0),new Promise(a=>{const s=t.data;i(s)?a(s):t.addCallbackD(n=>i(n)?(a(n),!0):!1)})}subscribe(i,t){return this.addCallbackAndRun(a=>{i(a)})}}const l=class l extends p{constructor(t){super();e(this,"data");this.data=t}addCallback(t){return l.pass}addCallbackAndRun(t){return t(this.data),l.pass}addCallbackAndRunD(t){return this.data!==void 0&&t(this.data),l.pass}addCallbackD(t){return l.pass}map(t,a=void 0,s){return(a==null?void 0:a.length)>0?new C(this,t,a,void 0,t(this.data),s):new l(t(this.data))}};e(l,"FALSE",new l(!1)),e(l,"TRUE",new l(!0)),e(l,"pass",()=>{});let _=l;class D{constructor(){e(this,"pingCount",0);e(this,"_callbacks",[])}addCallback(i){if(i===console.log)throw"Don't add console.log directly as a callback - you'll won't be able to find it afterwards. Wrap it in a lambda instead.";return this._callbacks.push(i),()=>{const t=this._callbacks.indexOf(i);t>=0&&this._callbacks.splice(t,1)}}ping(i){this.pingCount++;let t,a=new Date().getTime()/1e3;for(const n of this._callbacks)try{n(i)===!0&&(t===void 0?t=[n]:t.push(n))}catch(r){console.error("Got an error while running a callback:",r)}if(new Date().getTime()/1e3-a>500&&console.trace("Warning: a ping took more then 500ms; this is probably a performance issue"),t!==void 0)for(const n of t)this._callbacks.splice(this._callbacks.indexOf(n),1);return this._callbacks.length}length(){return this._callbacks.length}}const k=class k extends p{constructor(t,a,s,n,r,d){super();e(this,"_upstream");e(this,"_upstreamCallbackHandler");e(this,"_upstreamPingCount",-1);e(this,"_unregisterFromUpstream");e(this,"_f");e(this,"_extraStores");e(this,"_unregisterFromExtraStores");e(this,"_callbacks",new D);e(this,"_callbacksAreRegistered",!1);e(this,"_data");this._upstream=t,this._upstreamCallbackHandler=n,this._f=a,this._data=r,this._upstreamPingCount=n==null?void 0:n.pingCount,this._extraStores=s,this.registerCallbacksToUpstream(),d!==void 0&&d(()=>this.unregisterFromUpstream())}get data(){var t;return this._callbacksAreRegistered?this._data:(((t=this._upstreamCallbackHandler)==null?void 0:t.pingCount)!=this._upstreamPingCount&&(this._data=this._f(this._upstream.data)),this._data)}map(t,a=void 0,s){var r,d,g;let n;return((a==null?void 0:a.length)>0||((r=this._extraStores)==null?void 0:r.length)>0)&&(n=[]),(a==null?void 0:a.length)>0&&(n==null||n.push(...a)),((d=this._extraStores)==null?void 0:d.length)>0&&((g=this._extraStores)==null||g.forEach(o=>{n.indexOf(o)<0&&n.push(o)})),new k(this,t,n,this._callbacks,t(this.data),s)}addCallback(t){this._callbacksAreRegistered||this.registerCallbacksToUpstream();const a=this._callbacks.addCallback(t);return()=>{a(),this._callbacks.length()==0&&this.unregisterFromUpstream()}}addCallbackAndRun(t){const a=this.addCallback(t);return t(this.data)===!0?(a(),k.pass):a}addCallbackAndRunD(t){return this.addCallbackAndRun(a=>{if(a!==void 0)return t(a)})}addCallbackD(t){return this.addCallback(a=>{if(a!==void 0)return t(a)})}unregisterFromUpstream(){var t;this._callbacksAreRegistered=!1,this._unregisterFromUpstream(),(t=this._unregisterFromExtraStores)==null||t.forEach(a=>a())}registerCallbacksToUpstream(){var a;const t=this;this._unregisterFromUpstream=this._upstream.addCallback(s=>t.update()),this._unregisterFromExtraStores=(a=this._extraStores)==null?void 0:a.map(s=>s==null?void 0:s.addCallback(n=>t.update())),this._callbacksAreRegistered=!0}update(){var a;const t=this._f(this._upstream.data);this._upstreamPingCount=(a=this._upstreamCallbackHandler)==null?void 0:a.pingCount,this._data!==t&&(this._data=t,this._callbacks.ping(this._data))}};e(k,"pass");let C=k;const c=class c extends p{constructor(t,a=""){super(a);e(this,"data");e(this,"_callbacks",new D);this.data=t}static flatten(t,a){var n;const s=new c((n=t.data)==null?void 0:n.data);t.addCallback(r=>{s.setData(r==null?void 0:r.data),r.addCallback(d=>{if(t.data!==r)return!0;s.setData(d)})});for(const r of a??[])r==null||r.addCallback(()=>{var d;s.setData((d=t.data)==null?void 0:d.data)});return s}static FromPromise(t,a=void 0){const s=new c(void 0);return t==null||t.then(n=>s.setData(n)),t==null||t.catch(n=>{a!==void 0?a(n):console.warn("Promise failed:",n)}),s}static FromPromiseWithErr(t){var s;const a=new c(void 0);return(s=t==null?void 0:t.then(n=>a.setData({success:n})))==null||s.catch(n=>a.setData({error:n})),a}static asInt(t){return t.sync(a=>{let s=parseInt(a);return isNaN(s)?void 0:s},[],a=>{if(!(a===void 0||isNaN(a)))return""+a})}static asFloat(t){return t.sync(a=>{let s=parseFloat(a);return isNaN(s)?void 0:s},[],a=>{if(!(a===void 0||isNaN(a)))return""+a})}static asBoolean(t){return t.sync(a=>a==="true",[],a=>""+a)}static feedFrom(t){const a=new c(t.data);return t.addCallback(s=>a.setData(s)),a}addCallback(t){return this._callbacks.addCallback(t)}addCallbackAndRun(t){return t(this.data)!==!0?this.addCallback(t):c.pass}addCallbackAndRunD(t){return this.addCallbackAndRun(a=>{if(a!=null)return t(a)})}addCallbackD(t){return this.addCallback(a=>{if(a!=null)return t(a)})}setData(t){if(this.data!=t)return this.data=t,this._callbacks.ping(t),this}ping(){this._callbacks.ping(this.data)}map(t,a=[],s){return new C(this,t,a,this._callbacks,t(this.data),s)}mapD(t,a=[],s){return new C(this,n=>{if(n!==void 0)return n===null?null:t(n)},a,this._callbacks,this.data===void 0||this.data===null?this.data:t(this.data),s)}mapAsyncD(t){return this.bindD(a=>c.FromPromise(t(a)))}sync(t,a,s,n=!1){const r=this,g=new Error().stack.split(`
`)[1],o=new c(t(this.data),"map("+this.tag+")@"+g),m=function(){return o.setData(t(r.data)),n&&o._callbacks.length()===0};this.addCallback(m);for(const f of a)f==null||f.addCallback(m);return s!==void 0&&o.addCallback(f=>{r.setData(s(f,r.data))}),o}syncWith(t,a=!1){this.addCallback(n=>t.setData(n));const s=this;return t.addCallback(n=>s.setData(n)),a?t.data!==void 0&&this.setData(t.data):this.data===void 0?this.setData(t.data):t.setData(this.data),this}set(t){this.setData(t)}update(t){this.setData(t(this.data))}};e(c,"pass");let u=c;export{_ as I,R as S,u as U,p as a};
//# sourceMappingURL=UIEventSource-14eb915f.js.map