import React, { useState } from 'react';
import { Wand2, X, Upload, Loader2, Download } from 'lucide-react';
import { editImage } from '../services/gemini';
import { arrayBufferToBase64 } from '../services/audioUtils';

interface ImageEditorModalProps {
  onClose: () => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleEdit = async () => {
    if (!selectedFile || !prompt) return;
    
    setLoading(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      
      const newImage = await editImage(base64, prompt);
      if (newImage) {
        setResultImage(newImage);
      } else {
        alert("Could not generate image. Try a different prompt.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-rustic-earth rounded-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-stone-800 border-b border-stone-700 flex justify-between items-center">
          <h2 className="text-xl font-serif text-rustic-clay flex items-center gap-2">
            <Wand2 size={20} /> AI Photo Studio
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
           {/* Left: Input */}
           <div className="space-y-4">
              <div className="relative border-2 border-dashed border-stone-600 rounded-lg h-64 hover:border-rustic-clay transition-colors flex flex-col items-center justify-center cursor-pointer bg-stone-950">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {previewUrl ? (
                  <img src={previewUrl} alt="Original" className="h-full w-full object-contain" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto text-stone-500 mb-2" />
                    <span className="text-stone-500">Upload Photo</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="E.g., Add a retro filter, remove background..."
                   className="flex-1 bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-rustic-clay focus:outline-none"
                 />
                 <button 
                   onClick={handleEdit}
                   disabled={!selectedFile || !prompt || loading}
                   className="px-6 bg-rustic-leaf text-white rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : 'Edit'}
                 </button>
              </div>
           </div>

           {/* Right: Output */}
           <div className="border border-stone-700 rounded-lg h-64 md:h-auto bg-stone-950 flex items-center justify-center relative">
              {resultImage ? (
                <>
                  <img src={resultImage} alt="Edited" className="h-full w-full object-contain" />
                  <a href={resultImage} download="rustic-edit.png" className="absolute bottom-4 right-4 bg-rustic-clay text-stone-900 p-2 rounded-full shadow-lg hover:bg-orange-500">
                    <Download size={20} />
                  </a>
                </>
              ) : (
                <span className="text-stone-600 italic">Edited photo will appear here</span>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;