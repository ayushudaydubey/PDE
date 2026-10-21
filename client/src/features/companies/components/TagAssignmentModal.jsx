import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Search, Plus, Tag as TagIcon, HelpCircle } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../../api/axios";
import { queryClient } from "../../../api/queryClient";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

const TagAssignmentModal = ({ isOpen, onClose, companyIds, initialTags = [] }) => {
  const [selectedTagNames, setSelectedTagNames] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [action, setAction] = useState("add"); // "add" or "replace"
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize selected tags if editing a single company
  useEffect(() => {
    if (isOpen) {
      if (initialTags && initialTags.length > 0) {
        setSelectedTagNames(initialTags.map(t => t.name));
        setAction("replace"); // Default to replace/manage for single company edit
      } else {
        setSelectedTagNames([]);
        setAction("add"); // Default to add for bulk
      }
      setSearchText("");
    }
  }, [isOpen, initialTags]);

  // Fetch all existing tags from backend
  const { data: tagsData, isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get("/tag").then((res) => res.data),
    enabled: isOpen,
  });

  const allTags = tagsData?.tags || tagsData || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tags based on search input
  const filteredTags = allTags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchText.toLowerCase());
    const isAlreadySelected = selectedTagNames.some(
      (name) => name.toLowerCase() === tag.name.toLowerCase()
    );
    return matchesSearch && !isAlreadySelected;
  });

  // Check if current search matches an existing tag exactly
  const hasExactMatch = allTags.some(
    (tag) => tag.name.toLowerCase() === searchText.trim().toLowerCase()
  );

  const handleAddTag = (tagName) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    
    // Check for duplicates case-insensitively
    if (selectedTagNames.some((name) => name.toLowerCase() === trimmed.toLowerCase())) {
      setSearchText("");
      setIsDropdownOpen(false);
      return;
    }

    setSelectedTagNames([...selectedTagNames, trimmed]);
    setSearchText("");
    setIsDropdownOpen(false);
  };

  const handleRemoveTag = (tagName) => {
    setSelectedTagNames(selectedTagNames.filter((name) => name !== tagName));
  };

  // Mutation to apply tags
  const applyMutation = useMutation({
    mutationFn: (payload) => api.post("/company/bulk-tag", payload),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      
      toast.success(
        companyIds.length === 1
          ? "Company tags updated successfully"
          : `Tags successfully applied to ${companyIds.length} companies`
      );
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to assign tags");
    },
  });

  const handleSave = () => {
    if (selectedTagNames.length === 0 && action === "add") {
      toast.warning("Please select or create at least one tag to add.");
      return;
    }

    applyMutation.mutate({
      companyIds,
      tagNames: selectedTagNames,
      action,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={companyIds.length === 1 ? "Manage Company Tags" : "Bulk Tag Companies"}
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            {companyIds.length === 1 ? (
              <p>You are managing tags for <strong>1 company</strong>.</p>
            ) : (
              <p>You are assigning tags to <strong>{companyIds.length} selected companies</strong>.</p>
            )}
          </div>
        </div>

        {/* Assignment Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction("add")}
              className={`p-3 text-center rounded-lg border text-sm font-medium transition ${
                action === "add"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Add to existing
            </button>
            <button
              type="button"
              onClick={() => setAction("replace")}
              className={`p-3 text-center rounded-lg border text-sm font-medium transition ${
                action === "replace"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Replace existing
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {action === "add"
              ? "Newly selected tags will be appended without affecting current company tags."
              : "All existing tags on the selected companies will be replaced by your new selection."}
          </p>
        </div>

        {/* Tag Input and Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search or Create Tags
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Type tag name..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchText.trim()) {
                  e.preventDefault();
                  // Add first filtered item, or create if none
                  if (filteredTags.length > 0) {
                    handleAddTag(filteredTags[0].name);
                  } else if (!hasExactMatch) {
                    handleAddTag(searchText);
                  }
                }
              }}
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>

          {/* Custom Dropdown list */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isLoadingTags ? (
                <div className="p-3 text-sm text-gray-500 text-center">Loading tags...</div>
              ) : (
                <>
                  {filteredTags.map((tag) => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => handleAddTag(tag.name)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                    >
                      <TagIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{tag.name}</span>
                    </button>
                  ))}

                  {/* Create On-The-Fly Option */}
                  {searchText.trim() && !hasExactMatch && (
                    <button
                      type="button"
                      onClick={() => handleAddTag(searchText)}
                      className="w-full text-left px-4 py-3 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create and add tag "{searchText.trim()}"</span>
                    </button>
                  )}

                  {filteredTags.length === 0 && (!searchText.trim() || hasExactMatch) && (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      No additional existing tags found.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Selected Tags list */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Tags ({selectedTagNames.length})
          </label>
          {selectedTagNames.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-400">
              No tags selected. Add tags using the input above.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
              {selectedTagNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                >
                  <TagIcon className="w-3 h-3 shrink-0" />
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(name)}
                    className="hover:bg-indigo-100 p-0.5 rounded-full text-indigo-500 hover:text-indigo-700 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t shrink-0">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={applyMutation.isPending}
            disabled={selectedTagNames.length === 0 && action === "add"}
          >
            Apply Tags
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TagAssignmentModal;
