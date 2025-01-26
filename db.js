require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

let client;
let db;

async function initDB() {
  if (!client) {
    client = new MongoClient(process.env.conn);
    await client.connect();
    db = client.db("stock-project");
    console.log("Connected to MongoDB");
  }
  return db;
}

const threadDB = async (board, text, delete_password, req,reported = false, id = null) => {
  try {
    const db = await initDB();
    const threadCollection = db.collection('threads'); // Use a collection named "threads"
    
    if(req == "post"){
    const result = {
        board, // Store the board name
        text,
        created_on: new Date(),
        bumped_on: new Date(),
        delete_password, // Fix the password field
        reported,
        replies: []}
    const answ = await threadCollection.insertOne(
      result
    );

    return {_id: answ.insertedId,...result}; // Return result so we can access insertedId
}

else if(req == "get"){
    const recentThreads = await threadCollection.find({ board },{ projection: { "replies.delete_password": 0, "replies.reported": 0, reported: 0, delete_password: 0} })
    .sort({ bumped_on: -1 })  // Sort by most recent
    .limit(10)                 // Get only 10 documents
    .toArray();                // Convert to array

    // Safely process threads
    const processedThreads = recentThreads.map(thread => {
    thread.replies = Array.isArray(thread.replies) ? thread.replies.slice(0, 3) : [];
    return thread;
    });

    return processedThreads;
}

else if(req == "delete"){
    const deleteThread = await threadCollection.deleteOne({_id: new ObjectId(id), delete_password});
    if(deleteThread.deletedCount !== 0){
      console.log(deleteThread)
      return 'success'

    }
    return "incorrect password"
}

else if(req == "put"){
  const reportThread = await threadCollection.updateOne(
    { _id: new ObjectId(id) }, 
    { $set: { reported: true } }  // ✅ Correct: Using `$set`
);

    if(reportThread.modifiedCount == 1){
      return "reported";
    }
    return "failed";
}

} catch (err) {
    console.error(err);
    throw err; // Re-throw for proper error handling
  }
};

const replyDB = async( thread_id, pswd, text, req,reported = false, id=null) => {
    try{
        const db = await initDB();
        const threadColl = await db.collection('threads');
        const repliesColl = await db.collection('replies');
        
        if(req == "post"){
        const reply = {
            thread_id,
            delete_password: pswd,
            text,
            reported,
            created_on: new Date()
        }
        const resp = await repliesColl.insertOne(reply)
        const checkThread = await threadColl.updateOne(
            { _id: new ObjectId(thread_id) }, // Ensure thread_id is an ObjectId
            {
              $set: { bumped_on: reply.created_on }, // Correct usage of $set
              $push: { replies: { _id: resp.insertedId, ...reply } } // Correct usage of $push
            }
          );
                  return checkThread
        }
        else if(req == "get"){
        const resp = await threadColl.findOne({_id: new ObjectId(thread_id)}, {projection: { "replies.reported": 0,"replies.delete_password": 0,reported: 0, delete_password: 0 }})
        return resp
        }
        else if(req == "delete"){
        
         
       const replydelete = await threadColl.updateOne(
    { _id: new ObjectId(thread_id), "replies._id": new ObjectId(id), "replies.delete_password": pswd },  
    { $set: { "replies.$.text": "[deleted]" } }  // Updates only the matched reply's text
);

if (replydelete.modifiedCount === 0) {
  return 'incorrect password';
}


  return 'success'
        }

        else if(req == "put"){
          const replyreport = await threadColl.updateOne(
            { _id: new ObjectId(thread_id), "replies._id": new ObjectId(id) }, 
            { $set: { "replies.$.reported": true } }  // Updates only the matched reply's text
        );
        if(replyreport.modifiedCount == 1){
                return 'reported'
                }
                return 'report failed'
        }
    }
    catch(err){
        console.error(err);
        throw err;
    }

}

module.exports = { threadDB, replyDB };
