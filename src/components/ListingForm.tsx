'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ListingFormData {
    productName: string;
    brandName: string;
    marketplace: string;
    keywordData: string;
}

interface ListingFormProps {
    onSubmit: (data: ListingFormData) => void;
    isLoading: boolean;
}

export default function ListingForm({ onSubmit, isLoading }: ListingFormProps) {
    const [formData, setFormData] = useState<ListingFormData>({
        productName: '',
        brandName: '',
        marketplace: 'Amazon US',
        keywordData: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const csvStr = XLSX.utils.sheet_to_csv(worksheet);

                setFormData(prev => ({ ...prev, keywordData: csvStr }));
            } catch (error) {
                console.error("Error parsing file:", error);
                alert("Failed to parse the uploaded file. Please ensure it is a valid Excel or CSV file.");
            }
        };
        reader.readAsArrayBuffer(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productName || !formData.brandName || !formData.keywordData) return;
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    Listing Details
                </h2>
                <p className="text-gray-300 text-sm">Enter your product information and Helium 10 keywords to generate an optimized listing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-200 ml-1">Product Name</label>
                    <input
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        placeholder="e.g. Kids Ear Muffs"
                        className="glass-input"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-200 ml-1">Brand Name</label>
                    <input
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        placeholder="e.g. CozyKids"
                        className="glass-input"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-200 ml-1">Marketplace</label>
                <select
                    name="marketplace"
                    value={formData.marketplace}
                    onChange={handleChange}
                    className="glass-input"
                    disabled={isLoading}
                >
                    <option value="Amazon US">Amazon US</option>
                    <option value="Amazon UK">Amazon UK</option>
                    <option value="Amazon IN">Amazon India</option>
                    <option value="Amazon DE">Amazon DE</option>
                </select>
            </div>

            <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                    <label className="text-sm font-medium text-gray-200 ml-1">Keyword Data (Paste or Upload Helium 10 Export)</label>
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors border border-purple-500/30 disabled:opacity-50 shrink-0"
                    >
                        <UploadCloud className="w-4 h-4" />
                        Upload Excel/CSV
                    </button>
                </div>
                <textarea
                    name="keywordData"
                    value={formData.keywordData}
                    onChange={handleChange}
                    placeholder="Paste your keywords and search volumes here, or upload your Excel/CSV export file directly..."
                    className="glass-input min-h-[160px] resize-y"
                    required
                    disabled={isLoading}
                />
                {fileName && <p className="text-xs text-emerald-400 ml-1">Loaded from: {fileName}</p>}
            </div>

            <button
                type="submit"
                disabled={isLoading || !formData.productName || !formData.brandName || !formData.keywordData}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px] font-semibold text-white shadow-lg transition-all hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
                <span className="flex items-center justify-center gap-2 h-full w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 transition-all">
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Listing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate Magic Listing
                        </>
                    )}
                </span>
            </button>
        </form>
    );
}
