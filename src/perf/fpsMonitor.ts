export function createFpsMonitor(store: any) {
  let frameCount = 0;
  let last = performance.now();
  let rafId = 0;

  function loop(now: number) {
    frameCount += 1;

    const delta = now - last;
    if (delta >= 1000) {
      const fps = Math.round((frameCount * 1000) / delta);
      store.setFps(fps);
      frameCount = 0;
      last = now;
    }

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
    }
  };
}
