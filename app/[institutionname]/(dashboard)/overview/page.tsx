'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Widget, widgetSizeClasses } from '@/lib/types/widget'
import { getEnabledWidgets, saveWidgetsConfig, getWidgetsConfig } from '@/lib/config/widgets'
import { WidgetRenderer } from '@/components/dashboard/WidgetRenderer'
import { WidgetManager } from '@/components/dashboard/WidgetManager'

export default function OverviewPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [widgetManagerOpen, setWidgetManagerOpen] = useState(false)

  // 위젯 설정 로드
  useEffect(() => {
    setWidgets(getEnabledWidgets())
  }, [])

  // 1초마다 시간 업데이트 (기존 로직 유지)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 위젯 삭제
  const handleRemoveWidget = (widgetId: string) => {
    const allWidgets = getWidgetsConfig()
    const updatedWidgets = allWidgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: false } : w
    )
    saveWidgetsConfig(updatedWidgets)
    setWidgets(updatedWidgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order))
  }

  // 위젯 추가
  const handleAddWidget = (widgetId: string) => {
    const allWidgets = getWidgetsConfig()
    const updatedWidgets = allWidgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: true } : w
    )
    saveWidgetsConfig(updatedWidgets)
    setWidgets(updatedWidgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order))
  }

  const enabledWidgetIds = widgets.map((w) => w.id)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">대시보드</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            오늘의 운영 현황을 확인하세요
          </p>
        </div>
        <Button onClick={() => setWidgetManagerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          위젯 추가
        </Button>
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">위젯이 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">
            위젯을 추가하여 대시보드를 구성하세요
          </p>
          <Button onClick={() => setWidgetManagerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            위젯 추가
          </Button>
        </div>
      )}

      {/* Widgets Grid */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-12 gap-4">
          {widgets.map((widget) => (
            <div key={widget.id} className={widgetSizeClasses[widget.size]}>
              <WidgetRenderer
                widget={widget}
                onRemove={() => handleRemoveWidget(widget.id)}
                currentTime={currentTime}
              />
            </div>
          ))}
        </div>
      )}

      {/* Widget Manager Modal */}
      <WidgetManager
        open={widgetManagerOpen}
        onOpenChange={setWidgetManagerOpen}
        enabledWidgetIds={enabledWidgetIds}
        onAddWidget={(widgetId) => {
          handleAddWidget(widgetId)
          setWidgetManagerOpen(false)
        }}
      />
    </div>
  )
}
