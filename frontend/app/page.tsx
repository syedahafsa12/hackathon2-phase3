'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Zap, Layout, Code2, Database, Terminal } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              TaskFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="group px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 animate-fade-in border border-blue-100 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            V2.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8 animate-slide-up text-balance">
            Organize your life with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              intelligent elegance
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up [animation-delay:100ms] text-balance">
            The task management tool designed for high-performance individuals.
            Experience lightning-fast interactions, seamless keyboard shortcuts, and a UI that stays out of your way.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up [animation-delay:200ms]">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 min-w-[160px]"
            >
              Start for Free
            </Link>
            <Link
              href="/features"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 min-w-[160px]"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Badges Section */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Users', value: '10k+' },
              { label: 'Tasks Completed', value: '1M+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Team', value: 'Global' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to ship
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We've obsessed over every detail to provide you with a tool that feels like an extension of your mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Lightning Fast"
              description="Built on Next.js 14 and FastAPI for sub-100ms response times. No loading spinners, just instant action."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-500" />}
              title="Bank-Grade Security"
              description="Your data is encrypted at rest and in transit. Secure authentication powered by JWT and bcrypt."
            />
            <FeatureCard
              icon={<Layout className="w-6 h-6 text-purple-500" />}
              title="Keyboard First"
              description="Navigate your entire workflow without touching the mouse. Command K your way through tasks."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12">
            Powered by modern technology
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
            <TechBadge icon={<Code2 />} label="Next.js 14" />
            <TechBadge icon={<Terminal />} label="FastAPI" />
            <TechBadge icon={<Database />} label="PostgreSQL" />
            <TechBadge icon={<Shield />} label="TypeScript" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-blue-600 dark:bg-blue-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to boost your productivity?
              </h2>
              <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
                Join thousands of developers and creators who trust TaskFlow to organize their work.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">
          <div className="flex justify-center gap-8 mb-8">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Discord</a>
          </div>
          <p>© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function TechBadge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  )
}
