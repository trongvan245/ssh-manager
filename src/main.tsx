import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@mantine/core/styles.css";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { TerminalProvider } from "./hooks/TerminalContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TerminalProvider>
        <App />
      </TerminalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
