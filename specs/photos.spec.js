"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("PHOTOS", () => {
  describe("CREATE", () => {
    let addedId;
    let photoData = {
      albumId: 1,
      id: 5005,
      title: "reprehenderit est deserunt velit",
      url: "https://via.placeholder.com/600/798956",
      thumbnailUrl: "https://via.placeholder.com/180/771796",
    };
    it("should add a photo", async () => {
      const originalLength = data.photos.length;
      const response = await chakram.post(api.url("photos"), photoData);
      expect(response.response.statusCode).to.match(/^20/);
      expect(response.body.data.id).to.be.defined;
      addedId = response.body.data.id;
      const photo = await chakram.get(api.url(`photos/${addedId}`));
      expect(photo).to.have.status(200);
      expect(photo).to.have.json("data.id", addedId);
      expect(photo).to.have.json("data.title", `${photoData.title}`);
      expect(photo).to.have.json("data.url", `${photoData.url}`);
      expect(photo).to.have.json("data.thumbnailUrl", `${photoData.thumbnailUrl}`);

      const responseGet = await chakram.get(api.url("photos"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", photos => {
        expect(photos).to.be.instanceOf(Array);
        expect(photos.length).not.to.equal(originalLength);
      });
    });

    it("should not add a new photo with existing ID", async () => {
      const response = await chakram.post(api.url("photos"), photoData);
      expect(response).to.have.status(500);
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`photos/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all photos", async () => {
      const response = await chakram.get(api.url("photos"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", photos => {
        expect(photos).to.be.instanceOf(Array);
        expect(photos.length).to.equal(4950);
      });
    });

    it("should return a given photo", async () => {
      const expectedPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
      const response = await chakram.get(api.url(`photos/${expectedPhoto.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", photo => {
        expect(photo).to.be.defined;
        expect(photo).to.deep.equal(expectedPhoto);
      });
    });

    it("should not return a photo with non-existing ID", async () => {
      const response = await chakram.get(api.url("photos/1234567"));
      expect(response).to.have.status(404);
    });
  });

  describe("UPDATE", () => {
    it("should update an existing photo", async () => {
      const photoUpdate = {
        albumId: 11,
        title: "updated title",
        url: "https://via.placeholder.com/600/74e371",
        thumbnailUrl: "https://via.placeholder.com/150/74e371",
      };
      const photoId = 1;
      const response = await chakram.put(api.url(`photos/${photoId}`), photoUpdate);
      expect(response).to.have.status(200);
      const updatedPhoto = await chakram.get(api.url(`photos/${photoId}`));

      expect(updatedPhoto).have.json("data", photo => {
        expect(photo).to.be.defined;
        expect(photo.name).to.equal(photoUpdate.name);
        expect(photo.username).to.equal(photoUpdate.username);
        expect(photo.email).to.equal(photoUpdate.email);
      });
    });

    it("should not update a photo which does not exist", async () => {
      const photoUpdate = {
        albumId: 11,
        title: "updated title",
        url: "https://via.placeholder.com/600/74e371",
        thumbnailUrl: "https://via.placeholder.com/150/74e371",
      };
      const response = await chakram.put(api.url("photo/180"), photoUpdate);
      expect(response).to.have.status(404);
    });
  });

  describe("DELETE", () => {
    it("should delete an existing photo", async () => {
      const originalLength = data.photos.length;
      const response = await chakram.delete(api.url("photos/2"));
      expect(response).to.have.status(200);
      const notExistingPhoto = await chakram.get(api.url("photos/2"));
      expect(notExistingPhoto).to.have.status(404);

      const responseGet = await chakram.get(api.url("photos"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", photos => {
        expect(photos).to.be.instanceOf(Array);
        expect(photos.length).not.to.equal(originalLength);
      });
    });

    it("should not delete a photo which does not exist", async () => {
      const response = await chakram.delete(api.url("photos/12345"));
      expect(response).to.have.status(404);
    });
  });
});
