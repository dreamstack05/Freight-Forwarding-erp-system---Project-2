/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Anchor, 
  PhoneCall, 
  Ship, 
  Users, 
  FileText, 
  ArrowUpRight, 
  Calendar, 
  Layers 
} from 'lucide-react';
import { SalesLead, CallSheet, Shipment, SailingSchedule, Consol } from '../types';

interface DashboardProps {
  leads: SalesLead[];
  callSheets: CallSheet[];
  shipments: Shipment[];
  schedules: SailingSchedule[];
  consols: Consol[];
  onNavigate: (view: string) => void;
  currentUser: { username: string; role: string } | null;
  dbStatus?: { connected: boolean; mode: string; uri: string; error: string | null } | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  callSheets,
  shipments,
  schedules,
  consols,
  onNavigate,
  currentUser,
  dbStatus
}) => {
  // Compute analytics
  const openLeads = leads.filter(l => l.leadStatus !== 'Closed' && l.leadStatus !== 'Lost');
  const activeShipments = shipments.filter(s => s.status === 'Open');
  const plannedConsols = consols.filter(c => c.consolStatus !== 'Closed');
  const pendingCalls = callSheets.filter(c => c.callStatus === 'Follow-up Scheduled');

  // Lead Conversion rate
  const convertedLeads = leads.filter(l => l.conversionStatus === 'Converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;

  // Recent Action Items
  const recentLeads = leads.slice(0, 3);
  const recentShipments = shipments.slice(0, 3);

  return (
    <div className="space-y-4" id="dashboard-main">
      {/* Header Greeting */}
      <div className="bg-[#1E293B] rounded-lg p-4 text-white shadow-sm flex justify-between items-center border border-slate-700">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-blue-100 flex items-center gap-2">
            <span>📊</span> Operational Control Center
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Running Freight Forwarding ERP v2.6. User: <span className="font-semibold text-blue-400 capitalize">{currentUser?.username}</span> [{currentUser?.role}]
          </p>
        </div>
        <div className="hidden md:flex text-right flex-col">
          <span className="text-[10px] text-slate-500 font-mono">SYSTEM DATETIME</span>
          <span className="text-xs font-mono font-medium text-slate-300">2026-06-17 08:16 UTC</span>
        </div>
      </div>

      {/* MongoDB Integration Control Widget */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-tight">Database Integrations:</span>
            {dbStatus?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-250 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                🟢 MongoDB Atlas Connected (Cloud State Active)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-250">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                🟡 Standalone Local DB Buffer (Fallback Active)
              </span>
            )}
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase transition">
              Driver: mongodb driver ^7.3
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            {dbStatus?.connected ? (
              "The ERP system is fully synchronized with your MongoDB deployment. Users, leads, shipments, schedules, and consols are actively secured in Cloud Collections."
            ) : (
              "Your data is persistent locally via sandboxed memory-to-file buffers. To activate production clustering, configure your MONGODB_URI entry in the server configuration."
            )}
          </p>
        </div>
        {!dbStatus?.connected && (
          <div className="flex items-center gap-2 shrink-0 border-l border-slate-100 pl-0 md:pl-4">
            <div className="text-left text-[10px] text-slate-400 font-mono">
              <div className="font-bold text-slate-600 uppercase">MongoDB Atlas Guide:</div>
              <div>1. Create free MongoDB cluster</div>
              <div>2. Add <code className="text-blue-600 font-bold bg-blue-50 px-1 rounded">MONGODB_URI</code> to settings</div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards - High Density Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigate('leads')}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-xs transition flex flex-col justify-between gap-1"
          id="metric-leads"
        >
          <div className="text-[10px] text-slate-500 font-bold uppercase italic">Sales Funnel Leads</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {openLeads.length} <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-1 rounded">▲ {conversionRate}% converted</span>
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Inquiries & conversion pipeline</div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigate('shipments')}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-xs transition flex flex-col justify-between gap-1"
          id="metric-[#F3F4F6]"
        >
          <div className="text-[10px] text-slate-500 font-bold uppercase italic">Active Cargo Transits</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {activeShipments.length} <span className="text-[10px] font-normal text-blue-600 font-mono italic underline">HBL READY</span>
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Ocean & air transits logged</div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigate('schedules')}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-xs transition flex flex-col justify-between gap-1"
          id="metric-schedules"
        >
          <div className="text-[10px] text-slate-500 font-bold uppercase italic">Sailing Voyages Routing</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {schedules.length}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Next departure ETD 2026-06-24</div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigate('consols')}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-xs transition flex flex-col justify-between gap-1"
          id="metric-consols"
        >
          <div className="text-[10px] text-slate-500 font-bold uppercase italic">Consol Unit Loads</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {plannedConsols.length}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Cargo consolidation units</div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Shipment Overview / Quick Action */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Track Critical Shipments</h2>
              <p className="text-xs text-slate-400">Current ocean and air transit coordinates</p>
            </div>
            <button 
              onClick={() => onNavigate('shipments')}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center"
            >
              View All Cargo <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] leading-tight">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-tighter italic">
                <tr className="text-left font-medium">
                  <th className="py-2 px-3">Shipment No</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Route (ETD / ETA)</th>
                  <th className="py-2 px-3">House Bill (HBL)</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600 uppercase">{s.shipmentNumber}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-850">{s.clientName}</div>
                      <div className="text-[10px] text-slate-400">{s.transportMode} · {s.shipmentType}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-700">{s.origin} → {s.destination}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">ETD {s.originETD} · ETA {s.destinationETA}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono bg-cyan-50 text-cyan-700 text-[10px] px-1.5 py-0.5 rounded border border-cyan-100 font-bold">
                        {s.hblNumber || 'UNASSIGNED'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold italic ${
                        s.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status === 'Open' ? 'ON-VESSEL' : s.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Calls Logging / Follow ups */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Warm Follow-ups</h2>
              <p className="text-[10px] text-slate-400">Calls and log schedule triggers</p>
            </div>
            <button 
              onClick={() => onNavigate('callsheets')}
              className="text-blue-650 hover:text-blue-700 text-[10px] font-bold flex items-center gap-0.5"
            >
              Log Call <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {pendingCalls.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No scheduled follow-up calls pending.
              </div>
            ) : (
              pendingCalls.slice(0, 3).map((c) => (
                <div key={c.id} className="p-2.5 bg-blue-50/20 rounded-lg border border-slate-100 flex justify-between items-start gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-bold text-slate-800 text-[11px] leading-tight truncate">{c.organizationName}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{c.contactPerson} · {c.phoneNumber}</div>
                    <div className="text-[10px] text-slate-600 font-mono italic truncate">
                      "{c.remarks}"
                    </div>
                  </div>
                  <div className="bg-white px-2 py-1 rounded border border-slate-200 text-center flex flex-col shrink-0">
                    <Calendar className="w-3 h-3 text-blue-600 mx-auto" />
                    <span className="text-[8px] font-mono font-bold text-blue-700 uppercase mt-0.5">{c.nextFollowUpDate.substring(5)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid Row 3: Sales Leads / Fast Action Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads Pipeline Cards */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Sales Leads Pipeline</h2>
              <p className="text-[10px] text-slate-400">Recent customer inquiries & rating</p>
            </div>
            <button 
              onClick={() => onNavigate('leads')}
              className="text-blue-650 hover:text-blue-700 text-[10px] font-bold flex items-center gap-0.5"
            >
              All Leads <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-2.5 hover:bg-slate-50 rounded border border-slate-100">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      {lead.leadNumber}
                    </span>
                    <span className="font-bold text-slate-800 text-[11px]">{lead.customerName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {lead.interestedService} · Volume: <span className="font-semibold text-slate-700">{lead.expectedShipmentVolume}</span>
                  </div>
                </div>
                <div className="text-right space-y-0.5 shrinks-0">
                  <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    lead.leadRating === 'Hot' ? 'bg-rose-100 text-rose-700' :
                    lead.leadRating === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.leadRating}
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">Date: {lead.leadDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sea Routing Leg Planner Quick reference */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Sailing Voyages Hub</h2>
              <p className="text-[10px] text-slate-400">Carrier schedules and slot cuts</p>
            </div>
            <button 
              onClick={() => onNavigate('schedules')}
              className="text-blue-650 hover:text-blue-700 text-[10px] font-bold flex items-center gap-0.5"
            >
              Sailing Logs <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="p-2.5 bg-blue-50/10 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-700 leading-none">{s.vesselName} (Voy: {s.voyageNumber})</div>
                  <div className="text-[10px] text-slate-500 font-mono">{s.carrierName} · MODE: {s.transportMode}</div>
                  <div className="text-[10px] text-slate-600 font-semibold">
                    {s.pol} <span className="text-slate-400 font-normal">→</span> {s.pod}
                  </div>
                </div>
                <div className="text-right space-y-0.5 shrink-0">
                  <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                    Transit: {s.transitTime}
                  </span>
                  <div className="text-[9px] text-rose-600 font-bold font-mono">Cut: {s.portCutOffDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
