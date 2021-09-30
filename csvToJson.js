var fs = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('../../marathon.csv'),
    console: false
});

rd.on('line', function(line) {
    let components = line.split(";");
    let first = "";
    switch (components[0].toLowerCase()) {
        case 'ходьба':
            first = "declarations.Type.CalmRun"
            break;
        case 'день отдыха':
            first = "declarations.Type.Rest"
            break;
        case 'спокойный бег':
            first = "declarations.Type.CalmRun"
            break;
        case 'средний бег':
            first = "declarations.Type.NormalRun"
            break;
        case 'быстрый бег':
            first = "declarations.Type.FastRun"
            break;
        case 'длинный забег':
            first = "declarations.Type.LongRun"
            break;
        case 'проверочный забег':
            first = "declarations.Type.CheckRun"
            break;
        case 'восстановительный бег':
            first = "declarations.Type.RecoveryRun"
            break;
        case 'марафон':
            first = "declarations.Type.Marathon"
            break;
        case 'марафон 10':
            first = "declarations.Type.Marathon10"
            break;
        case 'полумарафон':
            first = "declarations.Type.HalfMarathon"
            break;
        default:
            throw Error(components[0] + " is undefined")
    }

    let distance = components[1].length == 0 ? "null" : components[1];

    var pace = "";
    switch (components[2].toLowerCase()) {
        case 'низкий':
            pace = "declarations.Pace.Low"
            break;
        case 'средний':
            pace = "declarations.Pace.Normal"
            break;
        case 'высокий':
            pace = "declarations.Pace.High"
            break;
        default:
            if (components[2].length == 0){
                pace = "null";
                break
            }else{
                throw components[2] + " is undefined"
            }
    } 

    let time = components[3].length == 0 ? "null" : components[3];

    console.log("\tdeclarations.getRunningModel(" + first + ", " + distance + ", " + pace + ", " + time + "),");

});