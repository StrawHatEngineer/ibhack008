import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HomeCards from './components/HomeCards'
import Dashboard from './components/Dashboard'
import Team from './components/Team'
import About from './components/About'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import ConnectionStatus from './components/ConnectionStatus'


const App = () => {
  return (
    <Router>
      <Navbar />
      <Hero />
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/team" element={<Team />} />
        <Route exact path="/about" element={<About />} />
      </Routes>
      <ConnectionStatus />
    </Router>
  )
}

export default App