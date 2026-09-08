"use client";
import { useParams } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, SlidersHorizontal, Package, AlertTriangle, ShieldCheck, Truck, Percent, Headset, LayoutGrid } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from '@/components/product/ProductCard';

const CategoryProducts = () => {
    const { categoryPath } = useParams();
    const navigate = useRouter();
    const location = { pathname: usePathname(), search: useSearchParams().toString() };
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState(null);

    const [categories, setCategories] = useState([]);

    // ==========================================
    // LOGIC 100% UNTOUCHED (Exact as provided)
    // ==========================================
    useEffect(() => {
        const currentPath = categoryPath || location.pathname.split('/').pop();

        if (!currentPath) return;

        const productsRef = collection(db, 'products');
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 8000);

        const unsubscribe = onSnapshot(productsRef, (snap) => {
            clearTimeout(safetyTimeout);
            const allProducts = snap.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id,
                id: doc.id // Essential for components using .id
            }));

            // Filter products by category mapping
            let filtered = [];
            if (currentPath === 'products') {
                filtered = allProducts;
                setCategoryName('All Brands');
            } else {
                filtered = allProducts.filter(p => {
                    const prodCat = (p.category || '').toLowerCase().trim();
                    const pathName = currentPath.toLowerCase().trim();

                    const prodSlug = prodCat.replace(/[^a-z0-9]+/g, '_');
                    const pathSlug = pathName.replace(/[^a-z0-9]+/g, '_');

                    // Standard slug match or direct string match
                    const isDirectMatch = prodSlug === pathSlug || prodCat === pathName;

                    // Specific legacy/alias matches
                    const isVegMatch = (pathSlug === 'vegetables' && prodSlug === 'veg') || (pathSlug === 'veg' && prodSlug === 'vegetables');
                    const isPersonalCareMatch = (pathSlug === 'personal_care' && prodSlug === 'personal_care');
                    const isDryFruitsMatch = (pathSlug === 'dry_fruits' && prodSlug === 'dry_fruits');

                    return isDirectMatch || isVegMatch || isPersonalCareMatch || isDryFruitsMatch;
                });

                // Set the readable category name
                if (filtered.length > 0) {
                    setCategoryName(filtered[0].category || filtered[0].brand || currentPath);
                } else {
                    const name = currentPath
                        .split(/[-_]/)
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    setCategoryName(name);
                }
            }

            setProducts(filtered);
            setIsLoading(false);
        }, (err) => {
            clearTimeout(safetyTimeout);
            console.error("Storefront products sync error:", err);
            setSyncError(err);
            setIsLoading(false);
        });

        // Fetch categories for slider
        const categoriesRef = collection(db, 'categories');
        const unsubC = onSnapshot(categoriesRef, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filter out hidden categories
            setCategories(data.filter(c => c.status !== 'Hidden').sort((a,b) => a.name.localeCompare(b.name)));
        });

        return () => {
            unsubscribe();
            unsubC();
        };
    }, [categoryPath, location.pathname]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [categoryPath]);

    return (
        <div className="bg-slate-50 pt-[60px] sm:pt-[90px] pb-24 font-['Montserrat',sans-serif] text-slate-900 min-h-[70vh]">
            
            {/* ====== Main Content Container ====== */}
            <div className="max-w-[1440px] mx-auto px-2 sm:px-8 lg:px-16 mt-2 sm:mt-4 relative z-10">

                {/* Horizontal Brands Slider (Shop by Brand) */}
                <div className="mb-2 sm:mb-8">
                    <h3 className="text-base sm:text-xl font-black text-slate-900 mb-2 px-1 tracking-tight">Shop by Brand</h3>
                    <div className="flex gap-2 sm:gap-6 overflow-x-auto custom-scrollbar pb-2 px-1">
                        {/* All Brands Circle */}
                        <button 
                            onClick={() => navigate.push('/products')}
                            className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] shrink-0 group outline-none"
                        >
                            <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center transition-all ${(!categoryPath || categoryPath === 'products') ? 'border-amber-500 bg-white shadow-md scale-105' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                                <LayoutGrid size={18} className={`sm:w-6 sm:h-6 ${(!categoryPath || categoryPath === 'products') ? 'text-amber-500' : 'text-slate-400'}`} />
                            </div>
                            <span className={`text-[9px] sm:text-xs font-bold whitespace-nowrap transition-colors ${(!categoryPath || categoryPath === 'products') ? 'text-amber-600' : 'text-slate-600'}`}>
                                All Brands
                            </span>
                        </button>

                        {/* Category Circles */}
                        {categories.map(cat => {
                            const catSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                            const isActive = categoryPath === catSlug;
                            const imageSrc = cat.image || cat.img || '/phones/image7-removebg-preview.png';

                            return (
                                <button 
                                    key={cat.id} 
                                    onClick={() => navigate.push(`/category/${catSlug}`)}
                                    className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] shrink-0 group outline-none"
                                >
                                    <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center overflow-hidden p-2 transition-all ${isActive ? 'border-amber-500 bg-white shadow-md scale-105' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                                        <img src={imageSrc} alt={cat.name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className={`text-[9px] sm:text-xs font-bold whitespace-nowrap transition-colors ${isActive ? 'text-amber-600' : 'text-slate-600'}`}>
                                        {cat.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ====== Header Section ====== */}
                <header className="mb-4 sm:mb-10 px-1">
                    <div className="flex flex-row items-end justify-between gap-2 pb-3 sm:pb-6 border-b border-slate-200">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-3 border border-amber-200"
                            >
                                <Sparkles size={10} className="sm:w-3 sm:h-3" />
                                Smartphone Database
                            </motion.div>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none capitalize"
                            >
                                {categoryName}
                            </motion.h1>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-end gap-2"
                        >
                            <div className="text-right">
                                <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Phones Tracked</p>
                                <p className="text-xs sm:text-xl font-black tracking-tight text-amber-600">
                                    {isLoading ? '...' : `${products.length} Models`}
                                </p>
                            </div>
                            
                            <button 
                                className="p-2 sm:p-3.5 bg-white text-slate-900 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1 border border-slate-200"
                                title="Filter Catalog"
                            >
                                <SlidersHorizontal size={14} className="sm:w-[18px] sm:h-[18px]" />
                                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">Filter</span>
                            </button>
                        </motion.div>
                    </div>
                </header>

                {/* ====== Products Grid ====== */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-32">
                        <div className="w-32 h-16 sm:w-40 sm:h-20 mb-4 animate-pulse">
                            <img src="/phones/gemini-svg.svg" alt="Loading" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-amber-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
                            Loading Phones...
                        </span>
                    </div>
                ) : products.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-6 lg:gap-8 px-1 sm:px-0">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product.firebaseId || product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="w-[calc(33.333%-4px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-24px)] min-w-[100px] max-w-[280px]"
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-2xl mx-auto"
                    >
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-inner">
                            <Package size={36} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                            No Phones Found
                        </h2>
                        <p className="text-slate-600 font-medium max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                            We are updating our database for <strong>{categoryName}</strong>. Please check back shortly for fresh specs and deals!
                        </p>
                        <button
                            onClick={() => navigate.push('/categories')}
                            className="mt-8 px-8 py-3.5 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md active:scale-95"
                        >
                            Explore Other Brands
                        </button>
                    </motion.div>
                )}
            </div>

            {/* ====== ERROR DIAGNOSTICS MODAL (Untouched UI matched to Theme) ====== */}
            {syncError && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSyncError(null)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-lg relative z-[501] shadow-2xl p-6 sm:p-8 border-2 border-rose-200 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: "'Recoleta', Georgia, serif" }} className="text-xl font-bold text-slate-900 leading-tight">
                                    Catalog Sync Issue
                                </h2>
                                <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-widest">
                                    {syncError.code === 'permission-denied' ? 'Access Denied' : 'Sync Failed'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 font-mono text-[11px] text-slate-600 break-all">
                            {syncError.message}
                        </div>

                        {(syncError.message?.toLowerCase().includes('permission') || syncError.code === 'permission-denied') && (
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6">
                                <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
                                    Action Required: Fix Firebase Rules
                                </p>
                                <ol className="text-xs font-semibold text-slate-600 list-decimal pl-4 space-y-2">
                                    <li>Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#27318a] underline">Firebase Console</a></li>
                                    <li>Go to <span className="font-bold">Firestore Database Rules</span></li>
                                    <li>Ensure rules allow public read/write if you don't have auth configured yet:
                                        <pre className="bg-slate-900 text-[#fce513] p-2.5 rounded-xl mt-1.5 overflow-x-auto font-mono text-[10px]">
                                            {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                                        </pre>
                                    </li>
                                    <li>Click <span className="font-bold text-[#27318a]">Publish</span></li>
                                </ol>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            style={{ backgroundColor: '#27318a' }}
                            className="w-full text-white py-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 hover:opacity-90"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryProducts;
