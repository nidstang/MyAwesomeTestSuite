const { describe, test } = require('./lib');

const suite = describe('My First test suite', (testSuite) => {
    //testSuite instance
    testSuite
        .register(test('Test 1', (t) => {
            // test instance
            t.assert({
                actual: 2,
                expected: 2,
                msg: 'Given two number, must return true',
                // formatter: defaultFormatter,
            });
            t.assert({
                actual: 2,
                expected: 1,
                msg: 'Given two number, must return false',
                // formatter: result => `${result.passed ? 'yujuuuuu' : ':('}`
                // formatter: result => `${result.passed}`,
                // formatter: defaultFormatter,
            });
        }))
        .register(test('Test 2', (t) => {
            // test instance
            t.assert({
                actual: 2,
                expected: 2,
                msg: 'Given two number, must return true',
                // formatter: defaultFormatter,
            });
            t.assert({
                actual: 2,
                expected: 1,
                msg: 'Given two number, must return false',
                // formatter: result => `${result.passed}`,
                // formatter: defaultFormatter,
            });
    }))
});

console.log(suite.toString());