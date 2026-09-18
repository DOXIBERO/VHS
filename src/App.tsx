import React, { useState } from 'react';
import { GarageScene } from './components/GarageScene';
import { SnapchatCameraModal } from './components/SnapchatCameraModal';
import { GermanChallengeCard } from './components/GermanChallengeCard';
import {
  playGulpSound,
  playPourSound,
  playClinkSound,
  playVictorySound,
  playFizzSound,
} from './utils/teaSounds';
import { DrinkType, DRINKS, CupStyle } from './types/drinks';
import {
  CharacterAnimationState,
  PAINT_LOTTERY_COLORS,
  CharacterModelType,
  CustomSnapchatFaceData,
} from './types/character';
import {
  Compass,
  Trophy,
  RotateCcw,
  Minus,
  Plus,
  Sparkles,
  User,
  Bone,
  Palette,
  ZoomIn,
  ZoomOut,
  Film,
  Smile,
  ChevronDown,
  ChevronUp,
  Camera,
  Eye,
  EyeOff,
  Sliders,
  X,
} from 'lucide-react';

export const App: React.FC = () => {
  const [lightOn, setLightOn] = useState(true);
  const [playerCount, setPlayerCount] = useState(1);
  const [activePlayer, setActivePlayer] = useState(0);
  const [activeDrink, setActiveDrink] = useState<DrinkType>('atay');
  const [cupStyle, setCupStyle] = useState<CupStyle>('authentic');
  const [glassesSips, setGlassesSips] = useState<number[]>([5]);
  const [lastAction, setLastAction] = useState<{
    type: 'sip' | 'refill' | 'reset';
    playerIndex: number;
    id: number;
  } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [characterModelType, setCharacterModelType] = useState<CharacterModelType>('fallguy');
  const [snapchatFace, setSnapchatFace] = useState(true);
  const [customSnapchatFace, setCustomSnapchatFace] = useState<CustomSnapchatFaceData | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [isTeaStationOpen, setIsTeaStationOpen] = useState(false);
  const [isGermanChallengeOpen, setIsGermanChallengeOpen] = useState(true);

  // Character Studio & Mafasil State (Default closed for clean mobile view)
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [focusCharacter, setFocusCharacter] = useState(false);
  const [selectedSkinId, setSelectedSkinId] = useState('pistachio');
  const [studioAnimation, setStudioAnimation] = useState<{
    state: CharacterAnimationState;
    id: number;
    playerIndex?: number;
  } | null>(null);

  const currentDrinkDef = DRINKS[activeDrink];
  const currentCupLabel =
    cupStyle === 'plastic_all'
      ? 'كاس ميكا شفاف موحد'
      : currentDrinkDef.cupType === 'kas_7yati'
      ? 'كاس د حياتي (زواقة فاسية + نعناع)'
      : currentDrinkDef.cupType === 'kas_qahwa'
      ? 'كاس د القهوة كحلة'
      : 'كاس ميكا شفاف';

  // Handle player count change
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    if (activePlayer >= count) {
      setActivePlayer(0);
    }
    setGlassesSips(prev => {
      const next = Array(count).fill(5);
      for (let i = 0; i < count; i++) {
        if (prev[i] !== undefined) {
          next[i] = prev[i];
        }
      }
      return next;
    });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(prev => (prev === msg ? null : prev));
    }, 2500);
  };

  // Switch Drink
  const handleDrinkChange = (drinkKey: DrinkType) => {
    setActiveDrink(drinkKey);
    const newDrink = DRINKS[drinkKey];
    if (newDrink.isFizzy) {
      playFizzSound();
    } else {
      playPourSound();
    }
    showNotice(`تم تبديل المشروب: ${newDrink.icon} ${newDrink.nameAr}`);
  };

  // 1. Take a Sip (-1 Sip = 20% drain)
  const handleSip = (playerIdx: number = activePlayer) => {
    setActivePlayer(playerIdx);
    const current = glassesSips[playerIdx] ?? 5;
    if (current > 0) {
      const nextSips = current - 1;
      setGlassesSips(prev => {
        const copy = [...prev];
        copy[playerIdx] = nextSips;
        return copy;
      });

      setLastAction({
        type: 'sip',
        playerIndex: playerIdx,
        id: Date.now(),
      });

      if (nextSips === 0) {
        playVictorySound();
        showNotice(`🏆 مبروك! اللاعب ${playerIdx + 1} خوى كاسو وربح مشروب ${currentDrinkDef.nameAr}!`);
      } else {
        playGulpSound();
        if (currentDrinkDef.isFizzy) {
          setTimeout(playFizzSound, 120);
        }
        showNotice(`اللاعب ${playerIdx + 1}: شرب جغمة من ${currentDrinkDef.nameAr} (باقي ${nextSips}/5)`);
      }
    } else {
      playClinkSound();
      showNotice(`كاس اللاعب ${playerIdx + 1} راه خاوي أصلاً! (0/5)`);
    }
  };

  // 2. Refill Penalty (+2 Sips = +40% fill)
  const handleRefill = (playerIdx: number = activePlayer) => {
    setActivePlayer(playerIdx);
    const current = glassesSips[playerIdx] ?? 5;
    const nextSips = Math.min(5, current + 2);
    setGlassesSips(prev => {
      const copy = [...prev];
      copy[playerIdx] = nextSips;
      return copy;
    });

    setLastAction({
      type: 'refill',
      playerIndex: playerIdx,
      id: Date.now(),
    });

    playPourSound();
    if (currentDrinkDef.isFizzy) {
      setTimeout(playFizzSound, 250);
    }
    showNotice(`⚠️ عقوبة! تكب ${currentDrinkDef.nameAr} على اللاعب ${playerIdx + 1} (+2 جغيمات: ${nextSips}/5)`);
  };

  // 3. Reset all glasses to 5
  const handleResetAll = () => {
    setGlassesSips(Array(playerCount).fill(5));
    setLastAction({
      type: 'reset',
      playerIndex: activePlayer,
      id: Date.now(),
    });
    playPourSound();
    if (currentDrinkDef.isFizzy) {
      setTimeout(playFizzSound, 250);
    }
    showNotice(`تم تعمير كاع كيسان ${currentDrinkDef.nameAr} (5/5)`);
  };

  const triggerCharacterAnim = (anim: CharacterAnimationState) => {
    setStudioAnimation({
      state: anim,
      id: Date.now(),
      playerIndex: activePlayer,
    });
    const animNamesAr: Record<CharacterAnimationState, string> = {
      idle: 'تنفس طبيعي ورمش',
      drink_sip: 'شريب الكاس وتخريجة الحلق',
      refill_shock: 'فزعة العمارة وتخرشيش الراس',
      victory: 'نقزة البونج وتقرقيب القبضات',
      laugh: 'شدان الكرش وتصفيقة الطبلة',
      talk_german: 'هضرة بالألمانية وإيماءات مغربية',
      jump_down: 'نقزة من الكرسي للأرض',
      jump_up: 'نقزة من الأرض للكرسي',
      walk: 'مشية كرتونية',
      run: 'جرية سريعة',
    };
    showNotice(`حركة اللاعب ${activePlayer + 1}: ${animNamesAr[anim]}`);
  };

  const handleSkinSelect = (skinId: string) => {
    setSelectedSkinId(skinId);
    const skin = PAINT_LOTTERY_COLORS.find(s => s.id === skinId);
    if (skin) {
      showNotice(`صباغة اللاعب ${activePlayer + 1}: ${skin.nameAr}`);
    }
  };

  const activeSips = glassesSips[activePlayer] ?? 5;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans text-slate-100 select-none">
      {/* 3D Garage Scene with Animated Characters */}
      <div className="absolute inset-0 z-0">
        <GarageScene
          lightOn={lightOn}
          onToggleLight={() => setLightOn(prev => !prev)}
          playerCount={playerCount}
          activePlayerIndex={activePlayer}
          glassesSips={glassesSips}
          activeDrink={activeDrink}
          cupStyle={cupStyle}
          lastAction={lastAction}
          onGlassClick={handleSip}
          studioAnimation={studioAnimation}
          showSkeleton={showSkeleton}
          activeSkinId={selectedSkinId}
          focusCharacter={focusCharacter}
          characterModelType={characterModelType}
          snapchatFace={snapchatFace}
          customSnapchatFace={customSnapchatFace}
          onCharacterClick={(idx) => {
            setActivePlayer(idx);
            showNotice(`تم تحديد اللاعب ${idx + 1}`);
          }}
        />
      </div>

      {/* Top Center Moroccan Drink Switcher & Cup Selector */}
      {!isCleanMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[95vw]">
        {/* Moroccan Drink Selector (Zero Brands) */}
        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-xl border border-amber-500/30 p-1.5 rounded-2xl shadow-2xl overflow-x-auto max-w-full">
          {(Object.keys(DRINKS) as DrinkType[]).map(drinkKey => {
            const d = DRINKS[drinkKey];
            const isSelected = activeDrink === drinkKey;
            return (
              <button
                key={drinkKey}
                onClick={() => handleDrinkChange(drinkKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_14px_rgba(245,158,11,0.55)] scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{d.icon}</span>
                <span className="hidden sm:inline">{d.nameAr}</span>
              </button>
            );
          })}
        </div>

        {/* Authentic Cup vs Plastic All Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-amber-500/30 p-1 rounded-xl shadow-xl">
          <button
            onClick={() => {
              setCupStyle('authentic');
              playClinkSound();
              showNotice('تم التفعيل: كاس أصلي خاص بكل مشروب');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
              cupStyle === 'authentic'
                ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🥛</span>
            <span>كاس أصلي لكل مشروب</span>
          </button>

          <button
            onClick={() => {
              setCupStyle('plastic_all');
              playClinkSound();
              showNotice('تم التفعيل: كاس ميكا شفاف موحد للكل');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
              cupStyle === 'plastic_all'
                ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🥤</span>
            <span>كاس ميكا شفاف للكل</span>
          </button>
        </div>
      </div>
      )}

      {/* Top Left Header HUD */}
      {!isCleanMode && (
        <div className="absolute top-5 left-5 z-10 pointer-events-none hidden lg:block">
          <div className="flex items-center gap-3 bg-black/65 backdrop-blur-md border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              {currentDrinkDef.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider text-amber-100 uppercase">
                  GARAGE ALMANI
                </h1>
                <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                  كاراج ألماني
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                كيسان مغربية أصلية • فيزياء السوائل • موديل الشخصيات والمفاصل
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Character Studio & Inspector (الموديل، المفاصل، الحركات) */}
      {!isCleanMode && (
        <div className="absolute top-20 left-3 sm:left-5 z-20 flex flex-col items-start gap-2">
        {/* Toggle Studio Button */}
        <button
          onClick={() => setIsStudioOpen(prev => !prev)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 font-mono text-xs font-bold ${
            isStudioOpen
              ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : 'bg-black/80 border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/50'
          }`}
        >
          <User className="w-4 h-4 text-amber-400" />
          <span>ستوديو الشخصية والمفاصل</span>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full">
            19 مفصل
          </span>
          {isStudioOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Studio Panel Body */}
        {isStudioOpen && (
          <div className="w-[92vw] sm:w-96 max-h-[75vh] overflow-y-auto bg-black/90 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-4 shadow-[0_15px_45px_rgba(0,0,0,0.85)] text-right" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black font-mono text-amber-200">
                    ستوديو الشخصيات الكرتونية
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    اللاعب {activePlayer + 1} • الموديل الحركي والمفاصل
                  </p>
                </div>
              </div>

              {/* Focus Camera Button */}
              <button
                onClick={() => setFocusCharacter(prev => !prev)}
                title={focusCharacter ? 'رجوع للمشهد العام' : 'تقريب الكاميرا للشخصية'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all ${
                  focusCharacter
                    ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {focusCharacter ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                <span>{focusCharacter ? 'إبعاد' : 'تقريب'}</span>
              </button>
            </div>

            {/* Model Switcher: Fall Guys vs Three.js Robot vs Moroccan Bean */}
            <div className="mb-3.5 p-1 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex items-center gap-1">
              <button
                onClick={() => {
                  setCharacterModelType('fallguy');
                  showNotice('تم تفعيل: 🫘 شخصية فول كايز الأصلية (Fall Guy)');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  characterModelType === 'fallguy'
                    ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>🫘</span>
                <span>فول كايز (Fall Guys)</span>
              </button>
              <button
                onClick={() => {
                  setCharacterModelType('robot');
                  showNotice('تم تفعيل: 🤖 الروبوت الكرتوني (Three.js)');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  characterModelType === 'robot'
                    ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>🤖</span>
                <span>الروبوت</span>
              </button>
              <button
                onClick={() => {
                  setCharacterModelType('bean');
                  showNotice('تم تفعيل: 🧪 الحبة المغربية');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  characterModelType === 'bean'
                    ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>🧪</span>
                <span>الحبة</span>
              </button>
            </div>

            {/* Snapchat Meme Face Toggle (Zero Camera Required, 100% Procedural) */}
            <div className="mb-3.5 p-2.5 bg-gradient-to-r from-yellow-500/15 to-amber-500/10 rounded-2xl border border-yellow-400/40 flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-bounce">👻</span>
                  <div>
                    <h4 className="text-[11px] font-bold text-yellow-300 font-mono">
                      فيلتر سناب شات التفاعلي (Snapchat Face)
                    </h4>
                    <p className="text-[9px] text-slate-300/80 font-mono">
                      {customSnapchatFace ? 'وجه حقيقي مطبق على الشخصية ✅' : 'فم وعينين كيشربو ويهضرو بالماط'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSnapchatFace(prev => !prev);
                    showNotice(snapchatFace ? 'تم تعطيل وجه سناب شات (عيون أصلية)' : 'تم تفعيل فيلتر سناب شات التفاعلي 👻');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shadow-md ${
                    snapchatFace
                      ? 'bg-yellow-400 text-black shadow-[0_0_12px_#facc15]'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {snapchatFace ? 'مفعّل ✅' : 'معطّل ❌'}
                </button>
              </div>

              {/* Snapchat Camera & Selfie Button */}
              <button
                onClick={() => setIsCameraModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📷 فيلتر الكاميرا والسيلفي (وجه حقيقي / Annoying Orange)</span>
              </button>
            </div>

            {/* Section 1: Animations (الحركات التعبيرية الكاملة) */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5" />
                  <span>الحركات التعبيرية (6 حركات):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">كليك للتجربة المباشرة</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { state: 'idle' as CharacterAnimationState, icon: '😴', label: 'تنفس ورمش العينين' },
                  { state: 'drink_sip' as CharacterAnimationState, icon: '🍵', label: 'شريب الكاس والبلع' },
                  { state: 'refill_shock' as CharacterAnimationState, icon: '😱', label: 'فزعة العمارة والراس' },
                  { state: 'victory' as CharacterAnimationState, icon: '🏆', label: 'نقزة البونج والربحة' },
                  { state: 'laugh' as CharacterAnimationState, icon: '🤣', label: 'شدان الكرش والضحك' },
                  { state: 'talk_german' as CharacterAnimationState, icon: '🇩🇪', label: 'هضرة ألمانية وإيماءات' },
                  { state: 'jump_down' as CharacterAnimationState, icon: '🦘', label: 'نقزة للأرض (نزول)' },
                  { state: 'jump_up' as CharacterAnimationState, icon: '🪑', label: 'نقزة للكرسي (ركوب)' },
                  { state: 'walk' as CharacterAnimationState, icon: '🚶', label: 'مشية (المشية الكرتونية)' },
                  { state: 'run' as CharacterAnimationState, icon: '🏃', label: 'جرية (الجرية السريعة)' },
                ].map(item => (
                  <button
                    key={item.state}
                    onClick={() => triggerCharacterAnim(item.state)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-amber-200 transition-all text-xs font-mono active:scale-95 text-right"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Skeleton & Joints Visualizer (إظهار المفاصل) */}
            <div className="mb-3.5 bg-slate-900/70 rounded-2xl p-2.5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Bone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-bold text-cyan-200 font-mono">
                    هيكل المفاصل (19 مفصل حركي)
                  </span>
                </div>
                <button
                  onClick={() => setShowSkeleton(prev => !prev)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
                    showSkeleton
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d4]'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {showSkeleton ? 'المفاصل: ظاهرة 🟢' : 'المفاصل: مخفية'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>الراس، العنق، والفك</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>الصدر والعمود والحوض</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>الكتاف والمرافق واليدين</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>الوركين، الركابي، والسبرديلات</span>
                </div>
              </div>
            </div>

            {/* Section 3: Moroccan Paint Lottery Skins */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" />
                  <span>قرعة الصباغة المغربية:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">6 ألوان أصلية</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {PAINT_LOTTERY_COLORS.map(skin => {
                  const isSelected = selectedSkinId === skin.id;
                  const hexStr = '#' + skin.bodyColor.toString(16).padStart(6, '0');
                  return (
                    <button
                      key={skin.id}
                      onClick={() => handleSkinSelect(skin.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-105'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                        style={{ backgroundColor: hexStr }}
                      />
                      <span className="text-[10px] font-mono font-bold leading-tight">
                        {skin.nameAr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-900/90 border border-amber-500/50 backdrop-blur-lg px-5 py-2.5 rounded-full text-sm font-bold text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Bottom Left Chair / Player Count Selector (Desktop / Tablet) */}
      {!isCleanMode && (
        <div className="absolute bottom-20 sm:bottom-6 left-4 sm:left-6 z-20 hidden md:flex items-center gap-2 bg-black/75 backdrop-blur-md border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-2xl">
          <span className="text-xs font-mono text-amber-200 font-bold">
            عدد اللعابة:
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 4, 6, 8].map(count => (
              <button
                key={count}
                onClick={() => handlePlayerCountChange(count)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
                  playerCount === count
                    ? 'bg-amber-400 text-black shadow-[0_0_10px_#f59e0b]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Right Interactive Tea Station Panel (Collapsible) */}
      {!isCleanMode && isTeaStationOpen && (
        <div className="absolute bottom-20 sm:bottom-6 right-3 sm:right-6 z-30 w-[94vw] sm:w-80 max-h-[75vh] overflow-y-auto bg-black/90 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-4 shadow-2xl">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{currentDrinkDef.icon}</span>
              <h2 className="text-xs font-bold font-mono text-amber-100 uppercase tracking-wide">
                {currentDrinkDef.nameAr} • تجربة الشريب
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetAll}
                title="إعادة تعبئة جميع الكيسان"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsTeaStationOpen(false)}
                title="تصغير اللوحة"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Player Tabs */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {Array.from({ length: playerCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActivePlayer(idx)}
                className={`flex-1 min-w-[55px] py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                  activePlayer === idx
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-750'
                }`}
              >
                لـ {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Player Status */}
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">
                كاس اللاعب {activePlayer + 1}:
              </span>
              <span className={`text-xs font-mono font-bold ${
                activeSips === 0 ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                {activeSips === 0 ? 'كاس خاوي (0/5) 🏆' : `${activeSips} / 5 جغيمات`}
              </span>
            </div>

            {/* 5 Sips Dot Meter */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[1, 2, 3, 4, 5].map(dotIdx => {
                const isFilled = dotIdx <= activeSips;
                return (
                  <div
                    key={dotIdx}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isFilled
                        ? 'bg-gradient-to-r from-[#421d09] via-[#6e3312] to-[#a3521b] shadow-[0_0_8px_rgba(163,82,27,0.6)]'
                        : 'bg-slate-800 border border-slate-700/50'
                    }`}
                  />
                );
              })}
            </div>

            {/* Sips Explanation Text */}
            <p className="text-[10px] text-slate-400 text-center font-mono">
              {activeSips === 0 ? (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 inline" /> سالا الكاس! ربحتي هاد المشروب
                </span>
              ) : (
                <span>كولما كان الكاس خاوي كولما كتقرب تربح المشروب</span>
              )}
            </p>

            {/* Active Cup Badge */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
              <span>نوع الكاس:</span>
              <span className="text-amber-300 font-bold">{currentCupLabel}</span>
            </div>
          </div>

          {/* Action Buttons inside drawer */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSip()}
              disabled={activeSips === 0}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold font-mono text-xs transition-all duration-200 ${
                activeSips > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>جرعة (-1)</span>
            </button>

            <button
              onClick={() => handleRefill()}
              disabled={activeSips >= 5}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold font-mono text-xs transition-all duration-200 ${
                activeSips < 5
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)] active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تكب (+2)</span>
            </button>
          </div>

          {/* 3D Click Hint */}
          <div className="text-[10px] text-amber-300/70 text-center font-mono mt-2.5">
            💡 تقدر تكليكي نيشان على الكاس فالمشهد 3D باش تشرب
          </div>
        </div>
      )}

      {/* Sleek Mobile & Desktop Bottom Action Pill Bar */}
      {!isCleanMode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-xl border border-amber-500/40 p-1.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] max-w-[96vw] overflow-x-auto">
          {/* Quick Sip */}
          <button
            onClick={() => handleSip()}
            disabled={activeSips === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold font-mono text-xs transition-all whitespace-nowrap ${
              activeSips > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>🍵</span>
            <span>شرب ({activeSips}/5)</span>
          </button>

          {/* Quick Refill */}
          <button
            onClick={() => handleRefill()}
            disabled={activeSips >= 5}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold font-mono text-xs transition-all whitespace-nowrap ${
              activeSips < 5
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)] active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>🫗</span>
            <span>تكب (+2)</span>
          </button>

          {/* Camera & Selfie Face Trigger */}
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-mono font-black text-xs shadow-[0_0_16px_rgba(250,204,21,0.7)] active:scale-95 transition-all whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📷 كاميرا وسيلفي الوجه</span>
            {customSnapchatFace && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            )}
          </button>

          {/* Studio Toggle */}
          <button
            onClick={() => setIsStudioOpen(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap ${
              isStudioOpen
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">ستوديو</span>
          </button>

          {/* German Challenge Card Toggle */}
          <button
            onClick={() => setIsGermanChallengeOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap ${
              isGermanChallengeOpen
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>🇩🇪</span>
            <span className="hidden xs:inline">تحدي الألمانية</span>
          </button>

          {/* Tea Station Details Toggle */}
          <button
            onClick={() => setIsTeaStationOpen(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap ${
              isTeaStationOpen
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">تحكم</span>
          </button>

          {/* Zen Clean Mode Toggle */}
          <button
            onClick={() => setIsCleanMode(true)}
            title="إخفاء جميع القوائم لرؤية الكاراج والشخصية بوضوح"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Zen / Clean Mode Exit Floating Button */}
      {isCleanMode && (
        <button
          onClick={() => setIsCleanMode(false)}
          className="absolute top-4 left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/80 border border-amber-500/60 text-amber-300 backdrop-blur-md text-xs font-mono font-bold shadow-2xl hover:bg-amber-500/20 active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>إظهار القوائم</span>
        </button>
      )}

      {/* German Learning Challenge Card UI */}
      {!isCleanMode && isGermanChallengeOpen && (
        <GermanChallengeCard
          activeDrink={activeDrink}
          playerCount={playerCount}
          activePlayerIndex={activePlayer}
          glassesSips={glassesSips}
          onSip={handleSip}
          onRefill={handleRefill}
          onTriggerAnimation={(animState) => {
            setStudioAnimation({
              state: animState,
              id: Date.now(),
              playerIndex: activePlayer,
            });
          }}
          onNextPlayer={() => {
            setActivePlayer(prev => (prev + 1) % playerCount);
          }}
        />
      )}

      {/* Smart Face Selfie Modal */}
      <SnapchatCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onApplyCustomFace={(face) => {
          setCustomSnapchatFace(face);
          if (face) {
            setSnapchatFace(true);
            showNotice('📷 تم تفعيل كاميرا الوجه والسيلفي الذكي!');
          } else {
            showNotice('تم استرجاع وجه فول كايز الافتراضي');
          }
        }}
        currentFaceData={customSnapchatFace}
      />

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.85)] z-0" />
    </div>
  );
};
