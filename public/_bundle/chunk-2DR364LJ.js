function c(r,e){typeof r=="string"?e.string?.(r):Array.isArray(r)?r.flat().forEach((n,t)=>{typeof n=="object"?e.node?.(n,t):e.string?.(n,t)}):e.node?.(r)}function s(r,e){if(typeof e.type=="function")return s(r,e.type(e.attributes));let n=document.createElement(e.type);r?.replaceChildren(n),p(e,n);let t=e.attributes.children,o=[];return t&&c(t,{node:(a,f)=>{o.push(s(r?.children[f??0],a))},string:a=>{o.push(document.createTextNode(a))}}),n.replaceChildren(...o),n}var i=new WeakMap;function p(r,e){i.has(e)&&(i.get(e).forEach(([t,o])=>{e.removeEventListener(t,o)}),i.delete(e)),Object.entries(r.attributes).forEach(([n,t])=>{if(n!=="children"&&t!==void 0){if(n.startsWith("on")&&typeof t=="function"){let o=n.slice(2);e.addEventListener(o,t),i.has(e)?i.get(e).push([o,t]):i.set(e,[[o,t]]);return}e.setAttribute(n,t)}})}var y=()=>Math.random().toString(36),E=r=>e=>{e.preventDefault();let n=e.target,t=new FormData(n),o=Object.fromEntries(t.entries());r(o,n)};function h(r){return{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}}function b(r){let e=document.querySelector("head");e&&r.forEach(n=>{let t=s(null,n),o=e.querySelector(`meta[name="${t.getAttribute("name")}"]`);o?o.replaceWith(t):e.appendChild(t)})}export{s as a,y as b,E as c,h as d,b as e};
//# sourceMappingURL=chunk-2DR364LJ.js.map