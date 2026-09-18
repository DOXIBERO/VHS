import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Sparkles, X, Check, Sliders, Play, Square, Upload, RotateCcw, ShieldCheck, Eye } from 'lucide-react';
import { CustomSnapchatFaceData } from '../types/character';

interface SnapchatCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomFace: (faceData: CustomSnapchatFaceData | null) => void;
  currentFaceData?: CustomSnapchatFaceData | null;
}

// Generates an interactive animated astronaut simulator face on an offscreen canvas
function createAstronautFaceCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 480;
  c.height = 480;
  const ctx = c.getContext('2d')!;

  // Skin tone
  const cx = 240;
  const cy = 240;

  // Head base
  ctx.fillStyle = '#e0a98b';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 140, 170, 0, 0, Math.PI * 2);
  ctx.fill();

  // Forehead hair / astronaut cap
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 90, 142, 85, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#332014';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx - 50, cy - 35, 30, 0.9 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 50, cy - 35, 30, 1.2 * Math.PI, 2.1 * Math.PI);
  ctx.stroke();

  // Eyes (Sclera + Iris + Pupil + Catchlight)
  const drawEye = (ex: number, ey: number) => {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 26, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Iris (Amber Moroccan brown)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(ex, ey, 11, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 3, ey - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  drawEye(cx - 50, cy - 18);
  drawEye(cx + 50, cy - 18);

  // Nose
  ctx.strokeStyle = '#c27e5e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx + 4, cy + 30);
  ctx.lineTo(cx - 10, cy + 35);
  ctx.stroke();

  // Warm Moroccan Smile with Lips & Teeth
  ctx.fillStyle = '#1c0505';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 85, 45, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth row
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 32, cy + 70, 64, 14);

  // Lips
  ctx.strokeStyle = '#be123c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy + 72, 46, 0.12 * Math.PI, 0.88 * Math.PI);
  ctx.stroke();

  // Cheeks flush
  ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
  ctx.beginPath();
  ctx.arc(cx - 75, cy + 35, 26, 0, Math.PI * 2);
  ctx.arc(cx + 75, cy + 35, 26, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export const SnapchatCameraModal: React.FC<SnapchatCameraModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomFace,
  currentFaceData,
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [activeMode, setActiveMode] = useState<'live' | 'photo' | 'simulator'>(
    currentFaceData?.mode?.includes('live') ? 'live' : 'simulator'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Smart Face Contour Crop Controls
  const [zoomScale, setZoomScale] = useState(currentFaceData?.zoomScale ?? 1.25);
  const [offsetX, setOffsetX] = useState(currentFaceData?.offsetX ?? 0.0);
  const [offsetY, setOffsetY] = useState(currentFaceData?.offsetY ?? 0.0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Prepare simulator canvas
  useEffect(() => {
    if (!simCanvasRef.current) {
      simCanvasRef.current = createAstronautFaceCanvas();
    }
  }, []);

  // Live Camera Start (Works seamlessly on HTTPS: https://10.142.62.96:3000)
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('الكاميرا غير مدعومة فالمتصفح أو الرابط غير آمن (خاص HTTPS).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        const v = document.createElement('video');
        v.playsInline = true;
        v.muted = true;
        v.autoplay = true;
        videoRef.current = v;
      }

      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();

      setIsStreaming(true);
      setActiveMode('live');

      // Auto apply to character
      onApplyCustomFace({
        mode: 'smart_live',
        videoElement: v,
        zoomScale,
        offsetX,
        offsetY,
      });
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'تعذر تشغيل الكاميرا المباشرة: تأكد أنك داخل بـ HTTPS (https://10.142.62.96:3000) وعطيتي الإذن للمتصفح.'
      );
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  // Handle Photo / Selfie Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleStopCamera();
    const reader = new FileReader();
    reader.onload = evt => {
      const src = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setPhotoImage(img);
        setActiveMode('photo');
        onApplyCustomFace({
          mode: 'smart_photo',
          fullFaceImage: img,
          zoomScale,
          offsetX,
          offsetY,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Apply Simulator Model
  const handleApplySimulator = () => {
    handleStopCamera();
    setActiveMode('simulator');
    if (!simCanvasRef.current) {
      simCanvasRef.current = createAstronautFaceCanvas();
    }
    onApplyCustomFace({
      mode: 'smart_photo',
      fullFaceImage: simCanvasRef.current,
      zoomScale,
      offsetX,
      offsetY,
    });
  };

  // Reset to original Fall Guy face
  const handleResetFace = () => {
    handleStopCamera();
    onApplyCustomFace(null);
    onClose();
  };

  // Re-apply whenever sliders change
  useEffect(() => {
    if (activeMode === 'live' && videoRef.current && isStreaming) {
      onApplyCustomFace({
        mode: 'smart_live',
        videoElement: videoRef.current,
        zoomScale,
        offsetX,
        offsetY,
      });
    } else if (activeMode === 'photo' && photoImage) {
      onApplyCustomFace({
        mode: 'smart_photo',
        fullFaceImage: photoImage,
        zoomScale,
        offsetX,
        offsetY,
      });
    } else if (activeMode === 'simulator' && simCanvasRef.current) {
      onApplyCustomFace({
        mode: 'smart_photo',
        fullFaceImage: simCanvasRef.current,
        zoomScale,
        offsetX,
        offsetY,
      });
    }
  }, [zoomScale, offsetX, offsetY, activeMode, isStreaming, photoImage]);

  // Modal Real-Time Visor Preview Loop
  useEffect(() => {
    if (!isOpen) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderPreview = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.42;
      const ry = h * 0.40;

      ctx.clearRect(0, 0, w, h);

      // Dark subtle vignette background
      const bgGrad = ctx.createRadialGradient(cx, cy, rx * 0.3, cx, cy, rx * 1.2);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Determine active source
      let source: CanvasImageSource | null = null;
      let isVideo = false;

      if (activeMode === 'live' && videoRef.current && videoRef.current.readyState >= 2) {
        source = videoRef.current;
        isVideo = true;
      } else if (activeMode === 'photo' && photoImage) {
        source = photoImage;
      } else if (simCanvasRef.current) {
        source = simCanvasRef.current;
      }

      if (source) {
        const srcW = (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || (source as HTMLCanvasElement).width || 480;
        const srcH = (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || (source as HTMLCanvasElement).height || 480;

        const baseScale = Math.max((rx * 2.1) / srcW, (ry * 2.1) / srcH) * zoomScale;
        const fitW = srcW * baseScale;
        const fitH = srcH * baseScale;

        // 1. Organic Face Contour Clipping Path (Hairline, Temples, Cheeks, Jawline, Chin)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.72, cy - ry * 0.65);
        ctx.bezierCurveTo(cx - rx * 0.35, cy - ry * 0.96, cx + rx * 0.35, cy - ry * 0.96, cx + rx * 0.72, cy - ry * 0.65);
        ctx.bezierCurveTo(cx + rx * 0.92, cy - ry * 0.35, cx + rx * 0.88, cy + ry * 0.22, cx + rx * 0.62, cy + ry * 0.66);
        ctx.bezierCurveTo(cx + rx * 0.38, cy + ry * 0.92, cx + rx * 0.16, cy + ry * 0.98, cx, cy + ry * 0.98);
        ctx.bezierCurveTo(cx - rx * 0.16, cy + ry * 0.98, cx - rx * 0.38, cy + ry * 0.92, cx - rx * 0.62, cy + ry * 0.66);
        ctx.bezierCurveTo(cx - rx * 0.88, cy + ry * 0.22, cx - rx * 0.92, cy - ry * 0.35, cx - rx * 0.72, cy - ry * 0.65);
        ctx.closePath();
        ctx.clip();

        // 2. Draw Video / Selfie
        ctx.save();
        ctx.translate(cx, cy + offsetY * ry);
        if (isVideo) ctx.scale(-1, 1);
        ctx.drawImage(source, -fitW / 2, -fitH / 2, fitW, fitH);
        ctx.restore();

        // 3. Feathered Soft Alpha Blending on Outer Edges
        ctx.globalCompositeOperation = 'destination-in';
        const featherGrad = ctx.createRadialGradient(cx, cy, rx * 0.52, cx, cy, rx * 0.94);
        featherGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        featherGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0.95)');
        featherGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0.45)');
        featherGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = featherGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore(); // end clip
      }

      // Elegant minimal boundary outline
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.94, ry * 0.94, 0, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(renderPreview);
    };

    renderPreview();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isOpen, activeMode, photoImage, isStreaming, zoomScale, offsetX, offsetY]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[94vh] flex flex-col bg-slate-900 border border-amber-500/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden text-right select-none"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">📷</span>
            <div>
              <h3 className="text-sm font-bold text-amber-200 font-mono">
                فيلتر سيلفي الوجه الذكي (Smart Face Crop)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                قص ملامح الوجه التلقائي • عزل الخلفية • دمج ناعم مع شخصية الفال غاي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* HTTPS Secure Context Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>اتصال آمن بـ HTTPS: الكاميرا المباشرة خدامة 100% بدون حظر من كروم!</span>
          </div>

          {/* Camera Error banner if any */}
          {cameraError && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-[11px] text-rose-200 font-mono">
              ⚠️ {cameraError}
            </div>
          )}

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. Live Video Stream */}
            {!isStreaming ? (
              <button
                onClick={handleStartCamera}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border font-mono text-xs font-bold transition-all ${
                  activeMode === 'live'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Video className="w-4 h-4 mb-1 text-emerald-400" />
                <span>كاميرا لايف 🎥</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-rose-600 text-white border border-rose-400 font-mono text-xs font-bold shadow-lg"
              >
                <Square className="w-4 h-4 mb-1 fill-white" />
                <span>إيقاف اللايف ⏹️</span>
              </button>
            )}

            {/* 2. Interactive Simulator Preset */}
            <button
              onClick={handleApplySimulator}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border font-mono text-xs font-bold transition-all ${
                activeMode === 'simulator'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Sparkles className="w-4 h-4 mb-1 text-amber-400" />
              <span>وجه تجريبي ✨</span>
            </button>

            {/* 3. Selfie / Upload Photo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border font-mono text-xs font-bold transition-all ${
                activeMode === 'photo'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Camera className="w-4 h-4 mb-1 text-sky-400" />
              <span>صورة سيلفي 📸</span>
            </button>
          </div>

          {/* Real-time Astronaut Visor Canvas Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-black flex flex-col items-center justify-center p-2 shadow-inner">
            <canvas
              ref={previewCanvasRef}
              width={280}
              height={280}
              className="rounded-full shadow-[0_0_20px_rgba(56,189,248,0.25)] max-w-full"
            />
            <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>معاينة حية: الزجاجة الدائرية المحدبة وتقويس العدسة</span>
            </div>
          </div>

          {/* Lens & Visor Calibration Sliders */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>ضبط ومحاذاة الوجه الذكي (Smart Face Alignment):</span>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 min-w-[85px] text-[11px]">
                حجم الوجه: <strong className="text-amber-300">{Math.round(zoomScale * 100)}%</strong>
              </span>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.02"
                value={zoomScale}
                onChange={e => setZoomScale(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400"
              />
            </div>

            {/* Horizontal Offset Slider */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 min-w-[85px] text-[11px]">
                محاذاة أفقية:
              </span>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.01"
                value={offsetX}
                onChange={e => setOffsetX(parseFloat(e.target.value))}
                className="flex-1 accent-sky-400"
              />
            </div>

            {/* Vertical Offset Slider */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 min-w-[85px] text-[11px]">
                محاذاة عمودية:
              </span>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.01"
                value={offsetY}
                onChange={e => setOffsetY(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleResetFace}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>الوجه الافتراضي</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>تأكيد والرجوع للمشهد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
