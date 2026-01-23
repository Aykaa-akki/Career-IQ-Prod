import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Brain,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  X,
  Loader2,
  Lock,
  Shield,
  ChevronRight
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import { getUTMParams } from "../utils/utm";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Country codes for selector
const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
];

export default function OrderPage() {
  const navigate = useNavigate();
  
  // Form state
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [consentChecked, setConsentChecked] = useState(true); // Auto-ticked
  const [showLinkedinGuide, setShowLinkedinGuide] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const fetchKey = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/razorpay-key`);
        setRazorpayKey(res.data.key_id);
      } catch (err) {
        console.error("Failed to fetch Razorpay key:", err);
      }
    };
    fetchKey();
  }, []);

  const handleFileDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    
    if (!file) return;
    
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    
    if (type === 'resume') {
      setResumeFile(file);
    } else {
      setLinkedinFile(file);
    }
  }, []);

  // Format phone to E.164
  const formatE164 = (code, number) => {
    const cleanNumber = number.replace(/\D/g, '');
    return `${code}${cleanNumber}`;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!consentChecked) {
      setConsentError(true);
      toast.error("Consent is required to generate and deliver your report.");
      return;
    }
    setConsentError(false);

    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!targetRole.trim()) {
      toast.error("Please enter your target role");
      return;
    }
    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    // Meta Tracking: Push dataLayer event for AddToCart tracking
    // This fires BEFORE payment flow starts (for GTM → Meta AddToCart)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'careerIQ_payment_cta_click'
    });

    setIsProcessing(true);

    // Get UTM parameters for attribution tracking
    const utmParams = getUTMParams();

    try {
      // Step 1: Upload files
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('target_role', targetRole.trim());
      formData.append('mobile_number', formatE164(countryCode, phoneNumber));
      
      if (linkedinFile) {
        formData.append('linkedin', linkedinFile);
      }

      // Append UTM params to form data
      if (utmParams.utm_source) formData.append('utm_source', utmParams.utm_source);
      if (utmParams.utm_medium) formData.append('utm_medium', utmParams.utm_medium);
      if (utmParams.utm_campaign) formData.append('utm_campaign', utmParams.utm_campaign);
      if (utmParams.utm_adset) formData.append('utm_adset', utmParams.utm_adset);
      if (utmParams.utm_adcreative) formData.append('utm_adcreative', utmParams.utm_adcreative);

      const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const sessionId = uploadRes.data.session_id;

      // Step 2: Create Razorpay order (fixed ₹2999)
      const orderRes = await axios.post(`${API_URL}/api/create-order`, {
        tier: 2999,
        session_id: sessionId,
        ...utmParams // Include UTM params in order creation
      });

      const { order_id, amount, currency } = orderRes.data;

      // Step 3: Load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Payment system failed to load. Please refresh and try again.");
      }

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: "CareerIQ",
        description: "Complete Career Intelligence Report",
        order_id: order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API_URL}/api/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              session_id: sessionId,
              ...utmParams // Include UTM params in payment verification
            });

            await axios.post(`${API_URL}/api/analyze`, {
              session_id: sessionId
            });

            navigate(`/Intelligence_report_generation/${sessionId}`);
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },
        prefill: {
          contact: formatE164(countryCode, phoneNumber).replace('+', '')
        },
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      razorpay.open();

    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Something went wrong");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CareerIQ</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {/* Progress Indicator */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-3">
            <span className="text-primary text-xs font-medium">Step 1 of 2</span>
          </div>
          <p className="text-white font-semibold text-lg">Career Intelligence Setup</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* LEFT COLUMN - Form */}
          <div className="order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 md:p-7"
            >
              {/* Headline */}
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Get Your Career Intelligence Report
                </h1>
                <p className="text-zinc-400 text-sm">
                  See how recruiters interpret your profile — risks, gaps, and what needs to change.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                
                {/* 1. Mobile Number with Country Selector */}
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">
                    Mobile Number
                  </Label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="h-12 px-3 bg-white/5 border border-white/20 rounded-xl flex items-center gap-2 hover:bg-white/10 hover:border-white/30 transition-colors min-w-[90px]"
                      >
                        <span>{COUNTRY_CODES.find(c => c.code === countryCode)?.flag}</span>
                        <span className="text-sm text-white">{countryCode}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                      </button>
                      
                      <AnimatePresence>
                        {showCountryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <button
                                key={c.code}
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 transition-colors text-sm text-white"
                              >
                                <span>{c.flag}</span>
                                <span>{c.code}</span>
                                <span className="text-zinc-500">{c.country}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Phone Input */}
                    <Input
                      type="tel"
                      data-testid="phone-input"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-white/5 border-white/20 h-12 rounded-xl flex-1 focus:border-primary text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <p className="text-zinc-500 text-xs mt-1.5">
                    For report delivery and updates only
                  </p>
                </div>

                {/* 2. Target Role */}
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">
                    Target Role You&apos;re Aiming For
                  </Label>
                  <Input
                    data-testid="target-role-input"
                    placeholder="e.g. Marketing Head or Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-white/5 border-white/20 h-12 rounded-xl focus:border-primary text-white placeholder:text-zinc-500"
                  />
                  <p className="text-zinc-500 text-xs mt-1.5">
                    All analysis is framed specifically for this role.
                  </p>
                </div>

                {/* 3. Resume Upload */}
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">
                    Resume <span className="text-red-400">*</span>
                  </Label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      resumeFile 
                        ? 'border-emerald-500/50 bg-emerald-500/10' 
                        : 'border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/[0.07]'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => handleFileDrop(e, 'resume')}
                    onClick={() => document.getElementById('resume-input').click()}
                  >
                    <input
                      id="resume-input"
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="hidden"
                      onChange={(e) => handleFileDrop(e, 'resume')}
                      data-testid="resume-upload-input"
                    />
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-white text-sm font-medium">{resumeFile.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                          className="p-1 hover:bg-white/10 rounded-full"
                        >
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <FileText className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                        <p className="text-zinc-300 text-sm">Drop resume or click to upload</p>
                        <p className="text-zinc-500 text-xs mt-1">PDF or DOCX, max 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. LinkedIn Upload (Optional) */}
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">
                    LinkedIn PDF <span className="text-zinc-500">(Optional)</span>
                  </Label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      linkedinFile 
                        ? 'border-emerald-500/50 bg-emerald-500/10' 
                        : 'border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/[0.07]'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => handleFileDrop(e, 'linkedin')}
                    onClick={() => document.getElementById('linkedin-input').click()}
                  >
                    <input
                      id="linkedin-input"
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="hidden"
                      onChange={(e) => handleFileDrop(e, 'linkedin')}
                      data-testid="linkedin-upload-input"
                    />
                    {linkedinFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-white text-sm font-medium">{linkedinFile.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setLinkedinFile(null); }}
                          className="p-1 hover:bg-white/10 rounded-full"
                        >
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Linkedin className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                        <p className="text-zinc-300 text-sm">Drop LinkedIn PDF or click to upload</p>
                      </div>
                    )}
                  </div>
                  
                  {/* LinkedIn confidence warning */}
                  {!linkedinFile && (
                    <div className="flex items-start gap-2 mt-2 text-xs text-amber-400/80">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Without LinkedIn, analysis confidence may be reduced in some areas</span>
                    </div>
                  )}

                  {/* LinkedIn Guide Toggle */}
                  <button
                    onClick={() => setShowLinkedinGuide(!showLinkedinGuide)}
                    className="mt-2 flex items-center gap-1 text-primary text-xs hover:underline"
                  >
                    How to download LinkedIn PDF
                    {showLinkedinGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <AnimatePresence>
                    {showLinkedinGuide && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Monitor className="w-3 h-3 text-primary" />
                              <h4 className="font-medium text-xs text-white">Desktop</h4>
                            </div>
                            <ol className="space-y-0.5 text-xs text-zinc-400 pl-5 list-decimal">
                              <li>Go to your LinkedIn profile</li>
                              <li>Click &quot;More&quot; below your photo</li>
                              <li>Select &quot;Save to PDF&quot;</li>
                            </ol>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Smartphone className="w-3 h-3 text-primary" />
                              <h4 className="font-medium text-xs text-white">Mobile</h4>
                            </div>
                            <ol className="space-y-0.5 text-xs text-zinc-400 pl-5 list-decimal">
                              <li>Open LinkedIn app → Your profile</li>
                              <li>Tap (...) menu</li>
                              <li>Select &quot;Save as PDF&quot;</li>
                            </ol>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Consent Checkbox - Move above CTA */}
                <div className={`flex items-start gap-3 p-3 rounded-xl ${consentError ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.03] border border-white/10'}`}>
                  <Checkbox
                    id="consent"
                    data-testid="consent-checkbox"
                    checked={consentChecked}
                    onCheckedChange={(checked) => {
                      setConsentChecked(checked);
                      if (checked) setConsentError(false);
                    }}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="text-zinc-400 text-xs leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                    , and consent to receive my CareerIQ report and related updates via WhatsApp or email.
                  </Label>
                </div>
                {consentError && (
                  <p className="text-red-400 text-xs -mt-3">
                    Consent is required to generate and deliver your report.
                  </p>
                )}

                {/* CTA Button - PROMINENT WHITE */}
                <button
                  data-testid="submit-btn"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] min-h-[56px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get My Career Intelligence Report
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Security Microcopy */}
                <div className="flex items-center justify-center gap-4 text-zinc-500 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    <span>Secure checkout</span>
                  </div>
                  <span className="text-zinc-600">•</span>
                  <span>One-time payment of ₹2,999</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Value & Trust */}
          <div className="order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:sticky lg:top-24 space-y-5"
            >
              {/* Pricing Box - Make it prominent */}
              <div className="bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/30 rounded-2xl p-5 md:p-6 text-center">
                <p className="text-zinc-300 text-sm font-medium mb-1">Complete Career Intelligence Report</p>
                <p className="text-zinc-500 text-xs mb-3">One-time, end-to-end analysis</p>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">₹2,999</p>
                <p className="text-zinc-500 text-xs">No subscription • No recurring charges</p>
              </div>

              {/* What You'll Get */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6">
                <h2 className="font-bold text-lg text-white mb-4">What You&apos;ll Get</h2>
                <ul className="space-y-3">
                  {[
                    "Market interpretation of your resume and public profile",
                    "Role-level fit and mismatch signals for your target role",
                    "Risk indicators that affect shortlisting or down-leveling",
                    "Execution guardrails for your target level",
                    "Decision intelligence that clarifies trade-offs",
                    "Analysis personalized to your selected role"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Secure & Confidential */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-white">Secure & Confidential</h3>
                </div>
                <p className="text-zinc-400 text-sm">
                  Your resume and profile are encrypted and processed securely. We never share your data.
                </p>
              </div>

              {/* Why Professionals Trust CareerIQ - Collapsible on mobile */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 hidden md:block">
                <h3 className="font-bold text-white mb-3">Why Professionals Trust CareerIQ</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Designed for professionals who want clarity before action — not generic advice.
                </p>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Built on Market Interpretation",
                      desc: "Analyzes how profiles are actually interpreted in hiring decisions."
                    },
                    {
                      title: "Role-Specific Analysis",
                      desc: "Every report is framed around your target role expectations."
                    },
                    {
                      title: "Decision Intelligence",
                      desc: "Surfaces risks and trade-offs so you can decide with clarity."
                    },
                    {
                      title: "For Mid–Senior Professionals",
                      desc: "Most users have 5–12+ years navigating career transitions."
                    }
                  ].map((item, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-medium text-zinc-200 mb-0.5">{item.title}</h4>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-zinc-600 text-xs mt-4 pt-4 border-t border-white/10">
                  No subscriptions. No handholding. Just clear career intelligence.
                </p>
              </div>

              {/* Footer Disclaimer */}
              <p className="text-zinc-600 text-xs text-center px-4">
                This analysis reflects observed market interpretation patterns. It does not guarantee interviews or outcomes.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
