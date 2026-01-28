import React, { useState } from 'react';
import LoginPage from './Login';
import Dashboard from './Dashboard';
import Analysis from './Analysis';
import Reports from './Reports';
import Account from './Account';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'analysis':
        return <Analysis user={user} activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'reports':
        return <Reports user={user} activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'account':
        return <Account user={user} activeTab={activeTab} onTabChange={setActiveTab} />;
      default:
        return <Dashboard user={user} onLogout={handleLogout} activeTab={activeTab} onTabChange={setActiveTab} />;
    }
  };

  return (
    <>
      {user ? (
        renderContent()
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
