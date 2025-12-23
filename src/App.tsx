import React, { useState, useRef, useEffect } from 'react';
import { Users, X, History, Clock } from 'lucide-react';
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
  const [speakingSessions, setSpeakingSessions] = useState<SpeakingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<SpeakingSession | null>(null);
  const [speakingStats, setSpeakingStats] = useState<SpeakingStats[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
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
    };

    setSpeakingSessions(prev => [...prev, completedSession]);
    setCurrentSession(null);

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
    <div className="min-h-screen min-w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Top Right Icons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setShowHistoryModal(true)}
          className="bg-white/30 backdrop-blur-md rounded-full p-3 hover:bg-white/40 transition-all duration-300 hover:scale-110 border border-white/40"
          title="Speaking History"
        >
          <History className="text-white" size={24} />
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white/30 backdrop-blur-md rounded-full p-3 hover:bg-white/40 transition-all duration-300 hover:scale-110 border border-white/40"
          title="Team Members"
        >
          <Users className="text-white" size={24} />
        </button>
      </div>

      {/* Current Speaker Indicator */}
      {currentSession && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowSpeakerModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 animate-pulse"
            title="View Current Speaker"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="font-semibold text-sm">
                {currentSession.member}
              </span>
            </div>
            <div className="text-xs opacity-90">
              {formatDuration(currentTime - currentSession.startTime)}
            </div>
          </button>
        </div>
      )}

      {/* Full Page Spinner */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
        <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
          <h1 className="text-6xl font-bold text-white mb-3 drop-shadow-lg">
            Meeting Speaker Spinner
          </h1>
          <p className="text-white/95 text-xl">Who will speak next? Spin to find out!</p>
        </div>

        <div className="relative mb-10 animate-in zoom-in duration-500 delay-300 w-[560px] h-[560px]">
          {/* Wheel Container with Subtle Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-md p-0.5" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div
              ref={wheelRef}
              className="transition-transform duration-100 ease-out w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
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
                    <Users size={64} className="mx-auto mb-4 opacity-60" />
                    <p className="text-lg font-semibold">Add team members to start</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 animate-bounce"
                  style={{
                    left: `${50 + (Math.random() - 0.5) * 120}%`,
                    top: `${50 + (Math.random() - 0.5) * 120}%`,
                    backgroundColor: colors[i % colors.length],
                    animation: `confetti-fall 3s ease-out ${i * 0.05}s forwards, ping 0.5s ease-out ${i * 0.05}s`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 animate-in slide-in-from-bottom duration-700 delay-500">
          <Controls
            isSpinning={isSpinning}
            availableCount={availableCount}
            spinWheel={spinWheel}
            resetAllMembers={resetAllMembers}
            disabledCount={disabledMembers.length}
            selectedMember={selectedMember}
          />
        </div>
      </div>

      {/* Selected Member Overlay */}
      {selectedMember && !isSpinning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 text-center animate-in zoom-in duration-500 delay-200">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-white text-3xl font-bold mb-2">{selectedMember}</h2>
            <p className="text-white/90 text-lg mb-4">will speak next!</p>

            {/* Speaking Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="text-white" size={16} />
                <span className="text-white/90 text-sm">Speaking Session</span>
              </div>
              {currentSession && currentSession.member === selectedMember ? (
                <div className="text-white text-sm mb-3">
                  <div className="text-green-300 font-semibold">Currently Speaking</div>
                  <div className="text-xs opacity-75">
                    Total speaking time: {formatDuration(getTotalSpeakingTime(selectedMember))}
                  </div>
                </div>
              ) : (
                <div className="text-white/70 text-sm mb-3">
                  <div>Not currently speaking</div>
                  <div className="text-xs">
                    Total speaking time: {formatDuration(getTotalSpeakingTime(selectedMember))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                {currentSession && currentSession.member === selectedMember ? (
                  <button
                    onClick={stopSpeaking}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Stop Speaking
                  </button>
                ) : (
                  <button
                    onClick={() => startSpeaking(selectedMember)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Start Speaking
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="text-purple-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>

              <AddMemberForm newMember={newMember} setNewMember={setNewMember} addMember={addMember} />

              <MembersList
                members={members}
                disabledMembers={disabledMembers}
                removeMember={removeMember}
                speakingStats={speakingStats}
                formatDuration={formatDuration}
              />

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Members who have already spoken will be grayed out and won't be selected again. Use "Reset All Members" to start fresh!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="text-purple-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Speaking History</h2>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Current Session */}
              {currentSession && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-green-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Current Speaking Session</h3>
                  </div>
                  <p className="text-gray-700">
                    <strong>{currentSession.member}</strong> has been speaking for{' '}
                    <span className="text-green-600 font-semibold">
                      {formatDuration(Date.now() - currentSession.startTime)}
                    </span>
                  </p>
                </div>
              )}

              {/* Speaking Statistics */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Speaking Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {speakingStats
                    .sort((a, b) => b.totalDuration - a.totalDuration)
                    .map((stat) => (
                      <div key={stat.member} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">{stat.member}</h4>
                          <span className="text-sm text-purple-600 font-semibold">
                            {formatDuration(stat.totalDuration)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{stat.totalSessions} session{stat.totalSessions !== 1 ? 's' : ''}</div>
                          {stat.lastSpoken && (
                            <div className="text-xs opacity-75">
                              Last spoken: {new Date(stat.lastSpoken).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {speakingStats.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No speaking history yet. Start a meeting to track speaking sessions!</p>
                )}
              </div>

              {/* Recent Sessions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Speaking Sessions</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {speakingSessions
                    .sort((a, b) => (b.endTime || b.startTime) - (a.endTime || a.startTime))
                    .map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <div className="font-semibold text-gray-800">{session.member}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(session.startTime).toLocaleString()}
                              {session.endTime && (
                                <span> - {new Date(session.endTime).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {session.duration ? (
                            <div className="font-semibold text-purple-600">
                              {formatDuration(session.duration)}
                            </div>
                          ) : (
                            <div className="text-sm text-orange-600 font-semibold">In Progress</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {speakingSessions.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No sessions recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Modal */}
      {showSpeakerModal && currentSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="text-green-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Current Speaker</h2>
                </div>
                <button
                  onClick={() => setShowSpeakerModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {currentSession.member.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentSession.member}</h3>
                <p className="text-gray-600">is currently speaking</p>
              </div>

              {/* Real-time Timer */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Speaking Time</div>
                  <div className="text-4xl font-bold text-green-600 font-mono">
                    {formatDuration(currentTime - currentSession.startTime)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Started at {new Date(currentSession.startTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3">Session Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sessions:</span>
                    <span className="font-semibold text-purple-600">
                      {speakingStats.find(s => s.member === currentSession.member)?.totalSessions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Speaking Time:</span>
                    <span className="font-semibold text-purple-600">
                      {formatDuration(getTotalSpeakingTime(currentSession.member))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Session:</span>
                    <span className="font-semibold text-purple-600">
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
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
