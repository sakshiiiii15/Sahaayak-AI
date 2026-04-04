import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform,
  useSpring,
  useMotionValue
} from 'framer-motion';
import { 
  Shield, 
  Search, 
  FileText, 
  Settings, 
  Info, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Volume2, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Trash, 
  Share2, 
  Download, 
  Zap, 
  History,
  Target
} from 'lucide-react';
import VisualAnalytics from './components/VisualAnalytics';
import * as THREE from 'three';
import { toPng } from 'html-to-image';

const LiquidMolecule = ({ x, y, isClicking, isPointer }) => {
  const [coords, setCoords] = React.useState([
    { ox: 0, oy: 0 },
    { ox: 0, oy: 0 },
    { ox: 0, oy: 0 },
  ]);

  React.useEffect(() => {
    let frameId;
    const update = () => {
      const curTime = Date.now() * (isPointer ? 0.015 : 0.008);
      const radius = isClicking ? 0 : isPointer ? 22 : 15; // Tightened 
      
      const newCoords = [0, 1, 2].map((i) => {
        const angle = (i * (Math.PI * 2)) / 3;
        return {
          ox: Math.cos(curTime + angle) * radius,
          oy: Math.sin(curTime + angle) * radius,
        };
      });
      setCoords(newCoords);
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, [isClicking, isPointer]);

  const colors = ["bg-indigo-400", "bg-emerald-400", "bg-rose-400"];
  const glows = ["shadow-[0_0_12px_#818cf8]", "shadow-[0_0_12px_#34d399]", "shadow-[0_0_12px_#fb7185]"];

  return (
    <motion.div
      style={{ x, y }}
      className="absolute top-0 left-0 pointer-events-none flex items-center justify-center"
    >
      {/* 🔮 Shared Energy Envelope (Surgical Aura) */}
      <motion.div
        animate={{ 
          scale: isClicking ? 0.4 : isPointer ? 1.4 : 1,
          opacity: isPointer ? 0.25 : 0.12 
        }}
        className="absolute w-10 h-10 bg-indigo-500/20 blur-xl rounded-full backdrop-blur-sm border border-white/5"
      />

      {/* 🕸️ Plasma Bridge (SVG Links) */}
      <svg className="absolute w-24 h-24 overflow-visible" viewBox="-48 -48 96 96">
        <defs>
          <linearGradient id="plasmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d={`M ${coords[0].ox} ${coords[0].oy} L ${coords[1].ox} ${coords[1].oy} L ${coords[2].ox} ${coords[2].oy} Z`}
          fill="none"
          stroke="url(#plasmaGrad)"
          strokeWidth="0.6"
          strokeDasharray="1.5 1.5"
          className="opacity-30"
        />
      </svg>

      {/* ⚛️ The Atoms (Minimalist Energy Points) */}
      {coords.map((c, i) => (
        <motion.div
          key={i}
          animate={{ x: c.ox, y: c.oy, scale: isClicking ? 0.4 : 1 }}
          className={`absolute w-1.5 h-1.5 rounded-full ${colors[i]} ${glows[i]} border border-white/20`}
        />
      ))}
    </motion.div>
  );
};

const App = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("analyzer");
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const vantaRef = useRef(null);
  const scorecardRef = useRef(null);
  
  // Tri-Atom Liquid Cursor Physics
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { stiffness: 120, damping: 25 }; 
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const [isClicking, setIsClicking] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      const target = e.target;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);
  const meshY1 = useTransform(scrollY, [0, 500], [0, -50]);
  const meshY2 = useTransform(scrollY, [0, 500], [0, -80]);

  useEffect(() => {
    const saved = localStorage.getItem('sahaayak_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Custom 3D Particle System Implementation
  useEffect(() => {
    if (!vantaRef.current) return;

    const createCapsuleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      // Elongated Capsule Shape for Antigravity-style
      const gradient = ctx.createRadialGradient(32, 64, 0, 32, 64, 60);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)'); 
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      // Drawing a capsule
      ctx.beginPath();
      ctx.roundRect(24, 32, 16, 64, 8);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };
    const circleTexture = createCapsuleTexture();

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Safety check to avoid duplicate canvases
    if (vantaRef.current) vantaRef.current.innerHTML = '';
    vantaRef.current.appendChild(renderer.domElement);

    // Meta-Glow Blobs Configuration (Spaced & Varied)
    const blobCount = 7;
    const blobColors = [
      0x4f46e5, // Indigo
      0x10b981, // Emerald
      0xef4444, // Crimson
      0x6366f1, // Light Indigo
      0x34d399, // Light Emerald
      0xf472b6, // Pink Surge
      0x818cf8  // Soft Blue
    ];

    const blobs = [];
    
    // Create a special Soft Volumetric Texture
    const createBlobTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)'); 
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)'); 
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    };
    const blobTexture = createBlobTexture();

    for (let i = 0; i < blobCount; i++) {
        const material = new THREE.MeshBasicMaterial({
          color: blobColors[i],
          map: blobTexture,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        
        // Varied sizes for better depth
        const size = 6 + Math.random() * 8;
        const geometry = new THREE.PlaneGeometry(size, size);
        const mesh = new THREE.Mesh(geometry, material);
        
        // Very spread out initial positions
        mesh.position.set(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 15,
          -8 + (Math.random() * 4)
        );
        
        // Store Divergent Physics metadata (Increased separation variance)
        mesh.userData = {
          attractionWeight: 0.0005 + Math.random() * 0.002, // 80% Reduction for subtle influence
          noiseScale: 0.8 + Math.random() * 2.5,          // Higher variance for separate paths
          driftSpeed: 0.005 + Math.random() * 0.015,     // Boosted organic drift
          noisePhase: Math.random() * 5000,
          originalColor: blobColors[i],
          baseScale: size
        };
        
        blobs.push(mesh);
        scene.add(mesh);
    }

    // Removed Particle Material logic as we are using Blobs

    camera.position.z = 3;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop (Fluid Organic Liquid Physics)
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.00025; // Slower, more velvety motion
      
      blobs.forEach((blob, index) => {
        const { attractionWeight, noiseScale, noisePhase, driftSpeed } = blob.userData;

        // 1. INDEPENDENT Organic Movement (Random wandering)
        blob.position.x += Math.sin(time * noiseScale + noisePhase) * driftSpeed;
        blob.position.y += Math.cos(time * (noiseScale * 0.7) + noisePhase) * driftSpeed;

        // 2. SUBTLE Magnetic Attraction (Gentle nudge, no clumping)
        const dx = (mouseX * 7.5) - blob.position.x;
        const dy = (-mouseY * 4.5) - blob.position.y;
        
        blob.position.x += dx * attractionWeight;
        blob.position.y += dy * attractionWeight;

        // 3. Calm Breathing (Very slow scale oscillation)
        const scaleMod = 1 + Math.sin(time * 1.2 + index) * 0.15;
        blob.scale.set(scaleMod, scaleMod, 1);

        // Keep within wide cinematic bounds
        if (Math.abs(blob.position.x) > 18) blob.position.x *= 0.99;
        if (Math.abs(blob.position.y) > 12) blob.position.y *= 0.99;
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Meta-Glow Color Reactivity Logic
    const updateColors = () => {
      if (!result) {
        blobs.forEach((blob, i) => {
          blob.material.color.set(blob.userData.originalColor);
          blob.material.opacity = 0.4;
        });
        return;
      }
      
      let targetColorValue;
      if (result.status === "Scam") targetColorValue = 0xef4444; // All Crimson
      else if (result.status === "Suspicious") targetColorValue = 0xf59e0b; // All Amber
      else targetColorValue = 0x10b981; // All Emerald

      blobs.forEach(blob => {
        blob.material.color.set(targetColorValue);
        blob.material.opacity = 0.6; // Intensify on result
      });
    };
    updateColors();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (vantaRef.current) {
        vantaRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      blobs.forEach(blob => {
        blob.geometry.dispose();
        blob.material.dispose();
      });
    };
  }, [result]); // Re-run effect or update colors when result changes

  const saveToHistory = (newResult, queryText) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      displayText: queryText.length > 50 ? queryText.substring(0, 50) + "..." : queryText,
      fullText: queryText,
      ...newResult
    };
    const updated = [entry, ...history].slice(0, 50); // Increased history limit to 50
    setHistory(updated);
    localStorage.setItem('sahaayak_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('sahaayak_history', JSON.stringify(updated));
    if (selectedHistoryItem?.id === id) setSelectedHistoryItem(null);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all analysis history?")) {
      setHistory([]);
      localStorage.removeItem('sahaayak_history');
      setSelectedHistoryItem(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(""), 2000);
  };

  const copyFullReport = (item) => {
    const report = `
SAHAAYAK AI - ANALYSIS REPORT
--------------------------------
STATUS: ${item.status.toUpperCase()}
DATE: ${item.timestamp}
SCAM SCORE: ${item.scam_score}%
AI SCORE: ${item.ai_score}%

ANALYZED CONTENT:
${item.fullText || item.analyzed_text}

FINDINGS:
${item.why.map((w, i) => `${i+1}. ${w}`).join("\n")}

RECOMMENDED ACTION:
${item.action_plan.map((a, i) => `- ${a}`).join("\n")}

SUMMARY:
${item.simplified}
    `.trim();
    copyToClipboard(report, "Full Report");
  };

  const exportAsImage = () => {
    if (scorecardRef.current === null) return;
    setCopyStatus("Preparing Card");
    toPng(scorecardRef.current, { cacheBust: true, backgroundColor: '#0f0f15' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Sahaayak_AI_Report_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        setCopyStatus("Scorecard Exported");
        setTimeout(() => setCopyStatus(""), 2000);
      })
      .catch((err) => {
        console.error(err);
        setCopyStatus("Export Failed");
      });
  };

  const RiskyText = ({ text, segments }) => {
    if (!segments || segments.length === 0) return <p className="text-xl text-slate-100 font-medium leading-[1.6] relative z-10">{text}</p>;
    
    // Sort and filter unique segments
    const sorted = [...segments].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sorted.forEach((seg, i) => {
      if (seg.start < lastIndex) return; // Skip overlapping
      if (seg.start > lastIndex) {
        elements.push(text.substring(lastIndex, seg.start));
      }
      elements.push(
        <motion.span 
          key={i}
          initial={{ backgroundColor: "rgba(239, 68, 68, 0)" }}
          animate={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}
          whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.3)" }}
          className="px-1 rounded border-b-2 border-red-500/50 cursor-help relative group"
        >
          {text.substring(seg.start, seg.end)}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900/95 text-[10px] text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mb-2 z-50 border border-red-500/30 shadow-xl backdrop-blur-md">
            ⚠️ {seg.type.replace(/_/g, ' ')}
          </span>
        </motion.span>
      );
      lastIndex = seg.end;
    });

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return <p className="text-xl text-slate-100 font-medium leading-[1.6] relative z-10 whitespace-pre-wrap">{elements}</p>;
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const speakResult = (message) => {
    if (!message) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
  };

  const analyzeAll = async () => {
    if (!text.trim() && !file) return;
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (file) {
        const data = new FormData();
        data.append("file", file);
        res = await axios.post("http://127.0.0.1:5000/upload", data);
      } else {
        res = await axios.post("http://127.0.0.1:5000/analyze", { text });
      }
      setResult(res.data);
      if (res.data.analyzed_text) setText(res.data.analyzed_text);
      saveToHistory(res.data, res.data.analyzed_text || text || file?.name || "File Check");
      if (res.data.message) speakResult(res.data.message);
      
      // Auto-scroll to the new results after a short delay
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top where the banner is
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status = result?.status) => {
    if (status === "Scam") return <AlertCircle className="text-red-500" size={48} />;
    if (status === "Suspicious") return <AlertTriangle className="text-orange-500" size={48} />;
    return <Check className="text-emerald-500" size={48} />;
  };

  const getStatusColor = (status = result?.status) => {
    if (status === "Scam") return "#ef4444";
    if (status === "Suspicious") return "#f59e0b";
    return "#10b981";
  };

  const getMoodColor = () => {
    if (!result) return "rgba(79, 70, 229, 0.1)"; // Default Indigo
    if (result.status === "Scam") return "rgba(239, 68, 68, 0.15)";
    if (result.status === "Suspicious") return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        scale: result?.status === "Scam" ? [1, 1.002, 1] : 1,
      }}
      transition={{ 
        duration: 1.5,
        scale: result?.status === "Scam" ? { repeat: Infinity, duration: 2 } : { duration: 0.5 }
      }}
      className="min-h-screen text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden relative bg-[#050508] cursor-none"
    >
      {/* ⚛️ Unified Neural Core Liquid Cursor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[10000]">
        <LiquidMolecule 
          x={springX} 
          y={springY} 
          isClicking={isClicking} 
          isPointer={isPointer}
        />
      </div>

      <motion.div 
        ref={vantaRef} 
        style={{ y: backgroundY }}
        className="fixed inset-0 z-0 pointer-events-none" 
      />
      {/* Animated Mesh Overlays with Scroll Parallax and Reactive Colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div 
            style={{ y: meshY1 }}
            animate={{ 
              x: [0, 40, 0], 
              y: [0, 30, 0],
              background: result ? (
                result.status === "Scam" ? "radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)" : 
                result.status === "Suspicious" ? "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)" : 
                "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)"
              ) : "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)" 
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] blur-[120px] rounded-full" 
          />
          <motion.div 
            style={{ y: meshY2 }}
            animate={{ 
              x: [0, -40, 0], 
              y: [0, -30, 0],
              background: result ? (
                result.status === "Scam" ? "rgba(239, 68, 68, 0.1)" : 
                result.status === "Suspicious" ? "rgba(245, 158, 11, 0.1)" : 
                "rgba(129, 140, 248, 0.1)"
              ) : "rgba(129, 140, 248, 0.1)" 
            }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] blur-[120px] rounded-full" 
          />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {copyStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2"
          >
            <Check size={18} /> {copyStatus} Copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI */}
      <header className="fixed top-0 left-0 right-0 z-[1000] px-6 py-4 flex items-center justify-center">
        <nav className="max-w-7xl w-full flex items-center justify-between px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30">
              <Shield className="text-indigo-400" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Sahaayak AI
            </h1>
          </div>
        <div className="hidden md:flex gap-6 items-center">
          <button 
            onClick={() => { setCurrentTab("analyzer"); setSelectedHistoryItem(null); }}
            className={`transition-colors font-medium ${currentTab === "analyzer" ? "text-indigo-400" : "text-slate-400 hover:text-white"}`}>
            Analyzer
          </button>
          <button 
            onClick={() => { setCurrentTab("history"); setSelectedHistoryItem(null); }}
            className={`transition-colors font-medium border-b-2 ${currentTab === "history" ? "text-indigo-400 border-indigo-400" : "text-slate-400 border-transparent hover:text-white"}`}>
            History
          </button>
          <button 
            onClick={() => { setCurrentTab("guides"); setSelectedHistoryItem(null); }}
            className={`transition-colors font-medium ${currentTab === "guides" ? "text-indigo-400" : "text-slate-400 hover:text-white"}`}>
            Safety Guides
          </button>
          <div className="w-px h-6 bg-slate-700" />
          <Settings className="text-slate-400 cursor-pointer hover:rotate-45 transition-transform" size={20} />
        </div>
      </nav>
      </header>

      <main className="w-full max-w-4xl mx-auto relative z-10 text-center md:text-left pt-24">
        <AnimatePresence mode="wait">
          {currentTab === "analyzer" && (
            <motion.div key="analyzer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              {/* Dynamic Header */}
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div 
                    key="heading"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center mb-12"
                  >
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 p-4">
                      Protect Yourself from <span className="gradient-text">Digital Scams</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto text-center">
                      AI-powered analysis to detect fraudulent patterns in real-time.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-full max-w-3xl mx-auto mb-12 p-[1px] rounded-[32px] overflow-hidden relative ${
                      result.status === "Scam" ? "bg-rose-500/30" : 
                      result.status === "Suspicious" ? "bg-amber-500/30" : 
                      "bg-emerald-500/30"
                    }`}
                  >
                    {/* Pulsing Glow Border Wrapper */}
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute inset-0 z-0 ${result.status === "Scam" ? "bg-rose-500" : result.status === "Suspicious" ? "bg-amber-500" : "bg-emerald-500"} opacity-10`}
                    />

                    <div className="bg-slate-950/60 backdrop-blur-4xl p-8 rounded-[31px] relative z-10 border border-white/5 flex flex-col md:flex-row items-center gap-8">
                      {/* Status Indicator */}
                      <div className={`p-4 rounded-2xl ${
                        result.status === "Scam" ? "bg-rose-500/10 text-rose-500" : 
                        result.status === "Suspicious" ? "bg-amber-500/10 text-amber-500" : 
                        "bg-emerald-500/10 text-emerald-500"
                      } border border-current/20 shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                        {result.status === "Scam" ? <AlertTriangle size={32} /> : 
                         result.status === "Suspicious" ? <AlertCircle size={32} /> : 
                         <CheckCircle size={32} />}
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                          <h2 className={`text-2xl font-bold tracking-tight ${
                            result.status === "Scam" ? "text-rose-400" : 
                            result.status === "Suspicious" ? "text-amber-400" : 
                            "text-emerald-400"
                          }`}>
                            {result.status.toUpperCase()} DETECTED
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 border border-white/10 font-mono tracking-widest opacity-60">
                            ID: {Math.random().toString(36).substring(7).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed">
                          {result.simplified}
                        </p>
                      </div>

                      {/* Refractive Certainty Chip */}
                      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[140px]">
                        <span className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">RISK CONFIDENCE</span>
                        <div className={`text-4xl font-extrabold font-mono tracking-tighter ${
                          result.status === "Scam" ? "text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : 
                          result.status === "Suspicious" ? "text-amber-500" : 
                          "text-emerald-500"
                        }`}>
                          {result.scam_score}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group p-8 rounded-[2rem] bg-white/5 backdrop-blur-3xl backdrop-saturate-150 border border-white/10 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  <div className="flex-1 p-6">
                    <textarea 
                      placeholder="Paste message or text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-40 bg-slate-950/30 border border-white/5 rounded-2xl p-6 text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2 text-slate-500 items-center">
                        <label className="cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-1">
                          <FileText size={18} />
                          <span className="text-sm">Upload File</span>
                          <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                        {file && <span className="text-xs text-indigo-400 truncate max-w-[100px]">{file.name}</span>}
                      </div>
                      <button 
                        onClick={analyzeAll}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                      >
                        {loading ? <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                        <span>{loading ? "Analyzing..." : "Analyze Everything"}</span>
                      </button>
                      {(text || result) && (
                        <button 
                          onClick={() => { setText(""); setResult(null); setFile(null); }}
                          className="px-4 py-3 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-400 transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Original Results Layout */}
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 w-full">
                  <div ref={scorecardRef} className="glass-card border-l-8 p-10 shadow-2xl relative overflow-hidden" style={{ borderLeftColor: getStatusColor() }}>
                    {/* Decorative Watermark */}
                    <div className="absolute -right-20 -top-20 opacity-[0.03] rotate-12 pointer-events-none">
                      <Shield size={400} />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="p-4 rounded-3xl bg-black/20 backdrop-blur-md">
                            {getStatusIcon()}
                          </div>
                          <div>
                            <span className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">Analysis Engine Result</span>
                            <h3 className="text-5xl font-black tracking-tight" style={{ color: getStatusColor() }}>{result.status}</h3>
                          </div>
                        </div>
                        <p className="text-xl text-slate-300 font-medium leading-relaxed mt-6 italic bg-white/5 p-4 rounded-2xl border border-white/5 inline-block">
                          <Volume2 size={16} className="inline mr-2 text-indigo-400" />
                          {result.message}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => speakResult(result.summary)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5 backdrop-blur-md group">
                          <Volume2 size={20} className="group-hover:scale-110 transition-transform" /> Listen
                        </button>
                        <button onClick={exportAsImage} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all border border-indigo-400/30 shadow-lg shadow-indigo-500/20 group">
                          <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> Scorecard
                        </button>
                      </div>
                    </div>

                    <div className="mb-10 relative z-10">
                      <div className="flex justify-between items-center mb-4 px-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                          <Zap size={14} className="animate-pulse" /> Heatmap Content Analysis:
                        </h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(result.analyzed_text || text, "Input")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-indigo-400 transition-all border border-white/5"
                            title="Copy text"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="p-8 rounded-[40px] bg-black/40 border border-white/10 shadow-2xl relative group overflow-hidden min-h-[160px]">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-all duration-700">
                           <FileText size={80} className="text-indigo-400" />
                        </div>
                        <RiskyText text={result.analyzed_text} segments={result.risky_segments} />
                      </div>
                    </div>

                    <VisualAnalytics result={result} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 bg-black/20 p-8 rounded-3xl border border-white/5">
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                           <Info size={18} className="text-indigo-400" /> Key Analysis Findings
                        </h4>
                        <ul className="space-y-3">
                          {result.why.map((reason, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                           <Shield size={18} className="text-emerald-400" /> Action Plan
                        </h4>
                        <ul className="space-y-3">
                          {result.action_plan.map((step, i) => (
                            <li key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-emerald-500/20 text-slate-300">
                              <Check size={16} className="text-emerald-500" />
                              {step}
                            </li>
                          ))}
                        </ul>
                        {result.link_intel && (
                          <div className="mt-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <h5 className="font-bold flex items-center gap-2 text-red-500 mb-2">
                               <AlertCircle size={16} /> Link Intel
                            </h5>
                            <p className="text-sm text-slate-400">Risk: <span className="text-red-400">{result.link_intel.risk}</span></p>
                            <p className="text-sm text-slate-400">Age: {result.link_intel.age}</p>
                            <p className="text-xs mt-2 text-slate-300 italic">{result.link_intel.warning}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-bold mb-2">Brief Summary</h4>
                          <p className="text-slate-400 leading-relaxed italic bg-white/5 p-4 rounded-xl text-sm">"{result.summary}"</p>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">Simplified explanation</h4>
                          <p className="text-slate-200 leading-relaxed p-5 rounded-xl border font-medium text-sm"
                             style={{ borderColor: `${getStatusColor()}40`, backgroundColor: `${getStatusColor()}10` }}>
                            {result.simplified}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
              {!selectedHistoryItem ? (
                <div className="max-w-7xl mx-auto px-6 py-12">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-2xl backdrop-saturate-150 border border-white/10">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <History size={20} />
                          </div>
                          <h3 className="text-lg font-bold">Analysis Log</h3>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-3">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                          <h3 className="text-3xl font-black gradient-text">Analysis Archive</h3>
                          <p className="text-slate-500 text-sm font-medium mt-1">{history.length} Record(s) stored locally</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                           <div className="relative flex-1 md:w-64">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input 
                                 type="text" 
                                 placeholder="Search history..." 
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-300"
                              />
                           </div>
                           {history.length > 0 && (
                             <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-all text-sm font-bold border border-red-400/20">
                               <Trash2 size={16} /> <span className="hidden sm:inline">Clear All</span>
                             </button>
                           )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {history.length === 0 ? (
                           <div className="glass-card p-16 text-center text-slate-500 flex flex-col items-center gap-4">
                             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-2">
                                <Clock size={40} />
                             </div>
                             <div>
                               <p className="text-xl font-bold text-slate-300">Your archive is empty</p>
                               <p className="text-slate-500 mt-1 italic">Start by analyzing a message to protect yourself!</p>
                             </div>
                             <button onClick={() => setCurrentTab("analyzer")} className="mt-4 px-8 py-3 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all">Go to Analyzer</button>
                           </div>
                        ) : (
                          history
                            .filter(item => item.displayText?.toLowerCase().includes(searchTerm.toLowerCase()) || item.status.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item) => (
                              <div key={item.id} className="glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-all border border-white/5 cursor-pointer group" onClick={() => setSelectedHistoryItem(item)}>
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                                    {getStatusIcon(item.status)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{item.timestamp}</p>
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status) }}>{item.status}</span>
                                    </div>
                                    <p className="text-lg font-semibold truncate text-slate-200">{item.displayText}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-2.5 rounded-xl bg-white/0 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all border border-transparent hover:border-red-400/20">
                                    <Trash2 size={18} />
                                  </button>
                                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <ChevronRight size={18} />
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSelectedHistoryItem(null)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10">
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white">Analysis Detail</h3>
                      <p className="text-slate-500 text-sm font-medium">Recorded on {selectedHistoryItem.timestamp}</p>
                    </div>
                  </div>
                  <div className="glass-card border-l-8 p-10 shadow-2xl overflow-hidden relative" style={{ borderLeftColor: getStatusColor(selectedHistoryItem.status) }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 rounded-3xl bg-black/20">{getStatusIcon(selectedHistoryItem.status)}</div>
                      <h3 className="text-5xl font-black tracking-tight" style={{ color: getStatusColor(selectedHistoryItem.status) }}>{selectedHistoryItem.status}</h3>
                    </div>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed mb-10 italic">"{selectedHistoryItem.message}"</p>
                    <VisualAnalytics result={selectedHistoryItem} />
                    <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-slate-400 text-sm italic">{selectedHistoryItem.simplified}</ p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentTab === "guides" && (
            <motion.div key="guides" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left w-full">
              {[
                { title: "Phishing Prevention", desc: "Always check the sender email domain. Official banks never ask for OTP via email.", icon: Search },
                { title: "Financial Safety", desc: "Never share your PAN or Aadhaar unless you are on an official government portal.", icon: Shield },
                { title: "Job Scam Awareness", desc: "If they ask for a 'processing fee' for a job, it's 100% a scam.", icon: AlertCircle }
              ].map((g, i) => (
                <div key={i} className="glass-card p-8 group hover:bg-indigo-500/10 transition-all border border-white/5">
                  <g.icon className="text-indigo-400 mb-4" size={32} />
                  <h4 className="text-xl font-bold mb-2">{g.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx="true">{`
        .glass-card { background: rgba(10, 10, 15, 0.7); backdrop-filter: blur(40px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.9); position: relative; z-index: 10; padding: 1.5rem; }
        .gradient-text { background: linear-gradient(90deg, #818cf8, #22d3ee); -webkit-background-clip: text; -webkit-fill-color: transparent; color: #818cf8; text-shadow: 0 0 40px rgba(79, 70, 229, 0.3); }
        .text-shadow-halo { text-shadow: 0 0 20px rgba(0,0,0,0.9), 0 10px 40px rgba(0,0,0,0.6); }
      `}</style>
    </motion.div>
  );
};

export default App;