import{a as l}from"../chunk-IC2LI4IM.js";import{a as n,b as a,d as p}from"../chunk-KLDMOGOA.js";import{a as o}from"../chunk-K62W53BH.js";var c=()=>{let e=[{id:n(),text:"Handle bundling",done:!0},{id:n(),text:"Make reactive",done:!0},{id:n(),text:"Improve performance",done:!1}],t=o(f,{onToggle:i,todos:e});function i(s){let d=e.find(u=>u.id===s);d&&(d.done=!d.done);let g=document.getElementById("todos");g&&l(g,t)}function r(s){e.unshift({id:n(),text:s,done:!1});let d=document.getElementById("todos");d&&l(d,t)}return o("div",{children:[o("h1",{children:"Todos"}),o(p,{}),o(m,{onAdd:r}),o("div",{id:"todos",children:t})]})};function m({onAdd:e}){let t=n();return o("form",{id:t,onsubmit:a(({newtodo:i},r)=>{e(i),r.reset()}),children:o("label",{style:"display: flex; flex-direction: column; font-size: 12px; gap: 4px;",children:["New Todo",o("div",{children:[o("input",{name:"newtodo",style:"margin-right: 4px;"}),o("button",{type:"submit",children:"Add"})]})]})})}function f({todos:e,onToggle:t}){return o("div",{style:"margin-top: 14px; display: flex; flex-direction: column; gap: 4px;",children:e.map(i=>o(y,{todo:i,onToggle:t}))})}function y({todo:e,onToggle:t}){return o("label",{style:`display: block; text-decoration: ${e.done?"line-through":"unset"}`,children:[o("input",{type:"checkbox",checked:e.done?!0:void 0,onchange:()=>t(e.id)}),e.text]})}var b=c;export{b as default};
//# sourceMappingURL=todos.js.map
