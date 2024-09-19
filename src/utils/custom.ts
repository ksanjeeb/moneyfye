export function getCurrencySymbol(code: string, Currency: any) {
  const currency = Currency.find((currency: any) => currency.code === code);
  return currency ? currency.symbol : "NA";
}

export function convertToTitleCase(str: string) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
