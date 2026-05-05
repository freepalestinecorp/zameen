const fs = require('fs');
const files = ['index.html', 'buy.html', 'sell.html', 'about.html', 'dashboard.html'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace the old Login button with a container for dynamic auth buttons
    // The old button looked like: <button class="btn btn-outline" onclick="toggleModal('loginModal')">Login</button>
    // We will replace it with a div id="auth-nav-container"
    if (content.includes('<button class="btn btn-outline" onclick="toggleModal(\'loginModal\')">Login</button>')) {
      content = content.replace(
        '<button class="btn btn-outline" onclick="toggleModal(\'loginModal\')">Login</button>',
        `<div id="auth-nav-container" style="display: flex; gap: 1rem; align-items: center;">
          <a href="sell.html" class="btn btn-primary" style="padding: 0.5rem 1rem;">List Property</a>
          <button id="nav-login-btn" class="btn btn-outline" style="padding: 0.5rem 1rem;" onclick="toggleModal('loginModal')">Login</button>
        </div>`
      );
    }
    
    fs.writeFileSync(f, content);
  }
});

console.log("Updated navbars in all HTML files.");
