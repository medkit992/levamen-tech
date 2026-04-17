import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Demos", to: "/demos" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="container-custom">
        <nav className="flex h-20 items-center justify-between">
          <NavLink
            to="/"
            className="group flex items-center gap-3"
          >
            <div>
              <span className="text-2xl font-semibold tracking-tight text-slate-900">
                Levamen Tech
              </span>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {item.label}
                    <span
                      className={[
                        "absolute left-0 top-full mt-1 h-[2px] rounded-full transition-all duration-300",
                        isActive
                          ? "w-full gradient-bg opacity-100"
                          : "w-0 opacity-0",
                      ].join(" ")}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}