/* @__NO_REACT_COMPILER__ */
"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface RunnerGameProps {
  wpm?: number;
  isActive?: boolean;
  hasStartedTyping?: boolean;
  isFullscreen?: boolean;
  asBackground?: boolean;
}

export function RunnerGame({
  wpm = 0,
  isActive = true,
  hasStartedTyping = false,
  isFullscreen = false,
  asBackground = false,
}: RunnerGameProps) {
  const backgroundWidth = isFullscreen ? 2200 : 1600;
  const backgroundHeight = isFullscreen ? 760 : 560;
  const sceneWidth = asBackground ? backgroundWidth : 1000;
  const sceneHeight = asBackground ? backgroundHeight : 250;
  const roadHeight = asBackground ? (isFullscreen ? 104 : 98) : 90;
  const roadY = sceneHeight - roadHeight;
  const runnerBaselineY = sceneHeight - (asBackground ? 12 : 14);
  const runnerStartX = asBackground ? Math.round(sceneWidth * 0.5) : 150;
  const runnerScale = asBackground ? (isFullscreen ? 0.6 : 0.52) : 0.42;

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const speedRef = useRef(2);
  const isActiveRef = useRef(isActive);
  const hasStartedTypingRef = useRef(false);

  useEffect(() => {
    speedRef.current = 2 + (wpm / 30);
  }, [wpm]);

  useEffect(() => {
    isActiveRef.current = isActive;
    const game = gameRef.current;

    if (!game) {
      return;
    }

    if (isActive) {
      game.loop.wake();
    } else {
      game.loop.sleep();
    }
  }, [isActive]);

  useEffect(() => {
    if (!hasStartedTyping || hasStartedTypingRef.current) {
      return;
    }

    hasStartedTypingRef.current = true;

    if (!musicRef.current) {
      musicRef.current = new Audio("/sounds/raceBackgroundSound.mp3");
      musicRef.current.loop = true;
      musicRef.current.volume = 0.35;
    }

    void musicRef.current.play().catch((error) => {
      console.error("Failed to play runner music", error);
    });
  }, [hasStartedTyping]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    let backgroundA: Phaser.GameObjects.Image;
    let backgroundB: Phaser.GameObjects.Image;
    let ground: Phaser.GameObjects.TileSprite;
    let player: Phaser.Physics.Arcade.Sprite;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: sceneWidth,
      height: sceneHeight,
      parent: containerRef.current,
      scale: {
        mode: asBackground ? Phaser.Scale.ENVELOP : Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: { x: 0, y: 1200 },
        },
      },
      scene: {
        preload() {
          // Load images from public/assests/singlePlayerImages
          this.load.image("bg", "/assests/singlePlayerImages/bg.png");
          this.load.image("road", "/assests/singlePlayerImages/road.png");

          // Load spritesheet for running animation
          this.load.spritesheet("runner", "/assests/singlePlayerImages/runner.png", {
            frameWidth: 178,
            frameHeight: 288,
          });
        },
        create() {
          backgroundA = this.add
            .image(0, 0, "bg")
            .setOrigin(0)
            .setDepth(0)
            .setDisplaySize(sceneWidth, sceneHeight);

          backgroundB = this.add
            .image(sceneWidth, 0, "bg")
            .setOrigin(0)
            .setDepth(0)
            .setDisplaySize(sceneWidth, sceneHeight);

          ground = this.add
            .tileSprite(0, roadY, sceneWidth, roadHeight, "road")
            .setOrigin(0)
            .setDepth(1);

          // Create running animation
          this.anims.create({
            key: "running",
            frames: this.anims.generateFrameNumbers("runner", {
              start: 0,
              end: 4,
            }),
            frameRate: 10,
            repeat: -1,
          });

          // Create player sprite and anchor feet to the road baseline.
          player = this.physics.add.sprite(runnerStartX, runnerBaselineY, "runner") as Phaser.Physics.Arcade.Sprite;
          player.play("running");
          player.setBounce(0);
          player.setOrigin(0.5, 1);
          player.setScale(runnerScale);
          player.setDepth(2);
          player.setCollideWorldBounds(true);

          // Add ground physics
          // Use an invisible static rectangle so only the scrolling road is visible.
          const groundPhysics = this.add.rectangle(
            sceneWidth / 2,
            sceneHeight - 8,
            sceneWidth,
            16,
            0x000000,
            0
          );
          this.physics.add.existing(groundPhysics, true);

          // Enable collision with ground
          this.physics.add.collider(player, groundPhysics);

          // Keep the game purely visual inside the typing panel.
          // We do not attach mouse/keyboard handlers from Phaser.
          this.input.enabled = false;
        },
        update: () => {
          if (!backgroundA || !backgroundB || !ground || !player) return;

          if (!isActiveRef.current) {
            return;
          }

          // Update speed based on WPM (formula: speed = 2 + (wpm / 30))
          const currentSpeed = speedRef.current;

          // Move sky/mountains with horizontal looping only.
          const backgroundSpeed = currentSpeed * 0.2;
          backgroundA.x -= backgroundSpeed;
          backgroundB.x -= backgroundSpeed;

          if (backgroundA.x + sceneWidth <= 0) {
            backgroundA.x = backgroundB.x + sceneWidth;
          }

          if (backgroundB.x + sceneWidth <= 0) {
            backgroundB.x = backgroundA.x + sceneWidth;
          }

          // Move ground (full speed)
          ground.tilePositionX += currentSpeed;

          // Keep the runner locked to the ground baseline.
          if (player.y > runnerBaselineY) {
            player.setY(runnerBaselineY);
            player.setVelocityY(0);
          }
        },
      },
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup function
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [asBackground, isFullscreen, roadHeight, roadY, runnerBaselineY, runnerScale, runnerStartX, sceneHeight, sceneWidth]);

  return (
    <div
      ref={containerRef}
      id="runner-game"
      className={
        asBackground
          ? "pointer-events-none absolute inset-0 z-0 overflow-hidden"
          : `mt-4 flex w-full flex-1 justify-center overflow-hidden rounded-lg ${
              isFullscreen ? "min-h-[calc(100vh-19rem)]" : "min-h-87.5"
            }`
      }
      aria-label="Phaser Runner Game - Visual Typing Speed Indicator"
    />
  );
}
