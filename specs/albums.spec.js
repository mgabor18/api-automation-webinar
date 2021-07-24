"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("ALBUMS", () => {
  describe("CREATE", () => {
    let addedId;
    it("should add an album", () => {
      return chakram
        .post(api.url("albums"), {
          userId: 1,
          id: 101,
          title: "title",
        })
        .then(response => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;
          addedId = response.body.data.id;
          const album = chakram.get(api.url(`albums/${addedId}`));
          expect(album).to.have.status(200);
          expect(album).to.have.json("data.id", addedId);
          expect(album).to.have.json("data.title", "title");
          expect(album).to.have.json("data.userId", 1);
          return chakram.wait();
        });
    });

    it("should not add a new album with existing ID", () => {
      const response = chakram.post(api.url("photos"), {
        userId: 1,
        id: 101,
        title: "title",
      });
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`albums/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all albums", () => {
      const response = chakram.get(api.url("albums"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", albums => {
        expect(albums).to.be.instanceOf(Array);
        expect(albums.length).to.equal(data.albums.length);
      });
      return chakram.wait();
    });

    it("should return a given album", () => {
      const expectedAlbum = data.albums[0];
      const response = chakram.get(api.url(`albums/${expectedAlbum.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", album => {
        expect(album).to.be.defined;
        expect(album).to.deep.equal(expectedAlbum);
      });
      return chakram.wait();
    });

    it("should not return an album with non-existing ID", () => {
      const response = chakram.get(api.url("albums/1234567"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe("UPDATE", () => {
    it("should update az existing album", () => {
      const albumUpdate = {
        userId: 1,
        id: 1,
        title: "updated title",
      };
      const albumId = 1;
      const response = chakram.put(api.url(`albums/${albumId}`), albumUpdate);
      expect(response).to.have.status(200);
      const updatedAlbum = chakram.get(api.url(`albums/${albumId}`));

      expect(updatedAlbum).have.json("data", album => {
        expect(album).to.be.defined;
        expect(album.title).to.equal(albumUpdate.title);
        expect(album.id).to.equal(albumUpdate.id);
        expect(album.userId).to.equal(albumUpdate.userId);
      });
      return chakram.wait();
    });

    it("should not update an album which does not exist", () => {
      const albumUpdate = {
        userId: 1,
        id: 1,
        title: "updated title",
      };
      const response = chakram.put(api.url("album/180"), albumUpdate);
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe("DELETE", () => {
    it("should delete an existing album", () => {
      const response = chakram.delete(api.url("albums/3"));
      expect(response).to.have.status(200);
      const notExistingAlbum = chakram.get(api.url("albums/3"));
      expect(notExistingAlbum).to.have.status(404);
      return chakram.wait();
    });

    it("should not delete an album which does not exist", () => {
      const response = chakram.delete(api.url("albums/12345"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
