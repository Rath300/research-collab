'use client';

import React, { useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { FiUser, FiMapPin, FiClock, FiBookmark, FiCheck, FiX, FiHeart } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Profile } from '../lib/types';

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
}

export function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const { 
    id, 
    first_name, 
    last_name, 
    bio, 
    avatar_url, 
    institution, 
    location, 
    availability, 
    interests, 
    field_of_study
  } = profile;
  
  const fullName = `${first_name} ${last_name}`;
  
  // Motion values for the swipe card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-30, 0, 30]);
  const opacity = useTransform(x, [-150, -75, 0, 75, 150], [0, 1, 1, 1, 0]);
  
  // Visual indicators for direction
  const leftIndicatorOpacity = useTransform(x, [-150, -75, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 75, 150], [0, 0.5, 1]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const direction = info.offset.x > 100 ? 'right' : info.offset.x < -100 ? 'left' : null;
    
    if (direction) {
      // Trigger the swipe action
      onSwipe(direction, id);
    }
  };
  
  // Get availability display text
  const getAvailabilityText = () => {
    switch (availability) {
      case 'full-time':
        return 'Available Full-time';
      case 'part-time':
        return 'Available Part-time';
      case 'weekends':
        return 'Available Weekends';
      case 'not-available':
        return 'Currently Unavailable';
      default:
        return 'Availability Unknown';
    }
  };
  
  // Add gradients based on field of study
  const getGradientClass = () => {
    if (!field_of_study) return 'from-primary-500 to-secondary-500';
    
    const fieldLower = field_of_study.toLowerCase();
    
    if (fieldLower.includes('computer') || fieldLower.includes('tech')) {
      return 'from-blue-500 to-cyan-500';
    } else if (fieldLower.includes('biology') || fieldLower.includes('medicine')) {
      return 'from-green-500 to-emerald-500';
    } else if (fieldLower.includes('physics') || fieldLower.includes('math')) {
      return 'from-purple-500 to-indigo-500';
    } else if (fieldLower.includes('chemistry')) {
      return 'from-amber-500 to-orange-500';
    } else {
      return 'from-primary-500 to-secondary-500';
    }
  };
  
  return (
    <div className="absolute w-full">
      <motion.div
        ref={cardRef}
        style={{ 
          x, 
          rotate, 
          opacity,
          zIndex: isDragging ? 10 : 0
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className="w-full"
        whileTap={{ scale: 0.98 }}
      >
        <Card className="relative h-[30rem] overflow-hidden shadow-xl">
          {/* Left indicator */}
          <motion.div 
            className="absolute left-5 top-5 bg-red-100 text-red-500 rounded-full p-3 z-20"
            style={{ opacity: leftIndicatorOpacity }}
          >
            <FiX size={40} />
          </motion.div>
          
          {/* Right indicator */}
          <motion.div 
            className="absolute right-5 top-5 bg-green-100 text-green-500 rounded-full p-3 z-20"
            style={{ opacity: rightIndicatorOpacity }}
          >
            <FiHeart size={40} />
          </motion.div>
          
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass()} opacity-10`} />
          
          <CardContent className="p-6 flex flex-col h-full">
            {/* Profile header */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 shadow-md">
                {avatar_url ? (
                  <img 
                    src={avatar_url} 
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUser className="h-12 w-12 text-primary-600" />
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                {institution && (
                  <p className="text-gray-600 dark:text-gray-300">{institution}</p>
                )}
                {field_of_study && (
                  <p className="text-primary-600 dark:text-primary-400 font-medium">
                    {field_of_study}
                  </p>
                )}
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex flex-wrap gap-2 mb-4">
              {location && (
                <div className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiMapPin className="mr-1" size={14} />
                  {location}
                </div>
              )}
              
              {availability && (
                <div className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiClock className="mr-1" size={14} />
                  {getAvailabilityText()}
                </div>
              )}
            </div>
            
            {/* Bio */}
            <div className="mb-4 flex-grow overflow-auto">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
                {bio || "No bio available."}
              </p>
            </div>
            
            {/* Interests */}
            {interests && interests.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Research Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest: string) => (
                    <div 
                      key={interest}
                      className="bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300 px-2 py-1 rounded-md text-xs"
                    >
                      <FiBookmark className="inline mr-1" size={12} />
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-center space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  className="h-14 w-14 rounded-full border-2 border-red-500 text-red-500 p-0"
                  onClick={() => onSwipe('left', id)}
                >
                  <FiX size={24} />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  className="h-14 w-14 rounded-full border-2 border-green-500 text-green-500 p-0"
                  onClick={() => onSwipe('right', id)}
                >
                  <FiHeart size={24} />
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 