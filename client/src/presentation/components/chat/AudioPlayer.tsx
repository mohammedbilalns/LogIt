import React, { useRef, useState, useEffect } from 'react';
import { Box, Group, ActionIcon, Slider, Text, useMantineColorScheme } from '@mantine/core';
import { PlayIcon, PauseIcon } from '../icons/PlayIcon';

interface AudioPlayerProps {
  src: string;
  fileName?: string;
  size?: number;
  compact?: boolean;
  previewWidth?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, fileName, size, compact, previewWidth }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
  }, [src]);

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    let dur = audioRef.current.duration;
    if (!isFinite(dur) || isNaN(dur)) {
      const audio = audioRef.current;
      const onSeeked = () => {
        setDuration(audio.duration);
        audio.currentTime = 0;
        audio.removeEventListener('seeked', onSeeked);
      };
      audio.addEventListener('seeked', onSeeked);
      audio.currentTime = 1e10;
    } else {
      setDuration(dur);
    }
  };

  const handleSliderChange = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  return (
    <Box
      style={{
        width: previewWidth ? previewWidth : (compact ? 140 : 200),
        background: isDark ? 'rgba(40,44,52,0.85)' : '#f8f9fa',
        border: isDark ? '1px solid #343a40' : '1px solid #dee2e6',
        borderRadius: 8,
        padding: compact ? 2 : 6,
        boxShadow: isDark
          ? '0 2px 8px rgba(40,44,52,0.18)'
          : '0 2px 8px rgba(34,139,230,0.08)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
      <Group gap={compact ? 2 : 4} align="center" wrap="nowrap" style={{ width: '100%' }}>
        <ActionIcon onClick={handlePlayPause} size={compact ? 'sm' : 'md'} variant="subtle" color={isDark ? 'gray.3' : 'blue'}>
          {playing ? <PauseIcon width={compact ? 13 : 16} height={compact ? 13 : 16} /> : <PlayIcon width={compact ? 13 : 16} height={compact ? 13 : 16} />}
        </ActionIcon>
        <Slider
          min={0}
          max={duration}
          value={Math.floor(currentTime)}
          onChange={handleSliderChange}
          step={1}
          style={{ flex: 1, minWidth: compact ? 40 : 60 }}
          color={isDark ? 'gray.5' : 'blue'}
          thumbSize={compact ? 8 : 10}
          size={compact ? 'sm' : 'xs'}
          label={value => formatTime(value)}
        />
        <Text size={compact ? 'xs' : 'xs'} c={isDark ? 'gray.4' : 'dimmed'} style={{ minWidth: compact ? 30 : 38, textAlign: 'right', fontSize: compact ? 11 : undefined }}>
          {formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(duration))}
        </Text>
      </Group>
      {!compact && fileName && size && (
        <Text size="xs" c={isDark ? 'gray.4' : 'dimmed'}>
          {Math.round(size / 1024)} KB
        </Text>
      )}
    </Box>
  );
}; 