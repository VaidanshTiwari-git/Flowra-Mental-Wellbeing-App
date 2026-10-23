import React from 'react';

interface FlowraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  className?: string;
  isAnimated?: boolean;
}

export const FlowraLogo: React.FC<FlowraLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  isAnimated = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[7px]' },
    md: { icon: 42, text: 'text-lg', sub: 'text-[9px]' },
    lg: { icon: 64, text: 'text-2xl', sub: 'text-[11px]' },
    xl: { icon: 96, text: 'text-3xl', sub: 'text-xs' },
    hero: { icon: 130, text: 'text-4xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glow behind icon */}
        <div className="absolute inset-0 bg-[#48df9a]/20 blur-xl rounded-full scale-110 pointer-events-none" />

        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${isAnimated ? 'animate-pulse' : ''} drop-shadow-[0_0_20px_rgba(72,223,154,0.35)]`}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="flowraGreenGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7EF8C0" />
              <stop offset="45%" stopColor="#48DF9A" />
              <stop offset="100%" stopColor="#25A86B" />
            </linearGradient>

            <linearGradient id="flowraLeafGrad" x1="100" y1="120" x2="175" y2="155" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5CEBB0" />
              <stop offset="100%" stopColor="#229D62" />
            </linearGradient>
          </defs>

          {/* Clock ray ticks on top-right */}
          <line
            x1="130"
            y1="46"
            x2="137"
            y2="33"
            stroke="#7EF8C0"
            strokeWidth="7"
            strokeLinecap="round"
            className="opacity-90"
          />
          <line
            x1="150"
            y1="64"
            x2="162"
            y2="54"
            stroke="#7EF8C0"
            strokeWidth="7"
            strokeLinecap="round"
            className="opacity-90"
          />
          <line
            x1="164"
            y1="88"
            x2="178"
            y2="83"
            stroke="#7EF8C0"
            strokeWidth="7"
            strokeLinecap="round"
            className="opacity-90"
          />
          <line
            x1="168"
            y1="115"
            x2="183"
            y2="117"
            stroke="#7EF8C0"
            strokeWidth="7"
            strokeLinecap="round"
            className="opacity-90"
          />

          {/* Left vertical anchor stem */}
          <path
            d="M 50 162 L 50 82"
            stroke="url(#flowraGreenGrad)"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Circular arc forming the outer shape */}
          <path
            d="M 50 82 C 50 48 76 28 112 28 C 120 28 126 28.8 132 30"
            stroke="url(#flowraGreenGrad)"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Bottom circular sweeping curve */}
          <path
            d="M 50 112 C 50 148 78 168 120 168 C 145 168 162 155 174 138"
            stroke="url(#flowraGreenGrad)"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Stylized Leaf sprout at bottom right */}
          <path
            d="M 130 164 C 148 160 178 145 175 125 C 158 128 138 148 130 164 Z"
            fill="url(#flowraLeafGrad)"
          />

          {/* Inner Checkmark */}
          <path
            d="M 80 98 L 96 116 L 132 78"
            stroke="url(#flowraGreenGrad)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showTagline && (
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5 tracking-[0.28em] text-[#7EF8C0] font-black text-xs uppercase">
            <span>FOCUS</span>
            <span className="text-[#34D399]/60 font-normal">•</span>
            <span>PLAN</span>
            <span className="text-[#34D399]/60 font-normal">•</span>
            <span>ACHIEVE</span>
          </div>
        </div>
      )}
    </div>
  );
};
