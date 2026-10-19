/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthResponse,
  User,
  SalesLead,
  CallSheet,
  Shipment,
  SailingSchedule,
  Consol,
  PackAllocation,
  EDIDetails,
  PickupRecord,
  DeliveryRecord
} from '../types';

// Relative path works because Vite assets are served directly from the same Express origin
const BASE_URL = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('erp_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.error || errMsg;
    } catch (e) {
      // Ignore if not json
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const apiService = {
  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================
  async login(payload: Record<string, string>): Promise<AuthResponse> {
    const data = await fetchJson<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('erp_token', data.token);
    localStorage.setItem('erp_user', JSON.stringify(data.user));
    return data;
  },

  async register(payload: Record<string, string>): Promise<User> {
    return fetchJson<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async signup(payload: Record<string, string>): Promise<User> {
    return fetchJson<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async forgotPassword(payload: Record<string, string>): Promise<{ message: string; email: string; simulatedToken: string }> {
    return fetchJson<{ message: string; email: string; simulatedToken: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(payload: Record<string, string>): Promise<{ message: string }> {
    return fetchJson<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: Record<string, string>): Promise<{ message: string }> {
    return fetchJson<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout(): void {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  },

  async getProfile(): Promise<{ user: User }> {
    return fetchJson<{ user: User }>('/auth/profile');
  },

  // ==========================================
  // MODULE 2: LEADS APIs
  // ==========================================
  async getLeads(query?: string): Promise<SalesLead[]> {
    const url = query ? `/leads?query=${encodeURIComponent(query)}` : '/leads';
    return fetchJson<SalesLead[]>(url);
  },

  async createLead(lead: Partial<SalesLead>): Promise<SalesLead> {
    return fetchJson<SalesLead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  },

  async updateLead(id: string, lead: Partial<SalesLead>): Promise<SalesLead> {
    return fetchJson<SalesLead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
  },

  async convertLead(id: string): Promise<{ message: string; lead: SalesLead; shipment: Shipment }> {
    return fetchJson<{ message: string; lead: SalesLead; shipment: Shipment }>(`/leads/${id}/convert`, {
      method: 'POST',
    });
  },

  // ==========================================
  // MODULE 3: CALL SHEETS APIs
  // ==========================================
  async getCallSheets(query?: string): Promise<CallSheet[]> {
    const url = query ? `/callsheets?query=${encodeURIComponent(query)}` : '/callsheets';
    return fetchJson<CallSheet[]>(url);
  },

  async createCallSheet(call: Partial<CallSheet>): Promise<CallSheet> {
    return fetchJson<CallSheet>('/callsheets', {
      method: 'POST',
      body: JSON.stringify(call),
    });
  },

  async updateCallSheet(id: string, call: Partial<CallSheet>): Promise<CallSheet> {
    return fetchJson<CallSheet>(`/callsheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(call),
    });
  },

  async deleteCallSheet(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/callsheets/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // MODULE 4: SHIPMENT & SUBMODULES APIs
  // ==========================================
  async getShipments(query?: string): Promise<Shipment[]> {
    const url = query ? `/shipments?query=${encodeURIComponent(query)}` : '/shipments';
    return fetchJson<Shipment[]>(url);
  },

  async createShipment(shipment: Partial<Shipment>): Promise<Shipment> {
    return fetchJson<Shipment>('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipment),
    });
  },

  async updateShipment(id: string, shipment: Partial<Shipment>): Promise<Shipment> {
    return fetchJson<Shipment>(`/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shipment),
    });
  },

  async addPackAllocation(shipmentId: string, pack: Partial<PackAllocation>): Promise<Shipment> {
    return fetchJson<Shipment>(`/shipments/${shipmentId}/pack`, {
      method: 'POST',
      body: JSON.stringify(pack),
    });
  },

  async deletePackAllocation(shipmentId: string, packId: string): Promise<Shipment> {
    return fetchJson<Shipment>(`/shipments/${shipmentId}/pack/${packId}`, {
      method: 'DELETE',
    });
  },

  async updateSubmodules(
    shipmentId: string, 
    payload: { ediDetails?: Partial<EDIDetails>; pickup?: Partial<PickupRecord>; delivery?: Partial<DeliveryRecord> }
  ): Promise<Shipment> {
    return fetchJson<Shipment>(`/shipments/${shipmentId}/submodules`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async sendShipmentEmail(
    shipmentId: string, 
    emailPayload: { emailType: string; to: string; cc: string; bcc: string; template: string }
  ): Promise<Shipment> {
    return fetchJson<Shipment>(`/shipments/${shipmentId}/email`, {
      method: 'POST',
      body: JSON.stringify(emailPayload),
    });
  },

  // ==========================================
  // MODULE 5: SAILING SCHEDULES APIs
  // ==========================================
  async getSchedules(query?: string): Promise<SailingSchedule[]> {
    const url = query ? `/schedules?query=${encodeURIComponent(query)}` : '/schedules';
    return fetchJson<SailingSchedule[]>(url);
  },

  async createSchedule(sched: Partial<SailingSchedule>): Promise<SailingSchedule> {
    return fetchJson<SailingSchedule>('/schedules', {
      method: 'POST',
      body: JSON.stringify(sched),
    });
  },

  async updateSchedule(id: string, sched: Partial<SailingSchedule>): Promise<SailingSchedule> {
    return fetchJson<SailingSchedule>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sched),
    });
  },

  // ==========================================
  // MODULE 6: CONSOL APIs
  // ==========================================
  async getConsols(query?: string): Promise<Consol[]> {
    const url = query ? `/consols?query=${encodeURIComponent(query)}` : '/consols';
    return fetchJson<Consol[]>(url);
  },

  async createConsol(consol: Partial<Consol>): Promise<Consol> {
    return fetchJson<Consol>('/consols', {
      method: 'POST',
      body: JSON.stringify(consol),
    });
  },

  async updateConsol(id: string, consol: Partial<Consol>): Promise<Consol> {
    return fetchJson<Consol>(`/consols/${id}`, {
      method: 'PUT',
      body: JSON.stringify(consol),
    });
  },

  async addConsolContainer(id: string, containerPayload: Record<string, any>): Promise<Consol> {
    return fetchJson<Consol>(`/consols/${id}/container`, {
      method: 'POST',
      body: JSON.stringify(containerPayload),
    });
  },

  async addConsolLeg(id: string, legPayload: Record<string, any>): Promise<Consol> {
    return fetchJson<Consol>(`/consols/${id}/leg`, {
      method: 'POST',
      body: JSON.stringify(legPayload),
    });
  },

  async getDbStatus(): Promise<{ connected: boolean; mode: string; uri: string; error: string | null }> {
    return fetchJson<{ connected: boolean; mode: string; uri: string; error: string | null }>('/db-status');
  }
};
