const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { ObjectId } = require("mongodb");

chai.use(chaiHttp);

suite("Functional Tests", function () {

  this.timeout(10000);
  let board = "test";
  let threadId;
  let replyId;
  let delete_password = "delete123";
  let incorrect_password = "wrongpass";

  // 1️⃣ **Creating a new thread**
  test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .post(`/api/threads/${board}`)
      .send({ text: "Test thread", delete_password })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "_id");
        assert.isNotNull(res.body._id);
        threadId = res.body._id;
        done();
      });
  });

  // 2️⃣ **Viewing the 10 most recent threads with 3 replies each**
  test("Viewing the 10 most recent threads: GET request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .get(`/api/threads/${board}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        res.body.forEach((thread) => {
          assert.property(thread, "replies");
          assert.isArray(thread.replies);
          assert.isAtMost(thread.replies.length, 3);
        });
        done();
      });
  });
  // 5️⃣ **Reporting a thread**
  test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .put(`/api/threads/${board}`)
      .send({ thread_id: threadId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });
  

  

  // 6️⃣ **Creating a new reply**
  test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .post(`/api/replies/${board}`)
      .send({ thread_id: threadId, text: "Test reply", delete_password })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isAtLeast(res.body.modifiedCount, 1);
        
        done();
      });
  });

  // 7️⃣ **Viewing a single thread with all replies**
  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .get(`/api/replies/${board}`)
      .query({ thread_id: threadId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "replies");
        assert.isArray(res.body.replies);
        assert.property(res.body.replies[0], "_id");
        replyId = res.body.replies[0]._id;
        done();
      });
  });


  test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .put(`/api/replies/${board}`)
      .send({ thread_id: threadId, reply_id: replyId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });
  
  // 8️⃣ **Deleting a reply with the incorrect password**
  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .delete(`/api/replies/${board}`)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: incorrect_password })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  // 9️⃣ **Deleting a reply with the correct password**
  
  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .delete(`/api/replies/${board}`)
      .send({ thread_id: threadId, reply_id: replyId, delete_password })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  // 🔟 **Reporting a reply**

  test("Deleting a thread with an incorrect password: DELETE request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .delete(`/api/threads/${board}`)
      .send({ thread_id: threadId, delete_password: incorrect_password })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  // **Deleting a thread with the correct password**
  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .delete(`/api/threads/${board}`)
      .send({ thread_id: threadId, delete_password })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

});

//  **Deleting a thread with an incorrect password**
