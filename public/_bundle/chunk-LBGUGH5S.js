function c(e,t){typeof e=="string"?t.string?.(e):Array.isArray(e)?e.flat().forEach((r,n)=>{typeof r=="object"?t.node?.(r,n):t.string?.(r,n)}):t.node?.(e)}function s(e,t){if(typeof t.type=="function")return s(e,t.type(t.attributes));let r=document.createElement(t.type);e?.replaceChildren(r),d(t,r);let n=t.attributes.children,i=[];return n&&c(n,{node:(a,p)=>{i.push(s(e?.children[p??0],a))},string:a=>{i.push(document.createTextNode(a))}}),r.replaceChildren(...i),r}var o=new WeakMap;function d(e,t){o.has(t)&&(o.get(t).forEach(([n,i])=>{t.removeEventListener(n,i)}),o.delete(t)),Object.entries(e.attributes).forEach(([r,n])=>{if(r!=="children"&&n!==void 0){if(r.startsWith("on")&&typeof n=="function"){let i=r.slice(2);t.addEventListener(i,n),o.has(t)?o.get(t).push([i,n]):o.set(t,[[i,n]]);return}t.setAttribute(r,n)}})}var h=()=>Math.random().toString(36),g=e=>t=>{t.preventDefault();let r=t.target,n=new FormData(r),i=Object.fromEntries(n.entries());e(i,r)};function b(e){return{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}}function f(e){let t=document.querySelector("head");t&&e.forEach(r=>{let n=s(null,r),i=t.querySelector(`meta[name="${n.getAttribute("name")}"]`);i?i.replaceWith(n):t.appendChild(n)})}f.from=e=>{let t=[];return e.title&&t.push({type:"title",attributes:{children:e.title}}),e.description&&t.push({type:"meta",attributes:{name:"description",content:e.description}}),e.image&&t.push({type:"meta",attributes:{name:"image",content:e.image}}),t};export{s as a,h as b,g as c,b as d,f as e};
//# sourceMappingURL=chunk-LBGUGH5S.js.map
