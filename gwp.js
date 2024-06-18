class GiftWithProduct extends HTMLElement {
  constructor(){
    super()
    this.gwpForms = this.querySelector('form');
    this.gwpForms.addEventListener("change",(event)=>{
      //Get the last selected offer product from session storage
      //Update or Create new data
      const gwp_data = JSON.parse(sessionStorage.getItem('gwp_data')) || []
      if(gwp_data.length > 0){
        const existingObject = gwp_data.find(obj => obj.id === event.target.dataset.offer);
        if (existingObject) {
          //Update the offer data
          existingObject.selected = event.target.id;
        } else {
          //Create the offer data
          gwp_data.push({ id: event.target.dataset.offer, selected: event.target.id });
        }
      }else{
        //Create session storage and create the offer data
        gwp_data.push({ id: event.target.dataset.offer, selected: event.target.id });
      }
      // sessionStorage.setItem('gwp_data',JSON.stringify(gwp_data))
    })
    
    let checkoutButton = document.querySelector('button[name="checkout"][type="submit"]');
    checkoutButton.closest('form').addEventListener('submit',(event)=>{
      event.preventDefault()
      this.handleCheckout()
    });
  }

  //Select previosly selected product on reload
  selectOfferProducts(){
    const gwp_data = JSON.parse(sessionStorage.getItem('gwp_data')) || []
    if(gwp_data.length > 0){
      gwp_data.forEach((offer)=>{
        if(this.querySelector('input[data-offer="'+offer.id+'"][value="'+offer.selected+'"]')){
          this.querySelector('input[data-offer="'+offer.id+'"][value="'+offer.selected+'"]').checked = true
          this.querySelector('input[data-offer="'+offer.id+'"][value="'+offer.selected+'"]').checked = true
        }
      })
    }
  }

  //Handle event when user click on checkout
  //Checks and calls the add Offer product function
  async handleCheckout(){
    let cartData = await fetch('/cart.js').then((res)=> res.json()).then((data)=> data);
    let cartItems = cartData.items.map((item)=> item.id);
    let formData = Array.from(this.gwpForms.querySelectorAll('input[type="checkbox"]:checked')).map((input)=> parseInt(input.id));
    let offerItemsInCart = cartItems.some((item)=> formData.includes(item))

    if(formData.length > 0 && !offerItemsInCart){
      this.addOfferProducts(formData)
    }

    this.goToCheckout()
  }


  //Add offer products to the cart before checkout
  async addOfferProducts(formData){
    
    let items = formData.map((id)=> ({'id': id,'quantity': 1,'properties':{'_gwp_product':true}}))
    let body = {
     'items': items
    };
    await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(response => {
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    
  }

  goToCheckout(){
    setTimeout(() => {
      window.location.reload();
      window.location = '/checkout';
    }, 500);
  }
}

customElements.define('mm-gwp', GiftWithProduct);
