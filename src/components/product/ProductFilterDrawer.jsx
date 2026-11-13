"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check, Sparkles, Filter, IndianRupee, Zap, Camera, BatteryCharging, Gamepad2, Smartphone, Tag, HardDrive, Layers } from 'lucide-react';
import { BUDGET_RANGES, NETWORK_OPTIONS, FEATURE_OPTIONS, RAM_OPTIONS, DEAL_OPTIONS, SORT_OPTIONS } from '@/utils/filterUtils';

const ProductFilterDrawer = ({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onResetFilters,
    totalMatchingCount,
    seriesList = []
}) => {
    if (!isOpen) return null;

    const handleSelect = (category, value) => {
        // Toggle if already selected
        const current = filters[category];
        const nextValue = current === value ? '' : value;
        onFilterChange(category, nextValue);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] overflow-hidden font-['Montserrat',sans-serif]">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Drawer Container (Side drawer on desktop, bottom sheet on mobile) */}
                <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        {/* Drawer Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                                    <Filter size={16} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 leading-tight">Filter Smartphones</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                        Refine by 6 dimensions
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Filter Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">

                            {/* 1. Budget / Price Range */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <IndianRupee size={14} className="text-amber-500" />
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        1. Budget / Price Range
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {BUDGET_RANGES.map((b) => {
                                        const isSelected = filters.budget === b.id;
                                        return (
                                            <button
                                                key={b.id}
                                                onClick={() => handleSelect('budget', b.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                                    isSelected
                                                        ? 'border-amber-500 bg-amber-50/40 text-amber-900 font-black shadow-sm'
                                                        : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                                                }`}
                                            >
                                                <div>
                                                    <span className="text-xs font-bold block">{b.label}</span>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">{b.desc}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'}`}>
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Network Connectivity (5G / 4G) */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap size={14} className="text-indigo-500" />
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        2. Network (5G / 4G)
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {NETWORK_OPTIONS.map((net) => {
                                        const isSelected = filters.network === net.id;
                                        return (
                                            <button
                                                key={net.id}
                                                onClick={() => handleSelect('network', net.id)}
                                                className={`p-3 rounded-xl border text-center transition-all ${
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-black shadow-sm'
                                                        : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700 font-bold'
                                                }`}
                                            >
                                                <span className="text-xs block">{net.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3. Feature / Special Need */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} className="text-rose-500" />
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        3. Use-Case & Features
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {FEATURE_OPTIONS.map((f) => {
                                        const isSelected = filters.feature === f.id;
                                        return (
                                            <button
                                                key={f.id}
                                                onClick={() => handleSelect('feature', f.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                                    isSelected
                                                        ? 'border-rose-500 bg-rose-50/40 text-rose-900 font-black shadow-sm'
                                                        : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                                                }`}
                                            >
                                                <div>
                                                    <span className="text-xs font-bold block">{f.label}</span>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">{f.desc}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'}`}>
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 4. Deals & Discounts */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag size={14} className="text-amber-500" />
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        4. Deals & Discounts
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {DEAL_OPTIONS.map((deal) => {
                                        const isSelected = filters.deal === deal.id;
                                        return (
                                            <button
                                                key={deal.id}
                                                onClick={() => handleSelect('deal', deal.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                                    isSelected
                                                        ? 'border-amber-500 bg-amber-50/40 text-amber-900 font-black shadow-sm'
                                                        : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700 font-bold'
                                                }`}
                                            >
                                                <span className="text-xs">{deal.label}</span>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'}`}>
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 5. RAM Capacity */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <HardDrive size={14} className="text-cyan-500" />
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        5. RAM Capacity
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {RAM_OPTIONS.map((r) => {
                                        const isSelected = filters.ram === r.id;
                                        return (
                                            <button
                                                key={r.id}
                                                onClick={() => handleSelect('ram', r.id)}
                                                className={`p-3 rounded-xl border text-center transition-all ${
                                                    isSelected
                                                        ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-black shadow-sm'
                                                        : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700 font-bold'
                                                }`}
                                            >
                                                <span className="text-xs block">{r.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 6. Popular Series (Dynamic from DB) */}
                            {seriesList && seriesList.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Layers size={14} className="text-emerald-500" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            6. Series / Sub-Brand
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                        {seriesList.slice(0, 16).map((item) => {
                                            const isSelected = filters.series?.toLowerCase() === item.name.toLowerCase();
                                            return (
                                                <button
                                                    key={item.name}
                                                    onClick={() => handleSelect('series', item.name)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                                >
                                                    {item.name} ({item.count})
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50 flex items-center gap-3">
                            <button
                                onClick={onResetFilters}
                                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                            >
                                <RotateCcw size={14} />
                                Reset
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                            >
                                View {totalMatchingCount} Phones
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default ProductFilterDrawer;

