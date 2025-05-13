const mongoose = require("mongoose");

const user1 = {
  firstName: "AA",
  lastName: "AA",
  email: "aa@example.com",
  password: "password",
};
const user2 = {
  firstName: "BB",
  lastName: "BB",
  email: "bb@example.com",
  password: "password",
};
const shippingAddress = {
  shippingName: "AA AA",
  phone: "3121231234",
  addressLine1: "123 Maple St.",
  city: "Chicago",
  state: "IL",
  country: "USA",
  zipCode: "60601",
};
const customer = {
  name: "Customer",
  email: "customer@example.com",
  phone: "3121231234",
  addresses: [shippingAddress],
};
const product1 = {
  _id: new mongoose.Types.ObjectId(),
  name: "product1",
  description: "product description",
  variantType: "sized",
  variants: [
    {
      _id: new mongoose.Types.ObjectId(),
      label: "5x7",
      price: 2.99,
      x: 5,
      y: 7,
    },
  ],
};
const product2 = {
  _id: new mongoose.Types.ObjectId(),
  name: "product2",
  description: "product description 2",
  variantType: "sized+3d",
  multiPhoto: true,
  variants: [
    {
      _id: new mongoose.Types.ObjectId(),
      label: "5x7",
      price: 2.99,
      x: 5,
      y: 7,
      z: 2,
      weight: 16,
    },
  ],
};
const orderItem1 = {
  product: product1._id,
  productVariant: product1.variants[0]._id,
  imageNames: ["testImage1.jpg"],
  quantity: 1,
};
const orderItem2 = {
  product: product2._id,
  productVariant: product2.variants[0]._id,
  imageNames: ["testImage1.jpg", "testImage2.jpg"],
  quantity: 1,
};
const order = {
  customer: new mongoose.Types.ObjectId(),
  shippingAddress: shippingAddress,
  items: [orderItem1, orderItem2],
};

module.exports = {
  user1,
  user2,
  shippingAddress,
  customer,
  product1,
  product2,
  orderItem1,
  orderItem2,
  order,
};
