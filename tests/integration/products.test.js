const request = require("supertest");
const Product = require("../../models/mongoose/product").Model;
const ProductGroup = require("../../models/mongoose/productGroup").Model;
const ProductSize = require("../../models/mongoose/productSize").Model;
const User = require("../../models/mongoose/user").Model;
const mongoose = require("mongoose");

let server;

describe("/api/offerings/products", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Product.remove({}); // Clean up database after each run
    await ProductGroup.remove({});
    await ProductSize.remove({});
  });

  describe("GET /", () => {
    it("should return all products", async () => {
      await Product.collection.insertMany([
        { name: "product1", description: "description 1" },
        { name: "product2", description: "description 2" },
      ]);

      const res = await request(server).get("/api/offerings/products");
      expect(res.status).toBe(200);
      expect(res.body.some((p) => p.name === "product1")).toBeTruthy();
      expect(res.body.some((p) => p.name === "product2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return the product with the given id", async () => {
      let payload = {
        name: "product1",
        description: "description 1",
        _id: new mongoose.Types.ObjectId(),
      };
      await Product.collection.insertOne(payload);

      const res = await request(server).get(
        `/api/offerings/products/${payload._id}`
      );
      payload._id = payload._id.toHexString();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(payload);
    });

    it("should return 404 if an invalid id is passed", async () => {
      const res = await request(server).get(`/api/offerings/products/1`);
      expect(res.status).toBe(404);
    });

    it("should return 404 if the product does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(server).get(
        `/api/offerings/products/${fakeId}`
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let payload;
    let token;

    const exec = async () => {
      return await request(server)
        .post("/api/offerings/products")
        .set("x-auth-token", token)
        .send(payload);
    };

    beforeEach(() => {
      token = new User({ isAdmin: true }).generateAuthToken();
      payload = { name: "product1", description: "description 1" };
    });

    it("should return 400 if the name is less than 2 characters", async () => {
      payload.name = "A";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name is more than 255 characters", async () => {
      payload.name = new Array(257).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the description is less than 5 characters", async () => {
      payload.description = "ABCD";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the description is more than 1024 characters", async () => {
      payload.description = new Array(1026).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if request contains an invalid productGroup ID", async () => {
      payload.productGroups = [1];
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if productGroup cannot be found", async () => {
      payload.productGroups = [new mongoose.Types.ObjectId()];
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if request contains productGroup property that isn't an array", async () => {
      const group1 = {
        name: "Group1",
        description: "Group description",
        _id: new mongoose.Types.ObjectId(),
      };
      await ProductGroup.collection.insertOne(group1);
      payload.productGroups = group1._id;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    // It should return 401 if the client is not logged in
    it("should return 401 if the client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    // It should return 403 if the user is not admin
    it("should return 403 if the user is not admin", async () => {
      token = await new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should save the product to the database if it is valid", async () => {
      await exec();

      const product = await Product.find({ name: "product1" });
      expect(product.length).toBe(1);
    });

    it("should return the product in the response if it is valid", async () => {
      const group1 = {
        name: "Group1",
        description: "Group description",
        _id: new mongoose.Types.ObjectId(),
      };
      await ProductGroup.collection.insertOne(group1);
      payload.productGroups = [group1._id];
      group1._id = group1._id.toHexString();

      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "product1");
      expect(res.body).toHaveProperty("description", "description 1");
      expect(res.body).toHaveProperty("productSizes");
      expect(res.body.productGroups).toMatchObject([group1]);
    });
  });

  describe("PUT /:id", () => {
    let payload;
    let updatePayload;
    let _id;
    let token;

    const exec = async () => {
      return await request(server)
        .put(`/api/offerings/products/${_id}`)
        .set("x-auth-token", token)
        .send(updatePayload);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      _id = new mongoose.Types.ObjectId();
      payload = {
        name: "product1",
        description: "description 1",
        _id: _id,
      };
      updatePayload = {
        name: "newProductName",
        description: payload.description,
      };
      await Product.collection.insertOne(payload);
    });

    it("should should return 400 if the description is less than 5 characters", async () => {
      updatePayload.description = "1234";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should should return 400 if invalid productSize ID is passed", async () => {
      updatePayload.productSizes = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should should return 400 if productSize cannot be found", async () => {
      const productSizesId = new mongoose.Types.ObjectId();
      updatePayload.productSizes = [productSizesId];

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 401 if the client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not admin", async () => {
      token = await new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should should return 404 if an invalid ID is passed", async () => {
      _id = "1";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should should return 404 if product with the given ID cannot be found", async () => {
      _id = new mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update product in database if valid product is sent", async () => {
      const productSizesId = new mongoose.Types.ObjectId();
      const newProductSize = {
        x: 8,
        y: 10,
        _id: productSizesId,
      };
      await ProductSize.collection.insertOne(newProductSize);
      updatePayload.productSizes = [productSizesId];

      await exec();
      const product = await Product.find({ name: updatePayload.name });

      expect(product.length).toBe(1);
      expect(product[0]).toHaveProperty("name", updatePayload.name);
      expect(product[0]).toHaveProperty(
        "description",
        updatePayload.description
      );
      expect(product[0]).toHaveProperty("productGroups");
      expect(product[0].productSizes[0]).toMatchObject(newProductSize);
    });

    it("should return updated product in response after saving to database", async () => {
      const res = await exec();

      expect(res.body).toMatchObject(updatePayload);
    });
  });

  describe("DELETE /:id", () => {
    let _id;
    let product;
    let token;

    const exec = async () => {
      return await request(server)
        .delete(`/api/offerings/products/${_id}`)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      _id = new mongoose.Types.ObjectId();
      product = {
        name: "product1",
        description: "description 1",
        _id: _id,
      };
      await Product.collection.insertOne(product);
    });

    it("should return 401 if the client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not admin", async () => {
      token = await new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 404 a if an invalid ID is passed", async () => {
      _id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if the product does not exist", async () => {
      _id = new mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should remove the product from the database if request is valid", async () => {
      const res = await exec();

      const deletedProduct = Product.findById(_id);
      expect(deletedProduct).not.toBeTruthy;
      expect(res.status).toBe(200);
    });

    it("should return the product in the response after it is removed from the database", async () => {
      const res = await exec();
      product._id = product._id.toHexString();

      expect(res.body).toMatchObject(product);
    });
  });
});
