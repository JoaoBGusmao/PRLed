import ApolloClient from 'apollo-boost';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import ledManager from './ledManager';

global.fetch = fetch;

const LED_NUMBER = parseInt(process.env.LED_NUMBER, 10);

const dict = {
  APPROVED: 0x00FF00,
  OPEN: 0x0000FF,
  CHANGES_REQUESTED: 0xFF0000,
  OFF: 0x000000,
};

const configuration = {
  users: [
    {
      name: 'Jonathan',
      login: 'akamuraasai',
    },
    {
      name: 'João',
      login: 'JoaoBGusmao',
    },
    {
      name: 'Marco',
      login: 'marcoantoniocanhas',
    },
  ],
};

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
            pullRequests(last: 100, states: [OPEN]) {
              nodes {
                title,
                author {
                  login
                },
                state,
                reviews(last: 100) {
                  edges {
                    node {
                      state
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

const getUserAuthoredPRs = (login, pullRequests) => (
  pullRequests.nodes.filter(pr => pr.author.login === login)
);

const getPRsReadyToReview = prList => (
  prList.filter(pr => pr.state === 'OPEN' && pr.title.indexOf('[WIP]') === -1)
);

// TODO: take the last if it its not a dismissed review
const getLastReview = pr => pr.slice().reverse()[0];

const getPRStates = prList => (
  prList.map((pr) => {
    const lastReview = getLastReview(pr.reviews.edges) || {};

    return lastReview.node ? dict[lastReview.node.state] : dict.OPEN;
  })
);

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

  return finalArray;
};

const setPRLights = async () => {
  const { repository: { pullRequests } } = await getPRList();

  if (pullRequests.nodes.length === 0) {
    console.log('no pull request');
    return [];
  }

  const lights = configuration.users.map((user) => {
    const userPRs = getUserAuthoredPRs(user.login, pullRequests);
    const onlyReadyToReview = getPRsReadyToReview(userPRs);
    const prStates = getPRStates(onlyReadyToReview);

    return prStates.length === 0 ? [dict.OFF] : prStates;
  });

  const totalLedForEach = LED_NUMBER / configuration.users.length;
  const lightsDivided = divideLeds(lights, totalLedForEach);

  ledManager.blinkAndFix(lightsDivided);

  return [];
};

const boot = () => {
  ledManager.init(LED_NUMBER);
  ledManager.setBrightness(10);
};

export const setLights = async () => {
  await setPRLights();
};

export default boot;
