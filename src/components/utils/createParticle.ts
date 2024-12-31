interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  life: number;
}

export function createParticle(x: number, y: number, color: string): Particle {
  return {
    x,
    y,
    radius: Math.random() * 3 + 1,
    color,
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4
    },
    life: 100
  };
}