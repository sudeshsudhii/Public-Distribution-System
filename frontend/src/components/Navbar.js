import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, PlusCircle, Clock, ShieldCheck, Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletConnector from './WalletConnector';
import { useTranslation } from 'react-i18next';

import SystemStatus from './SystemStatus';

const Navbar = () => {
  const location = useLocation();
  const { isConnected, account } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { t, i18n } = useTranslation();

  // Theme Toggle Logic
  const [theme, setTheme] = React.useState(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return 'dark';
    } else {
      return 'light';
    }
  });

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Language Menu Logic
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const langMenuRef = React.useRef(null);

  React.useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLangMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: t('home'), icon: Wallet },
    { path: '/add-event', label: t('pds'), icon: PlusCircle },
    { path: '/timeline', label: t('timeline'), icon: Clock },
    { path: '/verify', label: t('verify'), icon: ShieldCheck },
    { path: '/pds', label: t('dashboard'), icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col sticky top-0 z-50">
      {/* Top Status Bar - Visible on Desktop/Tablets */}
      {/* Top Status Bar - Visible on Desktop/Tablets */}
      <div className="hidden md:flex bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 h-10 px-4 items-center justify-end text-xs transition-colors duration-200">
        <div className="flex items-center space-x-6">
          <SystemStatus />
          <div className="flex items-center space-x-4 pl-6 border-l border-gray-200 dark:border-slate-800">
            {isConnected && account && (
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-400 font-mono">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
              </div>
            )}
            {!isConnected && <span className="text-gray-500 dark:text-gray-400">Wallet not connected</span>}
          </div>
        </div>
      </div>

      <nav className="bg-white dark:bg-slate-900 shadow-lg border-b border-gray-200 dark:border-slate-800 transition-colors duration-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                EventChain
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Status / Theme / Language / Wallet Group */}
              <div className="flex items-center space-x-3">

                {/* System Status Panel - Removed from Main Nav (Moved to Top Bar) */}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Language Selector */}
                <div className="relative" ref={langMenuRef}>
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center space-x-1 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase">{i18n.language}</span>
                  </button>

                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-md shadow-xl py-1 border border-gray-200 dark:border-slate-700 z-50">
                      <button onClick={() => changeLanguage('en')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left font-medium">English</button>
                      <button onClick={() => changeLanguage('ta')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left font-medium">தமிழ்</button>
                      <button onClick={() => changeLanguage('hi')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left font-medium">हिंदी</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Address - Removed from Main Nav (Moved to Top Bar) */}
              <WalletConnector />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="xl:hidden py-4 space-y-2 border-t border-gray-200 dark:border-slate-700">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              {/* Mobile Theme Toggle */}
              <div className="px-4 py-2 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 mt-2 pt-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>

              {/* Mobile Language Selection */}
              <div className="px-4 py-2 flex space-x-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                <button onClick={() => changeLanguage('en')} className={`text-sm ${i18n.language === 'en' ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>English</button>
                <button onClick={() => changeLanguage('ta')} className={`text-sm ${i18n.language === 'ta' ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>தமிழ்</button>
                <button onClick={() => changeLanguage('hi')} className={`text-sm ${i18n.language === 'hi' ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>हिंदी</button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                {isConnected && account && (
                  <div className="px-4 py-2 mb-2">
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-mono text-green-700 dark:text-green-400">
                        {`${account.slice(0, 6)}...${account.slice(-4)}`}
                      </span>
                    </div>
                  </div>
                )}
                <div className="px-4">
                  <WalletConnector />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
