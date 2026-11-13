"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Camera, BatteryCharging, Gamepad2, Smartphone, ChevronRight, ArrowRight } from 'lucide-react';

const FEATURE_CARDS = [
    {
        id: '5g',
        param: 'network=5g',
        title: '5G Smartphones',
        tagline: 'Superfast connectivity',
        badge: 'Top Trend',
        badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        icon: Zap,
        iconBg: 'bg-indigo-500 text-white',
        borderHover: 'hover:border-indigo-500',
        accentText: 'text-indigo-600'
    },
    {
        id: 'best_camera',
        param: 'feature=best_camera',
        title: 'Pro Camera Phones',
        tagline: '108MP & 200MP Sensors',
        badge: 'Photography',
        badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
        icon: Camera,
        iconBg: 'bg-rose-500 text-white',
        borderHover: 'hover:border-rose-500',
        accentText: 'text-rose-600'
    },
    {
        id: 'big_battery',
        param: 'feature=big_battery',
        title: 'Monster Battery',
        tagline: '6000mAh+ Mega Power',
        badge: 'Long Lasting',
        badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        icon: BatteryCharging,
        iconBg: 'bg-emerald-500 text-white',
        borderHover: 'hover:border-emerald-500',
        accentText: 'text-emerald-600'
    },
    {
        id: 'gaming',
        param: 'feature=gaming',
        title: 'Gaming & Performance',
        tagline: 'Snapdragon & 12GB+ RAM',
        badge: 'No Lag',
        badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
        icon: Gamepad2,
        iconBg: 'bg-amber-500 text-white',
        borderHover: 'hover:border-amber-500',
        accentText: 'text-amber-600'
    },
    {
        id: 'amoled',
        param: 'feature=amoled',
        title: 'AMOLED & Curved',
        tagline: 'Vibrant punchy displays',
        badge: 'Best Display',
        badgeColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
        icon: Smartphone,
        iconBg: 'bg-cyan-500 text-white',
        borderHover: 'hover:border-cyan-500',
        accentText: 'text-cyan-600'
    }
];

const ShopByFeature = () => {
    const router = useRouter();

    return (
        <section className="py-2 sm:py-3 bg-slate-50 font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                            <Zap size={12} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <h2 className="text-[11px] sm:text-[14px] font-black uppercase tracking-wider text-slate-900">
                            Explore by Feature & Need
                        </h2>
                    </div>
                    <button 
                        onClick={() => router.push('/products')}
                        className="text-[10px] sm:text-xs font-black text-rose-600 uppercase hover:text-rose-700 transition-colors flex items-center gap-0.5"
                    >
                        View All
                        <ChevronRight size={12} />
                    </button>
                </div>

                {/* Cards Container */}
                <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3.5 overflow-x-auto hide-scrollbar no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 sm:pb-0 snap-x">
                    {FEATURE_CARDS.map((card) => {
                        const IconComponent = card.icon;
                        return (
                            <motion.div
                                key={card.id}
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                onClick={() => router.push(`/products?${card.param}`)}
                                className={`snap-start shrink-0 w-[150px] sm:w-auto bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 ${card.borderHover} shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                                            <IconComponent size={14} />
                                        </div>
                                        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                                            {card.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-[11px] sm:text-[13px] font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 mt-0.5 line-clamp-1">
                                        {card.tagline}
                                    </p>
                                </div>

                                <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-slate-700 group-hover:text-amber-600">
                                    <span>Browse Models</span>
                                    <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ShopByFeature;

