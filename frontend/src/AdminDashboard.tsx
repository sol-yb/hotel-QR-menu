import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './AdminDashboard.css'

type AdminItem = {
  id: string
  name: string
  nameAm?: string | null
  nameOr?: string | null
  description?: string | null
  descriptionAm?: string | null
  descriptionOr?: string | null
  imageUrl?: string | null
  category: string
  categoryId: string
  price: number
  available: boolean
}

type AdminCategory = {
  id: string
  name: string
  nameAm?: string | null
  nameOr?: string | null
}

type EditItemForm = {
  id: string
  name: string
  nameAm: string
  nameOr: string
  description: string
  descriptionAm: string
  descriptionOr: string
  imageUrl: string
  categoryId: string
  price: string
  available: boolean
}

type AdminMenuResponse = {
  categories: {
    id: string
    name: string
    nameAm?: string | null
    nameOr?: string | null
    items: {
      id: string
      name: string
      nameAm?: string | null
      nameOr?: string | null
      description?: string | null
      descriptionAm?: string | null
      descriptionOr?: string | null
      imageUrl?: string | null
      categoryId: string
      price: string
      available: boolean
    }[]
  }[]
}
type AdminOrder = { id: string; reference: string; roomOrTable: string; total: string; status: string; createdAt: string; items: { itemName: string; quantity: number }[]; payments?: { receiptImageUrl?: string | null }[] }
type Analytics = { orders: number; revenue: string; byStatus: Record<string, number> }

type LanguageCode = 'en' | 'am' | 'or'

type AdminTranslations = {
  checkingSession: string
  secureArea: string
  signInTitle: string
  signInDescription: string
  email: string
  password: string
  signIn: string
  management: string
  overview: string
  menu: string
  orders: string
  team: string
  comingSoon: string
  viewCustomerMenu: string
  adminGreeting: string
  systemLive: string
  menuItems: string
  itemsAcross: string
  availableNow: string
  availableNowNote: string
  categories: string
  categoriesNote: string
  quickAccess: string
  manageYourMenu: string
  openMenuManager: string
  addMenuItem: string
  addMenuItemNote: string
  addCategory: string
  addCategoryNote: string
  shareYourMenu: string
  tableQrCode: string
  qrDescription: string
  downloadPng: string
  print: string
  generatingQr: string
  catalogue: string
  menuItemsHeading: string
  addItem: string
  itemName: string
  itemNamePlaceholder: string
  category: string
  price: string
  saveItem: string
  addCategoryLabel: string
  itemTableItem: string
  itemTableCategory: string
  itemTablePrice: string
  itemTableStatus: string
  available: string
  unavailable: string
  adminUser: string
  administrator: string
  language: string
  menuManagement: string
  adminNavigation: string
  menuSummary: string
  unableLoadMenu: string
  unableSignIn: string
  unableGenerateQr: string
  unableUpdateAvailability: string
  unableCreateItem: string
  unableCreateCategory: string
  newCategoryName: string
  moreActions: string
  invalidCredentials: string
  editItem: string
  editNameAm: string
  editNameOr: string
  editDescription: string
  editDescriptionAm: string
  editDescriptionOr: string
  editImageUrl: string
  editCancelled: string
  editCategory: string
  editSave: string
  editCancel: string
}

const translations: Record<LanguageCode, AdminTranslations> = {
  en: {
    checkingSession: 'Checking administrator session…',
    secureArea: 'SECURE AREA',
    signInTitle: 'Administrator sign in',
    signInDescription: 'Use your administrator email and password to manage the menu.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    management: 'MANAGEMENT',
    overview: 'Overview',
    menu: 'Menu',
    orders: 'Orders',
    team: 'Team',
    comingSoon: 'Coming soon',
    viewCustomerMenu: '← View customer menu',
    adminGreeting: 'GOOD MORNING, ADMIN',
    systemLive: 'System live',
    menuItems: 'MENU ITEMS',
    itemsAcross: 'Across {count} categories',
    availableNow: 'AVAILABLE NOW',
    availableNowNote: 'Ready to be ordered',
    categories: 'CATEGORIES',
    categoriesNote: 'Organising your menu',
    quickAccess: 'QUICK ACCESS',
    manageYourMenu: 'Manage your menu',
    openMenuManager: 'Open menu manager →',
    addMenuItem: 'Add menu item',
    addMenuItemNote: 'Create a new dish or drink',
    addCategory: 'Add category',
    addCategoryNote: 'Organise your menu',
    shareYourMenu: 'SHARE YOUR MENU',
    tableQrCode: 'Table QR code',
    qrDescription: 'Guests can scan this code to open the customer menu.',
    downloadPng: 'Download PNG',
    print: 'Print',
    generatingQr: 'Generating QR code…',
    catalogue: 'CATALOGUE',
    menuItemsHeading: 'Menu items',
    addItem: '＋ Add item',
    itemName: 'Item name',
    itemNamePlaceholder: 'e.g. House granola',
    category: 'Category',
    price: 'Price',
    saveItem: 'Save item',
    addCategoryLabel: '＋ Add category',
    itemTableItem: 'ITEM',
    itemTableCategory: 'CATEGORY',
    itemTablePrice: 'PRICE',
    itemTableStatus: 'STATUS',
    available: 'Available',
    unavailable: 'Unavailable',
    adminUser: 'Admin user',
    administrator: 'Administrator',
    language: 'Language',
    menuManagement: 'Menu management',
    adminNavigation: 'Admin navigation',
    menuSummary: 'Menu summary',
    unableLoadMenu: 'Unable to load menu data.',
    unableSignIn: 'Unable to sign in.',
    unableGenerateQr: 'Unable to generate the QR code.',
    unableUpdateAvailability: 'Unable to update availability.',
    unableCreateItem: 'Unable to create menu item.',
    unableCreateCategory: 'Unable to create category.',
    newCategoryName: 'New category name',
    moreActions: 'More actions for',
    invalidCredentials: 'Invalid administrator credentials.',
    editItem: 'Edit menu item',
    editNameAm: 'Amharic name',
    editNameOr: 'Oromic name',
    editDescription: 'English description',
    editDescriptionAm: 'Amharic description',
    editDescriptionOr: 'Oromic description',
    editImageUrl: 'Image URL',
    editCancelled: 'Edit cancelled.',
    editCategory: 'Edit category',
    editSave: 'Save changes',
    editCancel: 'Cancel',
  },
  am: {
    checkingSession: 'አስተዳደራዊ ክፍለ ጊዜ በመፈተሽ ላይ…',
    secureArea: 'ደህንነቱ የተጠበቀ አካባቢ',
    signInTitle: 'አስተዳደር ወደ መግቢያ',
    signInDescription: 'ምናሌውን ለማስተዳደር የአስተዳደር ኢሜይል እና የይለፍ ቃልዎን ይጠቀሙ።',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    signIn: 'ግባ',
    management: 'አስተዳደር',
    overview: 'አጠቃላይ',
    menu: 'ምናሌ',
    orders: 'ትዕዛዞች',
    team: 'ቡድን',
    comingSoon: 'በቅርቡ',
    viewCustomerMenu: '← የደንበኛ ምናሌን ይመልከቱ',
    adminGreeting: 'ጤና ያለዎት, አስተዳደር',
    systemLive: 'ስርዓት እየሰራ ነው',
    menuItems: 'የምናሌ እቃዎች',
    itemsAcross: '{count} ምድቦችን ተከትሎ',
    availableNow: 'አሁን የሚገኙ',
    availableNowNote: 'ለማዘዝ ዝግጁ',
    categories: 'ምድቦች',
    categoriesNote: 'ምናሌዎን በማደራጀት ላይ',
    quickAccess: 'ፈጣን መዳረሻ',
    manageYourMenu: 'ምናሌዎን ያስተዳደሩ',
    openMenuManager: 'ምናሌ አስተዳደራዊ ይክፈቱ →',
    addMenuItem: 'የምናሌ እቃ ጨምር',
    addMenuItemNote: 'አዲስ ምግብ ወይም መጠጥ ፍጠር',
    addCategory: 'ምድብ ጨምር',
    addCategoryNote: 'ምናሌዎን ያደራጁ',
    shareYourMenu: 'ምናሌዎን ያጋሩ',
    tableQrCode: 'የጠረጴዛ ኩር ኮድ',
    qrDescription: 'እንግዶች ይህንን ኮድ በመስመር በራብ ምናሌን ለመክፈት ሊመለከቱ ይችላሉ።',
    downloadPng: 'PNG አውርድ',
    print: 'አትም',
    generatingQr: 'QR ኮድ በመፍጠር ላይ…',
    catalogue: 'ካታሎግ',
    menuItemsHeading: 'የምናሌ እቃዎች',
    addItem: '＋ እቃ ጨምር',
    itemName: 'የእቃ ስም',
    itemNamePlaceholder: 'ለምሳሌ፡ የቤት ግራኖላ',
    category: 'ምድብ',
    price: 'ዋጋ',
    saveItem: 'እቃ አስቀምጥ',
    addCategoryLabel: '＋ ምድብ ጨምር',
    itemTableItem: 'እቃ',
    itemTableCategory: 'ምድብ',
    itemTablePrice: 'ዋጋ',
    itemTableStatus: 'ሁኔታ',
    available: 'ዝግጁ',
    unavailable: 'ያልተገኘ',
    adminUser: 'አስተዳደር ተጠቃሚ',
    administrator: 'አስተዳደር',
    language: 'ቋንቋ',
    menuManagement: 'አስተዳደር ምናሌ',
    adminNavigation: 'የአስተዳደር መመሪያ',
    menuSummary: 'የምናሌ ማጠቃለያ',
    unableLoadMenu: 'የምናሌ መረጃን መጫን አልተቻለም።',
    unableSignIn: 'መግባት አልተቻለም።',
    unableGenerateQr: 'QR ኮድ መፍጠር አልተቻለም።',
    unableUpdateAvailability: 'የመገኘት ሁኔታን ማዘመን አልተቻለም።',
    unableCreateItem: 'የምናሌ እቃ መፍጠር አልተቻለም።',
    unableCreateCategory: 'ምድብ መፍጠር አልተቻለም።',
    newCategoryName: 'አዲስ ምድብ ስም',
    moreActions: 'ተጨማሪ እርምጃዎች ለ',
    invalidCredentials: 'የአስተዳደር መግቢያ መረጃ ልክ አይደለም።',
    editItem: 'የምናሌ እቃ አርም',
    editNameAm: 'የአማርኛ ስም',
    editNameOr: 'የኦሮምኛ ስም',
    editDescription: 'የእንግሊዝኛ መግለጫ',
    editDescriptionAm: 'የአማርኛ መግለጫ',
    editDescriptionOr: 'የኦሮምኛ መግለጫ',
    editImageUrl: 'የምስል URL',
    editCancelled: 'ማስተካከያው ተሰርዟል።',
    editCategory: 'ምድብ አርም',
    editSave: 'ለውጦችን አስቀምጥ',
    editCancel: 'ሰርዝ',
  },
  or: {
    checkingSession: 'Waliigalaa hayyama bulchaa jira…',
    secureArea: 'BALAA’INA DHABBAA',
    signInTitle: 'Bulchaa galmaa’uu',
    signInDescription: 'Menyu to’achuuuf emailii fi paaswoordii bulchaa fayyadamaa.',
    email: 'Imeelii',
    password: 'Paaswoordii',
    signIn: 'Seeni',
    management: 'BULCHAA',
    overview: 'Waliigalaa',
    menu: 'Menyu',
    orders: 'Ajajaa',
    team: 'Garee',
    comingSoon: 'Dhihoo jira',
    viewCustomerMenu: '← Menyuun maamilaa ilaali',
    adminGreeting: 'GALATAA, BULCHAA',
    systemLive: 'Sirni jira',
    menuItems: 'MEEQAA MENYU',
    itemsAcross: '{count} gosaatti',
    availableNow: 'AMMAM JIRRAA',
    availableNowNote: 'Ajajamuuf qophaa’e',
    categories: 'GOSA',
    categoriesNote: 'Menyu keessan sirreessuu',
    quickAccess: 'BARRAAN DHIYAANNAA',
    manageYourMenu: 'Menyu kee bulchi',
    openMenuManager: 'Menyu bulchaa banaa →',
    addMenuItem: 'Menyu itemi dabali',
    addMenuItemNote: 'Nyaata ykn dhugaatii haaraa uumuu',
    addCategory: 'Gosa dabali',
    addCategoryNote: 'Menyu kee qindeessi',
    shareYourMenu: 'Menyu kee hiriyotaaf qabsi',
    tableQrCode: 'Gosa QR code',
    qrDescription: 'Tajaajiltoonni kunuunsi QR code kana skanniidhaan menyuun maamilaa banuu.',
    downloadPng: 'PNG daawwu',
    print: 'Maxxansa',
    generatingQr: 'QR code uumuu jirra…',
    catalogue: 'KATALOOGII',
    menuItemsHeading: 'Menyu xixiqqoo',
    addItem: '＋ Item dabali',
    itemName: 'Maqaa itemii',
    itemNamePlaceholder: 'fkn. House granola',
    category: 'Gosa',
    price: 'Gatii',
    saveItem: 'Item save',
    addCategoryLabel: '＋ Gosa dabali',
    itemTableItem: 'ITEM',
    itemTableCategory: 'GOSA',
    itemTablePrice: 'GATII',
    itemTableStatus: 'HAALA',
    available: 'Jira',
    unavailable: 'Hin jirre',
    adminUser: 'Bulchaa fayyadamaa',
    administrator: 'Bulchaa',
    language: 'Afaan',
    menuManagement: 'Bulchiinsa menyuu',
    adminNavigation: 'Qajeelfama bulchaa',
    menuSummary: 'Cuunfaa menyuu',
    unableLoadMenu: 'Odeeffannoo menyuu fe’uu hin dandeenye.',
    unableSignIn: 'Seenuu hin dandeenye.',
    unableGenerateQr: 'QR code uumuu hin dandeenye.',
    unableUpdateAvailability: 'Haala jiraachuu haaromsuu hin dandeenye.',
    unableCreateItem: 'Meeshaa menyuu uumuu hin dandeenye.',
    unableCreateCategory: 'Gosa uumuu hin dandeenye.',
    newCategoryName: 'Maqaa gosa haaraa',
    moreActions: 'Tarkaanfii dabalataa',
    invalidCredentials: 'Odeeffannoon seensaa bulchaa sirrii miti.',
    editItem: 'Meeshaa menyuu gulaali',
    editNameAm: 'Maqaa Afaan Amaaraa',
    editNameOr: 'Maqaa Afaan Oromoo',
    editDescription: 'Ibsa Ingilizii',
    editDescriptionAm: 'Ibsa Afaan Amaaraa',
    editDescriptionOr: 'Ibsa Afaan Oromoo',
    editImageUrl: 'URL suuraa',
    editCancelled: 'Gulaalliin haqame.',
    editCategory: 'Gosa gulaali',
    editSave: 'Jijjiirama olkaa’i',
    editCancel: 'Haqi',
  },
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : `${window.location.protocol}//${window.location.hostname}:3100`
const configuredMenuUrl = import.meta.env.VITE_PUBLIC_MENU_URL?.trim()
const formatPrice = (price: number) => `ETB ${price.toFixed(2)}`

const initialCategories: AdminCategory[] = []

function AdminDashboard() {
  const [categories, setCategories] = useState(initialCategories)
  const [items, setItems] = useState<AdminItem[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders'>('overview')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [editingItem, setEditingItem] = useState<EditItemForm | null>(null)
  const [language, setLanguage] = useState<LanguageCode>('en')
  const t = translations[language]
  const menuUrl = (() => {
    const candidate = configuredMenuUrl || window.location.origin
    try {
      const url = new URL(candidate)
      url.pathname = '/'
      url.search = ''
      url.hash = ''
      return url.toString()
    } catch {
      return `${window.location.origin}/`
    }
  })()

  const applyMenuData = (data: AdminMenuResponse) => {
    setIsAuthenticated(true)
    setCategories(data.categories.map(({ id, name, nameAm, nameOr }) => ({ id, name, nameAm, nameOr })))
    setItemCategory(data.categories[0]?.name ?? '')
    setItems(
      data.categories.flatMap((category) =>
        category.items.map((item) => ({
          ...item,
          category: category.name,
          price: Number(item.price),
        })),
      ),
    )
  }

  useEffect(() => {
    fetch(`${apiUrl}/api/auth/admin/session`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error(t.unableLoadMenu)
        return response.json() as Promise<{ authenticated: boolean }>
      })
      .then(async (session) => {
        if (!session.authenticated) return null
        const response = await fetch(`${apiUrl}/api/admin/menu`, { credentials: 'include' })
        if (!response.ok) throw new Error(t.unableLoadMenu)
        return response.json() as Promise<AdminMenuResponse>
      })
      .then((data) => {
        if (!data) return
        applyMenuData(data)
      })
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : t.unableLoadMenu)
      })
      .finally(() => setCheckingSession(false))
  }, [])

  const loadOrders = async () => {
    const [ordersResponse, analyticsResponse] = await Promise.all([
      fetch(`${apiUrl}/api/admin/orders`, { credentials: 'include' }),
      fetch(`${apiUrl}/api/admin/analytics/today`, { credentials: 'include' }),
    ])
    if (!ordersResponse.ok) throw new Error('Unable to load orders.')
    setOrders(await ordersResponse.json())
    if (analyticsResponse.ok) setAnalytics(await analyticsResponse.json())
  }
  useEffect(() => {
    if (!isAuthenticated) return
    if (activeTab === 'orders') void loadOrders().catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'Unable to load orders.'))
    else void fetch(`${apiUrl}/api/admin/analytics/today`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((data) => { if (data) setAnalytics(data) })
    if (activeTab !== 'orders') return
    const interval = window.setInterval(() => { void loadOrders() }, 10000)
    return () => window.clearInterval(interval)
  }, [activeTab, isAuthenticated])
  const updateOrderStatus = async (id: string, status: string) => {
    const response = await fetch(`${apiUrl}/api/admin/orders/${id}/status`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (!response.ok) { window.alert('Unable to update order status.'); return }
    await loadOrders()
  }

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError('')
    setIsSigningIn(true)
    try {
      const response = await fetch(`${apiUrl}/api/auth/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (!response.ok) throw new Error(response.status === 401 ? t.invalidCredentials : t.unableSignIn)

      const menuResponse = await fetch(`${apiUrl}/api/admin/menu`, { credentials: 'include' })
      if (!menuResponse.ok) throw new Error(t.unableLoadMenu)
      applyMenuData(await menuResponse.json() as AdminMenuResponse)
      setPassword('')
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : t.unableSignIn)
    } finally {
      setIsSigningIn(false)
    }
  }

  useEffect(() => {
    QRCode.toDataURL(menuUrl, {
      width: 260,
      margin: 2,
      color: { dark: '#29332d', light: '#fffefa' },
    })
      .then(setQrCode)
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : t.unableGenerateQr)
      })
  }, [menuUrl])

  const toggleAvailability = (item: AdminItem) => {
    fetch(`${apiUrl}/api/admin/menu-items/${item.id}/availability`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !item.available }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(t.unableUpdateAvailability)
        setItems((current) =>
          current.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, available: !currentItem.available }
              : currentItem,
          ),
        )
      })
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : t.unableUpdateAvailability)
      })
  }

  const addItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const price = Number(itemPrice)
    if (!itemName.trim() || !Number.isFinite(price) || price <= 0) return

    const category = categories.find((current) => current.name === itemCategory)
    if (!category) return

    fetch(`${apiUrl}/api/admin/menu-items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: category.id, name: itemName, price }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(t.unableCreateItem)
        return response.json()
      })
      .then((item) => {
        setItems((current) => [
          ...current,
          {
            id: item.id,
            name: item.name,
            categoryId: category.id,
            category: category.name,
            price: Number(item.price),
            available: item.isAvailable,
          },
        ])
        setItemName('')
        setItemPrice('')
        setShowItemForm(false)
      })
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : t.unableCreateItem)
      })
  }

  const openEditItem = (item: AdminItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      nameAm: item.nameAm ?? '',
      nameOr: item.nameOr ?? '',
      description: item.description ?? '',
      descriptionAm: item.descriptionAm ?? '',
      descriptionOr: item.descriptionOr ?? '',
      imageUrl: item.imageUrl ?? '',
      categoryId: item.categoryId,
      price: String(item.price),
      available: item.available,
    })
  }

  const saveEditedItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingItem) return
    const category = categories.find((current) => current.id === editingItem.categoryId)
    const numericPrice = Number(editingItem.price)
    if (!category || !editingItem.name.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) return

    try {
      const response = await fetch(`${apiUrl}/api/admin/menu-items/${editingItem.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: editingItem.categoryId,
          name: editingItem.name,
          nameAm: editingItem.nameAm,
          nameOr: editingItem.nameOr,
          description: editingItem.description,
          descriptionAm: editingItem.descriptionAm,
          descriptionOr: editingItem.descriptionOr,
          imageUrl: editingItem.imageUrl,
          price: numericPrice,
          isAvailable: editingItem.available,
        }),
      })
      if (!response.ok) throw new Error(t.unableCreateItem)
      const updated = await response.json()
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === editingItem.id
            ? {
                ...currentItem,
                name: updated.name,
                nameAm: updated.nameAm,
                nameOr: updated.nameOr,
                description: updated.description,
                descriptionAm: updated.descriptionAm,
                descriptionOr: updated.descriptionOr,
                imageUrl: updated.imageUrl,
                categoryId: editingItem.categoryId,
                category: category.name,
                price: Number(updated.price),
                available: updated.isAvailable,
              }
            : currentItem,
        ),
      )
      setEditingItem(null)
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : t.unableCreateItem)
    }
  }

  const addCategory = () => {
    const name = window.prompt(t.newCategoryName)
    if (!name?.trim() || categories.some((category) => category.name === name.trim())) return

    fetch(`${apiUrl}/api/admin/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(t.unableCreateCategory)
        return response.json()
      })
      .then((category) => {
        setCategories((current) => [...current, { id: category.id, name: category.name }])
      })
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : t.unableCreateCategory)
      })
  }

  const editCategory = async (category: AdminCategory) => {
    const name = window.prompt(t.category, category.name)
    if (name === null || !name.trim()) return
    const nameAm = window.prompt(t.editNameAm, category.nameAm ?? '')
    if (nameAm === null) return
    const nameOr = window.prompt(t.editNameOr, category.nameOr ?? '')
    if (nameOr === null) return
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nameAm, nameOr }),
      })
      if (!response.ok) throw new Error(t.unableCreateCategory)
      const updated = await response.json()
      setCategories((current) =>
        current.map((currentCategory) =>
          currentCategory.id === category.id
            ? { ...currentCategory, name: updated.name, nameAm: updated.nameAm, nameOr: updated.nameOr }
            : currentCategory,
        ),
      )
      setItems((current) =>
        current.map((item) =>
          item.categoryId === category.id ? { ...item, category: updated.name } : item,
        ),
      )
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : t.unableCreateCategory)
    }
  }

  if (checkingSession) return <div className="admin-login-state">{t.checkingSession}</div>

  if (!isAuthenticated) {
    return (
      <main className="admin-login">
        <form className="login-card" onSubmit={signIn}>
          <a className="admin-brand login-brand" href="/"><span className="admin-mark">S</span><span><small>SYT</small> hotel</span></a>
          <p className="sidebar-label">{t.secureArea}</p>
          <h1>{t.signInTitle}</h1>
          <p className="login-description">{t.signInDescription}</p>
          <label>{t.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>{t.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
          {loginError && <p className="login-error">{loginError}</p>}
          <button className="primary-button" type="submit" disabled={isSigningIn}>{isSigningIn ? t.checkingSession : t.signIn}</button>
          <div className="language-switcher admin-language-switcher" aria-label={t.language}>
            {(['en', 'am', 'or'] as LanguageCode[]).map((option) => (
              <button
                key={option}
                type="button"
                className={language === option ? 'active' : ''}
                onClick={() => setLanguage(option)}
              >
                {option === 'en' ? 'EN' : option === 'am' ? 'AM' : 'OR'}
              </button>
            ))}
          </div>
        </form>
      </main>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="admin-mark">S</span>
          <span><small>SYT</small> hotel</span>
        </a>
        <p className="sidebar-label">{t.management}</p>
        <nav className="admin-nav" aria-label={t.adminNavigation}>
          <button className={activeTab === 'overview' ? 'selected' : ''} type="button" onClick={() => setActiveTab('overview')}>
            <span>▦</span> {t.overview}
          </button>
          <button className={activeTab === 'menu' ? 'selected' : ''} type="button" onClick={() => setActiveTab('menu')}>
            <span>☷</span> {t.menu}
          </button>
          <button className={activeTab === 'orders' ? 'selected' : ''} type="button" onClick={() => setActiveTab('orders')}><span>◷</span> {t.orders}</button>
          <button type="button" disabled><span>♙</span> {t.team} <em>{t.comingSoon}</em></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-user"><span>AM</span><div><strong>{t.adminUser}</strong><small>{t.administrator}</small></div></div>
          <a href="/">{t.viewCustomerMenu}</a>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="sidebar-label">{t.adminGreeting}</p>
            <h1>{activeTab === 'overview' ? t.overview : activeTab === 'orders' ? t.orders : t.menuManagement}</h1>
          </div>
          <div className="admin-header-actions">
            <div className="language-switcher admin-language-switcher" aria-label={t.language}>
              {(['en', 'am', 'or'] as LanguageCode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={language === option ? 'active' : ''}
                  onClick={() => setLanguage(option)}
                >
                  {option === 'en' ? 'EN' : option === 'am' ? 'AM' : 'OR'}
                </button>
              ))}
            </div>
            <span className="live-indicator"><i /> {t.systemLive}</span>
            <button type="button" className="avatar-button">AM</button>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <>
            <section className="stats-grid" aria-label={t.menuSummary}>
              <div className="stat-card"><span className="stat-icon sage">☷</span><small>{t.menuItems}</small><strong>{items.length}</strong><span className="stat-note">{t.itemsAcross.replace('{count}', String(categories.length))}</span></div>
              <div className="stat-card"><span className="stat-icon gold">◉</span><small>{t.availableNow}</small><strong>{items.filter((item) => item.available).length}</strong><span className="stat-note">{t.availableNowNote}</span></div>
              <div className="stat-card"><span className="stat-icon clay">◫</span><small>{t.categories}</small><strong>{categories.length}</strong><span className="stat-note">{t.categoriesNote}</span></div>
              {analytics && <div className="stat-card"><span className="stat-icon gold">◉</span><small>Today’s orders</small><strong>{analytics.orders}</strong><span className="stat-note">ETB {analytics.revenue} revenue</span></div>}
            </section>
            <section className="admin-section">
              <div className="section-heading"><div><p className="sidebar-label">{t.quickAccess}</p><h2>{t.manageYourMenu}</h2></div><button className="outline-button" type="button" onClick={() => setActiveTab('menu')}>{t.openMenuManager}</button></div>
              <div className="quick-grid">
                <button type="button" onClick={() => { setActiveTab('menu'); setShowItemForm(true) }}><span>＋</span><strong>{t.addMenuItem}</strong><small>{t.addMenuItemNote}</small></button>
                <button type="button" onClick={addCategory}><span>☷</span><strong>{t.addCategory}</strong><small>{t.addCategoryNote}</small></button>
              </div>
            </section>
            <section className="admin-section qr-section">
              <div className="section-heading">
                <div><p className="sidebar-label">{t.shareYourMenu}</p><h2>{t.tableQrCode}</h2><p className="qr-description">{t.qrDescription}</p></div>
                <div className="qr-actions">
                  <a className="outline-button" href={qrCode} download="syt-hotel-menu-qr.png">{t.downloadPng}</a>
                  <button className="outline-button" type="button" onClick={() => window.print()}>{t.print}</button>
                </div>
              </div>
              <div className="qr-card">
                {qrCode ? <img src={qrCode} alt={`QR code for ${menuUrl}`} /> : <span>{t.generatingQr}</span>}
                <code>{menuUrl}</code>
              </div>
            </section>
          </>
        ) : activeTab === 'orders' ? (
          <section className="admin-section menu-manager">
            <div className="section-heading"><div><p className="sidebar-label">ORDER OPERATIONS</p><h2>Orders & status</h2></div><button className="outline-button" type="button" onClick={() => void loadOrders()}>Refresh</button></div>
            {analytics && <div className="stats-grid">{Object.entries(analytics.byStatus).map(([status, count]) => <div className="stat-card" key={status}><small>{status}</small><strong>{count}</strong></div>)}</div>}
            <div className="item-table">{orders.map((order) => <div className="item-row" key={order.id}><div><strong>{order.reference}</strong><small>{order.roomOrTable} · {order.items.map((item) => `${item.quantity}× ${item.itemName}`).join(', ')}</small>{order.payments?.find((payment) => payment.receiptImageUrl)?.receiptImageUrl && <a href={order.payments.find((payment) => payment.receiptImageUrl)?.receiptImageUrl ?? '#'} target="_blank" rel="noreferrer">View payment receipt</a>}</div><strong>ETB {Number(order.total).toFixed(2)}</strong><select value={order.status} onChange={(event) => void updateOrderStatus(order.id, event.target.value)}>{['PENDING','ACCEPTED','PREPARING','READY','COMPLETED','REJECTED','CANCELLED'].map((status) => <option key={status}>{status}</option>)}</select></div>)}</div>
          </section>
        ) : (
          <section className="admin-section menu-manager">
            <div className="section-heading"><div><p className="sidebar-label">{t.catalogue}</p><h2>{t.menuItemsHeading}</h2></div><button className="primary-button" type="button" onClick={() => setShowItemForm(true)}>{t.addItem}</button></div>
            {showItemForm && (
              <form className="item-form" onSubmit={addItem}>
                <label>{t.itemName}<input value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder={t.itemNamePlaceholder} /></label>
                <label>{t.category}<select value={itemCategory} onChange={(event) => setItemCategory(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
                <label>{t.price}<input type="number" min="0.01" step="0.01" value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} placeholder="0.00" /></label>
                <button className="primary-button" type="submit">{t.saveItem}</button>
              </form>
            )}
            {editingItem && (
              <form className="edit-item-form" onSubmit={saveEditedItem}>
                <div className="edit-form-heading">
                  <div><p className="sidebar-label">{t.editItem}</p><h3>{editingItem.name}</h3></div>
                  <button className="more-button" type="button" onClick={() => setEditingItem(null)} aria-label={t.editCancel}>×</button>
                </div>
                <div className="edit-form-grid">
                  <label>{t.itemName}<input value={editingItem.name} onChange={(event) => setEditingItem({ ...editingItem, name: event.target.value })} required /></label>
                  <label>{t.editNameAm}<input value={editingItem.nameAm} onChange={(event) => setEditingItem({ ...editingItem, nameAm: event.target.value })} /></label>
                  <label>{t.editNameOr}<input value={editingItem.nameOr} onChange={(event) => setEditingItem({ ...editingItem, nameOr: event.target.value })} /></label>
                  <label>{t.category}<select value={editingItem.categoryId} onChange={(event) => setEditingItem({ ...editingItem, categoryId: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                  <label>{t.price}<input type="number" min="0.01" step="0.01" value={editingItem.price} onChange={(event) => setEditingItem({ ...editingItem, price: event.target.value })} required /></label>
                  <label>{t.editImageUrl}<input value={editingItem.imageUrl} onChange={(event) => setEditingItem({ ...editingItem, imageUrl: event.target.value })} /></label>
                  <label>{t.editDescription}<textarea value={editingItem.description} onChange={(event) => setEditingItem({ ...editingItem, description: event.target.value })} /></label>
                  <label>{t.editDescriptionAm}<textarea value={editingItem.descriptionAm} onChange={(event) => setEditingItem({ ...editingItem, descriptionAm: event.target.value })} /></label>
                  <label>{t.editDescriptionOr}<textarea value={editingItem.descriptionOr} onChange={(event) => setEditingItem({ ...editingItem, descriptionOr: event.target.value })} /></label>
                  <label className="edit-availability"><input type="checkbox" checked={editingItem.available} onChange={(event) => setEditingItem({ ...editingItem, available: event.target.checked })} /> {t.available}</label>
                </div>
                <div className="edit-form-actions">
                  <button className="outline-button" type="button" onClick={() => setEditingItem(null)}>{t.editCancel}</button>
                  <button className="primary-button" type="submit">{t.editSave}</button>
                </div>
              </form>
            )}
            <div className="category-pills">{categories.map((category) => <button type="button" key={category.id} onClick={() => editCategory(category)}>{category.name}</button>)}<button type="button" onClick={addCategory}>{t.addCategoryLabel}</button></div>
            <div className="item-table">
              <div className="table-row table-head"><span>{t.itemTableItem}</span><span>{t.itemTableCategory}</span><span>{t.itemTablePrice}</span><span>{t.itemTableStatus}</span><span /></div>
              {items.map((item) => (
                <div className="table-row" key={item.id}>
                  <strong>{item.name}</strong><span>{item.category}</span><span>{formatPrice(item.price)}</span>
                  <button className={`status-pill ${item.available ? 'available' : 'unavailable'}`} type="button" onClick={() => toggleAvailability(item)}>{item.available ? t.available : t.unavailable}</button>
                  <button className="more-button" type="button" onClick={() => openEditItem(item)} aria-label={`${t.moreActions} ${item.name}`}>•••</button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
