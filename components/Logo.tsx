'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TrendingUp, Activity } from 'lucide-react';

const LOGO_SRC = '/puntersjournallogoblack-removebg-preview.png';

interface LogoProps {
  size?: number;
  variant?: 'landing' | 'dashboard';
  className?: string;
}

export default function Logo({ size = 32, variant = 'dashboard', className = '' }: LogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = variant === 'landing' ? TrendingUp : Activity;

  const fallbackIcon = (
    <div className={`bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg ${className}`}>
      <Icon className="text-white" style={{ width: size - 8, height: size - 8 }} />
    </div>
  );

  if (imageFailed) {
    return fallbackIcon;
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_SRC}
        alt="Punter's Journal Logo"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: '100%', height: '100%' }}
        priority={variant === 'landing'}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
