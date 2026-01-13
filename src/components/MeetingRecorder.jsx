import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, StopCircleIcon,SaveIcon, PlayIcon, PauseIcon } from './Icons';

const MeetingRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState(null);
    const [reviewMode, setReviewMode] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Refs for cleanup
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamsRef = useRef([]);
    const timerRef = useRef(null);
    const chunksRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => {
        return () => {
            stopRecordingAndCleanup();
        };
    }, []);

    const stopRecordingAndCleanup = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Stop all tracks
        streamsRef.current.forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
        streamsRef.current = [];

        // Close Audio Context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
    };

    const startRecording = async () => {
        setError(null);
        setIsRecording(true);
        setRecordingTime(0);
        chunksRef.current = [];

        try {
            // 1. Get Sources from Electron
            if (!window.electron || !window.electron.getAudioSources) {
                throw new Error("Electron Audio API not found");
            }

            const response = await window.electron.getAudioSources();
            if (!response.success) throw new Error(response.error);

            // Default to first source (Primary Screen)
            const sourceId = response.sources[0]?.id;
            if (!sourceId) throw new Error("No screen source found for audio");

            // 2. Get Streams
            // System Audio
            const desktopStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId
                    }
                },
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId
                    }
                }
            });

            // Microphone
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            streamsRef.current = [desktopStream, micStream];

            // 3. Mix Streams using Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            const dest = ctx.createMediaStreamDestination();

            // Create sources
            const desktopSource = ctx.createMediaStreamSource(desktopStream);
            const micSource = ctx.createMediaStreamSource(micStream);

            // Connect to destination
            desktopSource.connect(dest);
            micSource.connect(dest);

            // 4. Record the combined stream
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                ? 'audio/webm;codecs=opus' 
                : 'audio/webm';

            const recorder = new MediaRecorder(dest.stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                if (blob.size > 0) {
                    setRecordedBlob(blob);
                    setReviewMode(true);
                    setIsRecording(false);
                } else {
                    console.error("Recorded blob is empty");
                    setError("Recording failed: Empty audio");
                    stopRecordingAndCleanup();
                    setIsRecording(false);
                }
            };

            recorder.start(1000); // Collect 1s chunks

            // Start Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (e) {
            console.error("Recording Start Error:", e);
            setError("Failed to start recording: " + e.message);
            stopRecordingAndCleanup();
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            stopRecordingAndCleanup();
        }
    };

    const handleDiscard = () => {
        setReviewMode(false);
        setRecordedBlob(null);
        setRecordingTime(0);
        setIsPlaying(false);
    };

    const handleTranscribe = () => {
        if (!recordedBlob) return;
        const reader = new FileReader();
        reader.readAsDataURL(recordedBlob);
        reader.onloadend = () => {
            onRecordingComplete(reader.result);
            handleDiscard(); 
        };
    };

    const handleSave = async () => {
        if (!recordedBlob) return;
        
        if (!window.electron || !window.electron.saveFile) {
            setError("Update Required: Please restart app.");
            return;
        }

        setError("Saving..."); 

        const reader = new FileReader();
        reader.readAsDataURL(recordedBlob);
        reader.onloadend = async () => {
            const base64data = reader.result;
            try {
                const result = await window.electron.saveFile({ 
                    buffer: base64data,
                    defaultName: `meeting-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`
                });
                
                if (result.success) {
                    setError("Saved successfully! ✅");
                    setTimeout(() => setError(null), 3000);
                } else if (result.error !== 'Cancelled') {
                    setError('Save failed: ' + result.error);
                } else {
                    setError(null); // Cancelled
                }
            } catch (e) {
                setError("Save error: " + e.message);
            }
        };
    };

    const togglePlayback = () => {
        if (!audioRef.current) {
            const url = URL.createObjectURL(recordedBlob);
            const audio = new Audio(url);
            audio.onended = () => setIsPlaying(false);
            audioRef.current = audio;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (reviewMode && recordedBlob) {
        return (
            <div className="flex items-center gap-2 bg-neutral-800 p-1.5 absolute bottom-9 w-fit -right-16 rounded-lg border border-neutral-600 shadow-xl">
                 <button 
                    onClick={togglePlayback}
                    className="p-1 hover:text-emerald-400 text-neutral-300" 
                    
                 >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                 </button>
                 
                 <div className="h-4 w-[1px] bg-neutral-600 mx-1"></div>

                 <button 
                    onClick={handleSave}
                    className="p-1 hover:text-blue-400 text-neutral-300" 
                    
                 >
                    <SaveIcon/>
                 </button>
                 
                 <button 
                    onClick={handleTranscribe}
                    className="px-2 py-0.5 whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded animate-pulse" 
                 >
                    ✨ Analyze
                 </button>

                 <div className="h-4 w-[1px] bg-neutral-600 mx-1"></div>

                 <button 
                    onClick={handleDiscard}
                    className="p-1 hover:text-red-400 text-neutral-300"
                   
                 >
                    <StopCircleIcon className="w-4 h-4" />
                 </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {error && (
                <span className="text-xs text-red-500 max-w-[150px] truncate" >
                    {error}
                </span>
            )}
            
            {isRecording ? (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/50 rounded-full pl-3 pr-1 py-1 absolute bottom-9 -right-16 animate-pulse">
                    <span className="text-xs text-red-200 font-mono w-10">{formatTime(recordingTime)}</span>
                    <button 
                        onClick={stopRecording}
                        className="p-1 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                        
                    >
                        <StopCircleIcon />
                    </button>
                </div>
            ) : (
                <button
                    onClick={startRecording}
                    className="p-1.5 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-emerald-400 transition-colors"
                    
                >
                    <MicIcon />
                </button>
            )}
        </div>
    );
};

export default MeetingRecorder;
