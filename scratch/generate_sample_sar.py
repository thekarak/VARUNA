"""
Generates calibrated Sentinel-1 C-SAR radar backscatter sample imagery.
In SAR imagery:
- Clean ocean surface has high backscatter (speckled bright gray, ~0.08 - 0.25 sigma0) due to capillary wave Bragg scattering.
- Oil slicks dampen surface capillary waves, resulting in low backscatter (dark patches, ~0.01 - 0.05 sigma0).
- Land/vessels have very high backscatter (bright white).
"""
import numpy as np
import cv2
import os

def generate_sar_sample(output_path: str, width=512, height=512, seed=42):
    np.random.seed(seed)
    
    # 1. Base ocean background with Rayleigh / K-distribution SAR speckle clutter
    # SAR intensity follows gamma distribution (sum of looks)
    looks = 4
    scale = 140.0 / looks
    ocean_clutter = np.random.gamma(shape=looks, scale=scale, size=(height, width)).astype(np.float32)
    ocean_clutter = np.clip(ocean_clutter, 40, 240)
    
    # Add subtle ocean swell waves pattern
    x = np.linspace(0, 10 * np.pi, width)
    y = np.linspace(0, 10 * np.pi, height)
    xv, yv = np.meshgrid(x, y)
    swell = 15.0 * np.sin(xv * 0.8 + yv * 0.6)
    sar_image = np.clip(ocean_clutter + swell, 20, 255).astype(np.uint8)
    
    # 2. Add realistic operational oil slick (elongated fluid lobe with feathering edges)
    mask = np.zeros((height, width), dtype=np.uint8)
    center = (int(width * 0.48), int(height * 0.52))
    
    # Core heavy emulsion slick (darkest, strong capillary damping)
    axes_main = (int(width * 0.22), int(height * 0.11))
    cv2.ellipse(mask, center, axes_main, angle=-28, startAngle=0, endAngle=360, color=255, thickness=-1)
    
    # Trailing dispersion lobes (wind/current shear)
    lobe_center1 = (int(center[0] - width * 0.12), int(center[1] + height * 0.06))
    cv2.ellipse(mask, lobe_center1, (int(axes_main[0] * 0.6), int(axes_main[1] * 0.5)), angle=-35, startAngle=0, endAngle=360, color=255, thickness=-1)
    
    lobe_center2 = (int(center[0] + width * 0.15), int(center[1] - height * 0.08))
    cv2.ellipse(mask, lobe_center2, (int(axes_main[0] * 0.5), int(axes_main[1] * 0.4)), angle=-20, startAngle=0, endAngle=360, color=255, thickness=-1)
    
    # Blur mask for natural hydrodynamic boundary gradation
    mask_blurred = cv2.GaussianBlur(mask, (31, 31), 11.0) / 255.0
    
    # Apply damping to radar image: oil reduces backscatter by 70% - 90%
    damping_factor = 1.0 - (mask_blurred * 0.82)
    sar_damped = (sar_image.astype(np.float32) * damping_factor).astype(np.uint8)
    
    # Add speckle back inside slick (slick is not pitch black, has ~25-45 intensity)
    slick_speckle = np.random.gamma(shape=2, scale=15.0, size=(height, width)).astype(np.float32)
    sar_final = np.where(mask > 0, np.clip(sar_damped + (slick_speckle * 0.3), 15, 75).astype(np.uint8), sar_damped)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, sar_final)
    print(f"Generated calibrated SAR patch: {output_path} ({width}x{height})")
    return output_path

if __name__ == '__main__':
    generate_sar_sample("data/sar/sentinel1_sample_slick.png", seed=101)
    generate_sar_sample("data/sar/sentinel1_kutch_slick.png", seed=202)
    generate_sar_sample("data/sar/sentinel1_mumbai_slick.png", seed=303)
