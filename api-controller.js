const readline = require('readline');

const API_TOKEN = 'mdf_64f66a2a90edd4733228c8aabac01c92c63fe47343ea7bde7cdaa27c23b6a3ce';
const BASE_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// API Request function
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  if (options.noAuth) {
    delete defaultHeaders['Authorization'];
  }

  const config = {
    method: 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

// Display response
function displayResponse(result, operation) {
  log(`\n=== ${operation} Response ===`, 'cyan');
  log(`Status: ${result.status}`, result.ok ? 'green' : 'red');
  log(`Success: ${result.ok}`, result.ok ? 'green' : 'red');
  
  if (result.data) {
    log('Response Data:', 'yellow');
    console.log(JSON.stringify(result.data, null, 2));
  }
  
  if (result.error) {
    log(`Error: ${result.error}`, 'red');
  }
  log('='.repeat(50), 'cyan');
}

// API Operations
async function getUserMarkdowns() {
  log('\n🔍 Getting user markdowns...', 'blue');
  const result = await apiRequest('/markdowns');
  displayResponse(result, 'Get User Markdowns');
  
  // Show a helpful summary
  if (result.ok && result.data.markdowns) {
    log('\n📋 Quick Reference:', 'yellow');
    result.data.markdowns.forEach((doc, index) => {
      const privacy = doc.isPublic ? 
        (doc.password ? '🔒 Password Protected' : '🌍 Public') : 
        '🔐 Private';
      log(`${index + 1}. "${doc.title}" - ID: ${doc.id} - BinID: ${doc.binId} - ${privacy}`, 'cyan');
    });
  }
  
  return result;
}

async function createMarkdown() {
  log('\n📝 Creating new markdown...', 'blue');
  
  const title = await ask('Enter title: ');
  const content = await ask('Enter content: ');
  const isPrivate = await ask('Private? (y/n): ');
  const password = await ask('Password (leave empty for none): ');
  
  const data = {
    title: title || 'Untitled Document',
    content: content || '# New Document',
    isPublic: isPrivate.toLowerCase() !== 'y'  // Convert isPrivate to isPublic
  };
  
  // Only add password if it's not empty
  if (password && password.trim()) {
    data.password = password.trim();
  }
  
  const result = await apiRequest('/markdowns', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  displayResponse(result, 'Create Markdown');
  return result;
}

async function getPublicMarkdown() {
  log('\n🌍 Getting public markdown...', 'blue');
  
  const binId = await ask('Enter binId: ');
  const password = await ask('Password (optional): ');
  const useAuth = await ask('Use authentication? (y/n): ');
  
  const endpoint = password ? 
    `/public/${binId}?password=${encodeURIComponent(password)}` : 
    `/public/${binId}`;
  
  const options = useAuth.toLowerCase() === 'n' ? { noAuth: true } : {};
  
  const result = await apiRequest(endpoint, options);
  displayResponse(result, 'Get Public Markdown');
  return result;
}

async function updateMarkdown() {
  log('\n✏️  Updating markdown...', 'blue');
  
  const id = await ask('Enter document ID (not binId): ');
  log('\n📝 What would you like to update?', 'yellow');
  const title = await ask('New title (leave empty to keep current): ');
  const content = await ask('New content (leave empty to keep current): ');
  const isPrivate = await ask('Change privacy? (y=private, n=public, skip=no change): ');
  const passwordAction = await ask('Password action? (set/remove/skip): ');
  
  const data = {};
  if (title.trim()) data.title = title.trim();
  if (content.trim()) data.content = content.trim();
  
  // Handle privacy setting
  if (isPrivate === 'y') {
    data.isPublic = false;  // Private means isPublic = false
  } else if (isPrivate === 'n') {
    data.isPublic = true;   // Public means isPublic = true
  }
  
  // Handle password setting
  if (passwordAction === 'set') {
    const newPassword = await ask('Enter new password: ');
    if (newPassword.trim()) {
      data.password = newPassword.trim();
      // If setting password, document must be public
      data.isPublic = true;
      log('ℹ️  Setting password requires document to be public', 'yellow');
    }
  } else if (passwordAction === 'remove') {
    data.password = null;
    log('ℹ️  Password will be removed', 'yellow');
  }
  
  if (Object.keys(data).length === 0) {
    log('No changes specified!', 'yellow');
    return;
  }
  
  log('\n🔍 Sending update request with data:', 'blue');
  console.log(JSON.stringify(data, null, 2));
  
  const result = await apiRequest(`/markdowns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  displayResponse(result, 'Update Markdown');
  return result;
}

async function deleteMarkdown() {
  log('\n🗑️  Deleting markdown...', 'blue');
  
  const id = await ask('Enter document ID to delete: ');
  const confirm = await ask(`Are you sure you want to delete "${id}"? (yes/no): `);
  
  if (confirm.toLowerCase() !== 'yes') {
    log('Delete cancelled.', 'yellow');
    return;
  }
  
  const result = await apiRequest(`/markdowns/${id}`, {
    method: 'DELETE'
  });
  
  displayResponse(result, 'Delete Markdown');
  return result;
}

async function testAuthentication() {
  log('\n🔐 Testing authentication...', 'blue');
  
  log('\n1. Testing with valid token:', 'yellow');
  const validResult = await apiRequest('/markdowns');
  displayResponse(validResult, 'Valid Token Test');
  
  log('\n2. Testing with invalid token:', 'yellow');
  const invalidResult = await apiRequest('/markdowns', {
    headers: { 'Authorization': 'Bearer invalid_token_123' }
  });
  displayResponse(invalidResult, 'Invalid Token Test');
  
  log('\n3. Testing without token:', 'yellow');
  const noTokenResult = await apiRequest('/markdowns', { noAuth: true });
  displayResponse(noTokenResult, 'No Token Test');
}

async function customRequest() {
  log('\n⚡ Custom API request...', 'blue');
  
  const method = await ask('HTTP method (GET/POST/PUT/DELETE): ');
  const endpoint = await ask('Endpoint (e.g., /markdowns, /public/binId): ');
  const useAuth = await ask('Use authentication? (y/n): ');
  const hasBody = ['POST', 'PUT'].includes(method.toUpperCase()) ? 
    await ask('Include request body? (y/n): ') : 'n';
  
  let body = null;
  if (hasBody.toLowerCase() === 'y') {
    const bodyStr = await ask('Request body (JSON): ');
    try {
      body = bodyStr ? bodyStr : null;
    } catch (error) {
      log('Invalid JSON, sending as string', 'yellow');
      body = bodyStr;
    }
  }
  
  const options = {
    method: method.toUpperCase(),
    ...(useAuth.toLowerCase() === 'n' && { noAuth: true }),
    ...(body && { body })
  };
  
  const result = await apiRequest(endpoint, options);
  displayResponse(result, 'Custom Request');
  return result;
}

// Main menu
async function showMenu() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 mdFury API Interactive Controller', 'bright');
  log('='.repeat(60), 'cyan');
  log('Current API Token: ' + API_TOKEN.substring(0, 20) + '...', 'magenta');
  log('Base URL: ' + BASE_URL, 'magenta');
  log('='.repeat(60), 'cyan');
  
  log('\n📋 Available Operations:', 'bright');
  log('1. 📄 Get User Markdowns', 'green');
  log('2. ➕ Create New Markdown', 'green');
  log('3. 🌍 Get Public Markdown', 'green');
  log('4. ✏️  Update Markdown', 'green');
  log('5. 🗑️  Delete Markdown', 'green');
  log('6. 🔐 Test Authentication', 'green');
  log('7. ⚡ Custom API Request', 'green');
  log('8. 🔄 Refresh Menu', 'green');
  log('9. ❌ Exit', 'red');
  
  const choice = await ask('\nEnter your choice (1-9): ');
  
  switch (choice) {
    case '1':
      await getUserMarkdowns();
      break;
    case '2':
      await createMarkdown();
      break;
    case '3':
      await getPublicMarkdown();
      break;
    case '4':
      await updateMarkdown();
      break;
    case '5':
      await deleteMarkdown();
      break;
    case '6':
      await testAuthentication();
      break;
    case '7':
      await customRequest();
      break;
    case '8':
      // Just refresh menu
      break;
    case '9':
      log('\n👋 Goodbye!', 'green');
      rl.close();
      return false;
    default:
      log('\n❌ Invalid choice. Please try again.', 'red');
  }
  
  return true;
}

// Main loop
async function main() {
  log('🎯 Starting mdFury API Interactive Controller...', 'green');
  
  // Test connection
  log('\n🔍 Testing API connection...', 'yellow');
  const testResult = await apiRequest('/markdowns');
  
  if (!testResult.ok && testResult.status !== 401) {
    log('❌ Cannot connect to API server!', 'red');
    log('Make sure the mdFury server is running on http://localhost:3000', 'yellow');
    rl.close();
    return;
  }
  
  log('✅ API connection successful!', 'green');
  
  // Main loop
  let running = true;
  while (running) {
    running = await showMenu();
    
    if (running) {
      const continueChoice = await ask('\nPress Enter to continue or "q" to quit: ');
      if (continueChoice.toLowerCase() === 'q') {
        log('\n👋 Goodbye!', 'green');
        break;
      }
    }
  }
  
  rl.close();
}

// Handle CTRL+C
process.on('SIGINT', () => {
  log('\n\n👋 Goodbye!', 'green');
  rl.close();
  process.exit(0);
});

// Start the application
main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
