import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { Suspense } from "react";

// Monkey-patch to prevent Google Translate from crashing React
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console && console.warn) {
        console.warn('Node.prototype.removeChild: Child is not a child of this node. Ignoring.');
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments as any);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) {
        console.warn('Node.prototype.insertBefore: Reference node is not a child of this node. Appending instead.');
      }
      if (this instanceof Element) {
        this.appendChild(newNode);
        return newNode;
      }
      return newNode; // Should probably handle this better, but prevents crash
    }
    return originalInsertBefore.apply(this, arguments as any);
  };
}

// Silence console output in production builds
if (import.meta.env.PROD) {
  // Replace console methods with no-ops to avoid leaking logs in deployed app
  // Keep this explicit to avoid tree-shaking surprises
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => { };
  console.log = noop as any;
  console.info = noop as any;
  console.warn = noop as any;
  console.error = noop as any;
  console.debug = noop as any;
}

// Only render if not reloading
const root = createRoot(document.getElementById("root")!);

// Re-apply Google Translate language after reload
// Re-apply Google Translate language after reload
const gtLang = localStorage.getItem('gt_lang');
if (gtLang) {
  const i = setInterval(() => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      if (select.value !== gtLang) {
        select.value = gtLang;
        select.dispatchEvent(new Event('change'));
      }
      clearInterval(i);
    }
  }, 300);
}

root.render(
  <Suspense fallback="Loading...">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Suspense>
);
