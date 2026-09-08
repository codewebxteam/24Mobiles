"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BoxSelect, Smartphone, X, ImagePlus } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        width = maxHeight; // Fixed from previous compressImage which used height = maxHeight
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/webp', quality);
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const AdminCategories = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newBrandName, setNewBrandName] = useState('');
    const [newBrandImage, setNewBrandImage] = useState('');
    const [brandImageFile, setBrandImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const catRef = collection(db, 'categories'); 
        const prodRef = collection(db, 'products');

        const unsubCategories = onSnapshot(catRef, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id
            })));
            setIsLoading(false);
        });

        const unsubProducts = onSnapshot(prodRef, (snapshot) => {
            setProducts(snapshot.docs.map(doc => doc.data()));
        });

        return () => {
            unsubCategories();
            unsubProducts();
        };
    }, []);

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setNewBrandName('');
        setNewBrandImage('');
        setBrandImageFile(null);
        setIsCatModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setNewBrandName(category.name || '');
        setNewBrandImage(category.image || '');
        setBrandImageFile(null);
        setIsCatModalOpen(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        
        let imageUrl = newBrandImage;

        if (brandImageFile) {
            try {
                const base64File = await compressImage(brandImageFile);
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        file: base64File, 
                        fileName: `brand-${Date.now()}.webp`
                    })
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to upload image');
                
                imageUrl = data.url;
            } catch (err) {
                console.error("Image upload failed:", err);
                alert("⚠️ Logo upload failed: " + err.message);
                setIsUploading(false);
                return;
            }
        }
        
        const dataToSave = {
            name: newBrandName,
            image: imageUrl,
            status: 'Active'
        };

        try {
            if (selectedCategory) {
                await updateDoc(doc(db, 'categories', selectedCategory.firebaseId), dataToSave);
            } else {
                await addDoc(collection(db, 'categories'), {
                    ...dataToSave,
                    createdAt: new Date().toISOString()
                });
            }
            setIsCatModalOpen(false);
        } catch (err) {
            console.error("Error saving brand:", err);
            alert("Failed to save brand");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBrandImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => setNewBrandImage(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteCategory = async (firebaseId) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                await deleteDoc(doc(db, 'categories', firebaseId));
            } catch (err) {
                alert("Deletion failed");
            }
        }
    };

    const getProductCount = (categoryName) => {
        return products.filter(p => p.brand === categoryName || p.category === categoryName).length;
    };

    const filteredCategories = categories.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto w-full pb-12">
            
            {/* Header Section */}
            <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 mb-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-amber-500 border border-white/5">
                        <BoxSelect size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Smartphone Brands</h1>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Brand Management Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAddCategory}
                        className="w-full md:w-auto flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Brand
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-slate-900 rounded-[2rem] border border-white/10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Brands...</p>
                </div>
            ) : (
                <>
                    {/* Search Bar */}
                    <div className="mb-6 relative w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-600 transition-all"
                        />
                    </div>

                    {/* Brands Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((cat) => (
                            <div key={cat.firebaseId} className="bg-slate-900 border border-white/10 rounded-[1.5rem] p-6 hover:border-amber-500/30 transition-all group flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center overflow-hidden p-2">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <BoxSelect size={24} className="text-slate-700" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEditCategory(cat)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCategory(cat.firebaseId)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-auto">
                                    <h3 className="text-lg font-black text-white mb-1">{cat.name}</h3>
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                        <Smartphone size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getProductCount(cat.name)} Devices Linked</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 rounded-[2rem] border border-white/10">
                            <BoxSelect size={40} className="text-slate-600 mb-4" />
                            <p className="text-sm font-bold text-slate-400">No brands found.</p>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCatModalOpen(false)}></div>
                    <div className="bg-slate-900 rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl border border-white/10">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-black text-white">{selectedCategory ? 'Edit Brand' : 'Add New Brand'}</h2>
                            <button onClick={() => setIsCatModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Brand Name</label>
                                <input 
                                    type="text" 
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="e.g. Apple, Samsung"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Brand Logo (Optional)</label>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-800 transition-colors cursor-pointer relative overflow-hidden group">
                                    {newBrandImage ? (
                                        <div className="relative w-full h-24 flex items-center justify-center">
                                            <img src={newBrandImage} alt="Preview" className="h-full w-auto object-contain drop-shadow-md" />
                                            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                                    <Edit2 size={14} /> Change Logo
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-4 text-slate-500 group-hover:text-amber-500 transition-colors">
                                            <ImagePlus size={28} className="mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Logo</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isUploading}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-xl uppercase tracking-widest text-[11px] transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
                            >
                                {isUploading && <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>}
                                {isUploading ? 'Saving...' : selectedCategory ? 'Update Brand' : 'Save Brand'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
