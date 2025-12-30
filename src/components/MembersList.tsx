import React from 'react';
import { Trash2, Clock } from 'lucide-react';

export interface SpeakingStats {
  member: string;
  totalSessions: number;
  totalDuration: number; // in milliseconds
  lastSpoken?: number;
}

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#EF476F', '#06A77D'
];

type Props = {
    members: string[];
    disabledMembers: string[];
    removeMember: (index: number) => void;
    speakingStats: SpeakingStats[];
    formatDuration: (milliseconds: number) => string;
};

const MembersList: React.FC<Props> = ({ members, disabledMembers, removeMember, speakingStats, formatDuration }) => {
    return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
                <p className="text-white/50 text-center py-8">No team members yet. Add some to get started!</p>
            ) : (
                members.map((member, index) => {
                    const isDisabled = disabledMembers.includes(member);
                    const memberStats = speakingStats.find(stat => stat.member === member);
                    const totalTime = memberStats?.totalDuration || 0;
                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/10 ${isDisabled ? 'bg-white/5 opacity-60 border-white/10' : 'bg-white/5 border-white/20 hover:border-white/30'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div
                                    className="w-4 h-4 rounded-full border border-white/20"
                                    style={{ backgroundColor: isDisabled ? '#6b7280' : colors[index % colors.length] }}
                                />
                                <div className="flex-1">
                                    <span className={`font-bold text-lg block ${isDisabled ? 'line-through text-white/50' : 'text-white'}`}>
                                        {member}
                                    </span>
                                    {totalTime > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock size={14} className="text-purple-300" />
                                            <span className="text-sm text-purple-300 font-semibold bg-purple-500/20 px-2 py-1 rounded-lg">
                                                {formatDuration(totalTime)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isDisabled && (
                                    <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full font-semibold border border-orange-400/30">Already spoke</span>
                                )}
                            </div>
                            <button
                                onClick={() => removeMember(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-colors ml-2 border border-red-400/30"
                                type="button"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MembersList;
