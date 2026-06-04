import {BrowserRouter} from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import {NotificationProvider} from "./websocket/NotificationContext";
import {AuthProvider} from "./auth/AuthContext";
import MaintenancePage from "./pages/MaintenancePage";

export default function App() {
    const appStatus = import.meta.env.VITE_APP_STATUS;

    if (appStatus === "MAINTENANCE") {
        return <MaintenancePage/>;
    }

    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <AppRoutes/>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}