import React, { useState, useRef, useEffect } from 'react';
import { Users, X, History, Clock, BarChart3 } from 'lucide-react';
import Wheel from './components/Wheel';
import AddMemberForm from './components/AddMemberForm';
import MembersList from './components/MembersList';
import Controls from './components/Controls';

export interface SpeakingSession {
   id: string;
   member: string;
   startTime: number;
   endTime?: number;
   duration?: number; // in milliseconds
   notes?: string;
}

export interface SpeakingStats {
  member: string;
  totalSessions: number;
  totalDuration: number; // in milliseconds
  lastSpoken?: number;
}

type NullableString = string | null;

export default function App(): React.ReactElement {
  const [members, setMembers] = useState<string[]>([]);
  const [disabledMembers, setDisabledMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<NullableString>(null);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSpeakerModal, setShowSpeakerModal] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [speakingSessions, setSpeakingSessions] = useState<SpeakingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<SpeakingSession | null>(null);
  const [speakingStats, setSpeakingStats] = useState<SpeakingStats[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const membersResult = await window.localStorage.getItem('meeting-spinner-members');
        const disabledResult = await window.localStorage.getItem('meeting-spinner-disabled');

        if (membersResult) {
          setMembers(JSON.parse(membersResult) as string[]);
        }
        if (disabledResult) {
          setDisabledMembers(JSON.parse(disabledResult) as string[]);
        }
      } catch (error) {
        console.log('No saved data found');
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save members to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem('meeting-spinner-members', JSON.stringify(members));
    }
  }, [members, isLoaded]);

  // Save disabled members to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem('meeting-spinner-disabled', JSON.stringify(disabledMembers));
    }
  }, [disabledMembers, isLoaded]);

  // Load speaking data from storage on mount
  useEffect(() => {
    const loadSpeakingData = async () => {
      try {
        const sessionsResult = await window.localStorage.getItem('meeting-spinner-sessions');
        const statsResult = await window.localStorage.getItem('meeting-spinner-stats');

        if (sessionsResult) {
          setSpeakingSessions(JSON.parse(sessionsResult) as SpeakingSession[]);
        }
        if (statsResult) {
          setSpeakingStats(JSON.parse(statsResult) as SpeakingStats[]);
        }
      } catch (error) {
        console.log('No speaking data found');
      }
    };
    loadSpeakingData();
  }, []);

  // Save speaking sessions to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem('meeting-spinner-sessions', JSON.stringify(speakingSessions));
    }
  }, [speakingSessions, isLoaded]);

  // Save speaking stats to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem('meeting-spinner-stats', JSON.stringify(speakingStats));
    }
  }, [speakingStats, isLoaded]);

  // Real-time timer update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSession) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100); // Update every 100ms for smooth display
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#EF476F', '#06A77D'
  ];

  const startSpeaking = (member: string) => {
    if (currentSession) {
      stopSpeaking(); // Stop current session if one exists
    }

    const newSession: SpeakingSession = {
      id: `session-${Date.now()}`,
      member,
      startTime: Date.now(),
    };

    setCurrentSession(newSession);
  };

  const stopSpeaking = () => {
    if (!currentSession) return;

    const endTime = Date.now();
    const duration = endTime - currentSession.startTime;

    const completedSession: SpeakingSession = {
      ...currentSession,
      endTime,
      duration,
      notes: sessionNotes.trim() || undefined,
    };

    setSpeakingSessions(prev => [...prev, completedSession]);
    setCurrentSession(null);
    setSessionNotes('');

    // Update stats
    setSpeakingStats(prev => {
      const existingStat = prev.find(stat => stat.member === currentSession.member);
      if (existingStat) {
        return prev.map(stat =>
          stat.member === currentSession.member
            ? {
                ...stat,
                totalSessions: stat.totalSessions + 1,
                totalDuration: stat.totalDuration + duration,
                lastSpoken: endTime,
              }
            : stat
        );
      } else {
        return [...prev, {
          member: currentSession.member,
          totalSessions: 1,
          totalDuration: duration,
          lastSpoken: endTime,
        }];
      }
    });
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getTotalSpeakingTime = (member: string): number => {
    const stat = speakingStats.find(s => s.member === member);
    let totalTime = stat?.totalDuration || 0;

    // Add current session time if this member is currently speaking
    if (currentSession && currentSession.member === member) {
      totalTime += currentTime - currentSession.startTime;
    }

    return totalTime;
  };

  const addMember = () => {
    const trimmed = newMember.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers(prev => [...prev, trimmed]);
      setNewMember('');
    }
  };

  const bulkImportMembers = (names: string[]) => {
    const newMembers = names.filter(name => name && !members.includes(name));
    if (newMembers.length > 0) {
      setMembers(prev => [...prev, ...newMembers]);
    }
  };

  const removeMember = (index: number) => {
    const memberToRemove = members[index];
    setMembers(prev => prev.filter((_, i) => i !== index));
    setDisabledMembers(prev => prev.filter(m => m !== memberToRemove));
    if (selectedMember === memberToRemove) {
      setSelectedMember(null);
    }
  };

  const resetAllMembers = () => {
    setDisabledMembers([]);
    setSelectedMember(null);
    // Stop any current speaking session when resetting
    if (currentSession) {
      stopSpeaking();
    }
    // Reset all speaking history and stats
    setSpeakingSessions([]);
    setSpeakingStats([]);
    // Clear from localStorage
    window.localStorage.removeItem('meeting-spinner-sessions');
    window.localStorage.removeItem('meeting-spinner-stats');
  };

  const spinWheel = () => {
    const availableMembers = members.filter(m => !disabledMembers.includes(m));
    if (isSpinning || availableMembers.length === 0) return;

    setIsSpinning(true);
    setSelectedMember(null);
    setShowConfetti(false);

    const spinDuration = 4000;
    const minSpins = 5;

    const randomIndex = Math.floor(Math.random() * availableMembers.length);
    const selectedName = availableMembers[randomIndex];
    const actualIndex = members.indexOf(selectedName);

    const degreesPerSegment = 360 / members.length;
    const extraRotation = 360 * minSpins + (360 - (actualIndex * degreesPerSegment + degreesPerSegment / 2));
    const newRotation = currentRotation + extraRotation;

    setCurrentRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedMember(selectedName);
      setDisabledMembers(prev => [...prev, selectedName]);
      startSpeaking(selectedName); // Start speaking session when member is selected
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, spinDuration);
  };

  // Wheel SVG rendering is delegated to the Wheel component

  const availableCount = members.filter(m => !disabledMembers.includes(m)).length;

  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Meeting Speaker</h1>
              <p className="text-purple-200 text-sm">Fair & Fun Speaker Selection</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20 shadow-lg"
              title="Meeting Analytics"
            >
              <BarChart3 className="text-white" size={24} />
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20 shadow-lg"
              title="Speaking History"
            >
              <History className="text-white" size={24} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20 shadow-lg"
              title="Team Members"
            >
              <Users className="text-white" size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Current Speaker Indicator */}
      {currentSession && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowSpeakerModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 animate-pulse border border-white/20"
            title="View Current Speaker"
          >
            <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="font-bold text-sm">
                {currentSession.member}
              </span>
            </div>
            <div className="text-sm opacity-90 font-mono">
              {formatDuration(currentTime - currentSession.startTime)}
            </div>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-2 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-4 animate-in slide-in-from-top duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Who Speaks Next?
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-tight">
            Spin the wheel to randomly select the next speaker and keep your meetings fair and engaging!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-3 mb-4 animate-in fade-in duration-500 delay-200">
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 text-center">
            <div className="text-white/60 text-xs font-medium">TEAM</div>
            <div className="text-white text-lg font-bold">{members.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 text-center">
            <div className="text-white/60 text-xs font-medium">AVAILABLE</div>
            <div className="text-green-400 text-lg font-bold">{availableCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 text-center">
            <div className="text-white/60 text-xs font-medium">SPOKEN</div>
            <div className="text-orange-400 text-lg font-bold">{disabledMembers.length}</div>
          </div>
        </div>

        {/* Wheel Section */}
        <div className="relative mb-2 animate-in zoom-in duration-500 delay-300">
          <div className="relative w-[450px] h-[450px] md:w-[500px] md:h-[500px]">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse"></div>

            {/* Wheel Container */}
            <div className="absolute inset-2 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full shadow-2xl p-1 border border-white/10">
              <div
                ref={wheelRef}
                className="transition-transform duration-100 ease-out w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-800 via-purple-800 to-slate-800 shadow-inner"
                style={{
                  transform: `rotate(${currentRotation}deg)`,
                  transitionDuration: isSpinning ? '4000ms' : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                }}
              >
                {members.length > 0 ? (
                  <Wheel members={members} disabledMembers={disabledMembers} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Users size={48} className="mx-auto mb-3 opacity-60" />
                      <p className="text-base font-semibold">Add team members to start</p>
                      <p className="text-xs opacity-75 mt-1">Click the users icon above</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-red-500 z-10"></div>
          </div>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-bounce"
                  style={{
                    left: `${50 + (Math.random() - 0.5) * 80}%`,
                    top: `${50 + (Math.random() - 0.5) * 80}%`,
                    backgroundColor: colors[i % colors.length],
                    animation: `confetti-fall 2s ease-out ${i * 0.03}s forwards, ping 0.3s ease-out ${i * 0.03}s`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="animate-in slide-in-from-bottom duration-700 delay-500">
          <Controls
            isSpinning={isSpinning}
            availableCount={availableCount}
            spinWheel={spinWheel}
            resetAllMembers={resetAllMembers}
            disabledCount={disabledMembers.length}
            selectedMember={selectedMember}
          />
        </div>
      </main>

      {/* Selected Member Overlay */}
      {selectedMember && !isSpinning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full mx-4 text-center animate-in zoom-in duration-500 delay-200 border border-white/20 p-6">
            {/* Celebration */}
            <div className="text-6xl mb-4 animate-bounce">🎉</div>

            {/* Member Info */}
            <div className="mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/30">
                <span className="text-white text-3xl font-bold">
                  {selectedMember.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-white text-3xl font-bold mb-2">{selectedMember}</h2>
              <p className="text-white/90 text-lg">will speak next!</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60">Sessions</div>
                  <div className="text-white font-bold text-lg">
                    {speakingStats.find(s => s.member === selectedMember)?.totalSessions || 0}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Total Time</div>
                  <div className="text-white font-bold text-lg">
                    {formatDuration(getTotalSpeakingTime(selectedMember))}
                  </div>
                </div>
              </div>
            </div>

            {/* Speaking Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="text-white/80" size={16} />
                <span className="text-white/80 text-sm">Speaking Session</span>
              </div>

              {currentSession && currentSession.member === selectedMember ? (
                <div className="text-green-300 font-semibold text-sm mb-3">
                  Currently Speaking - {formatDuration(currentTime - currentSession.startTime)}
                </div>
              ) : (
                <div className="text-white/70 text-sm mb-3">Ready to start speaking</div>
              )}

              {/* Notes Input */}
              <div className="mb-3">
                <label className="block text-white/80 text-xs font-medium mb-1">
                  Session Notes (optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes about this speaking session..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none backdrop-blur-sm transition-all resize-none text-sm"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-center">
                {currentSession && currentSession.member === selectedMember ? (
                  <button
                    onClick={stopSpeaking}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Stop Speaking
                  </button>
                ) : (
                  <button
                    onClick={() => startSpeaking(selectedMember)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Start Speaking
                  </button>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="text-purple-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Team Members</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>

              <AddMemberForm newMember={newMember} setNewMember={setNewMember} addMember={addMember} onBulkImport={bulkImportMembers} />

              <MembersList
                members={members}
                disabledMembers={disabledMembers}
                removeMember={removeMember}
                speakingStats={speakingStats}
                formatDuration={formatDuration}
              />

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-400/30">
                <p className="text-sm text-blue-200">
                  <strong className="text-blue-300">💡 Tip:</strong> Members who have already spoken will be grayed out and won't be selected again. Use "Reset All Members" to start fresh!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="text-purple-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Speaking History</h2>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Session */}
              {currentSession && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-green-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-green-400 animate-pulse" size={20} />
                    <h3 className="text-lg font-bold text-green-300">Current Speaking Session</h3>
                  </div>
                  <p className="text-white">
                    <strong className="text-xl text-green-300">{currentSession.member}</strong> has been speaking for{' '}
                    <span className="text-2xl font-bold text-green-400">
                      {formatDuration(Date.now() - currentSession.startTime)}
                    </span>
                  </p>
                </div>
              )}

              {/* Speaking Statistics */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Speaking Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {speakingStats
                    .sort((a, b) => b.totalDuration - a.totalDuration)
                    .map((stat) => (
                      <div key={stat.member} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-white">{stat.member}</h4>
                          <span className="text-lg font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded-lg">
                            {formatDuration(stat.totalDuration)}
                          </span>
                        </div>
                        <div className="text-sm text-white/70">
                          <div className="font-semibold">{stat.totalSessions} session{stat.totalSessions !== 1 ? 's' : ''}</div>
                          {stat.lastSpoken && (
                            <div className="text-xs text-white/50 mt-1">
                              Last spoken: {new Date(stat.lastSpoken).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {speakingStats.length === 0 && (
                  <p className="text-white/50 text-center py-8">No speaking history yet. Start a meeting to track speaking sessions!</p>
                )}
              </div>

              {/* Recent Sessions */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Recent Speaking Sessions</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {speakingSessions
                    .sort((a, b) => (b.endTime || b.startTime) - (a.endTime || a.startTime))
                    .map((session) => (
                      <div key={session.id} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${session.duration ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></div>
                            <div>
                              <div className="font-bold text-lg text-white">{session.member}</div>
                              <div className="text-sm text-white/60">
                                {new Date(session.startTime).toLocaleString()}
                                {session.endTime && (
                                  <span> - {new Date(session.endTime).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {session.duration ? (
                              <div className="font-bold text-xl text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg">
                                {formatDuration(session.duration)}
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg animate-pulse">In Progress</div>
                            )}
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
                            <div className="text-xs text-blue-300 font-medium mb-1">Session Notes:</div>
                            <div className="text-sm text-white/90">{session.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                {speakingSessions.length === 0 && (
                  <p className="text-white/50 text-center py-8">No sessions recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-purple-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Meeting Analytics</h2>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Meeting Metrics */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Current Meeting Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                    <div className="text-2xl font-bold text-blue-400">{members.length}</div>
                    <div className="text-sm text-white/60">Team Members</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                    <div className="text-2xl font-bold text-green-400">{availableCount}</div>
                    <div className="text-sm text-white/60">Available</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                    <div className="text-2xl font-bold text-purple-400">{speakingSessions.length}</div>
                    <div className="text-sm text-white/60">Sessions</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {formatDuration(speakingSessions.reduce((total, session) => total + (session.duration || 0), 0))}
                    </div>
                    <div className="text-sm text-white/60">Total Time</div>
                  </div>
                </div>
              </div>

              {/* Participation Analysis */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Participation Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Speaking Distribution */}
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <h4 className="font-semibold text-white mb-3">Speaking Distribution</h4>
                    <div className="space-y-2">
                      {speakingStats
                        .sort((a, b) => b.totalDuration - a.totalDuration)
                        .slice(0, 5)
                        .map((stat, index) => (
                          <div key={stat.member} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-white/40'}`}></div>
                              <span className="text-white text-sm">{stat.member}</span>
                            </div>
                            <div className="text-white/80 text-sm">{formatDuration(stat.totalDuration)}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Meeting Efficiency */}
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <h4 className="font-semibold text-white mb-3">Meeting Efficiency</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Avg Session Length</span>
                        <span className="text-white font-semibold">
                          {speakingSessions.length > 0
                            ? formatDuration(Math.floor(speakingSessions.reduce((total, session) => total + (session.duration || 0), 0) / speakingSessions.length))
                            : '0s'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Speakers per Member</span>
                        <span className="text-white font-semibold">
                          {members.length > 0 ? (speakingSessions.length / members.length).toFixed(1) : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Participation Rate</span>
                        <span className="text-green-400 font-semibold">
                          {members.length > 0 ? Math.round((speakingStats.filter(s => s.totalSessions > 0).length / members.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights & Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const totalSessions = speakingSessions.length;
                    const totalTime = speakingSessions.reduce((total, session) => total + (session.duration || 0), 0);
                    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
                    const participationRate = members.length > 0 ? (speakingStats.filter(s => s.totalSessions > 0).length / members.length) * 100 : 0;

                    const insights = [];

                    if (participationRate < 70) {
                      insights.push({
                        type: 'warning',
                        title: 'Low Participation',
                        message: 'Consider encouraging quieter team members to speak more.',
                        color: 'yellow'
                      });
                    }

                    if (avgSessionTime > 300000) { // 5 minutes
                      insights.push({
                        type: 'info',
                        title: 'Long Sessions',
                        message: 'Consider shorter speaking times for more balanced discussions.',
                        color: 'blue'
                      });
                    }

                    if (totalSessions > members.length * 2) {
                      insights.push({
                        type: 'success',
                        title: 'High Engagement',
                        message: 'Great participation! Everyone is contributing actively.',
                        color: 'green'
                      });
                    }

                    if (insights.length === 0) {
                      insights.push({
                        type: 'neutral',
                        title: 'Balanced Meeting',
                        message: 'Your meeting participation looks well-balanced.',
                        color: 'gray'
                      });
                    }

                    return insights.slice(0, 2).map((insight, index) => (
                      <div key={index} className={`p-4 rounded-xl border backdrop-blur-sm ${
                        insight.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-400/30' :
                        insight.color === 'blue' ? 'bg-blue-500/10 border-blue-400/30' :
                        insight.color === 'green' ? 'bg-green-500/10 border-green-400/30' :
                        'bg-white/5 border-white/10'
                      }`}>
                        <h4 className={`font-semibold mb-1 ${
                          insight.color === 'yellow' ? 'text-yellow-300' :
                          insight.color === 'blue' ? 'text-blue-300' :
                          insight.color === 'green' ? 'text-green-300' :
                          'text-white'
                        }`}>
                          {insight.title}
                        </h4>
                        <p className="text-white/80 text-sm">{insight.message}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Modal */}
      {showSpeakerModal && currentSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-500 delay-200 border border-white/20 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="text-green-400" size={24} />
                <h2 className="text-xl font-bold text-white">Current Speaker</h2>
              </div>
              <button
                onClick={() => setShowSpeakerModal(false)}
                className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Speaker Info */}
            <div className="mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/30">
                <span className="text-white text-2xl font-bold">
                  {currentSession.member.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{currentSession.member}</h3>
              <p className="text-green-300 text-sm">is currently speaking</p>
            </div>

            {/* Real-time Timer */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
              <div className="text-center">
                <div className="text-white/60 text-xs mb-1">Speaking Time</div>
                <div className="text-3xl font-bold text-green-400 font-mono">
                  {formatDuration(currentTime - currentSession.startTime)}
                </div>
                <div className="text-white/50 text-xs mt-2">
                  Started at {new Date(currentSession.startTime).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Session Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
              <h4 className="font-semibold text-white mb-3 text-sm">Session Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Sessions:</span>
                  <span className="font-semibold text-white">
                    {speakingStats.find(s => s.member === currentSession.member)?.totalSessions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Speaking Time:</span>
                  <span className="font-semibold text-white">
                    {formatDuration(getTotalSpeakingTime(currentSession.member))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Average Session:</span>
                  <span className="font-semibold text-white">
                    {(() => {
                      const stats = speakingStats.find(s => s.member === currentSession.member);
                      if (!stats || stats.totalSessions === 0) return '0s';
                      return formatDuration(Math.floor(stats.totalDuration / stats.totalSessions));
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={stopSpeaking}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md"
              >
                Stop Speaking
              </button>
              <button
                onClick={() => setShowSpeakerModal(false)}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

