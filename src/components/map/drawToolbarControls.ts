import type {Interactions} from './types';

/**
 * Enable drawing mode for a given draw control object and shape.
 */
export function enableDrawingMode(
  drawControlRef: React.RefObject<L.Control.Draw>,
  shape: keyof Interactions
) {
  // @ts-expect-error referencing private API
  const drawToolbar = drawControlRef.current?._toolbars?.draw;
  if (!drawToolbar) return;

  const modes: Record<string, {handler: L.Handler}> = drawToolbar._modes;
  const mode = modes?.[shape];
  // If the requested mode is not available, do nothing.
  if (!mode) return;

  // Disable other active modes
  Object.values(modes).forEach(m => {
    if (m.handler.enabled()) {
      m.handler.disable();
    }
  });

  mode.handler.enable();
}

/**
 * Disable drawing mode for a given draw control object and shape.
 */
export function disableDrawingMode(
  drawControlRef: React.RefObject<L.Control.Draw>,
  shape: keyof Interactions
) {
  // @ts-expect-error referencing private API
  const drawToolbar = drawControlRef.current?._toolbars?.draw;
  if (!drawToolbar) return;

  const mode: {handler: L.Handler} | undefined = drawToolbar._modes?.[shape];
  // If the requested mode is not available, do nothing.
  if (!mode) return;

  mode.handler.disable();
}
