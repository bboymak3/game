'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const GameEngine = dynamic(() => import('@/components/ar-game/GameEngine'), {
  ssr: false,
  loading: () => {
    const LoadingScreen = () => (
      <div className="flex items-center justify-center bg-gray-950" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✏️</div>
          <div className="text-cyan-400 font-bold text-xl animate-pulse">Cargando Dibujo Warrior...</div>
          <div className="text-white/50 text-sm mt-2">Preparando la magia</div>
        </div>
      </div>
    );
    return <LoadingScreen />;
  },
});

export default function Home() {
  const [showEngine, setShowEngine] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // On mobile, ensure the page is ready before mounting the heavy game component
    const timer = setTimeout(() => {
      setShowEngine(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-gray-950" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        <div className="text-center px-6">
          <div className="text-5xl mb-4">⚠️</div>
          <div className="text-white font-bold text-lg mb-4">Error al cargar</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 text-white font-bold px-6 py-3 rounded-xl"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!showEngine) {
    return (
      <div className="flex items-center justify-center bg-gray-950" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✏️</div>
          <div className="text-cyan-400 font-bold text-xl animate-pulse">Cargando Dibujo Warrior...</div>
          <div className="text-white/50 text-sm mt-2">Preparando la magia</div>
        </div>
      </div>
    );
  }

  return <GameEngine />;
}
