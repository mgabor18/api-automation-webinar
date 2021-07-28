"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("USERS", () => {
  describe("CREATE", () => {
    let addedId;
    let userData = {
      id: 15,
      name: "Patricia Lebsack",
      username: "Karianne",
      email: "Julianne.OConner@kory.org",
      phone: "493-170-9623",
    };
    it("should add a user", async () => {
      const originalLength = data.users.length;
      const response = await chakram.post(api.url("users"), userData);
      expect(response.response.statusCode).to.match(/^20/);
      expect(response.body.data.id).to.be.defined;
      addedId = response.body.data.id;
      const user = await chakram.get(api.url(`users/${addedId}`));
      expect(user).to.have.status(200);
      expect(user).to.have.json("data.id", addedId);
      expect(user).to.have.json("data.name", `${userData.name}`);
      expect(user).to.have.json("data.username", `${userData.username}`);
      expect(user).to.have.json("data.email", `${userData.email}`);
      expect(user).to.have.json("data.phone", `${userData.phone}`);
      expect(user).to.have.json("data.id", userData.id);

      const responseGet = await chakram.get(api.url("users"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", users => {
        expect(users).to.be.instanceOf(Array);
        expect(users.length).not.to.equal(originalLength);
      });
    });

    it("should not add a new user with existing ID", async () => {
      const response = await chakram.post(api.url("users"), userData);
      expect(response).to.have.status(500);
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`users/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all users", async () => {
      const response = await chakram.get(api.url("users"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", users => {
        expect(users).to.be.instanceOf(Array);
        expect(users.length).to.equal(data.users.length);
      });
    });

    it("should return a given user", async () => {
      const expectedUser = data.users[Math.floor(Math.random() * data.users.length)];
      const response = await chakram.get(api.url(`users/${expectedUser.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", user => {
        expect(user).to.be.defined;
        expect(user).to.deep.equal(expectedUser);
      });
    });

    it("should not return a user with non-existing ID", async () => {
      const response = await chakram.get(api.url("users/1234567"));
      expect(response).to.have.status(404);
    });
  });

  describe("UPDATE", () => {
    it("should update an existing user", async () => {
      const userUpdate = {
        name: "Leanne Graham",
        username: "Update",
        email: "sincere@april.biz",
      };
      const userId = 1;
      const response = await chakram.put(api.url(`users/${userId}`), userUpdate);
      expect(response).to.have.status(200);
      const updatedUser = await chakram.get(api.url(`users/${userId}`));

      expect(updatedUser).have.json("data", user => {
        expect(user).to.be.defined;
        expect(user.name).to.equal(userUpdate.name);
        expect(user.username).to.equal(userUpdate.username);
        expect(user.email).to.equal(userUpdate.email);
      });
    });

    it("should not update a user which does not exist", async () => {
      const userUpdate = {
        name: "Leanne Graham",
        username: "Update",
        email: "sincere@april.biz",
      };
      const response = await chakram.put(api.url("user/180"), userUpdate);
      expect(response).to.have.status(404);
    });
  });

  describe("DELETE", () => {
    it("should delete an existing user", async () => {
      const originalLength = data.users.length;
      const response = await chakram.delete(api.url("users/2"));
      expect(response).to.have.status(200);
      const notExistingUser = await chakram.get(api.url("users/2"));
      expect(notExistingUser).to.have.status(404);

      const responseGet = await chakram.get(api.url("users"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", users => {
        expect(users).to.be.instanceOf(Array);
        expect(users.length).not.to.equal(originalLength);
      });
    });

    it("should not delete a user which does not exist", async () => {
      const response = await chakram.delete(api.url("users/12345"));
      expect(response).to.have.status(404);
    });
  });
});
