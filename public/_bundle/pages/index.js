import{a as u}from"../chunk-QYMUTLB5.js";import{b as a}from"../chunk-CY6SPCA3.js";import{a as e}from"../chunk-HEUTMP7X.js";function p({todo:t,onToggle:o}){return e("div",{children:[e("input",{type:"checkbox",checked:t.done?!0:void 0,onclick:o}),e("span",{children:t.text})]})}function m(t,o){let n=document.getElementById(t);n&&(n.innerHTML=o)}function r(){let t=a(),o={_value:0,get value(){return this._value},set value(n){this._value=n,m(t,`Count: ${this._value}`)}};return e("div",{children:[e("button",{onclick:()=>o.value--,children:"-"}),e("span",{id:t,style:"margin-left: 8px; margin-right: 8px;",children:["Count: ",o.value]}),e("button",{style:"margin-right: 16px;",onclick:()=>o.value++,children:"+"})]})}var s=()=>{let t=[{id:1,text:"Handle bundling",done:!0},{id:2,text:"Make reactive",done:!1},{id:3,text:"Improve performance",done:!1}],o=i=>{let d=t.find(l=>l.id===i);d&&(d.done=!d.done),n(t)},n=i=>{let d=document.getElementById("json");d&&(d.innerHTML=JSON.stringify(i,void 0,2))};return e("div",{children:[e("h1",{children:"Home"}),e(u,{}),t.map(i=>e(p,{todo:i,onToggle:()=>o(i.id)})),e("pre",{id:"json",style:"margin-top: 10px;",children:JSON.stringify(t,void 0,2)}),e("div",{style:"margin-top: 10px;",children:e(r,{})}),e("div",{style:"margin-top: 10px;",children:e(r,{})})]})};s.meta={title:"Home",description:"Home page"};var b=s;export{b as default};
//# sourceMappingURL=index.js.map
