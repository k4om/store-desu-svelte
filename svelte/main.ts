import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";
import * as api from "$lib/api.svelte.ts";

const app = mount(App, {
  target: document.getElementById("app") as Element,
});

export default app;
