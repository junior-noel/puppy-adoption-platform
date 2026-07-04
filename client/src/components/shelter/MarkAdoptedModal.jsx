import { useState } from 'react';
import api from '../../api/axios.js';

const MarkAdoptedModal = ({ puppy, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    message:            '',
    adopterDisplayName: '',
    storyPhoto:         '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/stories', {
        puppyId:            puppy._id,
        message:            form.message,
        adopterDisplayName: form.adopterDisplayName,
        storyPhoto:         form.storyPhoto || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl">Share the happy news 🎉</h2>
            <p className="text-sm text-ink/50 mt-0.5">
              Mark <strong>{puppy.name}</strong> as adopted and add a success story
            </p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Adopter's name
              <span className="text-ink/40 font-normal ml-1">(or "A loving family")</span>
            </label>
            <input
              placeholder="e.g. The Nkeng family"
              className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={form.adopterDisplayName}
              onChange={set('adopterDisplayName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Story message *
              <span className="text-ink/40 font-normal ml-1">(max 500 characters)</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={500}
              placeholder="Share how the adoption went, what the puppy is like now, or a quote from the adopter..."
              className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={form.message}
              onChange={set('message')}
            />
            <p className="text-xs text-ink/40 mt-1 text-right">{form.message.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Story photo URL
              <span className="text-ink/40 font-normal ml-1">(optional — uses puppy's main photo if blank)</span>
            </label>
            <input
              placeholder="https://..."
              className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={form.storyPhoto}
              onChange={set('storyPhoto')}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving…' : 'Mark as adopted & share story'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 border border-amber-200 rounded-lg text-sm text-ink/70 hover:bg-amber-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAdoptedModal;
