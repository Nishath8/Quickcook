import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AddCook from './pages/AddCook';
import Admin from './pages/Admin';
import CookProfile from './pages/CookProfile';
import CookDashboard from './pages/CookDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="add" element={<AddCook />} />
          <Route path="admin" element={<Admin />} />
          <Route path="cook/:id" element={<CookProfile />} />
          <Route path="dashboard" element={<CookDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
