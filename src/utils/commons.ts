export const numberEnumToArray = (numberEnum: Record<string, string | number>) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}
