/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Trash, 
  RefreshCcw, 
  Sparkles, 
  X, 
  FileCheck, 
  Eye, 
  UserPlus 
} from 'lucide-react';
import { SalesLead, LeadRating, LeadStatus } from '../types';
import { apiService } from '../services/api';

interface LeadsManagerProps {
  leads: SalesLead[];
  onRefresh: () => void;
  currentUser: { username: string; role: string } | null;
}

export const LeadsManager: React.FC<LeadsManagerProps> = ({ 
  leads, 
  onRefresh, 
  currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState<SalesLead[]>(leads);
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [salesPerson, setSalesPerson] = useState('');
  const [leadSource, setLeadSource] = useState('Google Ads');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [customerType, setCustomerType] = useState('Importer');
  const [businessType, setBusinessType] = useState('FCL Ocean');
  const [country, setCountry] = useState('Germany');
  const [leadRating, setLeadRating] = useState<LeadRating>('Warm');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [interestedService, setInterestedService] = useState('');
  const [expectedShipmentVolume, setExpectedShipmentVolume] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPerson, setFollowUpPerson] = useState('');
  const [competitorName, setCompetitorName] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const result = leads.filter(l => 
      l.leadNumber.toLowerCase().includes(term) ||
      l.customerName.toLowerCase().includes(term) ||
      l.salesPerson.toLowerCase().includes(term) ||
      l.country.toLowerCase().includes(term) ||
      l.interestedService.toLowerCase().includes(term)
    );
    setFilteredLeads(result);
  }, [searchTerm, leads]);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'Sales Executive' || currentUser?.role === 'Manager';

  // Open Create Layout
  const handleOpenCreateForm = () => {
    if (!canWrite) {
      setErrorMsg('Unauthorized: Only Admins, Sales Executives, or Managers can log leads.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setCustomerName('');
    setSalesPerson(currentUser?.username || '');
    setLeadSource('Direct Referral');
    setContactPerson('');
    setPhoneNumber('');
    setEmailAddress('');
    setCustomerType('Importer');
    setBusinessType('FCL Ocean');
    setCountry('');
    setLeadRating('Warm');
    setLeadStatus('New');
    setInterestedService('');
    setExpectedShipmentVolume('');
    setDiscussionNotes('');
    setFollowUpDate('');
    setFollowUpPerson('');
    setCompetitorName('');
    setAttachmentName('');
    setIsCreateOpen(true);
  };

  const handleOpenEditForm = (lead: SalesLead) => {
    if (!canWrite) {
      setErrorMsg('Unauthorized: Only Sales Executives, Managers, or Admins can modify lead details.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedLead(lead);

    // populate
    setCustomerName(lead.customerName);
    setSalesPerson(lead.salesPerson);
    setLeadSource(lead.leadSource);
    setContactPerson(lead.contactPerson);
    setPhoneNumber(lead.phoneNumber);
    setEmailAddress(lead.emailAddress);
    setCustomerType(lead.customerType);
    setBusinessType(lead.businessType);
    setCountry(lead.country);
    setLeadRating(lead.leadRating);
    setLeadStatus(lead.leadStatus);
    setInterestedService(lead.interestedService);
    setExpectedShipmentVolume(lead.expectedShipmentVolume);
    setDiscussionNotes(lead.discussionNotes);
    setFollowUpDate(lead.followUpDate);
    setFollowUpPerson(lead.followUpPerson);
    setCompetitorName(lead.competitorName);
    setAttachmentName(lead.attachments?.[0] || '');

    setIsEditOpen(true);
  };

  // Submit Create Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!customerName || !contactPerson || !emailAddress || !country) {
      setErrorMsg('Error: Please enter Customer Name, Contact Person, Email Address, and Country.');
      return;
    }

    try {
      await apiService.createLead({
        customerName,
        salesPerson,
        leadSource,
        contactPerson,
        phoneNumber,
        emailAddress,
        customerType,
        businessType,
        country,
        leadRating,
        leadStatus,
        interestedService,
        expectedShipmentVolume,
        discussionNotes,
        followUpDate,
        followUpPerson,
        competitorName,
        attachments: attachmentName ? [attachmentName] : [],
        leadDate: new Date().toISOString().split('T')[0]
      });

      setSuccessMsg('Lead records created successfully!');
      setIsCreateOpen(false);
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Operation failed log lead');
    }
  };

  // Edit Submit Lead
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await apiService.updateLead(selectedLead.id, {
        customerName,
        salesPerson,
        leadSource,
        contactPerson,
        phoneNumber,
        emailAddress,
        customerType,
        businessType,
        country,
        leadRating,
        leadStatus,
        interestedService,
        expectedShipmentVolume,
        discussionNotes,
        followUpDate,
        followUpPerson,
        competitorName,
        attachments: attachmentName ? [attachmentName] : []
      });

      setSuccessMsg(`Lead ${updated.leadNumber} updated successfully.`);
      setIsEditOpen(false);
      setSelectedLead(updated);
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Operation failed change lead');
    }
  };

  // CONVERT Lead into active Shipment & trigger Auto S-Number Generation
  const handleConvertLead = async (lead: SalesLead) => {
    if (!canWrite) {
      setErrorMsg('Only Admins or Sales reps have authorization to convert leads.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await apiService.convertLead(lead.id);
      setSuccessMsg(`Successfully converted! Lead ${lead.leadNumber} was converted into active shipment code: ${result.shipment.shipmentNumber}.`);
      setSelectedLead(null);
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Leads conversion process failed.');
    }
  };

  return (
    <div className="space-y-6" id="lead-manager-view">
      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sales Lead Directory</h1>
            <p className="text-xs text-slate-400">Manage pipeline conversion and client acquisition parameters</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads, client, rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 hover:bg-slate-100/50"
            />
          </div>
          <button 
            onClick={handleOpenCreateForm}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Lead</span>
          </button>
        </div>
      </div>

      {/* Main Table Directory split with Details sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table view */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Expected Interest</th>
                  <th className="py-3 px-4">Status & Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      No matching records found. Use "Generate Lead" to write a log.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-4 px-4 font-mono text-xs font-bold text-sky-600">
                        {lead.leadNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{lead.customerName}</div>
                        <div className="text-xs text-slate-400">{lead.contactPerson} · {lead.country}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-700 text-xs">{lead.interestedService}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">Vol: {lead.expectedShipmentVolume} · Src: {lead.leadSource}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          lead.leadRating === 'Hot' ? 'bg-red-50 text-red-700 border border-red-100' :
                          lead.leadRating === 'Warm' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {lead.leadRating}
                        </span>
                        <div className="text-xs text-slate-500 font-medium">Status: {lead.leadStatus}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                            title="View parameters"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEditForm(lead)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Modify info"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Lead Details Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h2 className="text-md font-bold text-slate-800">Operational Summary</h2>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>

          {!selectedLead ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              Select any Lead to inspect parameters, discussion, files, and trigger conversion.
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-600 animate-slide-in">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-400">LEAD NUMBER</div>
                  <div className="text-lg font-bold text-slate-800 font-mono tracking-tight">{selectedLead.leadNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">CONVERSION</div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedLead.conversionStatus === 'Converted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedLead.conversionStatus}
                  </span>
                </div>
              </div>

              {/* CRM Key Metrics matrix */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider">Client Identity</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedLead.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider">Business Vertical</span>
                    <span className="font-semibold text-slate-700 text-xs">{selectedLead.businessType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider">Contact Name</span>
                    <span className="font-medium text-slate-700">{selectedLead.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider">Email/Phone</span>
                    <span className="font-medium text-slate-700 text-[10px] break-all">{selectedLead.emailAddress} <br/> {selectedLead.phoneNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider">Salesperson</span>
                    <span className="font-medium text-slate-700">{selectedLead.salesPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider">Expected Vol</span>
                    <span className="font-medium text-slate-700 font-mono">{selectedLead.expectedShipmentVolume}</span>
                  </div>
                </div>
              </div>

              {/* Discussion & notes */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block font-bold text-[9px] uppercase tracking-wider">Discussion notes Log</span>
                <p className="text-[11px] text-slate-600 italic leading-snug">
                  "{selectedLead.discussionNotes || 'No discussion notes logged'}"
                </p>
              </div>

              {/* Followups */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl grid grid-cols-2 gap-2">
                <div>
                  <span className="text-indigo-400 block font-bold text-[9px] tracking-wider">FOLLOW-UP TRIGGER</span>
                  <span className="font-mono text-indigo-800 text-xs font-bold">{selectedLead.followUpDate || 'TBD'}</span>
                </div>
                <div>
                  <span className="text-indigo-400 block font-bold text-[9px] tracking-wider">REPRESENTATIVE</span>
                  <span className="text-indigo-700 font-medium">{selectedLead.followUpPerson || 'TBD'}</span>
                </div>
              </div>

              {/* Attachments */}
              {selectedLead.attachments && selectedLead.attachments.length > 0 && (
                <div className="space-y-1">
                  <span className="text-slate-400 block font-semibold text-[9px] tracking-wider">ATTACHMENTS</span>
                  <div className="flex items-center space-x-1.5 text-[11px] text-sky-600 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-sky-500" />
                    <span>{selectedLead.attachments[0]}</span>
                  </div>
                </div>
              )}

              {/* CRITICAL: Conversion Button */}
              {selectedLead.conversionStatus !== 'Converted' ? (
                <button
                  onClick={() => handleConvertLead(selectedLead)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-lg text-xs mt-4 flex items-center justify-center space-x-1.5 shadow"
                >
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Convert into Active Shipment</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-center rounded-xl">
                  <div className="text-[11px] font-bold text-emerald-800">CONVERTED TO SHIPMENT</div>
                  <div className="font-mono font-bold text-emerald-900 text-xs mt-1">CODE: {selectedLead.convertedEnquiryNumber}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-800">Generate Customer Sales Lead</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CUSTOMER NAME *</label>
                  <input required type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Apex Logistics" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CONTACT PERSON *</label>
                  <input required type="text" value={contactPerson} onChange={e=>setContactPerson(e.target.value)} placeholder="Sarah Jenkins" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">EMAIL ADDRESS *</label>
                  <input required type="email" value={emailAddress} onChange={e=>setEmailAddress(e.target.value)} placeholder="sjenkins@apex.com" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PHONE NUMBER</label>
                  <input type="text" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} placeholder="+1-555-010" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">COUNTRY *</label>
                  <input required type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder="United States" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">LEAD SOURCE</label>
                  <select value={leadSource} onChange={e=>setLeadSource(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Direct Referral</option>
                    <option>Google Ads</option>
                    <option>Exhibition</option>
                    <option>Cold Email</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CUSTOMER TYPE</label>
                  <select value={customerType} onChange={e=>setCustomerType(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Importer</option>
                    <option>Exporter</option>
                    <option>Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">BUSINESS TYPE</label>
                  <select value={businessType} onChange={e=>setBusinessType(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>FCL Ocean</option>
                    <option>LCL Ocean</option>
                    <option>Air Freight</option>
                    <option>Customs Clearance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">LEAD RATING</label>
                  <select value={leadRating} onChange={e=>setLeadRating(e.target.value as LeadRating)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Cold</option>
                    <option>Warm</option>
                    <option>Hot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">INTERESTED SERVICE</label>
                  <input type="text" value={interestedService} onChange={e=>setInterestedService(e.target.value)} placeholder="FCL import New York to Los Angeles Depot" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">EXPECTED VOLUME</label>
                  <input type="text" value={expectedShipmentVolume} onChange={e=>setExpectedShipmentVolume(e.target.value)} placeholder="10 TEU per month" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">FOLLOW-UP TRIGGER DATE</label>
                  <input type="date" value={followUpDate} onChange={e=>setFollowUpDate(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">FOLLOW-UP REPRESENTATIVE</label>
                  <input type="text" value={followUpPerson} onChange={e=>setFollowUpPerson(e.target.value)} placeholder="John Doe" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">COMPETITOR NAME</label>
                  <input type="text" value={competitorName} onChange={e=>setCompetitorName(e.target.value)} placeholder="Maersk Logistics" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SIMULATED QUOTE FILE</label>
                  <input type="text" value={attachmentName} onChange={e=>setAttachmentName(e.target.value)} placeholder="Quote_Apex_V1.pdf" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">DISCUSSION LOG NOTES</label>
                <textarea rows={3} value={discussionNotes} onChange={e=>setDiscussionNotes(e.target.value)} placeholder="Customer needs certified temperature control containers..." className="w-full p-2 text-xs border border-slate-200 rounded"></textarea>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-slate-200 rounded text-xs text-slate-500 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 rounded text-xs font-bold text-white hover:bg-sky-700">Submit Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-800">Edit Lead: {selectedLead?.leadNumber}</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateLead} className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CUSTOMER NAME *</label>
                  <input required type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CONTACT PERSON *</label>
                  <input required type="text" value={contactPerson} onChange={e=>setContactPerson(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">EMAIL ADDRESS *</label>
                  <input required type="email" value={emailAddress} onChange={e=>setEmailAddress(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PHONE NUMBER</label>
                  <input type="text" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">COUNTRY *</label>
                  <input required type="text" value={country} onChange={e=>setCountry(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">LEAD SOURCE</label>
                  <input type="text" value={leadSource} onChange={e=>setLeadSource(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CUSTOMER TYPE</label>
                  <select value={customerType} onChange={e=>setCustomerType(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Importer</option>
                    <option>Exporter</option>
                    <option>Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">BUSINESS TYPE</label>
                  <input type="text" value={businessType} onChange={e=>setBusinessType(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">LEAD RATING</label>
                  <select value={leadRating} onChange={e=>setLeadRating(e.target.value as LeadRating)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Cold</option>
                    <option>Warm</option>
                    <option>Hot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">INTERESTED SERVICE</label>
                  <input type="text" value={interestedService} onChange={e=>setInterestedService(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">EXPECTED VOLUME</label>
                  <input type="text" value={expectedShipmentVolume} onChange={e=>setExpectedShipmentVolume(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">FOLLOW-UP TRIGGER DATE</label>
                  <input type="date" value={followUpDate} onChange={e=>setFollowUpDate(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">FOLLOW-UP REPRESENTATIVE</label>
                  <input type="text" value={followUpPerson} onChange={e=>setFollowUpPerson(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">COMPETITOR NAME</label>
                  <input type="text" value={competitorName} onChange={e=>setCompetitorName(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">QUOTE ARCHIVE FILE</label>
                  <input type="text" value={attachmentName} onChange={e=>setAttachmentName(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">DISCUSSION NOTES</label>
                <textarea rows={3} value={discussionNotes} onChange={e=>setDiscussionNotes(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"></textarea>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-slate-200 rounded text-xs text-slate-500 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-xs font-bold text-white hover:bg-indigo-700">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
