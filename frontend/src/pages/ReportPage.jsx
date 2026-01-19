import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  AlertTriangle,
  Shield,
  GitBranch,
  Mail,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase,
  TrendingUp
} from "lucide-react";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TIER_LABELS = {
  499: "Diagnosis",
  2999: "Diagnosis + Risk",
  4498: "Complete Intelligence"
};

// Helper function to safely render content that might be string or object
const renderContent = (content) => {
  if (!content) return "N/A";
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    return Object.entries(content).map(([key, value]) => (
      <div key={key} className="mb-3">
        <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">
          {key.replace(/_/g, ' ')}
        </span>
        <span className="text-zinc-300">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
      </div>
    ));
  }
  return String(content);
};

// Helper to format key names
const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function ReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState(499);
  const [targetRole, setTargetRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [linkedinProvided, setLinkedinProvided] = useState(true);
  const [closingSection, setClosingSection] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    diagnosis: true,
    risk: true,
    execution: true,
    decisions: true
  });
  const [upgrading, setUpgrading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/report/${sessionId}`);
        
        if (res.data.status === "processing") {
          navigate(`/Intelligence_report_generation/${sessionId}`);
          return;
        }
        
        if (res.data.status === "completed") {
          setReport(res.data.report);
          setTier(res.data.tier);
          setTargetRole(res.data.target_role);
          // v3.1 - Additional fields
          setFullName(res.data.full_name || "");
          setCurrentRole(res.data.current_role || "");
          setLinkedinProvided(res.data.linkedin_provided ?? true);
          setClosingSection(res.data.closing_section || null);
        } else {
          toast.error("Report not found");
          navigate('/');
        }
      } catch (err) {
        toast.error("Failed to load report");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const fetchKey = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/razorpay-key`);
        setRazorpayKey(res.data.key_id);
      } catch (err) {
        console.error("Failed to fetch Razorpay key");
      }
    };

    fetchReport();
    fetchKey();
  }, [sessionId, navigate]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (newTier) => {
    setUpgrading(true);
    
    try {
      const upgradeRes = await axios.post(`${API_URL}/api/upgrade`, {
        session_id: sessionId,
        new_tier: newTier
      });
      
      await loadRazorpayScript();
      
      const options = {
        key: razorpayKey,
        amount: upgradeRes.data.amount,
        currency: "INR",
        name: "CareerIQ",
        description: `Upgrade to ${TIER_LABELS[newTier]}`,
        order_id: upgradeRes.data.order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API_URL}/api/verify-upgrade`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              session_id: sessionId
            });
            toast.success("Upgrade successful!");
            navigate(`/processing/${sessionId}`);
          } catch (err) {
            toast.error("Upgrade failed");
          }
        },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setUpgrading(false) }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        toast.error("Payment failed");
        setUpgrading(false);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upgrade failed");
      setUpgrading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }
    
    setSendingEmail(true);
    
    try {
      await axios.post(`${API_URL}/api/send-report`, {
        session_id: sessionId,
        email: emailInput
      });
      setEmailSent(true);
      toast.success(`Report sent to ${emailInput}`);
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const diagnosis = report?.diagnosis || {};
  const risk = report?.risk || {};
  const execution = report?.execution || {};
  const decisions = report?.decisions || {};
  const metadata = report?.metadata || {};
  const disclaimer = report?.disclaimer || "";

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">CareerIQ</span>
          </button>
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            {TIER_LABELS[tier]}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header with Identity Block (v3.0) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Your Career Intelligence Report</h1>
          
          {/* v3.0 Identity Block */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-zinc-400">
            {fullName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>{fullName}</span>
              </div>
            )}
            {currentRole && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-500" />
                <span>{currentRole}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span>{targetRole}</span>
            </div>
          </div>
          
          {/* Confidence indicator */}
          {!linkedinProvided && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
              <AlertCircle className="w-3 h-3" />
              Reduced confidence (LinkedIn not provided)
            </div>
          )}
        </motion.div>

        {/* Disclaimer (v3.0) */}
        {disclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl"
          >
            <p className="text-zinc-500 text-xs leading-relaxed">{disclaimer}</p>
          </motion.div>
        )}

        {/* Diagnosis Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <button
            onClick={() => toggleSection('diagnosis')}
            className="w-full flex items-center justify-between p-4 md:p-5 card rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-bold">Career Diagnosis</h2>
                <p className="text-zinc-500 text-xs">Multi-signal market perception analysis</p>
              </div>
            </div>
            {expandedSections.diagnosis ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>
          
          {expandedSections.diagnosis && (
            <div className="card border-t-0 rounded-t-none rounded-b-2xl p-4 md:p-6 space-y-6">
              {/* Context Intro (v3.0) */}
              {diagnosis.context_intro && (
                <div className="text-sm text-zinc-400 italic border-l-2 border-primary/50 pl-4">
                  {diagnosis.context_intro}
                </div>
              )}

              {/* Career Verdict */}
              <div className="report-section">
                <h3 className="text-sm font-bold text-primary mb-2">Career Verdict</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {typeof diagnosis.career_verdict === 'string' ? diagnosis.career_verdict : "N/A"}
                </p>
              </div>

              {/* Interpretation Anchors (v3.0) */}
              {diagnosis.interpretation_anchors && (
                <div className="report-section">
                  <h3 className="text-sm font-bold text-cyan-400 mb-3">Interpretation Anchors</h3>
                  <div className="space-y-3 bg-cyan-500/5 rounded-xl p-4">
                    {diagnosis.interpretation_anchors.primary_anchor && (
                      <div>
                        <span className="text-xs text-zinc-500 block mb-1">Primary Anchor</span>
                        <p className="text-zinc-300 text-sm">{diagnosis.interpretation_anchors.primary_anchor}</p>
                      </div>
                    )}
                    {diagnosis.interpretation_anchors.scanning_behavior && (
                      <div>
                        <span className="text-xs text-zinc-500 block mb-1">Recruiter Scanning</span>
                        <p className="text-zinc-300 text-sm">{diagnosis.interpretation_anchors.scanning_behavior}</p>
                      </div>
                    )}
                    {diagnosis.interpretation_anchors.signal_conflict_summary && (
                      <div>
                        <span className="text-xs text-zinc-500 block mb-1">Signal Conflicts</span>
                        <p className="text-zinc-300 text-sm">{diagnosis.interpretation_anchors.signal_conflict_summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Market Reading */}
              <div className="report-section">
                <h3 className="text-sm font-bold text-zinc-400 mb-3">How the Market Is Reading This Profile</h3>
                {diagnosis.market_reading && typeof diagnosis.market_reading === 'object' ? (
                  <div className="space-y-4 bg-white/5 rounded-xl p-4">
                    {Object.entries(diagnosis.market_reading).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                          {formatKey(key)}
                        </span>
                        <p className="text-zinc-300 text-sm">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm">{diagnosis.market_reading || "N/A"}</p>
                )}
              </div>

              {/* Authority Breakpoints */}
              {diagnosis.authority_breakpoints && Array.isArray(diagnosis.authority_breakpoints) && (
                <div className="report-section">
                  <h3 className="text-sm font-bold text-orange-400 mb-3">Where Authority Breaks</h3>
                  <div className="space-y-3">
                    {diagnosis.authority_breakpoints.map((bp, i) => (
                      <div key={i} className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                        <div className="text-sm font-medium text-orange-300 mb-1">{bp.breakpoint}</div>
                        <div className="text-xs text-zinc-500 mb-1">Signal Class: {bp.signal_class}</div>
                        <p className="text-zinc-400 text-xs">{bp.market_consequence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mismatch Causes */}
              {diagnosis.mismatch_causes && typeof diagnosis.mismatch_causes === 'object' && (
                <div className="report-section">
                  <h3 className="text-sm font-bold text-zinc-400 mb-3">Why This Mismatch Is Happening</h3>
                  <div className="space-y-3 bg-white/5 rounded-xl p-4">
                    {Object.entries(diagnosis.mismatch_causes).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                          {formatKey(key)}
                        </span>
                        <p className="text-zinc-400 text-sm">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Risks */}
              {diagnosis.career_risks && Array.isArray(diagnosis.career_risks) && (
                <div className="report-section">
                  <h3 className="text-sm font-bold text-red-400 mb-3">Career Risks</h3>
                  <div className="space-y-3">
                    {diagnosis.career_risks.map((risk, i) => (
                      <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm font-medium text-red-300">{risk.risk_type}</span>
                        </div>
                        <p className="text-zinc-400 text-xs">{risk.risk_description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h3 className="text-sm font-bold mb-2">Diagnostic Summary</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {typeof diagnosis.diagnostic_summary === 'string' ? diagnosis.diagnostic_summary : "N/A"}
                </p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Risk Section or Upsell */}
        {tier >= 2999 ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <button
              onClick={() => toggleSection('risk')}
              className="w-full flex items-center justify-between p-4 md:p-5 card rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <h2 className="font-bold">Risk Assessment</h2>
                  <p className="text-zinc-500 text-xs">Independent risks from 5 signal classes</p>
                </div>
              </div>
              {expandedSections.risk ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
            </button>
            
            {expandedSections.risk && (
              <div className="card border-t-0 rounded-t-none rounded-b-2xl p-4 md:p-6 space-y-4">
                {/* Independent Risks */}
                {risk.independent_risks && Array.isArray(risk.independent_risks) && (
                  <div>
                    <h3 className="text-sm font-bold text-orange-400 mb-3">Independent Risks</h3>
                    <div className="space-y-3">
                      {risk.independent_risks.map((r, i) => (
                        <div key={i} className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-orange-300 text-sm">{r.risk_name}</span>
                            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                              {r.risk_category}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs mb-2">{r.evidence_from_profile}</p>
                          <p className="text-zinc-500 text-xs"><span className="text-orange-400">Consequence:</span> {r.consequence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signal Conflicts */}
                {risk.signal_conflicts && Array.isArray(risk.signal_conflicts) && risk.signal_conflicts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-zinc-400 mb-3">Signal Conflicts</h3>
                    <div className="space-y-3">
                      {risk.signal_conflicts.map((c, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="text-xs">
                              <span className="text-zinc-500">Signal A:</span>
                              <p className="text-zinc-300">{c.signal_a}</p>
                            </div>
                            <div className="text-xs">
                              <span className="text-zinc-500">Signal B:</span>
                              <p className="text-zinc-300">{c.signal_b}</p>
                            </div>
                          </div>
                          <p className="text-zinc-500 text-xs">{c.market_interpretation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Compounding Analysis */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-2">Risk Compounding Analysis</h3>
                  <p className="text-zinc-300 text-sm">{risk.risk_compounding_analysis || "N/A"}</p>
                </div>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20 rounded-2xl p-5"
          >
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold mb-1">Unlock Risk Assessment</h3>
                <p className="text-zinc-500 text-sm mb-3">
                  See 4+ independent risks from different signal classes and signal conflicts.
                </p>
                <button
                  data-testid="upgrade-2999-btn"
                  onClick={() => handleUpgrade(2999)}
                  disabled={upgrading}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upgrade — ₹2,500 more <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Execution & Decisions/Commitments or Upsell */}
        {tier >= 4498 ? (
          <>
            {/* Execution Guardrails */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <button
                onClick={() => toggleSection('execution')}
                className="w-full flex items-center justify-between p-4 md:p-5 card rounded-t-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold">Execution Guardrails</h2>
                    <p className="text-zinc-500 text-xs">Protection boundaries</p>
                  </div>
                </div>
                {expandedSections.execution ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
              </button>
              
              {expandedSections.execution && (
                <div className="card border-t-0 rounded-t-none rounded-b-2xl p-4 md:p-6 space-y-4">
                  {/* Identity Guardrails */}
                  {execution.identity_guardrails && Array.isArray(execution.identity_guardrails) && (
                    <div>
                      <h3 className="text-sm font-bold text-cyan-400 mb-3">Identity Guardrails</h3>
                      <div className="space-y-2">
                        {execution.identity_guardrails.map((g, i) => (
                          <div key={i} className="flex items-start gap-3 bg-cyan-500/5 rounded-lg p-3">
                            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">{g.protect}</div>
                              <p className="text-zinc-500 text-xs">{g.consequence_of_violation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Traps to Avoid */}
                  {execution.traps_to_avoid && Array.isArray(execution.traps_to_avoid) && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400 mb-3">Traps to Avoid</h3>
                      <div className="space-y-2">
                        {execution.traps_to_avoid.map((t, i) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                            <div className="font-medium text-red-300 text-sm mb-1">{t.trap_description}</div>
                            <p className="text-zinc-500 text-xs">{t.why_this_profile_is_vulnerable}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                    <h3 className="font-bold text-sm mb-2">Summary</h3>
                    <p className="text-zinc-300 text-sm">{execution.guardrails_summary || "N/A"}</p>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Commitments (v3.0) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <button
                onClick={() => toggleSection('decisions')}
                className="w-full flex items-center justify-between p-4 md:p-5 card rounded-t-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold">Commitments</h2>
                    <p className="text-zinc-500 text-xs">A vs B with Market Defaults</p>
                  </div>
                </div>
                {expandedSections.decisions ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
              </button>
              
              {expandedSections.decisions && (
                <div className="card border-t-0 rounded-t-none rounded-b-2xl p-4 md:p-6 space-y-4">
                  {/* Context Intro (v3.0) */}
                  {decisions.context_intro && (
                    <div className="text-sm text-zinc-400 italic border-l-2 border-purple-500/50 pl-4">
                      {decisions.context_intro}
                    </div>
                  )}

                  {/* Commitments (v3.0 format) */}
                  {(decisions.commitments || decisions.forced_decisions) && 
                   Array.isArray(decisions.commitments || decisions.forced_decisions) && 
                   (decisions.commitments || decisions.forced_decisions).map((d, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-bold text-purple-400 text-sm mb-1">
                        {d.commitment_title || d.decision_title}
                      </h3>
                      <p className="text-zinc-500 text-xs mb-3">{d.signal_conflict_source}</p>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {/* Option A */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <div className="text-xs font-bold text-purple-300 mb-1">Option A</div>
                          <div className="text-sm font-medium mb-2">{d.option_a?.choice}</div>
                          <p className="text-zinc-500 text-xs mb-1">
                            <span className="text-purple-300">Trade-off:</span> {d.option_a?.trade_off}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            <span className="text-purple-300">Long-term:</span> {d.option_a?.long_term_consequence}
                          </p>
                        </div>

                        {/* Option B */}
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                          <div className="text-xs font-bold text-cyan-300 mb-1">Option B</div>
                          <div className="text-sm font-medium mb-2">{d.option_b?.choice}</div>
                          <p className="text-zinc-500 text-xs mb-1">
                            <span className="text-cyan-300">Trade-off:</span> {d.option_b?.trade_off}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            <span className="text-cyan-300">Long-term:</span> {d.option_b?.long_term_consequence}
                          </p>
                        </div>
                      </div>

                      {/* Market Default (v3.0) */}
                      {d.market_default && (
                        <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                          <div className="text-xs font-bold text-red-400 mb-1">Market Default (if no choice)</div>
                          <p className="text-zinc-400 text-xs">{d.market_default.description}</p>
                          {d.market_default.why_its_worse && (
                            <p className="text-zinc-500 text-xs mt-1">
                              <span className="text-red-400">Why it&apos;s worse:</span> {d.market_default.why_its_worse}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Cost of not deciding (backward compatibility) */}
                      {d.cost_of_not_deciding && !d.market_default && (
                        <p className="text-red-400 text-xs mt-3 italic">
                          Cost of not deciding: {d.cost_of_not_deciding}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* State Shift Summary (v3.1 - ₹4498 only) */}
                  {decisions.state_shift_summary && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-4">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        State Shift Summary
                      </h3>
                      <div className="space-y-3 text-sm">
                        {decisions.state_shift_summary.current_state && (
                          <div>
                            <span className="text-zinc-500 text-xs block mb-1">Current State</span>
                            <p className="text-zinc-300">{decisions.state_shift_summary.current_state}</p>
                          </div>
                        )}
                        {decisions.state_shift_summary.state_if_option_a_path && (
                          <div>
                            <span className="text-purple-300 text-xs block mb-1">If Option A Path</span>
                            <p className="text-zinc-400">{decisions.state_shift_summary.state_if_option_a_path}</p>
                          </div>
                        )}
                        {decisions.state_shift_summary.state_if_option_b_path && (
                          <div>
                            <span className="text-cyan-300 text-xs block mb-1">If Option B Path</span>
                            <p className="text-zinc-400">{decisions.state_shift_summary.state_if_option_b_path}</p>
                          </div>
                        )}
                        {decisions.state_shift_summary.state_if_no_commitment && (
                          <div>
                            <span className="text-red-400 text-xs block mb-1">If No Commitment</span>
                            <p className="text-zinc-500">{decisions.state_shift_summary.state_if_no_commitment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Decision Interactions */}
                  {decisions.commitment_interactions || decisions.decision_interactions ? (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-bold text-sm mb-3">Commitment Interactions</h3>
                      <div className="space-y-2 text-sm">
                        {(decisions.commitment_interactions || decisions.decision_interactions).if_all_option_a && (
                          <p className="text-zinc-400">
                            <span className="text-purple-300 font-medium">All Option A:</span> {(decisions.commitment_interactions || decisions.decision_interactions).if_all_option_a}
                          </p>
                        )}
                        {(decisions.commitment_interactions || decisions.decision_interactions).if_all_option_b && (
                          <p className="text-zinc-400">
                            <span className="text-cyan-300 font-medium">All Option B:</span> {(decisions.commitment_interactions || decisions.decision_interactions).if_all_option_b}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Final Summary */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h3 className="font-bold text-sm mb-2">Final Intelligence Summary</h3>
                    <p className="text-zinc-300 text-sm">{decisions.final_intelligence_summary || "N/A"}</p>
                  </div>
                </div>
              )}
            </motion.section>
          </>
        ) : tier >= 2999 ? (
          /* ============== UPSELL SECTION - ₹1,499 (Simple Design) ============== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-5"
          >
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Unlock Complete Intelligence</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Get execution guardrails, commitments with market defaults, and state shift summary.
                </p>
                <button
                  data-testid="upgrade-4498-btn"
                  onClick={() => handleUpgrade(4498)}
                  disabled={upgrading}
                  className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                >
                  {upgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Upgrade — ₹1,499 more
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ============== CLOSING SECTION - "What This Really Means for You" ============== */}
        {closingSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">{closingSection.title}</h3>
            
            <div className="space-y-4">
              {closingSection.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-zinc-400 text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <p className="text-zinc-300 text-sm mt-5 pt-4 border-t border-white/5">
              {closingSection.closing_line}
            </p>
          </motion.div>
        )}

        {/* Email Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-sm">Get PDF via Email</h3>
              <p className="text-zinc-500 text-xs">We&apos;ll send a formatted PDF report</p>
            </div>
          </div>

          {emailSent ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Report sent successfully!
            </div>
          ) : (
            <div className="flex gap-3">
              <Input
                type="email"
                data-testid="report-email-input"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-white/5 border-white/10 h-10 rounded-xl flex-1 text-sm"
              />
              <button
                data-testid="send-report-btn"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="btn-primary px-4 py-2 text-sm"
              >
                {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
              </button>
            </div>
          )}
        </motion.div>

        <p className="text-center text-zinc-700 text-xs mt-8">
          This is a diagnosis, not advice. The decisions are yours.
        </p>
      </main>
    </div>
  );
}
