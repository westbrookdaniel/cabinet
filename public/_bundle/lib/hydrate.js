import{a as h}from"../chunk-IC2LI4IM.js";var p="popstate",v="beforeunload",m=r=>(r.preventDefault(),r.returnValue=""),g=()=>{removeEventListener(v,m,{capture:!0})};function L(r){let t=r.getLocation(),a=()=>{},e=new Set,n=[],i=[],s=()=>{if(n.length){n[0]?.(s,()=>{n=[],g()});return}for(;i.length;)i.shift()?.();f()},c=o=>{i.push(o),s()},f=()=>{t=r.getLocation(),e.forEach(o=>o())};return{get hash(){return t.hash},get href(){return t.href},get pathname(){return t.pathname},get search(){return t.search},get state(){return t.state},listen:o=>(e.size===0&&(a=r.listener(f)),e.add(o),()=>{e.delete(o),e.size===0&&a()}),push:(o,u)=>{c(()=>{r.pushState(o,u)})},replace:(o,u)=>{c(()=>{r.replaceState(o,u)})},go:o=>{c(()=>{r.go(o)})},back:()=>{c(()=>{r.back()})},forward:()=>{c(()=>{r.forward()})},createHref:o=>r.createHref(o),block:o=>(n.push(o),n.length===1&&addEventListener(v,m,{capture:!0}),()=>{n=n.filter(u=>u!==o),n.length||g()})}}function b(){let r=()=>`${window.location.pathname}${window.location.hash}${window.location.search}`,t=e=>e;return L({getLocation:()=>E(r(),history.state),listener:e=>(addEventListener(p,e),()=>{removeEventListener(p,e)}),pushState:(e,n)=>{window.history.pushState({...n,key:y()},"",t(e))},replaceState:(e,n)=>{window.history.replaceState({...n,key:y()},"",t(e))},back:()=>window.history.back(),forward:()=>window.history.forward(),go:e=>window.history.go(e),createHref:e=>t(e)})}function E(r,t){let a=r.indexOf("#"),e=r.indexOf("?");return{href:r,pathname:r.substring(0,a>0?e>0?Math.min(a,e):a:e>0?e:r.length),hash:a>-1?r.substring(a,e):"",search:e>-1?r.substring(e):"",state:t}}function y(){return Math.random().toString(36)}function w(r){let t=b();return t.listen(async()=>{let e=t.pathname,i=(await import(`/_bundle/pages${e==="/"?"/index":e}.js`)).default;h(r,{type:i,attributes:{}})}),document.querySelectorAll("a").forEach(e=>d(t,e)),new MutationObserver(e=>{e.forEach(n=>{switch(n.type){case"childList":n.addedNodes.forEach(i=>{i instanceof HTMLElement&&(i instanceof HTMLAnchorElement&&d(t,i),i.querySelectorAll("a").forEach(s=>d(t,s)))});break;case"attributes":{let i=n.target;i instanceof HTMLElement&&(i instanceof HTMLAnchorElement&&d(t,i),i.querySelectorAll("a").forEach(s=>d(t,s)))}}})}).observe(document,{childList:!0,subtree:!0,attributes:!0}),t}var l=new WeakMap,d=(r,t)=>{if(l.has(t)){let[a,e]=l.get(t);t.removeEventListener(a,e),l.delete(t)}t.addEventListener("click",a=>{a.preventDefault();let e=t.getAttribute("href");!t.target&&e?.startsWith("/")&&r.push(e)})};function k(r){let t=document.getElementById("_root");if(!t)throw new Error("Root element not found");window.router=w(t),h(t,{type:r,attributes:{}})}export{k as default};
//# sourceMappingURL=hydrate.js.map
