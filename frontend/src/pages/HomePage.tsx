import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, Users, Sparkles, Search, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShieldCheck size={24} />,
      title: 'AI Scam Detection',
      desc: 'Advanced algorithms analyze every listing to flag potential scams before you apply.',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/25',
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Smart Ranking',
      desc: 'Internships ranked by credibility, relevance, and community trust scores.',
      gradient: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/25',
    },
    {
      icon: <Search size={24} />,
      title: 'Powerful Search',
      desc: 'Find the perfect role by company, skill, location, or keyword in milliseconds.',
      gradient: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/25',
    },
    {
      icon: <Users size={24} />,
      title: 'Community Driven',
      desc: 'Benefit from credibility scores and community verification of listings.',
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/25',
    },
    {
      icon: <Zap size={24} />,
      title: 'Real-Time Updates',
      desc: 'New listings are continuously indexed and scam-checked as they appear.',
      gradient: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/25',
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Credibility Scores',
      desc: 'Every company is scored on verification status, reviews, and online presence.',
      gradient: 'from-violet-500 to-fuchsia-600',
      shadow: 'shadow-violet-500/25',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Verified Listings' },
    { value: '98%', label: 'Scam Detection Rate' },
    { value: '50K+', label: 'Students Protected' },
    { value: '500+', label: 'Companies Verified' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles size={14} />
            AI-Powered Internship Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Find Your Dream
            <br />
            <span className="gradient-text">Internship Safely</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The only platform that scans every listing for scams and ranks opportunities by credibility — so you can focus on landing the perfect role.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2 cursor-pointer"
            >
              Start Exploring
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-2xl text-gray-300 text-lg font-semibold border border-white/10 hover:bg-white/5 hover:border-white/20 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-black gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Why <span className="gradient-text">InternSafe?</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Everything you need to find legitimate internships, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-white/10 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white shadow-lg ${f.shadow} mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to find safe internships?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of students who trust InternSafe for their career search.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/25 cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-600">
          © 2026 InternSafe. Built to protect students from internship scams.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
