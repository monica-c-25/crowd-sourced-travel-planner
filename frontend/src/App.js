import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
// import ExperienceForm from './forms/experienceForm';

// function App() {
//     return (
//         <div>
//             <h1>Experience Form</h1>
//             <ExperienceForm />
//         </div>
//     );
// }

const App = () => {
    return (
        <Router>
                <main>
                    <div className="container">
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                    </div>
                </main>
                <Footer />
        </Router>
    );
};

// const styles = {
//     appContainer: {
//         display: "flex",
//         flexDirection: "column",
//         minHeight: "100vh",
//     },
//     mainContent: {
//         flex: 1,
//         padding: "20px",
//     },
// };

export default App;
