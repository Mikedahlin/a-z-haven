import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HavenProvider } from "@/lib/store";

const GOOGLE_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_ID}>
            <HavenProvider>
                <App />
            </HavenProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);
