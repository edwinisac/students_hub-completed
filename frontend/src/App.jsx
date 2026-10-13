import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Planner from "./pages/Planner";
import Settings from "./pages/Settings";
export default function App(){return <Routes>
  <Route path="/login" element={<Login/>}/>
  <Route element={<ProtectedRoute/>}><Route element={<Layout/>}>
    <Route index element={<Dashboard/>}/><Route path="/students" element={<Students/>}/><Route path="/planner" element={<Planner/>}/><Route path="/settings" element={<Settings/>}/>
  </Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>}
