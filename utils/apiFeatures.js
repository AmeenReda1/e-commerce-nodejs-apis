class ApiFeatures{
    constructor(mongooseQuery,queryString){
        this.mongooseQuery=mongooseQuery;
        this.queryString=queryString;
    }

    filter(){
        // delete fields like page and from the filter object 
        // {...req.body} because if we make req.body and we delete from it we will delete from the reference
        const queryStringObj={...this.queryString};
        const excludesFields=['page','limit','sort','fields','keyword']
        excludesFields.forEach(fields => 
            delete queryStringObj[fields]
        );
        // 1) filtering
        //  add $ to filtration like gte,lte,lt,gt => price[$gte]=50
        ///api/products?category=food
        let queryStr=JSON.stringify(queryStringObj);
        queryStr=queryStr.replace(/\b(gte|lte|lt|gt)\b/g,(match)=>`$${match}`)
        queryStr=JSON.parse(queryStr)
        
        this.mongooseQuery=this.mongooseQuery.find(queryStr)
        return this // to make this class can chain a lot of method [filter,sort,search,..etc]
    }

    sort(){
        // 3)sorting
    if(this.queryString.sort){
        const sortBy=this.queryString.sort.split(',').join(' ')
        console.log(sortBy)
        this.mongooseQuery=this.mongooseQuery.sort(sortBy)
      }
      else{
        this.mongooseQuery=this.mongooseQuery.sort('createdAt')
      }
      return this // to make this class can chain a lot of method [filter,sort,search,..etc]
    }

    LimitFields(){
        // 4) Fields Limiting // select fields that you just want ro return from the product not all the product
        if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(' ')
            this.mongooseQuery=this.mongooseQuery.select(fields)
        }else{
            this.mongooseQuery=this.mongooseQuery.select('-__v')
        }
        return this
    }
    search(modelName){
        //  Search
        if(this.queryString.keyword){
            console.log(this.queryString.keyword)
            let query={}
            
            if(modelName=='products'){
                query.$or = [
                { title: { $regex: this.queryString.keyword, $options: 'i' } },
                { description: { $regex: this.queryString.keyword, $options: 'i' } },
                ];
            }
            else{
                query={ name: { $regex: this.queryString.keyword, $options: 'i' } }
            }
            console.log(query)
            this.mongooseQuery=this.mongooseQuery.find(query) 
        }
        return  this
    }
    paginate(countDocuments){
        // pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 50;
        const skip = (page - 1) * limit;
        this.mongooseQuery=this.mongooseQuery.skip(skip).limit(limit)

        const endIndex=limit*page
        const pagination={};
        pagination.currentPage=page;
        pagination.limit=limit;
        pagination.numberOfPages=Math.ceil(countDocuments/limit)
        if(endIndex < countDocuments){ // still there is some data
            pagination.nextPage=page+1
        }
        if(skip > 0){
            pagination.previousPage=page-1
        }
        this.paginationResult=pagination // append this data to paginationResult to access them from this class
        
        return this
    }


}
module.exports=ApiFeatures;