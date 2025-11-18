// This file contains the controls component for the drone show.
import { Play, Pause, RotateCcw, Clock, Monitor, Box } from 'lucide-react';

// formatTime is a utility function that formats the time in mm:ss format.
const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface Segment {
    id: string;
    name: string;
    type: string;
    duration: number;
    startTime: number;
    endTime: number;
    index: number;
}

interface TimelineInfo {
    segments: Segment[];
    totalDuration: number;
}

interface ControlsProps {
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    currentTime: number;
    setCurrentTime: (currentTime: number) => void;
    timelineInfo: TimelineInfo;
    viewMode: string;
    setViewMode: (viewMode: string) => void;
}

// Controls is a component that displays the controls for the drone show.
const Controls = ({
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    timelineInfo,
    viewMode,
    setViewMode
}: ControlsProps) => {
    // handleSeek is a function that handles the seek bar.
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
    };

    return (
        <div className="h-auto bg-gray-800 border-t border-gray-700 flex flex-col shrink-0 z-20 shadow-2xl">
            <div className="w-full px-4 pt-4 pb-1 group relative">
               <input 
                 type="range" 
                 min="0" 
                 max={timelineInfo.totalDuration} 
                 value={currentTime}
                 onChange={handleSeek}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
               />
               <div className="absolute top-5 left-4 right-4 h-2 pointer-events-none flex justify-between opacity-30">
                  {timelineInfo && timelineInfo.segments.map(seg => (
                    <div key={seg.id} className="h-full w-0.5 bg-white" style={{ left: `${(seg.startTime / timelineInfo.totalDuration) * 100}%`, position: 'absolute' }} />
                  ))}
               </div>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50"
                    >
                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                    </button>
                    <button 
                        onClick={() => { setIsPlaying(false); setCurrentTime(0); }}
                        className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Reset Time"
                    >
                        <RotateCcw size={18} />
                    </button>
                    
                    <div className="flex flex-col">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> TOTAL TIME
                        </div>
                        <div className="font-mono text-lg font-medium text-white leading-none">
                            {formatTime(currentTime)} <span className="text-gray-500 text-sm">/ {formatTime(timelineInfo?.totalDuration || 0)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
                    <button
                        onClick={() => setViewMode('2d')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm ${viewMode === '2d' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Monitor size={14} /> 2D
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm ${viewMode === '3d' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Box size={14} /> 3D
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controls;