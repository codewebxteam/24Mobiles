"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Star, Share2, ShieldCheck, Zap, Battery, Camera, Cpu, 
    CheckCircle2, XCircle, ChevronRight, ExternalLink, Activity, HardDrive, Smartphone
} from 'lucide-react';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

import ShareModal from '@/components/common/ShareModal';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import AdBanner from '@/components/common/AdBanner';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useRouter();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        let isMounted = true;
        let unsubscribe = () => { };
        setIsLoading(true);

        const safetyTimeout = setTimeout(() => {
            if (isMounted) setIsLoading(false);
        }, 3000);

        try {
            const productRef = doc(db, 'products', id);
            unsubscribe = onSnapshot(productRef, (snapshot) => {
                if (!isMounted) return;
                try {
                    const data = snapshot.data();
                    if (!data) {
                        setProduct(null);
                    } else {
                        // Parse Highlights
                        let parsedHighlights = [];
                        if (typeof data.highlights === 'string') {
                            parsedHighlights = data.highlights.split(/[,\n]/).map(h => h.trim()).filter(Boolean);
                        } else if (Array.isArray(data.highlights)) {
                            parsedHighlights = data.highlights;
                        }

                        // Parse Specifications
                        let parsedSpecs = [];
                        const specsText = data.specification || data.specifications || "";
                        if (typeof specsText === 'string' && specsText.trim()) {
                            parsedSpecs = specsText.split('\n').map(line => {
                                const trimLine = line.trim();
                                if (!trimLine) return null;
                                const colonIndex = trimLine.indexOf(':');
                                if (colonIndex > 0) {
                                    return {
                                        label: trimLine.substring(0, colonIndex).trim(),
                                        value: trimLine.substring(colonIndex + 1).trim()
                                    };
                                }
                                return { label: 'Detail', value: trimLine };
                            }).filter(Boolean);
                        } else if (Array.isArray(specsText)) {
                            parsedSpecs = specsText;
                        }

                        // Parse Pros & Cons
                        let parsedPros = [];
                        if (typeof data.pros === 'string') {
                            parsedPros = data.pros.split('\n').map(p => p.trim()).filter(Boolean);
                        } else if (Array.isArray(data.pros)) {
                            parsedPros = data.pros;
                        }

                        let parsedCons = [];
                        if (typeof data.cons === 'string') {
                            parsedCons = data.cons.split('\n').map(c => c.trim()).filter(Boolean);
                        } else if (Array.isArray(data.cons)) {
                            parsedCons = data.cons;
                        }

                        const enrichedProduct = {
                            ...data,
                            id: id,
                            img: data.img || data.image || data.compressedImage || '/phones/image8-removebg-preview.png',
                            gallery: data.gallery || [],
                            variants: data.variants || [],
                            highlights: parsedHighlights,
                            specifications: parsedSpecs,
                            pros: parsedPros,
                            cons: parsedCons,
                            longDescription: data.description || ''
                        };

                        setProduct(enrichedProduct);
                        setCurrentImage(enrichedProduct.img);
                        if (enrichedProduct.variants && enrichedProduct.variants.length > 0) {
                            setSelectedVariant(enrichedProduct.variants[0]);
                        }
                    }
                } catch (innerError) {
                    console.error("Data processing error:", innerError);
                } finally {
                    setIsLoading(false);
                    clearTimeout(safetyTimeout);
                }
            }, (fbError) => {
                console.error("Firebase fetch error:", fbError);
                if (isMounted) setIsLoading(false);
                clearTimeout(safetyTimeout);
            });
        } catch (outerError) {
            console.error("Firebase setup error:", outerError);
            if (isMounted) setIsLoading(false);
            clearTimeout(safetyTimeout);
        }

        return () => {
            isMounted = false;
            unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            }).catch(console.error);
        } else {
            setIsShareModalOpen(true);
        }
    };

    if (isLoading) {
        return <ProductSkeleton />;
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-black text-slate-900 mb-6">Device Not Found</h2>
                <button
                    onClick={() => navigate.push('/products')}
                    className="px-8 py-3 bg-amber-500 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-amber-400 shadow-md active:scale-95 transition-all"
                >
                    Back to All Phones
                </button>
            </div>
        );
    }

    const currentPrice = selectedVariant 
        ? parseFloat(selectedVariant.price || 0) 
        : parseFloat(product.price || product.priceBox || product.priceLarri || 0);

    const originalPrice = selectedVariant 
        ? parseFloat(selectedVariant.originalPrice || 0) 
        : parseFloat(product.originalPrice || 0);

    const hasProsCons = product.pros?.length > 0 || product.cons?.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 pt-[90px] sm:pt-[100px] pb-12 lg:pb-24 font-['Montserrat',sans-serif] text-slate-900">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">

                {/* Navigation / Breadcrumbs */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors mb-4 sm:mb-6 group w-max"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Back to Database</span>
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

                    {/* Left Column: Image & Quick Specs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-white rounded-[2rem] border border-slate-200 shadow-xl flex items-center justify-center overflow-hidden p-8 sm:p-12 group">
                            
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                            
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImage || product.img}
                                    src={currentImage || product.img}
                                    alt={product.name}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset }) => {
                                        const swipe = offset.x;
                                        const gallery = product.gallery?.length > 0 ? product.gallery : [product.img];
                                        if (gallery.length <= 1) return;
                                        
                                        const idx = gallery.indexOf(currentImage || product.img);
                                        const currentIdx = idx === -1 ? 0 : idx;
                                        
                                        if (swipe < -50) {
                                            // Swipe Left -> Next
                                            setCurrentImage(gallery[(currentIdx + 1) % gallery.length]);
                                        } else if (swipe > 50) {
                                            // Swipe Right -> Prev
                                            setCurrentImage(gallery[(currentIdx - 1 + gallery.length) % gallery.length]);
                                        }
                                    }}
                                    initial={{ scale: 0.9, opacity: 0, x: 20 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-contain drop-shadow-2xl relative z-10 cursor-grab active:cursor-grabbing touch-pan-y"
                                />
                            </AnimatePresence>

                            {/* Badges & Actions */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                                {product.brand && (
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{product.brand}</span>
                                    </div>
                                )}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleShare}
                                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-amber-600 transition-colors"
                                    title="Share this phone"
                                >
                                    <Share2 size={16} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {product.gallery && product.gallery.length > 1 && (
                            <div className="flex items-center gap-3 mt-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                {product.gallery.map((imgSrc, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentImage(imgSrc)}
                                        className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center p-1 transition-all ${currentImage === imgSrc ? 'border-amber-500 shadow-md scale-105' : 'border-slate-200 hover:border-amber-300'}`}
                                    >
                                        <img src={imgSrc} alt={`${product.name} view ${idx+1}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Removed Top Features Highlights (Icons) as it is replaced by Variant Highlights */}
                    </motion.div>

                    {/* Right Column: Details & Pricing */}
                    <div className="lg:col-span-7 space-y-8 lg:space-y-10">
                        
                        {/* Header Info */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                                    {product.category || 'Smartphone'}
                                </div>
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                    <Star size={12} className="fill-amber-500 text-amber-500" />
                                    <span className="text-[10px] font-black text-slate-900">4.8</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Expert Rating</span>
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 capitalize"
                            >
                                {product.name}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl"
                            >
                                {product.longDescription}
                            </motion.p>

                            {/* Global Key Highlights */}
                            {product.highlights && product.highlights.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex flex-wrap gap-2 mt-4"
                                >
                                    {product.highlights.map((highlight, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {highlight}
                                        </span>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Variant Selector */}
                        {product.variants && product.variants.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="mb-8"
                            >
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                    Variant: <span className="text-amber-600 ml-1">{selectedVariant?.name}</span>
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant, idx) => {
                                        const isSelected = selectedVariant?.name === variant.name;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`min-w-[110px] text-left p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-500/5 shadow-md scale-105' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                                            >
                                                <div className="text-xs font-black text-slate-900 mb-1">{variant.name}</div>
                                                <div className="text-xs font-bold text-amber-600">₹{parseFloat(variant.price).toLocaleString('en-IN')}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Variant-Specific Highlights (Flipkart Style) */}
                        {selectedVariant?.highlights && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={selectedVariant.name} // re-animate when variant changes
                                className="mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
                            >
                                <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                                    Product Highlights <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{selectedVariant.name}</span>
                                </h3>
                                <ul className="space-y-4">
                                    {selectedVariant.highlights.storage && (
                                        <li className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <HardDrive size={20} className="text-slate-600" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                {selectedVariant.highlights.storage.split('|').map((line, i) => (
                                                    <span key={i} className={i === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                    {selectedVariant.highlights.processor && (
                                        <li className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Cpu size={20} className="text-slate-600" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                {selectedVariant.highlights.processor.split('|').map((line, i) => (
                                                    <span key={i} className={i === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                    {selectedVariant.highlights.rearCamera && (
                                        <li className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Camera size={20} className="text-slate-600" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                {selectedVariant.highlights.rearCamera.split('|').map((line, i) => (
                                                    <span key={i} className={i === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                    {selectedVariant.highlights.frontCamera && (
                                        <li className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Camera size={20} className="text-slate-600" />
                                                <div className="absolute w-2 h-2 bg-white rounded-full translate-x-3 translate-y-3" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                {selectedVariant.highlights.frontCamera.split('|').map((line, i) => (
                                                    <span key={i} className={i === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                    {selectedVariant.highlights.display && (
                                        <li className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Smartphone size={20} className="text-slate-600" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                {selectedVariant.highlights.display.split('|').map((line, i) => (
                                                    <span key={i} className={i === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                    {selectedVariant.highlights.battery && (
                                        <li className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Battery size={20} className="text-slate-600" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                {selectedVariant.highlights.battery.split('|').map((line, i) => (
                                                    <span key={i} className={i === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                    {selectedVariant.highlights.custom?.map((customItem, i) => (
                                        <li key={`custom-${i}`} className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <CheckCircle2 size={20} className="text-slate-600" />
                                            </div>
                                            <div className="pt-1.5 flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{customItem.type}</span>
                                                {customItem.details.split('|').map((line, idx) => (
                                                    <span key={idx} className={idx === 0 ? "text-sm font-bold text-slate-800" : "text-[11px] font-bold text-slate-500"}>
                                                        {line.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Pricing & CTA */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-xl"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Best Price</p>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl sm:text-5xl font-black text-amber-600 tracking-tighter">
                                            ₹{currentPrice.toLocaleString('en-IN')}
                                        </span>
                                        {originalPrice > currentPrice ? (
                                            <span className="text-lg font-bold text-slate-400 line-through">
                                                ₹{originalPrice.toLocaleString('en-IN')}
                                            </span>
                                        ) : product.discount > 0 ? (
                                            <span className="text-lg font-bold text-slate-400 line-through">
                                                ₹{Math.round(currentPrice * (1 + (product.discount / 100))).toLocaleString('en-IN')}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-emerald-500" /> 
                                        Price verified through affiliate partners
                                    </p>
                                </div>
                            </div>

                            {/* AdSense Placement 1 */}
                            <AdBanner dataAdSlot="top-product-ad" className="mb-6" />

                            {/* Affiliate CTA */}
                            <a 
                                href={product.affiliateLink || "#"} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-full bg-amber-500 text-white font-black text-sm uppercase tracking-widest py-4 sm:py-5 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:bg-amber-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                            >
                                Check Best Deals 
                                <ExternalLink size={18} strokeWidth={2.5} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </motion.div>

                        {/* Detailed Specifications section removed as per user request */}

                        {/* Pros & Cons (Backward Compatibility) */}
                        {hasProsCons && (
                            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {/* Pros */}
                                {product.pros?.length > 0 && (
                                    <div className="bg-white shadow-sm rounded-[2rem] p-6 sm:p-8 border border-emerald-500/20">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">What we like</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {product.pros.map((pro, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                                                    <span className="text-sm text-slate-600 font-bold leading-relaxed">{pro}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Cons */}
                                {product.cons?.length > 0 && (
                                    <div className="bg-white shadow-sm rounded-[2rem] p-6 sm:p-8 border border-rose-500/20">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                                                <XCircle size={24} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">What to consider</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {product.cons.map((con, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <XCircle size={16} className="text-rose-500 mt-1 shrink-0" />
                                                    <span className="text-sm text-slate-600 font-bold leading-relaxed">{con}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* AdSense Placement 2 */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 mb-8">
                <AdBanner dataAdSlot="bottom-product-ad" />
            </div>

            {/* Recommendations */}
            <RecommendedProducts currentProductId={product.id} category={product.category} />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                product={product}
            />
        </div>
    );
};

export default ProductDetail;
