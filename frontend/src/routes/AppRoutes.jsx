import {Routes, Route} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Leaderboard from "../pages/Leaderboard";
import Players from "../pages/Players";
import PlayerProfile from "../pages/PlayerProfile";
import Matches from "../pages/Matches";
import MatchDetail from "../pages/MatchDetail";
import SubmitMatch from "../pages/SubmitMatch";
import SideQuests from "../pages/SideQuests";
import SideQuestDetail from "../pages/SideQuestDetail";
import SubmitSideQuest from "../pages/SubmitSideQuest";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminMatches from "../pages/AdminMatches";
import AdminSideQuests from "../pages/AdminSideQuests";
import AdminPlayers from "../pages/AdminPlayers";
import AdminGames from "../pages/AdminGames";
import Games from "../pages/Games.jsx";
import SeasonCalendar from "../pages/Calendar.jsx";

function Public({children}) {
    return <MainLayout>{children}</MainLayout>;
}

/** Wraps a page in both auth guard AND the admin sidebar layout */
function AdminPage({children}) {
    return (
        <ProtectedRoute>
            <AdminLayout>{children}</AdminLayout>
        </ProtectedRoute>
    );
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* ── Public ──────────────────────────────────────────── */}
            <Route path="/" element={<Public><Home/></Public>}/>
            <Route path="/leaderboard" element={<Public><Leaderboard/></Public>}/>
            <Route path="/players" element={<Public><Players/></Public>}/>
            <Route path="/players/:id" element={<Public><PlayerProfile/></Public>}/>
            <Route path="/matches" element={<Public><Matches/></Public>}/>
            <Route path="/matches/:id" element={<Public><MatchDetail/></Public>}/>
            <Route path="/submit-match" element={<Public><SubmitMatch/></Public>}/>
            <Route path="/sidequests" element={<Public><SideQuests/></Public>}/>
            <Route path="/sidequests/:id" element={<Public><SideQuestDetail/></Public>}/>
            <Route path="/submit-sidequest" element={<Public><SubmitSideQuest/></Public>}/>
            <Route path="/games" element={<Public><Games/></Public>}/>
            <Route path="/calendar" element={<Public><SeasonCalendar/></Public>}/>

            {/* ── Admin (login is public, everything else is protected) ── */}
            <Route path="/admin/login" element={<AdminLogin/>}/>
            <Route path="/admin" element={<AdminPage><AdminDashboard/></AdminPage>}/>
            <Route path="/admin/matches" element={<AdminPage><AdminMatches/></AdminPage>}/>
            <Route path="/admin/sidequests" element={<AdminPage><AdminSideQuests/></AdminPage>}/>
            <Route path="/admin/games" element={<AdminPage><AdminGames/></AdminPage>}/>
            <Route path="/players/manage" element={<AdminPage><AdminPlayers/></AdminPage>}/>

        </Routes>
    );
}
