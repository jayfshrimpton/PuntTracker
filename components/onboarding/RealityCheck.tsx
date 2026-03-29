'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealityCheckProps {
  onComplete: (wantsTruth: boolean) => void;
}

export function RealityCheck({ onComplete }: RealityCheckProps) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleResponse = async (wantsTruth: boolean) => {
    setLoading(true);
    setSelected(wantsTruth);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Update profile with wants_truth and mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({
          wants_truth: wantsTruth,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving onboarding response:', error);
        return;
      }

      // Call onComplete callback
      onComplete(wantsTruth);
    } catch (error) {
      console.error('Error in onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full space-y-8">
        {/* Belief-Challenging Statement */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Most punters think they&apos;re close to break even.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            82% are down more than they realise.
          </p>
        </div>

        {/* Permission-Based Question */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg md:text-xl text-foreground mb-8">
              If we could show you exactly where your betting is leaking money, would you want to know?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleResponse(true)}
              disabled={loading}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                selected === true
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : selected === false
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Yes
            </button>
            <button
              onClick={() => handleResponse(false)}
              disabled={loading}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                selected === false
                  ? 'bg-muted text-muted-foreground'
                  : selected === true
                  ? 'bg-muted/50 text-muted-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

