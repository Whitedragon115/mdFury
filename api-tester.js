#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
let config = {
  baseUrl: 'http://localhost:3000/api',
  apiToken: '',
  inviteKey: '',
  lastResponse: null
};

// Load config if exists
const configPath = path.join(__dirname, 'api-tester-config.json');
try {
  if (fs.existsSync(configPath)) {
    config = { ...config, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
    log('Config loaded from api-tester-config.json', 'green');
  }
} catch (error) {
  log('Could not load config file', 'yellow');
}

// Save config
function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('Config saved', 'green');
  } catch (error) {
    log('Could not save config', 'red');
  }
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };
  
  if (config.apiToken && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${config.apiToken}`;
  }

  const requestOptions = {
    method: 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    log(`\n🌐 ${requestOptions.method} ${url}`, 'cyan');
    if (requestOptions.body) {
      log(`📤 Body: ${requestOptions.body}`, 'blue');
    }
    
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    config.lastResponse = { status: response.status, data };
    
    log(`📥 Status: ${response.status}`, response.ok ? 'green' : 'red');
    log(`📄 Response:`, 'magenta');
    console.log(JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { error };
  }
}

// Menu functions
async function configMenu() {
  log('\n🔧 Configuration', 'cyan');
  log(`1. Set Base URL (current: ${config.baseUrl})`);
  log(`2. Set API Token (current: ${config.apiToken ? '***set***' : 'not set'})`);
  log(`3. Set Invite Key (current: ${config.inviteKey ? '***set***' : 'not set'})`);
  log('4. Save Config');
  log('5. Back to Main Menu');
  
  const choice = await ask('\nChoose option: ');
  
  switch (choice) {
    case '1':
      const newUrl = await ask('Enter base URL: ');
      if (newUrl.trim()) config.baseUrl = newUrl.trim();
      break;
    case '2':
      const newToken = await ask('Enter API token: ');
      if (newToken.trim()) config.apiToken = newToken.trim();
      break;
    case '3':
      const newKey = await ask('Enter invite key: ');
      if (newKey.trim()) config.inviteKey = newKey.trim();
      break;
    case '4':
      saveConfig();
      break;
    case '5':
      return;
    default:
      log('Invalid option', 'red');
  }
  
  if (choice !== '5') {
    await configMenu();
  }
}

async function authMenu() {
  log('\n🔐 Authentication', 'cyan');
  log('1. Register User');
  log('2. Login User');
  log('3. Get User Profile');
  log('4. Update User Profile');
  log('5. Generate API Token');
  log('6. Back to Main Menu');
  
  const choice = await ask('\nChoose option: ');
  
  switch (choice) {
    case '1':
      await registerUser();
      break;
    case '2':
      await loginUser();
      break;
    case '3':
      await apiRequest('/auth/profile');
      break;
    case '4':
      await updateProfile();
      break;
    case '5':
      await apiRequest('/auth/token', { method: 'POST' });
      break;
    case '6':
      return;
    default:
      log('Invalid option', 'red');
  }
  
  if (choice !== '6') {
    await authMenu();
  }
}

async function registerUser() {
  const username = await ask('Username: ');
  const email = await ask('Email: ');
  const password = await ask('Password: ');
  const inviteCode = await ask('Invite Code (optional): ');
  
  const body = { username, email, password };
  if (inviteCode.trim()) body.inviteCode = inviteCode.trim();
  
  await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true
  });
}

async function loginUser() {
  const username = await ask('Username: ');
  const password = await ask('Password: ');
  
  await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true
  });
}

async function updateProfile() {
  const displayName = await ask('Display Name (optional): ');
  const language = await ask('Language (en/zh, optional): ');
  const theme = await ask('Theme (light/dark/system, optional): ');
  
  const body = {};
  if (displayName.trim()) body.displayName = displayName.trim();
  if (language.trim()) body.language = language.trim();
  if (theme.trim()) body.theme = theme.trim();
  
  if (Object.keys(body).length === 0) {
    log('No updates provided', 'yellow');
    return;
  }
  
  await apiRequest('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

async function markdownMenu() {
  log('\n📝 Markdown Management', 'cyan');
  log('1. Get All Markdowns');
  log('2. Create Markdown');
  log('3. Get Markdown by ID');
  log('4. Update Markdown');
  log('5. Delete Markdown');
  log('6. Get Public Markdown');
  log('7. Back to Main Menu');
  
  const choice = await ask('\nChoose option: ');
  
  switch (choice) {
    case '1':
      await apiRequest('/markdowns');
      break;
    case '2':
      await createMarkdown();
      break;
    case '3':
      const getId = await ask('Enter markdown ID: ');
      if (getId.trim()) await apiRequest(`/markdowns/${getId.trim()}`);
      break;
    case '4':
      await updateMarkdown();
      break;
    case '5':
      const deleteId = await ask('Enter markdown ID to delete: ');
      if (deleteId.trim()) {
        const confirm = await ask(`Delete "${deleteId}"? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
          await apiRequest(`/markdowns/${deleteId.trim()}`, { method: 'DELETE' });
        }
      }
      break;
    case '6':
      const binId = await ask('Enter bin ID: ');
      if (binId.trim()) await apiRequest(`/public/${binId.trim()}`, { skipAuth: true });
      break;
    case '7':
      return;
    default:
      log('Invalid option', 'red');
  }
  
  if (choice !== '7') {
    await markdownMenu();
  }
}

async function createMarkdown() {
  const title = await ask('Title: ');
  const content = await ask('Content: ');
  const isPrivate = await ask('Private? (y/n): ');
  const tags = await ask('Tags (comma-separated, optional): ');
  const password = await ask('Password (optional): ');
  
  const body = {
    title: title.trim(),
    content: content.trim(),
    isPrivate: isPrivate.toLowerCase() === 'y'
  };
  
  if (tags.trim()) {
    body.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  
  if (password.trim()) {
    body.password = password.trim();
  }
  
  await apiRequest('/markdowns', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function updateMarkdown() {
  const id = await ask('Markdown ID: ');
  if (!id.trim()) return;
  
  const title = await ask('New title (optional): ');
  const content = await ask('New content (optional): ');
  const isPrivate = await ask('Private? (y/n/skip): ');
  const tags = await ask('Tags (comma-separated, optional): ');
  
  const body = {};
  if (title.trim()) body.title = title.trim();
  if (content.trim()) body.content = content.trim();
  if (isPrivate.toLowerCase() === 'y') body.isPrivate = true;
  if (isPrivate.toLowerCase() === 'n') body.isPrivate = false;
  if (tags.trim()) {
    body.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  
  if (Object.keys(body).length === 0) {
    log('No updates provided', 'yellow');
    return;
  }
  
  await apiRequest(`/markdowns/${id.trim()}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

async function inviteMenu() {
  log('\n🎫 Invite System', 'cyan');
  log('1. Validate Invite Code');
  log('2. Admin - Verify Key');
  log('3. Admin - Generate Code');
  log('4. Admin - Get Stats');
  log('5. Back to Main Menu');
  
  const choice = await ask('\nChoose option: ');
  
  switch (choice) {
    case '1':
      const code = await ask('Enter invite code: ');
      if (code.trim()) {
        await apiRequest('/invite/validate', {
          method: 'POST',
          body: JSON.stringify({ inviteCode: code.trim() }),
          skipAuth: true
        });
      }
      break;
    case '2':
      const key = config.inviteKey || await ask('Enter invite key: ');
      await apiRequest('/admin/invite/verify', {
        method: 'POST',
        body: JSON.stringify({ inviteKey: key }),
        skipAuth: true
      });
      break;
    case '3':
      await generateInviteCode();
      break;
    case '4':
      const statsKey = config.inviteKey || await ask('Enter invite key: ');
      await apiRequest('/admin/invite/stats', {
        method: 'POST',
        body: JSON.stringify({ inviteKey: statsKey }),
        skipAuth: true
      });
      break;
    case '5':
      return;
    default:
      log('Invalid option', 'red');
  }
  
  if (choice !== '5') {
    await inviteMenu();
  }
}

async function generateInviteCode() {
  const key = config.inviteKey || await ask('Enter invite key: ');
  const hours = await ask('Expiry hours (0 for no expiry): ');
  
  const body = { inviteKey: key };
  const expiryHours = parseInt(hours) || 0;
  if (expiryHours > 0) {
    body.expiryHours = expiryHours;
  }
  
  await apiRequest('/admin/invite/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true
  });
}

async function utilsMenu() {
  log('\n🛠️ Utilities', 'cyan');
  log('1. Check Public Mode Status');
  log('2. Show Last Response');
  log('3. Pretty Print JSON');
  log('4. Test Connection');
  log('5. Back to Main Menu');
  
  const choice = await ask('\nChoose option: ');
  
  switch (choice) {
    case '1':
      await apiRequest('/config/public-mode', { skipAuth: true });
      break;
    case '2':
      if (config.lastResponse) {
        log('\n📄 Last Response:', 'magenta');
        console.log(JSON.stringify(config.lastResponse, null, 2));
      } else {
        log('No previous response', 'yellow');
      }
      break;
    case '3':
      const jsonText = await ask('Enter JSON to format: ');
      try {
        const parsed = JSON.parse(jsonText);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (error) {
        log('Invalid JSON', 'red');
      }
      break;
    case '4':
      try {
        const response = await fetch(config.baseUrl.replace('/api', '/'));
        log(`Connection test: ${response.ok ? 'SUCCESS' : 'FAILED'}`, response.ok ? 'green' : 'red');
      } catch (error) {
        log(`Connection test: FAILED - ${error.message}`, 'red');
      }
      break;
    case '5':
      return;
    default:
      log('Invalid option', 'red');
  }
  
  if (choice !== '5') {
    await utilsMenu();
  }
}

async function mainMenu() {
  log('\n🚀 mdFury API Tester', 'bright');
  log('==================', 'bright');
  log('1. 🔧 Configuration');
  log('2. 🔐 Authentication');
  log('3. 📝 Markdown Management');
  log('4. 🎫 Invite System');
  log('5. 🛠️ Utilities');
  log('6. 🚪 Exit');
  
  const choice = await ask('\nChoose option: ');
  
  switch (choice) {
    case '1':
      await configMenu();
      break;
    case '2':
      await authMenu();
      break;
    case '3':
      await markdownMenu();
      break;
    case '4':
      await inviteMenu();
      break;
    case '5':
      await utilsMenu();
      break;
    case '6':
      log('\nGoodbye! 👋', 'cyan');
      rl.close();
      return;
    default:
      log('Invalid option', 'red');
  }
  
  if (choice !== '6') {
    await mainMenu();
  }
}

// Start the application
async function start() {
  log('🎯 mdFury API Interactive Tester', 'bright');
  log('================================', 'bright');
  
  if (!config.apiToken) {
    log('\n💡 Tip: Set your API token in Configuration for authenticated requests', 'yellow');
  }
  
  await mainMenu();
}

// Handle exit
process.on('SIGINT', () => {
  log('\n\nGoodbye! 👋', 'cyan');
  rl.close();
  process.exit(0);
});

start().catch(console.error);
