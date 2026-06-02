import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Activity, Volume2 } from 'lucide-react';
import { connectLiveSession } from '../services/gemini';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';

const VoiceConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to chat');
  
  // Refs for audio handling
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = () => {
    if (sessionRef.current) {
        // No close method exposed on the session promise result directly in all SDK versions, 
        // but typically we stop sending data. 
        // We will just drop the reference.
       sessionRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }

    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    
    setIsActive(false);
    setStatus('Ready to chat');
  };

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      
      // Log session start for admin insights
      try {
        const logs = localStorage.getItem('ai_concierge_logs');
        const currLogs = logs ? JSON.parse(logs) : [];
        const msg = "Opened Voice Concierge API (Terra)";
        if (!currLogs.includes(msg)) {
          currLogs.unshift(msg);
          localStorage.setItem('ai_concierge_logs', JSON.stringify(currLogs.slice(0, 30)));
        }
      } catch (err) {}
      
      // Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = connectLiveSession(
        () => {
          setStatus('Listening...');
          setIsActive(true);

          // Audio Input Processing
          if (!inputContextRef.current) return;
          const source = inputContextRef.current.createMediaStreamSource(stream);
          const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
             const inputData = e.inputBuffer.getChannelData(0);
             const pcmBlob = createPcmBlob(inputData);
             
             sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
             });
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputContextRef.current.destination);
        },
        async (msg) => {
            // Handle Output Audio
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const buffer = await decodeAudioData(base64ToUint8Array(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
            }
            
            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
        },
        (err) => {
            console.error(err);
            setStatus('Error occurred');
            setIsActive(false);
        },
        () => {
            setStatus('Disconnected');
            setIsActive(false);
        }
      );
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to start live session", e);
      setStatus('Permission Denied / Error');
    }
  };

  const handleToggle = () => {
    if (isActive) {
      cleanup();
    } else {
      startSession();
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-rustic-clay hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      >
        <Volume2 size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-stone-900 border border-rustic-clay rounded-2xl shadow-2xl p-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-rustic-clay font-bold text-lg">Terra Concierge</h3>
        <button onClick={() => { cleanup(); setIsOpen(false); }} className="text-stone-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-rustic-leaf animate-pulse' : 'bg-stone-700'}`}>
           <Activity className={isActive ? 'text-white' : 'text-stone-400'} />
        </div>
        
        <p className="text-stone-300 text-sm text-center">{status}</p>

        <button 
          onClick={handleToggle}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors ${
            isActive 
              ? 'bg-red-600/20 text-red-400 border border-red-900 hover:bg-red-600/30' 
              : 'bg-rustic-leaf text-white hover:bg-green-800'
          }`}
        >
          {isActive ? <><MicOff size={18} /> <span>End Chat</span></> : <><Mic size={18} /> <span>Start Chat</span></>}
        </button>
      </div>
    </div>
  );
};

export default VoiceConcierge;