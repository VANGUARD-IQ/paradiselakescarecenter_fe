import { ColorModeScript } from "@chakra-ui/react"
import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { App } from "./App"
import reportWebVitals from "./reportWebVitals"
import * as serviceWorker from "./serviceWorker"
import { brandConfig, generateCSSCustomProperties } from "./brandConfig"

// Inject CSS custom properties
const style = document.createElement("style");
style.textContent = generateCSSCustomProperties();
document.head.appendChild(style);

// Set document title and meta description
document.title = brandConfig.siteName;
const metaDescription = document.querySelector("meta[name=\"description\"]");
if (metaDescription) {
  metaDescription.setAttribute("content", brandConfig.description);
}

// Set favicon if different from default
const favicon = document.querySelector("link[rel=\"icon\"]") as HTMLLinkElement;
if (favicon && brandConfig.logo.favicon !== "%PUBLIC_URL%/favicon.ico") {
  favicon.href = brandConfig.logo.favicon;
}

const container = document.getElementById("root")
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container)

console.log("Brand Config:", {
  siteName: brandConfig.siteName,
  tenantId: brandConfig.tenantId,
  colors: brandConfig.colors
});

root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode='light' />
    <App />
  </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

