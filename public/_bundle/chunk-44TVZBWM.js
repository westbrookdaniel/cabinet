// src/lib/jsx-runtime.ts
function jsx(elementType, attributes) {
  if (typeof elementType === "function") {
    return { type: elementType, attributes };
  }
  return { type: elementType, attributes };
}

export {
  jsx
};
//# sourceMappingURL=chunk-44TVZBWM.js.map
