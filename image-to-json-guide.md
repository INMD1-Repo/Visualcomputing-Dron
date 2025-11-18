
# 가이드: 이미지를 드론 쇼 JSON으로 변환하기

이 가이드는 **이미지를 드론 쇼 시뮬레이션에서 사용할 수 있는 JSON 파일로 변환하는 방법**을 설명합니다. 이 과정은 이미지에서 좌표를 추출하고, 이를 특정 JSON 구조에 맞게 정리하는 절차로 구성됩니다.


## 1. JSON 구조

드론 시뮬레이션은 여러 개의 “레이어(layer)” 또는 “장면(scene)”으로 구성된 JSON 파일을 사용합니다. 각 레이어는 드론들이 특정 형태를 만드는 하나의 장면입니다.

기본 JSON 구조는 다음과 같습니다:

```json
{
  "title": "My Awesome Drone Show",
  "layers": [
    {
      "id": "layer_01",
      "name": "Shape 1",
      "type": "custom",
      "duration": 5000,
      "points": [
        { "x": 10, "y": 20, "z": 0, "color": "#FFFFFF" },
        { "x": 15, "y": 25, "z": 5, "color": "#00FFFF" }
      ]
    },
    {
      "id": "layer_02",
      "name": "Shape 2",
      "type": "custom",
      "duration": 5000,
      "points": [
        { "x": -10, "y": -20, "z": 0, "color": "#FF00FF" },
        { "x": -15, "y": -25, "z": -5, "color": "#FFFF00" }
      ]
    }
  ]
}
```

### **필드 설명**

* **title**: 드론 쇼의 제목
* **layers**: 장면(레이어)을 담은 배열
* **id**: 레이어의 고유 ID
* **name**: UI에 표시되는 레이어 이름
* **type**: 이미지 기반 커스텀 형태는 `"custom"`
* **duration**: 장면 지속 시간(밀리초)
* **points**: 드론들의 좌표 배열

  * **x, y, z**: 3D 공간 좌표
  * **color**: 드론 색상(HEX 색상 코드)

---

## 2. 이미지 → 좌표 변환

이미지를 좌표로 변환하려면 **OpenCV** 같은 이미지 처리 라이브러리를 사용할 수 있습니다.
핵심 아이디어는:

1. 이미지에서 **윤곽선(contours)** 또는 **모서리(edge)** 를 찾고
2. 그 윤곽선에서 점들을 샘플링해
3. 드론의 위치로 변환하는 것입니다.

---

### 사전 준비

아래 라이브러리를 설치합니다:

```bash
pip install opencv-python-headless Pillow numpy
```

---

### Python 스크립트

```python
import cv2
import json
import numpy as np
from PIL import Image

def image_to_drone_json(image_path, output_path, drone_count=1000, max_size=100):
    """
    이미지를 드론 쇼 JSON 파일로 변환합니다.

    Args:
        image_path (str): 입력 이미지 경로
        output_path (str): 출력 JSON 경로
        drone_count (int): 사용할 드론 수
        max_size (int): 시뮬레이터 기준 최대 크기
    """
    # Read the image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print(f"Error: Could not read image at {image_path}")
        return

    # Invert the image if it has a white background
    if np.mean(img) > 128:
        img = 255 - img
        
    # Find contours
    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    all_points = []
    for contour in contours:
        for point in contour:
            all_points.append(point[0])

    if not all_points:
        print("No contours found in the image.")
        return

    # Sample points from the contours
    all_points = np.array(all_points)
    total_points = len(all_points)
    indices = np.random.choice(total_points, drone_count, replace=True)
    sampled_points = all_points[indices]

    # Normalize and scale the points
    x_min, y_min = np.min(sampled_points, axis=0)
    x_max, y_max = np.max(sampled_points, axis=0)

    scale_x = max_size / (x_max - x_min) if (x_max - x_min) > 0 else 1
    scale_y = max_size / (y_max - y_min) if (y_max - y_min) > 0 else 1
    scale = min(scale_x, scale_y)

    points_for_json = []
    for x, y in sampled_points:
        # Center the shape
        norm_x = (x - x_min) * scale - (max_size / 2)
        # Invert y-axis for screen coordinates
        norm_y = -(y - y_min) * scale + (max_size / 2)
        points_for_json.append({"x": norm_x, "y": norm_y, "z": 0, "color": "#FFFFFF"})
        
    # Create the JSON structure
    drone_show_data = {
        "title": "Image Drone Show",
        "layers": [
            {
                "id": "layer_01_image",
                "name": "Image Shape",
                "type": "custom",
                "duration": 5000,
                "points": points_for_json
            }
        ]
    }

    # Write the JSON file
    with open(output_path, 'w') as f:
        json.dump(drone_show_data, f, indent=2)
    print(f"Successfully created {output_path}")


if __name__ == '__main__':
    # Example usage:
    # Create a dummy image for testing
    dummy_image = np.zeros((100, 100), dtype=np.uint8)
    cv2.circle(dummy_image, (50, 50), 30, (255, 255, 255), 2)
    cv2.imwrite("test_image.png", dummy_image)
    
    image_to_drone_json("test_image.png", "drone_show.json")
```

---

### 사용 방법

1. 스크립트를 `converter.py` 같은 이름으로 저장합니다.
2. 변환할 이미지를 같은 폴더에 넣습니다.
3. 실행합니다:

```bash
python converter.py
```

4. 실행 후 같은 폴더에 `drone_show.json` 파일이 생성됩니다.
5. 생성된 JSON 파일을 드론 쇼 시뮬레이터에 업로드하면 됩니다.

---

## 3. 여러 개 레이어 만들기

여러 개의 이미지를 각각 JSON으로 변환한 뒤, 각 JSON의 `layers` 항목을 합쳐 하나의 파일로 만들면 됩니다.

예 →

**`show1.json`:**

```json
{
  "title": "Show 1",
  "layers": [ { ... layer 1 ... } ]
}
```

**`show2.json`:**

```json
{
  "title": "Show 2",
  "layers": [ { ... layer 2 ... } ]
}
```

**병합 후(`combined_show.json`)**

```json
{
  "title": "Combined Show",
  "layers": [
    { ... layer 1 ... },
    { ... layer 2 ... }
  ]
}
```

**주의:** 레이어별 `id`는 반드시 고유해야 합니다.
