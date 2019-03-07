import React from 'react';

const Led = ({ color }) => (
  <span style={{ width: 20, height: 20, backgroundColor: color, margin: 4, borderRadius: 8 }} />
);

Led.defaultProps = {
  color: '#FFFFFF',
};

export default Led;
