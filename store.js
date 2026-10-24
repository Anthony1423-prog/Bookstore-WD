const books = {
  algorithms: { name: 'Algorithms', author: 'Robert Sedgewick', price: 4000, image: 'books/algorithms.svg' },
  os: { name: 'Operating System Concepts', author: 'Abraham Silberschatz', price: 3800, image: 'books/operating-systems.svg' },
  database: { name: 'Database System Concepts', author: 'Abraham Silberschatz', price: 2500, image: 'books/database.svg' },
  circuits: { name: 'Digital Circuits', author: 'M. Morris Mano', price: 1800, image: 'books/circuits.svg' },
  mechanics: { name: 'Engineering Mechanics', author: 'R. K. Bansal', price: 1600, image: 'books/mechanics.svg' }
};
const cartKey = 'glbajaj-cart';
function getCart() { try { return JSON.parse(localStorage.getItem(cartKey) || '{}'); } catch { return {}; } }
function saveCart(cart) { localStorage.setItem(cartKey, JSON.stringify(cart)); updateCount(); }
function updateCount() { const count = Object.values(getCart()).reduce((sum, qty) => sum + qty, 0); document.querySelectorAll('.cart-count').forEach(el => el.textContent = count); }
document.querySelectorAll('.add-to-cart').forEach(button => button.addEventListener('click', () => { const cart = getCart(); cart[button.dataset.id] = (cart[button.dataset.id] || 0) + 1; saveCart(cart); const old = button.textContent; button.textContent = 'Added!'; setTimeout(() => button.textContent = old, 900); }));
function renderCart() {
  const host = document.getElementById('cart-content'); if (!host) return;
  const cart = getCart(); const entries = Object.entries(cart).filter(([id, qty]) => books[id] && qty > 0);
  if (!entries.length) { host.innerHTML = '<p class="empty-cart">Your cart is empty. Browse the catalogue to add a book.</p>'; return; }
  const total = entries.reduce((sum, [id, qty]) => sum + books[id].price * qty, 0);
  host.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead><tbody>${entries.map(([id, qty]) => `<tr><td><img class="cart-cover" src="${books[id].image}" alt="">${books[id].name}</td><td>${books[id].author}</td><td>₹${books[id].price.toLocaleString('en-IN')}</td><td><button class="qty-button" data-action="minus" data-id="${id}" aria-label="Decrease quantity">−</button> ${qty} <button class="qty-button" data-action="plus" data-id="${id}" aria-label="Increase quantity">+</button></td><td>₹${(books[id].price * qty).toLocaleString('en-IN')}</td><td><button class="remove-button" data-action="remove" data-id="${id}">Remove</button></td></tr>`).join('')}</tbody></table></div><h3 class="total">Total: ₹${total.toLocaleString('en-IN')}</h3><button id="checkout">Proceed to Checkout</button>`;
  host.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => { const next = getCart(); const id = button.dataset.id; if (button.dataset.action === 'remove') delete next[id]; else next[id] = Math.max(0, (next[id] || 0) + (button.dataset.action === 'plus' ? 1 : -1)); if (!next[id]) delete next[id]; saveCart(next); renderCart(); }));
  host.querySelector('#checkout').addEventListener('click', () => { alert('Checkout is a demo feature for this lab project. Your cart is ready!'); });
}
updateCount(); renderCart();
