import { Mail, MapPin, MessageSquareText, Phone, Send, Globe } from "lucide-react";
import headshot from "../assets/images/andrew-headshot.jpg";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "admin@levamentech.com",
    href: "mailto:admin@levamentech.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(864) 510-8711",
    href: "tel:+18645108711",
  },
  {
    icon: Globe,
    label: "Website",
    value: "levamentech.com",
    href: "https://levamentech.com",
  },
  {
    icon: MessageSquareText,
    label: "Preferred Contact",
    value: "Email or text for fastest response",
    href: undefined,
  },
];

export default function Contact() {
  return (
    <section className="section">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="card-glass soft-shadow overflow-hidden">
              <div className="h-1 w-full gradient-bg" />

              <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[320px_1fr] md:items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-200/40 via-amber-100/30 to-blue-200/40 blur-2xl" />
                  <img
                    src={headshot}
                    alt="Portrait"
                    className="relative z-10 aspect-[4/5] w-full rounded-[2rem] object-cover soft-shadow"
                  />
                </div>

                <div>
                  <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm text-slate-600">
                    Get to know me
                  </div>

                  <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                    Let’s build something that actually feels custom.
                  </h1>

                  <p className="mt-5 text-base leading-7 text-slate-600">
                    I’m the developer behind <span className="font-medium text-slate-900">Levamen Tech</span>.
                    I focus on building modern websites that feel clean, intentional, and memorable instead of
                    recycled templates that look like everything else online.
                  </p>

                  <p className="mt-4 text-base leading-7 text-slate-600">
                    My goal is simple: give businesses a site that looks premium, works smoothly, and helps turn
                    attention into real clients.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="mailto:youremail@example.com" className="btn-primary inline-flex items-center gap-2">
                      <Send size={16} />
                      Reach Out
                    </a>

                    <a href="#contact-methods" className="btn-secondary">
                      View Contact Info
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="card soft-shadow">
                <h2 className="text-xl font-semibold text-slate-900">What I do</h2>
                <ul className="mt-4 space-y-3 text-slate-600">
                  <li>Custom business websites</li>
                  <li>Modern landing pages and demo sites</li>
                  <li>Clean UI with strong branding direction</li>
                  <li>Fast, responsive frontend builds</li>
                </ul>
              </div>

              <div className="card soft-shadow">
                <h2 className="text-xl font-semibold text-slate-900">Good fit if you want</h2>
                <ul className="mt-4 space-y-3 text-slate-600">
                  <li>A site that does not feel generic</li>
                  <li>A more premium brand presence online</li>
                  <li>Something simple, polished, and clear</li>
                  <li>A developer who can actually customize things</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div id="contact-methods" className="space-y-6">
            <div className="card-glass soft-shadow p-6 sm:p-8">
              <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm text-slate-600">
                Contact details
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Reach out directly
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-600">
                Whether you already know what you want or just want to see what is possible, I’m happy to talk through it.
              </p>

              <div className="mt-6 space-y-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;

                  const content = (
                    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Icon size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500">{method.label}</p>
                        <p className="mt-1 text-base font-medium text-slate-900">{method.value}</p>
                      </div>
                    </div>
                  );

                  if (method.href) {
                    return (
                      <a key={method.label} href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                        {content}
                      </a>
                    );
                  }

                  return <div key={method.label}>{content}</div>;
                })}
              </div>
            </div>

            <div className="card soft-shadow">
              <h2 className="text-xl font-semibold text-slate-900">What happens next</h2>

              <div className="mt-5 space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">You reach out</p>
                    <p className="text-slate-600">Tell me about your business, idea, or what you want your site to improve.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">We define the direction</p>
                    <p className="text-slate-600">I’ll help shape a design and structure that actually fits your brand.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">I build it cleanly</p>
                    <p className="text-slate-600">You get a polished site that feels intentional and ready to show off.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border border-slate-200 bg-gradient-to-r from-orange-50 via-amber-50 to-blue-50">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 soft-shadow">
                  <MapPin size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Remote-first</h3>
                  <p className="mt-2 text-slate-600">
                    I can work remotely and communicate online, which keeps things simple and flexible for most clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}