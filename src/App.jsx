import Navbar from './components/Navbar'
import HomeCards from './components/HomeCards'
import Dashboard from './components/Dashboard'
import Team from './components/Team'
import About from './components/About'
import ActivityTracker from './components/ActivityTracker'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Hero from './components/Hero'
import { ActivityProvider } from './contexts/ActivityContext'

const App = () => {
  return (
    <ActivityProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<><Hero /><Dashboard /></>} />
          <Route exact path="/activity" element={<ActivityTracker />} />
          <Route exact path="/team" element={<Team />} />
          <Route exact path="/about" element={<About />} />
        </Routes>
      </Router>
    </ActivityProvider>
  )
}

export default App