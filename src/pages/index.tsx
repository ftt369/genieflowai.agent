import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { monthlyPlans } from '../data/subscriptionPlans';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/auth/signup?email=${encodeURIComponent(email)}`);
  };

  const handlePricingClick = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header/Navigation */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary-500">GenieAgent</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/features" className="hover:text-primary-300 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-primary-300 transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-primary-300 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary-300 transition-colors">Contact</Link>
        </nav>
        <div className="flex space-x-4">
          <Link href="/auth/signin" className="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-4 py-2 bg-primary-500 rounded-md hover:bg-primary-600 transition-colors">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-blue-400">
          AI-Powered Agents for Your Business
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl">
          GenieAgent helps you automate tasks, analyze data, and interact with customers using state-of-the-art AI technology.
        </p>
        <form onSubmit={handleSignUp} className="w-full max-w-md flex flex-col md:flex-row gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary-500 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Get Started
          </button>
        </form>
        <p className="mt-4 text-gray-400">Free 14-day trial. No credit card required.</p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Features That Transform Your Business</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gray-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom AI Agents</h3>
              <p className="text-gray-300">Create and customize AI agents tailored to your specific business needs without coding knowledge.</p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Knowledge Base</h3>
              <p className="text-gray-300">Upload your documents and data to train AI agents with your business knowledge for accurate responses.</p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Workflow Automation</h3>
              <p className="text-gray-300">Automate repetitive tasks and complex workflows to increase productivity and reduce errors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
            Choose the plan that works best for you and your team. All plans include a 14-day free trial.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {monthlyPlans.slice(0, 3).map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-primary-500 text-center py-2">
                    <span className="text-xs font-bold uppercase tracking-wide">Most Popular</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-gray-400 mt-2 h-12">{plan.description}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">${(plan.price / 100).toFixed(2)}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(0, 5).map((feature) => (
                      <li key={feature.id} className="flex items-start">
                        <div className="mr-3 mt-1">
                          {feature.included ? (
                            <CheckIcon className="h-5 w-5 text-primary-400" />
                          ) : (
                            <span className="h-5 w-5 block text-center text-gray-500">-</span>
                          )}
                        </div>
                        <span className={feature.included ? "text-gray-300" : "text-gray-500"}>
                          {feature.name}
                          {feature.limit && feature.included && ` (${feature.limit})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 border-t border-gray-700">
                  <button
                    onClick={handlePricingClick}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      plan.popular 
                        ? 'bg-primary-500 hover:bg-primary-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } transition-colors`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={handlePricingClick}
              className="px-8 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Pricing Options
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Customers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-400 text-sm">Marketing Director, TechCorp</p>
                </div>
              </div>
              <p className="text-gray-300">
                "GenieAgent has transformed how we handle customer inquiries. Our response time decreased by 80% while maintaining high-quality interactions."
              </p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">David Martinez</h4>
                  <p className="text-gray-400 text-sm">CTO, FinanceApp</p>
                </div>
              </div>
              <p className="text-gray-300">
                "The custom AI agents have been a game-changer for our data analysis. We're getting insights in minutes that used to take days."
              </p>
            </div>
            
            <div className="bg-gray-700 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Emily Chen</h4>
                  <p className="text-gray-400 text-sm">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-300">
                "As a small business, GenieAgent has allowed us to provide enterprise-level customer service without hiring a large team. Worth every penny."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-r from-primary-500/20 to-blue-500/20 rounded-2xl p-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using GenieAgent to automate tasks and delight customers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/signup" className="px-8 py-4 bg-primary-500 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/contact" className="px-8 py-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                Contact Sales
              </Link>
            </div>
            <p className="mt-6 text-gray-400">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/enterprise" className="text-gray-400 hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/customers" className="text-gray-400 hover:text-white transition-colors">Customers</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-gray-400">© 2023 GenieAgent. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 