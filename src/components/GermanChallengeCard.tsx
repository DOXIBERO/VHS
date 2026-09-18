import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, MicOff, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { GermanChallenge, DrinkLesson, GERMAN_CURRICULUM } from '../types/germanCurriculum';
import { DrinkType } from '../types/drinks';

export interface GermanChallengeCardProps {
  activeDrink: DrinkType;
  playerCount: number;
  activePlayerIndex: number;
  glassesSips: number[];
  onSip: (playerIdx: number) => void;
  onRefill: (playerIdx: number) => void;
  onTriggerAnimation?: (animState: 'drink_sip' | 'refill_shock' | 'talk_german' | 'laugh') => void;
  onNextPlayer?: () => void;
}

export const GermanChallengeCard: React.FC<GermanChallengeCardProps> = ({
  activeDrink,
  playerCount,
  activePlayerIndex,
  glassesSips,
  onSip,
  onRefill,
  onTriggerAnimation,
  onNextPlayer,
}) => {
  const [currentLesson, setCurrentLesson] = useState<DrinkLesson>(GERMAN_CURRICULUM[0]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenResult, setSpokenResult] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<'success' | 'fail' | null>(null);
  const [verdictFeedback, setVerdictFeedback] = useState<string | null>(null);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);
  const [isReadyForChallenge, setIsReadyForChallenge] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Match active lesson to active drink
  useEffect(() => {
    const lesson = GERMAN_CURRICULUM.find(l => l.drinkId === activeDrink) ?? GERMAN_CURRICULUM[0];
    setCurrentLesson(lesson);
    setChallengeIndex(0);
    setVerdict(null);
    setSpokenResult(null);
  }, [activeDrink]);

  const currentChallenge: GermanChallenge =
    currentLesson.challenges[challengeIndex % currentLesson.challenges.length];

  const currentSips = glassesSips[activePlayerIndex] ?? 5;

  // Native German Speech Synthesis (TTS)
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentChallenge.germanText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.85; // Slightly slower for language learners

    setIsSpeaking(true);
    onTriggerAnimation?.('talk_german');

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Speech Recognition (Microphone)
  const handleStartListening = () => {
    setVerdict(null);
    setSpokenResult(null);
    setVerdictFeedback(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback if browser doesn't support Web Speech API
      evaluatePronunciation(currentChallenge.germanText);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setSpokenResult(transcript);
        evaluatePronunciation(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        // If microphone access is blocked or silence, give helpful tip
        if (err.error === 'no-speech') {
          setVerdictFeedback('ما سمعنا والو! عاود هضر بالجهد وقرب المايكروفون.');
        } else {
          setVerdictFeedback('تعذر الاتصال بالمايكروفون. يمكنك استعمال زر التجربة أدناه.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Pronunciation Evaluation Logic (with German beginner tolerance)
  const evaluatePronunciation = (userSpeech: string) => {
    const target = currentChallenge.germanText.toLowerCase().trim();
    const cleanUser = userSpeech.toLowerCase().trim();

    // Check direct equality or substring inclusion
    const isMatch =
      cleanUser === target ||
      cleanUser.includes(target) ||
      target.includes(cleanUser) ||
      cleanUser.replace(/[^a-zäöüß]/g, '') === target.replace(/[^a-zäöüß]/g, '');

    if (isMatch) {
      // SUCCESS: Sip drink!
      setVerdict('success');
      setVerdictFeedback(`نطق ناضي! "${userSpeech}" (-1 جغمة) 🎉`);
      onTriggerAnimation?.('drink_sip');
      onSip(activePlayerIndex);

      // Auto advance to next challenge after sip animation
      setTimeout(() => {
        setChallengeIndex(prev => (prev + 1) % currentLesson.challenges.length);
        setVerdict(null);
        setSpokenResult(null);
        setVerdictFeedback(null);
      }, 3500);
    } else {
      // FAILURE: Refill penalty!
      setVerdict('fail');
      setVerdictFeedback(`عوجتيها! قلتي "${userSpeech}" وبغينا "${currentChallenge.germanText}" (+2 عقوبة) ⚠️`);
      onTriggerAnimation?.('refill_shock');
      onRefill(activePlayerIndex);
    }
  };

  // Simulator Buttons for Instant Testing (without speaking)
  const handleSimulateVerdict = (correct: boolean) => {
    if (correct) {
      evaluatePronunciation(currentChallenge.germanText);
    } else {
      evaluatePronunciation('خلطتيها');
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed top-20 right-4 sm:right-6 z-40 w-[92vw] sm:w-[380px] max-w-sm select-none transition-all duration-300"
    >
      {/* Outer Card with Authentic Moroccan Café Aesthetic */}
      <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden font-sans">
        {/* Top Moroccan Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-4 py-3 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLesson.drinkIcon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {currentLesson.drinkNameAr}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full font-mono">
                  A0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                {currentLesson.titleAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Collapse toggle */}
            <button
              onClick={() => setIsCardCollapsed(prev => !prev)}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all"
              title={isCardCollapsed ? 'تكبير البطاقة' : 'تصغير'}
            >
              {isCardCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsed view summary */}
        {isCardCollapsed ? (
          <div
            onClick={() => setIsCardCollapsed(false)}
            className="p-3 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">
                نوبة اللاعب {activePlayerIndex + 1}:
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {currentChallenge.germanText}
              </span>
              <span className="text-xs text-slate-400">({currentChallenge.darijaMeaning})</span>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">
              باقي {currentSips}/5 جغيمات
            </span>
          </div>
        ) : (
          <div className="p-4 space-y-3.5">
            {/* Active Player Status & Sip Progress Bar */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">
                  نوبة اللاعب {activePlayerIndex + 1}
                </span>
                {playerCount > 1 && (
                  <span className="text-[10px] text-slate-400">
                    ({activePlayerIndex + 1}/{playerCount})
                  </span>
                )}
                {playerCount > 1 && onNextPlayer && (
                  <button
                    onClick={onNextPlayer}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] border border-amber-500/30 transition-all active:scale-95"
                    title="دوز النوبة للاعب الموالي"
                  >
                    <span>دوز النوبة</span>
                    <span>⏭️</span>
                  </button>
                )}
              </div>

              {/* Sip glasses representation */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 ml-1">الكاس:</span>
                {[1, 2, 3, 4, 5].map(step => (
                  <span
                    key={step}
                    title={`${step} جغمة`}
                    className={`text-xs transition-transform ${
                      step <= currentSips
                        ? 'opacity-100 scale-100 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]'
                        : 'opacity-20 grayscale scale-75'
                    }`}
                  >
                    🍵
                  </span>
                ))}
                <span className="text-xs font-bold text-amber-400 mr-1">
                  ({currentSips}/5)
                </span>
              </div>
            </div>

            {/* Target German Word Card */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950/90 border border-amber-500/30 text-center shadow-inner">
              {/* Sound Highlight Tag */}
              <div className="absolute top-2.5 left-3 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300">
                الصوت: {currentChallenge.soundHighlight}
              </div>

              <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-400">
                بطاقة {challengeIndex + 1}/{currentLesson.challenges.length}
              </div>

              {/* German Word */}
              <div className="my-2">
                <h2 className="text-4xl font-black text-amber-200 tracking-wider font-mono drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">
                  {currentChallenge.germanText}
                </h2>
                <p className="text-sm font-bold text-amber-400/80 font-mono mt-0.5">
                  {currentChallenge.phonetic}
                </p>
              </div>

              {/* Darija Meaning & Mnemonic Hint */}
              <div className="pt-2 border-t border-slate-700/60 mt-2">
                <div className="text-sm font-bold text-slate-100">
                  المعنى: <span className="text-emerald-400 font-extrabold">{currentChallenge.darijaMeaning}</span>
                </div>
                <p className="text-[11px] text-amber-200/90 bg-amber-950/40 border border-amber-500/20 p-2 rounded-xl mt-1.5 leading-relaxed">
                  💡 {currentChallenge.darijaHint}
                </p>
              </div>
            </div>

            {/* Verdict Alert (if any) */}
            {verdictFeedback && (
              <div
                className={`p-3 rounded-2xl border text-xs font-bold leading-snug flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
                  verdict === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
              >
                {verdict === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{verdictFeedback}</span>
              </div>
            )}

            {/* Interaction Buttons: Listen (Audio) & Speak (Mic) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Native Audio Listen */}
              <button
                onClick={handlePlayAudio}
                disabled={isSpeaking}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-mono text-xs font-bold border transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'كيقرا الكلمة...' : '🔊 سمع النطق'}</span>
              </button>

              {/* WhatsApp-Style Mic Speak */}
              <button
                onMouseDown={handleStartListening}
                onMouseUp={handleStopListening}
                onTouchStart={handleStartListening}
                onTouchEnd={handleStopListening}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-mono text-xs font-black border transition-all active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-bounce'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110'
                }`}
              >
                {isListening ? <Mic className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'طلق باش تفاليدي...' : '🎙️ برّك ونطق'}</span>
              </button>
            </div>

            {/* Instant Test Simulator Buttons (For fast testing & fallback) */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-mono">تجربة فورية:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSimulateVerdict(true)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 transition-all active:scale-95"
                  title="نطق صحيح واشرب جغمة"
                >
                  ✅ نطق صحيح (-1)
                </button>
                <button
                  onClick={() => handleSimulateVerdict(false)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 transition-all active:scale-95"
                  title="نطق خاطئ وخود عقوبة عمير الكاس"
                >
                  ❌ عقوبة (+2)
                </button>
              </div>

              {/* Next Challenge */}
              <button
                onClick={() => {
                  setChallengeIndex(prev => (prev + 1) % currentLesson.challenges.length);
                  setVerdict(null);
                  setSpokenResult(null);
                  setVerdictFeedback(null);
                }}
                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all"
                title="البطاقة التالية"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
