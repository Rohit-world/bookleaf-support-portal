export function generateTicketNumber(count: number) {
  const padded = String(count + 1).padStart(4, "0");
  return `TKT-${padded}`;
}
