import React, { useState } from 'react';

const Footer = () => {
  const [showMailPicker, setShowMailPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const recipient = 'support@gnosysdigital.com';

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(recipient).catch(() => { });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const subject = 'Inquiry - Prospect Data Engine';

  const mailOptions = [
    {
      name: 'Gmail (Web)',
      desc: 'Open compose window directly in Google Mail',
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}`,
      badge: 'bg-rose-500 text-white',
      letter: 'G',
    },
    {
      name: 'Yahoo Mail (Web)',
      desc: 'Open compose window in Yahoo Mail',
      url: `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}`,
      badge: 'bg-purple-600 text-white',
      letter: 'Y',
    },
    {
      name: 'Outlook Web (Live / O365)',
      desc: 'Open compose window in Microsoft Outlook Web',
      url: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}`,
      badge: 'bg-blue-600 text-white',
      letter: 'O',
    },
  ];

  const handleOpenProvider = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowMailPicker(false);
  };

  return (
    <footer className="w-full bg-gradient-to-bl from-zinc-900 via-zinc-800 to-zinc-950 text-white border-t border-blue-200/20 pt-16 pb-10 mt-auto select-none relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-14 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-zinc-700">

          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <img src="/img.png" alt="PDE Logo" className="h-8 w-auto object-contain brightness-110" />
              </div>
              <span className="font-normal  text-white text-2xl tracking-tight">Prospect Data Engine</span>
            </div>
            <p className="text-white text-sm leading-relaxed max-w-sm font-light">
              Enterprise-grade centralized database consolidation, rapid file deduplication scan, and accountable B2B campaign management node.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                <span className="text-xs text-white font-medium tracking-wide">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Platform
            </h4>
            <ul className="space-y-4 text-sm text-slate-300 font-medium">
              {[
                'Centralized DB Consolidation',
                'Rapid File Dedup Engine',
                'Regenerate History Filter',
                'Target Campaign Lifecycle'
              ].map((item) => (
                <li key={item} className="group flex items-center gap-2 cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-white group-hover:scale-110 transition-all duration-300"></span>
                  <span className="text-slate-300 group-hover:text-white transition-colors duration-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Compliance & Security
            </h4>
            <ul className="space-y-4 text-sm text-slate-300 font-medium">
              {[
                'Enterprise RBAC Access Control',
                'Zero Duplicate Record Guarantee',
                'High-Throughput Stream Processing'
              ].map((item) => (
                <li key={item} className="group flex items-center gap-2 cursor-default">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-slate-300 group-hover:text-white transition-colors duration-300">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 mt-4 border-t border-zinc-700">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Direct Support</h4>
              <button
                onClick={() => setShowMailPicker(true)}
                type="button"
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer w-full shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              >
                <div className="p-2 rounded-lg bg-white/10 text-white group-hover:scale-110 group-hover:bg-white/20 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className="text-xs text-white">Contact Us</div>
                  <div className="text-sm font-medium text-white truncate">{recipient}</div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white">
          <div className="flex items-center gap-1.5">
            <span className="text-white">&copy; {new Date().getFullYear()} Dwarkadhish NeuralStack Limited.</span>
            <span className="text-white">All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-white">Precision Engineered by</span>
            <div className="w-px h-3 bg-white/30"></div>
            <div className="flex items-center gap-2 group cursor-pointer">
              <img src="/img.png" alt="Gnosys Digital" className="h-4 w-auto object-contain brightness-90 group-hover:brightness-110 transition-all" />
              <span className="font-semibold text-white tracking-wide transition-colors">Gnosys Digital</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Mail Provider Picker Modal */}
      {showMailPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left space-y-6 text-white transform animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 text-white rounded-xl border border-white/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Choose Mail Service</h3>
                </div>
                <p className="text-sm text-white pl-1 flex items-center gap-2 flex-wrap">
                  Send email to
                  <span
                    onClick={handleCopyEmail}
                    title="Click to copy email address"
                    className="text-white font-mono font-medium bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/20 cursor-pointer inline-flex items-center gap-1.5 transition-all group"
                  >
                    <span>{recipient}</span>
                    {copied ? (
                      <span className="flex items-center gap-0.5 text-white">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowMailPicker(false)}
                className="text-white hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {mailOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleOpenProvider(opt.url)}
                  className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all duration-200 group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg transition-transform group-hover:scale-105 ${opt.badge}`}>
                      {opt.letter}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white transition-colors">{opt.name}</span>
                      <span className="text-xs text-white mt-0.5">{opt.desc}</span>
                    </div>
                  </div>
                  <div className="text-white transition-colors">
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowMailPicker(false)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
