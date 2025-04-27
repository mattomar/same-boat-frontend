import React from "react";
import { createRoot } from "react-dom/client"; // Import createRoot from react-dom/client
import { StrictMode } from "react";

import App from "./App"; // Import the main App component

// Get the root element where the React app will be rendered
 
createRoot(document.getElementById("app")).render(
    <StrictMode>
      <App />
     </StrictMode>
  );