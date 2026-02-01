// Theme utilities for AIDE
export const setTheme = (theme: 'light' | 'dark' | 'system') => {
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
    document.documentElement.classList.add(systemTheme);
    document.documentElement.classList.remove(systemTheme === 'dark' ? 'light' : 'dark');
  } else {
    document.documentElement.classList.add(theme);
    document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
  }
  
  localStorage.setItem('theme', theme);
};

export const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  const theme = savedTheme || 'system';
  setTheme(theme);
};

// Initialize theme on app load
if (typeof window !== 'undefined') {
  initTheme();
}