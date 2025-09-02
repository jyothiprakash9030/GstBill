"use client"

type InvoiceWatermarkProps = {
  text?: string
  rotateDeg?: number
  opacity?: number
  fontSizeRem?: number
}

export function InvoiceWatermark({
  text = "WATERMARK",
  rotateDeg = -35, // tilt up to the right (left-bottom → right-top)
  opacity = 0.12, // a bit bolder per request
  fontSizeRem = 3.0, // ≈ text-5xl
}: InvoiceWatermarkProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ overflow: "hidden", zIndex: 1 }}
    >
      <div
        className="uppercase"
        style={{
          transform: `rotate(${rotateDeg}deg)`,
          fontWeight: 900,
          fontSize: `${fontSizeRem}rem`,
          letterSpacing: "0.3em",
          color: `rgba(0,0,0,${opacity})`,
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  )
}
