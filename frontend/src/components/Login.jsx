import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const { loginUser } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(form);
            loginUser(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-content">
                    <h1>MILITARY</h1>
                    <p className="login-quote">
                        "Precision in tracking. Excellence in logistics. Build the future of command with confidence."
                    </p>
                </div>
                <div className="login-stats">
                    <div className="l-stat-item">
                        <span className="l-stat-val">1,200+</span>
                        <span className="l-stat-label">Assets</span>
                    </div>
                    <div className="l-stat-item">
                        <span className="l-stat-val">12</span>
                        <span className="l-stat-label">Bases</span>
                    </div>
                    <div className="l-stat-item">
                        <span className="l-stat-val">4.9★</span>
                        <span className="l-stat-label">Reliability</span>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-header">
                            <h2>Welcome back</h2>
                            <p className="login-subtitle">Sign in to continue your command journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {error && (
                                <div className="login-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="input-group">
                                <label htmlFor="login-username">Username</label>
                                <input
                                    id="login-username"
                                    type="text"
                                    placeholder="e.g. admin"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="login-password">Password</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? <Loader2 size={20} className="spin" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Authorized Personnel Only</p>
                            <div className="login-creds">
                                <span className="cred-label">Demo Accounts:</span>
                                <code>admin / admin123</code>
                                <code>logistics / log123</code>
                                <code>commander_alpha / cmd123</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
