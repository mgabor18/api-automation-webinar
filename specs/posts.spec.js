"use strict";

const chakram = require("chakram");
const expect = chakram.expect;
const api = require("./utils/api");
const data = require("../server/data.json");

describe("POSTS", () => {
  describe("CREATE", () => {
    let addedId, originalLength, response;
    const postData = {
      id: 50000,
      title: "title",
      body: "body",
      userId: 1,
    };

    before(async () => {
      originalLength = data.posts.length;
      response = await chakram.post(api.url("posts"), postData);
      addedId = response.body.data.id;
    });

    it("should be defined", async () => {
      expect(response.body.data.id).to.be.defined;
    });

    it("should return with 200", async () => {
      expect(response.response.statusCode).to.be.equal(201);
    });

    it("should add a post", async () => {
      const post = await chakram.get(api.url(`posts/${addedId}`));
      expect(post).to.have.json("data.id", addedId);
      expect(post).to.have.json("data.title", postData.title);
      expect(post).to.have.json("data.body", postData.body);
      expect(post).to.have.json("data.userId", postData.userId);
    });

    it("should have greater element count", async () => {
      const responseGet = await chakram.get(api.url("posts"));
      expect(responseGet).to.have.json("data", posts => {
        expect(posts).to.be.instanceOf(Array);
        expect(posts.length).to.be.above(originalLength);
      });
    });

    it("should not add a new row with existing ID", async () => {
      const response = await chakram.post(api.url("posts"), postData);
      expect(response).to.have.status(500);
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url(`posts/${addedId}`));
      }
    });
  });

  describe("READ", () => {
    it("should return all posts", async () => {
      const response = await chakram.get(api.url("posts"));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", posts => {
        expect(posts).to.be.instanceOf(Array);
        expect(posts.length).to.equal(data.posts.length);
      });
    });

    it("should return a given post", async () => {
      const expectedPost = data.posts[Math.floor(Math.random() * data.posts.length)];
      const response = await chakram.get(api.url(`posts/${expectedPost.id}`));
      expect(response).to.have.status(200);
      expect(response).to.have.json("data", post => {
        expect(post).to.be.defined;
        expect(post).to.deep.equal(expectedPost);
      });
    });

    it("should not return a post with non-existing ID", async () => {
      const response = await chakram.get(api.url("posts/1234567"));
      expect(response).to.have.status(404);
    });

    describe("FILTER", () => {
      it("should return posts by title", async () => {
        const expectedPost = data.posts[0];
        const response = await chakram.get(api.url("posts", `title=${expectedPost.title}`));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts[0]).to.deep.equal(expectedPost);
        });
      });

      it("should not return anything in case of impossible filter", async () => {
        const response = await chakram.get(api.url("posts/impossible-filter"));
        expect(response).to.have.status(404);
      });

      it("should ignore filtering if invalid filter", async () => {
        const response = await chakram.get(api.url("posts", "noField=noValue"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts.length).to.equal(100);
        });
      });
    });

    describe("PAGINATE", () => {
      it("should return 10 post by default", async () => {
        const response = await chakram.get(api.url("posts", "_page=2"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(10);
        });
      });

      it("should not return anything if the given page number is bigger than the last page", async () => {
        const response = await chakram.get(api.url("posts", `_page=${9999}`));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(0);
        });
      });

      it("should return as many posts as we specified in the _limit filter", async () => {
        const response = await chakram.get(api.url("posts", "_page=6&_limit=3"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(3);
          const arrayOfIds = [16, 17, 18];
          arrayOfIds.forEach((current, indexOfCurrent) => {
            expect(posts[indexOfCurrent].id).to.equal(current);
          });
        });
      });

      it("should return 10 posts per page if the filters are not correctly specified", async () => {
        const response = await chakram.get(api.url("posts", "_page=incorrect-page&_limit=incorrect-limit"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(10);
          for (let currentIndex = 0; currentIndex < 10; currentIndex++) {
            expect(posts[currentIndex].id).to.equal(currentIndex + 1);
          }
        });
      });
    });

    describe("SORT", () => {
      it("should return the sorted posts", async () => {
        const response = await chakram.get(api.url("posts", "_sort=title&_order=desc&_page=1"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.map(post => post.title)).to.be.descending;
        });
      });

      it("should sort the results by ascending order if incorrect value passed to the _order", async () => {
        const response = await chakram.get(api.url("posts", "_sort=body&_order=incorrectOrder"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.map(post => post.body)).to.be.ascending;
        });
      });

      it("should return the posts by default in case of incorrect _sort or _order", async () => {
        const response = await chakram.get(api.url("posts", "_sort=incorrectSort&_order=incorrectOrder&_page=1"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          for (let currentIndex = 0; currentIndex < 10; currentIndex++) {
            expect(posts[currentIndex].id).to.equal(data.posts[currentIndex].id);
          }
        });
      });
    });

    describe("SLICE", () => {
      it("should return the correct posts started from _start to _end", async () => {
        const response = await chakram.get(api.url("posts", "_start=5&_end=8"));
        expect(response).to.have.status(200);
        expect(response).to.have.header("X-Total-Count", "100");
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(3);
          const ids = [6, 7, 8];
          ids.forEach((currentId, index) => {
            expect(posts[index].id).to.equal(currentId);
          });
        });
      });

      it("should return all posts if the _start or the _end is not defined", async () => {
        const response = await chakram.get(api.url("posts", "_start=18"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(100);
        });
      });

      it("should return posts counted from the end of all posts, if the _start value is a negative number", async () => {
        const response = await chakram.get(api.url("posts", "_start=-10&_end=95"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(5);
          expect(posts[0].id).to.equal(91);
          expect(posts[4].id).to.equal(95);
        });
      });
    });

    describe("OPERATORS", () => {
      describe("LESS THAN", () => {
        it("should return posts that has _lte (Less Than or Equal) value or smaller id", async () => {
          const response = await chakram.get(api.url("posts", "userId_lte=18"));
          expect(response).to.have.status(200);
          expect(response).to.have.json("data", posts => {
            expect(posts).to.be.instanceof(Array);
            posts.forEach(post => {
              expect(post.userId).to.be.below(19);
            });
          });
        });

        it("should not return any posts if the _lte value is not valid", async () => {
          const response = await chakram.get(api.url("posts", "userId_lte=-999"));
          expect(response).to.have.status(200);
          expect(response).to.have.json("data", posts => {
            expect(posts).to.be.instanceof(Array);
            expect(posts.length).to.equal(0);
          });
        });
      });

      describe("GREATHER THAN", () => {
        it("should return posts that has _gte (Greater Than or Equal) value or bigger id", async () => {
          const response = await chakram.get(api.url("posts?userId_gte=18"));
          expect(response).to.have.status(200);
          expect(response).to.have.json("data", posts => {
            expect(posts).to.be.instanceof(Array);
            posts.forEach(post => {
              expect(post.userId).to.be.above(17);
            });
          });
        });

        it("should not return any posts if the _gte value is not valid", async () => {
          const response = await chakram.get(api.url("posts", "userId_gte=9999"));
          expect(response).to.have.status(200);
          expect(response).to.have.json("data", posts => {
            expect(posts).to.be.instanceof(Array);
            expect(posts.length).to.equal(0);
          });
        });
      });

      describe("NOT EQUAL", () => {
        it("should return all the posts, except the posts that does not have the _ne value for the specified field", async () => {
          const response = await chakram.get(api.url("posts", "id_ne=1"));
          expect(response).to.have.status(200);
          expect(response).to.have.json("data", posts => {
            expect(posts).to.be.instanceof(Array);
            const notExpectedPosts = posts.filter(post => post.id === "1");
            expect(notExpectedPosts.length).to.equal(0);
          });
        });
      });

      describe("GREATHER THAN AND LESS THAN", () => {
        it("should return posts for _gte and _lte specified for two or more field", async () => {
          const response = await chakram.get(api.url("posts", "userId_gte=18&userId_lte=1"));
          expect(response).to.have.status(200);
          expect(response).to.have.json("data", posts => {
            expect(posts).to.be.instanceof(Array);
            expect(posts.length).to.equal(0);
          });
        });
      });
    });

    describe("LIKE", () => {
      it("should return all posts that include the specified value for _like", async () => {
        const response = await chakram.get(api.url("posts", "title_like=sunt"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          posts.forEach(post => {
            expect(post.title).to.include("sunt");
          });
        });
      });

      it("should not return a post if the specified value for _like not suitable for any post", async () => {
        const response = await chakram.get(api.url("posts", "title_like=unlikely-string-value"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(0);
        });
      });
    });

    describe("RELATIONSHIPS", () => {
      it("should return all comments for all posts", async () => {
        const response = await chakram.get(api.url("posts", "_embed=comments"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          posts.forEach(post => {
            post.comments.forEach(comment => {
              expect(comment.postId).to.equal(post.id);
            });
          });
        });
      });

      it("should return all comments for a given post", async () => {
        const response = await chakram.get(api.url("posts/3", "_embed=comments"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", post => {
          expect(post).to.be.defined;
          post.comments.forEach(comment => {
            expect(comment.postId).to.equal(3);
          });
        });
      });

      it("should return all the posts with an extra field based on the _embed value", async () => {
        const response = await chakram.get(api.url("posts", "_embed=NotCorrectValue"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(100);
          posts.forEach(post => {
            expect(post).to.have.property("NotCorrectValue");
          });
        });
      });
    });

    describe("FULL-TEXT SEARCH", () => {
      it("should not return any post if that does not have an exact match for the specified value of q", async () => {
        const response = await chakram.get(api.url("posts", "q=invalid-value"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          expect(posts.length).to.equal(0);
        });
      });

      it("should return the posts that have exact match for the specified value of q", async () => {
        const response = await chakram.get(api.url("posts", "q=lorem"));
        expect(response).to.have.status(200);
        expect(response).to.have.json("data", posts => {
          expect(posts).to.be.instanceof(Array);
          posts.forEach(post => {
            const titleAndBody = post.title + " " + post.body;
            expect(titleAndBody).to.include("lorem");
          });
        });
      });
    });
  });

  describe("UPDATE", () => {
    it("should update an existing post", async () => {
      const postUpdate = {
        userId: 2,
        title: "updated title",
        body: "updated body",
      };
      const postId = 18;
      const response = await chakram.put(api.url(`posts/${postId}`), postUpdate);
      expect(response).to.have.status(200);
      const updatedPost = await chakram.get(api.url(`posts/${postId}`));
      expect(updatedPost).have.json("data", post => {
        expect(post).to.be.defined;
        expect(post.userId).to.equal(postUpdate.userId);
        expect(post.body).to.equal(postUpdate.body);
        expect(post.title).to.equal(postUpdate.title);
      });
    });

    it("should not update a post which does not exist", async () => {
      const postUpdate = {
        userId: 1,
        title: "updated title",
        body: "updated body",
      };
      const response = await chakram.put(api.url("posts/180"), postUpdate);
      expect(response).to.have.status(404);
    });
  });

  describe("DELETE", () => {
    it("should delete an existing post", async () => {
      const originalLength = data.posts.length;
      const response = await chakram.delete(api.url("posts/89"));
      expect(response).to.have.status(200);
      const notExistingPost = await chakram.get(api.url("posts/89"));
      expect(notExistingPost).to.have.status(404);

      const responseGet = await chakram.get(api.url("posts"));
      expect(responseGet).to.have.status(200);
      expect(responseGet).to.have.json("data", posts => {
        expect(posts).to.be.instanceOf(Array);
        expect(posts.length).to.be.below(originalLength);
      });
    });

    it("should not delete a post which does not exist", async () => {
      const response = await chakram.delete(api.url("posts/12345"));
      expect(response).to.have.status(404);
    });
  });
});
