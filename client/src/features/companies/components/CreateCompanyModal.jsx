import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Building2, Mail, Phone, Globe, Calendar, Tag as TagIcon,
  Plus, Trash2, X, ExternalLink
} from "lucide-react";

import api from "../../../api/axios";
import { queryClient } from "../../../api/queryClient";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

const CreateCompanyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
    industry: "",
    companyOwnerName: "",
    turnover: "",
    source: "manual",
    description: "",
    socialMedia: {
      facebook: [],
      youtube: [],
      instagram: [],
      x: [],
      linkedin: [],
    },
    contacts: [],
    contactPages: [],
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        company_name: "",
        website: "",
        email: "",
        phone: "",
        city: "",
        country: "India",
        industry: "",
        companyOwnerName: "",
        turnover: "",
        source: "manual",
        description: "",
        socialMedia: {
          facebook: [],
          youtube: [],
          instagram: [],
          x: [],
          linkedin: [],
        },
        contacts: [],
        contactPages: [],
      });
      setSelectedTags([]);
      setSearchText("");
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get("/tag").then((res) => res.data),
    enabled: isOpen,
  });

  const allTags = tagsData?.tags || tagsData || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTags = allTags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchText.toLowerCase());
    const isAlreadySelected = selectedTags.some(
      (name) => name.toLowerCase() === tag.name.toLowerCase()
    );
    return matchesSearch && !isAlreadySelected;
  });

  const hasExactMatch = allTags.some(
    (tag) => tag.name.toLowerCase() === searchText.trim().toLowerCase()
  );

  const handleAddTag = (tagName) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    if (selectedTags.some((name) => name.toLowerCase() === trimmed.toLowerCase())) {
      setSearchText("");
      setIsDropdownOpen(false);
      return;
    }
    setSelectedTags([...selectedTags, trimmed]);
    setSearchText("");
    setIsDropdownOpen(false);
  };

  const handleRemoveTag = (tagName) => {
    setSelectedTags(selectedTags.filter((name) => name !== tagName));
  };

  // Contacts
  const handleAddContact = () => {
    if (formData.contacts.length >= 5) {
      toast.warning("Maximum 5 contacts allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", position: "", email: "", contactNumber: "" }]
    }));
  };

  const handleRemoveContact = (index) => {
    setFormData(prev => {
      const newContacts = [...prev.contacts];
      newContacts.splice(index, 1);
      return { ...prev, contacts: newContacts };
    });
  };

  const handleContactChange = (index, field, value) => {
    setFormData(prev => {
      const newContacts = [...prev.contacts];
      newContacts[index][field] = value;
      return { ...prev, contacts: newContacts };
    });
  };

  // Contact Pages
  const handleContactPageAdd = () => {
    if (formData.contactPages.length >= 5) {
      toast.warning("Maximum 5 contact page links allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      contactPages: [...prev.contactPages, { name: "", url: "" }]
    }));
  };

  const handleContactPageRemove = (index) => {
    setFormData(prev => {
      const newPages = [...prev.contactPages];
      newPages.splice(index, 1);
      return { ...prev, contactPages: newPages };
    });
  };

  const handleContactPageChange = (index, field, value) => {
    setFormData(prev => {
      const newPages = [...prev.contactPages];
      newPages[index] = { ...newPages[index], [field]: value };
      return { ...prev, contactPages: newPages };
    });
  };

  // Social Media
  const handleSocialAdd = (platform) => {
    setFormData(prev => {
      const currentLinks = prev.socialMedia[platform] || [];
      if (currentLinks.length >= 3) {
        toast.warning(`Maximum 3 ${platform} links allowed`);
        return prev;
      }
      return {
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: [...currentLinks, { url: "", username: "" }]
        }
      };
    });
  };

  const handleSocialRemove = (platform, index) => {
    setFormData(prev => {
      const currentLinks = [...(prev.socialMedia[platform] || [])];
      currentLinks.splice(index, 1);
      return {
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: currentLinks
        }
      };
    });
  };

  const handleSocialChange = (platform, index, field, value) => {
    setFormData(prev => {
      const currentLinks = [...(prev.socialMedia[platform] || [])];
      currentLinks[index] = { ...currentLinks[index], [field]: value };
      return {
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: currentLinks
        }
      };
    });
  };

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/company", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create company");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.company_name.trim()) {
      toast.error("Company Name is required");
      return;
    }
    if (formData.phone && formData.contacts && formData.contacts.length > 0) {
      for (const c of formData.contacts) {
        if (c.contactNumber && c.contactNumber === formData.phone) {
          toast.error("Employee contact number cannot be same as company contact number");
          return;
        }
      }
    }

    const payload = {
      ...formData,
      tags: selectedTags,
      contactPages: formData.contactPages.filter(p => p.url && p.url.trim()),
      contacts: formData.contacts.filter(c => c.contactNumber && c.contactNumber.trim()),
    };

    createMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Company Details" className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pr-2 select-none">
        
        {/* Company Name Header Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl uppercase shadow-inner shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name *</label>
            <input
              type="text"
              required
              placeholder="Enter company business name..."
              value={formData.company_name}
              onChange={e => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-base outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Contact Channels Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Channels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col p-3 rounded-lg border border-gray-100 bg-gray-50/30">
              <span className="block text-xs text-gray-500 font-medium mb-1">Email Address</span>
              <input type="email" placeholder="company@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border border-gray-300 rounded-lg p-2 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="flex flex-col p-3 rounded-lg border border-gray-100 bg-gray-50/30">
              <span className="block text-xs text-gray-500 font-medium mb-1">Phone Connection</span>
              <input type="text" placeholder="e.g. +91 9876543210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border border-gray-300 rounded-lg p-2 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="flex flex-col p-3 rounded-lg border border-indigo-100 bg-indigo-50/20 sm:col-span-2">
              <span className="block text-xs text-indigo-600 font-medium mb-1">Official Website</span>
              <input type="text" placeholder="https://example.com" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="border border-gray-300 rounded-lg p-2 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
          </div>
        </div>

        {/* Contact Page Links */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Page Links</h3>
            {formData.contactPages.length < 5 && (
              <Button type="button" onClick={handleContactPageAdd} size="sm" variant="secondary"><Plus className="w-3 h-3 mr-1" /> Add Link</Button>
            )}
          </div>
          <div className="space-y-2">
            {formData.contactPages.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Page Name (e.g. Support)" value={p.name} onChange={e => handleContactPageChange(i, 'name', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm flex-1 outline-none focus:border-indigo-500" />
                <input type="text" placeholder="URL" value={p.url} onChange={e => handleContactPageChange(i, 'url', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm flex-1 outline-none focus:border-indigo-500" />
                <button type="button" onClick={() => handleContactPageRemove(i)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {formData.contactPages.length === 0 && <p className="text-xs text-gray-400 italic">No contact page links added.</p>}
          </div>
        </div>

        {/* Location & Business Details Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location & Business Identifiers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">City</span>
              <input type="text" placeholder="Ahmedabad" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="border border-gray-300 rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Country</span>
              <input type="text" placeholder="India" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="border border-gray-300 rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Company Owner Name</span>
              <input type="text" placeholder="Owner / Founder Name" value={formData.companyOwnerName} onChange={e => setFormData({ ...formData, companyOwnerName: e.target.value })} className="border border-gray-300 rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Industry</span>
              <input type="text" placeholder="IT, Manufacturing, etc." value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="border border-gray-300 rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Turnover</span>
              <input type="number" placeholder="500000" value={formData.turnover} onChange={e => setFormData({ ...formData, turnover: e.target.value })} className="border border-gray-300 rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500 bg-white" />
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Source</span>
              <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} className="border border-gray-300 rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500 bg-white">
                <option value="manual">Manual</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="google_sheet">Google Sheet</option>
                <option value="mca">MCA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee Contacts Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Contacts</h3>
            {formData.contacts.length < 5 && (
              <Button type="button" onClick={handleAddContact} size="sm" variant="secondary"><Plus className="w-3.5 h-3.5 mr-1" /> Add Contact</Button>
            )}
          </div>
          <div className="space-y-3">
            {formData.contacts.map((contact, i) => (
              <div key={i} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 items-center">
                <input type="text" placeholder="Name" value={contact.name} onChange={e => handleContactChange(i, 'name', e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500 bg-white" />
                <input type="text" placeholder="Position" value={contact.position} onChange={e => handleContactChange(i, 'position', e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500 bg-white" />
                <input type="email" placeholder="Email" value={contact.email} onChange={e => handleContactChange(i, 'email', e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500 bg-white" />
                <input type="text" placeholder="Phone *" required value={contact.contactNumber} onChange={e => handleContactChange(i, 'contactNumber', e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500 bg-white" />
                <button type="button" onClick={() => handleRemoveContact(i)} className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {formData.contacts.length === 0 && <p className="text-xs text-gray-400 italic">No employee contacts added.</p>}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Social Media</h3>
          <div className="space-y-4">
            {['facebook', 'youtube', 'instagram', 'x', 'linkedin'].map((platform) => (
              <div key={platform} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{platform === 'x' ? 'X (Twitter)' : platform}</span>
                  {(formData.socialMedia[platform] || []).length < 3 && (
                    <Button type="button" onClick={() => handleSocialAdd(platform)} size="sm" variant="secondary"><Plus className="w-3 h-3 mr-1" /> Add Link</Button>
                  )}
                </div>
                <div className="space-y-2">
                  {(formData.socialMedia[platform] || []).map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="URL" value={link.url} onChange={e => handleSocialChange(platform, i, 'url', e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1 outline-none focus:border-indigo-500 bg-white" />
                      <input type="text" placeholder="Username (Optional)" value={link.username} onChange={e => handleSocialChange(platform, i, 'username', e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm w-1/3 outline-none focus:border-indigo-500 bg-white" />
                      <button type="button" onClick={() => handleSocialRemove(platform, i)} className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {(!formData.socialMedia[platform] || formData.socialMedia[platform].length === 0) && (
                    <p className="text-xs text-gray-400 italic">No {platform === 'x' ? 'X' : platform} links added.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Associated Tags Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Tags</h3>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Type tag name..."
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setIsDropdownOpen(true); }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm bg-white h-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchText.trim()) {
                  e.preventDefault();
                  if (filteredTags.length > 0) handleAddTag(filteredTags[0].name);
                  else if (!hasExactMatch) handleAddTag(searchText);
                }
              }}
            />
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button key={tag._id} type="button" onClick={() => handleAddTag(tag.name)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0">
                    <span>{tag.name}</span>
                  </button>
                ))}
                {searchText.trim() && !hasExactMatch && (
                  <button type="button" onClick={() => handleAddTag(searchText)} className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 font-medium">
                    <Plus className="w-3.5 h-3.5" /><span>Create "{searchText.trim()}"</span>
                  </button>
                )}
                {filteredTags.length === 0 && (!searchText.trim() || hasExactMatch) && (
                  <div className="p-3 text-xs text-gray-500 text-center">No matching tags.</div>
                )}
              </div>
            )}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 p-2 border border-gray-200 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
                {selectedTags.map((name) => (
                  <span key={name} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                    <span>{name}</span>
                    <button type="button" onClick={() => handleRemoveTag(name)} className="hover:bg-indigo-100 p-0.5 rounded-full text-indigo-500 hover:text-indigo-700"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Description */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Description / Notes</h3>
          <textarea
            rows="3"
            placeholder="Add manual notes or summary..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white/90 backdrop-blur py-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-100">
            {createMutation.isPending ? "Creating..." : "Create Company"}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default CreateCompanyModal;