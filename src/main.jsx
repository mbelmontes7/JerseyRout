import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, Check, Dice5, ImagePlus, Loader2, Music2, RotateCcw, Sparkles, Trash2, Trophy, X, Volume2 } from 'lucide-react';
import './styles.css';

const sampleJerseys = [
  { id: 'argentina', name: 'Sky Stripe', primary: '#74ACDF', secondary: '#FFFFFF', image: null },
  { id: 'brazil', name: 'Yellow Magic', primary: '#F7D117', secondary: '#1A7F37', image: null },
  { id: 'mexico', name: 'Green Fire', primary: '#006847', secondary: '#CE1126', image: null },
];

const fanColors = ['#00A859', '#F7D117', '#0057B8', '#E11D48', '#FFFFFF', '#111827'];
const STORAGE_KEY = 'soccer-jersey-roulette:kits';
const SCOREBOARD_STORAGE_KEY = 'soccer-dice-scoreboard:players';
const FIELD_SCOREBOARD_STORAGE_KEY = 'soccer-field-scoreboard:players';
const SPIN_DURATION = 5200;
const challengeOptions = [
  { number: 1, title: 'First touch first', detail: 'Great players make the next play easier with the first touch.', tag: 'Control' },
  { number: 2, title: 'Keep showing up', detail: 'Every touch on the ball is a small vote for the player you are becoming.', tag: 'Mindset' },
  { number: 3, title: 'Play brave', detail: 'Mistakes are proof that you are trying skills that can make you better.', tag: 'Confidence' },
  { number: 4, title: 'Fast feet, calm head', detail: 'The ball moves better when your mind stays quiet.', tag: 'Focus' },
  { number: 5, title: 'Win the little moments', detail: 'One clean touch, one quick turn, one smart pass. That is how games change.', tag: 'Discipline' },
  { number: 6, title: 'Train your rhythm', detail: 'When your feet find rhythm, the ball starts to feel lighter.', tag: 'Flow' },
  { number: 7, title: 'Trust the work', detail: 'The player you want to be is built when nobody is watching.', tag: 'Work' },
  { number: 8, title: 'Play with joy', detail: 'The best soccer starts with loving the ball at your feet.', tag: 'Joy' },
  { number: 9, title: 'Stay hungry', detail: 'Good is a checkpoint, not the finish line.', tag: 'Ambition' },
  { number: 10, title: 'Own the ball', detail: 'Be patient, stay balanced, and make the ball listen.', tag: 'Skill' },
  { number: 11, title: 'Reset and go', detail: 'Bad touch? Next touch. Keep playing.', tag: 'Resilience' },
  { number: 12, title: 'Game day energy', detail: 'Bring effort first. The confidence follows.', tag: 'Energy' },
  { number: 13, title: 'Pressure is a privilege', detail: 'Big moments are invitations to show your work.', tag: 'Courage' },
  { number: 14, title: 'Simple wins', detail: 'A clean pass at the right time can be more powerful than a flashy move.', tag: 'IQ' },
  { number: 15, title: 'Move again', detail: 'After every pass, move. Soccer rewards players who stay available.', tag: 'Movement' },
  { number: 16, title: 'Be hard to stop', detail: 'Balance, effort, and belief make you difficult to play against.', tag: 'Strength' },
  { number: 17, title: 'See the field', detail: 'Lift your head, scan early, and the game slows down.', tag: 'Vision' },
  { number: 18, title: 'Earn confidence', detail: 'Confidence comes from doing the small work again and again.', tag: 'Growth' },
  { number: 19, title: 'Play for the next touch', detail: 'The last touch is gone. The next one is yours.', tag: 'Reset' },
  { number: 20, title: 'Bring the fire', detail: 'Play with heart, run with purpose, and leave no lazy touch behind.', tag: 'Passion' },
];

const fieldChallengeOptions = [
  {
    id: 'crossbar',
    name: 'Crossbar Challenge',
    spot: 'Top box',
    detail: 'Place the ball outside the box. Take 5 shots and try to hit the crossbar. Score 1 point for every hit.',
    x: '50%',
    y: '17%',
  },
  {
    id: 'penalty',
    name: 'Penalty Corners',
    spot: 'Penalty spot',
    detail: 'Take 6 penalty shots. Alternate aiming bottom left and bottom right. Score only clean corner shots.',
    x: '50%',
    y: '31%',
  },
  {
    id: 'dribble',
    name: 'Dribble Lane',
    spot: 'Midfield',
    detail: 'Set 5 cones in a line. Dribble through twice with control, then sprint back with the ball.',
    x: '50%',
    y: '52%',
  },
  {
    id: 'corner',
    name: 'Corner Target',
    spot: 'Corner arc',
    detail: 'From the corner, try to land 5 crosses into a target zone near the penalty spot.',
    x: '16%',
    y: '20%',
  },
  {
    id: 'first-touch',
    name: 'First Touch Box',
    spot: 'Right channel',
    detail: 'Pass against a wall or partner. First touch must stay inside a small square, then pass back clean.',
    x: '78%',
    y: '58%',
  },
  {
    id: 'weak-foot',
    name: 'Weak Foot Gate',
    spot: 'Left channel',
    detail: 'Create a small gate with cones. Pass through it 10 times using only your weaker foot.',
    x: '22%',
    y: '64%',
  },
];

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

function loadSavedPlayers()
{
  try
  {
    const saved = window.localStorage.getItem(SCOREBOARD_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch
  {
    return [];
  }
}

function loadSavedFieldPlayers()
{
  try
  {
    const saved = window.localStorage.getItem(FIELD_SCOREBOARD_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch
  {
    return [];
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

function playDiceLandingSound()
{
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.2;
  master.connect(ctx.destination);

  [140, 92].forEach((freq, index) =>
  {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + index * 0.055;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, start + 0.08);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.8, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.15);
  });

  setTimeout(() => ctx.close(), 500);
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

function ChallengePage({ onBack })
{
  const [challenge, setChallenge] = useState(challengeOptions[0]);
  const [rolling, setRolling] = useState(false);
  const [landed, setLanded] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [players, setPlayers] = useState(loadSavedPlayers);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [targetScore, setTargetScore] = useState(5);
  const [scoreWinner, setScoreWinner] = useState(null);
  const sideNumbers = useMemo(() =>
  {
    const current = challenge.number;
    return [
      current,
      (current % 20) + 1,
      ((current + 1) % 20) + 1,
      ((current + 2) % 20) + 1,
      ((current + 3) % 20) + 1,
      ((current + 4) % 20) + 1,
    ];
  }, [challenge.number]);
  const topScore = players.length ? Math.max(...players.map((player) => player.score)) : 0;
  const lowScore = players.length ? Math.min(...players.map((player) => player.score)) : 0;

  useEffect(() =>
  {
    try
    {
      window.localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(players));
    } catch
    {
      // If browser storage is unavailable, the scoreboard still works until refresh.
    }
  }, [players]);

  function addPlayer()
  {
    const name = newPlayerName.trim();
    if (!name) return;

    setPlayers((current) => [...current, { id: makeId(), name, score: 0 }]);
    setNewPlayerName('');
  }

  function updatePlayerName(id, name)
  {
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, name } : player)));
  }

  function updatePlayerScore(id, amount)
  {
    setPlayers((current) => current.map((player) =>
    {
      if (player.id !== id) return player;

      const nextScore = Math.max(0, player.score + amount);
      if (amount > 0 && nextScore >= targetScore && player.score < targetScore)
      {
        setScoreWinner({ ...player, score: nextScore });
        playWinSound();
        playSpaghettiSound();
      }

      return { ...player, score: nextScore };
    }));
  }

  function deletePlayer(id)
  {
    setPlayers((current) => current.filter((player) => player.id !== id));
    if (scoreWinner?.id === id) setScoreWinner(null);
  }

  function resetScores()
  {
    setPlayers((current) => current.map((player) => ({ ...player, score: 0 })));
    setScoreWinner(null);
  }

  function playerStatus(player)
  {
    if (players.length < 2) return 'Ready';
    if (player.score === topScore && topScore !== lowScore) return 'Winning';
    if (player.score === lowScore && topScore !== lowScore) return 'Needs comeback';
    return 'In the game';
  }

  function rollChallenge()
  {
    if (rolling) return;

    setRolling(true);
    setLanded(false);
    setRollCount((count) => count + 1);

    const ticker = window.setInterval(() =>
    {
      setChallenge(challengeOptions[Math.floor(Math.random() * challengeOptions.length)]);
    }, 18);

    window.setTimeout(() =>
    {
      window.clearInterval(ticker);
      setChallenge(challengeOptions[Math.floor(Math.random() * challengeOptions.length)]);
      setRolling(false);
      setLanded(true);
      playDiceLandingSound();
      window.setTimeout(() => setLanded(false), 760);
    }, 320);
  }

  return (
    <main className={`challenge-page min-h-screen overflow-hidden text-white ${landed ? 'challenge-page-shake' : ''}`}>
      <RibbonStorm active={Boolean(scoreWinner)} />
      {scoreWinner ? (
        <div className="fixed inset-0 z-[65] grid place-items-center bg-[#020617]/72 px-4 backdrop-blur-sm">
          <div className="score-winner-card rounded-[8px] border border-[#f9df4a]/70 bg-[#052e16] p-6 text-center shadow-glow">
            <Trophy className="mx-auto text-[#f9df4a]" size={58} />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-[#f9df4a]">Target reached</p>
            <h2 className="mt-2 text-4xl font-black">{scoreWinner.name} wins!</h2>
            <p className="mt-2 text-white/75">{scoreWinner.score} points</p>
            <button
              className="mt-5 rounded-[8px] bg-[#f9df4a] px-5 py-3 font-black uppercase text-[#052e16] transition hover:translate-y-[-1px]"
              onClick={() => setScoreWinner(null)}
              type="button"
            >
              Keep playing
            </button>
          </div>
        </div>
      ) : null}
      <div className="absolute inset-0 challenge-field" aria-hidden="true" />
      <section className="relative mx-auto grid min-h-screen max-w-5xl place-items-center px-4 py-6">
        <div className="w-full">
          <button
            className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-3 font-black text-white backdrop-blur-md transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={20} />
            Jersey Roulette
          </button>

          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="rounded-[8px] border border-white/20 bg-[#061f16]/82 p-5 shadow-pitch backdrop-blur-md sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f9df4a]">Digital 1-20 dice</p>
              <h1 className="mt-2 text-4xl font-black leading-tight sm:text-2xl">Challege dice</h1>

              <div className="mt-8 grid place-items-center">
                <div className={`challenge-dice ${rolling ? 'challenge-dice-rolling' : ''} ${landed ? 'challenge-dice-landed' : ''}`}>
                  <div className="dice-face dice-front">
                    <span className={landed ? 'dice-number-glow' : ''}>{sideNumbers[0]}</span>
                  </div>
                  <div className="dice-face dice-back">
                    <span>{sideNumbers[1]}</span>
                  </div>
                  <div className="dice-face dice-right">
                    <span>{sideNumbers[2]}</span>
                  </div>
                  <div className="dice-face dice-left">
                    <span>{sideNumbers[3]}</span>
                  </div>
                  <div className="dice-face dice-top">
                    <span>{sideNumbers[4]}</span>
                  </div>
                  <div className="dice-face dice-bottom">
                    <span>{sideNumbers[5]}</span>
                  </div>
                </div>
              </div>

              <button
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#f9df4a] px-6 py-4 text-lg font-black uppercase text-[#052e16] shadow-lg transition hover:translate-y-[-2px] disabled:opacity-70"
                disabled={rolling}
                onClick={rollChallenge}
                type="button"
              >
                {rolling ? <Loader2 className="animate-spin" size={22} /> : <Dice5 size={22} />}
                Roll number
              </button>
            </div>

            <aside className={`rounded-[8px] border border-white/20 bg-white/10 p-5 shadow-pitch backdrop-blur-md ${landed ? 'quote-card-glow' : ''}`}>
              <div className="rounded-[8px] bg-[#f9df4a] px-4 py-3 text-[#052e16]">
                <p className="text-xs font-black uppercase tracking-[0.16em]">Juggle target</p>
                <h2 className="mt-1 text-3xl font-black">{challenge.number} touches</h2>
              </div>
              <div className="mt-5 inline-flex rounded-[8px] border border-white/20 bg-[#020617]/35 px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#f9df4a]">
                {challenge.tag}
              </div>
              <p className="mt-5 text-sm font-bold text-white/65">Quotes rolled: {rollCount}</p>

              <div className="mt-5 rounded-[8px] border border-white/15 bg-[#020617]/30 p-4">
                <h3 className="text-lg font-black">How to play</h3>
                <p className="mt-2 text-sm font-bold leading-relaxed text-white/75">
                  Roll the dice. The number is the juggling target. If the player reaches that many touches without dropping the ball, give them 1 point.
                </p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-white/75">
                  The target score below is the game target. First player to reach that many successful rounds wins.
                </p>
              </div>

              <div className="mt-6 border-t border-white/15 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-black">Player Scoreboard</h3>
                  <button
                    className="rounded-[8px] border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase text-white/75 transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                    onClick={resetScores}
                    type="button"
                  >
                    Reset scores
                  </button>
                </div>
                <label className="mt-4 grid gap-2 text-sm font-black uppercase tracking-[0.08em] text-white/70">
                  Target score
                  <input
                    className="rounded-[8px] border border-white/15 bg-[#03150f] px-3 py-2 text-base font-black text-white outline-none transition focus:border-[#f9df4a]"
                    min="1"
                    onChange={(event) => setTargetScore(Math.max(1, Number(event.target.value)))}
                    type="number"
                    value={targetScore}
                  />
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-[8px] border border-white/15 bg-[#03150f] px-3 py-2 text-sm font-bold outline-none transition focus:border-[#f9df4a]"
                    onChange={(event) => setNewPlayerName(event.target.value)}
                    onKeyDown={(event) =>
                    {
                      if (event.key === 'Enter') addPlayer();
                    }}
                    placeholder="Player name"
                    value={newPlayerName}
                  />
                  <button
                    className="rounded-[8px] bg-[#f9df4a] px-4 py-2 text-sm font-black uppercase text-[#052e16] transition hover:translate-y-[-1px]"
                    onClick={addPlayer}
                    type="button"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {players.length === 0 ? (
                    <p className="rounded-[8px] border border-white/15 bg-[#020617]/25 px-3 py-3 text-sm font-bold text-white/65">
                      Add players to track points while you roll.
                    </p>
                  ) : (
                    players
                      .slice()
                      .sort((a, b) => b.score - a.score)
                      .map((player) => (
                        <article className="rounded-[8px] border border-white/15 bg-[#020617]/30 p-3" key={player.id}>
                          <div className="flex items-center gap-2">
                            <input
                              aria-label="Player name"
                              className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-[#03150f] px-3 py-2 text-sm font-black outline-none transition focus:border-[#f9df4a]"
                              onChange={(event) => updatePlayerName(player.id, event.target.value)}
                              value={player.name}
                            />
                            <button
                              aria-label={`Delete ${player.name}`}
                              className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/15 text-white/70 transition hover:border-[#e11d48] hover:bg-[#e11d48] hover:text-white"
                              onClick={() => deletePlayer(player.id)}
                              type="button"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              className="grid h-9 w-9 place-items-center rounded-[8px] border border-white/15 bg-white/10 text-lg font-black transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                              onClick={() => updatePlayerScore(player.id, -1)}
                              type="button"
                            >
                              -
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="text-2xl font-black">{player.score} points</p>
                              <p className={`text-xs font-black uppercase tracking-[0.12em] ${playerStatus(player) === 'Winning' ? 'text-[#f9df4a]' : playerStatus(player) === 'Needs comeback' ? 'text-[#fb7185]' : 'text-white/60'}`}>
                                {playerStatus(player)}
                              </p>
                            </div>
                            <button
                              className="grid h-9 w-9 place-items-center rounded-[8px] border border-white/15 bg-white/10 text-lg font-black transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                              onClick={() => updatePlayerScore(player.id, 1)}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </article>
                      ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function FieldChallengesPage({ onBack })
{
  const [activeChallenge, setActiveChallenge] = useState(fieldChallengeOptions[0]);
  const [completed, setCompleted] = useState([]);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(false);
  const [players, setPlayers] = useState(loadSavedFieldPlayers);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [targetScore, setTargetScore] = useState(5);
  const [scoreWinner, setScoreWinner] = useState(null);
  const topScore = players.length ? Math.max(...players.map((player) => player.score)) : 0;
  const lowScore = players.length ? Math.min(...players.map((player) => player.score)) : 0;

  useEffect(() =>
  {
    try
    {
      window.localStorage.setItem(FIELD_SCOREBOARD_STORAGE_KEY, JSON.stringify(players));
    } catch
    {
      // If browser storage is unavailable, the field scoreboard still works until refresh.
    }
  }, [players]);

  function pickRandomChallenge()
  {
    if (picking) return;

    setPicking(true);
    setPicked(false);
    const ticker = window.setInterval(() =>
    {
      setActiveChallenge(fieldChallengeOptions[Math.floor(Math.random() * fieldChallengeOptions.length)]);
    }, 70);

    window.setTimeout(() =>
    {
      window.clearInterval(ticker);
      setActiveChallenge(fieldChallengeOptions[Math.floor(Math.random() * fieldChallengeOptions.length)]);
      setPicking(false);
      setPicked(true);
      playDiceLandingSound();
      window.setTimeout(() => setPicked(false), 900);
    }, 850);
  }

  function toggleComplete(id)
  {
    setCompleted((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function addPlayer()
  {
    const name = newPlayerName.trim();
    if (!name) return;

    setPlayers((current) => [...current, { id: makeId(), name, score: 0 }]);
    setNewPlayerName('');
  }

  function updatePlayerName(id, name)
  {
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, name } : player)));
  }

  function updatePlayerScore(id, amount)
  {
    setPlayers((current) => current.map((player) =>
    {
      if (player.id !== id) return player;

      const nextScore = Math.max(0, player.score + amount);
      if (amount > 0 && nextScore >= targetScore && player.score < targetScore)
      {
        setScoreWinner({ ...player, score: nextScore });
        playWinSound();
        playSpaghettiSound();
      }

      return { ...player, score: nextScore };
    }));
  }

  function deletePlayer(id)
  {
    setPlayers((current) => current.filter((player) => player.id !== id));
    if (scoreWinner?.id === id) setScoreWinner(null);
  }

  function resetScores()
  {
    setPlayers((current) => current.map((player) => ({ ...player, score: 0 })));
    setScoreWinner(null);
  }

  function playerStatus(player)
  {
    if (players.length < 2) return 'Ready';
    if (player.score === topScore && topScore !== lowScore) return 'Winning';
    if (player.score === lowScore && topScore !== lowScore) return 'Needs comeback';
    return 'In the game';
  }

  return (
    <main className="field-challenge-page min-h-screen overflow-hidden text-white">
      <RibbonStorm active={Boolean(scoreWinner)} />
      {scoreWinner ? (
        <div className="fixed inset-0 z-[65] grid place-items-center bg-[#020617]/72 px-4 backdrop-blur-sm">
          <div className="score-winner-card rounded-[8px] border border-[#f9df4a]/70 bg-[#052e16] p-6 text-center shadow-glow">
            <Trophy className="mx-auto text-[#f9df4a]" size={58} />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-[#f9df4a]">Field target reached</p>
            <h2 className="mt-2 text-4xl font-black">{scoreWinner.name} wins!</h2>
            <p className="mt-2 text-white/75">{scoreWinner.score} points</p>
            <button
              className="mt-5 rounded-[8px] bg-[#f9df4a] px-5 py-3 font-black uppercase text-[#052e16] transition hover:translate-y-[-1px]"
              onClick={() => setScoreWinner(null)}
              type="button"
            >
              Keep playing
            </button>
          </div>
        </div>
      ) : null}
      <div className="absolute inset-0 field-challenge-bg" aria-hidden="true" />
      <section className="relative mx-auto min-h-screen max-w-6xl px-4 py-6">
        <button
          className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-3 font-black text-white backdrop-blur-md transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={20} />
          Jersey Roulette
        </button>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[8px] border border-white/20 bg-[#052e16]/78 p-4 shadow-pitch backdrop-blur-md sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f9df4a]">Tap a field station</p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Soccer Field Challenges</h1>
            <button
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#f9df4a] px-6 py-4 text-lg font-black uppercase text-[#052e16] shadow-lg transition hover:translate-y-[-2px] disabled:opacity-70"
              disabled={picking}
              onClick={pickRandomChallenge}
              type="button"
            >
              {picking ? <Loader2 className="animate-spin" size={22} /> : <Sparkles size={22} />}
              Random field challenge
            </button>

            <div className="soccer-field-board mt-6">
              <div className="field-goal field-goal-top" />
              <div className="field-goal field-goal-bottom" />
              <div className="field-box field-box-top" />
              <div className="field-box field-box-bottom" />
              <div className="field-center-circle" />
              <div className="field-half-line" />
              {fieldChallengeOptions.map((challenge) => (
                <button
                  className={`field-station ${activeChallenge.id === challenge.id ? 'field-station-active' : ''} ${activeChallenge.id === challenge.id && picking ? 'field-station-picking' : ''} ${completed.includes(challenge.id) ? 'field-station-complete' : ''}`}
                  key={challenge.id}
                  onClick={() => setActiveChallenge(challenge)}
                  style={{ left: challenge.x, top: challenge.y }}
                  type="button"
                >
                  <span>{completed.includes(challenge.id) ? <Check size={18} /> : <Trophy size={18} />}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className={`rounded-[8px] border border-white/20 bg-white/10 p-5 shadow-pitch backdrop-blur-md ${picked ? 'quote-card-glow' : ''}`}>
            <div className="rounded-[8px] bg-[#f9df4a] px-4 py-3 text-[#052e16]">
              <p className="text-xs font-black uppercase tracking-[0.16em]">{activeChallenge.spot}</p>
              <h2 className="mt-1 text-2xl font-black">{activeChallenge.name}</h2>
            </div>
            <p className="mt-5 text-lg font-bold leading-relaxed">{activeChallenge.detail}</p>
            <button
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] px-5 py-3 font-black uppercase transition hover:translate-y-[-1px] ${completed.includes(activeChallenge.id) ? 'bg-white text-[#052e16]' : 'bg-[#f9df4a] text-[#052e16]'}`}
              onClick={() => toggleComplete(activeChallenge.id)}
              type="button"
            >
              <Check size={20} />
              {completed.includes(activeChallenge.id) ? 'Completed' : 'Mark complete'}
            </button>
            <div className="mt-5 rounded-[8px] border border-white/15 bg-[#020617]/30 p-4">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#f9df4a]">Progress</p>
              <p className="mt-2 text-3xl font-black">
                {completed.length}/{fieldChallengeOptions.length}
              </p>
              <p className="mt-1 text-sm font-bold text-white/65">field stations completed</p>
            </div>

            <div className="mt-6 border-t border-white/15 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-black">Field Scoreboard</h3>
                <button
                  className="rounded-[8px] border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase text-white/75 transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                  onClick={resetScores}
                  type="button"
                >
                  Reset scores
                </button>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-black uppercase tracking-[0.08em] text-white/70">
                Target score
                <input
                  className="rounded-[8px] border border-white/15 bg-[#03150f] px-3 py-2 text-base font-black text-white outline-none transition focus:border-[#f9df4a]"
                  min="1"
                  onChange={(event) => setTargetScore(Math.max(1, Number(event.target.value)))}
                  type="number"
                  value={targetScore}
                />
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-[8px] border border-white/15 bg-[#03150f] px-3 py-2 text-sm font-bold outline-none transition focus:border-[#f9df4a]"
                  onChange={(event) => setNewPlayerName(event.target.value)}
                  onKeyDown={(event) =>
                  {
                    if (event.key === 'Enter') addPlayer();
                  }}
                  placeholder="Player name"
                  value={newPlayerName}
                />
                <button
                  className="rounded-[8px] bg-[#f9df4a] px-4 py-2 text-sm font-black uppercase text-[#052e16] transition hover:translate-y-[-1px]"
                  onClick={addPlayer}
                  type="button"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {players.length === 0 ? (
                  <p className="rounded-[8px] border border-white/15 bg-[#020617]/25 px-3 py-3 text-sm font-bold text-white/65">
                    Add players to track field challenge points.
                  </p>
                ) : (
                  players
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((player) => (
                      <article className="rounded-[8px] border border-white/15 bg-[#020617]/30 p-3" key={player.id}>
                        <div className="flex items-center gap-2">
                          <input
                            aria-label="Player name"
                            className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-[#03150f] px-3 py-2 text-sm font-black outline-none transition focus:border-[#f9df4a]"
                            onChange={(event) => updatePlayerName(player.id, event.target.value)}
                            value={player.name}
                          />
                          <button
                            aria-label={`Delete ${player.name}`}
                            className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/15 text-white/70 transition hover:border-[#e11d48] hover:bg-[#e11d48] hover:text-white"
                            onClick={() => deletePlayer(player.id)}
                            type="button"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            className="grid h-9 w-9 place-items-center rounded-[8px] border border-white/15 bg-white/10 text-lg font-black transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                            onClick={() => updatePlayerScore(player.id, -1)}
                            type="button"
                          >
                            -
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="text-2xl font-black">{player.score} points</p>
                            <p className={`text-xs font-black uppercase tracking-[0.12em] ${playerStatus(player) === 'Winning' ? 'text-[#f9df4a]' : playerStatus(player) === 'Needs comeback' ? 'text-[#fb7185]' : 'text-white/60'}`}>
                              {playerStatus(player)}
                            </p>
                          </div>
                          <button
                            className="grid h-9 w-9 place-items-center rounded-[8px] border border-white/15 bg-white/10 text-lg font-black transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                            onClick={() => updatePlayerScore(player.id, 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </article>
                    ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function App()
{
  const [route, setRoute] = useState(() => window.location.pathname);
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
    function handlePopState()
    {
      setRoute(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(path)
  {
    window.history.pushState({}, '', path);
    setRoute(path);
  }

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

  if (route === '/juggling-challenges')
  {
    return <ChallengePage onBack={() => navigate('/')} />;
  }

  if (route === '/field-challenges')
  {
    return <FieldChallengesPage onBack={() => navigate('/')} />;
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
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-white/25 bg-white/10 px-4 text-sm font-black uppercase text-white transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                  onClick={() => navigate('/juggling-challenges')}
                  type="button"
                >
                  <Dice5 size={18} />
                  Dice Challege
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-white/25 bg-white/10 px-4 text-sm font-black uppercase text-white transition hover:border-[#f9df4a] hover:text-[#f9df4a]"
                  onClick={() => navigate('/field-challenges')}
                  type="button"
                >
                  <Trophy size={18} />
                  Field
                </button>
                <button
                  aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-[8px] border transition ${soundOn ? 'border-[#f9df4a] bg-[#f9df4a] text-[#052e16]' : 'border-white/25 bg-white/10 text-white'
                    }`}
                  onClick={() => setSoundOn((value) => !value)}
                  type="button"
                >
                  <Volume2 size={20} />
                </button>
              </div>
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
