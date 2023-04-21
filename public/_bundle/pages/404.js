// src/lib/jsx-runtime.ts
function jsx(elementType, attributes) {
  if (typeof elementType === "function") {
    return { type: elementType, attributes };
  }
  return { type: elementType, attributes };
}

// src/pages/404.tsx
var NotFound = () => {
  return /* @__PURE__ */ jsx("h1", { children: "Page Not Found" });
};
var __default = NotFound;
export {
  __default as default
};
