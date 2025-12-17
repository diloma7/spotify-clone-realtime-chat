export const formatDuration = (second: number) => {
  const minutes = Math.floor(second / 60);
  const remainingSec = second % 60;
  return `${minutes}:${remainingSec.toString().padStart(2, "0")}`;
};
