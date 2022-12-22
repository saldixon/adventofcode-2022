const { __esModule } = require('@financial-times/n-logger');
const fs = require('fs');
const { exitOnError } = require('winston');
const logger = require('@financial-times/n-logger').default;

const parseInput = (filename, split) => {
  return fs.readFileSync(filename).toString().split(split)
  .filter(entry => entry)
}
const rowRegex = new RegExp('Sensor at x=([^,]+), y=([^:]+): closest beacon is at x=([^,]+), y=(.+)$');
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

const minV=0;
const maxV=20;
const minRowOfInterest = minV;
const minColOfInterest = minV;
const maxRowOfInterest = maxV;
const maxColOfInterest = maxV;


const hasABeaconThere = function(x,y){
	const occupied = beacons.filter(b => b[0] === x && b[1] === y);
	return occupied.length > 0;
}

const isOccupied = function(x,y){
	// by either a beacon or a sensor
	const occupiedByBeacon = beacons.filter(b => b[0] === x && b[1] === y);
	const occupiedBySensor = sensors.filter(b => b.sensor[0] === x && b.sensor[1] === y);
	if (occupiedByBeacon.length > 0 || occupiedBySensor.length > 0){
		return true
	}
	return false;
}

const ditchedRows = [];
// go though each candidate row (0-4,000,000)
for (let rowOfInterest=0; rowOfInterest<=maxRowOfInterest; rowOfInterest++ ){
	const ruledOutCols = {}; 

	for (sensor of sensors){
		const s = sensor.sensor;
		const b = sensor.beacon;
		// logger.info({sensor});
	
		const distance = getManhattanDistance(s,b);
	
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
			// if (!hasABeaconThere(s[0]+i,rowOfInterest)){
				ruledOutCols[s[0]+i] = '#';
			// }
			// if (!hasABeaconThere(s[0]-i,rowOfInterest)){
				ruledOutCols[s[0]-i] = '#';
			// }
		}
	}

	const ruledOuts = Object.keys(ruledOutCols);
	// logger.info({rowOfInterest,ruledOuts})
	// we're only interested in x between a certain range, so see if there's any gaps
	const relevantRange = ruledOuts.filter(x => x>=0 && x<=maxColOfInterest).map(x=>parseInt(x));
	// logger.info({rowOfInterest,relevantRange})
	if (relevantRange.length < maxColOfInterest +1 ){
		logger.warn(`found a MISSING SPACE!!!! rowOfInterest=${rowOfInterest}`);
		// now which is the missing one?
		const expected = Array.from(Array(maxRowOfInterest+1).keys());
		// logger.warn({expected})

		const missing = expected.filter( x => !relevantRange.includes(x));
		logger.warn(`missing elelement = ${missing}`)
		break;
	}
	

}




