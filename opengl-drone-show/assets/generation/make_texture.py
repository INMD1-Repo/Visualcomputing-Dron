import cv2
import numpy as np

def create_drone_texture(filename):
    # 64x64 transparent image
    img = np.zeros((64, 64, 4), dtype=np.uint8)
    
    # Center coordinates
    center = (32, 32)
    radius = 20
    
    # Draw a white circle with some glow (soft edges)
    # Core
    cv2.circle(img, center, radius, (255, 255, 255, 255), -1)
    
    # Glow (optional, simple anti-aliasing)
    # cv2.GaussianBlur could be used, but simple circle is fine for now.
    # Let's add a slight fade out at the edges
    for r in range(radius, radius + 5):
        alpha = int(255 * (1 - (r - radius) / 5))
        cv2.circle(img, center, r, (255, 255, 255, alpha), 1)

    cv2.imwrite(filename, img)
    print(f"Created {filename}")

if __name__ == "__main__":
    create_drone_texture("../drone.png")
