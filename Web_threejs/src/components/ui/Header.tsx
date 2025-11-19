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
    <>
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/60 px-12 pt-4 pb-3 rounded-full backdrop-blur-md border border-gray-600 grid items-center  shadow-2xl z-10 transition-all">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <FileJson size={16} className="text-yellow-400" />
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
        <div className='text-center'>
          <span className="text-xs text-white font-bold hidden sm:inline">2025 2학기 비주얼컴퓨팅 기발고사 대체 프로젝트</span> <br />
          <span className="text-xs text-white font-bold hidden sm:inline">Ver 0.0.1 </span><br />
          <span className="text-xs text-gray-400 hidden sm:inline">Made by 이호준, 권영훈, 김규담</span>
        </div>

      </div>

    </>
  );
};

export default Header;