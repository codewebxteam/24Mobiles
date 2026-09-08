"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

import ProductCard from '@/components/product/ProductCard';

const FeaturedProducts = ({ onLoaded }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useRouter();

    useEffect(() => {
        const productsRef = collection(db, 'products');
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort by ID descending
            const sorted = productList.sort((a, b) => b.id.localeCompare(a.id));
            
            // Take only 8
            setProducts(sorted.slice(0, 8));
            setLoading(false);
            if (onLoaded) onLoaded();
        });

        return () => unsubscribe();
    }, []);

    // Return null while loading instead of text to avoid layout jumps
    if (loading) {
        return null;
    }

    return (
        <section className="py-2 sm:py-4 bg-slate-50 overflow-hidden font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto">
                
                {/* Compact Header (Matching Brands Section) */}
                <div className="flex items-center justify-between px-4 sm:px-8 mb-3">
                    <h2 className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider text-slate-900">Latest Phones</h2>
                    <button 
                        onClick={() => navigate.push('/products')} 
                        className="text-[10px] sm:text-xs font-black text-rose-600 uppercase hover:text-rose-700 transition-colors"
                    >
                        View All
                    </button>
                </div>

                {/* Product Horizontal Scroll */}
                <div className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-6 px-4 sm:px-8 pb-4 snap-x">
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            className="snap-start shrink-0 w-[calc(33.333%-8px)] min-w-[80px] sm:w-[calc(25%-18px)] lg:w-[calc(20%-20px)] max-w-[280px]"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                    {/* View All Card / Button at the end of scroll */}
                    {products.length >= 8 && (
                        <div 
                            onClick={() => navigate.push('/products')} 
                            className="snap-start shrink-0 w-[calc(33.333%-8px)] min-w-[80px] sm:w-[calc(25%-18px)] lg:w-[calc(20%-20px)] max-w-[280px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-500/50 hover:shadow-md transition-all group"
                        >
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors mb-3">
                                <ArrowRight size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase group-hover:text-amber-600 transition-colors text-center px-2">View All<br/>Phones</span>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default FeaturedProducts;
