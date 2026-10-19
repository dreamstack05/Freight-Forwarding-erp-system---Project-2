/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Search, 
  Plus, 
  X, 
  MapPin, 
  Scale, 
  Navigation, 
  Send, 
  Printer, 
  FileCheck, 
  Package, 
  AlertTriangle, 
  Layers, 
  Mail, 
  Clipboard, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';
import { 
  Shipment, 
  PackAllocation, 
  EDIDetails, 
  PickupRecord, 
  DeliveryRecord, 
  HBLStatus, 
  HBLDeliveryMode,
  TransportMode,
  ShipmentType
} from '../types';
import { apiService } from '../services/api';

interface ShipmentsManagerProps {
  shipments: Shipment[];
  onRefresh: () => void;
  currentUser: { username: string; role: string } | null;
  onViewReport: (shipment: Shipment) => void;
}

export const ShipmentsManager: React.FC<ShipmentsManagerProps> = ({ 
  shipments, 
  onRefresh, 
  currentUser,
  onViewReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<Shipment[]>(shipments);
  const [selected, setSelected] = useState<Shipment | null>(null);
  
  // UI Panels
  const [activeTab, setActiveTab] = useState<'hbl' | 'pack' | 'edi' | 'pickup' | 'email'>('hbl');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // CREATE SHIPMENT FIELDS
  const [clientName, setClientName] = useState('');
  const [branch, setBranch] = useState('New York HQ');
  const [shipmentType, setShipmentType] = useState<ShipmentType>('Export');
  const [transportMode, setTransportMode] = useState<TransportMode>('Ocean');
  const [origin, setOrigin] = useState('');
  const [originETD, setOriginETD] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationETA, setDestinationETA] = useState('');
  const [shipper, setShipper] = useState('');
  const [consignee, setConsignee] = useState('');
  const [notifyParty, setNotifyParty] = useState('');
  const [carrier, setCarrier] = useState('');
  const [pol, setPol] = useState('');
  const [polETD, setPolETD] = useState('');
  const [pod, setPod] = useState('');
  const [podETA, setPodETA] = useState('');
  const [serviceType, setServiceType] = useState('FCL/FCL');
  const [hblHouseType, setHblHouseType] = useState('Regular');
  const [hblNumber, setHblNumber] = useState(''); // Only editable if Import

  // SUBMODULE: PACK ALLOCATION FORM
  const [pieces, setPieces] = useState<number>(1);
  const [packagesText, setPackagesText] = useState('Wood Pallets');
  const [packageType, setPackageType] = useState('PLT');
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [netWeight, setNetWeight] = useState<number>(0);
  const [volumeCBM, setVolumeCBM] = useState<number>(0);
  const [tempCtrl, setTempCtrl] = useState('');
  const [commCode, setCommCode] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [hsCodeVal, setHsCodeVal] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [receivedDate, setReceivedDate] = useState('');

  // SUBMODULE: EMAIL DIALOG FIELD
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailBcc, setEmailBcc] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailTypeVal, setEmailTypeVal] = useState('Pre-Alert Notification');

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const res = shipments.filter(s => 
      s.shipmentNumber.toLowerCase().includes(term) ||
      s.clientName.toLowerCase().includes(term) ||
      s.origin.toLowerCase().includes(term) ||
      s.destination.toLowerCase().includes(term) ||
      s.hblNumber.toLowerCase().includes(term)
    );
    setFiltered(res);
    // Auto-select first item if none is selected
    if (res.length > 0 && !selected) {
      setSelected(res[0]);
    }
  }, [searchTerm, shipments]);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'Operations Executive' || currentUser?.role === 'Documentation Executive' || currentUser?.role === 'Manager';

  // Handle Create Shipment Submit
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !origin || !destination) {
      setErrorMsg('Client Name, Origin, and Destination are required.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const created = await apiService.createShipment({
        clientName,
        branch,
        shipmentType,
        transportMode,
        origin,
        originETD,
        destination,
        destinationETA,
        shipper,
        consignee,
        notifyParty,
        carrier,
        pol,
        polETD,
        pod,
        podETA,
        serviceType,
        hblHouseType,
        hblNumber: shipmentType === 'Export' ? '' : hblNumber, // Backend auto rules
        hblStatus: 'Draft',
        hblDeliveryMode: 'Original OBL',
        onBoardDate: '',
        onBoardNote: '',
        bookingReferenceNumber: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        bookingReferenceDate: new Date().toISOString().split('T')[0],
        payableAt: 'Origin',
        dispatchAt: 'CFS Depot'
      });

      setSuccessMsg(`Shipment ${created.shipmentNumber} generated successfully.`);
      setIsNewOpen(false);
      setSelected(created);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  // PUT update shipment info
  const handleUpdateShipmentCore = async (updatedFields: Partial<Shipment>) => {
    if (!selected) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updated = await apiService.updateShipment(selected.id, updatedFields);
      setSelected(updated);
      setSuccessMsg('Core shipment info successfully updated.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Update failed');
    }
  };

  // Submodule: Pack Allocation post
  const handleAddPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setErrorMsg('');
    setSuccessMsg('');
    if (!commDesc) {
      setErrorMsg('Cargo commodity description is required to allocate bundle.');
      return;
    }

    try {
      const updated = await apiService.addPackAllocation(selected.id, {
        numberOfPieces: pieces,
        packages: packagesText,
        packageType,
        grossWeight,
        netWeight,
        volumeCBM,
        temperatureControl: tempCtrl,
        commodityCode: commCode,
        commodityDescription: commDesc,
        hsCode: hsCodeVal,
        cargoReadyDate: readyDate || new Date().toISOString().split('T')[0],
        cargoReceivedDate: receivedDate
      });

      setSelected(updated);
      setSuccessMsg('Pack allocation added.');
      setPieces(1);
      setCommDesc('');
      setGrossWeight(0);
      setNetWeight(0);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!selected) return;
    try {
      const updated = await apiService.deletePackAllocation(selected.id, packId);
      setSelected(updated);
      setSuccessMsg('Pack allocation removed.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Submodule Update EDI details (or Pickup/Delivery)
  const handleUpdateSubmoduleDetails = async (type: 'edi' | 'pickup' | 'delivery', chunk: any) => {
    if (!selected) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload: any = {};
      payload[type] = chunk;
      const updated = await apiService.updateSubmodules(selected.id, payload);
      setSelected(updated);
      setSuccessMsg(`${type.toUpperCase()} information customized.`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Submodule mail broadcast simulation submit
  const handleSendEmailNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!emailTo || !emailTemplate) {
      setErrorMsg('To email address and templates content are essential.');
      return;
    }

    try {
      const updated = await apiService.sendShipmentEmail(selected.id, {
        emailType: emailTypeVal,
        to: emailTo,
        cc: emailCc,
        bcc: emailBcc,
        template: emailTemplate
      });

      setSelected(updated);
      setSuccessMsg(`Simulated shipment email broadcast. Notification logged under dispatch history!`);
      setEmailTo('');
      setEmailCc('');
      setEmailBcc('');
      setEmailTemplate('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Seed default templates helper
  const loadTemplate = (type: string) => {
    if (!selected) return;
    if (type === 'Pre-Alert Notification') {
      setEmailCc('docs@forwarderp.com');
      setEmailTemplate(`Dear Valued Client,\n\nWe would like to send you the Pre-Alert advice notice regarding Shipment ${selected.shipmentNumber}.\n\nVessel & Voyage: ${selected.pol || 'TBD'} ETD ${selected.originETD || 'TBD'} / POD ETA ${selected.destinationETA || 'TBD'}\nHBL Assigned: ${selected.hblNumber}\n\nPlease proceed with custom preparations.\n\nWarm Regards,\nForwarding Ops`);
    } else if (type === 'Telex Release Advice') {
      setEmailTemplate(`Dear Logistics Coordinator,\n\nThis is to confirm Telex Release of payload against HBL ${selected.hblNumber}.\n\nDeliver order validity clearance and clearance advice can be downloaded at Singapore Port Office.\n\nThank you for choosing ForwardERP.`);
    }
  };

  return (
    <div className="space-y-6" id="shipment-workspace">
      {/* Alert boxes */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 rounded">
            <X className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium text-sm flex justify-between items-center animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded">
            <X className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      )}

      {/* Title block & Search controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Shipments Dashboard</h1>
            <p className="text-xs text-slate-400">Dispatch cargo, calculate pack allocations, generate House Bill of Lading (HBL) logs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shipment / client / bill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setIsNewOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Produce Freight</span>
          </button>
        </div>
      </div>

      {/* Left panel (directory list) + Right panel (Cargo workspace detail coordinator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Shipment list */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm h-[720px] flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-400 uppercase tracking-wider">
            Consignment Indexes ({filtered.length})
          </div>
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No active freights active.</div>
            ) : (
              filtered.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => { setSelected(s); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`p-4 cursor-pointer transition flex justify-between items-start ${
                    selected?.id === s.id ? 'bg-indigo-50/70 border-r-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{s.shipmentNumber}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        s.shipmentType === 'Export' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {s.shipmentType}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">{s.clientName}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Origin: {s.origin}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Pod: {s.pod || s.destination}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] bg-white border border-slate-200 px-1 rounded font-mono text-slate-500 block">
                      HBL: {s.hblNumber || 'TBD'}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">{s.originETD}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Tabbed sub-sheet Operation room */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm h-[720px] flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <Anchor className="w-8 h-8 text-slate-300 animate-spin" />
              <p className="text-sm">Select any consignment from directory to work on bills & pack logs.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Shipment Header info summary */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">
                    Operational cargo workspace
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <span>{selected.clientName}</span>
                    <span className="font-mono text-sm text-slate-400 font-normal">({selected.shipmentNumber})</span>
                  </h2>
                  <div className="text-xs text-slate-500 flex items-center flex-wrap gap-x-2 gap-y-1">
                    <span>Mode: <strong className="text-slate-700 font-medium">{selected.transportMode}</strong></span>
                    <span>•</span>
                    <span>Carrier: <strong className="text-slate-700 font-medium">{selected.carrier || 'TBD'}</strong></span>
                    <span>•</span>
                    <span className="bg-cyan-50 text-cyan-800 text-[10px] px-1.5 rounded font-mono border border-cyan-100">
                      BILL NO: {selected.hblNumber || 'NOT ISSUED'}
                    </span>
                  </div>
                </div>

                {/* Print Report Option */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onViewReport(selected)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-1.5 text-xs font-semibold shadow-sm transition"
                    title="Generate HBL PDF Report"
                  >
                    <Printer className="w-4 h-4" />
                    <span>View HBL Report</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateShipmentCore({ status: selected.status === 'Open' ? 'Closed' : 'Open' })}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      selected.status === 'Open' ? 'hover:bg-slate-50 border-slate-200 text-slate-600' : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                    }`}
                  >
                    {selected.status === 'Open' ? 'Close Consignment' : 'Re-open Con.'}
                  </button>
                </div>
              </div>

              {/* Submodule tabs switcher */}
              <div className="bg-white border-b border-slate-100 px-6 flex space-x-6 text-sm text-slate-500 overflow-x-auto select-none">
                <button onClick={() => setActiveTab('hbl')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'hbl' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-800'}`}>House Lading Bill (HBL)</button>
                <button onClick={() => setActiveTab('pack')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'pack' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-800'}`}>Pack Allocation ({selected.packAllocations.length})</button>
                <button onClick={() => setActiveTab('edi')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'edi' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-800'}`}>EDI details</button>
                <button onClick={() => setActiveTab('pickup')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'pickup' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-800'}`}>Pickup & Delivery DO</button>
                <button onClick={() => setActiveTab('email')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'email' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-800'}`}>Client Alerts Hub</button>
              </div>

              {/* Main Content inside Tabs */}
              <div className="p-6 flex-1 overflow-y-auto bg-slate-50/20">
                
                {/* TAB 1: CORE LADING & HBL RULES */}
                {activeTab === 'hbl' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        <span>Core Carriage & HBL Particulars</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">SHIPMENT TYPE (DIRECTION)</label>
                          <select 
                            value={selected.shipmentType} 
                            onChange={(e) => handleUpdateShipmentCore({ shipmentType: e.target.value as ShipmentType })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-medium"
                          >
                            <option value="Export">Export Shipment</option>
                            <option value="Import">Import Shipment</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">HOUSE BILL OF LADING NUMBER</label>
                          <input 
                            type="text" 
                            value={selected.hblNumber}
                            onChange={(e) => handleUpdateShipmentCore({ hblNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800"
                            disabled={selected.shipmentType === 'Export'}
                            placeholder={selected.shipmentType === 'Export' ? 'Generated auto equal to S-number' : 'Enter HBL identifier manually'}
                          />
                          {selected.shipmentType === 'Export' && (
                            <span className="text-[10px] text-slate-400 mt-1 block italic text-indigo-600">Export shipment triggers Auto numbering: HBL will always match {selected.shipmentNumber}.</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">HBL STATUS</label>
                          <select 
                            value={selected.hblStatus} 
                            onChange={(e) => handleUpdateShipmentCore({ hblStatus: e.target.value as HBLStatus })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-semibold text-indigo-600"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Draft Approved">Draft Approved</option>
                            <option value="Issued">Issued</option>
                            <option value="Released">Released</option>
                            <option value="Surrendered">Surrendered</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DELIVERY RELEASE MODE</label>
                          <select 
                            value={selected.hblDeliveryMode} 
                            onChange={(e) => handleUpdateShipmentCore({ hblDeliveryMode: e.target.value as HBLDeliveryMode })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded text-slate-700"
                          >
                            <option value="Original OBL">Original OBL release</option>
                            <option value="Telex Release">Telex Release</option>
                            <option value="Sea Waybill">Sea Waybill</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">ON BOARD DATE</label>
                          <input 
                            type="date" 
                            value={selected.onBoardDate || ''}
                            onChange={(e) => handleUpdateShipmentCore({ onBoardDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">SHIPPER PARTICULAR ADDRESS</label>
                          <textarea 
                            value={selected.shipper || ''} 
                            onChange={(e) => handleUpdateShipmentCore({ shipper: e.target.value })}
                            rows={2} 
                            className="p-2 w-full bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs" 
                            placeholder="BMW Germany HQ address..."
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">CONSIGNEE PARTICULAR ADDRESS</label>
                          <textarea 
                            value={selected.consignee || ''} 
                            onChange={(e) => handleUpdateShipmentCore({ consignee: e.target.value })}
                            rows={2} 
                            className="p-2 w-full bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs" 
                            placeholder="BMW Japan Port Corp..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">POL (Port of loading)</label>
                          <input type="text" value={selected.pol || ''} onChange={(e) => handleUpdateShipmentCore({ pol: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">POL ETD DATE</label>
                          <input type="date" value={selected.polETD || ''} onChange={(e) => handleUpdateShipmentCore({ polETD: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">POD (Port of Discharge)</label>
                          <input type="text" value={selected.pod || ''} onChange={(e) => handleUpdateShipmentCore({ pod: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">ON BOARD SHIPPED NOTE</label>
                          <input type="text" value={selected.onBoardNote || ''} onChange={(e) => handleUpdateShipmentCore({ onBoardNote: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" placeholder="CLEAN ON BOARD OCEAN VESSEL DEPARTED" />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">REMARKS & EXCEPTIONS</label>
                          <input type="text" value={selected.remarks || ''} onChange={(e) => handleUpdateShipmentCore({ remarks: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" />
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: SUBMODULE - PACK ALLOCATIONS */}
                {activeTab === 'pack' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Add Pack Form */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                        <Package className="w-4 h-4 text-indigo-500" />
                        <span>Allocate Container Cargo / Pack Details</span>
                      </h3>

                      <form onSubmit={handleAddPack} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="col-span-2">
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Commodity Description *</label>
                          <input required type="text" value={commDesc} onChange={e=>setCommDesc(e.target.value)} placeholder="Lithium-Ion electric assemblies" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Num Pieces *</label>
                          <input required type="number" min={1} value={pieces} onChange={e=>setPieces(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Pack Type *</label>
                          <input required type="text" value={packagesText} onChange={e=>setPackagesText(e.target.value)} placeholder="Wooden Pallets" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Gross Weight (kg)</label>
                          <input type="number" value={grossWeight} onChange={e=>setGrossWeight(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Net Weight (kg)</label>
                          <input type="number" value={netWeight} onChange={e=>setNetWeight(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">CBM (Volume)</label>
                          <input type="number" step="0.01" value={volumeCBM} onChange={e=>setVolumeCBM(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Package Code</label>
                          <input type="text" value={packageType} onChange={e=>setPackageType(e.target.value)} placeholder="PLT" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Temperature Conditions</label>
                          <input type="text" value={tempCtrl} onChange={e=>setTempCtrl(e.target.value)} placeholder="+15C to +25C climate check" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">HS Tariff Code</label>
                          <input type="text" value={hsCodeVal} onChange={e=>setHsCodeVal(e.target.value)} placeholder="8507.60.00" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Commodity Code</label>
                          <input type="text" value={commCode} onChange={e=>setCommCode(e.target.value)} placeholder="BMW-BAT" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 col-span-2">
                          <div>
                            <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Ready Date</label>
                            <input type="date" value={readyDate} onChange={e=>setReadyDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                          </div>
                          <div>
                            <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Received Date</label>
                            <input type="date" value={receivedDate} onChange={e=>setReceivedDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                          </div>
                        </div>

                        <div className="col-span-2 flex items-end">
                          <button type="submit" className="w-full p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded">
                            Add Pack Allocation
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Loaded allocations listing */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocated Bundles ({selected.packAllocations.length})</div>
                      {selected.packAllocations.length === 0 ? (
                        <div className="bg-white p-6 text-center text-xs text-slate-400 border border-slate-100 rounded-lg">No packs logged yet. Complete form to bind packs.</div>
                      ) : (
                        selected.packAllocations.map((pa) => (
                          <div key={pa.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-800 text-sm">{pa.commodityDescription}</div>
                              <div className="text-slate-500 flex space-x-4">
                                <span>Packs: <strong className="text-slate-700">{pa.numberOfPieces}x {pa.packages} ({pa.packageType})</strong></span>
                                <span>Gross Wt: <strong className="text-slate-700">{pa.grossWeight} kg</strong></span>
                                <span>Vol: <strong className="text-slate-700">{pa.volumeCBM} cbm</strong></span>
                              </div>
                              {pa.temperatureControl && (
                                <span className="bg-rose-50 text-rose-700 font-semibold text-[10px] px-1 py-0.2 rounded border border-rose-100 uppercase">
                                  Temp: {pa.temperatureControl}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleDeletePack(pa.id)}
                              className="p-1 text-slate-300 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 3: SUBMODULE - EDI DETAILS */}
                {activeTab === 'edi' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                        <Layers className="w-4 h-4 text-violet-500" />
                        <span>Electronic Data Interchange (EDI) Details</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">MRN CUSTOMS NUMBER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.ediDetails?.mrnNumber || ''} 
                            placeholder="MRN-DE-998..."
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { mrnNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono font-medium text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">MRN GENERAL DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.ediDetails?.mrnDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { mrnDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">IMPORT GENERAL MANIFEST (IGM) NO</label>
                          <input 
                            type="text" 
                            defaultValue={selected.ediDetails?.igmNumber || ''} 
                            placeholder="IGM-6623..."
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { igmNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">EDI ITEM NUMBER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.ediDetails?.itemNumber || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { itemNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">EDI LINE NUMBER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.ediDetails?.lineNumber || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { lineNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">IGM LOG DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.ediDetails?.igmDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { igmDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">CARGO MANIFEST DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.ediDetails?.cargoDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { cargoDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">VESSEL / SEA NUMBER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.ediDetails?.vesselNumber || ''} 
                            placeholder="HL-VAL-901"
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { vesselNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded text-slate-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">BRN BOOKING REF NUMBER (BRN)</label>
                          <input 
                            type="text" 
                            defaultValue={selected.ediDetails?.brnNumber || ''} 
                            placeholder="BRN-994..."
                            onBlur={(e) => handleUpdateSubmoduleDetails('edi', { brnNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" 
                          />
                        </div>
                      </div>

                      <div className="text-slate-400 text-[11px] font-mono italic">Notes: Inputs automatically sync on loss of focus (on blur action). Feel free to edit.</div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SUBMODULE - PICKUP & DELIVERY DO */}
                {activeTab === 'pickup' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Submodule: Pickup and CFS */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                        <Truck className="w-4 h-4 text-sky-500" />
                        <span>Pickup Instructions & CFS Cargo Origin</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">PICKUP TRUCKING AGENT</label>
                          <input 
                            type="text" 
                            defaultValue={selected.pickup?.pickupAgent || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { pickupAgent: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">SHIPPER REFERENCE NUMBER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.pickup?.shipperReferenceNumber || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { shipperReferenceNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">CFS TRANSIT LOCATION</label>
                          <input 
                            type="text" 
                            defaultValue={selected.pickup?.cfsTransit || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { cfsTransit: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DUE RECEIPT DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.pickup?.receiptRequestedDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { receiptRequestedDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DUE DISPATCH DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.pickup?.dispatchRequestedDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { dispatchRequestedDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">EXPORT CUSTOMS BROKER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.pickup?.exportBroker || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { exportBroker: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">TRANSPORT COMPANY</label>
                          <input 
                            type="text" 
                            defaultValue={selected.pickup?.transportCompany || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('pickup', { transportCompany: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submodule: Delivery and Delivery Order */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Generate Delivery Order (DO) & NOC</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">NOC NUMBER (NO OBJECTION CERT)</label>
                          <input 
                            type="text" 
                            defaultValue={selected.delivery?.nocNumber || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('delivery', { nocNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono font-semibold" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">NOC CLEARANCE DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.delivery?.nocDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('delivery', { nocDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DELIVERING AGENT COMPANY</label>
                          <input 
                            type="text" 
                            defaultValue={selected.delivery?.deliveryAgent || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('delivery', { deliveryAgent: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded text-slate-700 font-semibold" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DELIVERY ORDER NUMBER</label>
                          <input 
                            type="text" 
                            defaultValue={selected.delivery?.deliveryOrderNumber || ''} 
                            placeholder="DO-SGP-..."
                            onBlur={(e) => handleUpdateSubmoduleDetails('delivery', { deliveryOrderNumber: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono text-emerald-700 font-bold" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DO GENERATED DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.delivery?.deliveryOrderDate || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('delivery', { deliveryOrderDate: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DO VALIDITY CLEARANCE DATE</label>
                          <input 
                            type="date" 
                            defaultValue={selected.delivery?.deliveryOrderValidity || ''} 
                            onBlur={(e) => handleUpdateSubmoduleDetails('delivery', { deliveryOrderValidity: e.target.value })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-bold text-rose-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DELIVERY ORDER STATUS</label>
                          <select 
                            defaultValue={selected.delivery?.deliveryOrderStatus || 'Pending'} 
                            onChange={(e) => handleUpdateSubmoduleDetails('delivery', { deliveryOrderStatus: e.target.value as any })}
                            className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-bold text-slate-800"
                          >
                            <option value="Pending">Pending Audit</option>
                            <option value="Draft">Draft DO</option>
                            <option value="Released">Released (DO validity open)</option>
                            <option value="Completed">Completed and Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 5: SUBMODULE - EMAIL ALERTS BROADCAST HISTORY */}
                {activeTab === 'email' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Send email dialog form */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                        <Mail className="w-4 h-4 text-violet-500" />
                        <span>Send Automated Client Shipment Pre-Alert / Release Advice</span>
                      </h3>

                      <form onSubmit={handleSendEmailNotif} className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">NOTIFICATION TEMPLATE VERTICAL</label>
                            <select 
                              value={emailTypeVal} 
                              onChange={(e) => { setEmailTypeVal(e.target.value); loadTemplate(e.target.value); }}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs select-none"
                            >
                              <option value="Pre-Alert Notification">Ocean Cargo Dispatch Pre-Alert</option>
                              <option value="Telex Release Advice">Telex Delivery DO Release Advice</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">RECIPIENT EMAIL (TO) *</label>
                            <input 
                              required 
                              type="email" 
                              value={emailTo} 
                              onChange={(e) => setEmailTo(e.target.value)} 
                              placeholder="client-desk@bmw.co.jp"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">CC EMAIL</label>
                            <input 
                              type="text" 
                              value={emailCc} 
                              onChange={(e) => setEmailCc(e.target.value)} 
                              placeholder="docs@forwarderp.com"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">BCC EMAIL</label>
                            <input 
                              type="text" 
                              value={emailBcc} 
                              onChange={(e) => setEmailBcc(e.target.value)} 
                              placeholder="archive@forwarderp.com"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">EMAIL BODY STATEMENT</label>
                          <textarea 
                            rows={4} 
                            value={emailTemplate} 
                            onChange={(e) => setEmailTemplate(e.target.value)} 
                            placeholder="Type email body here..."
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded text-xs flex items-center space-x-1.5">
                            <Send className="w-3.5 h-3.5" />
                            <span>Broadcast simulated pre-alert notification</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Email history logger trail */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatched Alerts Trail ({selected.emails?.length || 0})</div>
                      {!selected.emails || selected.emails.length === 0 ? (
                        <div className="bg-white p-6 border border-slate-100 rounded-xl text-center text-xs text-slate-300">No sent emails logged for this consignment.</div>
                      ) : (
                        selected.emails.map((e) => (
                          <div key={e.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-2 text-xs">
                            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                              <div>
                                <span className="font-bold text-slate-800 text-xs">{e.emailType}</span>
                                <div className="text-[10px] text-slate-400">To: <span className="text-indigo-600 font-medium">{e.to}</span> cc: {e.cc || 'nil'}</div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono italic">{new Date(e.sentAt).toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap italic">
                              "{e.template}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW CONSIGNMENT SHEET MODAL */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-800">Generate Active Carriage Consignment</h2>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCarriage} className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CLIENT NAME *</label>
                  <input required type="text" value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Volkswagen Group" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">FREIGHT OPERATIONAL BRANCH</label>
                  <select value={branch} onChange={e=>setBranch(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded">
                    <option>Germany Hamburg Branch</option>
                    <option>Singapore Pasir Panjang Hub</option>
                    <option>New York Cargo HQ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CARRIAGE DIRECTION *</label>
                  <select value={shipmentType} onChange={e=>setShipmentType(e.target.value as ShipmentType)} className="p-2 w-full border border-slate-200 rounded">
                    <option value="Export">Export Con. (Auto-Generates Bill Number)</option>
                    <option value="Import">Import Con. (Manually Type HBL Number below)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">TRANSPORTATION MODE</label>
                  <select value={transportMode} onChange={e=>setTransportMode(e.target.value as TransportMode)} className="p-2 w-full border border-slate-200 rounded">
                    <option value="Ocean">Ocean Freight Cargo</option>
                    <option value="Air">Air Freight Cargo</option>
                    <option value="Road">Road Linehaul</option>
                    <option value="Rail">Rail Carrier</option>
                  </select>
                </div>
              </div>

              {shipmentType === 'Import' && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 animate-fade-in">
                  <label className="block text-xs font-bold text-amber-800 mb-1">MANUAL RECORD BILL OF LADING NO *</label>
                  <input required type="text" value={hblNumber} onChange={e=>setHblNumber(e.target.value)} placeholder="HBL-CO-REF-88" className="w-full p-2 text-xs bg-white border border-slate-200 rounded font-mono font-bold text-slate-800" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DESTINATION STATION *</label>
                  <input required type="text" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Los Angeles Port" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ORIGIN STATION *</label>
                  <input required type="text" value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Hamburg Warehouse Area" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ORIGIN ETD DATE</label>
                  <input type="date" value={originETD} onChange={e=>setOriginETD(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DESTINATION ETA DATE</label>
                  <input type="date" value={destinationETA} onChange={e=>setDestinationETA(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CARRIER LINE</label>
                  <input type="text" value={carrier} onChange={e=>setCarrier(e.target.value)} placeholder="Hapag-Lloyd / Maersk" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SERVICE FORMAT</label>
                  <input type="text" value={serviceType} onChange={e=>setServiceType(e.target.value)} placeholder="FCL/FCL, Door-to-Door" className="w-full p-2 text-xs border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SHIPPER DETAILS (FULL ADDRESS STYLE)</label>
                  <textarea rows={2} value={shipper} onChange={e=>setShipper(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CONSIGNEE DETAILS (FULL ADDRESS STYLE)</label>
                  <textarea rows={2} value={consignee} onChange={e=>setConsignee(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded"></textarea>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsNewOpen(false)} className="px-4 py-2 border border-slate-200 rounded text-xs text-slate-500 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-xs font-bold text-white hover:bg-indigo-700">Audit & Save Consignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Wrapper for submit mapping
  function handleCreateCarriage(e: React.FormEvent) {
    handleCreateShipment(e);
  }
};
