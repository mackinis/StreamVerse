
"use client";

import { useEffect, useState } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';
import type { Popup } from '@/types';
import { getAllPopupsAction } from '@/app/actions';
import { CourseVideoPlayer } from './CourseVideoPlayer';
import { Card, CardContent, CardHeader, CardTitle as CardTitleComponent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PopupDisplayManager() {
  const { isClientHydrated } = useAdminConfig();
  const [allPopups, setAllPopups] = useState<Popup[]>([]);
  const [activePopups, setActivePopups] = useState<Popup[]>([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  useEffect(() => {
    const fetchPopups = async () => {
      const fetchedPopups = await getAllPopupsAction();
      setAllPopups(fetchedPopups);
    };
    fetchPopups();
  }, []);

  useEffect(() => {
    if (isClientHydrated && allPopups.length > 0) {
      const popupsToShow = allPopups.filter(popup => {
        if (!popup.isActive) return false;
        if (popup.displayCondition === 'always') return true;
        if (popup.displayCondition === 'once-per-session') {
          try {
            const hasBeenShown = sessionStorage.getItem(`popup_${popup.id}`);
            return !hasBeenShown;
          } catch (error) {
            console.error("Session storage is not available.", error);
            return true; // Fallback to showing if session storage fails
          }
        }
        return false;
      });
      setActivePopups(popupsToShow);
      setCurrentPopupIndex(0);
    }
  }, [allPopups, isClientHydrated]);

  const handleClose = () => {
    const currentPopup = activePopups[currentPopupIndex];
    if (currentPopup && currentPopup.displayCondition === 'once-per-session') {
      try {
        sessionStorage.setItem(`popup_${currentPopup.id}`, 'shown');
      } catch (error) {
        console.error("Session storage is not available.", error);
      }
    }
    // Move to the next popup
    if (currentPopupIndex < activePopups.length - 1) {
      setCurrentPopupIndex(currentPopupIndex + 1);
    } else {
       // Reset or mark all as done
      setActivePopups([]);
    }
  };

  if (activePopups.length === 0 || currentPopupIndex >= activePopups.length) {
    return null;
  }

  const currentPopup = activePopups[currentPopupIndex];

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="p-0 border-0 max-w-2xl bg-card shadow-lg rounded-lg">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            {/* The visual title */}
            <CardTitleComponent>{currentPopup.title}</CardTitleComponent>
            {/* The accessible title, hidden visually */}
            <DialogTitle className="sr-only">{currentPopup.title}</DialogTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {currentPopup.description && (
                <p className="text-muted-foreground">{currentPopup.description}</p>
             )}
            {currentPopup.type === 'image' ? (
              <img src={currentPopup.contentUrl} alt={currentPopup.title} className="w-full h-auto rounded-lg" />
            ) : (
               <div className="aspect-video w-full">
                  <CourseVideoPlayer url={currentPopup.contentUrl} className="w-full h-full rounded-lg" />
               </div>
            )}
          </CardContent>
           <CardFooter>
            <DialogClose asChild>
                <Button className="w-full">Cerrar</Button>
            </DialogClose>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
