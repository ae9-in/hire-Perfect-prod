'use client';

import React, { useRef } from 'react';
import Modal from './Modal';
import Button from './Button';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    assessmentTitle: string;
    completionDate: string;
    certificateId: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
    isOpen,
    onClose,
    candidateName,
    assessmentTitle,
    completionDate,
    certificateId,
}) => {
    const certificateRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="flex flex-col items-center">
                {/* Certificate Container */}
                <div
                    ref={certificateRef}
                    className="relative w-full aspect-[1.414/1] bg-white border-[24px] border-slate-950 shadow-2xl overflow-hidden print:border-0 print:shadow-none font-sans"
                    style={{ minHeight: '600px' }}
                >
                    {/* Artistic Background Patterns */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#6366f1_1px,transparent_1px)] bg-[length:30px_30px]"></div>
                        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                    </div>

                    {/* Content Lattice */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center px-24 py-16 text-center">

                        {/* Meta Decals */}
                        <div className="absolute top-12 left-16 text-left opacity-30">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-900 mb-1">Authenticity Token</p>
                            <p className="text-[9px] font-black text-slate-900 font-mono tracking-tighter">{certificateId.toUpperCase()}-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>

                        <div className="absolute top-12 right-16 text-right opacity-30">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-900 mb-1">Timestamp</p>
                            <p className="text-[9px] font-black text-slate-900 font-mono tracking-tighter uppercase">{completionDate}</p>
                        </div>

                        {/* Top Branding */}
                        <div className="mb-12">
                            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <span className="text-white font-black text-2xl">H</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">HirePerfect Network Certification</p>
                        </div>

                        {/* Main Header */}
                        <div className="mb-10">
                            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-4">
                                CERTIFICATE <br /><span className="text-indigo-600">OF MERIT.</span>
                            </h1>
                            <div className="w-24 h-1.5 bg-slate-950 mx-auto rounded-full"></div>
                        </div>

                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic mb-6">This official document validates that</p>

                        {/* Recipient Identity */}
                        <div className="relative mb-10 w-full max-w-lg">
                            <div className="absolute -inset-x-12 top-1/2 h-px bg-slate-100 -z-10"></div>
                            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tight bg-white px-8 inline-block leading-tight">
                                {candidateName}
                            </h2>
                        </div>

                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Has achieved terminal competency in the field of</p>

                        {/* Sector Designation */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.2em] border-2 border-slate-900 px-8 py-3 rounded-xl inline-block">
                                {assessmentTitle}
                            </h3>
                        </div>

                        {/* Authorized Signatures */}
                        <div className="w-full flex justify-between items-end mt-auto">
                            <div className="text-center w-48">
                                <div className="border-b-2 border-slate-200 pb-2 mb-3">
                                    <p className="font-serif italic text-2xl text-slate-900 leading-none">Security Officer</p>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terminal Verification</p>
                            </div>

                            {/* Seal of Excellence */}
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
                                <div className="w-28 h-28 rounded-full border-4 border-slate-950 p-1 relative z-10">
                                    <div className="w-full h-full rounded-full border-2 border-dashed border-slate-950/20 flex items-center justify-center p-2">
                                        <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-white">
                                            <span className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">VALID</span>
                                            <span className="text-[10px] font-black leading-none">2026</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center w-48">
                                <div className="border-b-2 border-slate-200 pb-2 mb-3">
                                    <p className="font-serif italic text-2xl text-slate-900 leading-none underline decoration-indigo-500 decoration-2">Shikhar Singh</p>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Platform Architect</p>
                            </div>
                        </div>

                        {/* Graphic Edge Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-slate-950/5 skew-x-12 -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/5 -skew-x-12 translate-x-16 translate-y-16"></div>
                    </div>
                </div>

                {/* Tactical Actions */}
                <div className="mt-12 flex gap-6 no-print">
                    <Button variant="outline" className="px-8 border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-widest" onClick={onClose}>Exit View</Button>
                    <Button variant="primary" className="px-10 py-5 bg-slate-950 hover:bg-slate-900 text-white uppercase font-black text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-100" onClick={handlePrint}>
                        Secure Export (PDF)
                    </Button>
                </div>

                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        #certificate-overlay, #certificate-overlay * { visibility: visible; }
                        #certificate-overlay {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            height: auto !important;
                        }
                    }
                `}</style>
            </div>
        </Modal>
    );
};

export default CertificateModal;
