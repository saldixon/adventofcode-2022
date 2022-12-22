const { __esModule } = require('@financial-times/n-logger');
const fs = require('fs');
const logger = require('@financial-times/n-logger').default;

const parseInput = (filename, split) => {
  return fs.readFileSync(filename).toString().split(split)
  .filter(entry => entry)
}

const rowRegex = new RegExp('Sensor at x=([^,]+), y=([^:]+): closest beacon is at x=([^,]+), y=(.+)$');
/*
Sensor at x=2, y=18: closest beacon is at x=-2, y=15

/e/.exec("The best things in life are free!");
*/

const filename = process.argv[2] || 'input.txt';
const info =  parseInput(filename, '\n');

const sensors = [];
const beacons = [];
let sensorCounter = 0;

for (infoLine of info){
	sensorCounter++;
	const [whole,sx,sy,bx,by] = rowRegex.exec(infoLine);
	const sensor=[parseInt(sx),parseInt(sy)];
	const beacon=[parseInt(bx),parseInt(by)];

	// logger.info({sensor, beacon});
	// sensors.push( { [`s${sensorCounter}`]: { sensor,beacon }});
	sensors.push( {sensor,beacon });
	beacons.push(beacon);
}

logger.info(`BEACONS>>>>>>`);
logger.info(JSON.stringify(beacons));
// logger.info(JSON.stringify(sensors));

const getManhattanDistance = function (from,to){
	const xDiff = to[0] - from[0];
	const yDiff = to[1] - from[1];

	const distance = Math.abs(xDiff) + Math.abs(yDiff);
	return distance;

}

// const rowOfInterest = 10;
const rowOfInterest = 2000000;
const ruledOutCols = {}; 

const hasABeaconThere = function(x,y){
	const occupied = beacons.filter(b => b[0] === x && b[1] === y);
	// logger.info(`chekcing ${x},${y}.  occupieds = ${occupied}`);
	return occupied.length > 0;
}

for (sensor of sensors){
	const s = sensor.sensor;
	const b = sensor.beacon;
	// logger.info({sensor});

	// what is the manhatton distnce between them?
	const distance = getManhattanDistance(s,b);
	// logger.info({distance});

	// how many moves will it take to get from sensor to the the row of interest?
	const sensorToRoI = Math.abs(s[1] - rowOfInterest);
	// logger.info({sensorToRoI});
	
	if (distance < sensorToRoI){
		// can't rule out any spors on the rowOfInterest, cos we can't even reach it
		// logger.info(`can't get there`);
		continue;
	}
	const horizontalStepsRemaining = distance - sensorToRoI;
	// logger.info({horizontalStepsRemaining});

	for (let i=0; i<=horizontalStepsRemaining; i++){
		// don't do it if there's already a beacon there?
		if (!hasABeaconThere(s[0]+i,rowOfInterest)){
			ruledOutCols[s[0]+i] = '#';
		}
		if (!hasABeaconThere(s[0]-i,rowOfInterest)){
			ruledOutCols[s[0]-i] = '#';
		}
	}
}



// console.warn(`beacons...`);
// console.warn(beacons);

const ruledOuts = Object.keys(ruledOutCols);
// logger.warn({sorted: ruledOuts.sort((a,b)=>a-b)});
logger.warn({num: ruledOuts.length});



