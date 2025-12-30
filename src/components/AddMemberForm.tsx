import React, { useState } from 'react';
import { Plus, Users, X } from 'lucide-react';

type Props = {
    newMember: string;
    setNewMember: (v: string) => void;
    addMember: () => void;
    onBulkImport?: (names: string[]) => void;
};

const AddMemberForm: React.FC<Props> = ({ newMember, setNewMember, addMember, onBulkImport }) => {
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [bulkText, setBulkText] = useState('');

    const parseNamesFromText = (text: string): string[] => {
        // Split by common delimiters and clean up
        const names = text
            .split(/[\n\r,;|]/)
            .map(name => name.trim())
            .filter(name => name.length > 0)
            // Remove common prefixes like "1. ", "• ", etc.
            .map(name => name.replace(/^[\d\.\-\•\*\s]+/, '').trim())
            // Remove common suffixes like " (Host)", " (You)", etc.
            .map(name => name.replace(/\s*\([^)]*\)\s*$/, '').trim())
            .filter(name => name.length > 0 && name.length < 50); // Reasonable name length

        return [...new Set(names)]; // Remove duplicates
    };

    const handleBulkImport = () => {
        const names = parseNamesFromText(bulkText);
        if (names.length > 0 && onBulkImport) {
            onBulkImport(names);
            setBulkText('');
            setShowBulkImport(false);
        }
    };

    return (
        <div className="mb-6">
            {/* Single Add Form */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMember()}
                    placeholder="Enter member name..."
                    className="flex-1 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-400 focus:outline-none backdrop-blur-sm transition-all"
                />
                <button
                    onClick={addMember}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg border border-purple-400/30"
                    type="button"
                >
                    <Plus size={20} />
                    Add
                </button>
            </div>

            {/* Bulk Import Toggle */}
            <button
                onClick={() => setShowBulkImport(!showBulkImport)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-2"
                type="button"
            >
                <Users size={16} />
                {showBulkImport ? 'Hide' : 'Import from Meeting'}
            </button>

            {/* Bulk Import Form */}
            {showBulkImport && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Import Participants</h4>
                        <button
                            onClick={() => setShowBulkImport(false)}
                            className="text-white/60 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="Paste participant list from Zoom/Teams chat, e.g.:&#10;John Smith&#10;Sarah Johnson&#10;Mike Davis&#10;&#10;Or: John, Sarah, Mike"
                        className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none backdrop-blur-sm transition-all resize-none"
                        rows={4}
                    />

                    <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-white/60">
                            {bulkText ? `${parseNamesFromText(bulkText).length} names detected` : 'Paste names from your meeting'}
                        </div>
                        <button
                            onClick={handleBulkImport}
                            disabled={!bulkText.trim()}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold text-sm shadow-lg border border-green-400/30 disabled:border-gray-400/30"
                            type="button"
                        >
                            <Plus size={16} />
                            Import All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddMemberForm;
