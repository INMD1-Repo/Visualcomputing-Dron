import cv2
import json
import numpy as np
import os

def image_to_drone_json(image_path, output_path, drone_count=10000, max_size=100):
    """
    이미지를 읽어 드론 쇼 JSON 데이터로 변환합니다.
    - 내부 채우기 (Interior Filling) 지원
    - 이미지 색상 (Color Extraction) 반영
    """
    # 이미지 읽기 (컬러)
    # 이미지 읽기 (알파 채널 포함 확인)
    img_raw = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img_raw is None:
        print(f"오류: 이미지를 읽을 수 없습니다: {image_path}")
        return

    # 컬러 이미지와 마스크 준비
    if img_raw.shape[2] == 4:
        # 알파 채널이 있는 경우
        img_color = img_raw[:, :, :3]
        alpha = img_raw[:, :, 3]
        # 알파 채널을 마스크로 사용 (투명하지 않은 부분만)
        _, mask = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
    else:
        # 알파 채널이 없는 경우 (BGR)
        img_color = img_raw
        img_gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)
        
        # 배경 제거를 위한 이진화
        # 흰색 배경(255)을 제외하고, 밝은 색상도 포함하기 위해 임계값을 높게 설정(245)
        # 245보다 밝은 픽셀(거의 흰색)은 0(배경), 그 외는 255(객체)로 만듦
        # 배경이 흰색이라고 가정하고 반전시킴
        _, mask = cv2.threshold(img_gray, 245, 255, cv2.THRESH_BINARY_INV)

    # 윤곽선(Contours) 찾기
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        print("이미지에서 윤곽선을 찾을 수 없습니다.")
        return

    # 내부를 채우기 위한 마스크 생성 (빈 구멍 메우기)
    # 기존 마스크에 윤곽선 내부를 채워넣음
    cv2.drawContours(mask, contours, -1, 255, thickness=cv2.FILLED)

    # 마스크에서 픽셀 좌표 추출 (내부 포함)
    y_coords, x_coords = np.where(mask > 0)
    all_points = np.column_stack((x_coords, y_coords))

    if len(all_points) == 0:
        print("유효한 영역을 찾을 수 없습니다.")
        return

    # 점들에서 샘플링
    total_points = len(all_points)
    
    if total_points >= drone_count:
        indices = np.random.choice(total_points, drone_count, replace=False)
    else:
        print(f"경고: 영역 내 점의 수({total_points})가 드론 수({drone_count})보다 적습니다. 중복을 허용하여 샘플링합니다.")
        indices = np.random.choice(total_points, drone_count, replace=True)
        
    sampled_points = all_points[indices]

    # 좌표 정규화 및 스케일링
    x_min, y_min = np.min(sampled_points, axis=0)
    x_max, y_max = np.max(sampled_points, axis=0)

    # 가로, 세로 중 더 큰 쪽을 max_size에 맞춤
    width = x_max - x_min
    height = y_max - y_min
    
    scale_x = max_size / width if width > 0 else 1
    scale_y = max_size / height if height > 0 else 1
    scale = min(scale_x, scale_y)

    # 1. 모든 샘플링된 점의 색상 정보 수집
    temp_points = []
    unique_colors = set()
    
    for x, y in sampled_points:
        # 색상 추출 (BGR -> Hex)
        b, g, r = img_color[y, x]
        hex_color = "#{:02x}{:02x}{:02x}".format(r, g, b)
        unique_colors.add(hex_color)

        # 도형의 중심을 (0, 0)으로 맞춤
        norm_x = (x - x_min - width / 2) * scale
        # 이미지의 Y축은 아래로 증가하므로, 3D 좌표계(위로 증가)에 맞게 반전
        norm_y = -(y - y_min - height / 2) * scale
        
        temp_points.append({
            "x": norm_x,
            "y": norm_y,
            "color": hex_color
        })

    # 2. 색상별 Z축 레이어 할당
    # 색상을 정렬하여 레이어 순서를 일정하게 만듦
    sorted_colors = sorted(list(unique_colors))
    # 색상 개수가 많을 경우를 대비해 레이어 간격을 조절하거나 순환시킬 수 있음
    # 색상이 너무 많으면 Z축이 너무 높아지므로, 적절한 수의 레이어로 순환시킵니다.
    z_gap = 10.0
    max_layers = 30
    color_to_z = {color: (i % max_layers) * z_gap for i, color in enumerate(sorted_colors)}
    
    print(f"감지된 고유 색상 수: {len(sorted_colors)}")
    
    points_for_json = []
    for p in temp_points:
        z = color_to_z[p["color"]]
        points_for_json.append({"x": p["x"], "y": p["y"], "z": z, "color": p["color"]})

    # JSON 구조 생성
    drone_show_data = {
        "title": "Image Drone Show",
        "layers": [
            {
                "id": "layer_01_image",
                "name": "Image Shape",
                "type": "custom",
                "duration": 500,
                "points": points_for_json
            }
        ]
    }

    # JSON 파일 쓰기
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(drone_show_data, f, indent=2, ensure_ascii=False)
    print(f"성공적으로 생성되었습니다: {output_path}")

if __name__ == '__main__':
    # 이미지 변환 실행
    # 사용자가 준비한 image.png를 사용합니다.
    # drone_count와 max_size를 조절하여 드론 수와 크기를 변경할 수 있습니다.
    # 의상 등 디테일을 잘 표현하기 위해 드론 수와 크기를 늘립니다.
    image_to_drone_json("image.png", "example-drone-show.json", drone_count=13923, max_size=600)