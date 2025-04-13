"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { motion } from "framer-motion";
import Link from 'next/link';
import { Home, Info, Mail, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    open: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md' 
            : 'bg-transparent'
        }`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="text-xl font-bold text-gray-900 dark:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/">
                <img 
                    src="/favicon.ico" 
                    alt="Logo" 
                    className="h-8 w-8"
                />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
          <Link href="https://www.priyanshuj.me/" target="_blank" rel="noopener noreferrer" className="relative group">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Home size={18} />
                <span>Know Me</span>
              </Button>
              <motion.div 
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary transform origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <Link href="https://github.com/Pj-develop" target="_blank" rel="noopener noreferrer" className="relative group">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Info size={18} />
                <span>MyGithub</span>
              </Button>
              <motion.div 
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary transform origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <Link href="https://www.linkedin.com/in/pjdevelop" target="_blank" rel="noopener noreferrer" className="relative group">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Mail size={18} />
                <span>LinkedIn</span>
              </Button>
              <motion.div 
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary transform origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
           
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <motion.div 
        className="fixed top-0 right-0 h-screen w-3/4 z-40 bg-white dark:bg-gray-900 p-6 shadow-xl md:hidden"
        initial="closed"
        animate={isMobileMenuOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
      >
        <div className="flex flex-col space-y-8 pt-16">
          <Link href="/" className="flex items-center space-x-2 text-lg">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link href="/about" className="flex items-center space-x-2 text-lg">
            <Info size={20} />
            <span>About</span>
          </Link>
          <Link href="/contact" className="flex items-center space-x-2 text-lg">
            <Mail size={20} />
            <span>Contact</span>
          </Link>
          <div className="pt-4">
            
          </div>
        </div>
      </motion.div>
      
      {/* Overlay for mobile menu backdrop */}
      {isMobileMenuOpen && (
        <motion.div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};