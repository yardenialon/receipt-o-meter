import * as React from "react"
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from "@/lib/utils"

export const TopStores = () => {
  const isMobile = useIsMobile()

  const { data: storeData, isLoading } = useQuery({
    queryKey: ['top-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('store_name, total')
        .not('store_name', 'is', null)
        .order('total', { ascending: false })
        .limit(5)

      if (error) throw error

      return data.map(store => ({
        name: store.store_name,
        total: Number(store.total?.toFixed(2) || 0)
      }))
    }
  })

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/40">
        <CardHeader>
          <CardTitle>חנויות מובילות</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxTotal = Math.max(...(storeData?.map(store => store.total) || [0]))

  return (
    <Card className="backdrop-blur-sm bg-white/40 transition-all duration-300 hover:bg-white/50">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">חנויות מובילות</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[400px] space-y-6 p-6">
        {storeData?.map((store, index) => (
          <div 
            key={store.name} 
            className="relative"
            style={{
              '--animation-delay': `${index * 100}ms`
            } as React.CSSProperties}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm sm:text-base truncate max-w-[200px]" title={store.name}>
                {store.name}
              </span>
              <span className="text-sm sm:text-base tabular-nums">
                ₪{store.total.toLocaleString()}
              </span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full animate-[slide-right_1s_ease-out_forwards]",
                  "bg-gradient-to-r from-primary-400/80 to-blue-400/60"
                )}
                style={{ 
                  width: `${(store.total / maxTotal) * 100}%`,
                  animationDelay: `var(--animation-delay)`
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}