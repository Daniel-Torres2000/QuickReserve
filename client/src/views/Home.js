import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Schedule from '../components/Schedule';

function Home() {
  return (
    <div className="home">
          <Header />
          <Hero />
          <Features />
          <Schedule />
    </div>
  );
}

export default Home;
