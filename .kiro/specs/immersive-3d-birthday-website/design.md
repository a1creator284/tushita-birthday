# Design Document: Immersive 3D Birthday Website

## Overview

The Immersive 3D Birthday Website is a React-based web application that creates a cinematic, interactive 3D experience for celebrating a birthday. The system transforms traditional birthday content (photos, videos, messages) into an emotionally engaging digital world powered by Three.js and React Three Fiber.

### Key Design Goals

1. **Emotional Impact**: Create memorable moments through cinematic visuals and smooth interactions
2. **Performance**: Maintain 60 FPS on desktop, 30 FPS on mobile through adaptive quality systems
3. **Modularity**: Build reusable components that can be easily modified or extended
4. **Responsive**: Provide equivalent experiences across desktop, tablet, and mobile devices
5. **Graceful Degradation**: Handle errors and missing assets without breaking the experience

### Technology Stack

- **Framework**: React 18+ with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **3D Rendering**: Three.js via React Three Fiber (R3F) and Drei helpers
- **UI Animation**: Framer Motion for declarative animations
- **Timeline Animation**: GSAP for complex sequences
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for global state (lightweight alternative to Redux)
- **Audio**: Web Audio API via React hooks
- **Video**: HTML5 Video API with Three.js VideoTexture

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  App Entry    │──│  Loading      │──│  Opening      │  │
│  │  Point        │  │  Screen       │  │  Sequence     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│                              │                              │
│                              ▼                              │
│                    ┌───────────────────┐                   │
│                    │  Main Experience  │                   │
│                    │  (Journey Manager)│                   │
│                    └───────────────────┘                   │
│                              │                              │
│         ┌────────────────────┼────────────────────┐        │
│         ▼                    ▼                    ▼        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 3D Canvas    │  │ UI Layer     │  │ Audio System │    │
│  │ (R3F Scene)  │  │ (Overlays)   │  │ (Manager)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                    │                              │
│  ┌──────┴────────┐  ┌────────┴────────┐                   │
│  │ Chapters:     │  │ UI Components:  │                   │
│  │ • Memories    │  │ • Navigation    │                   │
│  │ • Moments     │  │ • Music Control │                   │
│  │ • Message     │  │ • Modal/Viewer  │                   │
│  │ • Cake        │  │ • Progress      │                   │
│  │ • Finale      │  │ • Fallback UI   │                   │
│  └───────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘


### Component Hierarchy

```
App
├── GlobalStateProvider (Zustand Store)
├── LoadingScreen
│   ├── LoadingSpinner
│   ├── ProgressBar
│   └── LoadingMessage
├── OpeningSequence
│   ├── ParticleField
│   ├── IntroText (Framer Motion)
│   └── EnterButton
└── MainExperience
    ├── Canvas (React Three Fiber)
    │   ├── Scene
    │   │   ├── Camera (PerspectiveCamera with OrbitControls)
    │   │   ├── Lighting
    │   │   │   ├── AmbientLight
    │   │   │   ├── DirectionalLight
    │   │   │   ├── PointLights (animated)
    │   │   │   └── SpotLight (for cake)
    │   │   ├── Environment (Drei)
    │   │   ├── ParticleSystem
    │   │   │   ├── AmbientParticles
    │   │   │   ├── CursorTrailParticles
    │   │   │   └── InteractionBurstParticles
    │   │   └── ChapterComponents
    │   │       ├── MemoriesChapter
    │   │       │   └── MemoryElement[] (18 photos)
    │   │       ├── MomentsChapter
    │   │       │   └── VideoDisplay[] (5 videos)
    │   │       ├── MessageChapter
    │   │       │   └── MessageDisplay3D
    │   │       ├── CakeChapter
    │   │       │   └── InteractiveCake
    │   │       └── FinaleChapter
    │   │           └── FinaleComposition
    │   └── EffectComposer (post-processing)
    │       ├── Bloom
    │       ├── DepthOfField (optional)
    │       └── Vignette
    └── UILayer (HTML overlay)
        ├── NavigationControls
        ├── MusicControls
        ├── ChapterIndicator
        ├── PhotoModal
        ├── VideoModal
        └── FallbackMessage
```

### Data Flow Architecture

```
┌─────────────────┐
│  Zustand Store  │ (Global State)
└────────┬────────┘
         │
    ┌────┴─────────────────────────────────────┐
    │                                           │
    ▼                                           ▼
┌────────────────┐                    ┌────────────────┐
│ UI Components  │◄───────────────────│ 3D Components  │
│ (React DOM)    │   Event Handlers   │ (R3F/Three.js) │
└────────────────┘                    └────────────────┘
    │                                           │
    │         ┌─────────────────────┐          │
    └────────►│  Audio Manager      │◄─────────┘
              │  Asset Loader       │
              │  Performance Monitor│
              └─────────────────────┘
```

### State Management Schema (Zustand)

```typescript
interface AppState {
  // Loading State
  isLoading: boolean;
  loadingProgress: number;
  assetsLoaded: boolean;

  // Journey State
  currentChapter: ChapterType;
  hasSeenOpening: boolean;
  
  // Interaction State
  selectedMemory: MemoryElement | null;
  playingVideo: VideoAsset | null;
  isCandlesLit: boolean;
  
  // Audio State
  isMusicPlaying: boolean;
  isMuted: boolean;
  volume: number;
  
  // Camera State
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  
  // Performance State
  deviceType: 'desktop' | 'tablet' | 'mobile';
  targetFPS: number;
  currentFPS: number;
  qualityLevel: 'high' | 'medium' | 'low';
  
  // Accessibility
  prefersReducedMotion: boolean;
  
  // Actions
  setChapter: (chapter: ChapterType) => void;
  selectMemory: (memory: MemoryElement | null) => void;
  playVideo: (video: VideoAsset | null) => void;
  toggleMusic: () => void;
  setMuted: (muted: boolean) => void;
  animateCamera: (target: CameraTarget) => void;
  // ... more actions
}
```

## Component Design

### 1. Loading Screen Component

**Purpose**: Display elegant loading interface while assets are preloaded

**Visual Design**:
- Dark background (rgba(10, 5, 20, 1)) - deep midnight tone
- Centered animated heart/star icon with pulse and rotation
- Progress bar with glassmorphism effect
- Loading text: "Preparing something special..."
- Minimum display time: 1.5 seconds

**Implementation Details**:
```typescript
// LoadingScreen.tsx
interface LoadingScreenProps {
  progress: number; // 0-100
  onComplete: () => void;
}

// Uses Framer Motion for fade transitions
// Monitors THREE.DefaultLoadingManager for asset progress
// Enforces minimum display time even if assets load quickly
```

**Asset Preloading Strategy**:
1. Critical assets (loaded first, blocking):
   - First 5 photos for initial Memory chapter
   - Opening sequence particle textures
   - UI fonts (Google Fonts: Cinzel, Playfair Display)
2. Secondary assets (loaded during opening sequence):
   - Remaining 13 photos
   - All 5 videos (metadata only, buffering on-demand)
   - Audio file
3. Progressive enhancement:
   - High-res textures loaded after low-res versions

### 2. Opening Sequence Component

**Purpose**: Create cinematic introduction that sets emotional tone

**Phases** (total duration: ~8-10 seconds):
1. **Phase 1 (0-2s)**: Black screen → dark environment with particles fading in
2. **Phase 2 (2-4s)**: First text appears: "Hey... I made something for you."
3. **Phase 3 (4-6s)**: Second text appears: "And yes... you have to explore it."
4. **Phase 4 (6-8s)**: Enter button fades in with glow effect
5. **Phase 5 (on click)**: 1.2s transition to main 3D environment

**Visual Elements**:
- Particle field: 500-800 particles (stars/dust) with slow float animation
- Text: Cinzel font, size 32-48px, soft white (#f8f8ff), subtle glow
- Button: Glassmorphism card with text "Enter ✨", hover glow (lavender)

**Implementation Details**:
```typescript
// OpeningSequence.tsx
// Uses GSAP timeline for text sequencing
// Framer Motion for button interactions
// HTML Canvas for 2D particle rendering (more performant than WebGL here)
// Audio initialization triggered on Enter button click (bypass autoplay restriction)
```

### 3. Main 3D Environment (Canvas)


**Purpose**: Render the interactive 3D world using React Three Fiber

**Scene Setup**:
```typescript
// Scene.tsx
<Canvas
  camera={{ position: [0, 2, 10], fov: 50 }}
  gl={{
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  }}
  dpr={[1, 2]} // Adaptive pixel ratio for retina displays
>
  <color attach="background" args={['#0a0514']} /> {/* Midnight tone */}
  <fog attach="fog" args={['#0a0514', 10, 50]} /> {/* Atmospheric depth */}
  
  <Scene />
  <EffectComposer />
</Canvas>
```

**Lighting Design**:
- **AmbientLight**: Intensity 0.3, color #d8d0e8 (soft lavender) - provides base illumination
- **DirectionalLight**: Intensity 0.8, position [5, 8, 5], color #fff8f0 (warm white) - key light
- **PointLight[]**: 3-5 animated point lights with colors cycling through palette (pink, lavender, gold)
  - Positions animate in slow circular patterns
  - Intensities pulse subtly (0.4-0.8 range)
- **SpotLight** (Cake chapter only): Focused light on Interactive_Cake, warm tone (#ffd700)

**Camera Control System**:

```typescript
// CameraController.tsx
// Uses Drei's OrbitControls with constraints

<OrbitControls
  enableDamping
  dampingFactor={0.05}
  minDistance={5}
  maxDistance={20}
  minPolarAngle={Math.PI / 4}
  maxPolarAngle={Math.PI / 2}
  enabled={!isModalOpen} // Disable when viewing photo/video
/>

// Programmatic camera animations via GSAP
function animateCameraTo(target: CameraTarget) {
  gsap.to(camera.position, {
    x: target.position[0],
    y: target.position[1],
    z: target.position[2],
    duration: 1.5,
    ease: 'power2.inOut',
  });
  gsap.to(controls.target, {
    x: target.lookAt[0],
    y: target.lookAt[1],
    z: target.lookAt[2],
    duration: 1.5,
    ease: 'power2.inOut',
  });
}
```

**Touch Controls (Mobile)**:
- Single finger drag: Rotate camera (OrbitControls)
- Two finger pinch: Zoom camera
- Tap: Select object (raycasting)
- Double tap: Deselect/close modal

### 4. Particle System

**Purpose**: Create atmospheric ambiance and reactive visual effects

**Particle Types**:

1. **Ambient Particles** (always visible):
   - Count: 2000 (desktop), 800 (mobile)
   - Geometry: BufferGeometry with Points
   - Material: PointsMaterial with custom shader for glow
   - Behavior: Slow vertical drift with Perlin noise for naturalistic motion
   - Colors: Interpolated between white, soft pink, lavender

2. **Cursor Trail Particles** (desktop only):
   - Spawned at mouse position projected into 3D space
   - Lifecycle: 0.5-1s fade out
   - Physics: Slight upward float with random horizontal spread
   - Visual: Small glowing dots

3. **Interaction Burst Particles**:
   - Triggered on click/tap interactions
   - Count: 20-50 particles per burst
   - Behavior: Radial explosion from interaction point, then fall
   - Used for: Memory selection, cake candles, video start

**Performance Optimization**:
```typescript
// ParticleSystem.tsx
// Use InstancedMesh for ambient particles (single draw call)
// Frustum culling for off-screen particles
// Automatic particle count reduction if FPS drops below threshold

const particleCount = useMemo(() => {
  if (qualityLevel === 'low') return 400;
  if (qualityLevel === 'medium') return 1000;
  return 2000; // high quality
}, [qualityLevel]);
```

### 5. Memory Element Component (18 Photos)

**Purpose**: Transform photos into interactive 3D objects

**Visual Styles** (3 variants, randomly assigned):
1. **Floating Polaroid**: 
   - White border frame, slight perspective tilt
   - Aspect ratio: 1:1 with padding
   
2. **3D Picture Frame**:
   - Ornate gold/lavender border with depth
   - Aspect ratio: 4:3 or 16:9 based on photo
   
3. **Holographic Card**:
   - Transparent glassmorphism border
   - Iridescent edge glow effect
   - Aspect ratio: original photo

**Spatial Distribution**:
```typescript
// memoryLayout.ts
// Arrange 18 photos in a pleasing 3D composition

const MEMORY_POSITIONS: MemoryLayout[] = [
  // Circular arrangement around center
  { position: [3, 1, 0], rotation: [0, -Math.PI/4, 0], style: 'polaroid' },
  { position: [2.5, 2.5, -2], rotation: [0.2, -Math.PI/3, 0], style: 'frame' },
  // ... 16 more positions
  // Positions form a gentle spiral or orbital pattern
  // Heights vary from y=0.5 to y=3.5 for depth variation
];
```

**Interaction States**:

1. **Default State**:
   - Scale: 1.0
   - Opacity: 0.9
   - Glow: None

2. **Hover State** (transition: 200ms):
   - Scale: 1.15
   - Opacity: 1.0
   - Glow: Soft white outline (emissive intensity 0.5)
   - Rotation: Slight turn toward camera (5-10 degrees)

3. **Selected State**:
   - Camera animates to focus on photo
   - Photo scales to fill 70% of screen
   - Background environment dims to 30% opacity
   - Caption/message appears below photo

**Photo Asset Mapping**:
```typescript
const PHOTO_ASSETS = [
  { id: 1, path: '/assets/photo1.jpg', caption: 'Your memory caption here' },
  { id: 2, path: '/assets/photo2.jpg', caption: 'Another special moment' },
  { id: 3, path: '/assets/photo3.jpg', caption: '...' },
  { id: 4, path: '/assets/photo4.jpg', caption: '...' },
  { id: 5, path: '/assets/photo5.jpg', caption: '...' },
  { id: 6, path: '/assets/photo_n1.jpg', caption: '...' },
  { id: 7, path: '/assets/photo_n2.jpg', caption: '...' },
  { id: 8, path: '/assets/photo_n3.jpg', caption: '...' },
  { id: 9, path: '/assets/photo_n4.jpg', caption: '...' },
  { id: 10, path: '/assets/photo_n5.jpg', caption: '...' },
  { id: 11, path: '/assets/photo_n6.jpg', caption: '...' },
  { id: 12, path: '/assets/photo_n7.jpg', caption: '...' },
  { id: 13, path: '/assets/photo_n8.jpg', caption: '...' },
  { id: 14, path: '/assets/photo_n9.jpg', caption: '...' },
  { id: 15, path: '/assets/poster1.jpg', caption: '...' },
  { id: 16, path: '/assets/poster2.jpg', caption: '...' },
  { id: 17, path: '/assets/poster3.jpg', caption: '...' },
  { id: 18, path: '/assets/poster4.jpg', caption: '...' },
];
```

**Implementation**:
```typescript
// MemoryElement.tsx
function MemoryElement({ photo, position, rotation, style }: Props) {
  const texture = useTexture(photo.path);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>();
  
  // Spring animation for hover
  const { scale, emissive } = useSpring({
    scale: hovered ? 1.15 : 1.0,
    emissive: hovered ? 0.5 : 0,
    config: { tension: 300, friction: 20 }
  });
  
  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => selectMemory(photo)}
    >
      {/* Geometry based on style prop */}
      <planeGeometry args={[2, 2.4]} /> {/* Polaroid proportions */}
      <meshStandardMaterial 
        map={texture}
        emissive="#ffffff"
        emissiveIntensity={emissive}
      />
    </animated.mesh>
  );
}
```

### 6. Video Display Component (5 Videos)

**Purpose**: Integrate videos as cinematic 3D screens

**Visual Design**:
- Rendered as floating rectangular screens with subtle frame/border
- Holographic appearance with slight transparency and glow
- Aspect ratio: 16:9 for all videos
- Size: Larger than photos (3x2 units)


**Video Asset Mapping**:
```typescript
const VIDEO_ASSETS = [
  { id: 1, path: '/assets/video1.mp4', title: 'Memory 1' },
  { id: 2, path: '/assets/video2.mp4', title: 'Memory 2' },
  { id: 3, path: '/assets/video3.mp4', title: 'Memory 3' },
  { id: 4, path: '/assets/video4.mp4', title: 'Memory 4' },
  { id: 5, path: '/assets/WhatsApp Video 2026-07-23 at 11.17.56.mp4', title: 'Special Moment' },
];
```

**Spatial Arrangement**:
- Videos positioned in Moments chapter
- Arranged in an arc or gallery layout
- Spacing: 5 units apart to avoid overlap
- Heights: Staggered slightly for visual interest

**States**:

1. **Idle State**:
   - Displays video thumbnail (first frame frozen)
   - Subtle pulsing glow effect
   - Play icon overlay (semi-transparent)

2. **Playing State**:
   - Video texture updates in real-time
   - Surrounding environment dims 50%
   - Video enlarges to 80% screen coverage
   - Controls appear (play/pause, close)

**Implementation**:
```typescript
// VideoDisplay.tsx
function VideoDisplay({ video, position }: Props) {
  const videoRef = useRef<HTMLVideoElement>();
  const [playing, setPlaying] = useState(false);
  
  // Create video texture from HTML5 video element
  const videoTexture = useMemo(() => {
    const vid = document.createElement('video');
    vid.src = video.path;
    vid.crossOrigin = 'anonymous';
    vid.loop = false;
    vid.muted = false; // Allow video audio
    vid.playsInline = true; // iOS compatibility
    videoRef.current = vid;
    return new THREE.VideoTexture(vid);
  }, [video.path]);
  
  const handleClick = () => {
    if (!playing) {
      videoRef.current?.play();
      setPlaying(true);
      animateCameraTo(video.cameraTarget);
      dimEnvironment(0.5);
    }
  };
  
  const handleClose = () => {
    videoRef.current?.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
    resetCamera();
    dimEnvironment(1.0);
  };
  
  return (
    <mesh position={position} onClick={handleClick}>
      <planeGeometry args={[3.2, 1.8]} /> {/* 16:9 aspect ratio */}
      <meshBasicMaterial map={videoTexture} />
      
      {/* Holographic border */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[planeGeometry]} />
        <lineBasicMaterial attach="material" color="#c8b6ff" linewidth={2} />
      </lineSegments>
    </mesh>
  );
}
```

**Browser Compatibility Handling**:
- Video formats: MP4 with H.264 codec (universally supported)
- Fallback for autoplay restrictions: Videos only play on user interaction
- iOS considerations: Use `playsInline` attribute to prevent fullscreen
- Error handling: If video fails to load, show placeholder with error message

### 7. Interactive Birthday Cake Component

**Purpose**: Create magical 3D birthday cake with candle interaction

**3D Model Design**:
Since we're building with primitives (no external 3D model):
- **Base**: CylinderGeometry (radius: 1.5, height: 1) with pink/lavender material
- **Frosting**: Custom shader for glossy appearance with subtle color gradient
- **Decorations**: Small SphereGeometry spheres (pearls/sprinkles) around edge
- **Candles**: 21 CylinderGeometry candles (radius: 0.05, height: 0.4) arranged in circles
- **Flames**: Small ConeGeometry with emissive material (yellow-orange)

**Candle Positions**:
```typescript
// 21 candles arranged in two concentric circles
const CANDLE_POSITIONS = [
  // Outer ring: 13 candles
  ...Array.from({ length: 13 }, (_, i) => {
    const angle = (i / 13) * Math.PI * 2;
    return { x: Math.cos(angle) * 1.2, z: Math.sin(angle) * 1.2 };
  }),
  // Inner ring: 8 candles
  ...Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return { x: Math.cos(angle) * 0.6, z: Math.sin(angle) * 0.6 };
  }),
];
```

**Interaction Flow**:

1. **Initial State**:
   - Candles lit with animated flames (bobbing motion)
   - Subtle sparkle particles emitting from cake
   - Warm spotlight illuminating the cake

2. **On Click (User "blows" candles)**:
   - Flames fade out over 0.8 seconds (staggered timing for realism)
   - Smoke particles emit from each candle position
   - Particle burst effect (200 particles) explodes upward
   - Environment brightens by 20%
   - "Make a wish ✨" text appears above cake

3. **Post-Blow State**:
   - Candles remain unlit
   - Celebration particles continue for 2-3 seconds
   - Hidden birthday message revealed (if applicable)

**Implementation**:
```typescript
// InteractiveCake.tsx
function InteractiveCake() {
  const [candlesLit, setCandlesLit] = useState(true);
  const [showWishMessage, setShowWishMessage] = useState(false);
  
  const handleBlow = () => {
    if (!candlesLit) return;
    
    // Animate candles out
    CANDLE_POSITIONS.forEach((pos, i) => {
      setTimeout(() => {
        extinguishCandle(i);
        emitSmokeParticles(pos);
      }, i * 60); // Stagger by 60ms
    });
    
    // Emit celebration burst
    setTimeout(() => {
      emitCelebrationBurst();
      setCandlesLit(false);
      setShowWishMessage(true);
      amplifyMusic(1.2); // Boost music volume briefly
    }, 1500);
  };
  
  return (
    <group position={[0, 0, 0]}>
      {/* Cake base */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 1, 32]} />
        <meshStandardMaterial 
          color="#f8c8dc" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Candles */}
      {CANDLE_POSITIONS.map((pos, i) => (
        <Candle
          key={i}
          position={[pos.x, 1.2, pos.z]}
          lit={candlesLit}
        />
      ))}
      
      {/* Sparkle particles */}
      <SparkleParticles active={candlesLit} />
      
      {/* Click target (invisible) */}
      <mesh onClick={handleBlow} visible={false}>
        <cylinderGeometry args={[2, 2, 2, 32]} />
      </mesh>
      
      {/* Wish message */}
      {showWishMessage && (
        <Html position={[0, 3, 0]} center>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-3xl font-serif"
          >
            Make a wish ✨
          </motion.div>
        </Html>
      )}
    </group>
  );
}
```

### 8. Birthday Message Display

**Purpose**: Show heartfelt personal message with elegant typography

**Content Structure** (Easily Editable):
```typescript
// config/birthdayMessage.ts
export const BIRTHDAY_MESSAGE = {
  recipientName: 'Tushi', // EDIT THIS
  lines: [
    'Through all the laughter and adventures,',
    'you\'ve been more than a friend—',
    'you\'ve been a constant source of light and joy.',
    '',
    'Thank you for every moment we\'ve shared,',
    'for understanding me in ways words can\'t capture,',
    'and for making life so much brighter.',
    '',
    'Here\'s to another year of incredible memories,',
    'endless laughter, and dreams coming true.',
    '',
    `Happy 21st Birthday, ${recipientName}! 🎂✨`
  ]
};
```

**Visual Design**:
- Typography: Playfair Display font (elegant serif)
- Text size: 24-32px depending on viewport
- Color: Warm white (#f8f8ff) with subtle text-shadow glow
- Background: Semi-transparent glassmorphism panel (rgba(255, 255, 255, 0.05))
- Backdrop blur: 10px
- Lines appear sequentially with 0.8s delay between each

**Implementation**:
```typescript
// MessageDisplay.tsx
function MessageDisplay() {
  return (
    <Html center position={[0, 2, 0]}>
      <motion.div className="message-container">
        {BIRTHDAY_MESSAGE.lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.8, duration: 0.6 }}
            className="message-line"
          >
            {line}
          </motion.p>
        ))}
      </motion.div>
    </Html>
  );
}
```

**Styling** (Tailwind + Custom CSS):
```css
.message-container {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 60px;
  max-width: 600px;
  text-align: center;
}

.message-line {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: #f8f8ff;
  line-height: 1.8;
  text-shadow: 0 0 20px rgba(248, 248, 255, 0.3);
  margin: 8px 0;
}
```

### 9. Journey Navigation System

**Purpose**: Manage transitions between 6 chapters

**Chapter Definitions**:
```typescript
enum Chapter {
  INTRODUCTION = 'introduction',
  MEMORIES = 'memories',      // 18 photos
  MOMENTS = 'moments',         // 5 videos
  MESSAGE = 'message',         // Birthday message
  CAKE = 'cake',              // Interactive cake
  FINALE = 'finale'           // Final celebration
}

interface ChapterConfig {
  id: Chapter;
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  duration: number; // Transition duration in seconds
}

const CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    id: Chapter.INTRODUCTION,
    cameraPosition: [0, 2, 10],
    cameraLookAt: [0, 0, 0],
    duration: 1.5
  },
  {
    id: Chapter.MEMORIES,
    cameraPosition: [5, 3, 8],
    cameraLookAt: [0, 1.5, 0], // Look at memory cluster
    duration: 1.5
  },
  {
    id: Chapter.MOMENTS,
    cameraPosition: [-6, 2, 6],
    cameraLookAt: [-2, 1, -2], // Look at video displays
    duration: 1.5
  },
  {
    id: Chapter.MESSAGE,
    cameraPosition: [0, 2, 8],
    cameraLookAt: [0, 2, 0], // Look at message
    duration: 1.5
  },
  {
    id: Chapter.CAKE,
    cameraPosition: [0, 3, 5],
    cameraLookAt: [0, 0.5, 0], // Look down at cake
    duration: 1.5
  },
  {
    id: Chapter.FINALE,
    cameraPosition: [0, 8, 15], // Pull back to see everything
    cameraLookAt: [0, 2, 0],
    duration: 3.5 // Longer for dramatic effect
  }
];
```

**Navigation UI**:
- Floating navigation dots (glassmorphism circles) on right side of screen
- Current chapter: Filled dot with glow
- Other chapters: Hollow dots
- Hover: Scale up + show chapter name tooltip
- Click: Transition to that chapter

**Navigation Controls**:
```typescript
// NavigationControls.tsx
function NavigationControls() {
  const { currentChapter, setChapter } = useStore();
  
  return (
    <div className="nav-controls">
      {CHAPTER_CONFIGS.map((config) => (
        <motion.button
          key={config.id}
          className={`nav-dot ${currentChapter === config.id ? 'active' : ''}`}
          onClick={() => setChapter(config.id)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="tooltip">{config.id}</span>
        </motion.button>
      ))}
    </div>
  );
}
```

**Forward/Back Buttons**:
- Subtle arrow buttons at bottom center
- Only show when not on first/last chapter
- Keyboard navigation: Arrow keys or Space to advance

### 10. Audio Manager

**Purpose**: Handle background music playback and controls

**Audio File**:
- Path: `/public/audio/birthday-music.mp3` (user must provide)
- Fallback: System works without music if file missing
- Format: MP3 (universal browser support)

**Audio Implementation**:
```typescript
// useAudio.ts hook
export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement>();
  const { isMusicPlaying, isMuted, volume, setMuted } = useStore();
  
  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    return () => {
      audioRef.current?.pause();
      audioRef.current = undefined;
    };
  }, [src]);
  
  useEffect(() => {
    if (isMusicPlaying && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn('Audio autoplay blocked:', err);
        // Will retry on next user interaction
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isMusicPlaying]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  return audioRef;
}
```

**Music Controls UI**:
```typescript
// MusicControls.tsx
function MusicControls() {
  const { isMusicPlaying, isMuted, toggleMusic, setMuted } = useStore();
  
  return (
    <div className="music-controls">
      <motion.button
        onClick={toggleMusic}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="control-btn"
      >
        {isMusicPlaying ? '⏸' : '▶️'}
      </motion.button>
      
      <motion.button
        onClick={() => setMuted(!isMuted)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="control-btn"
      >
        {isMuted ? '🔇' : '🔊'}
      </motion.button>
      
      {/* Animated music indicator */}
      {isMusicPlaying && !isMuted && (
        <div className="music-indicator">
          <motion.div className="bar" animate={{ scaleY: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
          <motion.div className="bar" animate={{ scaleY: [1, 1.8, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} />
          <motion.div className="bar" animate={{ scaleY: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} />
        </div>
      )}
    </div>
  );
}
```

**Autoplay Policy Handling**:
- Music starts on first user interaction (Enter button click)
- If autoplay fails, retry on next click/tap
- Persistent state across session (localStorage)

### 11. Finale Chapter

**Purpose**: Cinematic ending that brings everything together

**Sequence**:
1. Camera pulls back over 3.5 seconds to bird's eye view
2. All memory elements and videos visible simultaneously
3. Particles increase density by 50%
4. Environment brightness increases
5. Final text appears center screen:
   ```
   Happy 21st Birthday, Tushi! 🎂✨
   
   Here's to another year of beautiful memories.
   ```
6. "Replay" button appears after 3 seconds

**Implementation**:
```typescript
// FinaleChapter.tsx
function FinaleChapter() {
  const [showFinalText, setShowFinalText] = useState(false);
  
  useEffect(() => {
    // Trigger camera pullback
    animateCameraTo(CHAPTER_CONFIGS.find(c => c.id === Chapter.FINALE)!);
    
    // Increase particle count
    setParticleMultiplier(1.5);
    
    // Brighten environment
    brightenEnvironment(1.3);
    
    // Show final text after camera settles
    setTimeout(() => setShowFinalText(true), 4000);
  }, []);
  
  return (
    <>
      {/* All chapter content visible in background */}
      <MemoriesChapter visible={true} />
      <MomentsChapter visible={true} />
      <CakeChapter visible={true} />
      
      {/* Final message overlay */}
      {showFinalText && (
        <Html center>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="finale-message"
          >
            <h1>Happy 21st Birthday, Tushi! 🎂✨</h1>
            <p>Here's to another year of beautiful memories.</p>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => restartExperience()}
              className="replay-btn"
            >
              Replay the memories ↻
            </motion.button>
          </motion.div>
        </Html>
      )}
    </>
  );
}
```

## Responsive Design Strategy


### Breakpoint System

```typescript
const BREAKPOINTS = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024   // 1024px+
};

// Detect device type
function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) setDeviceType('mobile');
      else if (width < BREAKPOINTS.desktop) setDeviceType('tablet');
      else setDeviceType('desktop');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return deviceType;
}
```

### Device-Specific Adaptations

**Mobile (0-767px)**:
- Canvas pixel ratio: [1, 1.5] (reduced for performance)
- Particle count: 800 (vs 2000 desktop)
- Memory elements: Show 10 at a time (vs all 18)
- Camera controls: Touch-optimized with damping
- Text sizes: 0.75x desktop sizes
- UI controls: Larger hit targets (minimum 44x44px)
- Post-processing: Bloom only (no DOF or expensive effects)
- Video resolution: Load lower quality versions if available

**Tablet (768-1023px)**:
- Canvas pixel ratio: [1, 2]
- Particle count: 1200
- Memory elements: Show 14 at a time
- Camera controls: Hybrid (touch + mouse)
- Text sizes: 0.85x desktop sizes
- UI controls: Medium hit targets
- Post-processing: Bloom + light vignette

**Desktop (1024px+)**:
- Full quality rendering
- All visual effects enabled
- Cursor trail particles
- Hover effects (unavailable on touch)
- Keyboard shortcuts enabled

### Touch Gesture Handling

```typescript
// useTouchGestures.ts
export function useTouchGestures() {
  const [touches, setTouches] = useState<TouchList | null>(null);
  const lastDistance = useRef<number>(0);
  
  const handleTouchStart = (e: TouchEvent) => {
    setTouches(e.touches);
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const delta = distance - lastDistance.current;
      zoomCamera(delta * 0.01);
      lastDistance.current = distance;
    }
  };
  
  // Single tap vs double tap detection
  const handleTap = useTapDetection({
    onSingleTap: (point) => handleObjectSelection(point),
    onDoubleTap: () => closeModal(),
    delay: 300
  });
  
  return { handleTouchStart, handleTouchMove, handleTap };
}
```

## Performance Optimization Strategy

### 1. Adaptive Quality System

```typescript
// usePerformanceMonitor.ts
export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>('high');
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useFrame(() => {
    frameCount.current++;
    
    // Calculate FPS every 60 frames
    if (frameCount.current >= 60) {
      const now = performance.now();
      const delta = now - lastTime.current;
      const currentFps = (frameCount.current / delta) * 1000;
      setFps(currentFps);
      
      // Adjust quality based on FPS
      if (currentFps < 25 && qualityLevel !== 'low') {
        setQualityLevel('low');
        console.log('Reducing quality to maintain performance');
      } else if (currentFps > 50 && currentFps < 55 && qualityLevel !== 'medium') {
        setQualityLevel('medium');
      } else if (currentFps > 58 && qualityLevel !== 'high') {
        setQualityLevel('high');
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }
  });
  
  return { fps, qualityLevel };
}
```

**Quality Level Effects**:
- **High**: All effects, 2000 particles, full shadows, bloom + DOF
- **Medium**: Reduced effects, 1000 particles, simplified shadows, bloom only
- **Low**: Minimal effects, 400 particles, no shadows, no post-processing

### 2. Asset Loading Optimization

```typescript
// AssetLoader.ts
export class AssetLoader {
  private loadedAssets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  async loadImage(path: string): Promise<THREE.Texture> {
    if (this.loadedAssets.has(path)) {
      return this.loadedAssets.get(path);
    }
    
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }
    
    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        path,
        (texture) => {
          this.loadedAssets.set(path, texture);
          this.loadingPromises.delete(path);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
    
    this.loadingPromises.set(path, promise);
    return promise;
  }
  
  // Preload critical assets
  async preloadCritical() {
    const critical = [
      ...PHOTO_ASSETS.slice(0, 5).map(p => p.path),
      // Particle textures, UI assets, etc.
    ];
    
    return Promise.all(critical.map(path => this.loadImage(path)));
  }
  
  // Lazy load remaining assets
  async lazyLoad() {
    const remaining = PHOTO_ASSETS.slice(5).map(p => p.path);
    return Promise.all(remaining.map(path => this.loadImage(path)));
  }
}
```

### 3. Memory Management

```typescript
// Cleanup on component unmount
useEffect(() => {
  return () => {
    // Dispose Three.js resources
    geometry.dispose();
    material.dispose();
    texture.dispose();
    
    // Clear references
    meshRef.current = null;
  };
}, []);

// Frustum culling for off-screen objects
function MemoryElement({ visible }: Props) {
  if (!visible) return null; // Don't render if off-screen
  // ...
}
```

### 4. Render Optimization

```typescript
// Use React.memo for expensive components
export const MemoryElement = React.memo(MemoryElementComponent);

// Use useMemo for complex calculations
const positions = useMemo(() => calculateMemoryPositions(), []);

// Limit useFrame callbacks
useFrame((state, delta) => {
  // Update only what's necessary
  if (shouldAnimate) {
    meshRef.current.rotation.y += delta * 0.5;
  }
});

// Use InstancedMesh for repeated geometry
const particles = useMemo(() => {
  const geometry = new THREE.SphereGeometry(0.05);
  const material = new THREE.MeshBasicMaterial();
  return new THREE.InstancedMesh(geometry, material, particleCount);
}, [particleCount]);
```

## Post-Processing Effects

### Effect Composer Setup

```typescript
// Effects.tsx
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';

export function Effects({ qualityLevel }: Props) {
  if (qualityLevel === 'low') return null; // No post-processing on low quality
  
  return (
    <EffectComposer>
      {/* Bloom for glowing elements */}
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      
      {/* Vignette for cinematic feel */}
      {qualityLevel === 'high' && (
        <Vignette
          offset={0.5}
          darkness={0.4}
          eskil={false}
        />
      )}
      
      {/* Depth of field (high quality only) */}
      {qualityLevel === 'high' && (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
        />
      )}
    </EffectComposer>
  );
}
```

## Animation Architecture

### GSAP Timeline Management

```typescript
// useChapterTransition.ts
export function useChapterTransition(chapter: Chapter) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    const config = CHAPTER_CONFIGS.find(c => c.id === chapter);
    if (!config) return;
    
    // Create GSAP timeline for smooth multi-part animation
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' }
    });
    
    timeline
      .to(camera.position, {
        x: config.cameraPosition[0],
        y: config.cameraPosition[1],
        z: config.cameraPosition[2],
        duration: config.duration
      }, 0)
      .to(controls.target, {
        x: config.cameraLookAt[0],
        y: config.cameraLookAt[1],
        z: config.cameraLookAt[2],
        duration: config.duration
      }, 0)
      .to(environmentRef.current, {
        opacity: chapter === Chapter.FINALE ? 1 : 0.7,
        duration: config.duration * 0.5
      }, 0);
    
    return () => timeline.kill();
  }, [chapter]);
}
```

### Framer Motion Spring Configs

```typescript
// Animation constants
export const SPRING_CONFIGS = {
  gentle: { tension: 120, friction: 14 },
  bouncy: { tension: 300, friction: 20 },
  stiff: { tension: 500, friction: 30 },
  slow: { tension: 80, friction: 10 }
};

// Usage in components
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', ...SPRING_CONFIGS.gentle }}
>
```

## Error Handling and Fallbacks

### WebGL Support Detection

```typescript
// WebGLDetector.tsx
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || 
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

export function WebGLFallback() {
  const hasWebGL = detectWebGL();
  
  if (!hasWebGL) {
    return (
      <div className="fallback-message">
        <h2>WebGL Not Supported</h2>
        <p>
          This experience requires WebGL support. 
          Please use a modern browser like Chrome, Firefox, Safari, or Edge.
        </p>
      </div>
    );
  }
  
  return null;
}
```

### Asset Loading Error Handling

```typescript
// ErrorBoundary for graceful failure
class AssetErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Asset loading error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="error-message">
            <p>Some content failed to load, but the experience continues.</p>
          </div>
        </Html>
      );
    }
    
    return this.props.children;
  }
}

// Texture error handling
function useTextureWithFallback(path: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      setTexture,
      undefined,
      (error) => {
        console.warn(`Failed to load texture: ${path}`, error);
        // Use placeholder texture
        const placeholder = createPlaceholderTexture();
        setTexture(placeholder);
      }
    );
  }, [path]);
  
  return texture;
}
```

### Audio Error Handling

```typescript
// Gracefully handle missing audio
export function useAudioWithFallback(src: string) {
  const [audioAvailable, setAudioAvailable] = useState(true);
  
  useEffect(() => {
    fetch(src, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          setAudioAvailable(false);
          console.warn('Audio file not found. Experience will continue without music.');
        }
      })
      .catch(() => {
        setAudioAvailable(false);
      });
  }, [src]);
  
  // Return audio manager only if available
  return audioAvailable ? useAudio(src) : null;
}
```

## Accessibility Implementation

### Keyboard Navigation

```typescript
// useKeyboardNavigation.ts
export function useKeyboardNavigation() {
  const { currentChapter, setChapter, selectedMemory, selectMemory } = useStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
          // Next chapter
          advanceChapter();
          break;
        case 'ArrowLeft':
          // Previous chapter
          previousChapter();
          break;
        case 'Escape':
          // Close modal
          if (selectedMemory) selectMemory(null);
          break;
        case 'Tab':
          // Focus next interactive element
          e.preventDefault();
          focusNextElement();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter, selectedMemory]);
}
```

### Reduced Motion Support

```typescript
// useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
}

// Apply in components
function ParticleSystem() {
  const reducedMotion = useReducedMotion();
  
  if (reducedMotion) {
    return null; // Skip particle animations
  }
  
  // Normal particle rendering
  return <Particles />;
}
```

### Focus Management

```typescript
// Ensure visible focus indicators
const focusStyles = {
  outline: '2px solid #c8b6ff',
  outlineOffset: '4px',
  borderRadius: '4px'
};

// Apply to interactive elements
<button
  className="interactive-btn"
  style={{ ':focus': focusStyles }}
>
  Enter
</button>
```

### ARIA Labels

```typescript
// Add semantic HTML and ARIA labels
<button
  aria-label="Play background music"
  role="button"
  onClick={toggleMusic}
>
  {isMusicPlaying ? '⏸' : '▶️'}
</button>

<div
  role="navigation"
  aria-label="Chapter navigation"
>
  {/* Navigation dots */}
</div>
```

## Project Structure

```
immersive-3d-birthday-website/
├── public/
│   ├── assets/
│   │   ├── photo1.jpg through photo5.jpg
│   │   ├── photo_n1.jpg through photo_n9.jpg
│   │   ├── poster1.jpg through poster4.jpg
│   │   ├── video1.mp4 through video4.mp4
│   │   └── WhatsApp Video 2026-07-23 at 11.17.56.mp4
│   ├── audio/
│   │   └── birthday-music.mp3 (user-provided)
│   └── index.html
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── Scene.tsx
│   │   │   ├── CameraController.tsx
│   │   │   ├── Lighting.tsx
│   │   │   ├── ParticleSystem.tsx
│   │   │   ├── MemoryElement.tsx
│   │   │   ├── VideoDisplay.tsx
│   │   │   ├── InteractiveCake.tsx
│   │   │   ├── Candle.tsx
│   │   │   └── Effects.tsx
│   │   ├── chapters/
│   │   │   ├── MemoriesChapter.tsx
│   │   │   ├── MomentsChapter.tsx
│   │   │   ├── MessageChapter.tsx
│   │   │   ├── CakeChapter.tsx
│   │   │   └── FinaleChapter.tsx
│   │   ├── ui/
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── OpeningSequence.tsx
│   │   │   ├── NavigationControls.tsx
│   │   │   ├── MusicControls.tsx
│   │   │   ├── ChapterIndicator.tsx
│   │   │   ├── PhotoModal.tsx
│   │   │   ├── VideoModal.tsx
│   │   │   └── MessageDisplay.tsx
│   │   └── fallbacks/
│   │       ├── WebGLFallback.tsx
│   │       └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useAudio.ts
│   │   ├── useDeviceType.ts
│   │   ├── usePerformanceMonitor.ts
│   │   ├── useTouchGestures.ts
│   │   ├── useKeyboardNavigation.ts
│   │   ├── useReducedMotion.ts
│   │   └── useChapterTransition.ts
│   ├── store/
│   │   └── useStore.ts (Zustand)
│   ├── config/
│   │   ├── birthdayMessage.ts
│   │   ├── photoAssets.ts
│   │   ├── videoAssets.ts
│   │   ├── chapters.ts
│   │   └── theme.ts
│   ├── utils/
│   │   ├── AssetLoader.ts
│   │   ├── three-helpers.ts
│   │   └── animation-configs.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── global.css (Tailwind + custom)
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Build and Deployment

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Relative paths for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation': ['framer-motion', 'gsap'],
          'vendor': ['react', 'react-dom', 'zustand']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### GitHub Pages Deployment

1. Install gh-pages: `npm install -D gh-pages`
2. Build the project: `npm run build`
3. Deploy: `npm run deploy`
4. Configure repository settings: Enable GitHub Pages with `/root` from `gh-pages` branch

### Environment Variables

```
# .env.example
VITE_BIRTHDAY_MUSIC_PATH=/audio/birthday-music.mp3
VITE_RECIPIENT_NAME=Tushi
```

### Performance Budget

- Initial bundle size: < 500KB (gzipped)
- Three.js vendor chunk: < 800KB
- Total initial load: < 1.5MB
- Lazy-loaded assets: Photos + videos loaded on-demand
- Time to interactive: < 3 seconds on 3G

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0",
    "@react-three/postprocessing": "^2.16.0",
    "framer-motion": "^11.0.0",
    "gsap": "^3.12.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "gh-pages": "^6.1.0"
  }
}
```

## Testing Strategy

### Manual Testing Checklist

**Desktop Testing**:
- [ ] Website loads successfully
- [ ] Loading screen displays and transitions smoothly
- [ ] Opening sequence plays correctly
- [ ] All 18 photos load and display
- [ ] All 5 videos load and play
- [ ] Camera controls (orbit, zoom) work smoothly
- [ ] Memory elements respond to hover
- [ ] Clicking memory element opens modal
- [ ] Modal closes on outside click or Escape key
- [ ] Video playback works in all browsers
- [ ] Music starts on first interaction
- [ ] Music controls (play/pause, mute) work
- [ ] Chapter navigation works (forward/back, direct jump)
- [ ] Birthday cake interaction works (candle blow, particles)
- [ ] Birthday message displays correctly
- [ ] Finale scene plays correctly
- [ ] Replay button restarts experience
- [ ] Keyboard navigation works (arrow keys, Escape, Tab)
- [ ] Performance maintains 60 FPS
- [ ] No console errors

**Mobile Testing** (iOS Safari, Chrome Android):
- [ ] Touch gestures work (drag to rotate, pinch to zoom)
- [ ] Tap to select objects works
- [ ] Double tap to close modal works
- [ ] Videos play inline (not fullscreen)
- [ ] Music respects iOS autoplay restrictions
- [ ] UI elements are appropriately sized
- [ ] Text is readable
- [ ] Performance maintains 30 FPS
- [ ] No horizontal scrolling

**Browser Compatibility**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Android (latest)

**Accessibility Testing**:
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible
- [ ] Reduced motion preference respected
- [ ] Text contrast meets WCAG AA standards
- [ ] ARIA labels present on interactive elements

## Security Considerations

### Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob:;
    media-src 'self' blob:;
    connect-src 'self';
  "
/>
```

### Asset Validation

```typescript
// Validate file types before loading
function isValidImageType(filename: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function isValidVideoType(filename: string): boolean {
  const validExtensions = ['.mp4', '.webm'];
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}
```

## Maintenance and Extensibility

### Adding New Photos

1. Add photo to `/public/assets/`
2. Update `src/config/photoAssets.ts`:
```typescript
export const PHOTO_ASSETS = [
  // ... existing photos
  { id: 19, path: '/assets/new-photo.jpg', caption: 'New memory' }
];
```
3. Update memory layout in `src/config/chapters.ts` if needed

### Changing Birthday Message

Edit `src/config/birthdayMessage.ts`:
```typescript
export const BIRTHDAY_MESSAGE = {
  recipientName: 'New Name', // Change here
  lines: [
    'Update these lines',
    'with your personal message',
    // ...
  ]
};
```

### Customizing Colors

Edit `src/config/theme.ts`:
```typescript
export const THEME = {
  colors: {
    background: '#0a0514',
    primary: '#c8b6ff',     // Lavender
    secondary: '#f8c8dc',   // Soft pink
    accent: '#ffd700',      // Gold
    text: '#f8f8ff'         // Warm white
  },
  // ...
};
```

## Conclusion

This design document provides a comprehensive technical blueprint for implementing the immersive 3D birthday website. The architecture prioritizes emotional impact, performance, and maintainability while ensuring the experience works beautifully across all devices and browsers.

Key design decisions:
- **React Three Fiber** for declarative 3D scene management
- **Zustand** for lightweight, performant state management
- **Adaptive quality system** to maintain performance across devices
- **Modular component architecture** for easy maintenance and extension
- **Comprehensive error handling** to ensure graceful degradation
- **Accessibility-first approach** with keyboard navigation and reduced motion support

The system is designed to be easily personalized by editing configuration files without touching core component logic, making it maintainable and extensible for future enhancements.


## Components and Interfaces

### React Component Interfaces

#### LoadingScreen Component

```typescript
interface LoadingScreenProps {
  progress: number;        // 0-100
  onComplete: () => void; // Callback when loading completes
}

export function LoadingScreen({ progress, onComplete }: LoadingScreenProps): JSX.Element;
```

#### OpeningSequence Component

```typescript
interface OpeningSequenceProps {
  onEnter: () => void;    // Callback when Enter button clicked
  startMusic: () => void; // Callback to initialize audio
}

export function OpeningSequence({ onEnter, startMusic }: OpeningSequenceProps): JSX.Element;
```

#### MemoryElement Component

```typescript
interface MemoryElementProps {
  photo: PhotoAsset;
  position: [number, number, number];
  rotation: [number, number, number];
  style: 'polaroid' | 'frame' | 'holographic';
  visible: boolean;
  onSelect: (photo: PhotoAsset) => void;
}

export function MemoryElement(props: MemoryElementProps): JSX.Element;
```

#### VideoDisplay Component

```typescript
interface VideoDisplayProps {
  video: VideoAsset;
  position: [number, number, number];
  visible: boolean;
  onPlay: (video: VideoAsset) => void;
  onClose: () => void;
}

export function VideoDisplay(props: VideoDisplayProps): JSX.Element;
```

#### InteractiveCake Component

```typescript
interface InteractiveCakeProps {
  position: [number, number, number];
  onCandlesBlow: () => void;
  candleCount: number; // 21 for 21st birthday
}

export function InteractiveCake(props: InteractiveCakeProps): JSX.Element;
```

#### NavigationControls Component

```typescript
interface NavigationControlsProps {
  currentChapter: Chapter;
  chapters: Chapter[];
  onNavigate: (chapter: Chapter) => void;
  canGoForward: boolean;
  canGoBack: boolean;
}

export function NavigationControls(props: NavigationControlsProps): JSX.Element;
```

#### MusicControls Component

```typescript
interface MusicControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export function MusicControls(props: MusicControlsProps): JSX.Element;
```

### Three.js Component Interfaces

#### ParticleSystem Component

```typescript
interface ParticleSystemProps {
  count: number;
  type: 'ambient' | 'trail' | 'burst';
  colors: string[];
  position?: [number, number, number];
  active: boolean;
}

export function ParticleSystem(props: ParticleSystemProps): JSX.Element;
```

#### Lighting Component

```typescript
interface LightingProps {
  chapter: Chapter;
  intensity: number;
  cakeSpotlightActive: boolean;
}

export function Lighting(props: LightingProps): JSX.Element;
```

### Custom Hooks Interfaces

#### useAudio Hook

```typescript
interface AudioControls {
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

export function useAudio(src: string): AudioControls;
```

#### usePerformanceMonitor Hook

```typescript
interface PerformanceMetrics {
  fps: number;
  qualityLevel: 'high' | 'medium' | 'low';
  frameTime: number;
  memoryUsage?: number;
}

export function usePerformanceMonitor(): PerformanceMetrics;
```

#### useChapterTransition Hook

```typescript
interface ChapterTransitionOptions {
  duration: number;
  easing: string;
  onComplete?: () => void;
}

export function useChapterTransition(
  targetChapter: Chapter,
  options?: ChapterTransitionOptions
): void;
```

### Service Interfaces

#### AssetLoader Service

```typescript
interface AssetLoaderInterface {
  loadImage(path: string): Promise<THREE.Texture>;
  loadVideo(path: string): Promise<HTMLVideoElement>;
  loadAudio(path: string): Promise<HTMLAudioElement>;
  preloadCritical(): Promise<void>;
  lazyLoad(): Promise<void>;
  getProgress(): number;
  dispose(path: string): void;
}

export class AssetLoader implements AssetLoaderInterface {
  // Implementation
}
```

#### PerformanceMonitor Service

```typescript
interface PerformanceMonitorInterface {
  startMonitoring(): void;
  stopMonitoring(): void;
  getCurrentFPS(): number;
  getQualityLevel(): QualityLevel;
  adjustQuality(level: QualityLevel): void;
}

export class PerformanceMonitor implements PerformanceMonitorInterface {
  // Implementation
}
```

### State Store Interface (Zustand)

```typescript
interface AppState {
  // Loading State
  isLoading: boolean;
  loadingProgress: number;
  assetsLoaded: boolean;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setAssetsLoaded: (loaded: boolean) => void;

  // Journey State
  currentChapter: Chapter;
  hasSeenOpening: boolean;
  chapterHistory: Chapter[];
  setChapter: (chapter: Chapter) => void;
  setHasSeenOpening: (seen: boolean) => void;

  // Interaction State
  selectedMemory: PhotoAsset | null;
  playingVideo: VideoAsset | null;
  isCandlesLit: boolean;
  selectMemory: (memory: PhotoAsset | null) => void;
  playVideo: (video: VideoAsset | null) => void;
  setCandlesLit: (lit: boolean) => void;

  // Audio State
  isMusicPlaying: boolean;
  isMuted: boolean;
  volume: number;
  toggleMusic: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;

  // Camera State
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  animateCamera: (pos: [number, number, number], target: [number, number, number]) => void;

  // Performance State
  deviceType: 'desktop' | 'tablet' | 'mobile';
  targetFPS: number;
  currentFPS: number;
  qualityLevel: 'high' | 'medium' | 'low';
  setDeviceType: (type: 'desktop' | 'tablet' | 'mobile') => void;
  setCurrentFPS: (fps: number) => void;
  setQualityLevel: (level: 'high' | 'medium' | 'low') => void;

  // Accessibility
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (prefer: boolean) => void;

  // UI State
  isNavigationVisible: boolean;
  isMusicControlsVisible: boolean;
  setNavigationVisible: (visible: boolean) => void;
  setMusicControlsVisible: (visible: boolean) => void;
}

export const useStore: () => AppState;
```

## Data Models

### Photo Asset Model

```typescript
interface PhotoAsset {
  id: number;
  path: string;
  caption: string;
  thumbnail?: string;         // Optional low-res version for fast loading
  aspectRatio: number;        // Calculated from image dimensions
  loaded: boolean;            // Loading state
  style: 'polaroid' | 'frame' | 'holographic';
  position: [number, number, number];
  rotation: [number, number, number];
}

// Example data
const photoAssets: PhotoAsset[] = [
  {
    id: 1,
    path: '/assets/photo1.jpg',
    caption: 'A beautiful memory',
    aspectRatio: 1.5,
    loaded: false,
    style: 'polaroid',
    position: [3, 1, 0],
    rotation: [0, -Math.PI/4, 0]
  },
  // ... 17 more
];
```

### Video Asset Model

```typescript
interface VideoAsset {
  id: number;
  path: string;
  title: string;
  thumbnail?: string;         // Video first frame
  duration?: number;          // Video duration in seconds
  aspectRatio: number;        // Usually 16:9
  loaded: boolean;
  position: [number, number, number];
  cameraTarget: CameraTarget; // Where camera should move when playing
}

// Example data
const videoAssets: VideoAsset[] = [
  {
    id: 1,
    path: '/assets/video1.mp4',
    title: 'Special Moment 1',
    aspectRatio: 16/9,
    loaded: false,
    position: [-6, 2, -2],
    cameraTarget: {
      position: [-4, 2, 2],
      lookAt: [-6, 2, -2]
    }
  },
  // ... 4 more
];
```

### Chapter Configuration Model

```typescript
interface ChapterConfig {
  id: Chapter;
  name: string;
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  duration: number;           // Transition duration in seconds
  environmentOpacity: number; // Dimming for modals
  particleMultiplier: number; // Particle density adjustment
  lightingProfile: LightingProfile;
}

enum Chapter {
  INTRODUCTION = 'introduction',
  MEMORIES = 'memories',
  MOMENTS = 'moments',
  MESSAGE = 'message',
  CAKE = 'cake',
  FINALE = 'finale'
}

interface LightingProfile {
  ambientIntensity: number;
  directionalIntensity: number;
  pointLightCount: number;
  spotlightActive: boolean;
}
```

### Camera Target Model

```typescript
interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;              // Field of view adjustment
  transition?: {
    duration: number;
    easing: string;
  };
}
```

### Particle Configuration Model

```typescript
interface ParticleConfig {
  count: number;
  size: number;
  sizeVariation: number;
  color: THREE.Color | string;
  colorVariation: number;
  velocity: THREE.Vector3;
  velocityVariation: THREE.Vector3;
  lifetime: number;           // Seconds
  opacity: number;
  opacityDecay: number;
  emissionRate: number;       // Particles per second
  gravity: number;
}

interface ParticleSystemState {
  ambient: ParticleConfig;
  trail: ParticleConfig;
  burst: ParticleConfig;
  smoke: ParticleConfig;
}
```

### Birthday Message Model

```typescript
interface BirthdayMessage {
  recipientName: string;
  lines: string[];
  font: string;
  fontSize: number;
  color: string;
  animationDelay: number;     // Delay between lines in seconds
  backgroundColor?: string;
  backdropBlur?: number;
}

// Configuration object
const birthdayMessage: BirthdayMessage = {
  recipientName: 'Tushi',
  lines: [
    'Through all the laughter and adventures,',
    'you\'ve been more than a friend—',
    'you\'ve been a constant source of light and joy.',
    // ... more lines
  ],
  font: 'Playfair Display',
  fontSize: 24,
  color: '#f8f8ff',
  animationDelay: 0.8,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropBlur: 10
};
```

### Performance Metrics Model

```typescript
interface PerformanceMetrics {
  fps: number;
  frameTime: number;          // Milliseconds per frame
  drawCalls: number;
  triangles: number;
  textures: number;
  geometries: number;
  memoryUsage?: {             // If available
    total: number;
    used: number;
  };
  timestamp: number;
}

interface QualitySettings {
  level: 'high' | 'medium' | 'low';
  particleCount: number;
  shadowsEnabled: boolean;
  postProcessingEnabled: boolean;
  textureQuality: 'high' | 'medium' | 'low';
  antialiasing: boolean;
  pixelRatio: number;
}
```

### Audio State Model

```typescript
interface AudioState {
  src: string;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;             // 0-1
  currentTime: number;
  duration: number;
  loop: boolean;
  loaded: boolean;
  error: Error | null;
}
```

### Device Capabilities Model

```typescript
interface DeviceCapabilities {
  type: 'desktop' | 'tablet' | 'mobile';
  hasWebGL: boolean;
  hasWebGL2: boolean;
  maxTextureSize: number;
  maxVertexUniforms: number;
  touchSupported: boolean;
  orientationSupported: boolean;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  gpuTier?: 'high' | 'medium' | 'low';
}
```

### Error Model

```typescript
interface AppError {
  code: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  component?: string;
  timestamp: number;
  userMessage?: string;       // User-friendly error message
  recoverable: boolean;
}

// Error codes
enum ErrorCode {
  WEBGL_NOT_SUPPORTED = 'WEBGL_NOT_SUPPORTED',
  ASSET_LOAD_FAILED = 'ASSET_LOAD_FAILED',
  AUDIO_LOAD_FAILED = 'AUDIO_LOAD_FAILED',
  VIDEO_PLAYBACK_FAILED = 'VIDEO_PLAYBACK_FAILED',
  PERFORMANCE_DEGRADED = 'PERFORMANCE_DEGRADED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

## Correctness Properties

### Property 1: Asset Loading Completeness

**Validates: Requirements 13.1, 13.4**

**Description**: All critical assets must be loaded before transitioning from Loading Screen to Opening Sequence.

**Formal Statement**:
```
∀ state ∈ ApplicationState:
  (state.phase = 'opening_sequence') → 
  (∀ asset ∈ CriticalAssets: asset.loaded = true)
```

**Test Strategy**:
```typescript
describe('Asset Loading Completeness', () => {
  it('should not transition to opening sequence until all critical assets loaded', async () => {
    const { result } = renderHook(() => useStore());
    
    // Initially not loaded
    expect(result.current.assetsLoaded).toBe(false);
    
    // Load critical assets
    await assetLoader.preloadCritical();
    
    // Check all critical assets loaded
    CRITICAL_ASSETS.forEach(asset => {
      expect(assetLoader.isLoaded(asset.path)).toBe(true);
    });
    
    // Now should be able to transition
    expect(result.current.assetsLoaded).toBe(true);
  });
});
```

### Property 2: Chapter Transition Consistency

**Validates: Requirements 8.2, 8.5**

**Description**: Camera position and target must always reach their intended destinations after chapter transition.

**Formal Statement**:
```
∀ chapter1, chapter2 ∈ Chapters, transition ∈ ChapterTransition:
  (initiateTransition(chapter1, chapter2) ∧ transitionComplete(transition)) →
  (camera.position = chapter2.cameraPosition ∧
   camera.lookAt = chapter2.cameraLookAt)
```

**Test Strategy**:
```typescript
describe('Chapter Transition Consistency', () => {
  it('should move camera to correct position for each chapter', async () => {
    const { result } = renderHook(() => useStore());
    
    for (const chapter of CHAPTER_CONFIGS) {
      result.current.setChapter(chapter.id);
      
      // Wait for transition
      await waitFor(() => {
        const { cameraPosition, cameraTarget } = result.current;
        expect(cameraPosition).toEqual(chapter.cameraPosition);
        expect(cameraTarget).toEqual(chapter.cameraLookAt);
      }, { timeout: chapter.duration * 1000 + 500 });
    }
  });
});
```

### Property 3: Audio State Consistency

**Validates: Requirements 5.1, 5.4**

**Description**: Audio playback state must always match the isMusicPlaying flag in state.

**Formal Statement**:
```
∀ time t ∈ ExecutionTime:
  state.isMusicPlaying = true ↔ audioElement.paused = false
```

**Test Strategy**:
```typescript
describe('Audio State Consistency', () => {
  it('should synchronize audio element state with store state', () => {
    const { result } = renderHook(() => useStore());
    const audioElement = document.querySelector('audio');
    
    // Start playing
    act(() => result.current.toggleMusic());
    expect(result.current.isMusicPlaying).toBe(true);
    expect(audioElement.paused).toBe(false);
    
    // Pause
    act(() => result.current.toggleMusic());
    expect(result.current.isMusicPlaying).toBe(false);
    expect(audioElement.paused).toBe(true);
  });
});
```

### Property 4: Performance Degradation Response

**Validates: Requirements 11.1, 11.2, 11.6**

**Description**: When FPS drops below threshold, quality level must automatically adjust to maintain performance.

**Formal Statement**:
```
∀ fps ∈ FrameRates:
  (fps < THRESHOLD_LOW ∧ qualityLevel ≠ 'low') →
  Eventually(qualityLevel = 'low')
  
  where THRESHOLD_LOW = 25 for mobile, 30 for desktop
```

**Test Strategy**:
```typescript
describe('Performance Degradation Response', () => {
  it('should reduce quality when FPS drops below threshold', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Simulate low FPS
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.recordFrame(20); // 20 FPS
      }
    });
    
    // Quality should have reduced
    expect(result.current.qualityLevel).toBe('low');
  });
  
  it('should increase quality when FPS recovers', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Start at low quality
    act(() => result.current.setQualityLevel('low'));
    
    // Simulate high FPS
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.recordFrame(60); // 60 FPS
      }
    });
    
    // Quality should increase
    expect(result.current.qualityLevel).not.toBe('low');
  });
});
```

### Property 5: Memory Element Visibility

**Validates: Requirements 11.1, 11.2**

**Description**: Memory elements must only be rendered when visible to camera (frustum culling).

**Formal Statement**:
```
∀ memory ∈ MemoryElements, camera ∈ Camera:
  memory.position ∉ camera.frustum →
  memory.rendered = false
```

**Test Strategy**:
```typescript
describe('Memory Element Visibility', () => {
  it('should not render off-screen memory elements', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    
    MEMORY_ELEMENTS.forEach(memory => {
      const visible = frustum.containsPoint(
        new THREE.Vector3(...memory.position)
      );
      
      // Element should only be in render list if visible
      if (!visible) {
        expect(memory.rendered).toBe(false);
      }
    });
  });
});
```

### Property 6: Modal State Exclusivity

**Validates: Requirements 3.4, 4.3**

**Description**: Only one modal (photo or video) can be open at a time.

**Formal Statement**:
```
∀ state ∈ ApplicationState:
  ¬(state.selectedMemory ≠ null ∧ state.playingVideo ≠ null)
```

**Test Strategy**:
```typescript
describe('Modal State Exclusivity', () => {
  it('should close photo modal when opening video', () => {
    const { result } = renderHook(() => useStore());
    
    // Open photo
    act(() => result.current.selectMemory(PHOTO_ASSETS[0]));
    expect(result.current.selectedMemory).not.toBeNull();
    
    // Open video - should close photo
    act(() => result.current.playVideo(VIDEO_ASSETS[0]));
    expect(result.current.selectedMemory).toBeNull();
    expect(result.current.playingVideo).not.toBeNull();
  });
  
  it('should close video modal when opening photo', () => {
    const { result } = renderHook(() => useStore());
    
    // Open video
    act(() => result.current.playVideo(VIDEO_ASSETS[0]));
    expect(result.current.playingVideo).not.toBeNull();
    
    // Open photo - should close video
    act(() => result.current.selectMemory(PHOTO_ASSETS[0]));
    expect(result.current.playingVideo).toBeNull();
    expect(result.current.selectedMemory).not.toBeNull();
  });
});
```

### Property 7: Candle State Irreversibility

**Validates: Requirements 6.2, 6.5**

**Description**: Once candles are blown out, they cannot be relit (except through explicit replay).

**Formal Statement**:
```
∀ state ∈ ApplicationState:
  (state.isCandlesLit = false ∧ action ≠ 'replay') →
  Next(state.isCandlesLit) = false
```

**Test Strategy**:
```typescript
describe('Candle State Irreversibility', () => {
  it('should not relight candles after blowing', () => {
    const { result } = renderHook(() => useStore());
    
    // Initially lit
    expect(result.current.isCandlesLit).toBe(true);
    
    // Blow candles
    act(() => result.current.setCandlesLit(false));
    expect(result.current.isCandlesLit).toBe(false);
    
    // Try to relight (should not work without replay)
    act(() => {
      // Any action except replay
      result.current.setChapter(Chapter.FINALE);
    });
    expect(result.current.isCandlesLit).toBe(false);
  });
});
```

## Error Handling

### Error Handling Strategy

The application implements a multi-layered error handling approach:

1. **Prevention Layer**: Input validation, type checking, and defensive programming
2. **Detection Layer**: Try-catch blocks, promise rejection handlers, error boundaries
3. **Recovery Layer**: Graceful degradation, fallbacks, user-friendly error messages
4. **Logging Layer**: Console logging for debugging, user analytics (optional)

### Error Categories and Handlers

#### 1. WebGL Unavailable Error

**Scenario**: Browser doesn't support WebGL or WebGL context creation fails

**Handling**:
```typescript
// WebGLDetector.tsx
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

export function WebGLErrorHandler() {
  const hasWebGL = detectWebGL();
  
  if (!hasWebGL) {
    return (
      <div className="error-screen">
        <h1>WebGL Not Supported</h1>
        <p>
          This immersive 3D experience requires WebGL support.
          Please try using a modern browser like:
        </p>
        <ul>
          <li>Google Chrome (version 90+)</li>
          <li>Mozilla Firefox (version 88+)</li>
          <li>Safari (version 14+)</li>
          <li>Microsoft Edge (version 90+)</li>
        </ul>
      </div>
    );
  }
  
  return null;
}
```

**Recovery**: Display fallback UI with browser upgrade instructions. No 3D content rendered.

#### 2. Asset Loading Errors

**Scenario**: Photos, videos, or audio files fail to load

**Handling**:
```typescript
// AssetLoader.ts
class AssetLoader {
  async loadImage(path: string): Promise<THREE.Texture> {
    try {
      return await new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
          path,
          resolve,
          undefined,
          (error) => reject(new Error(`Failed to load image: ${path}`))
        );
      });
    } catch (error) {
      console.error(`Image load failed: ${path}`, error);
      
      // Create placeholder texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Image unavailable', 256, 256);
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }
  }
  
  async loadVideo(path: string): Promise<HTMLVideoElement> {
    try {
      const video = document.createElement('video');
      video.src = path;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      
      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', resolve);
        video.addEventListener('error', reject);
        video.load();
      });
      
      return video;
    } catch (error) {
      console.error(`Video load failed: ${path}`, error);
      throw new AppError({
        code: ErrorCode.ASSET_LOAD_FAILED,
        message: `Video unavailable: ${path}`,
        severity: 'warning',
        recoverable: true,
        userMessage: 'A video failed to load, but the experience continues.'
      });
    }
  }
}
```

**Recovery**: 
- Images: Display placeholder texture with "Image unavailable" message
- Videos: Hide video display element, show error notification
- Audio: Continue without background music, display muted music icon

#### 3. Audio Autoplay Blocking

**Scenario**: Browser blocks audio autoplay due to policy

**Handling**:
```typescript
// useAudio.ts
export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement>();
  const [autoplayed, setAutoplayed] = useState(false);
  
  const play = async () => {
    try {
      await audioRef.current?.play();
      setAutoplayed(true);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.warn('Autoplay blocked. Waiting for user interaction.');
        // Register for next user interaction
        document.addEventListener('click', play, { once: true });
      } else {
        console.error('Audio playback failed:', error);
      }
    }
  };
  
  return { play, autoplayed };
}
```

**Recovery**: Wait for next user interaction, then retry audio playback. Display subtle UI indicator that music is available.

#### 4. Performance Degradation

**Scenario**: Application runs below target FPS

**Handling**:
```typescript
// usePerformanceMonitor.ts
export function usePerformanceMonitor() {
  const { qualityLevel, setQualityLevel } = useStore();
  const fpsHistory = useRef<number[]>([]);
  
  useFrame(() => {
    const fps = calculateFPS();
    fpsHistory.current.push(fps);
    
    // Keep last 120 frames (2 seconds at 60fps)
    if (fpsHistory.current.length > 120) {
      fpsHistory.current.shift();
    }
    
    // Check average FPS
    const avgFPS = fpsHistory.current.reduce((a, b) => a + b) / fpsHistory.current.length;
    
    if (avgFPS < 25 && qualityLevel !== 'low') {
      console.warn('Performance degraded. Reducing quality to low.');
      setQualityLevel('low');
    } else if (avgFPS > 55 && avgFPS < 58 && qualityLevel === 'high') {
      setQualityLevel('medium');
    } else if (avgFPS > 58 && qualityLevel !== 'high') {
      setQualityLevel('high');
    }
  });
}
```

**Recovery**: Automatically reduce rendering quality by:
- Decreasing particle count
- Disabling post-processing effects
- Reducing shadow quality
- Lowering texture resolution

#### 5. React Component Errors

**Scenario**: React component throws during render

**Handling**:
```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    
    // Log to analytics service (optional)
    if (window.analytics) {
      window.analytics.track('Component Error', {
        error: error.message,
        componentStack: errorInfo.componentStack
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="component-error">
          <h2>Something went wrong</h2>
          <p>A part of the experience failed to load.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Wrap each major chapter component
<ErrorBoundary fallback={<ChapterErrorFallback />}>
  <MemoriesChapter />
</ErrorBoundary>
```

**Recovery**: Display error message with retry button. Other chapters continue functioning.

#### 6. Video Playback Errors

**Scenario**: Video element fails to play or stream

**Handling**:
```typescript
// VideoDisplay.tsx
function VideoDisplay({ video }: Props) {
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement>();
  
  const handleVideoError = (e: Event) => {
    const videoElement = e.target as HTMLVideoElement;
    const error = videoElement.error;
    
    let errorMessage = 'Video playback failed';
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video source not found';
          break;
      }
    }
    
    setError(new Error(errorMessage));
    console.error(`Video error for ${video.path}:`, errorMessage);
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('error', handleVideoError);
      return () => video.removeEventListener('error', handleVideoError);
    }
  }, []);
  
  if (error) {
    return (
      <Html center>
        <div className="video-error">
          <p>⚠️ {error.message}</p>
        </div>
      </Html>
    );
  }
  
  // Normal video rendering
}
```

**Recovery**: Display error message inline. Hide video display. Other videos continue functioning.

#### 7. Memory/Resource Leaks

**Scenario**: Three.js objects not properly disposed, causing memory growth

**Handling**:
```typescript
// useDispose.ts - Custom hook for cleanup
export function useDispose<T extends THREE.Object3D | THREE.Material | THREE.Geometry>(
  resource: T | null
) {
  useEffect(() => {
    return () => {
      if (resource) {
        // Dispose based on type
        if ('geometry' in resource) {
          resource.geometry?.dispose();
        }
        if ('material' in resource) {
          if (Array.isArray(resource.material)) {
            resource.material.forEach(m => m.dispose());
          } else {
            resource.material?.dispose();
          }
        }
        if ('dispose' in resource) {
          resource.dispose();
        }
      }
    };
  }, [resource]);
}

// Usage in components
function MemoryElement({ photo }: Props) {
  const texture = useTexture(photo.path);
  const meshRef = useRef<THREE.Mesh>();
  
  useDispose(texture);
  useDispose(meshRef.current);
  
  // Component code...
}
```

**Recovery**: Automatic cleanup prevents memory leaks. If memory does grow excessively, performance monitor reduces quality.

### Error Logging

```typescript
// errorLogger.ts
interface ErrorLog {
  timestamp: number;
  code: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  component?: string;
  stack?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  
  log(error: AppError | Error) {
    const log: ErrorLog = {
      timestamp: Date.now(),
      code: 'code' in error ? error.code : 'UNKNOWN_ERROR',
      message: error.message,
      severity: 'severity' in error ? error.severity : 'warning',
      component: 'component' in error ? error.component : undefined,
      stack: error.stack
    };
    
    this.logs.push(log);
    console.error('[Error]', log);
    
    // Limit log size
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }
  
  getLogs() {
    return this.logs;
  }
  
  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();
```

### User-Facing Error Messages

All errors presented to users follow these principles:
1. **Clear and non-technical**: Avoid jargon
2. **Actionable**: Provide next steps when possible
3. **Reassuring**: Emphasize that the experience continues
4. **Concise**: Keep messages brief

Examples:
- ✅ "Some photos couldn't load, but your experience continues."
- ❌ "Error 404: Asset not found at /assets/photo1.jpg"

- ✅ "Video unavailable. Please check your connection."
- ❌ "MEDIA_ERR_NETWORK: Network error code 2"

- ✅ "This experience works best on modern browsers like Chrome or Firefox."
- ❌ "WebGL context creation failed: GL_INVALID_OPERATION"