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
            {/* Control Panel */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    {/* Spin button - Primary Action */}
                    <button
                        onClick={spinWheel}
                        disabled={isSpinning || availableCount === 0}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3 border border-emerald-300/50"
                        type="button"
                    >
                        <RotateCw className={`${isSpinning ? 'animate-spin' : ''} transition-transform duration-300`} size={24} />
                        {isSpinning ? 'Spinning...' : availableCount === 0 ? 'All Done!' : 'SPIN THE WHEEL'}
                    </button>

                    {/* Reset button - Secondary Action */}
                    {disabledCount > 0 && (
                        <button
                            onClick={resetAllMembers}
                            className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-md text-sm backdrop-blur-sm"
                            type="button"
                        >
                            <RefreshCw size={18} className="hover:rotate-180 transition-transform duration-500" />
                            Reset All Members
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Controls;
