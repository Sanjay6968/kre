import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssets, createAsset } from '../services/api';
import { Plus, Package, X, Loader2, Truck, Crosshair, Flame, Search } from 'lucide-react';

const BASES = ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'];
const CATEGORIES = ['Vehicle', 'Weapon', 'Ammunition'];

export default function Assets() {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', category: 'Vehicle', base: 'Base Alpha', quantity: '', description: '' });
    const [error, setError] = useState('');
    const canCreate = ['Admin', 'Logistics'].includes(user?.role);

    useEffect(() => { fetchAssets(); }, []);

    const fetchAssets = async () => {
        try { const res = await getAssets(); setAssets(res.data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            await createAsset({ ...form, quantity: Number(form.quantity), status: 'Available' });
            setShowForm(false);
            setForm({ name: '', category: 'Vehicle', base: 'Base Alpha', quantity: '', description: '' });
            fetchAssets();
        } catch (err) { setError(err.response?.data?.msg || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const icon = (cat) => {
        if (cat === 'Vehicle') return <Truck size={18}/>;
        if (cat === 'Weapon') return <Crosshair size={18}/>;
        if (cat === 'Ammunition') return <Flame size={18}/>;
        return <Package size={18}/>;
    };

    const filtered = assets.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.base.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-loading"><div className="loader"/><p>Loading...</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div><h1>Assets & Purchases</h1><p className="page-desc">Manage inventory and record new purchases.</p></div>
                {canCreate && <button className="btn-primary" id="add-asset-btn" onClick={() => setShowForm(true)}><Plus size={18}/> New Purchase</button>}
            </div>
            <div className="search-bar"><Search size={18}/>
                <input id="search-assets" type="text" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div className="table-wrap">
                <table className="data-table" id="purchases-table"><thead><tr>
                    <th>Asset</th><th>Category</th><th>Base</th><th>Quantity</th><th>Status</th><th>Description</th>
                </tr></thead><tbody>
                    {filtered.map(a => (
                        <tr key={a._id}>
                            <td className="asset-name-cell">{icon(a.category)}<span>{a.name}</span></td>
                            <td><span className={`cat-badge cat-${a.category.toLowerCase()}`}>{a.category}</span></td>
                            <td>{a.base}</td>
                            <td className="qty-cell">{a.quantity.toLocaleString()}</td>
                            <td><span className={`status-badge status-${a.status.toLowerCase().replace(' ','-')}`}>{a.status}</span></td>
                            <td className="desc-cell">{a.description||'—'}</td>
                        </tr>
                    ))}
                    {filtered.length===0 && <tr><td colSpan="6" className="empty-row">No assets found.</td></tr>}
                </tbody></table>
            </div>
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Record New Purchase</h2><button className="modal-close" onClick={() => setShowForm(false)}><X size={20}/></button></div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="form-error">{error}</div>}
                            <div className="form-grid">
                                <div className="input-group"><label>Asset Name</label><input type="text" required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. M1 Abrams"/></div>
                                <div className="input-group"><label>Category</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                                <div className="input-group"><label>Base</label><select value={form.base} onChange={e => setForm({...form,base:e.target.value})}>{BASES.map(b=><option key={b}>{b}</option>)}</select></div>
                                <div className="input-group"><label>Quantity</label><input type="number" min="1" required value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})}/></div>
                            </div>
                            <div className="input-group"><label>Description</label><input type="text" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Optional"/></div>
                            <button type="submit" className="btn-primary btn-full" disabled={submitting}>{submitting?<Loader2 size={18} className="spin"/>:'Record Purchase'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
