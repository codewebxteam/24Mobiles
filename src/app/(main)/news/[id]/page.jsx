"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ExternalLink, Newspaper } from 'lucide-react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function NewsArticlePage({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const navigate = useRouter();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const docRef = doc(db, 'news', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setNews({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
                <div className="w-20 h-20 mb-4 animate-pulse">
                     <img src="/phones/gemini-svg.svg" alt="Loading" className="w-full h-full object-contain" />
                </div>
                <span className="text-amber-600 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Article...</span>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20 text-center px-4">
                <Newspaper size={48} className="text-slate-300 mb-4" />
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-2">Article Not Found</h1>
                <p className="text-slate-500 font-medium mb-8">This news article doesn't exist or has been removed.</p>
                <button 
                    onClick={() => navigate.push('/news')}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to News
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-[70px] sm:pt-[80px] pb-12 font-['Montserrat',sans-serif]">
            <div className="max-w-[800px] mx-auto px-4 sm:px-8">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate.push('/news')}
                    className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-6 sm:mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to News
                </button>

                <article className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Hero Image */}
                    <div className="aspect-[16/9] w-full bg-slate-100 relative">
                        <img 
                            src={news.imgUrl} 
                            alt={news.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 sm:p-10 sm:pt-8">
                        <div className="flex items-center gap-1.5 mb-5">
                            <Calendar size={14} className="text-amber-500" />
                            <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-widest">
                                {new Date(news.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-8">
                            {news.title}
                        </h1>
                        
                        <div className="prose prose-sm sm:prose-base prose-slate max-w-none">
                            <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {news.content}
                            </p>
                        </div>

                        {news.link && (
                            <div className="mt-10 pt-10 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
                                <a 
                                    href={news.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <ExternalLink size={16} /> Read Full Source Article
                                </a>
                            </div>
                        )}
                    </div>
                </article>

            </div>
        </div>
    );
}
