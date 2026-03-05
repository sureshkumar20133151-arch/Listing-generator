'use client';

import { Check, Copy, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useState } from 'react';

export interface GeneratedListing {
    title: string;
    bullets: string[];
    description: string;
    backend: string;
    usedKeywords?: string[];
}

interface ListingResultProps {
    result: GeneratedListing | null;
}

export default function ListingResult({ result }: ListingResultProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'title' | 'bullets' | 'description' | 'backend'>('title');

    const copyToClipboard = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadTxt = () => {
        if (!result) return;
        const text = `TITLE\n${result.title}\n\nBULLETS\n${result.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\nDESCRIPTION\n${result.description}\n\nBACKEND SEARCH TERMS\n${result.backend}`;
        downloadFile(text, 'amazon-listing.txt', 'text/plain');
    };

    const handleDownloadDoc = () => {
        if (!result) return;
        const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Amazon Listing</title></head><body><h1>Title</h1><p>${result.title}</p><h2>Bullets</h2><ul>${result.bullets.map(b => `<li>${b}</li>`).join('')}</ul><h2>Description</h2><p>${result.description}</p><h2>Backend Search Terms</h2><p>${result.backend}</p></body></html>`;
        downloadFile(html, 'amazon-listing.doc', 'application/msword');
    };

    const handleDownloadCsv = () => {
        if (!result) return;
        const csv = `Section,Content\nTitle,"${result.title.replace(/"/g, '""')}"\nBullet 1,"${result.bullets[0]?.replace(/"/g, '""') || ''}"\nBullet 2,"${result.bullets[1]?.replace(/"/g, '""') || ''}"\nBullet 3,"${result.bullets[2]?.replace(/"/g, '""') || ''}"\nBullet 4,"${result.bullets[3]?.replace(/"/g, '""') || ''}"\nBullet 5,"${result.bullets[4]?.replace(/"/g, '""') || ''}"\nDescription,"${result.description.replace(/"/g, '""')}"\nBackend Terms,"${result.backend.replace(/"/g, '""')}"`;
        downloadFile(csv, 'amazon-listing.csv', 'text/csv');
    };

    if (!result) return null;

    const Section = ({ title, content, sectionKey, charCount, maxChars, charLabel = 'chars' }: { title: string, content: string | React.ReactNode, sectionKey: string, charCount?: number, maxChars?: number, charLabel?: string }) => (
        <div className="glass-card rounded-2xl p-6 relative group border-t border-l border-white/20 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                        {title}
                    </h3>
                    {charCount !== undefined && maxChars !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded-full ${charCount > maxChars ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                            {charCount}/{maxChars} {charLabel}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => {
                        const textToCopy = Array.isArray(content)
                            ? (content as any[]).map(el => el?.props?.children || '').join('\n')
                            : typeof content === 'string' ? content : '';
                        copyToClipboard(textToCopy, sectionKey);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white flex items-center gap-2 text-sm"
                >
                    {copiedSection === sectionKey ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copiedSection === sectionKey ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className="text-gray-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {content}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 glass-card p-4 rounded-2xl border-purple-500/20">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setActiveTab('title')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'title' ? 'bg-purple-500/30 text-purple-200' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>Title</button>
                    <button onClick={() => setActiveTab('bullets')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'bullets' ? 'bg-purple-500/30 text-purple-200' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>Bullets</button>
                    <button onClick={() => setActiveTab('description')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'description' ? 'bg-purple-500/30 text-purple-200' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>Description</button>
                    <button onClick={() => setActiveTab('backend')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'backend' ? 'bg-purple-500/30 text-purple-200' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>Backend Terms</button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={handleDownloadTxt} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" title="Download .txt">
                        <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={handleDownloadDoc} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" title="Download .doc">
                        <File className="w-4 h-4" />
                    </button>
                    <button onClick={handleDownloadCsv} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" title="Download .csv">
                        <FileSpreadsheet className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'title' && (
                    <Section
                        title="TITLE"
                        sectionKey="title"
                        charCount={result.title.length}
                        maxChars={200}
                        content={<p className="font-medium text-white">{result.title}</p>}
                    />
                )}

                {activeTab === 'bullets' && (
                    <Section
                        title="BULLETS"
                        sectionKey="bullets"
                        content={
                            <ul className="space-y-3 list-none">
                                {result.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex gap-3 items-start">
                                        <span className="text-purple-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                                        <span className="flex-1">{bullet}</span>
                                        <span className={`shrink-0 text-xs px-2 py-1 rounded-full mt-0.5 ${bullet.length > 200 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                            {bullet.length}/200 chars
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        }
                    />
                )}

                {activeTab === 'description' && (
                    <Section
                        title="DESCRIPTION"
                        sectionKey="description"
                        charCount={result.description.length}
                        maxChars={2000}
                        content={<p>{result.description}</p>}
                    />
                )}

                {activeTab === 'backend' && (
                    <Section
                        title="BACKEND SEARCH TERMS"
                        sectionKey="backend"
                        charCount={new Blob([result.backend]).size}
                        maxChars={249}
                        charLabel="bytes"
                        content={<p className="font-mono text-sm text-indigo-200">{result.backend}</p>}
                    />
                )}
            </div>

            {result.usedKeywords && result.usedKeywords.length > 0 && (
                <div className="glass-card rounded-2xl p-6 mt-4 opacity-90">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Suggested Keywords Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.usedKeywords.map((kw, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

