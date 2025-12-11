/**
 * Notification Sound Utility
 * Generates notification sounds using Web Audio API
 * 
 * @module utils/notificationSound
 */

let audioContext = null;

/**
 * Initialize audio context (must be called after user interaction)
 */
export const initAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Play a notification sound
 * @param {string} type - Sound type: 'info', 'success', 'warning', 'urgent'
 */
export const playNotificationSound = (type = 'info') => {
    try {
        const ctx = initAudio();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const sounds = {
            info: { freq: 800, duration: 0.15, type: 'sine' },
            success: { freq: 1000, duration: 0.1, type: 'sine', secondFreq: 1200 },
            warning: { freq: 600, duration: 0.2, type: 'triangle' },
            urgent: { freq: 400, duration: 0.3, type: 'square', repeat: 3 },
        };

        const config = sounds[type] || sounds.info;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + config.duration);

        // Second tone for success
        if (config.secondFreq) {
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(config.secondFreq, ctx.currentTime);
                gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(ctx.currentTime);
                osc2.stop(ctx.currentTime + 0.15);
            }, 100);
        }

        // Repeat for urgent
        if (config.repeat) {
            for (let i = 1; i < config.repeat; i++) {
                setTimeout(() => playNotificationSound('warning'), i * 200);
            }
        }
    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
};

/**
 * Map notification priority to sound type
 */
export const getSoundForPriority = (priority) => {
    const mapping = {
        urgent: 'urgent',
        high: 'warning',
        normal: 'info',
        low: 'info',
    };
    return mapping[priority] || 'info';
};

export default { initAudio, playNotificationSound, getSoundForPriority };
