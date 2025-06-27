
"use client";

import { useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface UniversalVideoPlayerProps {
  url: string;
  className?: string;
  isPreview?: boolean;
}

const getYoutubeEmbedUrl = (url: string, isPreview: boolean): string | null => {
  let videoId: string | null = null;
  
  try {
    if (url.includes('youtube.com/watch?v=')) {
      videoId = new URL(url).searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = new URL(url).pathname.split('/')[1];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = new URL(url).pathname.split('/')[2].split('?')[0];
    }
  } catch(e) {
    console.error("Invalid URL for YouTube parsing", url);
    return null;
  }

  if (!videoId) return null;
  
  const params = isPreview 
    ? new URLSearchParams({
        autoplay: '1',
        mute: '1',
        loop: '1',
        playlist: videoId, // loop requires playlist
        controls: '0',
        showinfo: '0',
        modestbranding: '1',
        playsinline: '1'
      })
    : new URLSearchParams({
        autoplay: '1',
        controls: '1',
      });
      
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export function CourseVideoPlayer({ url, className, isPreview = false }: UniversalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoType = useMemo(() => {
    if (!url) return 'none';
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.startsWith('<iframe')) return 'iframe-string';
    if (getYoutubeEmbedUrl(url, isPreview)) return 'youtube';
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) return 'direct-video';
    
    if (!lowerUrl.match(/^https?:\/\//)) return 'none';
    return 'iframe-url'; 
  }, [url, isPreview]);

  useEffect(() => {
    if (videoType === 'direct-video' && isPreview && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn("Autoplay was prevented for preview video. This is a browser policy.", error);
      });
    }
  }, [videoType, isPreview, url]);

  if (videoType === 'none') {
    return <div className={cn("w-full h-full bg-muted flex items-center justify-center text-muted-foreground", className)}>No video provided</div>;
  }

  if (videoType === 'iframe-string') {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: url }}
      />
    );
  }

  if (videoType === 'youtube') {
    const embedUrl = getYoutubeEmbedUrl(url, isPreview);
    if (!embedUrl) return null;
    
    return (
      <iframe
        key={embedUrl}
        src={embedUrl}
        title="Course Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={className}
      ></iframe>
    );
  }

  if (videoType === 'direct-video') {
    return (
      <video
        ref={videoRef}
        key={url}
        src={url}
        controls={!isPreview}
        autoPlay={true}
        loop={isPreview}
        muted={isPreview}
        playsInline={true}
        className={className}
      />
    );
  }
  
  if (videoType === 'iframe-url') {
      let embedUrl;
      try {
        embedUrl = new URL(url);
        embedUrl.searchParams.set('autoplay', '1');
        if (isPreview) {
            embedUrl.searchParams.set('muted', '1');
            embedUrl.searchParams.set('loop', '1');
            embedUrl.searchParams.set('controls', '0');
        }
      } catch (e) {
        return <div className={cn("w-full h-full bg-destructive text-destructive-foreground flex items-center justify-center", className)}>Invalid video URL format</div>;
      }

      return (
         <iframe
            key={embedUrl.toString()}
            src={embedUrl.toString()}
            title="Course Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className={className}
        ></iframe>
      )
  }

  return <div className={cn("w-full h-full bg-destructive text-destructive-foreground flex items-center justify-center", className)}>Invalid video URL format</div>;
}
