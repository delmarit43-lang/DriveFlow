import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import { AppRoutes } from "@/routes";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container #root is missing from index.html");
}

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </Providers>
    </BrowserRouter>
  </React.StrictMode>,
);
