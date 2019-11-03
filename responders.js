const hello_$id = ()=>'hello';
const a_b_c     = ()=>({a:1, b:2, c:'hi'});
const goodbye   = ()=>'goodbye';

const failing   = ()=> {throw new Error('bad result');};
const tj        = a_b_c;

module.exports = {
    hello_$id, a_b_c, goodbye, failing, tj
};