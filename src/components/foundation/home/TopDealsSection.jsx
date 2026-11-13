"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from '@/components/product/ProductCard';
import { getDiscountPercentage } from '@/utils/filterUtils';

const TopDealsSection = () => {
    const [dealProducts, setDealProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const productsRef = collection(db, 'products');
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter products with valid discount and sort by highest discount %
            const withDeals = list
                .filter(p => getDiscountPercentage(p) >= 15)
                .sort((a, b) => getDiscountPercentage(b) - getDiscountPercentage(a));

            setDealProducts(withDeals.slice(0, 8));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading || dealProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-2 sm:py-3 bg-slate-50 overflow-hidden font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-8 mb-2 sm:mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-black">
                            <Flame size={13} className="sm:w-3.5 sm:h-3.5 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-[11px] sm:text-[14px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                Top Deals & Discounts
                                <span className="text-[8px] sm:text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 rounded-full lowercase tracking-normal flex items-center gap-0.5">
                                    <Sparkles size={9} /> up to 60% off
                                </span>
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/products?deal=deal_20')} 
                        className="text-[10px] sm:text-xs font-black text-rose-600 uppercase hover:text-rose-700 transition-colors flex items-center gap-0.5"
                    >
                        All Deals
                        <ChevronRight size={12} />
                    </button>
                </div>

                {/* Horizontal Scroll */}
                <div className="flex overflow-x-auto hide-scrollbar no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2.5 sm:gap-6 px-4 sm:px-8 pb-2 sm:pb-3 snap-x">
                    {dealProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="snap-start shrink-0 w-[calc(33.333%-8px)] min-w-[85px] sm:w-[calc(25%-18px)] lg:w-[calc(20%-20px)] max-w-[280px]"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}

                    {/* View All Deals End-Card */}
                    <div 
                        onClick={() => router.push('/products?deal=deal_20')} 
                        className="snap-start shrink-0 w-[calc(33.333%-8px)] min-w-[85px] sm:w-[calc(25%-18px)] lg:w-[calc(20%-20px)] max-w-[280px] flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-2xl sm:rounded-3xl p-4 shadow-md cursor-pointer hover:shadow-xl transition-all group"
                    >
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Flame size={22} className="text-white" />
                        </div>
                        <span className="text-xs sm:text-sm font-black uppercase text-center leading-tight">
                            Explore All<br />Discounts
                        </span>
                        <div className="mt-3 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold bg-white text-rose-600 px-3 py-1 rounded-full shadow-sm">
                            <span>View Deals</span>
                            <ArrowRight size={12} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopDealsSection;

