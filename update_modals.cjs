const fs = require('fs');
const files = ['buy.html', 'sell.html', 'about.html', 'dashboard.html'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Check if loginModal already exists
    if (!content.includes('id="loginModal"')) {
      // Find a good place to insert it, like right before the closing body tag or right after the navbar
      // Since <main> is used, let's inject it right before <main>
      if (content.includes('<main')) {
        content = content.replace('<main', '<!-- Login Modal -->\n  <div class="modal-overlay" id="loginModal" style="display:none;"></div>\n\n  <main');
      } else {
        content = content.replace('</body>', '<!-- Login Modal -->\n  <div class="modal-overlay" id="loginModal" style="display:none;"></div>\n</body>');
      }
      fs.writeFileSync(f, content);
      console.log(`Added loginModal to ${f}`);
    } else {
      console.log(`${f} already has loginModal`);
    }
  }
});
