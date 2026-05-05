import { useEffect, useState, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import InternshipCard from '../components/InternshipCard';
import Navbar from '../components/Navbar';
import { fetchInternships, searchInternships } from '../api';
import type { Internship } from '../api';
import { Loader, AlertCircle, Briefcase, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'scam'>('all');

  const loadInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInternships();
      setInternships(data);
    } catch {
      setError('Failed to load internships. Make sure the backend is running on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadInternships();
      return;
    }
    try {
      setSearching(true);
      setError(null);
      const data = await searchInternships(query);
      setInternships(data);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const filtered = internships.filter((i) => {
    if (filter === 'safe') return !i.is_scam;
    if (filter === 'scam') return i.is_scam;
    return true;
  });

  const safeCount = internships.filter((i) => !i.is_scam).length;
  const scamCount = internships.filter((i) => i.is_scam).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">
            Browse <span className="gradient-text">Internships</span>
          </h1>
          <p className="text-gray-500 mt-1">Discover verified opportunities from top companies</p>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={searching} />

        {/* Stats & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
              filter === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-500 border border-white/5 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            <Briefcase size={14} />
            All ({internships.length})
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
              filter === 'safe'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-500 border border-white/5 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            <CheckCircle2 size={14} />
            Verified ({safeCount})
          </button>
          <button
            onClick={() => setFilter('scam')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
              filter === 'scam'
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'text-gray-500 border border-white/5 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            <ShieldAlert size={14} />
            Flagged ({scamCount})
          </button>

          {searchQuery && (
            <span className="ml-auto text-sm text-gray-500">
              Results for "<span className="text-indigo-400">{searchQuery}</span>"
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader className="animate-spin text-indigo-400" size={40} />
            <span className="text-gray-500 text-sm">Loading internships...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 justify-center p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg">No internships found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onDeleted={(id) =>
                  setInternships((prev) => prev.filter((i) => i.id !== id))
                }
                onUpdated={(updated) =>
                  setInternships((prev) =>
                    prev.map((i) => (i.id === updated.id ? updated : i))
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
