import { useState } from 'react';
import type { Internship, InternshipFormData } from '../api';
import { updateInternship, deleteInternship } from '../api';
import {
  AlertTriangle, CheckCircle, Clock, MapPin, Building, ExternalLink,
  Star, Trash2, Pencil, X, Save, HelpCircle,
} from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  onDeleted?: (id: number) => void;
  onUpdated?: (updated: Internship) => void;
}

const InternshipCard = ({ internship, onDeleted, onUpdated }: InternshipCardProps) => {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<InternshipFormData>({
    title: internship.title,
    company: internship.company,
    description: internship.description,
    skills_required: internship.skills_required,
    location: internship.location,
    source_url: internship.source_url,
  });

  // 3-tier badge logic
  const isVerified = !internship.is_scam && internship.credibility_score != null;
  const isScam = internship.is_scam;
  // unverified = not scam but no credibility score

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteInternship(internship.id);
      onDeleted?.(internship.id);
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateInternship(internship.id, form);
      onUpdated?.(updated);
      setEditing(false);
    } catch {
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Edit mode
  if (editing) {
    return (
      <div className="relative rounded-2xl p-6 bg-slate-800/70 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Pencil size={16} className="text-indigo-400" />
            Edit Internship
          </h3>
          <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'title', label: 'Title', icon: <Pencil size={13} /> },
            { name: 'company', label: 'Company', icon: <Building size={13} /> },
            { name: 'location', label: 'Location', icon: <MapPin size={13} /> },
            { name: 'skills_required', label: 'Skills (comma-separated)', icon: <Star size={13} /> },
            { name: 'source_url', label: 'URL', icon: <ExternalLink size={13} /> },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">{f.icon} {f.label}</label>
              <input
                type="text"
                name={f.name}
                value={form[f.name as keyof InternshipFormData]}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-white/10 hover:text-white hover:border-white/20 cursor-pointer"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          💡 Scam detection will re-run automatically when you save.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative group rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
        isScam
          ? 'bg-red-950/30 border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10'
          : 'bg-slate-800/50 border-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white truncate">{internship.title}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Building size={14} className="text-indigo-400 shrink-0" />
              <span className="font-medium text-gray-300">{internship.company}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-purple-400 shrink-0" />
              {internship.location}
            </span>
          </div>
        </div>

        {/* 3-tier Badge */}
        {isScam ? (
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle size={13} />
            Scam
          </span>
        ) : isVerified ? (
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle size={13} />
            Verified
          </span>
        ) : (
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <HelpCircle size={13} />
            Unverified
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
        {internship.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {internship.skills_required.split(',').map((skill, i) => (
          <span
            key={i}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
          >
            {skill.trim()}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(internship.posted_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {internship.credibility_score && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              <span className={`font-semibold ${
                internship.credibility_score.score > 8
                  ? 'text-emerald-400'
                  : internship.credibility_score.score > 6
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}>
                {internship.credibility_score.score}/10
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Edit button */}
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
            title="Edit"
          >
            <Pencil size={14} />
          </button>

          {/* Delete button */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? '...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}

          {/* Apply link */}
          <a
            href={internship.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            Apply <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Scam Warning & Findings */}
      {internship.is_scam && (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <div>
                <strong className="text-red-400 text-sm block mb-1">Scam Detection Report</strong>
                <p>
                  This listing has a scam probability score of <span className="text-white font-bold">{internship.scam_score}%</span>. 
                  Our analysis identified several high-risk indicators.
                </p>
              </div>
            </div>

            {/* Structured Findings (Answers) */}
            <div className="space-y-2 pl-6 border-l border-red-500/20">
              {(() => {
                try {
                  const report = JSON.parse(internship.scam_report || '{}');
                  const findings = report.pillars?.flatMap((p: any) => 
                    p.findings.map((f: any) => ({ ...f, pillarName: p.name }))
                  ) || [];

                  if (findings.length === 0) return <p className="italic text-gray-500 text-[10px]">Detailed findings unavailable.</p>;

                  return findings.slice(0, 5).map((finding: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                         finding.severity === 'critical' ? 'bg-red-500' : 
                         finding.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                       }`} />
                       <span className="leading-tight">
                         <span className="text-gray-500 mr-1">[{finding.pillarName}]</span>
                         {finding.text}
                       </span>
                    </div>
                  ));
                } catch (e) {
                  return <p className="italic text-gray-500 text-[10px]">Error parsing scam report.</p>;
                }
              })()}
            </div>
          </div>
          <p className="text-[10px] text-gray-600 italic px-1">
            ⚠️ Proceed with extreme caution. Never share bank details or pay any fees for internships.
          </p>
        </div>
      )}
    </div>
  );
};

export default InternshipCard;
