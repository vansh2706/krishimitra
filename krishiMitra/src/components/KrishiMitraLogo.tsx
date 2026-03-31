import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const KrishiMitraLogo: React.FC<LogoProps> = ({ 
  className = "", 
  width = 300, 
  height = 180 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 300 180" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main background gradient */}
        <radialGradient id="backgroundGradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style={{stopColor:'#2A5F3A', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#1A3F2A', stopOpacity:1}} />
        </radialGradient>
        
        {/* Leaf gradients for natural look */}
        <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#8FD957', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#7BC83B', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#6BB02A', stopOpacity:1}} />
        </linearGradient>
        
        <linearGradient id="leafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#A5E76A', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#8FD957', stopOpacity:1}} />
        </linearGradient>
        
        {/* Water droplet gradient */}
        <radialGradient id="waterGradient" cx="30%" cy="20%" r="70%">
          <stop offset="0%" style={{stopColor:'#4FB3D9', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#3A9BC1', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#2E7D8F', stopOpacity:1}} />
        </radialGradient>
      </defs>
      
      {/* Main circular background */}
      <circle cx="150" cy="75" r="65" fill="url(#backgroundGradient)" />
      
      {/* Decorative leaf circle pattern */}
      <g fill="url(#leafGradient)">
        {/* Top leaves */}
        <ellipse cx="80" cy="25" rx="4" ry="8" transform="rotate(-30 80 25)" />
        <ellipse cx="100" cy="20" rx="4" ry="8" transform="rotate(0 100 20)" />
        <ellipse cx="120" cy="25" rx="4" ry="8" transform="rotate(30 120 25)" />
        
        {/* Right side leaves */}
        <ellipse cx="130" cy="40" rx="4" ry="8" transform="rotate(60 130 40)" />
        <ellipse cx="135" cy="55" rx="4" ry="8" transform="rotate(90 135 55)" />
        <ellipse cx="130" cy="70" rx="4" ry="8" transform="rotate(120 130 70)" />
        
        {/* Bottom leaves */}
        <ellipse cx="120" cy="80" rx="4" ry="8" transform="rotate(150 120 80)" />
        <ellipse cx="100" cy="85" rx="4" ry="8" transform="rotate(180 100 85)" />
        <ellipse cx="80" cy="80" rx="4" ry="8" transform="rotate(210 80 80)" />
        
        {/* Left side leaves */}
        <ellipse cx="70" cy="70" rx="4" ry="8" transform="rotate(240 70 70)" />
        <ellipse cx="65" cy="55" rx="4" ry="8" transform="rotate(270 65 55)" />
        <ellipse cx="70" cy="40" rx="4" ry="8" transform="rotate(300 70 40)" />
      </g>
      
      {/* Sparkling dots for magic effect */}
      <g fill="#B8E6B8">
        <circle cx="75" cy="35" r="1" />
        <circle cx="125" cy="45" r="1.5" />
        <circle cx="85" cy="65" r="1" />
        <circle cx="115" cy="75" r="1.2" />
        <circle cx="90" cy="30" r="0.8" />
        <circle cx="110" cy="35" r="1" />
      </g>
      
      {/* Water droplet (top right) */}
      <path d="M 120 30 Q 125 25 130 30 Q 125 35 120 30 Z" fill="url(#waterGradient)" />
      
      {/* Farmer figure (white silhouette) */}
      <g fill="white">
        {/* Hat */}
        <ellipse cx="85" cy="45" rx="8" ry="3" />
        <rect x="80" y="42" width="10" height="6" rx="2" />
        
        {/* Head */}
        <circle cx="85" cy="48" r="4" />
        
        {/* Body */}
        <rect x="82" y="52" width="6" height="12" rx="3" />
        
        {/* Extended arm pointing */}
        <rect x="88" y="54" width="8" height="2" rx="1" />
        <circle cx="96" cy="55" r="1.5" />
      </g>
      
      {/* Tractor (white silhouette) */}
      <g fill="white">
        {/* Main body */}
        <rect x="105" y="58" width="12" height="8" rx="2" />
        
        {/* Large rear wheel */}
        <circle cx="113" cy="68" r="4" />
        <circle cx="113" cy="68" r="2" fill="url(#greenGradient)" />
        
        {/* Small front wheel */}
        <circle cx="107" cy="68" r="2.5" />
        <circle cx="107" cy="68" r="1.5" fill="url(#greenGradient)" />
        
        {/* Exhaust pipe */}
        <rect x="116" y="55" width="1" height="4" />
        
        {/* Cabin */}
        <path d="M 108 58 L 115 58 L 114 54 L 110 54 Z" />
      </g>
      
      {/* Gear wheel decoration */}
      <g fill="white" opacity="0.8">
        <circle cx="100" cy="60" r="6" />
        <circle cx="100" cy="60" r="3" fill="url(#greenGradient)" />
        {/* Gear teeth */}
        <rect x="99" y="51" width="2" height="3" />
        <rect x="99" y="66" width="2" height="3" />
        <rect x="91" y="59" width="3" height="2" />
        <rect x="106" y="59" width="3" height="2" />
      </g>
      
      {/* KrishiMitra Text */}
      <text 
        x="150" 
        y="165" 
        fontFamily="Arial, sans-serif" 
        fontSize="18" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="white"
      >
        KrishiMitra
      </text>
    </svg>
  );
};

export default KrishiMitraLogo;