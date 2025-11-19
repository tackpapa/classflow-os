import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SleepRecord, OutingRecord } from '@/lib/types/database'

interface SeatRealtimeStatus {
  sleepRecord: SleepRecord | null
  outingRecord: OutingRecord | null
  loading: boolean
}

export function useSeatRealtimeStatus(studentId: string | null, seatNumber: number) {
  const [status, setStatus] = useState<SeatRealtimeStatus>({
    sleepRecord: null,
    outingRecord: null,
    loading: true,
  })

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!studentId) {
      setStatus({ sleepRecord: null, outingRecord: null, loading: false })
      return
    }

    async function loadStatus() {
      try {
        setStatus((prev) => ({ ...prev, loading: true }))

        // Load current sleep record
        const { data: sleepData } = await supabase
          .from('sleep_records')
          .select('*')
          .eq('student_id', studentId)
          .eq('date', today)
          .eq('status', 'sleeping')
          .maybeSingle()

        // Load current outing record
        const { data: outingData } = await supabase
          .from('outing_records')
          .select('*')
          .eq('student_id', studentId)
          .eq('date', today)
          .eq('status', 'out')
          .maybeSingle()

        setStatus({
          sleepRecord: sleepData as SleepRecord | null,
          outingRecord: outingData as OutingRecord | null,
          loading: false,
        })
      } catch (error) {
        console.error('Error loading seat status:', error)
        setStatus((prev) => ({ ...prev, loading: false }))
      }
    }

    loadStatus()

    // Subscribe to sleep_records changes
    const sleepChannel = supabase
      .channel(`seat-sleep-${seatNumber}-${studentId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep_records',
          filter: `student_id=eq.${studentId}`,
        },
        async (payload) => {
          console.log('💤 Sleep record changed:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const record = payload.new as SleepRecord
            if (record.status === 'sleeping' && record.date === today) {
              console.log('😴 Student is sleeping:', record)
              setStatus((prev) => ({ ...prev, sleepRecord: record }))
            } else if (record.status === 'awake') {
              console.log('😃 Student woke up')
              setStatus((prev) => ({ ...prev, sleepRecord: null }))
            }
          } else if (payload.eventType === 'DELETE') {
            setStatus((prev) => ({ ...prev, sleepRecord: null }))
          }
        }
      )
      .subscribe((status) => {
        console.log(`🔌 [Seat ${seatNumber}] Sleep channel status:`, status)
      })

    // Subscribe to outing_records changes
    const outingChannel = supabase
      .channel(`seat-outing-${seatNumber}-${studentId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outing_records',
          filter: `student_id=eq.${studentId}`,
        },
        async (payload) => {
          console.log('🚪 Outing record changed:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const record = payload.new as OutingRecord
            if (record.status === 'out' && record.date === today) {
              console.log('🏃 Student is out:', record)
              setStatus((prev) => ({ ...prev, outingRecord: record }))
            } else if (record.status === 'returned') {
              console.log('🏠 Student returned')
              setStatus((prev) => ({ ...prev, outingRecord: null }))
            }
          } else if (payload.eventType === 'DELETE') {
            setStatus((prev) => ({ ...prev, outingRecord: null }))
          }
        }
      )
      .subscribe((status) => {
        console.log(`🔌 [Seat ${seatNumber}] Outing channel status:`, status)
      })

    return () => {
      supabase.removeChannel(sleepChannel)
      supabase.removeChannel(outingChannel)
    }
  }, [studentId, seatNumber, today])

  return status
}
