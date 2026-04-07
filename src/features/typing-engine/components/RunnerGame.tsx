/* @__NO_REACT_COMPILER__ */
"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface RunnerGameProps {
  wpm?: number;
  isActive?: boolean;
}

export function RunnerGame({ wpm = 0, isActive = true }: RunnerGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const speedRef = useRef(2);
  const isActiveRef = useRef(isActive);

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
    if (!containerRef.current || gameRef.current) {
      return;
    }

    let background: Phaser.GameObjects.TileSprite;
    let ground: Phaser.GameObjects.TileSprite;
    let player: Phaser.Physics.Arcade.Sprite;
    let isJumping = false;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1000,
      height: 350,
      parent: containerRef.current,
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
          // Create background (sky, clouds, AND cityscape/mountains)
          // Height: 260px (0 to 260) - scaled to show full cityscape/mountains
          background = this.add
            .tileSprite(0, 0, 1000, 400, "bg")
            .setOrigin(0)
            .setDepth(0)
            .setScale(1); // Ensure no scaling issues

          // Create road/ground (showing BOTH road lanes - road.png contains 2 lane sections)
          // Position: y=260 (start of road), height=90px (extends to y=350)
          ground = this.add
            .tileSprite(0, 310, 1000, 90, "road")
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
          player = this.physics.add.sprite(150, 338, "runner") as Phaser.Physics.Arcade.Sprite;
          player.play("running");
          player.setBounce(0);
          player.setOrigin(0.5, 1);
          player.setScale(0.42);
          player.setDepth(2);
          player.setCollideWorldBounds(true);

          // Add ground physics
          // Use an invisible static rectangle so only the scrolling road is visible.
          const groundPhysics = this.add.rectangle(500, 342, 1000, 16, 0x000000, 0);
          this.physics.add.existing(groundPhysics, true);

          // Enable collision with ground
          this.physics.add.collider(player, groundPhysics, () => {
            isJumping = false;
          });

          // Handle jump input
          this.input.keyboard?.on("keydown-SPACE", () => {
            if (!isJumping && player) {
              player.setVelocityY(-350);
              isJumping = true;
            }
          });
        },
        update: () => {
          if (!background || !ground || !player) return;

          if (!isActiveRef.current) {
            return;
          }

          // Update speed based on WPM (formula: speed = 2 + (wpm / 30))
          const currentSpeed = speedRef.current;

          // Move background (slower parallax effect)
          background.tilePositionX += currentSpeed * 0.2;

          // Move ground (full speed)
          ground.tilePositionX += currentSpeed;

          // Clamp player position - keep on or above road (y >= 305)
          // Keep feet on road baseline.
          if (player.y > 338) {
            player.setY(338);
            player.setVelocityY(0);
            isJumping = false;
          }
        },
      },
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="runner-game"
      className="mt-4 flex justify-center overflow-hidden rounded-lg"
      aria-label="Phaser Runner Game - Visual Typing Speed Indicator"
    />
  );
}
