import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Explore from './pages/Experiences.jsx';
import ExperienceForm from './forms/ExperienceForm.jsx';
import ExperienceDetail from './pages/ExperienceDetail.jsx';
import ChatbotForm from './forms/AIRecommendator.jsx';
import { AuthProvider } from "./context/AuthContext";
import AIRecommendations from "./pages/AIRecommendation.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Dashboard from './pages/Dashboard.jsx';
import TripForm from './forms/TripForm.jsx';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <main>
                    <div className="app-container">
                        <ScrollToTop />
                        <NavBar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/experience-detail/:id" element={<ExperienceDetail />} />
                            <Route path="/experience-form" element={<ExperienceForm />} />
                            <Route path="/ai-recommendator" element={<ChatbotForm />} />
                            <Route path="/ai-recommendation" element={<AIRecommendations />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/trip-form" element= {<TripForm />} />
                        </Routes>
                    </div>
                </main>
                <Footer />
            </Router>
        </AuthProvider>
    );
};

export default App;