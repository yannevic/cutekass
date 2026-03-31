import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Trash from './pages/Trash';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trash" element={<Trash />} />
    </Routes>
  );
}
