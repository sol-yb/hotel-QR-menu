import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AdminDashboard from './AdminDashboard'
import KitchenDashboard from './KitchenDashboard'
import './App.css'

type MenuItem = {
  id: string
  name: string
  nameAm?: string | null
  nameOr?: string | null
  description: string
  descriptionAm?: string | null
  descriptionOr?: string | null
  category: string
  price: number
  image?: string | null
  popular?: boolean
}

type MenuResponse = {
  hotelName: string
  table?: { id: string; number: string; label?: string | null } | null
  categories: {
    id: string
    name: string
    nameAm?: string | null
    nameOr?: string | null
    items: (Omit<MenuItem, 'category' | 'price'> & { price: string })[]
  }[]
}

type CartEntry = {
  quantity: number
  note: string
}

type LanguageCode = 'en' | 'am' | 'or'

type TranslationSet = {
  all: string
  cart: string
  roomService: string
  welcomeTitle: string
  welcomeCopy: string
  todaysMenu: string
  moodFor: string
  openHours: string
  popular: string
  quantity: string
  note: string
  optional: string
  notePlaceholder: string
  addToOrder: string
  yourOrder: string
  ready: string
  emptyCart: string
  emptyCartHelp: string
  total: string
  checkout: string
  roomOrTable: string
  customerName: string
  payNow: string
  submitOrder: string
  orderSubmitted: string
  orderReceived: string
  orderReference: string
  continuePayment: string
  startingPayment: string
  paymentFailed: string
  language: string
  loadingMenu: string
  menuUnavailable: string
  unableLoadMenu: string
  madeForStay: string
  closeCart: string
  removeOne: string
  addOne: string
  menuCategories: string
  menuItemsAria: string
}

const translations: Record<LanguageCode, TranslationSet> = {
  en: {
    all: 'All',
    cart: 'Cart',
    roomService: 'ROOM SERVICE & RESTAURANT',
    welcomeTitle: 'Good food, beautifully served.',
    welcomeCopy: 'Take your time. Everything is prepared fresh to order.',
    todaysMenu: "TODAY'S MENU",
    moodFor: 'What are you in the mood for?',
    openHours: 'Open until 11:00 PM',
    popular: 'Popular',
    quantity: 'Quantity',
    note: 'Note',
    optional: '(optional)',
    notePlaceholder: 'e.g. no onions',
    addToOrder: 'Add to order',
    yourOrder: 'YOUR ORDER',
    ready: 'Ready when you are',
    emptyCart: 'Your order is empty.',
    emptyCartHelp: 'Add something delicious from the menu.',
    total: 'Total',
    checkout: 'Continue to checkout',
    roomOrTable: 'Room or table number',
    customerName: 'Your name',
    payNow: 'Pay with Chapa',
    submitOrder: 'Submit order',
    orderSubmitted: 'Order submitted successfully',
    orderReceived: 'We have received your order. Our team will start preparing it shortly.',
    orderReference: 'Order reference',
    continuePayment: 'Continue to payment',
    startingPayment: 'Opening secure payment…',
    paymentFailed: 'Unable to start payment.',
    language: 'Language',
    loadingMenu: 'Loading the latest menu…',
    menuUnavailable: 'The menu is not available right now.',
    unableLoadMenu: 'Unable to load the menu.',
    madeForStay: 'Made for your stay',
    closeCart: 'Close cart',
    removeOne: 'Remove one',
    addOne: 'Add one',
    menuCategories: 'Menu categories',
    menuItemsAria: 'menu items',
  },
  am: {
    all: 'ሁሉም',
    cart: 'ተጨማሪ',
    roomService: 'የክፍል አገልግሎት እና ምግብ ቤት',
    welcomeTitle: 'ጥሩ ምግብ፣ በውበት የቀረበ።',
    welcomeCopy: 'ዘንድሮ ያልሰጠውን ነገር ለማዘጋጀት ይታሰባል።',
    todaysMenu: 'የዛሬ ምናሌ',
    moodFor: 'ምን ይፈልጋሉ?',
    openHours: 'እስከ 11:00 ድረስ ክፍት',
    popular: 'ተወዳጅ',
    quantity: 'ብዛት',
    note: 'ማስታወሻ',
    optional: '(አማራጭ)',
    notePlaceholder: 'ለምሳሌ የሰንበት አይደለም',
    addToOrder: 'ወደ ትዕዛዝ ጨምር',
    yourOrder: 'ትዕዛዝዎ',
    ready: 'ዝግጁ ስለሆነ',
    emptyCart: 'ትዕዛዝዎ ባዶ ነው።',
    emptyCartHelp: 'ከምናሌው የሚያስፈልግ ነገር ያክሉ።',
    total: 'ጠቅላላ',
    checkout: 'ወደ ክፍያ ይቀጥሉ',
    roomOrTable: 'የክፍል ወይም የጠረጴዛ ቁጥር',
    customerName: 'ስምዎ',
    payNow: 'በChapa ይክፈሉ',
    submitOrder: 'ትዕዛዝ ላክ',
    orderSubmitted: 'ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል',
    orderReceived: 'ትዕዛዝዎ ደርሶናል። ቡድናችን በቅርቡ ማዘጋጀት ይጀምራል።',
    orderReference: 'የትዕዛዝ መለያ',
    continuePayment: 'ወደ ክፍያ ይቀጥሉ',
    startingPayment: 'የክፍያ ገጽ በመክፈት ላይ…',
    paymentFailed: 'ክፍያ መጀመር አልተቻለም።',
    language: 'ቋንቋ',
    loadingMenu: 'የቅርብ ጊዜ ምናሌ በመጫን ላይ…',
    menuUnavailable: 'ምናሌው አሁን አይገኝም።',
    unableLoadMenu: 'ምናሌውን መጫን አልተቻለም።',
    madeForStay: 'ለቆይታዎ የተዘጋጀ',
    closeCart: 'ጋሪውን ዝጋ',
    removeOne: 'አንድ አስወግድ',
    addOne: 'አንድ ጨምር',
    menuCategories: 'የምናሌ ምድቦች',
    menuItemsAria: 'የምናሌ እቃዎች',
  },
  or: {
    all: 'Hunda',
    cart: 'Kaaruu',
    roomService: 'Tajaajila Kutaa fi Mana Nyaata',
    welcomeTitle: 'Nyaatni gaarii, sirna baay’ee tola.',
    welcomeCopy: 'Yeroo fudhadhu. Wanta hundi haaraan qophaa’eera.',
    todaysMenu: 'MENU OLLA',
    moodFor: 'Waa’ee maaliin yaadu?',
    openHours: 'Sa’aatii 11:00 hanga baname',
    popular: 'Baarbachisoo',
    quantity: 'Miqdii',
    note: 'Yaada',
    optional: '(filannoo)',
    notePlaceholder: 'fkn. bilbila hin qabne',
    addToOrder: 'Ajajaatti dabali',
    yourOrder: 'AJAJAAKEESSA',
    ready: 'Qophaa’eera',
    emptyCart: 'Ajajaan keessan duwwaa dha.',
    emptyCartHelp: 'Menu irraa wanta mi’aawaa addaan kutaa.',
    total: 'Waliigalaa',
    checkout: 'Baasistuu itti fufii',
    roomOrTable: 'Lakkoofsa kutaa ykn minjaalaa',
    customerName: 'Maqaa kee',
    payNow: 'Chapa’n kaffali',
    submitOrder: 'Ajaja galchi',
    orderSubmitted: 'Ajajaan milkaa’inaan ergameera',
    orderReceived: 'Ajaja keessan arganneerra. Gareen keenya yeroo gabaabaa keessatti qopheessuu jalqaba.',
    orderReference: 'Wabii ajajaa',
    continuePayment: 'Kaffaltiitti itti fufi',
    startingPayment: 'Kaffaltii nageenya qabu banuu…',
    paymentFailed: 'Kaffaltii jalqabsiisuu hin dandeenye.',
    language: 'Afaan',
    loadingMenu: 'Menyu haaraa fe’aa jira…',
    menuUnavailable: 'Menyuun yeroo ammaa hin jiru.',
    unableLoadMenu: 'Menyu fe’uu hin dandeenye.',
    madeForStay: 'Turtii keessaniif qophaa’e',
    closeCart: 'Kaaruu cufi',
    removeOne: 'Tokko balleessi',
    addOne: 'Tokko dabali',
    menuCategories: 'Gosa menyuu',
    menuItemsAria: 'meeshaalee menyuu',
  },
}

const languageOptions: { value: LanguageCode; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'am', label: 'Amharic' },
  { value: 'or', label: 'Oromic' },
]

const formatPrice = (price: number) => `ETB ${price.toFixed(2)}`
const localized = (language: LanguageCode, english: string, amharic?: string | null, oromo?: string | null) =>
  language === 'am' ? amharic || english : language === 'or' ? oromo || english : english
const fallbackImage = (name: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#ead8c8"/><text x="400" y="270" text-anchor="middle" fill="#7d4d3d" font-family="Georgia,serif" font-size="42">${name}</text></svg>`)}`
const directImageUrl = (image?: string | null) => {
  if (!image) return ''
  try {
    const url = new URL(image)
    if (url.hostname === 'www.google.com' && url.pathname === '/imgres') {
      return url.searchParams.get('imgurl') ?? ''
    }
  } catch {
    return ''
  }
  return image
}

function OrderTracker({ apiUrl }: { apiUrl: string }) {
  const [reference, setReference] = useState(new URLSearchParams(window.location.search).get('reference') ?? window.location.pathname.split('/')[2] ?? '')
  const [order, setOrder] = useState<{ reference: string; status: string; paymentStatus: string; total: string; roomOrTable: string } | null>(null)
  const [error, setError] = useState('')
  const load = async (event?: FormEvent) => {
    event?.preventDefault()
    setError('')
    try {
      const response = await fetch(`${apiUrl}/api/orders/${encodeURIComponent(reference.trim())}`)
      if (!response.ok) throw new Error('Order not found.')
      setOrder(await response.json())
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load order.') }
  }

  useEffect(() => { if (reference) void load() }, [])
  return <main className="payment-result"><h1>Track your order</h1><form onSubmit={load}><label>Order reference<input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="SYT-..." required /></label><button className="checkout-button" type="submit">Check status</button></form>{error && <p className="status-panel error">{error}</p>}{order && <section className="status-panel"><h2>{order.status}</h2><p>Order {order.reference} · {order.roomOrTable}</p><p>Payment: {order.paymentStatus} · Total: ETB {order.total}</p></section>}</main>
}

function PaymentResult({ apiUrl }: { apiUrl: string }) {
    const reference = new URLSearchParams(window.location.search).get('tx_ref') ?? ''
    const [status, setStatus] = useState<'success' | 'failed' | 'pending' | 'checking'>('checking')
    const [message, setMessage] = useState('')
    const [uploading, setUploading] = useState(false)
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [order, setOrder] = useState<{ total: string; roomOrTable: string; items: { itemName: string; quantity: number; unitPrice: string }[] } | null>(null)
    useEffect(() => {
      if (!reference) { setStatus('failed'); return }
      fetch(`${apiUrl}/api/payments/chapa/status/${encodeURIComponent(reference)}`)
        .then(async (response) => {
          if (!response.ok) throw new Error('Payment verification failed.')
          return response.json() as Promise<{ status: 'success' | 'failed' | 'pending' }>
        })
        .then((data) => setStatus(data.status))
        .catch(() => setStatus('failed'))
    }, [apiUrl, reference])
    useEffect(() => {
      if (!reference) return
      fetch(`${apiUrl}/api/orders/${encodeURIComponent(reference)}`)
        .then((response) => response.ok ? response.json() as Promise<typeof order> : null)
        .then((data) => setOrder(data))
        .catch(() => setOrder(null))
    }, [apiUrl, reference])
    const selectReceipt = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        setMessage('Choose a JPG, PNG, or WEBP image up to 5 MB.')
        return
      }
      setMessage('')
      setReceiptFile(file)
    }
    const uploadReceipt = async () => {
      if (!receiptFile) {
        setMessage('Choose your payment screenshot first.')
        return
      }
      setUploading(true)
      setMessage('')
      try {
        const imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error('Unable to read the image.'))
          reader.readAsDataURL(receiptFile)
        })
        const response = await fetch(`${apiUrl}/api/payments/${encodeURIComponent(reference)}/receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData }),
        })
        const data = await response.json() as { message?: string }
        if (!response.ok) throw new Error(data.message || 'Unable to upload receipt.')
        setMessage('Receipt sent to the hotel team successfully.')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to upload receipt.')
      } finally {
        setUploading(false)
      }
    }
    const downloadReceipt = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 700
      const context = canvas.getContext('2d')
      if (!context) return
      context.fillStyle = '#fffefa'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = '#242421'
      context.font = '600 52px Georgia'
      context.fillText('SYT Hotel Payment Receipt', 70, 110)
      context.font = '32px DM Sans, sans-serif'
      context.fillText(`Order reference: ${reference}`, 70, 200)
      context.fillText(`Table / room: ${order?.roomOrTable ?? '—'}`, 70, 255)
      context.fillText(`Payment status: ${status.toUpperCase()}`, 70, 305)
      context.fillText(`Total paid: ETB ${order?.total ?? '—'}`, 70, 355)
      context.font = '24px DM Sans, sans-serif'
      order?.items.slice(0, 6).forEach((item, index) => {
        context.fillText(`${item.quantity}× ${item.itemName} — ETB ${Number(item.unitPrice).toFixed(2)}`, 70, 415 + index * 34)
      })
      context.fillText('Keep this receipt for your order.', 70, 640)
      const link = document.createElement('a')
      link.download = `payment-receipt-${reference}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    return <main className="payment-result">
      <h1>{status === 'checking' || status === 'pending' ? 'Payment is being verified…' : status === 'success' ? 'Payment successful' : 'Payment not completed'}</h1>
      <p>{status === 'success' ? 'Your payment has been confirmed. Please send your receipt screenshot to the hotel team.' : status === 'checking' || status === 'pending' ? 'Chapa is still confirming the transaction. You can return here later.' : 'Please try again or contact staff.'}</p>
      {reference && status === 'success' && <>
        <button className="outline-button" type="button" onClick={downloadReceipt}>Download payment receipt</button>
        <label className="receipt-upload">Choose Chapa screenshot<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectReceipt} disabled={uploading} /></label>
        <button className="checkout-button" type="button" onClick={() => void uploadReceipt()} disabled={uploading || !receiptFile}>{uploading ? 'Sending screenshot…' : 'Send screenshot to admin'}</button>
      </>}
      {message && <p className="status-panel">{message}</p>}
      <a href="/">Return to menu</a>
    </main>
  }


function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState(['all'])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<Record<string, CartEntry>>(() => {
    try {
      const saved = window.localStorage.getItem('hotel-menu-cart')
      return saved ? JSON.parse(saved) as Record<string, CartEntry> : {}
    } catch {
      return {}
    }
  })
  const [requestedQuantities, setRequestedQuantities] = useState<Record<string, number>>({})
  const [requestedNotes, setRequestedNotes] = useState<Record<string, string>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [hotelName, setHotelName] = useState('SYT hotel')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [roomOrTable, setRoomOrTable] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState('')
  const [submittedOrderReference, setSubmittedOrderReference] = useState('')
  const [tableContext, setTableContext] = useState<MenuResponse['table']>(null)

  const t = translations[language]

  useEffect(() => {
    try {
      window.localStorage.setItem('hotel-menu-cart', JSON.stringify(cart))
    } catch {
      // Storage can be unavailable in private browsing; cart remains in memory.
    }
  }, [cart])

  useEffect(() => {
    const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
    const apiUrl = configuredApiUrl
      ? configuredApiUrl.replace(/\/+$/, '')
      : `${window.location.protocol}//${window.location.hostname}:3100`

    const tableNumber = new URLSearchParams(window.location.search).get('table')?.trim()
    fetch(`${apiUrl}/api/menu${tableNumber ? `?table=${encodeURIComponent(tableNumber)}` : ''}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(t.menuUnavailable)
        }
        return (await response.json()) as MenuResponse
      })
      .then((data) => {
        setHotelName(data.hotelName || 'SYT hotel')
        setTableContext(data.table ?? null)
        if (data.table) setRoomOrTable(data.table.label || `Table ${data.table.number}`)
        setSelectedCategory('all')
        const loadedCategories = data.categories.map((category) =>
          localized(language, category.name, category.nameAm, category.nameOr),
        )
        setCategories(['all', ...loadedCategories])
        setMenuItems(
          data.categories.flatMap((category) =>
            category.items.map((item) => ({
              ...item,
              category: localized(language, category.name, category.nameAm, category.nameOr),
              price: Number(item.price),
            })),
          ),
        )
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : t.unableLoadMenu)
      })
      .finally(() => setLoading(false))
  }, [language, t.menuUnavailable, t.unableLoadMenu])

  const visibleItems = useMemo(
    () =>
      selectedCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === selectedCategory),
    [selectedCategory, menuItems],
  )

  const cartItems = menuItems.filter((item) => cart[item.id])
  const cartCount = Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0)
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * (cart[item.id]?.quantity ?? 0),
    0,
  )

  const addToCart = (id: string) => {
    const quantity = requestedQuantities[id] ?? 1
    if (!Number.isInteger(quantity) || quantity < 1) return

    setCart((current) => ({
      ...current,
      [id]: {
        quantity: (current[id]?.quantity ?? 0) + quantity,
        note: requestedNotes[id]?.trim() ?? '',
      },
    }))
    setIsCartOpen(true)
    setIsCheckoutOpen(true)
    setOrderSubmitted('')
    setPaymentError('')
  }

  const apiBaseUrl = () => {
    const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
    return configuredApiUrl
      ? configuredApiUrl.replace(/\/+$/, '')
      : `${window.location.protocol}//${window.location.hostname}:3100`
  }

  const startPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPaymentError('')
    setIsStartingPayment(true)
    try {
      const response = await fetch(`${apiBaseUrl()}/api/payments/chapa/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: submittedOrderReference || undefined,
          roomOrTable,
          tableId: tableContext?.id,
          customerName,
          customerPhone,
          customerNotes,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: cart[item.id].quantity,
            note: cart[item.id].note,
          })),
        }),
      })
      const data = await response.json() as { checkoutUrl?: string; message?: string | { message?: string } }
      const message = typeof data.message === 'string' ? data.message : data.message?.message
      if (!response.ok || !data.checkoutUrl) throw new Error(message || t.paymentFailed)
      window.location.assign(data.checkoutUrl)
    } catch (error: unknown) {
      setPaymentError(error instanceof Error ? error.message : t.paymentFailed)
    } finally {
      setIsStartingPayment(false)
    }

  }

  const submitOrder = async () => {
    setPaymentError('')
    setIsSubmittingOrder(true)
    try {
      const response = await fetch(`${apiBaseUrl()}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomOrTable,
          tableId: tableContext?.id,
          customerName,
          customerPhone,
          customerNotes,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: cart[item.id].quantity,
            note: cart[item.id].note,
          })),
        }),
      })
      const data = await response.json() as { reference?: string; message?: string }
      if (!response.ok || !data.reference) throw new Error(data.message || 'Unable to submit your order.')
      setSubmittedOrderReference(data.reference)
      setOrderSubmitted(data.reference)
    } catch (error: unknown) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to submit your order.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const changeQuantity = (id: string, change: number) => {
    setCart((current) => {
      const quantity = (current[id]?.quantity ?? 0) + change
      const next = { ...current }
      if (quantity <= 0) {
        delete next[id]
      } else {
        next[id] = { ...current[id], quantity }
      }
      return next
    })
  }

  if (window.location.pathname === '/admin') {
    return <AdminDashboard />
  }
  if (window.location.pathname === '/kitchen') {
    return <KitchenDashboard />
  }

  if (window.location.pathname === '/payment-result') {
    return <PaymentResult apiUrl={apiBaseUrl()} />
  }

  if (window.location.pathname === '/track' || window.location.pathname.startsWith('/track/')) {
    return <OrderTracker apiUrl={import.meta.env.VITE_API_URL?.trim()?.replace(/\/+$/, '') || `${window.location.protocol}//${window.location.hostname}:3100`} />
  }

  return (
    <div className="menu-shell">
      <header className="hero-header">
        <div className="header-top">
          <div className="brand-mark" aria-hidden="true">
            <span>S</span>
          </div>
          <div className="hotel-name">
            <span className="eyebrow">SYT</span>
            <strong>{hotelName}</strong>
          </div>

          <div className="header-controls">
            <div className="language-switcher" aria-label={t.language}>
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={language === option.value ? 'active' : ''}
                  onClick={() => setLanguage(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button className="cart-button" type="button" onClick={() => setIsCartOpen(true)}>
              <span aria-hidden="true">🛒</span>
              <span>{t.cart}</span>
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
            <button
              className="payment-button"
              type="button"
              onClick={() => {
                setIsCartOpen(true)
                setIsCheckoutOpen(true)
              }}
              disabled={cartCount === 0}
              aria-label="Open payment"
              title={`Pay ${formatPrice(cartTotal)}`}
            >
              <span aria-hidden="true">💳</span>
              <span>{formatPrice(cartTotal)}</span>
            </button>
          </div>
        </div>

        <div className="welcome">
          <p className="eyebrow">{t.roomService}</p>
          <h1>{t.welcomeTitle}</h1>
          <p className="welcome-copy">{t.welcomeCopy}</p>
        </div>
      </header>

      <main>
        <section className="menu-intro">
          <div>
            <p className="eyebrow accent">{t.todaysMenu}</p>
            <h2>{t.moodFor}</h2>
          </div>
          <span className="open-badge"><i /> {t.openHours}</span>
        </section>

        <nav className="category-tabs" aria-label={t.menuCategories}>
          {categories.map((category) => (
            <button
              className={selectedCategory === category ? 'active' : ''}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? t.all : category}
            </button>
          ))}
        </nav>

        <section className="menu-grid" aria-label={`${selectedCategory === 'all' ? t.all : selectedCategory} ${t.menuItemsAria}`}>
          {loading && <div className="status-panel">{t.loadingMenu}</div>}
          {!loading && loadError && <div className="status-panel error">{loadError}</div>}
          {!loading && !loadError && visibleItems.map((item) => (
            <article className="menu-card" key={item.id}>
              <div className="image-wrap">
                <img
                  src={directImageUrl(item.image) || fallbackImage(item.name)}
                  alt={localized(language, item.name, item.nameAm, item.nameOr)}
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = fallbackImage(item.name)
                  }}
                />
                {item.popular && <span className="popular-label">{t.popular}</span>}
              </div>
              <div className="card-content">
                <div className="item-heading">
                  <h3>{localized(language, item.name, item.nameAm, item.nameOr)}</h3>
                  <span>{formatPrice(item.price)}</span>
                </div>
                <p>{localized(language, item.description, item.descriptionAm, item.descriptionOr)}</p>
                <form className="add-item-form" onSubmit={(event) => { event.preventDefault(); addToCart(item.id) }}>
                  <div className="item-options">
                    <label>
                      {t.quantity}
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={requestedQuantities[item.id] ?? 1}
                        placeholder="1"
                        onChange={(event) => setRequestedQuantities((current) => ({ ...current, [item.id]: Number(event.target.value) }))}
                      />
                    </label>
                    <label className="note-field">
                      {t.note} <span>{t.optional}</span>
                      <input
                        type="text"
                        maxLength={160}
                        value={requestedNotes[item.id] ?? ''}
                        onChange={(event) => setRequestedNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                        placeholder={t.notePlaceholder}
                      />
                    </label>
                  </div>
                  <button className="add-button" type="submit"><span>+</span> {t.addToOrder}</button>
                </form>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer>
        <span>{hotelName}</span>
        <span>•</span>
        <span>{t.madeForStay}</span>
      </footer>

      {isCartOpen && (
        <div className="cart-backdrop" role="presentation" onClick={() => setIsCartOpen(false)}>
          <aside className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}>
            <div className="cart-heading">
              <div>
                <p className="eyebrow accent">{t.yourOrder}</p>
                <h2 id="cart-title">{t.ready}</h2>
              </div>
              <button className="close-button" type="button" onClick={() => setIsCartOpen(false)} aria-label={t.closeCart}>×</button>
            </div>
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <span aria-hidden="true">🍽️</span>
                <p>{t.emptyCart}</p>
                <small>{t.emptyCartHelp}</small>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatPrice(item.price * (cart[item.id]?.quantity ?? 0))}</span>
                        {cart[item.id]?.note && <small className="cart-note">{cart[item.id].note}</small>}
                      </div>
                      <div className="quantity-control">
                        <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`${t.removeOne} ${item.name}`}>−</button>
                        <span>{cart[item.id].quantity}</span>
                        <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`${t.addOne} ${item.name}`}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total"><span>{t.total}</span><strong>{formatPrice(cartTotal)}</strong></div>
                <button className="outline-button" type="button" onClick={() => setCart({})}>Clear cart</button>
              </>
            )}
            {isCheckoutOpen && (
              <div className="cart-backdrop" role="presentation" onClick={() => setIsCheckoutOpen(false)}>
                <form className="cart-panel checkout-form" onSubmit={startPayment} onClick={(event) => event.stopPropagation()}>
                  <div className="cart-heading">
                    <div><p className="eyebrow accent">{t.checkout}</p><h2>{formatPrice(cartTotal)}</h2></div>
                    <button className="close-button" type="button" onClick={() => setIsCheckoutOpen(false)}>×</button>
                  </div>
                  <label>{t.roomOrTable}<input value={roomOrTable} onChange={(event) => setRoomOrTable(event.target.value)} placeholder="e.g. Room 204" required readOnly={Boolean(tableContext)} /></label>
                  <label>{t.customerName}<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder={t.optional} /></label>
                  <label>Phone (optional)<input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="+251..." /></label>
                  <label>{t.note}<input value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} placeholder={t.notePlaceholder} /></label>
                  {orderSubmitted && <p className="status-panel">{t.orderSubmitted}. {t.orderReference}: <strong>{orderSubmitted}</strong></p>}
                  {paymentError && <p className="status-panel error">{paymentError}</p>}
                  <button className="outline-button" type="button" onClick={() => void submitOrder()} disabled={isSubmittingOrder || cartItems.length === 0}>{isSubmittingOrder ? 'Submitting order…' : t.submitOrder}</button>
                  <button className="checkout-button" type="submit" disabled={isStartingPayment}>{isStartingPayment ? t.startingPayment : t.payNow}</button>
                </form>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default App
