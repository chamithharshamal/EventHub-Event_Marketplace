'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
    Camera,
    CameraOff,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    RotateCcw,
    Volume2,
    VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { validateTicket, performCheckIn } from '@/app/actions/checkin'

interface ScanResult {
    valid: boolean
    status: string
    message: string
    ticketType?: string
    attendee?: {
        name: string | null
        email: string | null
    }
    checkedInAt?: string
}

interface QRScannerProps {
    eventId: string
    onScanResult?: (result: ScanResult) => void
}

export function QRScanner({ eventId, onScanResult }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [lastResult, setLastResult] = useState<ScanResult | null>(null)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const lastScannedRef = useRef<string | null>(null)
    const cooldownRef = useRef<boolean>(false)

    // Audio refs for feedback sounds
    const successAudioRef = useRef<HTMLAudioElement | null>(null)
    const errorAudioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Create audio elements
        if (typeof window !== 'undefined') {
            successAudioRef.current = new Audio('/sounds/success.mp3')
            errorAudioRef.current = new Audio('/sounds/error.mp3')
        }

        return () => {
            stopScanning()
        }
    }, [])

    const playSound = useCallback((type: 'success' | 'error') => {
        if (!soundEnabled) return

        try {
            const audio = type === 'success' ? successAudioRef.current : errorAudioRef.current
            if (audio) {
                audio.currentTime = 0
                audio.play().catch(() => { })
            }
        } catch {
            // Ignore audio errors
        }
    }, [soundEnabled])

    const validateQRCode = useCallback(async (qrData: string) => {
        // Prevent duplicate scans with cooldown
        if (cooldownRef.current || qrData === lastScannedRef.current) {
            return
        }

        cooldownRef.current = true
        lastScannedRef.current = qrData
        setIsLoading(true)
        setLastResult(null)

        try {
            // 1. Validate Ticket
            const validation = await validateTicket(qrData, eventId)

            if (validation.valid) {
                // 2. Perform Check-in automatically
                // We need to extract ticket ID. validation result doesn't explicitly have it in the type 
                // but we can parse the QR again or update action. 
                // Let's rely on the parsing we do here.
                let ticketId = ''
                try {
                    const payload = JSON.parse(qrData)
                    ticketId = payload.tid
                } catch (e) {
                    throw new Error('Invalid QR format')
                }

                const checkIn = await performCheckIn(ticketId, eventId)

                if (checkIn.success) {
                    const result: ScanResult = {
                        valid: true,
                        status: 'SUCCESS',
                        message: 'Check-in Successful',
                        ticketType: validation.ticketType || 'Standard',
                        attendee: validation.attendee || { name: 'Guest', email: null },
                        checkedInAt: new Date().toISOString()
                    }
                    setLastResult(result)
                    onScanResult?.(result)
                    playSound('success')
                    // Vibrate
                    if ('vibrate' in navigator) navigator.vibrate([100])
                } else {
                    // Check-in failed (maybe DB error or race condition)
                    const result: ScanResult = {
                        valid: false,
                        status: 'ERROR',
                        message: checkIn.error || 'Check-in failed',
                        attendee: validation.attendee
                    }
                    setLastResult(result)
                    playSound('error')
                }

            } else {
                // Invalid ticket (Expired, Wrong Event, etc)
                const result: ScanResult = {
                    valid: false,
                    status: validation.status,
                    message: getValidationMessage(validation.status),
                    ticketType: validation.ticketType,
                    attendee: validation.attendee
                }
                setLastResult(result)
                playSound('error')
                if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
            }

        } catch (err) {
            console.error('Scan error:', err)
            const errorResult: ScanResult = {
                valid: false,
                status: 'scan_error',
                message: 'Failed to process ticket. Please try again.',
            }
            setLastResult(errorResult)
            playSound('error')
        } finally {
            setIsLoading(false)

            // Reset cooldown after 2.5 seconds
            setTimeout(() => {
                cooldownRef.current = false
                lastScannedRef.current = null
            }, 2500)
        }
    }, [eventId, onScanResult, playSound])

    function getValidationMessage(status: string): string {
        switch (status) {
            case 'ALREADY_USED': return 'Ticket already used'
            case 'TICKET_EXPIRED': return 'Ticket has expired'
            case 'WRONG_EVENT': return 'Ticket is for a different event'
            case 'INVALID_SIGNATURE': return 'Invalid ticket signature'
            case 'TICKET_CANCELLED': return 'Ticket was cancelled'
            case 'TICKET_NOT_FOUND': return 'Ticket not found'
            default: return 'Invalid ticket'
        }
    }

    const startScanning = useCallback(async () => {
        if (!containerRef.current) return

        setError(null)

        try {
            const scanner = new Html5Qrcode('qr-reader')
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    validateQRCode(decodedText)
                },
                () => {
                    // Ignore QR scan errors (no QR found in frame)
                }
            )

            setIsScanning(true)
        } catch (err) {
            console.error('Scanner error:', err)
            setError('Unable to access camera. Please ensure camera permissions are granted.')
        }
    }, [validateQRCode])

    const stopScanning = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop()
                scannerRef.current = null
            } catch {
                // Ignore stop errors
            }
        }
        setIsScanning(false)
    }, [])

    const resetScanner = useCallback(() => {
        setLastResult(null)
        lastScannedRef.current = null
        cooldownRef.current = false
    }, [])

    const getResultIcon = () => {
        if (!lastResult) return null

        if (lastResult.valid) {
            return <CheckCircle className="h-16 w-16 text-emerald-500" />
        }

        if (lastResult.status === 'ALREADY_USED') {
            return <AlertCircle className="h-16 w-16 text-amber-500" />
        }

        return <XCircle className="h-16 w-16 text-red-500" />
    }

    const getResultColor = () => {
        if (!lastResult) return 'bg-slate-100 dark:bg-slate-800'
        if (lastResult.valid) return 'bg-emerald-100 dark:bg-emerald-900/30'
        if (lastResult.status === 'ALREADY_USED') return 'bg-amber-100 dark:bg-amber-900/30'
        return 'bg-red-100 dark:bg-red-900/30'
    }

    return (
        <div className="space-y-4">
            {/* Scanner Container */}
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative aspect-square max-w-md mx-auto bg-black">
                        {/* QR Scanner Element */}
                        <div
                            id="qr-reader"
                            ref={containerRef}
                            className={`w-full h-full ${isScanning ? '' : 'hidden'}`}
                        />

                        {/* Placeholder when not scanning */}
                        {!isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white">
                                <Camera className="h-16 w-16 mb-4 opacity-50" />
                                <p className="text-sm opacity-75">Camera is off</p>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Loader2 className="h-12 w-12 animate-spin text-white" />
                            </div>
                        )}

                        {/* Scan Frame Overlay */}
                        {isScanning && !isLoading && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-64 border-2 border-white/50 rounded-lg">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-violet-500 rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-violet-500 rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-violet-500 rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-violet-500 rounded-br-lg" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Scan Result */}
            {lastResult && (
                <Card className={getResultColor()}>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            {getResultIcon()}
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                    {lastResult.message}
                                </h3>
                                {lastResult.ticketType && (
                                    <p className="text-sm mt-1 opacity-75">
                                        Ticket: {lastResult.ticketType}
                                    </p>
                                )}
                                {lastResult.attendee?.name && (
                                    <p className="text-sm opacity-75">
                                        Attendee: {lastResult.attendee.name}
                                    </p>
                                )}
                                {lastResult.checkedInAt && (
                                    <p className="text-xs mt-2 opacity-60">
                                        Checked in: {new Date(lastResult.checkedInAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={resetScanner}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Scan Next Ticket
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Controls */}
            <div className="flex gap-2">
                <Button
                    className="flex-1"
                    onClick={isScanning ? stopScanning : startScanning}
                    variant={isScanning ? 'destructive' : 'default'}
                >
                    {isScanning ? (
                        <>
                            <CameraOff className="h-4 w-4 mr-2" />
                            Stop Camera
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4 mr-2" />
                            Start Camera
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                    {soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                    ) : (
                        <VolumeX className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* DEV ONLY: Manual Input for testing */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Dev: Manual Check-in</p>
                <div className="flex gap-2">
                    <input
                        className="flex-1 px-3 py-2 text-sm border rounded"
                        placeholder="Paste QR data here..."
                        onChange={(e) => {
                            // Debounce or just wait for enter? 
                            // Let's just add a button
                        }}
                        id="manual-qr-input"
                    />
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            const input = document.getElementById('manual-qr-input') as HTMLInputElement
                            if (input && input.value) {
                                validateQRCode(input.value)
                            }
                        }}
                    >
                        Simulate
                    </Button>
                </div>
            </div>
        </div>
    )
}
