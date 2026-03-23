'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';
import { fetchProfile, updateProfile } from '@/lib/api';

// Predefined list of popular Australian bookmakers
const PREDEFINED_BOOKIES = [
  'Sportsbet',
  'TAB',
  'Ladbrokes',
  'Neds',
  'bet365',
  'Unibet',
  'PointsBet',
  'Palmerbet',
  'TopSport',
  'PlayUp',
  'Dabble',
];

interface BookieComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export default function BookieCombobox({ value, onChange, className = '' }: BookieComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [customBookies, setCustomBookies] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load custom bookies from user profile
  useEffect(() => {
    const loadCustomBookies = async () => {
      try {
        const { data: profile } = await fetchProfile();
        if (profile?.custom_bookies) {
          setCustomBookies(profile.custom_bookies);
        }
      } catch (error) {
        console.error('Failed to load custom bookies:', error);
      }
    };
    loadCustomBookies();
  }, []);

  // Save custom bookie to profile
  const saveCustomBookie = async (bookieName: string) => {
    try {
      const updatedBookies = [...customBookies, bookieName];
      await updateProfile({ custom_bookies: updatedBookies });
      setCustomBookies(updatedBookies);
    } catch (error) {
      console.error('Failed to save custom bookie:', error);
    }
  };

  // Combine predefined and custom bookies, sort alphabetically
  const allBookies = Array.from(new Set([...PREDEFINED_BOOKIES, ...customBookies])).sort();

  // Filter bookies based on search term
  const filteredBookies = searchTerm
    ? allBookies.filter((bookie) =>
        bookie.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allBookies;

  // Check if current search term is an exact match for an existing bookie (case-insensitive)
  const isExactSearchMatch = filteredBookies.some(
    (b) => b.toLowerCase() === searchTerm.toLowerCase()
  );

  // Show custom bookie option if search term doesn't exactly match any existing bookies
  const showCustomOption = searchTerm.trim().length > 0 && !isExactSearchMatch;

  const displayValue = value || '';

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
    if (isOpen && (filteredBookies.length > 0 || showCustomOption)) {
      setHighlightedIndex(0);
    }
  }, [searchTerm, isOpen, filteredBookies.length, showCustomOption]);

  const handleSelect = (bookieName: string) => {
    onChange(bookieName);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleCustomBookie = async () => {
    if (searchTerm.trim()) {
      const customBookieName = searchTerm.trim();
      // Only save to profile if it's truly new
      if (!allBookies.includes(customBookieName)) {
        await saveCustomBookie(customBookieName);
      }
      onChange(customBookieName);
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

    const totalItems = filteredBookies.length + (showCustomOption ? 1 : 0);

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
          handleCustomBookie();
        } else {
          const adjustedIndex = showCustomOption ? highlightedIndex - 1 : highlightedIndex;
          if (filteredBookies[adjustedIndex]) {
            handleSelect(filteredBookies[adjustedIndex]);
          }
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
          placeholder="Select bookie..."
          className="w-full px-4 py-3 pr-20 border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring text-foreground bg-card placeholder:text-muted-foreground"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4 text-muted-foreground" />
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
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Toggle dropdown"
          >
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-card border border-input rounded-lg shadow-lg"
        >
          {showCustomOption && (
            <button
              type="button"
              onClick={handleCustomBookie}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-border ${
                highlightedIndex === 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>
                  Add custom bookie: <strong>{searchTerm}</strong>
                </span>
              </div>
            </button>
          )}

          {filteredBookies.length === 0 && !showCustomOption ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No bookies found
            </div>
          ) : (
            filteredBookies.map((bookie, index) => {
              const adjustedIndex = showCustomOption ? index + 1 : index;

              return (
                <button
                  key={bookie}
                  type="button"
                  onClick={() => handleSelect(bookie)}
                  onMouseEnter={() => setHighlightedIndex(adjustedIndex)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                    adjustedIndex === highlightedIndex
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'text-foreground hover:bg-muted'
                  } ${
                    value === bookie
                      ? 'font-semibold bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <span>{bookie}</span>
                  {customBookies.includes(bookie) && (
                    <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      Custom
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
