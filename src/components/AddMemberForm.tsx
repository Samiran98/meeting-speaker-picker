import React from 'react';
import { Plus } from 'lucide-react';

type Props = {
    newMember: string;
    setNewMember: (v: string) => void;
    addMember: () => void;
};

const AddMemberForm: React.FC<Props> = ({ newMember, setNewMember, addMember }) => {
    return (
        <div className="flex gap-2 mb-6">
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
    );
};

export default AddMemberForm;
