import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import EssayFeedback from './pages/EssayFeedback';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Rubrics from './pages/Rubrics';
import Analytics from './pages/Analytics';
import BatchProcessor from './pages/BatchProcessor';
import Demo from './pages/Demo';
import About from './pages/About';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/essay-feedback" element={<EssayFeedback />} />
      <Route path="/students" element={<Students />} />
      <Route path="/rubrics" element={<Rubrics />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/batch" element={<BatchProcessor />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;