import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssets, getTransfers, getAssignments } from '../services/api';
import {
    Package, ArrowLeftRight, ClipboardList, TrendingUp,
    TrendingDown, AlertTriangle, Search, X, Filter,
    Truck, Crosshair, Flame
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterBase, setFilterBase] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [popup, setPopup] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [a, t, asg] = await Promise.all([
                getAssets(), getTransfers(), getAssignments()
            ]);
            setAssets(a.data);
            setTransfers(t.data);
            setAssignments(asg.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const bases = [...new Set(assets.map(a => a.base))];
    const categories = [...new Set(assets.map(a => a.category))];

    const filtered = assets.filter(a => {
        if (filterBase && a.base !== filterBase) return false;
        if (filterCategory && a.category !== filterCategory) return false;
        return true;
    });

    const totalAssets = filtered.reduce((s, a) => s + a.quantity, 0);
    const totalTransfers = transfers.length;
    const totalAssignments = assignments.filter(a => a.type === 'Assignment').length;
    const totalExpended = assignments.filter(a => a.type === 'Expenditure').length;

    // Net movement per base
    const netMovement = {};
    bases.forEach(base => {
        const inbound = transfers.filter(t => t.toBase === base).reduce((s, t) => s + t.quantity, 0);
        const outbound = transfers.filter(t => t.fromBase === base).reduce((s, t) => s + t.quantity, 0);
        const assigned = assignments.filter(a => a.base === base).reduce((s, a) => s + a.quantity, 0);
        netMovement[base] = { inbound, outbound, assigned, net: inbound - outbound - assigned };
    });

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Vehicle': return <Truck size={18} />;
            case 'Weapon': return <Crosshair size={18} />;
            case 'Ammunition': return <Flame size={18} />;
            default: return <Package size={18} />;
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="loader" />
                <p>Loading command data...</p>
            </div>
        );
    }

    return (
        <div className="page dashboard-page">
            <div className="page-header">
                <div>
                    <h1>Command Dashboard</h1>
                    <p className="page-desc">Welcome back, <strong>{user?.username}</strong>. Overview of all military assets.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-primary">
                    <div className="stat-icon"><Package size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{totalAssets.toLocaleString()}</span>
                        <span className="stat-label">Total Asset Units</span>
                    </div>
                </div>
                <div className="stat-card stat-blue">
                    <div className="stat-icon"><ArrowLeftRight size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{totalTransfers}</span>
                        <span className="stat-label">Transfers</span>
                    </div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-icon"><ClipboardList size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{totalAssignments}</span>
                        <span className="stat-label">Assignments</span>
                    </div>
                </div>
                <div className="stat-card stat-red">
                    <div className="stat-icon"><AlertTriangle size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{totalExpended}</span>
                        <span className="stat-label">Expenditures</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-icon"><Filter size={18} /></div>
                <select
                    id="filter-base"
                    value={filterBase}
                    onChange={(e) => setFilterBase(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Bases</option>
                    {bases.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                    id="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {(filterBase || filterCategory) && (
                    <button className="filter-clear" onClick={() => { setFilterBase(''); setFilterCategory(''); }}>
                        <X size={14} /> Clear
                    </button>
                )}
            </div>

            {/* Net Movement Cards */}
            <div className="section-header">
                <h2>Net Movement by Base</h2>
                <p>Click a base card to see detailed breakdown</p>
            </div>
            <div className="movement-grid">
                {bases.map(base => {
                    const m = netMovement[base];
                    return (
                        <div
                            key={base}
                            className="movement-card"
                            onClick={() => setPopup({ base, ...m })}
                        >
                            <h3>{base}</h3>
                            <div className="movement-stats">
                                <div className="mv-stat mv-in">
                                    <TrendingUp size={16} />
                                    <span>+{m.inbound.toLocaleString()} in</span>
                                </div>
                                <div className="mv-stat mv-out">
                                    <TrendingDown size={16} />
                                    <span>-{m.outbound.toLocaleString()} out</span>
                                </div>
                                <div className="mv-stat mv-assigned">
                                    <ClipboardList size={16} />
                                    <span>-{m.assigned.toLocaleString()} assigned</span>
                                </div>
                            </div>
                            <div className={`mv-net ${m.net >= 0 ? 'mv-positive' : 'mv-negative'}`}>
                                Net: {m.net >= 0 ? '+' : ''}{m.net.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Asset Table */}
            <div className="section-header">
                <h2>Asset Inventory</h2>
                <p>{filtered.length} assets found</p>
            </div>
            <div className="table-wrap">
                <table className="data-table" id="assets-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Category</th>
                            <th>Base</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(asset => (
                            <tr key={asset._id}>
                                <td className="asset-name-cell">
                                    {getCategoryIcon(asset.category)}
                                    <span>{asset.name}</span>
                                </td>
                                <td><span className={`cat-badge cat-${asset.category.toLowerCase()}`}>{asset.category}</span></td>
                                <td>{asset.base}</td>
                                <td className="qty-cell">{asset.quantity.toLocaleString()}</td>
                                <td><span className={`status-badge status-${asset.status.toLowerCase().replace(' ', '-')}`}>{asset.status}</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan="5" className="empty-row">No assets found with current filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup Modal */}
            {popup && (
                <div className="modal-overlay" onClick={() => setPopup(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{popup.base} — Net Movement Details</h2>
                            <button className="modal-close" onClick={() => setPopup(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item detail-in">
                                    <TrendingUp size={24} />
                                    <div>
                                        <span className="detail-val">+{popup.inbound.toLocaleString()}</span>
                                        <span className="detail-label">Inbound Transfers</span>
                                    </div>
                                </div>
                                <div className="detail-item detail-out">
                                    <TrendingDown size={24} />
                                    <div>
                                        <span className="detail-val">-{popup.outbound.toLocaleString()}</span>
                                        <span className="detail-label">Outbound Transfers</span>
                                    </div>
                                </div>
                                <div className="detail-item detail-assigned">
                                    <ClipboardList size={24} />
                                    <div>
                                        <span className="detail-val">-{popup.assigned.toLocaleString()}</span>
                                        <span className="detail-label">Assigned / Expended</span>
                                    </div>
                                </div>
                                <div className={`detail-item detail-net ${popup.net >= 0 ? 'detail-positive' : 'detail-negative'}`}>
                                    <Package size={24} />
                                    <div>
                                        <span className="detail-val">{popup.net >= 0 ? '+' : ''}{popup.net.toLocaleString()}</span>
                                        <span className="detail-label">Net Movement</span>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ marginTop: '1.5rem' }}>Recent Transfers</h3>
                            <div className="mini-table-wrap">
                                <table className="data-table mini-table">
                                    <thead>
                                        <tr><th>Asset</th><th>From</th><th>To</th><th>Qty</th><th>Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {transfers
                                            .filter(t => t.fromBase === popup.base || t.toBase === popup.base)
                                            .slice(0, 5)
                                            .map(t => (
                                                <tr key={t._id}>
                                                    <td>{t.assetName}</td>
                                                    <td>{t.fromBase}</td>
                                                    <td>{t.toBase}</td>
                                                    <td>{t.quantity}</td>
                                                    <td>{new Date(t.transferDate).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        }
                                        {transfers.filter(t => t.fromBase === popup.base || t.toBase === popup.base).length === 0 && (
                                            <tr><td colSpan="5" className="empty-row">No transfers recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
