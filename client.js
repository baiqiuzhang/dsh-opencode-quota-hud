/**
 * dsh-opencode-quota-hud — browser half.
 *
 * Shows the OpenCode Go quota windows (5h / week / month) as one compact pill in
 * the composer's trailing control row, immediately left of the model seat, and
 * only while the session's selected provider is an OpenCode provider.
 *
 * Data source: the host half of this plugin (GET /opencode-usage.json, loopback,
 * no auth) — the same document the settings page used to read. The pill polls it
 * every 60s while it is visible.
 *
 * Bundle format: a classic-script closure factory (no import/export) loaded by
 * the DSH client module table, exactly like the other client plugins.
 */
const hudModuleLoader = typeof window === 'undefined' ? undefined : window.__ModuleLoader__
if (hudModuleLoader !== undefined) {
  hudModuleLoader.load({
    id: 'dsh-opencode-quota-hud',
    factory(require) {
      const React = require('react')
      const h = React.createElement

      const USAGE_API = '/opencode-usage.json'
      const REFRESH_MS = 60000
      const WINDOWS = [
        { key: 'rolling', label: '5h', name: '5 小时' },
        { key: 'weekly', label: '周', name: '本周' },
        { key: 'monthly', label: '月', name: '本月' },
      ]

      /** Format one official percent without fake precision. */
      const fmtPercent = (value) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
        return value < 10 ? `${value.toFixed(1)}%` : `${Math.round(value)}%`
      }

      /** Warning tint once a window is close to (or past) its cap. */
      const tint = (value) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return 'inherit'
        if (value >= 95) return '#d9534f'
        if (value >= 80) return '#e0a030'
        return 'inherit'
      }

      /** Human-readable reset instant for the tooltip. */
      const resetText = (iso) => {
        if (typeof iso !== 'string' || iso.length === 0) return '—'
        const date = new Date(iso)
        return Number.isNaN(date.getTime()) ? iso : date.toLocaleString()
      }

      const windowValue = (usage, key) => {
        if (usage === null || typeof usage !== 'object') return undefined
        const value = usage[key]
        return value !== null && typeof value === 'object' ? value : undefined
      }

      const windowPercent = (usage, key) => {
        const value = windowValue(usage, key)
        return value !== undefined && typeof value.percent === 'number' ? value.percent : null
      }

      function QuotaPill(props) {
        const useProjection = props.useProjection
        const view = typeof useProjection === 'function' ? useProjection('modelSelection') : undefined
        const next = view !== null && view !== undefined ? view.next : null
        const provider = next !== null && next !== undefined ? next.provider : undefined
        const active = typeof provider === 'string' && provider.indexOf('opencode') === 0

        const [usage, setUsage] = React.useState(null)
        const [status, setStatus] = React.useState('idle')

        React.useEffect(() => {
          if (!active) {
            setUsage(null)
            setStatus('idle')
            return undefined
          }
          let cancelled = false
          let timer
          const load = () => {
            fetch(USAGE_API, { headers: { accept: 'application/json' } })
              .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.json()
              })
              .then((payload) => {
                if (cancelled) return
                const body = payload !== null && typeof payload === 'object' ? payload : null
                setUsage(body !== null && body.usage !== undefined ? body.usage : null)
                setStatus('ready')
              })
              .catch(() => {
                if (cancelled) return
                setStatus((previous) => (previous === 'ready' ? 'stale' : 'error'))
              })
          }
          load()
          timer = setInterval(load, REFRESH_MS)
          return () => {
            cancelled = true
            clearInterval(timer)
          }
        }, [active])

        if (!active) return null

        const children = []
        WINDOWS.forEach((window, index) => {
          if (index > 0) {
            children.push(h('span', { key: `sep-${window.key}`, style: { opacity: 0.3 } }, '·'))
          }
          const percent = windowPercent(usage, window.key)
          children.push(
            h('span', { key: window.key, style: { display: 'inline-flex', alignItems: 'baseline', gap: 3 } },
              h('span', { style: { opacity: 0.55 } }, window.label),
              h('span', { style: { color: tint(percent), fontVariantNumeric: 'tabular-nums' } }, fmtPercent(percent)),
            ),
          )
        })

        const lines = WINDOWS.map((window) => {
          const value = windowValue(usage, window.key)
          const reset = value !== undefined ? resetText(value.resetsAt) : '—'
          return `${window.name}已用 ${fmtPercent(windowPercent(usage, window.key))}，重置于 ${reset}`
        })
        const note = status === 'error' ? '\n（额度数据暂不可用）' : status === 'stale' ? '\n（数据可能已过期）' : ''

        return h('div', {
          'data-dsh-opencode-quota': status,
          title: `${lines.join('\n')}${note}`,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 4px',
            marginRight: 2,
            fontSize: 11,
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            opacity: 0.85,
            userSelect: 'none',
            fontVariantNumeric: 'tabular-nums',
          },
        }, children)
      }

      return {
        inject: ['slots'],
        apply(ctx) {
          ctx.slots.inject('conversation.input.right', () =>
            ctx.slots.register({
              name: 'conversation.input.right',
              id: 'opencode-quota',
              label: 'OpenCode 额度',
              order: 100,
            }, QuotaPill),
          )
        },
      }
    },
  })
}
