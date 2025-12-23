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
                <p className="text-gray-500 text-center py-8">No team members yet. Add some to get started!</p>
            ) : (
                members.map((member, index) => {
                    const isDisabled = disabledMembers.includes(member);
                    const memberStats = speakingStats.find(stat => stat.member === member);
                    const totalTime = memberStats?.totalDuration || 0;
                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-all ${isDisabled ? 'bg-gray-100 opacity-60' : 'bg-gradient-to-r from-purple-50 to-pink-50'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: isDisabled ? '#d1d5db' : colors[index % colors.length] }}
                                />
                                <div className="flex-1">
                                    <span className={`font-medium block ${isDisabled ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                        {member}
                                    </span>
                                    {totalTime > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock size={12} className="text-purple-600" />
                                            <span className="text-xs text-purple-600 font-semibold">
                                                {formatDuration(totalTime)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isDisabled && (
                                    <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full">Already spoke</span>
                                )}
                            </div>
                            <button
                                onClick={() => removeMember(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-colors ml-2"
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
