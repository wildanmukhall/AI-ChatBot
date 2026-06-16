import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder Pages
const Dashboard = () => <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h1 className="text-2xl font-montserrat font-bold mb-4">Dashboard</h1><p className="text-slate-600 dark:text-slate-400">Welcome to AI GenApp Dashboard.</p></div>;
const Chat = () => <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h1 className="text-2xl font-montserrat font-bold mb-4">AI Chat</h1><p className="text-slate-600 dark:text-slate-400">Start chatting with Gemini AI.</p></div>;
const ImageGen = () => <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h1 className="text-2xl font-montserrat font-bold mb-4">Generate Image</h1><p className="text-slate-600 dark:text-slate-400">Create images from text prompts.</p></div>;
const Profile = () => <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h1 className="text-2xl font-montserrat font-bold mb-4">User Profile</h1><p className="text-slate-600 dark:text-slate-400">Manage your account and settings.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (standalone, no sidebar/header) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App Routes (inside MainLayout) */}
        <Route path="/" element={<MainLayout />}>
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="image" element={<ImageGen />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
