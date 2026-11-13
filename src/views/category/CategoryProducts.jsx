"use client";
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, SlidersHorizontal, Package, AlertTriangle, X, RotateCcw, ArrowUpDown, LayoutGrid } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import ProductFilterDrawer from '@/components/product/ProductFilterDrawer';
import { 
    filterProducts, 
    sortProducts, 
    BUDGET_RANGES, 
    NETWORK_OPTIONS, 
    FEATURE_OPTIONS, 
    RAM_OPTIONS, 
    DEAL_OPTIONS, 
    SORT_OPTIONS 
} from '@/utils/filterUtils';

const CategoryProductsContent = () => {
    const { categoryPath } = useParams();
    const navigate = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [allRawProducts, setAllRawProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Filter State (read initial values from URL query parameters)
    const [filters, setFilters] = useState({
        budget: searchParams?.get('budget') || '',
        network: searchParams?.get('network') || '',
        feature: searchParams?.get('feature') || '',
        series: searchParams?.get('series') || '',
        deal: searchParams?.get('deal') || (searchParams?.get('deals') === 'true' ? 'any_deal' : ''),
        ram: searchParams?.get('ram') || '',
        sortBy: searchParams?.get('sort') || 'featured'
    });

    // Sync state with URL params when URL changes
    useEffect(() => {
        if (!searchParams) return;
        setFilters(prev => ({
            ...prev,
            budget: searchParams.get('budget') || '',
            network: searchParams.get('network') || '',
            feature: searchParams.get('feature') || '',
            series: searchParams.get('series') || '',
            deal: searchParams.get('deal') || (searchParams.get('deals') === 'true' ? 'any_deal' : ''),
            ram: searchParams.get('ram') || '',
            sortBy: searchParams.get('sort') || prev.sortBy || 'featured'
        }));
    }, [searchParams]);

    // Fetch Products and Categories from Firestore
    useEffect(() => {
        const productsRef = collection(db, 'products');
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 8000);

        const unsubscribe = onSnapshot(productsRef, (snap) => {
            clearTimeout(safetyTimeout);
            const list = snap.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id,
                id: doc.id
            }));
            setAllRawProducts(list);
            setIsLoading(false);
        }, (err) => {
            clearTimeout(safetyTimeout);
            console.error("Storefront products sync error:", err);
            setSyncError(err);
            setIsLoading(false);
        });

        const categoriesRef = collection(db, 'categories');
        const unsubC = onSnapshot(categoriesRef, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(data.filter(c => c.status !== 'Hidden').sort((a,b) => a.name.localeCompare(b.name)));
        });

        return () => {
            unsubscribe();
            unsubC();
        };
    }, []);

    // 1. Base Category / Brand Filtering
    const baseCategoryProducts = useMemo(() => {
        const currentPath = categoryPath || pathname.split('/').pop();
        if (!currentPath || currentPath === 'products') {
            return allRawProducts;
        }

        return allRawProducts.filter(p => {
            const prodCat = (p.category || '').toLowerCase().trim();
            const pathName = currentPath.toLowerCase().trim();
            const prodSlug = prodCat.replace(/[^a-z0-9]+/g, '_');
            const pathSlug = pathName.replace(/[^a-z0-9]+/g, '_');
            return prodSlug === pathSlug || prodCat === pathName;
        });
    }, [categoryPath, pathname, allRawProducts]);

    const categoryName = useMemo(() => {
        const currentPath = categoryPath || pathname.split('/').pop();
        if (!currentPath || currentPath === 'products') return 'All Brands';
        if (baseCategoryProducts.length > 0) {
            return baseCategoryProducts[0].category || baseCategoryProducts[0].brand || currentPath;
        }
        return currentPath
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [categoryPath, pathname, baseCategoryProducts]);

    // Extract dynamic series list with counts from products
    const seriesList = useMemo(() => {
        const counts = {};
        allRawProducts.forEach(p => {
            const hl = (p.highlights || '').trim();
            if (hl && hl.length > 2) {
                counts[hl] = (counts[hl] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [allRawProducts]);

    // 2. Apply All 6 Dimensions of Filters
    const finalFilteredProducts = useMemo(() => {
        const filtered = filterProducts(baseCategoryProducts, filters);
        return sortProducts(filtered, filters.sortBy);
    }, [baseCategoryProducts, filters]);

    // Count how many filters are active
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.budget) count++;
        if (filters.network) count++;
        if (filters.feature) count++;
        if (filters.series) count++;
        if (filters.deal) count++;
        if (filters.ram) count++;
        return count;
    }, [filters]);

    // Handler to update individual filter and URL
    const handleFilterChange = (key, value) => {
        const nextFilters = { ...filters, [key]: value };
        setFilters(nextFilters);

        // Update URL query string shallowly
        const params = new URLSearchParams();
        if (nextFilters.budget) params.set('budget', nextFilters.budget);
        if (nextFilters.network) params.set('network', nextFilters.network);
        if (nextFilters.feature) params.set('feature', nextFilters.feature);
        if (nextFilters.series) params.set('series', nextFilters.series);
        if (nextFilters.deal) params.set('deal', nextFilters.deal);
        if (nextFilters.ram) params.set('ram', nextFilters.ram);
        if (nextFilters.sortBy && nextFilters.sortBy !== 'featured') params.set('sort', nextFilters.sortBy);

        const qs = params.toString();
        const targetPath = categoryPath ? `/category/${categoryPath}` : '/products';
        navigate.replace(`${targetPath}${qs ? `?${qs}` : ''}`);
    };

    const handleResetFilters = () => {
        setFilters({
            budget: '',
            network: '',
            feature: '',
            series: '',
            deal: '',
            ram: '',
            sortBy: 'featured'
        });
        const targetPath = categoryPath ? `/category/${categoryPath}` : '/products';
        navigate.replace(targetPath);
    };

    // Human-friendly labels for active chips
    const activeChips = useMemo(() => {
        const chips = [];
        if (filters.budget) {
            const b = BUDGET_RANGES.find(r => r.id === filters.budget);
            chips.push({ key: 'budget', label: b ? b.shortLabel : filters.budget });
        }
        if (filters.network) {
            const n = NETWORK_OPTIONS.find(o => o.id === filters.network);
            chips.push({ key: 'network', label: n ? n.shortLabel : filters.network.toUpperCase() });
        }
        if (filters.feature) {
            const f = FEATURE_OPTIONS.find(o => o.id === filters.feature);
            chips.push({ key: 'feature', label: f ? f.shortLabel : filters.feature });
        }
        if (filters.series) {
            chips.push({ key: 'series', label: filters.series });
        }
        if (filters.deal) {
            const d = DEAL_OPTIONS.find(o => o.id === filters.deal);
            chips.push({ key: 'deal', label: d ? d.label : 'Discounted' });
        }
        if (filters.ram) {
            const r = RAM_OPTIONS.find(o => o.id === filters.ram);
            chips.push({ key: 'ram', label: r ? r.label : filters.ram });
        }
        return chips;
    }, [filters]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [categoryPath]);

    return (
        <div className="bg-slate-50 pt-[60px] sm:pt-[90px] pb-24 font-['Montserrat',sans-serif] text-slate-900 min-h-[70vh]">
            
            {/* ====== Main Content Container ====== */}
            <div className="max-w-[1440px] mx-auto px-2 sm:px-8 lg:px-16 mt-2 sm:mt-4 relative z-10">

                {/* Horizontal Brands Slider (Shop by Brand) */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">Shop by Brand</h3>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">{categories.length} Brands Available</span>
                    </div>
                    <div className="flex gap-2 sm:gap-6 overflow-x-auto hide-scrollbar no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 px-1">
                        {/* All Brands Circle */}
                        <button 
                            onClick={() => {
                                handleResetFilters();
                                navigate.push('/products');
                            }}
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

                {/* ====== Header Section & Filter Control Bar ====== */}
                <header className="mb-4 sm:mb-6 px-1">
                    <div className="flex flex-row items-end justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-200">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 border border-amber-200"
                            >
                                <Sparkles size={10} className="sm:w-3 sm:h-3" />
                                Smartphone Catalog
                            </motion.div>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none capitalize"
                            >
                                {categoryName}
                            </motion.h1>
                        </div>

                        {/* Controls on Right: Sort & Filter Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            {/* Sort Selector */}
                            <div className="relative hidden sm:block">
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 pr-8 rounded-xl outline-none focus:border-amber-500 cursor-pointer shadow-sm appearance-none"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                                <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Filter Trigger Button */}
                            <button 
                                onClick={() => setIsFilterDrawerOpen(true)}
                                className={`p-2 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 border ${
                                    activeFilterCount > 0 
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' 
                                        : 'bg-white text-slate-900 hover:bg-slate-50 border-slate-200'
                                }`}
                                title="Filter Catalog"
                            >
                                <SlidersHorizontal size={14} className="sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                                </span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Active Filter Chips Bar */}
                    {activeChips.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-1">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                Applied:
                            </span>
                            {activeChips.map(chip => (
                                <button
                                    key={chip.key}
                                    onClick={() => handleFilterChange(chip.key, '')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] sm:text-xs font-bold border border-amber-200 transition-colors group"
                                >
                                    <span>{chip.label}</span>
                                    <X size={12} className="text-amber-600 group-hover:scale-110" />
                                </button>
                            ))}
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 text-[10px] sm:text-xs font-bold transition-colors ml-1"
                            >
                                <RotateCcw size={11} />
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Devices Count Status */}
                    <div className="mt-2 text-right">
                        <span className="text-[9px] sm:text-[11px] font-bold text-slate-500">
                            Showing <strong className="text-amber-600">{finalFilteredProducts.length}</strong> {finalFilteredProducts.length === 1 ? 'phone' : 'phones'}
                        </span>
                    </div>
                </header>

                {/* ====== Products Grid ====== */}
                {isLoading ? (
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-6 lg:gap-8 px-1 sm:px-0 animate-pulse">
                        {[...Array(8)].map((_, idx) => (
                            <div
                                key={idx}
                                className="w-[calc(33.333%-4px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-24px)] min-w-[100px] max-w-[280px] bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 space-y-3"
                            >
                                <div className="aspect-[4/5] bg-slate-200 rounded-xl w-full" />
                                <div className="h-3 bg-slate-200 rounded-full w-1/2" />
                                <div className="h-4 bg-slate-200 rounded-full w-4/5" />
                                <div className="h-4 bg-slate-200 rounded-full w-2/5" />
                            </div>
                        ))}
                    </div>
                ) : finalFilteredProducts.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-6 lg:gap-8 px-1 sm:px-0">
                        {finalFilteredProducts.map((product, idx) => (
                            <motion.div
                                key={product.firebaseId || product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.5) }}
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
                        className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-2xl mx-auto"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 shadow-inner">
                            <Package size={32} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                            No Phones Found
                        </h2>
                        <p className="text-slate-600 font-medium max-w-md mx-auto text-xs sm:text-sm leading-relaxed mb-6">
                            No smartphones match your current filter combination. Try clearing some filters or exploring all devices.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={handleResetFilters}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                            >
                                Reset All Filters
                            </button>
                            <button
                                onClick={() => navigate.push('/categories')}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                            >
                                Browse Brands
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Filter Drawer / Modal */}
            <ProductFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalMatchingCount={finalFilteredProducts.length}
                seriesList={seriesList}
            />

            {/* ====== ERROR DIAGNOSTICS MODAL ====== */}
            {syncError && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSyncError(null)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-lg relative z-[501] shadow-2xl p-6 sm:p-8 border-2 border-rose-200 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">
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

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#27318a] text-white py-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 hover:opacity-90"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoryProducts = () => {
    return (
        <Suspense fallback={<ProductSkeleton />}>
            <CategoryProductsContent />
        </Suspense>
    );
};

export default CategoryProducts;
