// Theme initialization script
(function() {
  // Set dark mode as default if no theme is saved
  const savedTheme = localStorage.getItem('theme');
  
  if (!savedTheme) {
    // Set dark mode as default
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (savedTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
})();
