'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TVEffectsProps {
  effect: 'static' | 'colorBars' | 'crash' | 'channelChange' | 'none';
  onEffectComplete?: () => void;
  audioEnabled?: boolean;
}

export const TVEffects: React.FC<TVEffectsProps> = ({
  effect,
  onEffectComplete,
  audioEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (effect !== 'none') {
      setIsPlaying(true);
      renderEffect();
      if (audioEnabled) {
        playEffectAudio();
      }
      const duration = getEffectDuration(effect);
      const timer = setTimeout(() => {
        setIsPlaying(false);
        onEffectComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [effect]);

  const renderEffect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 640;
    canvas.height = 480;
    switch (effect) {
      case 'static':
        renderStaticEffect(ctx, canvas);
        break;
      case 'colorBars':
        renderColorBars(ctx, canvas);
        break;
      case 'crash':
        renderCrashEffect(ctx, canvas);
        break;
      case 'channelChange':
        renderChannelChange(ctx, canvas);
        break;
    }
  };

  const renderStaticEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const animateStatic = () => {
      if (!isPlaying) return;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animateStatic);
    };
    animateStatic();
  };

  const renderColorBars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const colors = [
      '#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0', '#000000',
    ];
    const barWidth = canvas.width / colors.length;
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * barWidth, 0, barWidth, canvas.height * 0.75);
    });
    const bottomHeight = canvas.height * 0.25;
    const bottomY = canvas.height * 0.75;
    const smallColors = ['#0000C0', '#000000', '#C000C0', '#000000', '#00C0C0', '#000000', '#C0C0C0'];
    const smallBarWidth = canvas.width / smallColors.length;
    smallColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * smallBarWidth, bottomY, smallBarWidth, bottomHeight);
    });
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    const text = 'SWAGTV';
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('PG-13 • QUANTUM SYNC', canvas.width - 10, canvas.height - 10);
  };

  const renderCrashEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    let frame = 0;
    const animateCrash = () => {
      if (!isPlaying) return;
      frame++;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      if (frame % 10 < 3) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.8;
        const barHeight = 20;
        const barY = Math.random() * (canvas.height - barHeight);
        ctx.fillRect(0, barY, canvas.width, barHeight);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      if (frame % 20 < 10) {
        ctx.fillText('SIGNAL LOST', canvas.width / 2, canvas.height / 2);
      }
      if (frame < 60) {
        requestAnimationFrame(animateCrash);
      }
    };
    animateCrash();
  };

  const renderChannelChange = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    let frame = 0;
    const animateChannelChange = () => {
      if (!isPlaying) return;
      frame++;
      const progress = frame / 30;
      const splitY = canvas.height / 2;
      const offset = progress * 50;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (progress < 0.5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, splitY - offset, canvas.width, offset * 2);
      }
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CH 01', canvas.width / 2, canvas.height / 2);
      if (frame < 30) {
        requestAnimationFrame(animateChannelChange);
      }
    };
    animateChannelChange();
  };

  const playEffectAudio = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      filter.Q.setValueAtTime(1.5, audioContext.currentTime);
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      switch (effect) {
        case 'static':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          break;
        case 'crash':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.5);
          break;
        case 'channelChange':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
          break;
        case 'colorBars':
          return;
      }
      const duration = getEffectDuration(effect) / 1000;
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      oscillator.onended = () => audioContext.close();
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  };

  const getEffectDuration = (effectType: string): number => {
    switch (effectType) {
      case 'static':
        return 1000;
      case 'colorBars':
        return 3000;
      case 'crash':
        return 1500;
      case 'channelChange':
        return 500;
      default:
        return 1000;
    }
  };

  if (effect === 'none') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute bottom-4 right-4 text-green-400 font-mono text-sm">
        {effect.toUpperCase()} EFFECT ACTIVE
      </div>
    </div>
  );
};

export const TVEffectPresets = {
  switchChannel: () => ['channelChange', 'static', 'colorBars'] as const,
  signalLoss: () => ['crash', 'static'] as const,
  startup: () => ['colorBars', 'channelChange'] as const,
  error: () => ['crash', 'static', 'crash'] as const,
};

export default TVEffects;

