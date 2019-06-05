const koa = require('koa')
const Router = require('koa-router')
const fs = require('fs')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const os = require('os');
const path = require('path')
const util = require('util')
const router = new Router()
const app = new koa()

app.use(koaStatic('./static'))
    .use(koaBody({
        multipart: true,
        // formidable: {
        //     uploadDir: path.join(__dirname, '/upload'),
        //     keepExtensions: true,
        //     onFileBegin(name, file) {
        //         let filePath = file.path.split('.')[0]
        //         file.path = filePath + file.name
        //     }
        // }
    }))

app.use(async (ctx, next) => {
    ctx.set({
        'Access-Control-Allow-Origin': '*'
    })
    //next是异步的，所以必须要用await
    await next();

})


router.get('/', async (ctx, next) => {
    ctx.type = 'html'
    ctx.body = fs.createReadStream('./static/html/index.html')
})

router.get('/demo', async (ctx, next) => {
    ctx.type = 'html'
    ctx.body = fs.createReadStream('./demo.html')
})
router.post('/demoFile', async (ctx, next) => {
    var body = ctx.request.body;
    console.log('TCL: body', ctx.request.files);

    // var data = body.files.split(',')
    await fs.writeFile(path.join(__dirname, '/demo/') + 'demo.png', body.files, err => {
        if (err) {
            console.log(err);
            return;
        };
        console.log('写入成功');
    });
    ctx.body = '1'
})
router.post('/upload', async ctx => {
    const files = ctx.request.files;
    let asyncArr = []

    function loop(files) {

        for (let key in files) {

            const file = files[key]
            const type = checkType(file)
            //选择多个文件
            if (type == 'Array') {
                loop(files[key])
            } else {
                if (JSON.stringify(file) == '{}') continue;

                let reader;
                let writer;
                try {
                    reader = fs.createReadStream(file.path)
                    writer = fs.createWriteStream(path.join(__dirname, '/upload/') + file.name)
                    reader.pipe(writer)
                } catch (error) {
                    console.error(error)
                }

                //用Promise.all判断全部的异步是否完成
                var promise = new Promise((resolve, reject) => {
                    writer.on('finish', () => {
                        resolve()
                    })
                })
                asyncArr.push(promise)
            }
        }
    }

    loop(files)
    //添加await 不然返回空数据
    await Promise.all(asyncArr).then(
        () => {
            ctx.body = 'success'
        }
    ).catch((e) => {
        console.log(e)
    })
})

function checkType(obj) {
    let value = Object.prototype.toString.call(obj).slice(1, -1)
    return value.split(" ")[1]
}

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(8888);