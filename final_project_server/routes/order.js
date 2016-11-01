"use strict";

const express = require('express');
const router = express.Router();

const bodyParser = require("body-parser")

router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json())

module.exports = (knex) => {

  router.post("/api/order", (req, res) => {

    let cartList = req.body.cartList;
    let total = req.body.total_price_cents;
    let token = req.body.token
    // console.log(cartList)
    // console.log(total)

    //create order in system upon "checkout" click
    knex
      .select("*")
      .from("sessions")
      .where("token", token)
      .then((hasSession) => {
        if (hasSession[0]) {
          let currUser = hasSession[0]
          return currUser
        }
      })
      .then(currUser => {
        knex("orders")
          .returning("*")
          .insert({
            user_id: currUser.user_id,
            total_price_cents: Math.floor(total),
            stripe_order_token: 'stipeordertoken'
          })
          .then((result) => {
            // console.log(result)
            cartList.map((cartItem, index) => {
              knex("lineitems")
                .insert({
                  order_id: result[0].id,
                  product_id: cartItem.id,
                  quantity: 1,
                  item_price_cents: Math.round(cartItem.price_cents),
                  total_price_cents: Math.round(cartItem.price_cents)
                })
                .then((result) => {
                  // console.log(result)
                })
            })
          })
      })
  });

  return router;
}
