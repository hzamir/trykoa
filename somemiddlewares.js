async function fResponseTime (ctx, next) {
  const started = Date.now();
  await next();
  // once all middleware below completes, this continues
  const elapsed = (Date.now() - started) + 'ms';
  console.log(`Response for '${ctx.originalUrl}' (matching route '${ctx._matchedRoute}' is: ${elapsed}`);
  ctx.set('X-ResponseTime', elapsed);
}

function fWrapError (ctx, next) {
  return next().catch(err => {
    ctx.status = 400;
    ctx.body = `Uh-oh: ${err.message}`;
    console.log(ctx.body)
  });
}

async function fStatOk(ctx, next) {
  ctx.status = 200;
  await next()
}

module.exports = {fResponseTime,fWrapError,fStatOk};