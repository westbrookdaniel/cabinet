// src/lib/traverse.ts
function traverse(children, handlers) {
  if (typeof children === "string") {
    handlers.string?.(children);
  } else if (Array.isArray(children)) {
    children.flat().forEach((child, i) => {
      if (typeof child === "object") {
        handlers.node?.(child, i);
      } else {
        handlers.string?.(child, i);
      }
    });
  } else {
    handlers.node?.(children);
  }
}

// src/lib/render.ts
function renderNode(previousEl, node) {
  if (typeof node.type === "function") {
    return renderNode(previousEl, node.type(node.attributes));
  }
  const el = document.createElement(node.type);
  previousEl?.replaceChildren(el);
  applyAttributes(node, el);
  const children = node.attributes.children;
  const newChildren = [];
  if (children) {
    traverse(children, {
      node: (child, i) => {
        newChildren.push(renderNode(previousEl?.children[i ?? 0], child));
      },
      string: (child) => {
        newChildren.push(document.createTextNode(child));
      }
    });
  }
  el.replaceChildren(...newChildren);
  return el;
}
var listenersInUse = /* @__PURE__ */ new WeakMap();
function applyAttributes(node, el) {
  if (listenersInUse.has(el)) {
    const oldListeners = listenersInUse.get(el);
    oldListeners.forEach(([eventType, listener]) => {
      el.removeEventListener(eventType, listener);
    });
    listenersInUse.delete(el);
  }
  Object.entries(node.attributes).forEach(([key, value]) => {
    if (key === "children")
      return;
    if (value === void 0)
      return;
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2);
      el.addEventListener(eventType, value);
      if (!listenersInUse.has(el)) {
        listenersInUse.set(el, [[eventType, value]]);
      } else {
        listenersInUse.get(el).push([eventType, value]);
      }
      return;
    }
    el.setAttribute(key, value);
  });
}

export {
  renderNode
};
//# sourceMappingURL=chunk-O7LDPTIT.js.map
