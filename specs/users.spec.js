"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("USERS", () => {
  describe("CREATE", () => {
    let addedId;
    it("should add a user", () => {
      return chakram
        .post(api.url("users"), {
          id: 15,
          name: "Patricia Lebsack",
          username: "Karianne",
          email: "Julianne.OConner@kory.org",
          phone: "493-170-9623",
        })
        .then(response => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;
          addedId = response.body.data.id;
          const user = chakram.get(api.url(`users/${addedId}`));
          expect(user).to.have.status(200);
          expect(user).to.have.json("data.id", addedId);
          expect(user).to.have.json("data.name", "Patricia Lebsack");
          expect(user).to.have.json("data.email", "Julianne.OConner@kory.org");
          expect(user).to.have.json("data.id", 15);
          return chakram.wait();
        });
    });

    it("should not add a new user with existing ID", () => {
      const response = chakram.post(api.url("users"), {
        id: 15,
        name: "Patricia Lebsack",
        username: "Karianne",
        email: "Julianne.OConner@kory.org",
        phone: "493-170-9623",
      });
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`users/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all users", () => {
      const response = chakram.get(api.url("users"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", users => {
        expect(users).to.be.instanceOf(Array);
        expect(users.length).to.equal(data.users.length);
      });
      return chakram.wait();
    });

    it("should return a given user", () => {
      const expectedUser = data.users[0];
      const response = chakram.get(api.url(`users/${expectedUser.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", user => {
        expect(user).to.be.defined;
        expect(user).to.deep.equal(expectedUser);
      });
      return chakram.wait();
    });

    it("should not return a user with non-existing ID", () => {
      const response = chakram.get(api.url("users/1234567"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe("UPDATE", () => {
    it("should update az existing user", () => {
      const userUpdate = {
        name: "Leanne Graham",
        username: "Update",
        email: "Sincere@april.biz",
      };
      const userId = 1;
      const response = chakram.put(api.url(`users/${userId}`), userUpdate);
      expect(response).to.have.status(200);
      const updatedUser = chakram.get(api.url(`users/${userId}`));

      expect(updatedUser).have.json("data", user => {
        expect(user).to.be.defined;
        expect(user.name).to.equal(userUpdate.name);
        expect(user.username).to.equal(userUpdate.username);
        expect(user.email).to.equal(userUpdate.email);
      });
      return chakram.wait();
    });

    it("should not update a user which does not exist", () => {
      const userUpdate = {
        name: "Leanne Graham",
        username: "Update",
        email: "Sincere@april.biz",
      };
      const response = chakram.put(api.url("user/180"), userUpdate);
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe("DELETE", () => {
    it("should delete an existing user", () => {
      const response = chakram.delete(api.url("users/2"));
      expect(response).to.have.status(200);
      const notExistingUser = chakram.get(api.url("users/2"));
      expect(notExistingUser).to.have.status(404);
      return chakram.wait();
    });

    it("should not delete a user which does not exist", () => {
      const response = chakram.delete(api.url("users/12345"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
