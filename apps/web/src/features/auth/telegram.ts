export function initializeTelegram() {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return null;

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor('#090b11');
  webApp.setBackgroundColor('#090b11');
  webApp.enableClosingConfirmation();
  return webApp;
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  window.Telegram?.WebApp.HapticFeedback?.impactOccurred(style);
}
