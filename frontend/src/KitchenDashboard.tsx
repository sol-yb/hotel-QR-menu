import { useEffect, useState } from 'react'
import './AdminDashboard.css'

type KitchenOrder = { id: string; reference: string; roomOrTable: string; status: string; createdAt: string; items: { itemName: string; quantity: number }[] }
const apiUrl = import.meta.env.VITE_API_URL?.trim()?.replace(/\/+$/, '') || `${window.location.protocol}//${window.location.hostname}:3100`
const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED', 'CANCELLED']

export default function KitchenDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const load = async () => {
    const response = await fetch(`${apiUrl}/api/kitchen/orders`, { credentials: 'include' })
    if (!response.ok) throw new Error('Unable to load kitchen orders.')
    setOrders(await response.json())
  }
  useEffect(() => { fetch(`${apiUrl}/api/auth/staff/session`, { credentials: 'include' }).then((response) => response.json()).then((session) => { setAuthenticated(session.authenticated); if (session.authenticated) void load() }).catch(() => setAuthenticated(false)) }, [])
  useEffect(() => {
    if (!authenticated) return
    const interval = window.setInterval(() => { void load() }, 10000)
    return () => window.clearInterval(interval)
  }, [authenticated])
  const signIn = async (event: React.FormEvent) => {
    event.preventDefault(); setError('')
    const response = await fetch(`${apiUrl}/api/auth/staff/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (!response.ok) { setError('Invalid staff credentials.'); return }
    setAuthenticated(true); setPassword(''); void load()
  }
  const updateStatus = async (id: string, status: string) => {
    const response = await fetch(`${apiUrl}/api/kitchen/orders/${id}/status`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (response.ok) void load()
  }
  if (authenticated === null) return <main className="admin-login"><p>Checking staff session…</p></main>
  if (!authenticated) return <main className="admin-login"><form className="login-card" onSubmit={signIn}><p className="sidebar-label">SECURE AREA</p><h1>Kitchen sign in</h1><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="login-error">{error}</p>}<button className="primary-button">Sign in</button></form></main>
  return <main className="admin-shell"><section className="admin-main"><header className="admin-header"><div><p className="sidebar-label">KITCHEN OPERATIONS</p><h1>Live orders</h1></div><button className="outline-button" type="button" onClick={() => void load()}>Refresh</button></header><div className="quick-grid">{orders.map((order) => <article className="stat-card" key={order.id}><small>{order.reference} · {order.roomOrTable}</small><h2>{order.items.map((item) => `${item.quantity}× ${item.itemName}`).join(', ')}</h2><select value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><span className="stat-note">{new Date(order.createdAt).toLocaleTimeString()}</span></article>)}{orders.length === 0 && <p>No active orders.</p>}</div></section></main>
}
