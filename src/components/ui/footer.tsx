"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: <Github size={18} />, href: 'https://github.com/Pj-develop', label: 'GitHub' },
    { icon: <Twitter size={18} />, href: 'https://linktr.ee/priyanshu.j', label: 'Twitter' },
    { icon: <Linkedin size={18} />, href: 'https://linkedin.com/in/pjdevelop', label: 'LinkedIn' },
    { icon: <Mail size={18} />, href: 'mailto:priyanshu.j@hotmail.com', label: 'Email' },
  ];

  return (
    <motion.footer 
      className="w-full py-8 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">DataViz Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A modern data visualization platform for business intelligence and analytics.
            </p>
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          
          {/* Column 3 */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &copy; {currentYear} DataViz Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};