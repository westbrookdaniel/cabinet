import {
  jsx
} from "./chunk-44TVZBWM.js";

// src/lib/utils.ts
var getId = () => Math.random().toString(36);
var withFormData = (cb) => (e) => {
  e.preventDefault();
  const el = e.target;
  const formData = new FormData(el);
  const data = Object.fromEntries(formData.entries());
  cb(data, el);
};
function postJson(json) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(json)
  };
}

// src/components/Navigation.tsx
var routes = {
  "/": "Home",
  "/todos": "Todos",
  "/net": "Network"
};
var activeStyles = "font-weight: bold; text-decoration: underline;";
function Navigation() {
  let currentPath = null;
  if (typeof document !== "undefined") {
    currentPath = location.pathname;
  }
  return /* @__PURE__ */ jsx("nav", { style: "display: flex; gap: 8px; margin-bottom: 32px;", children: Object.entries(routes).map(([path, name]) => /* @__PURE__ */ jsx("a", { href: path, style: currentPath === path ? activeStyles : "", children: name })) });
}

export {
  getId,
  withFormData,
  postJson,
  Navigation
};
//# sourceMappingURL=chunk-DZA3MXWB.js.map
