import React from 'react';
import Hero from '@/components/foundation/home/hero';
import HomeCategories from '@/views/category/Categories';
import FeaturedProducts from '@/components/foundation/home/FeaturedProducts';
import HomeNews from '@/components/foundation/home/HomeNews';

const Home = () => {
  return (
    <main className="min-h-screen bg-slate-50 font-['Montserrat',sans-serif]">
      {/* 1. First Impression */}
      <Hero />

      {/* 2. Top Brands */}
      <HomeCategories isHome={true} />

      {/* 3. Latest Phones */}
      <FeaturedProducts />

      {/* 4. Latest News */}
      <HomeNews />

    </main>
  );
};

export default Home;
