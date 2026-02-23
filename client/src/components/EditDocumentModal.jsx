import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, FileText, AlertCircle, FileCheck, Plus } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// Copy TEMPLATES to identify names (in a real app these might be in a shared config)
const TEMPLATES = [
    { id: 'voucher', name: 'Receipt, Issue & Expense Voucher' },
    { id: 'outbound_delivery', name: 'Outbound Delivery Note' },
    { id: 'voucher_variable_qty', name: 'Voucher (Variable Qty)' },
    { id: 'voucher_title', name: 'Voucher with Custom Title' },
    { id: 'voucher_explanation', name: 'Voucher with Explanation' }
];

export default function EditDocumentModal({ document, onClose }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(null);
    const [genericData, setGenericData] = useState(null);

    const template = TEMPLATES.find(t => t.id === document.document_type) || { name: 'Document' };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/documents/content/${document.file_id}`);
                if (data.document_type === 'voucher') {
                    setFormData(data.data);
                } else {
                    setGenericData(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch document content:', err);
                setError('Failed to load document data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (document) fetchData();
    }, [document]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const payload = document.document_type === 'voucher' ? formData : { data: genericData };
            await api.put(`/documents/${document.file_id}`, payload);
            onClose();
        } catch (err) {
            console.error('Failed to update document:', err);
            setError(err.response?.data?.detail || 'Failed to update document.');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateGenericField = (field, value) => {
        setGenericData(prev => ({ ...prev, [field]: value }));
    };

    const updateItem = (index, field, value) => {
        setFormData(prev => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, items };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { part_no: '', nomenclature: '', total: '', remarks: '' }],
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    if (!document) return null;

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
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header - Matching VoucherModal */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <FileText className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Edit Document</h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                {template.name} • {document.file_id}
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

                {/* Content Area */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium italic">Fetching data from server...</p>
                        </div>
                    ) : (
                        <>
                            {document.document_type === 'voucher' ? (
                                <>
                                    {/* IV / RV header row */}
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Voucher Header Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-orange-600 uppercase">Issue Voucher (IV)</p>
                                                {[
                                                    { label: 'IV No.', key: 'iv_no' },
                                                    { label: 'Unit', key: 'unit_iv' },
                                                    { label: 'Station', key: 'stn_iv' },
                                                    { label: 'Date', key: 'date_iv' },
                                                ].map(({ label, key }) => (
                                                    <div key={key} className="space-y-1">
                                                        <label className="text-xs font-medium text-slate-600">{label}</label>
                                                        <Input
                                                            value={formData[key] || ''}
                                                            onChange={(e) => updateField(key, e.target.value)}
                                                            className="text-sm h-8 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-blue-600 uppercase">Receipt Voucher (RV)</p>
                                                {[
                                                    { label: 'RV No.', key: 'rv_no' },
                                                    { label: 'Unit', key: 'unit_rv' },
                                                    { label: 'Station', key: 'stn_rv' },
                                                    { label: 'Date', key: 'date_rv' },
                                                ].map(({ label, key }) => (
                                                    <div key={key} className="space-y-1">
                                                        <label className="text-xs font-medium text-slate-600">{label}</label>
                                                        <Input
                                                            value={formData[key] || ''}
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
                                                { label: 'Issued To', key: 'issued_to' },
                                                { label: 'In Compliance With', key: 'compliance' },
                                                { label: 'Auth', key: 'auth' },
                                            ].map(({ label, key }) => (
                                                <div key={key} className="space-y-1">
                                                    <label className="text-xs font-medium text-slate-600">{label}</label>
                                                    <Input
                                                        value={formData[key] || ''}
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
                                            <div className="grid grid-cols-[24px_1fr_1fr_80px_80px] gap-2 px-1">
                                                {['#', 'Part No.', 'Nomenclature', 'Total', 'Remarks'].map((h) => (
                                                    <span key={h} className="text-[10px] font-bold text-slate-400 uppercase">{h}</span>
                                                ))}
                                            </div>
                                            {formData.items?.map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-[24px_1fr_1fr_80px_80px] gap-2 items-center">
                                                    <span className="text-xs text-slate-400 text-center">{idx + 1}</span>
                                                    <Input value={item.part_no || ''} onChange={(e) => updateItem(idx, 'part_no', e.target.value)} className="text-xs h-8" />
                                                    <Input value={item.nomenclature || ''} onChange={(e) => updateItem(idx, 'nomenclature', e.target.value)} className="text-xs h-8" />
                                                    <Input value={item.total || ''} onChange={(e) => updateItem(idx, 'total', e.target.value)} className="text-xs h-8" />
                                                    <div className="flex gap-1">
                                                        <Input value={item.remarks || ''} onChange={(e) => updateItem(idx, 'remarks', e.target.value)} className="text-xs h-8" />
                                                        {formData.items.length > 1 && (
                                                            <button
                                                                onClick={() => removeItem(idx)}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Document Title / Subject</label>
                                            <Input
                                                value={genericData?.title || ''}
                                                onChange={(e) => updateGenericField('title', e.target.value)}
                                                className="text-sm border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Reference Date</label>
                                            <Input
                                                value={genericData?.date || ''}
                                                onChange={(e) => updateGenericField('date', e.target.value)}
                                                className="text-sm border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Explanation / Statement</label>
                                            <textarea
                                                value={genericData?.explanation || ''}
                                                onChange={(e) => updateGenericField('explanation', e.target.value)}
                                                className="w-full min-h-[150px] p-4 text-sm rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none shadow-inner bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-6 shadow-md shadow-orange-500/20 disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <FileCheck className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
