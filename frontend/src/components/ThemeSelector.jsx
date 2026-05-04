import { useState } from 'react';
import { Palette } from 'lucide-react';

const themes = [
  { name: 'Purple', gradient: 'from-indigo-500 via-purple-500 to-pink-500', primary: '#8b5cf6' },
  { name: 'Blue', gradient: 'from-blue-500 via-cyan-500 to-teal-500', primary: '#3b82f6' },
  { name: 'Green', gradient: 'from-green-500 via-emerald-500 to-lime-500', primary: '#10b981' },
  { name: 'Orange', gradient: 'from-orange-500 via-red-500 to-pink-500', primary: '#f97316' },
  { name: 'Rose', gradient: 'from-pink-500 via-rose-500 to-red-500', primary: '#ec4899' },
];

const ThemeSelector = ({ currentTheme = 0, onThemeChange }) => {
  const [showThemes, setShowThemes] = useState(false);

  const handleThemeSelect = (index) => {
    onThemeChange(index);
    setShowThemes(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowThemes(!showThemes)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Change theme"
      >
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {showThemes && (
        <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Choose Theme
          </h3>
          
          <div className="space-y-2">
            {themes.map((theme, index) => (
              <button
                key={theme.name}
                onClick={() => handleThemeSelect(index)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  currentTheme === index
                    ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-purple-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${theme.gradient}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {theme.name}
                </span>
                {currentTheme === index && (
                  <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
