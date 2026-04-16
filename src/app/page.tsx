import { CheckCircle2, ChevronRight, LayoutDashboard, ShieldCheck, HeartPulse, RefreshCw, Sparkles } from 'lucide-react'
import Link from 'next/link'
import CircularTestimonials from '@/components/CircularTestimonials'
import DisplayCards from '@/components/ui/display-cards'

const featureCards = [
  {
    icon: <CheckCircle2 className="size-5 text-[var(--color-brand-primary)]" />,
    title: "Secure Checklists",
    description: "Keep daily routines organized with clear, actionable task lists for every patient.",
    date: "Core",
    iconClassName: "bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]",
    titleClassName: "text-[var(--color-brand-primary)]",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <RefreshCw className="size-5 text-[var(--color-brand-primary)]" />,
    title: "Real-time Coverage",
    description: "Updates sync instantly across all devices. Always know exactly what has been done.",
    date: "Sync",
    iconClassName: "bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]",
    titleClassName: "text-[var(--color-brand-primary)]",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <ShieldCheck className="size-5 text-[var(--color-brand-primary)]" />,
    title: "Tenant Isolation",
    description: "Data is strictly siloed per facility with enterprise-grade Row Level Security.",
    date: "Enterprise",
    iconClassName: "bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]",
    titleClassName: "text-[var(--color-brand-primary)]",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
  },
];

const testimonialsData = [
  {
    quote: "Kyte has completely revolutionized how we manage our facility. The onboarding was seamless and our staff loves it.",
    name: "Sarah Jenkins",
    designation: "Facility Director at Sunrise Care",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    quote: "We've tried other software, but nothing matches the simplicity and power of Kyte. Highly recommended.",
    name: "Dr. Michael Chen",
    designation: "Chief Medical Officer",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    quote: "The task management features ensure nothing falls through the cracks. It gives families peace of mind.",
    name: "Elena Rodriguez",
    designation: "Head Nurse",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] font-body text-[var(--color-brand-primary)]">

      {/* Floating Header Actions */}
      <div className="absolute top-0 right-0 p-6 z-50 w-full flex justify-end">
        <div className="flex items-center gap-4">
          <Link href="/providers" className="text-white text-sm font-medium opacity-90 hover:opacity-100 transition-opacity drop-shadow">
            Providers
          </Link>
          <Link href="/login" className="bg-[var(--color-brand-accent)] text-white text-sm font-bold px-6 py-2.5 rounded shadow-sm hover:opacity-90 transition-opacity">
            Log In
          </Link>
          <Link href="/login" className="bg-white text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)] text-sm font-bold px-6 py-2.5 rounded shadow-sm hover:bg-gray-50 transition-colors">
            Get Started
          </Link>
        </div>
      </div>

      <main>
        {/* Modern Hero Section with Full-Width Video */}
        <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden flex flex-col justify-end">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Foreground content - Bottom Left aligned */}
          <div className="w-full relative z-20 px-6 pb-12 lg:px-12 lg:pb-16 max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide bg-[var(--color-brand-accent)] text-white mb-6 shadow-sm">
                <HeartPulse className="w-4 h-4" />
                <span>Care System 2.0</span>
              </div>
              <h1 className="text-[52px] font-heading font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-lg">
                Manage your facility with precision and ease.
              </h1>

              <p className="text-xl text-white opacity-95 mb-10 leading-relaxed font-body drop-shadow-md">
                The care management platform designed for modern assisted living. Streamline tasks, organize patient records, and empower your staff.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/login" className="btn-primary w-full sm:w-auto px-8 py-3.5 font-bold text-[16px] flex items-center justify-center gap-2 shadow-xl">
                  Start free trial <ChevronRight className="w-5 h-5" />
                </Link>
                <p className="text-sm text-white font-body drop-shadow-md font-medium">No credit card required</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[var(--color-brand-surface)] border-y border-[var(--color-brand-border)] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left: Heading */}
              <div className="pt-8 lg:pt-16 lg:sticky lg:top-24">
                <span className="text-xl font-bold uppercase tracking-widest text-[var(--color-brand-accent)] mb-4 block">Platform Features</span>
                <h2 className="text-[40px] font-heading font-extrabold text-[var(--color-brand-primary)] mb-5 tracking-tight leading-[1.1]">
                  Everything you need to run your facility.
                </h2>
                <p className="text-lg opacity-70 font-body leading-relaxed mb-8">
                  Powerful tools hidden behind a simple, intuitive interface that your whole team will love.
                </p>
                <p className="text-sm font-body opacity-50 italic">Click a feature card to learn more →</p>
              </div>

              {/* Right: Display Cards deck */}
              <div className="flex items-center justify-start lg:justify-center py-8 overflow-visible" style={{ minHeight: '440px' }}>
                <DisplayCards cards={featureCards} />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-[var(--color-brand-bg)] border-b border-[var(--color-brand-border)] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-[36px] font-heading font-bold text-[var(--color-brand-primary)] mb-4 tracking-tight">Trusted by leading facilities.</h2>
              <p className="text-lg opacity-70 font-body">See what our partners are saying about the Care System.</p>
            </div>
            <div className="flex justify-center flex-col items-center">
              <CircularTestimonials
                testimonials={testimonialsData}
                colors={{
                  name: "var(--color-brand-primary)",
                  designation: "gray",
                  testimony: "var(--color-brand-primary)",
                  arrowBackground: "var(--color-brand-accent)",
                  arrowForeground: "#ffffff",
                  arrowHoverBackground: "#25b393"
                }}
              />
            </div>
          </div>
        </section>

      </main>

      {/* Structured Footer */}
      <footer className="bg-[var(--color-brand-bg)] py-12 border-t border-[var(--color-brand-border)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <img
              src="https://cdn.prod.website-files.com/60870ff4852ead369670e13e/60870ff4852eadba2b70e3bd_logotest.svg"
              alt="Kyte Logo"
              className="h-8 w-auto mb-6 filter invert"
              style={{ filter: "brightness(0) saturate(100%) invert(21%) sepia(23%) saturate(1039%) hue-rotate(178deg) brightness(97%) contrast(90%)" }}
            />
            <p className="font-body opacity-60 max-w-sm text-[16px] leading-relaxed">
              Empowering small businesses and care facilities with tools that make operations effortless.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 tracking-wide">Product</h4>
            <ul className="space-y-3 font-body opacity-70 text-[16px]">
              <li><a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 tracking-wide">Company</h4>
            <ul className="space-y-3 font-body opacity-70 text-[16px]">
              <li><a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body opacity-50 text-[14px]">© 2026 Kyte. All rights reserved.</p>
          <div className="flex gap-6 font-body text-[14px] opacity-60">
            <a href="#" className="hover:text-[var(--color-brand-accent)]">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-brand-accent)]">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
