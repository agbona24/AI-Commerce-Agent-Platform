"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

type AccountType = "business" | "agency" | null;

// Step-specific schemas
const step2Schema = z.object({
  first_name: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
  password_confirmation: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

const step3Schema = z.object({
  company_name: z.string().min(1, "Company name is required").min(2, "Company name must be at least 2 characters"),
  terms: z.literal(true, "You must accept the terms and conditions"),
});

type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  // Step 2 form
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: step2Errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  // Step 3 form
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: step3Errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      company_name: "",
      terms: false as unknown as true,
    },
  });

  const onStep2Submit = (data: Step2Data) => {
    setStep2Data(data);
    setStep(3);
  };

  const onStep3Submit = async (data: Step3Data) => {
    if (!step2Data || !accountType) return;
    
    clearError();
    try {
      await registerUser({
        first_name: step2Data.first_name,
        last_name: step2Data.last_name,
        email: step2Data.email,
        phone: step2Data.phone,
        password: step2Data.password,
        password_confirmation: step2Data.password_confirmation,
        company_name: data.company_name,
        account_type: accountType,
      });
    } catch {
      // Error is handled in context
    }
  };

  const canProceedStep1 = accountType !== null;

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/50" : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Global error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Account Type Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Create your account</h2>
              <p className="text-muted-foreground">
                How will you be using Vivax AI?
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Business Option */}
              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                  accountType === "business"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      accountType === "business"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Business</h3>
                      {accountType === "business" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      I&apos;m a business owner looking to automate my customer interactions
                    </p>
                  </div>
                </div>
              </button>

              {/* Agency Option */}
              <button
                type="button"
                onClick={() => setAccountType("agency")}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                  accountType === "agency"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      accountType === "agency"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Agency / Consultant</h3>
                      {accountType === "agency" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      I manage multiple client businesses and need a portfolio dashboard
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Your details</h2>
              <p className="text-muted-foreground">
                Tell us a bit about yourself
              </p>
            </div>

            <form onSubmit={handleSubmitStep2(onStep2Submit)} className="space-y-4 mb-6">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      {...registerStep2("first_name")}
                      placeholder="John"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border ${
                        step2Errors.first_name ? "border-destructive" : "border-border"
                      } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                    />
                  </div>
                  {step2Errors.first_name && (
                    <p className="mt-1 text-xs text-destructive">{step2Errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    {...registerStep2("last_name")}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 rounded-xl bg-card border ${
                      step2Errors.last_name ? "border-destructive" : "border-border"
                    } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                  />
                  {step2Errors.last_name && (
                    <p className="mt-1 text-xs text-destructive">{step2Errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerStep2("email")}
                    placeholder="john@example.com"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border ${
                      step2Errors.email ? "border-destructive" : "border-border"
                    } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                  />
                </div>
                {step2Errors.email && (
                  <p className="mt-1 text-xs text-destructive">{step2Errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number <span className="text-muted-foreground">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    {...registerStep2("phone")}
                    placeholder="+234 801 234 5678"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...registerStep2("password")}
                    placeholder="Create a strong password"
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-card border ${
                      step2Errors.password ? "border-destructive" : "border-border"
                    } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {step2Errors.password ? (
                  <p className="text-xs text-destructive mt-2">{step2Errors.password.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    Must be at least 8 characters with a number and symbol
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerStep2("password_confirmation")}
                    placeholder="Confirm your password"
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-card border ${
                      step2Errors.password_confirmation ? "border-destructive" : "border-border"
                    } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {step2Errors.password_confirmation && (
                  <p className="text-xs text-destructive mt-1">{step2Errors.password_confirmation.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full border border-border bg-card text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Business/Agency Details */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {accountType === "agency" ? "Agency details" : "Business details"}
              </h2>
              <p className="text-muted-foreground">
                {accountType === "agency"
                  ? "Tell us about your agency"
                  : "Tell us about your business"}
              </p>
            </div>

            <form onSubmit={handleSubmitStep3(onStep3Submit)} className="space-y-4 mb-6">
              {accountType === "agency" ? (
                <>
                  {/* Agency Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Agency Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        {...registerStep3("company_name")}
                        placeholder="Digital Solutions Agency"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border ${
                          step3Errors.company_name ? "border-destructive" : "border-border"
                        } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                      />
                    </div>
                    {step3Errors.company_name && (
                      <p className="mt-1 text-xs text-destructive">{step3Errors.company_name.message}</p>
                    )}
                  </div>

                  {/* Number of clients info */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Multi-Client Support</p>
                        <p className="text-xs text-muted-foreground">
                          You&apos;ll be able to add client businesses after signup
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        {...registerStep3("company_name")}
                        placeholder="Acme Corporation"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border ${
                          step3Errors.company_name ? "border-destructive" : "border-border"
                        } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                      />
                    </div>
                    {step3Errors.company_name && (
                      <p className="mt-1 text-xs text-destructive">{step3Errors.company_name.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...registerStep3("terms")}
                  className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {step3Errors.terms && (
                <p className="text-xs text-destructive">{step3Errors.terms.message}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-full border border-border bg-card text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
