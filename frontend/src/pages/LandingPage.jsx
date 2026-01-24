import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Brain, Target, TrendingUp, BookOpen, ShieldAlert, MessageSquare, Sparkles } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

// ============== SVG ILLUSTRATIONS ==============

// Career Signal Flow - Desktop (Left to Right) - Premium Version
const CareerSignalFlowDesktop = () => (
  <svg viewBox="0 0 700 120" className="w-full max-w-3xl mx-auto" aria-hidden="true">
    {/* Node 1: YOU */}
    <g>
      <circle cx="45" cy="55" r="28" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2"/>
      <circle cx="45" cy="46" r="9" fill="rgba(255,255,255,0.8)"/>
      <path d="M28 72 Q45 58 62 72" fill="rgba(255,255,255,0.6)" stroke="none"/>
      <text x="45" y="100" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="12" fontWeight="600">You</text>
    </g>
    
    {/* Arrow 1 */}
    <line x1="78" y1="55" x2="105" y2="55" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    <polygon points="111,55 103,50 103,60" fill="rgba(255,255,255,0.5)"/>
    
    {/* Node 2: Resume + LinkedIn */}
    <g>
      <rect x="118" y="18" width="115" height="74" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <text x="175" y="46" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">Strong Resume</text>
      <line x1="138" y1="56" x2="213" y2="56" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <text x="175" y="76" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">LinkedIn Profile</text>
    </g>
    
    {/* Arrow 2 */}
    <line x1="238" y1="55" x2="265" y2="55" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    <polygon points="271,55 263,50 263,60" fill="rgba(255,255,255,0.5)"/>
    
    {/* Node 3: Apply to Job */}
    <g>
      <rect x="278" y="22" width="100" height="66" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <text x="328" y="60" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">Apply to Job</text>
    </g>
    
    {/* Arrow 3 - highlighted */}
    <line x1="383" y1="55" x2="410" y2="55" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2"/>
    <polygon points="416,55 408,50 408,60" fill="rgba(239, 68, 68, 0.7)"/>
    
    {/* Node 4: Hidden Screening Layer - THE PROBLEM */}
    <g>
      {/* Glow effect */}
      <rect x="423" y="4" width="150" height="102" rx="12" fill="rgba(239, 68, 68, 0.08)" stroke="none"/>
      
      {/* Top warning bar */}
      <rect x="425" y="6" width="146" height="22" rx="6" fill="rgba(239, 68, 68, 0.9)"/>
      <text x="498" y="21" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700" letterSpacing="0.5">⚠ HIDDEN SCREENING</text>
      
      {/* Main box */}
      <rect x="425" y="28" width="146" height="76" rx="0 0 10 10" fill="rgba(255,255,255,0.04)" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="2"/>
      <text x="498" y="52" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="11" fontWeight="500">This is where most</text>
      <text x="498" y="68" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="11" fontWeight="500">rejections happen</text>
      
      {/* 3 Signal Dots - Analyzing */}
      <circle cx="473" cy="88" r="7" fill="#ef4444">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="498" cy="88" r="7" fill="#eab308">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="523" cy="88" r="7" fill="#22c55e">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </g>
    
    {/* Arrow 4 */}
    <line x1="576" y1="55" x2="603" y2="55" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2"/>
    <polygon points="609,55 601,50 601,60" fill="rgba(6, 182, 212, 0.7)"/>
    
    {/* Node 5: Hiring Decision */}
    <g>
      <rect x="616" y="22" width="80" height="66" rx="10" fill="rgba(6, 182, 212, 0.12)" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5"/>
      <text x="656" y="52" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="600">Hiring</text>
      <text x="656" y="68" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="600">Decision</text>
      {/* Cycling dot */}
      <circle cx="656" cy="82" r="5">
        <animate attributeName="fill" values="#ef4444;#eab308;#22c55e;#eab308;#ef4444" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  </svg>
);

// Career Signal Flow - Mobile (Top to Bottom) - Premium Version
const CareerSignalFlowMobile = () => (
  <svg viewBox="0 0 240 410" className="w-full max-w-[220px] mx-auto" aria-hidden="true">
    {/* Node 1: YOU */}
    <g>
      <circle cx="120" cy="28" r="22" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2"/>
      <circle cx="120" cy="20" r="7" fill="rgba(255,255,255,0.8)"/>
      <path d="M106 40 Q120 30 134 40" fill="rgba(255,255,255,0.6)" stroke="none"/>
      <text x="120" y="62" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="12" fontWeight="600">You</text>
    </g>
    
    {/* Arrow 1 */}
    <line x1="120" y1="68" x2="120" y2="80" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    <polygon points="120,86 115,78 125,78" fill="rgba(255,255,255,0.5)"/>
    
    {/* Node 2: Resume + LinkedIn */}
    <g>
      <rect x="35" y="92" width="170" height="48" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <text x="120" y="112" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">Strong Resume</text>
      <text x="120" y="130" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="12">+ LinkedIn Profile</text>
    </g>
    
    {/* Arrow 2 */}
    <line x1="120" y1="145" x2="120" y2="157" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    <polygon points="120,163 115,155 125,155" fill="rgba(255,255,255,0.5)"/>
    
    {/* Node 3: Apply to Job */}
    <g>
      <rect x="45" y="169" width="150" height="40" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <text x="120" y="194" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">Apply to Job</text>
    </g>
    
    {/* Arrow 3 - highlighted danger */}
    <line x1="120" y1="214" x2="120" y2="226" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2"/>
    <polygon points="120,232 115,224 125,224" fill="rgba(239, 68, 68, 0.7)"/>
    
    {/* Node 4: Hidden Screening Layer - THE PROBLEM */}
    <g>
      {/* Glow effect */}
      <rect x="25" y="238" width="190" height="90" rx="12" fill="rgba(239, 68, 68, 0.08)" stroke="none"/>
      
      {/* Top warning bar */}
      <rect x="27" y="240" width="186" height="22" rx="6" fill="rgba(239, 68, 68, 0.9)"/>
      <text x="120" y="255" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700" letterSpacing="0.5">⚠ HIDDEN SCREENING</text>
      
      {/* Main box */}
      <rect x="27" y="262" width="186" height="64" rx="0 0 10 10" fill="rgba(255,255,255,0.04)" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="2"/>
      <text x="120" y="284" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="12" fontWeight="500">This is where most</text>
      <text x="120" y="300" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="12" fontWeight="500">rejections happen</text>
      
      {/* 3 Signal Dots */}
      <circle cx="95" cy="316" r="6" fill="#ef4444">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="120" cy="316" r="6" fill="#eab308">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="145" cy="316" r="6" fill="#22c55e">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </g>
    
    {/* Arrow 4 */}
    <line x1="120" y1="332" x2="120" y2="344" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2"/>
    <polygon points="120,350 115,342 125,342" fill="rgba(6, 182, 212, 0.7)"/>
    
    {/* Node 5: Hiring Decision */}
    <g>
      <rect x="45" y="356" width="150" height="46" rx="10" fill="rgba(6, 182, 212, 0.12)" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5"/>
      <text x="120" y="378" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">Hiring Decision</text>
      {/* Cycling dot */}
      <circle cx="120" cy="394" r="5">
        <animate attributeName="fill" values="#ef4444;#eab308;#22c55e;#eab308;#ef4444" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  </svg>
);

// Responsive wrapper - shows desktop on md+ and mobile on smaller screens
const CareerSignalFlow = () => (
  <>
    <div className="hidden md:block">
      <CareerSignalFlowDesktop />
    </div>
    <div className="block md:hidden">
      <CareerSignalFlowMobile />
    </div>
  </>
);

// Floating Signal Badges Visual - Distributed across full height
const FloatingSignalBadges = () => {
  // Badge configurations - spread evenly across full height with varied sizes/opacity
  const badges = [
    { 
      id: 'target',
      color: 'bg-orange-100', 
      iconColor: 'text-orange-500',
      top: '2%',
      right: '15%',
      size: 'p-4',
      iconSize: 'w-6 h-6',
      opacity: 0.95,
      delay: '0s',
      duration: '12s'
    },
    { 
      id: 'question',
      color: 'bg-blue-100', 
      iconColor: 'text-blue-500',
      top: '22%',
      right: '55%',
      size: 'p-3.5',
      iconSize: 'w-5 h-5',
      opacity: 0.88,
      delay: '2s',
      duration: '11s'
    },
    { 
      id: 'warning',
      color: 'bg-yellow-100', 
      iconColor: 'text-yellow-600',
      top: '42%',
      right: '25%',
      size: 'p-4',
      iconSize: 'w-6 h-6',
      opacity: 0.92,
      delay: '1s',
      duration: '13s'
    },
    { 
      id: 'eye',
      color: 'bg-green-100', 
      iconColor: 'text-green-500',
      top: '62%',
      right: '60%',
      size: 'p-3',
      iconSize: 'w-5 h-5',
      opacity: 0.85,
      delay: '3s',
      duration: '10s'
    },
    { 
      id: 'shield',
      color: 'bg-pink-100', 
      iconColor: 'text-pink-500',
      top: '82%',
      right: '30%',
      size: 'p-4',
      iconSize: 'w-6 h-6',
      opacity: 0.9,
      delay: '1.5s',
      duration: '14s'
    },
  ];

  // Icon components with dynamic size
  const getIcon = (id, sizeClass) => {
    const icons = {
      target: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <circle cx="12" cy="12" r="6" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" strokeWidth="2"/>
        </svg>
      ),
      question: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"/>
        </svg>
      ),
      warning: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      ),
      eye: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      ),
      shield: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
    };
    return icons[id];
  };

  return (
    <div className="relative w-full h-[400px] md:h-[450px]">
      {/* Soft gradient background glows - distributed */}
      <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
        <div className="absolute top-[5%] right-[10%] w-24 h-24 bg-orange-200/40 rounded-full blur-2xl" />
        <div className="absolute top-[25%] right-[50%] w-20 h-20 bg-blue-200/40 rounded-full blur-2xl" />
        <div className="absolute top-[45%] right-[20%] w-28 h-28 bg-yellow-200/30 rounded-full blur-2xl" />
        <div className="absolute top-[65%] right-[55%] w-20 h-20 bg-green-200/40 rounded-full blur-2xl" />
        <div className="absolute top-[85%] right-[25%] w-24 h-24 bg-pink-200/40 rounded-full blur-2xl" />
      </div>
      
      {/* Floating badges - absolutely positioned, distributed */}
      {badges.map((badge) => (
        <motion.div
          key={badge.id}
          className="absolute"
          style={{ 
            top: badge.top, 
            right: badge.right,
            opacity: badge.opacity 
          }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: badge.opacity, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: parseFloat(badge.delay) * 0.2 }}
        >
          <div
            className={`${badge.color} ${badge.iconColor} ${badge.size} rounded-2xl shadow-lg shadow-black/5`}
            style={{
              animation: `floatBadge ${badge.duration} ease-in-out infinite`,
              animationDelay: badge.delay,
            }}
          >
            {getIcon(badge.id, badge.iconSize)}
          </div>
        </motion.div>
      ))}
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes floatBadge {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-3px) translateX(1px);
          }
          50% {
            transform: translateY(-2px) translateX(-1px);
          }
          75% {
            transform: translateY(-4px) translateX(0.5px);
          }
        }
        
        @media (max-width: 768px) {
          @keyframes floatBadge {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            25% {
              transform: translateY(-2px) translateX(0.5px);
            }
            50% {
              transform: translateY(-1.5px) translateX(-0.5px);
            }
            75% {
              transform: translateY(-2.5px) translateX(0.3px);
            }
          }
        }
      `}</style>
    </div>
  );
};

// Signal Item Component for Section 2
const SignalItem = ({ number, icon, headline, subheadline, text, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="flex gap-4"
  >
    {/* Show icon on mobile, number on desktop */}
    <div className="w-6 shrink-0 mt-0.5">
      <span className="hidden md:inline text-zinc-500 text-sm font-medium">{number}.</span>
      <span className="md:hidden text-zinc-500">{icon}</span>
    </div>
    <div>
      <p className="text-zinc-800 font-semibold leading-snug">{headline}</p>
      <p className="text-zinc-700 font-medium text-sm mt-1">{subheadline}</p>
      <p className="text-zinc-500 text-sm leading-relaxed mt-1">{text}</p>
    </div>
  </motion.div>
);

// Section 3: Silent Decision Visual - Convergence Layout
// Signals (inputs) → Silent Decision (hidden judgment) → Lock (sealed)
const SilentDecisionVisual = () => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const visualRef = useRef(null);

  // Signal cards configuration
  const signals = [
    { label: "Senior enough?", color: "#22c55e" }, // green
    { label: "Signals match role?", color: "#eab308" }, // yellow
    { label: "Safe decision?", color: "#ef4444" }, // red
  ];

  // Animation sequence
  const runAnimationSequence = () => {
    // Phase 1: Signal cards fade in
    setAnimationPhase(1);
    
    // Phase 2: Connection lines draw toward Silent Decision
    setTimeout(() => setAnimationPhase(2), 800);
    
    // Phase 3: Silent Decision card pulses once
    setTimeout(() => setAnimationPhase(3), 2200);
    
    // Phase 4: Short pause (300-500ms) then lock appears
    setTimeout(() => setAnimationPhase(4), 2700);
    
    // Phase 5: Lock fully visible, everything static, lines fade
    setTimeout(() => setAnimationPhase(5), 3200);
  };

  // Trigger animation on scroll into view
  useEffect(() => {
    if (hasAnimated) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          runAnimationSequence();
        }
      },
      { threshold: 0.4 }
    );

    if (visualRef.current) {
      observer.observe(visualRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Animation state helpers
  const signalsVisible = animationPhase >= 1;
  const linesDrawing = animationPhase >= 2;
  const decisionPulsing = animationPhase === 3;
  const lockVisible = animationPhase >= 4;
  const finalState = animationPhase >= 5;

  return (
    <div ref={visualRef} className="w-full">
      {/* DESKTOP LAYOUT: Signals left, Silent Decision right-center */}
      <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
        {/* Left: Signal Cards */}
        <div className="flex flex-col gap-4">
          {signals.map((signal, index) => (
            <div
              key={index}
              className="relative flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3.5 transition-all duration-500"
              style={{
                opacity: signalsVisible ? 1 : 0,
                transform: signalsVisible ? 'translateX(0)' : 'translateX(-20px)',
                transitionDelay: `${index * 150}ms`,
                boxShadow: signalsVisible ? `0 0 20px ${signal.color}15` : 'none',
              }}
            >
              {/* Colored dot indicator */}
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ 
                  backgroundColor: signal.color,
                  boxShadow: `0 0 8px ${signal.color}60`,
                }}
              />
              <span className="text-white/70 text-sm font-medium whitespace-nowrap">
                {signal.label}
              </span>
            </div>
          ))}
        </div>

        {/* Center: Connection Lines (SVG) */}
        <svg 
          width="120" 
          height="140" 
          viewBox="0 0 120 140" 
          className="shrink-0"
          style={{ overflow: 'visible' }}
        >
          {/* Line from Signal 1 to center */}
          <path
            d="M0 25 Q60 25 110 70"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="200"
            style={{
              strokeDashoffset: linesDrawing ? 0 : 200,
              transition: 'stroke-dashoffset 0.8s ease-out',
              transitionDelay: '0ms',
              opacity: finalState ? 0.3 : 1,
            }}
          />
          {/* Line from Signal 2 to center */}
          <path
            d="M0 70 L110 70"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="200"
            style={{
              strokeDashoffset: linesDrawing ? 0 : 200,
              transition: 'stroke-dashoffset 0.8s ease-out',
              transitionDelay: '150ms',
              opacity: finalState ? 0.3 : 1,
            }}
          />
          {/* Line from Signal 3 to center */}
          <path
            d="M0 115 Q60 115 110 70"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="200"
            style={{
              strokeDashoffset: linesDrawing ? 0 : 200,
              transition: 'stroke-dashoffset 0.8s ease-out',
              transitionDelay: '300ms',
              opacity: finalState ? 0.3 : 1,
            }}
          />
          {/* Arrow head at convergence point */}
          <polygon
            points="110,70 102,65 102,75"
            fill="rgba(255,255,255,0.2)"
            style={{
              opacity: linesDrawing ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
              transitionDelay: '600ms',
            }}
          />
        </svg>

        {/* Right: Silent Decision Card */}
        <div
          className="relative bg-white/[0.02] border border-white/15 rounded-2xl px-8 py-6 text-center transition-all duration-500"
          style={{
            opacity: signalsVisible ? 1 : 0,
            transform: decisionPulsing ? 'scale(1.03)' : 'scale(1)',
            boxShadow: decisionPulsing 
              ? '0 0 30px rgba(255,255,255,0.08)' 
              : finalState 
                ? 'none' 
                : '0 0 20px rgba(0,0,0,0.3)',
            filter: finalState ? 'brightness(0.7)' : 'none',
          }}
        >
          {/* Label */}
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4">
            Silent Decision
          </p>
          
          {/* Lock Icon - Large, prominent, below label */}
          <div
            className="flex justify-center transition-all duration-700"
            style={{
              opacity: lockVisible ? 1 : 0,
              transform: lockVisible ? 'scale(1)' : 'scale(0.5)',
            }}
          >
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none"
              className="text-white/50"
            >
              <rect 
                x="4" y="10" 
                width="16" height="12" 
                rx="2" 
                stroke="currentColor" 
                strokeWidth="1.5"
                fill="rgba(255,255,255,0.03)"
              />
              <path 
                d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="2" fill="currentColor"/>
            </svg>
          </div>
          
          {/* Blur/opacity overlay when locked */}
          {finalState && (
            <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none" />
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT: Signals stacked at top, converging down to Silent Decision */}
      <div className="md:hidden flex flex-col items-center">
        {/* Top: Signal Cards stacked */}
        <div className="flex flex-col gap-3 w-full max-w-xs mb-4">
          {signals.map((signal, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 transition-all duration-500"
              style={{
                opacity: signalsVisible ? 1 : 0,
                transform: signalsVisible ? 'translateY(0)' : 'translateY(-15px)',
                transitionDelay: `${index * 150}ms`,
                boxShadow: signalsVisible ? `0 0 15px ${signal.color}10` : 'none',
              }}
            >
              <div 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ 
                  backgroundColor: signal.color,
                  boxShadow: `0 0 6px ${signal.color}60`,
                }}
              />
              <span className="text-white/70 text-sm font-medium">
                {signal.label}
              </span>
            </div>
          ))}
        </div>

        {/* Vertical Connection Lines */}
        <svg 
          width="60" 
          height="50" 
          viewBox="0 0 60 50" 
          className="mb-4"
        >
          {/* Three lines converging down */}
          <path
            d="M15 0 Q15 25 30 45"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="80"
            style={{
              strokeDashoffset: linesDrawing ? 0 : 80,
              transition: 'stroke-dashoffset 0.6s ease-out',
              opacity: finalState ? 0.3 : 1,
            }}
          />
          <path
            d="M30 0 L30 45"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="80"
            style={{
              strokeDashoffset: linesDrawing ? 0 : 80,
              transition: 'stroke-dashoffset 0.6s ease-out',
              transitionDelay: '100ms',
              opacity: finalState ? 0.3 : 1,
            }}
          />
          <path
            d="M45 0 Q45 25 30 45"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="80"
            style={{
              strokeDashoffset: linesDrawing ? 0 : 80,
              transition: 'stroke-dashoffset 0.6s ease-out',
              transitionDelay: '200ms',
              opacity: finalState ? 0.3 : 1,
            }}
          />
          {/* Arrow down */}
          <polygon
            points="30,50 25,42 35,42"
            fill="rgba(255,255,255,0.2)"
            style={{
              opacity: linesDrawing ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
              transitionDelay: '400ms',
            }}
          />
        </svg>

        {/* Bottom: Silent Decision Card */}
        <div
          className="relative bg-white/[0.02] border border-white/15 rounded-2xl px-6 py-5 text-center w-full max-w-[200px] transition-all duration-500"
          style={{
            opacity: signalsVisible ? 1 : 0,
            transform: decisionPulsing ? 'scale(1.03)' : 'scale(1)',
            boxShadow: decisionPulsing 
              ? '0 0 25px rgba(255,255,255,0.08)' 
              : 'none',
            filter: finalState ? 'brightness(0.7)' : 'none',
          }}
        >
          <p className="text-white/40 text-xs tracking-widest uppercase mb-3">
            Silent Decision
          </p>
          
          {/* Lock Icon - Large */}
          <div
            className="flex justify-center transition-all duration-700"
            style={{
              opacity: lockVisible ? 1 : 0,
              transform: lockVisible ? 'scale(1)' : 'scale(0.5)',
            }}
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none"
              className="text-white/50"
            >
              <rect 
                x="4" y="10" 
                width="16" height="12" 
                rx="2" 
                stroke="currentColor" 
                strokeWidth="1.5"
                fill="rgba(255,255,255,0.03)"
              />
              <path 
                d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="2" fill="currentColor"/>
            </svg>
          </div>
          
          {finalState && (
            <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

// Lens/X-Ray Metaphor
const LensXRaySVG = () => (
  <svg viewBox="0 0 300 150" className="w-full max-w-xs mx-auto" aria-hidden="true">
    {/* Document/Profile */}
    <rect x="30" y="30" width="80" height="90" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
    <line x1="45" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
    <line x1="45" y1="65" x2="85" y2="65" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
    <line x1="45" y1="80" x2="90" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
    <line x1="45" y1="95" x2="75" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
    
    {/* Lens */}
    <ellipse cx="175" cy="75" rx="45" ry="55" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2"/>
    <ellipse cx="175" cy="75" rx="35" ry="45" fill="rgba(99, 102, 241, 0.1)" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1"/>
    
    {/* Rays through lens */}
    <path d="M115 50 L135 60" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1"/>
    <path d="M115 75 L130 75" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5"/>
    <path d="M115 100 L135 90" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1"/>
    
    {/* Interpreted signals coming out */}
    <path d="M220 60 L250 50" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="1.5"/>
    <path d="M220 75 L260 75" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="2"/>
    <path d="M220 90 L250 100" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="1.5"/>
    
    {/* Insight nodes */}
    <circle cx="265" cy="50" r="8" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1"/>
    <circle cx="275" cy="75" r="10" fill="rgba(34, 197, 94, 0.25)" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="1.5"/>
    <circle cx="265" cy="100" r="8" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1"/>
  </svg>
);

// Section 4: Career Intelligence Report Preview Card
// Product-like card inspired by reference image - feels real but abstract
// Designed to stand out on white background
const CareerReportPreview = () => (
  <div className="relative w-full max-w-[280px] mx-auto">
    {/* Soft shadow for white background */}
    <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 via-transparent to-indigo-500/15 rounded-3xl blur-2xl opacity-80" />
    
    {/* Main card with stronger shadow for white bg */}
    <div className="relative bg-[#1a1a24] border border-zinc-700/50 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      
      {/* Header - Purple gradient */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-5 py-5">
        <h3 className="text-white font-semibold text-base mb-2">
          Career Intelligence Report
        </h3>
        <div className="flex items-center gap-2">
          {/* Person icon */}
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 20C4 17 7 14 12 14C17 14 20 17 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white/80 text-sm">Your Profile · Target Role</span>
        </div>
      </div>
      
      {/* Body - 3 Section Cards */}
      <div className="p-4 space-y-3">
        
        {/* Card 1: Career Diagnosis */}
        <div className="bg-[#252532] rounded-xl px-4 py-3.5 flex items-center gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Career Diagnosis</p>
            <p className="text-white/50 text-xs">Market perception analysis</p>
          </div>
          {/* Arrow */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/30 shrink-0">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Card 2: Risk Assessment */}
        <div className="bg-[#252532] rounded-xl px-4 py-3.5 flex items-center gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.56 20.73C2.86 20.91 3.21 21 3.56 21H20.44C20.79 21 21.14 20.91 21.44 20.73C21.74 20.56 22 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.31 12.97 3.14C12.67 2.96 12.34 2.87 12 2.87C11.66 2.87 11.33 2.96 11.03 3.14C10.73 3.31 10.47 3.56 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Risk Assessment</p>
            <p className="text-white/50 text-xs">Independent risk signals</p>
          </div>
          {/* Arrow */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/30 shrink-0">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Card 3: Recommendations */}
        <div className="bg-[#252532] rounded-xl px-4 py-3.5 flex items-center gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-purple-500 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.2066 13.1599 9 14.1973V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V14.1973C16.7934 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Recommendations</p>
            <p className="text-white/50 text-xs">Strategic improvements</p>
          </div>
          {/* Arrow */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/30 shrink-0">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {/* Footer - "Full report available" with stronger open lock + glow */}
      <div className="px-4 pb-4">
        <div className="relative bg-gradient-to-r from-emerald-600/20 to-cyan-500/20 border border-emerald-500/20 rounded-xl px-4 py-3.5">
          {/* Glow effect behind */}
          <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-sm" />
          
          <div className="relative flex flex-col items-center gap-1">
            {/* Open lock icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-md" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="relative text-emerald-400">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 11V7C8 4.79 9.79 3 12 3C13.5 3 14.77 3.8 15.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white/80 text-xs font-medium">Full report available</span>
            <span className="text-emerald-400/70 text-[10px]">Unlocked after analysis</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Report Blueprint (layered)
// ============== COMPONENTS ==============

// Primary CTA Button - Premium, visible, modern
const PrimaryCTA = ({ onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] ${className}`}
    data-testid="cta-button"
  >
    <span className="flex items-center gap-2 justify-center text-sm sm:text-base whitespace-nowrap">
      Check Why I&apos;m Not Getting Shortlisted
      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
    </span>
  </button>
);

// ============== MAIN COMPONENT ==============

export default function LandingPage() {
  const navigate = useNavigate();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const section2Ref = useRef(null);

  const handleCTA = () => {
    // Navigate to checkout page - UTM params are already persisted in localStorage
    // and will be read by OrderPage when submitting
    navigate("/checkout");
  };

  // Show sticky CTA when Section 2 starts (after hero section)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCTA(entry.isIntersecting || entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
    );

    // Observe section 2
    const section2 = document.getElementById('section-2-trigger');
    if (section2) {
      observer.observe(section2);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Sticky CTA - Mobile Only */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
          >
            <button
              onClick={handleCTA}
              className="w-full py-4 px-6 rounded-2xl font-semibold text-white shadow-2xl transition-all duration-300 active:scale-[0.98] relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.5), 0 4px 20px -5px rgba(6, 182, 212, 0.3)'
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Button content */}
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-base tracking-wide">See Why I&apos;m Being Rejected</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Header - Same as Order Page */}
      <header className="border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">CareerIQ</span>
          </div>
        </div>
      </header>

      {/* ===== SECTION 1: HERO ===== */}
      <section id="hero" className="px-4 pt-8 md:pt-12 pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Headline - bigger on mobile */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Top 1% Professionals Move Ahead{" "}
              <span 
                style={{
                  background: "linear-gradient(to right, #6366f1, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                12× Faster
              </span>
              <br className="hidden md:block" />
              <span className="md:block"> While <span className="text-red-500">80% Stay Invisible</span> to Recruiters</span>
            </h1>

            {/* Subheadline - tighter spacing */}
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 leading-relaxed">
              Most people keep fixing their resume and LinkedIn profile.
              <br className="hidden sm:block" />
              Top performers fix what recruiters actually judge.
            </p>

            {/* Visual: Career Signal Flow (Desktop: horizontal, Mobile: vertical) */}
            <div className="mb-5">
              <CareerSignalFlow />
            </div>

            {/* New explanatory text below diagram - tighter */}
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
              You apply to roles with a strong resume and a polished LinkedIn.
              Yet recruiters don&apos;t respond — or stop shortlisting you without explanation.
            </p>

            {/* CTA */}
            <PrimaryCTA onClick={handleCTA} />

            {/* CTA Helper */}
            <p className="text-zinc-500 text-xs mt-3">
              One-time report • ₹2,999 • No subscriptions
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 2: WHY 80% GET REJECTED (New Section) ===== */}
      <section id="section-2-trigger" className="bg-[#050508] py-14 md:py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-5 md:px-4">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-[22px] sm:text-3xl md:text-4xl font-bold leading-snug md:leading-tight">
              Why <span className="text-red-500">80%</span> of Professionals{" "}
              <span className="text-red-500">Are Rejected</span>
              <span className="block mt-1">Even With a &quot;Good&quot; Resume</span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-center mb-8"
          >
            <p className="text-zinc-400 text-[15px] md:text-lg leading-relaxed">
              They&apos;re not failing interviews.
              <br />
              They&apos;re being filtered out <span className="text-white">before</span> interviews even happen.
            </p>
          </motion.div>

          {/* Body Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-10"
          >
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
              Not because they lack experience.
              <br />
              And not because their resume is bad.
            </p>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed mt-4">
              But because recruiters make <span className="text-zinc-200">silent decisions</span>
              <br />
              no one ever explains.
            </p>
          </motion.div>

          {/* What's Actually Happening */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-10"
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest text-center mb-5">
              What&apos;s actually happening behind the scenes
            </p>
            
            <div className="space-y-2.5">
              {[
                "They can&apos;t quickly place you at the next level",
                "Your experience feels strong, but not directional",
                "Your profile looks safe, not compelling",
                "They hesitate because the risk feels unclear",
                "You get views — but rarely get shortlisted"
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span className="text-zinc-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Closing Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-5">
              These judgments happen quietly — often in seconds.
              <br />
              And once they&apos;re made, the application is already over.
            </p>
            
            {/* Transition Line */}
            <p className="text-zinc-200 text-sm md:text-base font-medium">
              To stop this, you need to see what recruiters actually judge.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 3: SIGNALS (Pressure Builder) ===== */}
      <section id="signals" className="bg-zinc-50 py-14 md:py-20 overflow-x-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Headline & Subhead - Centered */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                What Recruiters Actually Evaluate
                <span className="block text-xl sm:text-2xl md:text-3xl text-zinc-600 font-medium mt-1">(But Rarely Explain)</span>
              </h2>
              <div className="text-zinc-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed space-y-2">
                <p>Recruiters don&apos;t reject resumes. They reject unclear signals.</p>
                <p className="text-zinc-500 text-sm md:text-base">
                  These decisions happen silently — often in under 7 seconds —
                  <br className="hidden sm:block" />
                  and no one tells you what failed.
                </p>
              </div>
              <p className="text-zinc-800 font-medium mt-4 text-sm md:text-base">
                Here&apos;s what they&apos;re really judging:
              </p>
            </motion.div>

            {/* Main Content: Two-column (Desktop) / Single-column (Mobile) */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-start">
              
              {/* Visual - Shows only on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="hidden md:block w-full md:w-2/5 order-1 md:order-2"
              >
                <FloatingSignalBadges />
              </motion.div>

              {/* Signal Items - Left column on desktop */}
              <div className="w-full md:w-3/5 order-2 md:order-1 space-y-6 md:space-y-7">
                <SignalItem 
                  number="1"
                  icon={<Target className="w-4 h-4" />}
                  headline="Next-Role Clarity"
                  subheadline="Can I clearly see what role this person should move into next?"
                  text="If your profile doesn&apos;t point to one obvious direction, recruiters move on."
                  delay={0.1}
                />
                <SignalItem 
                  number="2"
                  icon={<TrendingUp className="w-4 h-4" />}
                  headline="Promotion Readiness"
                  subheadline="Does this person feel ready to move up?"
                  text="Strong experience still gets rejected if you don&apos;t look ready for the next level."
                  delay={0.15}
                />
                <SignalItem 
                  number="3"
                  icon={<BookOpen className="w-4 h-4" />}
                  headline="Career Narrative"
                  subheadline="Does this person's career tell one clear story?"
                  text="Disconnected roles make it harder to trust the progression."
                  delay={0.2}
                />
                <SignalItem 
                  number="4"
                  icon={<ShieldAlert className="w-4 h-4" />}
                  headline="Shortlisting Risk"
                  subheadline="Will shortlisting this person feel risky?"
                  text="When recruiters feel unsure, they choose safer profiles."
                  delay={0.25}
                />
                <SignalItem 
                  number="5"
                  icon={<MessageSquare className="w-4 h-4" />}
                  headline="Internal Explainability"
                  subheadline="Can I clearly explain this candidate to my manager?"
                  text="If you can't be described in one sentence, your profile loses momentum."
                  delay={0.3}
                />
                <SignalItem 
                  number="6"
                  icon={<Sparkles className="w-4 h-4" />}
                  headline="Distinctiveness"
                  subheadline="Do they stand out — or sound like everyone else?"
                  text="Profiles that blend in get ignored, even when they're qualified."
                  delay={0.35}
                />
              </div>
            </div>

            {/* Bottom Punchline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 md:mt-16 pt-8 border-t border-zinc-200"
            >
              <div className="text-center space-y-3">
                <p className="text-zinc-600 text-base md:text-lg">
                  Most professionals optimize resumes and keywords.
                  <br />
                  <span className="text-zinc-800 font-medium">Recruiters decide based on clarity, confidence, and perceived risk.</span>
                </p>
                <p className="text-zinc-900 text-lg md:text-xl font-semibold">
                  Once you see where these signals break down,
                  <br />
                  your next move becomes obvious.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: DECISION GRAVITY ===== */}
      <section id="decision-gravity" className="px-4 py-16 md:py-24 bg-[#050508]">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-5"
          >
            What Recruiters Decide Before Shortlisting
          </motion.h2>

          {/* Subhead - EXACT copy with spacing before visual */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-zinc-400 text-center text-base md:text-lg max-w-xl mx-auto mb-12 md:mb-16 leading-relaxed"
          >
            These decisions happen silently and quickly —
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            often before anyone reads your resume closely.
          </motion.p>

          {/* PRIMARY VISUAL: Signal Convergence → Silent Decision → Lock */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 md:mb-16"
          >
            <SilentDecisionVisual />
          </motion.div>

          {/* Supporting Line - SHORT, secondary, below visual */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-zinc-500 text-center text-sm mb-8 md:mb-10"
          >
            Before interviews, your profile has already answered questions like these.
          </motion.p>

          {/* Final Line - CENTERED, STRONG, do not soften */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-300 text-center text-base md:text-lg font-medium max-w-lg mx-auto leading-relaxed"
          >
            Once these decisions are made, applications are rarely reconsidered.
          </motion.p>
        </div>
      </section>

      {/* ===== SECTION 4: THE PART NOBODY SHOWS YOU — NOW VISIBLE ===== */}
      {/* White background - following flow: dark (Sec 3) → white (Sec 4) → dark */}
      <section id="clarity" className="px-4 py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Headline - Centered, dark text for white bg */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-4 max-w-[90%] mx-auto"
          >
            The Part Nobody Shows You — Now Visible
          </motion.h2>

          {/* Subhead - Centered, with line break for rhythm */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-zinc-600 text-center text-base md:text-lg max-w-2xl mx-auto mb-3 leading-relaxed"
          >
            CareerIQ shows how your profile is <span className="text-zinc-900 font-medium">interpreted</span>,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            not just how it&apos;s written.
          </motion.p>

          {/* Supporting line - Small, muted, sharper copy */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-zinc-500 text-center text-sm max-w-xl mx-auto mb-12 md:mb-16"
          >
            It shows how your resume, LinkedIn, and target role come together in a recruiter&apos;s decision.
          </motion.p>

          {/* Two-column layout: Visual (left) + Report Items (right) - ALIGNED TOPS */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">
            
            {/* Left: Visual - Report Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full md:w-[42%] flex justify-center md:justify-start"
            >
              <CareerReportPreview />
            </motion.div>

            {/* Right: What You'll See in Your Report */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full md:w-[58%]"
            >
              {/* Section headline - styled as headline since it introduces a section */}
              <h3 className="text-zinc-900 font-semibold text-lg md:text-xl mb-6">
                What you&apos;ll see in your report
              </h3>
              
              {/* Report items - styled as answers to doubt (strong title + softer description) */}
              <div className="space-y-5 md:space-y-4">
                {[
                  {
                    title: "Career Verdict",
                    description: "How recruiters are currently interpreting your profile — in one clear outcome."
                  },
                  {
                    title: "Risk Signals",
                    description: "What creates hesitation or doubt, even when you look qualified."
                  },
                  {
                    title: "Role Mismatch",
                    description: "Where your experience doesn't line up with what the role expects."
                  },
                  {
                    title: "Execution Guardrails",
                    description: "What needs to change so your profile feels safe to shortlist."
                  },
                  {
                    title: "Decision Summary",
                    description: "Why your applications stall — and what would change the decision."
                  }
                ].map((item, index) => (
                  <div key={index}>
                    <h4 className="text-zinc-900 font-semibold text-base mb-1">
                      {item.title}
                    </h4>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Micro-reassurance line */}
              <p className="text-zinc-500 text-xs mt-6 italic">
                This isn&apos;t advice or tips. It&apos;s how your profile is being read right now.
              </p>
            </motion.div>
          </div>

          {/* Emotional payoff line - Centered, slightly larger, with breathing room */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-700 text-center text-base md:text-lg font-medium mt-14 md:mt-16 mb-8"
          >
            For the first time, you see your profile the way recruiters do.
          </motion.p>

          {/* CTA - Full width on mobile, centered on desktop - dark style for white bg */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-center"
          >
            <button
              onClick={handleCTA}
              className="w-full md:w-auto group relative px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl min-h-[48px]"
              data-testid="section4-cta-button"
            >
              <span className="flex items-center gap-2 justify-center text-sm sm:text-base whitespace-nowrap">
                Check Why I&apos;m Not Getting Shortlisted
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
            
            {/* CTA Microcopy */}
            <p className="text-zinc-500 text-xs mt-3">
              One-time report • ₹2,999 • No subscriptions
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 5: HOW CAREERIQ WORKS ===== */}
      {/* Dark charcoal bg - slightly lighter than Section 3 for emotional relief */}
      <section id="how-it-works" className="px-4 py-16 md:py-24 bg-[#0a0a0f]">
        <div className="max-w-[800px] mx-auto">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-3"
          >
            How CareerIQ Works
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-zinc-400 text-center text-sm md:text-base mb-10 md:mb-14"
          >
            Built from real shortlisting decisions — not tips or theory.
          </motion.p>

          {/* === ZONE 1: USER INPUT === */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 md:mb-8"
          >
            {/* Zone Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">You</span>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
            </div>
            
            {/* Step Card */}
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4 md:p-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <span className="text-emerald-400 font-semibold text-xs md:text-sm">01</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base md:text-lg mb-1.5">
                    Share your profile
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Upload your resume, LinkedIn, and target role.
                  </p>
                  <p className="text-zinc-500 text-xs mt-1.5">
                    No calls. No long forms. Takes under 2 minutes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Arrow Down */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex justify-center mb-6 md:mb-8"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* === ZONE 2: SYSTEM INTELLIGENCE === */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 md:mb-8"
          >
            {/* Zone Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Our Intelligence System</span>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
            </div>
            
            {/* System Processing Card - Contains both analysis steps */}
            <div className="relative bg-gradient-to-br from-primary/[0.04] to-cyan-500/[0.04] border border-primary/20 rounded-xl p-4 md:p-6 pt-12 md:pt-6 overflow-hidden">
              {/* Subtle animated background pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative space-y-5 md:space-y-6">
                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs md:text-sm">02</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-base md:text-lg mb-1.5">
                      Recruiter-grade evaluation
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Your profile is evaluated using a decision framework refined by senior recruiters — 
                      built from analyzing <span className="text-zinc-300">thousands of real profiles</span> across roles and industries.
                    </p>
                    <p className="text-zinc-500 text-xs mt-1.5">
                      Not keyword matching. Not formatting advice.
                    </p>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-white/5"></div>
                
                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs md:text-sm">03</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-base md:text-lg mb-1.5">
                      Market interpretation
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Your experience, positioning, and career narrative are assessed together — 
                      the same way hiring managers decide:
                    </p>
                    <ul className="text-zinc-500 text-xs mt-2 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                        Is this person senior enough?
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                        Do they feel aligned to the role?
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                        Is this a safe shortlist?
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* System badge */}
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-zinc-400 font-medium">Recruiter-Tested</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Arrow Down */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="flex justify-center mb-6 md:mb-8"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* === ZONE 3: THE REVEAL === */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Zone Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">You Receive</span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent"></div>
            </div>
            
            {/* Reveal Card */}
            <div className="bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] border border-amber-500/20 rounded-xl p-4 md:p-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <span className="text-amber-400 font-semibold text-xs md:text-sm">04</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base md:text-lg mb-1.5">
                    Your Career Intelligence Report
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    See what <span className="text-amber-300/90">no one has told you</span> — how your profile is actually being read, 
                    what&apos;s causing hesitation, and what would change the decision.
                  </p>
                  <p className="text-zinc-500 text-xs mt-1.5">
                    No advice. No templates. Just the clarity you&apos;ve been missing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reassurance Line */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-zinc-500 text-center text-xs md:text-sm mt-10 md:mt-14"
          >
            One-time report • No subscriptions • No upsells
          </motion.p>
        </div>
      </section>

      {/* ===== CLOSING SECTION: DECISION MOMENT ===== */}
      {/* Dark bg - slightly lighter than Section 3, calm and conclusive */}
      <section id="closing" className="px-4 py-16 md:py-24 bg-[#0a0a0f]">
        <div className="max-w-[680px] mx-auto">
          
          {/* 1. Headline - Emotional clarity */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-[22px] md:text-3xl font-bold text-white text-center mb-10 md:mb-12 leading-snug"
          >
            If you&apos;ve been second-guessing your next career move,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            this gives you{" "}
            <span 
              style={{
                background: "linear-gradient(to right, #6366f1, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              clarity before you act
            </span>.
          </motion.h2>

          {/* 2. Sample Insight - Proof of depth */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-10 md:mb-12"
          >
            <p className="text-zinc-500 text-xs uppercase tracking-wider text-center mb-4">
              A Sample Insight
            </p>
            
            {/* Quote-style insight card */}
            <div className="relative max-w-lg mx-auto">
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 md:p-6">
                <div className="absolute top-3 right-3 md:top-4 md:right-4 text-[10px] text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded">
                  Sample
                </div>
                
                <blockquote className="text-zinc-300 text-sm md:text-base leading-relaxed italic">
                  &quot;Your experience suggests senior ownership, but the way it&apos;s presented signals 
                  execution-level contribution. This creates hesitation for leadership roles.&quot;
                </blockquote>
                
                <p className="text-zinc-500 text-xs mt-4">
                  This is one example. Your report is personalized to your profile and target role.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. Pricing Block */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8 md:mb-10"
          >
            <p className="text-zinc-400 text-sm md:text-base mb-2">
              Complete Career Intelligence Report
            </p>
            <span className="text-4xl md:text-5xl font-bold text-white">₹2,999</span>
          </motion.div>

          {/* 4. High-Impact Value Lines - Bold, scannable */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8 md:mb-10"
          >
            <div className="max-w-lg mx-auto text-center space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                Why Most Skilled Professionals Stay Stuck — Even With a &quot;Good&quot; Resume
              </h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Your resume isn&apos;t the problem. Your career strategy is.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                This Career Intelligence Report shows how recruiters actually read your profile — and why it&apos;s being ignored before interviews even happen.
              </p>
              <p className="text-zinc-500 text-xs sm:text-sm italic">
                Built from real hiring patterns and recruiter decision signals, not generic resume advice.
              </p>
            </div>
          </motion.div>

          {/* 5. Primary CTA - Single, decisive */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto group relative px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] min-h-[48px]"
              data-testid="closing-cta-button"
            >
              <span className="flex items-center gap-2 justify-center text-sm sm:text-base whitespace-nowrap">
                Check Why I&apos;m Not Getting Shortlisted
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
            
            {/* 6. Micro-reassurance */}
            <p className="text-zinc-500 text-xs mt-4">
              One-time report • Instant access • No subscriptions
            </p>
          </motion.div>

        </div>
      </section>

      {/* ===== SECTION 10: FOOTER ===== */}
      <footer className="px-4 py-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          {/* Disclaimer */}
          <div className="text-zinc-600 text-xs mb-8 max-w-3xl mx-auto leading-relaxed space-y-3">
            <p>
              <span className="text-zinc-500 font-medium">DISCLAIMER:</span> This website is not affiliated with or endorsed by LinkedIn™, Naukri™, Indeed™, or any third-party job platforms or recruitment agencies. All trademarks and brand names are property of their respective owners and used for identification purposes only.
            </p>
            <p>
              CareerIQ provides career intelligence signals and market interpretation analysis based solely on the information you provide (resume, LinkedIn profile, target role). Each report is unique to the user's input, and results will vary based on individual profiles, career history, and market conditions. The insights provided are analytical observations, not guarantees of interview calls, job offers, or career outcomes.
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center gap-6 text-zinc-500 text-sm mb-6">
            <a href="/privacy-policy" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="/terms-of-use" className="hover:text-zinc-300 transition-colors">Terms of Use</a>
            <a href="mailto:support.career-iq@aykaa.me" className="hover:text-zinc-300 transition-colors">Support</a>
          </div>

          {/* Brand */}
          <p className="text-zinc-700 text-xs">
            © {new Date().getFullYear()} CareerIQ by Aykaa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
