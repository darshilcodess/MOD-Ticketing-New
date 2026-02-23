import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Loader2, ChevronRight, FileCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '../services/api';

// Available templates
const TEMPLATES = [
    {
        id: 'voucher',
        name: 'Receipt, Issue & Expense Voucher',
        description: 'Standard issue/receipt voucher for equipment and supply transfers',
        icon: '📄',
    },
];

const EMPTY_VOUCHER = {
    iv_no: '',
    unit_iv: '',
    stn_iv: '',
    date_iv: '',
    rv_no: '',
    unit_rv: '',
    stn_rv: '',
    date_rv: '',
    issued_to: '',
    compliance: '',
    auth: '',
    items: [{ part_no: '', nomenclature: '', total: '', remarks: '' }],
};

export default function VoucherModal({ onClose, ticketId }) {
    const [step, setStep] = useState('select'); // 'select' | 'fill'
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState(EMPTY_VOUCHER);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setStep('fill');
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateItem = (index, field, value) => {
        setFormData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, items };
        });
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { part_no: '', nomenclature: '', total: '', remarks: '' }],
        }));
    };

    const removeItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        try {
            // Include ticket_id in the payload
            const payload = {
                ...formData,
                ticket_id: ticketId
            };

            const { data } = await api.post('/documents/voucher', payload);

            // Build the download URL and open PDF in a new tab
            const baseURL = api.defaults.baseURL || 'http://localhost:8000/api/v1';
            const pdfUrl = `${baseURL}/documents/voucher/${data.file_id}`;

            // Log for debugging
            console.log('Opening PDF at:', pdfUrl);

            // Try to open in new tab
            const newWindow = window.open(pdfUrl, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Pop-up blocked, notify user or fallback
                setError('Pop-up was blocked. Please allow pop-ups or use the link in the ticket details.');
            } else {
                onClose();
            }
        } catch (err) {
            console.error('Voucher generation failed:', err);
            setError(err.response?.data?.detail || 'Failed to generate voucher. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <FileText className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Generate Document</h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                {step === 'select' ? 'Select a document template' : selectedTemplate?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step: Template Selection */}
                {step === 'select' && (
                    <div className="p-6 space-y-3 overflow-y-auto">
                        <p className="text-sm text-slate-500 mb-4">Choose the document type you want to generate:</p>
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 text-left group"
                            >
                                <span className="text-3xl">{template.icon}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 group-hover:text-orange-700">{template.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Step: Fill Details */}
                {step === 'fill' && (
                    <div className="overflow-y-auto flex-1 p-6 space-y-6">
                        {/* IV / RV header row */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Voucher Header Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-orange-600 uppercase">Issue Voucher (IV)</p>
                                    {[
                                        { label: 'IV No.', key: 'iv_no', placeholder: 'e.g. IV-2024-001' },
                                        { label: 'Unit', key: 'unit_iv', placeholder: 'e.g. 101 EME Bn' },
                                        { label: 'Station', key: 'stn_iv', placeholder: 'e.g. Delhi Cantt' },
                                        { label: 'Date', key: 'date_iv', placeholder: 'e.g. 15 Feb 2025' },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key} className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">{label}</label>
                                            <Input
                                                placeholder={placeholder}
                                                value={formData[key]}
                                                onChange={(e) => updateField(key, e.target.value)}
                                                className="text-sm h-8 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-blue-600 uppercase">Receipt Voucher (RV)</p>
                                    {[
                                        { label: 'RV No.', key: 'rv_no', placeholder: 'e.g. RV-2024-001' },
                                        { label: 'Unit', key: 'unit_rv', placeholder: 'e.g. 202 Arty Bde' },
                                        { label: 'Station', key: 'stn_rv', placeholder: 'e.g. Pune' },
                                        { label: 'Date', key: 'date_rv', placeholder: 'e.g. 15 Feb 2025' },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key} className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">{label}</label>
                                            <Input
                                                placeholder={placeholder}
                                                value={formData[key]}
                                                onChange={(e) => updateField(key, e.target.value)}
                                                className="text-sm h-8 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Body fields */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Voucher Body</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Issued To', key: 'issued_to', placeholder: 'Name / Unit receiving the items' },
                                    { label: 'In Compliance With', key: 'compliance', placeholder: 'Order / Authority reference' },
                                    { label: 'Auth', key: 'auth', placeholder: 'Authorisation reference number' },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">{label}</label>
                                        <Input
                                            placeholder={placeholder}
                                            value={formData[key]}
                                            onChange={(e) => updateField(key, e.target.value)}
                                            className="text-sm border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items table */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Line Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 px-3 py-1 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                                >
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-2">
                                {/* Column headers */}
                                <div className="grid grid-cols-[auto_1fr_1fr_80px_80px] gap-2 px-1">
                                    {['#', 'Part No.', 'Nomenclature', 'Total', 'Remarks'].map((h) => (
                                        <span key={h} className="text-[10px] font-bold text-slate-400 uppercase">{h}</span>
                                    ))}
                                </div>
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-[24px_1fr_1fr_80px_80px] gap-2 items-center">
                                        <span className="text-xs text-slate-400 text-center">{idx + 1}</span>
                                        <Input
                                            placeholder="Part no."
                                            value={item.part_no}
                                            onChange={(e) => updateItem(idx, 'part_no', e.target.value)}
                                            className="text-xs h-8 border-slate-200"
                                        />
                                        <Input
                                            placeholder="Description"
                                            value={item.nomenclature}
                                            onChange={(e) => updateItem(idx, 'nomenclature', e.target.value)}
                                            className="text-xs h-8 border-slate-200"
                                        />
                                        <Input
                                            placeholder="Qty"
                                            value={item.total}
                                            onChange={(e) => updateItem(idx, 'total', e.target.value)}
                                            className="text-xs h-8 border-slate-200"
                                        />
                                        <div className="flex gap-1">
                                            <Input
                                                placeholder="Note"
                                                value={item.remarks}
                                                onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                                                className="text-xs h-8 border-slate-200"
                                            />
                                            {formData.items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(idx)}
                                                    className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    {step === 'fill' && (
                        <button
                            onClick={() => setStep('select')}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                            ← Back
                        </button>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </Button>
                        {step === 'fill' && (
                            <Button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-5 shadow-md shadow-orange-500/20 disabled:opacity-60"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="w-4 h-4 mr-2" />
                                        Generate Document
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
