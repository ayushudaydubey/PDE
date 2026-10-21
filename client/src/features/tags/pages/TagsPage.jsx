import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../api/axios';
import { queryClient } from '../../../api/queryClient';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TagsPage = () => {
  const [newTagName, setNewTagName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // 1. Fetch tags data
  const { data: tagsData, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tag').then((res) => res.data),
  });

  const tags = tagsData?.tags || tagsData || [];

  // 2. Create Tag Mutation
  const createMutation = useMutation({
    mutationFn: (name) => api.post('/tag', { name }),
    onSuccess: () => {
      toast.success('Tag created successfully');
      setNewTagName('');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.error;
      if (error.response?.status === 400) {
        toast.warning(message || 'This tag already exists');
      } else {
        toast.error(message || 'Failed to create tag');
      }
    },
  });

  // 3. Delete Tag Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tag/${id}`),
    onSuccess: () => {
      toast.success('Tag deleted successfully');
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete tag');
      setConfirmDeleteId(null);
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createMutation.mutate(newTagName.trim());
  };

  // High-contrast, easily visible color palette
  const getTagColorClass = (str) => {
  const colorVariants = [
      // Blue glow shadow
      'border-blue-400 text-blue-700 shadow-[5px_5px_10px_rgba(59,130,246,0.12)] hover:border-blue-400 hover:shadow-[0_4px_14px_rgba(59,130,246,0.2)]',
      // Emerald glow shadow
      'border-emerald-400 text-emerald-700 shadow-[5px_5px_10px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:shadow-[0_4px_14px_rgba(16,185,129,0.2)]',
      // Purple glow shadow
      'border-purple-400 text-purple-700 shadow-[5px_5px_10px_rgba(139,92,246,0.12)] hover:border-purple-400 hover:shadow-[0_4px_14px_rgba(139,92,246,0.2)]',
      // Amber glow shadow
      'border-amber-400 text-amber-700 shadow-[5px_5px_10px_rgba(245,158,11,0.12)] hover:border-amber-400 hover:shadow-[0_4px_14px_rgba(245,158,11,0.2)]',
      // Rose glow shadow
      'border-rose-400 text-rose-700 shadow-[5px_5px_10px_rgba(244,63,94,0.12)] hover:border-rose-400 hover:shadow-[0_4px_14px_rgba(244,63,94,0.2)]',
      // Indigo glow shadow
      'border-indigo-400 text-indigo-700 shadow-[5px_5px_10px_rgba(99,102,241,0.12)] hover:border-indigo-400 hover:shadow-[0_4px_14px_rgba(99,102,241,0.2)]',
      // Cyan glow shadow
      'border-cyan-400 text-cyan-700 shadow-[5px_5px_10px_rgba(6,182,212,0.12)] hover:border-cyan-400 hover:shadow-[0_4px_14px_rgba(6,182,212,0.2)]',
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorVariants.length;
    return colorVariants[index];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tags Management</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage tags for your companies.</p>
      </div>

      {/* Creation form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-xl">
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              label="New Tag Name"
              placeholder="e.g., Enterprise, Tech, Hot Lead"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={createMutation.isPending} disabled={!newTagName.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </form>
      </div>

      {/* Tags section container */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">
          All System Tags
        </h2>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 w-28 bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tags.length === 0 && (
          <p className="text-sm text-gray-500 italic py-2">No tags found.</p>
        )}

        {/* Fluid dynamic cards wrap arrangement */}
        {!isLoading && tags.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            {tags.map((tag) => {
              const isConfirming = confirmDeleteId === tag._id;
              const colorClass = getTagColorClass(tag.name || '');
              
              const formattedDate = tag.createdAt 
                ? new Date(tag.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : 'No date';

              return (
                <div
                  key={tag._id}
                  className={`h-14 inline-flex items-center gap-4 px-4 rounded-xl border font-medium text-sm shadow-sm transition-all duration-150 whitespace-nowrap ${
                    isConfirming 
                      ? 'bg-red-50 border-red-400 text-red-900 ring-1 ring-red-500/20' 
                      : colorClass
                  }`}
                >
                  {/* Default State */}
                  {!isConfirming ? (
                    <>
                      {/* Left: Tag Name & Date */}
                      <div className="flex flex-col justify-center">
                        <span className="font-semibold text-gray-900 text-sm leading-tight">
                          {tag.name}
                        </span>
                        <span className="text-[10px] opacity-60 font-semibold mt-0.5">
                          Created {formattedDate}
                        </span>
                      </div>

                      {/* Right: Trash Button */}
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(tag._id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-black/5 transition-colors focus:outline-none"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    /* Inline Confirmation State (Retains the exact same height) */
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-red-800">
                        Delete "{tag.name}"?
                      </span>
                      
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(tag._id)}
                          disabled={deleteMutation.isPending}
                          className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none disabled:opacity-50"
                          title="Confirm Delete"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;