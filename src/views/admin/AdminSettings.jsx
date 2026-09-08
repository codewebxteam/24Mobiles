"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Store, Bell, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { db } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form states for the settings
    const [formData, setFormData] = useState({
        // General Settings
        platformName: '24mobiles',
        supportEmail: 'admin@24mobiles.com',
        maintenanceMode: false,
        maintenanceMessage: '24mobiles is currently updating the database. We\'ll be back shortly!',
        
        // Notifications
        adminAlertsEmail: 'admin@24mobiles.com'
    });

    useEffect(() => {
        const settingsRef = doc(db, 'store', 'settings');

        const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                setFormData(prev => ({ ...prev, ...snapshot.data() }));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching settings:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'store', 'settings'), formData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'Platform Settings', icon: <Store size={18} /> },
        { id: 'notifications', label: 'Alerts', icon: <Bell size={18} /> },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-slate-900 rounded-[2rem] border border-white/10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            
            {/* Header Area */}
            <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 mb-8 shadow-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-amber-500 border border-white/5">
                        <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Platform Settings</h1>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Global Configuration</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-75 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-6 py-3 rounded-full shadow-lg shadow-emerald-500/20 font-black text-[11px] uppercase tracking-widest flex items-center gap-2"
                    >
                        <CheckCircle2 size={16} />
                        Settings saved successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-5 py-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-amber-500/10 text-amber-500 shadow-sm border border-amber-500/20'
                                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <span className={activeTab === tab.id ? 'text-amber-500' : 'text-slate-500'}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-slate-900 rounded-[2rem] border border-white/10 shadow-xl overflow-hidden"
                        >
                            <div className="p-6 md:p-8 space-y-8">
                                
                                {/* General Settings Tab */}
                                {activeTab === 'general' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-lg font-black text-white mb-6">Footer Contact Details</h2>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Office Address</label>
                                                    <textarea
                                                        name="contactAddress"
                                                        value={formData.contactAddress || ''}
                                                        onChange={handleChange}
                                                        rows="3"
                                                        placeholder="Enter full address..."
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Email</label>
                                                        <input
                                                            type="email"
                                                            name="contactEmail"
                                                            value={formData.contactEmail || ''}
                                                            onChange={handleChange}
                                                            placeholder="contact@example.com"
                                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Phone</label>
                                                        <input
                                                            type="text"
                                                            name="contactPhone"
                                                            value={formData.contactPhone || ''}
                                                            onChange={handleChange}
                                                            placeholder="+91 0000000000"
                                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/5">
                                            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                                                <AlertTriangle size={20} className="text-amber-500" />
                                                Maintenance Mode
                                            </h2>
                                            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white">Enable Maintenance Mode</h3>
                                                        <p className="text-xs font-medium text-slate-500 mt-1">Temporarily block access to the public site.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="maintenanceMode"
                                                            checked={formData.maintenanceMode}
                                                            onChange={handleChange}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                                    </label>
                                                </div>
                                                
                                                {formData.maintenanceMode && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Maintenance Message</label>
                                                        <textarea
                                                            name="maintenanceMessage"
                                                            value={formData.maintenanceMessage}
                                                            onChange={handleChange}
                                                            rows="3"
                                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                                                        ></textarea>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-lg font-black text-white mb-6">System Alerts</h2>
                                            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Email for Errors</label>
                                                <input
                                                    type="email"
                                                    name="adminAlertsEmail"
                                                    value={formData.adminAlertsEmail}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Bottom Action Area */}
                            <div className="p-6 md:p-8 pt-4 border-t border-white/5 bg-slate-950/50 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save All Settings
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
