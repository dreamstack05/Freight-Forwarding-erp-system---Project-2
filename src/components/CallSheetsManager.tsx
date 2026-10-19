/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Search, 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit 
} from 'lucide-react';
import { CallSheet, CallStatus } from '../types';
import { apiService } from '../services/api';

interface CallSheetsManagerProps {
  callSheets: CallSheet[];
  onRefresh: () => void;
  currentUser: { username: string; role: string } | null;
}

export const CallSheetsManager: React.FC<CallSheetsManagerProps> = ({ 
  callSheets, 
  onRefresh, 
  currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCalls, setFilteredCalls] = useState<CallSheet[]>(callSheets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallSheet | null>(null);
  
  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [enquiryType, setEnquiryType] = useState('Rate Enquiry');
  const [shipmentType, setShipmentType] = useState<'Import' | 'Export'>('Export');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [commodityDescription, setCommodityDescription] = useState('');
  const [modeOfTransport, setModeOfTransport] = useState<'Sea' | 'Air' | 'Road' | 'Rail'>('Sea');
  const [salesPerson, setSalesPerson] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('Connected');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const result = callSheets.filter(c => 
      c.organizationName.toLowerCase().includes(term) ||
      c.contactPerson.toLowerCase().includes(term) ||
      c.salesPerson.toLowerCase().includes(term) ||
      c.commodityDescription.toLowerCase().includes(term)
    );
    setFilteredCalls(result);
  }, [searchTerm, callSheets]);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'Sales Executive' || currentUser?.role === 'Manager';

  const handleOpenCreate = () => {
    if (!canWrite) {
      setErrorMsg('Unauthorized: Only Sales reps, Managers, or Admins can write logs.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setEditingCall(null);
    setOrganizationName('');
    setContactPerson('');
    setPhoneNumber('');
    setEmailAddress('');
    setEnquiryType('Rate Enquiry');
    setShipmentType('Export');
    setOrigin('');
    setDestination('');
    setCommodityDescription('');
    setModeOfTransport('Sea');
    setSalesPerson(currentUser?.username || '');
    setCallStatus('Connected');
    setNextFollowUpDate('');
    setRemarks('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (call: CallSheet) => {
    if (!canWrite) {
      setErrorMsg('Unauthorized: Only Sales/Managers can edit logs.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setEditingCall(call);
    
    setOrganizationName(call.organizationName);
    setContactPerson(call.contactPerson);
    setPhoneNumber(call.phoneNumber);
    setEmailAddress(call.emailAddress);
    setEnquiryType(call.enquiryType);
    setShipmentType(call.shipmentType);
    setOrigin(call.origin);
    setDestination(call.destination);
    setCommodityDescription(call.commodityDescription);
    setModeOfTransport(call.modeOfTransport);
    setSalesPerson(call.salesPerson);
    setCallStatus(call.callStatus);
    setNextFollowUpDate(call.nextFollowUpDate);
    setRemarks(call.remarks);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName || !contactPerson || !phoneNumber) {
      setErrorMsg('Organization, contact person, and phone are required fields.');
      return;
    }

    try {
      const payload = {
        organizationName,
        contactPerson,
        phoneNumber,
        emailAddress,
        enquiryType,
        shipmentType,
        origin,
        destination,
        commodityDescription,
        modeOfTransport,
        salesPerson,
        callStatus,
        nextFollowUpDate,
        remarks,
        callDate: new Date().toISOString().split('T')[0]
      };

      if (editingCall) {
        await apiService.updateCallSheet(editingCall.id, payload);
        setSuccessMsg('Call log updated successfully!');
      } else {
        await apiService.createCallSheet(payload);
        setSuccessMsg('New Call sheet logged successfully!');
      }

      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this call sheet log?')) return;
    try {
      await apiService.deleteCallSheet(id);
      setSuccessMsg('Call sheet deleted successfully.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete operation failed.');
    }
  };

  return (
    <div className="space-y-6" id="callsheets-manager">
      {/* Alert panels */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 rounded">
            <X className="text-rose-500 w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
            <X className="text-emerald-500 w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Call Sheet Hub</h1>
            <p className="text-xs text-slate-400">Log client tele-enquiries and follow-up alerts</p>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by client, item, salesperson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Call</span>
          </button>
        </div>
      </div>

      {/* Database Listing Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4 font-bold">Call Date</th>
                <th className="py-3.5 px-4">Organization Name</th>
                <th className="py-3.5 px-4">Direction & Mode</th>
                <th className="py-3.5 px-4">Voyage Path</th>
                <th className="py-3.5 px-4">Discussion notes</th>
                <th className="py-3.5 px-4">Enquiry / Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No call logs on record. click "Record Call" to begin follow-up.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4 font-mono text-xs text-slate-500 font-medium">
                      {c.callDate}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{c.organizationName}</div>
                      <div className="text-xs text-slate-400">{c.contactPerson} · {c.phoneNumber}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-700 text-xs">
                        {c.modeOfTransport} Freight
                      </div>
                      <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        c.shipmentType === 'Export' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {c.shipmentType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div className="font-medium text-slate-700">{c.origin || 'TBD'}</div>
                      <div className="text-slate-400 mt-0.5">to {c.destination || 'TBD'}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs text-xs text-slate-500 whitespace-normal">
                      <div className="font-semibold text-slate-700 truncate">{c.commodityDescription}</div>
                      <div className="italic line-clamp-2">"{c.remarks}"</div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="text-xs font-semibold text-slate-700">{c.enquiryType}</div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600 font-mono text-[10px]">
                          Followup: {c.nextFollowUpDate || 'None'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded"
                          title="Edit Log"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded"
                          title="Delete Call"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL SHEET FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-800">{editingCall ? 'Update Call Log' : 'Create Tele-Enquiry Call Sheet'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ORGANIZATION NAME *</label>
                  <input required type="text" value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Titan Auto Parts" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CONTACT PERSON *</label>
                  <input required type="text" value={contactPerson} onChange={e=>setContactPerson(e.target.value)} placeholder="Clara Oswald" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PHONE NUMBER *</label>
                  <input required type="text" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} placeholder="+44-207-111" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">EMAIL ADDRESS</label>
                  <input type="email" value={emailAddress} onChange={e=>setEmailAddress(e.target.value)} placeholder="c.oswald@titanauto.com" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ENQUIRY TYPE</label>
                  <select value={enquiryType} onChange={e=>setEnquiryType(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Rate Enquiry</option>
                    <option>Air Quotation</option>
                    <option>LCL Freight Quote</option>
                    <option>Customs Clearance Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SHIPMENT DIRECTION</label>
                  <select value={shipmentType} onChange={e=>setShipmentType(e.target.value as 'Import' | 'Export')} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option value="Export">Export</option>
                    <option value="Import">Import</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">TRANSPORT MODE</label>
                  <select value={modeOfTransport} onChange={e=>setModeOfTransport(e.target.value as any)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option value="Sea">Sea</option>
                    <option value="Air">Air</option>
                    <option value="Road">Road</option>
                    <option value="Rail">Rail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ORIGIN STATION</label>
                  <input type="text" value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Hamburg, Germany" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DESTINATION DISTRIBUTION</label>
                  <input type="text" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Singapore Pasir Panjang" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">COMMODITY DESCRIPTION</label>
                  <input type="text" value={commodityDescription} onChange={e=>setCommodityDescription(e.target.value)} placeholder="Softwood logs, Automotive gears" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">NEXT FOLLOW-UP DATE</label>
                  <input type="date" value={nextFollowUpDate} onChange={e=>setNextFollowUpDate(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SALES PERSON / RECORDER</label>
                  <input type="text" value={salesPerson} onChange={e=>setSalesPerson(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded" disabled/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CALL STATUS</label>
                  <select value={callStatus} onChange={e=>setCallStatus(e.target.value as CallStatus)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option value="Connected">Connected</option>
                    <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                    <option value="Busy">Busy</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">REMARKS & VERBATIM NOTES</label>
                <textarea rows={3} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Wants express Air Cargo quotation, requested quotes for custom clearance timeline..." className="w-full p-2 text-xs border border-slate-200 rounded"></textarea>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded text-xs text-slate-500 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-violet-600 rounded text-xs font-bold text-white hover:bg-violet-700">Save Call Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
