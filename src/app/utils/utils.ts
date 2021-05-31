/**
 * @author Dmitry Hvastunov
 * @created 31.05.2021
 * @project rtgs-front
 */

export function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
