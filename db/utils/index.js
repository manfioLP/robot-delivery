const ceilOperator = n => {
    return { $ceil: n }
}
const addOperator = (n1, n2) => {
    return { $add: [n1, n2] }
};

const sumSquareRootOperator = (s1, s2) => {
    return { $sqrt: addOperator(s1, s2) }
};

const differenceSquareOperator = (x1, x2) => {
    return {
        $pow: [ subtractOperator(x1, x2), 2 ]
    }
}

const subtractOperator = (val1, val2) => {
    return {  $subtract: [ val1, val2 ] }
}

const betweenValuesOperator = (min, max) => {
    return { $gte: min, $lte: max }
}

const robotInRangeQuery = (px, py) => {
    return {
        status: 'AVAILABLE',
        locationX: betweenValuesOperator(px - 50, px + 50),
        locationY: betweenValuesOperator(py  - 50, py + 50),
    }
}

module.exports = {
    mongoRandNumber: (maxValue) => {
        return { $floor: { $multiply: [ {$rand: {}}, maxValue ] } }
    },
    betweenValuesOperator,
    ceilOperator,
    addOperator,
    sumSquareRootOperator,
    differenceSquareOperator,
    subtractOperator,
    robotInRangeQuery
};