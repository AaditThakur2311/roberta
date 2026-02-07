// Procedural SVG Artifact Generator
export const generateArtifactSVG = (seed: string, category: string): string => {
    // Simple hash function for deterministic randomness
    const hash = (str: string): number => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h = h & h;
        }
        return Math.abs(h);
    };

    const seedValue = hash(seed);
    const random = (min: number, max: number, offset: number = 0): number => {
        const x = Math.sin(seedValue + offset) * 10000;
        return min + (x - Math.floor(x)) * (max - min);
    };

    // Category-specific color schemes
    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string }> = {
        physical: { primary: '#ff6b6b', secondary: '#ff8787', accent: '#ffa5a5' },
        mental: { primary: '#4dabf7', secondary: '#74c0fc', accent: '#a5d8ff' },
        social: { primary: '#51cf66', secondary: '#8ce99a', accent: '#b2f2bb' },
        creative: { primary: '#cc5de8', secondary: '#e599f7', accent: '#eebefa' }
    };

    const colors = colorSchemes[category] || colorSchemes.mental;

    // Generate geometry based on seed
    const geometryType = Math.floor(random(0, 4, 1));

    let paths = '';

    switch (geometryType) {
        case 0: // Hexagon with inner details
            paths = `
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" 
                 fill="none" stroke="${colors.primary}" stroke-width="2"/>
        <polygon points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" 
                 fill="${colors.secondary}" opacity="0.3"/>
        <circle cx="50" cy="50" r="15" fill="${colors.accent}" opacity="0.5"/>
      `;
            break;
        case 1: // Circuit pattern
            paths = `
        <rect x="20" y="20" width="60" height="60" fill="none" stroke="${colors.primary}" stroke-width="2"/>
        <line x1="20" y1="50" x2="35" y2="50" stroke="${colors.secondary}" stroke-width="2"/>
        <circle cx="35" cy="50" r="5" fill="${colors.accent}"/>
        <line x1="35" y1="50" x2="50" y2="35" stroke="${colors.secondary}" stroke-width="2"/>
        <circle cx="50" cy="35" r="5" fill="${colors.accent}"/>
        <line x1="50" y1="35" x2="65" y2="50" stroke="${colors.secondary}" stroke-width="2"/>
        <circle cx="65" cy="50" r="5" fill="${colors.accent}"/>
        <line x1="65" y1="50" x2="80" y2="50" stroke="${colors.secondary}" stroke-width="2"/>
      `;
            break;
        case 2: // Crystal formation
            paths = `
        <polygon points="50,15 70,35 60,60 40,60 30,35" 
                 fill="${colors.secondary}" opacity="0.4" stroke="${colors.primary}" stroke-width="2"/>
        <polygon points="50,15 60,30 50,45 40,30" 
                 fill="${colors.accent}" opacity="0.6"/>
        <line x1="50" y1="15" x2="50" y2="85" stroke="${colors.primary}" stroke-width="2"/>
        <polygon points="50,85 65,70 50,60 35,70" 
                 fill="${colors.secondary}" opacity="0.4"/>
      `;
            break;
        case 3: // Core reactor symbol
            paths = `
        <circle cx="50" cy="50" r="30" fill="none" stroke="${colors.primary}" stroke-width="2"/>
        <circle cx="50" cy="50" r="20" fill="${colors.secondary}" opacity="0.3"/>
        <circle cx="50" cy="50" r="10" fill="${colors.accent}" opacity="0.6"/>
        <line x1="20" y1="50" x2="35" y2="50" stroke="${colors.primary}" stroke-width="2"/>
        <line x1="65" y1="50" x2="80" y2="50" stroke="${colors.primary}" stroke-width="2"/>
        <line x1="50" y1="20" x2="50" y2="35" stroke="${colors.primary}" stroke-width="2"/>
        <line x1="50" y1="65" x2="50" y2="80" stroke="${colors.primary}" stroke-width="2"/>
      `;
            break;
    }

    return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${seed}">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-${seed})">
        ${paths}
      </g>
    </svg>
  `;
};
