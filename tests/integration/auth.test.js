const request = require("supertest");
const User = require("../../models/mongoose/user").Model;
const jwt = require("jsonwebtoken");
const config = require("config");

let server;

describe("/api/clients/users", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await User.deleteMany({}); // Clean up database after each run
  });

  describe("POST /", () => {
    const user = {
      firstName: "name",
      lastName: "name",
      email: "username@example.com",
      password: "Password1!",
    };
    let loginPayload;

    const exec = async () => {
      return await request(server).post("/api/clients/auth").send(loginPayload);
    };

    beforeEach(async () => {
      loginPayload = { email: user.email, password: user.password };

      await request(server).post("/api/clients/users").send(user);
    });

    it("should return 400 if an invalid email is sent", async () => {
      loginPayload.email = "invalidEmail";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if a user with the email provided does not exist", async () => {
      loginPayload.email = "fakeemail@example.com";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password for the user is incorrect", async () => {
      loginPayload.password = "notTheR1ghtCode!";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return a jwt for the user in the body of the response if email and password match", async () => {
      const res = await exec();

      const user = jwt.verify(res.text, config.get("jwtPrivateKey"));

      expect(res.status).toBe(200);
      expect(user._id).not.toBeNull();
      expect(user).toHaveProperty("isAdmin", false);
    });
  });
});
