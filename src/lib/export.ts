interface SalesData {
    name: string
    value: number
}

export async function downloadSalesCSV(data: SalesData[]) {
    const headers = ['Date', 'Sales']
    const csvContent = [
        headers.join(','),
        ...data.map(row => `${row.name},${row.value}`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'sales_report.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
