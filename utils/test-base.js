const base = require('@playwright/test');


exports.customtest = base.test.extend(
{
testDataForOrder :    {
    username : "bommisetty20001808@gmail.com",
    password : "Venu@9912",
    productName:"ADIDAS ORIGINAL"
    
    }

}

)




