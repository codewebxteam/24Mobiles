"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Trash2, Edit, X, Search, Database, ExternalLink, ShieldCheck, Tag } from 'lucide-react';
import useScrollLock from '@/hooks/useScrollLock';
import { db } from '@/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';

const AdminInventory = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter/Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [categories, setCategories] = useState([]);

    useScrollLock(isDeleteModalOpen);

    useEffect(() => {
        const productsRef = collection(db, 'products');
        const categoriesRef = collection(db, 'categories');

        const unsubProducts = onSnapshot(productsRef, (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id
            })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setProducts(productList);
            setIsLoading(false);
        }, (err) => {
            console.error("Products sync error:", err);
            setIsLoading(false);
        });

        const unsubCategories = onSnapshot(categoriesRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id
            }));
            setCategories(list);
        });

        return () => {
            unsubProducts();
            unsubCategories();
        };
    }, []);

    const allBrandOptions = useMemo(() => {
        const dynamicNames = categories.map(c => c.name);
        const productBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
        
        const combined = Array.from(new Set([
            "Select Brand",
            ...dynamicNames,
            ...productBrands
        ]));

        return combined.sort((a, b) => {
            if (a === "Select Brand") return -1;
            if (b === "Select Brand") return 1;
            return a.localeCompare(b);
        });
    }, [categories, products]);

    const filterOptions = useMemo(() => {
        return ["All", ...allBrandOptions.filter(b => b !== "Select Brand")];
    }, [allBrandOptions]);

    const filteredProducts = useMemo(() => {
        let result = products;
        
        if (selectedBrand !== 'All') {
            result = result.filter(p => p.brand === selectedBrand);
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.brand && p.brand.toLowerCase().includes(query))
            );
        }
        
        return result;
    }, [products, selectedBrand, searchQuery]);


    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'products', itemToDelete.firebaseId));
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (err) {
            console.error("Failed to delete phone:", err);
            alert("❌ Failed to delete: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto w-full pb-12">
            
            {/* Header & Controls */}
            <div className="bg-slate-900 rounded-[2rem] shadow-xl border border-white/10 p-6 sm:p-8 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                            <Database className="text-amber-500" />
                            Phone Database
                        </h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">
                            Manage your smartphone affiliate links and specifications. Total Devices: <span className="text-amber-500 font-bold">{products.length}</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search device..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Tag size={16} className="text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="w-full sm:w-48 pl-10 pr-10 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                            >
                                {filterOptions.map((brandName) => (
                                    <option key={brandName} value={brandName}>
                                        {brandName === 'All' ? 'All Brands' : brandName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>


            {/* Data Table */}
            <div className="bg-slate-900 rounded-2xl sm:rounded-[2rem] shadow-xl border border-white/10 overflow-hidden mx-2 sm:mx-0">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-950 border-b border-white/5">
                                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Device</th>
                                <th className="hidden sm:table-cell px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Brand</th>
                                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">MSRP</th>
                                <th className="hidden md:table-cell px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Affiliate Link</th>
                                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-sm font-bold text-slate-400">Loading Database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <Smartphone size={40} className="mb-4 text-slate-600" />
                                            <p className="text-sm font-bold">No Devices Found</p>
                                            <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.firebaseId} className="hover:bg-slate-800/50 transition-colors group">
                                        {/* Device info */}
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-slate-950 border border-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                    <img 
                                                        src={product.img || product.image || product.compressedImage || 'https://via.placeholder.com/150'} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="max-w-[120px] sm:max-w-none">
                                                    <p className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-500 transition-colors truncate">{product.name}</p>
                                                    <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{product.category || 'Smartphone'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Brand */}
                                        <td className="hidden sm:table-cell px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-slate-950 border border-white/5 rounded-lg text-xs font-bold text-slate-300">
                                                {product.brand || 'Unbranded'}
                                            </span>
                                        </td>

                                        {/* MSRP */}
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                            <p className="text-xs sm:text-sm font-black text-emerald-400 tracking-tight">₹{parseFloat(product.price || 0).toLocaleString('en-IN')}</p>
                                            {product.originalPrice && (
                                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 line-through mt-0.5">
                                                    ₹{parseFloat(product.originalPrice).toLocaleString('en-IN')}
                                                </p>
                                            )}
                                        </td>

                                        {/* Affiliate */}
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                {product.affiliateLink ? (
                                                    <a 
                                                        href={product.affiliateLink} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        <ShieldCheck size={14} /> Link Active
                                                    </a>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                                        <X size={14} /> Missing Link
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 sm:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/admin/add-product?editId=${product.firebaseId}`)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} className="sm:w-4 sm:h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}></div>
                    <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 max-w-sm w-full relative z-10 shadow-2xl border border-rose-500/20 animate-scale-up">
                        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-center text-white mb-2">Remove Device</h3>
                        <p className="text-sm text-center text-slate-400 font-medium mb-8">
                            Are you sure you want to remove <span className="text-white font-bold">{itemToDelete?.name}</span>? This will break any existing affiliate links to this page.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-400 bg-slate-950 border border-white/5 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30 disabled:opacity-75"
                            >
                                {isDeleting ? 'Removing...' : 'Remove Device'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-up {
                    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default AdminInventory;
