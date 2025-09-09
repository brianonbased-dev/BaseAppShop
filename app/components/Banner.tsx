"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface BannerProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Banner({ 
  title = "Brian X Base Store", 
  className = "" 
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={bannerRef}
      className={`banner__content banner__content--bottom-center ${className}`}
    >
      <div className={`banner__box gradient p-6 rounded-lg mb-6 scroll-trigger ${isVisible ? 'animate' : ''}`}>
        <div className="text-center space-y-3">
          <h1 className="text-2xl text-[var(--app-foreground)] font-[var(--font-heading-family)] animate-slide-in">
            {title}
          </h1>
          <p className="text-[var(--app-foreground-muted)] text-sm font-medium animate-slide-in" style={{animationDelay: '0.2s'}}>
            All in on Brian, Get your Body Jacked!
          </p>
          <div className="flex items-center justify-center space-x-2 mb-4 animate-slide-in" style={{animationDelay: '0.4s'}}>
            <div className="w-2 h-2 bg-[var(--app-accent)] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[var(--app-accent)] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          {/* Hero Image */}
          <div className="w-full animate-slide-in" style={{animationDelay: '0.6s'}}>
            <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-lg">
              <Image 
                src="/brian-hero.png" 
                alt="Brian X Base Hero"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 448px) 100vw, 448px"
                priority
                onError={(e) => {
                  // Hide container if image fails to load
                  const target = e.currentTarget;
                  const container = target.closest('.relative') as HTMLElement;
                  if (container) {
                    container.style.display = 'none';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductBannerProps {
  className?: string;
}

export function ProductBanner({ className = "" }: ProductBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20% 0px'
      }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={bannerRef}
      className={`banner__content ${className}`}
    >
      <div className={`banner__box gradient p-4 rounded-lg scroll-trigger ${isVisible ? 'animate' : ''} bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200`}>
        <div className="text-center">
          <p className="text-sm font-medium text-emerald-800">
            🌿 Energy • 💪 Performance • 🧠 Brain Health
          </p>
        </div>
      </div>
    </div>
  );
}