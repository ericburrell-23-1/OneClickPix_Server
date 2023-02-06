const request = require("supertest");
const User = require("../../models/mongoose/user").Model;
const config = require("config");
const jwt = require("jsonwebtoken");

let server;

describe("/api/clients/users", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await User.remove({}); // Clean up database after each run
  });

  describe("GET /me", () => {
    it("should return 401 if client is not logged in", async () => {
      const res = await request(server).get("/api/clients/users/me");

      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await request(server)
        .get("/api/clients/users/me")
        .set("x-auth-token", "abc");

      expect(res.status).toBe(400);
    });

    it("should return 404 if the user cannot be found", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .get("/api/clients/users/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return the user object if jwt is valid", async () => {
      const user = new User();
      await User.collection.insertOne(user);
      token = user.generateAuthToken();

      const res = await request(server)
        .get("/api/clients/users/me")
        .set("x-auth-token", token);

      expect(res.body._id).toEqual(user._id.toHexString());
      expect(res.body.firstName).toEqual(user.firstName);
      expect(res.body.lastName).toEqual(user.lastName);
      expect(res.body.email).toEqual(user.email);
      expect(res.body.isAdmin).toEqual(false);
    });
  });

  describe("POST /", () => {
    let userInfo;

    let exec = async () => {
      return await request(server).post("/api/clients/users").send(userInfo);
    };

    beforeEach(() => {
      userInfo = {
        firstName: "name",
        lastName: "name",
        email: "username@example.com",
        password: "Password_1",
      };
    });

    it("should return 400 if email is already in use", async () => {
      await User.collection.insertOne(userInfo);
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if firstName is less than 2 characters", async () => {
      userInfo.firstName = "A";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if firstName is more than 50 characters", async () => {
      userInfo.firstName = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if lastName is less than 2 characters", async () => {
      userInfo.lastName = "A";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if lastName is more than 50 characters", async () => {
      userInfo.lastName = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is invalid", async () => {
      userInfo.email = "notAnEmail";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password doesn't meet complexity requirements", async () => {
      userInfo.password = "password";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the user to the database with a hashed password", async () => {
      await exec();

      const user = await User.find({ email: userInfo.email });

      expect(user.length).toBe(1);
      expect(user.password).not.toEqual(userInfo.password);
    });

    it("should return a valid jwt for the user in the header of the response", async () => {
      const res = await exec();

      const user = jwt.verify(
        res.headers["x-auth-token"],
        config.get("jwtPrivateKey")
      );

      expect(res.status).toBe(200);
      expect(user._id).not.toBeNull();
      expect(user).toHaveProperty("isAdmin", false);
    });

    it("should return user in the body of the response", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("firstName", userInfo.firstName);
      expect(res.body).toHaveProperty("lastName", userInfo.lastName);
      expect(res.body).toHaveProperty("email", userInfo.email);
      expect(res.body).toHaveProperty("_id");
    });
  });
});
