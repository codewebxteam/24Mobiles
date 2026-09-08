"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Layers, ArrowRight, X, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Compare = () => {
    const navigate = useRouter();
    const searchParams = useSearchParams();
    
    const phone1Id = searchParams ? searchParams.get('phone1') : null;
    const phone2Id = searchParams ? searchParams.get('phone2') : null;

    const [phone1Data, setPhone1Data] = useState(null);
    const [phone2Data, setPhone2Data] = useState(null);
    const [isLoading1, setIsLoading1] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchPhoneData = async (id, setData, setLoading) => {
        if (!id) {
            setData(null);
            return;
        }
        setLoading(true);
        try {
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setData({ id, ...docSnap.data() });
            } else {
                setData(null);
            }
        } catch (error) {
            console.error("Error fetching phone:", error);
            setData(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPhoneData(phone1Id, setPhone1Data, setIsLoading1);
    }, [phone1Id]);

    useEffect(() => {
        fetchPhoneData(phone2Id, setPhone2Data, setIsLoading2);
    }, [phone2Id]);

    const handleSelectPhone = (target) => {
        navigate.push(`/products?compareTarget=${target}${phone1Id ? `&phone1=${phone1Id}` : ''}${phone2Id ? `&phone2=${phone2Id}` : ''}`);
    };

    const handleRemovePhone = (target) => {
        if (target === 'phone1') {
            navigate.push(`/compare${phone2Id ? `?phone2=${phone2Id}` : ''}`);
        } else {
            navigate.push(`/compare${phone1Id ? `?phone1=${phone1Id}` : ''}`);
        }
    };

    const renderPhoneSlot = (phoneData, isLoading, target, title) => {
        if (isLoading) {
            return (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
                    <div className="w-24 h-12 mb-4 animate-pulse">
                        <img src="/phones/gemini-svg.svg" alt="Loading" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-amber-600 font-bold text-sm">Loading...</span>
                </div>
            );
        }

        if (phoneData) {
            const img = phoneData.img || phoneData.image || '/phones/image1-removebg-preview.png';
            return (
                <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative flex flex-col items-center min-h-[250px] sm:min-h-[300px]">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleRemovePhone(target); }}
                        className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition-colors z-10"
                    >
                        <X size={16} strokeWidth={3} />
                    </button>
                    <div className="h-32 sm:h-48 w-full p-2 mb-4 flex items-center justify-center">
                        <img src={img} alt={phoneData.name} className="h-full object-contain drop-shadow-md" />
                    </div>
                    <h3 className="text-sm sm:text-lg font-black text-slate-900 text-center leading-tight mb-2">
                        {phoneData.name}
                    </h3>
                    <p className="text-lg sm:text-2xl font-black text-amber-600 mb-4">
                        ₹{(phoneData.price || phoneData.priceBox || phoneData.priceLarri || 0).toLocaleString('en-IN')}
                    </p>
                    <button 
                        onClick={() => handleSelectPhone(target)}
                        className="w-full mt-auto py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        Change Phone
                    </button>
                </div>
            );
        }

        return (
            <div 
                onClick={() => handleSelectPhone(target)}
                className="bg-white border-2 border-dashed border-slate-200 hover:border-amber-500/50 shadow-sm hover:shadow-md rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-50 min-h-[250px] sm:min-h-[300px] group"
            >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-white transition-colors mb-4 border border-slate-100 group-hover:border-transparent">
                    <Plus size={28} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-wide mb-2">
                    {title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                    Search for a brand or model
                </p>
            </div>
        );
    };

    const extractSpec = (phoneData, keyword) => {
        if (!phoneData) return "-";
        
        // Check variants highlights first if available
        if (phoneData.variants?.[0]?.highlights?.[keyword]) {
            return phoneData.variants[0].highlights[keyword].split('|').join(', ');
        }
        
        // Then check main product highlights array
        if (Array.isArray(phoneData.highlights)) {
             const match = phoneData.highlights.find(h => h.toLowerCase().includes(keyword.toLowerCase()));
             if (match) return match;
        }

        // Check specs string
        const specs = phoneData.specification || phoneData.specifications || "";
        if (typeof specs === 'string') {
            const lines = specs.split('\n');
            for(let line of lines) {
                if(line.toLowerCase().includes(keyword.toLowerCase())) {
                    return line.split(':')[1]?.trim() || line.trim();
                }
            }
        }
        
        return "Not specified";
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[90px] sm:pt-[100px] pb-24 font-['Montserrat',sans-serif] text-slate-900">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 mt-4 sm:mt-8 relative z-10">
                
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                        Find The Perfect Device For You
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                        Select two smartphones to compare their specifications, performance metrics, and pricing side-by-side. Our detailed analysis helps you make the right choice.
                    </p>
                </div>

                {/* Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
                    {renderPhoneSlot(phone1Data, isLoading1, 'phone1', 'Select First Phone')}
                    {renderPhoneSlot(phone2Data, isLoading2, 'phone2', 'Select Second Phone')}

                    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 flex flex-col justify-center">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 border border-amber-100">
                            <Layers size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4">
                            Why Compare?
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    <strong className="text-slate-900">Processor Performance:</strong> See which chip handles gaming and multitasking better.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    <strong className="text-slate-900">Camera Quality:</strong> Compare megapixel counts, sensors, and video capabilities side-by-side.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    <strong className="text-slate-900">Value for Money:</strong> Ensure you get the most features for your specific budget.
                                </p>
                            </li>
                        </ul>
                        <button 
                            onClick={() => navigate.push('/products')}
                            className="mt-8 px-6 py-3 bg-slate-50 border border-slate-200 hover:bg-amber-500 text-slate-600 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between group shadow-sm hover:shadow-md hover:border-amber-500"
                        >
                            Browse All Phones 
                            <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Comparison Table (Only shows if both are selected) */}
                {phone1Data && phone2Data && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
                    >
                        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                            <Sparkles className="text-amber-500" size={20} />
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">Head-to-Head Comparison</h3>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full min-w-[600px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 w-1/4 font-black text-slate-500 uppercase tracking-widest text-xs">Feature</th>
                                        <th className="p-4 w-3/8 font-black text-slate-900 border-l border-slate-200">{phone1Data.name}</th>
                                        <th className="p-4 w-3/8 font-black text-slate-900 border-l border-slate-200">{phone2Data.name}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "Price", render: (p) => `₹${(p.price || p.priceBox || p.priceLarri || 0).toLocaleString('en-IN')}` },
                                        { label: "Processor", render: (p) => extractSpec(p, 'processor') },
                                        { label: "Display", render: (p) => extractSpec(p, 'display') },
                                        { label: "Rear Camera", render: (p) => extractSpec(p, 'rearCamera') || extractSpec(p, 'camera') },
                                        { label: "Front Camera", render: (p) => extractSpec(p, 'frontCamera') },
                                        { label: "Battery", render: (p) => extractSpec(p, 'battery') },
                                        { label: "Storage/RAM", render: (p) => extractSpec(p, 'storage') || extractSpec(p, 'ram') }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30">
                                                {row.label}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-800 border-l border-slate-100 leading-relaxed">
                                                {row.render(phone1Data)}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-800 border-l border-slate-100 leading-relaxed">
                                                {row.render(phone2Data)}
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {/* Pros & Cons Section */}
                                    <tr className="border-b border-slate-100">
                                        <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30 align-top">
                                            Pros
                                        </td>
                                        <td className="p-4 border-l border-slate-100 align-top">
                                            <ul className="space-y-2">
                                                {(Array.isArray(phone1Data.pros) ? phone1Data.pros : []).map((pro, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> 
                                                        <span>{pro}</span>
                                                    </li>
                                                ))}
                                                {(!phone1Data.pros || phone1Data.pros.length === 0) && <span className="text-slate-400 text-sm">Not specified</span>}
                                            </ul>
                                        </td>
                                        <td className="p-4 border-l border-slate-100 align-top">
                                            <ul className="space-y-2">
                                                {(Array.isArray(phone2Data.pros) ? phone2Data.pros : []).map((pro, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> 
                                                        <span>{pro}</span>
                                                    </li>
                                                ))}
                                                {(!phone2Data.pros || phone2Data.pros.length === 0) && <span className="text-slate-400 text-sm">Not specified</span>}
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30 align-top">
                                            Cons
                                        </td>
                                        <td className="p-4 border-l border-slate-100 align-top">
                                            <ul className="space-y-2">
                                                {(Array.isArray(phone1Data.cons) ? phone1Data.cons : []).map((con, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <XCircle size={14} className="text-rose-500 mt-0.5 shrink-0" /> 
                                                        <span>{con}</span>
                                                    </li>
                                                ))}
                                                {(!phone1Data.cons || phone1Data.cons.length === 0) && <span className="text-slate-400 text-sm">Not specified</span>}
                                            </ul>
                                        </td>
                                        <td className="p-4 border-l border-slate-100 align-top">
                                            <ul className="space-y-2">
                                                {(Array.isArray(phone2Data.cons) ? phone2Data.cons : []).map((con, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <XCircle size={14} className="text-rose-500 mt-0.5 shrink-0" /> 
                                                        <span>{con}</span>
                                                    </li>
                                                ))}
                                                {(!phone2Data.cons || phone2Data.cons.length === 0) && <span className="text-slate-400 text-sm">Not specified</span>}
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Compare;
