/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// USER & ROLE CONFIGURATIONS
// ==========================================

export type UserRole = 
  | 'Admin' 
  | 'Sales Executive' 
  | 'Operations Executive' 
  | 'Documentation Executive' 
  | 'Manager';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==========================================
// MODULE 2: SALES LEAD MANAGEMENT
// ==========================================

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiating' | 'Lost' | 'Closed';
export type LeadRating = 'Cold' | 'Warm' | 'Hot';
export type ConversionStatus = 'Pending' | 'Converted' | 'Cancelled';

export interface SalesLead {
  id: string; // Internal GUID
  leadNumber: string; // Auto-generated e.g. LD-2026-0001
  leadDate: string;
  salesPerson: string;
  leadSource: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  emailAddress: string;
  customerType: string; // e.g. Importer, Exporter, Agent
  businessType: string; // e.g. FCL, LCL, Air, Customs Clearance
  country: string;
  leadRating: LeadRating;
  leadStatus: LeadStatus;
  interestedService: string;
  expectedShipmentVolume: string;
  discussionNotes: string;
  followUpDate: string;
  followUpPerson: string;
  competitorName: string;
  conversionStatus: ConversionStatus;
  convertedEnquiryNumber: string;
  createdBy: string;
  createdDateTime: string;
  updatedAt: string;
  attachments?: string[]; // simulated file names
}

// ==========================================
// MODULE 3: CALL SHEET MANAGEMENT
// ==========================================

export type CallStatus = 'Connected' | 'Busy' | 'No Answer' | 'Follow-up Scheduled' | 'Interested' | 'Not Interested';

export interface CallSheet {
  id: string;
  callDate: string;
  organizationName: string;
  contactPerson: string;
  phoneNumber: string;
  emailAddress: string;
  enquiryType: string;
  shipmentType: 'Import' | 'Export';
  origin: string;
  destination: string;
  commodityDescription: string;
  modeOfTransport: 'Sea' | 'Air' | 'Road' | 'Rail';
  salesPerson: string;
  callStatus: CallStatus;
  nextFollowUpDate: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MODULE 4: SHIPMENT MANAGEMENT & SUBMODULES
// ==========================================

export type TransportMode = 'Ocean' | 'Air' | 'Road' | 'Rail';
export type ShipmentType = 'Import' | 'Export';
export type HBLStatus = 'Draft' | 'Issued' | 'Draft Approved' | 'Released' | 'Surrendered';
export type HBLDeliveryMode = 'Original OBL' | 'Telex Release' | 'Sea Waybill';

// Submodule: Pack Allocation
export interface PackAllocation {
  id: string;
  numberOfPieces: number;
  packages: string;
  packageType: string;
  grossWeight: number;
  netWeight: number;
  volumeCBM: number;
  temperatureControl?: string;
  commodityCode?: string;
  commodityDescription: string;
  hsCode?: string;
  cargoReadyDate: string;
  cargoReceivedDate: string;
}

// Submodule: EDI Details
export interface EDIDetails {
  mrnNumber?: string;
  mrnDate?: string;
  itemNumber?: string;
  lineNumber?: string;
  igmNumber?: string;
  igmDate?: string;
  cargoDate?: string;
  vesselNumber?: string;
  voyageDate?: string;
  brnNumber?: string;
  brnDate?: string;
}

// Submodule: Pickup
export interface PickupRecord {
  pickupAgent?: string;
  shipperReferenceNumber?: string;
  cfsTransit?: string;
  receiptRequestedDate?: string;
  dispatchRequestedDate?: string;
  exportBroker?: string;
  transportCompany?: string;
}

// Submodule: Delivery
export interface DeliveryRecord {
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  importCompany?: string;
  nocNumber?: string;
  nocDate?: string;
  deliveryOrderNumber?: string;
  deliveryOrderDate?: string;
  deliveryOrderValidity?: string;
  deliveryOrderStatus?: 'Pending' | 'Draft' | 'Released' | 'Completed';
  deliveryAgent?: string;
}

// Submodule: Email Log
export interface EmailLog {
  id: string;
  emailType: string; // e.g., "Pre-Alert", "Booking Confirmation", "Delivery Advice"
  to: string;
  cc: string;
  bcc: string;
  template: string;
  sentAt: string;
  sentBy: string;
}

// Full Shipment
export interface Shipment {
  id: string;
  shipmentNumber: string; // Auto-generated, e.g. SH-2026-0001
  branch: string;
  shipmentType: ShipmentType;
  transportMode: TransportMode;
  clientName: string;
  origin: string;
  originETD: string;
  destination: string;
  destinationETA: string;
  shipper: string;
  consignee: string;
  notifyParty: string;
  carrier: string;
  pol: string;
  polETD: string;
  pod: string;
  podETA: string;
  serviceType: string; // e.g., FCL/FCL, LCL/LCL, Door-to-Door, Port-to-Port
  hblHouseType: string; // e.g., "Regular", "Back-to-Back"
  hblNumber: string; // Rule: Import manual, Export generated auto & equal to shipmentNumber
  hblStatus: HBLStatus;
  hblDeliveryMode: HBLDeliveryMode;
  onBoardDate: string;
  onBoardNote: string;
  bookingReferenceNumber: string;
  bookingReferenceDate: string;
  payableAt: string;
  dispatchAt: string;
  remarks: string;
  status: 'Open' | 'Closed';
  
  // Package Weight Allocations - Submodule
  packAllocations: PackAllocation[];
  
  // EDI details - Submodule
  ediDetails: EDIDetails;
  
  // Pickup details - Submodule
  pickup: PickupRecord;
  
  // Delivery details - Submodule
  delivery: DeliveryRecord;
  
  // Email Hist - Submodule
  emails: EmailLog[];

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MODULE 5: SAILING SCHEDULE
// ==========================================

export type ScheduleStatus = 'Active' | 'Delayed' | 'Cancelled' | 'Completed';

export interface SailingSchedule {
  id: string;
  scheduleNumber: string; // Auto-generated SCH-0001
  branch: string;
  transportMode: TransportMode;
  carrierName: string;
  scnCode: string;
  vesselName: string;
  voyageNumber: string;
  pol: string;
  etd: string;
  pod: string;
  eta: string;
  placeOfReceipt: string;
  placeOfDelivery: string;
  portCutOffDate: string;
  documentationCutOffDate: string;
  cyOpeningDate: string;
  cyClosingDate: string;
  transitTime: string; // e.g. "14 Days"
  carrierBookingNumber: string;
  feederVesselName?: string;
  feederVoyageNumber?: string;
  transhipmentPort?: string;
  terminalName: string;
  shippingLineContact: string;
  remarks: string;
  scheduleStatus: ScheduleStatus;
  slotOperator?: string;
  vgmCutOffDate: string;
  freeDaysAtDestination: number;
  etb: string;
  atd?: string;
  ata?: string;
  scheduleFrequency: string; // e.g. "Weekly", "Bi-Weekly"
  portRotation: string; // e.g. "SGP -> PKG -> JEA"
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MODULE 6: CONSOL MANAGEMENT
// ==========================================

export type ConsolStatus = 'Open' | 'Planned' | 'Loaded' | 'Sailed' | 'Arrived' | 'Closed';

export interface ConsolContainer {
  id: string;
  containerNumber: string;
  containerCount: number;
  containerType: '20GP' | '40GP' | '40HQ' | '40RF' | '20RF' | 'FlatRack';
  containerMode: 'FCL' | 'LCL';
  deliveryMode: string; // e.g., "CY/CY", "CY/CFS", "CFS/CFS"
  sealNumber: string;
  sealedBy: string; // e.g., "Carrier", "Customs", "Shipper"
  commodityCode: string;
}

export interface WeightDetails {
  dunnageWeight: number; // kg
  goodsWeight: number;  // kg
  grossWeight: number;  // kg
  netWeight: number;    // kg
  tareWeight: number;   // kg
}

export interface RoutingLeg {
  id: string;
  legNumber: number;
  carrier: string;
  transportMode: TransportMode;
  pol: string;
  polETD: string;
  podETA: string;
  atd?: string;
  ata?: string;
  vesselName: string;
  voyageNumber: string;
  remarks: string;
}

export interface Consol {
  id: string;
  consolNumber: string; // Auto-generated CON-0001
  branch: string;
  transportMode: TransportMode;
  containerMode: 'FCL' | 'LCL';
  consolMode: 'Direct' | 'Multi-Stop';
  directionFlag: 'Import' | 'Export';
  organizationName: string;
  origin: string;
  originETD: string;
  destination: string;
  destinationETA: string;
  hazardous: boolean;
  hazardousType?: string;
  department: string;
  consolStatus: ConsolStatus;

  // Port Details
  carrier: string;
  pol: string;
  polETD: string;
  pod: string;
  podETA: string;
  vesselName: string;
  voyageNumber: string;
  atd?: string;
  ata?: string;
  sendingAgent: string;
  receivingAgent: string;

  // Nested structures
  containers: ConsolContainer[];
  weightDetails: WeightDetails;
  routingDetails: RoutingLeg[];

  createdAt: string;
  updatedAt: string;
}
