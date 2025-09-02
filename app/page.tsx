import Image from "next/image"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteNavbar />
      <section className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-semibold text-balance">Create realistic GST invoices with PDF export</h1>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Responsive dashboard, product and bank detail management, GST bill generator, watermark, and one-click
              PDF.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md">
                Login to start
              </a>
              <a href="/dashboard/gst-bill" className="inline-flex items-center px-4 py-2 border rounded-md">
                Open Builder
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-gray-200 bg-white">
            <Image src="/invoices/gst-bill-format.jpeg" alt="Invoice layout reference" fill className="object-cover" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
