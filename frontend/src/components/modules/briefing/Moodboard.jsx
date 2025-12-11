import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';

export default function Moodboard({ images = [], onChange, readOnly = false }) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        if (readOnly) return;
        // In a real app, we would upload to server here.
        // For now, we'll create object URLs for preview.
        const newImages = Array.from(files).map(file => ({
            url: URL.createObjectURL(file), // Temporary preview
            file: file,
            caption: file.name
        }));
        onChange([...images, ...newImages]);
    };

    const removeImage = (index) => {
        if (readOnly) return;
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    const updateCaption = (index, text) => {
        if (readOnly) return;
        const newImages = [...images];
        newImages[index].caption = text;
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <div key={idx} className="group relative aspect-square bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                                {!readOnly && (
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="w-full">
                                {readOnly ? (
                                    <p className="text-white text-xs truncate max-w-full px-1">{img.caption}</p>
                                ) : (
                                    <input
                                        type="text"
                                        value={img.caption}
                                        onChange={(e) => updateCaption(idx, e.target.value)}
                                        className="w-full bg-black/40 text-white text-xs rounded px-2 py-1 outline-none border border-transparent focus:border-primary/50"
                                        placeholder="Caption..."
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Upload Button */}
                {!readOnly && (
                    <div
                        className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface-hover'}
            `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('moodboard-upload').click()}
                    >
                        <input
                            id="moodboard-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleChange}
                        />
                        <div className="p-3 rounded-full bg-surface shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Plus size={24} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium text-text-secondary group-hover:text-primary">Add Image</span>
                        <span className="text-xs text-text-secondary mt-1 opacity-70">or drop here</span>
                    </div>
                )}
            </div>
        </div>
    );
}
