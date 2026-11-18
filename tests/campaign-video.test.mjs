import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCampaignVideoUrl } from '../src/lib/campaignVideo.cjs';
test('campaign provider URLs normalize without autoplay or tracker parameters', () => {
  assert.equal(parseCampaignVideoUrl('https://youtu.be/BboCUmVWF8A?si=tracker&autoplay=1').embedUrl, 'https://www.youtube-nocookie.com/embed/BboCUmVWF8A');
  assert.equal(parseCampaignVideoUrl('https://www.youtube.com/shorts/BboCUmVWF8A').provider, 'youtube');
  assert.equal(parseCampaignVideoUrl('https://www.youtube.com/watch?v=BboCUmVWF8A&t=30').embedUrl, 'https://www.youtube-nocookie.com/embed/BboCUmVWF8A?start=30');
});
test('Vimeo unlisted privacy hashes survive normalization', () => {
  assert.equal(parseCampaignVideoUrl('https://vimeo.com/123456789/abc123abcd').embedUrl, 'https://player.vimeo.com/video/123456789?h=abc123abcd');
  assert.equal(parseCampaignVideoUrl('https://player.vimeo.com/video/123456789?h=abc123abcd&autoplay=1').embedUrl, 'https://player.vimeo.com/video/123456789?h=abc123abcd');
});
test('untrusted hosts, scripts, credentials and malformed video ids cannot become an iframe', () => {
  for (const url of ['javascript:alert(1)', 'https://youtube.com.evil.invalid/embed/BboCUmVWF8A', 'https://youtube.com@evil.invalid/embed/BboCUmVWF8A', 'https://vimeo.com:444/123456789', 'https://vimeo.com/123/<script>', 'https://youtube.com/watch?v=bad']) assert.equal(parseCampaignVideoUrl(url), null);
});
