const baseRoute=function () {
    return process.env.BASE_URL||'/';
}

module.exports=baseRoute();