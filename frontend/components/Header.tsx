import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';

const navigation = [
  {
    name: 'Product',
    href: '#',
    hasDropdown: true,
    items: [
      { name: 'Resume Analysis', href: '/analyze', description: 'AI-powered resume scanning' },
      { name: 'Skill Gap Analysis', href: '/analyze', description: 'Identify missing skills' },
      { name: 'Learning Roadmap', href: '/analyze', description: '6-month career plan' },
    ]
  },
  {
    name: 'Solutions',
    href: '#',
    hasDropdown: true,
    items: [
      { name: 'For Job Seekers', href: '/analyze', description: 'Optimize your resume' },
      { name: 'For Students', href: '/analyze', description: 'Build your career path' },
    ]
  },
  { name: 'Developers', href: '/about' },
  {
    name: 'Resources',
    href: '#',
    hasDropdown: true,
    items: [
      { name: 'Help Center', href: '/help', description: 'Get support' },
      { name: 'About Us', href: '/about', description: 'Our mission' },
    ]
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-white'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
            <span className="font-bold text-lg">R</span>
          </div>
          <span className="text-lg font-bold text-black tracking-tight">
            ResuMatch
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                {item.name}
                {item.hasDropdown && (
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                    }`} />
                )}
              </Link>

              {/* Dropdown Menu */}
              {item.hasDropdown && item.items && (
                <AnimatePresence>
                  {activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2"
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">{subItem.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{subItem.description}</div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            LOGIN
          </Link>
          <Link
            href="/analyze"
            className="px-4 py-2 bg-black text-white text-sm font-semibold tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Analyze Resume
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-black"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.hasDropdown ? '#' : item.href}
                    className="block text-base font-medium text-gray-700 hover:text-black"
                    onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.hasDropdown && item.items && (
                    <div className="pl-4 mt-2 space-y-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block text-sm text-gray-500 hover:text-black"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  href="#"
                  className="block text-sm font-medium text-gray-700 hover:text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  href="/analyze"
                  className="block w-full text-center px-4 py-3 bg-black text-white text-sm font-semibold tracking-wide uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analyze Resume
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
