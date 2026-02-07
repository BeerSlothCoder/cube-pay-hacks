import { useEffect, useRef, useState } from "react";

const RotatableCube = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cubeWrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: -20, y: 20 });
  const previousPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const autoRotatingRef = useRef(false);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const point = "touches" in e ? e.touches[0] : e;
      const deltaX = point.clientX - previousPos.current.x;
      const deltaY = point.clientY - previousPos.current.y;

      velocity.current = { x: deltaX, y: deltaY };

      setRotation((prev) => ({
        x: prev.x - deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      previousPos.current = { x: point.clientX, y: point.clientY };
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // Apply momentum
      const applyMomentum = () => {
        if (
          Math.abs(velocity.current.x) > 0.5 ||
          Math.abs(velocity.current.y) > 0.5
        ) {
          setRotation((prev) => ({
            x: prev.x - velocity.current.y * 0.3,
            y: prev.y + velocity.current.x * 0.3,
          }));

          velocity.current.x *= 0.95;
          velocity.current.y *= 0.95;

          requestAnimationFrame(applyMomentum);
        }
      };
      applyMomentum();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    // Auto-rotate on mount
    autoRotatingRef.current = true;
    const rotate = () => {
      if (!autoRotatingRef.current) return;
      setRotation((prev) => ({
        x: prev.x + 0.2,
        y: prev.y + 0.5,
      }));
      animationIdRef.current = requestAnimationFrame(rotate);
    };
    rotate();

    return () => {
      autoRotatingRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    autoRotatingRef.current = false;
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    setIsDragging(true);
    const point = "touches" in e ? e.touches[0] : e;
    previousPos.current = { x: point.clientX, y: point.clientY };
    velocity.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={sceneRef}
      className="cube-scene"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      style={{
        width: "120px",
        height: "120px",
        perspective: "1000px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      <div
        ref={cubeWrapperRef}
        className="cube-wrapper"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        <div
          className="cube"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front */}
          <div
            className="cube-face"
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "2px solid rgba(142, 70, 50, 0.3)",
              background:
                "linear-gradient(135deg, hsl(142, 70%, 45%), hsl(142, 70%, 35%))",
              boxShadow:
                "inset 0 0 50px rgba(0, 0, 0, 0.1), 0 0 20px rgba(142, 70, 50, 0.2)",
              transform: "rotateY(0deg) translateZ(60px)",
              color: "white",
            }}
          >
            <span>Crypto Pay</span>
          </div>

          {/* Back */}
          <div
            className="cube-face"
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "2px solid rgba(142, 70, 50, 0.3)",
              background:
                "linear-gradient(135deg, hsl(142, 60%, 45%), hsl(142, 60%, 35%))",
              boxShadow:
                "inset 0 0 50px rgba(0, 0, 0, 0.1), 0 0 20px rgba(142, 60, 45, 0.2)",
              transform: "rotateY(180deg) translateZ(60px)",
              color: "white",
            }}
          >
            <span>Card Pay</span>
          </div>

          {/* Right */}
          <div
            className="cube-face"
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "2px solid rgba(142, 70, 50, 0.3)",
              background:
                "linear-gradient(135deg, hsl(160, 80%, 40%), hsl(160, 80%, 30%))",
              boxShadow:
                "inset 0 0 50px rgba(0, 0, 0, 0.1), 0 0 20px rgba(160, 80, 40, 0.2)",
              transform: "rotateY(90deg) translateZ(60px)",
              color: "white",
            }}
          >
            <span>Sound Pay</span>
          </div>

          {/* Left */}
          <div
            className="cube-face"
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "2px solid rgba(142, 70, 50, 0.3)",
              background:
                "linear-gradient(135deg, hsl(150, 70%, 45%), hsl(150, 70%, 35%))",
              boxShadow:
                "inset 0 0 50px rgba(0, 0, 0, 0.1), 0 0 20px rgba(150, 70, 45, 0.2)",
              transform: "rotateY(-90deg) translateZ(60px)",
              color: "white",
            }}
          >
            <span>Voice Pay</span>
          </div>

          {/* Top */}
          <div
            className="cube-face"
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "2px solid rgba(142, 70, 50, 0.3)",
              background:
                "linear-gradient(135deg, hsl(142, 65%, 50%), hsl(142, 65%, 40%))",
              boxShadow:
                "inset 0 0 50px rgba(0, 0, 0, 0.1), 0 0 20px rgba(142, 65, 50, 0.2)",
              transform: "rotateX(90deg) translateZ(60px)",
              color: "white",
            }}
          >
            <span>ENS</span>
          </div>

          {/* Bottom */}
          <div
            className="cube-face"
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "2px solid rgba(142, 70, 50, 0.3)",
              background:
                "linear-gradient(135deg, hsl(155, 70%, 45%), hsl(155, 70%, 35%))",
              boxShadow:
                "inset 0 0 50px rgba(0, 0, 0, 0.1), 0 0 20px rgba(155, 70, 45, 0.2)",
              transform: "rotateX(-90deg) translateZ(60px)",
              color: "white",
            }}
          >
            <span>On/Off Ramo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatableCube;
