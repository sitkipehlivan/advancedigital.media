export default function () {
  const now = new Date();
  return { year: now.getFullYear(), today: now.toISOString().slice(0, 10), v: now.getTime().toString(36) };
}
