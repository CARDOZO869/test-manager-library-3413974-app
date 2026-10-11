import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Icon } from './Icon';

const baseLinks = [
  { to: '/', label: 'Resumen', icon: 'grid', end: true },
  { to: '/books', label: 'Catálogo', icon: 'book' },
  { to: '/members', label: 'Socios', icon: 'users' },
  { to: '/loans', label: 'Préstamos', icon: 'loan' },
];

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? [...baseLinks, { to: '/reports', label: 'Reportes', icon: 'chart' }, { to: '/users', label: 'Usuarios', icon: 'settings' }] : baseLinks;
  const name = user?.username || (user?.role === 'admin' ? 'Administrador' : 'Bibliotecario');
  const initials = name.slice(0, 1).toUpperCase();
  const handleLogout = () => { logout(); navigate('/login'); };

  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="Manager Library, panel">
        <span className="brand-mark"><Icon name="book" size={23}/></span>
        <span className="brand-copy"><strong>folio</strong><small>GESTIÓN BIBLIOTECARIA</small></span>
      </NavLink>
      <div className="sidebar-caption">ESPACIO DE TRABAJO</div>
      <nav className="side-nav" aria-label="Navegación principal">
        {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Icon name={link.icon}/><span>{link.label}</span>{link.label === 'Préstamos' && <span className="nav-indicator"/>}
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-help"><span className="help-orb"><Icon name="spark" size={17}/></span><strong>Tu biblioteca, en orden</strong><small>Catálogo, socios y préstamos en un solo lugar.</small></div>
        <button className="logout-button" onClick={handleLogout}><Icon name="logout" size={18}/>Cerrar sesión</button>
      </div>
    </aside>
    <div className="main-column">
      <header className="topbar">
        <div className="topbar-mobile-brand"><span className="brand-mark"><Icon name="book" size={19}/></span><strong>folio</strong></div>
        <div className="topbar-note"><span className="online-dot"/> Biblioteca en línea</div>
        <div className="user-menu"><div className="user-meta"><strong>{name}</strong><span>{user?.role === 'admin' ? 'Administrador' : 'Bibliotecario'}</span></div><span className="user-avatar">{initials}</span></div>
      </header>
      <main className="page-content"><Outlet/></main>
      <nav className="mobile-nav" aria-label="Navegación móvil" style={{ '--mobile-nav-items': links.length }}>{links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}><Icon name={link.icon} size={20}/><span>{link.label}</span></NavLink>)}</nav>
    </div>
  </div>;
};
