const TestConstructor = Symbol('testConstructor');
const AssertionConstructor = Symbol('assertionConstructor');

const formatActualAndExpected = result => `\n ACTUAL: ${result.actual} \n EXPECTED: ${result.expected}`;

const defaultFormatter = result => (
    `${result.msg} -> ${result.passed ? 'ok' : 'failed'} ${!result.passed ? formatActualAndExpected(result) : ''} `
);

const Assertion = ({ actual = null, expected = null, msg = '', formatter = defaultFormatter }) => ({
    actual, expected, msg, [AssertionConstructor]: Assertion, formatter,

    run() {
        return this.actual === this.expected;    
    },

    format(formatter) {
        this.formatter = formatter;
        return this;
    }
});

const toUpper = str => str.toUpperCase();

const Fn = run => ({
    run,
    map: f => Fn(x => f(run(x))),
    chain: f => Fn(x => f(run(x)).run(x)),
    concat: other => Fn(x => run(x).concat(other.run(x)))
});

Fn.of = x => Fn(() => x);
Fn.ask = Fn(x => x);

const TestPassable = () => ({
    isPassed: false,
    pass() {
        this.isPassed = true;
    },
});

const TestFailable = () => ({
    isPassed: false,

    fail() {
        this.isPassed = false;
    },
});

const TestSkippeable = () => ({
    isSkipped: false,

    skip() {
        this.isSkipped = true;
    },
});

const TestNotSkippeable = () => ({
    isSkipped: false,

    skip() {
    },
});

const ITestState = () => ({
    skip() {},
    pass() {},
    fail() {},
});

const TestFactoryResultConstructor = Symbol('TestFactoryResultConstructor');

String.empty = () => '';

const TestFactoryResult = ({ status, assertionResults }) => ({
    status,
    assertionResults,
    [TestFactoryResultConstructor]: TestFactoryResult,
    toString() {
        return assertionResults.reduce((str, result) => `${str}\n${result.formatterFn()}`, String.empty());
    }
});

TestFactoryResult.empty = () => TestFactoryResult({
    status: true,
    assertionResults: [],
});

const AssertionResult = ({ msg, passed, actual, expected, formatter }) => {
    const formatterFn = () => formatter({ msg, passed, actual, expected, });

    return {
        msg, passed, formatterFn, actual, expected,
    }
};

const runAssertion = assertion => {

    return AssertionResult({
        ...options,
        formatterFn: assertion.formatter.bind(options), 
    });
}

const toTestFactoryResult = (result, assertion) => {
    const isPassed = assertion.run();

    const assertionResult = AssertionResult({
        msg: assertion.msg,
        passed: isPassed,
        formatter: assertion.formatter,
        actual: assertion.actual,
        expected: assertion.expected,
    });

    return TestFactoryResult({
        status: result.status ? isPassed : false,
        assertionResults: [...result.assertionResults, assertionResult]
    });
};


const TestFactory = ({ description = '', assertions = [] }) => {
    return {
        description, assertions, [TestConstructor]: TestFactory,
        run: () => {
            return assertions.reduce(toTestFactoryResult, TestFactoryResult.empty());
        },

        toString() {
            return `\n\t${description}\n${this.run().toString()}`;
        },

        assert: (assertion) => { 
            assertions.push(Assertion(assertion));
        }
    }
};

const print = str => Fn.ask.map(where => where(str));

const toString = formatter => o => o.toString(formatter);

const withSendOutTo = (testFactory) => {
    return {
        ...testFactory,
        sendOutTo: (somewhere) => {
            return Fn.of(testFactory.toString())
                .chain(print)
                .run(somewhere);
        } 
    }
};

const TestSuite = ({ description }) => {
    const tests = [];
    let testFactoryResults = [];


    const runTest = test => test.run();
    const toStringTest = test => test.toString();
    return {
        description,
        register(test) {
            tests.push(test);
            return this;
        },
        run () {
            testFactoryResults = tests.map(runTest);
            return this;
        },
        print: () => {
            return testFactoryResults;
        },
        toString: () => {
            return `[${description}]:\n ${tests.map(toStringTest)}`
        },
    }
};

const createTest = options => Object.assign({}, TestFactory(options), ITestState());

const Test = (options) => 
    Object.assign(createTest(options), TestPassable(), TestSkippeable(), TestFailable());

module.exports.test = (description, fn) => {
    const testInstance = Test({ description });
    fn(testInstance);
    return testInstance;
};

module.exports.describe = (description, fn) => {
    const testSuite = TestSuite({ description });
    fn(testSuite);
    return testSuite;
};
