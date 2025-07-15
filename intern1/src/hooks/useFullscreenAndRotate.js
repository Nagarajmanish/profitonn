import { useState, useEffect } from "react";

export default function useFullscreenAndRotate() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRotateOnly, setIsRotateOnly] = useState(false);

  const enterFullScreenAndRotate = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      } else {
        await document.documentElement.requestFullscreen?.() || document.documentElement.webkitRequestFullscreen?.();
      }

      if (screen.orientation?.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch (err) {
          console.log("Orientation lock failed:", err);
        }
      } else {
        setIsRotateOnly(window.innerWidth > window.innerHeight);
      }
    } catch (error) {
      console.log("Fullscreen permission error:", error);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    const handleOrientationChange = () => {
      if (!document.fullscreenElement) {
        setIsRotateOnly(window.innerWidth > window.innerHeight);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return {
    isFullScreen,
    isRotateOnly,
    enterFullScreenAndRotate,
  };
}
