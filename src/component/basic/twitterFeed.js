import React from 'react';
import Head from 'next/head';

const TwitterFeed = ({ username }) => {
  return (
    <>
      <Head>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </Head>
          <div style={{ maxHeight: '370px', overflow: 'auto' }}>
              <a className="twitter-timeline" href={`https://twitter.com/${username}?ref_src=twsrc%5Etfw`}>
                  Tweets by @{username}
              </a>
          </div>
    </>
  );
};

export default TwitterFeed;
