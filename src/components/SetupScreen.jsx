import React from 'react';
import { MinusIcon, XIcon, PlusIcon, TrashIcon } from './Icons';
import ResizeHandle from './ResizeHandle';

const SetupScreen = ({ 
    setupKeys = [''], 
    setSetupKeys, 
    setupError, 
    onSave 
}) => {
    const handleAddKey = () => {
        setSetupKeys([...setupKeys, '']);
    };

    const handleRemoveKey = (index) => {
        const newKeys = setupKeys.filter((_, i) => i !== index);
        setSetupKeys(newKeys.length ? newKeys : ['']);
    };

    const handleKeyChange = (index, value) => {
        const newKeys = [...setupKeys];
        newKeys[index] = value;
        setSetupKeys(newKeys);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-neutral-900 text-white relative  " style={{ WebkitAppRegion: 'drag'}}>
            {/* Window Controls for Setup Screen */}
            <div className="absolute top-2 right-2 flex gap-2 no-drag z-50" >
                 <button onClick={() => window.electron?.minimize()} className="text-neutral-400 hover:text-white p-1"><MinusIcon/></button>
                 <button onClick={() => window.electron?.closeApp()} className="text-neutral-400 hover:text-red-500 p-1"><XIcon /></button>
            </div>
            
            <div className="bg-neutral-800  p-8 rounded-xl shadow-2xl border border-neutral-700 w-[24rem] transform transition-all " >
                <h2 className="text-2xl font-bold mb-6 text-center text-emerald-500">Service Host Setup</h2>
                <p className="text-neutral-400 text-xs mb-4 text-center leading-relaxed">Enter your Google Gemini API Keys. System will automatically rotate keys if quota is exceeded.</p>
                
                <form onSubmit={onSave} style={{ WebkitAppRegion: 'no-drag' }} className="space-y-4">
                    <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {setupKeys.map((key, index) => (
                            <div key={index} className="flex gap-2 group">
                                <div className="flex-1 relative">
                                    <input 
                                        type="password" 
                                        value={key} 
                                        onChange={(e) => handleKeyChange(index, e.target.value)} 
                                        placeholder={`API Key #${index + 1}`}
                                        className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors duration-200"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveKey(index)}
                                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="button"
                        onClick={handleAddKey}
                        className="w-full py-2 border border-dashed border-neutral-600 rounded text-xs text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        <PlusIcon size={12} /> Add Alternative Key
                    </button>
                    
                    {setupError && <div className="text-red-400 text-[10px] text-center">{setupError}</div>}
                    
                    <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded text-sm transition-colors duration-200 mt-4 shadow-lg shadow-emerald-900/20"
                    >
                        Activate Runtime
                    </button>
                    
                    <div className="text-center pt-2">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline hover:text-blue-300 opacity-70">Get Free API Key here &rarr;</a>
                    </div>
                </form>
            </div>
            <ResizeHandle />
        </div>
    );
};

export default SetupScreen;
