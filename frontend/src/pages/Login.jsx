import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api";
export default function Login(){
  const {user,login}=useAuth(), navigate=useNavigate(), location=useLocation();
  const [email,setEmail]=useState("admin@studenthub.local"),[password,setPassword]=useState("StudentHub@123"),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  if(user) return <Navigate to="/" replace/>;
  async function submit(e){e.preventDefault();setError("");setBusy(true);try{await login(email,password);navigate(location.state?.from||"/",{replace:true});}catch(err){setError(errorMessage(err));}finally{setBusy(false);}}
  return <div className="login-page"><div className="login-brand"><div className="brand-icon"><GraduationCap size={24}/></div><strong>StudentHub</strong></div>
    <div className="login-card"><div className="login-symbol"><ShieldCheck size={25}/></div><p className="eyebrow">YOUR ADMIN WORKSPACE</p><h1>Welcome back</h1><p className="muted">Sign in to manage student records and academic activity.</p>
      <form onSubmit={submit} className="form-stack"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>{error&&<div className="alert error">{error}</div>}<button className="primary-button full" disabled={busy}>{busy?"Signing in…":"Sign in"} <ArrowRight size={17}/></button></form>
      <div className="demo-note"><b>Demo access</b><span>admin@studenthub.local</span><span>StudentHub@123</span></div>
    </div><p className="login-foot">Secure workspace · Demo data is stored on your local machine</p>
  </div>
}
