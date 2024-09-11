/* @refresh reload */
import { render } from "solid-js/web";

import "uno.css";
import "@unocss/reset/tailwind-compat.css";
import App from "./pages";

render(() => <App />, document.getElementById("root") as HTMLElement);
