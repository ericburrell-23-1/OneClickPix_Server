const request = require("supertest");
const Order = require("../../models/mongoose/order").Model;
const User = require("../../models/mongoose/user").Model;
const Product = require("../../models/mongoose/product").Model;
const ProductSize = require("../../models/mongoose/productSize").Model;
const config = require("config");
const jwt = require("jsonwebtoken");
const sample = require("./sampleObjects");
const mongoose = require("mongoose");

let server;

describe("/api/clients/orders", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Order.remove({}); // Clean up database after each run
    await User.remove({});
    await Product.remove({});
    await ProductSize.remove({});
  });

  describe("GET /", () => {
    let token;

    const exec = async () => {
      return await request(server)
        .get("/api/clients/orders")
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      await User.collection.insertMany([sample.user, sample.user2]);
      await Product.collection.insertOne(sample.product);
      await ProductSize.collection.insertOne(sample.productSize);

      let user = await User.find({ firstName: sample.user.firstName });
      let user2 = await User.find({ firstName: sample.user2.firstName });
      let product = await Product.find({ name: sample.product.name });
      let quantity = 1;
      let productSize = await ProductSize.find({ x: sample.productSize.x });
      let imageName = "sampleImage.jpg";
      const order1 = {
        user: user,
        shippingAddress: sample.shippingAddress,
        product: product,
        quantity,
        productSize: productSize,
        imageName,
      };
      const order2 = {
        user: user2,
        shippingAddress: sample.shippingAddress,
        product: product,
        quantity: 2,
        productSize: productSize,
        imageName,
      };

      await Order.collection.insertMany([order1, order2]);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return all orders if user is an admin", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body[0].shippingAddress).toMatchObject(sample.shippingAddress);
      expect(res.body[0]).toHaveProperty("quantity", 1);
      expect(res.body[1].shippingAddress).toMatchObject(sample.shippingAddress);
      expect(res.body[1]).toHaveProperty("quantity", 2);
    });
  });

  describe("POST /", () => {
    let userId;
    let productId;
    let sizeId;
    let user;
    let token;

    const exec = async (payload) => {
      request(server)
        .post("/api/clients/orders")
        .set("x-auth-token", token)
        .send(payload);
      // add image file to request
    };

    beforeEach(async () => {
      userId = mongoose.Types.ObjectId();
      productId = mongoose.Types.ObjectId();
      sizeId = mongoose.Types.ObjectId();
      await Product.collection.insertOne({ _id: productId });
      await ProductSize.collection.insertOne({ _id: sizeId });
      await User.collection.insertOne({
        _id: userId,
        addresses: sample.shippingAddress,
      });
      user = await User.findById(userId);
      token = user.generateAuthToken();
    });

    it("should save a valid order in the db", () => {
      let item = { product: productId, productSize: sizeId, quantity: 1 };
    });
  });
});

// let user;
// let shippingAddress;
// let product;
// let quantity;
// let productSize;
// let imageName;
// let token;

// beforeEach(async () => {
//   token = new User({ isAdmin: true }).generateAuthToken();
//   await User.collection.insertOne(sample.user);
//   await Product.collection.insertOne(sample.product);
//   await ProductSize.collection.insertOne(sample.productSize);
//   user = await User.find({ firstName: sample.user.firstName });
//   product = await Product.find({ name: sample.product.name });
//   productSize = await ProductSize.find({ x: sample.productSize.x });
//   shippingAddress = sample.shippingAddress;
//   quantity = 1;
//   imageName = "sampleImage.jpg";
// });
