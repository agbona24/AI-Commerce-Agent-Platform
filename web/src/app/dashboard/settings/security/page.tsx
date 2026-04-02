"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Smartphone,
  Monitor,
  Globe,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Lock,
  Clock,
  MapPin,
  LogOut,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { settingsService, TwoFactorStatus, TwoFactorSetup } from "@/lib/api";

const mockSessions = [
  {
    id: "1",
    device: "MacBook Pro",
    browser: "Chrome 122",
    location: "San Francisco, CA",
    ip: "192.168.1.xxx",
    lastActive: "Now",
    current: true,
  },
  {
    id: "2",
    device: "iPhone 15 Pro",
    browser: "Safari",
    location: "San Francisco, CA",
    ip: "192.168.1.xxx",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    device: "Windows PC",
    browser: "Firefox 123",
    location: "New York, NY",
    ip: "10.0.0.xxx",
    lastActive: "3 days ago",
    current: false,
  },
];

const mockLoginHistory = [
  { date: "Mar 8, 2026 09:32 AM", location: "San Francisco, CA", device: "MacBook Pro", status: "success" },
  { date: "Mar 7, 2026 06:15 PM", location: "San Francisco, CA", device: "iPhone 15 Pro", status: "success" },
  { date: "Mar 6, 2026 11:20 AM", location: "New York, NY", device: "Windows PC", status: "success" },
  { date: "Mar 5, 2026 03:45 PM", location: "Unknown", device: "Unknown", status: "failed" },
  { date: "Mar 4, 2026 10:00 AM", location: "San Francisco, CA", device: "MacBook Pro", status: "success" },
];

export default function SecuritySettingsPage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [sessions] = useState(mockSessions);
  
  // 2FA State
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [twoFactorStep, setTwoFactorStep] = useState<'method' | 'verify' | 'backup'>('method');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Fetch 2FA status on mount
  const fetchTwoFactorStatus = useCallback(async () => {
    try {
      const status = await settingsService.getTwoFactorStatus();
      setTwoFactorStatus(status);
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err);
    }
  }, []);

  useEffect(() => {
    fetchTwoFactorStatus();
  }, [fetchTwoFactorStatus]);

  const handleEnableTwoFactor = async (method: 'app' | 'sms' | 'email') => {
    try {
      setIs2FALoading(true);
      setTwoFactorError(null);
      const setup = await settingsService.enableTwoFactor(method);
      setTwoFactorSetup(setup);
      setTwoFactorStep('verify');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable 2FA';
      setTwoFactorError(errorMessage);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFactorError('Please enter a 6-digit code');
      return;
    }
    
    try {
      setIs2FALoading(true);
      setTwoFactorError(null);
      await settingsService.verifyTwoFactor(verificationCode);
      setTwoFactorStep('backup');
      await fetchTwoFactorStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      setTwoFactorError(errorMessage);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!disablePassword) {
      setTwoFactorError('Please enter your password');
      return;
    }
    
    try {
      setIs2FALoading(true);
      setTwoFactorError(null);
      await settingsService.disableTwoFactor(disablePassword);
      await fetchTwoFactorStatus();
      setShow2FAModal(false);
      setDisablePassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setTwoFactorError(errorMessage);
    } finally {
      setIs2FALoading(false);
    }
  };

  const close2FAModal = () => {
    setShow2FAModal(false);
    setTwoFactorStep('method');
    setTwoFactorSetup(null);
    setVerificationCode('');
    setTwoFactorError(null);
    setDisablePassword('');
  };

  const twoFactorEnabled = twoFactorStatus?.enabled || false;

  const passwordStrength = () => {
    const { new: pwd } = passwordForm;
    if (pwd.length < 8) return { level: 0, label: "Too short", color: "bg-red-500" };
    if (pwd.length < 12) return { level: 1, label: "Weak", color: "bg-orange-500" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (!/[!@#$%^&*]/.test(pwd)) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  };

  const handleUpdatePassword = async () => {
    setPasswordError(null);
    
    // Validate
    if (!passwordForm.current) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await settingsService.updatePassword({
        current_password: passwordForm.current,
        password: passwordForm.new,
        password_confirmation: passwordForm.confirm,
      });

      setPasswordSuccess(true);
      setPasswordForm({ current: "", new: "", confirm: "" });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error updating password:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update password";
      setPasswordError(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="text-muted-foreground">Manage your account security settings</p>
        </div>
      </div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Password</h2>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors font-medium text-sm"
          >
            Change Password
          </button>
        </div>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              twoFactorEnabled ? "bg-green-500/10" : "bg-orange-500/10"
            }`}>
              <Smartphone className={`w-6 h-6 ${
                twoFactorEnabled ? "text-green-500" : "text-orange-500"
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Two-Factor Authentication</h2>
                {twoFactorEnabled ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-500 rounded-full">
                    Enabled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-500 rounded-full">
                    Not Enabled
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? "Your account is protected with 2FA" 
                  : "Add an extra layer of security"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShow2FAModal(true)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              twoFactorEnabled
                ? "border border-border hover:bg-muted"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {twoFactorEnabled ? "Manage" : "Enable 2FA"}
          </button>
        </div>

        {!twoFactorEnabled && (
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-600 text-sm">Security Recommendation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable two-factor authentication to protect your account from unauthorized access.
                  <span className="block mt-1 italic">Note: 2FA is currently a preview feature.</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Active Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Active Sessions</h2>
              <p className="text-sm text-muted-foreground">{sessions.length} devices logged in</p>
            </div>
          </div>
          <button className="text-sm text-red-500 hover:underline">
            Sign out all other devices
          </button>
        </div>

        <div className="divide-y divide-border">
          {sessions.map((session) => (
            <div key={session.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    session.current ? "bg-green-500/10" : "bg-muted"
                  }`}>
                    {session.device.includes("iPhone") ? (
                      <Smartphone className={`w-5 h-5 ${session.current ? "text-green-500" : "text-muted-foreground"}`} />
                    ) : (
                      <Monitor className={`w-5 h-5 ${session.current ? "text-green-500" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{session.device}</p>
                      {session.current && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500">
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Login History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Login History</h2>
              <p className="text-sm text-muted-foreground">Recent account activity</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {mockLoginHistory.map((login, index) => (
            <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    login.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    {login.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{login.date}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {login.location} • {login.device}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  login.status === "success" 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-red-500/10 text-red-500"
                }`}>
                  {login.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
      >
        <h2 className="font-semibold text-red-500 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-red-500/20">
            <div>
              <p className="font-medium text-sm">Download account data</p>
              <p className="text-xs text-muted-foreground">Get a copy of all your data</p>
            </div>
            <button className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
              Request Export
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm text-red-500">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error message */}
              {passwordError && (
                <div className="flex items-center gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{passwordError}</p>
                </div>
              )}

              {/* Success message */}
              {passwordSuccess && (
                <div className="flex items-center gap-3 p-3 mb-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <p>Password updated successfully!</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  {passwordForm.new && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              i <= strength.level ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password strength: <span className="font-medium">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                  {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={close2FAModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {twoFactorEnabled ? "Manage 2FA" : "Enable Two-Factor Authentication"}
                </h2>
                <button
                  onClick={close2FAModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {twoFactorError && (
                <div className="flex items-center gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{twoFactorError}</p>
                </div>
              )}

              {!twoFactorEnabled ? (
                <div className="space-y-6">
                  {twoFactorStep === 'method' && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Choose how you want to receive your authentication codes:
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleEnableTwoFactor('app')}
                          disabled={is2FALoading}
                          className="w-full p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-left flex items-center gap-4 disabled:opacity-50"
                        >
                          <Smartphone className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-medium">Authenticator App</p>
                            <p className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or similar</p>
                          </div>
                        </button>
                      </div>
                    </>
                  )}

                  {twoFactorStep === 'verify' && twoFactorSetup && (
                    <>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Scan this QR code with your authenticator app, then enter the 6-digit code:
                        </p>
                        <div className="w-48 h-48 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          {/* In production, render actual QR code here */}
                          <div className="text-center">
                            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">QR Code</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-4">
                          <p>Or enter this secret manually:</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <code className="bg-muted px-3 py-1 rounded font-mono text-sm">{twoFactorSetup.secret.slice(0, 16)}...</code>
                            <button 
                              onClick={() => navigator.clipboard.writeText(twoFactorSetup.secret)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Verification Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-center text-2xl tracking-widest font-mono"
                        />
                      </div>

                      <button
                        onClick={handleVerifyTwoFactor}
                        disabled={is2FALoading || verificationCode.length !== 6}
                        className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {is2FALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Verify & Enable
                      </button>
                    </>
                  )}

                  {twoFactorStep === 'backup' && twoFactorSetup && (
                    <>
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <p className="font-medium text-green-600 text-sm">2FA Enabled!</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Save your backup codes</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Store these codes somewhere safe. You can use them to access your account if you lose your authenticator.
                        </p>
                        <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-xl">
                          {twoFactorSetup.backup_codes.map((code: string, i: number) => (
                            <code key={i} className="text-sm font-mono">{code}</code>
                          ))}
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(twoFactorSetup.backup_codes.join('\n'))}
                          className="mt-2 text-sm text-primary flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" /> Copy all codes
                        </button>
                      </div>

                      <button
                        onClick={close2FAModal}
                        className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        Done
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-600 text-sm">2FA is enabled</p>
                        <p className="text-xs text-muted-foreground">
                          Method: {twoFactorStatus?.method === 'app' ? 'Authenticator App' : twoFactorStatus?.method}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium mb-2 text-red-500">Disable 2FA</p>
                    <p className="text-xs text-muted-foreground mb-3">Enter your password to disable two-factor authentication.</p>
                    <input
                      type="password"
                      placeholder="Your password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none mb-3"
                    />
                    <button
                      onClick={handleDisableTwoFactor}
                      disabled={is2FALoading || !disablePassword}
                      className="w-full py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {is2FALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Disable 2FA
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
