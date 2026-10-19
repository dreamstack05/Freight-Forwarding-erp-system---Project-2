/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AuthProvider, 
  useAuth 
} from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { LeadsManager } from './components/LeadsManager';
import { CallSheetsManager } from './components/CallSheetsManager';
import { ShipmentsManager } from './components/ShipmentsManager';
import { SchedulesManager } from './components/SchedulesManager';
import { ConsolManager } from './components/ConsolManager';
import { HBLReportPreview } from './components/HBLReportPreview';
import { apiService } from './services/api';
import { 
  SalesLead, 
  CallSheet, 
  Shipment, 
  SailingSchedule, 
  Consol 
} from './types';
import { 
  Anchor, 
  Layers3, 
  Users, 
  PhoneCall, 
  Ship, 
  LayoutDashboard, 
  LogOut, 
  Lock, 
  KeyRound, 
  Mail, 
  Sparkles,
  Info,
  User,
  CheckCircle2
} from 'lucide-react';

const InnerApp: React.FC = () => {
  const { user, login, logout, loading, signupUser } = useAuth();
  
  // Navigation states
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedReportShipment, setSelectedReportShipment] = useState<Shipment | null>(null);

  // Core database collections
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [callSheets, setCallSheets] = useState<CallSheet[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [schedules, setSchedules] = useState<SailingSchedule[]>([]);
  const [consols, setConsols] = useState<Consol[]>([]);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string; uri: string; error: string | null } | null>(null);

  // Authentication Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Sign-Up Specific Fields
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<string>('Operations Executive');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Manual Signup Form Submit Action
  const handleManualSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupEmail || !signupPassword) {
      setAuthError('All requested fields (username, email, password, and role) are required to build a staff access record.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    setSignupSuccess('');
    try {
      const newUser = await signupUser({
        username: signupUsername,
        email: signupEmail,
        role: signupRole,
        password: signupPassword
      });
      setSignupSuccess(`Access register granted! Account "${newUser.username}" as "${newUser.role}" successfully authorized. Please sign in.`);
      setEmailInput(signupEmail);
      setPasswordInput('');
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setIsSignUp(false);
    } catch (err: any) {
      setAuthError(err.message || 'Error occurred during secure portal registration.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot/Reset Password State & Handlers
  const { forgotPassword, resetPassword } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Request, 2 = Verify & update
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Phase 1: Verify Email and generate verification token
  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('Please input your corporate email address.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      const res = await forgotPassword({ email: resetEmail });
      setResetSuccess(res.message);
      if (res.simulatedToken) {
        setResetTokenInput(res.simulatedToken);
      }
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.message || 'We could not recognize that email in our system.');
    } finally {
      setResetLoading(false);
    }
  };

  // Phase 2: Complete password reset with verification token and new passkey
  const handleCompleteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetTokenInput || !resetNewPassword) {
      setResetError('Email address, reset token, and new password code are all required.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      const res = await resetPassword({
        email: resetEmail,
        token: resetTokenInput,
        newPassword: resetNewPassword
      });
      setResetSuccess(res.message);
      // Populate fields automatically to make logins convenient after reset
      setEmailInput(resetEmail);
      setPasswordInput(resetNewPassword);
    } catch (err: any) {
      setResetError(err.message || 'Error executing secure password update.');
    } finally {
      setResetLoading(false);
    }
  };

  // Load all records
  const loadData = async () => {
    if (!user) return;
    try {
      const [leadsRes, callsRes, shipsRes, schedsRes, consolsRes, dbStatusRes] = await Promise.all([
        apiService.getLeads(),
        apiService.getCallSheets(),
        apiService.getShipments(),
        apiService.getSchedules(),
        apiService.getConsols(),
        apiService.getDbStatus().catch(() => null)
      ]);
      setLeads(leadsRes);
      setCallSheets(callsRes);
      setShipments(shipsRes);
      setSchedules(schedsRes);
      setConsols(consolsRes);
      if (dbStatusRes) {
        setDbStatus(dbStatusRes);
      }
    } catch (e) {
      console.error('Error fetching backend ERP database', e);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Handle click preset login help
  const handlePresetLogin = async (email: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await login({ email, password: 'password123' });
    } catch (err: any) {
      setAuthError(err.message || 'Login preset execution error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleManualLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Email and Password variables are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      await login({ email: emailInput, password: passwordInput });
    } catch (err: any) {
      setAuthError(err.message || 'Invalid username or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-t-2 border-indigo-400 border-solid rounded-full animate-spin"></div>
        <div className="text-slate-400 font-mono text-xs">Authenticating secure link...</div>
      </div>
    );
  }

  // --- RENDERING WORKSPACE PRESET SIGNIN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-5 min-h-[550px]" id="auth-login-card">
          
          {/* Left panel branding info */}
          <div className="md:col-span-2 bg-[#0F172A] text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Anchor className="w-8 h-8 rounded-lg" />
                <span className="font-extrabold text-md tracking-wider">FORWARD ERP</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight pt-4">Freight Cargo Port Systems</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Logistics, sailing cutoffs, container allocation dunnage formulas, House Bill Of Lading automation workflows. Trusted globally since 2012.
              </p>
            </div>

            <div className="text-[10px] text-slate-500 font-mono relative z-10 pt-12">
              FORWARD ERP SYSTEM v2.6.4<br />
              Secure SHA256 Encryption active
            </div>

            {/* Decorative vector block */}
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl"></div>
          </div>

          {/* Right form submission panels */}
          <div className="md:col-span-3 p-8 flex flex-col justify-between">
            <div className="space-y-4">
              {isSignUp ? (
                <div>
                  <h1 className="text-xl font-black text-slate-800">Register Access Port</h1>
                  <p className="text-xs text-slate-400 mt-1">Configure your corporate account to enter the Cargo Forwarding ERP</p>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl font-black text-slate-800">Operational Gateway</h1>
                  <p className="text-xs text-slate-400 mt-1">Provide secure credentials or quick-select a staff profile context below</p>
                </div>
              )}

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-100 font-medium">
                  {authError}
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-805 text-xs rounded-lg border border-emerald-100 font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {isSignUp ? (
                /* Interactive Registration / Signup Form */
                <form onSubmit={handleManualSignUpSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Corporate Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        placeholder="e.g. jdoe_ops" 
                        required
                        value={signupUsername} 
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Corporate Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="email" 
                        placeholder="e.g. jdoe@forwarderp.com" 
                        required
                        value={signupEmail} 
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Assign Staff Role</label>
                    <select 
                      value={signupRole} 
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 font-semibold"
                    >
                      <option value="Operations Executive">Operations Executive (Voyages, HBL, Consols)</option>
                      <option value="Sales Executive">Sales Executive (Warm Followups & Leads)</option>
                      <option value="Documentation Executive">Documentation Executive (HBL logs, container state)</option>
                      <option value="Manager">Manager (Auditing dashboard, leads approval)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Access Pass-key Security Code</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="password" 
                        placeholder="Choose a password code" 
                        required
                        value={signupPassword} 
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
                  >
                    {authLoading ? 'Authorizing database record...' : 'Create Safe Operational Account'}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-slate-500">Already registered? </span>
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(false); setAuthError(''); }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold underline hover:no-underline"
                    >
                      Request Access Entrance (Sign In)
                    </button>
                  </div>
                </form>
              ) : (
                /* Traditional Login Form */
                <form onSubmit={handleManualLoginSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold uppercase text-[9px] mb-1">Corporate Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="email" 
                        placeholder="e.g. admin@forwarderp.com" 
                        value={emailInput} 
                        required
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-slate-500 font-semibold uppercase text-[9px]">Pass-key Security Code</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setResetEmail(emailInput);
                          setResetStep(1);
                          setResetError('');
                          setResetSuccess('');
                          setResetTokenInput('');
                          setResetNewPassword('');
                          setShowResetModal(true);
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold hover:underline focus:outline-none"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwordInput} 
                        required
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
                  >
                    {authLoading ? 'Verifying access token...' : 'Request Access Clearance'}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-slate-500">Need corporate employee access? </span>
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(true); setAuthError(''); setSignupSuccess(''); }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold underline hover:no-underline"
                    >
                      Register for Access
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Presets section */}
            {!isSignUp && (
              <div className="border-t border-slate-100 pt-5 mt-6">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2.5">
                  Quick Select Preset Staff Credentials:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  
                  <div 
                    onClick={() => handlePresetLogin('admin@forwarderp.com')}
                    className="p-2 border border-slate-100 hover:border-indigo-200 rounded-lg bg-slate-50/55 hover:bg-indigo-50/20 cursor-pointer text-left transition"
                    title="Admin Role"
                  >
                    <strong className="text-slate-800 block">System Admin</strong>
                    <span className="text-slate-400 text-[10px]">admin@forwarderp.com</span>
                  </div>

                  <div 
                    onClick={() => handlePresetLogin('sales@forwarderp.com')}
                    className="p-2 border border-slate-100 hover:border-violet-200 rounded-lg bg-slate-50/55 hover:bg-violet-50/20 cursor-pointer text-left transition"
                    title="Sales Executive Role"
                  >
                    <strong className="text-slate-800 block">Sales Desk</strong>
                    <span className="text-slate-400 text-[10px]">sales@forwarderp.com</span>
                  </div>

                  <div 
                    onClick={() => handlePresetLogin('ops@forwarderp.com')}
                    className="p-2 border border-slate-100 hover:border-emerald-200 rounded-lg bg-slate-50/55 hover:bg-emerald-50/20 cursor-pointer text-left transition"
                    title="Ops Representative"
                  >
                    <strong className="text-slate-800 block">Operations Desk</strong>
                    <span className="text-slate-400 text-[10px]">ops@forwarderp.com</span>
                  </div>

                </div>
              </div>
            )}

          </div>
          
          {/* Dedicated Reset Password Dialog */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
              <div 
                className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                id="reset-password-dialog"
              >
                {/* Modal Header */}
                <div className="bg-[#0F172A] text-white p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-indigo-400" />
                    <span className="font-extrabold text-xs tracking-wider">RECOVERY OPERATIONS</span>
                  </div>
                  <button 
                    onClick={() => setShowResetModal(false)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
                    aria-label="Close dialog"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Passkey Recovery System</h3>
                    <p className="text-slate-400 mt-0.5 text-[10px]">
                      Follow the multi-factor security clearance checklist down to reset your ERP account password.
                    </p>
                  </div>

                  {resetError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-[11px] rounded border border-rose-100 font-semibold">
                      ✕ {resetError}
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] rounded border border-emerald-100 font-medium space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Clearance Action Registered</span>
                      </div>
                      <p className="text-slate-650 font-normal leading-tight">
                        {resetSuccess}
                      </p>
                    </div>
                  )}

                  {resetStep === 1 ? (
                    /* Step 1 Form */
                    <form onSubmit={handleRequestResetToken} className="space-y-3.5">
                      <div>
                        <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">
                          Corporate Employee Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input 
                            type="email" 
                            placeholder="e.g. admin@forwarderp.com" 
                            required
                            value={resetEmail} 
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-500 text-[10px] leading-relaxed italic">
                        <strong>Simulated Sandbox Flow:</strong> Submitting a verified employee account email will automatically provision and pre-fill the on-screen validation token for instant feedback.
                      </div>

                      <button 
                        type="submit" 
                        disabled={resetLoading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                      >
                        {resetLoading ? 'Validating account credentials...' : 'Verify Email & Issue Token'}
                      </button>

                      <div className="text-center">
                        <button 
                          type="button" 
                          onClick={() => setResetStep(2)}
                          className="text-indigo-600 hover:text-indigo-750 font-bold underline text-[10px]"
                        >
                          I already possess a recovery token
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Step 2 Form */
                    <form onSubmit={handleCompleteResetPassword} className="space-y-3.5">
                      <div>
                        <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">
                          Verified Employee Email
                        </label>
                        <input 
                          type="email" 
                          readOnly
                          value={resetEmail} 
                          className="w-full bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-500 font-semibold cursor-not-allowed text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">
                          Multi-Factor Verified Token
                        </label>
                        <div className="relative">
                          <Sparkles className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input 
                            type="text" 
                            placeholder="e.g. FWD-123456" 
                            required
                            value={resetTokenInput} 
                            onChange={(e) => setResetTokenInput(e.target.value)}
                            className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">
                          Choose New Passkey Security Code
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input 
                            type="password" 
                            placeholder="Enter a secure password code" 
                            required
                            value={resetNewPassword} 
                            onChange={(e) => setResetNewPassword(e.target.value)}
                            className="w-full bg-slate-50 p-2.5 pl-9 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 text-xs"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={resetLoading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                      >
                        {resetLoading ? 'Upgrading account credentials...' : 'Establish New Security Password'}
                      </button>

                      <div className="flex justify-between items-center text-slate-500 text-[10px] pt-1 border-t border-slate-100">
                        <button 
                          type="button" 
                          onClick={() => setResetStep(1)}
                          className="hover:text-indigo-600 font-bold text-indigo-600 text-[10px]"
                        >
                          ← Email validation
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowResetModal(false);
                            setResetError('');
                            setResetSuccess('');
                          }}
                          className="text-slate-500 hover:text-indigo-600 font-semibold"
                        >
                          Close & return
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- NAVIGATION SWITCH ROUTING ---
  const handleRedirectView = (view: string) => {
    setSelectedReportShipment(null); // Reset report if switching tabs
    setCurrentView(view);
  };

  const handleOpenPrintHblReport = (ship: Shipment) => {
    setSelectedReportShipment(ship);
    setCurrentView('hbl-report');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E293B] flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* Dynamic left side menu rail panel */}
      <aside className="w-full md:w-[220px] bg-[#0F172A] text-white flex flex-col shrink-0 select-none border-b md:border-b-0 md:border-r border-slate-850">
        
        {/* Branding header area */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800 bg-[#1E293B]">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-sm italic text-white shrink-0">FF</div>
          <span className="font-bold text-lg tracking-tight uppercase text-blue-100">FreightERP</span>
        </div>

        {/* Workspace Menu list rail links */}
        <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
          <div className="px-5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Modules</div>
          
          <button 
            onClick={() => handleRedirectView('dashboard')}
            className={`flex items-center gap-3 px-5 py-2 text-xs text-left w-full transition ${
              currentView === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-xs">⊞</span>
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => handleRedirectView('leads')}
            className={`flex items-center gap-3 px-5 py-2 text-xs text-left w-full transition ${
              currentView === 'leads' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-xs">⚑</span>
            <span>Sales Leads</span>
          </button>

          <button 
            onClick={() => handleRedirectView('callsheets')}
            className={`flex items-center gap-3 px-5 py-2 text-xs text-left w-full transition ${
              currentView === 'callsheets' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-xs">📞</span>
            <span>Call Logs</span>
          </button>

          <button 
            onClick={() => handleRedirectView('shipments')}
            className={`flex items-center gap-3 px-5 py-2 text-xs text-left w-full transition ${
              currentView === 'shipments' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-xs">🚢</span>
            <span>Shipment Mgmt</span>
          </button>

          <button 
            onClick={() => handleRedirectView('schedules')}
            className={`flex items-center gap-3 px-5 py-2 text-xs text-left w-full transition ${
              currentView === 'schedules' ? 'bg-blue-600 /20 text-blue-400 border-r-2 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-xs">🗓</span>
            <span>Sailing Schedule</span>
          </button>

          <button 
            onClick={() => handleRedirectView('consols')}
            className={`flex items-center gap-3 px-5 py-2 text-xs text-left w-full transition ${
              currentView === 'consols' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-xs">📦</span>
            <span>Consol Planner</span>
          </button>

        </div>

        {/* Footer info brand & user profile segment */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-[#0F172A] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-slate-750 border border-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {user.username.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-100 truncate capitalize">{user.username}</div>
              <div className="text-[10px] text-slate-500 truncate capitalize">{user.role}</div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-450 rounded transition"
            title="Log off safe session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Main Panel with top search-bar / statistics header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Compact high density header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-xs shrink-0 select-none">
          <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-md w-72 md:w-96">
            <span className="text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Search HBL, Lead #, or Container..." 
              className="bg-transparent outline-none text-xs w-full text-slate-800 placeholder-slate-400"
              readOnly
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 items-center text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 font-medium">Server Live: ASIA-W1</span>
            </div>
            <button className="p-2 text-slate-400 relative hover:text-blue-600">
              <span>🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Primary content view workspace wrapper */}
        <main className="flex-1 p-5 overflow-y-auto w-full">
          {currentView === 'dashboard' && (
            <Dashboard 
              leads={leads}
              callSheets={callSheets}
              shipments={shipments}
              schedules={schedules}
              consols={consols}
              onNavigate={handleRedirectView}
              currentUser={user}
              dbStatus={dbStatus}
            />
          )}

          {currentView === 'leads' && (
            <LeadsManager 
              leads={leads}
              onRefresh={loadData}
              currentUser={user}
            />
          )}

          {currentView === 'callsheets' && (
            <CallSheetsManager 
              callSheets={callSheets}
              onRefresh={loadData}
              currentUser={user}
            />
          )}

          {currentView === 'shipments' && (
            <ShipmentsManager 
              shipments={shipments}
              onRefresh={loadData}
              currentUser={user}
              onViewReport={handleOpenPrintHblReport}
            />
          )}

          {currentView === 'schedules' && (
            <SchedulesManager 
              schedules={schedules}
              onRefresh={loadData}
              currentUser={user}
            />
          )}

          {currentView === 'consols' && (
            <ConsolManager 
              consols={consols}
              onRefresh={loadData}
              currentUser={user}
            />
          )}

          {currentView === 'hbl-report' && (
            <HBLReportPreview 
              shipment={selectedReportShipment}
              onBack={() => handleRedirectView('shipments')}
            />
          )}

        </main>

      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
