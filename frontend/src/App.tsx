import { useEffect, useMemo, useState } from 'react'
import AdminDashboard from './AdminDashboard'
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

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState(['all'])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<Record<string, CartEntry>>({})
  const [requestedQuantities, setRequestedQuantities] = useState<Record<string, number>>({})
  const [requestedNotes, setRequestedNotes] = useState<Record<string, string>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [hotelName, setHotelName] = useState('SYT hotel')

  const t = translations[language]

  useEffect(() => {
    const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
    const apiUrl = configuredApiUrl
      ? configuredApiUrl.replace(/\/+$/, '')
      : `${window.location.protocol}//${window.location.hostname}:3100`

    fetch(`${apiUrl}/api/menu`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(t.menuUnavailable)
        }
        return (await response.json()) as MenuResponse
      })
      .then((data) => {
        setHotelName(data.hotelName || 'SYT hotel')
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
                <button className="checkout-button" type="button">{t.checkout}</button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default App
