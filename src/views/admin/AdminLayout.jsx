"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
    PlusSquare,
    Database,
    Tags,
    Settings,
    Search,
    Menu,
    X,
    Smartphone,
    LogOut,
    SmartphoneCharging,
    Image as ImageIcon,
    Newspaper
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({children}) => {
    const navigate = useRouter();
    const location = { pathname: usePathname() };
    const { user, loading, logout } = useAuth();
    const isLoginPage = location.pathname === '/admin/login';
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const searchRef = useRef(null);

    // Auth Guard
    useEffect(() => {
        if (!loading && !user && !isLoginPage) {
            navigate.push('/admin/login');
        }
    }, [user, loading, isLoginPage, navigate]);

    // Fetch data for search
    useEffect(() => {
        if (!user || isLoginPage) return;
        const productsRef = collection(db, 'products');
        const unsubProducts = onSnapshot(productsRef, (snap) => {
            setAllProducts(snap.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                type: 'product'
            })));
        });

        return () => unsubProducts();
    }, [user, isLoginPage]);

    // Search logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = [];

        // Search Products
        const matchedProducts = allProducts.filter(p => 
            (p.name || '').toLowerCase().includes(query) ||
            (p.brand || '').toLowerCase().includes(query) ||
            (p.category || '').toLowerCase().includes(query)
        ).slice(0, 5);
        if (matchedProducts.length > 0) results.push({ title: 'Phones', items: matchedProducts });

        setSearchResults(results);
    }, [searchQuery, allProducts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-bold">Loading Admin...</div>;
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!user) {
        return null;
    }

    const handleSearchItemClick = (item) => {
        navigate.push('/admin?tab=inventory');
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { name: 'Add Phone', id: 'add-product', icon: PlusSquare, path: '/admin/add-product' },
        { name: 'Database', id: 'inventory', icon: Database, path: '/admin/inventory' },
        { name: 'Brands', id: 'categories', icon: Tags, path: '/admin/categories' },
        { name: 'Posters', id: 'posters', icon: ImageIcon, path: '/admin/posters' },
        { name: 'News', id: 'news', icon: Newspaper, path: '/admin/news' },
        { name: 'Settings', id: 'settings', icon: Settings, path: '/admin/settings' }
    ];

    const currentTab = location.pathname.split('/').pop() || 'add-product';

    return (
        <div className="min-h-screen bg-slate-950 flex font-['Montserrat',sans-serif] text-slate-200">
            
            {/* ====== Sidebar (Desktop) ====== */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-white/5 sticky top-0 h-screen overflow-y-auto">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate.push('/')}>
                        <div className="flex items-center gap-3">
                            <img src="/phones/gemini-svg.svg" alt="24mobiles Admin" className="h-10 object-contain filter invert opacity-90" />
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = currentTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate.push(item.path)}
                                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${
                                    isActive 
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                                }`}
                            >
                                <item.icon size={18} className={isActive ? "text-amber-500" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors group border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ====== Mobile Header & Sidebar ====== */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-white/5 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2" onClick={() => navigate.push('/')}>
                    <img src="/phones/gemini-svg.svg" alt="24mobiles Admin" className="h-8 object-contain filter invert opacity-90" />
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                    <Menu size={20} />
                </button>
            </div>

            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 z-[70] shadow-2xl border-r border-white/5 flex flex-col lg:hidden"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/phones/gemini-svg.svg" alt="24mobiles Admin" className="h-10 object-contain filter invert opacity-90" />
                                </div>
                                <button 
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = currentTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                navigate.push(item.path);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${
                                                isActive 
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' 
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                        >
                                            <item.icon size={18} className={isActive ? "text-amber-500" : "text-slate-400"} />
                                            {item.name}
                                        </button>
                                    );
                                })}
                            </nav>
                            
                            <div className="p-4 border-t border-white/5">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Log Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>


            {/* ====== Main Content Area ====== */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-950 pt-16 lg:pt-0">
                
                {/* Topbar */}
                <header className="hidden lg:flex items-center justify-between p-6 bg-slate-900 border-b border-white/5 sticky top-0 z-40">
                    
                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl relative" ref={searchRef}>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search phones or brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
                            />
                        </div>
                        
                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                                >
                                    {searchResults.map((group, idx) => (
                                        <div key={idx} className="p-2">
                                            <div className="px-3 py-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 rounded-lg mb-1">
                                                {group.title}
                                            </div>
                                            {group.items.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSearchItemClick(item)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between group/btn"
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-white mb-0.5">{item.name}</p>
                                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.category}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white leading-tight">{user?.displayName || 'Admin User'}</p>
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-amber-500 font-bold overflow-hidden shadow-sm">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover" />
                                ) : (
                                    user?.email?.charAt(0).toUpperCase() || 'A'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
