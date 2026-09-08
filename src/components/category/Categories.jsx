"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Categories = () => {
    const navigate = useRouter();
    const [dbProducts, setDbProducts] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    
    // Updated limit to 10 for desktop so it forms perfect 2 rows of 5 columns like screenshot
    const [visibleLimit, setVisibleLimit] = useState(window.innerWidth >= 1024 ? 10 : 6);

    // Update limit on resize
    useEffect(() => {
        const handleResize = () => setVisibleLimit(window.innerWidth >= 1024 ? 10 : 6);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const productsRef = collection(db, 'products');
        const categoriesRef = collection(db, 'categories');

        const unsubP = onSnapshot(productsRef, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDbProducts(data);
            setIsLoading(false);
        });

        const unsubC = onSnapshot(categoriesRef, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDbCategories(data);
        });

        return () => {
            unsubP();
            unsubC();
        };
    }, []);

    const finalCategories = useMemo(() => {
        const dynamicNames = dbCategories.map(c => c.name).filter(Boolean);
        let combined = [];

        dynamicNames.forEach(name => {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const dbCat = dbCategories.find(c => (c.name || '').toLowerCase() === name.toLowerCase());
            
            if (dbCat && dbCat.status === 'Hidden') return;

            const customImg = dbCat?.image || dbCat?.img; 
            const customSub = dbCat?.description || 'Premium Phones';

            combined.push({
                id: slug,
                name: name,
                sub: customSub,
                img: customImg || 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500&q=80',
                path: `/category/${slug}`,
                createdAt: dbCat?.createdAt
            });
        });

        return combined.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            
            if (timeA !== timeB) {
                return timeB - timeA; 
            }
            return a.name.localeCompare(b.name);
        });
    }, [dbProducts, dbCategories]);

    if (isLoading) {
        return (
            <div className="bg-slate-50 py-16 text-center">
                <span className="text-amber-600 font-black animate-pulse uppercase tracking-widest text-xs">Loading Brands...</span>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-16 sm:py-20 font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                
                {/* Title Section */}
                <header className="mb-12 text-center">
                    <h2 className="text-4xl sm:text-[44px] font-black text-slate-900 tracking-tight">
                        Top Brands
                    </h2>
                </header>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
                    <AnimatePresence mode="popLayout">
                        {(showAll ? finalCategories : finalCategories.slice(0, visibleLimit)).map((cat) => (
                                <motion.div
                                    key={cat.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate.push(cat.path)}
                                    className="group cursor-pointer rounded-2xl overflow-hidden flex flex-col shadow-sm border border-slate-200 bg-white hover:border-amber-500/50 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Image Container */}
                                    <div className="w-full aspect-[4/3] overflow-hidden bg-slate-50 relative p-4 flex items-center justify-center">
                                        <img
                                            src={cat.img}
                                            alt={cat.name}
                                            className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-md"
                                        />
                                    </div>

                                    {/* Name Banner */}
                                    <div className="py-4 px-3 text-center flex-1 flex flex-col items-center justify-center bg-white border-t border-slate-50 group-hover:bg-amber-500 transition-colors duration-300">
                                        <h3 className="text-slate-900 group-hover:text-white font-black text-sm tracking-widest uppercase truncate w-full transition-colors">
                                            {cat.name}
                                        </h3>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>

                {/* View All Button */}
                {finalCategories.length > visibleLimit && (
                    <div className="text-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="bg-transparent border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-xl active:scale-95"
                        >
                            {showAll ? 'Show Less' : 'View All Brands'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
