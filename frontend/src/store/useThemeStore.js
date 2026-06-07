import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("aurev-theme") || "dark",
  fontSize: parseInt(localStorage.getItem("aurev-font-size") || "14", 10),
  density: localStorage.getItem("aurev-density") || "cozy",
  
  // New Cinematic Parameters
  motionIntensity: parseFloat(localStorage.getItem("aurev-motion-intensity") || "1.0"),
  glassTransparency: parseFloat(localStorage.getItem("aurev-glass-transparency") || "0.3"),
  uiSharpness: localStorage.getItem("aurev-ui-sharpness") || "smooth",

  setTheme: (theme) => {
    localStorage.setItem("aurev-theme", theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },

  setFontSize: (size) => {
    localStorage.setItem("aurev-font-size", size.toString());
    document.documentElement.style.fontSize = `${size}px`;
    set({ fontSize: size });
  },

  setDensity: (density) => {
    localStorage.setItem("aurev-density", density);
    document.documentElement.dataset.density = density;
    set({ density });
  },



  setMotionIntensity: (intensity) => {
    localStorage.setItem("aurev-motion-intensity", intensity.toString());
    document.documentElement.style.setProperty("--aurev-motion", intensity);
    set({ motionIntensity: intensity });
  },

  setGlassTransparency: (transparency) => {
    localStorage.setItem("aurev-glass-transparency", transparency.toString());
    document.documentElement.style.setProperty("--aurev-glass-opacity", transparency);
    set({ glassTransparency: transparency });
  },

  setUiSharpness: (sharpness) => {
    localStorage.setItem("aurev-ui-sharpness", sharpness);
    document.documentElement.dataset.sharpness = sharpness;
    set({ uiSharpness: sharpness });
  },

  initTheme: () => {
    const state = get();
    
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.style.fontSize = `${state.fontSize}px`;
    document.documentElement.dataset.density = state.density;
    document.documentElement.dataset.sharpness = state.uiSharpness;
    
    const root = document.documentElement;
    
    root.style.setProperty("--aurev-motion", state.motionIntensity);
    root.style.setProperty("--aurev-glass-opacity", state.glassTransparency);
  },
}));
