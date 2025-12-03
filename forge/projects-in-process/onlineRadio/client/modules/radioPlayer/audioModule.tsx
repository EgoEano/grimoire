import { useNotification } from '@client/core/services/providers/notificationProvider';
import React, { useEffect, useRef } from 'react';

export function AudioWebModule({ 
    src, playing, volume
}: {src: string, playing: boolean, volume: number}) {
    const { pushNotify } = useNotification()

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const audio = audioRef.current;
            if (!audio) return;
            if (audio.paused) return;

            const src = audio.src;
            audio.src = '';
            audio.load();
            audio.src = src;
            audio.play().catch(() => {console.log('careload');});
        }, 300000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.src = src;
        if (playing) audioRef.current.play();
    }, [src]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    pushNotify({
                        type: 'error',
                        message: "Autoplay blocked. Details in console",
                    })
                    //console.warn('Autoplay blocked:', err)
                });
            }
        } else {
            audio.pause();
        }
    }, [playing]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    return (
        <audio 
            ref={audioRef}
            preload="none"
        />
    );
};