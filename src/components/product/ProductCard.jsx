"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const ProductCard = ({ product }) => {
    const navigate = useRouter();
    const searchParams = useSearchParams();
    const [realReviews, setRealReviews] = useState([]);

    const compareTarget = searchParams ? searchParams.get('compareTarget') : null;
    let targetHref = `/product/${product.id}`;
    if (compareTarget === 'phone1') {
        const phone2 = searchParams ? searchParams.get('phone2') : null;
        targetHref = `/compare?phone1=${product.id}${phone2 ? `&phone2=${phone2}` : ''}`;
    } else if (compareTarget === 'phone2') {
        const phone1 = searchParams ? searchParams.get('phone1') : null;
        targetHref = `/compare?phone2=${product.id}${phone1 ? `&phone1=${phone1}` : ''}`;
    }
    
    useEffect(() => {
        if (!product?.id) return;
        const reviewsRef = collection(db, 'reviews', product.id, 'list');
        const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
            setRealReviews(snapshot.docs.map(doc => doc.data()));
        });
        return () => unsubscribe();
    }, [product?.id]);
    
    const avgRating = realReviews.length > 0 
        ? (realReviews.reduce((sum, rev) => sum + (rev.rating || 5), 0) / realReviews.length).toFixed(1)
        : null;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group h-full flex flex-col"
        >
            <div className="flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-6 border border-slate-100 hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all cursor-pointer h-full relative overflow-hidden text-center">

                <Link
                    href={targetHref}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex flex-col flex-grow"
                >
                    {/* Phone Image Container */}
                    <div className="relative w-full aspect-[3/4] mb-2 sm:mb-6 p-1 sm:p-2 flex items-center justify-center">
                        <motion.img
                            src={product.img || product.image || '/phones/image1-removebg-preview.png'}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-contain drop-shadow-md sm:drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.target.src = '/phones/image1-removebg-preview.png'; }}
                        />

                        {/* Discount Badge */}
                        {product.discount > 0 && (
                            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg sm:rounded-bl-xl rounded-tr-lg sm:rounded-tr-xl shadow-md">
                                -{product.discount}%
                            </div>
                        )}
                        
                        {/* Brand Badge */}
                        {(product.brand || product.category) && (
                            <div className="absolute top-0 left-0 bg-slate-100 text-slate-600 text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-br-lg sm:rounded-br-xl rounded-tl-lg sm:rounded-tl-xl shadow-sm">
                                {product.brand || product.category}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Product Info */}
                <div className="space-y-1.5 sm:space-y-4 mt-auto">
                    {/* Name */}
                    <Link href={targetHref}>
                        <h4 className="text-[10px] sm:text-base font-black text-slate-900 leading-tight line-clamp-2 sm:truncate px-0.5 group-hover:text-amber-600 transition-colors h-[28px] sm:h-auto flex items-center justify-center">
                            {product.name}
                        </h4>
                    </Link>

                    {/* Rating & Highlight */}
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[7px] sm:text-[10px] font-black tracking-widest text-slate-400">
                            <Star size={8} className="fill-amber-500 text-amber-500 sm:w-3 sm:h-3" />
                            <span className="text-slate-900">{avgRating || "4.8"}</span>
                            <span className="text-slate-400 truncate">({realReviews.length || 12} revs)</span>
                        </div>

                        {product.highlights && (
                            <span className="text-slate-500 bg-slate-50 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-[9px] font-bold truncate max-w-full hidden sm:inline-block">
                                {product.highlights}
                            </span>
                        )}
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-center gap-1.5 sm:gap-3 pt-1.5 sm:pt-2 border-t border-slate-50">
                        <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-0 sm:gap-2">
                            <span className="text-[11px] sm:text-2xl font-black text-slate-900 leading-none">
                                ₹{product.price?.toLocaleString('en-IN') || 'N/A'}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[7px] sm:text-xs font-bold text-slate-400 line-through mt-0.5 sm:mt-0">
                                    ₹{product.originalPrice.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>
                        
                        <Link 
                            href={targetHref}
                            className="w-full py-1.5 sm:py-3.5 bg-slate-900 text-white rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-sm sm:shadow-lg active:scale-95 font-black text-[7px] sm:text-[10px] uppercase tracking-widest group/btn"
                        >
                            <span className="hidden sm:inline">{compareTarget ? "Select to Compare" : "View Specs"}</span>
                            <span className="sm:hidden">{compareTarget ? "Select" : "Specs"}</span>
                            <ChevronRight size={10} strokeWidth={3} className="sm:w-[14px] sm:h-[14px] group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
