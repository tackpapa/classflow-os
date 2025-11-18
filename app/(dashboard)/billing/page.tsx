'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePageAccess } from '@/hooks/use-page-access'
import { PagePermissions } from '@/components/page-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Eye, MoreHorizontal, DollarSign, AlertCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Invoice } from '@/lib/types/database'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
    org_id: 'org-1',
    student_id: 'student-1',
    student_name: '김민준',
    invoice_number: 'INV-2025-001',
    items: [
      { description: '수학 수강료 (6월)', amount: 300000 },
      { description: '영어 수강료 (6월)', amount: 250000 },
    ],
    total_amount: 550000,
    due_date: '2025-06-10',
    payment_status: 'paid',
    paid_at: '2025-06-08',
    payment_method: 'card',
  },
  {
    id: '2',
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
    org_id: 'org-1',
    student_id: 'student-2',
    student_name: '이서연',
    invoice_number: 'INV-2025-002',
    items: [
      { description: '국어 수강료 (6월)', amount: 280000 },
    ],
    total_amount: 280000,
    due_date: '2025-06-15',
    payment_status: 'pending',
  },
  {
    id: '3',
    created_at: '2025-05-01',
    updated_at: '2025-05-01',
    org_id: 'org-1',
    student_id: 'student-3',
    student_name: '박준호',
    invoice_number: 'INV-2025-003',
    items: [
      { description: '수학 수강료 (5월)', amount: 300000 },
    ],
    total_amount: 300000,
    due_date: '2025-05-25',
    payment_status: 'overdue',
  },
]

const monthlyRevenueData = [
  { month: '1월', revenue: 12500000 },
  { month: '2월', revenue: 14200000 },
  { month: '3월', revenue: 15800000 },
  { month: '4월', revenue: 16500000 },
  { month: '5월', revenue: 17200000 },
  { month: '6월', revenue: 18300000 },
]

export default function BillingPage() {
  usePageAccess('billing')

  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const statusMap = {
    pending: { label: '미납', variant: 'secondary' as const },
    paid: { label: '완납', variant: 'default' as const },
    overdue: { label: '연체', variant: 'destructive' as const },
    cancelled: { label: '취소', variant: 'outline' as const },
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoice_number',
      header: '청구서 번호',
    },
    {
      accessorKey: 'student_name',
      header: '학생 이름',
    },
    {
      accessorKey: 'total_amount',
      header: '금액',
      cell: ({ row }) => {
        const amount = row.getValue('total_amount') as number
        return `₩${amount.toLocaleString()}`
      },
    },
    {
      accessorKey: 'due_date',
      header: '납부 기한',
      cell: ({ row }) => {
        const date = row.getValue('due_date') as string
        return format(new Date(date), 'yyyy-MM-dd')
      },
    },
    {
      accessorKey: 'payment_status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('payment_status') as Invoice['payment_status']
        const statusInfo = statusMap[status]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      accessorKey: 'paid_at',
      header: '결제일',
      cell: ({ row }) => {
        const date = row.getValue('paid_at') as string
        return date ? format(new Date(date), 'yyyy-MM-dd') : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetail(invoice)}>
                <Eye className="mr-2 h-4 w-4" />
                상세 보기
              </DropdownMenuItem>
              {invoice.payment_status === 'pending' && (
                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                  결제 완료 처리
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailDialogOpen(true)
  }

  const handleMarkAsPaid = (id: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              payment_status: 'paid' as const,
              paid_at: new Date().toISOString(),
              payment_method: 'cash' as const,
            }
          : inv
      )
    )
    toast({
      title: '결제 완료',
      description: '청구서가 결제 완료 처리되었습니다.',
    })
  }

  const handleCreateInvoice = () => {
    // TODO: Implement invoice creation
    toast({
      title: '청구서 생성',
      description: '청구서 생성 기능은 구현 예정입니다.',
    })
    setIsCreateDialogOpen(false)
  }

  const pendingInvoices = invoices.filter((inv) => inv.payment_status === 'pending')
  const overdueInvoices = invoices.filter((inv) => inv.payment_status === 'overdue')
  const paidInvoices = invoices.filter((inv) => inv.payment_status === 'paid')

  const totalRevenue = invoices
    .filter((inv) => inv.payment_status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0)

  const pendingAmount = invoices
    .filter((inv) => inv.payment_status === 'pending')
    .reduce((sum, inv) => sum + inv.total_amount, 0)

  const overdueAmount = invoices
    .filter((inv) => inv.payment_status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_amount, 0)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PagePermissions pageId="billing" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">청구/정산</h1>
          <p className="text-sm md:text-base text-muted-foreground">수강료 청구 및 정산을 관리하세요</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          청구서 생성
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미납</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingInvoices.length}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연체</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₩{overdueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{overdueInvoices.length}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완납률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.length > 0
                ? Math.round((paidInvoices.length / invoices.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">{paidInvoices.length}건 완납</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">
            청구서 ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="payments">결제 내역 ({paidInvoices.length})</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={invoices}
                searchKey="student_name"
                searchPlaceholder="학생 이름으로 검색..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={paidInvoices}
                searchKey="student_name"
                searchPlaceholder="학생 이름으로 검색..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>월별 수익</CardTitle>
                <CardDescription>최근 6개월 수익 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>수납 현황</CardTitle>
                <CardDescription>청구서 상태별 분포</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">완납</Badge>
                      <span className="text-sm">{paidInvoices.length}건</span>
                    </div>
                    <span className="font-medium">
                      ₩{totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">미납</Badge>
                      <span className="text-sm">{pendingInvoices.length}건</span>
                    </div>
                    <span className="font-medium">
                      ₩{pendingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">연체</Badge>
                      <span className="text-sm">{overdueInvoices.length}건</span>
                    </div>
                    <span className="font-medium text-destructive">
                      ₩{overdueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>청구서 상세</DialogTitle>
            <DialogDescription>청구서 정보를 확인하세요</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>청구서 번호</Label>
                  <Input value={selectedInvoice.invoice_number} disabled />
                </div>
                <div className="space-y-2">
                  <Label>학생 이름</Label>
                  <Input value={selectedInvoice.student_name} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>청구 항목</Label>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left">항목</th>
                        <th className="p-2 text-right">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">₩{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="p-2">합계</td>
                        <td className="p-2 text-right">
                          ₩{selectedInvoice.total_amount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>납부 기한</Label>
                  <Input
                    value={format(new Date(selectedInvoice.due_date), 'yyyy-MM-dd')}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Input value={statusMap[selectedInvoice.payment_status].label} disabled />
                </div>
              </div>

              {selectedInvoice.paid_at && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>결제일</Label>
                    <Input
                      value={format(new Date(selectedInvoice.paid_at), 'yyyy-MM-dd')}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>결제 방법</Label>
                    <Input
                      value={
                        selectedInvoice.payment_method === 'card'
                          ? '카드'
                          : selectedInvoice.payment_method === 'cash'
                          ? '현금'
                          : '계좌이체'
                      }
                      disabled
                    />
                  </div>
                </div>
              )}

              {selectedInvoice.notes && (
                <div className="space-y-2">
                  <Label>메모</Label>
                  <Textarea value={selectedInvoice.notes} disabled rows={3} />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
            {selectedInvoice?.payment_status === 'pending' && (
              <Button onClick={() => {
                handleMarkAsPaid(selectedInvoice.id)
                setIsDetailDialogOpen(false)
              }}>
                결제 완료 처리
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>청구서 생성</DialogTitle>
            <DialogDescription>새 청구서를 생성합니다</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              청구서 생성 기능은 구현 예정입니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateInvoice}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
