import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="flex-grow pt-20"
            >
                {children}
            </motion.main>
            <Footer />
        </div>
    );
}

