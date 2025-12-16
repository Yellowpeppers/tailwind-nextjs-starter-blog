/* eslint-disable no-undef */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (!event.action) {
    // Basic click, just focus the window
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/focuslab') && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/focuslab')
        }
      })
    )
    return
  }

  // Handle Actions
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to find an existing Focus Lab window to send the command to
      const client = clientList.find((c) => c.url.includes('/focuslab'))

      if (client) {
        client.focus()
        client.postMessage({
          type: 'FOCUS_LAB_ACTION',
          action: event.action,
        })
      } else {
        // If no window open, technically we can open one, but we can't easily pass the command
        // without URL params or waiting for it to load.
        // For now, let's just open the window.
        if (clients.openWindow) {
          clients.openWindow('/focuslab')
        }
      }
    })
  )
})
