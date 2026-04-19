'use client';

import dynamic from 'next/dynamic';

const GameEngine = dynamic(() => import('@/components/ar-game/GameEngine'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🐉</div>
        <div className="text-yellow-400 font-bold text-xl animate-pulse">Cargando Dragon Quest AR...</div>
        <div className="text-white/50 text-sm mt-2">Preparando los dragones</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <GameEngine />;
}
