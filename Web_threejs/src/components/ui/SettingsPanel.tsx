// 이 파일은 설정 패널을 구현하는 React 컴포넌트입니다. 사용자는 이 패널을 통해 재생 속도, 드론 간격, 드론 수량 등의 설정을 조정할 수 있습니다.
import { Settings, Gauge, Users, Move } from 'lucide-react';

interface SettingsPanelProps {
    showSettings: boolean;
    setShowSettings: (showSettings: boolean) => void;
    speedMultiplier: number;
    setSpeedMultiplier: (speedMultiplier: number) => void;
    spacingMultiplier: number;
    setSpacingMultiplier: (spacingMultiplier: number) => void;
    droneCount: number;
    setDroneCount: (droneCount: number) => void;
}

// 이 파일은 설정 패널을 구현하는 React 컴포넌트입니다. 사용자는 이 패널을 통해 재생 속도, 드론 간격, 드론 수량 등의 설정을 조정할 수 있습니다.
const SettingsPanel = ({
    showSettings,
    setShowSettings,
    speedMultiplier,
    setSpeedMultiplier,
    spacingMultiplier,
    setSpacingMultiplier,
    droneCount,
    setDroneCount
}: SettingsPanelProps) => {
    return (
        <div className="absolute top-10 right-4 flex flex-col items-end gap-2 z-20">
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg border transition-all ${showSettings ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
            >
                <Settings size={20} />
            </button>
            
            {showSettings && (
                <div className="bg-gray-800/90 backdrop-blur border border-gray-600 p-4 rounded-lg shadow-xl w-72 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-300 font-medium">
                            <span className="flex items-center gap-1"><Gauge size={12}/> 재생속도</span>
                            <span className="text-blue-400">x{speedMultiplier.toFixed(1)}</span>
                        </div>
                        <input type="range" min="0.1" max="5.0" step="0.1" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg accent-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-300 font-medium">
                            <span className="flex items-center gap-1"><Move size={12}/> 드론 간격</span>
                            <span className="text-purple-400">x{spacingMultiplier.toFixed(1)}</span>
                        </div>
                        <input type="range" min="0.5" max="3.0" step="0.1" value={spacingMultiplier} onChange={(e) => setSpacingMultiplier(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg accent-purple-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-300 font-medium">
                            <span className="flex items-center gap-1"><Users size={12}/> 드론 개수</span>
                            <span className="text-green-400">{droneCount} 개</span>
                        </div>
                        <input type="range" min="100" max="3000" step="100" value={droneCount} onChange={(e) => setDroneCount(parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg accent-green-500" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPanel;