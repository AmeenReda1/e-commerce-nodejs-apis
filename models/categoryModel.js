const mongoose=require('mongoose')
// 1-create Schema
const CategorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Category Required'],
        unique:[true,'Category must be unique'],
        minlength:[3,'Category is too short'],
        maxlength:[30,'Category is too long']
    
    },
    //slug A and B will be ==> shoping.com/a-and-b becuase some times the category have spaces
    slug:{
        type:String,
        lowercase:true
    },
    image:String,

}
,{timestamps:true}
);

const setImageUrl=(doc)=>{
    if(doc.image){
        //${process.env.BASE_URL}/categories/
        const imageUrl=`${doc.image}`;
        doc.image=imageUrl;
    }
}
// work when we tried to findone or findall or uptdate
CategorySchema.post('init',(doc)=>{
    setImageUrl(doc)
})

// work when create the doc in database
CategorySchema.post('save',(doc)=>{
    setImageUrl(doc)
})

const CategoryModel=mongoose.model('Category',CategorySchema)

module.exports=CategoryModel