const mongoose=require('mongoose')
// 1-create Schema
const BrandSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Brand Required'],
        unique:[true,'Brand must be unique'],
        minlength:[3,'Too short Brand name'],
        maxlength:[30,'Too long Brand name']
    
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
        console.log(doc)
        const imageUrl=`${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image=imageUrl;
    }
}
// work when we tried to findone or findall or uptdate
BrandSchema.post('init',(doc)=>{
    setImageUrl(doc)
})

// work when create the doc in database
BrandSchema.post('save',(doc)=>{
    setImageUrl(doc)
})


const BrandyModel=mongoose.model('Brand',BrandSchema)

module.exports=BrandyModel