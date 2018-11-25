const Koa     = require('koa');
const Router  = require('koa-router');
const compose = require('koa-compose');
const mw      = require('./somemiddlewares');


const router = new Router();
const app    = new Koa();


const universal = compose([mw.fWrapError, mw.fResponseTime, mw.fStatOk]);

// provide a function that just returns a body, and we will do a bunch of other stuff
function dobody(f) {
  return compose([
    universal,
    ctx=>ctx.body = f()
  ]);
}


function failing () { throw new Error('bad result')}

const cannedResponse = ()=>({a:1, b:2, c:'hi'});

router.get('/hello/:id',  dobody(()=>'hello'));
router.get('/goodbye',    dobody(()=>'goodbye'));
router.get('/failing',    dobody(failing));
router.get('/tj',         dobody(cannedResponse));

router.get('/', (ctx)=>{ ctx.status = 404;});

app.use(router.routes());
app.use(router.allowedMethods());

//... notes as it stands, unsupported routes are marked with ok instead of not found



// response

const port = parseInt(process.env.koaport) || 3334;



app.listen(port, ()=>console.log(`koa listening on port: ${port}`));