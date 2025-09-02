export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">
        © {new Date().getFullYear()} GST Builder. All rights reserved.
      </div>
    </footer>
  )
}
