import React, { useEffect, useRef } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { usePaymentStore } from '../stores/paymentStore';

export const AgentOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { agents } = useAgentStore();
  const { selectAgent } = usePaymentStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw agents at their screen positions
      agents.forEach(agent => {
        if (!agent.screen_position) return;

        const x = (agent.screen_position.x / 100) * canvas.width;
        const y = (agent.screen_position.y / 100) * canvas.height;

        // Draw agent circle
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 64, 175, 0.8)'; // Blue
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw agent name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.agent_name, x, y + 50);
      });
    };

    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, [agents]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is within any agent circle
    agents.forEach(agent => {
      if (!agent.screen_position) return;

      const agentX = (agent.screen_position.x / 100) * canvas.width;
      const agentY = (agent.screen_position.y / 100) * canvas.height;

      const distance = Math.sqrt((x - agentX) ** 2 + (y - agentY) ** 2);
      
      if (distance <= 30) {
        selectAgent(agent);
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute inset-0 pointer-events-auto cursor-pointer"
      style={{ zIndex: 10 }}
    />
  );
};
