import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api';
import Navbar from '../components/Navbar';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('user_id', String(res.user_id));
        setSuccess(`Welcome back, ${res.username}!`);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await registerUser(username, email, password);
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Something went wrong');
      } else {
        setError('Connection failed. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-lg" />
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8">
              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-800/60 p-1 mb-8">
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LogIn size={16} />
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UserPlus size={16} />
                  Register
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {mode === 'login'
                  ? 'Sign in to access your dashboard'
                  : 'Join InternSafe to find safe internships'}
              </p>

              {/* Messages */}
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-1.5 block">Username</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        placeholder="johndoe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 cursor-pointer text-sm"
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
                </button>
              </form>

              {mode === 'login' && (
                <div className="mt-6 p-3 rounded-xl bg-slate-800/40 border border-white/5 text-xs text-gray-500">
                  <p className="font-medium text-gray-400 mb-1">Demo credentials:</p>
                  <p>Email: <span className="text-indigo-400">test@example.com</span></p>
                  <p>Password: <span className="text-indigo-400">password123</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
