import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ToastContainer, Slide, Bounce, Flip, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { queryClient } from "./api/queryClient";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      <ToastContainer
        position="bottom-left" // different direction
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        transition={Bounce} // Slide | Bounce | Flip | Zoom
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-progress"
      />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;