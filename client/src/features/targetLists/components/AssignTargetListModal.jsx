import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const AssignTargetListModal = ({ isOpen, onClose, targetListId, targetListName }) => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [description, setDescription] = useState('');

  const [priority, setPriority] = useState('Medium');

  // Fetch users for assignment (mostly sales users)
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/target-lists/${targetListId}/assign`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Target list assigned successfully");
      queryClient.invalidateQueries(['target-lists']);
      queryClient.invalidateQueries(['target-list', targetListId]);
      onClose();
      setSelectedUserId('');
      setDescription('');
      setPriority('Medium');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to assign target list");
    }
  });

  const handleAssign = () => {
    if (!selectedUserId) {
      toast.error("Please select a user.");
      return;
    }
    assignMutation.mutate({ userId: selectedUserId, description, priority });
  };

  const users = usersResponse || [];
  // Filter for users that could be assigned a list
  const assignableUsers = users.filter(u => u.role === 'sales' || u.role === 'cold_mail' || u.role === 'admin' || u.role === 'superadmin');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Target List: ${targetListName}`} className="max-w-md">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
          {usersLoading ? (
            <div className="text-sm text-gray-500 py-2">Loading users...</div>
          ) : (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Select a User --</option>
              {assignableUsers.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or instructions for this list..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={assignMutation.isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assignMutation.isLoading || !selectedUserId} className="flex items-center gap-2">
            {assignMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {assignMutation.isLoading ? 'Assigning...' : 'Assign List'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignTargetListModal;
