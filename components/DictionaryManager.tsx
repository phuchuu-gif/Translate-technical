import React, { useState } from 'react';
import { DictionaryEntry } from '../types';
import { Trash2, Plus, Book, Save } from 'lucide-react';

interface Props {
  dictionary: DictionaryEntry[];
  setDictionary: (dict: DictionaryEntry[]) => void;
  onClose: () => void;
}

const DictionaryManager: React.FC<Props> = ({ dictionary, setDictionary, onClose }) => {
  const [newTerm, setNewTerm] = useState('');
  const [newTrans, setNewTrans] = useState('');
  const [category, setCategory] = useState<DictionaryEntry['category']>('general');

  const handleAdd = () => {
    if (!newTerm || !newTrans) return;
    const newEntry: DictionaryEntry = {
      id: Date.now().toString(),
      term: newTerm.trim(),
      translation: newTrans.trim(),
      category,
    };
    setDictionary([...dictionary, newEntry]);
    setNewTerm('');
    setNewTrans('');
  };

  const handleDelete = (id: string) => {
    setDictionary(dictionary.filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cad-800 border border-cad-600 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-cad-700 flex justify-between items-center bg-cad-900 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Book className="text-cad-accent w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Technical Term Dictionary</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-cad-800 grid grid-cols-1 md:grid-cols-12 gap-3 border-b border-cad-700">
            <div className="md:col-span-4">
              <label className="block text-xs text-gray-400 mb-1">English Term</label>
              <input 
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="w-full bg-cad-900 border border-cad-600 rounded px-3 py-2 text-sm focus:border-cad-accent outline-none"
                placeholder="e.g. Abutment"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-xs text-gray-400 mb-1">Vietnamese Meaning</label>
              <input 
                value={newTrans}
                onChange={(e) => setNewTrans(e.target.value)}
                className="w-full bg-cad-900 border border-cad-600 rounded px-3 py-2 text-sm focus:border-cad-accent outline-none"
                placeholder="e.g. Mố cầu"
              />
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs text-gray-400 mb-1">Category</label>
               <select 
                 value={category}
                 onChange={(e) => setCategory(e.target.value as any)}
                 className="w-full bg-cad-900 border border-cad-600 rounded px-2 py-2 text-sm outline-none"
               >
                 <option value="general">General</option>
                 <option value="road">Road</option>
                 <option value="bridge">Bridge</option>
                 <option value="revit">Revit</option>
               </select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <button 
                onClick={handleAdd}
                className="w-full bg-cad-accent hover:bg-blue-600 text-white p-2 rounded flex justify-center items-center h-[38px]"
              >
                <Plus size={18} />
              </button>
            </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {dictionary.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">
              Dictionary is empty. Add your own terms to improve translation accuracy.
            </div>
          ) : (
            dictionary.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center bg-cad-700/50 p-3 rounded border border-transparent hover:border-cad-600">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <span className="font-mono text-cad-accent font-semibold">{entry.term}</span>
                  <span className="text-gray-300">{entry.translation}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded bg-cad-900 text-gray-400 uppercase tracking-wider">
                    {entry.category}
                  </span>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-cad-900 text-xs text-gray-500 text-center rounded-b-lg">
           Data is stored locally in your browser session.
        </div>
      </div>
    </div>
  );
};

export default DictionaryManager;