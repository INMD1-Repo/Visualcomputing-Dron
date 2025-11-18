// 이 파일은 드론 쇼를 위한 파일 입력 컴포넌트를 포함합니다.
import React from 'react';

interface FileInputProps {
    onFileLoad: (data: any) => void;
}

const FileInput = ({ onFileLoad }: FileInputProps) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    onFileLoad(json);
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                    alert("Invalid JSON file.");
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="absolute top-10 left-4 z-20">
            <label htmlFor="file-upload" className="bg-gray-800 border border-gray-600 text-gray-400 hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
                Load JSON
            </label>
            <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>
    );
};

export default FileInput;
