/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface SettingRow {
  key: string;
  value: string | null;
}

interface ProductRow {
  id: string;
  price: number | string | null;
  is_active: boolean | null;
}

interface ProductSizeRow {
  id: string;
  product_id: string;
  size_label: string;
  price: number | string;
  is_active: boolean | null;
}

interface IngredientRow {
  id: string;
  name: string;
  price: number | string | null;
  is_active: boolean | null;
}

interface VarietyRow {
  id: string;
  name: string;
  price: number | string | null;
  is_active: boolean | null;
}

interface CustomSizeRow {
  id: string;
  variety_id: string;
  size: string;
  weight_grams: number | null;
  price: number | string | null;
  is_active: boolean | null;
}

interface CartItemInput {
  id?: string | number;
  product_id?: string;
  type?: string;
  qty?: number;
  selected_size?: string;
  ingredients?: Array<{ id?: string; name?: string }>;
  customizations?: {
    selectedVarieties?: Array<{ id?: string; name?: string }>;
    selectedSizes?: Array<{
      id?: string;
      variety_id?: string;
      size?: string;
      qty?: number;
      quantity?: number;
    }>;
  };
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function fetchTable<T>(
  supabaseUrl: string,
  serviceKey: string,
  table: string,
  select: string
): Promise<T[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${select}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch ${table}: ${res.status} ${text}`);
  }
  return (await res.json()) as T[];
}

function readRequiredSetting(
  settingsMap: Map<string, string>,
  key: string
): number {
  const raw = settingsMap.get(key);
  const val = Number(raw);
  if (raw === undefined || !Number.isFinite(val) || val < 0) {
    throw new Error(`Store setting "${key}" is missing or invalid`);
  }
  return val;
}

function calculateShipping(
  subtotal: number,
  shippingCharge: number,
  freeShippingThreshold: number
): number {
  if (subtotal <= 0) return 0;
  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) return 0;
  return shippingCharge;
}

function isCustomizedItem(item: CartItemInput): boolean {
  return (
    item.type === "customized" ||
    (Array.isArray(item.ingredients) && item.ingredients.length > 0)
  );
}

function computeCustomItemUnitPrice(
  item: CartItemInput,
  ingredientById: Map<string, IngredientRow>,
  ingredientByName: Map<string, IngredientRow>,
  varietyById: Map<string, VarietyRow>,
  varietyByName: Map<string, VarietyRow>,
  sizeById: Map<string, CustomSizeRow>,
  allActiveSizes: CustomSizeRow[],
  baseItemPricePerKg: number,
  ingredientWeightPercent: number
): number {
  const rawIngredients = Array.isArray(item.ingredients) ? item.ingredients : [];
  const rawVarieties = Array.isArray(item.customizations?.selectedVarieties)
    ? item.customizations!.selectedVarieties!
    : [];
  const rawSizes = Array.isArray(item.customizations?.selectedSizes)
    ? item.customizations!.selectedSizes!
    : [];

  const resolvedSizes: Array<{ row: CustomSizeRow; qty: number }> = [];
  for (const s of rawSizes) {
    const sizeQty = Number(s.qty ?? s.quantity ?? 1);
    if (!Number.isFinite(sizeQty) || sizeQty <= 0) continue;

    let match = s.id ? sizeById.get(String(s.id)) : undefined;
    if (!match && s.variety_id && s.size) {
      match = allActiveSizes.find(
        (dbSize) =>
          String(dbSize.variety_id) === String(s.variety_id) &&
          dbSize.size === s.size
      );
    }
    if (!match) {
      throw new HttpError(400, `Customized size "${s.size || s.id}" is unavailable`);
    }
    resolvedSizes.push({ row: match, qty: sizeQty });
  }

  if (resolvedSizes.length === 0) {
    throw new HttpError(400, "Customized item has no valid size selections");
  }

  const totalWeightGrams = Number(resolvedSizes[0].row.weight_grams) || 0;
  let sizesCost = 0;
  for (const { row, qty } of resolvedSizes) {
    sizesCost += (Number(row.price) || 0) * qty;
  }

  let varietiesCost = 0;
  for (const v of rawVarieties) {
    const match =
      (v.id ? varietyById.get(String(v.id)) : undefined) ??
      (v.name ? varietyByName.get(v.name.trim().toLowerCase()) : undefined);
    if (!match) {
      throw new HttpError(400, `Variety "${v.name || v.id}" is unavailable`);
    }
    varietiesCost += Number(match.price) || 0;
  }

  const resolvedIngredients: IngredientRow[] = [];
  for (const ing of rawIngredients) {
    const match =
      (ing.id ? ingredientById.get(String(ing.id)) : undefined) ??
      (ing.name ? ingredientByName.get(ing.name.trim().toLowerCase()) : undefined);
    if (!match) {
      throw new HttpError(400, `Ingredient "${ing.name || ing.id}" is unavailable`);
    }
    resolvedIngredients.push(match);
  }

  let ingredientsCost = 0;
  let baseItemsCost = 0;
  if (resolvedIngredients.length > 0 && totalWeightGrams > 0) {
    const pct = Math.min(100, Math.max(0, ingredientWeightPercent));
    const ingRatio = pct / 100;
    const baseRatio = 1 - ingRatio;
    const weightPerIngredientGrams =
      (totalWeightGrams * ingRatio) / resolvedIngredients.length;
    const baseItemsWeightGrams = totalWeightGrams * baseRatio;

    for (const ing of resolvedIngredients) {
      ingredientsCost += (weightPerIngredientGrams / 1000) * (Number(ing.price) || 0);
    }
    baseItemsCost = (baseItemsWeightGrams / 1000) * baseItemPricePerKg;
  }

  return ingredientsCost + baseItemsCost + sizesCost + varietiesCost;
}

async function computeAuthoritativeOrderAmount(
  supabaseUrl: string,
  serviceKey: string,
  items: CartItemInput[]
): Promise<number> {
  const [
    settingRows,
    productRows,
    productSizeRows,
    ingredientRows,
    varietyRows,
    customSizeRows,
  ] = await Promise.all([
    fetchTable<SettingRow>(supabaseUrl, serviceKey, "settings", "key,value"),
    fetchTable<ProductRow>(supabaseUrl, serviceKey, "products", "id,price,is_active"),
    fetchTable<ProductSizeRow>(
      supabaseUrl,
      serviceKey,
      "product_sizes",
      "id,product_id,size_label,price,is_active"
    ),
    fetchTable<IngredientRow>(
      supabaseUrl,
      serviceKey,
      "ingredients",
      "id,name,price,is_active"
    ),
    fetchTable<VarietyRow>(
      supabaseUrl,
      serviceKey,
      "varieties",
      "id,name,price,is_active"
    ),
    fetchTable<CustomSizeRow>(
      supabaseUrl,
      serviceKey,
      "sizes",
      "id,variety_id,size,weight_grams,price,is_active"
    ),
  ]);

  const settingsMap = new Map<string, string>();
  for (const row of settingRows) {
    if (row.key && row.value !== null) settingsMap.set(row.key, row.value);
  }

  const shippingCharge = readRequiredSetting(settingsMap, "shipping_charge");
  const freeShippingThreshold = readRequiredSetting(
    settingsMap,
    "free_shipping_threshold"
  );
  const baseItemPricePerKg = readRequiredSetting(
    settingsMap,
    "base_item_price_per_kg"
  );
  const ingredientWeightPercent = readRequiredSetting(
    settingsMap,
    "ingredient_weight_percent"
  );

  const productById = new Map<string, ProductRow>();
  for (const p of productRows) {
    if (p.is_active !== false) productById.set(String(p.id), p);
  }

  const sizesByProductId = new Map<string, ProductSizeRow[]>();
  for (const ps of productSizeRows) {
    if (ps.is_active === false) continue;
    const pid = String(ps.product_id);
    const list = sizesByProductId.get(pid) || [];
    list.push(ps);
    sizesByProductId.set(pid, list);
  }

  const ingredientById = new Map<string, IngredientRow>();
  const ingredientByName = new Map<string, IngredientRow>();
  for (const ing of ingredientRows) {
    if (ing.is_active === false) continue;
    ingredientById.set(String(ing.id), ing);
    if (ing.name) ingredientByName.set(ing.name.trim().toLowerCase(), ing);
  }

  const varietyById = new Map<string, VarietyRow>();
  const varietyByName = new Map<string, VarietyRow>();
  for (const v of varietyRows) {
    if (v.is_active === false) continue;
    varietyById.set(String(v.id), v);
    if (v.name) varietyByName.set(v.name.trim().toLowerCase(), v);
  }

  const sizeById = new Map<string, CustomSizeRow>();
  const activeCustomSizes: CustomSizeRow[] = [];
  for (const cs of customSizeRows) {
    if (cs.is_active === false) continue;
    sizeById.set(String(cs.id), cs);
    activeCustomSizes.push(cs);
  }

  let subtotal = 0;

  for (const item of items) {
    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new HttpError(400, "Invalid item quantity");
    }

    if (isCustomizedItem(item)) {
      const unitPrice = computeCustomItemUnitPrice(
        item,
        ingredientById,
        ingredientByName,
        varietyById,
        varietyByName,
        sizeById,
        activeCustomSizes,
        baseItemPricePerKg,
        ingredientWeightPercent
      );
      subtotal += unitPrice * qty;
      continue;
    }

    const productId = String(item.product_id || item.id || "");
    const dbProduct = productById.get(productId);
    if (!dbProduct) {
      throw new HttpError(400, `Product "${productId}" is unavailable`);
    }

    const activeSizes = sizesByProductId.get(productId) || [];
    let unitPrice: number;
    if (activeSizes.length > 0) {
      const targetSize = String(item.selected_size || "").trim();
      const matchedSize = activeSizes.find(
        (s) => s.size_label.trim() === targetSize
      );
      if (!matchedSize) {
        throw new HttpError(
          400,
          `Size "${targetSize}" is invalid for product "${productId}"`
        );
      }
      unitPrice = Number(matchedSize.price);
    } else {
      unitPrice = Number(dbProduct.price);
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new HttpError(400, `Invalid price for product "${productId}"`);
    }
    subtotal += unitPrice * qty;
  }

  const shipping = calculateShipping(
    subtotal,
    shippingCharge,
    freeShippingThreshold
  );
  return subtotal + shipping;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return jsonResponse(
        { error: "Razorpay credentials are not configured on the server" },
        500
      );
    }

    const body = await req.json();
    let amountInRupees: number;

    if (Array.isArray(body?.items) && body.items.length > 0) {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return jsonResponse(
          { error: "Supabase service credentials are not configured on the server" },
          500
        );
      }
      amountInRupees = await computeAuthoritativeOrderAmount(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        body.items as CartItemInput[]
      );
    } else {
      amountInRupees = Number(body?.amount);
    }

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return jsonResponse({ error: "Invalid order amount" }, 400);
    }

    const amountInPaise = Math.round(amountInRupees * 100);
    if (amountInPaise < 100) {
      return jsonResponse({ error: "Minimum order amount is ₹1" }, 400);
    }

    const receipt = String(body?.receipt || `kbite_${Date.now()}`).slice(0, 40);
    const authHeader = `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`;

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: body?.notes && typeof body.notes === "object" ? body.notes : {},
      }),
    });

    const rzpData = await rzpRes.json();

    if (!rzpRes.ok) {
      return jsonResponse(
        {
          error:
            rzpData?.error?.description || "Failed to create Razorpay order",
        },
        rzpRes.status
      );
    }

    return jsonResponse({
      success: true,
      orderId: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : "Unexpected server error",
      },
      status
    );
  }
});
