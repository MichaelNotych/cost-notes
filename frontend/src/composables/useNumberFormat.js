export function useNumberFormat() {
	const fmtCompact = (value) => {
		if (!value) return ''
		if (value >= 10000) return `${(value / 1000).toFixed(0)}k`
		if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
		return value.toFixed(0)
	}

	const formatAmount = (value) => {
		if (!value) return '0'
		return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	}

	return { fmtCompact, formatAmount }
}
