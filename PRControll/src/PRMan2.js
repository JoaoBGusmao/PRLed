import ApolloClient from 'apollo-boost';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import ledManager from './ledManager';

global.fetch = fetch;

const LED_NUMBER = parseInt(process.env.LED_NUMBER, 10);

const MOCK_DICT = {
  APPROVED: '0x00FF00',
  OPEN: '0x0000FF',
  CHANGES_REQUESTED: '0xFF0000',
  FAILED: '0xFFFF00',
  OFF: '0x000000',
};

const LIB_DICT = {
  APPROVED: 0x00FF00,
  OPEN: 0x0000FF,
  CHANGES_REQUESTED: 0xFF0000,
  FAILED: 0xFFFF00,
  OFF: 0x000000,
};

const DICT = process.env.MOCK ? MOCK_DICT : LIB_DICT;

const USERS = [
  'akamuraasai',
  'JoaoBGusmao',
  'rodrigorm',
];

const client = new ApolloClient({
  uri: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.GITHUB_AUTH}`,
  },
});

const getPRList = async () => {
  try {
    const result = await client.query({
      query: gql`
        query {
          repository(owner: ${process.env.REPO_OWNER}, name: ${process.env.REPO_NAME}) {
            pullRequests(states: OPEN, last: 100) {
              totalCount
              nodes {
                title
                author {
                  login
                }
                mergeable
                reviews(states: [PENDING, APPROVED, CHANGES_REQUESTED], last: 100) {
                  nodes {
                    submittedAt
                    author {
                      login
                    }
                    state
                  }
                  totalCount
                }
                commits (last: 1) {
                  nodes {
                    commit {
                      status {
                        state
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
    });

    return result.data;
  } catch (err) {
    return { repository: { pullRequests: { nodes: [] } } };
  }
};

const filterWIP = items => items.filter(({ title }) => !title.startsWith('[WIP]'));
const getCommitStatus = commits => commits.nodes[0].commit.status.state;
const mapReviews = reviews => reviews.map(({ submittedAt, author: { login }, state }) => ({ submittedAt, login, state }));
const getOnlyLatestPerUser = reviews => reviews.reverse().reduce((items, review) => {
  const user = items[review.login];

  if (user === undefined) {
    return { ...items, [review.login]: review.state };
  }

  return items;
}, {});

const PRByUsers = items => items
  .reduce((users, pr) => {
    const { login } = pr.author;
    const user = users[login] || { pullRequests: [] };
    const mappedPR = {
      lastCommit: getCommitStatus(pr.commits),
      mergeable: pr.mergeable,
      reviews: getOnlyLatestPerUser(mapReviews(pr.reviews.nodes)),
      reviewsCount: pr.reviews.totalCount,
    };

    return {
      ...users,
      [login]: { pullRequests: [...user.pullRequests, mappedPR] },
    };
  }, {});

const divideLeds = (result, ledNum) => {
  const arrays = result.map((res) => {
    if (typeof res === 'object') {
      const totalLedNew = ledNum / res.length;
      return divideLeds(res, totalLedNew);
    }

    return new Array(ledNum).fill(res);
  });

  const finalArray = [];
  arrays.forEach(arr => finalArray.push(...arr));
  while (finalArray.length < 30) {
    finalArray.push(finalArray[finalArray.length - 1]);
  }

  return finalArray;
};

const LedRules = (user) => {
  const { pullRequests } = user;
  const length = pullRequests.length;

  if (length === 0) {
    return Array.apply(null, { length: 30 }).map(() => DICT.OFF);
  }

  const status = pullRequests.map((pr) => {
    if (pr.lastCommit !== 'SUCCESS') {
      return 'FAILED';
    }

    if (pr.mergeable !== 'MERGEABLE') {
      return 'FAILED';
    }

    if (pr.reviewsCount === 0) {
      return 'OPEN';
    }

    const reviewers = Object.keys(pr.reviews)
    const approveds = reviewers.filter(key => pr.reviews[key] === 'APPROVED');

    if (reviewers.length === approveds.length) {
      return 'APPROVED';
    }

    return 'CHANGES_REQUESTED';
  });

  const mappedLeds = divideLeds(status, Math.floor(30 / length));

  return mappedLeds.map(key => DICT[key]);
};

const setPRLights = async () => {
  const response = await getPRList();
  const { pullRequests } = response.repository;
  const { nodes: prs } = pullRequests;

  const filtredPRs = filterWIP(prs);
  const byUser = PRByUsers(filtredPRs);
  const leds = USERS
    .map(user => LedRules(byUser[user] || { pullRequests: [] }))
    .reduce((items, item) => ([...items, ...item]), []);

  ledManager.blinkAndFix(leds);
};

const boot = () => {
  ledManager.init(LED_NUMBER);
  ledManager.setBrightness(200);
};

export const setLights = async () => {
  await setPRLights();
};

export default boot;
