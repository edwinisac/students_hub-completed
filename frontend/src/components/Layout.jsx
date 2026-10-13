import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Settings, LogOut, GraduationCap, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function Layout() {
  const {user,logout}=useAuth(), navigate=useNavigate();
  function signOut(){logout();navigate("/login",{replace:true});}
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><GraduationCap size={22}/></div><div><strong>StudentHub</strong><small>Student administration</small></div></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>
        <NavLink end to="/"><LayoutDashboard size={18}/>Overview</NavLink>
        <NavLink to="/students"><Users size={18}/>Students</NavLink>
        <NavLink to="/planner"><CalendarDays size={18}/>Study planner</NavLink>
        <NavLink to="/settings"><Settings size={18}/>Account settings</NavLink>
      </nav>
      <div className="sidebar-bottom"><div className="avatar">{user?.name?.slice(0,1)||"A"}</div><div className="user-mini"><strong>{user?.name}</strong><small>{user?.role}</small></div><button className="icon-button" title="Sign out" onClick={signOut}><LogOut size={17}/></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Student management</b></div><div className="topbar-right"><span className="live-dot"/> All changes saved locally <div className="avatar avatar-small">{user?.name?.slice(0,1)||"A"}</div></div></header>
      <div className="page-wrap"><Outlet /></div>
      <footer>StudentHub <span>•</span> Built for thoughtful student administration</footer>
    </main>
  </div>;
}
