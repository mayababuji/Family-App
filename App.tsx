
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Store, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Coins, 
  Sparkles,
  UserCircle,
  Megaphone,
  UserPlus,
  ArrowRight,
  Trash2,
  AlertCircle,
  LogIn,
  User,
  ChevronLeft,
  LogOut,
  MapPin,
  Plane,
  PlusCircle,
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Stars,
  Heart,
  MessageSquare,
  Send
} from 'lucide-react';
import { FamilyMember, Chore, Reward, KingdomReport, TaskStatus, Grievance, TravelTarget, TravelStatus, GrievanceComment } from './types';
import { INITIAL_CHORES, INITIAL_REWARDS, CATEGORY_ICONS, GRIEVANCE_SEVERITY, INITIAL_TRAVEL_TARGETS, TRAVEL_STATUS_STYLES } from './constants';
import { generateKingdomReport } from './geminiService';
import Avatar from './components/Avatar';

const STORAGE_KEY = 'VAIGA_WORLD_DATA_V6';

const CLIMATE_CONFIG = {
  SUNNY: { icon: Sun, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Sunny Vibe' },
  BREEZY: { icon: Wind, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Breezy & Good' },
  OVERCAST: { icon: CloudSun, color: 'text-slate-400', bg: 'bg-slate-400/10', label: 'A Bit Overcast' },
  STORMY: { icon: CloudRain, color: 'text-rose-400', bg: 'bg-rose-400/10', label: 'Stormy Tensions' },
  STARRY: { icon: Stars, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Magical Harmony' },
};

const App: React.FC = () => {
  // Persistence state
  const [kingdomName, setKingdomName] = useState<string>('');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [chores, setChores] = useState<Chore[]>(INITIAL_CHORES);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [travelTargets, setTravelTargets] = useState<TravelTarget[]>(INITIAL_TRAVEL_TARGETS);
  
  // App Session State
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState<'QUESTS' | 'EXPEDITIONS' | 'VAULT' | 'COUNCIL' | 'STATS'>('QUESTS');
  const [report, setReport] = useState<KingdomReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const [newGrievance, setNewGrievance] = useState({ 
    title: '', 
    content: '', 
    severity: 'MILD' as Grievance['severity'],
    againstId: ''
  });

  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    points: 50,
    category: 'OTHER' as Chore['category'],
    assignedToId: ''
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setKingdomName(data.kingdomName || 'Vaiga World');
        setMembers(data.members || []);
        setChores(data.chores || INITIAL_CHORES);
        setGrievances(data.grievances || []);
        setTravelTargets(data.travelTargets || INITIAL_TRAVEL_TARGETS);
      } catch (e) {
        console.error("Failed to load kingdom data", e);
      }
    }
  }, []);

  // Sync currentUser with members list
  useEffect(() => {
    if (currentUser) {
      const updated = members.find(m => m.id === currentUser.id);
      if (updated && updated.points !== currentUser.points) {
        setCurrentUser(updated);
      }
    }
  }, [members, currentUser]);

  // Save to local storage
  useEffect(() => {
    if (kingdomName && members.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        kingdomName,
        members,
        chores,
        grievances,
        travelTargets
      }));
    }
  }, [kingdomName, members, chores, grievances, travelTargets]);

  const fetchReport = useCallback(async () => {
    if (!currentUser || members.length === 0) return;
    setIsAnalyzing(true);
    const data = await generateKingdomReport(chores, members, grievances, travelTargets);
    setReport(data);
    setIsAnalyzing(false);
  }, [chores, members, grievances, travelTargets, currentUser]);

  useEffect(() => {
    if (currentUser) fetchReport();
  }, [currentUser, fetchReport]);

  const handleToggleChore = (choreId: string) => {
    if (!currentUser) return;
    const choreToUpdate = chores.find(c => c.id === choreId);
    if (!choreToUpdate) return;
    const isMarkingDone = choreToUpdate.status !== 'DONE';
    const pointsDelta = isMarkingDone ? choreToUpdate.points : -choreToUpdate.points;
    const recipientId = isMarkingDone ? currentUser.id : (choreToUpdate.assignedToId || currentUser.id);

    setMembers(prev => prev.map(m => m.id === recipientId ? { ...m, points: Math.max(0, m.points + pointsDelta) } : m));
    setChores(prev => prev.map(c => c.id === choreId ? { 
      ...c, status: isMarkingDone ? 'DONE' : 'TODO', assignedToId: isMarkingDone ? currentUser.id : c.assignedToId
    } : c));
  };

  const handleCreateQuest = () => {
    if (!newQuest.title.trim() || !currentUser) return;
    const chore: Chore = {
      id: Math.random().toString(36).substr(2, 9),
      title: newQuest.title,
      description: newQuest.description,
      points: newQuest.points,
      category: newQuest.category,
      assignedToId: newQuest.assignedToId || '',
      status: 'TODO'
    };
    setChores(prev => [chore, ...prev]);
    setIsQuestModalOpen(false);
    setNewQuest({ title: '', description: '', points: 50, category: 'OTHER', assignedToId: '' });
  };

  const updateTravelStatus = (id: string) => {
    const statusCycle: TravelStatus[] = ['NOT_PLANNED', 'PLANNED', 'DONE'];
    setTravelTargets(prev => prev.map(t => t.id === id ? { 
      ...t, status: statusCycle[(statusCycle.indexOf(t.status) + 1) % statusCycle.length] 
    } : t));
  };

  const handleRedeem = (reward: Reward) => {
    if (!currentUser) return;
    if (currentUser.points >= reward.cost) {
      setMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, points: m.points - reward.cost } : m));
      alert(`🎉 Huzzah! You redeemed: ${reward.title}`);
    } else {
      alert(`⚠️ Not enough gold! You need ${reward.cost - currentUser.points} more Star Gold.`);
    }
  };

  const handlePostGrievance = () => {
    if (!currentUser || !newGrievance.title.trim()) return;
    const grievance: Grievance = {
      id: Math.random().toString(36).substr(2, 9),
      fromId: currentUser.id,
      againstId: newGrievance.againstId || undefined,
      title: newGrievance.title,
      content: newGrievance.content,
      severity: newGrievance.severity,
      timestamp: Date.now(),
      isResolved: false,
      comments: []
    };
    setGrievances(prev => [grievance, ...prev]);
    setNewGrievance({ title: '', content: '', severity: 'MILD', againstId: '' });
    setIsGrievanceModalOpen(false);
  };

  const handleAddComment = (grievanceId: string) => {
    if (!currentUser || !commentInputs[grievanceId]?.trim()) return;
    const newComment: GrievanceComment = {
      id: Math.random().toString(36).substr(2, 9),
      fromId: currentUser.id,
      content: commentInputs[grievanceId],
      timestamp: Date.now()
    };
    setGrievances(prev => prev.map(g => g.id === grievanceId ? { 
      ...g, comments: [...g.comments, newComment] 
    } : g));
    setCommentInputs(prev => ({ ...prev, [grievanceId]: '' }));
  };

  const handleResolveGrievance = (id: string) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, isResolved: true } : g));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setReport(null);
  };

  if (!currentUser) {
    return <LandingView kingdomName={kingdomName} members={members} onSignIn={setCurrentUser} onSignUp={(n, m) => { setKingdomName(n); setMembers(m); }} />;
  }

  const ClimateIcon = report?.emotionalClimate ? CLIMATE_CONFIG[report.emotionalClimate].icon : Sun;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500 p-2 rounded-lg shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase italic leading-none">{kingdomName}</h1>
              <span className="text-[8px] font-black text-rose-500 tracking-[0.2em] uppercase">Citizen Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hero Identity</p>
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
            </div>
            <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Vibe Overview Section (Existing) */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-widest text-[10px]">Kingdom Spirit Oracle</h2>
              </div>
              <button onClick={fetchReport} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2 backdrop-blur-sm">
                {isAnalyzing ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Refresh Vibe
              </button>
            </div>
            {report ? (
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-2xl font-bold leading-tight text-slate-100 italic">"{report.summary}"</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest"><Trophy className="w-4 h-4" /> MVP: {report.heroOfTheWeek}</div>
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest"><Heart className="w-4 h-4" /> Insight: {report.socialInsight}</div>
                    </div>
                  </div>
                  {report.royalMediation && (
                    <div className="bg-rose-500/20 border border-rose-400/30 p-4 rounded-2xl flex gap-3 items-start backdrop-blur-sm">
                      <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0 mt-0.5" />
                      <div><p className="text-[10px] uppercase font-black text-rose-300 tracking-wider mb-1">Mediation Advice</p><p className="text-xs text-rose-100 leading-relaxed font-medium">{report.royalMediation}</p></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`p-3 rounded-2xl ${CLIMATE_CONFIG[report.emotionalClimate].bg}`}><ClimateIcon className={`w-6 h-6 ${CLIMATE_CONFIG[report.emotionalClimate].color}`} /></div>
                           <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Vibe</p><p className="font-bold text-white leading-none">{CLIMATE_CONFIG[report.emotionalClimate].label}</p></div>
                        </div>
                        <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p><p className="text-2xl font-black text-white">{report.efficiencyScore}%</p></div>
                     </div>
                     <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-1000" style={{ width: `${report.efficiencyScore}%` }} />
                     </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 italic text-sm text-slate-300 text-center font-medium">"{report.encouragingNudge}"</div>
                </div>
              </div>
            ) : <div className="h-48 flex items-center justify-center"><div className="w-12 h-12 border-4 border-white/10 border-t-rose-500 rounded-full animate-spin mx-auto" /></div>}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl backdrop-blur-sm sticky top-20 z-30 overflow-x-auto no-scrollbar">
          {(['QUESTS', 'EXPEDITIONS', 'VAULT', 'COUNCIL', 'STATS'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <span className="hidden sm:inline">{tab === 'COUNCIL' ? 'CONCERNS' : tab}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'QUESTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Active Family Quests</h3>
                <button onClick={() => setIsQuestModalOpen(true)} className="flex items-center gap-2 bg-white text-rose-600 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all border border-rose-100"><PlusCircle className="w-4 h-4" /> Post Quest</button>
              </div>
              <div className="grid gap-3">
                {chores.map(chore => {
                  const assignedMember = members.find(m => m.id === chore.assignedToId);
                  const isDone = chore.status === 'DONE';
                  return (
                    <div key={chore.id} className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${isDone ? 'border-slate-50 opacity-60' : 'border-transparent'}`}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleToggleChore(chore.id)} className={`transition-colors p-1 ${isDone ? 'text-green-500' : 'text-slate-300 hover:text-rose-500'}`}>{isDone ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}</button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5"><span className="text-lg bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg">{CATEGORY_ICONS[chore.category] || '✨'}</span><h4 className={`font-bold text-slate-800 ${isDone ? 'line-through opacity-50' : ''}`}>{chore.title}</h4></div>
                          <p className="text-xs text-slate-500">{chore.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end font-black text-amber-500"><Coins className="w-4 h-4" /><span>{chore.points}</span></div>
                          <div className="mt-1 flex items-center gap-1 justify-end">{assignedMember ? <Avatar src={assignedMember.avatar} name={assignedMember.name} size="sm" /> : <span className="text-[8px] font-black text-rose-400 uppercase italic">Unclaimed</span>}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'EXPEDITIONS' && (
             <div className="space-y-6">
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Expedition Roadmap</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {travelTargets.map(target => (
                  <button key={target.id} onClick={() => updateTravelStatus(target.id)} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all text-left">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${target.status === 'DONE' ? 'bg-green-100 text-green-600' : target.status === 'PLANNED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}><MapPin className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-800">{target.location}</h4><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${TRAVEL_STATUS_STYLES[target.status].color}`}>{TRAVEL_STATUS_STYLES[target.status].label}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'VAULT' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INITIAL_REWARDS.map(reward => (
                <div key={reward.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="text-5xl mb-4">{reward.icon}</div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{reward.title}</h4>
                  <p className="text-xs text-slate-500 mb-6">{reward.description}</p>
                  <button onClick={() => handleRedeem(reward)} disabled={currentUser.points < reward.cost} className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${currentUser.points >= reward.cost ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>{reward.cost} STAR GOLD</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'COUNCIL' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Investigative Council</h3>
                <button onClick={() => setIsGrievanceModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100"><Megaphone className="w-4 h-4" /> Raise Concern</button>
              </div>
              <div className="grid gap-6">
                {grievances.map(g => {
                  const from = members.find(m => m.id === g.fromId);
                  const against = members.find(m => m.id === g.againstId);
                  return (
                    <div key={g.id} className={`bg-white rounded-3xl p-6 border shadow-sm transition-all ${g.isResolved ? 'opacity-50 border-slate-100' : 'border-slate-200'}`}>
                      <div className="flex items-start gap-4 mb-6">
                        <Avatar src={from?.avatar || ''} name={from?.name || ''} size="md" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${GRIEVANCE_SEVERITY[g.severity].color}`}>{GRIEVANCE_SEVERITY[g.severity].icon} {GRIEVANCE_SEVERITY[g.severity].label}</span>
                            {!g.isResolved && <button onClick={() => handleResolveGrievance(g.id)} className="text-[10px] font-bold text-rose-600 hover:underline">Resolve Case</button>}
                          </div>
                          <h5 className="font-black text-slate-800 text-lg mb-1">{g.title}</h5>
                          {against && <p className="text-[10px] text-rose-500 font-black uppercase mb-2">Inquiry regarding: {against.name}</p>}
                          <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4 py-1">"{g.content}"</p>
                        </div>
                      </div>

                      {/* INVESTIGATIVE COMMENTS SECTION */}
                      <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investigation Discussion</h6>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {g.comments.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-2">No investigative questions yet.</p>
                          ) : (
                            g.comments.map(comment => {
                              const cMember = members.find(m => m.id === comment.fromId);
                              return (
                                <div key={comment.id} className="flex gap-3 items-start bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                  <Avatar src={cMember?.avatar || ''} name={cMember?.name || ''} size="sm" />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <p className="text-[10px] font-bold text-slate-800">{cMember?.name}</p>
                                      <p className="text-[8px] text-slate-400 uppercase font-bold">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {!g.isResolved && (
                          <div className="relative">
                            <input 
                              value={commentInputs[g.id] || ''} 
                              onChange={e => setCommentInputs({ ...commentInputs, [g.id]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleAddComment(g.id)}
                              placeholder="Ask a question or add a detail..." 
                              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-rose-400 pr-12 transition-all shadow-inner" 
                            />
                            <button 
                              onClick={() => handleAddComment(g.id)}
                              className="absolute right-2 top-1.5 p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'STATS' && (
             <div className="space-y-4">
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400 px-2">Hero Power Rankings</h3>
              {members.slice().sort((a,b) => b.points - a.points).map((m, idx) => (
                <div key={m.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 group transition-all hover:border-rose-200">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>{idx === 0 ? '👑' : idx + 1}</div>
                  <Avatar src={m.avatar} name={m.name} size="md" />
                  <div className="flex-1"><h4 className="font-bold text-slate-800 text-lg leading-none mb-1">{m.name}</h4><p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{m.role}</p></div>
                  <div className="text-right"><div className="flex items-center gap-1 justify-end"><Coins className="w-5 h-5 text-amber-500" /><p className="text-3xl font-black text-slate-900 leading-none">{m.points}</p></div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Star Gold</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODALS (Existing logic preserved) */}
      {isQuestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Post a Quest</h2>
            <div className="space-y-4">
              <input value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} placeholder="Quest Title" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-rose-400" />
              <input type="number" value={newQuest.points} onChange={e => setNewQuest({...newQuest, points: parseInt(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-rose-400" />
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsQuestModalOpen(false)} className="py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button onClick={handleCreateQuest} className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]">Create Quest</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGrievanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Raise a Concern</h2>
            <div className="space-y-5">
              <input value={newGrievance.title} onChange={e => setNewGrievance({...newGrievance, title: e.target.value})} placeholder="Incident Title" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm focus:outline-none focus:border-rose-400" />
              <select value={newGrievance.againstId} onChange={e => setNewGrievance({...newGrievance, againstId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm focus:outline-none focus:border-rose-400">
                <option value="">Family Issue</option>
                {members.filter(m => m.id !== currentUser.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <textarea value={newGrievance.content} onChange={e => setNewGrievance({...newGrievance, content: e.target.value})} rows={3} placeholder="Describe the situation..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm focus:outline-none focus:border-rose-400 resize-none" />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsGrievanceModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button onClick={handlePostGrievance} className="flex-[2] py-3 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]">File Concern</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Wallet Status */}
      <div className="fixed bottom-6 left-4 right-4 z-40 pointer-events-none">
        <div className="max-w-md mx-auto bg-slate-900 rounded-full py-3 px-6 shadow-2xl flex items-center justify-between text-white pointer-events-auto border border-white/10 backdrop-blur-md bg-opacity-90">
          <div className="flex items-center gap-2"><UserCircle className="w-5 h-5 text-rose-400" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentUser.name}'s Vault</span></div>
          <div className="flex items-center gap-1 font-black text-amber-400 italic"><Coins className="w-5 h-5" /><span className="text-xl">{currentUser.points}</span></div>
        </div>
      </div>
    </div>
  );
};

const LandingView: React.FC<{ kingdomName: string, members: FamilyMember[], onSignIn: (u: FamilyMember) => void, onSignUp: (n: string, m: FamilyMember[]) => void }> = ({ kingdomName, members, onSignIn, onSignUp }) => {
  const [step, setStep] = useState(members.length > 0 ? 1 : 0);
  const [nKName, setNKName] = useState('Vaiga World');
  const [hList, setHList] = useState([{ name: '', role: 'Head of House' }, { name: '', role: 'Quest Seeker' }]);

  const handleFinish = () => {
    const final = hList.filter(h => h.name.trim()).map(h => ({
      id: Math.random().toString(36).substr(2, 9), name: h.name, role: h.role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.name}`, points: 0
    }));
    onSignUp(nKName, final);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-rose-500 flex items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"><Sparkles className="w-[100vw] h-[100vw] rotate-12" /></div>
      <div className="max-w-md w-full bg-white text-slate-900 rounded-[3rem] p-10 shadow-2xl relative z-10">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-center">Identity Check</h2>
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
              {members.map(m => (
                <button key={m.id} onClick={() => onSignIn(m)} className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-rose-400 hover:bg-rose-50 transition-all text-left group">
                  <Avatar src={m.avatar} name={m.name} size="md" />
                  <div className="flex-1"><p className="font-bold text-slate-800">{m.name}</p><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.role}</p></div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-center">Founder Portal</h1>
            <input value={nKName} onChange={e => setNKName(e.target.value)} placeholder="Kingdom Name" className="w-full border-2 border-slate-100 rounded-2xl p-4 text-lg font-bold focus:border-rose-600 outline-none" />
            <div className="space-y-3">
              {hList.map((h, i) => (
                <div key={i} className="flex gap-2 p-3 bg-slate-50 rounded-2xl"><input value={h.name} onChange={e => { const nl = [...hList]; nl[i].name = e.target.value; setHList(nl); }} placeholder="Member Name" className="flex-1 bg-transparent px-2 py-1 text-sm font-bold outline-none border-b border-slate-200" /></div>
              ))}
            </div>
            <button onClick={() => setHList([...hList, { name: '', role: 'Member' }])} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400">+ Add Member</button>
            <button onClick={handleFinish} className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-100">Found Kingdom</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
