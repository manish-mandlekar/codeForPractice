const mongoose = require("mongoose")
 
const postSchema = mongoose.Schema({
    img : String,
    post : String,
    user : { 
        type: mongoose.Schema.Types.ObjectId,
        ref : "user"
      },
      likes :[{
        type: mongoose.Schema.Types.ObjectId,
        ref : "user"
      }],
    time :{
        type : Date,
        default : Date.now()
    },
    comments : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "comment"
    }]
})

module.exports = mongoose.model("post",postSchema)