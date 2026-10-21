import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Search, Shield, Zap, ArrowRight, BarChart3, Layers, Video,
  FileDown, Cpu, CheckCircle2, Filter, Tag, Users, Activity, RefreshCw,
  Server, Sparkles, Building2, Briefcase, FileSpreadsheet, Workflow,
  Target, Mail, Phone, Calendar, History, Sliders, CheckSquare, Edit3,
  PlusCircle, RotateCcw, Share2, Eye, ChevronRight, ShieldCheck, Check, UploadCloud, XCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Footer from '../layouts/Footer';
import heroVideo from '../assets/PDE 01 .mp4';
import heroBgImage from '../assets/offfice.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAuthRedirect = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const platformPillars = [
    {
      id: 'ingestion',
      label: 'Multi-User Central Ingestion',
      title: 'Consolidated Uploads & High-Speed File Scan Dedup',
      icon: UploadCloud,
      badge: 'MULTI-USER HUB',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      description: 'When multiple reps work across different territories, isolated Excel spreadsheets create chaos. PDE allows multiple operators to upload their files into one consolidated central database with rapid scanning.',
      points: [
        'Supports simultaneous file uploads from 2 or more users into a single centralized DB',
        'Interactive column mapping UI template engine for Excel, CSV & Google Sheets',
        'Rapid Full-File Scan: When any sheet is uploaded, the entire file is rapidly scanned in memory',
        'Internal & External Dedup: Automatically removes duplicate records within the uploaded file itself AND filters out entries already existing in the DB',
        'Ensures 100% unique data resides in the central repository without manual cleanup'
      ]
    },
    {
      id: 'export_regen',
      label: 'History & Filter Regeneration',
      title: 'Activity Telemetry & One-Click Filter Query Regeneration',
      icon: History,
      badge: 'AUDIT TRAIL',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      description: 'Maintain complete data governance. PDE records comprehensive historical logs of every file import and data export activity, tracking operator identity, exact dates, and specific filter parameters.',
      points: [
        'Complete upload and download telemetry tracking exact operator IDs (uploadedBy)',
        'Records exact filter configurations applied whenever any user exports a dataset',
        'One-Click Regeneration: If another user wants data based on the same filter, they can regenerate it directly from history',
        'Custom Column Export: Select specific checkboxes and ignore unwanted data columns during sheet download',
        'Download clean CSV or Excel sheets tailored specifically for outbound campaigns'
      ]
    },
    {
      id: 'crud_ops',
      label: 'Manual Records & Editing',
      title: 'Granular Data Updation & Manual Record Creation',
      icon: Edit3,
      badge: 'DATA INTEGRITY',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      description: 'Never let missing data slow down sales floors. If an imported spreadsheet lacked an email or phone number, reps can update individual company records or manually insert new accounts immediately.',
      points: [
        'Granular record editing allows quick fixes for missing prospect contact fields',
        'Manual Company Creation: Easily insert custom B2B accounts directly into the central DB',
        'Enforces clean data formatting while remaining flexible for daily rep updates',
        'All manual edits and creations are timestamped with operator audit traces',
        'Guarantees database completeness before assigning lists to sales reps'
      ]
    },
    {
      id: 'target_lists',
      label: 'Target Lists & Lead Status',
      title: 'Assigned Target Lists & Live Follow-Up Telemetry',
      icon: Target,
      badge: 'CAMPAIGN ENGINE',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      description: 'After filtering consolidated data, Admins have two options: standard sheet export OR creating a dedicated Target List assigned directly to Sales Users or Cold Mail Users for structured outreach.',
      points: [
        'Admin creates curated Target Lists assigned directly to specific Sales or Cold Mail reps',
        'Assigned reps access exclusively their allocated contact lists without touching core DB files',
        'Reps log real-time Lead Status (Assigned, Contacted, Meeting Scheduled, Proposal Sent, Negotiation, Won, Lost)',
        'Mandatory Next Follow-up timestamp scheduling tracked live on the Admin executive dashboard',
        'Global Status Color-Coding: Every disposition status has a unique global color across the entire project for instant identification'
      ]
    }
  ];

  return (
    <div className="w-full font-sans text-slate-900 select-none animate-fade-in bg-white flex flex-col min-h-screen">

      {/* ======================================= */}
      {/* SECTION 1: EDGE-TO-EDGE FULL SCREEN HERO */}
      {/* ======================================= */}
      <section className="relative w-full overflow-hidden bg-white text-slate-900 border-b border-slate-200/80 min-h-screen flex flex-col justify-between select-none">

        {/* offfice.jpg Background Image - Corporate Meeting Room */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <img
            src={heroBgImage}
            alt="Corporate Office Hub Background"
            className="w-full h-full object-cover object-center opacity-95 sm:opacity-100"
          />
          {/* Frosted white gradient fading from the right side towards left */}
          <div className="absolute inset-0 bg-white/85 sm:bg-transparent" />
          <div className="absolute inset-y-0 right-0 w-full lg:w-4/5 bg-gradient-to-l from-white via-white/80 to-transparent sm:from-white/70 sm:via-white/45 sm:to-transparent" />
        </div>

        <div className="w-full max-w-[1920px] mx-auto pl-4 sm:pl-10 lg:pl-12 pr-3 sm:pr-5 lg:pr-8 xl:pr-10 relative z-10 flex-1 flex flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-16">
          <div className="space-y-5 sm:space-y-6 max-w-3xl lg:max-w-4xl ml-auto mr-0 text-left sm:text-right flex flex-col items-start sm:items-end my-auto py-6 sm:py-8">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-slate-900 leading-[1.12] sm:leading-[1.08]">
              The Single Source of Truth for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Outbound Prospecting.
              </span>
            </h1>

            <p className="text-slate-700 text-base sm:text-xl leading-relaxed font-medium max-w-2xl">
              Stop managing scattered Excel spreadsheets and chaotic Drive folders. PDE consolidates multi-user company datasets into one unified database, rapidly scans files to eliminate duplicates automatically, and powers assigned Target List campaigns.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-start sm:justify-end gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={handleAuthRedirect}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm sm:text-base rounded-2xl shadow-md shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto"
              >
                <span>{isAuthenticated ? 'Open Centralized Dashboard' : 'Get Started with PDE'}</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              </button>
              <a
                href="#necessity"
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm sm:text-base rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Explore Working</span>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 shrink-0" />
              </a>
            </div>
          </div>

          {/* True Sleek Glassmorphism Telemetry Highlights Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-200/80 text-xs text-left">
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">Multi-User</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">Central DB Consolidation</div>
            </div>
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">Rapid Scan</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">Full File Scan Dedup</div>
            </div>
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">100% Unique</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">Zero Duplicate Records</div>
            </div>
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">Regen Engine</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">1-Click Filter History</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT INNER CONTAINER FOR SECTIONS 2-6 */}
      <div className="w-full max-w-7xl mx-auto space-y-16 sm:space-y-24 pt-12 sm:pt-24 pb-4 sm:pb-8 px-4 sm:px-14 lg:px-20 flex-1">

        {/* ======================================= */}
        {/* SECTION 2: WHY GROWING TEAMS NEED PDE */}
        {/* ======================================= */}
        <section id="necessity" className="space-y-16 sm:space-y-20 scroll-mt-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-4 px-4 relative z-10">
            <h2 className="text-4xl sm:text-5xl font-medium text-slate-900 tracking-tight">
              Solving Scattered <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Spreadsheet Chaos</span>
            </h2>
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed font-light">
              When teams collect prospect records across different countries and industries in isolated files, managing overlapping data becomes impossible. Here is the PDE advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            {/* Problem Card */}
            <div className="group relative bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 transition-opacity group-hover:opacity-70"></div>
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="p-4 bg-rose-50/50 rounded-2xl text-rose-400 border border-rose-100/50 shadow-sm shrink-0">
                    <FileSpreadsheet className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal text-slate-900 tracking-tight">The Problem</h3>
                    <p className="text-rose-400 font-normal text-sm mt-0.5">Multiple Disconnected Files</p>
                  </div>
                </div>
                <ul className="space-y-6 text-slate-600 leading-relaxed">
                  {[
                    { title: "Overwhelming File Management", desc: "Arranging company info across dozens of separate Excel and Google Sheets makes data retrieval extremely slow." },
                    { title: "Awkward Double-Pitching", desc: "Without rapid central deduplication, multiple reps contact the exact same prospect companies repeatedly." },
                    { title: "Zero Activity Tracking", desc: "No history of who imported or exported files, making accountability and audit logs nonexistent." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 group/item cursor-default">
                      <div className="mt-1 bg-rose-50 p-1 rounded-full group-hover/item:bg-rose-100 transition-colors">
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      </div>
                      <div>
                        <strong className="font-normal text-slate-900 block mb-0.5">{item.title}</strong>
                        <span className="text-sm text-slate-500 font-light">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Solution Card */}
            <div className="group relative bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 transition-opacity group-hover:opacity-70"></div>
              <div className="absolute inset-0 border-2 border-indigo-600/5 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="p-4 bg-indigo-50/50 rounded-2xl text-indigo-400 border border-indigo-100/50 shadow-sm shrink-0">
                    <Database className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal text-slate-900 tracking-tight">The Solution</h3>
                    <p className="text-indigo-400 font-normal text-sm mt-0.5">Centralized DB Consolidation</p>
                  </div>
                </div>
                <ul className="space-y-6 text-slate-600 leading-relaxed">
                  {[
                    { title: "Multi-User Consolidation", desc: "2 or more users upload their isolated files into one unified database, synchronizing all team datasets." },
                    { title: "Rapid Full-File Scan Dedup", desc: "Fast scanning identifies duplicates within uploaded files and strips out records already residing in the DB." },
                    { title: "Multi-Param Filtering & Export", desc: "Filter consolidated records by country, city, industry & turnover, with custom column selection." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 group/item cursor-default">
                      <div className="mt-1 bg-indigo-50 p-1 rounded-full group-hover/item:bg-indigo-100 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                      </div>
                      <div>
                        <strong className="font-normal text-slate-900 block mb-0.5">{item.title}</strong>
                        <span className="text-sm text-slate-500 font-light">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16 w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden">

          {/* Ambient Blue-Green Glow */}
          <div className="absolute inset-y-0 right-0 w-[40rem] bg-teal-300/10 blur-[200px] pointer-events-none transform translate-x-1/4 z-0" />

          <div className="flex flex-col lg:flex-row items-center w-full relative z-10">

            <div className="w-full lg:w-[70%] order-2 lg:order-1 mt-8 lg:mt-0 lg:pr-8">
              <div className="w-full aspect-[21/9] sm:aspect-video bg-slate-950 border-y lg:border-y-0 lg:border-r border-slate-200 overflow-hidden relative lg:rounded-r-[2.5rem] shadow-none lg:shadow-[20px_0_40px_-15px_rgba(39,39,42,0.7)]">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src={heroVideo} type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="w-full lg:w-[30%] order-1 lg:order-2 px-6 sm:px-10 lg:px-12 space-y-4 text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-700 font-semibold block">Live Telemetry Walkthrough</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-slate-900 tracking-tight leading-tight">
                See Rapid File Ingestion in Action
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-normal">
                Watch how multiple prospect files are imported, rapidly scanned against existing database records, and sliced for outbound teams.
              </p>
            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 4: PLATFORM PILLARS (OPEN GRID) */}
        {/* ======================================= */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-800 font-semibold block">CORE PLATFORM ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-5xl font-normal text-slate-900 tracking-tight">
              Comprehensive Platform Scope
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-normal">
              Explore the complete technical depth of Prospect Data Engine, rendered openly without hidden tabs.
            </p>
          </div>

          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 sm:gap-6 w-screen relative left-1/2 right-1/2 -mx-[50vw] px-4 sm:px-8 pt-4 pb-4">
            {platformPillars.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="group relative rounded-2xl flex flex-col min-w-[280px] lg:min-w-0 snap-center overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-200/60 p-[1.5px]"
                >
                  {/* Animated spinning gradient border on hover */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_270deg,#10b981_300deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                  />

                  {/* Content Container (Acts as the white card mask) */}
                  <div className="relative z-10 bg-white rounded-[14px] p-6 sm:p-8 flex flex-col space-y-5 flex-1 w-full h-full">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className={`p-2.5 rounded-xl border ${pillar.iconBg}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">{pillar.label}</span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-800 leading-snug">
                      {pillar.title}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed font-normal flex-1">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 5: TARGET LIST CAMPAIGN & LEAD LIFECYCLE */}
        {/* ======================================= */}
        <section className="bg-white pt-12 sm:pt-20 pb-4 sm:pb-6 w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden">

          {/* Ambient zinc glow coming from the absolute top-left corner of the section */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-200/15 blur-[120px] pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2" />

          <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 space-y-10 relative z-10">
            <div className="pb-6">
              <span className="text-xs font-mono font-semibold text-zinc-800 uppercase tracking-wider block mb-2">CAMPAIGN EXECUTION WORKFLOW</span>
              <h2 className="text-4xl sm:text-5xl font-normal text-slate-900 tracking-tight">Target List &amp; Lead Updation Lifecycle</h2>
            </div>

            <p className="text-base text-slate-600 leading-relaxed max-w-4xl font-normal">
              After data is filtered, Admins have two options: export data directly OR generate a curated Target List. When assigned to reps, outbound prospecting follows a strict accountable workflow:
            </p>

            <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-4 sm:gap-6 w-screen relative left-1/2 right-1/2 -mx-[50vw] px-4 sm:px-8 pb-8 pt-2">
              <div className="group relative rounded-2xl flex flex-col min-w-[280px] lg:min-w-0 snap-center overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-200/60 p-[1.5px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_270deg,#10b981_300deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                <div className="relative z-10 bg-white rounded-[14px] p-6 flex flex-col w-full h-full overflow-hidden">
                  <span className="absolute -bottom-4 right-0 text-[100px] leading-none font-black text-slate-100/80 select-none z-0">01</span>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-base">Filter Central DB</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">Admin filters consolidated DB by country, city, industry &amp; turnover brackets.</p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl flex flex-col min-w-[280px] lg:min-w-0 snap-center overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-200/60 p-[1.5px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_270deg,#10b981_300deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                <div className="relative z-10 bg-white rounded-[14px] p-6 flex flex-col w-full h-full overflow-hidden">
                  <span className="absolute -bottom-4 right-0 text-[100px] leading-none font-black text-slate-100/80 select-none z-0">02</span>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-base">Create Target List</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">Admin chooses to export OR generate a dedicated Target List assigned to reps.</p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl flex flex-col min-w-[280px] lg:min-w-0 snap-center overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-200/60 p-[1.5px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_270deg,#10b981_300deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                <div className="relative z-10 bg-white rounded-[14px] p-6 flex flex-col w-full h-full overflow-hidden">
                  <span className="absolute -bottom-4 right-0 text-[100px] leading-none font-black text-slate-100/80 select-none z-0">03</span>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-base">Rep Notification</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">Assigned rep (Sales or Cold Mail) receives email alert &amp; opens exclusive lead view.</p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl flex flex-col min-w-[280px] lg:min-w-0 snap-center overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-200/60 p-[1.5px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_270deg,#10b981_300deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                <div className="relative z-10 bg-white rounded-[14px] p-6 flex flex-col w-full h-full overflow-hidden">
                  <span className="absolute -bottom-4 right-0 text-[100px] leading-none font-black text-slate-100/80 select-none z-0">04</span>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-base">Update Status</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">Rep conducts outreach, logging exact Lead Status (Assigned, Contacted, Meeting Scheduled, Proposal Sent, Negotiation, Won, Lost).</p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl flex flex-col min-w-[280px] lg:min-w-0 snap-center overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-200/60 p-[1.5px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_270deg,#10b981_300deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                <div className="relative z-10 bg-white rounded-[14px] p-6 flex flex-col w-full h-full overflow-hidden">
                  <span className="absolute -bottom-4 right-0 text-[100px] leading-none font-black text-slate-100/80 select-none z-0">05</span>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-base">Set Next Follow-up</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">Rep schedules mandatory Next Follow-up timestamp tracked live by Admin dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-zinc-800 text-blue-200 rounded-xl shadow-sm">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">Global Status Color-Coding &amp; Operator Audit</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-normal">Every prospect record in PDE is tagged with one of the 7 standardized global disposition statuses below. These colors remain consistent across tables, target lists, and campaign reports for instant executive clarity.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-200/80 text-xs font-semibold text-slate-700">
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Assigned</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
                  <span>Contacted</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span>Meeting Scheduled</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>Proposal Sent</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Negotiation</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Won</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span>Lost</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 6: EXECUTIVE DARK TECH HUB CTA */}
        {/* ======================================= */}
        <section className="max-w-5xl mx-auto pb-4 px-4 sm:px-0 !mt-8 sm:!mt-12">
          <div className="p-10 sm:p-16 text-center space-y-8 relative">
            <div className="space-y-4 max-w-2xl mx-auto relative z-10">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-800 font-semibold block">FUTURE GROWTH &amp; SCALE</span>
              <h2 className="text-4xl sm:text-5xl font-normal text-zinc-900 tracking-tight">
                Ready to Centralize Your Prospecting Hub?
              </h2>
              <p className="text-slate-600 text-base sm:text-lg font-normal">
                Empower multi-user floors with rapid file deduplication, one-click filter query regeneration, and accountable target list campaigns.
              </p>
            </div>

            <div className="pt-4 relative z-10 space-y-6">
              <button
                onClick={handleAuthRedirect}
                className="group relative overflow-hidden w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-zinc-700/90 backdrop-blur-md border border-zinc-500/30 text-white font-semibold text-sm sm:text-lg rounded-2xl shadow-[0_0_25px_rgba(82,82,91,0.3)] transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center gap-3 cursor-pointer"
              >
                <style>{`
                  @keyframes left-to-right-shine {
                    0% { transform: translateX(-150%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                  }
                  .animate-ltr-shine {
                    animation: left-to-right-shine 2.5s infinite linear;
                  }
                `}</style>

                {/* Left-to-right animated shining background */}
                <div className="absolute top-0 left-0 bottom-0 w-2/3 bg-gradient-to-r from-transparent via-zinc-300/20 to-transparent animate-ltr-shine pointer-events-none z-0" />

                <span className="relative z-10">{isAuthenticated ? 'Open Workspace Dashboard' : 'Enter PDE Workspace Now'}</span>
                <ArrowRight className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 text-zinc-300 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
