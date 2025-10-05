// Variables globales
let productsList = [];
let editingProductId = null;
const storageKey = 'burgasProducts';

// Elementos del DOM
document.addEventListener('DOMContentLoaded', () => {
  const productForm = document.getElementById('product-form');
  const productImage = document.getElementById('product-image');
  const imagePreview = document.getElementById('image-preview');
  const btnClear = document.getElementById('btn-clear');
  const productsList = document.getElementById('products-list');

  // Cargar productos guardados
  loadProducts();

  // Event listeners
  productImage.addEventListener('change', handleImagePreview);
  productForm.addEventListener('submit', handleFormSubmit);
  btnClear.addEventListener('click', clearForm);
});

// Función para manejar la vista previa de la imagen
function handleImagePreview(event) {
  const imagePreview = document.getElementById('image-preview');
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      // Limpiar el contenido actual
      imagePreview.innerHTML = '';
      
      // Crear elemento de imagen
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Vista previa';
      
      // Añadir la imagen al contenedor
      imagePreview.appendChild(img);
      imagePreview.classList.add('has-image');
    };
    
    reader.readAsDataURL(file);
  } else {
    // Restaurar el mensaje predeterminado si no hay archivo
    imagePreview.innerHTML = '<p>Vista previa de la imagen</p>';
    imagePreview.classList.remove('has-image');
  }
}

// Función para manejar el envío del formulario
function handleFormSubmit(event) {
  event.preventDefault();
  
  // Obtener valores del formulario
  const productImage = document.getElementById('product-image');
  const productName = document.getElementById('product-name').value.trim();
  const productDescription = document.getElementById('product-description').value.trim();
  const productPrice = parseFloat(document.getElementById('product-price').value);
  const productCategory = document.getElementById('product-category').value;
  
  // Validación básica
  if (!productName || !productDescription || isNaN(productPrice) || !productCategory) {
    alert('Por favor, completa todos los campos requeridos.');
    return;
  }
  
  // Verificar si hay una imagen seleccionada
  if (!productImage.files[0] && !editingProductId) {
    alert('Por favor, selecciona una imagen para el producto.');
    return;
  }
  
  // Procesar la imagen
  const file = productImage.files[0];
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const imageData = e.target.result;
      
      // Crear o actualizar producto
      saveProduct({
        id: editingProductId || Date.now().toString(),
        name: productName,
        description: productDescription,
        price: productPrice,
        category: productCategory,
        image: imageData
      });
      
      // Limpiar formulario
      clearForm();
    };
    
    reader.readAsDataURL(file);
  } else if (editingProductId) {
    // Si estamos editando y no se seleccionó una nueva imagen, mantener la imagen anterior
    const existingProduct = productsList.find(p => p.id === editingProductId);
    
    saveProduct({
      id: editingProductId,
      name: productName,
      description: productDescription,
      price: productPrice,
      category: productCategory,
      image: existingProduct.image
    });
    
    // Limpiar formulario
    clearForm();
  }
}

// Función para guardar un producto
function saveProduct(product) {
  // Verificar si estamos editando o creando
  if (editingProductId) {
    // Actualizar producto existente
    const index = productsList.findIndex(p => p.id === editingProductId);
    if (index !== -1) {
      productsList[index] = product;
    }
    editingProductId = null;
  } else {
    // Añadir nuevo producto
    productsList.push(product);
  }
  
  // Guardar en localStorage
  localStorage.setItem(storageKey, JSON.stringify(productsList));
  
  // Actualizar la interfaz
  renderProductsList();
  
  // Mostrar mensaje de éxito
  alert(editingProductId ? 'Producto actualizado correctamente.' : 'Producto guardado correctamente.');
}

// Función para cargar productos desde localStorage
function loadProducts() {
  const savedProducts = localStorage.getItem(storageKey);
  if (savedProducts) {
    productsList = JSON.parse(savedProducts);
    renderProductsList();
  }
}

// Función para renderizar la lista de productos
function renderProductsList() {
  const productsListElement = document.getElementById('products-list');
  
  // Limpiar la lista actual
  productsListElement.innerHTML = '';
  
  if (productsList.length === 0) {
    productsListElement.innerHTML = '<p class="empty-message">No hay productos guardados</p>';
    return;
  }
  
  // Renderizar cada producto
  productsList.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-card-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-card-content">
        <h4 class="product-card-title">${product.name}</h4>
        <p class="product-card-description">${product.description}</p>
        <p class="product-card-price">$${product.price.toFixed(2)}</p>
        <div class="product-card-actions">
          <button class="btn-edit" data-id="${product.id}">Editar</button>
          <button class="btn-delete" data-id="${product.id}">Eliminar</button>
        </div>
      </div>
    `;
    
    productsListElement.appendChild(productCard);
    
    // Añadir event listeners a los botones
    const editButton = productCard.querySelector('.btn-edit');
    const deleteButton = productCard.querySelector('.btn-delete');
    
    editButton.addEventListener('click', () => editProduct(product.id));
    deleteButton.addEventListener('click', () => deleteProduct(product.id));
  });
}

// Función para editar un producto
function editProduct(productId) {
  const product = productsList.find(p => p.id === productId);
  if (!product) return;
  
  // Establecer el ID del producto que se está editando
  editingProductId = productId;
  
  // Rellenar el formulario con los datos del producto
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-category').value = product.category;
  
  // Mostrar la imagen actual
  const imagePreview = document.getElementById('image-preview');
  imagePreview.innerHTML = '';
  const img = document.createElement('img');
  img.src = product.image;
  img.alt = 'Vista previa';
  imagePreview.appendChild(img);
  imagePreview.classList.add('has-image');
  
  // Cambiar el texto del botón de guardar
  const submitButton = document.querySelector('.btn-save');
  submitButton.textContent = 'Actualizar Producto';
  
  // Desplazarse hasta el formulario
  document.querySelector('.product-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Función para eliminar un producto
function deleteProduct(productId) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    productsList = productsList.filter(p => p.id !== productId);
    localStorage.setItem(storageKey, JSON.stringify(productsList));
    renderProductsList();
    
    // Si estábamos editando este producto, limpiar el formulario
    if (editingProductId === productId) {
      clearForm();
    }
  }
}

// Función para limpiar el formulario
function clearForm() {
  document.getElementById('product-form').reset();
  
  // Restaurar la vista previa de la imagen
  const imagePreview = document.getElementById('image-preview');
  imagePreview.innerHTML = '<p>Vista previa de la imagen</p>';
  imagePreview.classList.remove('has-image');
  
  // Restaurar el texto del botón de guardar
  const submitButton = document.querySelector('.btn-save');
  submitButton.textContent = 'Guardar Producto';
  
  // Resetear el ID del producto en edición
  editingProductId = null;
}