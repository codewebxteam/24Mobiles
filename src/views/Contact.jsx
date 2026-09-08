import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, PhoneCall, Mail, Send, Sparkles } from 'lucide-react';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        message: ''
    });

    const [contactSettings, setContactSettings] = useState({
        contactAddress: 'Sidhari, Azamgarh, Uttar Pradesh 276001',
        contactEmail: '24phonewala@gmail.com',
        contactPhone: '79051 39712'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        
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
            console.error("Error fetching contact settings:", error);
        });
        
        return () => unsubscribe();
    }, []);

    const handleWhatsAppSubmit = (e) => {
        e.preventDefault();
        const { fullName, email, message } = formData;
        if (!fullName || !message) {
            alert("Please provide your name and a message before sending.");
            return;
        }
        
        const text = `Hello 24mobiles,\n\nI am ${fullName}.\nEmail: ${email}\n\nMessage: ${message}`;
        const encodedText = encodeURIComponent(text);
        
        const cleanPhone = contactSettings.contactPhone.replace(/\D/g, '');
        const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        
        const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    };

    const contactMethods = [
        {
            icon: <MapPin size={28} className="text-amber-500" />,
            title: "Headquarters",
            details: [
                "24mobiles HQ",
                contactSettings.contactAddress
            ]
        },
        {
            icon: <PhoneCall size={28} className="text-amber-500" />,
            title: "Press & Partnerships",
            details: [
                `Phone: ${contactSettings.contactPhone}`,
                "Mon-Fri, 10AM to 6PM",
                "For urgent queries, use WhatsApp."
            ]
        },
        {
            icon: <Mail size={28} className="text-amber-500" />,
            title: "Email Us",
            details: [
                `General: ${contactSettings.contactEmail}`,
                "Editorial: editor@24mobiles.com"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-[80px] sm:pt-[100px] pb-24 font-['Montserrat',sans-serif] text-slate-900">
            
            {/* ====== Compact Hero Section ====== */}
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 sm:pt-12 pb-12">
                <div className="flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 border border-amber-200"
                    >
                        <Sparkles size={14} /> Get In Touch
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.1] mb-4"
                    >
                        Contact <span className="text-amber-500">24mobiles</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
                    >
                        Have a question, feedback, or business proposal? Reach out to us using the options below.
                    </motion.p>
                </div>
            </div>

            {/* ====== Contact Info Cards ====== */}
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 mb-16 sm:mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {contactMethods.map((method, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center transition-all group hover:border-amber-500/50 hover:shadow-lg"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-slate-100">
                                {method.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-4 tracking-wide">
                                {method.title}
                            </h3>
                            <div className="space-y-1">
                                {method.details.map((detail, i) => (
                                    <p key={i} className="text-slate-600 font-medium text-sm leading-relaxed">
                                        {detail}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ====== Contact Form Section ====== */}
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* Left: Contact Form */}
                    <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16">
                        <div className="mb-10">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
                                Send us a <span className="text-amber-500">Message</span>
                            </h2>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                Fill out the form below and we'll get back to you as soon as possible via WhatsApp or Email.
                            </p>
                        </div>

                        <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Your Message</label>
                                <textarea 
                                    placeholder="How can we help you?"
                                    rows="5"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm font-medium resize-none text-slate-900 placeholder-slate-400"
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-amber-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Send size={18} strokeWidth={2.5} />
                                Send via WhatsApp
                            </button>
                        </form>
                    </div>

                    {/* Right: Decorative Image */}
                    <div className="lg:w-1/2 relative bg-slate-100 min-h-[300px] lg:min-h-full hidden md:block">
                        <img 
                            src="/phones/image4-removebg-preview.png" 
                            alt="Contact 24mobiles"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Contact;
