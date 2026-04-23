import { Analytics } from "@vercel/analytics/react"
import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import RouteLoader from "./components/layout/RouteLoader"
import { router } from "./router"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<RouteLoader />}>
      <RouterProvider router={router} />
      <Analytics />
    </Suspense>
  </React.StrictMode>
)
