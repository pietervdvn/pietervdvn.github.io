import{C as p,F as c,J as d,Q as e}from"./SvelteUIElement-65e2316e.js";import{S as g,D as y,a as u}from"./DashboardGui-fdad2a4c.js";import"./ToSvelte-f31dc93e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{t as s}from"./mapcomplete-changes-af0c9e94.js";import{A as w}from"./ChartJs-49671581.js";import{M as f,A as b,L as k,D as m}from"./theme_overview-565fd281.js";import{S as a}from"./MoreScreen-67292bb5.js";import"./LanguagePicker-6f35b94e.js";import"./List-1747898b.js";import"./SubtleButton-eb81d210.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";import"./UserInformation-6fea1f2a.js";import"./defineProperty-bf1f4e26.js";import"./_commonjsHelpers-edff4021.js";import"./BBox-aa5284c9.js";import"./ContactLink-5ac5344d.js";import"./BackToIndex-6df98ec5.js";document.getElementById("decoration-desktop").remove();new p(["Initializing... <br/>",new c("<a>If this message persist, something went wrong - click here to try again</a>").SetClass("link-underline small").onClick(()=>{localStorage.clear(),window.location.reload(!0)})]).AttachTo("centermessage");f.initialize();w.implement(new b);g.Implement();d.DisableLongPresses();new URLSearchParams(window.location.search).get("test")==="true"&&console.log(s);const r=new k(s);if((r==null?void 0:r.id)==="cyclofix"){const t=e.GetQueryParameter("layer-bike_shops","true","Legacy - keep De Fietsambassade working"),i=e.GetQueryParameter("layer-bike_shop","true","Legacy - keep De Fietsambassade working");t.data!=="true"&&i.setData(t.data),console.log("layer-bike_shop toggles: legacy:",t.data,"new:",i.data);const n=e.GetQueryParameter("layer-bike_cafes","true","Legacy - keep De Fietsambassade working"),l=e.GetQueryParameter("layer-bike_cafe","true","Legacy - keep De Fietsambassade working");n.data!=="true"&&l.setData(t.data)}const o=new m;a.state=new a(r);m.state=o;window.mapcomplete_state=a.state;const h=e.GetQueryParameter("mode","map","The mode the application starts in, e.g. 'map' or 'dashboard'");h.data==="dashboard"?new y(a.state,o).setup():new u(a.state,o).setup();