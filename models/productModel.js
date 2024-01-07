const mongoose=require('mongoose');
const ProductSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Product title is required'],
        minLength:[3,'Too short product Title'],
        maxLength:[100,'Too long product Title'],

    },
    slug:{
        type:String,
        required:true,
        lowercase:true,
    },
    description:{
        type:String,
        required:[true,'Product description is required'],
        minLength:[20,'Too short product description'],
        maxLength:[2000,'Too Long product description']
        
    },
    quantity:{
        type:Number,
        required:[true,'product quantity is required'],

    },
    sold:{
        type:Number,
        default:0,
    },
    price:{
        type:Number,
        required:[true,'product price is required'],
        trim:true,
        max:[200000,'Too long product price'],
    },
    priceAfterDiscount:{
        type:Number,

    },
    colors:[String],
    imageCover:{
        type:String,
        required:[true,'product image cover is required']
    },
    images:[String],

    category:{
        type:mongoose.Schema.ObjectId,
        ref:'Category',
        required:[true,'product must belong to category'],

    },
    subCategories:[
        {
        type:mongoose.Schema.ObjectId,
        ref:'subCategory',
    }
],
    brand:{
        type:mongoose.Schema.ObjectId,
        ref:'Brand'
    },
    ratingsAverage:{
        type:Number,
        min:[1,'rating must be above or equal 1.0'],
        max:[5,'rating must be below or equal 5.0'],
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },

},{timestamps:true,
    // toJson and toObject to enable virtual populate to be returned in the response
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
})


ProductSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id',
  });

ProductSchema.pre(/^find/,function(next){
    this.populate({
        path:'category',
        select:'name -_id'
    })
    next()
})
const setImageUrl=(doc)=>{
    if(doc.imageCover){
        const imageUrl=`${process.env.BASE_URL}/products/${doc.imageCover}`;
        doc.imageCover=imageUrl;
    }
    if(doc.images){
        let listImages=[];
        doc.images.map((image)=>{
            const imageUrl=`${process.env.BASE_URL}/products/${image}`;
            listImages.push(imageUrl)

        })
        doc.images=listImages
    }
}
// work when we tried to findone or findall or uptdate
ProductSchema.post('init',(doc)=>{
    setImageUrl(doc)
})

// work when create the doc in database
ProductSchema.post('save',(doc)=>{
    setImageUrl(doc)
})


const ProductModel=mongoose.model('Product',ProductSchema)
module.exports=ProductModel