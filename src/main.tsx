// import "./i18n/index";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Suspense } from "react";

createRoot(document.getElementById("root")!).render(
    <Suspense fallback="Loading...">
        <App />
    </Suspense>
);
