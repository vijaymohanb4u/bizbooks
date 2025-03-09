'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'
import Head from 'next/head'
import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Basic',
    id: 'basic',
    href: '/signup?plan=basic',
    price: { monthly: 15, annual: 144 },
    description: 'Perfect for freelancers and small businesses just getting started.',
    features: [
      'Up to 50 monthly transactions',
      'Basic income and expense tracking',
      'Bank account integration',
      'Basic financial reports',
      'Invoice creation and management',
      'Mobile app access',
      'Email support',
      'Data backup',
    ],
  },
  {
    name: 'Professional',
    id: 'professional',
    href: '/signup?plan=professional',
    price: { monthly: 35, annual: 336 },
    description: 'Ideal for growing businesses with advanced accounting needs.',
    features: [
      'Up to 500 monthly transactions',
      'Advanced income and expense tracking',
      'Multiple bank account integration',
      'Advanced financial reports',
      'Custom invoice templates',
      'Bill payment and tracking',
      'Multi-currency support',
      'Priority email support',
      'Vendor management',
      'Budget planning tools',
      'Tax report generation',
      'API access',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    href: '/signup?plan=enterprise',
    price: { monthly: 75, annual: 720 },
    description: 'Advanced features for larger businesses with complex requirements.',
    features: [
      'Unlimited transactions',
      'Custom financial workflows',
      'Multiple company management',
      'Custom report builder',
      'Inventory management',
      'Project cost tracking',
      'Role-based access control',
      'Dedicated account manager',
      'Priority phone support',
      'Custom integration options',
      'Audit trail',
      'Advanced security features',
      'Data analytics',
      'Compliance reporting',
    ],
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>BizBooks – Accounting Made Beautiful</title>
        <meta
          name="description"
          content="BizBooks helps you manage your business finances effortlessly. Designed for simplicity and efficiency."
        />
      </Head>

      {/* Outer Container */}
      <div className="relative min-h-screen bg-black overflow-hidden">

        {/* Background Swirls / Arcs */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Large swirl top-left */}
          <div className="absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full border border-pink-500/20 opacity-30" />
          {/* Medium swirl top-right */}
          <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full border border-purple-500/20 opacity-20" />
          {/* Subtle swirl bottom */}
          <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full border border-pink-500/10 opacity-10" />
        </div>

        {/* Navigation */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/80 backdrop-blur-md shadow-lg shadow-pink-500/5' : ''
        }`}>
          <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold text-white tracking-tight cursor-pointer">
              BizBooks
            </div>
            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-white hover:text-pink-300 transition">
                Features
              </Link>
              <Link href="#why-us" className="text-white hover:text-pink-300 transition">
                Why Us
              </Link>
              <Link href="#pricing" className="text-white hover:text-pink-300 transition">
                Pricing
              </Link>
              <Link href="/blog" className="text-white hover:text-pink-300 transition">
                Blog
              </Link>
            </div>
            {/* Auth Links */}
            <div className="flex items-center space-x-6">
              <Link href="/login" className="text-white hover:text-pink-300 transition">
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
              >
                Join Now
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-b from-[#1e0126] via-[#42056d] to-[#19003b] pt-32 pb-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            {/* Left: Headings & CTA */}
            <div className="md:w-1/2 text-white mb-12 md:mb-0">
              {/* "New Updates" label (like in the mockup) */}
              <div className="inline-block mb-4 bg-pink-600/90 text-white text-sm px-3 py-1 rounded-full">
                New updates on BizBooks
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Your Simple Accounting <br className="hidden md:block"/> Solution for Small Businesses
              </h1>
              <p className="text-lg text-pink-100/90 mb-8 max-w-md">
                BizBooks helps you manage your business finances effortlessly.
                Designed for simplicity and efficiency.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/signup"
                  className="inline-block px-6 py-3 bg-white text-[#240046] font-semibold rounded-full hover:bg-gray-200 transition"
                >
                  Start Project
                </Link>
                <Link
                  href="#features"
                  className="inline-block px-6 py-3 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-700 transition"
                >
                  View Features
                </Link>
              </div>
            </div>

            {/* Right: Floating Card (like "Your Balance" or "20k+ Users" in the design) */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-[340px] h-[200px] bg-[#2f0743]/80 rounded-2xl shadow-lg p-6 text-white backdrop-blur-sm">
                <h2 className="text-sm uppercase tracking-wider text-pink-300 mb-2">
                  Active Users
                </h2>
                <p className="text-4xl font-bold mb-2">20k+</p>
                <p className="text-sm text-pink-100/80">Currently using BizBooks worldwide</p>
                {/* Simple progress bar to mimic the "Balance" card style */}
                <div className="mt-4">
                  <div className="w-full bg-white/10 h-2 rounded-full">
                    <div className="bg-pink-500 h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="mt-2 text-xs text-pink-100/70">75% monthly growth</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 bg-[#0a0a0a]" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-white mb-16 tracking-tight">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Financial Transactions',
                  description: 'Easily track income and expenses.',
                },
                {
                  title: 'Invoice Generation',
                  description: 'Create professional invoices quickly.',
                },
                {
                  title: 'Customer Management',
                  description: 'Keep track of all contacts and transactions.',
                },
                {
                  title: 'Insightful Reports',
                  description: 'Generate clear reports to understand your financial health.',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 bg-white/5 backdrop-blur-md rounded-xl hover:bg-white/10 transition-all hover:scale-105 shadow-lg cursor-pointer"
                >
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-pink-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-pink-100/90 group-hover:text-pink-50 transition-colors">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-24 bg-gradient-to-r from-[#1f002c] to-[#3d005c]" id="why-us">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-white mb-16 tracking-tight">
              Why Choose BizBooks?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'User-Friendly Interface',
                  description: 'Navigate easily and quickly manage your finances.',
                },
                {
                  title: 'Reliable Data Management',
                  description: 'Secure, reliable, and fast MySQL database.',
                },
                {
                  title: 'Cross-Platform',
                  description: 'Available on Windows, Mac, and Linux.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group p-8 bg-white/5 backdrop-blur-md rounded-xl hover:bg-white/10 transition-all hover:scale-105 shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-pink-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-pink-100/90 group-hover:text-pink-50 transition-colors">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-24 bg-gradient-to-b from-[#19003b] to-[#0a0a0a]" id="pricing">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-pink-100/90">
                Choose the perfect plan for your business needs
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative flex flex-col rounded-2xl ${
                    tier.mostPopular
                      ? 'bg-pink-600/10 border border-pink-500/20'
                      : 'bg-white/5 border border-white/10'
                  } p-8 backdrop-blur-sm hover:scale-105 transition-all duration-300`}
                >
                  {tier.mostPopular && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-pink-600 px-3 py-1 text-center text-sm font-medium text-white">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                    <p className="mt-2 text-pink-100/80">{tier.description}</p>
                  </div>

                  <div className="mb-6">
                    <p className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">
                        ${tier.price.monthly}
                      </span>
                      <span className="ml-2 text-pink-100/80">/month</span>
                    </p>
                    <p className="mt-1 text-sm text-pink-100/60">
                      ${tier.price.annual} billed annually (save ${tier.price.monthly * 12 - tier.price.annual})
                    </p>
                  </div>

                  <ul className="mb-8 space-y-4 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckIcon className="h-5 w-5 flex-shrink-0 text-pink-400" />
                        <span className="ml-3 text-pink-100/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tier.href}
                    className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                      tier.mostPopular
                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Get started with {tier.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-24">
              <h3 className="text-2xl font-bold text-center text-white mb-12">
                Frequently Asked Questions
              </h3>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white">Can I change plans later?</h4>
                  <p className="mt-2 text-pink-100/80">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white">Is there a free trial?</h4>
                  <p className="mt-2 text-pink-100/80">
                    Yes, all plans come with a 14-day free trial. No credit card required to start.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white">What payment methods do you accept?</h4>
                  <p className="mt-2 text-pink-100/80">
                    We accept all major credit cards, PayPal, and bank transfers for annual plans.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white">Do you offer refunds?</h4>
                  <p className="mt-2 text-pink-100/80">
                    Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="py-24 bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-4xl font-bold text-center text-white mb-12 tracking-tight">
                Get Started
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="text-center group">
                  <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-pink-300 transition-colors">
                    Login
                  </h3>
                  <p className="mb-8 text-pink-100/90 group-hover:text-pink-50 transition-colors">
                    Already a member? Quickly access your account by logging in.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-8 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-all hover:scale-105"
                  >
                    Login Now
                  </Link>
                </div>
                <div className="text-center group">
                  <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-pink-300 transition-colors">
                    Signup
                  </h3>
                  <p className="mb-8 text-pink-100/90 group-hover:text-pink-50 transition-colors">
                    New to BizBooks? Sign up now to simplify your accounting process.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-block px-8 py-3 bg-white text-[#240046] rounded-full hover:bg-gray-200 transition-all hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-[#19003b] text-center">
          <p className="text-lg text-pink-100 hover:text-white transition-colors cursor-pointer">
            BizBooks – Accounting made easy.
          </p>
        </footer>
      </div>
    </>
  )
}
