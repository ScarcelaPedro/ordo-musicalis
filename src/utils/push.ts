import client from '@/api/client'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready.catch(() => null)
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

export async function subscribePush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Notificações push não são suportadas neste navegador')
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Permissão de notificação negada')
  }

  const { data } = await client.get('/push/vapid-public-key')
  if (!data.publicKey) {
    throw new Error('Notificações push não configuradas no servidor')
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey),
  })

  const json = subscription.toJSON()
  await client.post('/push/subscribe', { endpoint: json.endpoint, keys: json.keys })
}

export async function unsubscribePush(): Promise<void> {
  const subscription = await getCurrentSubscription()
  if (!subscription) return
  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  await client.delete('/push/subscribe', { data: { endpoint } })
}
