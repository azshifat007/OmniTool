'use client'

import { useTheme } from './ThemeProvider'

export default function GlowingShadow({ children }) {
  const { dark } = useTheme()

  return (
    <>
      <style jsx>{`
        @property --hue {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --rotate {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-x {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-translate-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-size {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-opacity {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-blur {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-scale {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --glow-radius {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --white-shadow {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }

        .glow-container {
          --card-color: var(--color-surface);
          --card-radius: 1.5vw;
          --border-width: 1px;
          --bg-size: 1;
          --hue: 0;
          --hue-speed: 1;
          --rotate: 0;
          --animation-speed: 20s;
          --interaction-speed: 0.55s;
          --glow-scale: 0.4;
          --scale-factor: 1;
          --glow-blur: 20;
          --glow-opacity: 0.06;
          --glow-radius: 100;
          --glow-rotate-unit: 1deg;
          --bg-gradient-base: hsl(0deg 0% 16%);
          --glow-lightness: 50%;
          --shadow-color: rgb(255 255 255 / 20%);

          width: 100%;
          position: relative;
          z-index: 2;
          border-radius: var(--card-radius);
        }

        .light {
          --bg-gradient-base: hsl(0deg 0% 88%);
          --glow-lightness: 68%;
          --shadow-color: rgb(0 0 0 / 6%);
        }

        .glow-container:before,
        .glow-container:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: var(--card-radius);
        }

        .glow-content {
          position: relative;
          background: var(--card-color);
          border-radius: calc(var(--card-radius) * 0.9);
          padding: 1.5rem;
          overflow: hidden;
        }

        .glow-content :global(*) {
          position: relative;
          z-index: 1;
        }

        .glow-content:before {
          content: "";
          display: block;
          position: absolute;
          inset: calc(-1 * var(--border-width));
          border-radius: calc(var(--card-radius) * 0.9);
          z-index: 0;
          background: var(--bg-gradient-base) radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 25% 85%) calc(0% * var(--bg-size)),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 25% 75%) calc(20% * var(--bg-size)),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 25% 60%) calc(40% * var(--bg-size)),
            transparent 100%
          );
          animation: hue-animation var(--animation-speed) linear infinite,
                     rotate-bg var(--animation-speed) linear infinite;
          transition: --bg-size var(--interaction-speed) ease;
        }

        .glow {
          --glow-translate-y: 0;
          display: block;
          position: absolute;
          width: 20%;
          aspect-ratio: 1;
          animation: rotate var(--animation-speed) linear infinite;
          transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit)));
          transform-origin: center;
          border-radius: calc(var(--glow-radius) * 10vw);
        }

        .glow:after {
          content: "";
          display: block;
          z-index: -2;
          filter: blur(calc(var(--glow-blur) * 10px));
          width: 130%;
          height: 130%;
          left: -15%;
          top: -15%;
          background: hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 20% var(--glow-lightness));
          position: relative;
          border-radius: calc(var(--glow-radius) * 10vw);
          animation: hue-animation var(--animation-speed) linear infinite;
          transform: scaleY(calc(var(--glow-scale) * var(--scale-factor) / 1.1))
                     scaleX(calc(var(--glow-scale) * var(--scale-factor) * 1.2))
                     translateY(calc(var(--glow-translate-y) * 1%));
          opacity: var(--glow-opacity);
        }

        .glow-container:hover .glow-content {
        }

        .glow-container:hover .glow-content:before {
          --bg-size: 2;
          animation-play-state: paused;
          transition: --bg-size var(--interaction-speed) ease;
        }

        .glow-container:hover .glow {
          --glow-blur: 16;
          --glow-opacity: 0.08;
          --glow-scale: 0.6;
          --glow-radius: 2;
          --rotate: 900;
          --glow-rotate-unit: 0;
          --scale-factor: 1.1;
          animation-play-state: paused;
        }

        .glow-container:hover .glow:after {
          --glow-translate-y: 0;
          animation-play-state: paused;
          transition: --glow-translate-y 0s ease, --glow-blur 0.05s ease,
                      --glow-opacity 0.05s ease, --glow-scale 0.05s ease,
                      --glow-radius 0.05s ease;
        }

        @keyframes shadow-pulse {
          0%, 24%, 46%, 73%, 96% {
            --white-shadow: 0.5;
          }
          12%, 28%, 41%, 63%, 75%, 82%, 98% {
            --white-shadow: 2.5;
          }
          6%, 32%, 57% {
            --white-shadow: 1.3;
          }
          18%, 52%, 88% {
            --white-shadow: 3.5;
          }
        }

        @keyframes rotate-bg {
          0% {
            --bg-x: 0;
            --bg-y: 0;
          }
          25% {
            --bg-x: 100;
            --bg-y: 0;
          }
          50% {
            --bg-x: 100;
            --bg-y: 100;
          }
          75% {
            --bg-x: 0;
            --bg-y: 100;
          }
          100% {
            --bg-x: 0;
            --bg-y: 0;
          }
        }

        @keyframes rotate {
          from {
            --rotate: -70;
            --glow-translate-y: -65;
          }
          25% {
            --glow-translate-y: -65;
          }
          50% {
            --glow-translate-y: -65;
          }
          60%, 75% {
            --glow-translate-y: -65;
          }
          85% {
            --glow-translate-y: -65;
          }
          to {
            --rotate: calc(360 - 70);
            --glow-translate-y: -65;
          }
        }

        @keyframes hue-animation {
          0% {
            --hue: 0;
          }
          100% {
            --hue: 360;
          }
        }
      `}</style>

      <div className={`glow-container ${dark ? '' : 'light'}`}>
        <span className="glow"></span>
        <div className="glow-content">
          {children}
        </div>
      </div>
    </>
  )
}
