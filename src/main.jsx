import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ImagePlus, Loader2, Music2, RotateCcw, Sparkles, Trash2, Trophy, X, Volume2 } from 'lucide-react';
import './styles.css';

const sampleJerseys = [
  { id: 'argentina', name: 'Sky Stripe', primary: '#74ACDF', secondary: '#FFFFFF', image: null },
  { id: 'brazil', name: 'Yellow Magic', primary: '#F7D117', secondary: '#1A7F37', image: null },
  { id: 'mexico', name: 'Green Fire', primary: '#006847', secondary: '#CE1126', image: null },
];

const fanColors = ['#00A859', '#F7D117', '#0057B8', '#E11D48', '#FFFFFF', '#111827'];
const STORAGE_KEY = 'soccer-jersey-roulette:kits';
const SPIN_DURATION = 5200;

function makeId()
{
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadSavedJerseys()
{
  try
  {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : sampleJerseys;
  } catch
  {
    return sampleJerseys;
  }
}

function readFileAsDataUrl(file)
{
  return new Promise((resolve, reject) =>
  {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function cropImageToDataUrl(source, crop)
{
  return new Promise((resolve, reject) =>
  {
    const image = new Image();
    image.addEventListener('load', () =>
    {
      const size = 640;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;

      const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
      const scale = baseScale * crop.zoom;
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (size - width) / 2 + (crop.x / 100) * (size / 2);
      const y = (size - height) / 2 + (crop.y / 100) * (size / 2);

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, x, y, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
    image.addEventListener('error', reject);
    image.src = source;
  });
}

function playSpinSound()
{
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  for (let index = 0; index < 18; index += 1)
  {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + index * 0.07;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300 + index * 20, start);
    osc.frequency.exponentialRampToValueAtTime(150 + index * 14, start + 0.055);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.55, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.07);
  }

  setTimeout(() => ctx.close(), 1900);
}

function playWinSound()
{
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.14;
  master.connect(ctx.destination);
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) =>
  {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + index * 0.13;
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.7, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.32);
  });

  setTimeout(() => ctx.close(), 1300);
}

function playSpaghettiSound()
{
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.04);
  master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
  master.connect(ctx.destination);

  for (let burst = 0; burst < 9; burst += 1)
  {
    const bufferSize = ctx.sampleRate * 0.16;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1)
    {
      data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
    }

    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const start = ctx.currentTime + burst * 0.055;
    filter.type = 'bandpass';
    filter.frequency.value = 900 + burst * 230;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.55, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start(start);
  }

  setTimeout(() => ctx.close(), 1900);
}

function RibbonStorm({ active })
{
  const ribbons = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.65}s`,
        color: fanColors[index % fanColors.length],
        width: `${8 + Math.random() * 10}px`,
        height: `${54 + Math.random() * 76}px`,
        fallX: `${-120 + Math.random() * 240}px`,
        spin: `${360 + Math.random() * 900}deg`,
        time: `${2.5 + Math.random() * 1.8}s`,
      })),
    [active],
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {ribbons.map((ribbon) => (
        <span
          aria-hidden="true"
          className="absolute top-0 rounded-full opacity-95 animate-ribbonFall"
          key={ribbon.id}
          style={{
            left: ribbon.left,
            width: ribbon.width,
            height: ribbon.height,
            background: ribbon.color,
            animationDelay: ribbon.delay,
            '--fall-x': ribbon.fallX,
            '--spin': ribbon.spin,
            '--fall-time': ribbon.time,
          }}
        />
      ))}
    </div>
  );
}

function WinnerReveal({ winner, active })
{
  const crowd = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => ({
        id: index,
        color: fanColors[index % fanColors.length],
        delay: `${(index % 12) * 0.055}s`,
      })),
    [],
  );

  if (!active || !winner) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div className="stadium-flash" aria-hidden="true" />
      <div className="winner-spotlight" aria-hidden="true" />
      <div className="absolute inset-x-0 top-8 flex justify-center px-4">
        <div className="matchday-banner rounded-[8px] border border-white/30 bg-[#f9df4a] px-5 py-3 text-center font-black uppercase text-[#052e16] shadow-glow">
          Today's Match Kit
        </div>
      </div>
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="winner-card rounded-[8px] border border-white/30 bg-[#052e16]/90 p-5 text-center shadow-glow backdrop-blur-md">
          <Trophy className="mx-auto mb-3 trophy-bounce text-[#f9df4a]" size={46} />
          <div className="mx-auto grid h-44 w-44 place-items-center overflow-hidden rounded-[8px] border-4 border-white bg-white">
            {winner.image ? (
              <img alt="" className="h-full w-full object-cover" src={winner.image} />
            ) : (
              <span className="jersey-icon scale-[1.9]" style={{ '--kit': winner.primary, '--trim': winner.secondary }} />
            )}
          </div>
          <h2 className="mt-4 max-w-[280px] text-3xl font-black leading-tight">{winner.name}</h2>
        </div>
      </div>
      <div className="crowd-wave absolute inset-x-0 bottom-0 flex h-24 items-end justify-center gap-1 px-2">
        {crowd.map((fan) => (
          <span
            aria-hidden="true"
            className="crowd-fan"
            key={fan.id}
            style={{ background: fan.color, animationDelay: fan.delay }}
          />
        ))}
      </div>
    </div>
  );
}

function SoccerBallIcon({ spinning = false })
{
  return (
    <svg
      aria-hidden="true"
      className={`center-soccer-ball ${spinning ? 'center-soccer-ball-spinning' : ''}`}
      viewBox="0 0 120 120"
    >
      <defs>
        <radialGradient id="ballFace" cx="33%" cy="24%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="48%" stopColor="#f8fafc" />
          <stop offset="78%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <filter id="ballShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.28" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="55" fill="url(#ballFace)" filter="url(#ballShadow)" />
      <path
        className="ball-seam"
        d="M60 8 C86 13 107 34 112 60 M112 60 C107 86 86 107 60 112 M60 112 C34 107 13 86 8 60 M8 60 C13 34 34 13 60 8"
      />
      <polygon className="ball-black-panel" points="60,34 84,51 75,80 45,80 36,51" />
      <polygon className="ball-black-panel" points="60,7 73,20 67,36 53,36 47,20" />
      <polygon className="ball-black-panel" points="106,45 113,62 101,75 86,66 89,50" />
      <polygon className="ball-black-panel" points="88,96 72,112 55,106 56,90 72,84" />
      <polygon className="ball-black-panel" points="32,96 48,112 65,106 64,90 48,84" />
      <polygon className="ball-black-panel" points="14,45 7,62 19,75 34,66 31,50" />
      <path className="ball-seam" d="M47 20 L36 51 M73 20 L84 51 M84 51 L106 45 M75 80 L88 96 M45 80 L32 96 M36 51 L14 45" />
      <path className="ball-seam" d="M45 80 L19 75 M75 80 L101 75 M53 36 L36 51 M67 36 L84 51" />
      <ellipse cx="41" cy="27" rx="23" ry="13" fill="rgba(255,255,255,0.48)" transform="rotate(-24 41 27)" />
    </svg>
  );
}

function CropEditor({ draft, crop, onCancel, onCropChange, onSave })
{
  if (!draft) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#020617]/80 px-4 py-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[8px] border border-white/20 bg-[#052e16] p-4 text-white shadow-glow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f9df4a]">Crop jersey</p>
            <h2 className="truncate text-2xl font-black">{draft.name}</h2>
          </div>
          <button
            aria-label="Cancel crop"
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/20 bg-white/10 transition hover:bg-white/20"
            onClick={onCancel}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="crop-stage mx-auto mt-4">
          <img
            alt=""
            src={draft.source}
            style={{
              transform: `translate(${crop.x}%, ${crop.y}%) scale(${crop.zoom})`,
            }}
          />
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm font-bold">
            Zoom
            <input
              max="2.8"
              min="1"
              onChange={(event) => onCropChange({ ...crop, zoom: Number(event.target.value) })}
              step="0.05"
              type="range"
              value={crop.zoom}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Move left/right
            <input
              max="60"
              min="-60"
              onChange={(event) => onCropChange({ ...crop, x: Number(event.target.value) })}
              step="1"
              type="range"
              value={crop.x}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Move up/down
            <input
              max="60"
              min="-60"
              onChange={(event) => onCropChange({ ...crop, y: Number(event.target.value) })}
              step="1"
              type="range"
              value={crop.y}
            />
          </label>
        </div>

        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#f9df4a] px-5 py-3 font-black uppercase text-[#052e16] transition hover:translate-y-[-1px]"
          onClick={onSave}
          type="button"
        >
          <Check size={20} />
          Add to wheel
        </button>
      </div>
    </div>
  );
}

function App()
{
  const [jerseys, setJerseys] = useState(loadSavedJerseys);
  const [winner, setWinner] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [musicUrl, setMusicUrl] = useState('');
  const [musicName, setMusicName] = useState('No anthem loaded');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [cropQueue, setCropQueue] = useState([]);
  const [cropDraft, setCropDraft] = useState(null);
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, zoom: 1 });
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const musicInputRef = useRef(null);

  useEffect(() =>
  {
    try
    {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jerseys));
    } catch
    {
      // Large image collections can exceed browser storage. The app still works for the current session.
    }
  }, [jerseys]);

  useEffect(() =>
  {
    if (!showReveal) return undefined;
    const timer = window.setTimeout(() => setShowReveal(false), 6200);
    return () => window.clearTimeout(timer);
  }, [showReveal]);

  useEffect(() =>
  {
    const audio = audioRef.current;
    if (!audio) return;

    if (!soundOn)
    {
      audio.pause();
      setMusicPlaying(false);
    }
  }, [soundOn]);

  useEffect(() => () =>
  {
    if (musicUrl) URL.revokeObjectURL(musicUrl);
  }, [musicUrl]);

  const canSpin = jerseys.length > 1 && !isSpinning;
  const segmentAngle = 360 / Math.max(jerseys.length, 1);
  const tokenSize = jerseys.length > 12 ? 48 : jerseys.length > 8 ? 56 : 72;
  const tokenRadius = jerseys.length > 12 ? '86px' : jerseys.length > 8 ? '104px' : '126px';

  async function handleFiles(event)
  {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const next = await Promise.all(files.map(async (file, index) =>
    {
      const color = fanColors[(jerseys.length + index) % fanColors.length];
      const accent = fanColors[(jerseys.length + index + 2) % fanColors.length];
      return {
        id: makeId(),
        name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0, 24) || 'My Jersey',
        primary: color,
        secondary: accent,
        source: await readFileAsDataUrl(file),
      };
    }));

    setCropQueue(next.slice(1));
    setCropDraft(next[0]);
    setCropSettings({ x: 0, y: 0, zoom: 1 });
    event.target.value = '';
  }

  function openNextCrop(queue)
  {
    const [next, ...rest] = queue;
    setCropQueue(rest);
    setCropDraft(next || null);
    setCropSettings({ x: 0, y: 0, zoom: 1 });
  }

  function cancelCrop()
  {
    openNextCrop(cropQueue);
  }

  async function saveCroppedJersey()
  {
    if (!cropDraft) return;

    const image = await cropImageToDataUrl(cropDraft.source, cropSettings);
    setJerseys((current) => [...current, { ...cropDraft, image, source: undefined }]);
    openNextCrop(cropQueue);
  }

  function removeJersey(id)
  {
    setJerseys((current) => current.filter((jersey) => jersey.id !== id));
    if (winner?.id === id) setWinner(null);
  }

  function updateJersey(id, field, value)
  {
    setJerseys((current) => current.map((jersey) => (jersey.id === id ? { ...jersey, [field]: value } : jersey)));
  }

  function handleMusicFile(event)
  {
    const [file] = Array.from(event.target.files || []);
    if (!file) return;

    if (musicUrl) URL.revokeObjectURL(musicUrl);
    const nextUrl = URL.createObjectURL(file);
    setMusicUrl(nextUrl);
    setMusicName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0, 28) || 'Match Anthem');
    event.target.value = '';

    window.setTimeout(() =>
    {
      const audio = audioRef.current;
      if (!audio || !soundOn) return;
      audio.volume = 0.35;
      audio.loop = true;
      audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }, 0);
  }

  function startMatchMusic()
  {
    const audio = audioRef.current;
    if (!audio || !musicUrl || !soundOn) return;

    audio.loop = true;
    audio.volume = 0.35;
    audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
  }

  function toggleMatchMusic()
  {
    const audio = audioRef.current;
    if (!audio || !musicUrl || !soundOn) return;

    if (audio.paused)
    {
      startMatchMusic();
      return;
    }

    audio.pause();
    setMusicPlaying(false);
  }

  function spin()
  {
    if (!canSpin) return;

    const winnerIndex = Math.floor(Math.random() * jerseys.length);
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const currentAngle = ((rotation % 360) + 360) % 360;
    const landingCorrection = (targetAngle - currentAngle + 360) % 360;
    const newRotation = rotation + 1800 + landingCorrection;

    setWinner(null);
    setShowReveal(false);
    setIsSpinning(true);
    setRotation(newRotation);
    startMatchMusic();
    if (soundOn) playSpinSound();

    window.setTimeout(() =>
    {
      setWinner(jerseys[winnerIndex]);
      setShowReveal(true);
      setIsSpinning(false);
      if (soundOn)
      {
        playWinSound();
        playSpaghettiSound();
      }
    }, SPIN_DURATION);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#07823a] text-white">
      <audio ref={audioRef} src={musicUrl} />
      <CropEditor
        crop={cropSettings}
        draft={cropDraft}
        onCancel={cancelCrop}
        onCropChange={setCropSettings}
        onSave={saveCroppedJersey}
      />
      <RibbonStorm active={showReveal} />
      <WinnerReveal active={showReveal} winner={winner} />
      <section className="relative min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 field-lines" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-5 lg:grid-cols-[1fr_380px]">
          <div className="flex min-h-[640px] flex-col justify-between rounded-[8px] border border-white/20 bg-white/10 p-4 shadow-pitch backdrop-blur-md sm:p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f9df4a]">Mmmh.. What jersey to wear?</p>
                <h1 className="text-3xl font-black leading-tight sm:text-5xl">Jersey Roulette</h1>
              </div>
              <button
                aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-[8px] border transition ${soundOn ? 'border-[#f9df4a] bg-[#f9df4a] text-[#052e16]' : 'border-white/25 bg-white/10 text-white'
                  }`}
                onClick={() => setSoundOn((value) => !value)}
                type="button"
              >
                <Volume2 size={20} />
              </button>
            </header>

            <div className="grid flex-1 place-items-center py-6">
              <div className="relative w-full max-w-[620px]">
                <div className="pointer" aria-hidden="true" />
                <div
                  className={`roulette-wheel-shell relative aspect-square rounded-full border-[10px] border-white bg-white p-3 shadow-glow transition-transform ease-[cubic-bezier(.08,.76,.12,1)] ${isSpinning ? 'roulette-wheel-spinning' : ''
                    }`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="roulette-ball absolute inset-3 rounded-full" aria-hidden="true">
                    <span className="soccer-patch soccer-patch-center soccer-patch-blue" />
                    <span className="soccer-patch soccer-patch-top soccer-patch-red" />
                    <span className="soccer-patch soccer-patch-right soccer-patch-green" />
                    <span className="soccer-patch soccer-patch-bottom-right soccer-patch-blue" />
                    <span className="soccer-patch soccer-patch-bottom-left soccer-patch-green" />
                    <span className="soccer-patch soccer-patch-left soccer-patch-red" />
                    <span className="soccer-ball-shine" />
                  </div>
                  {jerseys.map((jersey, index) =>
                  {
                    const angle = index * segmentAngle + segmentAngle / 2;
                    return (
                      <div
                        className="absolute left-1/2 top-1/2 z-30 text-center"
                        key={jersey.id}
                        style={{
                          '--token-radius': tokenRadius,
                          '--token-size': `${tokenSize}px`,
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--token-radius)))`,
                        }}
                      >
                        <div className="jersey-wheel-token flex items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                          {jersey.image ? (
                            <img alt="" className="h-full w-full object-cover" src={jersey.image} />
                          ) : (
                            <span className="jersey-icon" style={{ '--kit': jersey.primary, '--trim': jersey.secondary }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className={`center-ball-hub absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-white text-[#052e16] shadow-lg ${isSpinning ? 'center-ball-hub-spinning' : ''
                    }`}>
                    <SoccerBallIcon spinning={isSpinning} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="min-h-[112px] rounded-[8px] border border-white/20 bg-[#052e16]/70 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f9df4a]">Today you wear</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-white/30 bg-white">
                    {winner?.image ? (
                      <img alt="" className="h-full w-full object-cover" src={winner.image} />
                    ) : (
                      <Sparkles className={winner ? 'text-[#07823a]' : 'text-slate-300'} size={28} />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${winner ? 'animate-scorePulse' : ''}`}>
                      {winner ? winner.name : 'Spin to decide'}
                    </h2>
                    <p className="text-sm text-white/75">
                      {winner ? 'Celebration unlocked. Go play in style.' : 'Upload your jerseys, then hit the whistle.'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="inline-flex min-h-16 items-center justify-center gap-2 rounded-[8px] bg-[#f9df4a] px-8 text-lg font-black uppercase text-[#052e16] shadow-lg transition hover:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSpin}
                onClick={spin}
                type="button"
              >
                {isSpinning ? <Loader2 className="animate-spin" size={22} /> : <RotateCcw size={22} />}
                Spin
              </button>
            </div>
          </div>

          <aside className="rounded-[8px] border border-white/20 bg-[#061f16]/85 p-4 shadow-pitch backdrop-blur-md sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Your Jerseys</h2>
                <p className="text-sm text-white/70">{jerseys.length} kits in the wheel</p>
              </div>
              <button
                aria-label="Import jersey images"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-[#052e16] transition hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <ImagePlus size={22} />
              </button>
              <input
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleFiles}
                ref={fileInputRef}
                type="file"
              />
            </div>

            <div className="mt-4 rounded-[8px] border border-[#f9df4a]/30 bg-[#f9df4a]/10 p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#f9df4a] text-[#052e16]">
                  <Music2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{musicName}</p>
                  <p className="text-xs text-white/65">{musicPlaying ? 'Playing while this page is open' : 'Import, then press play'}</p>
                </div>
                <button
                  aria-label={musicPlaying ? 'Pause match anthem' : 'Play match anthem'}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-white transition hover:border-[#f9df4a] hover:text-[#f9df4a] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!musicUrl || !soundOn}
                  onClick={toggleMatchMusic}
                  type="button"
                >
                  <Volume2 size={19} />
                </button>
                <button
                  aria-label="Import match anthem"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-white transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                  onClick={() => musicInputRef.current?.click()}
                  type="button"
                >
                  <ImagePlus size={19} />
                </button>
                <input
                  accept="audio/*"
                  className="hidden"
                  onChange={handleMusicFile}
                  ref={musicInputRef}
                  type="file"
                />
              </div>
            </div>

            <div className="mt-5 grid max-h-[calc(100vh-160px)] gap-3 overflow-y-auto pr-1">
              {jerseys.map((jersey) => (
                <article className="rounded-[8px] border border-white/15 bg-white/10 p-3" key={jersey.id}>
                  <div className="flex gap-3">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-white">
                      {jersey.image ? (
                        <img alt="" className="h-full w-full object-cover" src={jersey.image} />
                      ) : (
                        <span className="jersey-icon scale-75" style={{ '--kit': jersey.primary, '--trim': jersey.secondary }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        aria-label="Jersey name"
                        className="w-full rounded-[8px] border border-white/15 bg-[#03150f] px-3 py-2 text-sm font-bold outline-none transition focus:border-[#f9df4a]"
                        onChange={(event) => updateJersey(jersey.id, 'name', event.target.value)}
                        value={jersey.name}
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          aria-label="Primary color"
                          className="h-9 w-12 cursor-pointer rounded-[8px] border-0 bg-transparent"
                          onChange={(event) => updateJersey(jersey.id, 'primary', event.target.value)}
                          type="color"
                          value={jersey.primary}
                        />
                        <input
                          aria-label="Secondary color"
                          className="h-9 w-12 cursor-pointer rounded-[8px] border-0 bg-transparent"
                          onChange={(event) => updateJersey(jersey.id, 'secondary', event.target.value)}
                          type="color"
                          value={jersey.secondary}
                        />
                        <button
                          aria-label={`Remove ${jersey.name}`}
                          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/15 text-white/75 transition hover:border-[#e11d48] hover:bg-[#e11d48] hover:text-white"
                          onClick={() => removeJersey(jersey.id)}
                          type="button"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
