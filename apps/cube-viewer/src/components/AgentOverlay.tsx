import React, { useEffect, useRef } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { usePaymentStore } from '../stores/paymentStore';

type FilterType = 'all' | 'crypto_qr' | 'virtual_card' | 'on_off_ramp' | 'ens_payment';

interface AgentOverlayProps {
  filter: FilterType;
}

export const AgentOverlay: React.FC<AgentOverlayProps> = ({ filter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { agents } = useAgentStore();
  const { selectAgent } = usePaymentStore();

  // Filter agents based on selected filter
  const filteredAgents = filter === 'all' 
    ? agents 
    : agents.filter(agent => (agent as any).agent_type === filter);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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

        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 64, 175, 0.8)'; // Blue
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw agent name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.agent_name, x, y + 50);
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    />
  );
};
