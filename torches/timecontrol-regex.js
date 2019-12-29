console.clear();

const tests = {
    absolute:         "60m",
    simple:           "r1/30s",
    mainPlusByoyomi:  "90m, 6 x r1/60s",
    mainPlusCanadian: "60m, r10/15m",
    fischer:          "30m.. + 3m",
    fide:             "40/90m+30s, 30m..+30s",
    capfischer:       "60m..120m + 2m",
    capfischer2:      "10m + 30s",
    usdelay:          "(5s) 120m",
    bronstein:        "30m + ..10s",
    steady:           "10/r5m"
};


const reTimeD    = '\\s*((?<delay>\\d+)(?<delayUnits>d|h|m|s)?)\\s*';
const reTimeB    = '\\s*((?<bonus>\\d+)(?<bonusUnits>d|h|m|s)?)\\s*';
const reTimeT    = '\\s*((?<reserve>\\d+)(?<reserveUnits>d|h|m|s)?)\\s*';

const rePeriods = '(?<periods>\\d+)\\s*x\\s*';        // optional "n x"
const reMoves   = 'r?\\s*(?<moves>\\d+)\\s*\\/\\s*';  // optional "[r]n/"
const reDelay   = `\\(${reTimeD}\\)`;                 // optional "(n)"
const reBonus   = `\\+\\s*${reTimeB}`;                // optional "+n"

// all but one component (time) is optional in each phase
const reStr = `(${rePeriods})?(${reMoves})?(${reDelay})?${reTimeT}(${reBonus})?`;
// const reStr = reTimeT;
console.log(reStr);
const regex = new RegExp(reStr);

let i = 0;
let j = 0;

function unitsToMultiplier(s, def)
{

    if(!s)
        s = def;

    // no break to simplify conversion to seconds
    switch(s) {
        case 'd': return 24*60*60; // no break
        case 'h': return 60*60;
        case 'm': return 60;
        case 's': return 1;
    }
    return 1;
}

// given a unit tell which unit is less, until we get to seconds
function lesserUnit(s)
{
    switch(s) {
        case 'd': return 'h'; // if days next less unit is hours
        case 'h': return 'm'; // if hours then, minutes
        default: return 's';  // minutes, seconds, and anything else would be seconds
    }
}


function multiplyIt(sval, unit)
{
    if(sval) {
        const multiplier = unitsToMultiplier(unit, 'm');
        return multiplier * Number(sval);
    }
}

function cook(raw)
{
    const cooked = {};

    const rMul = unitsToMultiplier(raw.reserveUnits, 'm'); // if no units for reserve, default to minutes (like Chess)

    cooked.reserve = Number(raw.reserve) * rMul;

    const reserveUnits = raw.reserveUnits || 'm';
    const lesserUnits = lesserUnit(reserveUnits);

    ['reserve', 'delay', 'bonus'].forEach(param=>{

        const rawVal = raw[param];
        if(rawVal) {
            const actUnit = raw[`${param}Units`]; // check if units are specified
            // if reserve time & needs default, use minutes, if it is another time, default to next unit down from reserve
            const unit   = param === 'reserve'?  reserveUnits: actUnit || lesserUnits;
            cooked[param] = rawVal? multiplyIt(rawVal, unit): undefined;
        }
    });

    return cooked;

}

function strToRaw(str)
{
    const match = str.match(regex);
    return match?
        Object.entries(match.groups).reduce((a, [k,v])=>{if(v !== undefined){a[k]=v} return a}, {}):
        undefined;
}


Object.entries(tests).forEach(([k,v])=>{
    ++i;
    const raw = strToRaw(v);

    if(raw) {
        ++j;
        const cooked = cook(raw);
        console.info(k, v, 'raw:', raw, 'cooked:', cooked);
    }
});
console.info(`${j}/${i} matches found`);

