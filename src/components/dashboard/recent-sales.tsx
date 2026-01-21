import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'

interface RecentSalesProps {
    sales: {
        name: string
        email: string
        amount: number
        avatar_url?: string
    }[]
}

export function RecentSales({ sales }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {sales.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No sales yet.</p>
            ) : (
                sales.map((sale, index) => (
                    <div key={index} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={sale.avatar_url} alt={sale.name} />
                            <AvatarFallback>{sale.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{sale.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{sale.email}</p>
                        </div>
                        <div className="ml-auto font-medium">
                            +{formatCurrency(sale.amount)}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
