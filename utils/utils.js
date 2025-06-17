export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const getRandomWelcomeMessage = (messages) => {
  return messages[Math.floor(Math.random() * messages.length)];
};