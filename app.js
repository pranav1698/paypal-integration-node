const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AShnbtzv0sB409MR6L--lFEijwtWcB6RAcESJBirVb2_h0NTnDRYY4TSHkPSkZ-SoFbdusXWmW3HK6H4',
    'client_secret': 'EKbGJS435hLnke5TgUlbfv19z0yzc6D8hgJXjMl-B-BUqYfSvLXT4A15S6xe7xl3DoPICPVYRBZVS4yv'
  });

  app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Box Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Hat For Best Payment ever"
        }]

    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i =0; i < payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

  });

  app.get('/success', (req, res) => {
      const payerId = req.query.payerID;
      const paymentId = req.query.paymentId;

      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
      };

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
    
  });

  app.get('/cancel', (req, res) => res.send('Cancelled'));

  app.listen(3000, () => console.log('Server Started'));