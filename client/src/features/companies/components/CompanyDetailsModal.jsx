import React, { useState, useEffect } from "react";
import {
  Building2, Mail, Phone, Globe, Calendar, Tag as TagIcon,
  Copy, Check, ExternalLink, Edit2, Clock, CheckCircle2,
  XCircle, Circle, Save, FileText, Plus, Trash2, X
} from "lucide-react";
import { useCompany } from "../hooks/useCompany";
import { useAuth } from "../../../hooks/useAuth";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { openMailComposer } from "../../../utils/mailUtils";
import { getLeadStatusIcon } from "../../../utils/statusColors";

const CompanyDetailsModal = ({ isOpen, onClose, companyId, onEditTags }) => {
  const { data: company, isLoading, isError } = useCompany(companyId);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState(null);

  const role = user?.role || "sales";
  const canEditTags = role === "admin" || role === "sales";
  const canUpdateDetails = role === "admin" || role === "sales";

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || "",
        website: company.website || "",
        email: company.email || "",
        phone: company.phone || "",
        city: company.city || "",
        country: company.country || "",
        industry: company.industry || "",
        companyOwnerName: company.companyOwnerName || "",
        turnover: company.turnover || "",
        source: company.source || "manual",
        description: company.description || "",
        socialMedia: {
          facebook: Array.isArray(company.socialMedia?.facebook) ? company.socialMedia.facebook : [],
          youtube: Array.isArray(company.socialMedia?.youtube) ? company.socialMedia.youtube : [],
          instagram: Array.isArray(company.socialMedia?.instagram) ? company.socialMedia.instagram : [],
          x: Array.isArray(company.socialMedia?.x) ? company.socialMedia.x : [],
          linkedin: Array.isArray(company.socialMedia?.linkedin) ? company.socialMedia.linkedin : [],
        },
        contacts: company.contacts ? JSON.parse(JSON.stringify(company.contacts)) : [],
        contactPages: Array.isArray(company.contactPages) ? JSON.parse(JSON.stringify(company.contactPages)) : []
      });
    }
  }, [company, isEditing]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/company/${companyId}`, data);
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries(["company", companyId]);
      queryClient.invalidateQueries(["companies"]);
      const fileId = updated?.fileId || company?.fileId;
      if (fileId) {
        queryClient.invalidateQueries({ queryKey: ["file", fileId, "companies"] });
        queryClient.invalidateQueries({ queryKey: ["fileTags", fileId] });
      }
      toast.success("Company updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update company");
    }
  });

  const handleUpdateLeadStatus = (status) => {
    updateCompanyMutation.mutate({ leadStatus: { status } });
  };

  const handleSave = () => {
    updateCompanyMutation.mutate(formData);
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const handleContactPageAdd = () => {
    if (formData.contactPages.length >= 5) {
      toast.warning("Maximum 5 contact page links allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      contactPages: [...(prev.contactPages || []), { name: "", url: "" }]
    }));
  };

  const handleContactPageRemove = (index) => {
    setFormData(prev => {
      const newPages = [...(prev.contactPages || [])];
      newPages.splice(index, 1);
      return { ...prev, contactPages: newPages };
    });
  };

  const handleContactPageChange = (index, field, value) => {
    setFormData(prev => {
      const newPages = [...(prev.contactPages || [])];
      newPages[index] = { ...newPages[index], [field]: value };
      return { ...prev, contactPages: newPages };
    });
  };

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

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Details" className="max-w-5xl">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading company details...</p>
        </div>
      ) : isError || !company ? (
        <div className="py-8 text-center text-red-500">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to retrieve company details. Please try again.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 className="w-32 h-32 transform translate-x-4 translate-y-2" />
            </div>

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
                  <Building2 className="w-8 h-8 text-indigo-300" />
                </div>
                <div className="flex-1 max-w-lg">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                      className="text-xl font-bold bg-white/20 border border-white/30 rounded px-2 py-1 w-full text-white outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold tracking-tight">{company.company_name}</h2>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="Industry"
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 outline-none w-32"
                      />
                    ) : (
                      company.industry ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/10 capitalize">
                          {company.industry}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60">
                          Unknown Industry
                        </span>
                      )
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 capitalize">
                      Source: {company.source?.replace("_", " ") || "manual"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {canUpdateDetails && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "default" : "ghost"}
                    className={!isEditing ? "bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:text-white" : "bg-white text-indigo-900 hover:bg-gray-100"}
                  >
                    {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                    {isEditing ? "Cancel Edit" : "Edit Details"}
                  </Button>
                )}
                {canEditTags && !isEditing && (
                  <Button
                    onClick={() => onEditTags(company)}
                    variant="ghost"
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:text-white shrink-0"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Tags
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Meta & Lead Status */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identifiers & Meta</h3>

              <div className="flex items-center gap-3 py-1 border-b border-gray-50 pb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400">Imported / Created On</span>
                  <span className="font-medium text-gray-700 text-sm">
                    {company.createdAt ? new Date(company.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lead Status</span>
                  <div className="flex items-center gap-2">
                    {getLeadStatusIcon(company.leadStatus?.status)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {company.leadStatus?.status === 'none' ? 'New' : company.leadStatus?.status || 'New'}
                    </span>
                  </div>
                </div>

                {company.targetLists && company.targetLists.length > 0 && (
                  <div className="pt-2 border-t border-gray-50">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Lists</span>
                    <div className="flex flex-wrap gap-2">
                      {company.targetLists.map(tl => (
                        <span key={tl._id} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                          {tl.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.fileId && (
                  <div className="pt-2 border-t border-gray-50">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Source File</span>
                    <span className="text-sm font-medium text-gray-700">
                      {company.fileId.originalName || company.fileId.fileName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Company Description</h3>
              <div className="flex-1 flex flex-col gap-3">
                {isEditing ? (
                  <textarea
                    className="w-full flex-1 min-h-[100px] border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Company description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                ) : (
                  <textarea
                    className="w-full flex-1 min-h-[100px] border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none resize-none bg-gray-50/50"
                    placeholder="Add manual description or notes about this company..."
                    value={company.description || ""}
                    disabled
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Channels</h3>
              {!isEditing && (
                <Button onClick={() => openMailComposer(company.email, company.company_name, user)} variant="outline" size="sm">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Send Email
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                <span className="block text-xs text-gray-400 mb-1">Email Address</span>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <div className="flex justify-between items-center">
                    {company.email ? (
                      <button
                        type="button"
                        onClick={() => openMailComposer(company.email, company.company_name, user)}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-sm truncate bg-transparent border-none p-0 cursor-pointer text-left"
                      >
                        {company.email}
                      </button>
                    ) : (
                      <span className="font-semibold text-gray-400 text-sm truncate">None</span>
                    )}
                    {company.email && (
                      <button onClick={() => handleCopy(company.email, "email")} className="p-1 text-gray-400 hover:text-blue-500"><Copy className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                <span className="block text-xs text-gray-400 mb-1">Phone Connection</span>
                {isEditing ? (
                  <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 text-sm truncate">{company.phone || "None"}</span>
                    {company.phone && (
                      <button onClick={() => handleCopy(company.phone, "phone")} className="p-1 text-gray-400 hover:text-blue-500"><Copy className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="flex flex-col p-3 rounded-lg border border-indigo-50 bg-indigo-50/20 sm:col-span-2">
                <span className="block text-xs text-indigo-500/70 mb-1">Official Website</span>
                {isEditing ? (
                  <input type="text" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <div className="flex justify-between items-center">
                    {company.website ? (
                      <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:underline text-sm truncate">
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">None</span>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Pages */}
              <div className="flex flex-col p-3 rounded-lg shadow-sm shadow-gray-100  bg-white sm:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Contact Page Links</span>
                  {isEditing && formData.contactPages.length < 5 && (
                    <Button type="button" onClick={handleContactPageAdd} size="sm" variant="secondary"><Plus className="w-3 h-3 mr-1" /> Add Link</Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.contactPages || []).map((p, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" placeholder="Page Name" value={p.name} onChange={e => handleContactPageChange(i, 'name', e.target.value)} className="border rounded p-1.5 text-sm flex-1 outline-none focus:border-indigo-500" />
                        <input type="text" placeholder="URL" value={p.url} onChange={e => handleContactPageChange(i, 'url', e.target.value)} className="border rounded p-1.5 text-sm flex-1 outline-none focus:border-indigo-500" />
                        <button type="button" onClick={() => handleContactPageRemove(i)} className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {(formData.contactPages || []).length === 0 && <p className="text-xs text-gray-400">No contact page links added.</p>}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {(company.contactPages || []).length > 0 ? (
                      company.contactPages.map((p, i) => {
                        const url = p && p.url && typeof p.url === 'string' && p.url.trim() ? (p.url.startsWith('http') ? p.url : `https://${p.url}`) : null;
                        if (!url) return null;
                        const name = p.name || `Contact Page ${i + 1}`;
                        return (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md font-medium transition-colors border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 h-8 px-3 text-sm">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            {name}
                          </a>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400">No contact page links available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location Cards */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">City</span>
                {isEditing ? (
                  <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700 capitalize">{company.city || "-"}</span>
                )}
              </div>
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Country</span>
                {isEditing ? (
                  <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700 capitalize">{company.country || "-"}</span>
                )}
              </div>
            </div>

            {/* Business Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Company Owner Name</span>
                {isEditing ? (
                  <input type="text" value={formData.companyOwnerName || ""} onChange={e => setFormData({ ...formData, companyOwnerName: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" placeholder="Owner / Founder Name" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{company.companyOwnerName || "-"}</span>
                )}
              </div>
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Industry</span>
                {isEditing ? (
                  <input type="text" value={formData.industry || ""} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" placeholder="Industry Sector" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{company.industry || "-"}</span>
                )}
              </div>
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Turnover</span>
                {isEditing ? (
                  <input type="number" value={formData.turnover || ""} onChange={e => setFormData({ ...formData, turnover: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" placeholder="Annual Turnover" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{company.turnover || "-"}</span>
                )}
              </div>
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Source</span>
                {isEditing ? (
                  <select value={formData.source || "manual"} onChange={e => setFormData({ ...formData, source: e.target.value })} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500">
                    <option value="manual">Manual</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="google_sheet">Google Sheet</option>
                    <option value="mca">MCA</option>
                  </select>
                ) : (
                  <span className="text-sm font-semibold text-gray-700 capitalize">{company.source || "manual"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Employee Contacts Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Contacts</h3>
              {isEditing && formData.contacts.length < 5 && (
                <Button type="button" onClick={handleAddContact} size="sm" variant="secondary"><Plus className="w-3.5 h-3.5 mr-1" /> Add Contact</Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                {formData.contacts.map((contact, i) => (
                  <div key={i} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border relative">
                    <input type="text" placeholder="Name" value={contact.name} onChange={e => handleContactChange(i, 'name', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Position" value={contact.position} onChange={e => handleContactChange(i, 'position', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <input type="email" placeholder="Email" value={contact.email} onChange={e => handleContactChange(i, 'email', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Phone" value={contact.contactNumber} onChange={e => handleContactChange(i, 'contactNumber', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <button type="button" onClick={() => handleRemoveContact(i)} className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {formData.contacts.length === 0 && <p className="text-xs text-gray-400">No contacts added.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {company.contacts && company.contacts.length > 0 ? company.contacts.map((contact, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{contact.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{contact.position || "No position"}</p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      {contact.email ? <button type="button" onClick={() => openMailComposer(contact.email, company.company_name, user)} className="text-xs text-blue-600 font-medium hover:underline cursor-pointer bg-transparent border-none p-0" title={contact.email}>{contact.email}</button> : <span className="text-gray-400 text-xs">No Email</span>}
                      <p className="text-xs text-gray-600">{contact.contactNumber}</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-gray-400">No contacts available.</p>}
              </div>
            )}
          </div>

          {/* Social Media Links Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Social Media</h3>
            {isEditing ? (
              <div className="space-y-4">
                {['facebook', 'youtube', 'instagram', 'x', 'linkedin'].map((platform) => (
                  <div key={platform} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 capitalize">{platform === 'x' ? 'X (Twitter)' : platform}</span>
                      {(formData.socialMedia[platform] || []).length < 3 && (
                        <Button type="button" onClick={() => handleSocialAdd(platform)} size="sm" variant="secondary"><Plus className="w-3 h-3 mr-1" /> Add Link</Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(formData.socialMedia[platform] || []).map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" placeholder="URL" value={link.url} onChange={e => handleSocialChange(platform, i, 'url', e.target.value)} className="border rounded p-1.5 text-sm flex-1 outline-none focus:border-indigo-500" />
                          <input type="text" placeholder="Username (Optional)" value={link.username} onChange={e => handleSocialChange(platform, i, 'username', e.target.value)} className="border rounded p-1.5 text-sm w-1/3 outline-none focus:border-indigo-500" />
                          <button type="button" onClick={() => handleSocialRemove(platform, i)} className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      {(!formData.socialMedia[platform] || formData.socialMedia[platform].length === 0) && (
                        <p className="text-xs text-gray-400">No {platform} links added.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {['facebook', 'youtube', 'instagram', 'x', 'linkedin'].map(platform => {
                  const links = Array.isArray(company.socialMedia?.[platform]) ? company.socialMedia[platform] : [];
                  return links.map((link, idx) => {
                    const url = link && typeof link.url === 'string' && link.url.trim() ? (link.url.startsWith('http') ? link.url : `https://${link.url}`) : null;
                    if (!url) return null;
                    const username = typeof link.username === 'string' && link.username.trim() ? link.username : (platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1));

                    return (
                      <a key={`${platform}-${idx}`} href={url} target="_blank" rel="noreferrer" className={`text-sm font-semibold hover:underline ${platform === 'facebook' ? 'text-blue-600' : platform === 'youtube' ? 'text-red-600' : platform === 'instagram' ? 'text-pink-600' : platform === 'x' ? 'text-gray-800' : 'text-blue-700'}`}>
                        {String(username)}
                      </a>
                    );
                  });
                })}
                {(!company.socialMedia || Object.values(company.socialMedia).every(val => !Array.isArray(val) || val.length === 0)) && (
                  <p className="text-xs text-gray-400">No social media links available.</p>
                )}
              </div>
            )}
          </div>

          {/* Tags Section */}
          {!isEditing && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Tags</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                  {company.tags?.length || 0} {company.tags?.length === 1 ? "Tag" : "Tags"}
                </span>
              </div>

              {company.tags && company.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50/40 border border-gray-50 rounded-xl">
                  {company.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-full text-xs font-semibold shadow-sm"
                      style={{
                        borderLeft: `3px solid ${tag.color || "#6366f1"}`
                      }}
                    >
                      <TagIcon className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{tag.name}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl space-y-3">
                  <TagIcon className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-400">No tags have been assigned to this company yet.</p>
                  {canEditTags && (
                    <Button
                      onClick={() => onEditTags(company)}
                      variant="outline"
                      size="sm"
                    >
                      + Add First Tag
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close / Save Action */}
          <div className="flex justify-end gap-3 pt-3 border-t shrink-0">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} variant="secondary">Cancel</Button>
                <Button onClick={handleSave} disabled={updateCompanyMutation.isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {updateCompanyMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={onClose} variant="secondary">Close Detail</Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CompanyDetailsModal;
