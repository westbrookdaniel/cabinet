import{a as n}from"./chunk-K62W53BH.js";var d=()=>Math.random().toString(36),m=t=>e=>{e.preventDefault();let o=e.target,a=new FormData(o),r=Object.fromEntries(a.entries());t(r,o)};function p(t){return{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}}var s={"/":"Home","/todos":"Todos","/net":"Network"},i="font-weight: bold; text-decoration: underline;";function c(){let t=window.router?.pathname;return console.log(window.router?.pathname),n("nav",{style:"display: flex; gap: 8px; margin-bottom: 32px;",children:Object.entries(s).map(([e,o])=>n("a",{href:e,style:t===e?i:"",children:o}))})}export{d as a,m as b,p as c,c as d};
//# sourceMappingURL=chunk-YRUICWZQ.js.map
