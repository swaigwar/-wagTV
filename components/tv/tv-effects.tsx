'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

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

  const renderStaticEffect = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    const animate = () => {
      if (!isPlaying) return;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        (data as Uint8ClampedArray)[i] = noise; // eslint-disable-line security/detect-object-injection
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animate);
    };
    animate();
  }, [isPlaying]);

  const renderColorBars = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    const colors = [
      '#FFFFFF',
      '#FFFF00',
      '#00FFFF',
      '#00FF00',
      '#FF00FF',
      '#FF0000',
      '#0000FF',
      '#000000',
    ];
    const barWidth = canvas.width / colors.length;
    // Use a safer approach without object injection
    for (let i = 0; i < colors.length; i++) {
      ctx.fillStyle = colors[i] as string; // eslint-disable-line security/detect-object-injection
      ctx.fillRect(i * barWidth, 0, barWidth, canvas.height);
    }
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SWAGTV', canvas.width / 2, canvas.height / 2);
  }, []);

  const renderCrashEffect = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    const animate = () => {
      if (!isPlaying) return;
      // Crash screen pattern
      ctx.fillStyle = '#0000AA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SYSTEM ERROR', canvas.width / 2, canvas.height / 2 - 40);
      ctx.font = 'bold 24px monospace';
      ctx.fillText(
        'QUANTUM COHERENCE LOST',
        canvas.width / 2,
        canvas.height / 2 + 20,
      );
      requestAnimationFrame(animate);
    };
    animate();
  }, [isPlaying]);

  const renderChannelChange = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    let frame = 0;
    const animate = () => {
      if (!isPlaying) return;
      frame++;
      // Black frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Channel number
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CH 01', canvas.width / 2, canvas.height / 2);
      if (frame < 30) requestAnimationFrame(animate);
    };
    animate();
  }, [isPlaying]);

  const renderEffect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 640;
    canvas.height = 480;
    
    // Use direct function calls instead of object indexing
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
  }, [effect, renderStaticEffect, renderColorBars, renderCrashEffect, renderChannelChange]);

  const playEffectAudio = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
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

      // Different sounds based on the effect
      switch (effect) {
        case 'static':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(
            100,
            audioContext.currentTime,
          );
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            0.1,
            audioContext.currentTime + 0.01,
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5,
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
        case 'crash':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(
            150,
            audioContext.currentTime,
          );
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            0.2,
            audioContext.currentTime + 0.01,
          );
          gainNode.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + 0.8,
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.8);
          break;
        case 'channelChange':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(
            440,
            audioContext.currentTime,
          );
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            0.05,
            audioContext.currentTime + 0.01,
          );
          gainNode.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + 0.2,
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }, [effect]);

  const getEffectDuration = (effectType: string): number => {
    switch (effectType) {
      case 'static':
        return 2000;
      case 'colorBars':
        return 5000;
      case 'crash':
        return 3000;
      case 'channelChange':
        return 1000;
      default:
        return 1000;
    }
  };

  useEffect(() => {
    if (effect !== 'none') {
      setIsPlaying(true);
      renderEffect();
      if (audioEnabled) playEffectAudio();
      const duration = getEffectDuration(effect);
      const timer = setTimeout(() => {
        setIsPlaying(false);
        onEffectComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [effect, audioEnabled, onEffectComplete, playEffectAudio, renderEffect]);

  if (effect === 'none') return null;

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
  switchChannel: () => ['channelChange', 'static', 'colorBars'],
  signalLoss: () => ['crash', 'static'],
  startup: () => ['colorBars', 'channelChange'],
  error: () => ['crash', 'static', 'crash'],
};

export default TVEffects;
