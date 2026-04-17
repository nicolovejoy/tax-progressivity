import React from "react";
import { createRoot } from "react-dom/client";
import TaxProgressivity from "../tax-progressivity.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TaxProgressivity />
  </React.StrictMode>,
);
