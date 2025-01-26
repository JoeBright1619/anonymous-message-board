'use strict';

const { threadDB, replyDB } = require('../db');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  
  .post(async (req, res) => {
    try {
      const { text, delete_password } = req.body;
      const board = req.params.board; // Get board name from URL
      
      const result = await threadDB(board, text, delete_password, "post");

      console.log(result);
      res.json(
        result
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  
  .get(async(req, res) => {

    try{
    const board = req.params.board; // Get board name from URL
    
    const result = await threadDB(board, null, null, "get");
    res.json(result);
    }
    catch(err){
      console.error(err);
    }
  })
  .delete(async(req,res)=>{

    try{
    const {board} = req.params;
    const {thread_id, delete_password} = req.body;
    const result = await threadDB(board, null, delete_password, "delete",false , thread_id);

    res.send(result);
    }
    catch(err){
      console.error(err);
    }
  })
  .put(async(req,res)=>{
    try{
      const {board} = req.params;
      const {thread_id} = req.body;
      const response = await threadDB(board,null,null,"put", true, thread_id);
      res.send(response);
    }
    catch(err){
      console.error(err);
    }
   })
  ;

  app.route('/api/replies/:board')
     .post(async(req,res)=>{
      try{
      const {board} = req.params;
      const {thread_id, delete_password: pswd, text} = req.body;
      const result = await replyDB(thread_id, pswd, text, "post");
      res.json(result);
      }
      catch(err){
        console.error(err);
      }
     })
     .get(async(req, res)=>{
      try{
        const {thread_id} = req.query;
        console.log(thread_id);
        if(thread_id){
          const result = await replyDB(thread_id, null, null, "get");
          console.log(result);
          res.json(result);
        }
      }
      catch(err){
        console.error(err);
      }
     })
     .delete(async(req,res)=>{
      try{
        const {thread_id, reply_id, delete_password} = req.body;
        const result = await replyDB(thread_id, delete_password, null, "delete", false, reply_id);
        res.send(result);
      }
      catch(err){
        console.error(err);
      }
     })
     .put(async(req,res)=>{
      try{
        const {board} = req.params;
        const {thread_id, reply_id} = req.body;
        const response = await replyDB(thread_id, null, null, "put", true, reply_id);
        res.send(response);
      }
      catch(err){
        console.error(err);
      }
     })
     
};
