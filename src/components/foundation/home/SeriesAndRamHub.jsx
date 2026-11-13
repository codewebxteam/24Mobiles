"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Cpu, Layers, ChevronRight, HardDrive } from 'lucide-react';
import { RAM_OPTIONS } from '@/utils/filterUtils';

const POPULAR_SERIES = [
    { name: 'Redmi Series', tag: 'Xiaomi Value' },
    { name: 'OnePlus Series', tag: 'Fast & Smooth' },
    { name: 'Galaxy S Series', tag: 'Samsung Flagship' },
    { name: 'Galaxy A Series', tag: 'All-Rounder' },
    { name: 'iQOO Z Series', tag: 'Gaming Performance' },
    { name: 'Realme Series', tag: 'Youth Trend' },
    { name: 'Motorola Edge Series', tag: 'Clean Android' },
    { name: 'TECNO POVA Series', tag: 'Big Battery' },
    { name: 'TECNO CAMON Series', tag: 'Pro Camera' },
    { name: 'Reno Series', tag: 'Portrait Master' },
];

const SeriesAndRamHub = () => {
    const router = useRouter();

    return (
        <section className="py-2 sm:py-3 bg-slate-50 font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                
                {/* 1. Popular Series Chips */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                                <Layers size={13} className="sm:w-3.5 sm:h-3.5" />
                            </div>
                            <h2 className="text-[11px] sm:text-[14px] font-black uppercase tracking-wider text-slate-900">
                                Popular Smartphone Series
                            </h2>
                        </div>
                        <button 
                            onClick={() => router.push('/categories')}
                            className="text-[10px] sm:text-xs font-black text-rose-600 uppercase hover:text-rose-700 transition-colors flex items-center gap-0.5"
                        >
                            All Brands
                            <ChevronRight size={12} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {POPULAR_SERIES.map((series) => (
                            <motion.button
                                key={series.name}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/products?series=${encodeURIComponent(series.name)}`)}
                                className="bg-white border border-slate-200/90 hover:border-amber-500 hover:bg-amber-50/30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-left shadow-sm transition-all group flex items-center gap-2"
                            >
                                <div>
                                    <span className="text-[10px] sm:text-[11px] font-black text-slate-800 group-hover:text-amber-600 transition-colors block">
                                        {series.name}
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 group-hover:text-amber-700/70 block">
                                        {series.tag}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* 2. Shop by RAM Capacity */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <HardDrive size={18} />
                        </div>
                        <div>
                            <h3 className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider">
                                Filter by RAM & Multitasking Power
                            </h3>
                            <p className="text-[9px] sm:text-[11px] font-medium text-slate-500">
                                Select desired RAM size for seamless gaming and smooth daily performance.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {RAM_OPTIONS.map((ram) => (
                            <button
                                key={ram.id}
                                onClick={() => router.push(`/products?ram=${ram.id}`)}
                                className="px-3 sm:px-3.5 py-1.5 bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-wider border border-slate-200 transition-all shadow-sm active:scale-95"
                            >
                                {ram.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default SeriesAndRamHub;

