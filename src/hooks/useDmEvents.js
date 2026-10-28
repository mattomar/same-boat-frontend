import { useEffect, useRef } from "react";
import { getDmSocket } from "../utils/dmSocket";

// Subscribes to /dm socket events and ALWAYS removes the exact listeners on cleanup,
// so remounts never stack duplicate handlers. Handlers may change freely between renders.
export default function useDmEvents(handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;
  const eventKey = Object.keys(handlers).sort().join("|");

  useEffect(() => {
    const socket = getDmSocket();
    if (!socket) return undefined;
    const bound = eventKey.split("|").filter(Boolean).map((event) => {
      const fn = (...args) => ref.current[event] && ref.current[event](...args);
      socket.on(event, fn);
      return [event, fn];
    });
    return () => bound.forEach(([event, fn]) => socket.off(event, fn));
  }, [eventKey]);
}
