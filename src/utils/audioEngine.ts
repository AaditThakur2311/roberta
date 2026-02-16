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

    public async initialize() {
        if (this.ctx?.state === 'suspended') {
            await this.ctx.resume();
        }
        this.soundEnabled = true;
    }

    public setVolume(vol: number) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(vol, this.ctx?.currentTime || 0, 0.1);
        }
    }

    private humOsc: OscillatorNode | null = null;
    private humGain: GainNode | null = null;

    public startReactorHum(stability: number) {
        if (!this.ctx || !this.soundEnabled) return;
        if (this.humOsc) return;

        this.humOsc = this.ctx.createOscillator();
        this.humGain = this.ctx.createGain();

        this.humOsc.type = 'sawtooth';
        this.humOsc.frequency.value = 40 + (stability * 20); // Base rumble

        // Lowpass filter for muffled sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;

        this.humGain.gain.value = 0.1;

        this.humOsc.connect(filter);
        filter.connect(this.humGain);
        this.humGain.connect(this.masterGain!);

        this.humOsc.start();
    }

    public stopReactorHum() {
        if (this.humOsc) {
            this.humOsc.stop();
            this.humOsc.disconnect();
            this.humOsc = null;
        }
        if (this.humGain) {
            this.humGain.disconnect();
            this.humGain = null;
        }
    }

    public updateReactorPitch(stability: number) {
        if (this.humOsc && this.ctx) {
            const targetFreq = 40 + (stability * 40);
            this.humOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
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
