// Format currency
export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0)

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Order status badge styles
export const orderStatusStyle = {
  PENDING:    { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', label: 'Pending' },
  CONFIRMED:  { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa', label: 'Confirmed' },
  PROCESSING: { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', label: 'Processing' },
  SHIPPED:    { bg: 'rgba(52,211,153,0.15)', color: '#34d399', label: 'Shipped' },
  DELIVERED:  { bg: 'rgba(52,211,153,0.2)',  color: '#10b981', label: 'Delivered' },
  CANCELLED:  { bg: 'rgba(248,113,113,0.1)', color: '#f87171', label: 'Cancelled' },
  REFUNDED:   { bg: 'rgba(248,113,113,0.15)',color: '#f87171', label: 'Refunded' },
}

export const paymentStatusStyle = {
  PENDING:  { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', label: 'Pending' },
  SUCCESS:  { bg: 'rgba(52,211,153,0.15)', color: '#34d399', label: 'Success' },
  FAILED:   { bg: 'rgba(248,113,113,0.1)', color: '#f87171', label: 'Failed' },
  REFUNDED: { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', label: 'Refunded' },
}

// Truncate text
export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : str

// Debounce
export const debounce = (fn, delay = 400) => {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

// Paginate helper
export const buildPageInfo = (pageData) => ({
  current: pageData?.number ?? 0,
  total: pageData?.totalPages ?? 1,
  size: pageData?.size ?? 10,
  totalElements: pageData?.totalElements ?? 0,
})
