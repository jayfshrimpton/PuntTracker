'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

interface CelebrationProps {
    show: boolean;
    onClose: () => void;
}

export function Celebration({ show, onClose }: CelebrationProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            // Fire confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#10B981', '#3B82F6', '#F59E0B']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#10B981', '#3B82F6', '#F59E0B']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();

            // Auto hide after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    if (!visible && !show) return null;

    return (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="bg-card border-2 border-primary/20 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-bounce-slight">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h4 className="font-bold text-foreground">Nice! 🎉 First bet tracked.</h4>
                    <p className="text-sm text-muted-foreground">Now add a few more to see trends.</p>
                </div>
            </div>
        </div>
    );
}
