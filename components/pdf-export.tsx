"use client"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useState } from "react"

// Utility to normalize any CSS color to an rgb/rgba string via canvas
function normalizeColor(color: string): string {
  try {
    const probe = document.createElement("span")
    // Set both color and backgroundColor so either path computes
    probe.style.color = color
    probe.style.backgroundColor = color
    probe.style.display = "none"
    document.body.appendChild(probe)
    // Prefer backgroundColor since gradients won't normalize; fallback to color
    const bg = getComputedStyle(probe).backgroundColor
    const fg = getComputedStyle(probe).color
    probe.remove()
    // Return the first that looks like rgb/rgba
    if (bg && (bg.startsWith("rgb") || bg.startsWith("#"))) return bg
    if (fg && (fg.startsWith("rgb") || fg.startsWith("#"))) return fg
    return fg || bg || color
  } catch {
    return color
  }
}

// Inline a set of color properties as normalized rgb colors on an element tree
function inlineRgbColors(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  const colorProps = [
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "textDecorationColor",
    "columnRuleColor",
    "caretColor",
  ] as const

  const processEl = (el: Element) => {
    const style = getComputedStyle(el as HTMLElement)

    // Force all color props to rgb/rgba
    colorProps.forEach((prop) => {
      const value = style[prop as any] as string
      if (!value) return
      if (value === "transparent" || value === "currentcolor") return
      const normalized = normalizeColor(value)
      ;(el as HTMLElement).style[prop as any] = normalized
    })

    // Strip problematic effects that may embed oklch or gradients
    const bgImage = style.backgroundImage
    if (bgImage && (bgImage.includes("oklch") || bgImage.includes("gradient"))) {
      ;(el as HTMLElement).style.backgroundImage = "none"
    }
    const boxShadow = style.boxShadow
    if (boxShadow && boxShadow.includes("oklch")) {
      ;(el as HTMLElement).style.boxShadow = "none"
    }
    const textShadow = style.textShadow
    if (textShadow && textShadow.includes("oklch")) {
      ;(el as HTMLElement).style.textShadow = "none"
    }
    const filter = style.filter
    if (filter && filter.includes("oklch")) {
      ;(el as HTMLElement).style.filter = "none"
    }
    const borderImage = style.borderImageSource
    if (borderImage && (borderImage.includes("oklch") || borderImage.includes("gradient"))) {
      ;(el as HTMLElement).style.borderImage = "none"
      ;(el as HTMLElement).style.borderImageSource = "none"
    }
  }

  processEl(root)
  while (walker.nextNode()) {
    processEl(walker.currentNode as Element)
  }
}

// Export a cloned node with inlined rgb colors to PDF
async function exportInvoiceAsPdf(el: HTMLElement) {
  // Clone and position offscreen to avoid layout shifts
  const clone = el.cloneNode(true) as HTMLElement
  clone.style.position = "fixed"
  clone.style.left = "-10000px"
  clone.style.top = "0"
  clone.style.opacity = "1"
  clone.style.pointerEvents = "none"
  clone.style.backgroundColor = "#ffffff"

  // Mark this clone so onclone can find the exact element to sanitize (avoid duplicate id collisions)
  clone.setAttribute("data-h2c-target", "invoice-clone")

  document.body.appendChild(clone)
  try {
    // Inline rgb colors on our local clone for good measure
    inlineRgbColors(clone)

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      foreignObjectRendering: false,
      // Sanitize the exact clone html2canvas will render and inject overrides to neutralize problematic styles
      onclone: (clonedDoc) => {
        // Inject CSS overrides to strip gradients, shadows, and pseudo-elements that may contain oklch()
        const styleEl = clonedDoc.createElement("style")
        styleEl.textContent = `
          [data-h2c-target="invoice-clone"], [data-h2c-target="invoice-clone"] * {
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            background-image: none !important;
          }
          [data-h2c-target="invoice-clone"]::before,
          [data-h2c-target="invoice-clone"]::after,
          [data-h2c-target="invoice-clone"] *::before,
          [data-h2c-target="invoice-clone"] *::after {
            content: none !important;
            background-image: none !important;
            box-shadow: none !important;
          }
        `
        clonedDoc.head.appendChild(styleEl)

        // Find our exact target in the cloned document and inline colors to rgb/rgba
        const target = clonedDoc.querySelector('[data-h2c-target="invoice-clone"]') as HTMLElement | null
        if (target) {
          inlineRgbColors(target)
        }
      },
    })

    const img = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const w = 210
    const h = (canvas.height * w) / canvas.width
    pdf.addImage(img, "PNG", 0, 0, w, h)
    pdf.save("gst-invoice.pdf")
  } finally {
    document.body.removeChild(clone)
  }
}

function printOnlyInvoice() {
  // Inject print-only CSS that shows only the invoice on the page
  const style = document.createElement("style")
  style.id = "print-only-invoice"
  style.media = "print"
  style.textContent = `
    @media print {
      /* Ensure colors are preserved when printing */
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      /* Hide everything by default */
      body * { visibility: hidden !important; }
      /* Show the invoice only */
      #invoice-a4, #invoice-a4 * { visibility: visible !important; }
      /* Position the invoice at the top-left for proper PDF export */
      #invoice-a4 { position: absolute !important; left: 0 !important; top: 0 !important; }
      /* Hide any elements explicitly marked as no-print */
      .no-print { display: none !important; }
    }
  `
  document.head.appendChild(style)

  // Open print dialog (user can choose "Save as PDF")
  window.print()

  // Cleanup style after a short delay
  setTimeout(() => {
    const el = document.getElementById("print-only-invoice")
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }, 1000)
}

export function PdfExportButton() {
  const [loading, setLoading] = useState(false)
  async function handleDownload() {
    const el = document.getElementById("invoice-a4")
    if (!el) return
    setLoading(true)
    try {
      printOnlyInvoice()
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button className="no-print" onClick={handleDownload} disabled={loading}>
      {loading ? "Preparing..." : "Print / Save PDF"}
    </Button>
  )
}
