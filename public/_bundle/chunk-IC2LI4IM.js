function f(r,e){typeof r=="string"?e.string?.(r):Array.isArray(r)?r.flat().forEach((t,n)=>{typeof t=="object"?e.node?.(t,n):e.string?.(t,n)}):e.node?.(r)}function c(r,e){if(typeof e.type=="function")return c(r,e.type(e.attributes));let t=document.createElement(e.type);r?.replaceChildren(t),p(e,t);let n=e.attributes.children,s=[];return n&&f(n,{node:(o,a)=>{s.push(c(r?.children[a??0],o))},string:o=>{s.push(document.createTextNode(o))}}),t.replaceChildren(...s),t}var i=new WeakMap;function p(r,e){i.has(e)&&(i.get(e).forEach(([n,s])=>{e.removeEventListener(n,s)}),i.delete(e)),Object.entries(r.attributes).forEach(([t,n])=>{if(t!=="children"&&n!==void 0){if(t.startsWith("on")&&typeof n=="function"){let s=t.slice(2);e.addEventListener(s,n),i.has(e)?i.get(e).push([s,n]):i.set(e,[[s,n]]);return}e.setAttribute(t,n)}})}export{c as a};
//# sourceMappingURL=chunk-IC2LI4IM.js.map