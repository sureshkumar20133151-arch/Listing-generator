'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export interface GeneratedListing {
    title: string;
    bullets: string[];
    description: string;
    backend: string;
}

interface ListingResultProps {
    result: GeneratedListing | null;
}

export default function ListingResult({ result }: ListingResultProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const copyToClipboard = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    if (!result) return null;

    const Section = ({ title, content, sectionKey, charCount, maxChars, charLabel = 'chars' }: { title: string, content: string | React.ReactNode, sectionKey: string, charCount?: number, maxChars?: number, charLabel?: string }) => (
        <div className="glass-card rounded-2xl p-6 relative group border-t border-l border-white/20">
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
            <Section
                title="TITLE"
                sectionKey="title"
                charCount={result.title.length}
                maxChars={200}
                content={<p className="font-medium text-white">{result.title}</p>}
            />

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

            <Section
                title="DESCRIPTION"
                sectionKey="description"
                charCount={result.description.length}
                maxChars={2000}
                content={<p>{result.description}</p>}
            />

            <Section
                title="BACKEND SEARCH TERMS"
                sectionKey="backend"
                charCount={new Blob([result.backend]).size}
                maxChars={250}
                charLabel="bytes"
                content={<p className="font-mono text-sm text-indigo-200">{result.backend}</p>}
            />
        </div>
    );
}
