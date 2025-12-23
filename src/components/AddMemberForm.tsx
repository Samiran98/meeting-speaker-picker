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
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <button
                onClick={addMember}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold"
                type="button"
            >
                <Plus size={20} />
                Add
            </button>
        </div>
    );
};

export default AddMemberForm;
