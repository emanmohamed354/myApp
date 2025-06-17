// utils/navigationUtils.js
export const getNavigationIcon = (direction) => {
  const type = direction.type?.toLowerCase();
  const modifier = direction.modifier?.toLowerCase();
  
  if (type === 'turn') {
    if (modifier === 'left') return 'arrow-left-top';
    if (modifier === 'right') return 'arrow-right-top';
    if (modifier === 'sharp left') return 'arrow-left-top-bold';
    if (modifier === 'sharp right') return 'arrow-right-top-bold';
    if (modifier === 'slight left') return 'arrow-top-left-thin';
    if (modifier === 'slight right') return 'arrow-top-right-thin';
  }
  
  if (type === 'new name' || type === 'continue') return 'arrow-up';
  if (type === 'depart') return 'map-marker-right';
  if (type === 'arrive') return 'map-marker-check';
  if (type === 'merge') return 'merge';
  if (type === 'on ramp') return 'highway';
  if (type === 'off ramp') return 'exit-to-app';
  if (type === 'fork') {
    if (modifier === 'left') return 'source-fork';
    if (modifier === 'right') return 'source-fork';
  }
  if (type === 'roundabout') return 'rotate-right';
  if (type === 'rotary') return 'rotate-right';
  
  return 'arrow-up';
};

export const formatNavigationInstruction = (instruction) => {
  // Make instructions more natural
  return instruction
    .replace(/^Head/, 'Start')
    .replace(/onto/, 'to')
    .replace(/^\w/, c => c.toUpperCase());
};

export const getCompassDirection = (bearing) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};