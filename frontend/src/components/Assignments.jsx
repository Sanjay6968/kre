import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssets, getAssignments, createAssignment, deleteAssignment } from '../services/api';
import { Plus, ClipboardList, X, Loader2, Trash2 } from 'lucide-react';

export default function Assignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [form, setForm] = useState({ assetId: '', assignedTo: '', quantity: '', base: '', type: 'Assignment' });
    const [error, setError] = useState('');
    const canCreate = ['Admin', 'Logistics', 'Commander'].includes(user?.role);
    const canDelete = ['Admin', 'Logistics'].includes(user?.role);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [asg, a] = await Promise.all([getAssignments(), getAssets()]);
            setAssignments(asg.data);
            setAssets(a.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAssetSelect = (assetId) => {
        const asset = assets.find(a => a._id === assetId);
        setForm({ ...form, assetId, base: asset ? asset.base : '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            await createAssignment({ ...form, quantity: Number(form.quantity) });
            setShowForm(false);
            setForm({ assetId: '', assignedTo: '', quantity: '', base: '', type: 'Assignment' });
            fetchData();
        } catch (err) { setError(err.response?.data?.msg || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this assignment and return assets?')) return;
        try { await deleteAssignment(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const filtered = filterType ? assignments.filter(a => a.type === filterType) : assignments;

    if (loading) return <div className="page-loading"><div className="loader"/><p>Loading...</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div><h1>Assignments & Expenditures</h1><p className="page-desc">Track asset assignments to units and expenditure records.</p></div>
                {canCreate && <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={18}/> New Record</button>}
            </div>
            <div className="filter-bar">
                <button className={`filter-tab ${filterType===''?'active':''}`} onClick={() => setFilterType('')}>All</button>
                <button className={`filter-tab ${filterType==='Assignment'?'active':''}`} onClick={() => setFilterType('Assignment')}>Assignments</button>
                <button className={`filter-tab ${filterType==='Expenditure'?'active':''}`} onClick={() => setFilterType('Expenditure')}>Expenditures</button>
            </div>
            <div className="table-wrap">
                <table className="data-table" id="assignments-table"><thead><tr>
                    <th>Asset</th><th>Assigned To</th><th>Base</th><th>Qty</th><th>Type</th><th>Date</th>{canDelete && <th>Action</th>}
                </tr></thead><tbody>
                    {filtered.map(a => (
                        <tr key={a._id}>
                            <td className="asset-name-cell"><ClipboardList size={18}/><span>{a.assetName}</span></td>
                            <td>{a.assignedTo}</td>
                            <td>{a.base}</td>
                            <td className="qty-cell">{a.quantity.toLocaleString()}</td>
                            <td><span className={`type-badge type-${a.type.toLowerCase()}`}>{a.type}</span></td>
                            <td>{new Date(a.date).toLocaleDateString()}</td>
                            {canDelete && <td><button className="btn-icon btn-danger" onClick={() => handleDelete(a._id)}><Trash2 size={16}/></button></td>}
                        </tr>
                    ))}
                    {filtered.length===0 && <tr><td colSpan={canDelete?7:6} className="empty-row">No records found.</td></tr>}
                </tbody></table>
            </div>
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>New Assignment / Expenditure</h2><button className="modal-close" onClick={() => setShowForm(false)}><X size={20}/></button></div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="form-error">{error}</div>}
                            <div className="input-group"><label>Type</label>
                                <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Expenditure">Expenditure</option>
                                </select>
                            </div>
                            <div className="input-group"><label>Asset</label>
                                <select required value={form.assetId} onChange={e => handleAssetSelect(e.target.value)}>
                                    <option value="">Select asset...</option>
                                    {assets.filter(a => a.quantity > 0).map(a => <option key={a._id} value={a._id}>{a.name} ({a.base} — {a.quantity} avail)</option>)}
                                </select>
                            </div>
                            <div className="form-grid">
                                <div className="input-group"><label>Assigned To</label><input type="text" required value={form.assignedTo} onChange={e => setForm({...form,assignedTo:e.target.value})} placeholder="Unit or personnel"/></div>
                                <div className="input-group"><label>Quantity</label><input type="number" min="1" required value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})}/></div>
                            </div>
                            <button type="submit" className="btn-primary btn-full" disabled={submitting}>{submitting?<Loader2 size={18} className="spin"/>:'Submit Record'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
