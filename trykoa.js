const Koa     = require('koa');
const serve   = require('koa-static');
const Router  = require('koa-router');
const compose = require('koa-compose');
const mw      = require('./somemiddlewares');
const responders = require('./responders');


const app    = new Koa();


const universal = compose([mw.fWrapError, mw.fResponseTime, mw.fStatOk]);

// provide a function that just returns a body, and we will do a bunch of other stuff
function dobody(f) {
  return compose([
    universal,
    ctx=>ctx.body = f()
  ]);
}




const router = new Router();

router.prefix('/api');

// substitutions to make to strings
const translateTable = new Map([
   [/_/g, '/'],
   [/\$/g, ':']
]);

function translate(s) {
  let ss = s;
  translateTable.forEach((v,k)=>{
    ss = ss.replace(k,v);
  });
  return ss;
}

Object.entries(responders).forEach(([k,v])=> {

  // convert underscores in key to slashes
  // convert dollar signs to colons
  const route = '/' + translate(k);

  console.log(`${k} => ${route}`);
  router.get(route, dobody(v));
});

router.get('/', (ctx)=>{ ctx.status = 404;});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve('.'));

// response
const port = parseInt(process.env.koaport) || 3334;


app.listen(port, ()=>console.log(`koa listening on port: ${port}`));