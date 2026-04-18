import { Outlet } from "react-router-dom"
import Footer from "./Footer"
import Navbar from "./Navbar"
import ScrollToTop from "./ScrollToTop"

export default function PageLayout() {
  return (
    <div className="page-shell flex min-h-screen flex-col text-slate-950">
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-[60] rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
