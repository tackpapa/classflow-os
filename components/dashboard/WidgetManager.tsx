'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Check } from 'lucide-react'
import { Widget, WidgetCategory } from '@/lib/types/widget'
import { availableWidgets } from '@/lib/config/widgets'
import { cn } from '@/lib/utils'

interface WidgetManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enabledWidgetIds: string[]
  onAddWidget: (widgetId: string) => void
}

export function WidgetManager({ open, onOpenChange, enabledWidgetIds, onAddWidget }: WidgetManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory>('실시간')

  // 카테고리별로 위젯 그룹화
  const categories: WidgetCategory[] = ['실시간', '학생관리', '상담관리', '수업관리', '재무관리', '출결관리', '시설관리', '기타']

  const widgetsByCategory = categories.reduce((acc, category) => {
    acc[category] = availableWidgets.filter((w) => w.category === category)
    return acc
  }, {} as Record<WidgetCategory, Widget[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>위젯 추가</DialogTitle>
          <DialogDescription>
            대시보드에 표시할 위젯을 선택하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as WidgetCategory)}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4 mt-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {widgetsByCategory[category].map((widget) => {
                  const isEnabled = enabledWidgetIds.includes(widget.id)

                  return (
                    <Card
                      key={widget.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary',
                        isEnabled && 'border-primary bg-primary/5'
                      )}
                      onClick={() => !isEnabled && onAddWidget(widget.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm">{widget.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {widget.description}
                            </CardDescription>
                          </div>
                          {isEnabled ? (
                            <div className="flex-shrink-0 p-1 bg-primary rounded-full">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddWidget(widget.id)
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
