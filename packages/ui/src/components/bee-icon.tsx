import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';
import { View } from 'tamagui';

interface BeeIconProps {
  size?: number;
  color?: string;
}

export function BeeIcon({ size = 32, color = '#F5BD30' }: BeeIconProps) {
  return (
    <View width={size} height={size}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Body */}
        <Path
          d="M32 48c9.941 0 18-8.059 18-18S41.941 12 32 12 14 20.059 14 30s8.059 18 18 18z"
          fill={color}
        />
        
        {/* Stripes */}
        <Path
          d="M26 22h12M24 30h16M26 38h12"
          stroke="#000"
          strokeWidth={3}
          strokeLinecap="round"
        />
        
        {/* Wings */}
        <Path
          d="M14 26c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM50 26c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
          fill="#E6E6E6"
          fillOpacity={0.8}
        />
        
        {/* Stinger */}
        <Path
          d="M32 48v8l4-4-4-4z"
          fill="#333"
        />
        
        {/* Eyes */}
        <Circle cx="26" cy="20" r="3" fill="#333" />
        <Circle cx="38" cy="20" r="3" fill="#333" />
        
        {/* Antennae */}
        <Path
          d="M27 15c-1-3-3-5-5-5M37 15c1-3 3-5 5-5"
          stroke="#333"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
} 