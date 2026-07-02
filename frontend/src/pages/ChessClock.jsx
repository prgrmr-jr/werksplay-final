import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Link} from 'react-router-dom';

const ChessClock = () => {
    // Preloader state
    const [preloaderVisible, setPreloaderVisible] = useState(true);

    // Audio context refs
    const audioCtxRef = useRef(null);

    // Game state
    const [initialTime, setInitialTime] = useState(60);
    const [p1, setP1] = useState(60);
    const [p2, setP2] = useState(60);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [running, setRunning] = useState(false);
    const [startBtnText, setStartBtnText] = useState('Start');
    const [activeMode, setActiveMode] = useState('Bullet');

    // Refs for animation
    const lastTimestampRef = useRef(null);
    const animationFrameRef = useRef(null);
    const p1Ref = useRef(60);
    const p2Ref = useRef(60);
    const currentPlayerRef = useRef(1);
    const runningRef = useRef(false);

    // DOM refs for clock elements
    const p1DivRef = useRef(null);
    const p2DivRef = useRef(null);
    const time1Ref = useRef(null);
    const time2Ref = useRef(null);

    // Preloader effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setPreloaderVisible(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    // Sync refs with state
    useEffect(() => {
        p1Ref.current = p1;
    }, [p1]);

    useEffect(() => {
        p2Ref.current = p2;
    }, [p2]);

    useEffect(() => {
        currentPlayerRef.current = currentPlayer;
    }, [currentPlayer]);

    useEffect(() => {
        runningRef.current = running;
    }, [running]);

    // Audio functions
    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    }, []);

    const clickSound = useCallback((freq, duration) => {
        try {
            initAudio();
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.value = 0.7;
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context might be blocked
        }
    }, [initAudio]);

    const switchSound = useCallback(() => {
        clickSound(1000, 0.06);
        setTimeout(() => clickSound(1400, 0.05), 50);
    }, [clickSound]);

    const speak = useCallback((text) => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const voice = new SpeechSynthesisUtterance(text);
            voice.rate = 0.95;
            voice.pitch = 1;
            voice.volume = 1;
            window.speechSynthesis.speak(voice);
        }
    }, []);

    // Format time
    const formatTime = useCallback((sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }, []);

    // Update UI
    const updateUI = useCallback(() => {
        if (time1Ref.current) time1Ref.current.innerText = formatTime(p1Ref.current);
        if (time2Ref.current) time2Ref.current.innerText = formatTime(p2Ref.current);
        if (p1DivRef.current) {
            p1DivRef.current.style.setProperty('--level', (p1Ref.current / initialTime) * 100 + '%');
        }
        if (p2DivRef.current) {
            p2DivRef.current.style.setProperty('--level', (p2Ref.current / initialTime) * 100 + '%');
        }
    }, [initialTime, formatTime]);

    // End game (out of time)
    const endGame = useCallback((player) => {
        runningRef.current = false;
        setRunning(false);
        setStartBtnText('Start');
        if (player === 1) {
            p1Ref.current = 0;
            setP1(0);
            speak('Player 1 is out of time. Player 2 wins');
        } else {
            p2Ref.current = 0;
            setP2(0);
            speak('Player 2 is out of time. Player 1 wins');
        }
        updateUI();
    }, [speak, updateUI]);

    // Animation loop
    const loop = useCallback((timestamp) => {
        if (!runningRef.current) {
            animationFrameRef.current = null;
            return;
        }

        if (!lastTimestampRef.current) {
            lastTimestampRef.current = timestamp;
            animationFrameRef.current = requestAnimationFrame(loop);
            return;
        }

        const dt = (timestamp - lastTimestampRef.current) / 1000;
        lastTimestampRef.current = timestamp;

        if (currentPlayerRef.current === 1) {
            p1Ref.current -= dt;
            if (p1Ref.current <= 0) {
                p1Ref.current = 0;
                updateUI();
                endGame(1);
                return;
            }
        } else {
            p2Ref.current -= dt;
            if (p2Ref.current <= 0) {
                p2Ref.current = 0;
                updateUI();
                endGame(2);
                return;
            }
        }

        // Update state and UI
        setP1(p1Ref.current);
        setP2(p2Ref.current);
        updateUI();

        animationFrameRef.current = requestAnimationFrame(loop);
    }, [endGame, updateUI]);

    // Reset game
    const resetGame = useCallback(() => {
        runningRef.current = false;
        setRunning(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setStartBtnText('Start');
        lastTimestampRef.current = null;
        p1Ref.current = initialTime;
        p2Ref.current = initialTime;
        setP1(initialTime);
        setP2(initialTime);
        setCurrentPlayer(1);
        currentPlayerRef.current = 1;
        if (p1DivRef.current) {
            p1DivRef.current.classList.add('active');
        }
        if (p2DivRef.current) {
            p2DivRef.current.classList.remove('active');
        }
        updateUI();
    }, [initialTime, updateUI]);

    // Toggle start/pause/resume
    const toggleGame = useCallback(() => {
        initAudio();
        if (!runningRef.current) {
            if (startBtnText === 'Start') {
                speak('Game Start');
            }
            runningRef.current = true;
            setRunning(true);
            setStartBtnText('Pause');
            lastTimestampRef.current = null;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(loop);
        } else {
            speak('Game Pause');
            runningRef.current = false;
            setRunning(false);
            setStartBtnText('Resume');
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
    }, [startBtnText, speak, loop, initAudio]);

    // Mode selection
    const handleModeClick = useCallback((mode, time) => {
        setActiveMode(mode);
        setInitialTime(time);
        // Reset game with new time
        runningRef.current = false;
        setRunning(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setStartBtnText('Start');
        lastTimestampRef.current = null;
        p1Ref.current = time;
        p2Ref.current = time;
        setP1(time);
        setP2(time);
        setCurrentPlayer(1);
        currentPlayerRef.current = 1;
        if (p1DivRef.current) {
            p1DivRef.current.classList.add('active');
        }
        if (p2DivRef.current) {
            p2DivRef.current.classList.remove('active');
        }
        updateUI();
    }, [updateUI]);

    // Tap switch handlers
    const handleP1Click = useCallback(() => {
        if (!runningRef.current) return;

        if (currentPlayerRef.current === 1) {
            switchSound();
            currentPlayerRef.current = 2;
            setCurrentPlayer(2);
            if (p1DivRef.current) p1DivRef.current.classList.remove('active');
            if (p2DivRef.current) p2DivRef.current.classList.add('active');
        }
    }, [switchSound]);

    const handleP2Click = useCallback(() => {
        if (!runningRef.current) return;

        if (currentPlayerRef.current === 2) {
            switchSound();
            currentPlayerRef.current = 1;
            setCurrentPlayer(1);
            if (p2DivRef.current) p2DivRef.current.classList.remove('active');
            if (p1DivRef.current) p1DivRef.current.classList.add('active');
        }
    }, [switchSound]);

    // Initial UI update
    useEffect(() => {
        updateUI();
        if (p1DivRef.current) p1DivRef.current.classList.add('active');
    }, [updateUI]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <>
            {/* Preloader */}
            {preloaderVisible && (
                <div id="preloader" style={{
                    position: 'fixed',
                    inset: 0,
                    background: '#0a0a0a',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    transition: 'opacity 0.5s'
                }}>
                    <img
                        src="https://werksplay.opswerks.space/assets/werksplay-logo-DDXqE2my.png"
                        alt="logo"
                        style={{
                            width: '140px',
                            animation: 'pulse 1.2s infinite'
                        }}
                    />
                </div>
            )}

            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                    -webkit-tap-highlight-color: transparent;
                }
                
                body {
                    height: 100vh;
                    overflow: hidden;
                    background: #0a0a0a;
                    color: white;
                    touch-action: manipulation;
                }
                
                #preloader img {
                    animation: pulse 1.2s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                    100% { transform: scale(1); }
                }
                
                .container {
                    height: 100vh;
                    height: 100dvh;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    max-width: 100%;
                    margin: 0 auto;
                }
                
                .clock {
                    flex: 1;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    user-select: none;
                    cursor: pointer;
                    min-height: 0;
                    width: 100%;
                }
                
                .clock.disabled {
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                
                .clock::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: var(--level, 100%);
                    transition: height 0.08s linear;
                }
                
                .bottom::before {
                    bottom: 0;
                    background: linear-gradient(180deg, #00c853, #2eea7a);
                }
                
                .top::before {
                    top: 0;
                    background: linear-gradient(180deg, #2962ff, #42a5f5);
                }
                
                .clock::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15), transparent 40%);
                    opacity: 0.35;
                    animation: wave 2s infinite linear;
                }
                
                @keyframes wave {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(-20px); }
                    100% { transform: translateX(0); }
                }
                
                .ui {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px;
                    width: 100%;
                    max-width: 600px;
                }
                
                #p2 .ui {
                    transform: rotate(180deg);
                }
                
                .player {
                    font-size: clamp(14px, 2.5vw, 24px);
                    opacity: 0.85;
                    margin-bottom: clamp(4px, 1vw, 12px);
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                
                .time {
                    font-size: clamp(42px, 12vw, 120px);
                    font-weight: 900;
                    text-shadow: 0 0 20px rgba(0,0,0,0.35);
                    line-height: 1;
                    letter-spacing: 2px;
                }
                
                .badge {
                    margin-top: clamp(6px, 1.5vw, 14px);
                    padding: clamp(4px, 0.8vw, 10px) clamp(10px, 2vw, 20px);
                    border-radius: 999px;
                    font-size: clamp(10px, 1.2vw, 16px);
                    font-weight: 900;
                    opacity: 0;
                    transition: opacity 0.2s;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }
                
                #p1.active .badge {
                    opacity: 1;
                    background: #00e676;
                    color: black;
                    box-shadow: 0 0 18px #00e676;
                }
                
                #p2.active .badge {
                    opacity: 1;
                    background: #42a5f5;
                    color: black;
                    box-shadow: 0 0 18px #42a5f5;
                }
                
                .active {
                    box-shadow: inset 0 0 90px rgba(255,255,255,0.08);
                }
                
                .middle {
                    padding: clamp(8px, 1.5vw, 16px);
                    display: flex;
                    flex-direction: column;
                    gap: clamp(8px, 1.5vw, 14px);
                    background: #111;
                    border-top: 1px solid #222;
                    border-bottom: 1px solid #222;
                    flex-shrink: 0;
                    width: 100%;
                }
                
                .modes {
                    display: flex;
                    gap: clamp(6px, 1vw, 14px);
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    padding: 2px 0;
                    justify-content: center;
                    flex-wrap: nowrap;
                }
                
                .modes::-webkit-scrollbar {
                    display: none;
                }
                
                .mode {
                    padding: clamp(8px, 1.2vw, 14px) clamp(12px, 2vw, 24px);
                    background: #222;
                    border-radius: 12px;
                    font-weight: 700;
                    color: #aaa;
                    white-space: nowrap;
                    cursor: pointer;
                    font-size: clamp(12px, 1.2vw, 18px);
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    touch-action: manipulation;
                }
                
                .mode:active {
                    transform: scale(0.95);
                }
                
                .activeMode {
                    background: #00e676;
                    color: black;
                }
                
                .controls {
                    display: flex;
                    gap: clamp(8px, 1.5vw, 14px);
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                }
                
                button {
                    flex: 1;
                    padding: clamp(12px, 2vw, 18px);
                    border: none;
                    border-radius: 14px;
                    font-weight: 900;
                    font-size: clamp(13px, 1.5vw, 20px);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    touch-action: manipulation;
                    min-height: clamp(44px, 7vw, 60px);
                }
                
                button:active {
                    transform: scale(0.95);
                }
                
                .start {
                    background: #00c853;
                }
                
                .start:active {
                    background: #00b34a;
                }
                
                .reset {
                    background: #ff3d57;
                }
                
                .reset:active {
                    background: #e6354e;
                }
                
                /* Back Button */
                .back-button {
                    position: absolute;
                    top: clamp(12px, 2.5vw, 24px);
                    left: clamp(12px, 2.5vw, 24px);
                    z-index: 10;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    width: clamp(40px, 6vw, 56px);
                    height: clamp(40px, 6vw, 56px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-decoration: none;
                    font-size: 20px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    touch-action: manipulation;
                }
                
                .back-button:active {
                    transform: scale(0.9);
                }
                
                .back-button svg {
                    width: clamp(18px, 3vw, 28px);
                    height: clamp(18px, 3vw, 28px);
                    fill: none;
                    stroke: white;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                
                /* Large screens */
                @media (min-width: 1024px) {
                    .container {
                        max-width: 800px;
                    }
                    
                    .time {
                        font-size: clamp(80px, 10vw, 120px);
                    }
                    
                    .ui {
                        max-width: 700px;
                    }
                    
                    .controls {
                        max-width: 700px;
                    }
                }
                
                /* Very Large screens */
                @media (min-width: 1440px) {
                    .container {
                        max-width: 1000px;
                    }
                    
                    .time {
                        font-size: clamp(100px, 12vw, 140px);
                    }
                    
                    .ui {
                        max-width: 800px;
                    }
                    
                    .controls {
                        max-width: 800px;
                    }
                }
                
                /* Very Small Screens */
                @media (max-width: 480px) {
                    .time {
                        font-size: clamp(36px, 12vw, 48px);
                    }
                    
                    .player {
                        font-size: clamp(12px, 2.2vw, 14px);
                    }
                    
                    .mode {
                        font-size: clamp(11px, 2vw, 12px);
                        padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px);
                    }
                    
                    button {
                        font-size: clamp(12px, 2.2vw, 13px);
                        padding: clamp(10px, 2vw, 12px);
                        min-height: clamp(40px, 8vw, 44px);
                    }
                    
                    .badge {
                        font-size: clamp(9px, 1.8vw, 10px);
                        padding: clamp(3px, 0.8vw, 4px) clamp(8px, 1.5vw, 10px);
                    }
                    
                    .controls {
                        max-width: 100%;
                    }
                }
                
                /* Extra Small Screens (e.g., iPhone SE) */
                @media (max-width: 380px) {
                    .time {
                        font-size: clamp(30px, 10vw, 36px);
                    }
                    
                    .player {
                        font-size: 11px;
                    }
                    
                    .mode {
                        font-size: 10px;
                        padding: 6px 8px;
                    }
                    
                    button {
                        font-size: 11px;
                        padding: 8px;
                        min-height: 36px;
                    }
                    
                    .middle {
                        padding: 6px;
                        gap: 6px;
                    }
                    
                    .controls {
                        gap: 6px;
                    }
                    
                    .modes {
                        gap: 4px;
                    }
                }
                
                /* Landscape phone orientation */
                @media (max-height: 500px) and (orientation: landscape) {
                    .time {
                        font-size: clamp(28px, 8vh, 40px);
                    }
                    
                    .player {
                        font-size: clamp(10px, 2vh, 12px);
                        margin-bottom: 2px;
                    }
                    
                    .badge {
                        margin-top: 3px;
                        padding: 2px 8px;
                        font-size: 8px;
                    }
                    
                    .middle {
                        padding: 4px 8px;
                        gap: 4px;
                    }
                    
                    .mode {
                        padding: 4px 8px;
                        font-size: 10px;
                    }
                    
                    button {
                        padding: 6px 10px;
                        font-size: 10px;
                        min-height: 30px;
                    }
                    
                    .ui {
                        padding: 4px;
                    }
                    
                    .controls {
                        max-width: 100%;
                    }
                }
            `}</style>

            <div className="container">
                {/* Back Button */}
                <Link to="/tools" className="back-button" aria-label="Back to tools">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 12H5"/>
                        <path d="M12 19l-7-7 7-7"/>
                    </svg>
                </Link>

                {/* Player 2 */}
                <div
                    id="p2"
                    ref={p2DivRef}
                    className={`clock top ${!running ? 'disabled' : ''}`}
                    onClick={handleP2Click}
                >
                    <div className="ui">
                        <div className="player">Player 2</div>
                        <div id="time2" className="time" ref={time2Ref}>01:00</div>
                        <div className="badge">YOUR TURN</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="middle">
                    <div className="modes">
                        {['Bullet', 'Blitz', 'Rapid'].map((mode, idx) => {
                            const times = [60, 180, 600];
                            return (
                                <div
                                    key={mode}
                                    className={`mode ${activeMode === mode ? 'activeMode' : ''}`}
                                    onClick={() => handleModeClick(mode, times[idx])}
                                >
                                    {mode}
                                </div>
                            );
                        })}
                    </div>
                    <div className="controls">
                        <button className="start" onClick={toggleGame}>
                            {startBtnText}
                        </button>
                        <button className="reset" onClick={resetGame}>
                            Reset
                        </button>
                    </div>
                </div>

                {/* Player 1 */}
                <div
                    id="p1"
                    ref={p1DivRef}
                    className={`clock bottom active ${!running ? 'disabled' : ''}`}
                    onClick={handleP1Click}
                >
                    <div className="ui">
                        <div className="player">Player 1</div>
                        <div id="time1" className="time" ref={time1Ref}>01:00</div>
                        <div className="badge">YOUR TURN</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChessClock;