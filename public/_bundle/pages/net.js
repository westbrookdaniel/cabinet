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

// src/lib/utils.ts
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

// src/pages/net.tsx
function set(id, text) {
  const el = document.getElementById(id);
  if (el)
    el.innerText = text;
}
var Net = () => {
  async function handleGet() {
    if (typeof document === "undefined")
      return;
    set("get-res", "Loading...");
    const res = await fetch("/api/net");
    const json = await res.json();
    set("get-res", JSON.stringify(json));
  }
  handleGet();
  return /* @__PURE__ */ jsx("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Network Behaviours" }),
    /* @__PURE__ */ jsx(Navigation, {}),
    /* @__PURE__ */ jsx("div", { style: "display: flex; flex-direction: column; gap: 32px;", children: [
      /* @__PURE__ */ jsx("div", { children: [
        /* @__PURE__ */ jsx("p", { children: "GET Request" }),
        /* @__PURE__ */ jsx("div", { style: "display: flex; gap: 8px; margin-top: 16px;", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onclick: handleGet,
              children: "Go!"
            }
          ),
          /* @__PURE__ */ jsx("div", { id: "get-res" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "form",
        {
          onsubmit: withFormData(async (data, el) => {
            set("post-res", "Loading...");
            const res = await fetch("/api/net", postJson(data));
            const json = await res.json();
            set("post-res", JSON.stringify(json));
            if (res.status === 200)
              el.reset();
          }),
          children: [
            /* @__PURE__ */ jsx("p", { children: "POST Request" }),
            /* @__PURE__ */ jsx("label", { style: "display: flex; flex-direction: column; font-size: 12px; gap: 4px; width: 150px;", children: [
              "Name",
              /* @__PURE__ */ jsx("input", { name: "name", style: "margin-right: 4px;" })
            ] }),
            /* @__PURE__ */ jsx("div", { style: "display: flex; gap: 8px; margin-top: 16px;", children: [
              /* @__PURE__ */ jsx("button", { children: "Go!" }),
              " ",
              /* @__PURE__ */ jsx("div", { id: "post-res" })
            ] })
          ]
        }
      )
    ] })
  ] });
};
var net_default = Net;
export {
  net_default as default
};
