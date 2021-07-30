"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("COMMENTS", () => {
  describe("CREATE", () => {
    let addedId, originalLength, response;
    const commentData = {
      title: "title",
      body: "body",
      id: 5001,
      postId: 1,
      name: "Almara Krantya",
      email: "almarak@example.com",
    };

    before(async () => {
      originalLength = data.comments.length;
      response = await chakram.post(api.url("comments"), commentData);
      addedId = response.body.data.id;
    });

    it("should be defined", async () => {
      expect(response.body.data.id).to.be.defined;
    });

    it("should return with 200", async () => {
      expect(response.response.statusCode).to.be.equal(201);
    });

    it("should add a comment", async () => {
      const comment = await chakram.get(api.url(`comments/${addedId}`));
      expect(comment).to.have.json("data.id", addedId);
      expect(comment).to.have.json("data.title", commentData.title);
      expect(comment).to.have.json("data.body", commentData.body);
      expect(comment).to.have.json("data.postId", commentData.postId);
      expect(comment).to.have.json("data.name", commentData.name);
      expect(comment).to.have.json("data.email", commentData.email);
    });

    it("should have greater element count", async () => {
      const responseGet = await chakram.get(api.url("comments"));
      expect(responseGet).to.have.json("data", comments => {
        expect(comments).to.be.instanceOf(Array);
        expect(comments.length).to.be.above(originalLength);
      });
    });

    it("should not add a new comment with existing ID", async () => {
      const response = await chakram.post(api.url("comments"), commentData);
      expect(response).to.have.status(500);
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`comments/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all comments", async () => {
      const response = await chakram.get(api.url("comments"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", comments => {
        expect(comments).to.be.instanceOf(Array);
        expect(comments.length).to.equal(data.comments.length);
      });
    });

    it("should return a given comment", async () => {
      const expectedComment = data.comments[Math.floor(Math.random() * data.comments.length)];
      const response = await chakram.get(api.url(`comments/${expectedComment.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", comment => {
        expect(comment).to.be.defined;
        expect(comment).to.deep.equal(expectedComment);
      });
      return chakram.wait();
    });

    it("should not return a comment with non-existing ID", async () => {
      const response = await chakram.get(api.url("comments/1234567"));
      expect(response).to.have.status(404);
    });
  });

  describe("UPDATE", () => {
    it("should update an existing comment", async () => {
      const commentUpdate = {
        userId: 2,
        title: "updated title",
        body: "updated body",
      };
      const commentId = 18;
      const response = await chakram.put(api.url(`comments/${commentId}`), commentUpdate);
      expect(response).to.have.status(200);
      const updatedComment = await chakram.get(api.url(`comments/${commentId}`));
      expect(updatedComment).have.json("data", comment => {
        expect(comment).to.be.defined;
        expect(comment.userId).to.equal(commentUpdate.userId);
        expect(comment.body).to.equal(commentUpdate.body);
        expect(comment.title).to.equal(commentUpdate.title);
      });
    });

    it("should not update a comment which does not exist", async () => {
      const commentUpdate = {
        userId: 1,
        title: "updated title",
        body: "updated body",
      };
      const response = await chakram.put(api.url("comment/180"), commentUpdate);
      expect(response).to.have.status(404);
    });
  });

  describe("DELETE", () => {
    it("should delete an existing comment", async () => {
      const originalLength = data.comments.length;
      const response = await chakram.delete(api.url("comments/89"));
      expect(response).to.have.status(200);
      const notExistingComment = await chakram.get(api.url("comments/89"));
      expect(notExistingComment).to.have.status(404);

      const responseGet = await chakram.get(api.url("comments"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", comments => {
        expect(comments).to.be.instanceOf(Array);
        expect(comments.length).to.be.below(originalLength);
      });
    });

    it("should not delete a comment which does not exist", async () => {
      const response = await chakram.delete(api.url("comments/12345"));
      expect(response).to.have.status(404);
    });
  });
});
