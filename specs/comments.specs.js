"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("COMMENTS", () => {
  describe("CREATE", () => {
    let addedId;
    it("should add a comment", () => {
      return chakram
        .post(api.url("comments"), {
          title: "title",
          body: "body",
          postId: 1,
        })
        .then(response => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;
          addedId = response.body.data.id;
          const comment = chakram.get(api.url(`comments/${addedId}`));
          expect(comment).to.have.status(200);
          expect(comment).to.have.json("data.id", addedId);
          expect(comment).to.have.json("data.title", "title");
          expect(comment).to.have.json("data.body", "body");
          expect(comment).to.have.json("data.postId", 1);
          return chakram.wait();
        });
    });

    it("should not add a new comment with existing ID", () => {
      const response = chakram.post(api.url("comments"), {
        id: 50,
        title: "title",
        body: "body",
        postId: 1,
      });
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`comments/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all comments", () => {
      const response = chakram.get(api.url("comments"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", comments => {
        expect(comments).to.be.instanceOf(Array);
        expect(comments.length).to.equal(data.comments.length);
      });
      return chakram.wait();
    });

    it("should return a given comment", () => {
      const expectedComment = data.comments[0];
      const response = chakram.get(api.url(`comments/${expectedComment.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", comment => {
        expect(comment).to.be.defined;
        expect(comment).to.deep.equal(expectedComment);
      });
      return chakram.wait();
    });

    it("should not return a comment with non-existing ID", () => {
      const response = chakram.get(api.url("comments/1234567"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
  describe("UPDATE", () => {
    it("should update az existing comment", () => {
      const commentUpdate = {
        userId: 2,
        title: "updated title",
        body: "updated body",
      };
      const commentId = 18;
      const response = chakram.put(api.url(`comments/${commentId}`), commentUpdate);
      expect(response).to.have.status(200);
      const updatedComment = chakram.get(api.url(`comments/${commentId}`));

      expect(updatedComment).have.json("data", comment => {
        expect(comment).to.be.defined;
        expect(comment.userId).to.equal(commentUpdate.userId);
        expect(comment.body).to.equal(commentUpdate.body);
        expect(comment.title).to.equal(commentUpdate.title);
      });
      return chakram.wait();
    });

    it("should not update a comment which does not exist", () => {
      const commentUpdate = {
        userId: 1,
        title: "updated title",
        body: "updated body",
      };
      const response = chakram.put(api.url("comment/180"), commentUpdate);
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
  describe("DELETE", () => {
    it("should delete an existing comment", () => {
      const response = chakram.delete(api.url("comments/89"));
      expect(response).to.have.status(200);
      const notExistingComment = chakram.get(api.url("comments/89"));
      expect(notExistingComment).to.have.status(404);
      return chakram.wait();
    });

    it("should not delete a comment which does not exist", () => {
      const response = chakram.delete(api.url("comments/12345"));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
