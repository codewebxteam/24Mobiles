import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

import { Facebook, Instagram, Twitter, Youtube, ArrowRight, MapPin, Mail, PhoneCall, Smartphone } from 'lucide-react';

const Footer = () => {
    const [contactSettings, setContactSettings] = useState({
        contactAddress: 'Shop No 03, Sanjay Tripathi C/o Om Prakash Tripathi, Near Piprapati, Katrari Police Station, Bhathat, Gorakhpur - 273306, UP.',
        contactEmail: 'contact@24mobiles.com',
        contactPhone: '+91 8000668955'
    });

    useEffect(() => {
        const settingsRef = doc(db, 'store', 'settings');
        const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setContactSettings(prev => ({
                    contactAddress: data.contactAddress || prev.contactAddress,
                    contactEmail: data.contactEmail || prev.contactEmail,
                    contactPhone: data.contactPhone || prev.contactPhone
                }));
            }
        }, (error) => {
            console.error("Error fetching footer settings:", error);
        });
        
        return () => unsubscribe();
    }, []);

    return (
        <footer className="bg-white pt-8 sm:pt-20 font-['Montserrat',sans-serif] border-t border-slate-200">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-6 sm:pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-8">
                    
                    {/* ====== Column 1: Brand & About ====== */}
                    <div className="flex flex-col pr-0 lg:pr-4">
                        <Link href="/" className="inline-block mb-4 sm:mb-6">
                            <div className="flex items-center cursor-pointer">
                                <img src="/phones/gemini-svg.svg" alt="24mobiles Logo" className="h-10 md:h-12 object-contain" />
                            </div>
                        </Link>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-medium">
                            <strong>24mobiles</strong> is your ultimate destination for unbiased smartphone reviews, detailed specifications, and expert buying guides. We help you make the right choice for your next device.
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                                <a 
                                    key={idx} 
                                    href="#" 
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-amber-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-sm"
                                >
                                    <Icon size={14} className="sm:w-4 sm:h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ====== Column 2: Important Links ====== */}
                    <div className="flex flex-col">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 sm:mb-6 uppercase tracking-widest">
                            Quick Links
                        </h3>
                        <ul className="flex flex-col gap-2.5 sm:gap-3.5">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'All Phones', path: '/products' },
                                { name: 'Brands', path: '/categories' },
                                { name: 'Compare', path: '/compare' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact Us', path: '/contact' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link 
                                        href={link.path} 
                                        className="text-slate-600 text-xs sm:text-sm font-medium hover:text-amber-600 transition-all duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ====== Column 3: Contact Info ====== */}
                    <div className="flex flex-col">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 sm:mb-6 uppercase tracking-widest">
                            Contact Us
                        </h3>
                        <ul className="flex flex-col gap-3 sm:gap-4">
                            <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                                <span>
                                    <strong>24mobiles Headquarters:</strong><br />
                                    {contactSettings.contactAddress}
                                </span>
                            </li>
                            <li className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600 font-medium mt-1 sm:mt-2">
                                <Mail size={14} className="text-amber-500 shrink-0 sm:w-4 sm:h-4" />
                                <a href={`mailto:${contactSettings.contactEmail}`} className="hover:text-amber-600 transition-colors">
                                    {contactSettings.contactEmail}
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600 font-medium mt-1 sm:mt-2">
                                <PhoneCall size={14} className="text-amber-500 shrink-0 sm:w-4 sm:h-4" />
                                <span>Press & Business: {contactSettings.contactPhone}</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* ====== Bottom Copyright Bar & Legal Disclaimer ====== */}
            <div className="bg-slate-50 py-4 sm:py-6 border-t border-slate-200">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-2 sm:gap-3">
                    <p className="text-slate-500 text-[9px] sm:text-[11px] font-medium max-w-4xl leading-relaxed">
                        <strong>Affiliate Disclosure:</strong> 24mobiles provides independent smartphone reviews and specifications. We may earn an affiliate commission when you purchase through links on our site. This helps support our research and content creation. All product names, logos, and brands are property of their respective owners.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-6 mt-2 sm:mt-4">
                        <p className="text-slate-500 text-[10px] sm:text-xs font-bold tracking-wide">
                            Copyright &copy; {new Date().getFullYear()} 24mobiles. All Rights Reserved.
                        </p>
                        <Link 
                            href="/admin/login" 
                            className="text-slate-400 hover:text-amber-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
