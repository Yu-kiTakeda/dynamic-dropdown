import React from "react";
import { createRoot } from "react-dom/client";
import Config from "./config";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import "../../css/config.scss";

((PLUGIN_ID) => {
  const root = createRoot(document.getElementById('root'));
  root.render(<React.StrictMode><Config pluginId={PLUGIN_ID} /></React.StrictMode>);
})(kintone.$PLUGIN_ID);

