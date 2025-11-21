import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { ToastContainer } from "react-toastify"
import App from "@/App"
import { store } from "@/store"
import "@/index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </Provider>
)