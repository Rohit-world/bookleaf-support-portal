import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import router from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
     <ToastContainer
  position="top-center"
  autoClose={2200}
  newestOnTop
  hideProgressBar
  closeButton={false}
  pauseOnHover
  draggable={false}
  className="!top-5"
  toastClassName="!rounded-xl !border !border-slate-200 !bg-white !shadow-lg !px-4 !py-3 !text-sm !font-medium !text-slate-800"
/>

      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
