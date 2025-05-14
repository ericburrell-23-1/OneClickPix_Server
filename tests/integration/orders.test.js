const request = require("supertest");
const Order = require("../../models/mongoose/order").Model;
const User = require("../../models/mongoose/user").Model;
const Product = require("../../models/mongoose/product").Model;
const Customer = require("../../models/mongoose/customer").Model;
const config = require("config");
const jwt = require("jsonwebtoken");
const sample = require("../fixtures/sampleObjects");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const uploadDir = config.get("uploadsDir");

let server;

describe("/api/clients/orders", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    const files = await fs.promises.readdir(uploadDir);
    for (const file of files) {
      await fs.promises.unlink(path.join(uploadDir, file));
    }
    await Order.deleteMany({});
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
  });

  describe("GET /", () => {
    let token;
    let order1;
    let order2;
    const expectedQuantity1 = sample.order.items[0].quantity;
    const expectedQuantity2 = 2;

    const exec = async () => {
      return await request(server)
        .get("/api/clients/orders")
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      order1 = structuredClone(sample.order);
      order2 = structuredClone(sample.order);
      order2.items[0].quantity = expectedQuantity2;

      await Order.collection.insertMany([order1, order2]);
    });

    it("should return 401 if the client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return all orders if user is an admin", async () => {
      const res = await exec();
      const [resOrder1, resOrder2] = res.body.sort(
        (a, b) => a.items[0].quantity - b.items[0].quantity
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(resOrder1.items[0]).toHaveProperty("quantity", expectedQuantity1);
      expect(resOrder2.items[0]).toHaveProperty("quantity", expectedQuantity2);
      expect(resOrder1.shippingAddress).toMatchObject(sample.shippingAddress);
      expect(resOrder2.shippingAddress).toMatchObject(sample.shippingAddress);
    });
  });

  describe("POST /", () => {
    let product1;
    let product2;
    let user;
    let customer;
    let token;
    let order;

    const exec = async (payload) => {
      try {
        return await request(server)
          .post("/api/clients/orders")
          .set("x-auth-token", token)
          .field("order", JSON.stringify(payload))
          .attach(
            "images",
            path.resolve(__dirname, "../fixtures/images/testImage1.jpg")
          )
          .attach(
            "images",
            path.resolve(__dirname, "../fixtures/images/testImage2.jpg")
          );
      } catch (err) {
        console.error("Upload Error: ", err);
      }
    };

    beforeEach(async () => {
      product1 = await Product.create(sample.product1);
      product2 = await Product.create(sample.product2);
      user = await User.create(sample.user1);

      customer = structuredClone(sample.customer);
      customer.user = user._id;
      customer = await Customer.create(customer);
      token = user.generateAuthToken();

      order = structuredClone(sample.order);
      order.customer = customer._id;
      order.shippingAddress = customer.addresses[0]._id;

      order.items[0].product = product1._id;
      order.items[0].productVariant = product1.variants[0]._id;
      order.items[1].product = product2._id;
      order.items[1].productVariant = product2.variants[0]._id;
    });

    it("should return 400 if orderItem.product is not a valid ObjectId", async () => {
      order.items[0].product = "not a product id";

      const res = await exec(order);
      expect(res.status).toBe(400);
    });

    it("should return 400 if orderItem.productVariant is not a valid ObjectId", async () => {
      order.items[0].productVariant = "not a product id";

      const res = await exec(order);
      expect(res.status).toBe(400);
    });

    it("should return 400 if shipping address is not a valid ObjectId", async () => {
      order.shippingAddress = "not a product id";

      const res = await exec(order);
      expect(res.status).toBe(400);
    });

    it("should return 400 if order contains a product not found in the database", async () => {
      order.items[0].product = new mongoose.Types.ObjectId();

      const res = await exec(order);
      expect(res.status).toBe(400);
      expect(res.text).toMatch(
        /one or more requested products could not be found/i
      );
    });

    it("should return 400 if order contains a product variant that does not exist for that product", async () => {
      order.items[0].productVariant = sample.product2.variants[0]._id;
      const res = await exec(order);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/product variant could not be found/i);
    });

    it("should return 400 if shipping address is not found for that customer", async () => {
      const otherCustomer = await Customer.create(sample.customer);
      order.shippingAddress = otherCustomer.addresses[0]._id;

      const res = await exec(order);
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/no shipping address/i);
    });

    it("should return 400 if any order item does not contain an image", async () => {
      order.items[0].imageNames = [];
      const res = await exec(order);

      expect(res.status).toBe(400);
    });

    it("should return 400 if a single-image product contains multiple images", async () => {
      product2.multiPhoto = false;
      product2.save();
      const res = await exec(order);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(
        /expected exactly one image for single-photo product/i
      );
    });

    it("should return 400 if a multi-image product does not contain multiple images", async () => {
      order.items[1].imageNames = [order.items[1].imageNames[0]];
      const res = await exec(order);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(
        /expected multiple images for multi-photo product/i
      );
    });

    it("should return 400 if any image referenced in order.items does not match any uploaded file", async () => {
      order.items[0].imageNames = ["nonexistent.jpg"];
      const res = await exec(order);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/referenced image not found/i);
    });

    it("should return 400 if any image was not successfully saved to the disk", async () => {
      const existsSyncSpy = jest
        .spyOn(fs, "existsSync")
        .mockImplementation(() => false);
      const res = await exec(order);

      // expect(res.status).toBe(400);
      expect(res.text).toMatch(/uploaded file not found/i);

      existsSyncSpy.mockRestore();
    });

    it("should return 400 if any order contains no items", async () => {
      order.items = [];
      const res = await exec(order);

      expect(res.status).toBe(400);
    });

    it("should return 401 if user is not signed in", async () => {
      token = "";
      const res = await exec(order);

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not admin or assigned to customer", async () => {
      const otherUser = await User.create(sample.user2);
      token = otherUser.generateAuthToken();
      const res = await exec(order);

      expect(res.status).toBe(403);
    });

    it("should save a valid order in the db sent by user assigned to customer", async () => {
      await exec(order);

      const savedOrder = await Order.findOne({ customer: order.customer });
      expect(savedOrder).not.toBeNull();
      expect(savedOrder.items).toHaveLength(2);
    });

    it("should save a valid order in the db sent by admin", async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      await exec(order);

      const savedOrder = await Order.findOne({ customer: order.customer });
      expect(savedOrder).not.toBeNull();
      expect(savedOrder.items).toHaveLength(2);
    });

    it("should return the saved order in the response body", async () => {
      const res = await exec(order);

      expect(res.status).toBe(200); // or 201 depending on your API design
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer", order.customer.toHexString());
      expect(res.body).toHaveProperty("items");
      expect(res.body.items).toHaveLength(order.items.length);

      for (let i = 0; i < order.items.length; i++) {
        const item = res.body.items[i];
        const inputItem = order.items[i];

        // Validate quantity matches
        expect(item).toHaveProperty("quantity", inputItem.quantity);

        // Validate product is a snapshot object (not just an ID)
        expect(item).toHaveProperty("product");
        expect(typeof item.product).toBe("object");
      }
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
