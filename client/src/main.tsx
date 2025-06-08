import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { i18nReady } from "./lib/i18n";
import { router } from "./router";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  void i18nReady.then(() => {
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>,
    );
  });
}
