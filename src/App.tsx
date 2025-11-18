// This file is the main entry point for the drone show simulator.
import { useState } from 'react';
import Canvas2DRenderer from './components/renderers/Canvas2DRenderer';
import Canvas3DRenderer from './components/renderers/Canvas3DRenderer';
import Header from './components/ui/Header';
import SettingsPanel from './components/ui/SettingsPanel';
import Controls from './components/ui/Controls';
import FileInput from './components/ui/FileInput';
import { useDroneAnimation } from './hooks/useDroneAnimation';
import InfoPanel from './components/ui/InfoPanel';

// App is the main component for the drone show simulator.
export default function App() {
  const [viewMode, setViewMode] = useState('2d');
  const [droneCount, setDroneCount] = useState(1000);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [spacingMultiplier, setSpacingMultiplier] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [externalData, setExternalData] = useState(null);

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    particlesRef,
    updateParticlesByTime,
    timelineInfo,
    activeSegment
  } = useDroneAnimation(droneCount, spacingMultiplier, speedMultiplier, externalData);

  const handleFileLoad = (data: any) => {
    setExternalData(data);
  };
  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden flex flex-col relative font-sans selection:bg-blue-500 selection:text-white">
      <div className="flex-1 relative">
        <FileInput onFileLoad={handleFileLoad} />
        {viewMode === '2d' ? (
          <Canvas2DRenderer
            particlesRef={particlesRef}
            updateParticles={updateParticlesByTime}
            droneCount={droneCount}
          />
        ) : (
          <Canvas3DRenderer
            particlesRef={particlesRef}
            updateParticles={updateParticlesByTime}
            droneCount={droneCount}
          />
        )}
        <Header activeSegment={activeSegment} />
        <SettingsPanel
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          speedMultiplier={speedMultiplier}
          setSpeedMultiplier={setSpeedMultiplier}
          spacingMultiplier={spacingMultiplier}
          setSpacingMultiplier={setSpacingMultiplier}
          droneCount={droneCount}
          setDroneCount={setDroneCount}
        />
        <InfoPanel showInfo={showInfo} setShowInfo={setShowInfo} />
      </div>
      <Controls
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        timelineInfo={timelineInfo}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
}
