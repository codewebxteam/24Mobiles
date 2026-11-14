"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { LayoutGrid, ArrowRight } from 'lucide-react';

const Categories = ({ isHome = false, onLoaded }) => {
    const navigate = useRouter();
    const [dbProducts, setDbProducts] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    
    // Updated limit to 8 for desktop so it forms perfect 2 rows of 4 columns
    const [visibleLimit, setVisibleLimit] = useState(6);

    useEffect(() => {
        const handleResize = () => setVisibleLimit(window.innerWidth >= 1024 ? 8 : 6);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const productsRef = collection(db, 'products');
        const categoriesRef = collection(db, 'categories');

        let productsLoaded = false;
        let categoriesLoaded = false;

        const checkLoaded = () => {
            if (productsLoaded && categoriesLoaded) {
                setIsLoading(false);
                if (onLoaded) onLoaded();
            }
        };

        const unsubP = onSnapshot(productsRef, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDbProducts(data);
            productsLoaded = true;
            checkLoaded();
        });

        const unsubC = onSnapshot(categoriesRef, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDbCategories(data);
            categoriesLoaded = true;
            checkLoaded();
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
            const customSub = dbCat?.description || 'View Collection';

            combined.push({
                id: slug,
                name: name,
                sub: customSub,
                img: customImg || '/phones/image7-removebg-preview.png',
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
        if (isHome) return null;
        return (
            <div className="bg-slate-50 min-h-screen pt-[70px] sm:pt-[80px] pb-12 font-['Montserrat',sans-serif]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 animate-pulse">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-2">
                            <div className="w-28 h-4 bg-slate-200 rounded-full" />
                            <div className="w-44 h-3 bg-slate-200 rounded-full" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6 sm:gap-8 justify-start">
                        {[...Array(10)].map((_, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 shrink-0 w-[72px] sm:w-[100px]">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-slate-200" />
                                <div className="w-14 h-3 bg-slate-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-slate-50 ${isHome ? 'py-1.5 sm:py-2.5' : 'min-h-screen pt-[70px] sm:pt-[80px] pb-12'} font-['Montserrat',sans-serif]`}>
            <div className="max-w-[1440px] mx-auto">
                
                {isHome ? (
                    /* HOMEPAGE LAYOUT: Horizontal Scroll */
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-8 mb-2">
                            <h2 className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider text-slate-900">Brands</h2>
                            <button onClick={() => navigate.push('/categories')} className="text-[10px] sm:text-xs font-black text-rose-600 uppercase hover:text-rose-700 transition-colors">
                                View All
                            </button>
                        </div>

                        {/* Horizontal Scroll List */}
                        <div className="flex overflow-x-auto hide-scrollbar no-scrollbar gap-3 sm:gap-6 px-4 sm:px-8 pb-1.5 sm:pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {finalCategories.slice(0, 10).map((cat) => (
                                <div 
                                    key={cat.id} 
                                    onClick={() => navigate.push(cat.path)} 
                                    className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer snap-start shrink-0 w-[56px] sm:w-[80px] group"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2.5 sm:p-3 group-hover:shadow-md group-hover:border-amber-500/40 transition-all overflow-hidden shrink-0">
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 uppercase w-full text-center group-hover:text-amber-600 transition-colors">{cat.name}</span>
                                </div>
                            ))}
                            {/* More Brands Button */}
                            {finalCategories.length > 10 && (
                                <div 
                                    onClick={() => navigate.push('/categories')} 
                                    className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer snap-start shrink-0 w-[56px] sm:w-[80px] group"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:shadow-md transition-all shrink-0">
                                        <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 uppercase text-center leading-[1.1] group-hover:text-amber-600 transition-colors">More<br/>Brands</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* ALL BRANDS PAGE LAYOUT: Grid */
                    <div className="px-4 sm:px-8">
                        {/* Compact Page Header */}
                        <header className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-amber-500 shrink-0"
                            >
                                <LayoutGrid size={20} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
                            </motion.div>
                            <div>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-sm sm:text-lg font-black text-slate-900 tracking-wider uppercase leading-tight"
                                >
                                    All Brands
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                                >
                                    Explore smartphones the brand
                                </motion.p>
                            </div>
                        </header>

                        <div className="flex flex-wrap gap-6 sm:gap-8 justify-start">
                            <AnimatePresence mode="popLayout">
                                {finalCategories.map((cat, idx) => (
                                    <motion.div
                                        key={cat.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                                        onClick={() => navigate.push(cat.path)}
                                        className="flex flex-col items-center gap-3 cursor-pointer shrink-0 w-[72px] sm:w-[100px] group"
                                    >
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center p-4 sm:p-5 group-hover:shadow-xl group-hover:border-amber-500/50 transition-all overflow-hidden shrink-0">
                                            <img src={cat.img} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase text-center w-full group-hover:text-amber-600 transition-colors">{cat.name}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
