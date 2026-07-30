import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, BarChart3, Sparkles, Lock, ShieldAlert, RefreshCw, Wallet, User as UserIcon, UserCheck, LogIn, LogOut, CreditCard, Binary, Trophy, Grid, Users, Coins, Wand2, Brain } from 'lucide-react';
import { User } from 'firebase/auth';
import { subscribeToAuth, logoutUser } from '../lib/firebase';
import { AuthModal } from './AuthModal';

export type TabType = 'sandbox' | 'shor-lab' | 'matrix' | 'benchmark' | 'ai-audit' | 'vault' | 'payments' | 'crypto-tool' | 'ctf-arena' | 'keyhunt-automaton' | 'agency-hub' | 'crypto-exchange' | 'omniversal-magic-box' | 'quantum-algo-generator';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  serverStatus: 'connected' | 'checking' | 'error';
  onCheckHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  serverStatus,
  onCheckHealth,
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'simulated'>('disconnected');
  const [walletError, setWalletError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletStatus('connected');
          setWalletError(null);
        } else {
          setWalletAddress(null);
          setWalletStatus('disconnected');
        }
      };

      try {
        window.ethereum.on('accountsChanged', handleAccounts);
      } catch (e) {
        console.warn('Ethereum event listener setup failed:', e);
      }

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          try {
            window.ethereum.removeListener('accountsChanged', handleAccounts);
          } catch (e) {
            // ignore cleanup error
          }
        }
      };
    }
  }, []);

  const handleConnectMetaMask = async () => {
    setWalletStatus('connecting');
    setWalletError(null);

    const fallbackAddress = '0x71C7053e198b1a5e1e48C5f54129b69201a089B1';

    try {
      if (typeof window !== 'undefined' && window.ethereum && typeof window.ethereum.request === 'function') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletStatus('connected');
            setWalletError(null);
            return;
          }
        } catch (ethErr: any) {
          console.info('MetaMask eth_requestAccounts info:', ethErr);
          const errMsg = ethErr?.message || 'Connection refused or unavailable';
          setWalletAddress(fallbackAddress);
          setWalletStatus('simulated');
          setWalletError(`MetaMask info: ${errMsg} — switched to Quantum-Safe Test Wallet`);
          return;
        }
      }

      // Fallback if window.ethereum is not found
      setWalletAddress(fallbackAddress);
      setWalletStatus('simulated');
      setWalletError('MetaMask not detected in current frame — using Quantum-Safe Test Wallet');
    } catch (err: any) {
      console.warn('Wallet connection notice:', err);
      setWalletAddress(fallbackAddress);
      setWalletStatus('simulated');
      setWalletError('MetaMask connection notice — switched to Quantum-Safe Test Wallet');
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletStatus('disconnected');
    setWalletError(null);
  };

  const handleQuickLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="bg-[#050505] border-b border-white/10 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Header Branding & Status Grid */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-[-4px]">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tighter uppercase text-white">
                QUANTUMSHIELD
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FF003C] text-white font-bold tracking-widest uppercase">
                PQC_v1.0
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <h2 className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-[#FF003C]">
                HYBRID_EXCHANGER_MIGRATION
              </h2>
              <div className="h-[2px] flex-1 bg-[#FF003C]"></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Account Login / Logout Button */}
            {currentUser && !currentUser.isAnonymous ? (
              <div className="flex items-center gap-1 bg-[#111111] border border-[#00FF41] p-1">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-2 py-1 text-white hover:text-[#00FF41] cursor-pointer text-left transition-colors"
                  title="View Account Details"
                >
                  <UserCheck className="w-4 h-4 text-[#00FF41]" />
                  <div>
                    <span className="block text-[8px] uppercase tracking-widest text-[#00FF41] font-bold">
                      AUTHENTICATED AUDITOR
                    </span>
                    <span className="font-bold text-white text-[11px] max-w-[120px] truncate block">
                      {currentUser.email || currentUser.uid.substring(0, 8)}
                    </span>
                  </div>
                </button>
                <button
                  onClick={handleQuickLogout}
                  className="px-2 py-2.5 bg-[#FF003C] hover:bg-white text-white hover:text-black font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                  title="Log Out of Web Page"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">LOG OUT</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#00FF41] text-black font-black uppercase tracking-wider transition-all cursor-pointer border border-white"
                title="Log In or Sign Up"
              >
                <LogIn className="w-4 h-4" />
                <span>USER LOG IN</span>
              </button>
            )}

            {/* MetaMask / Web3 Wallet Button */}
            {walletStatus === 'disconnected' ? (
              <button
                onClick={handleConnectMetaMask}
                className="flex items-center gap-2 px-3 py-2 bg-[#FF003C] hover:bg-white text-white hover:text-black font-black uppercase tracking-wider transition-all cursor-pointer border border-[#FF003C]"
                title="Connect Web3 MetaMask Wallet"
              >
                <Wallet className="w-4 h-4" />
                <span>CONNECT METAMASK</span>
              </button>
            ) : (
              <button
                onClick={handleDisconnectWallet}
                className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-[#00FF41] text-white hover:border-[#FF003C] transition-all cursor-pointer text-left"
                title="Click to disconnect wallet"
              >
                <span className="w-2.5 h-2.5 bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#00FF41] font-bold">
                    {walletStatus === 'connected' ? 'METAMASK CONNECTED' : 'PQC WEB3 WALLET'}
                  </span>
                  <span className="font-bold text-white text-[11px]">
                    {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : ''}
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={onCheckHealth}
              className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-white/20 hover:border-[#FF003C] text-white transition-all text-left"
              title="Click to verify Express backend & WebCrypto PQC engine"
            >
              <span className={`w-2.5 h-2.5 ${
                serverStatus === 'connected' ? 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]' :
                serverStatus === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-[#FF003C]'
              }`} />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-white/50">SYSTEM STATUS</span>
                <span className="font-bold text-[#00FF41]">
                  {serverStatus === 'connected' ? 'CONNECTED // PQC_API_ACTIVE' : serverStatus === 'checking' ? 'CHECKING...' : 'OFFLINE // FAILOVER'}
                </span>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-white/60 ml-1" />
            </button>

            <div className="hidden lg:flex flex-col px-3 py-2 bg-[#111111] border border-white/20">
              <span className="text-[9px] uppercase tracking-widest text-white/50">COMPLIANCE ENGINE</span>
              <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
                NIST FIPS 203 ML-KEM
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Error / Notice Bar */}
        {walletError && (
          <div className="mb-4 p-2.5 bg-[#FF003C]/10 border border-[#FF003C] text-white flex items-center justify-between text-xs font-mono">
            <span className="text-[#FF003C] font-bold uppercase tracking-wider">{walletError}</span>
            <button
              onClick={() => setWalletError(null)}
              className="text-white/60 hover:text-white px-2 uppercase text-[10px] cursor-pointer"
            >
              [DISMISS]
            </button>
          </div>
        )}

        {/* Navigation Tabs - Bold Brutalist Buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-1 pt-2 no-scrollbar text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>01 // KEY EXCHANGE SANDBOX</span>
          </button>

          <button
            onClick={() => setActiveTab('shor-lab')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'shor-lab'
                ? 'bg-[#FF003C] text-white border-[#FF003C] shadow-[0_0_15px_rgba(255,0,60,0.4)]'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#00FF41]" />
            <span>02 // SHOR'S QUANTUM LAB</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-[#FF003C] text-white border-[#FF003C] shadow-[0_0_15px_rgba(255,0,60,0.4)]'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>03 // SHOR'S THREAT MATRIX</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>04 // BENCHMARKS</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-audit')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'ai-audit'
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FF003C]" />
            <span>05 // AI MIGRATION AUDIT</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>06 // ENCRYPTED VAULT</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-[#00FF41] text-black border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#00FF41]" />
            <span>07 // PAYMENT GATEWAY</span>
          </button>

          <button
            onClick={() => setActiveTab('crypto-tool')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'crypto-tool'
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>08 // CRYPTO TRANSFORMER (SHA-224)</span>
          </button>

          <button
            onClick={() => setActiveTab('ctf-arena')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'ctf-arena'
                ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>09 // AGENTIC RESEARCH & CTF ARENA</span>
          </button>

          <button
            onClick={() => setActiveTab('keyhunt-automaton')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'keyhunt-automaton'
                ? 'bg-[#00FF41] text-black border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4 text-[#00FF41]" />
            <span>10 // KEYHUNT & CONWAY AUTOMATON</span>
          </button>

          <button
            onClick={() => setActiveTab('agency-hub')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'agency-hub'
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>11 // THE AGENCY (230+ SPECIALISTS)</span>
          </button>

          <button
            onClick={() => setActiveTab('crypto-exchange')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'crypto-exchange'
                ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>12 // CRYPTO EXCHANGES & RESEARCH</span>
          </button>

          <button
            onClick={() => setActiveTab('omniversal-magic-box')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'omniversal-magic-box'
                ? 'bg-[#00FF41] text-black border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4 text-[#00FF41]" />
            <span>13 // OMNIVERSAL MAGIC BOX & FULFILLMENT</span>
          </button>

          <button
            onClick={() => setActiveTab('quantum-algo-generator')}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-all whitespace-nowrap ${
              activeTab === 'quantum-algo-generator'
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] font-black'
                : 'bg-[#111111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>14 // AGENTIC QUANTUM ALGORITHM GENERATOR</span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />
    </header>
  );
};

