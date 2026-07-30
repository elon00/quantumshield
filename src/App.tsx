/**
 * QuantumShield PQC - Main Application Entry
 * Full-stack Post-Quantum Cryptography & Hybrid Key Exchange Migration Platform
 */

import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { KeyExchangeSandbox } from './components/KeyExchangeSandbox';
import { ShorSimulator } from './components/ShorSimulator';
import { QuantumRiskMatrix } from './components/QuantumRiskMatrix';
import { BenchmarkSuite } from './components/BenchmarkSuite';
import { AiMigrationAudit } from './components/AiMigrationAudit';
import { EncryptedVault } from './components/EncryptedVault';
import { PaymentGateway } from './components/PaymentGateway';
import { CryptoToolbox } from './components/CryptoToolbox';
import { ResearchCTFArena } from './components/ResearchCTFArena';
import { KeyHuntAutomaton } from './components/KeyHuntAutomaton';
import { AgencyAgentsHub } from './components/AgencyAgentsHub';
import { CryptoExchangeHub } from './components/CryptoExchangeHub';
import { OmniversalMagicBox } from './components/OmniversalMagicBox';
import { QuantumAlgorithmGenerator } from './components/QuantumAlgorithmGenerator';
import { AIGuideDrawer } from './components/AIGuideDrawer';
import { LogEntry } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sandbox');
  const [serverStatus, setServerStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-0',
      timestamp: new Date().toLocaleTimeString(),
      source: 'system',
      message: 'QuantumShield PQC engine initialized. Express server & WebCrypto active.',
      type: 'info'
    }
  ]);

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  const checkServerHealth = async () => {
    setServerStatus('checking');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setServerStatus('connected');
      } else {
        setServerStatus('error');
      }
    } catch (e) {
      setServerStatus('error');
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        onCheckHealth={checkServerHealth}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'sandbox' && (
          <KeyExchangeSandbox onAddLog={addLog} />
        )}

        {activeTab === 'shor-lab' && (
          <ShorSimulator />
        )}

        {activeTab === 'matrix' && (
          <QuantumRiskMatrix />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkSuite />
        )}

        {activeTab === 'ai-audit' && (
          <AiMigrationAudit />
        )}

        {activeTab === 'vault' && (
          <EncryptedVault logs={logs} onClearLogs={() => setLogs([])} />
        )}

        {activeTab === 'payments' && (
          <PaymentGateway onAddLog={addLog} />
        )}

        {activeTab === 'crypto-tool' && (
          <CryptoToolbox />
        )}

        {activeTab === 'ctf-arena' && (
          <ResearchCTFArena />
        )}

        {activeTab === 'keyhunt-automaton' && (
          <KeyHuntAutomaton />
        )}

        {activeTab === 'agency-hub' && (
          <AgencyAgentsHub />
        )}

        {activeTab === 'crypto-exchange' && (
          <CryptoExchangeHub />
        )}

        {activeTab === 'omniversal-magic-box' && (
          <OmniversalMagicBox onNavigateTab={(tab) => setActiveTab(tab as TabType)} />
        )}

        {activeTab === 'quantum-algo-generator' && (
          <QuantumAlgorithmGenerator />
        )}
      </main>

      {/* Floating AI Guide & Voice Drawer */}
      <AIGuideDrawer />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <p>QuantumShield PQC Suite • Compliant with NIST FIPS 203 (ML-KEM) & CNSA 2.0 Specifications</p>
      </footer>
    </div>
  );
}
