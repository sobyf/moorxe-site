"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";

const StrandScene = dynamic(
  () => import("./strand-scene").then((mod) => mod.StrandScene),
  {
    ssr: false,
    loading: () => <div className="strand-fallback h-full w-full" aria-hidden="true" />,
  },
);

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

class SceneErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { failed: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * One viewport-sized fixed canvas behind the whole document. Content scrolls
 * above it; the scene is never recreated between sections.
 */
export function StrandBackground() {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [noWebgl, setNoWebgl] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  // Mount-once synchronization with external systems: the reduced-motion
  // media query (subscribed) and the WebGL capability probe.
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncFromExternalSystems = () => {
      setReducedMotion(query.matches);
      setNoWebgl(!webglAvailable());
      if (query.matches) {
        setPaused(true);
        document.documentElement.dataset.motionPaused = "true";
      }
    };
    const onContextLost = () => setNoWebgl(true);
    syncFromExternalSystems();
    query.addEventListener("change", syncFromExternalSystems);
    window.addEventListener("moorxe:webgl-lost", onContextLost);
    return () => {
      query.removeEventListener("change", syncFromExternalSystems);
      window.removeEventListener("moorxe:webgl-lost", onContextLost);
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.motionPaused = paused ? "true" : "false";
  }, [paused]);

  const staticScene = (
    <div className="strand-fallback h-full w-full" aria-hidden="true" />
  );
  const showCanvas = !reducedMotion && !noWebgl;
  const showPauseControl = showCanvas;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        {showCanvas ? (
          <SceneErrorBoundary fallback={staticScene}>
            <React.Suspense fallback={staticScene}>
              <StrandScene paused={paused} />
            </React.Suspense>
          </SceneErrorBoundary>
        ) : (
          staticScene
        )}
        {/* Legibility veils: keep text readable over bright strands. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,transparent_30%,rgba(5,5,5,0.55)_100%)]" />
        <div className="absolute inset-0 bg-background/35" />
      </div>

      {showPauseControl && (
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-pressed={paused}
          className="fixed right-4 bottom-4 z-40 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background/80 px-4 font-mono text-xs text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
        >
          {paused ? (
            <>
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Resume motion
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              Pause motion
            </>
          )}
        </button>
      )}
    </>
  );
}
