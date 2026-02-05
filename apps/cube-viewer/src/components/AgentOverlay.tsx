import React, { useEffect, useRef } from "react";
import { useAgentStore } from "../stores/agentStore";
import { usePaymentStore } from "../stores/paymentStore";
import {
  normalizeAgentType,
  isVirtualTerminal,
} from "../utils/agentTypeMapping";

type FilterType =
  | "all"
  | "crypto_qr"
  | "virtual_card"
  | "on_off_ramp"
  | "ens_payment";

interface AgentOverlayProps {
  filter: FilterType;
}

export const AgentOverlay: React.FC<AgentOverlayProps> = ({ filter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { agents } = useAgentStore();
  const { selectAgent } = usePaymentStore();

  // Filter agents based on selected filter
  // Normalizes agent types for backward compatibility
  const filteredAgents =
    filter === "all"
      ? agents
      : agents.filter((agent) => {
          const normalizedType = normalizeAgentType(agent.agent_type || null);
          return normalizedType === filter;
        });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawAgents();
    };

    const drawAgents = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      filteredAgents.forEach((agent) => {
        const x = (agent.screen_position.x / 100) * canvas.width;
        const y = (agent.screen_position.y / 100) * canvas.height;

        // Determine color based on ENS status
        const baseColor = agent.ens_payment_enabled
          ? "rgba(245, 158, 11, 0.8)" // Amber for ENS-enabled
          : "rgba(30, 64, 175, 0.8)"; // Blue for normal

        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.strokeStyle = agent.ens_payment_enabled ? "#F59E0B" : "white";
        ctx.lineWidth = agent.ens_payment_enabled ? 4 : 3;
        ctx.stroke();

        // Draw ENS badge if enabled
        if (agent.ens_payment_enabled) {
          ctx.beginPath();
          ctx.arc(x + 25, y - 25, 8, 0, Math.PI * 2);
          ctx.fillStyle = agent.ens_verified ? "#22C55E" : "#EAB308";
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 8px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(agent.ens_verified ? "✓" : "Ξ", x + 25, y - 25);
        }

        // Draw agent name
        ctx.fillStyle = "white";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(agent.agent_name, x, y + 50);

        // Draw ENS domain if available
        if (agent.ens_domain) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.font = "10px monospace";
          ctx.fillText(agent.ens_domain, x, y + 65);
        }
      });
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [filteredAgents]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if click is within any agent circle
    for (const agent of filteredAgents) {
      const x = (agent.screen_position.x / 100) * canvas.width;
      const y = (agent.screen_position.y / 100) * canvas.height;

      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);

      if (distance <= 30) {
        selectAgent(agent);
        break;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        pointerEvents: "auto",
      }}
    />
  );
};
