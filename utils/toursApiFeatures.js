class APIfeatures
{
    constructor(query,querystring)
    {
        this.query=query;
        this.querystring=querystring;
    }

    filter()
    {
        //filtering:::::::::::
    //making a shallow copy of query received----
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryobject={...this.querystring };
    //we only want to filter soo removing page, limits,etc----------
    const excludefields=['sort','page','limit','fields'];
    excludefields.forEach(el => delete queryobject[el]);

    //advance filtering::::::::::::::
    //till this we can filter only according to query not like less than,greater than so doing that---
    //console.log(queryobject);
    let querystring=JSON.stringify(queryobject);
    querystring=querystring.replace(/\bgte|gt|lte|lt\b/g, el=>`$${el}`);
    console.log(querystring);
    console.log(JSON.parse(querystring));

    this.query=this.query.find(JSON.parse(querystring));
    //let query= Tour.find(JSON.parse(querystring));
    return this;
    }

    sort()
    {
        //sorting :::::::::
        if(this.querystring.sort)
        {
            //user will send the two sorting query separated by ,(comma) and mongoose need " "(space) so we will replace it.
            const sortby=this.querystring.sort.split(',').join(' ');
            //console.log(sortby);
            this.query=this.query.sort(sortby);
        }
    return this;
    }

    limit()
    {
        //limiting:::::::::
        if(this.querystring.fields)
        {
            const fieldselect=this.querystring.fields.split(',').join(' ');
            console.log(fieldselect);
            this.query=this.query.select(fieldselect);
            // if you want to hide a field permanently then go to schema and in the property of that fiels set select:false,
        }
        return this;
    }

    page()
    {
        //paging:::::::::
        const page=this.querystring.page*1||1
        const limit=this.querystring.limit*1||100;
        const tobeSkipped=(page-1)*limit;
        this.query=this.query.skip(tobeSkipped).limit(limit);
        return this;
    }
}
module.exports=APIfeatures;