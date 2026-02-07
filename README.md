# CORE: IGNITION

A high-performance, sci-fi habit tracker that gamifies life maintenance as a starship reactor core.

## 🚀 Features

- **3D Reactor Visualization**: Custom GLSL shaders with real-time stability feedback
- **Modular Geometry**: Shield rings, cooling vents, and emergency systems that respond to your habits
- **Gamification Engine**: Streaks, artifacts, quests, and random asteroid events
- **Audio Feedback**: Dynamic reactor hum and category-specific completion sounds
- **Ethical Balance**: Optional daily caps and cooldown reminders
- **Offline-First**: Full localStorage persistence

## 🛠️ Tech Stack

- React + TypeScript + Vite
- React Three Fiber (3D)
- Zustand (State Management)
- Framer Motion (Animations)
- Web Audio API
- Tailwind CSS

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🏗️ Build

```bash
npm run build
npm run preview
```

## 🎮 Debug Commands

Open browser console (F12) and use:

- `window.__spawnDebugEvent()` - Trigger asteroid event
- `window.__triggerEmergency()` - Force critical mode
- `window.__toggleEthicalOverride()` - Toggle ethical limits
- `window.__triggerParticleBurst([0,0,0], '#fff')` - Test particles
- `window.__reactorPulse()` - Test shader pulse

## 📊 Project Status

**Completion**: 95% (Frontend Complete)

- ✅ Phase 1-6: Complete
- ⏳ Phase 7: Backend Integration (Pending)
- ⏳ Phase 8: Deployment (Pending)

## 📝 License

MIT
