import { Route, Routes, useNavigate } from 'react-router-dom';
import { Account } from './pages/account';
import { Auth } from './pages/auth';
import { Home } from './pages/home';
import ImageGenerator from './components/ImageGenerator';
import { SignedIn, SignedOut, RedirectToSignIn } from '@neondatabase/neon-js/auth/react/ui';

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/app" 
        element={
          <>
            <SignedIn>
              <ImageGenerator onBackToLanding={() => navigate('/')} />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        } 
      />
      <Route path="/auth/:pathname" element={<Auth />} />
      <Route path="/account/:pathname" element={<Account />} />
    </Routes>
  );
}
