import { useEffect, useState } from "react";
import { ArrowUpRight, GraduationCap, Users, UserCheck, TrendingUp, Plus, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api";
function Stat({icon:Icon,label,value,sub}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19}/></span></div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>}
export default function Dashboard(){
  const [data,setData]=useState(null),[error,setError]=useState("");
  useEffect(()=>{api.get("/dashboard").then(r=>setData(r.data)).catch(e=>setError(errorMessage(e)));},[]);
  if(error)return <div className="alert error">{error}</div>;
  if(!data)return <div className="loading">Preparing your dashboard…</div>;
  const max=Math.max(1,...Object.values(data.byCourse));
  return <><div className="page-heading"><div><p className="eyebrow">TUESDAY, YOUR WORKSPACE</p><h1>Good to see you <span className="wave">✦</span></h1><p className="muted">Here’s what’s happening across your student community.</p></div><Link className="primary-button" to="/students?add=1"><Plus size={17}/> Add student</Link></div>
    <div className="stats-grid"><Stat icon={Users} label="Total students" value={data.total} sub="All registered records"/><Stat icon={UserCheck} label="Active students" value={data.active} sub="Currently enrolled"/><Stat icon={TrendingUp} label="Average marks" value={`${data.averageMarks}%`} sub="Across all records"/><Stat icon={GraduationCap} label="On leave" value={data.onLeave} sub="Students needing follow-up"/></div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Students by course</h2><p className="muted">Current enrolment distribution</p></div><span className="soft-tag">Overview</span></div><div className="course-bars">{Object.entries(data.byCourse).map(([course,count])=><div className="bar-row" key={course}><div className="bar-label"><span>{course}</span><b>{count}</b></div><div className="bar-track"><div className="bar-fill" style={{width:`${count/max*100}%`}}/></div></div>)}</div><Link className="text-link" to="/students">View all students <ArrowRight size={15}/></Link></section>
      <section className="panel"><div className="panel-heading"><div><h2>Recent activity</h2><p className="muted">Latest workspace updates</p></div><Activity size={19} className="quiet-icon"/></div>{data.recentActivity.length?<div className="activity-list">{data.recentActivity.map(item=><div className="activity-item" key={item.id}><span className="activity-dot"/><div><b>{item.action}</b><p>{item.detail}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div></div>)}</div>:<div className="empty-state"><Activity size={25}/><b>No activity yet</b><p>Add or update a student to see events here.</p></div>}</section></div>
    <div className="feature-banner"><div className="banner-icon"><GraduationCap size={25}/></div><div><b>Make your student data work harder</b><p>Search instantly, compare academic performance, and discover students connected by course or specialization.</p></div><Link to="/students" className="banner-link">Explore records <ArrowUpRight size={16}/></Link></div>
  </>;
}
