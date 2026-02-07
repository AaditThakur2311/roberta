// Screen shake utility for critical events
export const triggerScreenShake = (intensity: number = 5, duration: number = 200) => {
    const root = document.getElementById('root');
    if (!root) return;

    const startTime = Date.now();

    const shake = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
            root.style.transform = 'translate(0, 0)';
            return;
        }

        const currentIntensity = intensity * (1 - progress);
        const x = (Math.random() - 0.5) * currentIntensity;
        const y = (Math.random() - 0.5) * currentIntensity;

        root.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(shake);
    };

    shake();
};

// Expose to window for 3D components
(window as any).__triggerScreenShake = triggerScreenShake;
