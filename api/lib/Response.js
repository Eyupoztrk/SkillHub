class Response{
constructor(){}

static successResponse(data,code = 200) {
    return{
        code,
        data
    };

}

static errorResponse(error,code = 500)
{
    return{
        code,
        error:{
            message: error.message || "Bir hata oluştu",
            description: error.description || "Hata var"
        }
    }
}



}

module.exports = Response;