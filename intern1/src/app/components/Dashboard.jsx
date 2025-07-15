"use client";
import Terminal from "./newterminal";
import useFullscreenAndRotate from "../../hooks/useFullscreenAndRotate";

export default function Dashboard() {
  const {
    isFullScreen,
    isRotateOnly,
    enterFullScreenAndRotate
  } = useFullscreenAndRotate();

  return (
    <div className="text-center">
      <Terminal
        onClickRotate={enterFullScreenAndRotate}
        isFullScreen={isFullScreen}
        isRotateOnly={isRotateOnly}
      />
    </div>
  );
}
