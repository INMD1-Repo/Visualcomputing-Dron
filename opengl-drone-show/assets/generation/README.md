# Drone Show Generator (Image to JSON)

이 스크립트(`index.py`)는 이미지를 읽어 드론 쇼를 위한 JSON 데이터 파일로 변환하는 도구입니다.

## 기능

- **이미지 변환**: 이미지의 픽셀 좌표를 드론의 3D 좌표로 변환합니다.
- **내부 채우기**: 이미지의 윤곽선 내부를 드론으로 채웁니다.
- **색상 추출**: 원본 이미지의 색상을 유지하여 드론에 할당합니다.
- **레이어 분리**: 색상별로 Z축(높이)을 다르게 하여 입체감을 줍니다.

## 요구 사항 (Dependencies)

이 스크립트를 실행하려면 Python과 다음 라이브러리가 필요합니다.

```bash
pip install opencv-python numpy
```

##  사용 방법

1. 변환할 이미지를 **`image.png`**라는 이름으로 이 폴더에 저장합니다. (배경이 투명하거나 흰색이면 좋습니다.)
2. 터미널에서 다음 명령어를 실행합니다.

```bash
python index.py
```

3. 실행이 완료되면 **`example-drone-show.json`** 파일이 생성됩니다.

## 설정 변경

`index.py` 파일의 하단 `main` 블록에서 다음 값을 수정하여 설정을 변경할 수 있습니다.

```python
image_to_drone_json(
    "image.png",                # 입력 이미지 경로
    "example-drone-show.json",  # 출력 JSON 경로
    drone_count=13923,          # 사용할 드론 개수
    max_size=600                # 드론 형상의 최대 크기 (좌표 스케일)
)
```

## 파일 구조

- `index.py`: 변환 스크립트 메인 파일
- `image.png`: (사용자 준비) 입력 이미지 파일
- `example-drone-show.json`: (자동 생성) 출력된 드론 쇼 데이터
