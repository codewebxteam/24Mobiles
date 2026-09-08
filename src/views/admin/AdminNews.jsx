"use client";
import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Trash2, Image as ImageIcon, Link as LinkIcon, AlertCircle, Type, AlignLeft } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.85) => {
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

const AdminNews = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [link, setLink] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNewsItems(list);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const base64 = await compressImage(file);
            setPreviewUrl(base64);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!previewUrl) {
            alert('Please select a cover image for the news article.');
            return;
        }
        if (!title.trim() || !content.trim()) {
            alert('Title and Content are required.');
            return;
        }

        setIsUploading(true);
        try {
            // Upload Image to API
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    file: previewUrl, 
                    fileName: `news-${Date.now()}.webp`
                })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to upload image');
            
            // Save News to Firestore
            await addDoc(collection(db, 'news'), {
                title,
                content,
                link,
                imgUrl: data.url,
                createdAt: new Date().toISOString()
            });

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setTitle('');
            setContent('');
            setLink('');
            alert('News published successfully!');
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this news article? It will be removed instantly.")) {
            try {
                await deleteDoc(doc(db, 'news', id));
            } catch (error) {
                console.error("Failed to delete news:", error);
                alert("Delete failed: " + error.message);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full pb-12">
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden mb-8">
                <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white">Manage News & Articles</h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">Publish the latest updates, launches, and tech news for your customers.</p>
                    </div>
                </div>

                <div className="p-5 md:p-8">
                    <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Upload Area */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Cover Image</label>
                            <div className="border-2 border-dashed border-white/10 rounded-2xl overflow-hidden bg-slate-950/50 hover:bg-slate-800 transition-colors relative aspect-[16/9] flex items-center justify-center shadow-inner mb-4">
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => { setPreviewUrl(''); setSelectedFile(null); }}
                                            className="absolute top-3 right-3 bg-slate-900/80 text-white rounded-full p-2 hover:bg-rose-500 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500 w-full h-full justify-center">
                                        <ImageIcon size={48} className="mb-4 text-slate-600" />
                                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Select Image</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            required 
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-amber-500 font-bold text-sm">Image Guidelines</h4>
                                    <p className="text-amber-500/80 text-xs mt-1">Use high-quality images. Recommended aspect ratio is 16:9 (e.g., 1280x720px).</p>
                                </div>
                            </div>
                        </div>

                        {/* Details & Submit */}
                        <div className="flex flex-col space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Headline / Title</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Type className="text-slate-500" size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. iPhone 16 Pro Max Launched in India!"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Content / Summary</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                                        <AlignLeft className="text-slate-500" size={18} />
                                    </div>
                                    <textarea 
                                        placeholder="Write your news article or a short summary here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Source Link (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LinkIcon className="text-slate-500" size={18} />
                                    </div>
                                    <input 
                                        type="url" 
                                        placeholder="https://... (Link to full article if external)"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isUploading || !previewUrl || !title || !content}
                                className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 mt-auto"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} strokeWidth={2.5} /> Publish News
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Active News Grid */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 font-['Montserrat',sans-serif]">Published Articles ({newsItems.length})</h3>
                {newsItems.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-slate-200 flex flex-col items-center justify-center text-center">
                        <ImageIcon size={48} className="text-slate-300 mb-4" />
                        <h4 className="text-lg font-bold text-slate-800">No news published yet</h4>
                        <p className="text-slate-500 text-sm mt-1 max-w-sm">Publish your first article using the form above. It will appear on the public News page.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsItems.map((news) => (
                            <div key={news.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
                                <div className="aspect-[16/9] relative bg-slate-100 shrink-0">
                                    <img src={news.imgUrl} alt={news.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDelete(news.id)}
                                            className="bg-rose-500 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-rose-600 transition-colors shadow-lg"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">
                                        {new Date(news.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-tight">{news.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-3 mb-4">{news.content}</p>
                                    
                                    {news.link && (
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                                            <LinkIcon size={14} className="text-slate-400 shrink-0" />
                                            <a href={news.link} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-700 truncate font-bold">
                                                External Link
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNews;
