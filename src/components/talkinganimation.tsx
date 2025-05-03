import { useEffect, useRef, useState, useCallback } from "react";

function TalkingImage({ imgIdle, imgTalking }) {
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  const isInitializedRef = useRef(false);
  const bufferLengthRef = useRef(null);
  const audioRef = useRef(null);

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
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      
      // Configure analyser
      analyser.fftSize = 2048;
      bufferLengthRef.current = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

      // Create hidden audio element
      const audio = document.createElement('audio');
      audio.src = '/audio.mp3';
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
      setError(err.message);
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
        setError(err.message);
      }
    };

    // Start animation loop
    animate();

    // Cleanup function
    return cleanupAudio;
  }, [initializeAudio, cleanupAudio]);

  return (
    <div style={{ 
      position: "relative", 
      width: "400px", 
      height: "400px",
      margin: "20px auto",
      border: "1px solid #ccc",
      padding: "20px"
    }}>
      {error && (
        <div style={{ 
          color: "red", 
          padding: "10px", 
          marginBottom: "10px",
          backgroundColor: "#ffebee",
          borderRadius: "4px"
        }}>
          Error: {error}
        </div>
      )}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ textAlign: "center" }}>
          The cat is listening to the background audio!
        </p>
      </div>
      <div style={{ 
        position: "relative", 
        width: "100%", 
        height: "300px",
        overflow: "hidden"
      }}>
        <img
          src={imgTalking}
          alt="Talking"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: isTalking ? "block" : "none",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            zIndex: 1
          }}
        />
        <img
          src={imgIdle}
          alt="Idle"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: isTalking ? "none" : "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            zIndex: 2
          }}
        />
      </div>
    </div>
  );
}

export default TalkingImage;
