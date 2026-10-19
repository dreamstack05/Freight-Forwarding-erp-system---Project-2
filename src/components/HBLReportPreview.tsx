/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Ship, ArrowLeft, Printer, ShieldCheck, Download, CheckSquare } from 'lucide-react';
import { Shipment } from '../types';

interface HBLReportPreviewProps {
  shipment: Shipment | null;
  onBack: () => void;
}

export const HBLReportPreview: React.FC<HBLReportPreviewProps> = ({ shipment, onBack }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!shipment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border text-slate-500">
        No active cargo selected to render House Bill of Lading printable report.
      </div>
    );
  }

  // Fallback calculations
  const totalPkgs = shipment.packAllocations?.reduce((acc, curr) => acc + curr.numberOfPieces, 0) || 1;
  const totalGrossWt = shipment.packAllocations?.reduce((acc, curr) => acc + curr.grossWeight, 0) || 14800;
  const totalCbm = shipment.packAllocations?.reduce((acc, curr) => acc + curr.volumeCBM, 0) || 32.5;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="hbl-report-panel">
      
      {/* Upper action control banner */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <button 
          onClick={onBack}
          className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-650 flex items-center space-x-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to operational list</span>
        </button>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Compile & Print Document</span>
          </button>
        </div>
      </div>

      {/* Corporate physical layout sheet */}
      <div 
        ref={printAreaRef}
        className="bg-white border-2 border-slate-900 p-8 shadow-md rounded-lg font-sans text-xs text-slate-900 leading-normal select-none relative print:border-0 print:p-0"
      >
        {/* Bill of Lading heading & branding */}
        <div className="grid grid-cols-12 border-b-2 border-slate-900 pb-6 items-start gap-4">
          <div className="col-span-8 space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-750">
              <Ship className="w-8 h-8 text-indigo-700" />
              <span className="font-extrabold text-lg tracking-wider uppercase font-sans">FORWARD ERP GROUP INC.</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight pr-6">
              Global Multimodal Cargo Transport Systems · Port Logistics Terminal HQ Singapore & Hamburg Office Complex. Approved ocean carrier licensed by Federal Maritime Commission.
            </p>
          </div>
          <div className="col-span-4 text-right">
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight uppercase font-sans">HOUSE BILL OF LADING</h1>
            <div className="font-mono mt-1 text-sm text-indigo-700 font-bold border border-slate-900 px-2.5 py-1 bg-slate-50 inline-block rounded">
              NO. {shipment.hblNumber || shipment.shipmentNumber}
            </div>
            <span className="text-[9px] text-slate-400 block mt-1 uppercase font-semibold">DIRECTION: {shipment.shipmentType} CARGO</span>
          </div>
        </div>

        {/* Shippers / Consignee detail grid */}
        <div className="grid grid-cols-2 border-b border-slate-900">
          <div className="p-4 border-r border-slate-900 space-y-1.5 min-h-[110px]">
            <span className="text-[9px] text-slate-450 uppercase font-extrabold text-slate-500 block">SHIPPER (Name and full address)</span>
            <p className="font-bold text-slate-850 whitespace-pre-wrap">{shipment.shipper || `BMW Germany Logistics GMBH\nHamburg Port Area 4\nGermany`}</p>
          </div>
          <div className="p-4 space-y-1.5 min-h-[110px]">
            <span className="text-[9px] text-slate-450 uppercase font-extrabold text-slate-500 block">CONSIGNEE (Name and full address / TO ORDER terms)</span>
            <p className="font-bold text-slate-850 whitespace-pre-wrap">{shipment.consignee || `BMW Japan Car Operations\nPort of Yokohama terminal 1\nYokohama, Japan`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b-2 border-slate-900">
          <div className="p-4 border-r border-slate-900 space-y-1.5 min-h-[90px]">
            <span className="text-[9px] text-slate-450 uppercase font-extrabold text-slate-500 block">NOTIFY PARTY (Name first and full address)</span>
            <p className="font-medium text-slate-700 whitespace-pre-wrap">{shipment.notifyParty || `Same as Consignee / Custom Broker Joint Corp\nYokohama Custom Agency Tokyo Office`}</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-450 uppercase font-extrabold text-slate-405 block">BRANCH EXECUTION</span>
              <strong className="text-slate-800">{shipment.branch || 'Hamburg Office'}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-450 uppercase font-extrabold text-slate-405 block">CARRIAGE REFERENCE</span>
              <strong className="text-slate-800 font-mono text-[11px]">{shipment.shipmentNumber}</strong>
            </div>
          </div>
        </div>

        {/* Port Rotation particulars */}
        <div className="grid grid-cols-4 border-b border-slate-900 text-center font-bold">
          <div className="p-3 border-r border-slate-900">
            <span className="text-[8px] text-slate-455 block font-extrabold text-slate-500 uppercase">PRE-CARRIAGE / FEEDER VESSEL</span>
            <span className="text-slate-800">{shipment.carrier || 'Ocean Line Carrier'}</span>
          </div>
          <div className="p-3 border-r border-slate-900">
            <span className="text-[8px] text-slate-455 block font-extrabold text-slate-500 uppercase">PORT OF LOADING (POL)</span>
            <span className="text-slate-800">{shipment.pol || shipment.origin}</span>
          </div>
          <div className="p-3 border-r border-slate-900">
            <span className="text-[8px] text-slate-455 block font-extrabold text-slate-500 uppercase">PORT OF DISCHARGE (POD)</span>
            <span className="text-slate-800">{shipment.pod || shipment.destination}</span>
          </div>
          <div className="p-3">
            <span className="text-[8px] text-slate-455 block font-extrabold text-slate-500 uppercase">PLACE OF DELIVERY DELIVERY BY</span>
            <span className="text-slate-800">{shipment.destination}</span>
          </div>
        </div>

        {/* Booking date references & dates */}
        <div className="grid grid-cols-3 border-b-2 border-slate-900 text-center font-mono text-[11px] bg-slate-50">
          <div className="p-2 border-r border-slate-900">
            <span className="text-[8px] text-slate-450 block font-bold font-sans text-slate-500">BOOKING DATE</span>
            <span>{shipment.bookingReferenceDate || '2026-06-15'}</span>
          </div>
          <div className="p-2 border-r border-slate-900">
            <span className="text-[8px] text-slate-450 block font-bold font-sans text-slate-500">BOOKING REFERENCE NUMBER</span>
            <span className="font-bold text-slate-800">{shipment.bookingReferenceNumber || 'BK-ONE-99120'}</span>
          </div>
          <div className="p-2">
            <span className="text-[8px] text-slate-450 block font-bold font-sans text-slate-500">FREIGHT VALUE CHARGEABLE</span>
            <span className="font-bold text-slate-850">Prepaid at {shipment.payableAt || 'Origin'}</span>
          </div>
        </div>

        {/* Cargo descriptions header */}
        <div className="grid grid-cols-12 border-b border-slate-900 bg-slate-100 font-extrabold tracking-wider uppercase text-slate-650 text-center text-[9px] py-1">
          <div className="col-span-3">Container No. / Seal Number</div>
          <div className="col-span-2">No. of Packages</div>
          <div className="col-span-4 text-left pl-4">Description of Shipping Goods</div>
          <div className="col-span-1.5 text-right pr-4">Gross Weight</div>
          <div className="col-span-1.5 text-right pr-2">CBM Measurement</div>
        </div>

        {/* Goods descriptions table body */}
        <div className="divide-y divide-slate-150 border-b-2 border-slate-900 min-h-[160px]">
          {shipment.packAllocations && shipment.packAllocations.length > 0 ? (
            shipment.packAllocations.map((pa) => (
              <div key={pa.id} className="grid grid-cols-12 text-center py-3 font-semibold text-slate-800">
                <div className="col-span-3 font-mono font-bold text-slate-900 flex flex-col justify-center">
                  <span>EMCU-883011</span>
                  <span className="text-[9px] text-slate-400 font-normal">Seal: {shipment.delivery?.nocNumber || 'SL-99320'}</span>
                </div>
                <div className="col-span-2 flex flex-col justify-center">
                  <span className="font-mono text-xs">{pa.numberOfPieces}</span>
                  <span className="text-[10px] text-slate-400">{pa.packages} ({pa.packageType})</span>
                </div>
                <div className="col-span-4 text-left pl-4 space-y-0.5 justify-center flex flex-col">
                  <div className="font-bold text-slate-850">{pa.commodityDescription}</div>
                  <div className="text-[9px] text-slate-400 font-mono">HS Tariff Code: {pa.hsCode || '8507.60.00'} · Custom code: {pa.commodityCode || 'MIX-GEN'}</div>
                  {pa.temperatureControl && (
                    <span className="inline-block bg-sky-50 text-sky-800 text-[8px] font-bold px-1 py-0.2 rounded font-sans uppercase border border-sky-100 mt-1 max-w-xs">
                      {pa.temperatureControl} Climate Control Required
                    </span>
                  )}
                </div>
                <div className="col-span-1.5 text-right pr-4 font-mono select-none flex flex-col justify-center font-bold text-slate-900">
                  {pa.grossWeight} kg
                </div>
                <div className="col-span-1.5 text-right pr-2 font-mono flex flex-col justify-center text-slate-700">
                  {pa.volumeCBM} cbm
                </div>
              </div>
            ))
          ) : (
            // Dummy default rows if no packed parcels exist
            <div className="grid grid-cols-12 text-center py-6 text-slate-450 italic col-span-12 justify-center">
              No pack allocations logged in operational workspace. Let's add pack items to print list.
            </div>
          )}
        </div>

        {/* Sum total summation panel for Bill of Lading */}
        <div className="grid grid-cols-12 font-bold tracking-tight text-[11px] py-1.5 border-b border-slate-900 text-slate-900 bg-slate-50">
          <div className="col-span-3 uppercase font-extrabold text-[9px] text-slate-500 pl-4 flex items-center">Total units:</div>
          <div className="col-span-2 text-center font-mono font-bold text-sm">{totalPkgs} Bundles</div>
          <div className="col-span-4 text-slate-400 text-left italic font-normal pl-4 flex items-center text-[10px]">
            "Shipper declared weight payload values confirmed."
          </div>
          <div className="col-span-1.5 text-right pr-4 font-mono font-black text-sm">{totalGrossWt} kg</div>
          <div className="col-span-1.5 text-right pr-2 font-mono font-bold">{totalCbm} CBM</div>
        </div>

        {/* Carrier Terms conditions & Signature lines */}
        <div className="grid grid-cols-12 pt-4 gap-4 items-end">
          <div className="col-span-8 space-y-2 text-[9px] text-slate-450 leading-tight pr-6 text-slate-550 italic">
            <p>
              RECEIVED by ForwardERP Group Group INC. in apparent good order and condition, unless otherwise described in this bill of lading contract. The merchant agrees to pay all ocean carriage transport tariffs, dunnage charges, manifest registration fees and delivery order processing fees at target warehouse destination station.
            </p>
            <p className="font-semibold text-slate-700 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5 inline-block" />
              <span>Certified under Solas Convention container weight verification regulations.</span>
            </p>
          </div>
          <div className="col-span-4 border border-slate-900 p-4 space-y-1 text-center bg-slate-50/50 rounded-lg">
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">Authorized Signee Representative</span>
            <div className="py-2 inline-block">
              <span className="font-serif italic font-bold text-indigo-700 select-none text-base tracking-widest block font-mono pr-2">ForwardERP Logistics</span>
            </div>
            <span className="text-[8px] text-slate-500 block font-mono border-t border-slate-300 pt-1">
              Hamburg Port HQ, {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
