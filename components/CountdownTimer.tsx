'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Target date: December 20th, 2025 at 11:00 AM
        const targetDate = new Date('2025-12-20T11:00:00');

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }

            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative group mt-12 animate-fade-in">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative flex flex-col items-center justify-center p-8 bg-card border border-primary/20 rounded-xl shadow-2xl max-w-3xl mx-auto">
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-6 uppercase tracking-widest">
                    Paid Plans Launch In
                </h3>
                <div className="grid grid-cols-4 gap-6 sm:gap-12 text-center w-full">
                    <div className="flex flex-col items-center">
                        <div className="bg-background/50 rounded-lg p-3 w-full border border-border/50 shadow-inner">
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums text-foreground">{timeLeft.days}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-3 tracking-wider">Days</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-background/50 rounded-lg p-3 w-full border border-border/50 shadow-inner">
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums text-foreground">{timeLeft.hours}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-3 tracking-wider">Hours</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-background/50 rounded-lg p-3 w-full border border-border/50 shadow-inner">
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums text-foreground">{timeLeft.minutes}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-3 tracking-wider">Mins</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-background/50 rounded-lg p-3 w-full border border-border/50 shadow-inner">
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums text-foreground">{timeLeft.seconds}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-3 tracking-wider">Secs</span>
                    </div>
                </div>
                <p className="mt-8 text-base md:text-lg text-muted-foreground text-center font-medium">
                    Enjoy full access to all features for free until launch!
                </p>
            </div>
        </div>
    );
}
