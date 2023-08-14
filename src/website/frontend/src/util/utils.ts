import { useLayoutEffect, useState } from "react";

export const extractInstanceFromActorId = (actorId: string) =>
/https?:\/\/(.*)\/(?:c|u|m|user)\/.*/.test(actorId) ? actorId.match(/https?:\/\/(.*)\/(?:c|u|m|user)\/.*/)![1] : actorId;

  export const extractUserFromActorId = (actorId: string) =>
  /https?:\/\/(.*)\/(?:c|u|m|user)\/(.*)/.test(actorId) ? actorId.match(/https?:\/\/(.*)\/(?:c|u|m|user)\/(.*)/)![2] : actorId;

export const getActorId = (instance: string, user: string) => `${user}@${instance}`;


export function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}