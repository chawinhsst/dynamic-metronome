import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Power, Zap, Gauge, Volume2 } from 'lucide-react';

// --- UI Components ---

// A new component for the permission modal
const PermissionModal = ({ onAllow, isLibraryLoaded }) => (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 text-center w-full max-w-sm">
            <Volume2 size={48} className="mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Audio Permission Required</h2>
            <p className="text-gray-400 mb-6">
                Please click the button below to enable audio for this metronome.
            </p>
            <button
                onClick={onAllow}
                disabled={!isLibraryLoaded}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
            >
                {isLibraryLoaded ? 'Allow Audio' : 'Loading Audio Library...'}
            </button>
        </div>
    </div>
);

const PowerButton = ({ isPlaying, onClick }) => (
    <button
        onClick={onClick}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4
        ${isPlaying 
            ? 'bg-red-500 text-white shadow-red-500/50 focus:ring-red-400' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-cyan-500'
        }`}
    >
        <Power size={48} />
        <span className={`absolute w-full h-full rounded-full animate-ping-slow opacity-0 ${isPlaying ? 'bg-red-400 opacity-75' : ''}`}></span>
    </button>
);

const Slider = ({ icon, label, value, min, max, step, onChange, unit }) => (
    <div className="space-y-3">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
            {icon}
            <span>{label}</span>
            <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded-md text-xs">
                {value} {unit}
            </span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
        />
    </div>
);


// --- Main App Component ---
export default function App() {
    const [showPermissionModal, setShowPermissionModal] = useState(true);
    const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rate, setRate] = useState(120);
    const [constancy, setConstancy] = useState(100);

    const oscillatorRef = useRef(null);
    const intervalRef = useRef(null);

    // Effect to check if the Tone.js library is available
    useEffect(() => {
        const checkTone = () => {
            if (window.Tone) {
                setIsLibraryLoaded(true);
                return true;
            }
            return false;
        };
        if (checkTone()) return;
        const libraryCheckInterval = setInterval(() => {
            if (checkTone()) clearInterval(libraryCheckInterval);
        }, 100);
        return () => clearInterval(libraryCheckInterval);
    }, []);

    // This function is now called from the modal to initialize and start audio
    const initializeAndPlay = async () => {
        if (!isLibraryLoaded) return;
        
        const Tone = window.Tone;
        try {
            await Tone.start();
            oscillatorRef.current = new Tone.Oscillator({
                type: 'sine',
            }).toDestination();
            setShowPermissionModal(false); // Hide the modal on success
            setIsPlaying(true);          // Start playing immediately
            console.log("Audio permission granted and playback started.");
        } catch (error) {
            console.error("Audio permission was denied.", error);
            // You could show an error message to the user here
        }
    };

    const updateFrequency = useCallback(() => {
        if (!oscillatorRef.current) return;
        const osc = oscillatorRef.current;
        const minFreq = 220, maxFreq = 440, constantFreq = (minFreq + maxFreq) / 2;
        if (constancy >= 100) osc.frequency.rampTo(constantFreq, 0.05);
        else {
            if (Math.random() * 100 < constancy) osc.frequency.rampTo(constantFreq, 0.05);
            else osc.frequency.rampTo(Math.random() * (maxFreq - minFreq) + minFreq, 0.05);
        }
    }, [constancy]);

    // Main effect to control the audio engine, now more robust
    useEffect(() => {
        if (showPermissionModal || !isPlaying) {
            if (oscillatorRef.current?.state === 'started') oscillatorRef.current.stop();
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        if (oscillatorRef.current?.state !== 'started') oscillatorRef.current.start();
        
        updateFrequency();
        const intervalTime = 60000 / rate;
        intervalRef.current = setInterval(updateFrequency, intervalTime);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, rate, updateFrequency, showPermissionModal]);
    
    // Final cleanup on unmount
    useEffect(() => {
        return () => {
            if (oscillatorRef.current) oscillatorRef.current.dispose();
        };
    }, []);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans relative">
            {showPermissionModal && <PermissionModal onAllow={initializeAndPlay} isLibraryLoaded={isLibraryLoaded} />}
            
            <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 border border-gray-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Pitch Metronome
                    </h1>
                    <p className="text-gray-400 mt-2 h-5">Set BPM and pitch constancy.</p>
                </div>

                <div className="flex items-center justify-center">
                    <PowerButton isPlaying={isPlaying} onClick={() => setIsPlaying(p => !p)} />
                </div>

                <div className="space-y-6">
                    <Slider icon={<Zap size={20} className="text-red-400"/>} label="Rate" value={rate} min="30" max="240" step="1" onChange={(e) => setRate(e.target.value)} unit="BPM" />
                    <Slider icon={<Gauge size={20} className="text-green-400"/>} label="Constancy" value={constancy} min="0" max="100" step="1" onChange={(e) => setConstancy(e.target.value)} unit="%" />
                </div>
            </div>
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>
                    {showPermissionModal 
                        ? "Waiting for audio permission..."
                        : "Click the power button to start/stop the metronome."
                    }
                </p>
            </footer>
        </div>
    );
}
