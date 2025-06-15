import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Premium from './pages/Premium';
import Plans from './pages/Plans';
import Subscription from './pages/Subscription';
import About from './pages/About';
import Pricing from './pages/Pricing';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Disclaimer from './pages/Disclaimer';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import TestStripe from './pages/TestStripe';
import StripeDebugger from './pages/StripeDebugger';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="plans" element={<Plans />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="cookies" element={<CookiePolicy />} />
        <Route path="disclaimer" element={<Disclaimer />} />
        <Route path="login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="premium" element={<Premium />} />
        <Route path="subscription" element={user ? <Subscription /> : <Navigate to="/login" />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="test-stripe" element={<TestStripe />} />
        <Route path="stripe-debug" element={<StripeDebugger />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;