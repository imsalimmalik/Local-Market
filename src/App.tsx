import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import ShopsPage from './pages/ShopsPage';
import ShopDetailPage from './pages/ShopDetailPage';
import OffersPage from './pages/OffersPage';
import RegisterShopPage from './pages/RegisterShopPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/shop/:id" element={<ShopDetailPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/register-shop" element={<RegisterShopPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;