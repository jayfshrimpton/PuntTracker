'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TrendingUp, Activity } from 'lucide-react';

interface LogoProps {
  size?: number;
  variant?: 'landing' | 'dashboard';
  className?: string;
}

export default function Logo({ size = 32, variant = 'dashboard', className = '' }: LogoProps) {
  // Start with false - ensures server and client render the same initially
  const [imageLoaded, setImageLoaded] = useState(false);
  const Icon = variant === 'landing' ? TrendingUp : Activity;

  useEffect(() => {
    // This only runs on client after hydration
    // Check if image exists and can be loaded
    const img = new window.Image();
    img.onload = () => {
      // Image exists and loaded successfully - switch to image
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Image doesn't exist or failed - keep fallback (already false)
      setImageLoaded(false);
    };
    img.src = '/puntersjournallogoblack-removebg-preview.png';
  }, []);

  // Always render fallback icon initially (server and first client render match)
  // This prevents hydration mismatch
  const fallbackIcon = (
    <div className={`bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg ${className}`}>
      <Icon className="text-white" style={{ width: size - 8, height: size - 8 }} />
    </div>
  );

  if (!imageLoaded) {
    return fallbackIcon;
  }

  // Only render image after client-side check confirms it exists
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/puntersjournallogoblack-removebg-preview.png"
        alt="Punter's Journal Logo"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

