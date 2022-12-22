const logger = require('@financial-times/n-logger').default;


const rowRegex = new RegExp('Sensor at x=([^,]+), y=([^:]+): closest beacon is at x=([^,]+), y=(.+)$');
const s = 'Sensor at x=2, y=18: closest beacon is at x=-2, y=15';
const result = rowRegex.exec(s);

const getManhattanDistance = function (from,to){
	const xDiff = to[0] - from[0];
	const yDiff = to[1] - from[1];

	const distance = Math.abs(xDiff) + Math.abs(yDiff);
	return distance;

}


console.warn(getManhattanDistance([0,-8],[3,5]));

const expected = Array.from(Array(20+1).keys());
const relevantRange=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20]

logger.warn({expected});
logger.warn({relevantRange});

const missing = expected.filter( x => !relevantRange.includes(x));
logger.warn({missing});