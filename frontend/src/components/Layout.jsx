import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, ArrowLeftRight, ClipboardList,
    LogOut, Shield, ChevronRight, User
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/assets', label: 'Assets & Purchases', icon: Package },
    { path: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
    { path: '/assignments', label: 'Assignments', icon: ClipboardList },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'Admin': return 'role-admin';
            case 'Commander': return 'role-commander';
            case 'Logistics': return 'role-logistics';
            default: return '';
        }
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Shield size={28} />
                        <div>
                            <h2>MILITARY</h2>
                            <span className="sidebar-tagline">Asset Command</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            <ChevronRight size={16} className="nav-chevron" />
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            <User size={18} />
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.username}</span>
                            <span className={`user-role ${getRoleBadgeClass(user?.role)}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                    {user?.base && user.base !== 'All' && (
                        <div className="user-base">
                            <span>Base: {user.base}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className="logout-btn" id="logout-button">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
