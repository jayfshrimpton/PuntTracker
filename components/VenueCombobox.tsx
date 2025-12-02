'use client';

import { useState, useRef, useEffect } from 'react';
import { AUSTRALIAN_RACE_TRACKS, getTracksByState, getTrackLabel, getRacingTypeIcon, getRacingTypeLabel, type RacingType } from '@/lib/australian-tracks';
import { ChevronDown, X, Plus } from 'lucide-react';

interface VenueComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export default function VenueCombobox({ value, onChange, className = '' }: VenueComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if current value is a custom venue (not in predefined list)
  const isCustomVenue = value && !AUSTRALIAN_RACE_TRACKS.find((t) => t.value === value);

  // Filter tracks based on search term
  const filteredTracks = searchTerm
    ? AUSTRALIAN_RACE_TRACKS.filter(
      (track) =>
        track.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : AUSTRALIAN_RACE_TRACKS;

  // Group filtered tracks by racing type, then by state
  const groupedByTypeAndState: Record<RacingType, Record<string, typeof AUSTRALIAN_RACE_TRACKS[number][]>> = {
    thoroughbred: {},
    greyhound: {},
    harness: {},
  };

  filteredTracks.forEach((track) => {
    if (!groupedByTypeAndState[track.type][track.state]) {
      groupedByTypeAndState[track.type][track.state] = [];
    }
    groupedByTypeAndState[track.type][track.state].push(track);
  });

  const selectedTrack = value ? AUSTRALIAN_RACE_TRACKS.find((t) => t.value === value) : null;
  const displayValue = isCustomVenue ? value : (selectedTrack?.label || '');

  // Show custom venue option if search term doesn't match any tracks
  const showCustomOption = searchTerm.trim() && filteredTracks.length === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (filteredTracks.length > 0 || showCustomOption)) {
      setHighlightedIndex(0);
    }
  }, [searchTerm, isOpen, filteredTracks.length, showCustomOption]);

  const handleSelect = (trackValue: string) => {
    onChange(trackValue);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleCustomVenue = () => {
    if (searchTerm.trim()) {
      // Use the search term as the custom venue name
      onChange(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'Enter' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    const totalItems = filteredTracks.length + (showCustomOption ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (showCustomOption && highlightedIndex === 0) {
          handleCustomVenue();
        } else if (filteredTracks[showCustomOption ? highlightedIndex - 1 : highlightedIndex]) {
          handleSelect(filteredTracks[showCustomOption ? highlightedIndex - 1 : highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (!searchTerm && displayValue) {
              setSearchTerm(displayValue);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search venue or enter custom..."
          className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Toggle dropdown"
          >
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
        >
          {/* Custom venue option */}
          {showCustomOption && (
            <button
              type="button"
              onClick={handleCustomVenue}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-200 dark:border-gray-700 ${highlightedIndex === 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add custom venue: <strong>{searchTerm}</strong></span>
              </div>
            </button>
          )}

          {filteredTracks.length === 0 && !showCustomOption ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No venues found
            </div>
          ) : (
            // Group by racing type
            (['thoroughbred', 'greyhound', 'harness'] as RacingType[]).map((racingType) => {
              const stateGroups = groupedByTypeAndState[racingType];
              const hasTracksForType = Object.keys(stateGroups).length > 0;

              if (!hasTracksForType) return null;

              return (
                <div key={racingType}>
                  {/* Racing type header */}
                  <div className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 sticky top-0 z-10 flex items-center gap-2">
                    <span>{getRacingTypeIcon(racingType)}</span>
                    <span>{getRacingTypeLabel(racingType)}</span>
                  </div>

                  {/* State groups within racing type */}
                  {Object.entries(stateGroups).map(([state, tracks]) => (
                    <div key={`${racingType}-${state}`}>
                      <div className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 sticky top-8 z-[9]">
                        {state}
                      </div>
                      {tracks.map((track) => {
                        const globalIndex = filteredTracks.findIndex((t) => t.value === track.value);
                        const adjustedIndex = showCustomOption ? globalIndex + 1 : globalIndex;

                        return (
                          <button
                            key={track.value}
                            type="button"
                            onClick={() => handleSelect(track.value)}
                            onMouseEnter={() => setHighlightedIndex(adjustedIndex)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${adjustedIndex === highlightedIndex
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                              } ${value === track.value
                                ? 'font-semibold bg-blue-50 dark:bg-blue-900/20'
                                : ''
                              }`}
                          >
                            <span className="text-xs opacity-60">{getRacingTypeIcon(track.type)}</span>
                            <span>{track.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


