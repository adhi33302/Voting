import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import FaceLogin from './pages/FaceLogin';
import Register from './pages/Register';
import Voting from './pages/Voting';
import Results from './pages/Results';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              <FaceLogin 
                isRegistered={isRegistered} 
                setIsAuthenticated={setIsAuthenticated} 
                hasVoted={hasVoted}
              />
            } />
            <Route path="/register" element={<Register setIsRegistered={setIsRegistered} />} />
            <Route path="/voting" element={
              !isAuthenticated ? <Navigate to="/login" /> : 
              hasVoted ? <Navigate to="/results" /> : 
              <Voting setHasVoted={setHasVoted} hasVoted={hasVoted} />
            } />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
