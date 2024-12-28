document.addEventListener('DOMContentLoaded', function() {
    const dessertsContainer = document.querySelector('.desserts-container');
    let data = [];
    let cart = [];

    // Fetch data from JSON file
    fetch('data.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        displayDesserts();
    })
    .catch(error => console.error('Error fetching data:', error));

    // Function to display all desserts
    function displayDesserts() {
        if (data.length > 0) {
            data.forEach((item, index) => {
                let dessert = document.createElement('div');
                dessert.classList.add('single-dessert');
                dessert.innerHTML = `
                    <div class="img-container">
                        <picture>
                            <source srcset="${item.image.desktop}" media="(min-width: 1024px)">
                            <source srcset="${item.image.tablet}" media="(min-width: 768px)">
                            <source srcset="${item.image.mobile}" media="(min-width: 480px)">
                            <img class="dessert-img" src="${item.image.thumbnail}" alt="${item.name}" />
                        </picture>
                        <div class="button-container">
                            <button class="add-to-cart-btn" data-item-index="${index}">
                                <img src="./assets/images/icon-add-to-cart.svg" alt="Add to cart" /> Add to Cart
                            </button>
                        </div>
                    </div>
                    <div class="single-dessert-text">
                        <p class="single-dessert-title">${item.category}</p>
                        <p class="single-dessert-desc">${item.name}</p>
                        <p class="single-dessert-price">$${item.price.toFixed(2)}</p>
                    </div>
                `;
                dessertsContainer.appendChild(dessert);
            });

            // Add event listeners to each "Add to Cart" button
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemIndex = this.dataset.itemIndex;
                    const selectedItem = data[itemIndex];
                    
                    // Add item to cart logic
                    addItemToCart(selectedItem);

                    // Handle button visibility
                    const buttonContainer = this.parentElement;
                    this.style.display = 'none'; // Hide the button
                    
                    // Create quantity buttons and append them
                    const quantityBtn = document.createElement('div');
                    quantityBtn.classList.add('cart-quantity-btns');
                    quantityBtn.innerHTML = `
                        <button class="decrement-quantity">-</button>
                        <p class="quantity">1</p>
                        <button class="increment-quantity">+</button>
                    `;
                    buttonContainer.appendChild(quantityBtn);
                    
                    // Add event listeners to quantity buttons
                    const incrementBtn = quantityBtn.querySelector('.increment-quantity');
                    const decrementBtn = quantityBtn.querySelector('.decrement-quantity');
                    const quantityElement = quantityBtn.querySelector('.quantity');

                    let quantity = 1; // Start with quantity 1 since it's just added to cart
                    
                    incrementBtn.addEventListener('click', function() {
                        quantity++;
                        quantityElement.textContent = quantity;
                        updateCartQuantity(selectedItem, quantity);
                    });

                    decrementBtn.addEventListener('click', function() {
                        if (quantity > 1) {
                            quantity--;
                            quantityElement.textContent = quantity;
                            updateCartQuantity(selectedItem, quantity);
                        } else {
                            removeItemFromCart(selectedItem);
                            quantityBtn.remove(); // Remove quantity controls
                            buttonContainer.querySelector('.add-to-cart-btn').style.display = 'flex'; // Show "Add to Cart" button
                        }
                    });
                });
            });
        }
    }

    // Function to add item to the cart
    function addItemToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            // Assign a unique ID using the name
            cart.push({ ...item, quantity: 1, id: item.name });
        }

        updateCart(cart);
    }

    // Function to remove an item from the cart
    function removeItemFromCart(item) {
        cart = cart.filter(cartItem => cartItem.id !== item.name); // Use name as ID
        updateCart(cart);
    }

    // Function to update the cart display
    function updateCart(items) {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartImageContainer = document.querySelector('.cart-img-container');
        const cartCountElement = document.querySelector('.cart-container h3');

        if (items.length === 0) {
            cartItemsContainer.innerHTML = `<div class="cart-img-container">
				<img src='./assets/images/illustration-empty-cart.svg' alt="Empty cart" />
				<p class="cart-img-title">Your added items will appear here</p>
			</div>`;
            cartCountElement.innerHTML = 'Your Cart (0)';
        } else {
            cartImageContainer.innerHTML = '';
            cartCountElement.innerHTML = `Your Cart (${items.length})`;

            let totalPrice = 0;
            cartItemsContainer.innerHTML = '';

            items.forEach(item => {
                const itemTotalPrice = (item.price * item.quantity).toFixed(2);
                totalPrice += parseFloat(itemTotalPrice);

                const cartItemHTML = `
                    <div class="single-cart-item" data-item-id="${item.name}">
                        <div class="single-cart-text">
                            <p class="single-cart-title">${item.name}</p>
                            <div class="single-cart-data">
                                <p class="single-cart-quantity">${item.quantity}x</p>
                                <p class="single-cart-price">@${item.price.toFixed(2)}</p>
                                <p class="single-cart-total-price">$${itemTotalPrice}</p>
                            </div>
                        </div>
                        <div class="delete-cart-item">
                            <img src="./assets/images/icon-remove-item.svg" alt="remove cart item" />
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;
            });

            const totalOrderHTML = `
                <div class="total-order-container">
                    <p>Order total</p>
                    <p class="total-price">$${totalPrice.toFixed(2)}</p>
                </div>
                <div class="carbon-neutral-container">
                    <p><img src="./assets/images/icon-carbon-neutral.svg" alt="carbon image" />This is <strong>carbon-neutral</strong> delivery.</p>
                </div>
                <button class="confirm-order">Confirm Order</button>
            `;
            cartItemsContainer.innerHTML += totalOrderHTML;
			
            // Add event listener to each delete button
            document.querySelectorAll('.delete-cart-item').forEach(button => {
                button.addEventListener('click', function() {
                    const itemId = this.closest('.single-cart-item').dataset.itemId;
                    const item = cart.find(cartItem => cartItem.id === itemId);
                    if (item) {
                        removeItemFromCart(item);
                    }
                });
            });
			
			// Confirm order
document.querySelector('.confirm-order').addEventListener('click', function() {
    const modalOverlay = document.querySelector('.modal-overlay');
    
    // Clear any previous modal container if it exists
    const existingModalContainer = document.querySelector('.modal-container');
    if (existingModalContainer) {
        existingModalContainer.remove(); // Remove any previous content
    }
    
    // Ensure cart is not empty
    if (cart.length === 0) {
        console.log('Cart is empty, no order to confirm.');
        return; // Don't show the modal if the cart is empty
    }

    // Create a new modal container
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // Generate HTML for cart items
    let cartHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        
        // Ensure that only valid items are added to the modal
        if (item.name && item.quantity) {
            cartHTML += `
            <div class="modal-cart-item">
                <img class="dessert-img" src="${item.image.thumbnail}" alt="${item.name}" />
                <div class="confirmed-cart-text">
                  <div class="confirmed-cart-price">
                    <p>${item.name}</p>
                    <div class="confirmed-cart-quantity">
                        <p>${item.quantity}x</p>
                        <p>@$${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
            `;
        }
    });

    // Add the cart items and total price to the modal content
    modalContainer.innerHTML = `
    <img src="./assets/images/icon-order-confirmed.svg" alt="Confirm sign"/>
    <div class="confirm-order-title">
        <h3>Order Confirmed</h3>
        <p>We hope you enjoy your food!</p>
    </div>
    <div class="modal-cart-items">
        ${cartHTML}
        <div class="modal-total-order-container">
            <p>Order Total</p>
            <p>$${totalPrice.toFixed(2)}</p>
        </div>
    </div>
    <button class="start-new-btn">Start new order</button>
    `;

    // Append the modal container to the modal overlay
    modalOverlay.appendChild(modalContainer);

    // Open the modal
    modalOverlay.classList.add('open-modal');

    // Handle closing the modal and resetting the cart and buttons
    document.querySelector('.start-new-btn').addEventListener('click', function() {
        modalOverlay.classList.remove('open-modal');
        modalOverlay.innerHTML = ''; // Clear the modal content

        // Clear the cart
        cart = [];
        updateCart(cart); // Reset the cart display

        // Reset activated buttons
        document.querySelectorAll('.cart-quantity-btns').forEach(qtyBtn => {
            const btnContainer = qtyBtn.parentElement;
            qtyBtn.remove(); // Remove quantity buttons
            btnContainer.querySelector('.add-to-cart-btn').style.display = 'block'; // Show Add to Cart buttons
        });
    });
});



        }
    }
	// Function to update item quantity in the cart
function updateCartQuantity(item, newQuantity) {
    const cartItem = cart.find(cartItem => cartItem.name === item.name);

    if (cartItem) {
        cartItem.quantity = newQuantity; // Update the quantity in the cart
    }

    updateCart(cart); // Refresh the cart display with the updated quantity
}
});
