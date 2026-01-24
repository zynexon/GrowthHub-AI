import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const [selectedFeature, setSelectedFeature] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: '🎯',
      title: 'Lead Scoring',
      description: 'Automatically score and prioritize leads to focus on high-value opportunities',
      details: 'Upload your leads via CSV and our platform automatically scores each lead based on multiple factors including engagement, company size, and behavior patterns. Get instant insights on which leads to prioritize, reducing time spent on cold prospects and maximizing conversion rates.'
    },
    {
      icon: '❤️',
      title: 'Customer Health Monitoring',
      description: 'Predict churn and identify at-risk customers before it\'s too late',
      details: 'Monitor customer health scores in real-time with predictive analytics. Track engagement metrics, usage patterns, and satisfaction indicators. Receive alerts for at-risk customers and identify expansion opportunities before your competitors do.'
    },
    {
      icon: '📈',
      title: 'Campaign & ROI Tracking',
      description: 'Track marketing campaigns, measure ROI, and optimize spend',
      details: 'Manage all your marketing campaigns in one place. Track performance metrics, calculate ROI, and identify which channels drive the most revenue. Deduplicate campaigns automatically and get actionable insights to optimize your marketing budget.'
    },
    {
      icon: '🏷️',
      title: 'Data Labeling Platform',
      description: 'Create high-quality training datasets with distributed workforce',
      details: 'Upload your datasets and label them efficiently with our intuitive interface. Perfect for creating training data for AI models. Track progress, export labeled data, and collaborate with your team to ensure high-quality annotations.'
    },
    {
      icon: '👥',
      title: 'Talent Marketplace',
      description: 'Manage your team, track performance, and assign work efficiently',
      details: 'Build your talent registry with skill-based profiles. Track team member performance with task completion metrics. Assign work, monitor availability, and manage your distributed workforce all in one platform.'
    },
    {
      icon: '💼',
      title: 'Job Management',
      description: 'Post jobs, track applications, and hire faster with intelligent automation',
      details: 'Simple task tracker for company work. Create jobs, assign team members, set due dates, and track progress from open to completed. Get insights on job completion rates and team productivity with built-in analytics.'
    }
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500K+', label: 'Leads Scored' },
    { value: '98%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'AI Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-purple-500/10' 
          : 'bg-gray-900/80 backdrop-blur-lg'
      } border-b border-purple-500/20`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110 group-hover:rotate-6">
                G
              </div>
              <span className="text-white font-bold text-xl group-hover:text-purple-300 transition-colors">GrowthHub AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors px-4 py-2 hover:scale-105 transform duration-200">
                Sign In
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        {/* Full-screen video background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/assets/hero-pendulum.mp4" type="video/mp4" />
          </video>
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-purple-900/80 to-gray-900/85"></div>
          
          {/* Theme color overlay blend */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 mix-blend-overlay"></div>
        </div>

        {/* Animated accent elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Revenue Intelligence
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-gradient-x">
              Meets Talent Execution
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The only platform that combines AI-powered revenue operations with intelligent talent marketplace. 
            Score leads, monitor customer health, and hire top talent—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              to="/signup" 
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-2xl shadow-purple-500/50 hover:scale-105 hover:shadow-purple-500/70 relative overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link 
              to="/login" 
              className="group px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 hover:scale-105"
            >
              <span className="inline-flex items-center gap-2">
                See How It Works →
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group cursor-default"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20" id="features" data-animate>
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full">
              <span className="text-purple-300 text-sm font-semibold">✨ POWERFUL FEATURES</span>
            </div>
            <h2 className={`text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              One Platform,{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                Unlimited Possibilities
              </span>
            </h2>
            <p className={`text-xl text-gray-400 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Everything you need to scale revenue and talent operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                data-animate
                id={`feature-${index}`}
                className={`group relative p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden ${
                  isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:via-pink-600/5 group-hover:to-blue-600/5 transition-all duration-500 rounded-3xl"></div>
                
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                </div>

                <div className="relative z-10">
                  {/* Icon with background glow */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative text-6xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-2xl">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>

                  {/* Learn more link */}
                  <button 
                    onClick={() => setSelectedFeature(feature)}
                    className="flex items-center gap-2 text-purple-400 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 cursor-pointer hover:text-purple-300"
                  >
                    <span className="text-sm">Learn more</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Animated corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16" data-animate id="features-cta">
            <div className={`transition-all duration-1000 ${isVisible['features-cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-gray-400 mb-6">Ready to transform your operations?</p>
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" id="how-it-works" data-animate>
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 transition-all duration-1000 ${isVisible['how-it-works'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Get Started in Minutes
            </h2>
            <p className={`text-xl text-gray-400 transition-all duration-1000 delay-200 ${isVisible['how-it-works'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Simple setup, powerful results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30"></div>
            
            <div className="text-center relative" id="step-1" data-animate>
              <div className={`w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-purple-500/50 transition-all duration-1000 ${isVisible['step-1'] ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'}`}>
                1
              </div>
              <h3 className={`text-2xl font-bold text-white mb-4 transition-all duration-1000 delay-200 ${isVisible['step-1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Connect Your Data
              </h3>
              <p className={`text-gray-400 transition-all duration-1000 delay-300 ${isVisible['step-1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Upload leads, import customer data, or connect your existing CRM in seconds
              </p>
            </div>

            <div className="text-center relative" id="step-2" data-animate>
              <div className={`w-20 h-20 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-pink-500/50 transition-all duration-1000 delay-200 ${isVisible['step-2'] ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'}`}>
                2
              </div>
              <h3 className={`text-2xl font-bold text-white mb-4 transition-all duration-1000 delay-400 ${isVisible['step-2'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Automate Your Workflow
              </h3>
              <p className={`text-gray-400 transition-all duration-1000 delay-500 ${isVisible['step-2'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Smart automation scores leads, tracks customer health, and manages your team
              </p>
            </div>

            <div className="text-center relative" id="step-3" data-animate>
              <div className={`w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/50 transition-all duration-1000 delay-400 ${isVisible['step-3'] ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'}`}>
                3
              </div>
              <h3 className={`text-2xl font-bold text-white mb-4 transition-all duration-1000 delay-600 ${isVisible['step-3'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Scale Revenue
              </h3>
              <p className={`text-gray-400 transition-all duration-1000 delay-700 ${isVisible['step-3'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Close more deals, retain customers, and build your dream team faster
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div 
            id="cta" 
            data-animate
            className={`bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl shadow-purple-500/50 relative overflow-hidden transition-all duration-1000 ${isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-shift opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-purple-100 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Join thousands of companies using GrowthHub AI to scale faster
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link 
                  to="/signup" 
                  className="group px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:scale-105 hover:shadow-xl"
                >
                  <span className="inline-flex items-center gap-2">
                    Get Started
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link 
                  to="/login" 
                  className="group px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white hover:scale-105"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modal */}
      {selectedFeature && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedFeature(null)}
        >
          <div 
            className="relative bg-gradient-to-br from-gray-900 via-[#2d1b4e]/50 to-gray-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20">
                {selectedFeature.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-3xl font-bold text-white mb-4">
              {selectedFeature.title}
            </h3>

            {/* Short description */}
            <p className="text-gray-400 text-lg mb-6">
              {selectedFeature.description}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6"></div>

            {/* Detailed description */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">How it works</h4>
              <p className="text-gray-300 leading-relaxed">
                {selectedFeature.details}
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex gap-4">
              <Link
                to="/signup"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-lg shadow-purple-500/30"
              >
                Get Started
              </Link>
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-6 py-3 border border-gray-700 hover:border-purple-500/50 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                G
              </div>
              <span className="text-white font-bold">GrowthHub AI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 GrowthHub AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
