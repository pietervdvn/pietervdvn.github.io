import{F as m,T as u,C as n}from"./SvelteUIElement-65e2316e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{a as s,L as f}from"./List-1747898b.js";import{L as b,A as l,T as x}from"./LeftIndex-7e97769c.js";import{L as d}from"./LanguagePicker-6f35b94e.js";import{T as C}from"./TableOfContents-3c29835a.js";import"./SubtleButton-eb81d210.js";import"./BackToIndex-6df98ec5.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";class t extends x{constructor(e,...a){super(new s(e.title,3),new c(e,...a))}}class c extends n{constructor(e,...a){super([e.intro,new f([e.li0,e.li1,e.li2,e.li3,e.li4,e.li5,e.li6]),e.outro,...a]),this.SetClass("flex flex-col")}}class g extends b{constructor(){var w;const e=u.t.professional,a=new n([new m('<img class="w-12 h-12 sm:h-24 sm:w-24" src="./assets/svg/logo.svg" alt="MapComplete Logo">').SetClass("flex-none m-3"),new n([new s(e.title,1),e.intro]).SetClass("flex flex-col")]).SetClass("flex"),r=new n([a,new s(e.osmTitle,2),e.text0,e.text1,new l([new t(e.aboutOsm.aboutOsm),new t(e.aboutOsm.benefits),new t(e.aboutOsm.license),new t(e.aboutOsm.vandalism)]).SetClass("flex flex-col"),new s(e.aboutMc.title,2),e.aboutMc.text0,e.aboutMc.text1,e.aboutMc.text2,new l([new t(e.aboutMc.layers),new t(e.aboutMc.survey),new t(e.aboutMc.internalUse),new t(e.services)]),new s(e.drawbacks.title,2).SetClass("text-2xl"),e.drawbacks.intro,new l([new t(e.drawbacks.unsuitedData),new t(e.drawbacks.licenseNuances,new s(e.drawbacks.licenseNuances.usecaseMapDifferentSources.title,4),new c(e.drawbacks.licenseNuances.usecaseMapDifferentSources),new s(e.drawbacks.licenseNuances.usecaseGatheringOpenData.title,4),new c(e.drawbacks.licenseNuances.usecaseGatheringOpenData))])]).SetClass("flex flex-col pb-12 m-3 lg:w-3/4 lg:ml-10 link-underline"),p=[new C(r,{noTopLevel:!0,maxDepth:2}).SetClass("subtle"),(w=new d(u.t.professional.title.SupportedLanguages(),""))==null?void 0:w.SetClass("mt-4 self-end flex-col")].map(o=>o==null?void 0:o.SetClass("pl-4"));super(p,r)}}new m("").AttachTo("decoration-desktop");new g().AttachTo("main");