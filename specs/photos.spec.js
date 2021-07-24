"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("PHOTOS", () => {
  describe("CREATE", () => {
    let addedId;
    it("should add a photo", () => {
      return chakram
        .post(api.url("photos"), {
          albumId: 1,
          id: 5001,
          title: "reprehenderit est deserunt velit",
          url: "https://via.placeholder.com/600/798956",
          thumbnailUrl: "https://via.placeholder.com/180/771796",
        })
        .then(response => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;
          addedId = response.body.data.id;
          const photo = chakram.get(api.url(`photos/${addedId}`));
          expect(photo).to.have.status(200);
          expect(photo).to.have.json("data.id", addedId);
          expect(photo).to.have.json("data.title", "reprehenderit est deserunt velit");
          expect(photo).to.have.json("data.url", "https://via.placeholder.com/600/798956");
          expect(photo).to.have.json("data.thumbnailUrl", "https://via.placeholder.com/180/771796");
          return chakram.wait();
        });
    });

    it("should not add a new photo with existing ID", () => {
      const response = chakram.post(api.url("photos"), {
        albumId: 1,
        id: 5001,
        title: "reprehenderit est deserunt velit",
        url: "https://via.placeholder.com/600/798956",
        thumbnailUrl: "https://via.placeholder.com/180/771796",
      });
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`photos/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all photos", () => {
      const response = chakram.get(api.url("photos"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", photos => {
        expect(photos).to.be.instanceOf(Array);
        expect(photos.length).to.equal(data.photos.length);
      });
      return chakram.wait();
    });

    it("should return a given photo", () => {
      const expectedPhoto = data.photos[0];
      const response = chakram.get(api.url(`photos/${expectedPhoto.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", photo => {
        expect(photo).to.be.defined;
        expect(photo).to.deep.equal(expectedPhoto);
      });
      return chakram.wait();
    });

    it("should not return a photo with non-existing ID", () => {
      const response = chakram.get(api.url("photos/1234567"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe("UPDATE", () => {
    it("should update az existing photo", () => {
      const photoUpdate = {
        albumId: 11,
        title: "updated title",
        url: "https://via.placeholder.com/600/74e371",
        thumbnailUrl: "https://via.placeholder.com/150/74e371",
      };
      const photoId = 1;
      const response = chakram.put(api.url(`photos/${photoId}`), photoUpdate);
      expect(response).to.have.status(200);
      const updatedPhoto = chakram.get(api.url(`photos/${photoId}`));

      expect(updatedPhoto).have.json("data", photo => {
        expect(photo).to.be.defined;
        expect(photo.name).to.equal(photoUpdate.name);
        expect(photo.username).to.equal(photoUpdate.username);
        expect(photo.email).to.equal(photoUpdate.email);
      });
      return chakram.wait();
    });

    it("should not update a photo which does not exist", () => {
      const userUpdate = {
        albumId: 11,
        title: "updated title",
        url: "https://via.placeholder.com/600/74e371",
        thumbnailUrl: "https://via.placeholder.com/150/74e371",
      };
      const response = chakram.put(api.url("photo/180"), userUpdate);
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe("DELETE", () => {
    it("should delete an existing photo", () => {
      const response = chakram.delete(api.url("photos/2"));
      expect(response).to.have.status(200);
      const notExistingPhoto = chakram.get(api.url("photos/2"));
      expect(notExistingPhoto).to.have.status(404);
      return chakram.wait();
    });

    it("should not delete a photo which does not exist", () => {
      const response = chakram.delete(api.url("photos/12345"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
