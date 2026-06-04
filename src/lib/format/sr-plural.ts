/**
 * Srpski oblici broja + imenice (1 brend, 2+ brenda; 11–14 → brenda).
 */
function pickForm(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const n = Math.abs(count);
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function withCount(count: number, word: string): string {
  return `${count} ${word}`;
}

export function formatBrandCount(count: number): string {
  return withCount(count, pickForm(count, "brend", "brenda", "brenda"));
}

export function formatBrandCountPlus(count: number): string {
  return `${count}+ ${pickForm(count, "brend", "brenda", "brenda")}`;
}

export function formatStoreCount(count: number): string {
  return withCount(
    count,
    pickForm(count, "prodajno mesto", "prodajna mesta", "prodajnih mesta")
  );
}

export function formatLocationCount(count: number): string {
  return withCount(count, pickForm(count, "lokacija", "lokacije", "lokacija"));
}

export function formatRetailerStoreCount(count: number): string {
  return withCount(
    count,
    pickForm(count, "prodavnica", "prodavnice", "prodavnica")
  );
}
