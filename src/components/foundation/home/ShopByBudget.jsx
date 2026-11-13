"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Sparkles, ChevronRight, IndianRupee } from 'lucide-react';
import { BUDGET_RANGES } from '@/utils/filterUtils';

const ShopByBudget = () => {
    const router = useRouter();

    return (
        <section className="py-2 sm:py-3 bg-slate-50 font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                            <IndianRupee size={12} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div>
                            <h2 className="text-[11px] sm:text-[14px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                Shop by Budget
                                <span className="text-[8px] sm:text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-full lowercase tracking-normal">
                                    popular
                                </span>
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/products')}
                        className="text-[10px] sm:text-xs font-black text-rose-600 uppercase hover:text-rose-700 transition-colors flex items-center gap-0.5"
                    >
                        All Phones
                        <ChevronRight size={12} />
                    </button>
                </div>

                {/* Horizontal Scroll on Mobile, 5-col Grid on Desktop */}
                <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3.5 overflow-x-auto hide-scrollbar no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 sm:pb-0 snap-x">
                    {BUDGET_RANGES.map((range) => (
                        <motion.div
                            key={range.id}
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => router.push(`/products?budget=${range.id}`)}
                            className="snap-start shrink-0 w-[138px] sm:w-auto bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 hover:border-amber-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                        >
                            <div>
                                <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-600 mb-0.5 flex items-center justify-between">
                                    <span>Segment</span>
                                    <Tag size={9} className="text-amber-500 opacity-60 group-hover:opacity-100" />
                                </div>
                                <h3 className="text-[11px] sm:text-[13px] font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
                                    {range.label}
                                </h3>
                                <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 mt-0.5 line-clamp-1">
                                    {range.desc}
                                </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-slate-700 group-hover:text-amber-600">
                                <span>Explore</span>
                                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShopByBudget;

