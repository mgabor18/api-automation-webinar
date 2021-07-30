"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("ALBUMS", () => {
  describe("CREATE", () => {
    let addedId, originalLength, response;
    const albumData = {
      userId: 1,
      id: 101,
      title: "title",
    };

    before(async () => {
      originalLength = data.albums.length;
      response = await chakram.post(api.url("albums"), albumData);
      addedId = response.body.data.id;
    });

    it("should be defined", async () => {
      expect(response.body.data.id).to.be.defined;
    });

    it("should return with 200", async () => {
      expect(response.response.statusCode).to.be.equal(201);
    });

    it("should add an album", async () => {
      const album = await chakram.get(api.url(`albums/${addedId}`));
      expect(album).to.have.json("data.id", addedId);
      expect(album).to.have.json("data.title", albumData.title);
      expect(album).to.have.json("data.userId", albumData.userId);
    });

    it("should have greater element count", async () => {
      const responseGet = await chakram.get(api.url("albums"));
      expect(responseGet).to.have.json("data", albums => {
        expect(albums).to.be.instanceOf(Array);
        expect(albums.length).to.be.above(originalLength);
      });
    });

    it("should not add a new album with existing ID", async () => {
      const response = await chakram.post(api.url("photos"), albumData);
      expect(response).to.have.status(500);
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`albums/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all albums", async () => {
      const response = await chakram.get(api.url("albums"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", albums => {
        expect(albums).to.be.instanceOf(Array);
        expect(albums.length).to.equal(data.albums.length);
      });
    });

    it("should return a given album", async () => {
      const expectedAlbum = data.albums[Math.floor(Math.random() * data.albums.length)];
      const response = await chakram.get(api.url(`albums/${expectedAlbum.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", album => {
        expect(album).to.be.defined;
        expect(album).to.deep.equal(expectedAlbum);
      });
    });

    it("should not return an album with non-existing ID", async () => {
      const response = await chakram.get(api.url("albums/1234567"));
      expect(response).to.have.status(404);
    });
  });

  describe("UPDATE", () => {
    it("should update an existing album", async () => {
      const albumId = Math.floor(Math.random() * data.albums.length);
      const albumUpdate = {
        userId: 1,
        id: albumId,
        title: "updated title",
      };
      const response = await chakram.put(api.url(`albums/${albumId}`), albumUpdate);
      expect(response).to.have.status(200);
      const updatedAlbum = await chakram.get(api.url(`albums/${albumId}`));
      expect(updatedAlbum).have.json("data", album => {
        expect(album).to.be.defined;
        expect(album.title).to.equal(albumUpdate.title);
        expect(album.id).to.equal(albumUpdate.id);
        expect(album.userId).to.equal(albumUpdate.userId);
      });
    });

    it("should not update an album which does not exist", async () => {
      const albumUpdate = {
        userId: 1,
        id: 1,
        title: "updated title",
      };
      const response = await chakram.put(api.url("albums/180"), albumUpdate);
      expect(response).to.have.status(404);
    });
  });

  describe("DELETE", () => {
    it("should delete an existing album", async () => {
      const originalLength = data.albums.length;
      const responseDel = await chakram.delete(api.url("albums/3"));
      expect(responseDel).to.have.status(200);
      const notExistingAlbum = await chakram.get(api.url("albums/3"));
      expect(notExistingAlbum).to.have.status(404);

      const responseGet = await chakram.get(api.url("albums"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", albums => {
        expect(albums).to.be.instanceOf(Array);
        expect(albums.length).to.be.below(originalLength);
      });
    });

    it("should not delete an album which does not exist", async () => {
      const response = await chakram.delete(api.url("albums/12345"));
      expect(response).to.have.status(404);
    });
  });
});
