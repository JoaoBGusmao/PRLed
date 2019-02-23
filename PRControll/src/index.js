import ApolloClient from 'apollo-boost';
import fetch from 'node-fetch';
import gql from 'graphql-tag';

global.fetch = fetch;

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
      name: 'Moyle',
      login: 'rodrigorm',
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
          repository(owner: "JoaoBGusmao", name: "PRLed") {
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
    }, {
      options: {
        fetchPolicy: 'no-cache',
      },
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

const getLastReview = pr => pr.slice().reverse()[0];

const getPRStates = prList => (
  prList.map((pr) => {
    const lastReview = getLastReview(pr.reviews.edges) || {};

    return lastReview.node ? lastReview.node.state : 'OPEN';
  })
);

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

    return prStates;
  });

  return lights;
};

const boot = async () => {
  console.log('PRLed Application started');

  const lights = await setPRLights();

  console.log(lights);
};

export default boot;
