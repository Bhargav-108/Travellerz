const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const request = require("request");
const https = require("https");

const app = express();
let order_id_varia;

app.use(bodyParser.urlencoded({
  extended: true
}));

const razorpay = new Razorpay({
  key_id: 'rzp_test_wDSWaBFeb91x5d',
  key_secret: 'zMoGMcwuXcMvLZeU4AkEJW3N',
})



app.use(express.static("public"));



app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/" , function(req,res){
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = {
    members:[
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  const url = "https://us5.api.mailchimp.com/3.0/lists/e0e3aa1019";

  const options ={
    method: "POST",
    auth: "Prins1:49988025c679b54560432cddfe240edc-us5"
  }

  const request=https.request(url, options, function(response){

     if(response.statusCode === 200){
       res.sendFile(__dirname + "/success.html");
     }
     else{
       res.sendFile(__dirname + "/failure.html");
     }

     response.on("data", function(data){
       console.log(JSON.parse(data));
     })
  })

  request.write(jsonData);
  request.end();
})

app.post("/failure", function(req, res){
  res.redirect("/");
})






app.post("/order", function(req, res) {
  var options = {
    amount: 1299900, // amount in the smallest currency unit
    currency: "INR",
    // receipt: "order_rcptid_11"
  };

  razorpay.orders.create(options, function(err, order){
    order_id_varia = order.id;
    console.log(order);
    res.json(order);
  })
});

app.post("/is-order-complete", (req,res) =>{
  razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) =>{
    if(paymentDocument.status == 'captured'){
      res.send('Payment Successful')
    }else {
      res.redirect('/')
    }
  })
})




app.listen(3000, function() {
  console.log("Server is running in port 3000");
})
