import { supabase } from './supabase'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

/**
 * Ensures Razorpay's browser checkout script is loaded before opening the payment modal.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Creates a server-side Razorpay order, opens Razorpay Standard Checkout,
 * verifies the cryptographic payment signature on the backend, and invokes callbacks.
 */
export async function initiateRazorpayPayment({
  amount,
  items,
  customer,
  onSuccess,
  onFailure,
  onDismiss,
}) {
  const scriptLoaded = await loadRazorpayScript()
  if (!scriptLoaded || !window.Razorpay) {
    onFailure?.('Unable to load Razorpay payment gateway. Please check your connection.')
    return
  }

  const { data: orderData, error: orderError } = await supabase.functions.invoke(
    'create-razorpay-order',
    {
      body: {
        amount,
        items,
        receipt: `kbite_${Date.now()}`,
        notes: {
          customer_name: customer?.name || '',
          customer_email: customer?.email || '',
        },
      },
    }
  )

  if (orderError || !orderData?.orderId) {
    onFailure?.(orderData?.error || orderError?.message || 'Failed to initialize Razorpay order')
    return
  }

  const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID
  if (!keyId) {
    onFailure?.('Razorpay public key is missing')
    return
  }

  let paymentHandled = false

  const options = {
    key: keyId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: 'Kbite',
    description: 'Handcrafted Indian Sweets & Laddus',
    order_id: orderData.orderId,
    prefill: {
      name: customer?.name || '',
      email: customer?.email || '',
      contact: String(customer?.phone || '').replace(/[^\d+]/g, ''),
    },
    theme: {
      color: '#C8960C',
    },
    handler: async (response) => {
      paymentHandled = true
      try {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
          'verify-razorpay-payment',
          {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          }
        )

        if (verifyError || !verifyData?.verified) {
          onFailure?.(
            verifyData?.error || verifyError?.message || 'Payment signature verification failed'
          )
          return
        }

        await onSuccess?.(response)
      } catch (err) {
        onFailure?.(err?.message || 'Error finalizing verified payment')
      }
    },
    modal: {
      ondismiss: () => {
        if (!paymentHandled) {
          onDismiss?.()
        }
      },
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (res) => {
    paymentHandled = true
    onFailure?.(res?.error?.description || 'Payment failed. Please try again.')
  })
  rzp.open()
}

