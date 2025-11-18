// 이 파일은 설정 패널을 구현하는 React 컴포넌트입니다. 사용자는 이 패널을 통해 재생 속도, 드론 간격, 드론 수량 등의 설정을 조정할 수 있습니다.
import { Info } from 'lucide-react';

interface SettingsPanelProps {
    showInfo: boolean;
    setShowInfo: (showInfo: boolean) => void;

}

const InfoPanel = ({
    showInfo,
    setShowInfo,
}: SettingsPanelProps) => {
    return (
        <div className="absolute top-25 right-4 flex flex-col items-end gap-2 z-20">
            <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-lg border transition-all ${showInfo ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
            >
                <Info size={20} />
            </button>

            {showInfo && (
                <div className="bg-gray-800/90 backdrop-blur border border-gray-600 p-4 rounded-lg shadow-xl w-72 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                    <h2 className="text-lg font-bold text-white">정보</h2>
                    <p className="text-sm text-gray-300">
                        React: 17.0.2<br/>
                        Three.js: r140<br/>
                        Tailwind CSS: 3.3.2<br/>
                        Lucide Icons: 0.257.0<br/>
                        TypeScript: 4.9.5<br/>
                    </p>
                   <a href="https://github.com/INMD1-Repo/Visualcomputing-Dron" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                     GitHub Repository
                   </a>
                </div>
            )}
        </div>
    );
};

export default InfoPanel;