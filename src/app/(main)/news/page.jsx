"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronRight, Calendar, ArrowRight, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useRouter();
    const [selectedMonth, setSelectedMonth] = useState('All');

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNews(newsList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);



    // Relative date filtering logic
    const filterOptions = ["All", "Today", "Yesterday", "This Week", "This Month", "This Year"];

    const getFilteredNews = () => {
        if (selectedMonth === 'All') return news;

        const now = new Date();
        const todayStr = now.toDateString();
        
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        return news.filter(item => {
            const itemDate = new Date(item.createdAt);
            
            switch (selectedMonth) {
                case 'Today':
                    return itemDate.toDateString() === todayStr;
                case 'Yesterday':
                    return itemDate.toDateString() === yesterdayStr;
                case 'This Week':
                    return itemDate >= oneWeekAgo;
                case 'This Month':
                    return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                case 'This Year':
                    return itemDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    };

    const filteredNews = getFilteredNews();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
                <div className="w-20 h-20 mb-4 animate-pulse">
                     <img src="/phones/gemini-svg.svg" alt="Loading" className="w-full h-full object-contain" />
                </div>
                <span className="text-amber-600 font-bold uppercase tracking-widest text-sm animate-pulse">Loading News...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-[70px] sm:pt-[80px] pb-12 font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                
                {/* Compact Page Header */}
                <header className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-amber-500 shrink-0"
                    >
                        <Newspaper size={20} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
                    </motion.div>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm sm:text-lg font-black text-slate-900 tracking-wider uppercase leading-tight"
                        >
                            Latest News
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                        >
                            Tech updates & mobile launches
                        </motion.p>
                    </div>
                </header>

                {/* Filter Pills */}
                {news.length > 0 && (
                    <div className="flex overflow-x-auto gap-2 mb-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {filterOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => setSelectedMonth(option)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
                                    selectedMonth === option 
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-amber-500/50 hover:text-amber-600'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {/* News Grid */}
                {filteredNews.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 flex flex-col items-center justify-center text-center max-w-xl mx-auto shadow-sm mt-8">
                        <Newspaper size={40} className="text-slate-300 mb-3" />
                        <h4 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-widest">No News Found</h4>
                        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1">No articles match the selected date filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        <AnimatePresence>
                            {filteredNews.map((item, idx) => (
                                <motion.article
                                    key={item.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    onClick={() => navigate.push(`/news/${item.id}`)}
                                    className="cursor-pointer bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300"
                                >
                                    {/* Image Container */}
                                    <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden shrink-0">
                                        <img 
                                            src={item.imgUrl} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Calendar size={12} className="text-amber-500" />
                                            <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        
                                        <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                                            {item.title}
                                        </h2>
                                        
                                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                                            {item.content}
                                        </p>

                                        {/* Action Button */}
                                        <button className="inline-flex items-center justify-between w-full bg-slate-50 hover:bg-amber-50 text-amber-600 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest py-3 px-4 rounded-xl transition-colors border border-slate-100 hover:border-amber-200 group/btn mt-auto">
                                            <span>Read Full News</span>
                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
