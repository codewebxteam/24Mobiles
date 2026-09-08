"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Newspaper, ExternalLink } from 'lucide-react';

import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const HomeNews = ({ onLoaded }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useRouter();

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(6));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNews(newsList);
            setLoading(false);
            if (onLoaded) onLoaded();
        });

        return () => unsubscribe();
    }, []);



    if (loading || news.length === 0) {
        return null; // Don't show anything if loading or no news
    }

    return (
        <section className="py-2 sm:py-4 bg-slate-50 overflow-hidden font-['Montserrat',sans-serif]">
            <div className="max-w-[1440px] mx-auto">
                
                {/* Compact Header (Matching Featured Products) */}
                <div className="flex items-center justify-between px-4 sm:px-8 mb-3">
                    <h2 className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider text-slate-900">Latest News</h2>
                    <button 
                        onClick={() => navigate.push('/news')} 
                        className="text-[10px] sm:text-xs font-black text-amber-600 uppercase hover:text-amber-700 transition-colors"
                    >
                        View All
                    </button>
                </div>

                {/* News Horizontal Scroll */}
                <div className="flex overflow-x-auto gap-3 sm:gap-6 px-4 sm:px-8 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {news.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate.push(`/news/${item.id}`)}
                            className="snap-start shrink-0 w-[calc(85vw)] sm:w-[calc(40vw)] lg:w-[calc(25vw)] max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:-translate-y-1 hover:shadow-md hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
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
                            <div className="p-3 flex-1 flex flex-col">
                                <div className="flex items-center gap-1 mb-1.5">
                                    <Calendar size={10} className="text-amber-500" />
                                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <h2 className="text-[11px] sm:text-xs font-black text-slate-900 leading-snug mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
                                    {item.title}
                                </h2>
                                
                                <p className="text-[9px] font-medium text-slate-500 leading-relaxed line-clamp-2 mb-2 flex-1">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    {/* View All Card */}
                    {news.length >= 4 && (
                        <div 
                            onClick={() => navigate.push('/news')} 
                            className="snap-start shrink-0 w-[120px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-500/50 hover:shadow-md transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors mb-2">
                                <ArrowRight size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-700 uppercase group-hover:text-amber-600 transition-colors text-center px-2">View All<br/>News</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HomeNews;
