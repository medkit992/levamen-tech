import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-custom">
        <div className="card-glass soft-shadow mx-auto max-w-3xl overflow-hidden border border-slate-200">
          <div className="h-1 w-full gradient-bg" />

          <div className="px-8 py-16 text-center sm:px-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              404 Error
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              This page drifted off course.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              The page you were looking for does not exist, may have moved, or has not been built yet.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/" className="btn-primary">
                Back Home
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Me
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}