import { Header } from '@/components/shared/Header'
import { Sidebar } from '@/components/shared/Sidebar'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
