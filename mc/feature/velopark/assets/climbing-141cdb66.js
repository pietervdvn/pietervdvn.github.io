`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_climbing_gym(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_climbing_route(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_climbing_area(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_shops(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_toilet(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_drinking_water(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}metaTaggging_for_note_import_guidepost(a,r){const{distanceTo:c,overlapWith:l,enclosingFeatures:m,intersectionsWith:g,closest:u,closestn:p,get:i}=r;t.AddLazyProperty(a.properties,"_first_comment",()=>i(a)("comments")[0].text.toLowerCase()),t.AddLazyProperty(a.properties,"_trigger_index",()=>(()=>a.properties._first_comment.split(`
`).map(n=>n.match(".*https://mapcomplete.(org|osm.be)/([a-zA-Z_-]+)(.html)?.*#import")).map((n,d)=>[n!==null,d]).filter(n=>n[0]).map(n=>n[1])[0])()),t.AddLazyProperty(a.properties,"_comments_count",()=>i(a)("comments").length),t.AddLazyProperty(a.properties,"_intro",()=>(()=>{const e=i(a)("comments")[0].text.split(`
`);return e.splice(i(a)("_trigger_index")-1,e.length),e.filter(s=>s!=="").join("<br/>")})()),t.AddLazyProperty(a.properties,"_tags",()=>(()=>{let e=i(a)("comments")[0].text.split(`
`).map(s=>s.trim());return e.splice(0,i(a)("_trigger_index")+1),e=e.filter(s=>s!=""),e.join(";")})())}}b(f,"themeName","climbing");function G(){try{var h=document.createElement("canvas");return!!window.WebGLRenderingContext&&(h.getContext("webgl")||h.getContext("experimental-webgl"))}catch{return!1}}if(!G())new E("WebGL is not supported or not enabled. This is essential for MapComplete to function, please enable this.").SetClass("block alert").AttachTo("maindiv");else{_.setThemeMetatagging(new f),k.layers.push(w),k.layers.push(T),k.layers.push(R),k.layers.push(x),k.layers.push(A),k.layers.push(B),k.layers.push(q),k.layers.push(C);const h=new z(new S(k));new L(j,{state:h}).AttachTo("maindiv")}
//# sourceMappingURL=climbing-141cdb66.js.map