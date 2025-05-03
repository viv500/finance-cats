import React from 'react';
import { useAudioDetection } from '@/hooks/useAudioDetection';

interface TalkingCatProps {
  imgIdle: string;
  imgTalking: string;
  altText: string;
  className?: string;
}

export const TalkingCat: React.FC<TalkingCatProps> = ({
  imgIdle,
  imgTalking,
  altText,
  className = '',
}) => {
  const { isTalking, error } = useAudioDetection();

  return (
    <div className={`relative ${className}`}>
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-800 p-2 text-sm rounded">
          Error: {error}
        </div>
      )}
      <div className="relative w-full h-full">
        <img
          src={imgTalking}
          alt={`${altText} talking`}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            isTalking ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <img
          src={imgIdle}
          alt={`${altText} idle`}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            isTalking ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
}; 