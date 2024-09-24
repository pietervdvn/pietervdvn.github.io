var _=Object.defineProperty;var k=(a,s,e)=>s in a?_(a,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[s]=e;var i=(a,s,e)=>(k(a,typeof s!="symbol"?s+"":s,e),e);import{V as L,U as p,B as E,F as w,J as I,T as C}from"./SvelteUIElement-65e2316e.js";import{L as A}from"./SubtleButton-eb81d210.js";class v extends L{constructor(e,t,n){super(n==null?void 0:n.map(l=>l?e:t));i(this,"isEnabled");this.isEnabled=n}static If(e,t){if(t!==void 0)return new v(new A(t),void 0,e)}}class y extends v{constructor(s,e,t=new p(!1)){super(s,e,t),this.isEnabled=t}ToggleOnClick(){const s=this;return this.onClick(()=>{s.isEnabled.setData(!s.isEnabled.data)}),this}}const g=class extends E{constructor(e,t=3){var l,u,c;super();i(this,"title");i(this,"level");i(this,"id");if(e===void 0)throw"A title should have some content. Undefined is not allowed";typeof e=="string"?this.title=new w(e):this.title=e,this.level=t;let n;typeof e=="string"?n=e:e instanceof w?n=e.content:I.runningFromConsole||(n=(l=e.ConstructElement())==null?void 0:l.textContent),this.id=((c=(u=n==null?void 0:n.replace(/ /g,"-"))==null?void 0:u.replace(/[?#.;:/]/,""))==null?void 0:c.toLowerCase())??"",this.SetClass(g.defaultClassesPerLevel[t]??"")}AsMarkdown(){const e=" "+this.title.AsMarkdown()+" ";return this.level==1?`

`+e+`
`+"=".repeat(e.length)+`

`:this.level==2?`

`+e+`
`+"-".repeat(e.length)+`

`:`

`+"#".repeat(this.level)+e+`

`}InnerConstructElement(){const e=this.title.ConstructElement();if(e===void 0)return;const t=document.createElement("h"+this.level);return t.appendChild(e),e.id=this.id,t}};let f=g;i(f,"defaultClassesPerLevel",["","text-3xl font-bold","text-2xl font-bold","text-xl font-bold","text-lg font-bold"]);class U extends E{}const h=class extends U{constructor(e,t,n=void 0,l){var x;super();i(this,"IsSelected",new p(!1));i(this,"_element");i(this,"_value");i(this,"_values");if(n=n??new p(t[0].value),this._value=n,this._values=t,t.length<=1)return;const u=h._nextDropdownId;h._nextDropdownId++;const c=document.createElement("form");this._element=c,c.id="dropdown"+u;{const r=(x=C.W(e))==null?void 0:x.ConstructElement();if(r!==void 0){const o=document.createElement("label");o.appendChild(r),o.htmlFor=c.id,c.appendChild(o)}}l=l??{},l.select_class=l.select_class??"w-full bg-indigo-100 p-1 rounded hover:bg-indigo-200";{const r=document.createElement("select");r.classList.add(...l.select_class.split(" ")??[]);for(let o=0;o<t.length;o++){const d=document.createElement("option");d.value=""+o,d.appendChild(C.W(t[o].shown).ConstructElement()),r.appendChild(d)}c.appendChild(r),r.onchange=()=>{const o=r.selectedIndex;n.setData(t[o].value)},n.addCallbackAndRun(o=>{for(let d=0;d<t.length;d++)t[d].value===o&&(r.selectedIndex=d)})}this.onClick(()=>{})}GetValue(){return this._value}IsValid(e){for(const t of this._values)if(t.value===e)return!0;return!1}InnerConstructElement(){return this._element}};let m=h;i(m,"_nextDropdownId",0);class S extends E{constructor(e,t=!1){super();i(this,"uiElements");i(this,"_ordered");this._ordered=t,this.uiElements=I.NoNull(e).map(n=>C.W(n))}AsMarkdown(){return this._ordered?`

`+this.uiElements.map((e,t)=>"  "+t+". "+e.AsMarkdown().replace(/\n/g,`  
`)).join(`
`)+`
`:`

`+this.uiElements.map(e=>"  - "+e.AsMarkdown().replace(/\n/g,`  
`)).join(`
`)+`
`}InnerConstructElement(){const e=document.createElement(this._ordered?"ol":"ul");for(const t of this.uiElements){if(t==null)continue;const n=t.ConstructElement();if(n!==void 0){const l=document.createElement("li");l.appendChild(n),e.appendChild(l)}}return e}}export{y as C,m as D,U as I,S as L,v as T,f as a};
