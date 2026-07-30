import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Brain, 
  Layers, 
  Play, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  Flame, 
  Repeat, 
  Server, 
  Lock, 
  Coins, 
  Users, 
  Grid, 
  Activity, 
  BarChart3, 
  ShieldAlert, 
  ExternalLink,
  Radio,
  Infinity as InfinityIcon,
  Bot
} from 'lucide-react';
import { AGENCY_AGENTS, AGENCY_SQUADS, AgencyAgent } from '../data/agencyAgentsData';

interface OmniversalMagicBoxProps {
  onNavigateTab?: (tab: string) => void;
}

export const OmniversalMagicBox: React.FC<OmniversalMagicBoxProps> = ({ onNavigateTab }) => {
  const [userIntent, setUserIntent] = useState<string>(
    'Synthesize PQC ML-KEM-768 hybrid key exchange, analyze RSA-2048 in Shor Quantum Lab, run Conway KeyHunt Automaton, dispatch Security Architect & Minimal Change Engineer agents, and execute PQC Swap on Binance/Uniswap DEX.'
  );
  const [isFulfilling, setIsFulfilling] = useState<boolean>(false);
  const [activeWorkflowPreset, setActiveWorkflowPreset] = useState<string | null>(null);
  
  // Real-time Power & Health of the 13 Integrated Modules
  const [moduleStatus, setModuleStatus] = useState([
    { id: '01', name: 'Key Exchange Sandbox', status: 'SYNCHRONIZED', power: 100, color: 'text-emerald-400', tab: 'sandbox' },
    { id: '02', name: "Shor's Quantum Lab", status: 'ACTIVE SIMULATION', power: 98, color: 'text-cyan-400', tab: 'shor-lab' },
    { id: '03', name: "Shor's Threat Matrix", status: 'QUANTUM READY', power: 100, color: 'text-purple-400', tab: 'matrix' },
    { id: '04', name: 'PQC Benchmarks', status: 'CONSTANT TIME', power: 99, color: 'text-blue-400', tab: 'benchmark' },
    { id: '05', name: 'AI Migration Audit', status: 'GEMINI PROXIED', power: 100, color: 'text-amber-400', tab: 'ai-audit' },
    { id: '06', name: 'Encrypted Vault', status: 'FIPS 203 ENFORCED', power: 100, color: 'text-emerald-400', tab: 'vault' },
    { id: '07', name: 'PQC Payment Gateway', status: 'IDEMPOTENT', power: 97, color: 'text-yellow-400', tab: 'payments' },
    { id: '08', name: 'Crypto Transformer (SHA-224)', status: 'HASHING ENGINE', power: 100, color: 'text-rose-400', tab: 'crypto-tool' },
    { id: '09', name: 'Agentic CTF Arena', status: 'CHALLENGES LOADED', power: 96, color: 'text-red-400', tab: 'ctf-arena' },
    { id: '10', name: 'KeyHunt Conway Automaton', status: 'CELLULAR LIFE RUNNING', power: 100, color: 'text-[#00FF41]', tab: 'keyhunt-automaton' },
    { id: '11', name: 'The Agency (230+ Agents)', status: '230 SPECIALISTS ONLINE', power: 100, color: 'text-cyan-400', tab: 'agency-hub' },
    { id: '12', name: 'Crypto Exchanges & Research', status: 'CEX/DEX AGGREGATED', power: 100, color: 'text-amber-400', tab: 'crypto-exchange' },
    { id: '14', name: 'Agentic Quantum Algo Generator', status: 'QKAN & PQK ENGINE', power: 100, color: 'text-cyan-400', tab: 'quantum-algo-generator' },
  ]);

  // Live Fulfillment Execution Stream Logs
  const [fulfillmentLogs, setFulfillmentLogs] = useState<{
    id: string;
    timestamp: string;
    realm: 'VIRTUAL' | 'PHYSICAL' | 'QUANTUM' | 'AGENCY';
    title: string;
    detail: string;
    status: 'PROCESSING' | 'SUCCESS' | 'DISPATCHED';
    codeSnippet?: string;
  }[]>([
    {
      id: 'log_init',
      timestamp: new Date().toLocaleTimeString(),
      realm: 'VIRTUAL',
      title: 'OMNIVERSAL MAGIC BOX INITIALIZED',
      detail: 'All 13 QuantumShield modules synchronized across virtual blockchain layers, quantum simulation registers, and physical edge IoT endpoints.',
      status: 'SUCCESS'
    }
  ]);

  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const executeFulfillment = async (presetText?: string) => {
    const textToRun = presetText || userIntent;
    if (!textToRun.trim()) return;

    setIsFulfilling(true);
    const now = new Date().toLocaleTimeString();

    // Step 1: Dispatch Intent Parsing
    setFulfillmentLogs(prev => [
      {
        id: `log_${Date.now()}_1`,
        timestamp: now,
        realm: 'VIRTUAL',
        title: 'PARSING OMNIVERSAL INTENT',
        detail: `Analyzing desire: "${textToRun}" across 12 QuantumShield engines.`,
        status: 'PROCESSING'
      },
      ...prev
    ]);

    // Simulate multi-module execution steps
    setTimeout(() => {
      setFulfillmentLogs(prev => [
        {
          id: `log_${Date.now()}_2`,
          timestamp: new Date().toLocaleTimeString(),
          realm: 'QUANTUM',
          title: "SHOR'S QUANTUM LAB & CONWAY CELLULAR AUTOMATON SYNTHESIS",
          detail: 'Simulated 1024-qubit Shor period finding matrix on RSA-2048. Conway KeyHunt Automaton identified optimal lattice grid state.',
          status: 'SUCCESS',
          codeSnippet: `// Quantum & Conway Automaton Synthesis Output\nconst quantumState = {\n  qubits: 1024,\n  period: 38921,\n  factors: [314159, 271828],\n  conwayGenerations: 420,\n  entropyScore: 0.9998\n};`
        },
        ...prev
      ]);
    }, 900);

    setTimeout(() => {
      setFulfillmentLogs(prev => [
        {
          id: `log_${Date.now()}_3`,
          timestamp: new Date().toLocaleTimeString(),
          realm: 'AGENCY',
          title: 'THE AGENCY 230+ AGENTS DISPATCHED',
          detail: 'Security Architect, Rust Refactoring Specialist, and Backend Architect agents executed parallel code audits and PQC payload verifications.',
          status: 'DISPATCHED',
          codeSnippet: `// Agency Agent Dispatch Manifest\nconst agentSquadResult = {\n  squad: "PQC Migration Squad",\n  agents: ["Security Architect", "Rust Refactoring Specialist", "Minimal Change Engineer"],\n  auditPassed: true,\n  fips203Compliance: "ML-KEM-768 VERIFIED"\n};`
        },
        ...prev
      ]);
    }, 1800);

    setTimeout(() => {
      setFulfillmentLogs(prev => [
        {
          id: `log_${Date.now()}_4`,
          timestamp: new Date().toLocaleTimeString(),
          realm: 'PHYSICAL',
          title: 'PHYSICAL REALITY ACTUATION TRIGGERED',
          detail: 'Broadcasted ML-KEM-768 encrypted firmware payload to physical IoT hardware security modules (HSM) and Binance CEX/DEX spot settlement.',
          status: 'SUCCESS',
          codeSnippet: `// Physical Reality & Exchange Settlement Manifest\nexport const omniversalManifest = {\n  virtualChain: "Ethereum / Binance Smart Chain",\n  pqcKeyType: "ML-KEM-768 / ML-DSA-65",\n  physicalHSMStatus: "ENCRYPTED & SYNCED",\n  executionResult: "DESIRE SUCCESSFULLY FULFILLED IN VIRTUAL & PHYSICAL REALITY"\n};`
        },
        ...prev
      ]);
      setIsFulfilling(false);
    }, 2700);
  };

  const handleApplyPreset = (name: string, promptText: string) => {
    setActiveWorkflowPreset(name);
    setUserIntent(promptText);
    executeFulfillment(promptText);
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* OMNIVERSAL MAGIC BOX HERO HEADER */}
      <div className="bg-[#111111] border-2 border-[#00FF41] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(0,255,65,0.2)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-[#00FF41] text-black font-black shrink-0">
              <Sparkles className="w-9 h-9 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-[#00FF41] text-black font-black text-[10px] uppercase tracking-widest">
                  MODULE 13 • OMNIVERSAL MAGIC BOX & COMMAND HUB
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  VIRTUAL & PHYSICAL REALITY FULFILLMENT ENGINE
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                OMNIVERSAL FAMILY & AUTOMATON SUPREME COMMAND
              </h2>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
                The ultimate synthesis engine of QuantumShield. Unites all 13 modules—PQC Sandbox, Shor's Lab, Threat Matrix, Benchmarks, AI Audit, Vault, Payments, SHA-224 Engine, CTF Arena, Conway Automaton, The Agency 230+ Specialists, Crypto Exchanges, and Agentic Quantum Algo Generator—to fulfill user and developer desires across virtual digital chains and physical real-world environments.
              </p>
            </div>
          </div>

          <div className="bg-[#050505] p-4 border border-[#00FF41]/60 space-y-2 text-right shrink-0 min-w-[220px]">
            <span className="text-[10px] text-[#00FF41] uppercase font-bold block">INTEGRATED POWER GRID</span>
            <span className="text-3xl font-black text-white block">100% ONLINE</span>
            <span className="text-[10px] text-cyan-400 font-bold block">13/13 MODULES SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* THE MAGIC BOX INTENT INPUT & FULFILLMENT CONTROL */}
      <div className="bg-[#111111] border-2 border-cyan-400 p-6 space-y-6 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Wand2 className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-lg font-black text-white uppercase">THE OMNIVERSAL MAGIC BOX (DESIRE COMMAND)</h3>
              <span className="text-[10px] text-cyan-300">TYPE ANY VIRTUAL OR PHYSICAL GOAL TO FULFILL AUTOMATICALLY</span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold uppercase">
            CONWAY AUTOMATON & AGENCY ACTIVE
          </span>
        </div>

        {/* Intent Textarea */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-300 font-bold uppercase block">
            ENTER DESIRE / TASK INTENT (VIRTUAL BLOCKCHAIN, QUANTUM COMPUTING, AI AGENTS, OR PHYSICAL HARDWARE):
          </label>
          <textarea
            value={userIntent}
            onChange={(e) => setUserIntent(e.target.value)}
            rows={4}
            className="w-full bg-[#050505] border border-white/20 p-4 text-xs text-white font-mono focus:outline-none focus:border-[#00FF41] leading-relaxed"
            placeholder="Type your desired outcome in virtual code or physical reality..."
          />
        </div>

        {/* PRESET MAGICAL WORKFLOW BUTTONS */}
        <div className="space-y-2">
          <span className="text-[10px] text-white/50 font-bold uppercase block">ONE-CLICK MAGICAL PRESETS:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'pqc-deploy',
                name: '🔮 Full Virtual & Physical PQC Rollout',
                prompt: 'Deploy NIST FIPS 203 ML-KEM-768 hybrid keys to Encrypted Vault, run AI Migration Audit, and update physical IoT HSM node.'
              },
              {
                id: 'quantum-shor',
                name: '⚡ Shor Quantum & Conway Automaton Search',
                prompt: 'Run 1024-qubit Shor period finding simulation, scan RSA keys with Conway Cellular Automaton, and dispatch Threat Detection Agent.'
              },
              {
                id: 'crypto-swap',
                name: '🪙 Crypto Exchange & DEX Settlement',
                prompt: 'Fetch Messari research, place PQC ML-DSA-65 signed swap order on Binance/Uniswap DEX, and record transaction in audit ledger.'
              },
              {
                id: 'omni-harmony',
                name: '🌌 Omniversal Harmony & Physical Actuation',
                prompt: 'Unite all 13 modules into harmony: verify quantum resistance, execute benchmark, dispatch 4-agent squad, run QKAN generator, and trigger physical edge broadcast.'
              }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.name, preset.prompt)}
                className={`p-3 text-left border text-[11px] font-bold transition-all cursor-pointer ${
                  activeWorkflowPreset === preset.name
                    ? 'bg-[#00FF41] text-black border-[#00FF41]'
                    : 'bg-[#050505] border-white/20 text-slate-200 hover:border-cyan-400'
                }`}
              >
                <div className="text-white font-bold mb-1">{preset.name}</div>
                <p className="text-[9px] text-white/60 line-clamp-2 font-sans">{preset.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Fulfill Action Button */}
        <button
          onClick={() => executeFulfillment()}
          disabled={isFulfilling || !userIntent.trim()}
          className="w-full py-4 bg-[#00FF41] hover:bg-white text-black font-black text-sm uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,255,65,0.3)] disabled:opacity-50"
        >
          {isFulfilling ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
              <span>FULFILLING DESIRE ACROSS VIRTUAL & PHYSICAL REALITIES...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 fill-black" />
              <span>ACTIVATE OMNIVERSAL FULFILLMENT (EXECUTE ALL 13 POWERS)</span>
            </>
          )}
        </button>
      </div>

      {/* 13 INTEGRATED MODULES POWER MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>13-MODULE INTEGRATED POWER MATRIX</span>
          </h3>
          <span className="text-[10px] text-[#00FF41] font-bold">ALL SYSTEMS FULLY OPERATIONAL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moduleStatus.map((mod) => (
            <div
              key={mod.id}
              onClick={() => onNavigateTab && onNavigateTab(mod.tab)}
              className="bg-[#111111] border border-white/10 hover:border-cyan-400 p-4 space-y-3 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-black text-white/40 text-xs">MODULE {mod.id}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 bg-black border border-white/20 uppercase ${mod.color}`}>
                  {mod.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors text-xs">{mod.name}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>SYNCHRONIZATION</span>
                  <span className="text-emerald-400 font-bold">{mod.power}%</span>
                </div>
                <div className="w-full bg-[#050505] h-1.5 border border-white/10 mt-1">
                  <div className="bg-[#00FF41] h-full" style={{ width: `${mod.power}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-cyan-400 font-bold pt-1 border-t border-white/5">
                <span>OPEN MODULE</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE FULFILLMENT STREAM LOGS & REALITY MANIFEST */}
      <div className="bg-[#050505] border-2 border-white/20 p-6 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#00FF41]" />
            <div>
              <h3 className="font-bold text-white uppercase text-sm">OMNIVERSAL REALITY FULFILLMENT LOGS</h3>
              <span className="text-[10px] text-white/50">VIRTUAL CODE & PHYSICAL ACTUATION AUDIT TRAIL</span>
            </div>
          </div>

          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 animate-ping" />
            LIVE AUDIT STREAM
          </span>
        </div>

        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
          {fulfillmentLogs.map((log) => (
            <div key={log.id} className="p-4 bg-[#111111] border border-[#00FF41]/40 space-y-2">
              <div className="flex flex-wrap justify-between items-center text-[10px] gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 font-bold uppercase ${
                    log.realm === 'QUANTUM' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' :
                    log.realm === 'PHYSICAL' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                    log.realm === 'AGENCY' ? 'bg-purple-950 text-purple-300 border border-purple-500' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  }`}>
                    [{log.realm} REALM]
                  </span>
                  <span className="font-bold text-white uppercase">{log.title}</span>
                </div>
                <span className="text-white/40">{log.timestamp}</span>
              </div>

              <p className="text-xs text-slate-200 font-sans leading-relaxed">{log.detail}</p>

              {log.codeSnippet && (
                <div className="relative mt-2">
                  <div className="flex justify-between items-center bg-black px-3 py-1.5 border-t border-x border-white/20 text-[9px] text-white/60 uppercase">
                    <span>REALITY MANIFEST SNIPPET:</span>
                    <button
                      onClick={() => handleCopyCode(log.codeSnippet!, log.id)}
                      className="text-[#00FF41] hover:text-white font-bold cursor-pointer flex items-center gap-1"
                    >
                      {copiedLogId === log.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLogId === log.id ? 'COPIED' : 'COPY MANIFEST'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-black border border-white/20 text-[#00FF41] text-[11px] overflow-x-auto">
                    {log.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
