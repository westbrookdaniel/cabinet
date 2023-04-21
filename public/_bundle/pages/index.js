// src/lib/jsx-runtime.ts
function jsx(elementType, attributes) {
  if (typeof elementType === "function") {
    return { type: elementType, attributes };
  }
  return { type: elementType, attributes };
}

// src/components/TodoItem.tsx
function TodoItem({ todo, onToggle }) {
  return /* @__PURE__ */ jsx("div", { children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        checked: todo.done ? true : void 0,
        onclick: onToggle
      }
    ),
    /* @__PURE__ */ jsx("span", { children: todo.text })
  ] });
}

// src/lib/utils.ts
var getId = () => Math.random().toString(36);

// src/components/Counter.tsx
function render(id, contents) {
  const el = document.getElementById(id);
  if (el)
    el.innerHTML = contents;
}
function Counter() {
  const id = getId();
  const count = {
    _value: 0,
    get value() {
      return this._value;
    },
    set value(value) {
      this._value = value;
      render(id, `Count: ${this._value}`);
    }
  };
  return /* @__PURE__ */ jsx("div", { children: [
    /* @__PURE__ */ jsx("button", { onclick: () => count.value--, children: "-" }),
    /* @__PURE__ */ jsx("span", { id, style: "margin-left: 8px; margin-right: 8px;", children: [
      "Count: ",
      count.value
    ] }),
    /* @__PURE__ */ jsx("button", { style: "margin-right: 16px;", onclick: () => count.value++, children: "+" })
  ] });
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

// src/pages/index.tsx
var Home = () => {
  const todos = [
    { id: 1, text: "Handle bundling", done: true },
    { id: 2, text: "Make reactive", done: false },
    { id: 3, text: "Improve performance", done: false }
  ];
  const onToggle = (id) => {
    const found = todos.find((t) => t.id === id);
    if (found)
      found.done = !found.done;
    replaceJson(todos);
  };
  const replaceJson = (todos2) => {
    const json = document.getElementById("json");
    if (json)
      json.innerHTML = JSON.stringify(todos2, void 0, 2);
  };
  return /* @__PURE__ */ jsx("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Home" }),
    /* @__PURE__ */ jsx(Navigation, {}),
    todos.map((todo) => /* @__PURE__ */ jsx(
      TodoItem,
      {
        todo,
        onToggle: () => onToggle(todo.id)
      }
    )),
    /* @__PURE__ */ jsx("pre", { id: "json", style: "margin-top: 10px;", children: JSON.stringify(todos, void 0, 2) }),
    /* @__PURE__ */ jsx("div", { style: "margin-top: 10px;", children: /* @__PURE__ */ jsx(Counter, {}) }),
    /* @__PURE__ */ jsx("div", { style: "margin-top: 10px;", children: /* @__PURE__ */ jsx(Counter, {}) })
  ] });
};
var pages_default = Home;
export {
  pages_default as default
};
