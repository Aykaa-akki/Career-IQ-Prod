import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Brain } from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Fixed 5 Intelligence Steps (exact wording - DO NOT CHANGE)
const INTELLIGENCE_STEPS = [
  { id: 1, label: "Validating document integrity", estimatedDuration: 8000 },
  { id: 2, label: "Extracting multi-signal patterns", estimatedDuration: 15000 },
  { id: 3, label: "Mapping market interpretation signals", estimatedDuration: 20000 },
  { id: 4, label: "Identifying role-level risks & constraints", estimatedDuration: 18000 },
  { id: 5, label: "Assembling decision intelligence", estimatedDuration: 12000 }
];

// Rotating Status Text (contextual to current step)
const STATUS_TEXTS = [
  "Evaluating market interpretation signals",
  "Synthesizing role-level perception patterns",
  "Identifying risk and down-leveling indicators",
  "Applying execution guardrails",
  "Finalizing decision intelligence"
];

// Circular Progress Component (Per-Step) - Smaller for compact view
function CircularProgress({ percent, size = 22, strokeWidth = 2.5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
      />
    </svg>
  );
}

export default function ProcessingPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Backend-driven state (authoritative)
  const [backendStep, setBackendStep] = useState(0);
  const [assemblyState, setAssemblyState] = useState("not_started");
  const [backendStatus, setBackendStatus] = useState("processing");
  const [error, setError] = useState(null);

  // Horizontal progress bar (backend-driven: 20% per completed step, max 80% until finalize)
  const [horizontalProgress, setHorizontalProgress] = useState(0);

  // Per-step circular progress (time-based, perceptual)
  const [circularProgress, setCircularProgress] = useState(0);
  const [activeStepStartTime, setActiveStepStartTime] = useState(null);

  // Finalization state
  const [isFinalizingStep5, setIsFinalizingStep5] = useState(false);
  const [step5Completed, setStep5Completed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // UI state
  const [statusText, setStatusText] = useState(STATUS_TEXTS[0]);

  // Refs
  const statusIndexRef = useRef(0);
  const finalizationTriggeredRef = useRef(false);
  const lastBackendStepRef = useRef(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate horizontal progress based on backend step (authoritative)
  const calculateHorizontalProgress = useCallback((currentStep, isStep5Finalized) => {
    if (isStep5Finalized) {
      return 100;
    }
    // Steps 1-4: each completed step = 20%
    // Step 5 processing: hold at 80%
    if (currentStep >= 5) {
      return 80; // Hold at 80% during step 5
    }
    // Steps completed = currentStep - 1 (since currentStep is "in progress")
    const completedSteps = Math.max(0, currentStep - 1);
    return completedSteps * 20;
  }, []);

  // Poll backend for progress every 2 seconds
  useEffect(() => {
    let mounted = true;
    let pollCount = 0;
    const MAX_POLLS = 180; // 6 minutes max

    // Finalization sequence: 3s pause → complete step 5 → animate to 100% → redirect
    const runFinalizationSequence = () => {
      setIsFinalizingStep5(true);
      
      // Complete circular progress for step 5 immediately
      setCircularProgress(100);

      // 3-second hold
      setTimeout(() => {
        // Mark step 5 as completed (show tick)
        setStep5Completed(true);
        
        // Animate horizontal bar from 80% to 100%
        let currentProgress = 80;
        const animationInterval = setInterval(() => {
          currentProgress += 2;
          if (currentProgress >= 100) {
            setHorizontalProgress(100);
            clearInterval(animationInterval);
            
            // Set redirecting state and navigate
            setIsRedirecting(true);
            setTimeout(() => {
              navigate(`/report/${sessionId}`);
            }, 500);
          } else {
            setHorizontalProgress(currentProgress);
          }
        }, 30);
      }, 3000);
    };

    const pollProgress = async () => {
      if (!mounted || pollCount >= MAX_POLLS) return;

      try {
        const res = await axios.get(`${API_URL}/api/report/${sessionId}/progress`);
        if (!mounted) return;

        const { status, current_step, assembly_state, error: apiError } = res.data;

        // Update backend state
        setBackendStatus(status);
        setAssemblyState(assembly_state || "not_started");

        if (status === "failed") {
          setError(apiError || "Analysis failed");
          return;
        }

        // Track step changes for circular progress reset
        if (current_step !== lastBackendStepRef.current) {
          lastBackendStepRef.current = current_step;
          setBackendStep(current_step);
          setCircularProgress(0);
          setActiveStepStartTime(Date.now());
        }

        // Update horizontal progress (backend-driven)
        if (!isFinalizingStep5 && !step5Completed) {
          const newHorizontalProgress = calculateHorizontalProgress(current_step, false);
          setHorizontalProgress(newHorizontalProgress);
        }

        // Check for finalization trigger
        if (
          status === "completed" &&
          assembly_state === "ready_for_ui_finalize" &&
          !finalizationTriggeredRef.current
        ) {
          finalizationTriggeredRef.current = true;
          runFinalizationSequence();
          return;
        }

        pollCount++;
      } catch (err) {
        console.error("Poll error:", err);
        pollCount++;
      }
    };

    pollProgress();
    const interval = setInterval(pollProgress, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sessionId, calculateHorizontalProgress, isFinalizingStep5, step5Completed, navigate]);

  // Time-based circular progress animation for active step
  useEffect(() => {
    if (backendStep === 0 || isFinalizingStep5) return;

    const stepConfig = INTELLIGENCE_STEPS.find(s => s.id === backendStep);
    if (!stepConfig) return;

    const duration = stepConfig.estimatedDuration;
    const startTime = activeStepStartTime || Date.now();
    
    const animateCircular = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until backend confirms
      setCircularProgress(progress);
    };

    animateCircular();
    const interval = setInterval(animateCircular, 100);

    return () => clearInterval(interval);
  }, [backendStep, activeStepStartTime, isFinalizingStep5]);

  // Rotating status text
  useEffect(() => {
    if (backendStatus !== "processing" || isRedirecting) return;

    const interval = setInterval(() => {
      statusIndexRef.current = (statusIndexRef.current + 1) % STATUS_TEXTS.length;
      setStatusText(STATUS_TEXTS[statusIndexRef.current]);
    }, 5000);

    return () => clearInterval(interval);
  }, [backendStatus, isRedirecting]);

  // Derive step state based on backend step
  const getStepState = (stepId) => {
    if (step5Completed && stepId === 5) return "completed";
    if (stepId < backendStep) return "completed";
    if (stepId === backendStep) return "processing";
    return "idle";
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          data-testid="processing-container"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">CareerIQ</span>
          </div>

          {/* Headline - Compact */}
          <h1 className="text-lg sm:text-xl font-bold mb-1 leading-tight">
            Generating Your Career Intelligence Report
          </h1>

          {/* Subheadline - Compact */}
          <p className="text-zinc-500 text-xs mb-5">
            This usually takes 2–3 minutes. Please don&apos;t refresh.
          </p>

          {/* Horizontal Progress Bar - Vibrant Green Style */}
          <div className="mb-5" data-testid="horizontal-progress-container">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-zinc-700/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${horizontalProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  data-testid="horizontal-progress-bar"
                  style={{
                    background: "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
                    boxShadow: horizontalProgress > 0 ? "0 0 16px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.8)" : "none"
                  }}
                />
              </div>
              <span className="text-zinc-400 text-sm font-medium min-w-[40px] text-right">
                {Math.round(horizontalProgress)}%
              </span>
            </div>
          </div>

          {/* Rotating Status Text - Hidden to save space, info is in steps */}
          {isRedirecting && (
            <div className="mb-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-sm font-medium"
              >
                Analysis complete. Redirecting...
              </motion.p>
            </div>
          )}

          {/* Intelligence Steps - Compact */}
          <div className="space-y-2 text-left" data-testid="steps-container">
            {INTELLIGENCE_STEPS.map((step) => {
              const state = getStepState(step.id);
              const isActiveStep = state === "processing";
              const showCircularProgress = isActiveStep && !step5Completed;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.id * 0.05 }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                    state === "completed"
                      ? "bg-[#1a2e1a]"
                      : state === "processing"
                        ? "bg-zinc-800/80"
                        : "bg-zinc-900/50"
                  }`}
                  data-testid={`step-${step.id}`}
                  data-state={state}
                >
                  {/* Step Indicator: Circular Progress OR Tick OR Idle Dot */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {state === "completed" ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </motion.div>
                    ) : showCircularProgress ? (
                      <CircularProgress percent={circularProgress} size={20} strokeWidth={2} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[13px] leading-tight transition-colors duration-300 flex-1 ${
                      state === "completed"
                        ? "text-green-400"
                        : state === "processing"
                          ? "text-white"
                          : "text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Circular Progress Percentage (only for active step) */}
                  {showCircularProgress && (
                    <span className="text-[11px] text-zinc-400 tabular-nums">
                      {Math.round(circularProgress)}%
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Error State */}
          {backendStatus === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
              data-testid="error-container"
            >
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <h2 className="font-bold text-red-400 text-sm mb-1">Analysis Failed</h2>
              <p className="text-zinc-500 text-xs mb-3 break-words">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
                data-testid="try-again-btn"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
