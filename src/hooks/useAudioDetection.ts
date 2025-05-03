import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioDetection = () => {
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const isInitializedRef = useRef(false);
  const bufferLengthRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    isInitializedRef.current = false;
    bufferLengthRef.current = null;
  }, []);

  const initializeAudio = useCallback(async () => {
    try {
      if (isInitializedRef.current) return;
      
      console.log("Initializing audio...");
      
      // Create new audio context
      audioContextRef.current = new AudioContext();
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      
      // Configure analyser
      analyser.fftSize = 2048;
      bufferLengthRef.current = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

      // Create hidden audio element
      const audio = document.createElement('audio');
      audio.src = '/audio.mp3'; // This will be replaced by the actual speech
      audio.loop = true;
      audio.volume = 0.5;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audioRef.current = audio;
      
      // Create and connect source
      sourceRef.current = audioContext.createMediaElementSource(audio);
      sourceRef.current.connect(analyser);
      analyser.connect(audioContext.destination);

      // Start playing the audio
      await audio.play();

      isInitializedRef.current = true;
      console.log("Audio initialized successfully");

    } catch (err) {
      console.error("Error initializing audio:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, []);

  useEffect(() => {
    // Initialize audio when component mounts
    initializeAudio();

    // Animation loop for checking audio levels
    const animate = () => {
      try {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (analyserRef.current && dataArrayRef.current && bufferLengthRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          // Calculate average volume with more sensitivity
          const average = dataArrayRef.current.reduce((a, b) => a + b) / bufferLengthRef.current;
          
          // Update talking state based on volume threshold
          // Much lower threshold for more sensitivity
          setIsTalking(average > 1);
        }
      } catch (err) {
        console.error("Error in animation loop:", err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    // Start animation loop
    animate();

    // Cleanup function
    return cleanupAudio;
  }, [initializeAudio, cleanupAudio]);

  return { isTalking, error };
}; 