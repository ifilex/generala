// Capacitive haptic feedback for touch and mobile devices

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'generala') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([15, 30, 20]);
        break;
      case 'generala':
        navigator.vibrate([30, 50, 40, 80, 50, 120]);
        break;
    }
  } catch {
    // Ignore unsupported devices
  }
}
