"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Hero = () => {
  const [posters, setPosters] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch Posters from Firestore
  useEffect(() => {
    const q = query(collection(db, 'posters'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosters(list);
    });
    return () => unsubscribe();
  }, []);

  // Auto-advance Carousel every 5 seconds
  useEffect(() => {
    if (posters.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % posters.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [posters.length]);

  if (posters.length === 0) {
    // Render a default empty state or nothing
    return null; 
  }

  return (
    <div className="w-full pt-[3.25rem] sm:pt-[4rem] pb-4 px-3 sm:px-8 max-w-[1440px] mx-auto">
      <section className="relative w-full aspect-[21/9] sm:aspect-[21/9] lg:aspect-[21/9] max-h-[800px] bg-slate-900 overflow-hidden rounded-[1.25rem] sm:rounded-3xl font-['Montserrat',sans-serif] shadow-lg">
        
        {/* Full-screen Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              if (posters[currentSlide].link) {
                window.location.href = posters[currentSlide].link;
              }
            }}
          >
            <img
              src={posters[currentSlide].imgUrl}
              alt="Promo Banner"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots Navigation */}
      {posters.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2">
          {posters.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'w-6 sm:w-8 bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.8)]' 
                  : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80 backdrop-blur-sm'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
    </div>
  );
};

export default Hero;
