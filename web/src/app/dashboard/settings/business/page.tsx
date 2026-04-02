"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Upload,
  Link2,
  CheckCircle2,
  Palette,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { settingsService, fileService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const industries = [
  { value: "e-commerce", label: "E-Commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "real-estate", label: "Real Estate" },
  { value: "education", label: "Education" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "technology", label: "Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

interface BusinessFormData {
  name: string;
  website: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  primaryColor: string;
  taxId: string;
  logo: string | null;
}

export default function BusinessSettingsPage() {
  const { tenant, refreshUser } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    website: "",
    email: "",
    phone: "",
    industry: "e-commerce",
    companySize: "1-10",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    primaryColor: "#7C3AED",
    taxId: "",
    logo: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load business data from tenant
  useEffect(() => {
    if (tenant) {
      // Handle address - it might be a string or an object
      const addressObj = typeof tenant.address === 'object' && tenant.address
        ? tenant.address
        : { street: '', city: '', state: '', zip: '', country: '' };
      
      setFormData({
        name: tenant.name || "",
        website: tenant.website || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        industry: tenant.industry || "e-commerce",
        companySize: tenant.company_size || "1-10",
        address: addressObj.street || "",
        city: addressObj.city || "",
        state: addressObj.state || "",
        zip: addressObj.zip || "",
        country: addressObj.country || "",
        primaryColor: tenant.primary_color || "#7C3AED",
        taxId: tenant.tax_id || "",
        logo: tenant.logo || null,
      });
      setIsLoading(false);
    }
  }, [tenant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    setIsUploadingLogo(true);
    setError(null);
    
    try {
      const result = await fileService.uploadLogo(file);
      setFormData(prev => ({ ...prev, logo: result.url }));
      await refreshUser();
    } catch (err) {
      console.error('Failed to upload logo:', err);
      setError('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      await settingsService.updateBusiness({
        name: formData.name,
        website: formData.website || undefined,
        business_email: formData.email || undefined,
        business_phone: formData.phone || undefined,
        industry: formData.industry || undefined,
        company_size: formData.companySize || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        zip_code: formData.zip || undefined,
        primary_color: formData.primaryColor || undefined,
        tax_id: formData.taxId || undefined,
      });

      // Refresh auth context to update tenant data
      await refreshUser();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving business settings:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Business Details</h1>
          <p className="text-muted-foreground">
            Update company information and branding
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Branding
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  {formData.name.charAt(0)}
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button 
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUploadingLogo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div>
              <p className="font-medium text-sm">Company Logo</p>
              <p className="text-xs text-muted-foreground mb-2">
                PNG, JPG up to 2MB
              </p>
              <button 
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                <Upload className="w-3 h-3" /> {isUploadingLogo ? 'Uploading...' : 'Upload logo'}
              </button>
            </div>
          </div>

          {/* Brand Color */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="w-12 h-12 rounded-xl border border-border cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="w-32 px-4 py-2 rounded-xl border border-border bg-background uppercase font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Basic Information
        </h2>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, industry: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Size
            </label>
            <select
              value={formData.companySize}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, companySize: e.target.value }))
              }
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              {companySizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Contact Information
        </h2>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Address */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Business Address
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ZIP Code</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zip: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Tax Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Tax Information
        </h2>

        <div>
          <label className="block text-sm font-medium mb-2">Tax ID / VAT Number</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, taxId: e.target.value }))
            }
            placeholder="Enter your tax ID"
            className="w-full max-w-xs px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This will appear on your invoices
          </p>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
