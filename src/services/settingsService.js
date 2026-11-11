import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const DEFAULT_SETTINGS_STATE = {
  loaded: false,
  shippingCharge: 0,
  freeShippingThreshold: 0,
  baseItemPricePerKg: 0,
  ingredientWeightPercent: 80,
}

let cachedSettings = { ...DEFAULT_SETTINGS_STATE }
const listeners = new Set()
let fetchInFlight = null
let realtimeStarted = false

function parseSettingsRows(rows = []) {
  const map = {}
  rows.forEach((row) => {
    if (row?.key) {
      map[row.key] = row.value
    } else if (row?.name) {
      map[row.name] = row.value
    }
  })

  const num = (val, fallback = 0) => {
    const parsed = Number(val)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
  }

  return {
    loaded: true,
    shippingCharge: num(map.shipping_charge, 0),
    freeShippingThreshold: num(map.free_shipping_threshold, 0),
    baseItemPricePerKg: num(map.base_item_price_per_kg ?? rows[0]?.base_item_price_per_kg, 0),
    ingredientWeightPercent: num(map.ingredient_weight_percent, 80),
  }
}

function notifyListeners(nextState) {
  cachedSettings = nextState
  listeners.forEach((fn) => fn(nextState))
}

export async function fetchStoreSettings({ force = false } = {}) {
  if (!supabase) {
    return { ...DEFAULT_SETTINGS_STATE, loaded: true }
  }
  if (cachedSettings.loaded && !force) {
    return cachedSettings
  }
  if (fetchInFlight && !force) {
    return fetchInFlight
  }

  fetchInFlight = (async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      const parsed = parseSettingsRows(data || [])
      notifyListeners(parsed)
      return parsed
    } catch (err) {
      console.error('Failed to fetch store settings:', err)
      return cachedSettings
    } finally {
      fetchInFlight = null
    }
  })()

  return fetchInFlight
}

function ensureRealtimeSubscription() {
  if (realtimeStarted || !supabase) return
  realtimeStarted = true

  supabase
    .channel('store-settings-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings' },
      () => {
        fetchStoreSettings({ force: true })
      }
    )
    .subscribe()
}

export function calculateShipping(subtotal, settings) {
  const amount = Number(subtotal) || 0
  if (amount <= 0 || !settings?.loaded) return 0

  const charge = Number(settings.shippingCharge) || 0
  const threshold = Number(settings.freeShippingThreshold) || 0

  if (threshold > 0 && amount >= threshold) {
    return 0
  }
  return charge
}

export function useStoreSettings() {
  const [settings, setSettings] = useState(cachedSettings)

  useEffect(() => {
    listeners.add(setSettings)
    ensureRealtimeSubscription()
    fetchStoreSettings({ force: !cachedSettings.loaded }).then((latest) => {
      setSettings(latest)
    })

    return () => {
      listeners.delete(setSettings)
    }
  }, [])

  return settings
}

