import React from 'react';
import { RotateCw, RefreshCw } from 'lucide-react';

type Props = {
    isSpinning: boolean;
    availableCount: number;
    spinWheel: () => void;
    resetAllMembers: () => void;
    disabledCount: number;
    selectedMember: string | null;
};

const Controls: React.FC<Props> = ({ isSpinning, availableCount, spinWheel, resetAllMembers, disabledCount }) => {
    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Available count badge */}
            <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-semibold border border-white/30 shadow-md">
                {availableCount} available
            </div>

            {/* Spin button */}
            <button
                onClick={spinWheel}
                disabled={isSpinning || availableCount === 0}
                className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-lg hover:shadow-emerald-500/20 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-3 border-2 border-cyan-200"
                type="button"
            >
                <RotateCw className={`${isSpinning ? 'animate-spin' : ''} transition-transform duration-300`} size={24} />
                {isSpinning ? 'Spinning...' : availableCount === 0 ? 'All Done!' : 'SPIN THE WHEEL'}
            </button>

            {/* Reset button */}
            {disabledCount > 0 && (
                <button
                    onClick={resetAllMembers}
                    className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white font-semibold flex items-center gap-2 border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-110 shadow-md"
                    type="button"
                >
                    <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-500" />
                    Reset All Members
                </button>
            )}
        </div>
    );
};

export default Controls;
