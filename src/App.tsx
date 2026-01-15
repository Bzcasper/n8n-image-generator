import { Route, Routes, useNavigate } from 'react-router-dom';
import { Account } from './pages/account';
import { Auth } from './pages/auth';
import { Home } from './pages/home';
import ImageGenerator from './components/ImageGenerator';

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/app" 
        element={
          <ImageGenerator onBackToLanding={() => navigate('/')} />
        } 
      />
      <Route path="/auth/:pathname" element={<Auth />} />
      <Route path="/account/:pathname" element={<Account />} />
    </Routes>
  );
}
