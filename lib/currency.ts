const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
function two(n: number) {
  if (n < 20) return ONES[n]
  const t = Math.floor(n / 10),
    o = n % 10
  return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim()
}
function three(n: number) {
  const h = Math.floor(n / 100),
    r = n % 100
  return `${h ? `${ONES[h]} Hundred${r ? " " : ""}` : ""}${r ? two(r) : ""}`.trim()
}
export function numberToIndianWords(amount: number) {
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  const crore = Math.floor(rupees / 10000000)
  const lakh = Math.floor((rupees % 10000000) / 100000)
  const thousand = Math.floor((rupees % 100000) / 1000)
  const hundred = rupees % 1000
  let words = ""
  if (crore) words += `${three(crore)} Crore `
  if (lakh) words += `${three(lakh)} Lakh `
  if (thousand) words += `${three(thousand)} Thousand `
  if (hundred) words += `${three(hundred)} `
  words = words.trim() || "Zero"
  const rupeesPart = `Indian Rupees ${words}`
  const paisePart = paise ? ` and ${two(paise)} Paise` : " only"
  return `${rupeesPart}${paise ? paisePart + " only" : paisePart}`
}

export function numberToIndianCurrencySentence(amount: number) {
  const abs = Math.abs(amount || 0)
  const rupees = Math.floor(abs)
  const paise = Math.round((abs - rupees) * 100)

  const crore = Math.floor(rupees / 10000000)
  const lakh = Math.floor((rupees % 10000000) / 100000)
  const thousand = Math.floor((rupees % 100000) / 1000)
  const hundred = rupees % 1000

  let words = ""
  if (crore) words += `${three(crore)} Crore `
  if (lakh) words += `${three(lakh)} Lakh `
  if (thousand) words += `${three(thousand)} Thousand `
  if (hundred) words += `${three(hundred)} `
  words = words.trim() || "Zero"

  // sentence case: first letter uppercase, rest lower
  const sentenceWords = words.toLowerCase()
  const sentence = sentenceWords.length > 0 ? sentenceWords.charAt(0).toUpperCase() + sentenceWords.slice(1) : "Zero"

  if (paise) {
    return `${sentence} rupees and ${two(paise).toLowerCase()} paise only.`
  }
  return `${sentence} rupees only.`
}
