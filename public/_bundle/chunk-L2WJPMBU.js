import{a as n}from"./chunk-K62W53BH.js";var c=()=>Math.random().toString(36),m=t=>e=>{e.preventDefault();let o=e.target,a=new FormData(o),r=Object.fromEntries(a.entries());t(r,o)};function p(t){return{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}}var s={"/":"Home","/todos":"Todos","/net":"Network"},i="font-weight: bold; text-decoration: underline;";function d(){let t=window.router.pathname;return n("nav",{style:"display: flex; gap: 8px; margin-bottom: 32px;",children:Object.entries(s).map(([e,o])=>n("a",{href:e,style:t===e?i:"",children:o}))})}export{c as a,m as b,p as c,d};
//# sourceMappingURL=chunk-L2WJPMBU.js.map
