import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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

// Only render if not reloading
const root = createRoot(document.getElementById("root")!);

root.render(
  <Suspense fallback="Loading...">
    <App />
  </Suspense>
);
