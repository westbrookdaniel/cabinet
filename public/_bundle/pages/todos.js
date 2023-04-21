// src/lib/utils.ts
var getId = () => Math.random().toString(36);
var withFormData = (cb) => (e) => {
  e.preventDefault();
  const el = e.target;
  const formData = new FormData(el);
  const data = Object.fromEntries(formData.entries());
  cb(data, el);
};

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

// src/lib/jsx-runtime.ts
function jsx(elementType, attributes) {
  if (typeof elementType === "function") {
    return { type: elementType, attributes };
  }
  return { type: elementType, attributes };
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

// src/pages/todos.tsx
var Todos = () => {
  const todos = [
    { id: getId(), text: "Handle bundling", done: true },
    { id: getId(), text: "Make reactive", done: true },
    { id: getId(), text: "Improve performance", done: false }
  ];
  const todosNode = /* @__PURE__ */ jsx(TodoList, { onToggle, todos });
  function onToggle(id) {
    const todo = todos.find((todo2) => todo2.id === id);
    if (todo)
      todo.done = !todo.done;
    const el = document.getElementById("todos");
    if (el)
      renderNode(el, todosNode);
  }
  function onAdd(text) {
    todos.unshift({ id: getId(), text, done: false });
    const el = document.getElementById("todos");
    if (el)
      renderNode(el, todosNode);
  }
  return /* @__PURE__ */ jsx("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Todos" }),
    /* @__PURE__ */ jsx(Navigation, {}),
    /* @__PURE__ */ jsx(AddTodo, { onAdd }),
    /* @__PURE__ */ jsx("div", { id: "todos", children: todosNode })
  ] });
};
function AddTodo({ onAdd }) {
  const id = getId();
  return /* @__PURE__ */ jsx(
    "form",
    {
      id,
      onsubmit: withFormData(({ newtodo: text }, el) => {
        onAdd(text);
        el.reset();
      }),
      children: /* @__PURE__ */ jsx("label", { style: "display: flex; flex-direction: column; font-size: 12px; gap: 4px;", children: [
        "New Todo",
        /* @__PURE__ */ jsx("div", { children: [
          /* @__PURE__ */ jsx("input", { name: "newtodo", style: "margin-right: 4px;" }),
          /* @__PURE__ */ jsx("button", { type: "submit", children: "Add" })
        ] })
      ] })
    }
  );
}
function TodoList({ todos, onToggle }) {
  return /* @__PURE__ */ jsx("div", { style: "margin-top: 14px; display: flex; flex-direction: column; gap: 4px;", children: todos.map((todo) => /* @__PURE__ */ jsx(TodoItem, { todo, onToggle })) });
}
function TodoItem({ todo, onToggle }) {
  return /* @__PURE__ */ jsx("label", { style: `display: block; text-decoration: ${todo.done ? "line-through" : "unset"}`, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        checked: todo.done ? true : void 0,
        onchange: () => onToggle(todo.id)
      }
    ),
    todo.text
  ] });
}
var todos_default = Todos;
export {
  todos_default as default
};
