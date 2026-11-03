import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./app/App";
import { StudyProvider } from "./hooks/useStudy";
import "./styles/main.css";
import "./styles/repair-shell.css";
import "./styles/studio-v7.css";
const Router=__PUBLIC_BUILD__?HashRouter:BrowserRouter;
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <StudyProvider>
        <App />
      </StudyProvider>
    </Router>
  </React.StrictMode>,
);
import './styles/production-v7.css';
