"use client";
import React, { useState, useEffect } from 'react';
import Hero from '@/components/foundation/home/hero';
import HomeCategories from '@/views/category/Categories';
import FeaturedProducts from '@/components/foundation/home/FeaturedProducts';
import HomeNews from '@/components/foundation/home/HomeNews';
import ShopByBudget from '@/components/foundation/home/ShopByBudget';
import ShopByFeature from '@/components/foundation/home/ShopByFeature';
import TopDealsSection from '@/components/foundation/home/TopDealsSection';
import SeriesAndRamHub from '@/components/foundation/home/SeriesAndRamHub';

const HomeSkeleton = () => (
  <div className="min-h-screen bg-slate-50 pt-[100px] px-4 sm:px-8 max-w-[1440px] mx-auto animate-pulse pb-20">
    <div className="h-48 sm:h-64 bg-slate-200 rounded-3xl mb-8"></div>
    
    {/* Brands Skeleton */}
    <div className="flex justify-between mb-4 mt-8">
       <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
       <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
    </div>
    <div className="flex gap-4 overflow-hidden mb-12">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-200"></div>
            <div className="w-12 h-3 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>

    {/* Phones Skeleton */}
    <div className="flex justify-between mb-4">
       <div className="w-32 h-4 bg-slate-200 rounded-full"></div>
       <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] bg-slate-200 rounded-2xl"></div>)}
    </div>
  </div>
);

const Home = () => {
  // We track loading states for components that fetch data. Hero doesn't fetch data.
  const [loadedFlags, setLoadedFlags] = useState({ categories: false, products: false, news: false });
  const [showSkeleton, setShowSkeleton] = useState(true);

  const isAllLoaded = loadedFlags.categories && loadedFlags.products && loadedFlags.news;

  useEffect(() => {
    if (isAllLoaded) {
      // Adding a small delay to make the transition smoother after all data is injected
      const timer = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAllLoaded]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => setShowSkeleton(false), 5000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <>
      {showSkeleton && <HomeSkeleton />}
      
      <main className={`min-h-screen bg-slate-50 font-['Montserrat',sans-serif] ${showSkeleton ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 transition-opacity duration-500'}`}>
        {/* 1. First Impression: Carousel Banner */}
        <Hero />

        {/* 2. Shop By Budget: Price Ranges (Under 10k, 10-20k, 20-35k, 35-50k, 50k+) */}
        <ShopByBudget />

        {/* 3. Shop By Need & Features (5G, Pro Camera, 6000mAh+, Gaming, AMOLED) */}
        <ShopByFeature />

        {/* 4. Top Brands */}
        <HomeCategories isHome={true} onLoaded={() => setLoadedFlags(p => ({ ...p, categories: true }))} />

        {/* 5. Top Deals & High Discounts */}
        <TopDealsSection />

        {/* 6. Latest Phones */}
        <FeaturedProducts onLoaded={() => setLoadedFlags(p => ({ ...p, products: true }))} />

        {/* 7. Popular Series & RAM Capacity Hub */}
        <SeriesAndRamHub />

        {/* 8. Latest News */}
        <HomeNews onLoaded={() => setLoadedFlags(p => ({ ...p, news: true }))} />

      </main>
    </>
  );
};

export default Home;
