// 이 파일은 'Header' 컴포넌트를 정의하며, 현재 활성화된 세그먼트(장면 및 단계)를 화면 상단에 표시합니다.
import { FileJson } from 'lucide-react';
import { DRONE_SHOW_JSON } from '../../timeline';

interface Segment {
    id: string;
    name: string;
    type: string;
    duration: number;
    startTime: number;
    endTime: number;
    index: number;
}

interface HeaderProps {
    activeSegment: Segment;
}

// 이 파일은 'Header' 컴포넌트를 정의하며, 현재 활성화된 세그먼트(장면 및 단계)를 화면 상단에 표시합니다.
const Header = ({ activeSegment }: HeaderProps) => {
    return (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-gray-600 flex items-center gap-4 shadow-2xl z-10 transition-all">
           <div className="flex items-center gap-2">
             <FileJson size={16} className="text-yellow-400"/>
             <span className="text-xs text-gray-400 hidden sm:inline">SCENE</span>
           </div>
           <div className="h-4 w-px bg-gray-600 hidden sm:block"></div>
           <span className="text-lg font-bold text-white tracking-wider">
             {activeSegment?.name || "Loading..."}
           </span>
           <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-white font-mono whitespace-nowrap">
             Step {activeSegment?.index + 1}/{DRONE_SHOW_JSON.layers.length}
           </span>
        </div>
    );
};

export default Header;