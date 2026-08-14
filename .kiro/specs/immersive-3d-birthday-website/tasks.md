# Implementation Plan: Immersive 3D Birthday Website

## Overview

This implementation plan transforms the design into executable development tasks for creating an immersive 3D birthday website using React, TypeScript, Three.js, and React Three Fiber. The implementation follows a bottom-up approach: establishing project infrastructure, building core 3D systems, implementing content integration, adding UI layers, and finally polishing with animations and optimizations.

The experience celebrates a birthday through six chapters (Introduction, Memories, Moments, Message, Cake, Finale), integrating 18 photos, 5 videos, interactive cake with 21 candles, and personalized messaging for "Tushi".

## Tasks

- [ ] 1. Initialize project structure and dependencies
  - Create Vite + React + TypeScript project
  - Install Three.js ecosystem: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
  - Install animation libraries: `framer-motion`, `gsap`
  - Install state management: `zustand`
  - Install styling: `tailwindcss`, `postcss`, `autoprefixer`
  - Install dev dependencies: TypeScript types for React and Three.js
  - Configure TypeScript with strict mode and path aliases
  - Configure Tailwind CSS with custom theme colors (midnight, lavender, soft pink, gold)
  - Configure Vite for optimal bundling (manual chunks for three, animation, vendor)
  - Set up project directory structure: `src/components/{3d,chapters,ui,fallbacks}`, `src/hooks`, `src/store`, `src/config`, `src/utils`, `src/types`, `src/styles`
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.8_

- [ ] 2. Create configuration and type definitions
  - [ ] 2.1 Define TypeScript interfaces and types
    - Create `src/types/index.ts` with interfaces: `PhotoAsset`, `VideoAsset`, `Chapter`, `QualityLevel`, `CameraTarget`, `ChapterConfig`, `MemoryLayout`, `AppState`
    - Define component prop interfaces for all major components
    - Export union types for chapter navigation and quality levels
    - _Requirements: 15.1, 15.10_
  
  - [ ] 2.2 Create asset configuration files
    - Create `src/config/photoAssets.ts` mapping 18 photos (photo1-5.jpg, photo_n1-9.jpg, poster1-4.jpg) with IDs, paths, and placeholder captions
    - Create `src/config/videoAssets.ts` mapping 5 videos (video1-4.mp4, WhatsApp Video) with IDs, paths, and titles
    - Create `src/config/chapters.ts` defining 6 chapter configs with camera positions, lookAt targets, and transition durations
    - Create `src/config/theme.ts` with color palette (midnight #0a0514, lavender #c8b6ff, soft pink #f8c8dc, gold #ffd700, warm white #f8f8ff)
    - _Requirements: 3.6, 4.6, 8.1, 9.1, 16.2_
  
  - [ ] 2.3 Create birthday message configuration
    - Create `src/config/birthdayMessage.ts` with `recipientName: 'Tushi'` and array of message lines
    - Include personalized 21st birthday message with warm, genuine appreciation
    - Ensure all references use "Tushi" (not "Tushita")
    - Add clear comments indicating this is the editable content section
    - _Requirements: 7.1, 7.4, 7.5, 16.1, 16.3_

- [ ] 3. Implement Zustand state management store
  - Create `src/store/useStore.ts` with Zustand store
  - Implement loading state: `isLoading`, `loadingProgress`, `assetsLoaded` with setter actions
  - Implement journey state: `currentChapter`, `hasSeenOpening`, `chapterHistory` with navigation actions
  - Implement interaction state: `selectedMemory`, `playingVideo`, `isCandlesLit` with selection actions
  - Implement audio state: `isMusicPlaying`, `isMuted`, `volume` with control actions
  - Implement camera state: `cameraPosition`, `cameraTarget` with animation actions
  - Implement performance state: `deviceType`, `targetFPS`, `currentFPS`, `qualityLevel` with monitoring actions
  - Implement accessibility state: `prefersReducedMotion` with detection
  - Export typed hooks for store access
  - _Requirements: 2.5, 5.5, 8.1, 8.4, 11.1, 11.2, 12.1, 17.5_

- [ ] 4. Build core utilities and helpers
  - [ ] 4.1 Create AssetLoader utility class
    - Implement `src/utils/AssetLoader.ts` with singleton pattern
    - Create methods: `loadImage()`, `loadVideo()`, `loadAudio()` with Promise-based APIs
    - Implement asset caching with Map to avoid duplicate loading
    - Implement `preloadCritical()` for first 5 photos and particle textures
    - Implement `lazyLoad()` for remaining 13 photos and videos
    - Track loading progress and update store via callbacks
    - Implement resource disposal methods
    - Handle loading errors gracefully with fallback placeholders
    - _Requirements: 11.3, 11.4, 11.7, 13.2, 14.1, 14.2_
  
  - [ ] 4.2 Create Three.js helper utilities
    - Create `src/utils/three-helpers.ts` with common Three.js utilities
    - Implement `createPlaceholderTexture()` for failed image loads
    - Implement `disposeObject()` for proper Three.js memory cleanup
    - Implement `calculateMemoryPositions()` for 18-photo spatial layout in spiral/orbital pattern
    - Implement `getDistance()` for touch gesture calculations
    - Export reusable geometry and material creators
    - _Requirements: 3.7, 14.1_
  
  - [ ] 4.3 Create animation configuration utilities
    - Create `src/utils/animation-configs.ts` exporting animation constants
    - Define Framer Motion spring configs: `gentle`, `bouncy`, `stiff`, `slow`
    - Define GSAP easing presets for chapter transitions
    - Export timing constants for particle lifecycles, transitions, and delays
    - _Requirements: 9.5, 10.4_

- [ ] 5. Implement custom React hooks
  - [ ] 5.1 Create useDeviceType hook
    - Implement `src/hooks/useDeviceType.ts` detecting viewport breakpoints
    - Return `'mobile'` (0-767px), `'tablet'` (768-1023px), or `'desktop'` (1024px+)
    - Add resize event listener with cleanup
    - Update store with device type for adaptive rendering
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ] 5.2 Create usePerformanceMonitor hook
    - Implement `src/hooks/usePerformanceMonitor.ts` with FPS tracking using `useFrame`
    - Calculate FPS every 60 frames using performance.now()
    - Automatically adjust quality level: <25 FPS → low, 25-55 FPS → medium, >55 FPS → high
    - Update store with current FPS and quality level
    - Return `{ fps, qualityLevel }` for component consumption
    - _Requirements: 11.1, 11.2, 11.5, 11.6_
  
  - [ ] 5.3 Create useAudio hook
    - Implement `src/hooks/useAudio.ts` managing HTMLAudioElement
    - Accept audio source path as parameter
    - Create audio element with loop enabled, volume at 0.4 (40%)
    - Sync audio state with Zustand store (isPlaying, isMuted, volume)
    - Handle autoplay restrictions with try-catch and user interaction retry
    - Implement cleanup on unmount (pause and null reference)
    - Return audio controls: `play()`, `pause()`, `setVolume()`, `setMuted()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 14.6_
  
  - [ ] 5.4 Create useTouchGestures hook
    - Implement `src/hooks/useTouchGestures.ts` for mobile touch handling
    - Detect single finger drag for camera rotation
    - Detect two-finger pinch for camera zoom with distance calculation
    - Detect single tap for object selection
    - Detect double tap for modal close
    - Return event handlers: `handleTouchStart`, `handleTouchMove`, `handleTap`
    - _Requirements: 12.4, 12.7_
  
  - [ ] 5.5 Create useKeyboardNavigation hook
    - Implement `src/hooks/useKeyboardNavigation.ts` for accessibility
    - Listen for ArrowRight/Space to advance chapter
    - Listen for ArrowLeft to go back to previous chapter
    - Listen for Escape to close modals (selectedMemory, playingVideo)
    - Listen for Tab to focus next interactive element
    - Add event listener with cleanup on unmount
    - _Requirements: 17.1, 17.2_
  
  - [ ] 5.6 Create useReducedMotion hook
    - Implement `src/hooks/useReducedMotion.ts` checking media query
    - Query `(prefers-reduced-motion: reduce)` on mount
    - Update store with preference
    - Listen for preference changes with event listener
    - Return boolean indicating reduced motion preference
    - _Requirements: 17.3, 17.5_
  
  - [ ] 5.7 Create useChapterTransition hook
    - Implement `src/hooks/useChapterTransition.ts` managing camera animations between chapters
    - Accept target chapter as parameter
    - Use GSAP timeline to animate camera position and lookAt simultaneously
    - Apply chapter-specific duration and easing from chapter config
    - Animate environment opacity for Finale chapter
    - Clean up timeline on unmount or chapter change
    - _Requirements: 8.2, 8.5_

- [ ] 6. Build WebGL detection and fallback UI
  - [ ] 6.1 Create WebGL detection utility
    - Implement `detectWebGL()` function testing canvas.getContext('webgl')
    - Handle exceptions gracefully and return boolean
    - Add to `src/utils/three-helpers.ts`
    - _Requirements: 2.8, 14.3_
  
  - [ ] 6.2 Create WebGLFallback component
    - Create `src/components/fallbacks/WebGLFallback.tsx`
    - Display when WebGL is not supported
    - Show user-friendly message: "WebGL Not Supported" with instructions to use modern browser
    - Style with glassmorphism card matching design system
    - List compatible browsers: Chrome, Firefox, Safari, Edge
    - _Requirements: 2.8, 14.3_
  
  - [ ] 6.3 Create ErrorBoundary component
    - Create `src/components/fallbacks/ErrorBoundary.tsx` using class component
    - Catch React errors with `componentDidCatch` and `getDerivedStateFromError`
    - Log errors to console for debugging
    - Display graceful error message: "Some content failed to load, but the experience continues"
    - Allow children to render normally when no error
    - _Requirements: 14.4, 14.7_

- [ ] 7. Implement loading screen with asset preloading
  - Create `src/components/ui/LoadingScreen.tsx`
  - Display dark background (rgba(10, 5, 20, 1)) matching midnight theme
  - Render animated heart/star icon with CSS pulse and rotation animations
  - Display glassmorphism progress bar showing loading percentage
  - Show loading text: "Preparing something special..."
  - Use AssetLoader to preload critical assets (first 5 photos, particle textures, fonts)
  - Monitor THREE.DefaultLoadingManager progress events
  - Update Zustand store `loadingProgress` state (0-100)
  - Enforce minimum display time of 1.5 seconds even if assets load quickly
  - Trigger `onComplete` callback when loading finishes and minimum time elapsed
  - Use Framer Motion for fade-out transition (800ms duration)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 11.7_

- [ ] 8. Implement opening sequence with particles and text animation
  - Create `src/components/ui/OpeningSequence.tsx`
  - Render HTML Canvas for 2D particle rendering (500-800 star/dust particles)
  - Implement particle float animation with slow drift and subtle randomness
  - Create GSAP timeline with 5 phases (8-10 seconds total):
    - Phase 1 (0-2s): Fade in dark environment with particles
    - Phase 2 (2-4s): Display first text "Hey... I made something for you."
    - Phase 3 (4-6s): Display second text "And yes... you have to explore it."
    - Phase 4 (6-8s): Fade in Enter button with glow effect
    - Phase 5 (on click): 1.2s transition to main experience
  - Use Cinzel font, size 32-48px, soft white (#f8f8ff) with text-shadow glow
  - Create Enter button with glassmorphism styling, text "Enter ✨"
  - Apply Framer Motion hover animation (scale 1.05, glow intensity increase)
  - Trigger audio initialization on Enter button click (bypass autoplay restrictions)
  - Call `onEnter` callback and update `hasSeenOpening` in store
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.3_

- [ ] 9. Create core 3D scene setup with Canvas and lighting
  - [ ] 9.1 Set up React Three Fiber Canvas
    - Create `src/components/3d/Scene.tsx` as main 3D scene container
    - Configure Canvas with camera position [0, 2, 10], fov 50
    - Set gl props: antialias true, alpha false, powerPreference 'high-performance'
    - Set adaptive pixel ratio dpr={[1, 2]} for retina displays
    - Apply dark background color (#0a0514) and fog for atmospheric depth
    - Import and render child components: Lighting, ParticleSystem, chapter components
    - Add EffectComposer for post-processing (conditional based on quality level)
    - _Requirements: 2.1, 2.2, 9.1_
  
  - [ ] 9.2 Implement lighting system
    - Create `src/components/3d/Lighting.tsx`
    - Add AmbientLight with intensity 0.3, color #d8d0e8 (soft lavender)
    - Add DirectionalLight with intensity 0.8, position [5, 8, 5], color #fff8f0 (warm white)
    - Create 3-5 animated PointLights with colors from palette (pink, lavender, gold)
    - Animate PointLight positions in slow circular patterns using useFrame
    - Animate PointLight intensities with subtle pulse (0.4-0.8 range)
    - Add SpotLight for Cake chapter only (conditional rendering), focused on cake, warm tone #ffd700
    - Accept `chapter` prop to conditionally enable cake spotlight
    - _Requirements: 2.2, 9.2_
  
  - [ ] 9.3 Implement camera controller with OrbitControls
    - Create `src/components/3d/CameraController.tsx`
    - Import OrbitControls from Drei
    - Configure: enableDamping, dampingFactor 0.05, minDistance 5, maxDistance 20
    - Constrain polar angle: minPolarAngle π/4, maxPolarAngle π/2
    - Disable controls when modal is open (check store for selectedMemory or playingVideo)
    - Expose camera and controls refs for programmatic animation
    - Integrate with useChapterTransition hook for smooth chapter navigation
    - _Requirements: 2.3, 2.4, 2.5, 8.2, 12.7_

- [ ] 10. Build particle system with three types
  - [ ] 10.1 Create ambient particle system
    - Create `src/components/3d/ParticleSystem.tsx` with type prop 'ambient', 'trail', or 'burst'
    - For ambient type: Create BufferGeometry with Points
    - Set particle count based on quality level and device: 2000 (high/desktop), 1000 (medium), 400 (low/mobile)
    - Use PointsMaterial with custom shader for glow effect
    - Interpolate particle colors between white, soft pink, and lavender
    - Implement slow vertical drift with Perlin noise for naturalistic motion using useFrame
    - Use InstancedMesh for performance (single draw call)
    - Apply frustum culling to skip off-screen particles
    - _Requirements: 2.2, 11.5, 11.6_
  
  - [ ] 10.2 Create cursor trail particles (desktop only)
    - In ParticleSystem component, add type 'trail' handling
    - Spawn particles at mouse position projected into 3D space
    - Implement particle lifecycle: 0.5-1s fade out with opacity animation
    - Apply upward float physics with random horizontal spread
    - Use small glowing dots (SphereGeometry with emissive material)
    - Only render on desktop (check deviceType in store)
    - _Requirements: 2.5, 10.6_
  
  - [ ] 10.3 Create interaction burst particles
    - In ParticleSystem component, add type 'burst' handling
    - Accept position prop for burst origin
    - Spawn 20-50 particles per burst on trigger
    - Implement radial explosion physics from origin, then fall with gravity
    - Use random colors from theme palette
    - Fade out over 2-3 seconds
    - Triggered by: memory selection, cake candles blow, video start
    - _Requirements: 6.5, 10.5_

- [ ] 11. Checkpoint - Verify core infrastructure
  - Ensure all dependencies install correctly
  - Verify TypeScript compiles with no errors
  - Confirm Zustand store state updates correctly
  - Test asset loader preloads first 5 photos
  - Check loading screen displays and transitions
  - Verify opening sequence plays with particles and text
  - Confirm 3D scene renders with camera controls (orbit, zoom)
  - Test lighting system renders correctly
  - Verify ambient particles animate smoothly
  - Check performance monitor reports FPS and adjusts quality
  - Test all custom hooks function correctly
  - Verify keyboard navigation responds to arrow keys
  - Check device type detection works on resize
  - Ensure reduced motion preference is detected
  - Ask the user if questions arise

- [ ] 12. Implement Memory Element component for 18 photos
  - [ ] 12.1 Create MemoryElement base component
    - Create `src/components/3d/MemoryElement.tsx` accepting props: photo, position, rotation, style, visible
    - Load texture using useTexture hook from Drei (with error handling)
    - Create mesh with PlaneGeometry for base photo display
    - Implement three visual styles based on `style` prop:
      - 'polaroid': White border frame with 1:1 aspect ratio and padding
      - 'frame': Ornate gold/lavender border with BoxGeometry for 3D depth
      - 'holographic': Transparent glassmorphism border with iridescent edge glow
    - Apply MeshStandardMaterial with texture map
    - Add click handler calling store's `selectMemory(photo)` action
    - _Requirements: 3.1, 3.2, 3.7_
  
  - [ ] 12.2 Implement Memory Element hover interactions
    - Track hover state with useState and onPointerOver/onPointerOut events
    - Use Framer Motion's useSpring for smooth animations (tension 300, friction 20)
    - Animate scale: 1.0 default → 1.15 on hover (transition 200ms)
    - Animate opacity: 0.9 default → 1.0 on hover
    - Animate emissive intensity: 0 default → 0.5 on hover for soft white glow
    - Apply subtle rotation toward camera (5-10 degrees) on hover
    - Ensure hover effects only apply on desktop (not touch devices)
    - _Requirements: 3.3, 10.1, 10.2_
  
  - [ ] 12.3 Create PhotoModal for enlarged view
    - Create `src/components/ui/PhotoModal.tsx` displaying enlarged photo
    - Show when store's `selectedMemory` is not null
    - Dim background environment to 30% opacity
    - Display photo scaled to fill 70% of screen
    - Show caption/message below photo from photo asset config
    - Add close button and outside-click handler calling `selectMemory(null)`
    - Handle Escape key press to close (via useKeyboardNavigation hook)
    - Animate camera to focus on selected photo position
    - Use Framer Motion for modal fade-in and scale animation
    - _Requirements: 3.4, 3.5_

- [ ] 13. Implement Memories Chapter with 18 photo layout
  - Create `src/components/chapters/MemoriesChapter.tsx`
  - Import all 18 photo assets from config
  - Generate spatial layout using `calculateMemoryPositions()` utility
  - Arrange photos in spiral or orbital pattern with radius variations
  - Set heights varying from y=0.5 to y=3.5 for depth variation
  - Randomly assign style to each photo (polaroid, frame, holographic) for visual variety
  - Render 18 MemoryElement components with calculated positions and rotations
  - Accept `visible` prop to conditionally render (for mobile: show 10 at a time based on camera proximity)
  - Filter visible elements based on device type and performance
  - _Requirements: 3.6, 3.7, 12.6_

- [ ] 14. Implement Video Display component for 5 videos
  - [ ] 14.1 Create VideoDisplay base component
    - Create `src/components/3d/VideoDisplay.tsx` accepting props: video, position, visible
    - Create HTML5 video element in useMemo with props: crossOrigin 'anonymous', loop false, muted false, playsInline true
    - Create VideoTexture from video element for Three.js rendering
    - Render PlaneGeometry with 16:9 aspect ratio (3.2 x 1.8 units)
    - Apply MeshBasicMaterial with video texture map
    - Add holographic border using LineSegments with EdgesGeometry and lavender color (#c8b6ff)
    - Display video thumbnail (first frame frozen) in idle state
    - Add semi-transparent play icon overlay in idle state
    - Implement subtle pulsing glow effect using emissive animation
    - _Requirements: 4.1, 4.2, 4.7_
  
  - [ ] 14.2 Implement video playback interaction
    - Add click handler on VideoDisplay mesh
    - On click: Call video element's play() method
    - Update store with `playVideo(video)` action
    - Animate camera to video's camera target position
    - Dim surrounding environment to 50% opacity
    - Enlarge video to 80% screen coverage with scale animation
    - Show controls UI: play/pause button and close button
    - On close: Pause video, reset currentTime to 0, call `playVideo(null)`, reset camera, restore environment to 100% opacity
    - Handle video element errors gracefully with try-catch
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ] 14.3 Create VideoModal UI overlay
    - Create `src/components/ui/VideoModal.tsx` for video controls
    - Show when store's `playingVideo` is not null
    - Display floating play/pause button with icon toggle
    - Display close button (X icon) calling video close handler
    - Show video progress bar with current time and duration
    - Style with glassmorphism matching design system
    - Position controls at bottom of video viewport
    - Use Framer Motion for control fade-in animations
    - _Requirements: 4.4_

- [ ] 15. Implement Moments Chapter with 5 video layout
  - Create `src/components/chapters/MomentsChapter.tsx`
  - Import all 5 video assets from config
  - Arrange videos in arc or gallery layout with 5 units spacing
  - Position videos at staggered heights for visual interest
  - Calculate camera target positions for each video (closer view when playing)
  - Render 5 VideoDisplay components with calculated positions
  - Accept `visible` prop to conditionally render based on current chapter
  - Add chapter-specific ambient particles for atmosphere
  - _Requirements: 4.6_

- [ ] 16. Implement birthday message display
  - Create `src/components/ui/MessageDisplay.tsx`
  - Import birthday message from `src/config/birthdayMessage.ts`
  - Use Drei's Html component positioned at [0, 2, 0] in 3D space
  - Render glassmorphism container with backdrop-filter blur 10px, background rgba(255,255,255,0.05)
  - Apply border radius 20px, padding 40px 60px, max-width 600px
  - Use Playfair Display font, size 24-32px (responsive), color #f8f8ff, text-shadow glow
  - Map through message lines array rendering each as separate paragraph
  - Use Framer Motion to stagger line animations (0.8s delay between lines)
  - Animate each line: initial opacity 0, y 20 → animate to opacity 1, y 0
  - Ensure all text displays "Tushi" (verify recipientName in config)
  - Center align text within container
  - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [ ] 17. Implement Message Chapter
  - Create `src/components/chapters/MessageChapter.tsx`
  - Import and render MessageDisplay component
  - Set camera position for optimal message viewing [0, 2, 8]
  - Add subtle background particles for ambiance
  - Create semi-transparent background plane ensuring text readability
  - Accept `visible` prop to conditionally render based on current chapter
  - Trigger sequential text reveal animation when chapter becomes active
  - _Requirements: 7.1, 7.6, 8.1_

- [ ] 18. Implement interactive birthday cake
  - [ ] 18.1 Create Candle component
    - Create `src/components/3d/Candle.tsx` accepting props: position, lit
    - Render candle body using CylinderGeometry (radius 0.05, height 0.4)
    - Apply MeshStandardMaterial with white/cream color
    - Conditionally render flame using ConeGeometry (radius 0.03, height 0.1) when lit is true
    - Apply MeshBasicMaterial with emissive color yellow-orange (#ffaa33)
    - Animate flame with subtle bobbing motion using useFrame (sine wave on y-position)
    - Emit smoke particles when flame is extinguished (transition lit true → false)
    - _Requirements: 6.1_
  
  - [ ] 18.2 Create InteractiveCake component
    - Create `src/components/3d/InteractiveCake.tsx`
    - Render cake base using CylinderGeometry (radius 1.5, height 1, segments 32)
    - Apply MeshStandardMaterial with soft pink color (#f8c8dc), roughness 0.3, metalness 0.1
    - Add small SphereGeometry spheres around edge for decorations (pearls/sprinkles)
    - Calculate 21 candle positions: outer ring (13 candles at radius 1.2), inner ring (8 candles at radius 0.6)
    - Render 21 Candle components at calculated positions with y=1.2
    - Track candlesLit state (initially true)
    - Create SparkleParticles emitting from cake when candles lit
    - Add invisible click target cylinder around cake (radius 2, height 2)
    - _Requirements: 6.1, 6.4_
  
  - [ ] 18.3 Implement candle blowing interaction
    - Add onClick handler to cake click target
    - Return early if candles already unlit
    - Iterate through 21 candle positions with staggered timing (60ms per candle)
    - Set each candle's lit state to false sequentially for realistic effect
    - Emit smoke particles from each candle position as it extinguishes
    - After 1.5s delay, trigger celebration burst (200 particles exploding upward)
    - Update store `setCandlesLit(false)` and show "Make a wish ✨" message
    - Briefly boost music volume to 1.2x for 2 seconds (amplifyMusic)
    - Maintain particle burst effect for 2-3 seconds
    - _Requirements: 6.2, 6.3, 6.5_
  
  - [ ] 18.4 Display wish message after blowing candles
    - Use Drei's Html component positioned at [0, 3, 0] above cake
    - Show message when candlesLit is false in state
    - Display text "Make a wish ✨" with Cinzel font, size 3xl, white color
    - Use Framer Motion for appearance: initial opacity 0, y -20 → animate opacity 1, y 0
    - Apply text-shadow glow effect
    - Maintain message visibility for remainder of Cake chapter
    - _Requirements: 6.3_

- [ ] 19. Implement Cake Chapter
  - Create `src/components/chapters/CakeChapter.tsx`
  - Import and render InteractiveCake component at position [0, 0, 0]
  - Set camera position for optimal cake viewing [0, 3, 5] looking down at cake
  - Enable spotlight in Lighting component when this chapter is active
  - Add warm spotlight with gold tone (#ffd700) focused on cake
  - Create ambient particles specific to this chapter (sparkles, glows)
  - Accept `visible` prop to conditionally render based on current chapter
  - _Requirements: 6.1, 6.2, 8.1_

- [ ] 20. Implement Finale Chapter with cinematic pullback
  - Create `src/components/chapters/FinaleChapter.tsx`
  - Trigger cinematic camera pullback animation on mount using useEffect
  - Animate camera to bird's eye view position [0, 8, 15] over 3.5 seconds
  - Set lookAt target to [0, 2, 0] to view entire scene
  - Increase particle density by 50% (multiply particle count by 1.5)
  - Brighten environment by 30% (intensity multiplier 1.3)
  - Render all chapter components simultaneously with visible=true: MemoriesChapter, MomentsChapter, CakeChapter
  - After 4s delay (when camera settles), display final text overlay
  - Render final message using Html component, centered on screen
  - Show text: "Happy 21st Birthday, Tushi! 🎂✨" and "Here's to another year of beautiful memories."
  - Use Cinzel font, large size, with Framer Motion scale and fade animation
  - After 2s delay, fade in "Replay the memories ↻" button
  - Button onClick calls `restartExperience()` function resetting state and returning to Introduction
  - _Requirements: 8.5_

- [ ] 21. Implement navigation system
  - [ ] 21.1 Create NavigationControls component
    - Create `src/components/ui/NavigationControls.tsx`
    - Display 6 navigation dots vertically on right side of screen
    - Style dots with glassmorphism: circular, semi-transparent, backdrop blur
    - Current chapter dot: filled with glow effect and lavender color
    - Other chapter dots: hollow with border only
    - On hover: scale up dot and show chapter name tooltip
    - On click: call store's `setChapter(chapter)` action
    - Use Framer Motion for dot animations (whileHover scale 1.3, whileTap scale 0.9)
    - Position fixed at right: 2rem, top: 50%, transform: translateY(-50%)
    - _Requirements: 8.4, 8.6_
  
  - [ ] 21.2 Create forward/back navigation buttons
    - In NavigationControls component, add arrow buttons at bottom center
    - Show previous button (←) if not on first chapter (Introduction)
    - Show next button (→) if not on last chapter (Finale)
    - Style with glassmorphism matching dot design
    - On click: navigate to adjacent chapter using store's setChapter action
    - Update chapter history in store for tracking user path
    - Position fixed at bottom: 2rem, left: 50%, transform: translateX(-50%)
    - _Requirements: 8.3_
  
  - [ ] 21.3 Create ChapterIndicator component
    - Create `src/components/ui/ChapterIndicator.tsx`
    - Display current chapter name and number at top of screen
    - Show "Chapter 1 of 6: Introduction" format
    - Use elegant typography (Playfair Display) with glassmorphism background
    - Fade in/out on chapter transitions with Framer Motion
    - Position fixed at top: 2rem, left: 50%, transform: translateX(-50%)
    - _Requirements: 8.4_

- [ ] 22. Implement audio system and music controls
  - [ ] 22.1 Integrate audio with opening sequence
    - In OpeningSequence component, call useAudio hook with audio path
    - Set audio source: '/audio/birthday-music.mp3'
    - Initialize audio on Enter button click to bypass autoplay restrictions
    - Set initial volume to 0.4 (40%) as per requirements
    - Enable loop for continuous playback throughout experience
    - Handle autoplay failures with retry on next user interaction
    - Update store with initial audio state (playing, muted, volume)
    - _Requirements: 5.1, 5.3, 5.6, 14.6_
  
  - [ ] 22.2 Create MusicControls UI component
    - Create `src/components/ui/MusicControls.tsx`
    - Position fixed at top-right corner of screen
    - Display play/pause button with icon toggle (▶️ when paused, ⏸ when playing)
    - Display mute/unmute button with icon toggle (🔇 when muted, 🔊 when unmuted)
    - Apply glassmorphism styling matching navigation controls
    - Use Framer Motion for button hover (scale 1.1) and tap (scale 0.9) animations
    - When music is playing and not muted, show animated music indicator (3 bars with staggered scale animations)
    - Connect buttons to store actions: toggleMusic, setMuted
    - Persist muted state in localStorage for session continuity
    - _Requirements: 5.2, 5.5_

- [ ] 23. Implement post-processing effects
  - Create `src/components/3d/Effects.tsx`
  - Import EffectComposer, Bloom, Vignette, DepthOfField from @react-three/postprocessing
  - Accept qualityLevel prop from performance monitor
  - Return null if qualityLevel is 'low' (skip post-processing for performance)
  - Always render Bloom effect: intensity 0.5, luminanceThreshold 0.8, luminanceSmoothing 0.9, mipmapBlur enabled
  - Conditionally render Vignette if qualityLevel is 'high' or 'medium': offset 0.5, darkness 0.4
  - Conditionally render DepthOfField only if qualityLevel is 'high': focusDistance 0.02, focalLength 0.05, bokehScale 3
  - Integrate in Scene component within Canvas after all 3D objects
  - _Requirements: 9.4, 11.6_

- [ ] 24. Implement responsive design adaptations
  - [ ] 24.1 Create responsive UI sizing utilities
    - Add Tailwind breakpoint-based classes for text sizes: text-base md:text-lg lg:text-xl
    - Apply 0.75x scaling to mobile text, 0.85x to tablet, 1x to desktop
    - Increase UI button hit targets on mobile (minimum 44x44px for touch)
    - Scale glassmorphism container padding responsively: p-4 md:p-8 lg:p-12
    - Apply responsive max-widths to message container and modals
    - _Requirements: 12.5_
  
  - [ ] 24.2 Implement device-specific 3D rendering optimizations
    - In Scene component, adjust Canvas dpr based on deviceType: [1, 1.5] for mobile, [1, 2] for tablet/desktop
    - Reduce particle counts on mobile: 800 vs 2000 on desktop
    - Limit Memory Element rendering on mobile: show 10 closest photos vs all 18
    - Disable cursor trail particles on mobile (touch devices)
    - Disable hover effects on touch devices (check deviceType)
    - Simplify post-processing on mobile: Bloom only, no DOF
    - _Requirements: 12.6_
  
  - [ ] 24.3 Integrate touch gesture controls
    - Use useTouchGestures hook in Scene component
    - Attach touch event handlers to Canvas element
    - Enable drag to rotate camera via OrbitControls on touch
    - Enable pinch to zoom via touch gesture handler
    - Enable tap to select objects via raycasting
    - Enable double-tap to close modals
    - Ensure equivalent functionality to mouse controls on touch devices
    - _Requirements: 12.4, 12.7_

- [ ] 25. Implement accessibility features
  - [ ] 25.1 Add keyboard navigation throughout UI
    - Integrate useKeyboardNavigation hook in App component
    - Ensure all interactive elements are keyboard-focusable (buttons, links, controls)
    - Add tabIndex attributes where necessary for proper tab order
    - Test navigation through all chapters using arrow keys
    - Test modal close using Escape key
    - Test element focus using Tab key
    - _Requirements: 17.1, 17.2_
  
  - [ ] 25.2 Apply visible focus indicators
    - Add Tailwind focus classes to all interactive elements: focus:outline focus:outline-2 focus:outline-lavender focus:outline-offset-4
    - Apply focus:ring utilities for glassmorphism buttons
    - Ensure focus indicators contrast against background (minimum 3:1 ratio)
    - Test focus indicators with keyboard navigation
    - _Requirements: 17.2_
  
  - [ ] 25.3 Integrate reduced motion support
    - Use useReducedMotion hook in ParticleSystem component
    - If prefersReducedMotion is true, return null (skip particle rendering)
    - If prefersReducedMotion is true, disable auto-play animations in Opening Sequence
    - If prefersReducedMotion is true, reduce GSAP animation durations by 50%
    - If prefersReducedMotion is true, use instant transitions for chapter changes
    - Respect user's browser/OS preference for reduced motion
    - _Requirements: 17.3, 17.5_
  
  - [ ] 25.4 Add ARIA labels to interactive elements
    - Add aria-label to music controls: "Play background music", "Pause background music", "Mute audio", "Unmute audio"
    - Add aria-label to navigation controls: "Navigate to [Chapter Name]", "Previous chapter", "Next chapter"
    - Add aria-label to Enter button: "Begin birthday experience"
    - Add aria-label to photo close button: "Close photo view"
    - Add aria-label to video close button: "Close video player"
    - Add role="button" to custom button elements
    - Add role="navigation" to NavigationControls container with aria-label="Chapter navigation"
    - _Requirements: 17.1_
  
  - [ ] 25.5 Ensure text contrast ratios
    - Verify all text colors meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text)
    - Test warm white (#f8f8ff) on dark backgrounds (should pass)
    - Add text-shadow or background overlays where text contrast is insufficient
    - Test readability of messages on glassmorphism backgrounds
    - _Requirements: 17.4_

- [ ] 26. Checkpoint - Verify complete experience flow
  - Test full user journey from loading to finale
  - Verify loading screen → opening sequence → main experience transition
  - Test all 6 chapters load and transition smoothly
  - Confirm 18 photos display correctly in Memories chapter
  - Verify 5 videos play correctly in Moments chapter
  - Test birthday message displays with correct text ("Tushi", not "Tushita")
  - Verify cake interaction: click → candles blow → wish message
  - Test finale scene: camera pullback → final message → replay button
  - Confirm music plays and controls work (play/pause, mute/unmute)
  - Test navigation controls (dots, forward/back buttons, keyboard)
  - Verify modals open and close correctly (photos, videos)
  - Test on desktop and mobile devices
  - Check performance: 60 FPS desktop, 30 FPS mobile
  - Verify accessibility features work (keyboard nav, focus indicators, reduced motion)
  - Ensure no console errors or warnings
  - Ask the user if questions arise

- [ ] 27. Integrate all chapters into main experience
  - Create `src/components/MainExperience.tsx` as container for full 3D experience
  - Import Scene component with Canvas
  - Import all chapter components: MemoriesChapter, MomentsChapter, MessageChapter, CakeChapter, FinaleChapter
  - Conditionally render chapters based on store's currentChapter state
  - Import UI overlay components: NavigationControls, MusicControls, ChapterIndicator, PhotoModal, VideoModal
  - Layer UI components above Canvas using fixed positioning
  - Initialize audio with useAudio hook
  - Initialize keyboard navigation with useKeyboardNavigation hook
  - Initialize device type detection with useDeviceType hook
  - Initialize performance monitoring with usePerformanceMonitor hook
  - Apply useChapterTransition hook for smooth camera animations between chapters
  - _Requirements: 8.1, 8.2_

- [ ] 28. Create main App component and routing
  - Create `src/App.tsx` as root component
  - Wrap with ErrorBoundary for graceful error handling
  - Conditionally render based on application state:
    - If WebGL not supported: render WebGLFallback
    - If isLoading: render LoadingScreen
    - If !hasSeenOpening: render OpeningSequence
    - Else: render MainExperience
  - Manage state transitions: loading → opening → experience
  - Trigger asset preloading on mount
  - Initialize Zustand store on mount
  - Apply global styles from src/styles/global.css
  - _Requirements: 1.4, 2.8, 13.4, 14.3_

- [ ] 29. Implement memory management and cleanup
  - Add useEffect cleanup in MemoryElement: dispose geometry, material, texture on unmount
  - Add useEffect cleanup in VideoDisplay: pause video, dispose video texture on unmount
  - Add useEffect cleanup in ParticleSystem: dispose geometries, materials, buffers on unmount
  - Add useEffect cleanup in InteractiveCake: dispose all mesh resources on unmount
  - Implement `disposeObject()` utility in three-helpers.ts for recursive cleanup
  - Call dispose methods in useChapterTransition when switching chapters
  - Clear asset loader cache when returning to Introduction (replay)
  - _Requirements: 11.3, 11.7_

- [ ] 30. Optimize build configuration and asset handling
  - Update vite.config.ts with base: './' for relative paths (GitHub Pages compatibility)
  - Configure build output: outDir 'dist', assetsDir 'assets', sourcemap false, minify 'terser'
  - Add manual chunks for code splitting: 'three' bundle, 'animation' bundle, 'vendor' bundle
  - Configure optimizeDeps to include three, @react-three/fiber, @react-three/drei
  - Compress images in /public/assets using image optimization tool (keep quality above 85%)
  - Verify total bundle size under performance budget: initial < 500KB gzipped, three < 800KB, total < 1.5MB
  - Test build output with `npm run build` and verify no errors
  - _Requirements: 11.4, 15.9_

- [ ] 31. Set up production deployment for GitHub Pages
  - Install gh-pages package: `npm install -D gh-pages`
  - Add deploy script to package.json: `"deploy": "npm run build && gh-pages -d dist"`
  - Create .gitignore excluding node_modules, dist, .env
  - Create README.md with project description, setup instructions, and deployment guide
  - Test production build locally with `npm run preview`
  - Run deployment with `npm run deploy`
  - Verify GitHub Pages settings: enable Pages from gh-pages branch, root directory
  - Test deployed site on GitHub Pages URL
  - Verify all assets load correctly (photos, videos, audio)
  - _Requirements: 15.9_

- [ ] 32. Final testing and polish
  - [ ] 32.1 Cross-browser compatibility testing
    - Test on Chrome latest (desktop and mobile)
    - Test on Firefox latest
    - Test on Safari latest (desktop and iOS)
    - Test on Edge latest
    - Verify video playback works in all browsers
    - Verify audio playback respects autoplay policies
    - Test WebGL rendering consistency across browsers
    - Document any browser-specific issues and workarounds
    - _Requirements: 4.7, 14.3_
  
  - [ ] 32.2 Performance validation
    - Use Chrome DevTools Performance panel to profile rendering
    - Verify frame rate maintains 60 FPS on desktop (mid-range specs)
    - Verify frame rate maintains 30 FPS on mobile (mid-range specs)
    - Check memory usage stays under 200MB on desktop, 100MB on mobile
    - Verify quality level adjusts automatically when FPS drops
    - Test lazy loading: remaining photos load after initial 5
    - Verify no memory leaks over 5-minute session
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6_
  
  - [ ] 32.3 Content verification and personalization
    - Verify all 18 photos load from correct paths (photo1-5.jpg, photo_n1-9.jpg, poster1-4.jpg)
    - Verify all 5 videos load from correct paths (video1-4.mp4, WhatsApp Video)
    - Confirm birthday message displays with "Tushi" in all instances (not "Tushita")
    - Verify 21 candles render on cake for 21st birthday
    - Confirm finale message shows "Happy 21st Birthday, Tushi! 🎂✨"
    - Test content editability: update birthday message in config and verify changes reflect
    - Test photo caption changes reflect in PhotoModal
    - _Requirements: 3.6, 4.6, 7.4, 7.5, 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 32.4 Error handling and edge cases
    - Test with missing photo asset: verify placeholder displays
    - Test with missing video asset: verify error message and graceful degradation
    - Test with missing audio file: verify experience continues without music
    - Test on browser without WebGL: verify fallback message displays
    - Test with slow network: verify progressive loading and loading screen accuracy
    - Test with disabled JavaScript: verify appropriate message (if applicable)
    - Verify no unhandled errors appear in console during normal usage
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  
  - [ ] 32.5 Accessibility compliance verification
    - Test complete keyboard navigation through entire experience
    - Verify all focus indicators are visible on all interactive elements
    - Test with reduced motion preference enabled: verify particles disabled, animations reduced
    - Use axe DevTools to scan for accessibility violations
    - Verify all interactive elements have ARIA labels
    - Test color contrast ratios with WebAIM Contrast Checker
    - Test Escape key closes all modals
    - Note: Full WCAG compliance requires manual assistive technology testing (out of scope)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

## Notes

- The design document specifies React + TypeScript + Three.js stack, so no language selection is needed
- All visible text must use **"Tushi"** not "Tushita" - this applies to birthday message, finale text, and configuration
- Tasks follow incremental approach: infrastructure → core systems → content → UI → polish
- Testing and checkpoints integrated throughout to catch issues early
- Asset paths reference existing files in `/public/assets/` directory
- Performance optimization is continuous: particle counts, quality levels, lazy loading, memory cleanup
- Accessibility features are built-in from the start, not added afterward
- Each task references specific requirement clause numbers for traceability
- Configuration files enable easy content editing without modifying component logic
- Error handling and fallbacks ensure graceful degradation for missing assets or unsupported browsers
- The experience is deployment-ready for GitHub Pages with optimized build configuration

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3", "4.1", "4.2", "4.3"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7", "8"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 7, "tasks": ["10.2", "10.3"] },
    { "id": 8, "tasks": ["12.1"] },
    { "id": 9, "tasks": ["12.2", "12.3", "13"] },
    { "id": 10, "tasks": ["14.1"] },
    { "id": 11, "tasks": ["14.2", "14.3", "15"] },
    { "id": 12, "tasks": ["16", "17"] },
    { "id": 13, "tasks": ["18.1"] },
    { "id": 14, "tasks": ["18.2"] },
    { "id": 15, "tasks": ["18.3", "18.4", "19"] },
    { "id": 16, "tasks": ["20"] },
    { "id": 17, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 18, "tasks": ["22.1", "22.2", "23"] },
    { "id": 19, "tasks": ["24.1", "24.2", "24.3"] },
    { "id": 20, "tasks": ["25.1", "25.2", "25.3", "25.4", "25.5"] },
    { "id": 21, "tasks": ["27", "28", "29"] },
    { "id": 22, "tasks": ["30"] },
    { "id": 23, "tasks": ["31"] },
    { "id": 24, "tasks": ["32.1", "32.2", "32.3", "32.4", "32.5"] }
  ]
}
```
