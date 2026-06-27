import { useNumberFormat } from './useNumberFormat'

export function useHeatmapIntensity() {
	const { fmtCompact } = useNumberFormat()

	const intensityClass = (amount, isFuture, max) => {
		if (isFuture) return 'bg-white/5'
		if (!amount) return 'bg-white/5'
		if (!max) return 'bg-white/5'
		const r = amount / max
		if (r <= 0.15) return 'bg-sky-950'
		if (r <= 0.35) return 'bg-sky-900'
		if (r <= 0.55) return 'bg-sky-800'
		if (r <= 0.75) return 'bg-sky-700'
		if (r <= 0.9) return 'bg-sky-600'
		return 'bg-sky-400'
	}

	return { intensityClass, fmtCompact }
}
