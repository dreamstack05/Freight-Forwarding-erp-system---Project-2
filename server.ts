/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './db';
import { 
  User, 
  SalesLead, 
  CallSheet, 
  Shipment, 
  SailingSchedule, 
  Consol,
  UserRole,
  PackAllocation,
  EDIDetails,
  PickupRecord,
  DeliveryRecord
} from './src/types';

// ==========================================
// MOCK DATABASE & SEED DATA
// ==========================================

// Initial user list (passwords are stored as plain or simple hashes; we simulate BCrypt)
let users: Array<User & { passwordHash: string }> = [
  { id: 'u-1', username: 'admin', email: 'admin@forwarderp.com', role: 'Admin', createdAt: new Date().toISOString(), passwordHash: 'admin' },
  { id: 'u-2', username: 'sales', email: 'sales@forwarderp.com', role: 'Sales Executive', createdAt: new Date().toISOString(), passwordHash: 'sales' },
  { id: 'u-3', username: 'ops', email: 'ops@forwarderp.com', role: 'Operations Executive', createdAt: new Date().toISOString(), passwordHash: 'ops' },
  { id: 'u-4', username: 'docs', email: 'docs@forwarderp.com', role: 'Documentation Executive', createdAt: new Date().toISOString(), passwordHash: 'docs' },
  { id: 'u-5', username: 'manager', email: 'manager@forwarderp.com', role: 'Manager', createdAt: new Date().toISOString(), passwordHash: 'manager' }
];

// Re-map wrong email username role for 'docs'
users[3].role = 'Documentation Executive';

// In-Memory Collections
let leads: SalesLead[] = [
  {
    id: 'ld-1',
    leadNumber: 'LD-2026-0001',
    leadDate: '2026-06-10',
    salesPerson: 'John Doe',
    leadSource: 'Web Form',
    customerName: 'Apex Logistics Inc',
    contactPerson: 'Sarah Jenkins',
    phoneNumber: '+1-555-0192',
    emailAddress: 'sjenkins@apexlogistics.com',
    customerType: 'Importer',
    businessType: 'FCL Ocean',
    country: 'United States',
    leadRating: 'Hot',
    leadStatus: 'Proposal Sent',
    interestedService: 'Ocean Import FCL - NYC to LAX',
    expectedShipmentVolume: '25 TEUs per Month',
    discussionNotes: 'Customer is looking for a reliable customs clearance and ocean forwarding partner. Rates submitted on 2026-06-12.',
    followUpDate: '2026-06-19',
    followUpPerson: 'John Doe',
    competitorName: 'Maersk Logistics',
    conversionStatus: 'Pending',
    convertedEnquiryNumber: '',
    createdBy: 'admin',
    createdDateTime: '2026-06-10T10:30:00Z',
    updatedAt: '2026-06-12T14:20:00Z',
    attachments: ['Quote_Apex_V1.pdf']
  },
  {
    id: 'ld-2',
    leadNumber: 'LD-2026-0002',
    leadDate: '2026-06-14',
    salesPerson: 'Robert John',
    leadSource: 'Exhibition',
    customerName: 'SinoTech Electronics',
    contactPerson: 'Mr. Chang',
    phoneNumber: '+86-21-987654',
    emailAddress: 'chang@sinotech-sh.com',
    customerType: 'Exporter',
    businessType: 'Air Freight',
    country: 'China',
    leadRating: 'Warm',
    leadStatus: 'Contacted',
    interestedService: 'Air Freight Export - Pudong (PVG) to Frankfurt (FRA)',
    expectedShipmentVolume: '500 kg weekly',
    discussionNotes: 'Initial call made. Client wants door-to-airport transit times and temperature control cargo conditions.',
    followUpDate: '2026-06-21',
    followUpPerson: 'Robert John',
    competitorName: 'DHL Express',
    conversionStatus: 'Pending',
    convertedEnquiryNumber: '',
    createdBy: 'sales',
    createdDateTime: '2026-06-14T09:12:00Z',
    updatedAt: '2026-06-14T09:12:00Z',
    attachments: []
  }
];

let callSheets: CallSheet[] = [
  {
    id: 'cs-1',
    callDate: '2026-06-15',
    organizationName: 'Global Timber Corp',
    contactPerson: 'Marcus Peterson',
    phoneNumber: '+49-40-555123',
    emailAddress: 'm.peterson@globaltimber.de',
    enquiryType: 'Rate Enquiry',
    shipmentType: 'Export',
    origin: 'Hamburg, Germany',
    destination: 'Singapore Port',
    commodityDescription: 'Softwood Logs',
    modeOfTransport: 'Sea',
    salesPerson: 'Robert John',
    callStatus: 'Follow-up Scheduled',
    nextFollowUpDate: '2026-06-20',
    remarks: 'Discussed ocean rates for 40ft HC logs. Will follow up with carriers for slot rates.',
    createdAt: '2026-06-15T11:00:00Z',
    updatedAt: '2026-06-15T11:00:00Z'
  },
  {
    id: 'cs-2',
    callDate: '2026-06-16',
    organizationName: 'Titan Auto Parts Ltd',
    contactPerson: 'Clara Oswald',
    phoneNumber: '+44-207-112233',
    emailAddress: 'c.oswald@titanauto.co.uk',
    enquiryType: 'Air Quotation',
    shipmentType: 'Import',
    origin: 'London Heathrow (LHR)',
    destination: 'Mumbai Airport (BOM)',
    commodityDescription: 'Automotive Engine Gaskets',
    modeOfTransport: 'Air',
    salesPerson: 'John Doe',
    callStatus: 'Connected',
    nextFollowUpDate: '2026-06-18',
    remarks: 'Urgent cargo. Requested express freight rate. Calculated air cargo dimensions during the call.',
    createdAt: '2026-06-16T14:45:00Z',
    updatedAt: '2026-06-16T15:10:00Z'
  }
];

let shipments: Shipment[] = [
  {
    id: 'sh-1',
    shipmentNumber: 'SH-26-0158',
    branch: 'Germany Branch',
    shipmentType: 'Export', // Since it is export, HBL will be auto-generated equal to shipmentNumber
    transportMode: 'Ocean',
    clientName: 'Bayerische Motoren Werke',
    origin: 'Munich Warehouse',
    originETD: '2026-06-22',
    destination: 'Tokyo Bay Port',
    destinationETA: '2026-07-28',
    shipper: 'BMW Germany AG, Lerchenauer Str. 76, Munich',
    consignee: 'BMW Japan Corp, Tokyo Port Area',
    notifyParty: 'Nippon Express Logistics Ltd, Tokyo Office',
    carrier: 'Hapag-Lloyd',
    pol: 'Hamburg Port, Germany',
    polETD: '2026-06-25',
    pod: 'Tokyo Port, Japan',
    podETA: '2026-07-25',
    serviceType: 'FCL/FCL',
    hblHouseType: 'Regular',
    hblNumber: 'SH-26-0158', // Auto equal to Shipment Number for Export
    hblStatus: 'Draft Approved',
    hblDeliveryMode: 'Original OBL',
    onBoardDate: '2026-06-25',
    onBoardNote: 'SHIPPED ON BOARD CLEAN ON ROAD AND OCEAN CARRIER',
    bookingReferenceNumber: 'BK-HL-998822',
    bookingReferenceDate: '2026-06-11',
    payableAt: 'Hamburg, Germany',
    dispatchAt: 'Hamburg Port Terminal 4',
    remarks: 'BMW High value battery components. Handled with certified temperature container.',
    status: 'Open',
    packAllocations: [
      {
        id: 'pa-1',
        numberOfPieces: 12,
        packages: 'Wooden Pallets',
        packageType: 'PLT',
        grossWeight: 4200,
        netWeight: 3950,
        volumeCBM: 14.5,
        temperatureControl: '+15C to +25C',
        commodityCode: 'BMW-E-BAT88',
        commodityDescription: 'Lithium-Ion Electric Batteries for Passenger Vehicles',
        hsCode: '8507.60.00',
        cargoReadyDate: '2026-06-18',
        cargoReceivedDate: '2026-06-20'
      }
    ],
    ediDetails: {
      mrnNumber: 'MRN2026DE998811',
      mrnDate: '2026-06-20',
      itemNumber: '001',
      lineNumber: '0432',
      igmNumber: 'IGM-TOKYO-449',
      igmDate: '2026-06-22',
      cargoDate: '2026-06-21',
      vesselNumber: 'HL-AL-VAL91',
      voyageDate: '2026-06-25',
      brnNumber: 'BRN-DE-557373',
      brnDate: '2026-06-21'
    },
    pickup: {
      pickupAgent: 'Schumacher Schnelltransport GmbH',
      shipperReferenceNumber: 'REF-BMW-90112',
      cfsTransit: 'Hamburg Container Terminal Altenwerder',
      receiptRequestedDate: '2026-06-19',
      dispatchRequestedDate: '2026-06-20',
      exportBroker: 'DEKRA Customs Services Hamburg',
      transportCompany: 'Schumacher Logistics'
    },
    delivery: {
      expectedDeliveryDate: '2026-07-27',
      actualDeliveryDate: '',
      importCompany: 'BMW Japan Logistics Center',
      nocNumber: 'NOC-TK-55612',
      nocDate: '2026-06-14',
      deliveryOrderNumber: '',
      deliveryOrderDate: '',
      deliveryOrderValidity: '',
      deliveryOrderStatus: 'Pending',
      deliveryAgent: 'Nippon Express Shippers'
    },
    emails: [
      {
        id: 'em-1',
        emailType: 'Pre-Alert Notification',
        to: 'import-liaison@bmw.co.jp',
        cc: 'ops-jp@forwarderp.com',
        bcc: 'archive@forwarderp.com',
        template: 'Dear Client,\n\nWe are pleased to send you the Pre-Alert advice for Shipment SH-26-0158 loaded on Hapag-Lloyd vessel. Expected departure: 2026-06-25, ETA Tokyo Port: 2026-07-25.\n\nBest Regards,\nForwardERP Operations',
        sentAt: '2026-06-15T09:00:00Z',
        sentBy: 'ops'
      }
    ],
    createdAt: '2026-06-11T08:00:00Z',
    updatedAt: '2026-06-15T09:00:00Z'
  },
  {
    id: 'sh-2',
    shipmentNumber: 'SH-26-0249',
    branch: 'Singapore Office',
    shipmentType: 'Import', // Import manual HBL
    transportMode: 'Ocean',
    clientName: 'Sari Foods Singapore Ltd',
    origin: 'Jakarta Warehouse, Indonesia',
    originETD: '2026-06-18',
    destination: 'Singapore Pasir Panjang',
    destinationETA: '2026-06-21',
    shipper: 'PT Agro Nusantara, Jln Industri Raya No. 4, Jakarta',
    consignee: 'Sari Foods Singapore, 43 Tuas Ave 2',
    notifyParty: 'Sari Foods Singapore Warehouse Team',
    carrier: 'Maersk Line',
    pol: 'Tanjung Priok Port, Jakarta, Indonesia',
    polETD: '2026-06-19',
    pod: 'Pasir Panjang Terminal, Singapore',
    podETA: '2026-06-21',
    serviceType: 'LCL/LCL',
    hblHouseType: 'Regular',
    hblNumber: 'HBL-JKT-SGP-7729', // Entered manually because it is Import !
    hblStatus: 'Released',
    hblDeliveryMode: 'Telex Release',
    onBoardDate: '2026-06-19',
    onBoardNote: 'TELEX RELEASE / CARGO RECEIVED AT CFS JAKARTA',
    bookingReferenceNumber: 'MSK-JKT-110292',
    bookingReferenceDate: '2026-06-15',
    payableAt: 'Singapore Central',
    dispatchAt: 'Singapore Tuas CFS',
    remarks: 'Food grade coconut sugar payload under import priority code.',
    status: 'Open',
    packAllocations: [
      {
        id: 'pa-2',
        numberOfPieces: 80,
        packages: 'Multiwall Kraft Bags',
        packageType: 'BAG',
        grossWeight: 2000,
        netWeight: 1980,
        volumeCBM: 4.8,
        temperatureControl: 'Ambient Dried Cargo',
        commodityCode: 'HS17029090',
        commodityDescription: 'Organic Coconut Sugar refined grade A',
        hsCode: '1702.90.90',
        cargoReadyDate: '2026-06-14',
        cargoReceivedDate: '2026-06-16'
      }
    ],
    ediDetails: {
      mrnNumber: 'MRN2026SG391102',
      mrnDate: '2026-06-16',
      itemNumber: '002',
      lineNumber: '0010',
      igmNumber: 'IGM-SG-99381',
      igmDate: '2026-06-18',
      cargoDate: '2026-06-16',
      vesselNumber: 'MS-V-MAERSK-043',
      voyageDate: '2026-06-19',
      brnNumber: '',
      brnDate: ''
    },
    pickup: {
      pickupAgent: 'PT Lintas Samudra Jakarta',
      shipperReferenceNumber: 'SO-AGRO-77192',
      cfsTransit: 'Tanjung Priok CFS Block C',
      receiptRequestedDate: '2026-06-15',
      dispatchRequestedDate: '2026-06-16',
      exportBroker: 'PT Bea Cukai Raya JKT',
      transportCompany: 'PT Lintas Samudra'
    },
    delivery: {
      expectedDeliveryDate: '2026-06-22',
      actualDeliveryDate: '2026-06-22',
      importCompany: 'Sari Foods Singapore Ltd',
      nocNumber: 'NOC-SG-2026-015',
      nocDate: '2026-06-21',
      deliveryOrderNumber: 'DO-SGP-1109401',
      deliveryOrderDate: '2026-06-21',
      deliveryOrderValidity: '2026-06-28',
      deliveryOrderStatus: 'Completed',
      deliveryAgent: 'Tuas Heavy Haulers'
    },
    emails: [
      {
        id: 'em-2',
        emailType: 'Telex Release Advice',
        to: 'customs-ops@sarifoods.com.sg',
        cc: 'ops-sg@forwarderp.com',
        bcc: '',
        template: 'Dear Sari Foods,\n\nWe confirm Telex Release of the cargo on HBL-JKT-SGP-7729. Delivery Order DO-SGP-1109401 has been generated and is valid until 2026-06-28.\n\nBest Regards,\nForwardERP Team',
        sentAt: '2026-06-21T10:15:00Z',
        sentBy: 'ops'
      }
    ],
    createdAt: '2026-06-15T03:00:00Z',
    updatedAt: '2026-06-21T10:15:00Z'
  }
];

let sailingSchedules: SailingSchedule[] = [
  {
    id: 'sch-1',
    scheduleNumber: 'SCH-2026-0001',
    branch: 'Singapore Branch',
    transportMode: 'Ocean',
    carrierName: 'Ocean Network Express (ONE)',
    scnCode: 'SCN-ONE-998',
    vesselName: 'ONE Continuity',
    voyageNumber: '028E',
    pol: 'SGP - Port of Singapore',
    etd: '2026-06-24',
    pod: 'LAX - Port of Los Angeles',
    eta: '2026-07-08',
    placeOfReceipt: 'Singapore Tuas CFS',
    placeOfDelivery: 'Los Angeles Depot Area',
    portCutOffDate: '2026-06-21',
    documentationCutOffDate: '2026-06-20',
    cyOpeningDate: '2026-06-17',
    cyClosingDate: '2026-06-22',
    transitTime: '14 Days',
    carrierBookingNumber: 'CB-ONE-4491029',
    feederVesselName: 'Melaka Express',
    feederVoyageNumber: '018S',
    transhipmentPort: 'Port Klang, Malaysia',
    terminalName: 'Pasir Panjang Terminal 4',
    shippingLineContact: '+65-6221-1199',
    remarks: 'Direct TP1 service. Highly punctual sailing window.',
    scheduleStatus: 'Active',
    slotOperator: 'Gold Star Lines',
    vgmCutOffDate: '2026-06-21',
    freeDaysAtDestination: 10,
    etb: '2026-06-23T18:00:00Z',
    atd: '',
    ata: '',
    scheduleFrequency: 'Weekly',
    portRotation: 'SGP -> PKG -> HKG -> LAX',
    createdAt: '2026-06-12T04:20:00Z',
    updatedAt: '2026-06-12T04:20:00Z'
  },
  {
    id: 'sch-2',
    scheduleNumber: 'SCH-2026-0002',
    branch: 'Rotterdam Branch',
    transportMode: 'Ocean',
    carrierName: 'CMA CGM',
    scnCode: 'SCN-CMA-442',
    vesselName: 'CMA CGM Antoine de Saint Exupéry',
    voyageNumber: '043W',
    pol: 'Rotterdam Port, Netherlands',
    etd: '2026-06-28',
    pod: 'Shanghai Deepwater Port, China',
    eta: '2026-07-30',
    placeOfReceipt: 'Rotterdam Terminal 1A',
    placeOfDelivery: 'Shanghai Outer CFS',
    portCutOffDate: '2026-06-25',
    documentationCutOffDate: '2026-06-24',
    cyOpeningDate: '2026-06-22',
    cyClosingDate: '2026-06-26',
    transitTime: '32 Days',
    carrierBookingNumber: 'CB-CMA-99238',
    terminalName: 'ECT Delta Terminal Rotterdam',
    shippingLineContact: '+31-10-729-1000',
    remarks: 'FAL3 Loop Service. Expect heavy cargo load.',
    scheduleStatus: 'Active',
    slotOperator: 'COSCO shipping',
    vgmCutOffDate: '2026-06-24',
    freeDaysAtDestination: 14,
    etb: '2026-06-27T10:00:00Z',
    atd: '',
    ata: '',
    scheduleFrequency: 'Weekly',
    portRotation: 'RTM -> SHA -> SGP',
    createdAt: '2026-06-14T05:30:00Z',
    updatedAt: '2026-06-14T05:30:00Z'
  }
];

let consols: Consol[] = [
  {
    id: 'con-1',
    consolNumber: 'CON-2026-0015',
    branch: 'Singapore Branch',
    transportMode: 'Ocean',
    containerMode: 'LCL',
    consolMode: 'Direct',
    directionFlag: 'Export',
    organizationName: 'Global Consol Services Singapore',
    origin: 'Singapore Harbour',
    originETD: '2026-06-26',
    destination: 'London Gateway Port',
    destinationETA: '2026-07-28',
    hazardous: true,
    hazardousType: 'IMO Class 3 Flammables (under limit check)',
    department: 'LCL Department East Asia',
    consolStatus: 'Planned',
    carrier: 'Evergreen Marine Corp',
    pol: 'SGP Terminal 2',
    polETD: '2026-06-26',
    pod: 'LGP Gateway, London',
    podETA: '2026-07-28',
    vesselName: 'Ever Given',
    voyageNumber: '0189W',
    sendingAgent: 'ForwardERP Singapore Logistics',
    receivingAgent: 'Inter-Europe Forwarding Ltd (London)',
    containers: [
      {
        id: 'cc-1',
        containerNumber: 'EMCU-8839023',
        containerCount: 1,
        containerType: '40HQ',
        containerMode: 'LCL',
        deliveryMode: 'CFS/CFS',
        sealNumber: 'EVM-SEAL-998822',
        sealedBy: 'Customs',
        commodityCode: 'MIX-LCL-GEN'
      }
    ],
    weightDetails: {
      dunnageWeight: 450,
      goodsWeight: 18200,
      grossWeight: 22650, // includes tare and dunnage
      netWeight: 18650,
      tareWeight: 4000
    },
    routingDetails: [
      {
        id: 'rl-1',
        legNumber: 1,
        carrier: 'Evergreen Marine Corp',
        transportMode: 'Ocean',
        pol: 'SGP Terminal 2',
        polETD: '2026-06-26',
        podETA: '2026-07-28',
        vesselName: 'Ever Given',
        voyageNumber: '0189W',
        remarks: 'Main ocean trunk leg through Suez Canal.'
      }
    ],
    createdAt: '2026-06-15T06:00:00Z',
    updatedAt: '2026-06-16T12:00:00Z'
  }
];

// ==========================================
// UTILITY FUNCTIONS: JWT SIGNING
// ==========================================

// We implement standard token encryption simulation using a stable hex/base64 payload + salt string
const JWT_SECRET = 'FORWARD_ERP_JWT_SECRET_2026_KEY';

function signToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    exp: Date.now() + 86400000 // 24 hours
  };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64');
  return `Bearer-${base64}`;
}

function verifyToken(authHeader: string | undefined): User | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token.startsWith('Bearer-')) return null;
  
  try {
    const base64 = token.substring(7);
    const str = Buffer.from(base64, 'base64').toString('ascii');
    const payload = JSON.parse(str);
    
    if (payload.exp < Date.now()) {
      return null; // Expired
    }
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role as UserRole,
      email: payload.email,
      createdAt: ''
    };
  } catch (e) {
    return null;
  }
}

// ==========================================
// SERVER INITIALIZATION
// ==========================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // DATABASE SYNCHRONIZATION MIDDLEWARE
  // ==========================================
  app.use(async (req, res, next) => {
    try {
      users = await dbManager.getUsers();
      leads = await dbManager.getLeads();
      callSheets = await dbManager.getCallSheets();
      shipments = await dbManager.getShipments();
      sailingSchedules = await dbManager.getSchedules();
      consols = await dbManager.getConsols();
    } catch (e) {
      console.error('[DATABASE HYDRATOR] Failed to hydrate collections:', e);
    }

    res.on('finish', async () => {
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        try {
          for (const u of users) {
            await dbManager.saveUser(u);
          }
          for (const l of leads) {
            await dbManager.saveLead(l);
          }
          for (const c of callSheets) {
            await dbManager.saveCallSheet(c);
          }
          for (const s of shipments) {
            await dbManager.saveShipment(s);
          }
          for (const sc of sailingSchedules) {
            await dbManager.saveSchedule(sc);
          }
          for (const c of consols) {
            await dbManager.saveConsol(c);
          }

          if (req.method === 'DELETE' && req.originalUrl.includes('/api/callsheets/')) {
            const parts = req.originalUrl.split('?')[0].split('/');
            const idToDelete = parts[parts.length - 1];
            if (idToDelete) {
              await dbManager.deleteCallSheet(idToDelete);
            }
          }
        } catch (e) {
          console.error('[DATABASE SYNC] Error flushing updates to database:', e);
        }
      }
    });

    next();
  });

  // Database Connection Status Endpoint
  app.get('/api/db-status', (req, res) => {
    res.json(dbManager.getStatus());
  });

  // Middlewares
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = verifyToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired JWT token' });
    }
    // inject user context
    (req as any).user = user;
    next();
  };

  const requireRole = (roles: UserRole[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user as User;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden: Requires one of these roles: ${roles.join(', ')}` });
      }
      next();
    };
  };

  // ==========================================
  // MODULE 1: AUTHENTICATION ENDPOINTS
  // ==========================================

  // In-memory Reset Tokens storage
  const resetTokens: Array<{ email: string; token: string; expiresAt: number }> = [];

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const matched = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!matched) {
      return res.status(400).json({ error: 'No employee account found with this email address.' });
    }

    // Generate simulated 6-digit reset token
    const token = `FWD-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    // Store in-memory, replacing any existing token for this email
    const existingIdx = resetTokens.findIndex(t => t.email.toLowerCase() === email.trim().toLowerCase());
    if (existingIdx !== -1) {
      resetTokens.splice(existingIdx, 1);
    }
    resetTokens.push({ email: email.trim().toLowerCase(), token, expiresAt });

    res.json({
      message: 'Simulated email validation: Password reset token dispatched successfully.',
      email: email.trim().toLowerCase(),
      simulatedToken: token
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required.' });
    }

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedToken = token.trim();

    const storedToken = resetTokens.find(t => t.email === cleanedEmail && t.token === cleanedToken);
    
    if (!storedToken) {
      return res.status(400).json({ error: 'Invalid reset token sequence or incorrect email.' });
    }

    if (Date.now() > storedToken.expiresAt) {
      return res.status(400).json({ error: 'This security reset token has expired.' });
    }

    const userIdx = users.findIndex(u => u.email.toLowerCase() === cleanedEmail);
    if (userIdx === -1) {
      return res.status(404).json({ error: 'User associated with this reset token no longer exists.' });
    }

    users[userIdx].passwordHash = newPassword.trim();

    // Clear used token
    const tokenIdx = resetTokens.indexOf(storedToken);
    if (tokenIdx !== -1) {
      resetTokens.splice(tokenIdx, 1);
    }

    res.json({ message: 'Pass-key security code successfully updated. Please authenticate with your new password.' });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, email, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username or Email and password are required.' });
    }

    const matched = users.find(u => 
      u.username.toLowerCase() === identifier.toLowerCase() || 
      (u.email && u.email.toLowerCase() === identifier.toLowerCase())
    );
    if (!matched || matched.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid username, email, or password' });
    }

    const token = signToken(matched);
    res.json({
      token,
      user: {
        id: matched.id,
        username: matched.username,
        email: matched.email,
        role: matched.role,
        createdAt: matched.createdAt
      }
    });
  });

  app.post('/api/auth/register', requireAuth, requireRole(['Admin']), (req, res) => {
    const { username, email, role, password } = req.body;
    if (!username || !email || !role || !password) {
      return res.status(400).json({ error: 'All fields (username, email, role, password) are required.' });
    }

    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      username,
      email,
      role: role as UserRole,
      createdAt: new Date().toISOString(),
      passwordHash: password // BCrypt simulated
    };

    users.push(newUser);
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { username, email, role, password } = req.body;
    if (!username || !email || !role || !password) {
      return res.status(400).json({ error: 'All fields (username, email, role, password) are required.' });
    }

    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      if (exists.username.toLowerCase() === username.toLowerCase()) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      username,
      email,
      role: role as UserRole,
      createdAt: new Date().toISOString(),
      passwordHash: password
    };

    users.push(newUser);
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    });
  });

  app.post('/api/auth/change-password', requireAuth, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const currentUser = (req as any).user as User;

    const userDbIdx = users.findIndex(u => u.id === currentUser.id);
    if (userDbIdx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[userDbIdx].passwordHash !== oldPassword) {
      return res.status(400).json({ error: 'Incorrect existing password' });
    }

    users[userDbIdx].passwordHash = newPassword;
    res.json({ message: 'Password updated successfully' });
  });

  app.get('/api/auth/profile', requireAuth, (req, res) => {
    res.json({ user: (req as any).user });
  });

  // ==========================================
  // MODULE 2: SALES LEAD MANAGEMENT ENDPOINTS
  // ==========================================

  app.get('/api/leads', requireAuth, (req, res) => {
    const { query } = req.query;
    let filtered = [...leads];
    if (query) {
      const q = String(query).toLowerCase();
      filtered = filtered.filter(l => 
        l.leadNumber.toLowerCase().includes(q) ||
        l.customerName.toLowerCase().includes(q) ||
        l.salesPerson.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.interestedService.toLowerCase().includes(q)
      );
    }
    res.json(filtered);
  });

  app.post('/api/leads', requireAuth, requireRole(['Admin', 'Sales Executive', 'Manager']), (req, res) => {
    const payload = req.body;
    
    // Automatically generate Lead Number
    const count = leads.length + 1;
    const pad = String(count).padStart(4, '0');
    const leadNumber = `LD-2026-${pad}`;

    const newLead: SalesLead = {
      ...payload,
      id: `ld-${Date.now()}`,
      leadNumber,
      leadDate: payload.leadDate || new Date().toISOString().split('T')[0],
      leadStatus: payload.leadStatus || 'New',
      conversionStatus: 'Pending',
      convertedEnquiryNumber: '',
      createdBy: ((req as any).user as User).username,
      createdDateTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: payload.attachments || []
    };

    leads.push(newLead);
    res.status(201).json(newLead);
  });

  app.put('/api/leads/:id', requireAuth, requireRole(['Admin', 'Sales Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const body = req.body;
    
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    leads[idx] = {
      ...leads[idx],
      ...body,
      updatedAt: new Date().toISOString()
    };

    res.json(leads[idx]);
  });

  // Convert Lead into shipment or inquiry
  app.post('/api/leads/:id/convert', requireAuth, requireRole(['Admin', 'Sales Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leads[idx];
    if (lead.conversionStatus === 'Converted') {
      return res.status(400).json({ error: 'Lead is already converted' });
    }

    // Auto-generate a shipment from this converted lead
    const shCount = shipments.length + 101;
    const pad = String(shCount).padStart(4, '0');
    const newShipmentNumber = `SH-26-${pad}`;

    const newShipment: Shipment = {
      id: `sh-${Date.now()}`,
      shipmentNumber: newShipmentNumber,
      branch: 'Main HQ',
      shipmentType: lead.businessType.includes('Export') ? 'Export' : 'Import',
      transportMode: lead.businessType.toLowerCase().includes('air') ? 'Air' : 'Ocean',
      clientName: lead.customerName,
      origin: 'Pending Origin',
      originETD: new Date(Date.now() + 864 * 10 * 100000).toISOString().split('T')[0], // 10 days out
      destination: lead.country,
      destinationETA: new Date(Date.now() + 864 * 30 * 100000).toISOString().split('T')[0], // 30 days out
      shipper: `${lead.customerName} Inc.`,
      consignee: 'TO ORDER OF CONSIGNEE',
      notifyParty: 'NOTIFY APPLICANT CUSTOMS CLEARANCE',
      carrier: 'Ocean Carrier TBD',
      pol: 'TBD Port of Loading',
      polETD: '',
      pod: 'TBD Port of Discharge',
      podETA: '',
      serviceType: 'FCL/FCL',
      hblHouseType: 'Regular',
      hblNumber: lead.businessType.includes('Export') ? newShipmentNumber : `HBL-${Math.floor(100000 + Math.random() * 900000)}`,
      hblStatus: 'Draft',
      hblDeliveryMode: 'Original OBL',
      onBoardDate: '',
      onBoardNote: '',
      bookingReferenceNumber: '',
      bookingReferenceDate: '',
      payableAt: 'Destination Port',
      dispatchAt: 'CFS Depot Warehouse',
      remarks: `Generated automatically via lead conversion from Lead ${lead.leadNumber}`,
      status: 'Open',
      packAllocations: [
        {
          id: `pa-${Date.now()}`,
          numberOfPieces: parseInt(lead.expectedShipmentVolume) || 10,
          packages: 'Cartons',
          packageType: 'CTN',
          grossWeight: 1500,
          netWeight: 1400,
          volumeCBM: 4.5,
          commodityDescription: lead.interestedService,
          cargoReadyDate: new Date().toISOString().split('T')[0],
          cargoReceivedDate: ''
        }
      ],
      ediDetails: {},
      pickup: {},
      delivery: {
        deliveryOrderStatus: 'Pending'
      },
      emails: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update Lead state
    lead.conversionStatus = 'Converted';
    lead.leadStatus = 'Closed';
    lead.convertedEnquiryNumber = newShipmentNumber;
    lead.updatedAt = new Date().toISOString();

    shipments.unshift(newShipment);
    res.json({ message: 'Lead successfully converted to Shipment', lead, shipment: newShipment });
  });

  // ==========================================
  // MODULE 3: CALL SHEET MANAGEMENT ENDPOINTS
  // ==========================================

  app.get('/api/callsheets', requireAuth, (req, res) => {
    const { query } = req.query;
    let filtered = [...callSheets];
    if (query) {
      const q = String(query).toLowerCase();
      filtered = filtered.filter(c => 
        c.organizationName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.salesPerson.toLowerCase().includes(q) ||
        c.commodityDescription.toLowerCase().includes(q)
      );
    }
    res.json(filtered);
  });

  app.post('/api/callsheets', requireAuth, requireRole(['Admin', 'Sales Executive', 'Manager']), (req, res) => {
    const body = req.body;
    const newCall: CallSheet = {
      ...body,
      id: `cs-${Date.now()}`,
      callDate: body.callDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    callSheets.unshift(newCall);
    res.status(201).json(newCall);
  });

  app.put('/api/callsheets/:id', requireAuth, requireRole(['Admin', 'Sales Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const idx = callSheets.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Call record not found' });
    }
    callSheets[idx] = {
      ...callSheets[idx],
      ...body,
      updatedAt: new Date().toISOString()
    };
    res.json(callSheets[idx]);
  });

  app.delete('/api/callsheets/:id', requireAuth, requireRole(['Admin', 'Sales Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const idx = callSheets.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Call record not found' });
    }
    callSheets.splice(idx, 1);
    res.json({ success: true, message: 'Call log removed successfully' });
  });

  // ==========================================
  // MODULE 4: SHIPMENT MANAGEMENT ENDPOINTS (AND SUBMODULES)
  // ==========================================

  app.get('/api/shipments', requireAuth, (req, res) => {
    const { query } = req.query;
    let filtered = [...shipments];
    if (query) {
      const q = String(query).toLowerCase();
      filtered = filtered.filter(s => 
        s.shipmentNumber.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.hblNumber.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)
      );
    }
    res.json(filtered);
  });

  app.post('/api/shipments', requireAuth, requireRole(['Admin', 'Operations Executive', 'Documentation Executive', 'Manager']), (req, res) => {
    const body = req.body;
    const count = shipments.length + 105;
    const pad = String(count).padStart(4, '0');
    const shipmentNumber = `SH-26-${pad}`;

    // Apply strict rule for HBL Generation
    // Export Shipment: generated auto and equal to shipmentNumber
    // Import Shipment: manually entered (provided from client in payload)
    let hblVal = body.hblNumber || '';
    if (body.shipmentType === 'Export') {
      hblVal = shipmentNumber;
    }

    const newShipment: Shipment = {
      ...body,
      id: `sh-${Date.now()}`,
      shipmentNumber,
      hblNumber: hblVal,
      hblStatus: body.hblStatus || 'Draft',
      status: 'Open',
      packAllocations: body.packAllocations || [],
      ediDetails: body.ediDetails || {},
      pickup: body.pickup || {},
      delivery: body.delivery || { deliveryOrderStatus: 'Pending' },
      emails: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    shipments.unshift(newShipment);
    res.status(201).json(newShipment);
  });

  app.put('/api/shipments/:id', requireAuth, requireRole(['Admin', 'Operations Executive', 'Documentation Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const idx = shipments.findIndex(s => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Capture old state to preserve HBL rules on type update
    const prevType = shipments[idx].shipmentType;
    const newType = body.shipmentType || prevType;
    let finalHbl = body.hblNumber || shipments[idx].hblNumber;

    if (newType === 'Export') {
      finalHbl = shipments[idx].shipmentNumber; // Export forces HBL as shipment number
    }

    shipments[idx] = {
      ...shipments[idx],
      ...body,
      hblNumber: finalHbl,
      updatedAt: new Date().toISOString()
    };

    res.json(shipments[idx]);
  });

  // SUBMODULE: PACK ALLOCATION (nested actions)
  app.post('/api/shipments/:id/pack', requireAuth, (req, res) => {
    const { id } = req.params;
    const idx = shipments.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Shipment not found' });
    
    const newPack: PackAllocation = {
      id: `pa-${Date.now()}`,
      numberOfPieces: Number(req.body.numberOfPieces) || 1,
      packages: req.body.packages || 'Bags',
      packageType: req.body.packageType || 'PKG',
      grossWeight: Number(req.body.grossWeight) || 0,
      netWeight: Number(req.body.netWeight) || 0,
      volumeCBM: Number(req.body.volumeCBM) || 0,
      temperatureControl: req.body.temperatureControl,
      commodityCode: req.body.commodityCode,
      commodityDescription: req.body.commodityDescription || 'General Cargo',
      hsCode: req.body.hsCode,
      cargoReadyDate: req.body.cargoReadyDate || new Date().toISOString().split('T')[0],
      cargoReceivedDate: req.body.cargoReceivedDate || ''
    };

    shipments[idx].packAllocations.push(newPack);
    shipments[idx].updatedAt = new Date().toISOString();
    res.json(shipments[idx]);
  });

  app.delete('/api/shipments/:id/pack/:packId', requireAuth, (req, res) => {
    const { id, packId } = req.params;
    const idx = shipments.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Shipment not found' });

    shipments[idx].packAllocations = shipments[idx].packAllocations.filter(p => p.id !== packId);
    shipments[idx].updatedAt = new Date().toISOString();
    res.json(shipments[idx]);
  });

  // SUBMODULE: EDI DETAILS & PICKUP & DELIVERY DO
  app.put('/api/shipments/:id/submodules', requireAuth, (req, res) => {
    const { id } = req.params;
    const { ediDetails, pickup, delivery } = req.body;
    const idx = shipments.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Shipment not found' });

    if (ediDetails) shipments[idx].ediDetails = { ...shipments[idx].ediDetails, ...ediDetails };
    if (pickup) shipments[idx].pickup = { ...shipments[idx].pickup, ...pickup };
    if (delivery) shipments[idx].delivery = { ...shipments[idx].delivery, ...delivery };

    shipments[idx].updatedAt = new Date().toISOString();
    res.json(shipments[idx]);
  });

  // SUBMODULE: EMAIL NOTIFICATION LOG ADD
  app.post('/api/shipments/:id/email', requireAuth, (req, res) => {
    const { id } = req.params;
    const { emailType, to, cc, bcc, template } = req.body;
    const idx = shipments.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Shipment not found' });

    const newLog = {
      id: `em-${Date.now()}`,
      emailType,
      to,
      cc,
      bcc,
      template,
      sentAt: new Date().toISOString(),
      sentBy: ((req as any).user as User).username
    };

    shipments[idx].emails.unshift(newLog);
    shipments[idx].updatedAt = new Date().toISOString();
    res.json(shipments[idx]);
  });

  // ==========================================
  // MODULE 5: SAILING SCHEDULE ENDPOINTS
  // ==========================================

  app.get('/api/schedules', requireAuth, (req, res) => {
    const { query } = req.query;
    let filtered = [...sailingSchedules];
    if (query) {
      const q = String(query).toLowerCase();
      filtered = filtered.filter(s => 
        s.scheduleNumber.toLowerCase().includes(q) ||
        s.carrierName.toLowerCase().includes(q) ||
        s.vesselName.toLowerCase().includes(q) ||
        s.pol.toLowerCase().includes(q) ||
        s.pod.toLowerCase().includes(q)
      );
    }
    res.json(filtered);
  });

  app.post('/api/schedules', requireAuth, requireRole(['Admin', 'Operations Executive', 'Manager']), (req, res) => {
    const body = req.body;
    const count = sailingSchedules.length + 1;
    const pad = String(count).padStart(4, '0');
    const scheduleNumber = `SCH-2026-${pad}`;

    const newSchedule: SailingSchedule = {
      ...body,
      id: `sch-${Date.now()}`,
      scheduleNumber,
      scheduleStatus: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sailingSchedules.unshift(newSchedule);
    res.status(201).json(newSchedule);
  });

  app.put('/api/schedules/:id', requireAuth, requireRole(['Admin', 'Operations Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const idx = sailingSchedules.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Schedule not found' });

    sailingSchedules[idx] = {
      ...sailingSchedules[idx],
      ...body,
      updatedAt: new Date().toISOString()
    };
    res.json(sailingSchedules[idx]);
  });

  // ==========================================
  // MODULE 6: CONSOL MANAGEMENT ENDPOINTS
  // ==========================================

  app.get('/api/consols', requireAuth, (req, res) => {
    const { query } = req.query;
    let filtered = [...consols];
    if (query) {
      const q = String(query).toLowerCase();
      filtered = filtered.filter(c => 
        c.consolNumber.toLowerCase().includes(q) ||
        c.organizationName.toLowerCase().includes(q) ||
        c.vesselName.toLowerCase().includes(q) ||
        c.pol.toLowerCase().includes(q) ||
        c.pod.toLowerCase().includes(q)
      );
    }
    res.json(filtered);
  });

  app.post('/api/consols', requireAuth, requireRole(['Admin', 'Operations Executive', 'Manager']), (req, res) => {
    const body = req.body;
    const count = consols.length + 1;
    const pad = String(count).padStart(4, '0');
    const consolNumber = `CON-2026-${pad}`;

    const newConsol: Consol = {
      ...body,
      id: `con-${Date.now()}`,
      consolNumber,
      consolStatus: 'Open',
      containers: body.containers || [],
      weightDetails: body.weightDetails || { dunnageWeight: 0, goodsWeight: 0, grossWeight: 0, netWeight: 0, tareWeight: 0 },
      routingDetails: body.routingDetails || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    consols.unshift(newConsol);
    res.status(201).json(newConsol);
  });

  app.put('/api/consols/:id', requireAuth, requireRole(['Admin', 'Operations Executive', 'Manager']), (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const idx = consols.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Consol not found' });

    consols[idx] = {
      ...consols[idx],
      ...body,
      updatedAt: new Date().toISOString()
    };
    res.json(consols[idx]);
  });

  // Add container inside Consol unit
  app.post('/api/consols/:id/container', requireAuth, (req, res) => {
    const { id } = req.params;
    const idx = consols.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Consol not found' });

    const newC = {
      id: `cc-${Date.now()}`,
      containerNumber: req.body.containerNumber || 'TBDU-0000000',
      containerCount: Number(req.body.containerCount) || 1,
      containerType: req.body.containerType || '20GP',
      containerMode: req.body.containerMode || 'LCL',
      deliveryMode: req.body.deliveryMode || 'CY/CY',
      sealNumber: req.body.sealNumber || 'TBD',
      sealedBy: req.body.sealedBy || 'Carrier',
      commodityCode: req.body.commodityCode || 'GEN'
    };

    consols[idx].containers.push(newC);
    consols[idx].updatedAt = new Date().toISOString();
    res.json(consols[idx]);
  });

  // Update routing leg inside Consol unit
  app.post('/api/consols/:id/leg', requireAuth, (req, res) => {
    const { id } = req.params;
    const idx = consols.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Consol not found' });

    const newLeg = {
      id: `rl-${Date.now()}`,
      legNumber: consols[idx].routingDetails.length + 1,
      carrier: req.body.carrier || '',
      transportMode: req.body.transportMode || 'Ocean',
      pol: req.body.pol || '',
      polETD: req.body.polETD || '',
      podETA: req.body.podETA || '',
      vesselName: req.body.vesselName || '',
      voyageNumber: req.body.voyageNumber || '',
      remarks: req.body.remarks || ''
    };

    consols[idx].routingDetails.push(newLeg);
    consols[idx].updatedAt = new Date().toISOString();
    res.json(consols[idx]);
  });

  // ==========================================
  // PUBLIC HEALTHCHECK
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ==========================================
  // VITE & BUNDLING HANDLER CONFIGURATION
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production SPA fallback file server
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Freight Forwarding ERP] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('[Freight Forwarding ERP] Initialization Failed:', e);
});
