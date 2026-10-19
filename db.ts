import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { 
  User, 
  SalesLead, 
  CallSheet, 
  Shipment, 
  SailingSchedule, 
  Consol 
} from './src/types';

// ==========================================
// SEED DATA FOR DB RECOVERY / FIRST RUN
// ==========================================

const DEFAULT_USERS: Array<User & { passwordHash: string }> = [
  { id: 'u-1', username: 'admin', email: 'admin@forwarderp.com', role: 'Admin', createdAt: new Date().toISOString(), passwordHash: 'admin' },
  { id: 'u-2', username: 'sales', email: 'sales@forwarderp.com', role: 'Sales Executive', createdAt: new Date().toISOString(), passwordHash: 'sales' },
  { id: 'u-3', username: 'ops', email: 'ops@forwarderp.com', role: 'Operations Executive', createdAt: new Date().toISOString(), passwordHash: 'ops' },
  { id: 'u-4', username: 'docs', email: 'docs@forwarderp.com', role: 'Documentation Executive', createdAt: new Date().toISOString(), passwordHash: 'docs' },
  { id: 'u-5', username: 'manager', email: 'manager@forwarderp.com', role: 'Manager', createdAt: new Date().toISOString(), passwordHash: 'manager' }
];

const DEFAULT_LEADS: SalesLead[] = [
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

const DEFAULT_CALL_SHEETS: CallSheet[] = [
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

const DEFAULT_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-1',
    shipmentNumber: 'SH-26-0158',
    branch: 'Germany Branch',
    shipmentType: 'Export',
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
    hblNumber: 'SH-26-0158',
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
    shipmentType: 'Import',
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
    hblNumber: 'HBL-JKT-SGP-7729',
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

const DEFAULT_SAILING_SCHEDULES: SailingSchedule[] = [
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

const DEFAULT_CONSOLS: Consol[] = [
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
      grossWeight: 22650,
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
// DB ENGINE STRATEGY WRAPPER
// ==========================================

const LOCAL_DB_PATH = path.join(process.cwd(), 'local-database.json');

// Memory state fallback
let localStore = {
  users: [...DEFAULT_USERS],
  leads: [...DEFAULT_LEADS],
  callSheets: [...DEFAULT_CALL_SHEETS],
  shipments: [...DEFAULT_SHIPMENTS],
  sailingSchedules: [...DEFAULT_SAILING_SCHEDULES],
  consols: [...DEFAULT_CONSOLS]
};

// Charge local state from file if exists
function loadLocalFileStore() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      localStore = {
        users: parsed.users || [...DEFAULT_USERS],
        leads: parsed.leads || [...DEFAULT_LEADS],
        callSheets: parsed.callSheets || [...DEFAULT_CALL_SHEETS],
        shipments: parsed.shipments || [...DEFAULT_SHIPMENTS],
        sailingSchedules: parsed.sailingSchedules || [...DEFAULT_SAILING_SCHEDULES],
        consols: parsed.consols || [...DEFAULT_CONSOLS]
      };
      console.log('✔ Local database loaded from file persistent store.');
    } else {
      saveLocalFileStore();
    }
  } catch (err) {
    console.error('Failed reading local DB file store, utilizing RAM:', err);
  }
}

function saveLocalFileStore() {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing local DB file store:', err);
  }
}

// Initialise local cache straight away
loadLocalFileStore();

class MongoDatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting: boolean = false;
  private connectionError: string | null = null;
  private isMongoConnected: boolean = false;

  constructor() {
    this.initMongo();
  }

  private async initMongo() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('ℹ MONGODB_URI absent. Running in Persistent Local File DB Mode.');
      return;
    }

    if (this.isConnecting || this.isMongoConnected) return;

    this.isConnecting = true;
    console.log('🔌 Connecting to MongoDB...');
    try {
      this.client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      });
      await this.client.connect();
      this.db = this.client.db();
      this.isMongoConnected = true;
      this.connectionError = null;
      console.log('💪 MongoDB Atlas connected successfully.');

      // Check and Seed Mongo tables if they are empty
      await this.seedEmptyCollections();
    } catch (error: any) {
      this.connectionError = error?.message || 'Database connection failure';
      this.isMongoConnected = false;
      this.client = null;
      this.db = null;
      console.log('ℹ Notice: Cloud database configuration is offline or unconfigured. Gracefully falling back to persistent Local File Storage.', this.connectionError);
    } finally {
      this.isConnecting = false;
    }
  }

  public getStatus() {
    return {
      connected: this.isMongoConnected,
      mode: this.isMongoConnected ? 'MongoDB Cloud' : 'Local File Storage',
      uri: process.env.MONGODB_URI ? 'Configured' : 'Local Cache Only',
      error: this.connectionError
    };
  }

  private async seedEmptyCollections() {
    if (!this.db) return;
    try {
      const db = this.db;

      // Users Collection
      const userCount = await db.collection('users').countDocuments();
      if (userCount === 0) {
        await db.collection('users').insertMany(DEFAULT_USERS);
        console.log('🍃 Seeded users into MongoDB.');
      }

      // Leads Collection
      const leadCount = await db.collection('leads').countDocuments();
      if (leadCount === 0) {
        await db.collection('leads').insertMany(DEFAULT_LEADS);
        console.log('🍃 Seeded leads into MongoDB.');
      }

      // Call Sheets Collection
      const callsCount = await db.collection('callsheets').countDocuments();
      if (callsCount === 0) {
        await db.collection('callsheets').insertMany(DEFAULT_CALL_SHEETS);
        console.log('🍃 Seeded callsheets into MongoDB.');
      }

      // Shipments Collection
      const shipmentsCount = await db.collection('shipments').countDocuments();
      if (shipmentsCount === 0) {
        await db.collection('shipments').insertMany(DEFAULT_SHIPMENTS);
        console.log('🍃 Seeded shipments into MongoDB.');
      }

      // Schedules Collection
      const schedulesCount = await db.collection('schedules').countDocuments();
      if (schedulesCount === 0) {
        await db.collection('schedules').insertMany(DEFAULT_SAILING_SCHEDULES);
        console.log('🍃 Seeded schedules into MongoDB.');
      }

      // Consols Collection
      const consolsCount = await db.collection('consols').countDocuments();
      if (consolsCount === 0) {
        await db.collection('consols').insertMany(DEFAULT_CONSOLS);
        console.log('🍃 Seeded consols into MongoDB.');
      }
    } catch (e) {
      console.error('Failed to self-seed MongoDB:', e);
    }
  }

  // ==========================================
  // ADAPTER OPERATIONS (USERS)
  // ==========================================
  public async getUsers(): Promise<Array<User & { passwordHash: string }>> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const list = await this.db.collection('users').find({}).toArray();
      return list.map(item => {
        const { _id, ...rest } = item;
        return rest as any;
      });
    }
    return localStore.users;
  }

  public async saveUser(user: User & { passwordHash: string }): Promise<void> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      await this.db.collection('users').updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
      );
    } else {
      const idx = localStore.users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        localStore.users[idx] = user;
      } else {
        localStore.users.push(user);
      }
      saveLocalFileStore();
    }
  }

  // ==========================================
  // ADAPTER OPERATIONS (LEADS)
  // ==========================================
  public async getLeads(): Promise<SalesLead[]> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const list = await this.db.collection('leads').find({}).toArray();
      return list.map(item => {
        const { _id, ...rest } = item;
        return rest as any;
      });
    }
    return localStore.leads;
  }

  public async saveLead(lead: SalesLead): Promise<void> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      await this.db.collection('leads').updateOne(
        { id: lead.id },
        { $set: lead },
        { upsert: true }
      );
    } else {
      const idx = localStore.leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) {
        localStore.leads[idx] = lead;
      } else {
        localStore.leads.push(lead);
      }
      saveLocalFileStore();
    }
  }

  // ==========================================
  // ADAPTER OPERATIONS (CALL SHEETS)
  // ==========================================
  public async getCallSheets(): Promise<CallSheet[]> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const list = await this.db.collection('callsheets').find({}).toArray();
      return list.map(item => {
        const { _id, ...rest } = item;
        return rest as any;
      });
    }
    return localStore.callSheets;
  }

  public async saveCallSheet(call: CallSheet): Promise<void> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      await this.db.collection('callsheets').updateOne(
        { id: call.id },
        { $set: call },
        { upsert: true }
      );
    } else {
      const idx = localStore.callSheets.findIndex(c => c.id === call.id);
      if (idx !== -1) {
        localStore.callSheets[idx] = call;
      } else {
        localStore.callSheets.push(call);
      }
      saveLocalFileStore();
    }
  }

  public async deleteCallSheet(id: string): Promise<boolean> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const res = await this.db.collection('callsheets').deleteOne({ id });
      return (res.deletedCount || 0) > 0;
    } else {
      const len = localStore.callSheets.length;
      localStore.callSheets = localStore.callSheets.filter(c => c.id !== id);
      const deleted = localStore.callSheets.length < len;
      if (deleted) saveLocalFileStore();
      return deleted;
    }
  }

  // ==========================================
  // ADAPTER OPERATIONS (SHIPMENTS)
  // ==========================================
  public async getShipments(): Promise<Shipment[]> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const list = await this.db.collection('shipments').find({}).toArray();
      return list.map(item => {
        const { _id, ...rest } = item;
        return rest as any;
      });
    }
    return localStore.shipments;
  }

  public async saveShipment(shipment: Shipment): Promise<void> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      await this.db.collection('shipments').updateOne(
        { id: shipment.id },
        { $set: shipment },
        { upsert: true }
      );
    } else {
      const idx = localStore.shipments.findIndex(s => s.id === shipment.id);
      if (idx !== -1) {
        localStore.shipments[idx] = shipment;
      } else {
        localStore.shipments.push(shipment);
      }
      saveLocalFileStore();
    }
  }

  // ==========================================
  // ADAPTER OPERATIONS (SAILING SCHEDULES)
  // ==========================================
  public async getSchedules(): Promise<SailingSchedule[]> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const list = await this.db.collection('schedules').find({}).toArray();
      return list.map(item => {
        const { _id, ...rest } = item;
        return rest as any;
      });
    }
    return localStore.sailingSchedules;
  }

  public async saveSchedule(schedule: SailingSchedule): Promise<void> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      await this.db.collection('schedules').updateOne(
        { id: schedule.id },
        { $set: schedule },
        { upsert: true }
      );
    } else {
      const idx = localStore.sailingSchedules.findIndex(s => s.id === schedule.id);
      if (idx !== -1) {
        localStore.sailingSchedules[idx] = schedule;
      } else {
        localStore.sailingSchedules.push(schedule);
      }
      saveLocalFileStore();
    }
  }

  // ==========================================
  // ADAPTER OPERATIONS (CONSOLS)
  // ==========================================
  public async getConsols(): Promise<Consol[]> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      const list = await this.db.collection('consols').find({}).toArray();
      return list.map(item => {
        const { _id, ...rest } = item;
        return rest as any;
      });
    }
    return localStore.consols;
  }

  public async saveConsol(consol: Consol): Promise<void> {
    await this.initMongo();
    if (this.isMongoConnected && this.db) {
      await this.db.collection('consols').updateOne(
        { id: consol.id },
        { $set: consol },
        { upsert: true }
      );
    } else {
      const idx = localStore.consols.findIndex(c => c.id === consol.id);
      if (idx !== -1) {
        localStore.consols[idx] = consol;
      } else {
        localStore.consols.push(consol);
      }
      saveLocalFileStore();
    }
  }
}

export const dbManager = new MongoDatabaseManager();
