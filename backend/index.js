const cors = require('cors')
const express = require('express')
const stripe = require('stripe')("sk_test_4ePXFz8Zmpn3O2CLHrVPPxlj00Z9O1unU4")
// const uuid = require('uuid/v4')
const { v4: uuidv4 } = require('uuid');

const app =express();
const port = 5000;

//middleware
app.use(express.json())
app.use(cors())

//routes
app.get('/' , (req,res)=>{
    res.send("It works ")
})

app.post("/pay" , (req, res) =>{
    const {product, token, amount, userEmail} = req.body
    console.log("Product", product);
    console.log("token", token);
    console.log("ProPriceduct", product.price);
    const idempotencyKey = uuidv4()

    return stripe.customers.create({
        email: userEmail,
        source: token
    }).then(customer =>{
        stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: userEmail,
            description: `purchase of ${product.name}`,
        }, {idempotencyKey})
    })
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))
    
})

app.post("/payment" ,async (req, res) =>{
    const {product, token,payment_method_id, amount, userEmail} = req.body

    const paymentIntent=await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",

    })
    res.json(paymentIntent);
    console.log(paymentIntent);
})

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 2,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
  
    res.json({ id: session.id });
  });

//listen
app.listen(port, () => console.log('listining at port', port))