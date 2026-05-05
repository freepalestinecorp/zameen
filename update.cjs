const fs = require('fs');
const files = ['index.html', 'buy.html', 'sell.html', 'about.html', 'dashboard.html'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Add supabase script if missing
    if (!content.includes('@supabase/supabase-js')) {
      content = content.replace('<script src="./main.js"></script>', '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n  <script src="./main.js"></script>');
    }
    
    fs.writeFileSync(f, content);
  }
});

console.log("Updated HTML files with Supabase script.");
