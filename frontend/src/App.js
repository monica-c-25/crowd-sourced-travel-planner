import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Explore from './pages/Experiences.jsx';
import ExperienceForm from './forms/ExperienceForm.jsx';
import ExperienceDetail from './pages/ExperienceDetail.jsx';
import ChatbotForm from './forms/AIRecommendator.jsx';

// Create a UserContext to manage user state
export const UserContext = createContext(null);

const App = () => {
    const [user, setUser] = useState(null); // Manage the user's login state

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                <main>
                    <div className="app-container">
                        <NavBar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/experience-detail/:id" element={<ExperienceDetail />} />
                            <Route path="/experience-form" element={<ExperienceForm />} />
                            <Route path="/ai-recommendator" element={<ChatbotForm />} />
                        </Routes>
                    </div>
                </main>
                <Footer />
            </Router>
        </UserContext.Provider>
    );
};

export default App;

