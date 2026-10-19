/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Search, 
  Plus, 
  X, 
  Calendar, 
  Anchor, 
  Clock, 
  Edit, 
  AlertOctagon 
} from 'lucide-react';
import { SailingSchedule, ScheduleStatus, TransportMode } from '../types';
import { apiService } from '../services/api';

interface SchedulesManagerProps {
  schedules: SailingSchedule[];
  onRefresh: () => void;
  currentUser: { username: string; role: string } | null;
}

export const SchedulesManager: React.FC<SchedulesManagerProps> = ({ 
  schedules, 
  onRefresh, 
  currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<SailingSchedule[]>(schedules);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<SailingSchedule | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [branch, setBranch] = useState('Singapore Branch');
  const [transportMode, setTransportMode] = useState<TransportMode>('Ocean');
  const [carrierName, setCarrierName] = useState('');
  const [scnCode, setScnCode] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [pol, setPol] = useState('');
  const [etd, setEtd] = useState('');
  const [pod, setPod] = useState('');
  const [eta, setEta] = useState('');
  const [placeOfReceipt, setPlaceOfReceipt] = useState('');
  const [placeOfDelivery, setPlaceOfDelivery] = useState('');
  const [portCutOffDate, setPortCutOffDate] = useState('');
  const [documentationCutOffDate, setDocumentationCutOffDate] = useState('');
  const [cyOpeningDate, setCyOpeningDate] = useState('');
  const [cyClosingDate, setCyClosingDate] = useState('');
  const [transitTime, setTransitTime] = useState('');
  const [carrierBookingNumber, setCarrierBookingNumber] = useState('');
  const [feederVesselName, setFeederVesselName] = useState('');
  const [feederVoyageNumber, setFeederVoyageNumber] = useState('');
  const [transhipmentPort, setTranshipmentPort] = useState('');
  const [terminalName, setTerminalName] = useState('');
  const [shippingLineContact, setShippingLineContact] = useState('');
  const [remarks, setRemarks] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatus>('Active');
  const [slotOperator, setSlotOperator] = useState('');
  const [vgmCutOffDate, setVgmCutOffDate] = useState('');
  const [freeDaysAtDestination, setFreeDaysAtDestination] = useState<number>(14);
  const [etb, setEtb] = useState('');
  const [atd, setAtd] = useState('');
  const [ata, setAta] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('Weekly');
  const [portRotation, setPortRotation] = useState('');

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const res = schedules.filter(s => 
      s.scheduleNumber.toLowerCase().includes(term) ||
      s.vesselName.toLowerCase().includes(term) ||
      s.carrierName.toLowerCase().includes(term) ||
      s.pol.toLowerCase().includes(term) ||
      s.pod.toLowerCase().includes(term)
    );
    setFiltered(res);
  }, [searchTerm, schedules]);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'Operations Executive' || currentUser?.role === 'Manager';

  const handleOpenCreateInput = () => {
    if (!canWrite) {
      setErrorMsg('Unauthorized: Only operational personnel have privileges to create sailing schedules.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setEditing(null);
    setBranch('Main HQ Office');
    setTransportMode('Ocean');
    setCarrierName('');
    setScnCode('');
    setVesselName('');
    setVoyageNumber('');
    setPol('');
    setEtd('');
    setPod('');
    setEta('');
    setPlaceOfReceipt('');
    setPlaceOfDelivery('');
    setPortCutOffDate('');
    setDocumentationCutOffDate('');
    setCyOpeningDate('');
    setCyClosingDate('');
    setTransitTime('');
    setCarrierBookingNumber('');
    setFeederVesselName('');
    setFeederVoyageNumber('');
    setTranshipmentPort('');
    setTerminalName('');
    setShippingLineContact('');
    setRemarks('');
    setScheduleStatus('Active');
    setSlotOperator('');
    setVgmCutOffDate('');
    setFreeDaysAtDestination(14);
    setEtb('');
    setAtd('');
    setAta('');
    setScheduleFrequency('Weekly');
    setPortRotation('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sched: SailingSchedule) => {
    if (!canWrite) {
      setErrorMsg('Unauthorized: Modification locks active.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setEditing(sched);

    setBranch(sched.branch);
    setTransportMode(sched.transportMode);
    setCarrierName(sched.carrierName);
    setScnCode(sched.scnCode);
    setVesselName(sched.vesselName);
    setVoyageNumber(sched.voyageNumber);
    setPol(sched.pol);
    setEtd(sched.etd);
    setPod(sched.pod);
    setEta(sched.eta);
    setPlaceOfReceipt(sched.placeOfReceipt);
    setPlaceOfDelivery(sched.placeOfDelivery);
    setPortCutOffDate(sched.portCutOffDate);
    setDocumentationCutOffDate(sched.documentationCutOffDate);
    setCyOpeningDate(sched.cyOpeningDate);
    setCyClosingDate(sched.cyClosingDate);
    setTransitTime(sched.transitTime);
    setCarrierBookingNumber(sched.carrierBookingNumber);
    setFeederVesselName(sched.feederVesselName || '');
    setFeederVoyageNumber(sched.feederVoyageNumber || '');
    setTranshipmentPort(sched.transhipmentPort || '');
    setTerminalName(sched.terminalName);
    setShippingLineContact(sched.shippingLineContact);
    setRemarks(sched.remarks);
    setScheduleStatus(sched.scheduleStatus);
    setSlotOperator(sched.slotOperator || '');
    setVgmCutOffDate(sched.vgmCutOffDate);
    setFreeDaysAtDestination(sched.freeDaysAtDestination);
    setEtb(sched.etb);
    setAtd(sched.atd || '');
    setAta(sched.ata || '');
    setScheduleFrequency(sched.scheduleFrequency);
    setPortRotation(sched.portRotation);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierName || !vesselName || !pol || !pod) {
      setErrorMsg('Error: Vessel Name, ocean carrier pol/pod cut fields required.');
      return;
    }

    try {
      const payload = {
        branch, transportMode, carrierName, scnCode, vesselName, voyageNumber,
        pol, etd, pod, eta, placeOfReceipt, placeOfDelivery, portCutOffDate,
        documentationCutOffDate, cyOpeningDate, cyClosingDate, transitTime,
        carrierBookingNumber, feederVesselName, feederVoyageNumber, transhipmentPort,
        terminalName, shippingLineContact, remarks, scheduleStatus, slotOperator,
        vgmCutOffDate, freeDaysAtDestination, etb, atd, ata, scheduleFrequency, portRotation
      };

      if (editing) {
        await apiService.updateSchedule(editing.id, payload);
        setSuccessMsg(`Voyage ${vesselName} scheduling parameters modified.`);
      } else {
        await apiService.createSchedule(payload);
        setSuccessMsg(`New Voyage schedule ${vesselName} successfully logged.`);
      }

      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed schedule');
    }
  };

  const handleCancelSchedule = async (sched: SailingSchedule) => {
    if (!window.confirm('Cancel sailing? This updates client manifest records.')) return;
    try {
      await apiService.updateSchedule(sched.id, { scheduleStatus: 'Cancelled' });
      setSuccessMsg(`Schedule ${sched.scheduleNumber} marked CA-CANCELLED.`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Cancellation trigger failed.');
    }
  };

  return (
    <div className="space-y-6" id="sailing-schedules">
      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 rounded">
            <X className="w-4 h-4 text-rose-505" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
            <X className="w-4 h-4 text-emerald-505" />
          </button>
        </div>
      )}

      {/* Controller Header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Carrier Sailing Schedules</h1>
            <p className="text-xs text-slate-400">Review vessel voyage paths, CFS terminal openings & document cut-offs</p>
          </div>
        </div>

        {/* Core Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Vessel, port, voyage, carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button 
            onClick={handleOpenCreateInput}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Map Voyage Sailing</span>
          </button>
        </div>
      </div>

      {/* Schedules grid view optimized for bento format details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center text-slate-400 text-sm border border-slate-100 rounded-2xl">
            No voyaging vessels recorded. Select "Map Voyage Sailing" to log schedule metrics.
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-purple-200 transition">
              
              {/* Header inside specific card */}
              <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {s.scheduleNumber}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 rounded uppercase tracking-wider ${
                      s.scheduleStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {s.scheduleStatus}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center">
                    <Anchor className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
                    <span>{s.vesselName}</span>
                    <span className="text-slate-400 text-xs ml-1 font-mono font-normal">({s.voyageNumber})</span>
                  </h3>
                  <div className="text-xs text-slate-400">{s.carrierName} · Operator: {s.slotOperator || 'nil'}</div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">BRANCH office</div>
                  <div className="font-semibold text-slate-700">{s.branch}</div>
                </div>
              </div>

              {/* Transit core details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Port of Loading (POL)</span>
                  <span className="font-semibold text-slate-800">{s.pol}</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">ETD: {s.etd}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Port of Discharge (POD)</span>
                  <span className="font-semibold text-slate-800">{s.pod}</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-bold text-purple-700">ETA: {s.eta}</div>
                </div>
              </div>

              {/* Cut-off Timers */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                <div className="p-2 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans font-semibold">PORT CUT-OFF</span>
                  <strong className="text-rose-600 font-bold">{s.portCutOffDate || 'nil'}</strong>
                </div>
                <div className="p-2 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans font-semibold">VGM CUT-OFF</span>
                  <strong className="text-slate-700 font-bold">{s.vgmCutOffDate || 'nil'}</strong>
                </div>
                <div className="p-2 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans font-semibold">DOCS CUT-OFF</span>
                  <strong className="text-slate-700 font-bold">{s.documentationCutOffDate || 'nil'}</strong>
                </div>
              </div>

              {/* Rotation & Terminal Specifics */}
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Terminal Station:</span>
                  <strong className="text-slate-700">{s.terminalName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Route Rotation Loop:</span>
                  <strong className="text-slate-700 font-mono">{s.portRotation || 'SGP -> USLAX'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Free Destination Days:</span>
                  <strong className="text-slate-750 font-mono">{s.freeDaysAtDestination} Days</strong>
                </div>
              </div>

              {/* Footer adjustments */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-50">
                <button 
                  onClick={() => handleOpenEdit(s)}
                  className="flex-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 font-semibold p-2 rounded-lg text-xs flex justify-center items-center space-x-1 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Schedule</span>
                </button>
                {s.scheduleStatus === 'Active' && (
                  <button 
                    onClick={() => handleCancelSchedule(s)}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs flex items-center justify-center space-x-1"
                    title="Cancel Voyage"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Cancel Voyage</span>
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* FORM MODAL VIEW */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-800">{editing ? `Edit Sailing metrics: ${editing.scheduleNumber}` : 'Deploy Sailing Voyage Schedule'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 max-h-[70vh] text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">BRANCH OFFICE *</label>
                  <input required type="text" value={branch} onChange={e=>setBranch(e.target.value)} placeholder="Singapore Hub" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">TRANSPORT MODE</label>
                  <select value={transportMode} onChange={e=>setTransportMode(e.target.value as TransportMode)} className="w-full p-2 border border-slate-200 rounded">
                    <option value="Ocean">Ocean Voyage</option>
                    <option value="Air">Air Carrier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CARRIER NAME *</label>
                  <input required type="text" value={carrierName} onChange={e=>setCarrierName(e.target.value)} placeholder="Ocean Network Express" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Vessel SCN Code</label>
                  <input type="text" value={scnCode} onChange={e=>setScnCode(e.target.value)} placeholder="SCN-ONE-99" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Schedule Status</label>
                  <select value={scheduleStatus} onChange={e=>setScheduleStatus(e.target.value as ScheduleStatus)} className="w-full p-2 border border-slate-200 rounded">
                    <option value="Active">Active Loop</option>
                    <option value="Delayed">Vessel Delayed</option>
                    <option value="Completed">Completed Trip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">OCEAN VESSEL NAME *</label>
                  <input required type="text" value={vesselName} onChange={e=>setVesselName(e.target.value)} placeholder="ONE Continuity" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">VOYAGE NUMBER *</label>
                  <input required type="text" value={voyageNumber} onChange={e=>setVoyageNumber(e.target.value)} placeholder="024E" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">POL (Port of loading) *</label>
                  <input required type="text" value={pol} onChange={e=>setPol(e.target.value)} placeholder="SGP - Port of Singapore" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">POD (Port of Discharge) *</label>
                  <input required type="text" value={pod} onChange={e=>setPod(e.target.value)} placeholder="LAX - Los Angeles Port" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">ETD LOADING DATE</label>
                  <input type="date" value={etd} onChange={e=>setEtd(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">ETA TARGET DATE</label>
                  <input type="date" value={eta} onChange={e=>setEta(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">PORT CUT-OFF DATE</label>
                  <input type="date" value={portCutOffDate} onChange={e=>setPortCutOffDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">VGM CUT-OFF DATE</label>
                  <input type="date" value={vgmCutOffDate} onChange={e=>setVgmCutOffDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">DOCUMENTS CUT-OFF DATE</label>
                  <input type="date" value={documentationCutOffDate} onChange={e=>setDocumentationCutOffDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">TRANSIT TRAVEL TIME</label>
                  <input type="text" value={transitTime} onChange={e=>setTransitTime(e.target.value)} placeholder="14 Days" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CARRIER BK NO</label>
                  <input type="text" value={carrierBookingNumber} onChange={e=>setCarrierBookingNumber(e.target.value)} placeholder="BK-ONE-2292" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">SLOT OPERATOR</label>
                  <input type="text" value={slotOperator} onChange={e=>setSlotOperator(e.target.value)} placeholder="Gold Star Lines" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CY OPENING DATE</label>
                  <input type="date" value={cyOpeningDate} onChange={e=>setCyOpeningDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CY CLOSING DATE</label>
                  <input type="date" value={cyClosingDate} onChange={e=>setCyClosingDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">FREE DAYS AT DEST</label>
                  <input type="number" value={freeDaysAtDestination} onChange={e=>setFreeDaysAtDestination(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">PORT ROTATION CHAIN</label>
                  <input type="text" value={portRotation} onChange={e=>setPortRotation(e.target.value)} placeholder="SGP -> JEA -> RTM" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">TERMINAL NAME</label>
                  <input type="text" value={terminalName} onChange={e=>setTerminalName(e.target.value)} placeholder="Pasir Panjang Terminal 4" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">ROTATIONAL REMARKS</label>
                <textarea rows={2} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="..." className="w-full p-2 border border-slate-200 rounded"></textarea>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded text-xs text-slate-500 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 rounded text-xs font-bold text-white hover:bg-purple-700">Deploy Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
