/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  X, 
  Layers3, 
  Container, 
  Calculator, 
  GitCommit, 
  Edit, 
  RefreshCcw, 
  MapPin 
} from 'lucide-react';
import { Consol, ConsolStatus, ConsolContainer, WeightDetails, RoutingLeg } from '../types';
import { apiService } from '../services/api';

interface ConsolManagerProps {
  consols: Consol[];
  onRefresh: () => void;
  currentUser: { username: string; role: string } | null;
}

export const ConsolManager: React.FC<ConsolManagerProps> = ({ 
  consols, 
  onRefresh, 
  currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<Consol[]>(consols);
  const [selected, setSelected] = useState<Consol | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'containers' | 'routing'>('details');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // CREATE NEW CONSOL FIELDS
  const [branch, setBranch] = useState('Singapore Branch');
  const [organizationName, setOrganizationName] = useState('');
  const [transportMode, setTransportMode] = useState<'Ocean' | 'Air' | 'Road' | 'Rail'>('Ocean');
  const [containerMode, setContainerMode] = useState<'FCL' | 'LCL'>('LCL');
  const [consolMode, setConsolMode] = useState<'Direct' | 'Multi-Stop'>('Direct');
  const [directionFlag, setDirectionFlag] = useState<'Import' | 'Export'>('Export');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originETD, setOriginETD] = useState('');
  const [destinationETA, setDestinationETA] = useState('');
  const [hazardous, setHazardous] = useState(false);
  const [hazardousType, setHazardousType] = useState('');
  const [department, setDepartment] = useState('LCL Export');

  // SUBMODULES FORM: CONTAINER DETAIL ADD
  const [containerNum, setContainerNum] = useState('');
  const [contCount, setContCount] = useState(1);
  const [contType, setContType] = useState<'20GP' | '40GP' | '40HQ' | '40RF' | '20RF' | 'FlatRack'>('40HQ');
  const [deliveryMode, setDeliveryMode] = useState('CFS/CFS');
  const [sealNumber, setSealNumber] = useState('');
  const [sealedBy, setSealedBy] = useState('Customs');
  const [commCode, setCommCode] = useState('MIX-GEN');

  // SUBMODULES FORM: ROUTING LEG ADD
  const [legCarrier, setLegCarrier] = useState('');
  const [legPol, setLegPol] = useState('');
  const [legPolETD, setLegPolETD] = useState('');
  const [legPodETA, setLegPodETA] = useState('');
  const [legVessel, setLegVessel] = useState('');
  const [legVoyage, setLegVoyage] = useState('');

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const res = consols.filter(c => 
      c.consolNumber.toLowerCase().includes(term) ||
      c.organizationName.toLowerCase().includes(term) ||
      c.origin.toLowerCase().includes(term) ||
      c.destination.toLowerCase().includes(term)
    );
    setFiltered(res);
    if (res.length > 0 && !selected) {
      setSelected(res[0]);
    }
  }, [searchTerm, consols]);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'Operations Executive' || currentUser?.role === 'Manager';

  // Create consolidation
  const handleCreateConsolObj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName || !origin || !destination) {
      setErrorMsg('Organization name, Origin, and Destination are required.');
      return;
    }

    try {
      const created = await apiService.createConsol({
        branch, organizationName, transportMode, containerMode, consolMode, directionFlag,
        origin, destination, originETD, destinationETA, hazardous, hazardousType, department,
        carrier: 'CO-Evergreen', pol: origin, polETD: originETD, pod: destination, podETA: destinationETA,
        vesselName: 'Carrier Vessel TBD', voyageNumber: '001W', sendingAgent: 'HQ Singapore', receivingAgent: 'HQ Rotterdam',
        weightDetails: { dunnageWeight: 350, goodsWeight: 14000, grossWeight: 17850, netWeight: 14350, tareWeight: 3500 }
      });

      setSuccessMsg(`Consol unit ${created.consolNumber} deployed.`);
      setIsNewOpen(false);
      setSelected(created);
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Update Core consolidation fields
  const handleUpdateConsolCore = async (chunk: Partial<Consol>) => {
    if (!selected) return;
    try {
      const updated = await apiService.updateConsol(selected.id, chunk);
      setSelected(updated);
      setSuccessMsg('Consol variables saved successfully.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Add packed container list
  const handleAddNewContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!containerNum) {
      setErrorMsg('Unique container unit code is required.');
      return;
    }

    try {
      const updated = await apiService.addConsolContainer(selected.id, {
        containerNumber: containerNum,
        containerCount: contCount,
        containerType: contType,
        deliveryMode,
        sealNumber,
        sealedBy,
        commodityCode: commCode,
        containerMode: selected.containerMode
      });

      setSelected(updated);
      setSuccessMsg('Assigned container unit to Consol loop.');
      setContainerNum('');
      setSealNumber('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Add routing leg list
  const handleAddNewRoutingLeg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!legPol || !legPolETD || !legPodETA) {
      setErrorMsg('POL address and departure dates are required.');
      return;
    }

    try {
      const updated = await apiService.addConsolLeg(selected.id, {
        carrier: legCarrier || selected.carrier,
        transportMode: selected.transportMode,
        pol: legPol,
        polETD: legPolETD,
        podETA: legPodETA,
        vesselName: legVessel,
        voyageNumber: legVoyage,
        remarks: 'Direct Consol Route segment.'
      });

      setSelected(updated);
      setSuccessMsg('Routing leg configured.');
      setLegPol('');
      setLegPolETD('');
      setLegPodETA('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6" id="consol-management">
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

      {/* Main Header Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Operational Consolidation (Consol)</h1>
            <p className="text-xs text-slate-400">Consolidate multiple LCL/FCL container loads, route legs, and calculate payload cargo dunnage heights</p>
          </div>
        </div>

        {/* Searching and Creation */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Consol reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button 
            onClick={() => setIsNewOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Setup Consol</span>
          </button>
        </div>
      </div>

      {/* Primary Split Console layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Consol Unit indices list */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm h-[720px] flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-450 uppercase tracking-widest text-[#5A6E85]">
            Consol Register ({filtered.length})
          </div>
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs text-slate-400">No consol logs recorded. Select "Setup Consol" to initialize.</div>
            ) : (
              filtered.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => { setSelected(c); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`p-4 cursor-pointer transition flex justify-between items-start ${
                    selected?.id === c.id ? 'bg-emerald-50/70 border-r-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{c.consolNumber}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-650 px-1 py-0.2 rounded font-semibold uppercase">{c.consolStatus}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[200px]">{c.organizationName}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Route: {c.origin} to {c.destination}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-white border border-slate-200 px-1 rounded font-mono text-emerald-800 font-bold">
                      {c.containerMode} · {c.directionFlag}
                    </span>
                    <span className="text-[9px] text-slate-405 block font-mono mt-1 text-slate-400">{c.originETD}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Consol detailed sub-tabs controller layout */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm h-[720px] flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Layers className="w-8 h-8 text-emerald-300 animate-pulse mb-1" />
              <div className="text-sm">Identify a Consol grouping list on left panel to begin loading parameters.</div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              
              {/* Top Summary Banner */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Global consolidation dispatcher</div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <span>{selected.organizationName}</span>
                    <span className="font-mono text-sm text-slate-400 font-normal">({selected.consolNumber})</span>
                  </h2>
                  <div className="text-xs text-slate-500 flex items-center flex-wrap gap-x-2 gap-y-1">
                    <span>Dep.: <strong className="text-slate-705 font-medium">{selected.department}</strong></span>
                    <span>•</span>
                    <span>Consol: <strong className="text-slate-705 font-medium">{selected.consolMode}</strong></span>
                    <span>•</span>
                    <span className={`inline-block text-[9px] px-1.5 rounded font-bold uppercase cursor-pointer bg-slate-100 text-slate-650`}>
                      STATUS: {selected.consolStatus}
                    </span>
                  </div>
                </div>

                {/* status updates buttons */}
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold select-none">
                  <span className="text-[11px] uppercase text-slate-400 font-bold">change status:</span>
                  <select 
                    value={selected.consolStatus} 
                    onChange={(e) => handleUpdateConsolCore({ consolStatus: e.target.value as ConsolStatus })}
                    className="p-1.5 border border-slate-200 bg-white rounded"
                  >
                    <option value="Open">Open (Pending)</option>
                    <option value="Planned">Planned</option>
                    <option value="Loaded">Loaded (Ready)</option>
                    <option value="Sailed">Sailed (Voyaging)</option>
                    <option value="Arrived">Arrived (Destination)</option>
                    <option value="Closed">Closed Manifest</option>
                  </select>
                </div>
              </div>

              {/* tabs navigators */}
              <div className="bg-white border-b border-slate-100 px-6 flex space-x-6 text-sm text-slate-500 overflow-x-auto select-none shrink-0">
                <button onClick={() => setActiveTab('details')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'details' ? 'border-emerald-600 text-emerald-650 font-bold' : 'border-transparent hover:text-slate-800'}`}>Manifest details</button>
                <button onClick={() => setActiveTab('containers')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'containers' ? 'border-emerald-600 text-emerald-650 font-bold' : 'border-transparent hover:text-slate-800'}`}>Containers ({selected.containers.length})</button>
                <button onClick={() => setActiveTab('routing')} className={`py-3 font-semibold border-b-2 tracking-tight transition ${activeTab === 'routing' ? 'border-emerald-600 text-emerald-650 font-bold' : 'border-transparent hover:text-slate-800'}`}>Routing Legs ({selected.routingDetails.length})</button>
              </div>

              {/* workspace inner section */}
              <div className="p-6 flex-1 overflow-y-auto bg-slate-50/20">
                
                {/* TAB A: CORE MANIFESTS AND Dunage weight calculators */}
                {activeTab === 'details' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Weight calculator metrics widget */}
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] text-emerald-700 font-mono font-bold uppercase tracking-wider">Dynamic Payload Summation Panel</div>
                        <h3 className="text-sm font-bold text-emerald-900 leading-tight">Manifest Container Payload parameters (Gross Wt / Tare Wt Integration)</h3>
                        <p className="text-[11px] text-emerald-600 italic">Self-calculating weights including dunnage block arrays automatically.</p>
                      </div>
                      <Calculator className="w-10 h-10 text-emerald-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Weights form block */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3.5 text-xs">
                        <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest border-b border-slate-50 pb-2">Load Capacity Matrix</h4>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">GOODS MANIFEST NET WEIGHT (kg)</label>
                            <input 
                              type="number" 
                              value={selected.weightDetails?.goodsWeight || 12000} 
                              onChange={(e) => handleUpdateConsolCore({ 
                                weightDetails: { 
                                  ...selected.weightDetails, 
                                  goodsWeight: Number(e.target.value),
                                  grossWeight: Number(e.target.value) + (selected.weightDetails?.tareWeight || 3500) + (selected.weightDetails?.dunnageWeight || 300)
                                } 
                              })}
                              className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-bold" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">CONTAINER TARE WEIGHT (kg)</label>
                            <input 
                              type="number" 
                              value={selected.weightDetails?.tareWeight || 3500} 
                              onChange={(e) => handleUpdateConsolCore({ 
                                weightDetails: { 
                                  ...selected.weightDetails, 
                                  tareWeight: Number(e.target.value),
                                  grossWeight: (selected.weightDetails?.goodsWeight || 12000) + Number(e.target.value) + (selected.weightDetails?.dunnageWeight || 300)
                                } 
                              })}
                              className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded text-slate-500" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px] mb-1">DUNNAGE CARGO STABILIZERS WEIGHT (kg)</label>
                            <input 
                              type="number" 
                              value={selected.weightDetails?.dunnageWeight || 300} 
                              onChange={(e) => handleUpdateConsolCore({ 
                                weightDetails: { 
                                  ...selected.weightDetails, 
                                  dunnageWeight: Number(e.target.value),
                                  grossWeight: (selected.weightDetails?.goodsWeight || 12000) + (selected.weightDetails?.tareWeight || 3500) + Number(e.target.value)
                                } 
                              })}
                              className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-medium" 
                            />
                          </div>
                          <div className="bg-emerald-50/50 p-2 border border-emerald-100 rounded-lg">
                            <span className="text-emerald-700 font-extrabold block text-[9px] uppercase tracking-wider">CALCULATED TOTAL GROSS WEIGHT</span>
                            <span className="font-mono text-emerald-900 font-extrabold text-sm mt-0.5 block">
                              {selected.weightDetails?.grossWeight || (selected.weightDetails?.goodsWeight || 0) + (selected.weightDetails?.tareWeight || 0) + (selected.weightDetails?.dunnageWeight || 0)} kg
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ports and route form block */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3.5 text-xs">
                        <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest border-b border-slate-50 pb-2">Execution particulars</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px]">POL STATION</label>
                            <input type="text" value={selected.pol || ''} onChange={e=>handleUpdateConsolCore({ pol: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px]">POL ETD DATE</label>
                            <input type="date" value={selected.polETD || ''} onChange={e=>handleUpdateConsolCore({ polETD: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px]">POD DISCHARGE STATION</label>
                            <input type="text" value={selected.pod || ''} onChange={e=>handleUpdateConsolCore({ pod: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded" />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold uppercase text-[9px]">POD ETA DATE</label>
                            <input type="date" value={selected.podETA || ''} onChange={e=>handleUpdateConsolCore({ podETA: e.target.value })} className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-2 text-[11px]">
                          <div>
                            <span className="text-slate-405 block text-[9px] uppercase font-bold text-slate-400">SENDING AGENT</span>
                            <span className="font-semibold text-slate-700">{selected.sendingAgent}</span>
                          </div>
                          <div>
                            <span className="text-slate-405 block text-[9px] uppercase font-bold text-slate-400">RECEIVING DESTINATION AGENT</span>
                            <span className="font-semibold text-slate-700">{selected.receivingAgent}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB B: SUBMODULE - CONSOL CONTAINERS packing logs */}
                {activeTab === 'containers' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Container load form block */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                        <Container className="w-4 h-4 text-emerald-500" />
                        <span>Log Consortia Loaded Container Units</span>
                      </h3>

                      <form onSubmit={handleAddNewContainer} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">Container Number *</label>
                          <input required type="text" value={containerNum} onChange={e=>setContainerNum(e.target.value)} placeholder="EMCU-881902" className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold placeholder:font-normal uppercase" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">COUNT</label>
                          <input type="number" min={1} value={contCount} onChange={e=>setContCount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded font-mono" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">TYPE SIZE</label>
                          <select value={contType} onChange={e=>setContType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 bg-white rounded font-medium text-slate-700">
                            <option value="20GP">20' General Purpose</option>
                            <option value="40GP">40' General Purpose</option>
                            <option value="40HQ">40' High Cube (HC)</option>
                            <option value="40RF">40' Reefer</option>
                            <option value="20RF">20' Reefer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">DELIVERY PATTERN</label>
                          <input type="text" value={deliveryMode} onChange={e=>setDeliveryMode(e.target.value)} placeholder="CY/CY, CFS/CFS" className="w-full p-1.5 border border-slate-200 rounded font-mono" />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">SEAL BARCODE NUMBER</label>
                          <input type="text" value={sealNumber} onChange={e=>setSealNumber(e.target.value)} placeholder="SL-90112" className="w-full p-1.5 border border-slate-200 rounded font-mono" />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">SEALED BY STATUS</label>
                          <select value={sealedBy} onChange={e=>setSealedBy(e.target.value)} className="w-full p-1.5 border border-slate-200 bg-white rounded text-slate-705">
                            <option>Customs Bureau</option>
                            <option>Carrier Line</option>
                            <option>Shipper Factory</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">COMMODITY SEC CODE</label>
                          <input type="text" value={commCode} onChange={e=>setCommCode(e.target.value)} placeholder="MIX-LCL-GEN" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>

                        <div className="flex items-end">
                          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded w-full transition">
                            Pack Container Unit
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Loaded container inventories list */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-slate-400">Locked container items in this Consol manifest ({selected.containers.length})</div>
                      {selected.containers.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-xs text-slate-350">No container units loaded under consol manifest yet.</div>
                      ) : (
                        selected.containers.map((c) => (
                          <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-mono text-sm text-slate-905 font-extrabold uppercase bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded mr-1.5">
                                {c.containerNumber}
                              </span>
                              <div className="text-slate-500 flex space-x-4 mt-1">
                                <span>TYPE Size: <strong className="text-slate-800">{c.containerType} ({c.containerMode})</strong></span>
                                <span>Transit Format: <strong className="text-slate-800">{c.deliveryMode}</strong></span>
                                <span>Seal Ref: <strong className="text-slate-800 font-mono text-[11px] bg-slate-100 px-1 rounded">{c.sealNumber || 'NOT SEALED'}</strong> (By {c.sealedBy})</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-50 px-1 border rounded">COMM: {c.commodityCode}</span>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* TAB C: SUBMODULE - MULTI-STOP ROUTING TRANSIT LEGS */}
                {activeTab === 'routing' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Add legs form block */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                        <GitCommit className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span>Configure Multimodal Consol Routing Legs</span>
                      </h3>

                      <form onSubmit={handleAddNewRoutingLeg} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-550 font-semibold uppercase text-[9px] mb-1">LEG OCEAN CARRIER</label>
                          <input type="text" value={legCarrier} onChange={e=>setLegCarrier(e.target.value)} placeholder="CO-Evergreen / CMA CG" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-550 font-bold uppercase text-[9px] mb-1">LEG POL (Port of Load) *</label>
                          <input required type="text" value={legPol} onChange={e=>setLegPol(e.target.value)} placeholder="SGP Terminal 4, Singapore" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-550 font-bold uppercase text-[9px] mb-1">POL ETD DATE *</label>
                          <input required type="date" value={legPolETD} onChange={e=>setLegPolETD(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded font-mono" />
                        </div>

                        <div>
                          <label className="block text-slate-550 font-semibold uppercase text-[9px] mb-1">Vessel Carrier Name</label>
                          <input type="text" value={legVessel} onChange={e=>setLegVessel(e.target.value)} placeholder="Ever Given" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-550 font-semibold uppercase text-[9px] mb-1">Voyage Number</label>
                          <input type="text" value={legVoyage} onChange={e=>setLegVoyage(e.target.value)} placeholder="0189W" className="w-full p-1.5 border border-slate-200 rounded" />
                        </div>
                        <div>
                          <label className="block text-slate-550 font-bold uppercase text-[9px] mb-1">POD ETA TARGET DATE *</label>
                          <input required type="date" value={legPodETA} onChange={e=>setLegPodETA(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded font-mono" />
                        </div>

                        <div className="col-span-3 flex justify-end">
                          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded transition">
                            Configure Routing Leg Segment
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Routing leg segments overview list */}
                    <div className="space-y-4">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-slate-450">Multi-Stop Voyage Sequence Map ({selected.routingDetails.length})</div>
                      {selected.routingDetails.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-xs text-slate-350">No sub-routing legs recorded. Direct point-to-point trunk active.</div>
                      ) : (
                        <div className="relative border-l-2 border-emerald-100 pl-6 ml-4 space-y-4">
                          {selected.routingDetails.map((leg, index) => (
                            <div key={leg.id} className="relative bg-white p-4 rounded-xl border border-slate-100 shadow-xs text-xs space-y-2">
                              {/* Leg Index bullet */}
                              <div className="absolute -left-[31px] top-6 w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-[8px] text-white">
                                {index + 1}
                              </div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-extrabold text-slate-800 text-sm">{leg.pol} to POD Terminal</div>
                                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Leg {leg.legNumber} Voyage Carrier segment</div>
                                </div>
                                <span className="text-[10px] bg-slate-50 text-emerald-800 font-mono font-semibold px-2 py-0.5 rounded border">
                                  {leg.carrier || 'Ocean Carrier'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-slate-500 border-t border-slate-50 pt-2 text-[11px]">
                                <div>
                                  ETD LOADING: <span className="font-mono text-slate-850 font-bold">{leg.polETD}</span>
                                </div>
                                <div>
                                  ETA EXPECTED: <span className="font-mono text-emerald-800 font-bold">{leg.podETA}</span>
                                </div>
                              </div>
                              {leg.vesselName && (
                                <div className="text-[10px] text-slate-400 font-mono italic">Carrier Vessel context: {leg.vesselName} (Voy: {leg.voyageNumber})</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW CONSOL UNIT FORM MODAL */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-800">Establish Consolidation Manifest Loop</h2>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateConsolObj} className="p-6 overflow-y-auto space-y-4 max-h-[70vh] text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONSOL ORGANIZER NAME / SVO LABEL *</label>
                  <input required type="text" value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Global LCL Consolidation Terminal" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">OPERATIONAL BRANCH OFFICE</label>
                  <input type="text" value={branch} onChange={e=>setBranch(e.target.value)} placeholder="HQ Singapore Office" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">DIRECTION FLAG</label>
                  <select value={directionFlag} onChange={e=>setDirectionFlag(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded font-medium select-none bg-white">
                    <option value="Export">Export Consol</option>
                    <option value="Import">Import Consol</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONTAINER MODE</label>
                  <select value={containerMode} onChange={e=>setContainerMode(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded select-none bg-white font-medium">
                    <option value="LCL">LCL (Less-than-Container Load)</option>
                    <option value="FCL">FCL (Full Container Load)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONSOL PATTERN</label>
                  <select value={consolMode} onChange={e=>setConsolMode(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded bg-white font-medium">
                    <option value="Direct">Point-to-Point Direct</option>
                    <option value="Multi-Stop">Multi-Stop Router</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONSOL STATION DEPARTURE *</label>
                  <input required type="text" value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Singapore Terminal 2 Harbour" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONSOL DESTINATION CONTAINER STATION *</label>
                  <input required type="text" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Rotterdam Gateway Port" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONSL DEPARTURE ETD DATE</label>
                  <input type="date" value={originETD} onChange={e=>setOriginETD(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">CONSL EXPECTED ETA DATE</label>
                  <input type="date" value={destinationETA} onChange={e=>setDestinationETA(e.target.value)} className="w-full p-2 border border-slate-200 rounded"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">IS CONSISTING HAZARDOUS LOADS?</label>
                  <div className="flex items-center space-x-2 p-2 border border-slate-200 rounded bg-slate-50">
                    <input type="checkbox" checked={hazardous} onChange={e=>setHazardous(e.target.checked)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded" />
                    <span className="font-medium text-slate-650">Verify HAZARDOUS load limits</span>
                  </div>
                </div>
                {hazardous && (
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">SPECIFY IMO CHEMICAL HAZARD CLASS *</label>
                    <input required type="text" value={hazardousType} onChange={e=>setHazardousType(e.target.value)} placeholder="Class 3 Flammables" className="w-full p-2 border border-slate-200 rounded"/>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">DEPARTMENT SEGMENT</label>
                  <input type="text" value={department} onChange={e=>setDepartment(e.target.value)} placeholder="LCL Consol Exports Team" className="w-full p-2 border border-slate-200 rounded"/>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">TRANSPORT MEDIA VERTICAL</label>
                  <select value={transportMode} onChange={e=>setTransportMode(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded bg-white">
                    <option value="Ocean">Oceanic Sea Carriage</option>
                    <option value="Air">Air Cargo</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsNewOpen(false)} className="px-4 py-2 border border-slate-200 rounded text-xs text-slate-500 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 rounded text-xs font-bold text-white hover:bg-emerald-700">Deploy Consol Manifest</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
