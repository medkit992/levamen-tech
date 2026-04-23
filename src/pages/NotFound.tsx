import { Link } from "react-router-dom"
import Seo from "../components/seo/Seo"

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The requested Levamen Tech page could not be found."
        noindex
      />
      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
        <div className="section-panel mx-auto max-w-4xl px-6 py-14 text-center sm:px-12 sm:py-16">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-slate-400">
            404 error
          </p>

          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            This page drifted off course.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            The page you were looking for does not exist, may have moved, or has
            not been built yet.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-primary">
              Back home
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact me
            </Link>
          </div>
        </div>
        </div>
      </section>
    </>
  )
}
