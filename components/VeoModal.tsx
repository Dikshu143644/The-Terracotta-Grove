import React, { useState, useRef } from 'react';
import { Video, X, Upload, Loader2, Play } from 'lucide-react';
import { generateVideo } from '../services/gemini';
import { arrayBufferToBase64 } from '../services/audioUtils';

interface VeoModalProps {
  onClose: () => void;
}

const VeoModal: React.FC<VeoModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isPortrait, setIsPortrait] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setResultVideo(null);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      
      const videoUrl = await generateVideo(base64, prompt, isPortrait);
      setResultVideo(videoUrl);
    } catch (e) {
      console.error(e);
      alert("Failed to generate video. Please try again (Select API Key if prompted).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-rustic-earth rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-stone-800 border-b border-stone-700 flex justify-between items-center">
          <h2 className="text-xl font-serif text-rustic-clay flex items-center gap-2">
            <Video size={20} /> Veo Memory Maker
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {!resultVideo ? (
            <>
               <div className="space-y-2">
                 <label className="block text-sm text-stone-400">1. Upload a photo from your stay</label>
                 <div className="relative border-2 border-dashed border-stone-600 rounded-lg p-6 hover:border-rustic-clay transition-colors flex flex-col items-center justify-center cursor-pointer min-h-[150px]">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-32 object-cover rounded" />
                    ) : (
                      <>
                        <Upload className="text-stone-500 mb-2" />
                        <span className="text-stone-500">Click to upload image</span>
                      </>
                    )}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm text-stone-400">2. Describe the movement (optional)</label>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Make the string lights twinkle and the leaves rustle gently."
                    className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-rustic-clay focus:outline-none"
                 />
               </div>
               
               <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-stone-300">
                    <input type="checkbox" checked={isPortrait} onChange={(e) => setIsPortrait(e.target.checked)} className="rounded bg-stone-800 border-stone-600 text-rustic-clay" />
                    Portrait Mode (9:16)
                  </label>
               </div>

               <button 
                 onClick={handleGenerate}
                 disabled={!selectedFile || loading}
                 className="w-full py-3 bg-rustic-clay text-stone-900 font-bold rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                 {loading ? 'Generating (Takes ~1 min)...' : 'Generate Video'}
               </button>
            </>
          ) : (
             <div className="space-y-4 animate-in fade-in">
                <h3 className="text-center text-green-400 font-bold">Video Ready!</h3>
                <video src={resultVideo} controls autoPlay loop className="w-full rounded-lg shadow-lg" />
                <button onClick={() => setResultVideo(null)} className="w-full py-2 bg-stone-800 text-stone-300 rounded hover:bg-stone-700">Create Another</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeoModal;