import React, { useState, useRef, useEffect } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { stories, settings } = useAppContext();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const activeSprint = settings.activeSprint;
  const sprintStories = stories.filter((s) => s.sprint === activeSprint);

  const searchResults = searchQuery.trim()
    ? stories.filter(
        (s) =>
          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.asA.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-surface border-b border-border flex-shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory border border-border rounded text-sm text-text-secondary w-56 cursor-text hover:border-sage/40 transition-colors"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={13} className="flex-shrink-0" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              className="bg-transparent border-none outline-none text-text-primary placeholder-text-secondary text-sm w-full"
            />
          </div>
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 right-0 w-80 bg-surface border border-border rounded-md shadow-dropdown z-50 animate-fade-in">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    navigate('/backlog', { state: { openStoryId: s.id } });
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-ivory transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-secondary">{s.id}</span>
                    <span className="text-sm text-text-primary font-medium">{s.title}</span>
                  </div>
                  {s.assignee && <p className="text-xs text-text-secondary mt-0.5">{s.assignee}</p>}
                </button>
              ))}
            </div>
          )}
          {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute top-full mt-1 right-0 w-72 bg-surface border border-border rounded-md shadow-dropdown z-50 px-4 py-3">
              <p className="text-sm text-text-secondary">No stories found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Sprint indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-sage-light rounded text-xs text-sage font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
          {sprintStories.length} stories in active sprint
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold shadow-xs"
            title={user?.email || 'Logged in user'}
          >
            {userInitials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[110px]">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-text-secondary leading-tight truncate max-w-[110px]">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="ml-1 p-1.5 text-text-secondary hover:text-terracotta hover:bg-terracotta-light/20 rounded-md transition-colors"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
