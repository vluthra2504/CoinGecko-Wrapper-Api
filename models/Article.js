const mongoose=require('mongoose')

const Schema=mongoose.Schema

const articleSchema=new Schema({
    author:{type:String,required:true},
    title:{type:String,required:true},
    content:{type:String}
})
const Article=mongoose.model('Article',articleSchema);


module.exports=Article;
