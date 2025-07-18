import React, { useState, useEffect, useRef } from 'react';
import { Power, Zap, GitCommit, GitMerge, SlidersHorizontal, Volume2, AlertTriangle, Info, X } from 'lucide-react';

// --- UI Components ---

const PermissionModal = ({ onAllow, isLibraryLoaded, error, isInitializing, isIphone }) => (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 text-center w-full max-w-sm">
            <Volume2 size={48} className="mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Audio Permission Required</h2>
            <p className="text-gray-400 mb-6">A tap is required to enable audio on this device.</p>
            
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertTriangle size={24} />
                    <span>{error}</span>
                </div>
            )}

            {isIphone && (
                <div className="text-left bg-gray-700/50 p-4 rounded-lg mb-6 border border-gray-600">
                    <p className="text-sm text-gray-300 mb-3 text-center">
                        <strong className="text-white">Important for iPhone:</strong> Please turn off Silent Mode for sound to work.
                    </p>
                    <div className="flex justify-center items-center gap-4">
                        {/* **THE FIX IS HERE**: The container is wider (w-12) and the circle is re-centered (left-3). */}
                        <div className="w-12 h-16 bg-gray-600 rounded-full p-1 relative">
                            <div className="w-6 h-6 bg-green-500 rounded-full absolute top-1 left-1 animate-slide-switch"></div>
                        </div>
                        <p className="text-xs text-gray-400">Make sure the switch on the side of your phone does not show orange.</p>
                    </div>
                </div>
            )}

            <button
                onClick={onAllow}
                disabled={!isLibraryLoaded || isInitializing}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
                {isInitializing ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div> : isLibraryLoaded ? 'Allow Audio' : 'Loading Library...'}
            </button>
        </div>
    </div>
);

const InfoModal = ({ onClose }) => (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700 w-full max-w-sm relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
                <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-4">
                <Info size={24} className="text-blue-400" />
                <h2 className="text-xl font-bold">What is Consistency?</h2>
            </div>
            <div className="text-gray-300 space-y-3 text-left">
                <p>This slider controls how much the tempo fluctuates within your selected Min and Max range.</p>
                <p>
                    <strong className="text-white">100% Consistency:</strong> The tempo is very stable and stays close to the average of your Min/Max BPM.
                </p>
                <p>
                    <strong className="text-white">0% Consistency:</strong> The tempo is completely random. On every beat, it can jump to <strong className="text-cyan-400">any value</strong> between your Min and Max BPM, giving you 100% randomness.
                </p>
            </div>
             <button
                onClick={onClose}
                className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
            >
                Got it
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

const Slider = ({ icon, label, value, min, max, step, onChange, unit, onInfoClick }) => {
    const handleInputBlur = (e) => {
        let numValue = parseInt(e.target.value, 10);
        if (isNaN(numValue)) numValue = min;
        else if (numValue > max) numValue = max;
        else if (numValue < min) numValue = min;
        onChange({ target: { value: String(numValue) } });
    };
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-gray-300">
                <div className="flex items-center space-x-2">
                    {icon}
                    <span>{label}</span>
                    {onInfoClick && (
                        <button onClick={onInfoClick} className="text-gray-400 hover:text-blue-400">
                            <Info size={16} />
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded-md">
                    <input
                        type="number"
                        value={value} min={min} max={max} onChange={onChange} onBlur={handleInputBlur}
                        className="w-14 bg-transparent text-white font-bold text-right focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-gray-400">{unit}</span>
                </div>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value} onChange={onChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
            />
        </div>
    );
};

const ModeSwitcher = ({ mode, setMode }) => (
    <div className="flex bg-gray-700 rounded-lg p-1">
        <button
            onClick={() => setMode('consistent')}
            className={`w-1/2 rounded-md py-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'consistent' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
        >
            <GitCommit size={16} /> Consistent
        </button>
        <button
            onClick={() => setMode('inconsistent')}
            className={`w-1/2 rounded-md py-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'inconsistent' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
        >
            <GitMerge size={16} /> Inconsistent
        </button>
    </div>
);

// --- Main App Component ---
export default function App() {
    const [showPermissionModal, setShowPermissionModal] = useState(true);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
    const [audioError, setAudioError] = useState('');
    const [isInitializing, setIsInitializing] = useState(false);
    const [isIphone, setIsIphone] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const [mode, setMode] = useState('consistent');
    const [rate, setRate] = useState(120);
    const [minRate, setMinRate] = useState(30);
    const [maxRate, setMaxRate] = useState(150);
    const [consistency, setConsistency] = useState(0);

    const synthRef = useRef(null);
    const loopRef = useRef(null);
    const modeRef = useRef(mode);
    const minRateRef = useRef(minRate);
    const maxRateRef = useRef(maxRate);
    const consistencyRef = useRef(consistency);

    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { minRateRef.current = minRate; }, [minRate]);
    useEffect(() => { maxRateRef.current = maxRate; }, [maxRate]);
    useEffect(() => { consistencyRef.current = consistency; }, [consistency]);

    useEffect(() => {
        setIsIphone(/iPhone/.test(navigator.userAgent));
        
        const checkTone = () => { if (window.Tone) { setIsLibraryLoaded(true); return true; } return false; };
        if (checkTone()) return;
        const interval = setInterval(() => { if (checkTone()) clearInterval(interval); }, 100);
        return () => clearInterval(interval);
    }, []);

    const initializeAudio = () => {
        if (!isLibraryLoaded || isInitializing) return;
        setIsInitializing(true);
        setAudioError('');
        
        const Tone = window.Tone;
        
        Tone.start().then(() => {
            const primer = new Tone.Oscillator().toDestination();
            primer.volume.value = -Infinity;
            primer.start().stop("+0.1");

            synthRef.current = new Tone.Synth({
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.01, release: 0.1 },
            }).toDestination();
            
            loopRef.current = new Tone.Loop((time) => {
                synthRef.current?.triggerAttackRelease('G5', '16n', time);
                if (modeRef.current === 'inconsistent') {
                    const min = parseFloat(minRateRef.current), max = parseFloat(maxRateRef.current), consist = parseFloat(consistencyRef.current);
                    const randomnessFactor = 1 - (consist / 100), midpoint = (min + max) / 2, totalRange = max - min;
                    const effectiveRange = totalRange * randomnessFactor, randomOffset = (Math.random() - 0.5) * effectiveRange;
                    let newBpm = midpoint + randomOffset;
                    newBpm = Math.max(min, Math.min(max, newBpm));
                    Tone.Transport.bpm.rampTo(newBpm, 0.1);
                }
            }, '4n');

            Tone.Transport.bpm.value = rate;
            loopRef.current.start(0);
            Tone.Transport.start();

            setShowPermissionModal(false);
            setIsPlaying(true);
            setIsInitializing(false);
        }).catch(error => {
            console.error("Critical audio error:", error);
            setAudioError("Audio failed. Please check site permissions and refresh.");
            setIsInitializing(false);
        });
    };

    useEffect(() => {
        const Tone = window.Tone;
        if (!Tone || showPermissionModal) return;
        if (mode === 'consistent') {
            Tone.Transport.bpm.value = rate;
        } else {
            Tone.Transport.bpm.value = (parseFloat(minRate) + parseFloat(maxRate)) / 2;
        }
        if (isPlaying) {
            Tone.Transport.start();
        } else {
            Tone.Transport.stop();
        }
    }, [isPlaying, rate, minRate, maxRate, mode]);
    
    useEffect(() => {
        return () => {
            const Tone = window.Tone;
            if (Tone?.Transport) {
                Tone.Transport.stop();
                Tone.Transport.cancel();
            }
            loopRef.current?.dispose();
            synthRef.current?.dispose();
        };
    }, []);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans relative">
            {showPermissionModal && <PermissionModal onAllow={initializeAudio} isLibraryLoaded={isLibraryLoaded} error={audioError} isInitializing={isInitializing} isIphone={isIphone} />}
            {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
            
            <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 border border-gray-700">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Dynamic Metronome
                    </h1>
                    <p className="text-gray-400 mt-2 h-5">Practice with a fixed or variable tempo.</p>
                </div>
                <div className="flex items-center justify-center my-4">
                    <PowerButton isPlaying={isPlaying} onClick={() => setIsPlaying(p => !p)} />
                </div>
                <div className="space-y-4">
                    <ModeSwitcher mode={mode} setMode={setMode} />
                    {mode === 'consistent' ? (
                        <Slider icon={<Zap size={20} className="text-red-400"/>} label="Rate" value={rate} min="10" max="240" step="1" onChange={(e) => setRate(e.target.value)} unit="BPM" />
                    ) : (
                        <div className="space-y-4 pt-4 border-t border-gray-700/50">
                           <Slider icon={<Zap size={20} className="text-green-400"/>} label="Min Rate" value={minRate} min="10" max="240" step="1" onChange={(e) => setMinRate(e.target.value)} unit="BPM" />
                           <Slider icon={<Zap size={20} className="text-red-400"/>} label="Max Rate" value={maxRate} min="10" max="240" step="1" onChange={(e) => setMaxRate(e.target.value)} unit="BPM" />
                           <Slider 
                                icon={<SlidersHorizontal size={20} className="text-blue-400"/>} 
                                label="Consistency" 
                                value={consistency} 
                                min="0" max="100" step="1" 
                                onChange={(e) => setConsistency(e.target.value)} 
                                unit="%"
                                onInfoClick={() => setShowInfoModal(true)}
                           />
                        </div>
                    )}
                </div>
            </div>
            <footer className="text-center mt-8 text-gray-500 text-xs sm:text-sm">
                <p>{showPermissionModal ? "Waiting for audio permission..." : "Click the power button to start/stop the metronome."}</p>
            </footer>
        </div>
    );
}