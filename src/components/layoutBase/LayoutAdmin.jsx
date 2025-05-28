import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const LayoutAdmin = () => {
  return (
    <>
      <Header />
      <main style={{ flex: 1, minHeight: '70vh', padding: '20px 0' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default LayoutAdmin;
