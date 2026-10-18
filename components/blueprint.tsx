"use client";

import { useLayoutEffect, useRef } from "react";

const INTRO_KEY = "dfs-blueprint-intro";
const INTRO_MS = 8800;
const SAMPLES = 160;

function Coil({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="18" fill="url(#hatch)" stroke="#d7ecff" strokeWidth="1.2" />
      <path d={`M${x - 8} ${y - 8} L${x + 8} ${y + 8} M${x + 8} ${y - 8} L${x - 8} ${y + 8}`} stroke="#d7ecff" strokeWidth="0.7" />
    </g>
  );
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
}

function samplePath(path: SVGPathElement, count: number) {
  const length = path.getTotalLength();
  const points: [number, number][] = [];
  for (let index = 0; index < count; index += 1) {
    const point = path.getPointAtLength((index / count) * length);
    points.push([point.x, point.y]);
  }
  return points;
}

function circlePoints(cx: number, cy: number, radius: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as [number, number];
  });
}

function rotateTo(points: [number, number][], index: number) {
  return points.slice(index).concat(points.slice(0, index));
}

function nearest(points: readonly (readonly [number, number])[], target: readonly [number, number]) {
  let best = 0;
  let bestDistance = Infinity;
  points.forEach((point, index) => {
    const dx = point[0] - target[0];
    const dy = point[1] - target[1];
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

function fitStart(start: [number, number][], end: [number, number][]) {
  const score = (points: [number, number][]) =>
    points.reduce((sum, point, index) => {
      if (index % 8 !== 0) return sum;
      const dx = point[0] - end[index][0];
      const dy = point[1] - end[index][1];
      return sum + dx * dx + dy * dy;
    }, 0);
  const forward = rotateTo(start, nearest(start, end[0]));
  const reversed = rotateTo([...start].reverse(), nearest([...start].reverse(), end[0]));
  return score(forward) <= score(reversed) ? forward : reversed;
}

function lerpPath(start: [number, number][], end: [number, number][], progress: number) {
  let path = "";
  for (let index = 0; index < end.length; index += 1) {
    const x = start[index][0] + (end[index][0] - start[index][0]) * progress;
    const y = start[index][1] + (end[index][1] - start[index][1]) * progress;
    path += `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${path}Z`;
}

function ease(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

let introClaimed = false;

export function Blueprint() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = localStorage.getItem(INTRO_KEY) === "1";
    } catch {
      seen = true;
    }
    if (reduce || (seen && !introClaimed)) return;

    introClaimed = true;
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Private mode can block storage; the drawing still plays this once.
    }

    const targets = [...root.querySelectorAll<SVGPathElement>("[data-morph]")];
    const pairs = targets.map((path) => {
      const end = samplePath(path, SAMPLES);
      const start = fitStart(
        circlePoints(Number(path.dataset.cx), Number(path.dataset.cy), Number(path.dataset.r), SAMPLES),
        end,
      );
      return { path, start, end, original: path.getAttribute("d") ?? "" };
    });

    root.dataset.assembling = "true";
    root.style.setProperty("--assemble", "0");
    for (const pair of pairs) pair.path.setAttribute("d", lerpPath(pair.start, pair.end, 0));

    const started = performance.now();
    let frame = 0;
    let cancelled = false;
    const tick = (now: number) => {
      if (cancelled) return;
      const progress = Math.min(1, (now - started) / INTRO_MS);
      const eased = ease(progress);
      root.style.setProperty("--assemble", eased.toFixed(4));
      for (const pair of pairs) pair.path.setAttribute("d", lerpPath(pair.start, pair.end, eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      for (const pair of pairs) pair.path.setAttribute("d", pair.original);
      delete root.dataset.assembling;
      root.style.removeProperty("--assemble");
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      for (const pair of pairs) pair.path.setAttribute("d", pair.original);
      delete root.dataset.assembling;
      root.style.removeProperty("--assemble");
    };
  }, []);

  return (
    <div ref={rootRef} className="blueprint-sheet pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="fine" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0 H0 V28" fill="none" stroke="rgba(170,210,255,0.11)" strokeWidth="0.7" />
          </pattern>
          <pattern id="major" width="140" height="140" patternUnits="userSpaceOnUse">
            <path d="M140 0 H0 V140" fill="none" stroke="rgba(170,210,255,0.2)" strokeWidth="0.9" />
          </pattern>
          <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0 H7" stroke="rgba(198,226,255,0.55)" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="1600" height="1000" fill="#07111c" />
        <rect width="1600" height="1000" fill="url(#fine)" />
        <rect width="1600" height="1000" fill="url(#major)" />

        <g fill="none" stroke="#b9dcff" strokeWidth="1" opacity="0.85">
          <path d="M36 28 H64 M36 28 V56" />
          <path d="M1564 28 H1536 M1564 28 V56" />
          <path d="M36 972 H64 M36 972 V944" />
          <path d="M1564 972 H1536 M1564 972 V944" />
        </g>

        <g data-arrive>
        <g transform="translate(70 150)" fill="none" stroke="#9fd0ff" strokeWidth="1.05" opacity="0.5">
          {[78, 64, 50, 36, 22].map((radius) => (
            <circle key={radius} cx="0" cy="0" r={radius} />
          ))}
          <circle cx="18" cy="0" r="2.2" fill="#f4efe4" stroke="none" />
          <path d="M70 -22 A74 74 0 0 1 70 22" strokeDasharray="3 3" />
          <path d="M78 0 l-12 -6 M78 0 l-12 6" />
          <text x="96" y="4" fill="#c5dff8" stroke="none" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.5">
            TOROIDAL PLAN
          </text>
        </g>
        </g>

        <g transform="translate(860 80)">
          <line x1="48" y1="30" x2="48" y2="760" stroke="#8ec4f5" strokeWidth="0.8" strokeDasharray="4 5" />
          <text data-arrive x="8" y="400" fill="#c5dff8" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="2" transform="rotate(-90 8 400)">
            AXIS
          </text>

          <path
            data-morph
            data-cx="450"
            data-cy="390"
            data-r="310"
            d="M210 78 C250 230 214 540 236 700 C390 820 640 730 688 390 C640 40 360 -8 210 78 Z"
            fill="none"
            stroke="#9fd0ff"
            strokeWidth="1.35"
          />
          <path
            data-morph
            data-cx="450"
            data-cy="390"
            data-r="250"
            d="M248 128 C276 250 250 530 268 662 C400 748 600 680 632 390 C598 100 390 48 248 128 Z"
            fill="none"
            stroke="#d7ecff"
            strokeWidth="1.15"
          />
          <path data-morph data-cx="450" data-cy="390" data-r="188" d={ellipsePath(450, 388, 118, 186)} fill="none" stroke="rgba(214,236,255,0.72)" strokeWidth="0.9" />
          <path data-morph data-cx="450" data-cy="390" data-r="132" d={ellipsePath(450, 388, 82, 132)} fill="none" stroke="rgba(214,236,255,0.62)" strokeWidth="0.8" />
          <path data-morph data-cx="450" data-cy="390" data-r="78" d={ellipsePath(450, 388, 46, 76)} fill="none" stroke="rgba(244,239,228,0.8)" strokeWidth="0.85" />

          <g data-arrive>
            <g stroke="#d7ecff" fill="url(#hatch)">
              <rect x="86" y="120" width="62" height="540" strokeWidth="1.2" />
              {Array.from({ length: 12 }).map((_, index) => (
                <line key={index} x1="86" x2="148" y1={150 + index * 42} y2={150 + index * 42} stroke="#d7ecff" strokeWidth="0.6" />
              ))}
            </g>
            <text x="92" y="108" fill="#c5dff8" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.4">
              CS
            </text>
            <rect x="162" y="100" width="34" height="580" fill="url(#hatch)" stroke="#d7ecff" strokeWidth="1.1" />

            <path d="M402 598 L450 662 L512 608" fill="none" stroke="#e4c27a" strokeWidth="1.7" strokeLinejoin="round" />
            <text x="524" y="628" fill="#e4c27a" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.4">
              DIVERTOR
            </text>
            <text x="590" y="300" fill="#f4efe4" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.6">
              PLASMA
            </text>
            <path d="M586 304 H548" stroke="rgba(244,239,228,0.7)" strokeWidth="0.7" />

            <Coil x={118} y={86} />
            <Coil x={520} y={62} />
            <Coil x={700} y={230} />
            <Coil x={700} y={540} />
            <Coil x={520} y={730} />
            <Coil x={150} y={730} />

            <g stroke="#9fd0ff" fill="none">
              <rect x="730" y="300" width="54" height="22" />
              <path d="M730 311 H610" strokeDasharray="4 3" />
              <path d="M618 311 l10 -5 M618 311 l10 5" />
            </g>
            <text x="732" y="292" fill="#c5dff8" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.4">
              NBI
            </text>

            <g stroke="#9fd0ff" fill="none">
              <path d="M430 20 l18 36 h-36 z" />
              <path d="M430 56 V100" strokeDasharray="3 3" />
            </g>
            <text x="456" y="40" fill="#c5dff8" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.4">
              ECH
            </text>

            <g stroke="#8ec4f5" fill="none" strokeWidth="0.8">
              <path d="M48 790 H430" />
              <path d="M48 782 V798 M430 782 V798" />
              <text x="210" y="812" fill="#c5dff8" stroke="none" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.6">
                R0
              </text>
              <path d="M430 390 H586" />
              <path d="M430 382 V398 M586 382 V398" />
              <text x="492" y="380" fill="#c5dff8" stroke="none" fontFamily="ui-monospace, monospace" fontSize="11">
                a
              </text>
            </g>

            <text x="168" y="390" fill="#c5dff8" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.2" transform="rotate(-90 176 390)">
              TF
            </text>
            <text x="250" y="150" fill="#c5dff8" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.4">
              VACUUM VESSEL
            </text>
          </g>
        </g>

        <g data-arrive transform="translate(1188 820)" fill="none" stroke="#9fd0ff" strokeWidth="1">
          <rect width="360" height="132" />
          <line x1="0" y1="28" x2="360" y2="28" />
          <line x1="0" y1="78" x2="360" y2="78" />
          <line x1="250" y1="78" x2="250" y2="132" />
          <text x="14" y="19" fill="#c5dff8" stroke="none" fontFamily="ui-monospace, monospace" fontSize="12" letterSpacing="1.8">
            DURHAM FUSION SOCIETY
          </text>
          <text x="14" y="50" fill="#f4efe4" stroke="none" fontFamily="ui-monospace, monospace" fontSize="13" letterSpacing="1.2">
            TOKAMAK — GENERAL ARRANGEMENT
          </text>
          <text x="14" y="104" fill="#c5dff8" stroke="none" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.2">
            SHEET 01
          </text>
          <text x="262" y="104" fill="#e4c27a" stroke="none" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.2">
            REV A
          </text>
          <text x="14" y="122" fill="#c5dff8" stroke="none" fontFamily="ui-monospace, monospace" fontSize="11">
            SCALE NTS
          </text>
        </g>
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,28,0.45)_0%,rgba(7,17,28,0.12)_38%,transparent_62%)]" />
    </div>
  );
}

export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="5" y="4" width="3.2" height="24" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10 6.5 C18 5 26.5 10 26.5 16 C26.5 22 18 27 10 25.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12.5 10 C18 9.2 22.5 12.2 22.5 16 C22.5 19.8 18 22.8 12.5 22" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="17" cy="16" r="1.15" fill="currentColor" />
    </svg>
  );
}
