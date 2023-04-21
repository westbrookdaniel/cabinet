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

// src/lib/history.ts
var popStateEvent = "popstate";
var beforeUnloadEvent = "beforeunload";
var beforeUnloadListener = (event) => {
  event.preventDefault();
  return event.returnValue = "";
};
var stopBlocking = () => {
  removeEventListener(beforeUnloadEvent, beforeUnloadListener, {
    capture: true
  });
};
function createHistory(opts) {
  let currentLocation = opts.getLocation();
  let unsub = () => {
  };
  let listeners = /* @__PURE__ */ new Set();
  let blockers = [];
  let queue = [];
  const tryFlush = () => {
    if (blockers.length) {
      blockers[0]?.(tryFlush, () => {
        blockers = [];
        stopBlocking();
      });
      return;
    }
    while (queue.length) {
      queue.shift()?.();
    }
    onUpdate();
  };
  const queueTask = (task) => {
    queue.push(task);
    tryFlush();
  };
  const onUpdate = () => {
    currentLocation = opts.getLocation();
    listeners.forEach((listener) => listener());
  };
  return {
    get location() {
      return currentLocation;
    },
    listen: (cb) => {
      if (listeners.size === 0) {
        unsub = opts.listener(onUpdate);
      }
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0) {
          unsub();
        }
      };
    },
    // deno-lint-ignore no-explicit-any
    push: (path, state) => {
      queueTask(() => {
        opts.pushState(path, state);
      });
    },
    // deno-lint-ignore no-explicit-any
    replace: (path, state) => {
      queueTask(() => {
        opts.replaceState(path, state);
      });
    },
    go: (index) => {
      queueTask(() => {
        opts.go(index);
      });
    },
    back: () => {
      queueTask(() => {
        opts.back();
      });
    },
    forward: () => {
      queueTask(() => {
        opts.forward();
      });
    },
    createHref: (str) => opts.createHref(str),
    block: (cb) => {
      blockers.push(cb);
      if (blockers.length === 1) {
        addEventListener(beforeUnloadEvent, beforeUnloadListener, {
          capture: true
        });
      }
      return () => {
        blockers = blockers.filter((b) => b !== cb);
        if (!blockers.length) {
          stopBlocking();
        }
      };
    }
  };
}
function createBrowserHistory() {
  const getHref = () => `${window.location.pathname}${window.location.hash}${window.location.search}`;
  const createHref = (path) => path;
  const getLocation = () => parseLocation(getHref(), history.state);
  return createHistory({
    getLocation,
    listener: (onUpdate) => {
      addEventListener(popStateEvent, onUpdate);
      return () => {
        removeEventListener(popStateEvent, onUpdate);
      };
    },
    pushState: (path, state) => {
      window.history.pushState(
        { ...state, key: getKey() },
        "",
        createHref(path)
      );
    },
    replaceState: (path, state) => {
      window.history.replaceState(
        { ...state, key: getKey() },
        "",
        createHref(path)
      );
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    go: (n) => window.history.go(n),
    createHref: (path) => createHref(path)
  });
}
function parseLocation(href, state) {
  const hashIndex = href.indexOf("#");
  const searchIndex = href.indexOf("?");
  return {
    href,
    pathname: href.substring(
      0,
      hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : href.length
    ),
    hash: hashIndex > -1 ? href.substring(hashIndex, searchIndex) : "",
    search: searchIndex > -1 ? href.substring(searchIndex) : "",
    state
  };
}
function getKey() {
  return Math.random().toString(36);
}

// src/lib/router.ts
function createClientRouter(root) {
  const history2 = createBrowserHistory();
  history2.listen(async () => {
    const path = history2.location.pathname;
    const bundlePath = `/_bundle/pages${path === "/" ? "/index" : path}.js`;
    const page = (await import(bundlePath)).default;
    renderNode(root, { type: page, attributes: {} });
  });
  document.querySelectorAll("a").forEach((el) => hijackLink(history2, el));
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      switch (mutation.type) {
        case "childList":
          mutation.addedNodes.forEach((el) => {
            if (el instanceof HTMLElement) {
              if (el instanceof HTMLAnchorElement)
                hijackLink(history2, el);
              el.querySelectorAll("a").forEach((el2) => hijackLink(history2, el2));
            }
          });
          break;
        case "attributes": {
          const el = mutation.target;
          if (el instanceof HTMLElement) {
            if (el instanceof HTMLAnchorElement)
              hijackLink(history2, el);
            el.querySelectorAll("a").forEach((el2) => hijackLink(history2, el2));
          }
        }
      }
    });
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true
  });
  return history2;
}
var existingRouterListeners = /* @__PURE__ */ new WeakMap();
var hijackLink = (history2, el) => {
  if (existingRouterListeners.has(el)) {
    const [eventType, listener] = existingRouterListeners.get(el);
    el.removeEventListener(eventType, listener);
    existingRouterListeners.delete(el);
  }
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const href = el.getAttribute("href");
    if (!el.target && href?.startsWith("/")) {
      history2.push(href);
    }
  });
};

// src/lib/hydrate.ts
function hydrate(component) {
  const root = document.getElementById("_root");
  if (!root)
    throw new Error("Root element not found");
  renderNode(root, { type: component, attributes: {} });
  window.router = createClientRouter(root);
}
export {
  hydrate as default
};
