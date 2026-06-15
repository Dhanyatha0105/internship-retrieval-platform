import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInternship } from '../api';
import Navbar from '../components/Navbar';
import { 
  Send, AlertCircle, Building, MapPin, 
  FileText, Code, Link, BookOpen, ShieldCheck, 
  ShieldAlert, Fingerprint, Search, Info, ArrowRight,
  RefreshCw, X
} from 'lucide-react';

const AddInternship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    skills_required: '',
    location: '',
    source_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowAnalysis(true);
    setAnalysisResult(null);

    // Artificial delay to show the scanning animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await createInternship(form);
      
      let parsedReport = {};
      try {
        parsedReport = JSON.parse(result.scam_report);
      } catch (e) {
        console.error("Failed to parse scam report", e);
      }
      
      setAnalysisResult({
        ...result,
        report: parsedReport
      });

      // Don't clear form yet, let user see results
    } catch {
      setError('Failed to post internship. Please try again.');
      setShowAnalysis(false);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'title', label: 'Job Title', icon: <BookOpen size={16} />, placeholder: 'e.g., Software Engineering Intern', type: 'input' },
    { name: 'company', label: 'Company', icon: <Building size={16} />, placeholder: 'e.g., Google', type: 'input' },
    { name: 'location', label: 'Location', icon: <MapPin size={16} />, placeholder: 'e.g., San Francisco, CA or Remote', type: 'input' },
    { name: 'skills_required', label: 'Required Skills', icon: <Code size={16} />, placeholder: 'e.g., React, Python, SQL (comma-separated)', type: 'input' },
    { name: 'source_url', label: 'Application URL', icon: <Link size={16} />, placeholder: 'https://careers.company.com/apply', type: 'input' },
    { name: 'description', label: 'Description', icon: <FileText size={16} />, placeholder: 'Describe the internship role, responsibilities, and requirements...', type: 'textarea' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-black text-white">
              Post an <span className="gradient-text">Internship</span>
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            Submit a new internship listing. Our AI will automatically check it for scam indicators.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2">
                  {field.icon}
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                    placeholder={field.placeholder}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    placeholder={field.placeholder}
                    required
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
              <Fingerprint size={14} />
              <span>Real-time AI Verification</span>
            </div>
            <p>Our multi-pillar detection engine analyzes listings for financial red flags, suspicious communication links, and compensation anomalies using advanced keyword and heuristic analysis.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2 group overflow-hidden relative"
          >
            <div className="flex items-center gap-2 z-10">
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              {loading ? 'Analyzing Listing...' : 'Post & Verify Internship'}
            </div>
          </button>
        </form>

        {/* ANALYSIS MODAL / OVERLAY */}
        {showAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-xl glass rounded-3xl overflow-hidden shadow-2xl border-white/10 flex flex-col max-h-[90vh] ${!analysisResult ? 'animate-pulse-glow' : ''}`}>
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <RefreshCw size={20} className={!analysisResult ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">AI Security Analysis</h2>
                    <p className="text-xs text-gray-500">Multidimensional credibility verification</p>
                  </div>
                </div>
                {analysisResult && (
                  <button 
                    onClick={() => {
                      setShowAnalysis(false);
                      if (!analysisResult.is_scam) navigate('/dashboard');
                    }}
                    className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!analysisResult ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-6"></div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white">Scanning for Vulnerabilities...</h3>
                      <p className="text-gray-500 text-sm max-w-sm">
                        Our AI is checking for financial red flags, suspicious communication links, and compensation anomalies.
                      </p>
                    </div>
                    
                    {/* Simulated scanning list */}
                    <div className="mt-8 w-full max-w-xs space-y-3">
                      {['Keyword Patterns', 'Metadata Analysis', 'Fraud Heuristics'].map((item, i) => (
                        <div key={item} className="flex items-center gap-3 text-xs text-gray-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                          <Search size={14} className="text-indigo-500" />
                          <span>Checking {item}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in-up">
                    {/* Result Header */}
                    <div className={`p-6 rounded-2xl mb-6 text-center border ${analysisResult.is_scam ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${analysisResult.is_scam ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {analysisResult.is_scam ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                      </div>
                      <h3 className={`text-2xl font-black mb-1 ${analysisResult.is_scam ? 'text-red-400' : 'text-emerald-400'}`}>
                        {analysisResult.is_scam ? 'SCAM DETECTED' : 'TRUST VERIFIED'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {analysisResult.is_scam 
                          ? 'This listing contains high-risk indicators and will be flagged.'
                          : 'This listing looks legitimate and has been published successfully.'}
                      </p>

                      <div className="mt-6 flex items-center justify-center gap-8">
                        <div className="text-center">
                          <div className={`text-3xl font-black ${analysisResult.is_scam ? 'text-red-400' : 'text-emerald-400'}`}>
                            {analysisResult.scam_score}%
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Risk Score</div>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-white capitalize">{analysisResult.report?.risk_level || 'Safe'}</div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Risk Level</div>
                        </div>
                      </div>
                    </div>

                    {/* Pillar Breakdown */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} />
                        Detailed Breakdown
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {analysisResult.report?.pillars?.map((pillar: any) => (
                          <div key={pillar.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{
                                  pillar.id === 'keyword_patterns' ? '🔍' :
                                  pillar.id === 'phrase_scoring' ? '💬' :
                                  pillar.id === 'credibility_heuristics' ? '🛡️' :
                                  pillar.id === 'company_metadata' ? '🏢' : '💰'
                                }</span>
                                <span className="text-sm font-semibold text-white">{pillar.name}</span>
                              </div>
                              <span className={`text-xs font-bold ${pillar.score >= 15 ? 'text-red-400' : pillar.score > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {pillar.score} pts
                              </span>
                            </div>
                            
                            {/* Findings */}
                            <div className="space-y-2">
                              {pillar.findings.length > 0 ? (
                                pillar.findings.map((f: any, idx: number) => (
                                  <div key={idx} className="flex gap-2 text-xs text-gray-400 leading-relaxed pl-2 border-l border-white/10">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${f.severity === 'critical' || f.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                    {f.text}
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-emerald-500/60 pl-2">
                                  <ShieldCheck size={12} />
                                  <span>No issues detected in this category</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {analysisResult && (
                <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                  {analysisResult.is_scam ? (
                    <>
                      <button 
                        onClick={() => setShowAnalysis(false)}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                      >
                        Edit Listing
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 py-3 px-4 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        Visit Dashboard <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      Continue to Dashboard <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddInternship;
