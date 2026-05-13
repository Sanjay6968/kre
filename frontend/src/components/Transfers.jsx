import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssets, getTransfers, createTransfer } from '../services/api';
import { Plus, ArrowLeftRight, X, Loader2, ArrowRight } from 'lucide-react';

export default function Transfers() {
    const { user } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ assetId: '', fromBase: '', toBase: '', quantity: '' });
    const [error, setError] = useState('');
    const canCreate = ['Admin', 'Logistics'].includes(user?.role);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [t, a] = await Promise.all([getTransfers(), getAssets()]);
            setTransfers(t.data);
            setAssets(a.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAssetSelect = (assetId) => {
        const asset = assets.find(a => a._id === assetId);
        setForm({ ...form, assetId, fromBase: asset ? asset.base : '' });
    };

    const bases = [...new Set(assets.map(a => a.base))];

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            await createTransfer({ ...form, quantity: Number(form.quantity) });
            setShowForm(false);
            setForm({ assetId: '', fromBase: '', toBase: '', quantity: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.msg || 'Transfer failed'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div className="page-loading"><div className="loader"/><p>Loading...</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div><h1>Transfers</h1><p className="page-desc">Transfer assets between military bases.</p></div>
                {canCreate && <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={18}/> New Transfer</button>}
            </div>
            <div className="table-wrap">
                <table className="data-table" id="transfers-table"><thead><tr>
                    <th>Asset</th><th>From</th><th></th><th>To</th><th>Qty</th><th>Status</th><th>Date</th>
                </tr></thead><tbody>
                    {transfers.map(t => (
                        <tr key={t._id}>
                            <td className="asset-name-cell"><ArrowLeftRight size={18}/><span>{t.assetName}</span></td>
                            <td><span className="base-tag">{t.fromBase}</span></td>
                            <td className="arrow-cell"><ArrowRight size={16}/></td>
                            <td><span className="base-tag">{t.toBase}</span></td>
                            <td className="qty-cell">{t.quantity.toLocaleString()}</td>
                            <td><span className={`status-badge status-${t.status.toLowerCase()}`}>{t.status}</span></td>
                            <td>{new Date(t.transferDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {transfers.length===0 && <tr><td colSpan="7" className="empty-row">No transfers recorded.</td></tr>}
                </tbody></table>
            </div>
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>New Transfer</h2><button className="modal-close" onClick={() => setShowForm(false)}><X size={20}/></button></div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="form-error">{error}</div>}
                            <div className="input-group"><label>Asset</label>
                                <select required value={form.assetId} onChange={e => handleAssetSelect(e.target.value)}>
                                    <option value="">Select asset...</option>
                                    {assets.filter(a => a.quantity > 0).map(a => <option key={a._id} value={a._id}>{a.name} ({a.base} — {a.quantity} available)</option>)}
                                </select>
                            </div>
                            <div className="form-grid">
                                <div className="input-group"><label>From Base</label><input type="text" readOnly value={form.fromBase} className="readonly"/></div>
                                <div className="input-group"><label>To Base</label>
                                    <select required value={form.toBase} onChange={e => setForm({...form,toBase:e.target.value})}>
                                        <option value="">Select destination...</option>
                                        {bases.filter(b => b !== form.fromBase).map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group"><label>Quantity</label><input type="number" min="1" required value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})}/></div>
                            <button type="submit" className="btn-primary btn-full" disabled={submitting}>{submitting?<Loader2 size={18} className="spin"/>:'Execute Transfer'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
