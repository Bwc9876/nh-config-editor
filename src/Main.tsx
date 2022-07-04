import React from "react";
import ReactDOM from "react-dom/client";
import Wrapper from "./Wrapper";

const root = document.getElementById("root");

document.oncontextmenu = () => false;

if (root === null) {
    console.error("Catastrophic Failure");
} else {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <Wrapper />
        </React.StrictMode>
    );
}
