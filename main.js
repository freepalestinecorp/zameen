// Global scripts for Zameen Real Estate Portal

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://hykxvbjbcecbwpavhqov.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a3h2YmpiY2VjYndwYXZocW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDI5MjYsImV4cCI6MjA5MzM3ODkyNn0.KEWGERNXe5UBUf-ORjumW49E5HI9z8txQA9wuy7aljw';

// Initialize Supabase and attach to window
let sb = null;
if (window.supabase) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.sb = sb;
  console.log('Supabase client initialized');

  // Connection Health Check
  fetch(`${SUPABASE_URL}/rest/v1/`, { headers: { 'apikey': SUPABASE_ANON_KEY } })
    .then(res => {
      if (res.status === 404) {
        console.error('Supabase Error: API NOT FOUND. Check your Project URL in main.js.');
        alert('Supabase API Not Found! Your project might be paused or the ID is incorrect.');
      } else if (res.status === 401) {
        console.error('Supabase Error: Invalid API Key.');
      } else {
        console.log('Supabase connection verified');
      }
    })
    .catch(err => console.error('Supabase Connection Failed:', err));
} else {
  console.error('Supabase CDN not loaded!');
}

const initMain = async () => {
  console.log("Main Scripts Loaded");
  // Handle Loader if it exists on the page
  const loader = document.getElementById('loader-wrapper');
  if (loader) {
    // Faster fade out
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }, 500); 
  }

  // Active link highlighting
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentFile = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentFile) {
      link.classList.add('active');
    }
  });

  // Inject Dynamic Auth Modal
  injectAuthModal();

  // Dashboard Protection & Navbar State
  const authNavContainer = document.getElementById('auth-nav-container');
  const loginBtn = document.getElementById('nav-login-btn');
  
  if (sb) {
    try {
      const { data: { session }, error } = await sb.auth.getSession();
      
      // Update Navbar
      if (session) {
        if (loginBtn) {
          const name = session.user.user_metadata?.full_name || session.user.email;
          loginBtn.innerText = 'Sign Out (' + name + ')';
          loginBtn.onclick = async () => {
            await sb.auth.signOut();
            window.location.reload();
          };
        }
      }

      // Protect dashboard
      if (currentFile === 'dashboard.html') {
        const dashContainer = document.querySelector('.dash-container');
        if (dashContainer) dashContainer.style.display = 'none'; // Hide until verified
        
        if (!session || error) {
          alert("You must be logged in to access the Dashboard. Please Sign In or Sign Up.");
          window.location.href = 'index.html';
        } else {
          if (dashContainer) dashContainer.style.display = '';
          // Optionally fetch user properties for dashboard here
        }
      }
    } catch (e) {
      console.error("Supabase not configured properly yet.", e);
      if (currentFile === 'dashboard.html') {
        alert("Supabase is not configured yet. Dashboard is locked.");
        window.location.href = 'index.html';
      }
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}

/**
 * Toggle Modal Visibility
 */
window.toggleModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
};

/**
 * Inject Auth Modal HTML dynamically so we don't have to duplicate it.
 */
function injectAuthModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="toggleModal('loginModal')">&times;</button>
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: center;">
          <button id="tab-login" onclick="switchAuthTab('login')" style="border:none; background:none; font-size: 1.2rem; font-weight: bold; cursor: pointer; color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 0.25rem;">Login</button>
          <button id="tab-signup" onclick="switchAuthTab('signup')" style="border:none; background:none; font-size: 1.2rem; font-weight: bold; cursor: pointer; color: var(--text-muted); padding-bottom: 0.25rem;">Sign Up</button>
        </div>
        <form id="auth-form" onsubmit="handleAuth(event)">
          <div class="form-group" id="group-fullname" style="display: none;">
            <label>Full Name</label>
            <input type="text" id="auth-fullname" class="form-control">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="auth-email" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="auth-password" class="form-control" required>
          </div>
          <p id="auth-error" style="color: red; font-size: 0.85rem; display: none; margin-bottom: 1rem;"></p>
          <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width: 100%;">Login</button>
        </form>
      </div>
    `;
  }
}

let currentAuthMode = 'login';
window.switchAuthTab = function(mode) {
  currentAuthMode = mode;
  document.getElementById('tab-login').style.color = mode === 'login' ? 'var(--primary)' : 'var(--text-muted)';
  document.getElementById('tab-login').style.borderBottom = mode === 'login' ? '2px solid var(--primary)' : 'none';
  
  document.getElementById('tab-signup').style.color = mode === 'signup' ? 'var(--primary)' : 'var(--text-muted)';
  document.getElementById('tab-signup').style.borderBottom = mode === 'signup' ? '2px solid var(--primary)' : 'none';
  
  document.getElementById('group-fullname').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-fullname').required = mode === 'signup';
  
  document.getElementById('auth-submit-btn').innerText = mode === 'login' ? 'Login' : 'Sign Up';
  document.getElementById('auth-error').style.display = 'none';
};

window.handleAuth = async function(e) {
  e.preventDefault();
  
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    alert("Please provide your Supabase Credentials in main.js first!");
    return;
  }

  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const fullName = document.getElementById('auth-fullname').value;
  const errorEl = document.getElementById('auth-error');
  errorEl.style.display = 'none';

  // Set loading state
  const btn = document.getElementById('auth-submit-btn');
  const originalText = btn.innerText;
  btn.innerText = 'Processing...';
  btn.disabled = true;

  try {
    if (currentAuthMode === 'signup') {
      const { data, error } = await sb.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;

      if (!data.session) {
        // This happens if email confirmations are enabled in Supabase.
        alert("Sign up successful! Please check your email to verify your account. Note: Your user data is stored securely in the Supabase Authentication section, not in the public tables.");
        window.location.reload(); // Stay on page and let them verify
      } else {
        alert("Sign up successful! Welcome aboard. Your details are securely stored in Supabase Authentication.");
        window.location.href = 'dashboard.html';
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
         if (error.message === 'Invalid login credentials') {
             throw new Error("Invalid login credentials. If you just signed up, please check your email and verify your account first. Or make sure you have created an account using the Sign Up tab.");
         }
         throw error;
      }
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    errorEl.innerText = err.message;
    errorEl.style.display = 'block';
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
};

// ==========================================
// PROPERTY LISTING & FETCHING
// ==========================================

window.submitProperty = async function(e) {
  e.preventDefault();
  
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    alert("You must be logged in to post a property.");
    toggleModal('loginModal');
    return;
  }

  const btn = document.getElementById('submit-prop-btn');
  const originalText = btn.innerText;
  btn.innerText = 'Uploading...';
  btn.disabled = true;

  try {
    const purpose = document.getElementById('prop-purpose').value;
    const type = document.getElementById('prop-type').value;
    const city = document.getElementById('prop-city').value;
    const location = document.getElementById('prop-location').value;
    const title = document.getElementById('prop-title').value;
    const price = document.getElementById('prop-price').value;
    const desc = document.getElementById('prop-desc').value;
    const publisherName = session.user.user_metadata?.full_name || session.user.email;
    const publisherPhone = session.user.user_metadata?.phone || '';
    const lockPhone = session.user.user_metadata?.lock_phone || false;
    const lockEmail = session.user.user_metadata?.lock_email || false;
    
    // Upload images (up to 10)
    const imageInput = document.getElementById('prop-image');
    let uploadedUrls = [];
    
    if (imageInput.files && imageInput.files.length > 0) {
      const filesToUpload = Array.from(imageInput.files).slice(0, 10); // Max 10
      
      for (let file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        const { error: uploadError } = await sb.storage.from('property-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = sb.storage.from('property-images').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }
    }
    
    const imageUrlString = uploadedUrls.join(',');

    // Insert into database
    const { data, error } = await sb.from('properties').insert([
      {
        user_id: session.user.id,
        purpose,
        property_type: type,
        city,
        location,
        title,
        price,
        description: desc,
        image_url: imageUrlString,
        publisher_name: publisherName,
        publisher_phone: publisherPhone,
        publisher_email: session.user.email,
        lock_phone: lockPhone,
        lock_email: lockEmail
      }
    ]);

    if (error) throw error;

    alert("Property listed successfully!");
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    alert("Error posting property: " + err.message);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
};

window.fetchAndRenderProperties = async function(containerId, filters = {}) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  try {
    let query = sb.from('properties').select('*').order('id', { ascending: false });
    
    if (filters.purpose) {
      query = query.eq('purpose', filters.purpose);
    }
    
    const { data: properties, error } = await query;
    if (error) throw error;

    if (properties.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">No properties found. Be the first to list one!</p>';
      return;
    }

    grid.innerHTML = properties.map(prop => {
      // Get first image from comma separated list
      const firstImage = prop.image_url ? prop.image_url.split(',')[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3';
      return `
      <article class="property-card" onclick="window.location.href='property.html?id=${prop.id}'">
        <div class="card-img-wrapper">
          <span class="badge">${prop.purpose === 'Sell' ? 'For Sale' : 'For Rent'}</span>
          <img src="${firstImage}" alt="${prop.title}" loading="lazy">
          <div class="card-overlay">
            <span>View Details</span>
          </div>
        </div>
        <div class="card-content">
          <div class="price">PKR ${Number(prop.price).toLocaleString()}</div>
          <h3 class="title">${prop.title}</h3>
          <div class="location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${prop.location}, ${prop.city}
          </div>
          <div class="features">
            <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                ${prop.property_type}
            </span>
            <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-light); font-weight: 600;">
                Agent: ${prop.publisher_name ? prop.publisher_name.split(' ')[0] : 'Verified'}
            </span>
          </div>
        </div>
      </article>
    `}).join('');
  } catch (err) {
    console.error("Error fetching properties:", err);
  }
};

window.fetchAndRenderUserProperties = async function(containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  try {
    const { data: { session } } = await sb.auth.getSession();
    if(!session) return;
    
    const { data: properties, error } = await sb.from('properties').select('*').eq('user_id', session.user.id).order('id', { ascending: false });
    if (error) throw error;

    // Update Dashboard Stats dynamically
    const activeListingsEl = document.getElementById('stat-active-listings');
    if (activeListingsEl) activeListingsEl.innerText = properties.length;
    
    const totalViewsEl = document.getElementById('stat-total-views');
    if (totalViewsEl) {
      const sumViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
      totalViewsEl.innerText = sumViews;
    }

    if (properties.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted);">You have not listed any properties yet.</p>';
      return;
    }

    grid.innerHTML = properties.map(prop => {
      const firstImage = prop.image_url ? prop.image_url.split(',')[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3';
      return `
      <div style="display:flex; gap: 1rem; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
        <img src="${firstImage}" style="width: 100px; height: 80px; object-fit: cover; border-radius: var(--radius-sm);">
        <div>
          <h4 style="margin:0;">${prop.title}</h4>
          <div style="color: var(--primary); font-weight: bold;">PKR ${Number(prop.price).toLocaleString()}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${prop.city} | ${prop.property_type}</div>
        </div>
      </div>
    `}).join('');
  } catch (err) {
    console.error("Error fetching user properties:", err);
  }
};

// ==========================================
// SETTINGS & PROFILE
// ==========================================

window.loadSettings = async function() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;

  const user = session.user;
  document.getElementById('settings-email').value = user.email || '';
  document.getElementById('settings-name').value = user.user_metadata?.full_name || '';
  document.getElementById('settings-phone').value = user.user_metadata?.phone || '';
  document.getElementById('settings-bio').value = user.user_metadata?.bio || '';
  document.getElementById('settings-lock-phone').checked = user.user_metadata?.lock_phone || false;
  document.getElementById('settings-lock-email').checked = user.user_metadata?.lock_email || false;
};

window.saveSettings = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('settings-btn');
  const msg = document.getElementById('settings-msg');
  const originalText = btn.innerText;
  
  btn.innerText = 'Saving...';
  btn.disabled = true;
  msg.innerText = '';
  msg.style.color = '';

  try {
    const full_name = document.getElementById('settings-name').value;
    const phone = document.getElementById('settings-phone').value;
    const bio = document.getElementById('settings-bio').value;
    const lock_phone = document.getElementById('settings-lock-phone').checked;
    const lock_email = document.getElementById('settings-lock-email').checked;

    const { data, error } = await sb.auth.updateUser({
      data: { full_name, phone, bio, lock_phone, lock_email }
    });

    if (error) throw error;

    // Also update all existing properties of this user to reflect new privacy settings
    await sb.from('properties')
      .update({ 
        publisher_phone: phone, 
        lock_phone: lock_phone,
        lock_email: lock_email 
      })
      .eq('user_id', session.user.id);

    msg.style.color = 'green';
    msg.innerText = 'Settings saved successfully!';
    
    // Update navbar name immediately
    const loginBtn = document.getElementById('nav-login-btn');
    if (loginBtn) {
      loginBtn.innerText = 'Sign Out (' + full_name + ')';
    }
  } catch (err) {
    console.error(err);
    msg.style.color = 'red';
    msg.innerText = 'Error: ' + err.message;
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
};
