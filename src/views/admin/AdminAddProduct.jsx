"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Smartphone, Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';

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
                        height = maxHeight;
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

const AdminAddProduct = () => {
    const initialState = {
        name: '', price: '', originalPrice: '', affiliateLink: '', description: '', images: [], brand: 'Select Brand', specification: '', highlights: '', pros: '', cons: '', compressedImages: [], isProcessingImage: false, variants: []
    };
    const [newProduct, setNewProduct] = useState(initialState);
    const [isPublishing, setIsPublishing] = useState(false);
    const [categories, setCategories] = useState([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams ? searchParams.get('editId') : null;

    useEffect(() => {
        const fetchProduct = async () => {
            if (editId) {
                try {
                    const docRef = doc(db, 'products', editId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        
                        setNewProduct({
                            ...initialState,
                            ...data,
                            compressedImages: data.gallery && data.gallery.length > 0 ? data.gallery : (data.img ? [data.img] : []),
                            images: [], 
                            highlights: Array.isArray(data.highlights) ? data.highlights.join(', ') : (data.highlights || ''),
                            pros: Array.isArray(data.pros) ? data.pros.join(', ') : (data.pros || ''),
                            cons: Array.isArray(data.cons) ? data.cons.join(', ') : (data.cons || '')
                        });
                    }
                } catch (error) {
                    console.error("Error fetching product to edit:", error);
                }
            }
        };
        fetchProduct();
    }, [editId]);

    useEffect(() => {
        const categoriesRef = collection(db, 'categories');
        const unsubCategories = onSnapshot(categoriesRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id
            }));
            setCategories(list);
            if (list.length > 0) {
                setNewProduct(prev => ({ ...prev, brand: prev.brand || list[0].name }));
            }
        });
        return () => unsubCategories();
    }, []);

    const allBrandOptions = useMemo(() => {
        const dynamicNames = categories.map(c => c.name);
        const combined = Array.from(new Set([
            "Select Brand",
            ...dynamicNames
        ]));

        return combined.sort((a, b) => {
            if (a === "Select Brand") return -1;
            if (b === "Select Brand") return 1;
            return a.localeCompare(b);
        });
    }, [categories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewProduct(prev => ({ ...prev, isProcessingImage: true }));
            try {
                const compressedPromises = files.map(file => compressImage(file));
                const compressedResults = await Promise.all(compressedPromises);
                
                setNewProduct(prev => ({ 
                    ...prev, 
                    images: [...(prev.images || []), ...files],
                    compressedImages: [...(prev.compressedImages || []), ...compressedResults],
                    isProcessingImage: false 
                }));
            } catch (err) {
                console.error("Image processing failed:", err);
                setNewProduct(prev => ({ ...prev, isProcessingImage: false }));
            }
        }
    };

    const removeImage = (index) => {
        setNewProduct(prev => {
            const newImages = [...prev.images];
            const newCompressed = [...prev.compressedImages];
            newImages.splice(index, 1);
            newCompressed.splice(index, 1);
            return { ...prev, images: newImages, compressedImages: newCompressed };
        });
    };

    const handleAddVariant = () => {
        setNewProduct(prev => {
            const currentVariants = prev.variants || [];
            let newHighlights = {
                storage: '',
                processor: '',
                rearCamera: '',
                frontCamera: '',
                display: '',
                battery: '',
                custom: []
            };

            // If there's an existing variant, copy its highlights
            if (currentVariants.length > 0) {
                const lastVariantHighlights = currentVariants[currentVariants.length - 1].highlights;
                if (lastVariantHighlights) {
                    newHighlights = {
                        ...lastVariantHighlights,
                        // Deep clone custom highlights to avoid reference issues
                        custom: lastVariantHighlights.custom ? lastVariantHighlights.custom.map(c => ({ ...c })) : []
                    };
                }
            }

            return {
                ...prev,
                variants: [...currentVariants, { 
                    name: '', 
                    price: '', 
                    originalPrice: '',
                    isExpanded: true,
                    highlights: newHighlights
                }]
            };
        });
    };

    const handleVariantHighlightChange = (variantIndex, field, value) => {
        setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            // Ensure highlights object exists (for backward compatibility during edit)
            if (!updatedVariants[variantIndex].highlights) {
                updatedVariants[variantIndex].highlights = { storage: '', processor: '', rearCamera: '', frontCamera: '', display: '', battery: '', custom: [] };
            }
            updatedVariants[variantIndex].highlights[field] = value;
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleAddCustomHighlight = (variantIndex) => {
        setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            if (!updatedVariants[variantIndex].highlights) {
                updatedVariants[variantIndex].highlights = { storage: '', processor: '', rearCamera: '', frontCamera: '', display: '', battery: '', custom: [] };
            }
            if (!updatedVariants[variantIndex].highlights.custom) {
                updatedVariants[variantIndex].highlights.custom = [];
            }
            updatedVariants[variantIndex].highlights.custom.push({ type: '', details: '' });
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleCustomHighlightChange = (variantIndex, customIndex, field, value) => {
        setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            updatedVariants[variantIndex].highlights.custom[customIndex][field] = value;
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleRemoveCustomHighlight = (variantIndex, customIndex) => {
         setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            updatedVariants[variantIndex].highlights.custom.splice(customIndex, 1);
            return { ...prev, variants: updatedVariants };
        });
    };

    const toggleVariantExpand = (index) => {
        setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            updatedVariants[index].isExpanded = !updatedVariants[index].isExpanded;
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleVariantChange = (index, field, value) => {
        setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            updatedVariants[index][field] = value;
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleRemoveVariant = (index) => {
        setNewProduct(prev => {
            const updatedVariants = [...prev.variants];
            updatedVariants.splice(index, 1);
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        
        if (!newProduct.name || !newProduct.brand || !newProduct.affiliateLink) {
            alert("⚠️ Please fill all required fields (Name, Brand, Affiliate Link).");
            return;
        }

        if (!newProduct.variants || newProduct.variants.length === 0) {
            alert("⚠️ Please add at least one product variant (Name and Price are required).");
            return;
        }

        const priceNum = parseFloat(newProduct.variants[0].price) || 0;
        const originalPriceNum = parseFloat(newProduct.variants[0].originalPrice) || 0;

        setIsPublishing(true);

        let galleryUrls = [];
        const base64Files = newProduct.compressedImages || [];
        
        if (base64Files.length > 0) {
            try {
                for (let i = 0; i < base64Files.length; i++) {
                    const base64File = base64Files[i];
                    
                    if (base64File.startsWith('http')) {
                        galleryUrls.push(base64File);
                    } else {
                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                file: base64File, 
                                fileName: `phone-${Date.now()}-${i}.webp`
                            })
                        });
                        
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || 'Failed to upload image');
                        
                        galleryUrls.push(data.url);
                    }
                }
            } catch (err) {
                console.error("ImageKit upload failed:", err);
                alert("⚠️ Image upload failed: " + err.message);
                setIsPublishing(false);
                return;
            }
        }

        const productData = {
            name: newProduct.name,
            price: priceNum,
            originalPrice: originalPriceNum,
            affiliateLink: newProduct.affiliateLink,
            description: newProduct.description,
            brand: newProduct.brand,
            img: galleryUrls.length > 0 ? galleryUrls[0] : '',
            gallery: galleryUrls,
            specification: newProduct.specification || '',
            highlights: newProduct.highlights || '',
            pros: newProduct.pros || '',
            cons: newProduct.cons || '',
            category: newProduct.brand, // Aligning category with brand
            variants: newProduct.variants || [],
            createdAt: new Date().toISOString()
        };

        try {
            if (editId) {
                const { createdAt, ...updateData } = productData;
                await updateDoc(doc(db, 'products', editId), updateData);
                alert("✅ Phone Updated Successfully!");
                router.push('/admin/inventory');
            } else {
                await addDoc(collection(db, 'products'), productData);
                alert("✅ Phone Added Successfully to Database!");
                setNewProduct(initialState);
            }
        } catch (err) {
            console.error("Add product failed:", err);
            alert("❌ Failed to add phone: " + err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full pb-12">
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white">{editId ? 'Edit Smartphone' : 'Add New Smartphone'}</h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">{editId ? 'Update details of an existing device.' : 'Upload a new device to the affiliate database.'}</p>
                    </div>
                </div>

                <form onSubmit={handleAddProductSubmit} className="p-5 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: Image Upload */}
                        <div className="lg:col-span-1 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Device Images (Multiple)</label>
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 min-h-72 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-800 transition-colors relative shadow-inner">
                                    {newProduct.isProcessingImage ? (
                                        <div className="flex flex-col items-center gap-3 w-full h-full justify-center min-h-[16rem]">
                                            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-bold text-amber-500">Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {newProduct.compressedImages && newProduct.compressedImages.length > 0 ? (
                                                <div className="w-full grid grid-cols-2 gap-4">
                                                    {newProduct.compressedImages.map((src, idx) => (
                                                        <div key={idx} className="relative group/img rounded-lg overflow-hidden border border-white/10 aspect-square bg-slate-900 flex items-center justify-center">
                                                            <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-contain p-2 drop-shadow-xl" />
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                                                                className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="relative group/add rounded-lg border-2 border-dashed border-white/10 aspect-square bg-slate-950/30 hover:bg-slate-800 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden">
                                                        <Plus size={24} className="text-slate-500 group-hover/add:text-amber-500 mb-2 transition-colors" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Add More</span>
                                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-500 hover:text-amber-500 transition-colors cursor-pointer w-full h-full justify-center min-h-[16rem] relative">
                                                    <Smartphone size={40} className="mb-4" />
                                                    <span className="text-sm font-bold uppercase tracking-widest">Upload Renders</span>
                                                    <span className="text-[10px] font-bold text-slate-600 mt-2">WEBP, PNG or JPG (Multiple allowed)</span>
                                                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Affiliate Link <span className="text-amber-500">*</span></label>
                                <input
                                    type="url"
                                    name="affiliateLink"
                                    value={newProduct.affiliateLink}
                                    onChange={handleInputChange}
                                    placeholder="https://amazon.in/dp/..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Key Highlights <span className="text-slate-500 font-normal text-xs">(Comma separated)</span></label>
                                <textarea
                                    name="highlights"
                                    value={newProduct.highlights}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="e.g. Snapdragon 8 Gen 3, 50MP Camera, 120Hz AMOLED"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none custom-scrollbar placeholder:text-slate-600"
                                ></textarea>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Device Name <span className="text-amber-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newProduct.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Samsung Galaxy S24 Ultra"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Brand <span className="text-amber-500">*</span></label>
                                    <select
                                        name="brand"
                                        value={newProduct.brand}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none"
                                    >
                                        {allBrandOptions.length > 0 ? (
                                            allBrandOptions.map((brandName) => (
                                                <option key={brandName} value={brandName}>
                                                    {brandName}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No Brands Available</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Prices row removed as requested; price is now entirely variant-based */}

                            {/* Variants Section */}
                            <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-slate-300">Product Variants <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddVariant}
                                        className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Variant
                                    </button>
                                </div>
                                
                                {newProduct.variants && newProduct.variants.length > 0 && (
                                    <div className="space-y-3">
                                        {newProduct.variants.map((variant, index) => (
                                            <div key={index} className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
                                                {/* Header Row */}
                                                <div className="p-3 grid grid-cols-12 gap-3 items-center">
                                                    <div className="col-span-4">
                                                        <input
                                                            type="text"
                                                            value={variant.name}
                                                            onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                                            placeholder="Name (128 GB)"
                                                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                            placeholder="Price (₹)"
                                                            min="0"
                                                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input
                                                            type="number"
                                                            value={variant.originalPrice}
                                                            onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)}
                                                            placeholder="MSRP (₹)"
                                                            min="0"
                                                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleVariantExpand(index)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                                        >
                                                            {variant.isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariant(index)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {variant.isExpanded && (
                                                    <div className="p-4 border-t border-white/5 bg-slate-950/30">
                                                        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Specific Highlights</h4>
                                                        
                                                        {/* Standard Highlights */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                            {[
                                                                { key: 'storage', label: 'Storage / ROM', placeholder: 'e.g. 512 GB ROM | Store upto 10000 photos' },
                                                                { key: 'processor', label: 'Processor', placeholder: 'e.g. A16 Bionic Chip, 6 Core' },
                                                                { key: 'rearCamera', label: 'Rear Camera', placeholder: 'e.g. 48MP + 12MP Rear Camera' },
                                                                { key: 'frontCamera', label: 'Front Camera', placeholder: 'e.g. 12MP Front Camera' },
                                                                { key: 'display', label: 'Display', placeholder: 'e.g. 6.1 inch All Screen OLED' },
                                                                { key: 'battery', label: 'Battery', placeholder: 'e.g. 3349 mAh | Long Battery Life' }
                                                            ].map((field) => (
                                                                <div key={field.key}>
                                                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{field.label}</label>
                                                                    <input
                                                                        type="text"
                                                                        value={variant.highlights?.[field.key] || ''}
                                                                        onChange={(e) => handleVariantHighlightChange(index, field.key, e.target.value)}
                                                                        placeholder={field.placeholder}
                                                                        className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Custom Highlights */}
                                                        {variant.highlights?.custom?.length > 0 && (
                                                            <div className="space-y-2 mb-3">
                                                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Custom Highlights</h4>
                                                                {variant.highlights.custom.map((customHighlight, cIdx) => (
                                                                    <div key={cIdx} className="flex gap-2 items-center">
                                                                        <input
                                                                            type="text"
                                                                            value={customHighlight.type}
                                                                            onChange={(e) => handleCustomHighlightChange(index, cIdx, 'type', e.target.value)}
                                                                            placeholder="Type (e.g. Network)"
                                                                            className="w-1/3 bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={customHighlight.details}
                                                                            onChange={(e) => handleCustomHighlightChange(index, cIdx, 'details', e.target.value)}
                                                                            placeholder="Details (e.g. 5G Supported)"
                                                                            className="w-2/3 bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveCustomHighlight(index, cIdx)}
                                                                            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleAddCustomHighlight(index)}
                                                            className="text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                                                        >
                                                            <Plus size={10} /> Add Custom Highlight
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Removed Pros, Cons, and Editor's Review as per request */}

                            {/* Removed Detailed Specifications as all specs are now variant-specific */}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => editId ? router.push('/admin/inventory') : setNewProduct(initialState)}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {editId ? 'Cancel' : 'Clear Form'}
                        </button>
                        <button
                            type="submit"
                            disabled={isPublishing}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-3 rounded-xl text-sm font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] disabled:opacity-75 uppercase tracking-widest flex items-center gap-2"
                        >
                            {isPublishing ? (editId ? 'Updating...' : 'Uploading...') : (editId ? 'Update Product' : 'Publish to Database')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAddProduct;
