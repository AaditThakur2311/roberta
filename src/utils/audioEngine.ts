export class AudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private soundEnabled: boolean = false;
    private activeVoices: number = 0;
    private maxVoices: number = 3;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
                this.masterGain = this.ctx.createGain();
                this.masterGain.connect(this.ctx.destination);
                this.masterGain.gain.value = 0.3; // Default volume
            }
        }
    }

    public toggleSound(enabled: boolean) {
        this.soundEnabled = enabled;
        if (this.ctx?.state === 'suspended' && enabled) {
            this.ctx.resume();
        }
    }

    public playCompletionSound(category: string) {
        if (!this.soundEnabled || !this.ctx || !this.masterGain) return;

        // Voice Limiter (Item 10)
        if (this.activeVoices >= this.maxVoices) return;

        this.activeVoices++;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Unique frequency by category
        const freqs: Record<string, number> = {
            physical: 220, // A3
            mental: 440,   // A4
            social: 554.37, // C#5
            creative: 659.25 // E5
        };

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[category] || 440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqs[category] * 2, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);

        setTimeout(() => {
            this.activeVoices--;
        }, 500);
    }
}

// Global instance
export const audioEngine = new AudioEngine();
if (typeof window !== 'undefined') {
    (window as any).__audioEngine = audioEngine;
}
